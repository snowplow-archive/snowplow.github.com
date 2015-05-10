---
layout: post
shortenedlink: Huskimo 0.2.0 released
title: "Huskimo 0.2.0 released: warehouse your Singular marketing spend data in Redshift"
tags: [huskimo, marketing, spend, redshift]
author: Alex
category: Releases
---

We are pleased to announce Huskimo, an all-new open-source product from the Snowplow team. This initial release of Huskimo is for companies who use [Singular] [singular] to manage their mobile marketing campaigns, and would like to analyze the Singular marketing spend data in Amazon Redshift, alongside their Snowplow event data.

ADD A PICTURE OF A HUSKIMO

Although this is version 0.2.0 of Huskimo, this is the first publicized release, and so we will take some time in this blog post to explain the rationale for Huskimo as an all-new open-source project.

Read on after the jump for:

1. [xxx](/blog/2015/05/08/snowplow-r65-scarlet-rosefinch-released#enhancedPerformance)
2. [yyy](/blog/2015/05/08/snowplow-r65-scarlet-rosefinch-released#cors)
3. [Increased reliability](/blog/2015/05/08/snowplow-r65-scarlet-rosefinch-released#reliability)
4. [Loading configuration from DynamoDB](/blog/2015/05/08/snowplow-r65-scarlet-rosefinch-released#dynamodb)
5. [Randomized partition keys for bad streams](/blog/2015/05/08/snowplow-r65-scarlet-rosefinch-released#randomization)
6. [Removal of automatic stream creation](/blog/2015/05/08/snowplow-r65-scarlet-rosefinch-released#automaticStreams)
7. [Improved Elasticsearch index initialization](/blog/2015/05/08/snowplow-r65-scarlet-rosefinch-released#tokenization)
8. [Other changes](/blog/2015/05/08/snowplow-r65-scarlet-rosefinch-released#otherChanges)
9. [Upgrading](/blog/2015/05/08/snowplow-r65-scarlet-rosefinch-released#upgrading)
10. [Getting help](/blog/2015/05/08/snowplow-r65-scarlet-rosefinch-released#help)

<!--more-->

<h2><a name="why">1. Why Huskimo?</a></h2>

At Snowplow we strongly believe that _events_ are the most effective currency for capturing digital activity of any form. To enable this, we provide a variety of language/platform specific trackers, plus growing support for various third-party SaaS platforms via webhooks.

However, not all third-party SaaS platforms are willing or able to expose their internal stateful data as a stream of immutable events; worse, some of these platforms are the very ones that Snowplow users are _most_ excited about querying in Redshift alongside their Snowplow event data.

To bridge the gap, we are now open sourcing the [Huskimo project] [huskimo]. Huskimo has a simple goal: to make essential datasets currently locked away inside various SaaS platforms available for analysis inside Redshift. 

At launch, we are supporting just one SaaS platform: [Singular] [singular], which is a XXXXX.

<h2><a name="singular">2. Singular support</a></h2>

Huskimo supports two API resources made available by Singular:

1. xxx
2. xxx

For each resource type, Huskimo will retrieve all records from the Singular API, convert them into a , and load them into Redshift.

The most complex aspect of Huskimo is dealing with Singular marketing data becoming "golden" - Huskimo's approach to this is covered in the next section.

<h2><a name="singular">2. XXXXXX</a></h2>


 Marketing data is notoriously difficult to finalize - fraud det



The data that online advertising companies provide to their customers is another example. It takes days (sometimes weeks) for these companies to determine which clicks on ads were real, and which ones were fraudulent. This means that it also takes days or weeks for marketing spend data to be finalized, sometimes referred to as “becoming golden”. As a result of this, any join we do in a stream processing job between our ad click and what we paid for that click will only be a first estimate, and subject to refinement using our late arriving data.

<h2><a name="singular">3. Running Huskimo</a></h2>

Running Huskimo consists of three steps:

1. Install Huskimo
2. Write the Hukimo config file
3. Deploy the Redshift tables
4. Schedule Huskimo to run nightly

Setup Huskimo to run a

<h3>Install Huskimo</h3>

Huskimo is made available as an executable "fatjar" runnable on any Linux system. It is hosted on Bintray, download it like so:

$ wget XXX

Once downloaded, you can unzip it like so:

$ xxx

It's now ready to run!

<h3>Write the Huskimo config file</h3>

Huskimo is configured using a YAML-format file which looks like this:

xxx

Key things to note:

1. You can configure Huskimo to extract from one or more Singular accounts
2. You can configure Huskimo to write the extracted data to one or more Redshift databases

<h3>Deploy the Redshift tables</h3>

Before starting Huskimo you must remember to deploy the two Singular tables into Redshift. You can find the table definitions in the file:

 XXX.sql - 

Make sure to deploy this file against each Redshift database you want to load Singular data into.

<h3>Schedule Huskimo to run nightly</h3>

You are now ready to schedule Huskimo to run nightly. We would typically run Huskimo in the early morning so that the data for yesterday is already available in some form. A cron entry for Huskimo might look something like this:

xxx

<h2><a name="singular">3. Huskimo architecture</a></h2>

The Huskimo architecture is relatively simple: for a given API resource, e.g. campaigns, Huskimo will extract all resources

The Huskimo arcrchtiecture

<h2><a name="help">X-1. Getting help</a></h2>

For more details on this release, please check out the [Huskimo 0.2.0][020-release] on GitHub. 

We will be building a dedicated wiki for Huskimo to explain how to use it; in the meantime, if you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

<h2><a name="why">X. Huskimo roadmap</a></h2>

We will be adding support for further SaaS platforms to Huskimo on a case-by-case basis. The next release (0.3.0) of Huskimo will extract the major resource types from [Twilio] [twilio], the popular Telephony-as-a-Service provider.

We are also interested in adding support for more marketing channels, such as AdWords or Facebook. if this is something you would be interested in sponsoring, do [get in touch] [sponsorship-contact]!


[huskimo]: https://github.com/snowplow/huskimo
[020-release]: xxx

[singular]: xxx
[twilio]: xxx

[issues]: https://github.com/snowplow/huskimo/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

[sponsorship-contact]: mailto:contact@snowplowanalytics.com
