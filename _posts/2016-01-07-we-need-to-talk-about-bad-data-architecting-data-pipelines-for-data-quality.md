---
layout: post
title: We need to talk about bad data
tags: [bad data, data pipelines, technical architecture]
author: Yali
category: Inside the Plow
---

<h2><small class="text-muted">Architecting data pipelines for data quality</small></h2>

No one in digital analytics talks about bad data. A lot about working with data is sexy, but managing bad data, i.e. working to improve data quality, is not. Not only is talking about bad data not sexy, it is *really awkward*, because it forces us to confront a hard truth: that our data is not perfect, and therefore the insight that we build on that data might not be reliable. No wonder, then, that so many people in the industry would rather pretend bad data is not a problem, including:

* the vendors who sell web and mobile analytics products
* the vendors who sell data pipeline collection and processing pipelines, and 
* the analytics teams that use those products to drive insight. 

![we-need-to-talk-about-kevin-screenshot][kevin]

We need to talk about bad data. We can't manage an issue unless we identify and it explore it. The good news is that if we take a systematic approach, we can manage bad data very effectively. In this post, we'll confront bad data head on, and discuss how we've architected the Snowplow pipeline to manage and mitigate bad data.

1. [Why is bad data such a problem?](/blog/2016/01/07/we-need-to-talk-about-bad-data-architecting-data-pipelines-for-data-quality/#why)
2. [Causes of bad data](/blog/2016/01/07/we-need-to-talk-about-bad-data-architecting-data-pipelines-for-data-quality
/#sources)
3. [Architecting auditable pipelines](/blog/2016/01/07/we-need-to-talk-about-bad-data-architecting-data-pipelines-for-data-quality/#auditing-pipelines)
4. [Reprocessing data from scratch](/blog/2016/01/07/we-need-to-talk-about-bad-data-architecting-data-pipelines-for-data-quality/#reprocess)
5. [Tracking data lineage](/blog/2016/01/07/we-need-to-talk-about-bad-data-architecting-data-pipelines-for-data-quality/#lineage)
6. [Self-describing data](/blog/2016/01/07/we-need-to-talk-about-bad-data-architecting-data-pipelines-for-data-quality/#self-describing-data) 
7. [Intelligent use of queues and auto-scaling](/blog/2016/01/07/we-need-to-talk-about-bad-data-architecting-data-pipelines-for-data-quality/#queues)
8. [How much confidence do you have in your data pipeline, and the quality of data generated?](/blog/2016/01/07/we-need-to-talk-about-bad-data-architecting-data-pipelines-for-data-quality/#black-box)

<!--more-->

<h2 id="why">1. Why is bad data such a problem?</h2>

Bad data is a problem because it erodes our confidence in our data, which limits our ability to build insight on that data. To take a very simple example, the graph below shows some metric (it can be any metric) over time, and a temporal dip in that metric. 

![kpi-over-time-with-temporal-dip][kpi]

What caused the dip? 

1. Did something went wrong with our business?
2. Did something go wrong with our data?

We need to rule to rule out (2) if we are to conclude (1).

The impact of bad data is more corrosive than simply making interpreting data difficult. Once question marks have been raised in an organization about the reliability of the data source, it becomes very hard to win back confidence in the data source, after which it is impossible to socialize insight derived from that data source.

<h2 id="sources">2. Causes of bad data</h2>

If we are going to manage bad data, the first thing we need to do is identify as many potential sources of bad data as possible. We can never rule out the possibility that there are as yet unidentified sources of bad data  - but we can do our best by keeping our list of known sources of bad data as exhaustive as possible.

In order to identify help us with this exercise, I've included a schematic of the Snowplow data pipeline below. Whilst this is a Snowplow-specific diagram, the general data pipeline stages are broadly in common with many commercial data pipeline products and home-brewed event data pipelines. We can use this diagram as a jumping off point to identify potential sources of bad data in any data pipeline.

![event-data-pipeline-architecture][architecture]

There are two root causes of data quality issues:

2.1 [Missing data](#missing-data)  
2.2 [Inaccurate data](#inaccurate-data)  

<h3 id="missing-data">2.1 Missing data</h3>

We'll start by identifying the sources of missing data. If we've missed any, then do please share them in the Comments section below!

1. An event occurs that we wish to track, but something goes wrong so that the tracker does not generate a suitable 'packet of data' to describe what event has occurred. This might be because the tracker has been misconfigured, for example, or because the server processing the event is maxed out and lacks the bandwidth to generate the packet of data describing the event
2. A packet of data describing the event is successfully generated, but for some reason the packet of data is not emitted from the tracker or webhook, or it gets lost in transit, before hitting the collector. This might happen if e.g. an event occurs on a web page that is tracked asyncronously, but the user leaves the web page before the asyncronous tag has had a chance to fire
3. The packet of data might hit the collector, but might not be successfully pushed to the processing queue. For example, this could occur because there is a spike in incoming requests and the collector boxes are overloaded
4. The data is not successfully processed, e.g. because it is malformed or a different format to that expected by the enrichment process
5. The data fails to load into storage (i.e. the data warehouse), e.g. because one of the fields is the wrong type
6. A missing event data point results in an error in the data model, e.g. a user is mis-assigned to the wrong behavioral category because a key event in their journey was not successfully recorded

<h3 id="inaccurate-data">2.2 Inaccurate data</h3>

Another class of data quality issue is caused by *inaccurate* data. Again let us try and identify the different sources of inaccurate data:

1. A robot aims to simulate human behaviour, to create the impression that something has occurred that has not. Ad click fraud is a good example of this
2. A tracker or webhook is misconfigured so that it sends inaccurate data
3. An enrichment process is misconfigured so that e.g. a useragent string is incorrectly classified as a mobile rather than a tablet device
4. The data modeling is misconfigured so that users are incorrectly categorised into incorrect audience segments

<h2 id="auditing-pipelines">3. Architecting auditable pipelines</h2>

The first step to managing bad data is to ensure that we can *spot* data quality issues i.e. identify either that data is missing, or that it is inaccurate. Making sure that your data pipeline is auditable, so that you can conduct those checks, is essential.

There are several features of the Snowplow pipeline that make it especially easy to audit data quality:

3.1 [Auditing can be done at the event-level](#auditing-at-the-event-level)  
3.2 [Auditing can be done at each stage in the data pipeline](#audit-each-stage)  
3.3 [Data is never dropped from the Snowplow pipeline](#never-drop-data)  

Let's discuss each of these in turn.

<h3 id="auditing-at-the-event-level">3.1 Auditing can be done at the event-level</h3>

When you audit data processed through the Snowplow data pipeline, you can drill down to the event-level. That's very important, because:

1. It is the most granular level - so you can be sure that if it is accurate, any views computed on it are accurate
2. It is the easiest to reason about. If you know an event has occured, you can check that it has been recorded with all the data you expect. 

Most data pipelines are auditable at the event level - one notable exception is Google Analtyics (the free rather than the Premium version, which makes 'hit' level data available in BigQuery.) This seriously limits the ability of Google Analytics users to identify and manage data quality issues - something many have become aware of since migrating from GA Classic to Universal Analytics, with perceived discrepancies in the KPI post-migration being hard to explore leave alone explain.

<h3 id="audit-each-stage">3.2 Auditing can be done at each stage in the data pipeline</h3>

Event data pipelines are complicated things: a lot of computation is done on the data through the pipeline. This is a good thing, because each step adds value to the data, but equally each step creates a new opportunity for something to go wrong resulting either in data loss (missing data) or data corruption (inaccurate data).

Snowplow is architected so that the data can be diligenced throughout the data pipeline. Specifically:

1. The raw requests made to the collector are logged to S3. That means we can diligence that an event has successfully been sent into the Snowplow pipeline before any processing is done on that data in the pipeline
2. Processed data is also stored in its entirity in Amazon S3, prior to loading into different storage targets (e.g. Elasticsearch or Amazon Redshift) 
3. The event-level data can be diligenced in the different storage targets themselves (e.g. Amazon Redshift and Elasticsearch)
4. The HTTP requests emitted from the trackers can be monitored and diligenced using standard proxy applications, e.g. [Charles][charlesproxy]

<h3 id="never-drop-data">3.3 Data is never dropped from the Snowplow pipeline</h3>

One of the lovely things about diligencing event-level data is that it is easy to reason about: if you record 10 events with a tracker, you should be able to identify those 10 events in the raw collector logs, those 10 events in the processed data in s3 and those 10 events in your different storage targets (e.g. Redshift or Elasticsearch).

What if something goes wrong with a processing step for one of the events?

Every other analytics platform and data pipeline that we are aware of simply 'drops' the problematic data, resulting in missing data. This is deeply problematic, because it becomes very hard to spot missing data: if you are relying on your analytics system to tell you what has happened and it fails to tell you about something, you have to be very fortunate to separately *know* that that thing occurred to identify that it is missing.

So with Snowplow, rather than drop events that fail to process, we load them into a separate "bad rows" folder in S3. This data set includes a record not only of all the events that failed to be processed successfully, but also an array of all the error messages generated when that data was processed. We then load the bad data into Elasticsearch, to make it easy for our users to:

1. Monitor bad data levels, so they can easily spot if the % of events that are not successfully processed suddenly spikes (e.g because a new part of an application has been incorrectly instrumented)
2. Identify the root cause of the issue (possible because the error messages are included in the data set)
3. Address the issue ASAP (possible because bad rows are flagged as soon as they are processed, which might be well before an analyst has used that data)
4. Reprocess the bad data, so that it is no longer missing

A guide to using Kibana / Elasticsearch to monitoring bad data with Snowplow is in the works, but in the meantime, to give you a flavor, the below screenshot shows the number of events that failed to be successfully processed for a Snowplow trial user. At the top of the UI you can view the number of events that failed to successfully process per run: note that this is alarmingly high. Below, we can inspect a sample set of events. We can quickly identify that all the events in this batch that failed processing had the same root cause: a non-numeric value inserted into a numeric column (`se_value`):

![analyzing-bad-rows-in-kibana][kibana-example]

<h2 id="reprocessing-data-from-scratch">4. It is always possible to reprocess data</h2>

A basic data science principle is that you should be able to recompute your analysis from scratch. This is important because if you spot an error in one of the processing steps, you can fix it and then run the analysis again.

We've taken exactly the same approach with the Snowplow pipeline: you can always reprocess your data from scratch, (starting with the raw collector logs). That means that you can:

1. Reprocess a particular time period of data (or even your entire data set) if for example a step in the pipeline was miconfigured
2. Resolve the issue in data discovered in the bad rows bucket and then subsequently reprocess that so that data is now lost

<h2 id="lineage">5. Tracking data lineage</h2>

When we diligence our data quality, we need more than just the data itself - we need metadata that describes:

1. How the data was generated
2. How the data was processed

This metadata is essential to help us identify and address issues - to take a very simple example, if we can see that an issue is restricted to a particular application, time period, or enrichment version, we can take steps to resolve that problem. Performing that diagnosis requires that metadata.

The Snowplow pipeline generates a large amount of metadata on data lineage, and stores that metadata with the data itself. For example, each event includes:

1. Metadata that describes the tracker (including tracker version) and application or webhook that the event was recorded on
2. The time that the event was recorded, the time that it hit the collector and the time that the event was enriched
3. The schema that the data should conform to

All of the above metadata is invaluable when diligencing data for quality issues, and then diagnosing the source of any issues that are spotted.

We'll take a closer look at the value of attaching the data schema for each event with the event data itself in the next section.

<h2 id="self-describing-data">6. Self-describing data</h2>

When we build data processing steps, we make assumptions about how data is structured. If data is malformed, so that e.g. a field that should be numeric is not, that is liable to cause any data processing step that treats the field as a number to break.

Data that is sent into Snowplow is 'self-describing': it includes not just the data itself, but the schema i.e. structure for the data. This means that users can evolve their data schemas over time. More importantly when we think about bad data, it also means that Snowplow can validate that the data conforms to the schema right at the beginning of the pipeline, upstream of any data processing steps that would otherwise fail because the data has been malformed. If the data fails validation, Snowplow can push the data into the bad rows bucket with a very specific error message describing exactly what is wrong with what field, so that the issue can be addressed and the data reprocessed.

Most of our competitors claim to support 'schemaless' event analytics, but as Martin Fowler made clear in his excellent presentation on [Schemaless Data Structures] [fowler-schemaless]:

> schemaless structures still have an implicit schema ... Any code that manipulates the data needs to make some assumptions about its structure, such as the name of fields. Any data that doesn't fit this implicit schema will not be manipulated properly, leading to errors.

<h2 id="queues">7. Intelligent use of queues and auto-scaling</h2>

If you return to the initial list of sources of missing data, in particular, you will note that limitations in processing power can lead to data loss. To go back to three examples:

1. If we're tracking data from a webapp via a Javascript tracker using asyncronous tags, there is a risk that the user will leave the website before the tag has fired
2. If there is a traffic spike, there's a risk that the collector will max-out and not all incoming HTTP requests will be successfully logged, leading to data loss
3. If the collector is maxed out, even if it managed to successfully record a HTTP request with incoming event data, it might fail to write that data to the queue for downstream processing

Note that I have focused on issues at the beginning of the pipeline. As I explained earlier, once our data has been logged to S3, we have the ability to reprocess it, so any difficulties should not result with data loss at this stage.

The Snowplow pipeline makes extensive use of queues and autoscaling to minimize the chance of data loss due to the above issues:

7.1 [Trackers queue data locally](#tracker-queue)  
7.2 [Each collector instances uses a local queue before pushing data to the global queue](#collector-queue)  
7.3 [Collectors are distributed applications that autoscale to handle traffic spikes](#autoscale)  

<h3 id="tracker-queue">7.1 Trackers queue data locally, and only remove data from the queue when a collector has successfully received it</h3>

Our core client-side event trackers (JavaScript, Android, Objective-C) all make use of a local queue for storing event level data. That data is then sent into the Snowplow pipeline asyncronously via HTTP requests. The event data is persisted in the local queue until the collector returns a 200 to indicate that the data has been successfully received.

This is really important. It means, for example, that if a user leaves a website before all the different asyncornous tags have fired, those tags will have the opportunity to be fired when the user returns to the website at a later date. It means that if the collector is temporarily unavailable, the data will be cached locally and resent once the collector is back up. It means that in the event of a network connectivity issue between the tracker and the collector, no data is lost.

<h3 id="collector-queue">7.2 Each collector instances uses a local queue before pushing data to the global queue (either Kinesis or S3)</h3>

The Snowplow batch-based pipeline uses Amazon S3 as a processing queue. The Snowplow real-time pipeline uses Amazon Kinesis as a processing queue.

Prior to writing the data to these queues, the event data will be persisted briefly on individual collector instances. In the case of the Clojure collector (used on the batch pipeline), the data will be stored locally and flushed to S3 each hour. During that hour, it is persisted to disk (Amazon Elastic Block Storage). For the Scala Stream Collector, it is persisted to an in-memory queue, wWhich is flushed at a configurable frequency to Kinesis.

In both cases, the data remains in the queue until it is successfully flushed. This means, for example, that Snowplow users in us-east-1 did not need to worry when a few months ago there was a brief Amazon S3 outage: during the outage the flush to S3 failed, but the data was persisted locally, and pushed to S3 once the outage had been resolved.

<h3 id="autoscale">7.3 Collectors are distributed applications that autoscale to handle traffic spikes</h3>

Rather than rely on individual boxes, both the Clojure Collector and Scala Stream Collector are distributed apps that run on multiple instances in an autoscaling group behind an Elastic Load Balancer.

<h2 id="black-box">8. How much confidence do you have in your data pipeline, and the quality of data generated?</h2>

Managing bad data is an essential ongoing workstream for any data team that wants to build confidence in the insight developed on their data sets. Unfortunately, most solutions simply do not equip their users with the tools to identify data quality issues, leave along diagnose and resolve them. Bluntly, most commercial analytics and data pipeline solutions are black boxes: certainly you can test sending in a handful of data points and see that they come out of the other side. Of course, you can send data into two different pipelines and compare the output. But beyond that, you can only really choose to trust, or not, each solution.

At Snowplow, we've taken a radically diffent approach: rather than burying bad data, we seek to surface it, so that it can be correctly handled. 

<h2>Care about the quality of your data? Want to implement data pipelines that you can rely on?</h2>

Then [get in touch][contact]!


[kevin]: /assets/img/blog/2016/01/we-need-to-talk-about-kevin-screenshot.jpg
[kpi]: /assets/img/blog/2016/01/kpi.png
[kibana-example]: /assets/img/blog/2016/01/kibana.png
[architecture]: /assets/img/architecture/snowplow-architecture.png
[charlesproxy]: https://www.charlesproxy.com/
[contact]: http://snowplowanalytics.com/contact/

[fowler-schemaless]: http://martinfowler.com/articles/schemaless/
