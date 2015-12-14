---
layout: post
title: Snowplow 0.6.5 released, with improved event tracking
title-short: Snowplow 0.6.5
tags: [snowplow, javascript, tracker]
author: Alex
category: Releases
---

We're excited to announce our next Snowplow release - version **0.6.5**, a Boxing Day release for Snowplow!

This is a big release for us, as it introduces the idea of **event types** - every event sent by the JavaScript tracker to the collector now has an `event` field which specifies what type of event it is. This should be really helpful for a couple of things:

1. It should make querying Snowplow events much easier
2. It should make Snowplow event data a better fit for JSON-oriented datastores such as MongoDB and Riak

As well as event types, in this release we are also introducing **event IDs**. With this, the ETL phase adds an `event_id` UUID (universally unique ID) to each event row, which should help with subsequent querying.

Here is a taster of how Snowplow event data looks with the new event types and event IDs:

![events-screenshot] [events-screenshot]

These are not the only improvements in this version - here are the rest:

* We have cleaned up the code for on-page activity tracking ("page pings")
* We have fixed a bug that affected ad impression tracking - thanks [Alan Z] [talkspoon]!
* The ETL no longer dies if a raw event has a corrupted querystring (e.g. the `&refr=` parameter was not escaped)
* The JavaScript tracker's build script, `snowpak.sh`, now has a combine-only option (no minification), which is helpful for testing purposes
* The JavaScript tracker has a new method, `attachUserId(boolean)`, which can be used to stop the tracker sending a `&uid=xxx` parameter
* We have added the ability to override the IP address by passing in an `&ip=` parameter on the querystring

Below, we first explain how to upgrade, before taking a brief tour through these updates:

<!--more-->

## 0. Upgrading

Upgrading is a two-step process:

### JavaScript tracker

Please update your website(s) to use the latest version of the JavaScript tracker, which is version 0.9.0. As always, the updated minified tracker is available here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/0.9.0/sp.js

### ETL

If you are using EmrEtlRunner, you need to update your configuration file, `config.yml`, to use the latest versions of the Hive serde and HiveQL scripts:

    :snowplow:
      :serde_version: 0.5.3
      :hive_hiveql_version: 0.5.3
      :non_hive_hiveql_version: 0.0.4

That's it! You don't need to make any changes to your Infobright setup, assuming you are up-to-date with previous releases.

## 1. Event types

To recap, every event sent by the JavaScript tracker now has an `event` field which specifies what type of event it is. Currently we have six different types of events, which are set out in the table below:

| Type of event    | JavaScript tracker function | Value of Snowplow `event` field |
|:-----------------|:----------------------------|:--------------------------------|
| Page view        | `trackPageView()`           | `page_view`                     |
| Page ping        | None (automatic)\*          | `page_ping`                     |
| Custom event     | `trackEvent()`              | `custom`                        |
| Ad impression    | `trackImpression()`         | `ad_impression`                 |
| Transaction      | `addTrans` & `trackTrans()` | `transaction`                   |
| Transaction item | `addItem` & `trackTrans()`  | `transaction_item`              |

_\* for more information on on-page activity tracking, please see the relevant section later in this blog post._

This new event field should make it much easier to query Snowplow data by the type of event. For example, to retrieve the number of e-commerce transactions per day:

{% highlight sql %}
SELECT
dt,
COUNT(event_id)
FROM events
WHERE event = 'transaction'
GROUP BY dt ;
{% endhighlight %}

We will be updating our [Analytics Cookbook] [analytics-cookbook] to use the `event` field to simplify queries where possible.

## 2. Event IDs

As stated above, the Snowplow ETL now attaches a unique ID to each event - specifically a [type 4 UUID] [type4-uuid]. This new `event_id` is much more unique than the existing `txn_id` field, which is a short random number set in the JavaScript tracker (`txn_id` is currently unused, but we may eventually use it to check for duplicate events `txn_id` introduced prior to the ETL, see [issue 24] [issue-24] for more details).

You can use the new `event_id` field to uniquely identify individual events in your event store, and of course to count distinct events. For example, to count the number of page views by day, we simply execute the following query:

