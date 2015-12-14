---
layout: post
title: Snowplow 61 Pygmy Parrot released
title-short: Snowplow 61 Pygmy Parrot
tags: [snowplow, beanstalk, clojure collector, cloudfront]
author: Alex
category: Releases
---

We are pleased to announce the immediate availability of Snowplow 61, Pygmy Parrot.

This release has a variety of new features, operational enhancements and bug fixes. The major additions are:

1. You can now parse Amazon CloudFront access logs using Snowplow
2. The latest Clojure Collector version supports Tomcat 8 and CORS, ready for cross-domain `POST` from JavaScript and ActionScript
3. EmrEtlRunner's failure handling and Clojure Collector log handling have been improved

The rest of this post will cover the following topics:

1. [CloudFront access log parsing](/blog/2015/03/02/snowplow-r61-pygmy-parrot-released/#cf-access-log-parsing)
2. [Clojure Collector updates](/blog/2015/03/02/snowplow-r61-pygmy-parrot-released/#clj-collector-updates)
3. [Operational improvements to EmrEtlRunner](/blog/2015/03/02/snowplow-r61-pygmy-parrot-released/#emretlrunner-improvements)
4. [Bug fixes in Scala Common Enrich](/blog/2015/03/02/snowplow-r61-pygmy-parrot-released/#hadoop-improvements)
5. [Upgrading](/blog/2015/03/02/snowplow-r61-pygmy-parrot-released/#upgrading)
6. [Getting help](/blog/2015/03/02/snowplow-r61-pygmy-parrot-released/#help)

<!--more-->

<h2><a name="cf-access-log-parsing">1. CloudFront access log parsing</a></h2>

We have added the ability to parse Amazon CloudFront access logs (web distribution format only) to the Snowplow Hadoop-based pipeline.

If you use CloudFront as your CDN for web content, you can now use Snowplow to process your CloudFront access logs. Snowplow will enrich these logs with the user-agent, page URI fragments and geo-location as standard.

To process CloudFront access logs, first create a new EmrEtlRunner `config.yml`:

1. Set your `:raw:in:` bucket to where your logs are written
2. Set your `:etl:collector_format:` to `tsv/com.amazon.aws.cloudfront/wd_access_log`
3. Provide new bucket paths and a new job name, to prevent this job from clashing with your existing Snowplow job(s)

If you are running the Snowplow batch (Hadoop) flow with Amazon Redshift, you should deploy the relevent event table into your Amazon Redshift database. You can find the table definition here:

* [com_amazon_aws_cloudfront_wd_access_log_1.sql] [access-log-sql]

You can either load these events using your existing `atomic.events` table, or if you prefer load into an all-new database or schema. If you load into your existing `atomic.events` table, make sure to schedule these loads so that they don't clash with your existing loads.

<h2><a name="clj-collector-updates">2. Clojure Collector updates</a></h2>

We have updated the Clojure Collector to run using Tomcat 8, which is now the default Tomcat version when creating a new Tomcat application on Elastic Beanstalk.

As of this release the Clojure Collector supports CORS and the CORS equivalent for ActionScript; this will allow the Clojure Collector to support events being `POST`ed from new releases of the JavaScript and ActionScript Trackers, coming very soon.

We have also added the ability to disable the setting of third-party cookies altogether: simply configure the [cookie duration] [clj-tomcat-cookie-duration] to `0` and the Clojure Collector will not set its third-party cookie.

<h2><a name="emretlrunner-improvements">3. Operational improvements to EmrEtlRunner</a></h2>

We have made various operational improvements to EmrEtlRunner.

If there are no raw event files to process, EmrEtlRunner will now exit with a specific return code. This return code is then detected by `snowplow-runner-and-loader.sh`, which will then exit without failure. In other words: an absence of files to process no longer causes `snowplow-runner-and-loader.sh` to exit with failure.

We have updated EmrEtlRunner's handling of Clojure Collector logs. The logs now get renamed on move to:

{% highlight yaml %}
basename.yyyy-MM-dd-HH.region.instance.txt.gz
{% endhighlight %}

This new filename format means that the raw logs will be archived to `/yyyy-MM-dd` sub-folders, just as the CloudFront Collector's logs are.

Finally, we have updated EmrEtlRunner to also check that the enriched events bucket is empty _prior_ to moving any raw logs into staging. If any enriched events are found, then the move to staging will not start. This makes for much smoother operation when you are running your enrichment process very frequently (e.g. hourly).

<h2><a name="hadoop-improvements">4. Bug fixes in Scala Common Enrich</a></h2>

We have fixed various bugs in Scala Common Enrich, mostly related to character encoding issues:

1. We fixed a bug where our Base64 decoding did not specify UTF-8 charset, causing problems with Unicode text on EMR where the default characterset is `US_ASCII` ([#1403] [issue-1403])
2. We removed an incorrect extra layer of URL decoding from non-Bas64-encoded JSONs ([#1396] [issue-1396])
3. There was a mismatch between the [Snowplow Tracker Protocol] [tracker-protocol], which mandated `ti_nm` for transaction item's names, and Scala Common Enrich, which was expecting `ti_na` for the same. Scala Common Enrich now supports both options ([#1401] [issue-1401])
4. We have updated the `SnowplowAdapter` component to accept "charset=UTF-8" as a content-type parameter, because some web browsers always attach this content-type parameter to their `POST`s ([#1424] [issue-1424])

<h2><a name="upgrading">5. Upgrading</a></h2>

<div class="html">
<h3><a name="upgrading-emretlrunner">5.1 Upgrading your EmrEtlRunner</a></h3>
</div>

You need to update EmrEtlRunner to the latest code (**0.12.0**) on GitHub:

{% highlight bash %}
$ git clone git://github.com/snowplow/snowplow.git
$ git checkout r61-pygmy-parrot
$ cd snowplow/3-enrich/emr-etl-runner
$ bundle install --deployment
$ cd ../../4-storage/storage-loader
$ bundle install --deployment
{% endhighlight %}

If you currently use `snowplow-runner-and-loader.sh`, upgrade to the [latest version] [runner-and-loader] too.

<div class="html">
<h3><a name="configuring-emretlrunner">5.2 Updating your EmrEtlRunner's configuration</a></h3>
</div>

This release bumps the Hadoop Enrichment process to version **0.13.0** .

In your EmrEtlRunner's `config.yml` file, update your `hadoop_enrich` and `hadoop_shred` jobs' versions like so:

{% highlight yaml %}
  :versions:
    :hadoop_enrich: 0.13.0 # WAS 0.12.0
{% endhighlight %}

For a complete example, see our [sample `config.yml` template] [emretlrunner-config-yml].

<div class="html">
<h3><a name="upgrading-clojure">5.3 Updating your Clojure Collector</a></h3>
</div>

This release bumps the Clojure Collector to version **1.0.0**.

You will **not** be able to upgrade an existing Tomcat 7 cluster to use this version. Instead, to upgrade to this release:

1. Download the new warfile by right-clicking on [this link] [war-download] and selecting "Save As..."
2. Log in to your Amazon Elastic Beanstalk console
3. Browse to your Clojure Collector's application
4. Click the "Launch New Environment" action
5. Click the "Upload New Version" and upload your warfile

When you are confident that the new collector is performing as expected, you can choose the "Swap Environment URLs" action to put the new collector live.

<h2><a name="help">6. Getting help</a></h2>

For more details on this release, please check out the [r61 Pygmy Parrot Release Notes] [r61-release] on GitHub.

If you have any questions or run any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

[clj-tomcat-cookie-duration]: https://github.com/snowplow/snowplow/wiki/Additional-configuration-options#4-setting-the-cookie-duration
[tracker-protocol]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol

[issue-1403]: https://github.com/snowplow/snowplow/issues/1403
[issue-1396]: https://github.com/snowplow/snowplow/issues/1396
[issue-1401]: https://github.com/snowplow/snowplow/issues/1401
[issue-1424]: https://github.com/snowplow/snowplow/issues/1424

[access-log-sql]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.amazon.aws.cloudfront/wd_access_log_1.sql
[runner-and-loader]: https://github.com/snowplow/snowplow/blob/master/4-storage/storage-loader/bin/snowplow-runner-and-loader.sh
[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample
[war-download]: http://d2io1hx8u877l0.cloudfront.net/2-collectors/clojure-collector/clojure-collector-1.0.0-standalone.war

[r61-release]: https://github.com/snowplow/snowplow/releases/tag/r61-pygmy-parrot
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
