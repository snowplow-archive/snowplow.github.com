---
layout: post
title: Snowplow 67 Bohemian Waxwing released
title-short: Snowplow 67 Bohemian Waxwing
tags: [snowplow, kinesis, real-time]
author: Josh
category: Releases
---

We are pleased to announce the release of Snowplow 67, Bohemian Waxwing. This release brings a host of upgrades to our real-time [Amazon Kinesis][kinesis] pipeline as well as the embedding of Snowplow tracking into this pipeline.

Table of contents:

1. [Embedded Snowplow tracking](/blog/2015/07/13/snowplow-r67-bohemian-waxwing-released#snowplow-tracking)
2. [Handling outsized event payloads](/blog/2015/07/13/snowplow-r67-bohemian-waxwing-released#handling-outsized-event-payloads)
3. [More informative bad rows](/blog/2015/07/13/snowplow-r67-bohemian-waxwing-released#timestamps)
4. [Improved Vagrant VM](/blog/2015/07/13/snowplow-r67-bohemian-waxwing-released#vm)
5. [New Kinesis S3 repository](/blog/2015/07/13/snowplow-r67-bohemian-waxwing-released#kinesis-s3)
6. [Other changes](/blog/2015/07/13/snowplow-r67-bohemian-waxwing-released#other)
7. [Upgrading](/blog/2015/07/13/snowplow-r67-bohemian-waxwing-released#upgrading)
8. [Getting help](/blog/2015/07/13/snowplow-r67-bohemian-waxwing-released#help)

![bohemian-waxwing][bohemian-waxwing]

<!--more-->

<h2 id="snowplow-tracking">1. Embedded Snowplow tracking</h2>

Both Scala Kinesis Enrich and Kinesis Elasticsearch Sink now have the ability to record Snowplow events from within the applications themselves. These events include:

* A `heartbeat` which is sent every 5 minutes so we know that the app is still alive-and-kicking
* Application `warning` events, e.g. if no enrichment configurations were found by Scala Kinesis Enrich
* Events for each `failure` in pushing events to the Kinesis streams or Elasticsearch
* Application `initialization` and `shutdown` events

Adding Snowplow tracking to our Kinesis applications is exciting for two reasons:

1. It is the first step towards Snowplow becoming "self-hosting", meaning that we can use one instance of Snowplow to monitor a second instance of Snowplow. "Dog-fooding" Snowplow in this way is essential to finding and fixing bugs in Snowplow faster
2. It is an opportunity to start exploring how Snowplow can be used for effective systems-level monitoring, alongside our existing application-level use cases

Note that so far Snowplow tracking has not yet been added to the Scala Stream Collector; this will be added in a subsequent release.

<h2 id="handling-outsized-event-payloads">2. Handling outsized event payloads</h2>

Previously the Scala Stream Collector was unable to handle events that exceeded the maximum byte limit of a Kinesis stream: large `POST` payloads, for example, were simply discarded due to the inability to write them to Kinesis. With this release, the collector can now "break apart" outsized payloads of multiple events into smaller payloads which will fit into a Kinesis stream;

Combine this with the recent increase in allowed record `PUT` size for Kinesis from 50kB to 1MB and there should be very few scenarios now when an event payload has to be discarded for being outsized.

This said, at Snowplow we strongly believe that any event processing component which _could_ encounter processing failures (however rare) should have an "stderr" output to record those failures. To accomplish this, Bohemian Waxwing adds a `bad` output stream to the collector. As a first use case for this new stream, outsized payloads which cannot be written to Kinesis (essentially single `GET` or `POST` events which are larger than 1MB) will be written to the `bad` stream with the error and the total size in bytes.

<h2 id="timestamps">3. More informative bad rows</h2>

All the Kinesis apps are capable of emitting bad rows corresponding to failed events. Previously these bad rows only had a `line` field, containing the body of the failed event, plus an `errors` field, containing a non-empty list of problems with the event. In Bohemian Waxwing we add a `timestamp` field containing the time at which the event was failed.

This makes it easier to monitor the progress of applications which consume failed events; it also makes it easier to analyze these bad rows in Elasticsearch/Kibana.

<h2 id="vm">4. Improved Vagrant VM</h2>

Building the Snowplow apps using `sbt assembly` in the [Vagrant][vagrant] virtual machine is a very I/O intensive operation. To speed up this process, we have added comments to the project's Vagrantfile indicating how to use [NFS][nfs] and how to allow the VM to use multiple cores.

<h2 id="kinesis-s3">5. New Kinesis S3 repository</h2>

Since the Kinesis S3 Sink is not Snowplow-specific but can be used to mirror arbitrary data from Kinesis to S3, we have moved it from the main Snowplow repo into a [repository of its own][kinesis-s3]. There have been two releases of Kinesis S3 since extracting it into its own repo: [0.2.1] [kinesis-s3-021] and [0.3.0] [kinesis-s3-030].

<h2 id="other">6. Other changes</h2>

We have also:

* Increased the maximum size of a Kinesis record put to 1MB from 50kB ([#1753][1753], [#1736][1736])
* Fixed a bug where the Kinesis Elasticsearch Sink could hang without ever shutting down ([#1743][1743])
* Fixed a bug which prevented Scala Kinesis Enrich from downloading from URIs using the `s3://` scheme ([#1645][1645])
* Fixed a bug in Scala Kinesis Enrich where the `etl_tstamp` was not correctly formatted ([#1842][1842])
* Fixed a nasty race condition in Scala Kinesis Enrich which caused the app to attempt to send too many records at once ([#1756][1756])
* Ensured that if Scala Kinesis Enrich fails to download the MaxMind database, it will exit immediately rather than attempting to look up IP addresses from a non-existent file ([#1711][1711])
* Made the Kinesis Elasticsearch Sink exit immediately if the bad stream does not exist, rather than waiting until the first bad event occurs, as before ([#1677][1677])
* Started logging all bad rows in Scala Kinesis Enrich to simplify debugging ([#1722][1722])

<h2 id="upgrading">7. Upgrading</h2>

The Kinesis apps for r67 Bohemian Waxwing are now all available in a single zip file here:

    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_kinesis_r67_bohemian_waxwing.zip

Upgrading will require various configuration changes to each of the three applications' HOCON configuration files:

<h3>Scala Stream Collector</h3>

* Change `collector.sink.kinesis.stream.name` to `collector.sink.kinesis.stream.good` in the HOCON
* Add `collector.sink.kinesis.stream.bad` to the HOCON

<h3>Scala Kinesis Enrich</h3>

If you want to include Snowplow tracking for this application please append the following:

{% highlight json %}
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

Note that this is a wholly optional section; if you do not want to send application events to a second Snowplow instance, simply do not add this to your configuration file.

For a complete example, see our [`config.hocon.sample` file] [ske-sample-hocon].

<h3>Kinesis Elasticsearch Sink</h3>

* Add `max-timeout` into the `elasticsearch` fields
* Merge `location` fields into the `elasticsearch` section
* If you want to include Snowplow Tracking for this application please append the following:

{% highlight json %}
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

Again, note that Snowplow tracking is a wholly optional section.

For a complete example, see our [`config.hocon.sample` file] [kes-sample-hocon].

And that's it - you should now be fully upgraded!

<h2 id="help">8. Getting help</h2>

For more details on this release, please check out the [r67 Bohemian Waxwing][r67-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[bohemian-waxwing]: /assets/img/blog/2015/07/bohemian-waxwing.jpg

[kinesis]: http://aws.amazon.com/kinesis/
[vagrant]: https://www.vagrantup.com/
[nfs]: https://en.wikipedia.org/wiki/Network_File_System
[kinesis-s3]: https://github.com/snowplow/kinesis-s3
[kinesis-s3-021]: https://github.com/snowplow/kinesis-s3/releases/tag/0.2.1
[kinesis-s3-030]: /blog/2015/07/07/kinesis-s3-0.3.0-released/

[1645]: https://github.com/snowplow/snowplow/issues/1645
[1677]: https://github.com/snowplow/snowplow/issues/1677
[1711]: https://github.com/snowplow/snowplow/issues/1711
[1722]: https://github.com/snowplow/snowplow/issues/1722
[1743]: https://github.com/snowplow/snowplow/issues/1743
[1756]: https://github.com/snowplow/snowplow/issues/1756
[1842]: https://github.com/snowplow/snowplow/issues/1842

[ske-sample-hocon]: https://raw.githubusercontent.com/snowplow/snowplow/master/3-enrich/scala-kinesis-enrich/src/main/resources/config.hocon.sample
[kes-sample-hocon]: https://raw.githubusercontent.com/snowplow/snowplow/master/4-storage/kinesis-elasticsearch-sink/src/main/resources/config.hocon.sample

[r67-release]: https://github.com/snowplow/snowplow/releases/tag/r67-bohemian-waxwing
[wiki]: https://github.com/snowplow/snowplow/wiki
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
