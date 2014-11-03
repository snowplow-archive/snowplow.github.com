---
layout: page
group: analytics
sub_group: foundation
title: Stages in the Snowplow data pipeline
shortened-link: Snowplow data pipeline stages
description: Understand how the Snowplow data pipeline breaks out data collection, enrichment, modelling and analysis
weight: 6
---

# Understanding the Snowplow data pipeline

The Snowplow pipeline is built to enable a very clean separation of the following steps in the data processing flow:

1. [Data collection](#data-collection)
2. [Data enrichment](#data-enrichment)
3. [Data modelling](#data-modelling)
4. [Data analysis](#data-analysis)


<h2><a name="">1. Data collection</a></h2>

At data collection time, we aim to capture all the data required to accurately represent a particular event that has just occurred.

<h2><a name="data-enrichment">2. Data enrichment</a></h2>

Often there are opportunities to learn more about an event that has occurred, if we combine the data captured at collection time with third party data sources. To give some simple examples:

1. If we capture the IP address of a user who has carried out a particular action at analysis time, we can infer that user's geographic location if we're able to lookup the IP address in a GeoIP database
2. If we know where the user who carried out the action was located, geographically, and the point in time where the event occurred, we will be able to infer the weather where the user was, if we have a database of weather conditions over time by geography

Both the above are examples of 'enrichments'. Enrichments are sometimes referred to as 'dimension widening': we're using 3rd party sources of data to enrich the data we originally collected about the event so that we have more context available for understanding that event, enabling us to perform richer analysis.

Snowplow supports the following enrichments out-of-the-box. We're working on making our enrichment framework pluggable, so that users and partners can extend the list of enrichments performed as part fo the data processing pipeline:

1. IP -> Geographic location
2. Referrer query string -> classifying source of traffic
3. User agent string -> classifying devices, operating systems and browsers


<h2><a name="data-modelling">3. Data modelling</a></h2>

The data collection and enrichment process outlined above generates a data set that is an 'event stream': a long list of packets of data, where each packet represents a single event.

Whilst it is possible to do analysis directly on this event stream, it is very common to:

1. Join the event-stream data set with other data sets (e.g. customer data, product data, media data, marketing data, financial data)
2. Aggregate the event-level data into smaller data sets that are easier and faster to run analyses against

Examples of aggregated tables include:

1. User-level tables. These are generally much smaller than the event-level tables because they only have one line of data for each user tracked by Snowplow. User classification is often carried out as part of the generation of this table: for example, which cohort a user belongs to. In addition any user-level data from other systems (external to Snowplow) e.g. CRM systems is typically pulled into these user-level tables.
2. Session-level tables. These are also much smaller than the event-level tables, but typically larger than the user-level table, because often users will have more than one session. The session-level table is typically where sessions are attributed to specific marketing channels, users are classified based on how far through different funnels they have progressed and classification by device, operating system and browser takes place
3. Product or media-level tables. It is common for retailers to aggregate over their event-level data to produce tables aggregated by SKUs or products. Similarly, it is common for media companies to aggregate data over articles, videos or audio streams. These tables can be used to conveniently compare the performance of different SKUs / media items / content producers / writers / brands and categories against one another. In Snowplow we typically refer to these types of analytics as merchandise or [catalog analytics](/analytics/catalog-analytics/overview.html).

The above are all illustrative examples of aggregate tables. In practice, what tables are produced, and the different fields available in each, varies widely between companies in different sectors, and surprisingly even varies within the same vertical. That is because part of putting together these aggregate tables involves implementing business-specific logic, including:

1. How to identify that users across multiple different channels are the same user i.e. [identity stitching](/analytics/customer-analytics/identifying-users.html)
2. Sessionization
3. Joining Snowplow data with 3rd party data sets

We call this process of aggregating  'data modelling'. At the end of the data modelling exercise, a clean set of tables are available to make it easier for to perform analysis on the data - easier because:

1. The volume of data to be queried is smaller (because the data is aggregated), making queries return faster
2. The basic tasks of defining users, sessions and other core dimensions and metrics has already been performed, so the analyst has a solid foundation for diving directly into the more interesting, valuable parts of the data analysis

<h2><a name="data-analysis">4. Data analysis</a></h2>

## Understanding the difference between contexts captured at data collection time, and contexts inferred during enrichment

## Understanding where your business logic should sit in the data pipeline



