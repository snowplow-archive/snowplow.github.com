---
layout: post
shortenedlink: Snowplow 60 released
title: Snowplow 60 released
tags: [snowplow, streams, kinesis, s3, thrift]
author: Fred
category: Releases
---

We are happy to announce the release of Snowplow 60! This release focuses on the Snowplow Kinesis flow, including a new sink created by community member [Phil Kallos][pkallos] which allows you to store binary Thrift records for Snowplow events in S3.

The rest of this post will cover the following topics:

1. [The Kinesis S3 Sink](/blog/2015/xx/xx/snowplow-60-released/#s3-sink)
2. [Support for POSTs and webhooks in the Scala Stream Collector](/blog/2015/xx/xx/snowplow-60-released/#ssc)
3. [Self-describing Thrift](/blog/2015/xx/xx/snowplow-60-released/#pingdom)
4. [Scala Stream Collector no longer decodes URLs](/blog/2015/xx/xx/snowplow-60-released/#url-decoding)
5. [Upgrading](/blog/2015/xx/xx/snowplow-60-released/#upgrading)
6. [Getting help](/blog/2015/xx/xx/snowplow-60-released/#help)


<!--more-->

<h2><a name="s3-sink">1. The Kinesis S3 Sink</a></h2>

The Scala Stream Collector writes Thrift events to a Kinesis stream. The new Kinesis S3 Sink is a Kinesis app which reads Thrift events and compresses them using [splittable LZO][splittable-lzo]. The resulting .lzo and .lzo.index files are then written to [S3][s3].

Phil Kallos contributed another new feature: the batch-based pipeline can now read Thrift binary records, so you can use it to process the output of the Kinesis S3 Sink. Just set the collector_format field in the EmrEtlRunner's YAML configuration file to "thrift".

You can see the project [here][s3-sink].

For more information on setting up the Kinesis S3 Sink, please see these wiki pages:

* [Setup guide][s3-sink-setup]
* [Technical documentation][s3-sink-techdocs]

<h2><a name="ssc">2. Support for POSTs and webhooks in the Scala Stream Collector</a></h2>

The Scala Stream Collector was previously limited to standard GET requests of the format sent by Snowplow trackers. It can now receive POST requests, meaning multiple events can be batched together. It also supports Snowplow webhooks - see [this][introducing-webhooks] blog post for more detail.

Finally, the 1x1 transparent pixel with which the Scala Stream Collector responds to GET requests has been altered to ensure it is stable.

<h2><a name="self-describing-thrift">3. Self-describing Thrift</a></h2>

The old SnowplowRawEvent Thrift struct didn't contain all the fields we are now interested in, such as the body of POST requests. We have therefore replaced it with the new more flexible CollectorPayload struct. Since we wanted to accept legacy SnowplowRawEvent Thrift records and also to possibly add new fields to CollectorPayload in the future, we have implemented self-describing Thrift to ensure that it is always possible to tell which of Snowplow's Thrift IDL files was used to generate a given event. See [this blog post][introducing-self-describing-thrift] for more detail.

<h2><a name="url-decoding">4. Scala Stream Collector no longer decodes URLs</a></h2>

The Scala Stream Collector used to use [Spray's][spray] URI parsing to parse and percent-decode incoming GET requests. Unfortunately the enrichment process also percent-decodes querystrings. This meant that incoming non-base-64-encoded events were decoded twice, introducing errors if certain characters were present. This has now been fixed.

<h2><a name="upgrading">5. Upgrading</a></h2>

We are moving from S3 to [Bintray][bintray] for hosting files. The Kinesis apps (Scala Stream Collector, Scala Kinesis Enrich, Kinesis Elasticsearch Sink, and Kinesis S3 Sink) are available in a single zip file here: https://bintray.com/snowplow/snowplow-generic/snowplow/60/view/files

The new Scala Hadoop Enrich version is available on S3:

    s3://snowplow-hosted-assets/3-enrich/hadoop-etl/snowplow-hadoop-etl-0.12.0.jar

Remember to increment the version in the EmrEtlRunner's configuration YAML:

{% highlight yaml %}
  :versions:
    :hadoop_enrich: 0.11.0 # WAS 0.10.0
{% endhighlight %}

If you want to use Hadoop to process the events stored by the Kinesis S3 Sink, you will have to upgrade your EmrEtlRunner to the latest version, 0.11.0:

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

Documentation for the new S3 sink is available on the Snowplow wiki:

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

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
