---
layout: page
group: analytics
sub_group: foundation
title: Data Modeling
shortened-link: Data modeling
description: Introduction to data modelling
weight: 9
---

# Data Modeling

The data collection and enrichment process generates an event stream. It is possible to do analysis on this event stream, but it is common to join with other data sets (e.g. customer data, product data, marketing data or financial data) and aggregate event-levfel data into smaller data sets. These have the benefit of being easier to understand and faster to run analyses against. Also, if analysis is done against this data set, the same business logical will be used by all users of the data.

Whilst it is possible to do analysis directly on this event stream, it is very common to:

Join the event-stream data set with other data sets (e.g. customer data, product data, media data, marketing data, financial data)
Aggregate the event-level data into smaller data sets that are easier and faster to run analyses against

User-level tables
Session-level tables.
Product or media-level tables (catalog analytics).

The above are all illustrative examples of aggregate tables. In practice, what tables are produced, and the different fields available in each, varies widely between companies in different sectors, and surprisingly even varies within the same vertical. That is because part of putting together these aggregate tables involves implementing business-specific logic, including:

How to identify that users across multiple different channels are the same user i.e. identity stitching
Sessionization
Joining Snowplow data with 3rd party data sets

We call this process of aggregating ‘data modeling’. At the end of the data modeling exercise, a clean set of tables are available to make it easier for to perform analysis on the data - easier because:

The volume of data to be queried is smaller (because the data is aggregated), making queries return faster
The basic tasks of defining users, sessions and other core dimensions and metrics has already been performed, so the analyst has a solid foundation for diving directly into the more interesting, valuable parts of the data analysis

This page is structured as follows:

- Basic SQL logic: Events are aggregated in SQL, and the same logic is applied at different steps in the process.
- Identity stitching: The data models contain an optional step to map cookies onto users. Without this step, only first-party cookies are used as an identifier.

## 1. Model

The data model can be run in *full* or *incremental* mode. The full mode is used on smaller data sets or when the model is being customized to include business-specific logic. Customization ideally happens in several stages:

- In a first step, the basic data model is set up in *full* mode. The output is a set of tables (refered to as the pivot tables) which are recomputed each time the pipeline runs.

- The data models can then be changed. This could mean adding ecommerce fields or applying business-specific logic, ideally joining Snowplow data with other data sets (e.g. customer or data).

- Once the custom data model is stable, i.e. all data needed to build reports has been added, the queries can be migrated from a *full* to an *incremental* view. While the former recomputes the pivot tables each time, the latter updates them based on the new data that comes in. New events arrive in the `snowplow_landing` rather than the `atomic` schema (and get moved when the pivots have been updated).

Below is a visualization of the steps in the incremental data model. New events first get aggregated into, for example, sessions. These new sessions then have to be merged with existing sessions. The full model is a simplified version of this model.

[![Incremental data model](http://snowplowanalytics.com/assets/img/analytics/data-models/data-modeling.png)](http://snowplowanalytics.com/assets/img/analytics/data-models/data-modeling.png)

## 2. Event aggregation in SQL

Events can be aggregated into various smaller data sets, such as sessions and visitors. The conditions on which events are aggregated are different in each case, but the logic in SQL is similar.

In this section, we use sessions as an example to illustrate the general principle.

### 2a. Aggregate frame

In the first step, a basic table is created which contains the identifier (in the case of sessions: a unique combination of `domain_userid` and `domain_sessionidx`) and some basic information, such as various timestamps. These fields can all be calculated with a `GROUP BY` aggregate function. Examples include `MIN`, `MAX`, `COUNT` and `SUM`.

Below is a simplified version of the query used to generate the `sessions_basic` table:

{% highlight sql %}
SELECT
  domain_userid,
  domain_sessionidx,
  MIN(collector_tstamp) AS session_start_tstamp,
  MAX(collector_tstamp) AS session_end_tstamp,
  MIN(dvce_tstamp) AS dvce_min_tstamp,
  MAX(dvce_tstamp) AS dvce_max_tstamp,
  COUNT(*) AS event_count
FROM
  snowplow_intermediary.events_enriched_final
GROUP BY 1,2
);
{% endhighlight %}

This example returns a table with one row per session and aggregate properties such as the total number of events per session. In most cases, we are also interested in properties associated with either the first or the last event in each session (for example, the landing and exit pages). The earliest and latest device timestamp are used to sort events within each session. Device, not collector, timestamp is used because events are not guaranteed to arrive in the right order. More complicated logic is also possible, but not discussed in this document.

### 2b. Initial frame

The next step is to return fields associated with the first event in each session. The example below returns the landingpage for each session. This is achieved via an `INNER JOIN` between the events table and the basic table (discussed before) on `dvce_min_tstamp`. This value is the timestamp of the earliest event for each session, an inner join therefore only returns the first event for each session.

{% highlight sql %}
SELECT
  *
FROM (
  SELECT -- Select the first page (using dvce_tstamp)
    a.domain_userid,
    a.domain_sessionidx,
    a.page_urlhost,
    a.page_urlpath,
    RANK() OVER (PARTITION BY a.domain_userid, a.domain_sessionidx
      ORDER BY a.page_urlhost, a.page_urlpath) AS rank
  FROM snowplow_intermediary.events_enriched_final AS a
  INNER JOIN snowplow_intermediary.sessions_basic AS b
    ON  a.domain_userid = b.domain_userid
    AND a.domain_sessionidx = b.domain_sessionidx
    AND a.dvce_tstamp = b.dvce_min_tstamp
  GROUP BY 1,2,3,4 -- Aggregate identital rows
)
WHERE rank = 1 -- If there are multiple rows, pick the first row
);
{% endhighlight %}

