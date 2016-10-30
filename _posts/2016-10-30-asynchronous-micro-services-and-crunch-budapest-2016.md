---
layout: post
title: Asynchronous micro-services and Crunch Budapest 2016
title-short: Asynchronous micro-services and Crunch
tags: [snowplow, async, asynchronous, micro-service, unified log, kafka, kinesis, crunch, budapest, hungary]
author: Alex
category: Meetups
---

At Snowplow we have been firm supporters of the Hungarian data and BI scene for several years, and so it was great to be invited to speak at the [Crunch conference in Budapest] [crunch-2016] earlier this month.

I gave a talk at Crunch on asynchronous micro-services and the unified log - a new twist on a theme that I have been developing in my book [Unified Log Processing] [ulp].

This blog post will briefly cover:

1. [Asynchronous micro-services and the unified log](/blog/2016/10/30/asynchronous-micro-services-and-crunch-budapest-2016#async-micro-services)
2. [My Crunch conference highlights](/blog/2016/10/30/asynchronous-micro-services-and-crunch-budapest-2016#alex-picks)
3. [Some closing thoughts](/blog/2016/10/30/asynchronous-micro-services-and-crunch-budapest-2016#schema-registries-talk#conclusion)

<!--more-->

<h2 id="async-micro-services">1. Asynchronous micro-services and the unified log</h2>

In the course of working at Snowplow and writing my book, I have become convinced that the unified log (essentially Apache Kafka or Amazon Kinesis plus associated technologies) is a transformational technology for companies. With Snowplow we already see users and customers restructuring their business around this idea of a "digital nervous system" on top of Kinesis: forward-thinking Snowplow users are now integrating all kinds of events into their data pipelines - not just web and mobile, but SaaS, server-side and physical world events too.

At Snowplow we have been historically focused been on analytical workloads - essentially event data pipelines, both batch and real-time. But we have recently detected a wider trend at play: that both analytical *and* transactional workloads seem to be converging on a single dominant architecture, which we can call **asynchronous or event-driven micro-services**:

<iframe src="//www.slideshare.net/slideshow/embed_code/key/GZWLbl5913Jjs3" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/alexanderdean/asynchronous-microservices-and-the-unified-log" title="Asynchronous micro-services and the unified log" target="_blank">Asynchronous micro-services and the unified log</a> </strong> from <strong><a target="_blank" href="//www.slideshare.net/alexanderdean">Alexander Dean</a></strong> </div>

In this talk, I started by recapping on the rise of the unified log for analytical workloads, replacing classic data warehousing and hybrid data processing approaches; I explained how at Snowplow we have built a variety of asynchronous micro-services to power our real-time pipeline.

I then switched tracks to look at the evolution of transactional workloads from software monoliths to [synchronous micro-services] [fowler-micro-services]. I then made the case, echoing [Kafka co-creator Jay Kreps' writing] [kreps-kafka-streams], that these transactional micro-services are also now migrating to become *asynchronous* or *event-driven*. In other words: both our transactional and analytical workloads are now steadily converging on asynchronous micro-services.

Where will this convergence take us? It's perhaps too early to say, but in my talk I set out some likely developments, including the unstoppable rise of "serverless" architectures, wider adoption of schema registries, increasing use of RPC over REST, and hopefully the harmonization of our schema technologies.

All in all, it was an exciting talk to give - trying to define and call out an emerging trend is always a risky business but in this case the convergence thesis was well received; there were some great unified log-related questions afterwards too. Thanks Crunch!

<h2 id="alex-picks">2. My Crunch conference highlights</h2>

With so many great talks at Crunch it's hard to pick just a few talks, but I would certainly call out:

1. **Shirshanka Das** provided a great overview of the big data infrastructure at **LinkedIn**. Shirshanka's talk introduced me to LinkedIn's [WheresHow] [whereshow] data registry system, which I hadn't been aware of
2. **Jeff Magnusson** from **StitchFix** gave a great talk reprising his very popular blog post, [Engineers Shouldn’t Write ETL: A Guide to Building a High Functioning Data Science Department] [magnusson-blog]. Jeff argues convincingly for the rise of the "full stack data scientist", supported by a company-wide Data Platform team
3. **Sean Braithwaite** gave an honest and thoughtful talk about the mechanics of building data pipelines at scale at **SoundCloud**; Sean's talk highlighted some of the challenges around data lineage and discoverability that we see at Snowplow

<h2 id="conclusion">3. Some closing thoughts</h2>

We have been keen followers of the Budapest data scene for some time (Yali spoke on [Emerging best practices in event data pipelines] [crunch-2015] at Crunch last year), and it was great to see the Crunch conference back for a second year and thriving.

A good conference is as much about the conversations in the corridors as it is about the talks - and Crunch excelled at bringing together data practitioners from around Europe and beyond. It was great catching up with Snowplow community member Gabor Ratky, Budapest BI impresario Bence Arató and the whole Prezi gang; it was equally exciting to spend time with the Bay Area visitors from Pinterest, Uber, LinkedIn among others.

If there was a common thread through the talks, it was perhaps that the "big data" scene is maturing: our industry's new challenges are around data quality and provenance, about organisational structures, about how we communicate and disseminate our insights. These are all challenges that we are incredibly excited about solving at Snowplow.

Hopefully there will be more Crunch next year - in the meantime, if you're local do please join our [Snowplow Budapest Meetup group] [snowplow-budapest-meetup] to stay informed about our upcoming events in Hungary. And we hope to see you at further data events across Europe!

[crunch-2016]: http://crunchconf.com/
[crunch-2015]: /blog/2015/11/09/crunch-practical-big-data-conference-budapest-was-awesome
[ulp]: https://www.manning.com/books/unified-log-processing

[fowler-micro-services]: http://www.martinfowler.com/articles/microservices.html
[kreps-kafka-streams]: http://www.confluent.io/blog/introducing-kafka-streams-stream-processing-made-simple/

[magnusson-blog]: http://multithreaded.stitchfix.com/blog/2016/03/16/engineers-shouldnt-write-etl/
[whereshow]: https://github.com/LinkedIn/Wherehows

[snowplow-budapest-meetup]: http://www.meetup.com/Snowplow-Analytics-Budapest/
