---
layout: post
title: "Orchestrating batch pipelines with cron and make"
title-short: SQL Runner 0.2.0 released
tags: [sql, redshift, ssl]
author: Alex
category: Releases
---

At Snowplow we are often asked how best to orchestrate multi-stage ETL pipelines, where these pipelines typically include [Snowplow] [snowplow] and our [SQL Runner] [sql-runner], sometimes [Huskimo] [huskimo] and often third-party apps and scripts.

There is a bewildering array set of tools available for this kind of orchestration, including [AWS Data Pipeline] [aws-data-pipeline], [Luigi] [luigi], [Chronos] [chronos], [Jenkins] [jenkins] and [Airflow] [airflow]. These tools tend to have the following two capabilities:

1. A job-scheduler, which determines when each batch processing job will run
2. A DAG-runner, which can treat a job as a [Directed Acylic Graph] [dag] of inter-dependent steps and run those steps in the correct order 

Make no mistake - these are powerful tools which let you to orchestrate sophisticated batch processing pipelines. But with that power comes complexity, and operating these sytems reliably is not always straightforward - for example see [Kyle Kingsbury's recent testing of Chronos] [aphyr-chronos], where he wrote:

<blockquote><p>
If you already use Chronos, I suggest you... ensure your jobs are OK with never being run at all
</p></blockquote>

If you are just starting out with your first batch processing pipelines, consider a much simpler approach: combining the standard Unix tools `cron` and `make` to orchestrate your jobs. This blog post provides a simple walkthrough for this approach:

1. [Introduce our pipeline](/blog/2015/10/02/snowplow-r71-stork-billed-kingfisher-released#xxx)
2. [JSON validation in Scala Common Enrich](/blog/2015/10/02/snowplow-r71-stork-billed-kingfisher-released#xxx)
3. [New unstructured event fields in enriched events](/blog/2015/10/02/snowplow-r71-stork-billed-kingfisher-released#xxx)

<!--more-->



<h2 id="new-features">1. New features</h2>

The main addition is the ability to run SQL against Redshift and Postgres databases which have SSL security enabled. Many thanks to Dennis Waldron from Space Ape Games for contributing this feature!

Update the database targets in your playbooks to use the new `ssl` parameter:

{% highlight yaml %}
targets:
  - name: "My Postgres database 1"
    type: postgres
    host: localhost
    database: sql_runner_tests_1
    port: 5432
    username: postgres
    password:
    ssl: false # SSL disabled by default, or set to true
{% endhighlight %}

Other updates in this version:

* Fixed typo of "queries executed againt targets" ([#20] [issue-20])
* Updated vagrant up to work with latest Peru version ([#25] [issue-25])
* Replaced bitbucket.org/kardianos/osext with github.com/kardianos/osext ([#33] [issue-33])

<h2 id="upgrading">2. Upgrading</h2>

A version of SQL Runner for 64-bit Linux is available on Bintray, download it like so:

{% highlight bash %}
$ wget http://dl.bintray.com/snowplow/snowplow-generic/sql_runner_0.2.0_linux_amd64.zip
{% endhighlight %}

Once downloaded, unzip it:

{% highlight bash %}
$ unzip sql_runner_0.2.0_linux_amd64.zip
{% endhighlight %}

Run it like so:

{% highlight bash %}
$ ./sql-runner
sql-runner version: 0.2.0
Run playbooks of SQL scripts in series and parallel on Redshift and Postgres
Usage:
  -help=false: Shows this message
  -playbook="": Playbook of SQL scripts to execute
  -sqlroot="PLAYBOOK": Absolute path to SQL scripts. Use PLAYBOOK and BINARY for those respective paths
  -version=false: Shows the program version
{% endhighlight %}

Remember to update your database targets in playbooks to use the new `ssl` parameter.

<h2 id="help">3. Getting help</h2>

For more details on this release, please check out the [SQL Runner 0.2.0 release notes][020-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[snowplow]: http://snowplowanalytics.com/
[huskimo]: https://github.com/snowplow/huskimo
[sql-runner]: zzz

[aws-data-pipeline]: https://aws.amazon.com/datapipeline/
[luigi]: https://github.com/spotify/luigi
[airflow]: http://nerds.airbnb.com/airflow/
[chronos]: https://github.com/mesos/chronos
[jenkins]: https://jenkins-ci.org/

[dag]: https://github.com/snowplow/sql-runner

[aphyr-chronos]: https://aphyr.com/posts/326-call-me-maybe-chronos

[make]: http://www.gnu.org/software/make/

[020-release]: https://github.com/snowplow/sql-runner/releases/tag/0.2.0

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
