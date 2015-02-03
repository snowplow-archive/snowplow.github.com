---
layout: post
shortenedlink: Snowplow 60 released
title: Snowplow 60 Bee Hummingbird released
tags: [snowplow, streams, kinesis, s3, thrift]
author: Fred
category: Releases
---

We are happy to announce the release of Snowplow 60! Our sixtieth release focuses on the Snowplow Kinesis flow, and includes:

1. A new Kinesis "sink app" that reads the Scala Stream Collector's Kinesis stream of raw events and stores these raw events in Amazon S3 in an optimized format
2. An updated version of our Hadoop Enrichment process tgat can read the events stored in S3 by the new Kinesis sink app and enrich them

Together, these two features let you robustly archive your Kinesis event stream in S3, and process and re-process it at will using our tried-and-tested Hadoop Enrichment process. Huge thanks to community member [Phil Kallos][pkallos] from Popsugar for his contributions to this release!

_Up until now, all Snowplow releases have used [semantic versioning][semantic-versioning]. We will continue to use semantic versioning for Snowplow's many constituent applications and libraries, but our releases of [the Snowplow platform as a whole][repo] will be known by their release number plus a codename. This is release 60; the codenames for 2015 will be birds in ascending order of size, starting today with the [Bee Hummingbird][bee-hummingbird]._

The rest of this post will cover the following topics:

