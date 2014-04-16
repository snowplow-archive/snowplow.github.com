---
layout: post
shortenedlink: Spark Example Project released
title: Spark Example Project released for running Spark jobs on EMR
tags: [snowplow, spark, emr, example, tutorial]
author: Alex
category: Releases
---

On Saturday I attended [Hack the Tower] [hack-the-tower], the monthly collaborative hackday for the London Java and Scala user groups hosted at the Salesforce offices here. It's an opportunity to catch up with others in the Scala community, and to work collaboratively on non-urgent projects which may have longer-term value for us here at Snowplow. It also means I can hack against the backdrop of some of the best views in London (see below)! Many thanks as always to [John Stevenson] [xxx] of Salesforce for hosting us. 

Over the last few months I have been teaming up with other Scala heads to try out [Apache Spark] [apache-spark], a cluster computing framework and potential challenger to Hadoop. The particular challenge I set myself this month was to complete our [Spark Example Project] [spark-example-project], which is a clone of our popular [Scalding Example Project] [scalding-example-project]. Most tutorials introducing data processing frameworks like Scalding or Spark assume that you are working with a local cluster in an interactive (e.g. REPL-based) fashion. At Snowplow, we are much more interested in creating self-contained jobs which can be run on Amazon's Elastic MapReduce with a minimum of supervision, so that is what I set out to template in the Spark Example Project.

In the rest of this blog post then I'll talk about:

* Challenges of running Spark on EMR
* How to use Spark Example Project
* Spark and Snowplow



<!--more-->

<div class="html">
<h2><a name="what">1. Challenges of running Spark on EMR</a></h2>
</div>

We actually built an initial version of the Spark Example Project in 2013 when we first heard about Spark through the AWS tutorial, XXX by [XXX] [xxx]. We spent some time trying to get the project working on Elastic MapReduce: we wanted to be able to assemble a "fat jar" which we could deploy to S3 and then run on Elastic MapReduce via the API in a non-interactive way. This wasn't possible at the time, despite the valiant efforts of [XXX] [xxx] ([XXX] [xxx]) and [XXX] [xxx] ([XXX] [xxx]), and [our own questioning] [forum-post]. And so I paused on the project, to revisit when EMR's support for Spark progressed.

Happily on Saturday I noticed that the same AWS tutorial had been updated in early March, with scripts to deploy Spark 0.8.1 to an EMR cluster. We saw that the vanilla EMR Spark install included a script called `xxx`, designed to run one of Amazon's example Spark jobs, which had been pre-assembled into a fat jar.

It wasn't a lot of work to take the `xxx` script, and adapt it so that it could be used to run any pre-assembled Spark fat jar: that script is now available for anyone to invoke on Elastic MapReduce here:

xxx

Once this was working, it was just a matter of reverting our Spark Example Project to Spark 0.8.1, testing it thoroughly and updating the documentation!

<div class="html">
<h2><a name="what">2. How to use Spark Example Project</a></h2>
</div>




<div class="html">
<h2><a name="what">3. Snowplow and Spark</a></h2>
</div>

We are excited at Snowplow about the long-term potential for Spark as a data processing framework to use alongside or potentially even instead of Hadoop.

In particular, we like Spark's use of in-memory processing, where in contrast Hadoop is rather disk-intensive. We also appreciate Spark's tight focus compared to Hadoop: where Hadoop is an entire data ecosystem with a file system, cluster management, job scheduling, data processing etc, Spark takes a much narrower brief, being designed to work with other great technology such as [Apache Mesos] [mesos], [Typesafe Akka] [akka], [HDFS] [hdfs] et al.

We are also excited about the Spark Streaming project, and integrating that into our [Snowplow Kinesis flow] [snowplow-kinesis].

As a first step, we plan to leverage our [Spark Example Project] [spark-example-project] as a starting point for bespoke MapReduce work for clients. If this work goes well, we may experiment with running the Snowplow Enrichment process (scala-common-enrich) from inside Spark.

Stay tuned for more from Snowplow about Spark and Spark Streaming in the future!

[hack-the-tower]: http://www.hackthetower.co.uk/
[hack-the-tower-apr]: http://www.meetup.com/london-scala/events/173280452/
[]

[forum-post]: xxx
[spark-example-project]: https://github.com/snowplow/spark-example-project
[scalding-example-project]: https://github.com/snowplow/scalding-example-project

[snowplow-kinesis]: xxx

