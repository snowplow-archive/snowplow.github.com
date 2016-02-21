---
layout: post
title: Building first and last touch attribution models in Redshift SQL
tags: [data modeling, attribution, first touch, last touch]
author: Yali
category: Analytics
---

In order to calculate the return on marketing spend on individual campaigns, digital marketers need to connect revenue events, downstream in a user journey, with marketing touch events, upstream in a user journey. This connection is necessary so that the cost of those associated with the marketing campaign that drove those marketing touches can be connected to profit associated with the conversion events later on.

Different attribution models involve applying different logic to connecting those marketing touch events with subsequent revenue events. In this blog post, we will document the analytic approach and the corresponding SQL statements to perform the most basic types of attribution: first and last touch. Our example SQL will focus on the web use case. The same undelying analytic approach can, however, be applied to any channel.

Note that all the SQL given below is Redshift compatible. It can be easier to do attribution analysis with other dialects of SQL that support complicated data types (arrays and objects) in particular.

## Identifying the different marketing touches

First we need to identify all our marketing touch events. We can generate a table with all of these as follows:

{% highlight sql %}
create table derived.marketing_touches as (
  select
    domain_userid,
    derived_tstamp,
    event_id, 
    mkt_medium,
    mkt_source,
    mkt_term,
    mkt_content,
    mkt_campaign,
    refr_medium,
    refr_source,
    refr_term
  from atomic.events
  where refr_medium != 'internal'
    and refr_medium is not null
  order by 1,2)
;
{% endhighlight %}


The above table includes a line of data per marketing touch, ordered by user (as identified via the first party cookie id `domain_userid`) and time (as identified by the `derived_tstamp`).

<!--more-->

## Identifying the different revenue events

Now lets create a table with all our different revenue events. What these look like will depend on your own particular event schema - for this example we'll assume that revenue events are standard Snowplow [transaction events][snowplow-transaction-events]. It should be straightforward to modify / update the below SQL with your own set of revenue events.

{% highlight sql %}
create table derived.revenue_events as (
  select
    domain_userid,
    derived_tstamp,
    event_id,
    tr_total
  from atomic.events
  where event_name = 'transaction'
  order by 1,2)
;
{% endhighlight %}

## Connecting marketing touches with revenue events: first touch attribution model

Now that we have our marketing touches and our revenue events, we need to join them together.

How we do the join is firstly a question of business logic: what type of attribution model do we want to apply? The simplest model is a first touch model - this credits all the value associated with the revenue event to the *first* marketing touch for each user.

To do this, we create a new `derived.first_marketing_touch` table, that records only the first marketing touch for each user. This is a subset of the marketing touches recorded in the `derived.marketing_touches` table.

{% highlight sql %}
with first_touch_tstamps as (
  select
    domain_userid,
    min(derived_tstamp) as first_touch_tstamp
  from derived.marketing_touches
  group by 1,
  order by 1
)
create table derived.first_marketing_touch as (
  select
    m.domain_userid,
    m.derived_tstamp,
    m.event_id, 
    m.mkt_medium,
    m.mkt_source,
    m.mkt_term,
    m.mkt_content,
    m.mkt_campaign,
    m.refr_medium,
    m.refr_source,
    m.refr_term
  from derived.marketing_touches m
  join first_touch_tstamps f            
    -- only return first touch tstamps
  on m.domain_userid = f.domain_userid
  and m.derived_tstamp = f.first_touch_tstamp
);
{% endhighlight %} 

Now it is trivial to join our `derived.first_marketing_touch` table with our `derived.revenue_events` table:

{% highlight sql %}
select
  f.*,
  r.tr_total
from derived.first_marketing_touch f
right join derived.revenue_events r    
  -- right join in case there is no marketing touch event to join to the revenue event
on f.domain_userid = r.domain_userid 
{% endhighlight %}

Bingo! We have a table with a line of data for each revenue event, and all the marketing data associated with the corresponding first touch event for that user.

Note that the above is especially straightforward because:

