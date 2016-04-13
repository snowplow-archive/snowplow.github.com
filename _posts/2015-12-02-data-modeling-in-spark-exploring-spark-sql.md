---
layout: post
title: 'Data modeling in Spark (Part 1): Running SQL queries on DataFrames in Spark SQL'
title-short: 'Data modeling in Spark (Part 1)'
author: Christophe
category: Data Modeling
---

**An updated version of this blogpost was posted to [Discourse](http://discourse.snowplowanalytics.com/t/running-sql-queries-on-dataframes-in-spark-sql-updated/119).**

We have been thinking about [Apache Spark][apache-spark] for some time now at Snowplow. This blogpost is the first in a series that will explore data modeling in Spark using Snowplow data. It's similar to [Justine's write-up][justine] and covers the basics: loading events into a Spark DataFrame on a local machine and running simple SQL queries against the data.

<img src="/assets/img/blog/2015/05/spark_logo.png" style="height:120px">

Data modeling is a critical step in the Snowplow pipeline: it's the stage at which business logic gets applied to the data. The event stream describes all that has happened up to a certain point in time. It therefore needs to be transformed before it becomes meaningful to an end user in the business. Because the logic gets applied at a later stage, it remains possible to revisit and iterate on earlier decisions.

Most Snowplow users do their data modeling in SQL using our open source tool [SQL Runner][sql-runner] or a BI tool such a [Looker][looker]. We hope Spark will turn out to be a great addition to the data modeling toolkit.

Excited? Let's get started!

<!--more-->

## Loading Snowplow data into Spark

Make sure [git][install-git], [Vagrant][install-vagrant] and [VirtualBox][install-virtualbox] are installed. To get started with Spark, clone the [Snowplow repo][snowplow-repo], switch to the `feature/spark-data-modeling` branch, `vagrant up` and `vagrant ssh` onto the box:

{% highlight bash %}
host$ git clone https://github.com/snowplow/snowplow.git
host$ cd snowplow
host$ git checkout feature/spark-data-modeling
host$ vagrant up && vagrant ssh
guest$ cd /vagrant/5-data-modeling/spark
guest$ sbt console
{% endhighlight %}

This last step opens the Scala console, which gives us access to all the libraries included in the spark-data-modeling project. We start with defining a [SparkContext][spark-context]:

{% highlight scala %}
import org.apache.spark.{SparkContext, SparkConf}

val sc = {
  val conf = new SparkConf()
    .setAppName("sparkDataModeling") // replace with app name
    .setMaster("local") // we are running Spark on a local machine
  new SparkContext(conf)
}
{% endhighlight %}

The SparkContext represents the connection to the Spark cluster.

Let's now load some enriched events from S3 into Spark. I recommend [creating a new S3 bucket][s3-mb] with [some Snowplow data][s3-cp] that can serve as a sandbox. A single run should be enough to start with. The path to the enriched events should look something like this:

{% highlight bash %}
snowplow-enrichment-archive/enriched/good/run=2015-12-31-23-59-59/
{% endhighlight %}

We can now load this data into Spark and create a Resilient Distributed Dataset (RDD):

{% highlight scala %}
val inDir = "s3n://accessKey:secretAccessKey@bucket/path/*"
val input = sc.textFile(inDir)
{% endhighlight %}

Make sure to add in the actual path and AWS credentials. An alternative is to set the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables in the SparkContext and use a normal path instead.

Let's take a look at the first line of this RDD:

{% highlight bash %}
scala> input.first
res0: String = "demo	web	2015-12-01 08:32:35.048	2015-12-01 04:00:54.000	2015-12-01 03:57:08.986	page_view	f4b8dd3c-85ef-4c42-9207-11ef61b2a46e	co	js-2.5.0	clj-1.0.0-tom-0.2.0	hadoop-1.0.0-common-0.14.0	1316246087	82bc4fba034dn16b	9	3456beda-f4f8-4795-bd95-897d05d23a58	US	NY	New York	New York	Time Warner Cable	Time Warner Cable	http://snowplow.io/blog/	Latest news – Blog – Snowplow	http	snowplow.io	80	/blog/	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.7 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.7	Safari	Safari	9.0.1	Browser	WEBK...
{% endhighlight %}

This is what we would expect a TSV to look like.

## Loading the data into a Spark DataFrame

We want to load our events into a [Spark DataFrame][spark-data-frame], a distributed collection of data organized into named columns. This concept is similar to a [data frame in R][r] or a table in a relational database.

Let's start with transforming the RDD into a more suitable format using the [EventTransformer][event-transformer] object:

{% highlight scala %}
import com.snowplowanalytics.snowplow.datamodeling.spark.events.EventTransformer

val jsons = input.
  map (line => EventTransformer.transform(line)).
  filter (_.isSuccess).
  flatMap (_.toOption).
  persist
{% endhighlight %}

The events are now in a format that is nicer to work with in Spark.

