---
layout: post
shortenedlink: Snowplow 0.9.7 released
title: Snowplow 0.9.7 released with important bug fixes
tags: [snowplow, shred, bug fix, bug, hive]
author: Author
category: Releases
---

We are pleased to announce the immediate availability of Snowplow 0.9.7. 0.9.7 is a "tidy-up" release which fixes some important bugs, particularly:

1. A bug in 0.9.5 onwards which was preventing events containing multiple JSONs from being shredded successfully (#XXX)
2. Our Hive table definition falling behind Snowplow 0.9.6's enriched event format updates (#XXX)
3. A bug in EmrEtlRunner causing issues running Snowplow inside some VPC environments (#XXX)

As well as these important fixes, 0.9.7 comes with a set of smaller bug fixes plus two new features:

* The ability to perform shredding without prior enrichment (i.e. shred an existing folder of enriched events)
* The ability to load Redshift from an S3 bucket in a region different to Redshift's own region

Below the fold we will cover:

1. [Shredding bug fix and new shredding functionality](/blog/2014/09/xx/snowplow-0.9.7-released-with-important-bug-fixes/#shredding)
2. [Other bug fixes](/blog/2014/09/xx/snowplow-0.9.7-released-with-important-bug-fixes/#other-bug-fixes)
3. [Other new functionality](/blog/2014/09/xx/snowplow-0.9.7-released-with-important-bug-fixes/#other-new-functionality)
4. [Upgrading](/blog/2014/09/xx/snowplow-0.9.7-released-with-important-bug-fixes/#upgrading)
5. [Help](/blog/2014/09/xx/snowplow-0.9.7-released-with-important-bug-fixes/#help)

<!--more-->

<h2><a name="shredding">1. Shredding bug fix and new shredding functionality</a></h2>

We discovered a serious bug (#XXX) in the new shredding functionality released in Snowplow 0.9.6. This bug meant that, for any enriched event which contained more than one JSON, none of those JSONs would be successfully shredded. Some examples of enriched events containing more than one JSON would be:

* An unstructured event with a single custom context attached
* A link click with a single custom context attached
* A page view with two custom contexts attached 

Events containing zero or one JSONs were not affected by this bug. 

This release fixes this bug and also introduces some new functionality to make it easier to re-shred of existing enriched events. You can now run the Shredding process on Elastic MapReduce without the prior Enrichment process, by using the command-line option:

{% highlight bash %}
$ bundle exec bin/snowplow-emr-etl-runner ... --process-shred s3n://my-bucket/enriched/good/run=2014-09-01-03-33-45
{% endhighlight %}

For more information see XXX.

<h2><a name="other-bug-fixes">2. Other bug fixes</a></h2>

<h2><a name="other-new-functionality">3. Other new functionality</a></h2>

<h2><a name="upgrading">4. Upgrading</a></h2>

<div class="html">
<h3><a name="upgrading-emretlrunner">4.1 Upgrading EmrEtlRunner and StorageLoader</a></h3>
</div>

You need to update EmrEtlRunner and StorageLoader to the latest code (0.9.7 release) on GitHub:

{% highlight bash %}
$ git clone git://github.com/snowplow/snowplow.git
$ git checkout 0.9.7
$ cd snowplow/3-enrich/emr-etl-runner
$ bundle install --deployment
$ cd ../../4-storage/storage-loader
$ bundle install --deployment
{% endhighlight %}

<div class="html">
<h3><a name="upgrading-config">4.2 Updating EmrEtlRunner's configuration</a></h3>
</div>

Update your EmrEtlRunner's `config.yml` file. Update your Hadoop shred job's version to 0.2.1, like so:

{% highlight yaml %}
  :versions:
    ...
    :hadoop_shred: 0.2.1 # WAS 0.2.0
{% endhighlight %}

For a complete example, see our [sample `config.yml` template] [emretlrunner-config-yml].

<div class="html">
<h3><a name="upgrading-hive">8.3 Upgrading for Hive users</a></h3>
</div>

You can find the new x y.

<h2><a name="help">5. Help</a></h2>

For more details on this release, please check out the [0.9.7 Release Notes] [snowplow-097] on GitHub.

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample

[emretlrunner-wiki]: https://github.com/snowplow/snowplow/wiki/2-Using-EmrEtlRunner

[xxx]: https://github.com/snowplow/snowplow/issues/xxx

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[snowplow-097]: https://github.com/snowplow/snowplow/releases/0.9.7
