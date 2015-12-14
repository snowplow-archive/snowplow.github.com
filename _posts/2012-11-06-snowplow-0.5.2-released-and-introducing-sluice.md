---
layout: post
title: Snowplow 0.5.2 released, and introducing the Sluice Ruby gem
title-short: Snowplow 0.5.2
tags: snowplow sluice ruby
author: Alex
category: Releases
---

Another week, another release: Snowplow **0.5.2**! This is a small release, consisting just of a small set of bug fixes and improvements to EmrEtlRunner - although we'll also use this post to introduce our new Ruby gem, called Sluice.

Many thanks to community member <a href="https://github.com/testower">Tom Erik Stower</a> for his testing of EmrEtlRunner over the weekend, which helped us to identify and fix these bugs:

## Bugs fixed

**[Issue 71] [71]**: the template `config.yml` (in the GitHub repo and in the wiki) was specifying an out-of-date version for the Hive deserializer. We have updated this to specify version **0.5.0** of the serde, like so:

{% highlight yaml %}
...
:snowplow:
  :serde_version: 0.4.9
...
{% endhighlight %}

**[Issue 72] [72]**: Tom's testing also identified a bug in EmrEtlRunner's log archiving, which only occurs if the Processing Bucket contains sub-folders. This has now been fixed too.

<!--more-->

## A new feature: --skip

A new release which only contains bug fixes is a boring release, so we have also implemented a new `--skip` option for EmrEtlRunner ([issue #58] [58]). You can use this when you call EmrEtlRunner like so:

{% highlight bash %}   
$ bundle exec snowplow-emr-etl-runner <...> --skip staging OR --skip emr
{% endhighlight %}

This option skips the work steps **up to and including** the specified step. To give an example: `--skip emr` skips both moving the raw logs to the Staging Bucket **and** running the ETL process on Amazon EMR, i.e. EmrEtlRunner will **only*** perform the final archiving step.

`--skip` is useful if you encounter a problem midway through your ETL process: you can fix the problem and then skip the steps which ran okay, rather than re-processing from the start. We find it especially helpful when we're testing new versions of EmrEtlRunner.

## And introducing Sluice

At Snowplow Analytics we are committed to making our software as modular and loosely-coupled as possible. Where we have functionality which could be more widely used, we aim to extract it into standalone modules for developers to use even if they are not implementing Snowplow.

We have followed this approach with the parallel file-copy code for Amazon S3 added to EmrEtlRunner by community member [Michael Tibben] [mtibben] from [99designs] [99designs]: we have moved this code out of EmrEtlRunner into a new Ruby gem, called Sluice. Sluice now has its own [GitHub repository] [sluice-repo], and has been published on [RubyGems.org] [sluice-rubygems]. It's called Sluice because, like [Chris Wensel] [cwensel] (Cascading), we believe in flowing-water metaphors for ETL tools :-)

Sluice is used by our EmrEtlRunner, and is also a dependency for the StorageLoader Ruby application which we are currently developing.

We hope to build out Sluice as a general-purpose Ruby toolkit for cloud-friendly ETL over the coming months - and would love contributors! Our view is that, in a world of cloud services like Amazon S3, Google BigQuery and Elastic MapReduce, it makes most sense to take a programmatic approach to ETL, rather than contort the historic, application-based approach of [Talend] [talend], [Pentaho DI] [pdi] et al. We see Sluice as part of that toolkit for programmatic ETL, alongside great tools such as [Cascading] [cascading], Rob Slifka's [Elasticity] [elasticity] and [Pallet] [pallet].

[testower]: https://github.com/testower
[71]: https://github.com/snowplow/snowplow/issues/71
[72]: https://github.com/snowplow/snowplow/issues/72
[58]: https://github.com/snowplow/snowplow/issues/58

[sluice-repo]: https://github.com/snowplow/sluice
[sluice-rubygems]: http://rubygems.org/gems/sluice

[mtibben]: https://github.com/mtibben
[99designs]: http://99designs.com

[talend]: http://www.talend.com
[pdi]: http://www.pentaho.com/explore/pentaho-data-integration/

[cwensel]: https://github.com/cwensel
[cascading]: http://www.cascading.org
[elasticity]: https://github.com/rslifka/elasticity
[pallet]: http://palletops.com
