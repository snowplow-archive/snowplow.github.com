---
layout: post
title: Spark Example Project released for running Spark jobs on EMR
title-short: Spark Example Project
tags: [snowplow, spark, emr, example, tutorial]
author: Alex
category: Releases
---

On Saturday I attended [Hack the Tower] [hack-the-tower], the monthly collaborative hackday for the London Java and Scala user groups hosted at the Salesforce offices in Liverpool Street.

It's an opportunity to catch up with others in the Scala community, and to work collaboratively on non-core projects which may have longer-term value for us here at Snowplow. It also means I can code against the backdrop of some of the best views in London (see below)! Many thanks as always to [John Stevenson] [jr0cket] of Salesforce for hosting us.

![salesforce-view] [salesforce-view-img]

Over the last few months I have been teaming up with other Scala devs at Hack the Tower to try out [Apache Spark] [spark], a cluster computing framework and potential challenger to Hadoop.

The particular challenge I set myself this month was to complete our [Spark Example Project] [spark-example-project], which is a clone of our popular [Scalding Example Project] [scalding-example-project]. Most howtos for data processing frameworks like Scalding or Spark assume that you are working with a local cluster in an interactive (e.g. REPL-based) fashion. At Snowplow, we are much more interested in creating self-contained jobs which can be run on Amazon's [Elastic MapReduce] [emr] with a minimum of supervision, and this is what I wanted to template in the Spark Example Project.

In the rest of this blog post I'll talk about:

