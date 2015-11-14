---
layout: post
shortenedlink: Unified Log London 4 on Apache ZooKeeper and analytics on write with AWS Lambda
title: "Unified Log London 4 on Apache ZooKeeper and analytics on write with AWS Lambda"
tags: [unified log, zookeeper, zk, lambda, aws lambda, ulp, event streams]
author: Alex
category: Meetups
---

Last week we held the [fourth Unified Log London meetup] [meetup-4] here in London. As always, huge thanks to Simone Basso and the [Just Eat] [just-eat] team for hosting us in their offices and keeping us all fed with pizza and beer!

![unified-log-london-meetup] [pic]

More on the event after the jump:

<!--more-->

There were two talks at the meetup:

1. [Flavio Junqueira] [flavio], a member of the technical staff at Confluent, gave an excellent talk introducing [Apache ZooKeeper] [zookeeper]
2. I gave a talk on the emerging area of "analytics on write" for event streams, with a demonstration of the approach using [AWS Lambda] [lambda]

The talks were well received, with some great questions and discussions afterwards. It's exciting to see the Unified Log London meetup "grow up", 

The meetup had a great mix of Unified Log practitioners and people just starting to explore the concept. It was particularly encouraging to see such an interactive, "salon" style atmosphere to the discussion, continuing late into the evening!

<div class="html">
<h2>1. The good, the bad, and the ugly of Apache ZooKeeper</h2>
</div>

First sentence.

![the-good-the-bad-and-the-ugly-of-apache-zookeeper] [title-slide]

Implementing primitives for distributed coordination such as locks, barriers, and election is inherently difficult. Apache ZooKeeper is a system designed precisely to enable the coordination of processes in a distributed system in a very general and simple manner. It exposes a interface that renders the task of implementing such primitives much simpler. At its core, it solves a difficult problem widely known as distributed consensus. Solving consensus is important because, from a theory perspective, it is impossible to solve some of these problems if consensus is not implemented somewhere. The combination of a simple API with consensus at the core makes ZooKeeper an attractive element for the design of many systems. ZooKeeper has been used in production at scale for many years and has been battle-tested across a number of companies.

In this talk, we cover the basics of ZooKeeper, architecture and API, and some of the experience we obtained by running it in production with a number of applications. This experience includes not only the success stories, but the use cases that are not a good fit, and design choices that we found to be far from ideal.

Bio: Flavio Junqueira is a member of the technical staff at Confluent. Previously, he held research positions with Microsoft Research and Yahoo! Research. He holds a PhD degree in Computer Science from the University of California in San Diego, and his expertise is in the space of distributed computing. He has made a number of contributions in this space, both academic and of practical relevance, such as publications, including an O'Reilly book on Apache ZooKeeper, and creation of open-source projects. He is an active contributor to open-source projects such as Apache ZooKeeper, Apache BookKeeper, and Apache Kafka.

Download Flavio's [slides on Apache ZooKeeper] [flavio-slides] from the Apache ZooKeeper wiki.

<div class="html">
<h2>2. Analytics on write with AWS Lambda</h2>
</div>

In this talk, I took a .

Analytics on write is a four-step process:

1.  Read our events from our event stream

2.  Analyze our events using a stream processing framework

3.  Write the summarized output of our analysis to some form of storage target

4.  Serve the summarized output into real-time dashboards, reports and similar

We call this analytics on write because we are performing the analysis portion of our work prior to writing to our storage target; you can think of this as early or “eager” analysis, whereas analytics on read using Redshift or similar is late or “lazy” analysis.

In this talk, Alex will take us through the basic principles of analytics on write, and then walk through a worked example of analytics on write using AWS Lambda, Amazon Kinesis and DynamoDB.

<iframe src="//www.slideshare.net/slideshow/embed_code/key/yKKZJfOZI9QQWn" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/alexanderdean/unified-log-london-analytics-on-write-with-aws-lambda" title="Unified Log London (November 2015) - Analytics on write with AWS Lambda" target="_blank">Unified Log London (November 2015) - Analytics on write with AWS Lambda</a> </strong> from <strong><a href="//www.slideshare.net/alexanderdean" target="_blank">Alexander Dean</a></strong> </div>

<div class="html">
<h2>4. Thanks and next event</h2>
</div>

It was a great meetup - it's encouraging to see the Unified Log discussions expanding into a deeper understanding. A big thank you to Raj Singh, Peter Mounce and the Just Eat Engineering team for being such excellent hosts, and a warm thanks to Mischa and Dan for giving us the inside track on Unified Log at State!

Do please [join the group] [meetup-group] to be kept up-to-date with upcoming meetups, and if you would like to give a talk, please email us on [unified-meetup@snowplowanalytics.com] [email].

[meetup-4]: http://www.meetup.com/unified-log-london/events/226174605/
[just-eat]: http://www.just-eat.co.uk/

[flavio]: https://twitter.com/fpjunqueira
[flavio-slides]: https://cwiki.apache.org/confluence/download/attachments/24193445/unified-log-zk-nov15.pdf

[zookeeper]: https://zookeeper.apache.org/
[lambda]: http://aws.amazon.com/lambda/

[meetup-group]: http://www.meetup.com/unified-log-london/

[pic]: /assets/img/blog/2015/11/flavio-zookeeper-meetup.jpg
[title-slide]: /assets/img/blog/2015/11/flavio-zookeeper-title-slide.png

[email]: mailto:unified-ug@snowplowanalytics.com
