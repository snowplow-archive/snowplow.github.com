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

1. [The Kinesis LZO S3 Sink](/blog/2015/02/03/snowplow-60-bee-hummingbird-released/#s3-sink)
2. [Support for POSTs and webhooks in the Scala Stream Collector](/blog/2015/02/03/snowplow-60-bee-hummingbird-released/#ssc)
3. [Scala Stream Collector no longer decodes URLs](/blog/2015/02/03/snowplow-60-bee-hummingbird-released/#url-decoding)
4. [Self-describing Thrift](/blog/2015/02/03/snowplow-60-bee-hummingbird-released/#thrift)
5. [EmrEtlRunner updates](/blog/2015/02/03/snowplow-60-bee-hummingbird-released/#emretlrunner-updates)
6. [Upgrading](/blog/2015/02/03/snowplow-60-bee-hummingbird-released/#upgrading)
7. [Getting help](/blog/2015/02/03/snowplow-60-bee-hummingbird-released/#help)

<!--more-->

<h2><a name="clj-collector-updates">2. Clojure Collector updates</a></h2>

We have updated the Clojure Collector to run using Tomcat 8, which is the default Tomcat version when creating a new Tomcat application on Elastic Beanstalk.

The Clojure Collector now supports CORS and the CORS equivalent for ActionScript3; this will allow the Clojure Collector to support events being `POST`ed from new releases of the JavaScript and ActionScript3 Trackers, coming very soon.

We have also added the ability to disable the setting of third-party cookies altogether: simply configure the [cookie duration] [clj-tomcat-cookie-duration] as `0` and the Clojure Collector will not set its third-party cookie.

<h2><a name="ruby-app-improvements">3. Operational improvements to EmrEtlRunner and snowplow-runner-and-loader.sh</a></h2>

We have made various operational improvements to EmrEtlRunner.

If there are no raw event files to process, EmrEtlRunner now exits with a specific return code. This return code is then detected by `snowplow-runner-and-loader.sh`, which exits gracefully. In other words, there being no files to process no longer causes `snowplow-runner-and-loader.sh` to return with failure.

We have updated EmrEtlRunner's handling of Clojure Collector logs. The logs now get renamed on move like so:

{% highlight yaml %}
basename.yyyy-MM-dd-HH.region.instance.txt.gz
{% endhighlight %}

This new filename format means that the raw logs will be archived to `/yyyy-MM-dd` sub-folders, just as the CloudFront Collector's logs are.

Finally, we have added a new check into EmrEtlRunner, which makes sure that the enriched events bucket is empty _prior_ to moving any raw logs into staging. This means much smoother operation when you are running your enrichment process very frequently (e.g. hourly).

<h2><a name="hadoop-improvements">4. Bug fixes in Scala Common Enrich</a></h2>

We have fixed various bugs in Scala Common Enrich, mostly related to character encoding issues:

1. We fixed a bug where our Base64 decoding did not specify UTF-8 charset, causing problems on EMR where the default characterset is `US_ASCII` (#1403)
2. removed incorrect extra layer of URL decoding from non-Bas64-encoded JSONs (#1396)
3.  added support for ti_nm for transaction item name as well as ti_na (#1401)
4. We have updated the SnowplowAdapter to accept "charset=UTF-8" as a content-type parameter (#1424)

[clj-tomcat-cookie-duration]: https://github.com/snowplow/snowplow/wiki/Additional-configuration-options#4-setting-the-cookie-duration

[issue-xxx]: xxx
