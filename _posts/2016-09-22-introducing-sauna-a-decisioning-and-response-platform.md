---
layout: post
title: "Introducing Sauna, a decisioning and response platform"
title-short: Sauna 0.1.0
tags: [sauna, response, marketing, operations, reaction, action, decisions, decisioning, commands, snowplow]
author: Alex
category: Releases
---

It's not every day that we get to announce an all-new *category* of software product here at Snowplow: we are hugely excited to be releasing version 0.1.0 of [Sauna] [sauna-repo], our new open-source decisioning and response platform.

Our [Snowplow] [snowplow-repo] platform is about enabling you, as a business, to track and capture events across all your different channels, in granular detail, in a data warehouse, so you can build intelligence on that data. The data that flows through this pipeline is very granular: each data item is an 'event' that on its own is not that valuable, but at scale gives you a complete picture of everything that's going on with each and every one of your users.

Because you have your own event-level data in your own data warehouse, you can then plug in any analytics tool to build insight and intelligence on that data. There is an enormous amount that can be done with this data, and there are an enormous number of different programs, platforms and libraries that can be used to build intelligence on your event-level data.

Once you build intelligence on that granular data, you'll want to act on it. In a lot of cases that means pushing the output of that intelligence to platforms and channels that you engage with your users through. To take a simple example: you might categorize a user based on her behavior into a particular user segment. You might then push that information "user A belongs to segment S" into Salesforce so your Sales team know about it, and into your email system so that your Marketing team can send that user a targeted email.

![sauna-img] [sauna-img]

The point of Sauna then is to do this third piece: to make it easier for you to act on your insight by pushing the output of computation/intelligence performed on your event streams (in step 2) to different channels.

Read on below the fold to find out more:

