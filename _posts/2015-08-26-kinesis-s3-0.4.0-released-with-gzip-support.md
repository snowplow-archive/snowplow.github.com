---
layout: post
title: Kinesis S3 0.4.0 released with gzip support
title-short: Kinesis S3 0.4.0 with gzip support
tags: [snowplow, kinesis, s3, amazon s3, real-time]
author: Josh
category: Releases
---

We are pleased to announce the release of Kinesis S3 version 0.4.0. Many thanks to [Kacper Bielecki][kazjote] from Avari for his contribution to this release!

Table of contents:

1. [gzip support](/blog/2015/08/26/snowplow-kinesis-s3-0.4.0-released-with-gzip-support#gzip-support)
2. [Infinite loops](/blog/2015/08/26/snowplow-kinesis-s3-0.4.0-released-with-gzip-support#loops)
3. [Safer record batching](/blog/2015/08/26/snowplow-kinesis-s3-0.4.0-released-with-gzip-support#control)
4. [Bug fixes](/blog/2015/08/26/snowplow-kinesis-s3-0.4.0-released-with-gzip-support#bug-fixes)
5. [Upgrading](/blog/2015/08/26/snowplow-kinesis-s3-0.4.0-released-with-gzip-support#upgrading)
6. [Getting help](/blog/2015/08/26/snowplow-kinesis-s3-0.4.0-released-with-gzip-support#help)

<!--more-->

<h2 id="gzip-support">1. gzip support</h2>

Kinesis S3 now supports [gzip][gzip] as a second storage/compression option for the files it writes out to S3. Using this format, each record is treated as a byte array containing a UTF-8 encoded string (whether CSV, JSON or TSV). The records are then written to files as strings, one record per line and gzipped.

Big thanks go to [Kacper Bielecki][kazjote] for contributing this storage option! For more information please see [Kacper's pull request][pr-43].

Snowplow users please note: you must continue to use the LZO format for storing raw Snowplow events.

<h2 id="loops">2. Infinite loops</h2>

With the recent [Amazon S3 outage] [hn-s3-outage] in us-east-1, an issue was discovered where Kinesis S3 was unable to recover the connection to S3 even after the service was restored. This resulted in an infinite loop of failures to `PUT` any records into S3. To fix this, we had to manually restart all Kinesis S3 instances.

To prevent this recurring, Kinesis S3 now supports a failure timeout: if failures extend beyond this timeout, then Kinesis S3 will **self-terminate**. You can specify this timeout in the configuration file:

{% highlight json %}
// Failure allowed for one minute
sink.s3.max-timeout: 60000
{% endhighlight %}

This feature can be neatly coupled with an automated restart wrapper to ensure that the application will recover without human intervention.

<h2 id="control">3. Safer record batching</h2>

In the [previous release post][previous-rel] we discussed potential out-of-memory problems for this application. To improve things further we have implemented a new configuration option: `max-records` to specify how many records the application is allowed to read per `GetRecords` call. This helps prevent the application from suddenly exceeding the Heap with sudden traffic spikes.

{% highlight json %}
// Amount of records per GetRecords call
sink.kinesis.in.max-records: 10000
{% endhighlight %}

Unless you are experiencing out-of-memory issues, we recommend using the default of `10000`. Please note that `10000`, for the moment, is also the maximum setting.  If set any higher an `InvalidArgumentException` [will be thrown][aws-exception].

<h2 id="bug-fixes">4. Bug fixes</h2>

We have also:

* Fixed a bug where the Snowplow Tracker was using the wrong event type for `write_failures` ([#45][45])
* Added logging for `OutOfMemoryErrors` so it is easier to debug in the future ([#29][29])

<h2 id="upgrading">5. Upgrading</h2>

The Kinesis S3 application is available in a single zip file here:

    http://bintray.com/artifact/download/snowplow/snowplow-generic/kinesis_s3_0.4.0.zip

Upgrading will require various configuration changes to the application's HOCON configuration file:

* Add `max-records` to the `sink.kinesis.in` section and configure how many records you want the application to get at any one time
* Add `format` to the `sink.s3` section and select either `lzo` or `gzip` to control what format files are written in
* Add `max-timeout` to the `sink.s3` section and enter the maximum timeout in ms for the application

And that's it - you should now be fully upgraded!

<h2 id="help">6. Getting help</h2>

For more details on this release, please check out the [Kinesis S3 0.4.0 release][0.4.0-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[kazjote]: https://github.com/kazjote
[gzip]: http://www.gzip.org/
[pr-43]: https://github.com/snowplow/kinesis-s3/pull/43
[29]: https://github.com/snowplow/kinesis-s3/issues/29
[45]: https://github.com/snowplow/kinesis-s3/issues/45
[previous-rel]: http://snowplowanalytics.com/blog/2015/07/07/kinesis-s3-0.3.0-released/
[issues]: https://github.com/snowplow/kinesis-s3/issues
[talk-to-us]: https://github.com/snowplow/kinesis-s3/wiki/Talk-to-us
[0.4.0-release]: https://github.com/snowplow/kinesis-s3/releases/tag/0.4.0
[aws-exception]: http://docs.aws.amazon.com/AWSJavaSDK/latest/javadoc/com/amazonaws/services/kinesis/model/GetRecordsRequest.html#getLimit()

[hn-s3-outage]: https://news.ycombinator.com/item?id=10033172
