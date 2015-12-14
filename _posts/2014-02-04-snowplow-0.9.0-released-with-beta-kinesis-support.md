---
layout: post
title: Snowplow 0.9.0 released with beta Amazon Kinesis support
title-short: Snowplow 0.9.0
tags: [snowplow, kinesis, real-time]
author: Alex
category: Releases
---

We are hugely excited to announce the release of Snowplow 0.9.0. This release introduces our initial **beta** support for [Amazon Kinesis] [kinesis] in the Snowplow Collector and Enrichment components, and was developed in close collaboration with Snowplow wintern [Brandon Amos] [brandon-intro-post].

At Snowplow we are hugely excited about Kinesis's potential, not just to enable near-real-time event analytics, but more fundamentally to serve as a business's unified log, aka its "digital nervous system". This is a concept we introduced recently in our blog post [The three eras of business data processing] [3-eras-post], and further explored at the [inaugural Kinesis London meetup] [inaugural-meetup-post].

Before we get further into this release, let's see what Brandon has to say:

![brandon-img] [brandon-img]

Brandon discussed his Snowplow winternship further in [his own excellent blog post] [brandon-own-post].

In the rest of this post we will cover:

1. [Overview of this release](/blog/2014/02/04/snowplow-0.9.0-released-with-beta-kinesis-support/#overview)
2. [Scala Stream Collector](/blog/2014/02/04/snowplow-0.9.0-released-with-beta-kinesis-support/#stream-collector)
3. [Scala Kinesis Enrich](/blog/2014/02/04/snowplow-0.9.0-released-with-beta-kinesis-support/#kinesis-enrich)
4. [Bonus feature: Snowplow local mode](/blog/2014/02/04/snowplow-0.9.0-released-with-beta-kinesis-support/#local-mode)
5. [Getting help](/blog/2014/02/04/snowplow-0.9.0-released-with-beta-kinesis-support/#help)
6. [Roadmap and contributing](/blog/2014/02/04/snowplow-0.9.0-released-with-beta-kinesis-support/#roadmap-contrib)
7. [Thanks](/blog/2014/02/04/snowplow-0.9.0-released-with-beta-kinesis-support/#thanks)

<!--more-->

<div class="html">
<h2><a name="overview">1. Overview of this release</a></h2>
</div>

The following diagram sets out our planned data flow leveraging Kinesis. The colourized components are part of the 0.9.0 release; components in grey are yet to be implemented:

![architecture-img] [architecture-img]

As you can see, 0.9.0 consists of two key components:

1. A new Scala Stream Collector, which collects raw Snowplow events over HTTP and writes them to a Kinesis stream as Thrift-serialized records
2. A new Scala Kinesis Enrich component, which reads raw Snowplow events from the raw Kinesis stream, validates and enriches them and writes them back to an enriched Kinesis event stream

Please note that the 0.9.0 release makes **no changes** to the existing, batch-based Snowplow flow leveraging Amazon S3 & Elastic MapReduce.

Let's go over each of the two new components in a little more detail in the following two sections:

<div class="html">
<h2><a name="stream-collector">2. Scala Stream Collector</a></h2>
</div>

The [Scala Stream Collector] [ssc-architecture] is a Snowplow event collector, written in Scala. The Scala Stream Collector allows near-real time processing of a Snowplow raw event stream. It also sets a third-party cookie, like the Clojure Collector.

The Scala Stream Collector receives raw Snowplow events over HTTP, serializes them to a Thrift record format, and then writes them to a sink. Currently supported sinks are:

1. Amazon Kinesis
2. `stdout` for a custom stream collection process

**To setup the Scala Stream Collector, please see the [Scala Stream Collector Setup Guide] [ssc-setup].**

<div class="html">
<h2><a name="kinesis-enrich">3. Scala Kinesis Enrich</a></h2>
</div>

Scala Kinesis Enrich is a Kinesis application, built using the Kinesis Client Library and [scalazon] [scalazon], which:

* **Reads** raw Snowplow events off a Kinesis stream populated by the Scala Stream Collector
* **Validates** each raw event
* **Enriches** each event (e.g. infers the location of the user from his/her IP address)
* **Writes** the enriched Snowplow event to another Kinesis stream

As well as working with Kinesis streams, Scala Kinesis Enrich can also be configured to work with Unix `stdio` streams.

Under the covers, Scala Kinesis Enrich makes use of scala-common-enrich, our Snowplow Enrichment library which we extracted from our Hadoop Enrichment process in the [0.8.12 Snowplow release] [0812-release-post].

**To setup Scala Kinesis Enrich, please see the [Scala Kinesis Enrich Setup Guide] [kinesis-enrich-setup].**

<div class="html">
<h2><a name="local-mode">4. Bonus feature: Snowplow local mode</a></h2>
</div>

When developing the new collector and enrichment components, we realized that there were strong parallels between the Kinesis stream processing paradigm and conventional Unix `stdio` I/O streams. As a result, we added the ability for:

1. Scala Stream Collector to write Snowplow raw events to `stdout` instead of a Kinesis stream
2. Scala Kinesis Enrich to read Snowplow raw events from `stdin`, and write enriched events to `stdout`

This has a nice side-effect: it is possible to run Snowplow in a "local mode", where you simply pipe the output of Scala Stream Collector directly into Scala Kinesis Enrich, and can then see the generated enriched events printed to your console. You can run Snowplow in local mode with a shell script like this:

{% highlight bash %}
#!/bin/sh

echo "Piping local collector into local enrichment..."
./snowplow-stream-collector-0.1.0 --config ./collector.conf \
| ./snowplow-kinesis-enrich-0.1.0 --config ./enrich.conf
{% endhighlight %}

Make sure to set the sources and sinks in your configuration files to the relevant `stdio` settings.

Snowplow local mode could be helpful for debugging Snowplow tracker implementations before putting tags live - let us know how you get on with it!

<div class="html">
<h2><a name="getting-help">5. Getting help</a></h2>
</div>

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

For more details on this release, please check out the [0.9.0 Release Notes] [snowplow-090] on GitHub.

<div class="html">
<h2><a name="roadmap-contrib">6. Roadmap and contributing</a></h2>
</div>

We have identified three major tasks required to bring our Kinesis-based, beta-quality implementation towards parity with our production-quality EMR-based implementation:

1. Implementing the raw event to S3 sink as a Kinesis app
2. Implementing the enriched event to Redshift drip-feeder as a Kinesis app
3. Performance testing and tuning (e.g. reviewing our Kinesis checkpointing approach)

Necessarily we have to balance these tasks against the work we are committed to for our existing batch-based Snowplow flow leveraging Amazon S3 and Elastic MapReduce.

If you are interested in contributing towards the Kinesis workstream, or sponsoring us to accelerate their release, then do [get in touch] [talk-to-us]!

<div class="html">
<h2><a name="overview">7. Thanks</a></h2>
</div>

And that's it - but this post would not be complete without us saying a huge "thank you" to Snowplow wintern [Brandon Amos] [bamos] for his massive contribution to this release!

As you can see from [our original winternship blog post] [brandon-intro-post], the original plan was for Brandon to come onboard for a month and ship the Scala Stream Collector. In fact, Brandon delivered the new collector _in his first two weeks_ and was able to then turn his attention to Scala Kinesis Enrich, which he built in the remaining fortnight. All built using Kinesis, a platform he had never used before, and all with tests and wiki documentation - truly a heroic contribution to Snowplow!

Thanks again Brandon!

[kinesis]: http://aws.amazon.com/kinesis/

[brandon-intro-post]: /blog/2013/12/20/introducing-our-snowplow-winterns/
[3-eras-post]: /blog/2014/01/20/the-three-eras-of-business-data-processing/
[inaugural-meetup-post]: /blog/2014/01/30/inaugural-amazon-kinesis-meetup/
[brandon-own-post]: http://bamos.github.io/2014/01/20/snowplow/

[brandon-img]: /assets/img/blog/2014/02/brandon-kinesis.png
[bamos]: https://github.com/bamos

[architecture-img]: /assets/img/blog/2014/02/090-kinesis-architecture.png

[ssc-architecture]: https://github.com/snowplow/snowplow/wiki/Scala-Stream-Collector
[ssc-setup]: https://github.com/snowplow/snowplow/wiki/Setting-up-the-Scala-stream-Collector

[kinesis-enrich-architecture]: https://github.com/snowplow/snowplow/wiki/Scala-Kinesis-Enrich
[kinesis-enrich-setup]: https://github.com/snowplow/snowplow/wiki/setting-up-scala-kinesis-enrich
[scalazon]: https://github.com/cloudify/scalazon
[0812-release-post]: /blog/2014/01/07/snowplow-0.8.12-released-with-scalding-enrichment-improvements/

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[snowplow-090]: https://github.com/snowplow/snowplow/releases/0.9.0