1. [A brief dip in the Sauna](/blog/2016/09/22/introducing-sauna-a-decisioning-and-response-platform#intro)
2. [What is a decisioning and response framework?](/blog/2016/09/22/introducing-sauna-a-decisioning-and-response-platform#what-and-why)
3. [The Sauna architecture](/blog/2016/09/22/introducing-sauna-a-decisioning-and-response-platform#architecture)
4. [Using Sauna with SendGrid](/blog/2016/09/22/introducing-sauna-a-decisioning-and-response-platform#sendgrid)
5. [Using Sauna with Optimizely](/blog/2016/09/22/introducing-sauna-a-decisioning-and-response-platform#optimizely)
6. [Setting up Sauna](/blog/2016/09/22/introducing-sauna-a-decisioning-and-response-platform#setup)
7. [Roadmap](/blog/2016/09/22/introducing-sauna-a-decisioning-and-response-platform#roadmap)
8. [Contributing](/blog/2016/09/22/introducing-sauna-a-decisioning-and-response-platform#contributing)

<!--more-->

<h2 id="intro">1. A brief dip in the Sauna</h2>

When we started building Snowplow almost five years ago, our focus was on delivering a scalable open-source event data pipeline. Our view was that you shouldn't need to have the scale or deep pockets of a Google or Facebook to warehouse your clickstream data; we understood that establishing an event data warehouse was the essential first step to driving insight for your business.

Fast forward to today and it's clear that much has changed: the importance of owning your own event stream data is a given, and the frontier has moved on to turning our insights into *actions*. It's no longer enough just to understand which of your customers have a high propensity to churn - what can you *do* about it, ideally in near-real-time?

Sauna is an all-new open-source product designed to make it easy for business analysts to turn *insights* they derive from their event streams into *actions* often performed via third-party marketing systems like [Optimizely] [optimizely] and [SendGrid] [sendgrid]. If Snowplow makes it easier for data analysts to build intelligence on their data, Sauna is here to make it easy for them to action that intelligence, by feeding it back into the different channels that are used to manage customer engagement. Whilst Snowplow provides you with a complete view of your user's journeys, Sauna enables you to intervene in those journeys, hopefully to improve them.

There are many different channels that an individual company might use to engage with its users, including (but not limited to):

* Email
* Push notification
* In-app
* In-store
* Display ads
* Social networks

Often companies use third party providers to manage their communications via each of the above channels. Whilst there are many excellent providers of e.g. email marketing, there are no general purpose frameworks for individual companies to push intelligence and decisions built on their event-level data into the myriad channels (and third party providers) a company works with. Sauna has been built to solve that problem.

If Snowplow is all about consolidating event streams from many sources into a event warehouse in Redshift, then Sauna is its complement: once you have the output of your analysis in Redshift, you can use Sauna to automatically pipe that data into Optimizely or SendGrid; a variety of integrations with other systems will be added to Sauna in due course.

Although Sauna is complementary to Snowplow (and built by the same team), you don't have to be a Snowplow user to use Sauna; you don't even have to be running your company on AWS. Sauna is for anybody who wants to make *decisions* based on their event stream data and then to *act* on those decisions, particularly via another software system.

<h2 id="what-and-why">2. What is a decisioning and response platform?</h2>

Popular enterprise middleware frameworks like [Apache Camel] [camel] and [MuleSoft] [mulesoft] have existed for many years. These technologies have typically been targeted at back-end developers, providing relatively low-level building blocks and frameworks for integrating various software systems together.

More recently, user-programmable rules engines have emerged, most famously [IFTTT] [ifttt], which is hosted, and [Huginn] [huginn], which is an open-source Ruby project.

How does Sauna compare to all this? Firstly, Sauna is a platform, not a framework: it is targeted at business analysts and other non-engineers who want to be able to respond to the insights they are generating without involving their Tech team in costly bespoke integration work.

Secondly, unlike IFTTT and Huginn, Sauna has been built to inter-operate with a company's [unified events log] [unified-log]: like Snowplow, Sauna is designed from the ground-up to be horizontally scalable and handle massive data volumes.

And lastly, at launch Sauna is wholly focused on performing specific actions in external SaaS systems; it does not include its own rules engine. While this could change in the future, for now we like the separation of concerns: you can make your decision inside of any language or platform that you like (from SQL to JavaScript to Spark), and Sauna will then be responsible for actually carrying out your decision.

<h2 id="architecture">3. The Sauna architecture</h2>

Sauna is a single executable, written in Scala using the [Akka actor framework] [akka]. Sauna is composed of three distinct types of module:

* **Observers** sit waiting for specific events to occur, and when they occur, it is the observer's job to trigger the appropriate responder. Without observers, Sauna would have nothing to do
* **Responders** carry out specific actions in third-party systems such as SendGrid and Optimizely when asked to by observers. Sauna ships with pre-defined responses
* **Loggers** provide feedback to the end user on the status of a response. Logging is important because Sauna is an asynchronous technology - end users trigger responder actions indirectly, via observers, and the work of a responder happens "out of band", with no direct feedback to the end user

This technical architecture shows how these module types fit together within Sauna:

![architecture-img] [architecture-img]

This first release of Sauna is shipping with the following modules:

* **Observers:** a [Local Filesystem Observer] [local-filesystem-observer-setup] which checks for new files arriving in the local filesystem of the machine running Sauna, and an [Amazon S3 Observer] [amazon-s3-observer-setup] which checks for new files arriving in a bucket in S3
* **Responders:** a [SendGrid Responder] [sendgrid-responder-guide] and an [Optimizely Responder] [optimizely-responder-guide]
* **Loggers:** a [HipChat Logger] [hipchat-logger-setup], a [DynamoDB Logger] [dynamodb-logger-setup] and a simple [Stdout Logger] [stdout-logger-setup]

We'll go through each of the two responders - the core of Sauna - in the next two sections.

<h2 id="sendgrid">4. Using Sauna with SendGrid</h2>

Our first responder allows you to use Sauna with [SendGrid] [sendgrid], the marketing and transactional email service provider (ESP).

This Sauna responder has a single *responder action*, which lets you export user-level data from your event warehouse and upload this data to SendGrid for use in email marketing. The SendGrid Responder will wait for files of email recipients to arrive in its configured *file landing area*, and then upload these email recipients into the SendGrid [Contacts Database] [sendgrid-contacts] (part of the SendGrid [Marketing Campaigns] [sendgrid-marketing-campaigns] suite).

The responder works with both of our observers, local filesystem and Amazon S3. Coupling this responder with Redshift's [UNLOAD statement] [unload] and our [SQL Runner] [sql-runner], you can schedule nightly updates to your email marketing lists based on your Snowplow data in Redshift.

Under the hood the SendGrid Responder uses SendGrid's [Contacts API] [sendgrid-contacts-api]. This responder saves you from a costly manual integration of your data pipeline into SendGrid using this API.

For more information on the SendGrid Responder, please check out:

* [The SendGrid Responder setup guide] [sendgrid-responder-setup], for devops
* [The SendGrid Responder usage guide] [sendgrid-responder-guide], for analysts

<h2 id="optimizely">5. Using Sauna with Optimizely</h2>

Our second responder in this release adds support for [Optimizely] [optimizely], the A/B testing service.

This responder supports two responder actions:

1. Uploading one or more [targeting lists] [optimizely-targeting-list] to Optimizely for A/B testing
2. Uploading a [Dynamic Customer Profiles (DCP)] [optimizely-dcp] datasource to Optimizely

As with our SendGrid Responder, the Optimizely Responder works with both of our observers, local filesystem and Amazon S3. Coupling this responder with Redshift's [UNLOAD statement] [unload] and our [SQL Runner] [sql-runner], you can schedule nightly updates to your A/B testing targeting lists or DCP profiles, all based on your Snowplow data in Redshift.

Under the hood, Sauna makes use of Optimizely's [Targeting List] [optimizely-targeting-lists-api] and [Bulk Upload] [dcp-bulk-upload] APIs. This responder saves you from having to manually integrate either or both of these APIs into your data pipeline.

For more information on the Optimizely Responder, please check out:

* [The Optimizely Responder setup guide] [optimizely-responder-setup], for devops
* [The Optimizely Responder usage guide] [optimizely-responder-guide], for analysts

<h2 id="setup">6. Setting up Sauna</h2>

Ready to get started with Sauna? You can deploy it onto a single server - version 0.1.0 doesn't yet support clustering - and put it through its paces.

You'll find all the necessary documentation on the [Setting up Sauna] [sauna-setup] homepage for devops and systems admins on the Sauna wiki.

<h2 id="roadmap">7. Roadmap</h2>

We're taking a very explorative, iterative approach with Sauna - the first release is deliberately narrow, being focused on just two marketing platforms and only supporting relatively "batchy" source data.

However we have ambitious plans for Sauna's future. In the short-term, summer intern Manoj Rajandrakumar has been working on an additional responders for [Urban Airship] [urban-airship], which we hope to release soon (here is a [sneak peek] [urban-airship-responder-guide] of the users guide).

Looking to the future, we are also very interested in extending Sauna to be able to respond to decisions in near-real-time. Our current thinking is to use JSON Schema (or Avro) to define specific commands (e.g. "send email", "raise PagerDuty incident"), and for Sauna to then be able to read those commands from [Amazon Kinesis] [kinesis] or [Apache Kafka] [kafka] streams. This would involve adding new observers for Kinesis and Kafka, as well as defining the new command schemas, which is discussed in [Command schema: design (issue #54)] [issue-54].

Lastly, while Sauna currently runs on a single server, it has been built on top of Akka, and we will be working to add Akka Cluster support for a distributed multi-node setup ([issue #56] [issue-56]).

<h2 id="contributing">8. Contributing</h2>

Sauna is completely open source - and has been from the start! If you'd like to get involved, perhaps adding a new observer, responder or logger, please do check out the [repository][sauna-repo].

If you are looking for an additional integration to be added to Sauna please [get in touch] [sponsorship-contact] to discuss sponsorship options.

And finally, we are super-excited to be developing a new software category - decisioning and response - through the Sauna project. If you have general thoughts or ideas on what the future of Sauna should look like, do please open a new thread on our [forums] [snowplow-discourse].

[sauna-repo]: https://github.com/snowplow/sauna
[snowplow-repo]: https://github.com/snowplow/snowplow

[sauna-img]: /assets/img/blog/2016/09/data-intelligence-action.png
[architecture-img]: /assets/img/blog/2016/09/sauna-architecture.png

[akka]: http://akka.io/
[kinesis]: https://aws.amazon.com/kinesis/streams/
[kafka]: http://kafka.apache.org/

[sendgrid]: https://sendgrid.com/
[sendgrid-contacts-api]: https://sendgrid.com/docs/API_Reference/Web_API_v3/Marketing_Campaigns/contactdb.html
[sendgrid-marketing-campaigns]: https://sendgrid.com/docs/User_Guide/Marketing_Campaigns/index.html
[sendgrid-contacts]: https://sendgrid.com/docs/User_Guide/Marketing_Campaigns/contacts.html

[urban-airship]: https://www.urbanairship.com/

[optimizely]: https://www.optimizely.com/
[optimizely-targeting-list]: https://help.optimizely.com/hc/en-us/articles/206197347-Uploaded-Audience-Targeting-Create-audiences-based-on-lists-of-data
[optimizely-dcp]: https://developers.optimizely.com/customer-profiles/
[optimizely-targeting-lists-api]: http://developers.optimizely.com/reference/index.html#create-list
[dcp-bulk-upload]: https://developers.optimizely.com/customer-profiles/#bulk

[sendgrid-responder-setup]: https://github.com/snowplow/sauna/wiki/SendGrid-Responder-setup-guide
[optimizely-responder-setup]: https://github.com/snowplow/sauna/wiki/Optimizely-Responder-setup-guide

[sauna-setup]: https://github.com/snowplow/sauna/wiki/Setting%20up%20Sauna
[local-filesystem-observer-setup]: https://github.com/snowplow/sauna/wiki/Local-Filesystem-Observer-setup-guide
[amazon-s3-observer-setup]: https://github.com/snowplow/sauna/wiki/Amazon-S3-Observer-setup-guide

[hipchat-logger-setup]: https://github.com/snowplow/sauna/wiki/HipChat-Logger-setup-guide
[dynamodb-logger-setup]: https://github.com/snowplow/sauna/wiki/DynamoDB-Logger-setup-guide
[stdout-logger-setup]: https://github.com/snowplow/sauna/wiki/Stdout-Logger-setup-guide

[sendgrid-responder-guide]: https://github.com/snowplow/sauna/wiki/SendGrid-Responder-user-guide
[optimizely-responder-guide]: https://github.com/snowplow/sauna/wiki/Optimizely-Responder-user-guide
[urban-airship-responder-guide]: https://github.com/snowplow/sauna/wiki/Urban-Airship-Responder-user-guide

[unload]: http://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html
[sql-runner]: https://github.com/snowplow/sql-runner

[issue-54]: https://github.com/snowplow/sauna/issues/54
[issue-56]: https://github.com/snowplow/sauna/issues/56

[unified-log]: https://www.manning.com/books/unified-log-processing

[camel]: http://camel.apache.org/
[mulesoft]: https://www.mulesoft.com/
[ifttt]: https://ifttt.com/
[huginn]: https://github.com/cantino/huginn

[sponsorship-contact]: mailto:contact@snowplowanalytics.com
[snowplow-discourse]: http://discourse.snowplowanalytics.com/
