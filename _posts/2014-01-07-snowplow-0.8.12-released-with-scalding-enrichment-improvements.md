---
layout: post
title: Snowplow 0.8.12 released with a variety of improvements to the Scalding Enrichment process
title-short: Snowplow 0.8.12
tags: [snowplow, enrichment, release, scalding]
author: Alex
category: Releases
---

We are very pleased to announce the immediate availability of [Snowplow 0.8.12] [github-release]. We have quite a packed schedule of releases planned over the next few weeks - and we are kicking off with 0.8.12, which consists of various small improvements to our Scalding-based Enrichment process, plus some architectural re-work to prepare for the coming releases (in particular, [Amazon Kinesis] [kinesis] support).

1. [Background on this release](/blog/2014/01/07/snowplow-0.8.12-released-with-scalding-enrichment-improvements/#background)
2. [Scalding Enrichment improvements](/blog/2014/01/07/snowplow-0.8.12-released-with-scalding-enrichment-improvements/#improvements)
3. [Re-architecting our Enrichment process](/blog/2014/01/07/snowplow-0.8.12-released-with-scalding-enrichment-improvements/#rearchitecting)
4. [Installing this release](/blog/2014/01/07/snowplow-0.8.12-released-with-scalding-enrichment-improvements/#install)

<div class="html">
<a name="background"><h2>1. Background on this release</h2></a>
</div>

This release has two core objectives:

1. To make a set of small improvemnts to our Scalding-based Enrichment process
2. To re-architect our Enrichment process to make it usable from Amazon Kinesis

We will detail both of these after the jump.

<!--more-->

<div class="html">
<a name="improvements"><h2>2. Scalding Enrichment improvements</h2></a>
</div>

The improvements made to our Scalding Enrichment process in this release are as follows:

* We have updated our user-agent parsing library to its latest version, thanks to Rob Kingston for the suggestion ([#416] [issue-416])
* We have fixed an issue where Snowplow raw events without a page URI were automatically sent to the bad bucket. As a general purpose event analytics platform, raw events are no longer automatically expected to have an associated page URI. Thanks to Simon Rumble for this suggestion ([#399] [issue-399])
* We have added missing validation for fields which the Tracker Protocol expects to be set to '0' or '1' ([#408] [issue-408])
* We have added missing validation of the numeric fields in ecommerce transactions ([#400] [issue-400])
* We have tweaked the code which parses CloudFront access logs to make it a little more permissive of missing fields if they are not required by Snowplow ([#410] [issue-410])

Additionally we have also upgraded some of the Enrichment process's underlying components: Scala to 2.10.3, Scalding to 0.8.11, SBT to 0.13.0 and sbt-assembly to 0.10.0.

Finally, although not exactly an Enrichment improvement, we have now fixed a bug in [`cube-pages.sql`] [cube-pages], bumping this to 0.1.1. Many thanks to community member Matt Walker for this fix!

<div class="html">
<a name="rearchitecting"><h3>3. Re-architecting our Enrichment process</h3></a>
</div>

Here at Snowplow we are hugely excited about the recent release of [Amazon Kinesis] [kinesis], a fully managed service for continuous data processing. We plan to use Kinesis to enable real-time collection and processing of Snowplow event data: as well as enabling us to deliver real-time reporting via Amazon Redshift, this also opens up the possibility of building operational systems on top of the Snowplow event stream.

As a first step, Brandon, one of our Snowplow winterns, is working on a new Snowplow collector which will collect raw Snowplow events and sink them onto a further Kinesis stream; for more details on this collector see [this blog post] [winterns-post].

The next logical step is to create a "Kinesis application", which reads raw events off one Kinesis stream, enriches them using our existing Scala Enrichment code, and then writes the enriched events back to another Kinesis stream for further processing or storage (e.g. drip feeding into Amazon Redshift).

The only problem? Our existing Scala Enrichment code was tightly coupled to our Scalding/Cascading Scala project - making it hard to re-use it in a future Kinesis application. This 0.8.12 release fixes this with some 'software surgery':

![rearchitect-img] [rearchitect-img]

Thus the new [Scala Common Enrich] [scala-common-enrich] is a shared library for processing raw Snowplow events into validated and enriched Snowplow events. Common Enrich is designed to be used within a "host" enrichment process: initially our existing [Scala Hadoop Enrich] [scala-hadoop-enrich] process, but it should be relatively straightforward to also embed this in a Kinesis application.

If you are using the existing Scalding-based Enrichment process, the only difference you should notice is the new composite `v_etl` for Snowplow events: "hadoop-0.3.6-common-0.1.0".

<div class="html">
<a name="install"><h3>4. Installing this release</h3></a>
</div>

Assuming you are using EmrEtlRunner, you simply need to update your configuration file, `config.yml`, to use the latest version of the Hadoop ETL:

{% highlight yaml %}
:snowplow:
  :hadoop_etl_version: 0.3.6 # Version of the Hadoop ETL
{% endhighlight %}

And that's it! As always, you can find more detail on the tickets in this release under the [Snowplow v0.8.12] [github-release] release in GitHub.

[kinesis]: http://aws.amazon.com/kinesis/

[issue-416]: https://github.com/snowplow/snowplow/issues/416
[issue-399]: https://github.com/snowplow/snowplow/issues/399
[issue-408]: https://github.com/snowplow/snowplow/issues/408
[issue-400]: https://github.com/snowplow/snowplow/issues/400
[issue-410]: https://github.com/snowplow/snowplow/issues/410

[winterns-post]: http://snowplowanalytics.com/blog/2013/12/20/introducing-our-snowplow-winterns/
[rearchitect-img]: /assets/img/blog/2014/01/common-enrich-rearchitect.png
[scala-common-enrich]: https://github.com/snowplow/snowplow/tree/master/3-enrich/scala-common-enrich
[scala-hadoop-enrich]: https://github.com/snowplow/snowplow/tree/master/3-enrich/scala-hadoop-enrich

[cube-pages]: https://github.com/snowplow/snowplow/blob/master/5-analytics/postgres-analytics/cubes/cube-pages.sql

[github-release]: https://github.com/snowplow/snowplow/releases/tag/0.8.12
