---
layout: post
title: Snowplow 0.9.8 released for mobile analytics
title-short: Snowplow 0.9.8
tags: [snowplow, mobile, ios, android, analytics]
author: Alex
category: Releases
---

We are hugely excited to announce the release of the long-awaited Snowplow version 0.9.8, adding event analytics support for iOS and Android applications. Mobile event analytics has been the most requested feature from the Snowplow community for some time, with many users keen to feed their Snowplow data pipeline with events from mobile apps, alongside their existing websites and server software.

![mobile-analytics] [mobile-analytics]

Mobile event analytics is a major step in Snowplow's journey from a web analytics tool to a general-purpose event analytics platform. It doesn't make much sense to silo your company's event streams into separate analytics packages based on whether those events originate on web, mobile or somewhere else; at Snowplow we believe that there is huge value in unifying those disparate event streams into a single event pipeline like Snowplow.

Adding mobile support for Snowplow is really a few different releases:

* Snowplow 0.9.8, which adds POST support to our Clojure Collector and upgrades our Enrichment process to support POST payloads containing multiple events
* A new event tracker for iOS, see today's accompanying [iOS Tracker blog post] [ios-tracker]
* A new event tracker for Android, see today's accompanying [Android Tracker blog post] [android-tracker]
* New mobile-specific JSON Schemas available in Iglu Central, [mobile_context] [mobile-context] and [geolocation_context] [geolocation-context]

Huge thanks to Snowplow intern [Jonathan Almeida] [jonalmeida] for his excellent work on the mobile trackers over the summer!

Below the fold we will cover:

1. [Our updated Clojure Collector](/blog/2014/09/18/snowplow-0.9.8-released-for-mobile-analytics/#clj)
2. [Our updated Enrichment process](/blog/2014/09/18/snowplow-0.9.8-released-for-mobile-analytics/#enrich)
3. [Upgrading](/blog/2014/09/18/snowplow-0.9.8-released-for-mobile-analytics/#upgrading)
4. [Documentation and help](/blog/2014/09/18/snowplow-0.9.8-released-for-mobile-analytics/#help)

<!--more-->

<h2><a name="shredding">1. Our updated Clojure Collector</a></h2>

We have upgraded the Clojure Collector to support POST requests. Batching multiple events in the client and then sending that batch via a POST request is standard operating procedure in mobile analytics, designed to minimize data usage and preserve battery life.

Both the new Android and iOS Trackers can send events via POST; you will also find POST support in the most recent versions of the Python and Ruby Trackers.

As we cannot support POST in the CloudFront Collector, we recommend that Snowplow users wanting to send events from mobile devices switch over to the Clojure Collector. Adding POST support to the Scala Stream Collector is on our roadmap.

<h2><a name="enrich">2. Our updated Enrichment process</a></h2>

We have updated the Hadoop Snowplow Enrichment process to version 0.7.0; the Shredding process is unchanged.

The updated Enrichment process can now handle raw events sent to the updated Clojure Collector via POST. The updated process supports all existing collector formats, but additionally it can now:

1. Validate a log record's POST payload and content-type if set
2. Extract multiple raw events from a POST payload
3. Feed each of those raw events through the rest of the Enrichment process

Read on for upgrading instructions.

<h2><a name="upgrading">3. Upgrading</a></h2>

<div class="html">
<h3><a name="upgrading-emretlrunner">3.1 Updating EmrEtlRunner's configuration</a></h3>
</div>

This release bumps the Hadoop Enrichment process to version **0.7.0**.

In your EmrEtlRunner's `config.yml` file, update your Hadoop enrich job's version to 0.7.0, like so:

{% highlight yaml %}
  :versions:
    :hadoop_enrich: 0.7.0 # WAS 0.6.0
{% endhighlight %}

For a complete example, see our [sample `config.yml` template] [emretlrunner-config-yml].

<div class="html">
<h3><a name="upgrading-collector">3.2 Updating your Clojure Collector</a></h3>
</div>

**Please make sure that you upgrade the Hadoop Enrichment process to 0.7.0 before upgrading your collector.**

This release bumps the Clojure Collector to version **0.7.0**.

To upgrade to this release:

1. Download the new warfile by right-clicking on [this link] [war-download] and selecting "Save As..."
2. Log in to your Amazon Elastic Beanstalk console
3. Browse to your Clojure Collector's application
4. Click the "Upload New Version" and upload your warfile

<div class="html">
<h3><a name="upgrading-redshift">3.3 Updating your Redshift database</a></h3>
</div>

Both of the new trackers send mobile-related context conforming to the [mobile_context] [mobile-context] JSON Schema, as a custom context automatically attached to each event.

If you are running Redshift, you can deploy the `mobile_context` table into your database using this [this script] [mobile-script].

The Android Tracker also optionally sends a geolocation-related context relating to the [geolocation_context] [geolocation-context] JSON Schema; support for this in the iOS Tracker is planned soon.

If you are running Redshift, you can deploy the `mobile_context` table into your database using this [this script] [geolocation-script].

<h2><a name="help">4. Documentation and help</a></h2>

Mobile event analytics represents a major new feature for Snowplow - there are likely to be some initial bugs and issues to iron out, in 0.9.8 itself or indeed in the new trackers. As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

For more details on this release, please check out the [0.9.8 Release Notes] [snowplow-098] on GitHub.

[mobile-analytics]: /assets/img/blog/2014/09/mobile-analytics.png

[ios-tracker]: /blog/2014/09/17/snowplow-ios-tracker-0.1.1-released/
[android-tracker]: /blog/2014/09/17/snowplow-android-tracker-0.1.1-released/
[jonalmeida]: /authors/jonathan.html

[mobile-context]: http://www.iglucentral.com/schemas/com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-0
[geolocation-context]: http://www.iglucentral.com/schemas/com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-0-0

[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample

[war-download]: http://s3-eu-west-1.amazonaws.com/snowplow-hosted-assets/2-collectors/clojure-collector/clojure-collector-0.7.0-standalone.war

[mobile-script]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.snowplowanalytics.snowplow/mobile_context_1.sql
[geolocation-script]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.snowplowanalytics.snowplow/geolocation_context_1.sql

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[snowplow-098]: https://github.com/snowplow/snowplow/releases/0.9.8