1. [The Kinesis LZO S3 Sink](/blog/2015/02/xx/snowplow-60-bee-hummingbird-released/#s3-sink)
2. [Support for POSTs and webhooks in the Scala Stream Collector](/blog/2015/02/xx/snowplow-60-bee-hummingbird-released/#ssc)
3. [Self-describing Thrift](/blog/2015/02/xx/snowplow-60-bee-hummingbird-released/#pingdom)
4. [Scala Stream Collector no longer decodes URLs](/blog/2015/02/xx/snowplow-60-bee-hummingbird-released/#url-decoding)
5. [Upgrading](/blog/2015/02/xx/snowplow-60-bee-hummingbird-released/#upgrading)
6. [Getting help](/blog/2015/02/xx/snowplow-60-bee-hummingbird-released/#help)

<!--more-->

<h2><a name="s3-sink">1. The Kinesis LZO S3 Sink</a></h2>

The Scala Stream Collector writes Snowplow raw events in a Thrift format to a Kinesis stream. The new Kinesis LZO S3 Sink is a Kinesis app which reads records from a stream, compresses them using [splittable LZO][splittable-lzo] and writes the compressed files to [S3][s3]. Each `.lzo` file has a corresponding `.lzo.index` file containing the byte offsets for the LZO blocks, so that the blocks can be processed in parallel using Hadoop.

In fact this new sink is not limited to serialized Snowplow Thrift records - it will work equally well for any Kinesis record.

To accompany this new sink, we have updated the batch-based Hadoop Enrichment process so that it can now read LZO-compressed Thrift binary records. This means that you can potentially run both the Kinesis and Hadoop Enrichment processes off the same Kinesis stream. To use this feature, just set the collector_format field in the EmrEtlRunner's YAML configuration file to "thrift".

You can see the project [here][s3-sink].

For more information on setting up the Kinesis LZO S3 Sink, please see these wiki pages:

* [Setup guide][s3-sink-setup]
* [Technical documentation][s3-sink-techdocs]

<h2><a name="ssc">2. Support for POSTs and webhooks in the Scala Stream Collector</a></h2>

The Scala Stream Collector was previously limited to standard `GET` requests of the format historically sent by Snowplow trackers. From this release `POST` requests containing one or more events are now supported too. This makes the Scala Stream Collector more suitable for tracking events from mobile trackers, server-side trackers and indeed from [supported webhooks][introducing-webhooks].

Finally, the 1x1 transparent pixel with which the Scala Stream Collector responds to GET requests has been changed to improve compatibility with webmail providers such as Gmail.

<h2><a name="self-describing-thrift">3. Self-describing Thrift</a></h2>

The old `SnowplowRawEvent` Thrift struct output by the Scala Stream Collector didn't contain all of the fields we now require, such as the body of POST requests.

We have therefore replaced it with a new and improved `CollectorPayload` struct. Since we wanted to accept legacy `SnowplowRawEvent` Thrift records and also to possibly add new fields to CollectorPayload in the future, we have implemented self-describing Thrift to ensure that it is always possible to tell which of Snowplow's Thrift IDL files was used to generate a given event. See [this blog post][introducing-self-describing-thrift] for more detail.

<h2><a name="url-decoding">4. Scala Stream Collector no longer decodes URLs</a></h2>

The Scala Stream Collector used to use [Spray's][spray] URI parsing to parse and percent-decode incoming `GET` requests. Unfortunately the enrichment process also percent-decodes querystrings. This meant that incoming non-Base64-encoded events were decoded twice, introducing errors if certain characters were present. This has now been fixed.

<h2><a name="upgrading">5. Upgrading</a></h2>

We are steadily moving over to [Bintray][bintray] for hosting binaries and artifacts which don't have to be hosted on S3. To make deployment easier, the Kinesis apps (Scala Stream Collector, Scala Kinesis Enrich, Kinesis Elasticsearch Sink, and Kinesis S3 Sink) are now all available in a single zip file here:

    https://bintray.com/snowplow/snowplow-generic/snowplow/60/view/files

The new Scala Hadoop Enrich version is available as always on S3:

    s3://snowplow-hosted-assets/3-enrich/hadoop-etl/snowplow-hadoop-etl-0.12.0.jar

Remember to increment the version in the EmrEtlRunner's configuration YAML:

{% highlight yaml %}
  :versions:
    :hadoop_enrich: 0.12.0 # WAS 0.11.0
{% endhighlight %}

If you want to use Hadoop to process the events stored by the Kinesis S3 Sink, you must upgrade your EmrEtlRunner to the latest version, 0.11.0:

{% highlight bash %}
$ git clone git://github.com/snowplow/snowplow.git
$ git checkout 60
$ cd snowplow/3-enrich/emr-etl-runner
$ bundle install --deployment
$ cd ../../4-storage/storage-loader
$ bundle install --deployment
{% endhighlight %}

Finally, you will have to change the collector_format field in the configuration file to "thrift":

{% highlight bash %}
:collector_format: thrift
{% endhighlight %}

<h2><a name="help">6. Getting help</a></h2>

Documentation for the new Kinesis LZO S3 Sink is available on the Snowplow wiki:

* [Setup guide][s3-sink-setup]
* [Technical documentation][s3-sink-techdocs]

If you have any questions or run any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

[pkallos]: https://github.com/pkallos
[s3-sink]: https://github.com/snowplow/snowplow/tree/master/4-storage/kinesis-elasticsearch-sink
[s3-sink-setup]: https://github.com/snowplow/snowplow/wiki/kinesis-s3-sink-setup
[s3-sink-techdocs]: https://github.com/snowplow/snowplow/wiki/kinesis-s3-sink
[introducing-self-describing-thrift]: http://snowplowanalytics.com/blog/2014/12/16/introducing-self-describing-thrift/
[introducing-webhooks]: http://snowplowanalytics.com/blog/2014/11/10/snowplow-0.9.11-released-with-webhook-support/
[spray]: http://spray.io/
[splittable-lzo]: http://blog.cloudera.com/blog/2009/11/hadoop-at-twitter-part-1-splittable-lzo-compression/
[semantic-versioning]: http://semver.org/
[s3]: http://aws.amazon.com/s3/
[bintray]: http://www.bintray.net/
[repo]: https://github.com/snowplow/snowplow
[bee-hummingbird]: http://en.wikipedia.org/wiki/Bee_hummingbird

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
