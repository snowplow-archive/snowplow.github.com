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

![Incremental data model](http://snowplowanalytics.com/assets/img/analytics/data-models/data-modeling.png)

## Basic SQL logic

Events are aggregated using SQL, and the same logic is applied at different steps in the process.

### Aggregation

The first step is basic `GROUP BY` to calculate `MIN`, `MAX` and `SUM`.

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

### Initial Frame

Previous implementations used SQL Window Functions (e.g. `FIRST VALUE`), but the model now joines on `device_min_tstamp`. The example below assigns the landingpage to each session.

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

### Final Frame

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

![Identity stitching](http://snowplowanalytics.com/assets/img/analytics/data-models/stitching.png)

- High level explanation of model
- High level SQL explanation
- Links to SQL on github
- Possible extensions

## Sessionization

![Sessionization](http://snowplowanalytics.com/assets/img/analytics/data-models/sessions.png)

### Model

### SQL

## Visitors

![Visitors](http://snowplowanalytics.com/assets/img/analytics/data-models/visitors.png)

## Content (page or video or product views)

![Page views](http://snowplowanalytics.com/assets/img/analytics/data-models/page-views.png)



