---
layout: page
header: title
group: documentation
subgroup: data modeling
breadcrumb: sessionization
subbreadcrumb: basic server-side sessionization in sql
rank: 2
title: Basic sessionization in SQL
description: Basic sessionization in SQL.
permalink: /documentation/data-modeling/sessionization/basic-sessionization-in-sql/
---

The Snowplow [Javascript][javascript-tracker] and [Android][android-tracker] trackers (and soon also the [iOS][ios-tracker] tracker) have client-side sessionization built in. Both trackers increment the session index if the time since the last event exceeds the time-out interval. The Javascript tracker assigns the session index to `domain_sessionidx`, and both trackers now also populate the [client session context][client-session-context]. Snowplow users that use these trackers and enable client-side sessionzation can use these fields to aggregate events into sessions with little or no effort.

However, there are cases where client-side sessionization alone is not enough. For example:

- You decide to reduce the time-out interval from 30 to 10 minutes because it fits better with observed user behavior. This change doesn’t affect historical data, so it might make sense to re-sessionize old events in order to retain a consistent session definition.
- Events belonging to a single user are captured using multiple trackers. In this situation, no single tracker is guaranteed to have all the information it needs to sessionize events. This is relevant when a user is expected to be active on multiple devices during a single session, or when server-side events need to be taken into account. In such a situation, sessionization will have to happen server-side.
- It can be useful to group events using criteria other than periods of inactivity and incorporate more complex signals. This is discussed in more detailed in the next section.

This page documents one approach to server-side sessionization using SQL (in particular [the Postgres dialect Amazon Redshift uses][redshift-sql]). Below is a SQL query which increments the session index when 30 or more minutes have elapsed between 2 consecutive events.

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

[javascript-tracker]: https://github.com/snowplow/snowplow-javascript-tracker
[ios-tracker]: https://github.com/snowplow/snowplow-objc-tracker
[android-tracker]: https://github.com/snowplow/snowplow-android-tracker
[client-session-context]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.snowplowanalytics.snowplow/client_session_1.sql

[redshift-sql]: http://docs.aws.amazon.com/redshift/latest/dg/c_redshift-and-postgres-sql.html
