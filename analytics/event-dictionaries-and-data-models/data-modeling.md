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

In this section, we use sessions as an example.

### 2a. Aggregate frame

In the first step, a basic table is created which contains the identifier (in the case of sessions: a unique combination of `domain_userid` and `domain_sessionidx`) and some basic information, such as various timestamps. These fields all can be obtained using a `GROUP BY` aggregate function. Examples include `MIN`, `MAX`, `COUNT` and `SUM`.

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



This example returns a table with one row per session. The device timestamp is used to order events within each session.

### 2b. Initial frame

The next step is to return fields associated with the first event in each, for example, session. The example below returns the landingpage for each session. This is achieved via an `INNER JOIN` between the events table and the basic table (discussed before) on `dvce_min_tstamp`. This returns those events that have the earliest device timestamp for that session. Remember that events sent from a device do not necessarily arrive in the same order.

{% highlight sql %}
SELECT
  *
FROM (
  SELECT -- Select the first page (using dvce_tstamp)
    a.domain_userid,
    a.domain_sessionidx,
    a.page_urlhost,
    a.page_urlpath,
    RANK() OVER (PARTITION BY a.domain_userid, a.domain_sessionidx ORDER BY a.page_urlhost, a.page_urlpath) AS rank
  FROM snowplow_intermediary.events_enriched_final AS a
  INNER JOIN snowplow_intermediary.sessions_basic AS b
    ON  a.domain_userid = b.domain_userid
    AND a.domain_sessionidx = b.domain_sessionidx
    AND a.dvce_tstamp = b.dvce_min_tstamp -- Replaces the FIRST VALUE window function in SQL
  GROUP BY 1,2,3,4 -- Aggregate identital rows (that happen to have the same dvce_tstamp)
)
WHERE rank = 1 -- If there are different rows with the same dvce_tstamp, rank and pick the first row
);
{% endhighlight %}

It could happen that events have the same device timestamp. Duplicate rows are deduped in two ways. First, if all selected fields (in this case, urlhost and urlpath) are the same (other fields could be different), these events get combined by the `GROUP BY` statement. If the events are different (e.g. two landingpages), we rank and pick one at random. This is because we don't have sufficient information to determine which one is the real landing page.

### 2c. Final frame

{% highlight sql %}
SELECT
  *
FROM (
  SELECT -- Select the last page (using dvce_tstamp)
    a.domain_userid,
    a.domain_sessionidx,
    a.page_urlhost,
    a.page_urlpath,
    RANK() OVER (PARTITION BY a.domain_userid, a.domain_sessionidx ORDER BY a.page_urlhost, a.page_urlpath) AS rank
  FROM snowplow_intermediary.events_enriched_final AS a
  INNER JOIN snowplow_intermediary.sessions_basic AS b
    ON  a.domain_userid = b.domain_userid
    AND a.domain_sessionidx = b.domain_sessionidx
    AND a.dvce_tstamp = b.dvce_max_tstamp -- Replaces the LAST VALUE window function in SQL
  GROUP BY 1,2,3,4 -- Aggregate identital rows (that happen to have the same dvce_tstamp)
)
WHERE rank = 1 -- If there are different rows with the same dvce_tstamp, rank and pick the first row
);
{% endhighlight %}

## Identity stitching

[![Identity stitching](http://snowplowanalytics.com/assets/img/analytics/data-models/stitching.png)](http://snowplowanalytics.com/assets/img/analytics/data-models/stitching.png)

This part centers around the question of how to aggregate `user_id`. There is no one right answer, the method will often depend on the particular business needs.

Events have a `user_id` field, but that isn't directly used in the aggregation process. The data model has an optional component which does identity stitching. Aggregated events (e.g. sessions) have a `blended_user_id` and `infered_user_id`. The latter is `NULL` if no stitching is done. The `blended_user_id` is `infered_user_id` when available, and `domain_user_id` in all other cases. It therefore always equals the cookie ID when no stitching is done.

### Possible implementation

One method is to build a table which maps `user_id` onto `domain_userid`. So if a user logs in on a device with a particular cookie, all sessions with that cookie will be (even if the user is not logged in). If several users have logged in on a device with the same cookie, only the last user will be mapped onto that cookie. Depending on how the aggregates get calculated, previous entries will either update to reflect the new user or a new entry will be created.

## Sessionization

### Model

The purpose of sessionization is to capture a single line per visitor per visit. How a visit, or session, is defined is open for discussion. This data model aggregates unique combinations of `domain_userid` and `domain_sessionidx`. For a detailed discussion, see (link).

### SQL

The model queries data from `snowplow_enriched_final`. The logic was discussed before.

The queries can be found on GitHub.

First, `sessions_basic`

[![Sessionization](http://snowplowanalytics.com/assets/img/analytics/data-models/sessions.png)](http://snowplowanalytics.com/assets/img/analytics/data-models/sessions.png)

## Visitors

The visitors table is 

[![Visitors](http://snowplowanalytics.com/assets/img/analytics/data-models/visitors.png)](http://snowplowanalytics.com/assets/img/analytics/data-models/visitors.png)

## Content (page or video or product views)

[![Page views](http://snowplowanalytics.com/assets/img/analytics/data-models/page-views.png)](http://snowplowanalytics.com/assets/img/analytics/data-models/page-views.png)



