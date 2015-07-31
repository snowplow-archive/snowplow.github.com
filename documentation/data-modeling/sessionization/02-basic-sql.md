---
layout: page
header: title
group: documentation
subgroup: data modeling
breadcrumb: sessionization
subbreadcrumb: basic server-side sessionization in sql
rank: 2
title: Basic sessionization in SQL
description: Basic sessionization in SQL
permalink: /documentation/data-modeling/sessionization/basic-sessionization-in-sql/
---

## When to use server-side sessionization?

The Snowplow [Javascript][javascript-tracker] and [Android][android-tracker] trackers (and soon also the [iOS][ios-tracker] tracker) have client-side sessionization built in. Both trackers increment the session index if the time since the last event exceeds the time-out interval. The Javascript tracker assigns the session index to `domain_sessionidx`, and both trackers now also populate the [client session context][client-session-context]. Snowplow users that use these trackers and enable client-side sessionzation can use these fields to aggregate events into sessions with little or no effort.

However, there are cases where client-side sessionization alone is not enough. For example:

- You decide to reduce the time-out interval from 30 to 10 minutes because it fits better with observed user behavior. This change doesn’t affect historical data and is likely to increase future session numbers, making it harder to compare past and current performance. It might therefore make sense to re-sessionize old events using the new time-out interval in order to retain a consistent session definition.

- When events belonging to a single user are captured using multiple trackers, and all events need to be taken into account when sessionizing, then no tracker is guaranteed to have all the information it needs to sessionze events client-side. This can happen when users are expected to use multiple devices during a single session, or when server-side events need to be taken into account. In those situations, sessionization will have to happen server-side.

- You might decide to group events using criteria other than the time-out interval.

## Example

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

First of all. this query uses a [SQL WITH][sql-with] statement. "The WITH clause defines one or more subqueries. Each subquery defines a temporary table, similar to a view definition."

This is a nicer way to represent queries, thus avoiding having to nest queries (making the SQL a tad more readable). Let us now break the SQL down into its components to understand what is going on.

## Example

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

## Finding gaps between events

Now that we have `previous_tstamp` we are in a position to compare both timestamps. If 30 or more minutes have elapsed between two consecutive events, we want to start a new session.

This uses EXTRACT EPOCH to calculate the number of sessions, and combines it with a CASE statement. It also returns 1 when previous_tstamp is NULL. The new_session columns indicates which events are new sessions.

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

## Creating a session index

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

## From events to sessions

Now that we have a session index, we are in a position to aggregate events into sessions:

{% highlight sql %}
SELECT
  id,
  session_idx,
  MIN(tstamp) AS min_tstamp,
  COUNT(*) AS event_count
FROM (...)
GROUP BY id, session_idx
{% endhighlight %}

The end result is a table where each session is rolled up into a single row:

<img src="/assets/img/documentation/sessionization/basic-aggregated.png" width="601px">

## In practice

The above example uses `id` and `tstamp`, which are not actual fields in the Snowplow [canonical event model][canonical-event-model]. Instead, Snowplow captures a whole range of possible identifiers and timestamps. This gives our users the option to pick an approach that is best suited to their needs.

The [canonical event model][canonical-event-model] has the following [user-related fields][canonical-user-fields]:

- `user_id` (a custom user ID)
- `user_ipaddress` (the user IP address)
- `domain_userid` (a user ID generated by Snowplow and stored in a first-party cookie)
- `network_userid	` (another user ID generated by Snowplow but stored in a third-party cookie)
- `user_fingerprint` (an ID based on individual browser features)

The mobile trackers also capture user identifiers, which are stored in the [mobile context][mobile-context]. These include:

- `apple_idfa` (identifier for advertisers)
- `apple_idfv` (identifier for vendors)
- `android_idfa`

It’s of course also possible to extend the base model and send in custom identifiers using a context or unstructured event.

Snowplow captures various timestamps, including:

- `collector_tstamp` (when the event hits the collector)
- `dvce_tstamp` ()
- `derived_tstamp` (introduced with [Snowplow R63][snowplow-r63])



[javascript-tracker]: https://github.com/snowplow/snowplow-javascript-tracker
[ios-tracker]: https://github.com/snowplow/snowplow-objc-tracker
[android-tracker]: https://github.com/snowplow/snowplow-android-tracker
[client-session-context]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.snowplowanalytics.snowplow/client_session_1.sql

[redshift-sql]: http://docs.aws.amazon.com/redshift/latest/dg/c_redshift-and-postgres-sql.html
[sql-with]: http://docs.aws.amazon.com/redshift/latest/dg/r_WITH_clause.html

[canonical-event-model]: https://github.com/snowplow/snowplow/wiki/Canonical-event-model
[canonical-user-fields]: https://github.com/snowplow/snowplow/wiki/Canonical-event-model#user
[mobile-context]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.snowplowanalytics.snowplow/mobile_context_1.sql
[snowplow-r63]: http://snowplowanalytics.com/blog/2015/04/02/snowplow-r63-red-cheeked-cordon-bleu-released/
