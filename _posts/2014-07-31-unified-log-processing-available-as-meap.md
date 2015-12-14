---
layout: post
title: Unified Log Processing is now available from Manning Early Access
title-short: Unified Log Processing available as MEAP
tags: [snowplow, unified log, kafka, kinesis, manning, meap, event processing]
author: Alex
category: Other
---

I'm pleased to announce that the first three chapters of my new book are now available as part of the [Manning Publications' Early Access Program (MEAP)] [ulp-manning]! Better still, I can share a 50% off code for the book - the code is **mldean** and it expires on Monday 4th August.

The book is called [Unified Log Processing] [ulp-manning] - it's a distillation (and evolution) of my experiences working with event streams over the last two and a half years at Snowplow; it's also heavily influenced by [Jay Kreps' unified log monograph] [unified-log], which I [blogged about] [three-eras] earlier in the year. It's great to have the MEAP now available - and it's also Deal of the Day on the Manning website today (Thursday 31st)!

![cover-img] [cover-img]

More about Unified Log Processing below the fold...

<!--more-->

[Unified Log Processing] [ulp-manning] (ULP) is all about events: how to define events, how to send streams of events into unified log technologies like Apache Kafka and Amazon Kinesis, and how to write applications which process those event streams. I plan on covering a lot of ground in this book: exploring Kafka and Kinesis, stream processing frameworks like Samza and Spark Streaming, event-friendly databases like Amazon Redshift and ElasticSearch, and more.

Hopefully ULP will give readers who don't necessarily have an analytics, BI or data warehousing background the confidence to identify, model and process event streams wherever they find them.

It's a hugely interesting - and challenging - experience writing a technical book. It's a chance to peel back some of the architectural decisions which have accreted at Snowplow, go back to basics and experiment with (and teach) new approaches - approaches which we can hopefully adopt back into Snowplow in the future.

Working on the code has been interesting too - I've learnt that code which works for a book has a very different timbre to code that works for an open source project like Snowplow! You can follow along with the code (all Java so far) in my [Unified Log Processing repository] [ulp-github] on GitHub.

At Snowplow we see unified logs like Kafka and Kinesis as a hugely powerful enabling technology for businesses large and small; restructuring Snowplow around Kinesis (and Kafka in due course) is allowing us to evolve from a batch-based web analytics platform into providing a company's "digital nervous system", where disparate event streams can be used for offline reporting, operational analytics and even response/feedback loops. This is a huge step forward - but it is also a step into the unknown for many CTOs, VPs of Engineering and developers.

Hopefully with Unified Log Processing I can start a broader conversation about how as software engineers we should work with events, and how we can place a unified log at the heart of our companies. This a young but hugely important field and there is a lot still to discuss!

**In the meantime, do check out the early access for [Unified Log] [ulp-manning] Processing, and make sure to use the 50% discount code, mldean, when you get yourself a copy.**

[ulp-manning]: http://www.manning.com/dean?a_aid=ulpdean&a_bid=b20eb0e9
[unified-log]: http://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying
[three-eras]: http://snowplowanalytics.com/blog/2014/01/20/the-three-eras-of-business-data-processing/
[ulp-github]: https://github.com/alexanderdean/Unified-Log-Processing

[cover-img]: /assets/img/blog/2014/07/manning-ulp-cover.jpg