1. [Challenges of running Spark on EMR](/blog/2014/04/17/spark-example-project-released/#challenges)
2. [How to use Spark Example Project](/blog/2014/04/17/spark-example-project-released/#usage)
3. [Getting help](/blog/2014/04/17/spark-example-project-released/#help)
4. [Thoughts on Spark](/blog/2014/04/17/spark-example-project-released/#thoughts)
5. [Spark and Snowplow](/blog/2014/04/17/spark-example-project-released/#snowplow-spark)

<!--more-->

<div class="html">
<h2><a name="challenges">1. Challenges of running Spark on EMR</a></h2>
</div>

I actually started work on [Spark Example Project] [spark-example-project] last year. I spent some time trying to get the project working on Elastic MapReduce: we wanted to be able to assemble a "fat jar" which we could deploy to S3 and then run on Elastic MapReduce via the API in a non-interactive way. This wasn't possible at the time, despite the valiant efforts of Ian O'Connell ([SparkEMRBootstrap] [ianoc-emr]) and Daithi O Crualaoich ([spark-emr] [daithi-emr]), and [our own questioning] [forum-post]. And so I paused on the project, to revisit when EMR's support for Spark improved.

Happily on Saturday I noticed that Amazon's tutorial, [Run Spark and Shark on Amazon Elastic MapReduce] [tutorial], had been updated in early March, including with bootstrap scripts to deploy Spark 0.8.1 to an EMR cluster. Logging on to the master node, I found a script called `~/spark/run-example`, designed to run any of Amazon's example Spark jobs, each pre-assembled into a fat jar on the cluster.

It wasn't a lot of work to adapt the `~/spark/run-example` script so that it could be used to run any pre-assembled Spark fat jar available on S3 (or HDFS): that script is now available for anyone to invoke on Elastic MapReduce here:

[s3://snowplow-hosted-assets/common/spark/run-spark-job-0.1.0.sh] [spark-script]

Once this was working, it was just a matter of reverting our Spark Example Project to Spark 0.8.1, testing it thoroughly and updating the documentation!

<div class="html">
<h2><a name="usage">2. How to use Spark Example Project</a></h2>
</div>

Getting up-and-running with the Spark Example Project should be relatively straightforward:

<div class="html">
<h3>2.1 Building</h3>
</div>

Assuming you already have [SBT] [sbt] installed:

{% highlight bash %}
$ git clone git://github.com/snowplow/spark-example-project.git
$ cd spark-example-project
$ sbt assembly
{% endhighlight %}

The 'fat jar' is now available as:

{% highlight bash %}
target/spark-example-project-0.2.0.jar
{% endhighlight %}

<div class="html">
<h3>2.2 Deploying</h3>
</div>

Now upload the jar to an Amazon S3 bucket and make the file publically accessible.

Next, upload the data file [`data/hello.txt`] [hello-txt] to S3.

<div class="html">
<h3>2.3 Running</h3>
</div>

Finally, you are ready to run this job using the [Amazon Ruby EMR client] [emr-client]:

{% highlight bash %}
$ elastic-mapreduce --create --name "Spark Example Project" --instance-type m1.xlarge --instance-count 3 \
  --bootstrap-action s3://elasticmapreduce/samples/spark/0.8.1/install-spark-shark.sh --bootstrap-name "Install Spark/Shark" \
  --jar s3://elasticmapreduce/libs/script-runner/script-runner.jar --step-name "Run Spark Example Project" \
  --step-action TERMINATE_JOB_FLOW \
  --arg s3://snowplow-hosted-assets/common/spark/run-spark-job-0.1.0.sh \
  --arg s3://{JAR_BUCKET}/spark-example-project-0.2.0.jar \
  --arg com.snowplowanalytics.spark.WordCountJob \
  --arg s3n://{IN_BUCKET}/hello.txt \
  --arg s3n://{OUT_BUCKET}/results
{% endhighlight %}

Replace `{JAR_BUCKET}`, `{IN_BUCKET}` and `{OUT_BUCKET}` with the appropriate paths.

<div class="html">
<h3>2.4 Verifying</h3>
</div>

Once the output has completed, you should see a folder structure like this in your output bucket:

{% highlight bash %}
results
|
+- _SUCCESS
+- part-00000
+- part-00001
{% endhighlight %}

Download the files and check that `part-00000` contains:

{% highlight bash %}
(hello,1)
(world,2)
{% endhighlight %}

while `part-00001` contains:

{% highlight bash %}
(goodbye,1)
{% endhighlight %}

And that's it!

<div class="html">
<h2><a name="help">3. Getting help</a></h2>
</div>

We hope you find [Spark Example Project] [spark-example-project] useful. As always with releases from the Snowplow team, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

<div class="html">
<h2><a name="thoughts">4. Thoughts on Spark</a></h2>
</div>

Although it is still early days, I was impressed with Spark, and very pleased to get it running on Elastic MapReduce in the same fashion as our existing Scalding jobs.

In particular, I like Spark's pragmatic use of in-memory processing, where in contrast Hadoop jobs can be very disk-intensive. I also like Spark's narrow focus: where Hadoop is an entire data ecosystem (file system, cluster management, job scheduling etc), Spark is much more manageable in scope, being designed to work well with other great technology such as [Apache Mesos] [mesos], [Typesafe Akka] [akka], [HDFS] [hdfs] et al.

Separately, at Snowplow we are also closely following the Spark Streaming project, and paying particular attention to Amazon's [work adding Kinesis support] [kinesis-spark-streaming] there.

<div class="html">
<h2><a name="snowplow-spark">5. Snowplow and Spark</a></h2>
</div>

We are excited at Snowplow about the long-term potential for Apache Spark as a data processing framework for us to use alongside or potentially in places instead of Hadoop.

As a first step, we plan to pilot writing bespoke data processing jobs for Professional Services clients in Spark, where previously we would have used Scalding. If this goes well, we may experiment with running the Snowplow Enrichment process (scala-common-enrich) from inside Spark.

Separately, we will look into integrating Spark Streaming into our [Snowplow Kinesis flow] [snowplow-kinesis]; this could be a great way of implementing real-time decisioning flows and feedback loops for our users.

Stay tuned for more from Snowplow about Spark and Spark Streaming in the future!

[hack-the-tower]: http://www.hackthetower.co.uk/
[hack-the-tower-apr]: http://www.meetup.com/london-scala/events/173280452/
[jr0cket]: https://github.com/jr0cket
[salesforce-view-img]: /assets/img/blog/2014/04/salesforce-heron-tower.jpg

[ianoc-emr]: https://github.com/ianoc/SparkEMRBootstrap
[daithi-emr]: https://github.com/daithiocrualaoich/spark-emr

[forum-post]: https://forums.aws.amazon.com/thread.jspa?messageID=458398
[tutorial]: http://aws.amazon.com/articles/4926593393724923
[kinesis-spark-streaming]: https://github.com/apache/spark/pull/223

[spark-example-project]: https://github.com/snowplow/spark-example-project
[scalding-example-project]: https://github.com/snowplow/scalding-example-project
[spark-script]: http://d2io1hx8u877l0.cloudfront.net/common/spark/run-spark-job-0.1.0.sh

[sbt]: http://www.scala-sbt.org/
[emr]: http://aws.amazon.com/elasticmapreduce/
[spark]: http://spark.apache.org/
[mesos]: http://mesos.apache.org/
[akka]: http://akka.io/
[hdfs]: http://hadoop.apache.org/docs/r1.2.1/hdfs_design.html

[snowplow-kinesis]: /blog/2014/02/04/snowplow-0.9.0-released-with-beta-kinesis-support/
[hello-txt]: https://github.com/snowplow/spark-example-project/raw/master/data/hello.txt
[emr-client]: http://aws.amazon.com/developertools/2264

[issues]: https://github.com/snowplow/spark-example-project/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
