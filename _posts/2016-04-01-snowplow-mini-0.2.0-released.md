---
layout: post
title: Snowplow Mini 0.2.0 released
title-short: Snowplow Mini 0.2.0
tags: [snowplow, real-time, kinesis, developer tools]
author: Josh
category: Releases
---

We are very happy to annouce the release of a brand new product in the form of [Snowplow Mini][snowplow-mini-repo]! Snowplow Mini consolidates the Snowplow real-time pipeline into a single EC2 instance to allow you to test and play with the power of the Snowplow real-time analytics stack without the inherent complexity and cost of organising all of the required applications.

Some good use cases for Snowplow Mini:

1. Giving a Snowplow consumer (e.g. an analyst / data team / marketing team) a way to quickly understand what Snowplow "does" i.e. what you put it at one end and take out of the other
2. Giving developers new to Snowplow an easy way to start with Snowplow and understand how the different pieces fit together
3. Giving people running Snowplow a quick way to debug tracker updates and custom events

Read on below the jump for:

1. [Overview](/blog/2016/04/01/snowplow-mini-0.2.0-released#overview)
2. [Snowplow Real-Time topology](/blog/2016/04/01/snowplow-mini-0.2.0-released#topology)
3. [Event development](/blog/2016/04/01/snowplow-mini-0.2.0-released#event-development)
4. [Software stack](/blog/2016/04/01/snowplow-mini-0.2.0-released#software-stack)
5. [Roadmap](/blog/2016/04/01/snowplow-mini-0.2.0-released#roadmap)
6. [Getting help](/blog/2016/04/01/snowplow-mini-0.2.0-released#help)

<!--more-->

<h2 id="overview">1. Overview</h2>

Snowplow Mini provides a single instance solution for the Snowplow real-time pipeline.  As we have removed the overhead of actually sending the events to Kinesis Streams and to other servers Snowplow Mini is able to process and store the event in Elasticsearch within milliseconds.  This makes for an incredibly fast testing environment where you can do end-to-end validation of your events and of your Tracker implementation, as opposed to using the batch based pipelines where you need to wait a minimum of 1 hour to see if your implementation was correct.

Once you have deployed it using the [Quickstart Guide][quickstart-guide] you will be able to access several different services on the instance:

* Snowplow Mini UI, accessed on port 80 of the instance, provides a brief overview of how everything fits together and quicklinks to all the relevant information.
* Snowplow Stream Collector, accessed on port 8080, allows you to send events to Snowplow Mini.
* Snowplow Iglu Server, accessed on port 8081, allows you to push your own custom schemas into the instance.
* Elasticsearch, accessed on port 9200, stores all of your `good` and `bad` events persistently and allows you to query the data sent in.
* Kibana, accessed on port 5601, provides an interactive visualization tool for all the data in Elasticsearch.

<h2 id="topology">2. Snowplow Real-Time topology</h2>

While the batch pipeline is a fairly simple stack in that the flow consists of; collectors -> logs -> ETL -> Redshift.  The real-time pipeline has many more moving parts; especially due to the need to enrich and warehouse the information in real-time rather than in a batch based approach.  

The real-time flow goes as follows:

1. Collector receives events and writes them to a raw events stream or a bad stream (if the event is oversized)
2. Stream Enrich pulls events from the raw stream and attempts to validate and enrich the event.  Succesful events are written to an enriched stream and bad events are written to a bad stream.
3. Elasticsearch Sinks are then configured to pull events from both the enriched and bad event streams and to then load them into distinct Elasticsearch indexes for viewing and analysis.

This diagram illustrates how the same flow has been replicated inside Snowplow Mini:

![snowplow-mini-topology] [snowplow-mini-topology]

The Kinesis Streams have simply been replaced by named unix pipes and each application is run on the same box.  In production each application should be on it's own instance.

<h2 id="event-development">3. Event development</h2>

At Snowplow we give you the power to define, send and store any information you can think of in the form of custom contexts and unstructured events.  Building and testing these events however is a long and often quite complicated process. To perform a full integration of an event you need to have:

1. Collector to capture raw events
2. Enrichment to validate your events
3. A storage target to land these events in so you can check what data came through

The amount of moving pieces in setting up either the Batch or Real-Time pipeline can make this a very complicated and expensive process.  In the case of Batch processing developers need to wait up to, if not more than, an hour to see new events arrive from the collector into a place that they can check them.  

With Snowplow Mini we are moving towards alleviating this problem by allowing you to spin up a single instance for an entire pipeline which is:

- Self contained 
- Minimal configuration
- No requirements on other AWS resources

This gives you a ready to run real-time stack which can do full event validation in a start-to-finish fashion where events arrive in Elasticsearch in less than a second.  It also allows you to debug events that are failing by storing the bad rows along with the good rows in Elasticsearch, drastically speeding up the integration debug loop.

Snowplow Mini as it stands only supports Elasticsearch as an end storage target but we are hoping to support either PostgreSQL or Redshift as another target in the near future!

<h2 id="software-stack">4. Software stack</h2>

The current stack consists of the following applications:

* Snowplow Stream Collector 0.6.0 : Collects your Tracker events
* Snowplow Stream Enrich 0.7.0 : Enriches the raw events
* Snowplow Elasticsearch Sink 0.5.0 : Loads events into Elasticsearch
* Snowplow Iglu Server 0.2.0 : Provides jsonschemas for Snowplow Stream Enrich
* Elasticsearch 1.4 : Stores your enriched and bad events
* Kibana 4.0.1 : Front-end for managing your enriched events

As so many services are running on the box we recommend a t2.medium or higher for a smooth experience during testing and use.  This is dependant on a number of factors such as the amount of users and the amount of events being sent into the instance.

<h2 id="roadmap">5. Roadmap</h2>

We have big plans for Snowplow Mini:

* Support for event storage to Redshift and PostgreSQL ([#9][9])
* Realtime statistics in the Snowplow Mini UI ([#45][45])
* Expansion of Example Events in Snowplow Mini UI ([#44][44])

As well as distribution of Snowplow Mini to multiple channels:

* Adding Snowplow Mini as a Vagrant image ([#35][35])
* Adding Snowplow Mini as a composed Docker application ([#23][23])

If you have an idea of something you would like to see or need from Snowplow Mini please [raise an issue][issues]!

<h2 id="help">6. Getting help</h2>

For more details on this release, please check out the [release notes][snowplow-mini-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues].

[snowplow-mini-topology]: /assets/img/blog/2016/04/snowplow-mini-topology.jpg
[23]: https://github.com/snowplow/snowplow-mini/issues/23
[35]: https://github.com/snowplow/snowplow-mini/issues/35
[9]: https://github.com/snowplow/snowplow-mini/issues/9
[45]: https://github.com/snowplow/snowplow-mini/issues/45
[44]: https://github.com/snowplow/snowplow-mini/issues/44
[snowplow-mini-repo]: https://github.com/snowplow/snowplow-mini
[quickstart-guide]: https://github.com/snowplow/snowplow-mini/wiki/Quickstart-guide
[snowplow-mini-release]: https://github.com/snowplow/snowplow-mini/releases/0.2.0
[wiki]: https://github.com/snowplow/snowplow-mini/wiki/Quickstart-guide
[issues]: https://github.com/snowplow/snowplow-mini/issues
