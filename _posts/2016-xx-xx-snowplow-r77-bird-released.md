---
layout: post
title: Snowplow 77 Bird
title-short: Snowplow 77 Bird
tags: [snowplow, hadoop, shred, emretlrunner, storageloader]
author: Fred
category: Releases
---

Snowplow release 77 is now available to the general public! This release focuses on the command line applications used to orchestrate Snowplow.

1. [Elastic MapReduce AMI 4.x series compatibility](/blog/2016/xx/xx/snowplow-r77-bird-released#ami)
2. [Moving towards running Storage Loader on Hadoop](/blog/2016/xx/xx/snowplow-r77-bird-released#ec2)
3. [Retrying the job in the face of bootstrap failures](/blog/2016/xx/xx/snowplow-r77-bird-released#bootstrap)
4. [Monitoring improvements](/blog/2016/xx/xx/snowplow-r77-bird-released#tags)
5. [Upgrading](/blog/2016/xx/xx/snowplow-r77-bird-released#upgrading)
6. [Getting help](/blog/2016/xx/xx/snowplow-r77-bird-released#help)

![bird][bird]

<!--more-->

<h2 id="ami">1. Elastic MapReduce AMI 4.x series compatibility</h2>

Snowplow is now capable of running on version 4.x of Amazon EMR. Achieving this involved three changes:

* A new bootstrap action to put the correct resources on the classpath
* Minor changes to the snowplow-hadoop-shred jar to prevent a NullPointerException thrown by the java.net.URL class on the latest AMI
* Upgrading to the latest version of the [Elasticity][elasticity] library

To get up to date with the latest AMI version, change the "ami_version" field of your configuration YAML to "4.2.0". Make sure you also change the "hadoop_shred" field to at least "0.8.0" to get a compatible version of the snowplow-hadoop-shred jar.

<h2 id="ec2">2. Moving towards running Storage Loader on Hadoop</h2>

At the moment, processing raw data using Snowplow involves two commands: you need to run both the EmrEtlRunner (to process the data) and the Storage Loader (to load the processed data into Redshift). In the future, the Storage Loader will be subordinate to the EmrEtlRunner - it will just be a custom jar step in the EMR job. In this release we have moved towards this goal in two ways.

<h3 id="creds">Getting credentials from EC2</h3>

When running StorageLoader on EC2, you no longer need to configure it with your AWS credentials. Instead you can set the credentials fields to "iam":

{% highlight yaml %}
aws:
  access_key_id: iam
  secret_access_key: iam
{% endhighlight %}

The Storage Loader will then look up the credentials using the EC2 instance metadata.

<h3 id="b64">Encoded configuration</h3>

It is now possible to pass a base-64 encoded configuration string as a command line argument instead of the path to the configuration file. For example:

{% bash %}
./snowplow-storage-loader --base64-config-string $(base64 -w0 path/to/config.yml)
{% endhighlight %}

This is easier than uploading the configuration file to the Hadoop node on which Storage Loader will run.

<h2 id="bootstrap">3. Retrying the job in the face of bootstrap failures</h2>

Sometimes the process of bootstrapping the cluster before the job starts can fail. This release improves the ability of the EmrEtlRunner to recognise these bootstrap failures and restart the job.

<h2 id="tags">4. Monitoring improvements</h2>

EmrEtlRunner's internal Snowplow monitoring can be configured with name-value tags which are sent with every event. In this release we also attach those tags to the EMR job itself, so you can see them in the EMR web UI.

We have also upgraded both apps to the latest version (0.5.2) of the [Snowplow Ruby Tracker](https://github.com/snowplow/snowplow-ruby-tracker).

<h2 id="upgrading">5. Upgrading</h2>

The latest version of the EmrEtlRunner and StorageLoader are available from our Bintray [here][app-dl].

You should upgrade the "ami_version" and "hadoop_shred" fields of your configuration YAML as described above.

Note also that the snowplow-runner-and-loader.sh script has been updated to use the JRuby binaries rather than the raw Ruby project.

<h2 id="help">6. Getting help</h2>

For more details on this release, please check out the [release notes][release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[elasticity]: https://github.com/rslifka/elasticity
[app-dl]: http://dl.bintray.com/snowplow/snowplow-generic
[release]: https://github.com/snowplow/snowplow/releases/tag/r77-bird
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
