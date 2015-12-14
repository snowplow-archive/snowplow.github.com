---
layout: post
title: Introducing our Snowplow winterns
tags: [snowplow, intern, wintern, internship]
author: Alex
category: Recruitment
---

Just over two months ago we announced our winter internship program for open source hackers, [here on this blog] [original-post]. We had no idea what kind of response we would receive - it was our first attempt at designing an internship program, and we had never heard of a startup (even an open source company like ours) recruiting _remote_ interns. As it turned out, we were delighted by the response we received, and we decided to make offers to **three** very talented "winterns" from around the world, rather than the one-to-two originally planned.

This week saw all three of our winterns working hard on their respective Snowplow projects, and so we wanted to take this opportunity to introduce each of them to the community, as well as giving a little more background on the projects they are working on:

![winterns-montage] [winterns-montage]

<!--more-->

## Brandon Amos: a new stream-based Scala collector for Snowplow

Brandon Amos is one of our two remote winterns.

Brandon is based on the East Coast of the US and is a third-year CS undergraduate at Virginia Tech. Outside of computer science, Brandon is an indie guitarist, classical pianist, and symphonic trumpeter. During the winternship, Brandon aims to learn more about Scala and associated libraries, such as Akka and Spray, so he can use them in his own work.

Brandon is working on a new stream-based event collector for Snowplow, written in Scala. The original plan was for this new collector to collect events from Snowplow trackers over HTTP and then emit them onto a [Kafka] [kafka] queue. However, prior to Brandon starting, we were given early access to [Amazon Kinesis] [kinesis], the new fully-managed stream processing service from AWS; we decided it makes more sense to focus on Kinesis as the first target for our new Scala collector.

Brandon's new Scala collector is being built on top of [Spray] [spray] (aka akka-http), a Scala/Akka toolkit for building REST/HTTP-based integration layers. As well as building the new collector, Brandon is working on a new [Thrift] [thrift]-based schema to store all raw Snowplow events in.

You can follow Brandon's progress in the [`feature/scala-rt-collector`] [scala-rt-coll] branch of the main Snowplow repository. Expect to hear a lot more from us soon about how we will be working with Amazon Kinesis at Snowplow - we are super-excited about the service!

## Jiawen Zhou: a new forex library for Scala

Jiawen Zhou is working with us here at Snowplow HQ.

Jiawen is a second-year MEng undergrad at Imperial in London; she likes basketball and tells us _"I joined Snowplow because I wanted a chance to program in new languages which I am interested in. I hope I can learn from here and contribute at the end of my winternship."_

Jiawen is working on a new high-performance Scala library for exchange rate lookups and currency conversions. The library will let users work with foreign exchange in an expressive high-level DSL - we are working with Finance professionals to get the details of this library right. Under the covers the library makes use of the excellent [Open Exchange Rates] [ore] API, and leverages both [Joda-Money] [joda-money] and [Joda-Time] [joda-time].

The ultimate plan is to integrate this library into the Snowplow Enrichment process, to allow financial transactions (e.g. ecommerce tracking) to be converted into a base currency for consistent reporting.

You can follow Jiawen's progress in the new repository, [`scala-forex`] [scala-forex] (foreign exchange).

## Anuj More: a new Python Tracker for Snowplow

Anuj More is the second of our remote winterns.

Anuj is a recent IT graduate of Mumbai University, and is still based in the city. Anuj is ambidextrous, a huge "A Bit of Fry and Laurie" fan, and a Beatles lover. Through this winternship, Anuj is keen to find out how FOSS startups work, including the challenges on the business side of things. He also notes that _"this will be my first professionally written Python project; so excited about that too."_

Anuj is working on a Python event tracker for Snowplow. We are hugely excited about the potential for generating Snowplow events from Python - be it from Django/Flask/Bottle web applications, desktop applications, games or anything else. Anuj is taking our experiences from writing the previous trackers, implementing the [Snowplow Tracker Protocol] [tracker-protocol] and building out a nicely Pythonic API.

The Python Tracker is built for Python 3, and makes use of the excellent [Requests] [requests] library for HTTP GETs, and [PyContracts] [pycontracts] for validating that the tracker is being implemented in client code correctly.

Anuj's `snowplow-python-tracker`, our fifth Snowplow tracker, will be open-sourced in early January.

[original-post]: /blog/2013/10/07/announcing-out-winter-open-source-internship-program/
[winterns-montage]: /assets/img/blog/2013/12/winterns.png

[kafka]: https://kafka.apache.org/
[kinesis]: http://aws.amazon.com/kinesis/
[spray]: http://spray.io/
[thrift]: http://diwakergupta.github.io/thrift-missing-guide/
[scala-rt-coll]: https://github.com/snowplow/snowplow/tree/feature/scala-rt-coll

[ore]: https://openexchangerates.org/
[joda-money]: http://www.joda.org/joda-money/
[joda-time]: http://www.joda.org/joda-time/
[scala-forex]: https://github.com/snowplow/scala-forex

[tracker-protocol]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol
[requests]: http://docs.python-requests.org/en/latest/
[pycontracts]: http://andreacensi.github.io/contracts/
