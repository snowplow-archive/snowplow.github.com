---
layout: post
title: "Introducing Sauna, a decisioning and response platform"
title-short: Sauna 0.1.0
tags: [sauna, response, reaction, action, decisions, decisioning, commands, snowplow]
author: Alex
category: Releases
---

It's not every day that we get to announce an all-new *category* of software product here at Snowplow: we are hugely excited to be releasing version 0.1.0 of [Sauna] [sauna-repo], our new open-source decisioning and response platform.

Our [Snowplow] [snowplow-repo] platform is about enabling you, as a business, to track and capture events across all your different channels, in granular detail, in a data warehouse, so you can build intelligence on that data. The data that flows through this pipeline is very granular: each data item is an 'event' that on its own is not that valuable, but at scale gives you a complete picture of everything that's going on with your customers.

Once you build intelligence on that granular data, our expectation is that you'll want to act on it. In a lot of cases that means pushing the output of that intelligence to other platforms. To take a simply example: you might categorise a user based on her behavior into a particular user segment. You might then push that information "user A belongs to segment S" into Salesforce so your Sales team know about it, and into your email system so that your Marketing team can send that user a targeted email.

[!response-img] [response-img]

The point of Sauna then is to do this second piece: to make it easier for you to act on your insight by pushing the output of computation performed on your event streams to different third parties.

Read on below the fold to find out more:

1. [A brief dip in the Sauna]()
2. [What is a decisioning and response framework, and why do I need one?](/blog/2016/09/18/zzz#what-and-why)
3. [The Zen of Factotum](/blog/2016/09/18/zzz#zen)
3. [Factotum 0.1.0](/blog/2016/09/18/zzz#factotum)
4. [Downloading and running Factotum](/blog/2016/09/18/zzz#install)
5. [Writing jobs for Factotum](/blog/2016/09/18/zzz#authoring)
6. [Roadmap](/blog/2016/09/18/zzz#roadmap)
7. [Contributing](/blog/2016/09/18/zzz#contributing)

<!--more-->

<h2 id="intro">1. A brief dip in the Sauna</h2>

When we started building Snowplow almost five years ago, our focus was on delivering a scalable open-source event data pipeline. Our view was that you shouldn't need to have the scale or deep pockets of a Google or Facebook to warehouse your clickstream data; we understood that establishing an event data warehouse was the essential first step to driving insight for your business.

Fast forward to today and it's clear that much has changed: the importance of owning your own event stream data is a given, and the frontier has moved on to turning our insights into *actions*. It's no longer enough just to understand which of your customers have a high propensity to churn - what can you *do* about it, ideally in near-real-time?

Sauna is an all-new open-source product designed to make it easy for business analysts to turn *insights* they derive from their event streams into *actions* performed via third-party marketing systems like [Optimizely] [optimizely] and [SendGrid] [sendgrid].

If Snowplow is all about consolidating event streams from many sources into a event warehouse in Redshift, then Sauna is its complement: once you have the output of your analysis in Redshift, you can use Sauna to automatically pipe that data into Optimizely or SendGrid; a variety of integrations with other systems will be added to Sauna in due course.

Although Sauna is complementary to Snowplow (and built by the same team), you don't have to be a Snowplow user to use Sauna; you don't even have to be running your company on AWS. Sauna is for anybody who wants to make *decisions* based on their event stream data and then to *act* on those decisions, particularly via another software system.

<h2 id="what-and-why">2. What is a decisioning and response platform, and why do I need one?</h2>

Popular enterprise middleware frameworks like [Apache Camel] [camel] and [MuleSoft] [mulesoft] have existed for many years. These technologies have typically been targeted at back-end developers, providing relatively low-level building blocks and frameworks for integrating various software systems together.

More recently, user-programmable rules engines have emerged, most famously [IFTTT] [ifttt], which is hosted, and [Huginn] [huginn], which is an open-source Ruby project.

How does Sauna compare to all this? Firstly, Sauna is a platform, not a framework: it is targeted at business analysts and other non-engineers who want to be able to respond to the insights they are generating without involving their Tech team in costly bespoke integration work.

Secondly, unlike IFTTT and Huginn, Sauna has been built to inter-operate with a company's [unified events log] [unified-log]: like Snowplow, Sauna is designed from the ground-up to be horizontally scalable and handle massive data volumes.

And lastly, at launch Sauna is wholly focused on performing specific actions in external SaaS systems; it does not include its own rules engine. While this could change in the future, for now we like the separation of concerns: you can make your decision inside of any language or platform that you like (from SQL to JavaScript to Spark), and Sauna will then be responsible for actually carrying out your decision.

<div class="html">
<h2 id="main_concepts">Architecture of Sauna</h2>
</div>

In the example above:

1. There is an AWS S3 *observers*, that awaits for new files, triggers *processors* and cleans up S3 bucket. 
2. There is an Optimizely TargetingLists *processor*, that checks if file is valid, upload it to Optimizely *API*. 
3. There is an Optimizely *API*, that handles all actions with Optimizely.


At the moment (0.0.1 version) there are two observers (local and S3) and three processors, two for Optimizely and one for Sendgrid.


<h2 id="roadmap">6. Roadmap for Sauna</h2>

We're taking a very explorative, iterative approach with Sauna - the first release is deliberately narrow, being focused on just two marketing platforms and only supporting relatively "batchy" source data.

However we have ambitious plans for Sauna's future. In the short-term, summer intern Manoj Rajandrakumar has been working on an additional responders for [Urban Airship] [urban-airship], which we hope to release soon (here is a [sneak peak] [ua-responder-guide] of the users guide).

Looking to the future, we are also very interested in extending Sauna to be able to respond to decisions in near-real-time. Our current thinking is to use JSON Schema (or Avro) to define specific commands (e.g. "send email", "raise PagerDuty incident"), and for Sauna to then be able to action entire Kinesis or Kafka streams of these commands. This would involve adding new observers for Kinesis and Kafka, as well as defining the new command schemas, which is discussed in [Command schema: design (issue #54)] [issue-54].

Lastly, while Sauna currently runs on a single server, it has been built on top of Akka, and we will be working to add Akka Cluster support for a distributed multi-node setup ([issue #56] [issue-56]). 

<h2 id="contributing">7. Contributing</h2>

Sauna is completely open source - and has been from the start! If you'd like to get involved, perhaps adding a new observer, responder or logger, please do check out the [repository][sauna-repo].

If you are looking for an additional integration to be added to Sauna please [get in touch] [sponsorship-contact] to discuss sponsorship options.

And finally, we are super-excited to be developing a new software category - decisioning and response - through the Sauna project. If you have general thoughts or ideas on what the future of Sauna should look like, do please open a new thread on our [forums] [snowplow-discourse].

[sauna-repo]: https://github.com/snowplow/sauna
[snowplow-repo]: https://github.com/snowplow/snowplow

[response-img]: xxx

[sendgrid]: xxx
[urban-airship]: xxx
[optimizely]: yyy

[ua-responder-guide]: https://github.com/snowplow/sauna/wiki/Urban-Airship-Responder-user-guide

[issue-54]: https://github.com/snowplow/sauna/issues/54
[issue-56]: https://github.com/snowplow/sauna/issues/56

[unified-log]: xxx

[camel]: xxx
[mulesoft]: xxx
[ifttt]: https://ifttt.com/
[huginn]: https://github.com/cantino/huginn

[sponsorship-contact]: mailto:contact@snowplowanalytics.com
[snowplow-discourse]: http://discourse.snowplowanalytics.com/