{% highlight sql %}
SELECT
dt,
COUNT(event_id)
FROM events
WHERE event = 'page_view'
GROUP BY dt ;
{% endhighlight %}

We will be updating our [Analytics Cookbook] [analytics-cookbook] to use `event_id` in any examples which currently (erroneously) use `txn_id`.

## 3. On-page activity tracking

In this release of the JavaScript tracker we have deprecated the old (undocumented) `setHeartBeatTimer()` inherited from `piwik.js`, and introduced a new function,
`enableActivityTracking(minimumVisitLength, heartBeatDelay)`.

With activity tracking enabled, "page pings" are sent to Snowplow every `heartBeatDelay` seconds, as long as the visitor remains active (moving the mouse, clicking etc) on the page. Page pings are not sent until the `minimumVisitLength` seconds have elapsed.

Here is an example configuration:

{% highlight javascript %}
_snaq.push(['enableActivityTracking', 10, 10]); // Ping every 10 seconds after 10 seconds
{% endhighlight %}

This is still an experimental feature - but it should provide some interesting data to start to explore page residency, true bounce rates and so on.

Please note that enabling activity tracking can **significantly** increase the number of Snowplow events generated, especially with a short `heartBeatDelay`.

## 4. And the rest

The rest of the changes in this release are much smaller, being either bug fixes or small preparatory features for future releases:

### Ad impression tracking bug fix

Many thanks to [Alan Z] [talkspoon] @ [VeryCD] [verycd] for spotting a bug in the `trackImpression()` method, which was stopping ad impressions from being logged. This is now fixed.

### ETL resilient against corrupted querystrings

We had a problem with two historic versions of the JavaScript tracker, 0.8.0 and 0.8.1, where querystrings were being transmitted to the Snowplow collector unescaped. These "corrupted" querystrings caused the ETL process to error and die.

We have updated the ETL process so that events with corrupted querystrings can be processed without error: these rows are stored as Snowplow events, but of course with most of the standard fields empty.

### snowpak.sh combine-only option

To make it easier to hack on the JavaScript tracker, we have updated the build script, `snowpak.sh`, so that it has a "combine-only" option. If you set the combine-only flag on the command line, then the minification step will **not** be run, and debug code will left in. This is helpful for local testing when you want to debug the JavaScript in its pre-minified form.

Here are the updated usage options for the `snowpak.sh` script:

    Usage: ./snowpak.sh [options]

    Specific options:
      -y PATH             path to YUICompressor 2.4.2 *
      -c                  combine only (no minification or removing debug)

    * or set env variable YUI_COMPRESSOR_PATH instead

    Common options:
      -h                  Show this message

### attachUserId(boolean)

The JavaScript tracker has a new method, `attachUserId(boolean)`, which can be used to stop the tracker from sending a `&uid=xxx` parameter. By default, the JavaScript tracker sends the user ID to the collector via this `uid` parameter; you can now disable this by calling `attachUserId()` like so:

{% highlight javascript %}
_snaq.push(['attachUserId', false]); // Don't attach &uid=xxx to the querystring
{% endhighlight %}

This function is not of immediate use - but it will be an important part of the setup for using the new Clojure Collector, which we are currently working on.

### IP address override

Finally, we have added the ability to override the IP address by passing in an `ip=` parameter on the querystring.

This one is a little confusing, as there is no capability in the JavaScript tracker to attach an IP address to the querystring (because JavaScript cannot know the user's IP address). Rather, we have added this IP address override ability to cater for future server-side trackers and collectors which _do_ know the user's IP address and want to append it to the querystring themselves.

## Getting help

That's it! If you have any problems with Snowplow version 0.6.5, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[events-screenshot]: /assets/img/blog/2012/event_and_event_id_fields.png
[talkspoon]: https://github.com/talkspoon
[verycd]: http://www.verycd.com

[type4-uuid]: http://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_.28random.29
[analytics-cookbook]: /analytics/index.html

[issue-24]: https://github.com/snowplow/snowplow/issues/24

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