It could happen that multiple events have the same device timestamp. If this happens to be the earliest timestamp, a single session would return multiple rows. Duplicate rows are therefore deduped in two ways.

First, if all selected fields (in this case, urlhost and urlpath) are the same (other fields can be different), these rows are aggregated by the `GROUP BY` statement. If the events are different (e.g. two landingpages), we rank and pick one at random. If there is a criterion to choose on over the other, that one can be used instead.

### 2c. Final frame

The same logic gets repeated when returning fields associated with the last event in each session. The only difference is that the inner join gets made on `dvce_max_tstamp` rather than `dvce_min_tstamp`.

{% highlight sql %}
SELECT
  *
FROM (
  SELECT -- Select the last page (using dvce_tstamp)
    a.domain_userid,
    a.domain_sessionidx,
    a.page_urlhost,
    a.page_urlpath,
    RANK() OVER (PARTITION BY a.domain_userid, a.domain_sessionidx
      ORDER BY a.page_urlhost, a.page_urlpath) AS rank
  FROM snowplow_intermediary.events_enriched_final AS a
  INNER JOIN snowplow_intermediary.sessions_basic AS b
    ON  a.domain_userid = b.domain_userid
    AND a.domain_sessionidx = b.domain_sessionidx
    AND a.dvce_tstamp = b.dvce_max_tstamp -- Replaces the LAST VALUE window function in SQL
  GROUP BY 1,2,3,4 -- Aggregate identital rows
)
WHERE rank = 1 -- If there are multiple rows, pick the first row
);
{% endhighlight %}

## Identity stitching

The standard data model does not aggregate `user_id`, but it does contain the placeholder fields `blended_user_id` (equal to the `domain_userid` by default) and `inferred_user_id` (`NULL` by default). This is because there is no one right answer to identity stitching, the method will often depend on particular needs of a business.

The standard model has a `cookie_id_to_user_id_map` which maps (at most) one `user_id` onto each `domain_userid`. This map then gets merged back onto `events_enriched`. The logic used to calculate this map can be written independent of the rest of the data madel.

### Possible implementation

If a user logs in on a device with a particular cookie, the corresponding `user_id` gets mapped onto that `domain_userid`. The same `user_id` gets assigned to `inferred_user_id` for all subsequent sessions, irrespective of whether the user is logged in. The `blended_user_id` is equal to the `domain_userid` for all events before the user logged in, and equal to the `user_id` for all events after the first login.

The `cookie_id_to_user_id_map` assigns at most one user to each cookie, so if a new user logs in on a device that was used by another user, only the most recent `user_id` is kept.

This approach is illustrated below.

[![Identity stitching](http://snowplowanalytics.com/assets/img/analytics/data-models/stitching.png)](http://snowplowanalytics.com/assets/img/analytics/data-models/stitching.png)

## Sessionization

The purpose of sessionization is to generate an aggregate table with a single line per visitor per visit. How a visit, or session, is defined is open for discussion. The standard model uses the Snowplow client-side sessionization and aggregates unique combinations of `domain_userid` and `domain_sessionidx` into single rows.

The standard model captures, for each session:

- various timestamps (aggregate)
- total number of events (aggregate)
- geographical information (first event)
- landing page (first event)
- exit page (last event)
- marketing data (first event)
- referer data (first event)
- browser, OS and device data (first event)

The SQL used to calculate these fields was discussed before. First, `sessions_basic` gets created, which contains aggregate values. Then, 5 other tables are created which either select the first or the last event per session. These tables are then joined back onto `sessions_basic` in the `sessions_new` table.

This approach is visualized below.

[![Sessionization](http://snowplowanalytics.com/assets/img/analytics/data-models/sessions.png)](http://snowplowanalytics.com/assets/img/analytics/data-models/sessions.png)

If the *full* model is used, `sessions_new` was calculated using all events and the sessions can be moved to the final pivot table.

In the *incremental* version, `sessions_new` was calculated using only events that arrived after the last run began. This table will have to be merged with the pivot table, because events that belong to one session could have ended up in two different batches. This creates two sessions with the same session identifier, who have to merged into one.

This is done using the same SQL logic as before. All existing sessions are copied into `sessions_new`. A basic table is then created which calculates aggregate values. Two other tables are create to find the values associated with the first and last event in a particular session. These tables then get joined and the result is moved back into the pivot table.

## Visitors

The visitors table is 

[![Visitors](http://snowplowanalytics.com/assets/img/analytics/data-models/visitors.png)](http://snowplowanalytics.com/assets/img/analytics/data-models/visitors.png)

## Content (page or video or product views)

[![Page views](http://snowplowanalytics.com/assets/img/analytics/data-models/page-views.png)](http://snowplowanalytics.com/assets/img/analytics/data-models/page-views.png)



