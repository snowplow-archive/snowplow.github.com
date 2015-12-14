---
layout: post
title: Span Conference and Why your company needs a Unified Log
tags: [snowplow, span, span conference, london, unified log]
author: Alex
category: Meetups
---

It was great to have the opportunity to speak at [Span Conference] [span-conf] this week in London on the topic of "Why your company needs a Unified Log". Span is a single-track developer conference about scaling, organized by Couchbase developer evangelist Matthew Revell; Tuesday's was the inaugural Span and it was great to be a part of it.

Below the fold I will (briefly) cover:

1. [Why your company needs a Unified Log](/blog/2014/11/02/span-conference/#my-talk)
2. [My highlights from Span](/blog/2014/11/02/span-conference/#highlights)

<!--more-->

<h2><a name="my-talk">Why your company needs a Unified Log</a></h2>

As community regulars will know, at Snowplow we are hugely excited about the potential for [Apache Kafka] [kafka] and [Amazon Kinesis] [kinesis] to be more than just message queues — they can serve as a unified log which you can put at the heart of your business, effectively creating a "digital nervous system" which your company's applications and processes can be re-structured around:

<iframe src="//www.slideshare.net/slideshow/embed_code/40977116" width="425" height="355" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/alexanderdean/why-your-company-needs-a-unified-log" title="Span Conference: Why your company needs a unified log" target="_blank">Span Conference: Why your company needs a unified log</a> </strong> from <strong><a href="//www.slideshare.net/alexanderdean" target="_blank">Alexander Dean</a></strong> </div>

In my talk, I provided an introduction to unified log technology, highlighted some killer use cases and also showed how Kinesis is being used "in anger" at Snowplow. Of course, my talk was heavily influenced by Jay Kreps’ [unified log monograph] [the-log], and by my recent work penning [Unified Log Processing] [ulp], from Manning Publications. Hopefully I went some way to showing how event streams inside a unified log are an incredibly powerful primitive for building rich event-centric applications, unbundling local transactional silos and creating a single version of truth for a company. I finished with a live demo (always fraught!) of Snowplow's beta Kinesis support, showing events from the Snowplow website flowing through Amazon Kinesis and being enriched in real-time.

It was a very technical and experienced audience, which made for some great questions immediately afterwards and in the various one-on-one chats afterwards. I came away from the event with a renewed sense of the importance of robust event modeling, and the importance of our work on JSON Schema, Iglu and SchemaVer.

<h2><a name="highlights">My highlights from Span</a></h2>

Matthew and the Span Conference team succeeded in packing a huge amount of content and discussion into Span's single day format. There were too many great talks and interactions to mention all of them - but here were some of my highlights:

* **Richard Astbury** of [Two10 Degrees] [two10] introducing Microsoft's [Project Orleans] [orleans] actor framework. Richard provided a great introduction to the power and utility of actor frameworks, and followed it up with some nice hands-on coding on the Orleans platform. Orleans looks really interesting - the virtual actor model in particular seems novel. My only real concern about Orleans was that none of the persistence options seemed particularly pragmatic/compelling
* **Martin Kleppmann**, author of [Designing Data-Intensive Applications] [ddia] and [Apache Samza] [samza] committer, spoke incredibly articulately about the difficulties of scaling technology architectures as more and more databases, caches and queues are added to our applications. He made a strong case for the unifed log pattern, and illustrated the role that a stream processing framework like Samza can play in this architecture. I came away with a much clearer understanding of the importance of ordering in our unified log's queues, and a better handle on the increasingly important area of [Change Data Capture] [cdc]
* **Robert Virding**, co-inventor of Erlang, gave a great and evocative talk on the origins of the Erlang platform. The most surprising anecdote was that the Erlang triumvirate had been unaware of the [actor model] [actors] when creating Erlang - they just happened to coincide with the very same design
* **Elliot Murphy**, CTO of CommonGround, gave a very frank and engaging talk about common security, encryption, privacy, and regulatory concerns relating to running distributed systems in the cloud. Elliot was willing to discuss important security topics like key management and employees-gone-bad which many in the devops community seem to want to gloss over - very refreshing!

Of course these were just my highlights - the day was jam-packed with great talks, one-on-one and group discussions, continuing into the evening. Many thanks to Matthew Revell, Philipp Fehre and all the organizers for a truly excellent Span!

[span-conf]: http://london-2014.spanconf.io/
[kafka]: http://kafka.apache.org/
[kinesis]: http://aws.amazon.com/kinesis/
[the-log]: http://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying
[ulp]: http://www.manning.com/dean/
[orleans]: http://research.microsoft.com/en-us/projects/orleans/
[two10]: http://www.two10degrees.com/
[ddia]: http://dataintensive.net/
[samza]: http://samza.incubator.apache.org/
[cdc]: http://en.wikipedia.org/wiki/Change_data_capture
[actors]: http://en.wikipedia.org/wiki/Actor_model
