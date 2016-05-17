---
layout: post
title: Snowplow Scala Analytics SDK 0.1.0 released
title-short: Snowplow Scala Analytics SDK 0.1.0
tags: [scala, snowplow, enriched events, spark, aws lambda]
author: Alex
category: Releases
---

We are pleased to announce the release of our first analytics SDK for Snowplow, created for data engineers and data scientists working with Snowplow in Scala.

The [Snowplow Analytics SDK for Scala] [sdk-repo] lets you work with [Snowplow enriched events] [enriched-events] in your Scala event processing, data modeling and machine-learning jobs. You can use this SDK with [Apache Spark] [spark], [AWS Lambda] [lambda], [Apache Flink] [flink], [Scalding] [scalding], [Apache Samza] [samza] and other Scala-compatible data processing frameworks.

Some good use cases for the SDK include:

1. Performing [event data modeling] [event-data-modeling] in Apache Spark as part our Hadoop batch pipeline
2. Developing machine learning models on your event data using Apache Spark (e.g. using [Databricks][databricks] or [Zeppelin on EMR][zeppelin-on-emr])
3. Performing analytics-on-write in AWS Lambda as part of our Kinesis real-time pipeline:

![sdk-usage-img] [sdk-usage-img]

Read on below the jump for:

1. [Overview](/blog/2016/03/23/snowplow-scala-analytics-sdk-0.1.0-released#overview)
2. [The JSON Event Transformer](/blog/2016/03/23/snowplow-scala-analytics-sdk-0.1.0-released#json-event-transformer)
3. [Using the SDK](/blog/2016/03/23/snowplow-scala-analytics-sdk-0.1.0-released#using-the-sdk)
4. [Roadmap](/blog/2016/03/23/snowplow-scala-analytics-sdk-0.1.0-released#roadmap)
5. [Getting help](/blog/2016/03/23/snowplow-scala-analytics-sdk-0.1.0-released#help)

<!--more-->

<h2 id="overview">1. Overview</h2>

The Scala Analytics SDK makes it significantly easier to build applications that consume Snowplow enriched data directly from Kinesis or S3. 

The Snowplow enriched event is a relatively complex TSV string containing self-describing JSONs. Rather than work with this structure directly, Snowplow analytics SDKs ship with *event transformers*, which translate the Snowplow enriched event format into something more convenient for engineers and analysts.

As the Snowplow enriched event format evolves towards a cleaner [Apache Avro] [avro]-based structure, we will be updating this Analytics SDK to maintain compatibility across different enriched event versions.

Working with the Snowplow Scala Analytics SDK therefore has two major advantages over working with Snowplow enriched events directly:

1. The SDK reduces your development time by providing analyst- and developer-friendly transformations of the Snowplow enriched event format
1. The SDK futureproofs your code against new releases of Snowplow which update our enriched event format

Currently the Analytics SDK for Scala ships with one event transformer: the JSON Event Transformer. Let's check this out next.

<h2 id="json-event-transformer">2. The JSON Event Transformer</h2>

The JSON Event Transformer takes a Snowplow enriched event and converts it into a JSON ready for further processing. This transformer was adapted from the code used to load Snowplow events into Elasticsearch in the Kinesis real-time pipeline.

The JSON Event Transformer converts a Snowplow enriched event into a single JSON like so:

{% highlight json %}
{ "app_id":"demo",
  "platform":"web","etl_tstamp":"2015-12-01T08:32:35.048Z",
  "collector_tstamp":"2015-12-01T04:00:54.000Z","dvce_tstamp":"2015-12-01T03:57:08.986Z",
  "event":"page_view","event_id":"f4b8dd3c-85ef-4c42-9207-11ef61b2a46e","txn_id":null,
  "name_tracker":"co","v_tracker":"js-2.5.0","v_collector":"clj-1.0.0-tom-0.2.0",...
{% endhighlight %}

The most complex piece of processing is the handling of the self-describing JSONs found in the enriched event's `unstruct_event`, `contexts` and `derived_contexts` fields. All self-describing JSONs found in the event are flattened into top-level plain (i.e. not self-describing) objects within the enriched event JSON.

For example, if an enriched event contained a `com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1`, then the final JSON would contain:

{% highlight json %}
{ "app_id":"demo","platform":"web","etl_tstamp":"2015-12-01T08:32:35.048Z",
  "unstruct_event_com_snowplowanalytics_snowplow_link_click_1": {
    "targetUrl":"http://www.example.com",
    "elementClasses":["foreground"],
    "elementId":"exampleLink"
  },...
{% endhighlight %}

For more information, check out the [Scala Analytics SDK wiki page][wiki].

<h2 id="using-the-sdk">3. Using the SDK</h2>

<h3 id="installation">3.1 Installation</h3>

The latest version of Snowplow Scala Analytics SDK is 0.1.0, which is cross-built against Scala 2.10.x and 2.11.x.

If you're using SBT, add the following lines to your build file:

{% highlight scala %}
// Resolvers
val snowplowRepo = "Snowplow Analytics" at "http://maven.snplow.com/releases/"

// Dependency
val analyticsSdk = "com.snowplowanalytics" %% "snowplow-scala-analytics-sdk" % "0.1.0"
{% endhighlight %}

Note the double percent (`%%`) between the group and artifactId. This will ensure that you get the right package for your Scala version.

<h3 id="apache-spark-example">3.2 Using from Apache Spark</h3>

The Scala Analytics SDK is a great fit for performing Snowplow [event data modeling] [event-data-modeling] in Apache Spark and Spark Streaming.

Here's the code we use internally for our own data modeling jobs:

{% highlight scala %}
import com.snowplowanalytics.snowplow.analytics.scalasdk.json.EventTransformer

val events = input
  .map(line => EventTransformer.transform(line))
  .filter(_.isSuccess)
  .flatMap(_.toOption)

val dataframe = ctx.read.json(events)
{% endhighlight %}

<h3 id="aws-lambda-example">3.3 Using from AWS Lambda</h3>

The Scala Analytics SDK is a great fit for performing analytics-on-write, monitoring or alerting on Snowplow event streams using AWS Lambda.

Here's some sample code for transforming enriched events into JSON inside a Scala Lambda:

{% highlight scala %}
import com.snowplowanalytics.snowplow.analytics.scalasdk.json.EventTransformer

def recordHandler(event: KinesisEvent) {

  val events = for {
    rec <- event.getRecords
    line = new String(rec.getKinesis.getData.array())
    json = EventTransformer.transform(line)
  } yield json
{% endhighlight %}

<h2 id="roadmap">4. Roadmap</h2>

We are hugely excited about developing our analytics SDK initiative in four directions:

1. Adding more SDKs for other languages popular for data analytics and engineering, including Python, Node.js (for AWS Lambda) and Java
2. Adding additional event transformers to the Scala Analytics SDK - please let us know any suggestions!
3. We are planning on "dogfooding" the Scala Analytics SDK by starting to use it in standard Snowplow components, such as our Kinesis Elasticsearch Sink ([#2553] [issue-2553])
4. Adding additional functions that are useful for processing event data (and sequences of event data) in particular

If you would like to help out, please get in touch! In particular, we'd love to get contributions to the official Python or Node.js Analytics SDKs.

<h2 id="help">5. Getting help</h2>

We are working on a new section of the Snowplow wiki dedicated to our Analytics SDKs.

In the meantime, if you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[sdk-repo]: https://github.com/snowplow/snowplow-scala-analytics-sdk
[sdk-usage-img]: /assets/img/blog/2016/03/scala-analytics-sdk-usage.png

[snowplow]: http://snowplowanalytics.com
[enriched-events]: https://github.com/snowplow/snowplow/wiki/canonical-event-model
[event-data-modeling]: http://snowplowanalytics.com/blog/2016/03/16/introduction-to-event-data-modeling/

[spark]: http://spark.apache.org/
[lambda]: https://aws.amazon.com/lambda/
[flink]: https://flink.apache.org/
[scalding]: https://github.com/twitter/scalding
[samza]: http://samza.apache.org/
[avro]: https://avro.apache.org/

[issue-2553]: https://github.com/snowplow/snowplow/issues/2553
[issues]: https://github.com/snowplow/snowplow/iglu
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[zeppelin-on-emr]: https://blogs.aws.amazon.com/bigdata/post/Tx6J5RM20WPG5V/Building-a-Recommendation-Engine-with-Spark-ML-on-Amazon-EMR-using-Zeppelin
[databricks]: https://databricks.com/
[wiki]: https://github.com/snowplow/snowplow/wiki/Scala-Analytics-SDK
