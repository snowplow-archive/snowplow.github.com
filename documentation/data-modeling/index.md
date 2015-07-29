---
layout: page
header: title
group: documentation
subgroup: data modeling
title: Data Modeling
description: Introduction to data modeling
permalink: /documentation/data-modeling/
redirect_from:
  - /analytics/data-modeling/
  - /analytics/event-dictionaries-and-data-models/data-modeling.html
---

# Data Modeling

The data collection and enrichment process generates an event stream. While it is possible to do analysis on this event stream, it is common to join with other data sets (e.g. customer data, product data, marketing data or financial data) and aggregate event-level data into smaller data sets. These are easier to understand and faster to run queries against. Also, if analysis is done against these data sets, the same business logic will be used by all users of the data. Aggregate tables can be:

- User-level tables
- Session-level tables
- Product or media-level tables (catalog analytics)

We call this process of aggregating *data modeling*. At the end of the data modeling exercise, a clean set of tables are available which make it easier to perform analysis on the data. It is easier because the basic tasks of defining users, sessions and other core dimensions and metrics have already been performed, so the analyst has a solid foundation for diving directly into the more interesting, valuable parts of the data analysis.

The tables mentioned before are all illustrative examples of aggregate tables. In practice, what tables are produced, and the different fields available in each, varies widely between companies in different sectors, and surprisingly even varies within the same vertical. That is because part of putting together these aggregate tables involves implementing business-specific logic, including different approaches to:

- Sessionization
- Identity stitching (which users across multiple channels are really the same user)

## 1. Model

The data model can be run in *full* or *incremental* mode. Full mode is used on smaller data sets or when the model is being customized to fit the needs of a particular business. Customization ideally happens in several stages:

- In a first step, the basic data model is set up in *full* mode. The output is a set of derived tables which are recomputed each time the pipeline runs.

- The basic model can then be modified to include business-specific logic. This could mean adding ecommerce fields or aggregating events in different ways, ideally joining Snowplow data with other data sets (e.g. customer data).

- Once the custom data model is in a stable state, i.e. all data needed to build reports has been added, the queries can be migrated from a full to an incremental mode. The incremental model updates the derived tables using only the most recent events, rather than recompute the tables each time using all events.

Below is a visualization of the incremental version of the Snowplow data model. New events arrive in the `snowplow_landing` schema, not `atomic`, and get aggregated into, for example, sessions. These new sessions then have to be merged with existing sessions before being moved to the final derived tables. The full model is a simpler version of this model.

