---
layout: post
title: Snowplow 68 Turquoise Jay released
title-short: Snowplow 68
tags: [snowplow, emr, emretlrunner, ruby]
author: Fred
category: Releases
---

We are happy to announce the release of Snowplow 68, Turquoise Jay. This is a small release which adapts the EmrEtlRunner to use the new [Elastic MapReduce][emr] API.

Table of contents:

1. [Updates to the Elastic MapReduce API](/blog/2015/07/23/snowplow-r68-turquoise-jay-released#api)
2. [Multiple "in" buckets](/blog/2015/07/23/snowplow-r68-turquoise-jay-released#multiple-in-buckets)
3. [Backwards compatibility with old Hadoop Enrich versions](/blog/2015/07/23/snowplow-r68-turquoise-jay-released#jar-path)
4. [Upgrading](/blog/2015/07/23/snowplow-r68-turquoise-jay-released#upgrading)
5. [Getting help](/blog/2015/07/23/snowplow-r68-turquoise-jay-released#help)

![turquoise-jay][turquoise-jay]

<!--more-->

<h2 id="api">1. Updates to the Elastic MapReduce API</h2>

The Snowplow EmrEtlRunner uses [Rob Slifka][rslifka]'s [Elasticity][elasticity] Ruby library to interact with the Elastic MapReduce API. AWS recently altered this API for new AWS users so that it is now based on clusters rather than job flows, breaking the API calls used by Elasticity to check the status of an EMR job.

Rob has moved very fast to put out a new Elasticity release (version 6.0.2) using the all-new EMR APIs. Thanks a lot Rob!

For more information about Elasticity, check out Rob's [guest post][rob-post] from back in 2013.

<h2 id="multiple-in-buckets">2. Multiple "in" buckets</h2>

The EmrEtlRunner is no longer limited to a single bucket. Now you can specify an array of in buckets in the configuration YAML and raw event files from all of them will be moved to the processing bucket. This is helpful when upgrading your collector version: you can process events from your own and new collectors in tandem until all event traffic has moved to the new collector.

See the repository for [an example configuration file][sample-config].

<h2 id="jar-path">3. Backwards compatibility with old Hadoop Enrich versions</h2>

More recent versions of Scala Hadoop Enrich (1.0.0 and later) are stored in a different S3 bucket from previous versions. Unforunately, our previous EmrEtlRunner release (0.15.0 in [Release 66 Oriental Skylark] [r66-release]) always looked in the new location, no matter what version of Hadoop Enrich was specified.

The new version of EmrEtlRunner decides where to look for the jar based on the jar's version; this means that you can use the latest EmrEtlRunner version with earlier versions of Hadoop Enrich.

<h2 id="upgrading">4. Upgrading</h2>

You need to update EmrEtlRunner to the latest version (**0.16.0**) on GitHub:

{% highlight bash %}
$ git clone git://github.com/snowplow/snowplow.git
$ git checkout r68-turquoise-jay
$ cd snowplow/3-enrich/emr-etl-runner
$ bundle install --deployment
$ cd ../../4-storage/storage-loader
$ bundle install --deployment
{% endhighlight %}

<h2 id="help">5. Getting help</h2>

For more details on this release, please check out the [r68 Turquoise Jay][r68-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[turquoise-jay]: /assets/img/blog/2015/07/turquoise-jay.jpg

[emr]: http://aws.amazon.com/elasticmapreduce/
[elasticity]: https://github.com/rslifka/elasticity
[rslifka]: https://github.com/rslifka
[rob-post]: http://snowplowanalytics.com/blog/2013/03/20/rob-slifka-elasticity/
[sample-config]: https://github.com/snowplow/snowplow/blob/kinesis-redshift-sink/3-enrich/emr-etl-runner/config/config.yml.sample

[r66-release]: https://github.com/snowplow/snowplow/releases/tag/r66-oriental-skylark
[r68-release]: https://github.com/snowplow/snowplow/releases/tag/r68-turquoise-jay
[wiki]: https://github.com/snowplow/snowplow/wiki
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
