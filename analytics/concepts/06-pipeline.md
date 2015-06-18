---
layout: page
group: analytics
sub_group: concepts
title: Stages in the Snowplow data pipeline
shortened-link: Snowplow data pipeline stages
description: Understand how the Snowplow data pipeline breaks out data collection, enrichment, modeling and analysis
weight: 6
permalink: /analytics/concepts/snowplow-data-pipeline/
redirect_from:
  - /analytics/event-dictionaries-and-data-models/collection-enrichment-modeling-analysis.html
---

# Understanding the Snowplow data pipeline

![data-pipeline](/assets/img/architecture/snowplow-architecture.png)

The Snowplow pipeline is built to enable a very clean separation of the following steps in the data processing flow:

1. [Data collection](#data-collection)
2. [Data enrichment](#data-enrichment)
3. [Data modeling](#data-modeling)
4. [Data analysis](#data-analysis)


We will cover each of those stages in turn, before considering [where in the data pipeline your business log should sit?](#where-in-your-data-pipeline-should-your-business-logic-sit)


<h2><a name="">1. Data collection</a></h2>

![data-collection](/assets/img/architecture/snowplow-architecture-2-collectors.png)

At data collection time, we aim to capture all the data required to accurately represent a particular event that has just occurred.

At this stage, the data that is collected should describe the events as they have happened, including as much rich information about:

1. The event itself
2. The individual/entity that performed the action - that individual or entity is a "context"
3. Any "objects" of the action - those objects are also "context"
4. The wider context that the event has occurred in

For each of the above we want to collect as *much* data describing the event and associated contexts as possible.

<h2><a name="data-enrichment">2. Data enrichment</a></h2>

![data-collection](/assets/img/architecture/snowplow-architecture-3-enrichment.png)

Often there are opportunities to learn more about an event that has occurred, if we combine the data captured at collection time with third party data sources. To give two simple examples:

1. If we capture the IP address of a user who has carried out a particular action at analysis time, we can infer that user's geographic location if we're able to lookup the IP address in a GeoIP database
2. If we know where the user who carried out the action was located, geographically, and the point in time where the event occurred, we will be able to infer the weather where the user was, if we have a database of weather conditions over time by geography

Both the above are examples of 'enrichments'. Enrichments are sometimes referred to as 'dimension widening': we're using 3rd party sources of data to enrich the data we originally collected about the event so that we have more context available for understanding that event, enabling us to perform richer analysis.

Snowplow supports the following enrichments out-of-the-box. We're working on making our enrichment framework pluggable, so that users and partners can extend the list of enrichments performed as part fo the data processing pipeline:

1. IP -> Geographic location
2. Referrer query string -> source of traffic
3. User agent string -> classifying devices, operating systems and browsers


<h2><a name="data-modeling">3. Data modeling</a></h2>

![data-collection](/assets/img/architecture/snowplow-architecture-5-data-modeling.png)

The data collection and enrichment process outlined above generates a data set that is an 'event stream': a long list of packets of data, where each packet represents a single event.

Whilst it is possible to do analysis directly on this event stream, it is very common to:

1. Join the event-stream data set with other data sets (e.g. customer data, product data, media data, marketing data, financial data)
2. Aggregate the event-level data into smaller data sets that are easier and faster to run analyses against
3. Apply 'business logic' i.e. definitions to the data as part of that aggregation step. We might have a particular approach to identifying users (and events that belong to users) across channels, group series of events for each user into sessions or group streams of actions performed by a particular user with a specific object (e.g. a video) into a single line of data

Examples of aggregated tables include:

1. User-level tables. These are generally much smaller than the event-level tables because they only have one line of data for each user tracked by Snowplow. User classification  is often carried out as part of the generation of this table: for example, which cohort a user belongs to. In addition any user-level data from other systems (external to Snowplow) e.g. CRM systems is typically pulled into these user-level tables.
2. Session-level tables. These are also much smaller than the event-level tables, but typically larger than the user-level table, because often users will have more than one session. The session-level table is typically where sessions are attributed to specific marketing channels, users are classified based on how far through different funnels they have progressed and classification by device, operating system and browser takes place
3. Product or media-level tables. It is common for retailers to aggregate over their event-level data to produce tables aggregated by SKUs or products. Similarly, it is common for media companies to aggregate data over articles, videos or audio streams. These tables can be used to conveniently compare the performance of different SKUs / media items / content producers / writers / brands and categories against one another. In Snowplow we typically refer to these types of analytics as merchandise or [catalog analytics](/analytics/catalog-analytics/overview.html).

The above are all illustrative examples of aggregate tables. In practice, what tables are produced, and the different fields available in each, varies widely between companies in different sectors, and surprisingly even varies within the same vertical. That is because part of putting together these aggregate tables involves implementing business-specific logic, including:

1. How to identify that users across multiple different channels are the same user i.e. [identity stitching](/analytics/customer-analytics/identifying-users.html)
2. Sessionization
3. Joining Snowplow data with 3rd party data sets

We call this process of aggregating  'data modeling'. At the end of the data modeling process, a clean set of tables is available to make it easier for to perform analysis on the data - easier because:

1. The volume of data to be queried is smaller (because the data is aggregated), making queries return faster
2. The basic tasks of defining users, sessions and other core dimensions and metrics has already been performed, so the analyst has a solid foundation for diving directly into the more interesting, valuable parts of the data analysis

<h2><a name="data-analysis">4. Data analysis</a></h2>

![data-collection](/assets/img/architecture/snowplow-architecture-6-analytics.png)

Once we have our data modeled in tidy users, sessions, content items tables, we are ready to perform analysis on them.

Most companies that use Snowplow will perform analytics using a number of different types of tools:

1. It is common to implement a Business Intelligence tool on top of Snowplow data to enable users (particularly non-technical users) to slice and dice (pivot) on the data. For many companies, the BI tool will be the primary way that most users interface with Snowplow data.
2. Often a data scientist or data science team will often crunch the underlying event-level data to perform more sophisticated analysis including building predictive models, perform marketing attribution etc. The data scientist(s) will use one or more specialist tools e.g. Python for Data Science or R.

The rest of the Analytics Cookbook covers a range of different analyses you can perform with Snowplow data. See the [customer analtyics](/analytics/customer-analytics/overview.html), [catalog analytics](/analytics/catalog-analytics/overview.html) and [platform analytics](/analytics/platform-analytics/overview.html) for specific details.

<h2><a name="where-in-your-data-pipeline-should-your-business-logic-sit">5. Where in your pipeline should your business logic sit?</a></h2>

Snowplow is architected in a fundamentally different way to common analytics packages like Google Analytics, Adobe Analytics and Mixpanel. In particular, the whole data collection process is totally decoupled from the data modeling and data analysis process. Users of traditional analytics systems are used to instrumenting the analytics trackers with one eye on the reports that they wish to produce - this will impact whether a particular point will be passed into Adobe Analytics as an eVar or sProp, or into Google Analytics as a custom dimension, custom metric, event or enhanced ecommerce. With Snowplow - the two questions - how you collect your data and how you crunch it, are separate - so when you instrument your Snowplow trackers, you need only think about _what_ you need to track. When you come to the data modeling piece down the line, _then_ you can consider _how_ you want to crunch your data.

This makes tracker instrumentation much simpler, as well as giving you significantly more flexibility once you've captured data to analyze it in many different ways, redefining your business logic as your business evolves, and applying those new definitions of the data you've collected retrospectively.

## Familiar with the stages in the Snowplow data pipeline?

Then [read on](../sending-data-into-snowplow) to find out about how to [send data into Snowplow](../sending-data-into-snowplow).
