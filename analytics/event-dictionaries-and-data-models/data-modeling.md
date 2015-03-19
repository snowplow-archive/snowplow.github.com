---
layout: page
group: analytics
sub_group: foundation
title: Data Modeling
shortened-link: Data modeling
description: Introduction to data modelling
weight: 9
---

# Data modeling

The data collection and enrichment process generates an event stream. It is possible to do analysis on this event stream, but it is common to join with other data sets (e.g. customer data, product data, marketing data or financial data) and aggregate event-levfel data into smaller data sets. These have the benefit of being easier to understand and faster to run analyses against. Also, if analysis is done against this data set, the same business logical will be used by all users of the data.

This page is structured as follows:

- Basic SQL logic: Events are aggregated in SQL, and the same logic is applied at different steps in the process.
- Identity stitching: The data models contain an optional step to map cookies onto users. Without this step, only first-party cookies are used as an identifier.

## Model

Below is a visualization of the *incremental* data model: events get aggregated as new data arrives. The *full* model is a simplified version, as it aggregates all data and doesn't have to merge new and existing sessions (for example).

[![Incremental data model](http://snowplowanalytics.com/assets/img/analytics/data-models/data-modeling.png)](http://snowplowanalytics.com/assets/img/analytics/data-models/data-modeling.png)

## Event aggregation in SQL

Events can be aggregated into visitors, sessions or content views, and the same steps get repeated in each aggregation. In this section, this logic is discussed in more detail.

### Aggregate frame

The first step aggregates events into, for example, sessions. It also includes fields that can be aggregated using `MIN`, `MAX`, `COUNT` and `SUM`. The example below is a simplied version of the `sessions_basic` query. Sessionization is done client-side and sessions are identified by a `domain_userid` (first-party cookie) and `domain_sessionidx` combination.

{% highlight sql %}
SELECT
  domain_userid,
  domain_sessionidx,
  MIN(collector_tstamp) AS session_start_tstamp,
  MAX(collector_tstamp) AS session_end_tstamp,
  MIN(dvce_tstamp) AS dvce_min_tstamp,
  MAX(dvce_tstamp) AS dvce_max_tstamp,
  COUNT(*) AS event_count,
  COUNT(DISTINCT(FLOOR(EXTRACT(EPOCH FROM dvce_tstamp)/30)))/2::FLOAT AS time_engaged_with_minutes
FROM
  snowplow_intermediary.events_enriched_final
GROUP BY 1,2
);
{% endhighlight %}

This example returns a table with one row per session. The device timestamp is used to order events within each session.

### Initial frame

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

### Final frame

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

[![Sessionization](http://snowplowanalytics.com/assets/img/analytics/data-models/sessions.png)](http://snowplowanalytics.com/assets/img/analytics/data-models/sessions.png)

### Model

### SQL

## Visitors

[![Visitors](http://snowplowanalytics.com/assets/img/analytics/data-models/visitors.png)](http://snowplowanalytics.com/assets/img/analytics/data-models/visitors.png)

## Content (page or video or product views)

[![Page views](http://snowplowanalytics.com/assets/img/analytics/data-models/page-views.png)](http://snowplowanalytics.com/assets/img/analytics/data-models/page-views.png)



