---
layout: page
header: title
group: documentation
subgroup: data modeling
breadcrumb: sessionization
subbreadcrumb: basic server-side sessionization in sql
rank: 2
title:
description: Basic sessionization in SQL.
permalink: /documentation/data-modeling/sessionization/basic-sessionization-in-sql/
---

The Snowplow Javascript, iOS and Android trackers all come with client-side sessionization built in. The events captured by these trackers will therefore come with a session index and, perhaps, a session ID. Most users will have enough with the client-side sessionization. However, in some cases it becomes necessary to create a new session index server-side. Examples of such situations include:

- Based on historical data, you decide to change the sessionization timeout [correct word?] from 30 to 10 minutes. To make historical data consistent with the new approach, you decide to do a one-off resesisonization of the old events.
- If a single users data is captured using multiple trackers, and events from all trackers need to be taken into account (e.g. a multi-device world, or a server-side component that is relevant to the sessionization). Each tracker has only part of the information, the sessionization will thus have to happen server-side.
- More advanced sessionization, incorporating various signals (moving closer towards a *unit of work* approach).

This page documents one approach to sessionization using SQL (specifically the Postgres dialect Amazon Redshift uses). The following SQL query aggregates events into sesisons and begins a new session when there are 30 minutes between consequtive events.

{% highlight sql %}

WITH step_1 AS (

  SELECT
    id,
    tstamp,
    LAG(tstamp, 1) OVER (PARTITION BY id ORDER BY tstamp) AS previous_tstamp
  FROM events

), step_2 AS (

  SELECT
    id,
    tstamp,
    previous_tstamp,
    CASE WHEN EXTRACT(EPOCH FROM (tstamp - previous_tstamp)) < 60*30 THEN 0 ELSE 1 END AS new_session
  FROM step_1

), step_3 AS (

  SELECT
    id,
    tstamp,
    previous_tstamp,
    new_session,
    SUM(new_session) OVER (PARTITION BY id ORDER BY tstamp ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS session_idx
  FROM step_2

)

SELECT
  id,
  session_idx,
  MIN(tstamp) AS min_tstamp
FROM step_3
GROUP BY id, session_idx
{% endhighlight %}

First of all. this query uses a SQl WITh statement. This is a nicer way to represent queries, thus avoiding having to nest queries (making the SQL a tad more readable). Let us now break the SQL down into its components to understand what is going on.

Below is a simple dataset. User A had 4 events, and based on the timestamp, we want the third event to start a new session (there were 40 minutes between the second and third event). User B had 3 events and we want the second event to start a new session (32 minutes elapsed between events 1 and 2).

<img src="/assets/img/documentation/sessionization/basic.png" width="282px">

The goal of time-based sessionization is to search for gaps in the data – periods of inactivity that indicate that a user began a new visit or session. The first step is to use a SQL LAG function, which is a window function (is it?). These are functions that run over a partition (in this case the ID). Using LAG, we add a new column with the timestamp of the previous row. Because we run the function over partitions, the first row of each user ID will return NULL (as there is no previous row).

{% highlight sql %}
SELECT
  id,
  tstamp,
  LAG(tstamp, 1) OVER (PARTITION BY id ORDER BY tstamp) AS previous_tstamp
FROM events
{% endhighlight %}

This returns the following table:

<img src="/assets/img/documentation/sessionization/basic-previous.png" width="466px">

The next step is to compare the values in tstamp and previous_tstamp to determine whether there were 30 minutes or not between consequtive events. This uses EXTRACT EPOCH to calculate the number of sessions, and combines it with a CASE statement. It also returns 1 when previous_tstamp is NULL. The new_session columns indicates which events are new sessions.

{% highlight sql %}
SELECT
  id,
  tstamp,
  previous_tstamp,
  CASE WHEN EXTRACT(EPOCH FROM (tstamp - previous_tstamp)) < 60*30 THEN 0 ELSE 1 END AS new_session
FROM (...)
{% endhighlight %}

The result is below:

<img src="/assets/img/documentation/sessionization/basic-delta.png" width="600px">

The last step again uses a window function. This time we want to sum over a partition by event ID. The new_session column begins with 1, then contains 0 as long as the session continues, and has another one when the next session begins (again followed by zeros). To get the session index, we sum over new_session in partitions created by the ID (and sorted on timestamp).

{% highlight sql %}
SELECT
  id,
  tstamp,
  previous_tstamp,
  new_session,
  SUM(new_session) OVER (PARTITION BY id ORDER BY tstamp ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS session_idx
FROM (...)
{% endhighlight %}

We now have a session index:

<img src="/assets/img/documentation/sessionization/basic-index.png" width="737px">

We can aggregate events into sessions, like we would in any other situation:

{% highlight sql %}
SELECT
  id,
  session_idx,
  MIN(tstamp) AS min_tstamp
FROM (...)
GROUP BY id, session_idx
{% endhighlight %}

<img src="/assets/img/documentation/sessionization/basic-aggregated.png" width="601px">

## What columns to use?

The above example used ID and tstamp. Snowplow captures various identifiers:

Snowplow also captures various timestamp:

- To sort events belong to the same user, we recommend using the device timestamp (dvce_tstamp), because it is an accurate representation of the order in which events occured on a single device. To compare events across devices, the collector timestamp is a better approximation. This until the derived timestamp is set.

What ID to use? The domain_userid, fingerprint, user_id, apple_idfa.
