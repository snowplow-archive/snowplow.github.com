---
layout: post
shortenedlink: Snowplow 67 released
title: Snowplow 67 Bohemian Waxwing released
tags: [snowplow, kinesis, real-time]
author: Josh
category: Releases
---

We are pleased to announce the release of Snowplow 67, Bohemian Waxwing. This release brings a host of upgrades to our real-time [Kinesis][kinesis] pipeline as well as the embedding of Snowplow Tracking into this pipeline.

Table of contents:

1. [Embedded Snowplow Tracking](/blog/2015/07/13/snowplow-r67-bohemian-waxwing-released#snowplow-tracking)
2. [Handling outsized event payloads](/blog/2015/07/13/snowplow-r67-bohemian-waxwing-released#handling-outsized-event-payloads)
3. [More informative bad rows](/blog/2015/07/13/snowplow-r67-bohemian-waxwing-released#timestamps)
4. [Improved Vagrant VM](/blog/2015/07/13/snowplow-r67-bohemian-waxwing-released#vm)
5. [New Kinesis-S3 repository](/blog/2015/07/13/snowplow-r67-bohemian-waxwing-released#kinesis-s3)
6. [Other changes](/blog/2015/07/13/snowplow-r67-bohemian-waxwing-released#other)
7. [Upgrading](/blog/2015/07/13/snowplow-r67-bohemian-waxwing-released#upgrading)
8. [Getting help](/blog/2015/07/13/snowplow-r67-bohemian-waxwing-released#help)

![bohemian-waxwing][bohemian-waxwing]

<!--more-->

<h2 id="snowplow-tracking">1. Embedded Snowplow tracking</h2>

Both Scala Kinesis Enrich and Kinesis Elasticsearch Sink now have the ability to record Snowplow events from within the application themselves. These events include a `heartbeat` which is sent every 5 minutes so we know that the application is still alive and kicking, events for each `failure` in pushing events to the Kinesis streams or Elasticsearch and `initialization` and `shutdown` events.

Adding Snowplow tracking to our Kinesis applications is exciting for two reasons:

1. It is the first step towards Snowplow becoming "self-hosting", meaning that we can use one instance of Snowplow to monitor a second instance of Snowplow
2. It is an opportunity to start exploring how Snowplow can be used for systems-level monitoring, alongside our existing application-level use cases

<h2 id="handling-outsized-event-payloads">2. Handling Outsized Event Payloads</h2>

Previously the Scala Stream Collector was unable to handle any events that exceeded the maximum byte limit of the Kinesis Stream.  So large POST payloads simply had to be discarded due to the inability to actually send them on.  The collector now has the ability to break apart large event payloads into smaller manageable events which can then be sent to the Kinesis Stream, reducing data loss in the case of big event payloads.  However with the increase of record put size to 1MB from 50kB in Kinesis it is unlikely to be too big of an issue anymore!

With the ability to split large events we have also included a `bad` output stream with the collector.  So events that exceed these limitations will be logged with an error and the total byte size, then outputted to `stderr` or to a `bad` Kinesis stream.

<h2 id="timestamps">3. More informative bad rows</h2>

All the Kinesis apps are capable of emitting bad rows corresponding to failed events. These bad rows had a `line` field, containing the body of the failed event, and an `errors` field, containing a non-empty list of problems with the event. Bohemian Waxwing adds a `timestamp` field containing the time at which the event was failed.

This makes it easier to monitor the progress of applications which consume failed events; it also makes it easier to analyze these bad rows in Elasticsearch/Kibana.

<h2 id="vm">4. Improved Vagrant VM</h2>

Building the Snowplow apps using `sbt assembly` in the [Vagrant][vagrant] virtual machine involves reading a lot of files. To speed up this process, we have added comments to the project's Vagrantfile indicating how to use [NFS][nfs] and how to allow the VM to use multiple cores.

<h2 id="kinesis-s3">5. New Kinesis-S3 repository</h2>

Since the Kinesis S3 Sink is not Snowplow-specific but can be used to move arbitrary data from Kinesis to S3, we have moved it from the main Snowplow repo into a [repository of its own][kinesis-s3].

<h2 id="other">6. Other changes</h2>

We have also:

* Increased the maximum size of a Kinesis record put to 1MB from 50kB ([#1753][1753], [#1736][1736])
* Fixed a bug whereby the Kinesis Elasticsearch Sink could hang without ever shutting down ([#1743][1743])
* Fixed a bug which prevented Scala Kinesis Enrich from downloading from S3 URI's ([#1645][1645])
* Fixed a bug in Scala Kinesis Enrich where the `etl_tstamp` was not correctly formatted ([#1842][1842])
* Fixed a race condition in Scala Kinesis Enrich which caused the app to attempt to send too many records at once ([#1756][1756])
* Ensured that if Scala Kinesis Enrich fails to download the MaxMind database, it will exit immediately rather than attempting to look up IP addresses from a nonexistent file ([#1711][1711])
* Made the Kinesis Elasticsearch Sink exit immediately if the bad stream does not exist rather than waiting until the first bad event ([#1677][1677])
* Started logging all bad rows in Scala Kinesis Enrich to simplify debugging ([#1722][1722])

<h2 id="upgrading">7. Upgrading</h2>

The Kinesis apps for r67 Bohemian Waxwing are now all available in a single zip file here:

    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_kinesis_r67_bohemian_waxwing.zip

Upgrading will require various configuration changes to each of the three applications:

<h3>Scala Stream Collector</h3>

* Change `collector.sink.kinesis.stream.name` -> `collector.sink.kinesis.stream.good` in the HOCON.
* Add `collector.sink.kinesis.stream.bad` to the HOCON.

<h3>Scala Kinesis Enrich</h3>

* If you want to include Snowplow tracking for this application please append the following:
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
sink {
    
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

<h2 id="help">8. Getting help</h2>

For more details on this release, please check out the [r67 Bohemian Waxwing][r67-release] on GitHub. 

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[bohemian-waxwing]: /assets/img/blog/2015/07/bohemian-waxwing.jpg

[kinesis]: http://aws.amazon.com/kinesis/
[vagrant]: https://www.vagrantup.com/
[nfs]: https://en.wikipedia.org/wiki/Network_File_System
[kinesis-s3]: https://github.com/snowplow/kinesis-s3

[1645]: https://github.com/snowplow/snowplow/issues/1645
[1677]: https://github.com/snowplow/snowplow/issues/1677
[1711]: https://github.com/snowplow/snowplow/issues/1711
[1722]: https://github.com/snowplow/snowplow/issues/1722
[1743]: https://github.com/snowplow/snowplow/issues/1743
[1756]: https://github.com/snowplow/snowplow/issues/1756
[1842]: https://github.com/snowplow/snowplow/issues/1842

[r67-release]: https://github.com/snowplow/snowplow/releases/tag/r67-bohemian-waxwing
[wiki]: https://github.com/snowplow/snowplow/wiki
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
