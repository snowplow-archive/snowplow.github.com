---
layout: post
shortenedlink: Snowplow 67 released
title: Snowplow 67 Bohemian Waxwing released
tags: [snowplow, kinesis, real-time]
author: Josh
category: Releases
---

We are pleased to announce the release of Snowplow 67, Bohemian Waxwing. This release brings a host of upgrades to our real-time [Kinesis][kinesis] pipeline as well as the embedding of Snowplow Tracking into said pipeline.

Table of contents:

1. [Embedded Snowplow Tracking](/blog/2015/07/06/snowplow-r67-bohemian-waxwing-released#snowplow-tracking)
2. [Handling big events](/blog/2015/07/06/snowplow-r67-bohemian-waxwing-released#handling-big-events)
3. [Other changes](/blog/2015/07/06/snowplow-r67-bohemian-waxwing-released#other)
4. [Upgrading](/blog/2015/07/06/snowplow-r67-bohemian-waxwing-released#upgrading)
5. [Getting help](/blog/2015/07/06/snowplow-r67-bohemian-waxwing-released#help)

![bohemian-waxwing][bohemian-waxwing]

<!--more-->

<h2><a name="snowplow-tracking">1. Embedded Snowplow Tracking</a></h2>

Both Scala Kinesis Enrich and Kinesis Elasticsearch Sink now have the ability to record events from within the application themselves.  These events include a `heartbeat` which is sent every 5 minutes so we know that the application is still alive and kicking, events for each `failure` in pushing events to the Kinesis Streams, S3 or Elasticsearch and `initilization`/`shutdown` events.

<h2><a name="handling-big-events">2. Handling Big Events</a></h2>

Previously the Scala Stream Collector was unable to handle any events that exceeded the maximum byte limit of the Kinesis Stream.  So large POST payloads simply had to be discarded due to the inability to actually send them on.  The collector now has the ability to break apart large event payloads into smaller manageable events which can then be sent to the Kinesis Stream, reducing data loss in the case of big event payloads.  However with the increase of record put size to 1MB from 50kB in Kinesis it is unlikely to be too big of an issue anymore!

Unfortunately if the event was sent via GET then we still cannot do anything about it as there is no way to split a single event as of yet!

With the ability to split large events we have also included a `bad` output stream with the collector.  So events that exceed these limitations will be logged with an error and the total byte size, then outputted to `stderr` or to a `bad` Kinesis stream.

<h2><a name="other">3. Other changes</a></h2>

We have also:

* Increased the maximum size of a Kinesis record put to 1MB from 50kB ([#1753][1753], [#1736][1736])
* Fixed a bug whereby the Kinesis Elasticsearch Sink could hang without ever shutting down ([#1743][1743])
* Fixed a bug which prevented Scala Kinesis Enrich from downloading from S3 URI's ([#1645][1645])
* Fixed a bug in Scala Kinesis Enrich where the `etl_tstamp` was not correctly formatted ([#1842][1842])

<h2><a name="upgrading">4. Upgrading</a></h2>

The Kinesis apps for r67 Bohemian Waxwing are now all available in a single zip file here:

    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_kinesis_r67_bohemian_waxwing.zip

Upgrading will require various configuration changes to each of the three applications:

<h3>Scala Stream Collector</h3>

* Change `collector.sink.kinesis.stream.name` -> `collector.sink.kinesis.stream.good` in the HOCON.
* Add `collector.sink.kinesis.stream.bad` to the HOCON.

<h3>Scala Kinesis Enrich</h3>

* If you want to include Snowplow Tracking for this application please append the following:
  - This is a wholly optional section, if you do not want Tracking to occur simply do not add this to your HOCON.

{% highlight bash %}
enrich {
    
    ...

    monitoring {
        snowplow {
            collector-uri: "{{collectorUri}}"
            collector-port: 80
            app-id: "{{enrichAppName}}"
            method: "GET"
        }
    }
}
{% endhighlight %}

<h3>Kinesis Elasticsearch Sink</h3>

* Add `max-timeout` to the `elasticsearch` fields.
* Merge `location` fields into the `elasticsearch` section.
* If you want to include Snowplow Tracking for this application please append the following:
  - This is a wholly optional section, if you do not want Tracking to occur simply do not add this to your HOCON.

{% highlight bash %}
enrich {
    
    ...

    monitoring {
        snowplow {
            collector-uri: "{{collectorUri}}"
            collector-port: 80
            app-id: "{{enrichAppName}}"
            method: "GET"
        }
    }
}
{% endhighlight %}

And that's it - you should now be fully upgraded!

<h2><a name="help">5. Getting help</a></h2>

For more details on this release, please check out the [r67 Bohemian Waxwing][r67-release] on GitHub. 

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[bohemian-waxwing]: /assets/img/blog/2015/07/bohemian-waxwing.jpg

[kinesis]: http://aws.amazon.com/kinesis/

[1645]: https://github.com/snowplow/snowplow/issues/1645
[1743]: https://github.com/snowplow/snowplow/issues/1743
[1842]: https://github.com/snowplow/snowplow/issues/1842

[r67-release]: https://github.com/snowplow/snowplow/releases/tag/r67-bohemian-waxwing
[wiki]: https://github.com/snowplow/snowplow/wiki
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
