---
layout: post
title: Kinesis S3 0.3.0 released
title-short: Kinesis S3 0.3.0 released
tags: [snowplow, kinesis, s3, amazon s3, real-time]
author: Josh
category: Releases
---

We are pleased to announce the release of Kinesis S3 version 0.3.0. This release greatly improves the speed, efficiency, and reliability of Snowplow's real-time S3 sink for Kinesis streams.

Table of contents:

1. [Embedded Snowplow tracking](/blog/2015/07/08/snowplow-kinesis-s3-0.3.0-released#snowplow-tracking)
2. [Optimization and efficiency](/blog/2015/07/08/snowplow-kinesis-s3-0.3.0-released#optimization)
3. [More informative bad rows](/blog/2015/07/08/snowplow-kinesis-s3-0.3.0-released#timestamps)
4. [Improved Vagrant VM](/blog/2015/07/08/snowplow-kinesis-s3-0.3.0-released#vm)
5. [Other changes](/blog/2015/07/08/snowplow-kinesis-s3-0.3.0-released#other-changes)
6. [Upgrading](/blog/2015/07/08/snowplow-kinesis-s3-0.3.0-released#upgrading)
7. [Getting help](/blog/2015/07/08/snowplow-kinesis-s3-0.3.0-released#help)

<!--more-->

<h2 id="snowplow-tracking">1. Embedded Snowplow tracking</h2>

This release brings with it the ability to record Snowplow events from within the sink application itself. These events include a `heartbeat` which is sent every 5 minutes so we know that the application is still alive and kicking, an event for each `failure` in pushing events to the Kinesis Streams or S3 and `initialization`/`shutdown` events.

Using Snowplow to monitor the performance of the Kinesis S3 application is of course optional.

<h2 id="optimization">2. Optimization and efficiency</h2>

Release 0.3.0 has also addressed a design flaw which was causing excessive Heap consumption. Essentially events were being stored twice, as a `String` and as a `Byte[Array]`, which at large volumes could result in the application running out of useable memory. An easy fix was just to increase the useable Heap size for the application or to reduce the maximum amount of events before flushing the app.

However we are not fans of workarounds and this fix should hopefully result in much less memory usage, even under very high volumes. That being said you should still give this app a decent amount of Heap to play with! See ticket [#32][32] for more information.

<h2 id="timestamps">3. More informative bad rows</h2>

Kinesis S3 can emit bad rows corresponding to failed events. These bad rows have a `line` field, containing the body of the failed event, and an `errors` field, containing a non-empty list of problems with the event. This release adds a `timestamp` field containing the time at which the event was failed. This makes it easier to monitor the progress of applications which consume failed events; it also makes it easier to query these bad rows in Elasticsearch.

<h2 id="vm">4. Improved Vagrant VM</h2>

Building the Snowplow apps using `sbt assembly` in the [Vagrant][vagrant] virtual machine involves reading a lot of files. To speed up this process, we have added comments to the project's Vagrantfile indicating how to use [NFS][nfs] and how to allow the VM to use multiple cores.

<h2 id="other">5. Other changes</h2>

We have also:

* Unified the logging configuration so that you can control both the application and KCL logging level ([#19][19])
* Made Kinesis S3 exit immediately if the bad stream does not exist, rather than waiting until the first bad event ([#18][18])

<h2 id="upgrading">6. Upgrading</h2>

The Kinesis S3 application is now all available in a single zip file here:

    http://bintray.com/artifact/download/snowplow/snowplow-generic/kinesis_s3_0.3.0.zip

Upgrading will require various configuration changes to the application's HOCON configuration file:

* Add the following for logging control for this application:

{% highlight json %}
logging {
   level: "{{sinkLzoLogLevel}}"
}
{% endhighlight %}

* If you want to include Snowplow Tracking for this application please append the following:

{% highlight json %}
monitoring {
    snowplow {
        collector-uri: "{{collectorUri}}"
        collector-port: 80
        app-id: "{{lzoAppName}}"
        method: "GET"
    }
}
{% endhighlight %}

Note that this is an optional section, if you do not want Snowplow tracking to occur, **do not add** this to your configuration file.

And that's it - you should now be fully upgraded!

<h2 id="help">7. Getting help</h2>

For more details on this release, please check out the [Kinesis S3 0.3.0 release][0.3.0-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[vagrant]: https://www.vagrantup.com/
[nfs]: https://en.wikipedia.org/wiki/Network_File_System
[issues]: https://github.com/snowplow/kinesis-s3/issues
[talk-to-us]: https://github.com/snowplow/kinesis-s3/wiki/Talk-to-us
[0.3.0-release]: https://github.com/snowplow/kinesis-s3/releases/tag/0.3.0

[18]: https://github.com/snowplow/kinesis-s3/issues/18
[19]: https://github.com/snowplow/kinesis-s3/issues/19
[32]: https://github.com/snowplow/kinesis-s3/issues/32
