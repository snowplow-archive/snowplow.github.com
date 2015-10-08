---
layout: post
title: "Orchestrating batch pipelines with cron and make"
title-short: SQL Runner 0.2.0 released
tags: [sql, redshift, ssl]
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


<h2 id="cron">Scheduling our Makefile in cron</h2>


<h2 id="trouble">Troubleshooting</h2>


[snowplow]: http://snowplowanalytics.com/
[huskimo]: https://github.com/snowplow/huskimo
[sql-runner]: https://github.com/snowplow/sql-runner

[aws-data-pipeline]: https://aws.amazon.com/datapipeline/
[luigi]: https://github.com/spotify/luigi
[airflow]: http://nerds.airbnb.com/airflow/
[chronos]: https://github.com/mesos/chronos
[jenkins]: https://jenkins-ci.org/

[sns]: https://aws.amazon.com/sns/

[dag]: https://github.com/snowplow/sql-runner

[aphyr-chronos]: https://aphyr.com/posts/326-call-me-maybe-chronos

[make]: http://www.gnu.org/software/make/

[020-release]: https://github.com/snowplow/sql-runner/releases/tag/0.2.0

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
