---
layout: post
title: 'Data modeling in Spark (Part 1): Running SQL queries on DataFrames in Spark SQL'
title-short: 'Data modeling in Spark (Part 1)'
author: Christophe
category: Data Modeling
---

We have been thinking about [Apache Spark][apache-spark] for some time now at Snowplow. This blogpost is similar to [Justine's write-up][justine] and the first in a series that will explore data modeling in Spark using Snowplow data. It's targeted to people who know SQL and are interested in Spark, but haven't tried it out so far.

<img src="/assets/img/blog/2015/05/spark_logo.png" style="height:120px">

Data modeling is a critical step in the Snowplow pipeline: it's the stage at which business logic gets applied to the data. The event stream describes all that has happened up to a certain point in time, but it needs to be transformed before it becomes meaningful to an end user in the business. Because the logic gets applied at a later stage, it remains possible to revisit and iterate on earlier decisions.

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

Let's now load some enriched events from S3 into Spark. I recommend [adding some data][s3-cp] to a [new S3 bucket][s3-mb] that can serve as a sandbox. A single run should be enough to start with. The path to the enriched events will look something like this:

{% highlight bash %}
snowplow-enrichment-archive/enriched/good/run=2015-12-31-23-59-59/
{% endhighlight %}

We can now create a Resilient Distributed Dataset (RDD) from this data:

{% highlight scala %}
val inDir = "s3n://accessKey:secretAccessKey@bucket/path/*" //**
val input = sc.textFile(inDir)
{% endhighlight %}

Make sure to replace the placeholder path and AWS credentials. An alternative is to set the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables in the SparkContext and use a normal path instead.

Let's take a look at the first line of this RDD:

{% highlight bash %}
scala> input.first
res0: String = "...
{% endhighlight %}

This is what we would expect from a TSV.

## Loading the data into a Spark DataFrame

We want to load our events into a [Spark DataFrame][spark-data-frame]. Let's start with transforming the RDD using the [EventTransformer][event-transformer] object:

{% highlight scala %}
import com.snowplowanalytics.snowplow.datamodeling.spark.events.EventTransformer

val jsons = input.
  map (line => EventTransformer.transform(line)).
  filter (_.isSuccess).
  flatMap (_.toOption).
  persist
{% endhighlight %}

This transforms the data into a format that is nicer to work with in Spark.

{% highlight bash %}
scala> jsons.first
res1: String = ...
{% endhighlight %}

We can now load this into a [Spark DataFrame][spark-data-frame]. First, create a [SQL Context][sql-context].

{% highlight scala %}
import org.apache.spark.sql.SQLContext
val sqlContext = new SQLContext(sc)
{% endhighlight %}

This allows us to create DataFrames and execute SQL queries.

This RDD can be implicitly converted to a DataFrame and

{% highlight scala %}
import sqlContext.implicits._
val df = sqlContext.read.json(jsons)
{% endhighlight %}



{% highlight bash %}
scale> df.show
scala> df.printSchema
{% endhighlight %}

## Executing SQL queries

then be registered as a table. Tables can be used in subsequent SQL statements. SQL statements can be run by using the sql methods provided by sqlContext.

{% highlight scala %}
df.registerTempTable("events")
{% endhighlight %}

{% highlight bash %}
scala> sqlContext.sql("SELECT domain_userid, COUNT(*) FROM events GROUP BY domain_userid").show
{% endhighlight %}

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
