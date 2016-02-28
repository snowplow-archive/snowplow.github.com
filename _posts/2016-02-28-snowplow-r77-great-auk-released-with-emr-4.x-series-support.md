---
layout: post
title-short: Snowplow 77 Great Auk
title: "Snowplow 77 Great Auk released with EMR 4.x series support"
tags: [snowplow, hadoop, shred, emr, emretlrunner, storageloader]
author: Fred
category: Releases
---

Snowplow release 77 Great Auk is now available! This release focuses on the command-line applications used to orchestrate Snowplow, bringing Snowplow up-to-date with the new 4.x series of Elastic MapReduce releases.

1. [Elastic MapReduce AMI 4.x series compatibility](/blog/2016/02/28/snowplow-r77-great-auk-released-with-emr-4.x-series-support#ami)
2. [Moving towards running Storage Loader on Hadoop](/blog/2016/02/28/snowplow-r77-great-auk-released-with-emr-4.x-series-support#ec2)
3. [Retrying the job in the face of bootstrap failures](/blog/2016/02/28/snowplow-r77-great-auk-released-with-emr-4.x-series-support#bootstrap)
4. [Monitoring improvements](/blog/2016/02/28/snowplow-r77-great-auk-released-with-emr-4.x-series-support#tags)
5. [Removal of snowplow-emr-etl-runner.sh and snowplow-storage-loader.sh](/blog/2016/02/28/snowplow-r77-great-auk-released-with-emr-4.x-series-support#removal)
6. [Bug fixes and other improvements](//blog/2016/02/28/snowplow-r77-great-auk-released-with-emr-4.x-series-support#bugs)
7. [Upgrading](/blog/2016/02/28/snowplow-r77-great-auk-released-with-emr-4.x-series-support#upgrading)
8. [Roadmap](/blog/2016/02/28/snowplow-r77-great-auk-released-with-emr-4.x-series-support#roadmap)
9. [Getting help](/blog/2016/02/28/snowplow-r77-great-auk-released-with-emr-4.x-series-support#help)

![great-auk][great-auk]

<!--more-->

<h2 id="ami">1. Elastic MapReduce AMI 4.x series compatibility</h2>

Snowplow is now capable of running on version 4.x of Amazon EMR. The [4.x series of releases] [ami-4] for Amazon EMR have some great new features, including support for Apache Spark 1.6, Apache Zeppelin and private VPCs.

Achieving this involved four changes:

* A new bootstrap action to put the correct resources on the classpath
* Minor changes to Scala Hadoop Shred to prevent a `NullPointerException` thrown by the `java.net.URL` class post-upgrade
* Upgrading to the latest version of the [Elasticity][elasticity] library
* Switching from using `javax.script` to `org.mozilla.javascript` for the JavaScript Script Enrichment, to prevent compatibility issues

To get up to date with the latest AMI version, change the "ami_version" field of your configuration YAML to "4.3.0". Make sure you also change the "hadoop_shred" field to at least "0.8.0" to get a compatible version of Scala Hadoop Shred.

<h2 id="ec2">2. Moving towards running StorageLoader on Hadoop</h2>

At the moment, processing raw data using Snowplow involves two commands: you need to run both EmrEtlRunner, to process the data on Elastic MapReduce, and StorageLoader, to load the processed data into Redshift or Postgres.

In the future, StorageLoader will be invisible to the end user - it will become simply a custom jar step in the jobflow on EMR. In this release we have moved towards this goal in two ways.

<h3 id="creds">Getting credentials from EC2</h3>

When running StorageLoader on EC2, you no longer need to configure it with your AWS credentials. Instead you can set the credentials fields to "iam":

{% highlight yaml %}
aws:
  access_key_id: iam
  secret_access_key: iam
{% endhighlight %}

StorageLoader will then look up the credentials using the EC2 instance metadata.

<h3 id="b64">Base64-encoded configuration</h3>

It is now possible to pass a Base64-encoded configuration string as a command line argument instead of the path to the configuration file. For example:

{% highlight bash %}
./snowplow-storage-loader --base64-config-string $(base64 -w0 path/to/config.yml)
{% endhighlight %}

This will make it easier for us to invoke StorageLoader from Hadoop in the future.

<h2 id="bootstrap">3. Retrying the job in the face of bootstrap failures</h2>

Sometimes the process of bootstrapping the cluster before the job starts can fail. This release improves the ability of EmrEtlRunner to recognise these bootstrap failures and restart the job.

<h2 id="tags">4. Monitoring improvements</h2>

EmrEtlRunner's internal Snowplow monitoring can be configured with name-value tags which are sent to a Snowplow collector with every monitoring event. In this release, we also attach those tags to the EMR job itself, so that you can see them in the EMR web UI.

We have also upgraded both apps to the latest version (0.5.2) of the [Snowplow Ruby Tracker](https://github.com/snowplow/snowplow-ruby-tracker).

<h2 id="removal">5. Removal of snowplow-emr-etl-runner.sh and snowplow-storage-loader.sh</h2>

These scripts were originally used to run EmrEtlRunner and StorageLoader as native Ruby apps using RVM. Now that those apps are available on Bintray as easy-to-deploy JRuby jars, these scripts are no longer necessary.

Running EmrEtlRunner and StorageLoader as Ruby (rather than JRuby apps) is no longer actively supported.

<h2 id="bugs">6. Bug fixes and other improvements</h2>

Snowplow R77 Great Auk also includes some important bug fixes and improvements:

* We fixed a serious error in the Currency Conversion Enrichment, whereby an exception would be thrown (failing the overall event) if you attempted to convert from and to the same currency, such as attempting to convert €9.99 to euros ([#2437] [2437])
* Historically, StorageLoader has performed `ANALYZE` statements immediately after the `COPY` statements (in fact in the same transaction), and before any `VACUUM` statements. It is more correct to perform `ANALYZE` after `VACUUM`, so we have reversed the order. Many thanks to [Ryan Doherty] [smugryan] for flagging this! ([#1361] [1361])
* EmrEtlRunner now supports an optional `aws:emr:additional_info` field in `config.yml`, which you can use to access beta EMR features ([#2211] [2211])

<h2 id="upgrading">7. Upgrading</h2>

The latest version of the EmrEtlRunner and StorageLoader are available from our Bintray [here][app-dl].

The recommended AMI version to run Snowplow is now 4.3.0 - update your configuration YAML as follows:

{% highlight yaml %}
emr:
  ami_version: 4.3.0 # WAS 3.7.0
{% endhighlight %}

You will need to update the jar versions in the same section:

{% highlight yaml %}
versions:
  hadoop_enrich: 1.6.0        # WAS 1.5.1
  hadoop_shred: 0.8.0         # WAS 0.7.0
  hadoop_elasticsearch: 0.1.0 # UNCHANGED
{% endhighlight %}

For a complete example, see our [sample `config.yml` template][emretlrunner-config-yml].

Note also that the `snowplow-runner-and-loader.sh` script has been updated to use the JRuby binaries rather than the raw Ruby project.

<h2 id="roadmap">8. Roadmap</h2>

Upcoming Snowplow releases include:

* [Release 78 Great Hornbill][r78-milestone], which will bring the Kinesis pipeline up-to-date with the most recent Scala Common Enrich releases. This will also include click redirect support in the Scala Stream Collector
* [Release 79 Black Swan][r79-milestone], which will allow enriching an event by requesting data from a third-party API

Note that these releases are always subject to change between now and the actual release date.

<h2 id="help">9. Getting help</h2>

For more details on this release, please check out the [release notes][release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[great-auk]: /assets/img/blog/2016/02/great-auk.jpg
[elasticity]: https://github.com/rslifka/elasticity
[ami-4]: https://aws.amazon.com/about-aws/whats-new/2015/07/amazon-emr-release-4-0-0-with-new-versions-of-apache-hadoop-hive-and-spark-now-available/
[app-dl]: http://dl.bintray.com/snowplow/snowplow-generic/snowplow_emr_r77_great_auk.zip
[release]: https://github.com/snowplow/snowplow/releases/tag/r77-great-auk
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

[2437]: https://github.com/snowplow/snowplow/issues/2437
[1361]: https://github.com/snowplow/snowplow/issues/1361
[2211]: https://github.com/snowplow/snowplow/issues/2211
[smugryan]: https://github.com/smugryan

[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample

[r78-milestone]: https://github.com/snowplow/snowplow/milestones/Release%2078%20%5BKIN%5D%20Great%20Hornbill
[r79-milestone]: https://github.com/snowplow/snowplow/milestones/Release%2079%20%5BHAD%5D%20Black%20Swan