1. It is easy to identify the first marketing touch for each user. (It's simply the one wiht the earlierst timestamp.)
2. By the time we do the join we have a table with a maximum of one marketing touch event per user ID, so we do not have to worry about generating a cartesian product when performing the join.

Because neither of the above is true when we are applying a last click attribution model, the SQL gets a bit more complicated.

## Connecting marketing touches with revenue events: last touch attribution model

In a last touch attribution model, we want to credit all the value associated with each revenue event to the *most recent* marketing touch that occurred prior to that event.

There are a number of ways to do this in SQL - I think the following is the most straightforward, but welcome any suggestions at alternatives that are clearer / more performant.

First, we need to identify for each revenue event what is the corresponding marketing touch event that we wish to connect. To do this, we first union our marketing touches and revenue event tables into a single table that contains both the marketing touches and the revenue events. For performance reasons, we only include a subset of the columns in our marketing touches table.

{% highlight sql %}
create table derived.marketing_touches_and_revenue_events as (
  select
    domain_userid,
    derived_tstamp,
    event_id as marketing_event_id,
    null as revenue_event_id,
    'marketing touch' as event_type,
    null as revenue
  from derived.marketing_touches
  union
  select
    domain_userid,
    derived_tstamp,
    null as marketing_event_id,
    event_id as revenue_event_id
    'revenue event' as event_type,
    tr_total as revenue
  from derived.revenue_events
);
{% endhighlight %}

The above table includes a line for every marketing touch event and every revenue events. Marketing touch events have a `marketing_event_id` set and revenue events have a `revenue_event_id` set. 

We need to aggregate over this table so that we set the `marketing_event_id` for each revenue event. This will be the event_id of the most recent marketing touch event prior to the revenue event. We'll then be able to use the event ID to join back with our marketing touches table, to pull all the metadata associated with that marketing touch to the revenue event.

To do that, we use a window function to identify the most recent marketing touch event prior to the revenue event:

{% highlight sql %}
select
  domain_userid,
  derived_tstamp,
  last_value(marketing_event_id ignore nulls) over (
    partition by domain_userid
    order by derived_tstamp
    rows between unbounded preceding and current row
  ) as marketing_event_id,
  revenue_event_id,
  event_type,
  tr_total
from derived.marketing_touches_and_revenue_events
{% endhighlight %}

The window function is doing a lot of work for us, so it is worth explaining what's going on before we use the above query to generate our final result set:

* First, it partitions our marketing touch and revenue events by user ID
* Then it orders the event stream by time
* Then for each event, it fetches the most recent not null `marketing_event_id` value. Note that this will be applied to every row in the table i.e. marketing touch events *and* transaction events. Where it is applied to marketing events, the most recent marketing event ID will be the marketing event ID for the current event. That doens't matter (we're going to filter these events out of the event stream in the next step). The important thing is that for revenue events, it will correctly fetch the most recent marketing event ID. (Because the marketing event ID for the current row will be null, so will be ignored.)

Now we apply the above window function to generate our final result set:

{% highlight sql %}
with last_touch_event_ids_calculated as (
  select
    domain_userid,
    derived_tstamp,
    last_value(marketing_event_id ignore nulls) over (
      partition by domain_userid
      order by derived_tstamp
      rows between unbounded preceding and current row
    ) as last_marketing_event_id,
    revenue_event_id,
    event_type,
    tr_total
  from derived.marketing_touches_and_revenue_events  
)
select
  r.domain_userid,
  r.derived_tstamp as revenue_event_tstamp,
  r.last_marketing_event_id
  r.revenue_event_id,
  r.tr_total,
  m.mkt_medium,
  m.mkt_source,
  m.mkt_term,
  m.mkt_content,
  m.mkt_campaign,
  m.refr_medium,
  m.refr_source,
  m.refr_term
from last_touch_event_ids_calculated r
right join derived.marketing_touches m
on r.last_marketing_event_id = m.event_id  
  -- only perform the join for the last touch event
where r.event_type = 'revenue event'    
  -- only fetch revenue events from the last_touch_event_ids_calculated table
{% endhighlight %}

The above query will generate a result set with one line of data per revenue event, and each line including the marketing data associated with the last channel that each user engaged with prior before the revenue event occurred.

[snowplow-transaction-events]: https://github.com/snowplow/snowplow/wiki/canonical-event-model#233-ecommerce-transactions