[![Incremental data model](http://snowplowanalytics.com/assets/img/analytics/data-models/data-modeling.png)](http://snowplowanalytics.com/assets/img/analytics/data-models/data-modeling.png)

## 2. Event aggregation in SQL

Events can be aggregated into various smaller data sets, such as sessions and visitors. The conditions on which events are aggregated are different in each case, but the logic in SQL is similar.

In this section, sessions are used as an example to illustrate the general principle.

### 2a. Aggregate frame

In the first step, a basic table is created which contains the identifier (in the case of sessions: a unique combination of `domain_userid` and `domain_sessionidx`) and some basic information, such as various timestamps. These are all fields that can be calculated with a `GROUP BY` aggregate function. Examples include `MIN`, `MAX`, `COUNT` and `SUM`.

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

This example returns a table with one row per session and aggregate properties such as the total number of events per session. In most cases, we are also interested in properties associated with either the first or the last event of each session (for example, the landing and exit page). More complicated logic is also possible, but not discussed in this document.

The device timestamp is used to sort events within each session. The `MIN` and `MAX` device timestamp of each session are therefore recorded in `sessions_basic`. Note that we use the device, not collector, timestamp because events are not guaranteed to arrive in the right order.

### 2b. Initial frame

The next step is to return fields associated with the first event in each session. The example below returns the landing page of each session. This is done with an `INNER JOIN` between the events table and the basic table (discussed before) on `dvce_min_tstamp`, which is the earliest device timestamp of each session. An inner join therefore only returns the first event in each session.

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

It could happen that multiple events have the same device timestamp. If this happens to be the earliest timestamp, a single session would return multiple rows. Duplicate rows are deduped in two ways.

First, if all selected fields (in this case, urlhost and urlpath) are the same (other fields can be different), these rows get combined by the `GROUP BY` statement. If the events are different (e.g. two landing pages), we rank and pick one at random. If there is a criterion to choose on over the other, that one can be used instead.

### 2c. Final frame

The same logic is used to return fields associated with the last event in each session. The only difference is that the inner join is done on `dvce_max_tstamp` rather than `dvce_min_tstamp`.

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

## 3. Identity stitching

The standard data model does not use `user_id`, but it does contain placeholder fields for identity stitching. These are `blended_user_id` (equal to the `domain_userid` by default) and `inferred_user_id` (`NULL` by default). This is because there is no one right answer to identity stitching, the method will often depend on particular needs of a business.

The standard model does contain a `cookie_id_to_user_id_map` which maps (at most) one `user_id` onto each `domain_userid`. This table can be joined onto `events_enriched`, which will populate the `blended_user_id` and `inferred_user_id` fields in the derived tables. The logic used to calculate this map is independent of the rest of the data model.

### 3a. Possible implementation

If a user logs in on a device with a particular cookie, his or her `user_id` gets mapped onto that `domain_userid`. The same `user_id` will be added to `inferred_user_id` for all subsequent sessions, irrespective of whether the user is logged in. The `blended_user_id` is equal to the `domain_userid` for all events before the user logged in, and equal to the `user_id` for all events after the first login.

The `cookie_id_to_user_id_map` assigns at most one user to each cookie, so if a new user logs in on a device that was used by another user, all future events will get mapped onto the most recent `user_id`.

This approach is illustrated below.

[![Identity stitching](http://snowplowanalytics.com/assets/img/analytics/data-models/stitching.png)](http://snowplowanalytics.com/assets/img/analytics/data-models/stitching.png)

## 4. Sessionization

The purpose of sessionization is to generate an aggregate table with a single line per visitor per visit. How a visit, or session, is defined is open for discussion. The standard model uses the Snowplow client-side sessionization and aggregates unique combinations of `domain_userid` and `domain_sessionidx` into single rows.

The standard model captures, for each session:

- identifiers
- various timestamps (aggregate)
- number of events (aggregate)
- time engaged in minutes (aggregate)
- geographical information (first event)
- landing page (first event)
- exit page (last event)
- marketing data (first event)
- referer data (first event)
- browser, OS and device data (first event)

The SQL used to calculate these fields was discussed before. First, the `sessions_basic` table is generated, which contains aggregate values. Then, 5 other tables are created which either select the first or the last event per session. These tables are then joined back onto `sessions_basic` to form the `sessions_new` table.

This approach is visualized below.

[![Sessionization](http://snowplowanalytics.com/assets/img/analytics/data-models/sessions.png)](http://snowplowanalytics.com/assets/img/analytics/data-models/sessions.png)

In the *full* model, `sessions_new` is the final derived table, because it was calculated using all events.

In the *incremental* version, `sessions_new` was calculated using only events that arrived after the last run began. This table will have to be merged with the existing sessions table, because events that belong to one session could have ended up in two different batches. A simple union of both tables would create multiple rows for some sessions, a situation which is to be avoided.

Merging sessions which occur in both tables is done using the same SQL as before. All existing sessions are copied into `sessions_new`. A basic table is then created which calculates aggregate values, including the `MIN` and `MAX` timestamp of each version of the sessions. Two other tables are then created to select the values associated with the first and last event in a particular session. These tables are joined and the result is moved back into the derived table.

## 5. Visitors

The standard data model creates an aggregate table with a single line per visitor. How visitors are defined depends on the identity stitching that is used. The standard model uses only cookies, visitors are therefore defined as a unique `domain_userid`.

The standard model captures, for each visitor:

- identifiers
- various timestamps (aggregate)
- number of events (aggregate)
- number of sessions (aggregate)
- number of page views (aggregate)
- time engaged in minutes (aggregate)
- landing page (first event, initial visit)
- marketing data (first event, initial visit)
- referer data (first event, initial visit)

The logic used to do sessionization is also used to calculate the visitors table.

[![Visitors](http://snowplowanalytics.com/assets/img/analytics/data-models/visitors.png)](http://snowplowanalytics.com/assets/img/analytics/data-models/visitors.png)

## 6. Page views (as an example of content)

The standard data model creates an aggregate table with a single line per page views, which captures:

- identifiers
- various timestamps (aggregate)
- number of events (aggregate)
- number of page views (aggregate)
- number of page pings (aggregate)
- time engaged in minutes (aggregate)

The same logic that is used to do sessionization is also used to calculate the page views table. Since there are only aggregate fields, only a basic table is required.

[![Page views](http://snowplowanalytics.com/assets/img/analytics/data-models/page-views.png)](http://snowplowanalytics.com/assets/img/analytics/data-models/page-views.png)

An alternative would be to create an aggregate table with a single line per page (not page views). In that case, the approach would be similar to how the visitors table is calculated.

## Transition from full to incremental mode

Once the custom data model is in a stable state, i.e. all data needed to build reports has been added, the queries can be migrated from a full to an incremental mode. The incremental model updates the derived tables using only the most recent events, rather than recompute the tables each time using all events.

The following changes need to be made when migrating to the incremental mode:

1. New events should arrive in the `snowplow_landing` schema, rather than in `atomic`.
2. An intermediary table which stores a list of all `etl_tstamp` in each batch should be created.
3. The `events_enriched` table should select data from `snowplow_landing`, rather than `atomic`.
4. The output of aggregation process (e.g. sessions) is no longer the whole derived table, and should therefore be stored in the `_new` tables.
5. The `new_tables` should be merged with the existing derived tables. This involved the creation of a new set of queries, which use the `_backup` and `_frame` intermediary tables.
6. When all this is done, the events in `snowplow_landing` should be moved to `atomic` (making sure to restrict on `etl_tstamp`).
