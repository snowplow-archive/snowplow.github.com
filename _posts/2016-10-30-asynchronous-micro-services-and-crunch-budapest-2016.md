---
layout: post
title: Asynchronous micro-services and Crunch Budapest 2016
title-short: Asynchronous micro-services and Crunch
tags: [snowplow, async, asynchronous, micro-service, unified log, kafka, kinesis, crunch, budapest, hungary]
author: Alex
category: Meetups
---

At Snowplow we have been firm supporters of the Hungarian data and BI scene for several years, and so it was great to be invited to speak at the [Crunch conference in Budapest] [crunchconf] earlier this month.

I gave a talk at Crunch on asynchronous micro-services and the unified log - a new twist on a theme that I have been developing in my book [Unified Log Processing] [ulp].

This blog post will briefly cover:

1. [Asynchronous micro-services and the unified log](/blog/2016/10/30/asynchronous-micro-services-and-crunch-budapest-2016#async-micro-services)
2. [My Crunch conference highlights](/blog/2016/10/30/asynchronous-micro-services-and-crunch-budapest-2016#alex-picks)
3. [Some closing thoughts](/blog/2016/10/30/asynchronous-micro-services-and-crunch-budapest-2016#schema-registries-talk#conclusion)

<!--more-->

<h2 id="async-micro-services">1. Asynchronous micro-services and the unified log</h2>

At Snowplow and with my book, I have become a firm believer in the idea that the unified log (essentially Apache Kafka or Amazon Kinesis plus associated technologies) is a transformational technology for companies. With Snowplow we already see users and customers restructuring their business around this idea of a "digital nervous system" on top of Kinesis: forward-thinking Snowplow users are now integrating all kinds of events - not just web and mobile, but SaaS, servers and physical world too.

SLIDES

Because of our backgrounds and history in event analytics, our focus at Snowplow has historically been on analytical workloads - essentially event data pipelines, both batch and real-time. But we have recently detected a wider trend at play: both analytical and transactional workloads seem to be converging on a single dominant architecture, which we might call asynchronous or event-driven micro-services.

In this talk, I set out our baseline view regarding the rise of the unified log for analytical workloads, and how this had lead us at Snowplow to building an array of asynchronous micro-services to power our real-time pipeline.

I then switched tracks to look at the evolution of transactional workloads from software monoliths to synchronous micro-services. I then made the case, echoing Confluent co-founder Jay Kreps' writing, that these transactional micro-services are also now migrating to become *asynchronous* or *event-driven*. In other words: both our transactional and analytical workloads are now steadily converging (wherever possible) on asynchronous micro-servics.

Where will this convergence take us? It's perhaps too early to say, but in my talk I set out some likely developments and highlighted which technologies and patterns we can expect to see more of.

All in all, it was an exciting talk to give - trying to define and call out an emerging trend is always a risky business but in this case the thesis was well received; the very detailed questions afterwards showed as well that these are matters that Crunch attendees are very familiar with.

<h2 id="alex-picks">2. My Crunch conference highlights</h2>

With so many great talks at Crunch it's hard to pick just a few talks, but I would certainly call out:

1. Xxx from LinkedIn

Jeff Magnusson from StitchFix gave a great talk reprising his very popular blog post, Xxx.


Jeff's thesis is that companies running Data Science, Data Engineering and Data Infrastructure teams as separate cross-capability strata across a business isn't working - and should be replaced by "full-stack data scientists" dedicated to specific capabilities (e.g. retention or fraud detection). Underpinning these data scientists should be

3. Sean Xxx from Soundcloud gave an honest, thoughtful talk about the challenges of building data pipelines at scale at Soundcloud. Sean was as 

<h2 id="conclusion">3. Some closing thoughts</h2>

We have been keen followers of the Budapest data scene for some time (Yali spoke on [Emerging best practices in event data pipelines] [crunch-2015] last year), and it was great to see the Crunch Data conference back for a second year and thriving.

A good conference is as much about the conversations in the corridors as it is about the talks - and Crunch excelled at bringing together data practitioners from around Europe and beyond. It was great catching up with Snowplow community member Gabor Ratky, Budapest BI impresario Bence Arato and the whole Prezi gang; it was equally interesting to spend time with the Bay Area visitors from Pinterest, Uber, LinkedIn  and learn more about what they are learning.

If there was a common thread through the talks, it was perhaps that the "big data" scene is maturing: our industry's new challenges are around data quality and provenance, about organisational structures, about the internal discoverability of our analytics. These are all challenges that we are incredibly excited about solving at Snowplow.

Hopefully there will be more Crunch next year - in the meantime, if you're local do please join our Snowplow Budapest Meetup group to stay informed about our upcoming events. And we hope to see you at further data events across Europe!

[crunchconf]: http://crunchconf.com/
[crunch-2015]: /blog/2015/11/09/crunch-practical-big-data-conference-budapest-was-awesome
[ulp]: xxx

