---
layout: post
title: We need to talk about bad data
tags: [bad data, data pipelines, technical architecture]
author: Yali
category: Inside the Plow
---

<h2><small class="text-muted">Architecting data pipelines for data quality</small></h2>

No one wants to talk about bad data. A lot about working with data is sexy, but managing bad data, i.e. working to improve data quality, is not. Not only is talking about bad data not sexy, it is really awkward, because it forces us to confront a hard truth: that our data is not perfect, and therefore the insight we build on that data, might not be reliable. No wonder, then, that no one wants to talk about bad data: not the vendors who sell web and mobile analytics products: not the vendors who sell data pipeline collection and processing pipelines, and not the analytics teams that use those products to drive insight. Is it not better for all of us to pretend that we we do not have a bad data problem?

![we-need-to-talk-about-kevin-screenshot][kevin]

We do. The good news is that if we take a systematic approach, we can manage that problem. In this post, we'll confront bad data head on, and discuss how we've architected the Snowplow pipeline to manage and mitigate that problem.

1. [Why is bad data such a problem?] (#why)
2. [Known knowns, known unknowns and unknown unknown sources of bad data] (#sources)
3. [Architecting auditable pipelines] (#auditing-pipelines)
4. [Reprocessing data from scratch] (#reprocess)
5. [Tracking data lineage] (#lineage)
6. [Self-describing data] (#self-describing-data) 
7. [Handling late arriving data] (#late-arriving-data)
8. [Is your data pipeline a black box?] (#black-box)

<!--more-->

<h2 id="why">1. Why is bad data such a problem?</h2>

Bad data is a problem because it erodes our confidence in our data, which limits our ability to build insight on that data. To take a very noddy example, the graph below shows some metric (it can be any metric) over time, and a worrying dip in that metric. 

![kpi-over-time-with-temporal-dip][kpi]

Does this mean 

1. something went wrong with our business, to cause the dip? Or 
2. did something go wrong, with our data, that caused the dip? 

We need to rule to rule out (2) if we are to conclude (1).

<h2 id="sources">2. Known knowns, known unknowns and unknown unknown sources of bad data</h2>

If we are going to manage bad data, the first thing we need to do is identify as many potential sources of bad data i.e. known sources of bad data. In order to identify help us with this exercise, I've included a schematic of the Snwoplow data pipeline below. Whilst this is a Snowplow-specific diagram, the general data pipeline stages are broadly in common with many commercial pipeline products and home brewed solutions. Certainly the list of potential sources of bad data that we'll use the diagram to generate is one that should be true of any event data pipeline.

![event-data-pipeline-architecture][architecture]

We'll start by listing the sources of missing data. If there are any we've left of then do please add them to the comments section: we can only hope to manage those sources that we identify.

1. An event occurs that we wish to track, but something goes wrong so that the tracker does not generate a suitable 'packet of data' to describe what event has occurred. This might be because the tracker has been misconfigured, for example, or because the server processing the event is maxed out and lacks the bandwidth to generate the packet of data describing the event.
2. A packet of data describing the event is successfully generated, but for some reason the packet of data is not emitted from the tracker or webhook, or it gets lost in transit, before hitting the collector. This might happen if e.g. an event occurs on a web page that is tracked asyncronously, but the user leaves the web page before the asyncronous tag has had a chance to fire.
3. The packet of data might hit the collector, but might not be successfully pushed to the processing queue. (For example because there's a spike in incoming requests and the collector boxes are maxed out.)
4. The data is not successfully processed e.g. because it is malformed or a different format to that expected by the enrichment process.
5. The data fails to load into storage (i.e. the data warehouse) e.g. because one of the fields is the wrong type
6. A missing event data point results in an error in the data model i.e. a user is misassigned to the wrong behavioural category because a key event in their journey was not successfully recorded


We'll continue by considering the different sources of inaccurate data i.e. data that we have but that in some way misrepresents what has happened.

1. A robot aims to simulate human behaviour, to create the impression that something has occurred that has not. (E.g. click fraud.)
2. A tracker or webhook is misconfigured so it sends data inaccurate data
3. An enrichment process is misconfigured so e.g. a useragent string is incorrectly classified as a mobile rather than a tablet device
4. The data modeling is misconfigured so that 

<h2 id="auditing-pipelines">3. Architecting auditable pipelines</h2>

* Event level
* Audit independently at each stage
* Railway oriented programming

<h2 id="reprocessing-data-from-scratch">4. Reprocessing data from scratch</h2>

<h2 id="lineage">5. Tracking data lineage</h2>

<h2 id="self-describing-data">6. Self-describing data</h2>

<h2 id="late-arriving-data">7. Handling late-arriving-data</h2>

<h2 id="black-box">7. Is your data pipeline a black box?</h2>



[kevin]: /assets/img/blog/2016/01/we-need-to-talk-about-kevin-screenshot.jpg
[kpi]: /assets/img/blog/2016/01/kpi.png
[architecture]: /assets/img/architecture/snowplow-architecture.png