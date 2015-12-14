---
layout: post
title: Snowplow 0.9.3 released with Clojure Collector fixes
title-short: Snowplow 0.9.3
tags: [snowplow, clojure collector, emretlrunner]
author: Alex
category: Releases
---

We are pleased to announce the release of Snowplow 0.9.3, with a whole host of incremental improvements to EmrEtlRunner, plus two important bug fixes for Clojure Collector users.

The first Clojure Collector issue was a problem in the file move functionality in EmrEtlRunner, which was preventing Clojure Collector users from scaling beyond a single instance without data loss. Many thanks to community members Derk Busser and [Ryan Doherty] [smugryan] for identifying the issue and working with us on a fix.

The second Clojure Collector issue involved the Elastic Beanstalk's Apache proxy's IP address(es) showing up in the `atomic.events` table in place of the expected end-user's IPs. We were unable to reproduce this issue when running multiple instances, so we do not believe this problem is as widespread.

This release also includes some documentation updates - many thanks to community members [Arthur Cinader] [acinader] and [Peter Vandenberk] [pvdb] for these.

Read on below the fold for:

1. [Clojure Collector fixes](/blog/2014/05/21/snowplow-0.9.3-released-with-clojure-collector-fixes/#clj-fixes)
2. [EmrEtlRunner enhancements](/blog/2014/04/30/snowplow-0.9.3-released-with-clojure-collector-fixes/#emr-etl-runner)
3. [Upgrading](/blog/2014/05/21/snowplow-0.9.3-released-with-clojure-collector-fixes/#upgrading)
4. [Getting help](/blog/2014/05/21/snowplow-0.9.3-released-with-clojure-collector-fixes/#help)

<!--more-->

<div class="html">
<h2><a name="clj-fixes">1. Clojure Collector fixes</a></h2>
</div>

Both Clojure Collector issues related to running multiple instances of the Collector:

1. Each Elastic Beanstalk Collector instance was writing its raw event files with consistently the same timestamp-based names. Because the EmrEtlRunner's file move functionality was not preserving sub-folder names when moving raw event files into the processing directory, all but one instance's raw events would be lost. So a user with three instances would only see ~33% of their data ([issue #717] [issue-717])
2. We had a report from community member Iain Gray in [this email thread] [clj-ip-thread] that he was seeing the Elastic Beanstalk Apache proxy's IP address(es) showing up in his `atomic.events` table in place of the expected end-user's IPs ([issue #719] [issue-719])

We fixed the first issue with an update to EmrEtlRunner: each raw event file's parent sub-directory is now prepended to the filename during the move to the Processing bucket. So for example:

{% highlight bash %}
// Raw files from two instances with same filename
raw-bucket/resources/environments/logs/publish/e-bgp9nsynv7/i-13aabd52/_var_log_tomcat7_localhost_access_log.txt-1400605261.gz
raw-bucket/resources/environments/logs/publish/e-bgp9nsynv7/i-ec19d9af/_var_log_tomcat7_localhost_access_log.txt-1400605261.gz

// -> are renamed safely in processing with the sub-folder name
processing-bucket/snplow2/processing/i-13aabd52-_var_log_tomcat7_localhost_access_log.txt-1400605261.gz
processing-bucket/snplow2/processing/i-ec19d9af-_var_log_tomcat7_localhost_access_log.txt-1400605261.gz
{% endhighlight %}   

We were unable to reproduce Iain's bug ([issue #719] [issue-719]) ourselves with a multiple-instance Clojure Collector setup, but we came up with a likely fix and applied this as part of this release. This fix bumps the Snowplow Clojure Collector version to 0.6.0.

<div class="html">
<h2><a name="emr-etl-runner">2. EmrEtlRunner enhancements</a></h2>
</div>

We have made a variety of other bug fixes and small improvements to EmrEtlRunner in this release. Most importantly, the bug fixes:

1. We fixed an issue where EmrEtlRunner was kicking off the job on EMR even if there were no raw event files loaded into the `:processing:` bucket ([#409] [issue-409])
2. We fixed a bug where it was **not** possible to disable Cascading's catching of unexpected exceptions by leaving the `:out_errors:` bucket blank ([#721] [issue-721])
3. We fixed a very tricky issue where the threads used to move files could be killed off one-by-one if they encountered sub-directories whilst processing ([#401] [issue-401])

We have also made some changes which impact on the format of the `config.yml` file, so do please read these carefully:

* We replaced `:hadoop_version:` with `:ami_version:`, because the Hadoop version on EMR is [now determined exclusively] [hadoop-versions] by the AMI setting ([#701] [issue-701])
* We added in a compulsory new `:region:` field alongside the existing `:placement:` and `:ec2_subnet_id:` fields, and clarified when to use each ([#754] [issue-754])
* We updated EmrEtlRunner to use proper Ruby logging, configurable with a new `:logging:` section ([#194] [issue-194])

You can find the updated `config.yml` template [here] [config-yml]. We cover upgrading EmrEtlRunner and your existing `config.yml` in the Upgrading section below.

Finally, we made a few under-the-covers improvements to EmrEtlRunner, which should help with maintainability and ease-of-deployment going forwards:

* We added some initial unit tests ([#672] [issue-672])
* We added Ruby contracts onto all function signatures ([#392] [issue-392])
* We added the ability to bundle EmrEtlRunner as a JRuby fat jar ([#674] [issue-674])
* We re-architected EmrEtlRunner so that it's embeddable in other applications ([#128] [issue-128])

Expect to hear more about JRuby and embedding EmrEtlRunner in the coming months as we bring some of these improvements to StorageLoader too.

<div class="html">
<h2><a name="upgrading">3. Upgrading</a></h2>
</div>

Upgrading is a two step process:

1. [Update EmrEtlRunner](#emr-etl-runner)
2. [Update Clojure Collector](#storage-loader) - _optional_

Let's take these in turn:

<div class="html">
<a name="emr-etl-runner"><h3>3.1 Update the EmrEtlRunner</h3></a>
</div>

You need to update EmrEtlRunner to the latest code (version 0.7.0, in the Snowplow 0.9.3 release) on GitHub:

{% highlight bash %}
$ git clone git://github.com/snowplow/snowplow.git
$ git checkout 0.9.3
$ cd snowplow/3-enrich/emr-etl-runner
$ bundle install --deployment
{% endhighlight %}

You also need to update your EmrEtlRunner's `config.yml` file in a few places. First add a logging section at the top:

{% highlight yaml %}
:logging:
  :level: DEBUG # You can optionally switch to INFO for production
{% endhighlight %}

Next you need to replace this:

{% highlight yaml %}
:emr:
  :hadoop_version: 1.0.3
{% endhighlight %}

with this:

{% highlight yaml %}
:emr:
  :ami_version: 2.4.2
{% endhighlight %}

If you need to use a different Hadoop version, check out [this handy table] [hadoop-versions] to determine the correct AMI version.

Finally, add the region in:

{% highlight yaml %}
:emr:
  :ami_version: 2.4.2
  :region: us-east-1 # Or your region
{% endhighlight %}

Your `:region:` will be your existing `:placement:` without the character on the end. Note that if you are running your EMR job in an EC2 subnet, you no longer need to set the `:placement:` field.

Once you have made these changes, do check your final version against the updated `config.yml` template [here] [config-yml].

<div class="html">
<a name="emr-etl-runner"><h3>3.2 Update the Clojure Collector</h3></a>
</div>

This release bumps the Clojure Collector to version **0.6.0**. Upgrading to this release is only necessary if you have been encountering the issue with proxy IPs appearing in `atomic.events`, as discussed in [this email thread] [clj-ip-thread] (issue [#719] [issue-719]).

To upgrade to this release:

1. Download the new warfile by right-clicking on [this link] [war-download] and selecting "Save As..."
2. Log in to your Amazon Elastic Beanstalk console
3. Browse to your Clojure Collector's application
4. Click the "Upload New Version" and upload your warfile

And that's it!

<div class="html">
<h2><a name="help">4. Getting help</a></h2>
</div>

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

For more details on this release, please check out the [0.9.3 Release Notes] [snowplow-093] on GitHub.

[acinader]: https://github.com/acinader
[pvdb]: https://github.com/pvdb
[smugryan]: https://github.com/smugryan

[hadoop-versions]: http://docs.aws.amazon.com/ElasticMapReduce/latest/DeveloperGuide/emr-plan-hadoop-version.html
[clj-ip-thread]: https://groups.google.com/forum/#!topic/snowplow-user/rCSrtBwpcac

[issue-128]: https://github.com/snowplow/snowplow/issues/128
[issue-194]: https://github.com/snowplow/snowplow/issues/194
[issue-392]: https://github.com/snowplow/snowplow/issues/392
[issue-401]: https://github.com/snowplow/snowplow/issues/401
[issue-409]: https://github.com/snowplow/snowplow/issues/409
[issue-672]: https://github.com/snowplow/snowplow/issues/672
[issue-674]: https://github.com/snowplow/snowplow/issues/674
[issue-701]: https://github.com/snowplow/snowplow/issues/701
[issue-717]: https://github.com/snowplow/snowplow/issues/717
[issue-719]: https://github.com/snowplow/snowplow/issues/719
[issue-721]: https://github.com/snowplow/snowplow/issues/721
[issue-754]: https://github.com/snowplow/snowplow/issues/754

[config-yml]: https://github.com/snowplow/snowplow/blob/0.9.3/3-enrich/emr-etl-runner/config/config.yml.sample
[war-download]: http://s3-eu-west-1.amazonaws.com/snowplow-hosted-assets/2-collectors/clojure-collector/clojure-collector-0.6.0-standalone.war

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[snowplow-093]: https://github.com/snowplow/snowplow/releases/0.9.3
