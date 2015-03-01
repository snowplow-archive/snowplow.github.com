---
layout: post
shortenedlink: Snowplow 61 released
title: Snowplow 61 Pygmy Parrot released
tags: [snowplow, beanstalk, clojure collector, cloudfront]
author: Alex
category: Releases
---

We are pleased to announce the immediate availability of Snowplow 61, Pygmy Parrot.



The rest of this post will cover the following topics:

1. [CloudFront access log parsing](/blog/2015/03/01/snowplow-r61-pygmy-parrot-released/#cf-access-log-parsing)
2. [Clojure Collector updates](/blog/2015/03/01/snowplow-r61-pygmy-parrot-released/#clj-collector-updates)
3. [Operational improvements to EmrEtlRunner](/blog/2015/03/01/snowplow-r61-pygmy-parrot-released/#emretlrunner-improvements)
4. [Bug fixes in Scala Common Enrich](/blog/2015/03/01/snowplow-r61-pygmy-parrot-released/#hadoop-improvements)
5. [Upgrading](/blog/2015/03/01/snowplow-r61-pygmy-parrot-released/#upgrading)
6. [Getting help](/blog/2015/03/01/snowplow-r61-pygmy-parrot-released/#help)

<!--more-->

<h2><a name="cf-access-log-parsing">1. CloudFront access log parsing</a></h2>

We have added the ability to parse Amazon CloudFront access logs (web distribution format only) to the Snowplow Hadoop-based pipeline.

If you use CloudFront to power your website or downloads, you can now use Snowplow to process your CloudFront access logs. Snowplow will enrich these logs with the user-agent, page URI fragments and geo-location as standard.

Your CloudFront access logs will be stored in a new table in Redshift `com_amazon_aws_cloudfront_wd_access_log_1`.

<h2><a name="clj-collector-updates">2. Clojure Collector updates</a></h2>

We have updated the Clojure Collector to run using Tomcat 8, which is the default Tomcat version when creating a new Tomcat application on Elastic Beanstalk.

The Clojure Collector now supports CORS and the CORS equivalent for ActionScript3; this will allow the Clojure Collector to support events being `POST`ed from new releases of the JavaScript and ActionScript3 Trackers, coming very soon.

We have also added the ability to disable the setting of third-party cookies altogether: simply configure the [cookie duration] [clj-tomcat-cookie-duration] as `0` and the Clojure Collector will not set its third-party cookie.

<h2><a name="emretlrunner-improvements">3. Operational improvements to EmrEtlRunner</a></h2>

We have made various operational improvements to EmrEtlRunner.

If there are no raw event files to process, EmrEtlRunner now exits with a specific return code. This return code is then detected by `snowplow-runner-and-loader.sh`, which exits gracefully. In other words, there being no files to process no longer causes `snowplow-runner-and-loader.sh` to return with failure.

We have updated EmrEtlRunner's handling of Clojure Collector logs. The logs now get renamed on move like so:

{% highlight yaml %}
basename.yyyy-MM-dd-HH.region.instance.txt.gz
{% endhighlight %}

This new filename format means that the raw logs will be archived to `/yyyy-MM-dd` sub-folders, as the CloudFront Collector's logs are.

Finally, we have added a new check into EmrEtlRunner, which makes sure that the enriched events bucket is empty _prior_ to moving any raw logs into staging. This means much smoother operation when you are running your enrichment process very frequently (e.g. hourly).

<h2><a name="hadoop-improvements">4. Bug fixes in Scala Common Enrich</a></h2>

We have fixed various bugs in Scala Common Enrich, mostly related to character encoding issues:

1. We fixed a bug where our Base64 decoding did not specify UTF-8 charset, causing problems with Unicode text on EMR where the default characterset is `US_ASCII` ([#1403] [issue-1403])
2. We removed an incorrect extra layer of URL decoding from non-Bas64-encoded JSONs ([#1396] [issue-1396])
3. There was a mismatch between the [Snowplow Tracker Protocol] [tracker-protocol], which mandated for `ti_nm` for transaction item name, and Scala Common Enrich, which expected `ti_na`. Scala Common Enrich now accepts both options ([#1401] [issue-1401])
4. We have updated the SnowplowAdapter to accept "charset=UTF-8" as a content-type parameter, to support those web browsers which always attach this content-type parameter to `POST`s ([#1424] [issue-1424])

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

<h2><a name="help">6. Getting help</a></h2>

For more details on this release, please check out the [r61 Pygmy Parrot Release Notes] [r61-release] on GitHub. 

Documentation for the new CloudFront access log parsing is available on the Snowplow wiki:

* [Setup guide][s3-sink-setup]

If you have any questions or run any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

[clj-tomcat-cookie-duration]: https://github.com/snowplow/snowplow/wiki/Additional-configuration-options#4-setting-the-cookie-duration
[tracker-protocol]: xxx

[issue-1403]: https://github.com/snowplow/snowplow/issues/1403
[issue-1396]: https://github.com/snowplow/snowplow/issues/1396
[issue-1401]: https://github.com/snowplow/snowplow/issues/1401
[issue-1424]: https://github.com/snowplow/snowplow/issues/1424

[r61-release]: xxx
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
