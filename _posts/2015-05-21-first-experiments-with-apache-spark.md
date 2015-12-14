---
layout: post
title: First experiments with Apache Spark at Snowplow
tags: [snowplow, scala, spark, tutorial, example, recipe]
author: Justine
category: Research
---

![spark logo][spark-logo]

As we talked about in our [May post on the Spark Example Project release](http://snowplowanalytics.com/blog/2015/05/10/spark-example-project-0.3.0-released/), at Snowplow we are very interested in [Apache Spark](https://spark.apache.org/) for three things:

1. [Data modeling](http://snowplowanalytics.com/analytics/data-modeling/) i.e. applying business rules to aggregate up event-level data into a format suitable for ingesting into a business intelligence / reporting / OLAP tool
2. Real-time aggregation of data for real-time dashboards
3. Running machine-learning algorithms on event-level data

We're just at the beginning of our journey getting familiar with Apache Spark. I've been using Spark for the first time over the past few weeks. In this post I'll share back with the community what I've learnt, and will cover:

1. [Loading Snowplow data into Spark](/blog/2015/05/21/first-experiments-with-apache-spark/#loading)
2. [Performing simple aggregations on Snowplow data in Spark](/blog/2015/05/21/first-experiments-with-apache-spark#agg)
3. [Performing funnel analysis on Snowplow data](/blog/2015/05/21/first-experiments-with-apache-spark#funnel)

I've tried to write the post in a way that's easy to follow-along for other people interested in getting up the Spark learning curve.

<!--more-->

<h2><a name="loading">1. Loading Snowplow data into Spark</a></h2>

Assuming you have git, Vagrant and VirtualBox installed, you can get started by simply clone the [Snowplow repo][repo], switching to the `feature/spark-data-modeling` branch then `vagrant up` and `vagrant ssh` onto the box:

{% highlight bash %}
host$ git clone https://github.com/snowplow/snowplow.git
host$ cd snowplow
host$ git checkout feature/spark-data-modeling
host$ vagrant up && vagrant ssh
guest$ cd /vagrant/5-data-modeling/spark
{% endhighlight %}

This tutorial also assumes you have some Snowplow enriched events files stored locally in `/path/to/data`. The enriched events are stored in the TSV format documented [here](https://github.com/snowplow/snowplow/wiki/Canonical-event-model).

First, we open up the Scala console or REPL:

{% highlight bash %}
guest$ sbt console
{% endhighlight %}

This gives us access to all of the libraries loaded as part of the spark-data-modeling project which we will need in a later step. First we define a [SparkContext](https://spark.apache.org/docs/1.3.1/api/scala/index.html#org.apache.spark.SparkContext). Paste this into your Scala console:

{% highlight scala %}
import org.apache.spark.{SparkContext, SparkConf}
import SparkContext._

val sc = {
  val conf = new SparkConf()
    .setAppName("myAppName")
    .setMaster("local") // master is "local" because we are running locally
  new SparkContext(conf)
}
{% endhighlight %}

We define `inDir` as the path of the directory with all our data files - Spark [supports wildcards](https://spark.apache.org/docs/latest/programming-guide.html#external-datasets). We can now load the data:

{% highlight scala %}
val inDir = "/path/to/data/*"
val input = sc.textFile(inDir)
{% endhighlight %}

If we had wanted to load data directly from S3, we would only have to change the directory path value:

{% highlight scala %}
val inDir = "s3n://snowplow-events/enriched/good/run=*"
{% endhighlight %}

In this case, you must have the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables set to your AWS account credentials; the AWS account needs *both "read" and **"write"** permissions*.

### Transforming the data for further analysis

Let's look at what the data looks like at the moment:

{% highlight scala %}
scala> input.first
res0: String = "snowplowwebweb2015-05-06 05:02:35.7642015-05-05 09:00:57.0002015-05-05 09:00:57.545page_viewc033a9d1-0873-4cd9-834e-8fc929246c95clojurejs-2.4.3clj-1.0.0-tom-0.2.0hadoop-0.14.1-common-0.13.11893875.41105417220.233.228.52109972135f8460b43ec0a7b414530c468-8c02-4e24-9f0b-1d38728795a1AU-27.0133.0ExetelExetelexetel.com.auhttp://snowplowanalytics.com/analytics/index.htmlThe Snowplow Analytics cookbookhttp://snowplowanalytics.com/httpsnowplowanalytics.com80/analytics/index.htmlhttpsnowplowanalytics.com8/internal{"schema":"iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0","data":[{"schema":"iglu:com.google.analytics/cookies/jsonschema/1-0-0","data":{"__utma":"1893875.41105417.1430816298.1430816298.1430816298.1","__...
{% endhighlight %}

Each data element is a long string of TSVs with some of the values being in JSON. We can tidy this up with the [EventTransformer](https://github.com/snowplow/snowplow/blob/feature/spark-data-modeling/5-data-modeling/spark/src/main/scala/com.snowplowanalytics.snowplow.datamodeling/spark/events/EventTransformer.scala) object:

{% highlight scala %}
import com.snowplowanalytics.snowplow.datamodeling.spark.events.EventTransformer

val jsons = input.
  map (line => EventTransformer.transform(line)).
  filter (_.isSuccess).
  flatMap (_.toOption)
{% endhighlight %}

Note that the `EventTransformer` was originally written to convert Snowplow enriched events into a format suitable for [ingesting directly into ElasticSearch] [es-sink], as part of our real-time flow. The same transformation makes the data easy to work with in Spark.

The data now looks like:

{% highlight scala %}
scala> jsons.first
res1: String = {"geo_location":"-27.0,133.0","app_id":"snowplowweb","platform":"web","etl_tstamp":"2015-05-06T05:02:35.764Z","collector_tstamp":"2015-05-05T09:00:57.000Z","dvce_tstamp":"2015-05-05T09:00:57.545Z","event":"page_view","event_id":"c033a9d1-0873-4cd9-834e-8fc929246c95","txn_id":null,"name_tracker":"clojure","v_tracker":"js-2.4.3","v_collector":"clj-1.0.0-tom-0.2.0","v_etl":"hadoop-0.14.1-common-0.13.1","user_id":"1893875.41105417","user_ipaddress":"220.233.228.52","user_fingerprint":"10997213","domain_userid":"5f8460b43ec0a7b4","domain_sessionidx":1,"network_userid":"4530c468-8c02-4e24-9f0b-1d38728795a1","geo_country":"AU","geo_region":null,"geo_city":null,"geo_zipcode":null,"geo_latitude":-27.0,"geo_longitude":133.0,"geo_region_name":null,"ip_isp":"Exetel","ip_organization"...
{% endhighlight %}

A JSON string is returned. We will now load this into a [Spark DataFrame](https://spark.apache.org/docs/1.3.0/api/scala/index.html#org.apache.spark.sql.DataFrame) so that we can easily manipulate data across dimensions.

### Loading the JSON formatted data into a Spark DataFrame

We create a [SQLContext](https://spark.apache.org/docs/latest/api/scala/index.html#org.apache.spark.sql.`SQLContext`):

{% highlight scala %}
import org.apache.spark.sql.SQLContext

val sqlContext = new SQLContext(sc)
{% endhighlight %}

We can load the JSON formatted data into a DataFrame two different ways. Just continuing from the work we did above in the console:

{% highlight scala %}
// this is used to implicitly convert an RDD to a DataFrame
import sqlContext.implicits._

val df = sqlContext.jsonRDD(jsons)
{% endhighlight %}

Alternatively, if we had saved the data to files we could load the data directly into a DataFrame this way:

{% highlight scala %}
val df = sqlContext.load("/path/to/saved/json/files/*", "json")
{% endhighlight %}

Let's look at the data now by returning the schema:

{% highlight scala %}
scala> df.printSchema
root
 |-- app_id: string (nullable = true)
 |-- br_colordepth: string (nullable = true)
 |-- br_cookies: boolean (nullable = true)
 |-- br_family: string (nullable = true)
 |-- br_features_director: boolean (nullable = true)
 |-- br_features_flash: boolean (nullable = true)
 |-- br_features_gears: boolean (nullable = true)
 |-- br_features_java: boolean (nullable = true)
 |-- br_features_pdf: boolean (nullable = true)
 |-- br_features_quicktime: boolean (nullable = true)
 |-- br_features_realplayer: boolean (nullable = true)
 |-- br_features_silverlight: boolean (nullable = true)
 |-- br_features_windowsmedia: boolean (nullable = true)
 |-- br_lang: string (nullable = true)
 |-- br_name: string (nullable = true)
 |-- br_renderengine: string (nullable = true)
 |-- br_type: string (nullable = true)
 |-- br_version: string (nullable = true)
 |-- br_viewheight: long (nullable = true)
 |-- br_viewwidth: long (nullable = true)
 |-- collector_date: string (nullable = true)
 |-- collector_tstamp: string (nullable = true)
 |-- contexts_com_google_analytics_cookies_1: array (nullable = true)
 |    |-- element: struct (containsNull = true)
 |    |    |-- __utma: string (nullable = true)
 |    |    |-- __utmb: string (nullable = true)
 |    |    |-- __utmc: string (nullable = true)
 |    |    |-- __utmz: string (nullable = true)
...
{% endhighlight %}

Spark SQL inferred the schema from the JSON files. It should fit [this schema](https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/elasticsearch_enriched_event/jsonschema/1-0-1).

## <a name="agg"></a>2. Simple aggregations on Snowplow data

To illustrate simple aggregations with Spark, we will:

1. Count the number of events per day
2. Count the number of users per day
3. Count the number of sessions per day

### Count the number of events per day

We will set up a crude function, `toDate`, to get the date out of the `collector_tstamp` column containing the date and time in the ISO 8601 format. We then make a [UDF](https://spark.apache.org/docs/1.3.0/api/scala/index.html#org.apache.spark.sql.UserDefinedFunction) from `toDate` to use it on a Column in the DataFrame. `udf()` takes function objects so we define `toDate` as an anonymous function:

{% highlight scala %}
import org.apache.spark.sql.functions.udf

val toDate = (t: String) => t.split("T")(0)
val toDateUDF = udf(toDate)
val dfWithDate = df.withColumn("collector_date", toDateUDF(df.col("collector_tstamp")))
{% endhighlight %}

**Note:** there is a [bug](https://github.com/apache/spark/pull/5981) concerning registering UDFs in certain contexts (like the SBT console we are using) for which there are [workarounds](http://chapeau.freevariable.com/2015/04/spark-sql-repl.html) for the current Spark release version, though this has since been [fixed](https://github.com/apache/spark/commit/937ba798c56770ec54276b9259e47ae65ee93967). Alternatively, these aggregations can also be done using RDDs without UDFs - see how to go from a DataFrame to an RDD [here](#dftordd).

We group by the new column and count each event per group:

{% highlight scala %}
scala> dfWithDate.
     |   groupBy ("collector_date").
     |   count.
     |   show
+--------------+-----+
|collector_date|count|
+--------------+-----+
|    2015-05-05|  477|
|    2015-05-06|  482|
+--------------+-----+
{% endhighlight %}

The `show()` method on DataFrames is useful to quickly see the results of any operations on the DataFrame. It however only displays the top 20 rows.

### Count the number of users per day

First we have to get the distinct users per day (or *unique* users per day), to get one row per user per day. Then we repeat as above to group by day and count the users in each group:

{% highlight scala %}
scala> dfWithDate.
     |   select ("domain_userid", "collector_date").
     |   distinct.
     |   groupBy ("collector_date").
     |   count.
     |   show
+--------------+-----+
|collector_date|count|
+--------------+-----+
|    2015-05-05|   56|
|    2015-05-06|   49|
+--------------+-----+
{% endhighlight %}

### Count the number of sessions per day

It's the same principle as counting the number of users per day. A session is defined as the unique combinations of `domain_userid` and `domain_sessionidx`.

{% highlight scala %}
scala> dfWithDate.
     |   select ("domain_userid", "domain_sessionidx", "collector_date").
     |   distinct.
     |   groupBy ("collector_date").
     |   count.
     |   show
+--------------+-----+
|collector_date|count|
+--------------+-----+
|    2015-05-05|   59|
|    2015-05-06|   51|
+--------------+-----+
{% endhighlight %}

**Note:** there also exists the `countDistinct` function which we can use to aggregate over a group, like this:

{% highlight scala %}
scaladfWithDate.
     |   groupBy ("collector_date").
     |   agg (countDistinct("domain_userid", "domain_sessionidx")).
     |   show
+--------------+-----------------------------------------------+
|collector_date|COUNT(DISTINCT domain_userid,domain_sessionidx)|
+--------------+-----------------------------------------------+
|    2015-05-05|                                             58|
|    2015-05-06|                                             50|
+--------------+-----------------------------------------------+
{% endhighlight %}

However its behaviour is inconsistent with the `select(...).distinct.groupBy(...).count` approach we took prior, as `null` values are not taken into account by `countDistinct`.

<h2><a name="funnel">3. Funnel analysis on Snowplow data</a></h2>

When we analyse event-level data we are often interested in understanding the sequence in which events occur. Funnel analysis is one of the simplest examples where we're sequencing events.

We define a funnel as being made up of three events. In this example, it will be three page view events, where each event is identified via a unique page URL. We want to aggregate all the events corresponding to one session into a single field that summarises the journey in the funnel for that session.

First we define the urls for our funnel:

{% highlight scala %}
val urls = Map(
  "/analytics/index.html" -> "A",
  "/" -> "B",
  "/pricing/index.html" -> "C"
).withDefaultValue("")
{% endhighlight %}

Next we want to group our events by session and collect the `page_urlpath` of `page_view` events. Unfortunately, aggregations in Spark DataFrames only work with some basic pre-defined functions: `count` which we used above, and a few standard [functions](https://spark.apache.org/docs/1.3.0/api/scala/index.html#org.apache.spark.sql.GroupedData). UDAFs are [not yet supported](https://issues.apache.org/jira/browse/SPARK-3947) in Spark SQL, <a name="dftordd"></a>so we will map the DataFrame to a [RDD](https://spark.apache.org/docs/latest/programming-guide.html#resilient-distributed-datasets-rdds) using the `map` method:

{% highlight scala %}
scala> import org.apache.spark.sql.Row
import org.apache.spark.sql.Row

scala> val eventsRDD = df.
     |   filter ($"event" === "page_view").
     |   orderBy ("collector_tstamp").
     |   select ("domain_userid", "domain_sessionidx", "page_urlpath").
     |   map {
     |     case Row(duid: String, dsid: Long, url: String) => Seq(duid, dsid.toString, url)
     |     case Row(duid: String, None, url: String) => Seq(duid, "null", url)
     |   }
eventsRDD: org.apache.spark.rdd.RDD[Seq[String]] = MapPartitionsRDD[17] at map at <console>:28
{% endhighlight %}

Note the triple `===` equality symbol to test equality. The events are ordered by date and time because the order in which the urls were visited is important in constructing the funnel. We use pattern matching to take care of the null `domain_sessionidx` values, since they are of type Long.

Next we group by session:

{% highlight scala %}
scala> val eventsBySession = eventsRDD.
     |   groupBy (r => (r(0), r(1)))
eventsBySession: org.apache.spark.rdd.RDD[((String, String), Iterable[Seq[String]])] = ShuffledRDD[19] at groupBy at <console>:29
{% endhighlight %}

It returns a [PairRDD](https://spark.apache.org/docs/1.3.0/api/scala/index.html#org.apache.spark.rdd.PairRDDFunctions) where the key is the session (a tuple with the `domain_userid` and `domain_sessionidx`) and the value is an Iterable of rows corresponding to that session. For example:

{% highlight scala %}
scala> eventsBySession.take(5).foreach(println)
((2da6f0d2ad1596b5,1),CompactBuffer(List(2da6f0d2ad1596b5, 1, /blog/2013/11/20/loading-json-data-into-redshift/)))
((f7b9661f08acea6e,1),CompactBuffer(List(f7b9661f08acea6e, 1, /analytics/recipes/customer-analytics/customer-lifetime-value.html)))
((e9abe0b73b84c32b,1),CompactBuffer(List(e9abe0b73b84c32b, 1, /)))
((e625f4ab6f759cd7,1),CompactBuffer(List(e625f4ab6f759cd7, 1, /blog/2013/02/20/transferring-data-from-s3-to-redshift-at-the-command-line/)))
((934e058231055278,1),CompactBuffer(List(934e058231055278, 1, /product/index.html), List(934e058231055278, 1, /analytics/index.html), List(934e058231055278, 1, /analytics/tools/sql/index.html), List(934e058231055278, 1, /analytics/concepts/contexts/index.html), List(934e058231055278, 1, /analytics/concepts/iglu/index.html), List(934e058231055278, 1, /analytics/concepts/snowplow-data-pipeline/index.html)))
{% endhighlight %}

Here we're looking at five elements in the `eventsBySession` RDD. In the first four sessions, only one url was visited, whereas six urls were visited in the fifth session displayed here.

Each row still contains the `domain_userid` and `domain_sessionidx` fields which were used to group, so we need to remove these obsolete fields and keep or "project" the `page_urlpath`. Each `page_urlpath` can be mapped to the corresponding funnel letter we defined in the `urls` Map and we can join all the funnel letters together in a single String for our summarised funnel journey field.

We do all this in a function so that if our funnel urls change, we can recalculate the funnel field for each session from the `eventsBySession` RDD by passing the new `urls` Map as the `urlToLetter` argument.

{% highlight scala %}
import org.apache.spark.rdd.RDD

def reduceToFunnelLetter (
  grpdEvents: RDD[((String, String), Iterable[Seq[String]])],
  urlToLetter: Map[String, String]
  ): RDD[((String, String), String)] = {
  grpdEvents.mapValues (_.map {
    case Seq(duid, dsid, url) => urlToLetter (url)
  }.mkString)
}
{% endhighlight %}

We apply the `reduceToFunnelLetter` function and get:

{% highlight scala %}
scala> val sessions = reduceToFunnelLetter(eventsBySession, urls)
sessions: org.apache.spark.rdd.RDD[((String, String), String)] = MapPartitionsRDD[34] at mapValues at <console>:27

scala> sessions.take(10).foreach(println)
((2da6f0d2ad1596b5,1),)
((f7b9661f08acea6e,1),)
((e9abe0b73b84c32b,1),B)
((e625f4ab6f759cd7,1),)
((934e058231055278,1),A)
((b3a41c0f0f8f2f38,1),C)
((e87723b59cd27e84,26),BA)
((10594c7301372114,1),)
((6e482e7fbcbd19df,2),B)
((2fc9d2b4d2c27fd6,18),)
{% endhighlight %}

So for example, in the first session shown, there was no visit to any of the urls we are interested in. In the third, there was a visit to the url corresponding to 'B' and in the seventh, there was a visit to the 'B' url and then to the 'A' url in that single session.

We can convert this PairRDD into a DataFrame if needed:

{% highlight scala %}
scala> case class Session(domain_userid: String, domain_sessionidx: String, funnel: String)
defined class Session

scala> val funnelDF = sessions.
     |   map (session => Session(session._1._1, session._1._2, session._2)). // flatten each row
     |   toDF
funnelDF: org.apache.spark.sql.DataFrame = [domain_userid: string, domain_sessionidx: string, funnel: string]

scala> funnelDF.show
+----------------+-----------------+------+
|   domain_userid|domain_sessionidx|funnel|
+----------------+-----------------+------+
|2da6f0d2ad1596b5|                1|      |
|f7b9661f08acea6e|                1|      |
|e9abe0b73b84c32b|                1|     B|
|e625f4ab6f759cd7|                1|      |
|934e058231055278|                1|     A|
|b3a41c0f0f8f2f38|                1|     C|
|e87723b59cd27e84|               26|    BA|
|10594c7301372114|                1|      |
|6e482e7fbcbd19df|                2|     B|
|2fc9d2b4d2c27fd6|               18|      |
|48495f4b73d63b7d|                1|      |
|8f54f05c478d0b24|                1|      |
|a9a08e8097b9dc5f|               11|     B|
|ca01db4214630302|                3|      |
|480c29384448e5a8|                1|      |
|651d45cee54461bf|                6|      |
|9905848cba1dd9dd|                3|      |
|529a7030d69b4789|                2|      |
|6e8928720c4260b5|                2|     C|
|69bc63e1bef6a57d|                3|      |
+----------------+-----------------+------+
{% endhighlight %}

Here Spark inferred the schema using [reflection] [inferring-the-schema-using-reflection] where the case class defines the schema of the table. With the data in a DataFrame, we can now use very terse declarative code to analyse the data further, for example here we look at the longest funnel journeys:

{% highlight scala %}
scala> val toLength = udf((t: String) => t.length: Int)
toLength: org.apache.spark.sql.UserDefinedFunction = UserDefinedFunction(<function1>,IntegerType)

scala> funnelDF.
     |   orderBy (toLength($"funnel").desc).
     |   show
+----------------+-----------------+------+
|   domain_userid|domain_sessionidx|funnel|
+----------------+-----------------+------+
|70335332cf3316a1|                5| BBAAA|
|e5c3bb269de6936e|                7|  BAAA|
|fd4060bdaf1dc593|                2|   AAA|
|773a1214fe61944b|                1|    CA|
|97d43ee81333305f|                2|    BA|
|e87723b59cd27e84|               26|    BA|
|890cbcf9afec105c|                1|    BB|
|5f8460b43ec0a7b4|                1|    AA|
|1200f698c145597d|                2|     A|
|a8efb48728fec627|                1|     B|
|d565aeae3315da22|                2|     C|
|934e058231055278|                1|     A|
|8cb9f0ca7d985433|                7|     C|
|e9abe0b73b84c32b|                1|     B|
|464014ac085e1c5f|                1|     B|
|8761d58070d9dc8d|                1|     B|
|b3a41c0f0f8f2f38|                1|     C|
|a9a08e8097b9dc5f|               11|     B|
|6e482e7fbcbd19df|                2|     B|
|6e8928720c4260b5|                2|     C|
+----------------+-----------------+------+
{% endhighlight %}

## Next steps

There are a number of ways we can build on the computations outlined above. For our funnel analysis, for example, we might want to define funnels where the steps in each funnel are not simply page views and identified by page URL paths - we want the flexibility to build funnels out of any event type, and use any combination of fields in our Snowplow data to identify steps in that funnel. Our code above would need to be more flexible and accept a nested `eventToLetter` mapping of this sort of form:

{% highlight scala %}
val eventToLetter = Map(
  Map("event" -> "page_view", "page_urlpath" -> "/") -> "A",
  Map("event" -> "page_view", "page_urlpath" -> "/pricing/index.html") -> "B"
  Map("event" -> "transaction", "ti_name" -> "Cone pendulum" -> "C",
).withDefaultValue("")
{% endhighlight %}

As the next steps in my internship, I will be focusing on marketing attribution data in particular. I'm going to compute identify, filter and transform that data in Spark, before loading it into [DynamoDB](https://aws.amazon.com/dynamodb/) and visualising it using [D3.js](http://d3js.org/). This stack should give me a lot of flexibility to explore different approaches to visualizing marketing attribution data.

In parallel, another intern at Snowplow is figuring out how to run [Spark Streaming](https://spark.apache.org/streaming/) with Kinesis so that we can perform these types of real-time computation and visualization in real-time. Stay tuned for a blog post on that in due course!

[repo]: http://collector.snplow.com/r/tp2?u=https%3A%2F%2Fgithub.com%2Fsnowplow%2Fsnowplow
[spark-logo]: /assets/img/blog/2015/05/spark_logo.png

[inferring-the-schema-using-reflection]: https://spark.apache.org/docs/latest/sql-programming-guide.html#inferring-the-schema-using-reflection

[es-sink]: https://github.com/snowplow/snowplow/tree/master/4-storage/kinesis-elasticsearch-sink
