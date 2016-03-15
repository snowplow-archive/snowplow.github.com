---
layout: post
title-short: Snowplow 78 Great Hornbill
title: "Snowplow 78 Great Hornbill released"
tags: [snowplow, kinesis, real-time]
author: Fred
category: Releases
---

We are pleased to announce the immediate availability of [Snowplow 78 Great Hornbill] [snowplow-release]! This release brings our Kinesis pipeline functionally up-to-date with our Hadoop pipeline, and makes various further improvements to the Kinesis pipeline.

1. [Access to the latest Common Enrich version](/blog/2016/03/15/snowplow-r78-great-hornbill-released#commonEnrich)
2. [Click redirect mode](/blog/2016/03/15/snowplow-r78-great-hornbill-released#redirect)
3. [Configurable cookie name](/blog/2016/03/15/snowplow-r78-great-hornbill-released#cookie)
4. [Randomized partition keys](/blog/2016/03/15/snowplow-r78-great-hornbill-released#partition)
5. [Kinesis Elasticsearch Sink: increased flexibility](/blog/2016/03/15/snowplow-r78-great-hornbill-released#elasticsearchMixedIo)
6. [New format for bad rows](/blog/2016/03/15/snowplow-r78-great-hornbill-released#badRows)
7. [Kinesis Client Library upgrade](/blog/2016/03/15/snowplow-r78-great-hornbill-released#kclUpgrade)
8. [Renaming Scala Kinesis Enrich to Stream Enrich](/blog/2016/03/15/snowplow-r78-great-hornbill-released#rename)
9. [Other improvements](/blog/2016/03/15/snowplow-r78-great-hornbill-released#other)
10. [Upgrading](/blog/2016/03/15/snowplow-r78-great-hornbill-released#upgrading)
11. [Getting help](/blog/2016/03/15/snowplow-r78-great-hornbill-released#help)

![great-hornbill][great-hornbill]

<!--more-->

<h2 id="commonEnrich">1. Access to the latest Common Enrich version</h2>

Both Stream Enrich (the new name for Kinesis Enrich) and Scala Hadoop Enrich (for the batch pipeline) use our shared Common Enrich library for the core event enrichment logic. In this release, we have upgraded Stream Enrich from version 0.15.0 of Common Enrich to version 0.22.0.

This is a huge leap forward for the Kinesis pipeline, making available numerous powerful new features from the last 10 batch pipeline releases, including:

* Validation of unstructured events and custom contexts
* The Cookie Extractor Enrichment
* The Weather Enrichment
* SendGrid webhooks
* The `true_tstamp` field

<h2 id="redirect">2. Click redirect mode</h2>

Like the Clojure Collector, the Scala Stream Collector now has a click redirect mode. This is a JavaScript-free way to track a user pinging a particular URL. An example: suppose your website contains a link to `www.example.com`. To track clicks on this link, change it to point to your collector, and give put the original link target in the querystring (having first URL-encoded it.) The new URL looks like this:

`http://mycollector.net/r/tp2?u=http%3A%2F%2Fwww.example.com`

When a user clicks the link, the collector will redirect them to `www.example.com` and send a URI redirect event to Kinesis. You can add additional parameters to the event simply by adding them to the querystring in accordance with the [Snowplow Tracker Protocol][trackerprotocol]. For instance, to add information that the browser language is American English, change the link URL to:

`http://mycollector.net/r/tp2?u=http%3A%2F%2Fwww.example.com&br_lang=en-US`

<h2 id="cookie">3. Configurable cookie name</h2>

Thanks to the work of [Kacper Bielecki] [kazjote], you can now configure the name of the cookie set by the Scala Stream Collector. You should add the field `name = mycookiename` to the `collector.cookie` section of the configuration.

For compatibility with cookies set by previous versions of the collector, set the name to "sp". Thanks Kacper!

<h2 id="partition">4. Randomized partition keys</h2>

The Scala Stream Collector and Stream Enrich have historically used the IP address of incoming events as the Kinesis [partition key][partitionkey]. This meant that any two events originating from the same IP address would end up in the same shard and would probably be processed in the same order.

For some applications the link between user and shard and the approximate preservation of order would be important, but the Snowplow real-time pipeline never uses it itself. It also has a disadvantage: if the collector is flooded by requests from a single IP address, the events will all end up in the same shard. This would slow down consumers processing the stream no matter how many shards the stream has.

For these reasons we have started generating the partition keys for events randomly. It is possible to retain the old behavior: just add a boolean field `useIpAddressAsPartitionKey` set to `true` to the `collector.sink.kinesis` section of your Scala Stream Collector configuration, and add the same field to the `enriched.streams.out` section of your Stream Enrich configuration.

<h2 id="elasticsearchMixedIo">5. Kinesis Elasticsearch Sink: increased flexibility</h2>

The Kinesis Elasticsearch Sink formerly supported three modes:

* Read from `stdin`, write good events to `stdout` and bad events to `stderr`
* Read from Kinesis, write good events to `stdout` and bad events to `stderr`
* Read from Kinesis, write good events to Elasticsearch and bad events to Kinesis

We have made this much more flexible: it is now possible to read from `stdin` or Kinesis, write good events to `stdout` or Elasticsearch, and write bad events to Kinesis or `stderr`, in any combination. You can also silently drop bad events if you prefer.

To preserve existing behavior, you will have to change the "sink" setting in your configuration file from this:

{% highlight json %}
{
	"sink": "elasticsearch-kinesis"
}
{% endhighlight %}

to this:

{% highlight json %}
{
	"sink": {
		"good": "elasticsearch",
		"bad": "kinesis"
	}
}
{% endhighlight %}

or from this:

{% highlight json %}
{
	"sink": "stdouterr"
}
{% endhighlight %}

to this:

{% highlight json %}
{
	"sink": {
		"good": "stdout",
		"bad": "stderr"
	}
}
{% endhighlight %}

<h2 id="badRows">6. New format for bad rows</h2>

We have updated the format of the bad rows emitted by Scala Stream Collector, Stream Enrich, and Kinesis Elasticsearch Sink: the "errors" field is no longer an array of strings, but instead an array of objects where each object contains both the error message and the level of the error.

An example of a bad row in the new format, generated by feeding Stream Enrich with a malformed Thrift object:

{% highlight json %}
{
  "failure_tstamp": "2016-02-16T09:14:23.574Z",
  "errors": [
    {
      "message": "Error deserializing raw event: Cannot read. Remote side has closed. Tried to read 2 bytes, but only got 1 bytes. (This is often indicative of an internal error on the server side. Please check your server logs.)",
      "level": "error"
    }
  ],
  "line": "cGFjayBteSBib3ggd2l0aCBmaXZlIGRvemVuIGxpcXVvciBqdWdzCg=="
}
{% endhighlight %}

**If you are loading Snowplow bad rows into for example Elasticsearch, please make sure to update all applications which can emit bad rows.**

<h2 id="kclUpgrade">7. Kinesis Client Library upgrade</h2>

Stream Enrich and Kinesis Elasticsearch Sink use the [Kinesis Client Library][kcl] to consume data from Kinesis. We have upgraded to the latest version (1.6.1) of the library, which has important improvements:

* It doesn't silently swallow exceptions
* It uploads the useful "MillisBehindLatest" metric to Amazon CloudWatch. This is helpful when determining whether an application consuming a stream is falling behind

We have also configured the Kinesis Client Library to upload [monitoring information][kclMonitoring] about Stream Enrich to CloudWatch - this feature was previously disabled.

<h2 id="rename">8. Renaming Scala Kinesis Enrich to Stream Enrich</h2>

Scala Kinesis Enrich isn't actually limited to using Kinesis: it can also read from `stdin` and write to `stdout`. In the future we plan on integrating [Apache Kafka][kafka] into this component. Since Scala Kinesis Enrich will actually support multiple different types of stream, we have renamed it to *Stream Enrich*.

<h2 id="other">9. Other improvements</h2>

We have also:

* Specified the UTF-8 character encoding for all string serialization and deserialization operations ([#1963][1963])
* Combined the two thread pools which the Scala Stream Collector used to write to the good stream and the bad stream into a single thread pool ([#2369][2369])
* Reduced the complexity of the algorithm used by Kinesis Elasticsearch Sink to convert enriched event TSVs to JSON ([#1847][1847])
* Fixed an error causing Kinesis Elasticsearch Sink's internal monitoring to use a timestamp for the `failureCount` field of `storage_write_failed` events ([#1951][1951])
* Made the regular expression for schemas used by Kinesis Elasticsearch Sink more permissive, allowing vendors with hyphens ([#1998][1998])

<h2 id="upgrading">10. Upgrading</h2>

The Kinesis apps for R78 Great Hornbill are now all available in a single zip file here:

    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_kinesis_r78_great_hornbill.zip

Upgrading will require the following configuration changes to the applications' individual HOCON configuration files:

<h3>Scala Stream Collector</h3>

Add a `collector.cookie.name` field to the HOCON and set its value to `"sp"`.

Also note that the configuration file no longer supports loading AWS credentials from the classpath using [ClasspathPropertiesFileCredentialsProvider][cpf]. If your configuration looks like this:

{% highlight json %}
{
	"aws": {
		"access-key": "cpf",
		"secret-key": "cpf"
	}
}
{% endhighlight %}

then you should change "cpf" to "default" to use the [DefaultAWSCredentialsProviderChain][default]. You will need to ensure that your credentials are available in one of the places the AWS Java SDK looks. For more information about this, see the [Javadoc][default].

<h3>Kinesis Elasticsearch Sink</h3>

Replace the `sink.kinesis.out` string with an object with two fields:

{% highlight json %}
{
	"sink": {
		"good": "elasticsearch",  # or "stdout"
		"bad": "kinesis"          # or "stderr" or "none"
	}
}
{% endhighlight %}

Additionally, move the `stream-type` setting from the `sink.kinesis.in` section to the `sink` section.

If you are loading Snowplow bad rows into for example Elasticsearch, please make sure to update all applications.

You can see an example of the correct configuration file layout [here][eshoconexample].

<h2 id="help">11. Getting help</h2>

For more details on this release, please check out the [release notes][snowplow-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[great-hornbill]: /assets/img/blog/2016/03/great-hornbill.jpg
[trackerprotocol]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol
[kafka]: http://kafka.apache.org/
[partitionkey]: http://docs.aws.amazon.com/kinesis/latest/dev/key-concepts.html#partition-key
[kazjote]: https://github.com/kazjote
[cpf]: http://docs.aws.amazon.com/AWSJavaSDK/latest/javadoc/com/amazonaws/auth/ClasspathPropertiesFileCredentialsProvider.html
[default]: http://docs.aws.amazon.com/AWSJavaSDK/latest/javadoc/com/amazonaws/auth/DefaultAWSCredentialsProviderChain.html
[snowplow-release]: https://github.com/snowplow/snowplow/releases/r78-great-hornbill
[wiki]: https://github.com/snowplow/snowplow/wiki
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[kcl]:https://github.com/awslabs/amazon-kinesis-client
[kclMonitoring]:http://docs.aws.amazon.com/kinesis/latest/dev/monitoring-with-kcl.html
[changelog]: https://github.com/snowplow/snowplow/blob/master/CHANGELOG
[eshoconexample]: https://github.com/snowplow/snowplow/blob/2eff5a8ad67f1da0506d2d1dd8d142ac41e2e0ed/4-storage/kinesis-elasticsearch-sink/src/main/resources/config.hocon.sample
[1963]: https://github.com/snowplow/snowplow/issues/1963
[2369]: https://github.com/snowplow/snowplow/issues/2369
[1847]: https://github.com/snowplow/snowplow/issues/1847
[1951]: https://github.com/snowplow/snowplow/issues/1951
[1998]: https://github.com/snowplow/snowplow/issues/1998
