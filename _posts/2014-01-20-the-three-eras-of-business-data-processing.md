---
layout: post
title: The three eras of business data processing
title-short: Three eras of data processing
tags: [eventstream, events, unified, log, analytics, data warehouse]
author: Alex
category: Research
---

Every so often, a work emerges that captures and disseminates the bleeding edge so effectively as to define a new norm. For those of us working in eventstream analytics, that moment came late in 2013 with the publication of Jay Kreps' monograph [The Log: What every software engineer should know about real-time data's unifying abstraction] [kreps-the-log]. Anyone involved in the operation or analysis of a digital business ought to read Jay's piece in its entirety. His central point, convincingly argued, is that every digital business should be (re-)structured around a centralized event firehose which:

1. aggregates events from disparate source systems,
2. stores them in what Jay calls a "unified log", and
3. enables data processing applications to operate on this stream

Sounds familiar? At Snowplow we believe passionately in putting a continuous stream of immutable events at the heart of your digital business, and we want Snowplow to power this "digital nervous system" for companies large and small. Jay's monograph validated our approach-to-date (e.g. on the importance of [building an event grammar] [event-grammar]), but also moved our thinking forwards in a number of ways.

In the rest of this blog post, rather than simply re-hashing Jay's thoughtpiece, I want to create a new baseline by mapping out the historical and ongoing evolution of business data processing, extending up to the unified log espoused by Jay. I have split this evolution into two distinct eras which I have lived through and experienced firsthand, plus a third era which is soon approaching:

1. [The Classic Era  - the pre-big data, pre-SaaS era of operational systems and batch-loaded data warehouses](/blog/2014/01/20/the-three-eras-of-business-data-processing/#classic-era)
2. [The Hybrid Era - today's hotchpotch of different systems and approaches](/blog/2014/01/20/the-three-eras-of-business-data-processing/#hybrid-era)
3. [The Unified Era - a future enabled by continuous data processing on a unified log](/blog/2014/01/20/the-three-eras-of-business-data-processing/#unified-era)
4. [Closing thoughts](/blog/2014/01/20/the-three-eras-of-business-data-processing/#closing-thoughts)

We'll explore each of these eras in turn:

<!--more-->

<div class="html">
<h2><a name="classic-era">The Classic Era</a></h2>
</div>

When I started work at Deloitte Consulting 12 years ago, even forward-thinking businesses still primarily operated a disparate set of on-premise transactional systems. Each of these systems would feature: an internal "local loop" for data processing; its own data silo; and, when unavoidable, point-to-point connections to peer systems. To give the Management team a much-needed view _across_ these systems, a "Ralph Kimball" data warehouse might be added, typically fed from the transactional systems overnight by a set of batch ETL processes. Where present, this provided a *single version of the truth*.

The whole system looked something like this - using the case of a retailer for our example:

![classic-era-img] [classic-era-img]

And that was pretty much it. In truth, most businesses still run on a close descendant of this approach, albeit with more SaaS services mixed in. However, some businesses, particularly those in fast-moving sectors like retail and media, have made the leap to what we might call the Hybrid Era:

<div class="html">
<h2><a name="hybrid-era">The Hybrid Era</a></h2>
</div>

The Hybrid Era is characterized by companies operating a real hotchpotch of different transactional and analytics systems - some on-premise packages, some from SaaS vendors, plus some home-grown systems.

It is hard to generalize what these architectures look like - again we see strong local loops and data silos, but we also see attempts at "log everything" approaches with Hadoop and/or systems monitoring. There tends to be a mix of near-real-time processing for narrow analytics use cases like product recommendations, plus separate batch processing efforts into Hadoop or a classic data warehouse. We see attempts to bulk export data from external SaaS vendors for warehousing, and efforts to feed these external systems with the data they require for their own local loops.

Keeping our multi-channel retailer in mind, here is what her architecture looks like now:

![hybrid-era-img] [hybrid-era-img]

This looks complicated, but is really something of a simplification - most businesses will have a much more complex systems landscape. But even with this simplification, we can see some real limitations of this approach:

1. **There is no single version of the truth** - data is now warehoused in multiple places, split depending on the data volumes and the analytics latency required
2. **Decisioning has become fragmented** - the number of local systems loops, each operating on siloed data, has grown since the Classic Era. These loops represent a highly fragmented approach to making near-real-time decisions from data
3. **Point-to-point connections have proliferated** - as the number of systems has grown, the number of point-to-point connections has exploded. Many of these connections are fragile or incomplete; getting sufficiently-granular and timely data out of external SaaS systems is particularly challenging
4. **Analytics can have low latency or wide data coverage, but not both** - where stream processing is selected for low latency, it becomes effectively another local loop. The warehouses aim for much wider data coverage, but at the cost of duplication of data and high latency

<div class="html">
<h2><a name="unified-era">The Unified Era</a></h2>
</div>

These two eras bring us up to the present day, and the coming Unified Era of data processing. The key innovation is placing what Jay calls a unified log at the heart of all of our data collection and processing. A unified log is an append-only log to which we write all events generated by our applications. Going further, it:

* Can be read from at low latency
* Is readable by multiple applications simultaneously, and different applications can have different "cursor positions"
* Only holds a few days' worth of data. But we can archive the historic log in HDFS or S3

Let's see what this architecture looks like conceptually:

![unified-era-img] [unified-era-img]

A few things should be clear, especially in contrast to the earlier eras:

1. **All systems can and should write to the unified log** - third-party SaaS vendors can emit events via webhooks and streaming APIs. In the case where vendors cannot provide an eventstream (e.g. with web analytics), those services are brought back in-house
2. **We have a single version of the truth** - together, the unified log plus Hadoop archive represent our single version of the truth. They contain exactly the same data - our eventstream - they just have different time windows of data
3. **The single version of the truth is upstream from the datawarehouse** - in the classic era, the datawarehouse provided the single version of the truth, so all reports generated from it were consistent. In the Unified Era, the log provides the single version of the truth: as a result, operational system (e.g. recommendation and ad targeting systems) compute on the same versions of truths as analysts producing business reports
4. **Point-to-point connections have largely gone away** - in their place, applications can append to the unified log and other applications can read their writes
5. **Local loops have been unbundled** - in place of local silos, applications can collaborate on real-time decisioning via the unified log

<div class="html">
<h2><a name="closing-thoughts">Closing thoughts</a></h2>
</div>

This has been something of a whirlwind tour through the evolution of data processing for business, as we have experienced it here at Snowplow (and before Snowplow). I have tried to delineate this evolution into three distinct eras - you may not agree entirely with the terminology or the facets of each era, but I hope it has prompted some ideas about where eventstream analytics is coming from and where it is heading. For us at Snowplow, we are convinced that the unified log is a breakthrough concept in understanding how best to engineer digital businesses. And we plan to evolve Snowplow to help enable this "digital nervous system" for **your** business.

[kreps-the-log]: http://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying
[event-grammar]: http://snowplowanalytics.com/blog/2013/08/12/towards-universal-event-analytics-building-an-event-grammar/

[classic-era-img]: /assets/img/blog/2014/01/classic-era.png
[hybrid-era-img]: /assets/img/blog/2014/01/hybrid-era.png
[unified-era-img]: /assets/img/blog/2014/01/unified-era.png
