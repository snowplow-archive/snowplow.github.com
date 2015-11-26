---
layout: post
title: "Unified Log London 4 on Apache ZooKeeper and analytics on write with AWS Lambda"
title-short: Unified Log London 4
tags: [unified log, zookeeper, zk, lambda, aws lambda, ulp, event streams]
author: Alex
category: Meetups
---

Last week we held the [fourth Unified Log London meetup] [meetup-4] here in London. As always, huge thanks to Simone Basso and the [Just Eat] [just-eat] team for hosting us in their offices and keeping us all fed with pizza and beer!

![unified-log-london-meetup] [pic]

More on the event after the jump:

<!--more-->

There were two talks at the meetup:

1. [Flavio Junqueira] [flavio] from Confluent and an Apache ZooKeeper PMC member and contributor, gave an excellent talk introducing [ZooKeeper] [zookeeper]
2. I gave a talk on the emerging area of "analytics on write" for event streams, with an illustration of the approach using [AWS Lambda] [lambda]

The talks were well received, with some great questions and discussions afterwards. It's exciting to see the Unified Log London meetup expand "up and down the stack", to cover both the unified log's foundational technologies like ZooKeeper, and also practical business use cases for our unified event streams like analytics on write.

<div class="html">
<h2>1. The good, the bad, and the ugly of Apache ZooKeeper</h2>
</div>

We were very lucky to have Flavio, a member of the technical staff at [Confluent] [confluent], talk to us about Apache ZooKeeper. Flavio is an active contributor to open-source projects such as Apache ZooKeeper, Apache BookKeeper, and Apache Kafka; he is also the co-author of the excellent [O'Reilly book on ZooKeeper] [oreilly-zookeeper].

Flavio's talk covered the basics of ZooKeeper's architecture and API, along with hands-on guidance for running ZooKeeper in production across a variety of applications. ZooKeeper is a system designed to solve distributed consensus, a difficult problem which is essential to enable the coordination of processes in a distributed system. We learnt how Apache Kafka, a unified log technology, leans heavily on ZooKeeper for a variety of uses, including replication, topic management and offset handling.

![the-good-the-bad-and-the-ugly-of-apache-zookeeper] [title-slide]

**[Unified Log London (November 2015) - The good, the bad, and the ugly of Apache ZooKeeper] [flavio-slides]** from **[Flavio Junqueira] [flavio]**

It was an engaging and frank talk by Flavio - he was not afraid to point out the "ugly" parts of ZooKeeper, and revealed the thinking behind some specific design decisions, such as keeping the Netflix-originated [Curator] [curator] project separate from ZooKeeper; it's great to get these kinds of insights from the maintainers of such major open source projects.

When asked for his thoughts on ZooKeeper competitors [etcd] [etcd] and [Consul] [consul], Flavio shared his view that the real innovation has been the popularization and growing understanding of the [Raft distributed consensus protocol] [raft], which is enabling developers to implement distributed consensus directly into their own systems when appropriate.

Download Flavio's [slides on Apache ZooKeeper] [flavio-slides] from the Apache ZooKeeper wiki.

<div class="html">
<h2>2. Analytics on write with AWS Lambda</h2>
</div>

In this talk, I introduced a widely-used but poorly-understood approach for business reporting on event streams, called "analytics on write" to distinguish it from the more traditional "analytics on read" approaches.

Analytics on write is a four-step process:

1.  Read our events from our event stream
2.  Analyze our events using a stream processing framework
3.  Write the summarized output of our analysis to some form of storage target
4.  Serve the summarized output into real-time dashboards, reports and similar

We call this analytics on write because we are performing the analysis portion of our work prior to writing to our storage target; you can think of this as early or “eager” analysis, whereas analytics on read using Redshift or similar is late or “lazy” analysis.

You can see my slides here:

<iframe src="//www.slideshare.net/slideshow/embed_code/key/2JHbUqRYwELLc1" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/alexanderdean/unified-log-london-analytics-on-write-with-aws-lambda" title="Unified Log London (November 2015) - Analytics on write with AWS Lambda" target="_blank">Unified Log London (November 2015) - Analytics on write with AWS Lambda</a> </strong> from <strong><a href="//www.slideshare.net/alexanderdean" target="_blank">Alexander Dean</a></strong> </div>

First I introduced analytics on write versus analytics on read, then introduced the key building blocks of analytics on write, and finally walked through a worked example of analytics on write using AWS Lambda, Amazon Kinesis and DynamoDB. One thing that struck me when I was preparing the talk was just how few packaged solutions exist today for analytics on write - the only ones I am aware of are [PipelineDB] [pipelinedb], Ian Meyer's [Amazon Kinesis Aggregators] [kinesis-agg] and some components of [Druid] [druid].

Thanks to the attendees for some great questions - in particular the Q&A revealed plenty of interest in the capabilities of Lambda, and indeed in the relevant merits of Amazon Kinesis versus Apache Kafka.

<div class="html">
<h2>3. Thanks and next event</h2>
</div>

It was a great meetup - it's encouraging to see the Unified Log discussions expanding into a deeper understanding of the whole event processing stack, from distributed consensus all the way up to business analytics. A big thank you to Simone Basso and the Just Eat Engineering team for being such excellent hosts, and a warm thanks to Flavio for giving us the inside track on Apache ZooKeeper!

Do please [join the group] [meetup-group] to be kept up-to-date with our next meetups, and if you would like to give a talk, please email us on [unified-meetup@snowplowanalytics.com] [email]. In particular we are looking for speakers from:

1. Companies who have implemented unified log architectures
2. The teams behind open-source or cloud-hosted unified log, distributed system and stream processing technologies

[meetup-group]: http://www.meetup.com/unified-log-london/
[meetup-4]: http://www.meetup.com/unified-log-london/events/226174605/
[just-eat]: http://www.just-eat.co.uk/
[pic]: /assets/img/blog/2015/11/flavio-zookeeper-meetup.jpg

[flavio]: https://twitter.com/fpjunqueira
[flavio-slides]: https://cwiki.apache.org/confluence/download/attachments/24193445/unified-log-zk-nov15.pdf
[title-slide]: /assets/img/blog/2015/11/flavio-zookeeper-title-slide.png

[zookeeper]: https://zookeeper.apache.org/
[oreilly-zookeeper]: http://shop.oreilly.com/product/0636920028901.do
[curator]: http://curator.apache.org/
[etcd]: https://github.com/coreos/etcd
[consul]: https://www.consul.io/
[raft]: https://raft.github.io/

[confluent]: http://www.confluent.io/

[pipelinedb]: https://www.pipelinedb.com/
[kinesis-agg]: https://github.com/awslabs/amazon-kinesis-aggregators
[druid]: http://druid.io/

[lambda]: http://aws.amazon.com/lambda/

[email]: mailto:unified-ug@snowplowanalytics.com
