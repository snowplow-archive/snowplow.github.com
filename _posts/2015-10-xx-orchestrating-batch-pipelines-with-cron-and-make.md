---
layout: post
title: "Orchestrating batch pipelines with cron and make"
title-short: SQL Runner 0.2.0 released
tags: [cron, make, orchestration, pipeline, etl]
author: Alex
category: Inside the Plow
---

At Snowplow we are often asked how best to orchestrate multi-stage ETL pipelines, where these pipelines typically include [Snowplow] [snowplow] and our [SQL Runner] [sql-runner], sometimes [Huskimo] [huskimo] and often third-party apps and scripts.

There is a bewildering array set of tools available for this kind of orchestration, including [AWS Data Pipeline] [aws-data-pipeline], [Luigi] [luigi], [Chronos] [chronos], [Jenkins] [jenkins] and [Airflow] [airflow]. These tools tend to have the following two capabilities:

1. A job-scheduler, which determines when each batch processing job will run
2. A DAG-runner, which can treat a job as a [Directed Acylic Graph] [dag] of inter-dependent steps and run those steps in the correct order 

Make no mistake - these are powerful tools which let you to orchestrate sophisticated batch processing pipelines. But with that power comes complexity, and operating these sytems reliably is not always straightforward - for example see [Kyle Kingsbury's recent testing of Chronos] [aphyr-chronos], where he wrote:

<blockquote>
If you already use Chronos, I suggest you... ensure your jobs are OK with never being run at all
</blockquote>

If you are just starting out building your first batch processing pipelines, consider a much simpler approach: combining the standard Unix tools `cron` and `make` to orchestrate your jobs. This blog post walks you through this approach:

1. [Introducing our batch pipeline](/blog/2015/10/02/orchestrating-batch-pipelines-with-cron-and-make#pipeline)
2. [Defining our job's DAG in make](/blog/2015/10/02/orchestrating-batch-pipelines-with-cron-and-make#make)
3. [Scheduling our Makefile in cron](/blog/2015/10/02/orchestrating-batch-pipelines-with-cron-and-make#cron)
4. [Troubleshooting](/blog/2015/10/02/orchestrating-batch-pipelines-with-cron-and-make#trouble)

<!--more-->

<h2 id="pipeline">Introducing our batch pipeline</h2>

Let's imagine that we need to setup a batch-processing pipeline with the following components:

* [Amazon SNS] [sns] notifications at the start and (successful) end of each run
* Snowplow's EmrEtlRunner and StorageLoader applications to run Snowplow on EMR and load events into Redshift
* Our Huskimo project to extract marketing spend data from Singular
* Some data modeling performed in Redshift using our SQL Runner app

Let's assume that the data modeling is dependent on both our Snowplow load and our Huskimo run. Putting all this together, we end up with a DAG which looks like this:

XXX

We're now going to express this DAG in a Makefile ready for `make`.

<h2 id="make">Defining our job's DAG in make</h2>

Make is a software build tool first released in 1977, which uses files called Makefiles to specify how to build the target program. A Makefile lets you specify tasks that contribute to the build, and express dependencies between these tasks, forming a directed acylic graph.

Because the tasks in a Makefile are just shell commands, we can use make to orchestrate a batch processing pipeline, as long as each individual step in the pipeline is invokable from a shell.

Here's the Makefile for our job, `example-dag.makefile` with a simple `echo` to placehold for each task, plus some `sleep`s to make it easier to see what is going on when we run it:

{% highlight makefile %}
done: send-completed-sns

send-starting-sns:
  echo "Sending SNS for job starting" && sleep 5
snowplow-emr-etl-runner: send-starting-sns
  echo "Running Snowplow EmrEtlRunner" && sleep 5
snowplow-storage-loader: snowplow-emr-etl-runner
  echo "Running Snowplow StorageLoader" && sleep 5
huskimo: send-starting-sns
  echo "Running Huskimo" && sleep 2
sql-runner: snowplow-storage-loader huskimo
  echo "Running data models" && sleep 5
send-completed-sns: sql-runner
  echo "Sending SNS for job completion" && sleep 2
{% endhighlight %}

By default Make will attempt to build the first rule found in the supplied Makefile - I like to call the first rule `done` and make it dependent on the last task in our DAG. You can see that the rest of our rules consist of a name or "target", one or more dependencies on other targets, and the shell command to run, on a tab-indented newline. To learn a lot more about the Makefile syntax, check out the [GNU make manual] [make-docs].

Let's visualize this Makefile, using the [makefile2dot] [makefile2dot] Python script:

{% highlight bash %}
$ sudo apt-get install graphviz python
$ sudo wget https://raw.githubusercontent.com/vak/makefile2dot/master/makefile2dot.py
$ python makefile2dot.py <example-dag.makefile |dot -Tpng > example-dag.png
{% endhighlight %}

Here is the generated diagram:

XXX

The DAG flows bottom-to-top which is a little quirky - it reflects the fact that Makefiles normally build a target app which is composed of multiple intermediate files.

<h2 id="cron">Scheduling our Makefile in cron</h2>

Now that we have our Makefile, we need to run it! Here is our command, together with the output:

{% highlight bash %}
$ make -k -j -f example-dag.makefile
XXXXX
{% endhighlight %}

In reverse order, the command line arguments are as follows:

* `-f` specifies the Makefile to run (where the default is `Makefile` in the current directory)
* `-j` lets Make run with as much parallelism as is needed - so the Huskimo and Snowplow tasks can run at the same time
* `-k` means "keep going" as far through the DAG as possible - so for example, even if Huskimo fails, we can still complete the Snowplow tasks before failing the overall job

How to schedule our job to run? 

{% highlight bash %}
00 3            * * *   make -k -j -f example-dag.makefile
{% endhighlight %}

<h2 id="trouble">Troubleshooting</h2>

[snowplow]: http://snowplowanalytics.com/
[huskimo]: https://github.com/snowplow/huskimo
[sql-runner]: https://github.com/snowplow/sql-runner
[sns]: https://aws.amazon.com/sns/

[aws-data-pipeline]: https://aws.amazon.com/datapipeline/
[luigi]: https://github.com/spotify/luigi
[airflow]: http://nerds.airbnb.com/airflow/
[chronos]: https://github.com/mesos/chronos
[aphyr-chronos]: https://aphyr.com/posts/326-call-me-maybe-chronos
[jenkins]: https://jenkins-ci.org/

[dag]: https://github.com/snowplow/sql-runner
[make]: http://www.gnu.org/software/make/
[make-docs]: http://www.gnu.org/software/make/manual/make.html
[makefile2dot]: https://github.com/vak/makefile2dot

[cron]: https://en.wikipedia.org/wiki/Cron

[020-release]: https://github.com/snowplow/sql-runner/releases/tag/0.2.0

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