{% highlight bash %}
scala> jsons.first
res1: String = {"app_id":"demo","platform":"web","etl_tstamp":"2015-12-01T08:32:35.048Z","collector_tstamp":"2015-12-01T04:00:54.000Z","dvce_tstamp":"2015-12-01T03:57:08.986Z","event":"page_view","event_id":"f4b8dd3c-85ef-4c42-9207-11ef61b2a46e","txn_id":null,"name_tracker":"co","v_tracker":"js-2.5.0","v_collector":"clj-1.0.0-tom-0.2.0","v_etl":"hadoop-1.0.0-common-0.14.0","user_id":null,"user_fingerprint":"1316246087","domain_userid":"82bc4fba034dn16b","domain_sessionidx":9,"network_userid":"3456beda-f4f8-4795-bd95-897d05d23a58","geo_country":"US","geo_region":"NY","geo_city":"New York","ip_isp":"Time W...
{% endhighlight %}

We can now load this into a Spark DataFrame. First, create a [SQL Context][sql-context]:

{% highlight scala %}
import org.apache.spark.sql.SQLContext

val sqlContext = new SQLContext(sc)
{% endhighlight %}

The SQL Context allows us to create DataFrames and execute SQL queries.

{% highlight scala %}
// this is used to implicitly convert an RDD to a DataFrame.
import sqlContext.implicits._

val df = sqlContext.read.json(jsons)
{% endhighlight %}

We have now converted the RDD into a DataFrame. To show the top 5 rows and print the schema, run:

{% highlight bash %}
scala> df.show(5)
scala> df.printSchema
root
 |-- app_id: string (nullable = true)
 |-- base_currency: string (nullable = true)
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
 |-- collector_tstamp: string (nullable = true)
...
{% endhighlight %}

## Running SQL queries on Spark DataFrames

Now that our events are in a DataFrame, we can run start to model the data. We will limit ourselves to simple SQL queries for now. In the next blogpost, we will start using the actual DataFrame API, which will enable us to build advanced data models.

To run SQL queries against the data, we first need to register a table:

{% highlight scala %}
df.registerTempTable("events")
{% endhighlight %}

We can now reference this table in subsequent SQL statements. For example:

{% highlight bash %}
scala> sqlContext.sql("SELECT domain_userid, COUNT(*) AS count FROM events GROUP BY domain_userid").show(5)
+----------------+-----+
|   domain_userid|count|
+----------------+-----+
|50e543349f257eb1|    1|
|4f9125032f38a282|   16|
|ddb077fa82bd1864|    8|
|0cb1263f234dabc4|    1|
|35a83cde08fdf4e1|    1|
+----------------+-----+
{% endhighlight %}

To store the output in another DataFrame, we run:

{% highlight scala %}
val dfVisitors = sqlContext.sql("SELECT domain_userid, MAX(domain_sessionidx) AS sessions FROM events GROUP BY domain_userid")

dfVisitors.registerTempTable("visitors")
{% endhighlight %}

Joins are also supported:

{% highlight bash %}
scala> sqlContext.sql("SELECT a.domain_userid, b.sessions, COUNT(*) AS count FROM events AS a LEFT JOIN visitors AS b ON a.domain_userid = b.domain_userid GROUP BY a.domain_userid, b.sessions").show(5)
+----------------+--------+-----+
|   domain_userid|sessions|count|
+----------------+--------+-----+
|50e543349f257eb1|       2|    1|
|4f9125032f38a282|       1|   16|
|ddb077fa82bd1864|       1|    8|
|0cb1263f234dabc4|      10|    1|
|35a83cde08fdf4e1|       3|    1|
+----------------+--------+-----+
{% endhighlight %}

It's of course possible to run more complex SQL queries, even though not all functions one would use in Redshift are supported. To take full advantage of Spark, however, we will need to drop one level down and start to use the DataFrame API itself. This is what we will in explore in the next post.

In a future post, we will also start running Spark on larger datasets in both [Databricks][databricks] and [EMR][emr].

In the meantime, let us know if you have any questions or feedback!

[apache-spark]: http://spark.apache.org/
[justine]: /blog/2015/05/21/first-experiments-with-apache-spark/
[looker]: http://www.looker.com/
[sql-runner]: https://github.com/snowplow/sql-runner

[install-git]: https://help.github.com/articles/set-up-git/
[install-vagrant]: https://docs.vagrantup.com/v2/installation/
[install-virtualbox]: https://www.virtualbox.org/wiki/Downloads
[snowplow-repo]: https://github.com/snowplow/snowplow

[spark-context]: https://spark.apache.org/docs/1.3.1/api/scala/index.html#org.apache.spark.SparkContext
[s3-mb]: http://docs.aws.amazon.com/cli/latest/reference/s3/mb.html
[s3-cp]: http://docs.aws.amazon.com/cli/latest/reference/s3/cp.html


[spark-data-frame]: https://spark.apache.org/docs/1.3.0/api/scala/index.html#org.apache.spark.sql.DataFrame
[sql-context]: https://spark.apache.org/docs/latest/api/scala/index.html#org.apache.spark.sql.SQLContext

[event-transformer]: https://github.com/snowplow/snowplow/blob/feature/spark-data-modeling/5-data-modeling/spark/src/main/scala/com.snowplowanalytics.snowplow.datamodeling/spark/events/EventTransformer.scala

[r]: https://www.r-project.org/

[databricks]: https://databricks.com/
[emr]: https://aws.amazon.com/elasticmapreduce/
