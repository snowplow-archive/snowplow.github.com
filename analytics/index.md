---
layout: page
group: analytics
sub_group: introduction
title: The Snowplow Analytics cookbook
shortened-link: Introduction
description: The Snowplow Analytics Cookbook contains a wealth of recipes for using Snowplow data to answer your business questions.
weight: 1
---

# The Snowplow Analytics cookbook

Snowplow enables analysts to perform a wide variety of both simple and sophisticated analytics on your event data. In this section of the website, we provide examples and sample queries to perform many of those analyses.

<!-- The Snowplow Analytics Cookbook guides you through the process of identifying which events to track. -->

## Foundational concepts

<!-- While it is possible to dive straight in and start crunching Snowplow data, it is helpful to understand the Snowplow data model (including how that model can be extended in customer-specific ways) and pipeline. This will make analysis easier -->

Whilst it is possible to dive in and start crunching Snowplow data, it is helpful to understand the Snowplow data model  and the Snowplow data pipeline. In <a href="/analytics/event-dictionaries-and-data-models/foundational-concepts.html">this section</a>, we cover these <a href="/analytics/event-dictionaries-and-data-models/foundational-concepts.html">foundational concepts</a> in detail.

1. [Events](/analytics/event-dictionaries-and-data-models/events.html)
2. [Dictionaries and schemas](/analytics/event-dictionaries-and-data-models/event-dictionaries-and-schemas.html)
3. [Contexts](/analytics/event-dictionaries-and-data-models/contexts.html)
4. [Iglu](/analytics/event-dictionaries-and-data-models/iglu.html)
5. [Stages in the Snowplow data pipeline](/analytics/event-dictionaries-and-data-models/collection-enrichment-modeling-analysis.html)
6. [Sending data into Snowplow](/analytics/event-dictionaries-and-data-models/sending-data-into-snowplow.html)
7. [Viewing event-level data in Snowplow](/analytics/event-dictionaries-and-data-models/viewing-the-event-data-in-snowplow.html)

## Data Modeling in Snowplow

<!-- the data modeling section is quite heavy on the technical stuff (SQL and so on) -->

The Snowplow data collection and enrichment process produces a data stream, where each data packet represents a single event. This is a rich data set and the possible applications of this data are endless. While it is common to do analysis against the event-level data, it is recommended to also aggregate data into smaller data sets.

Data modeling is the process aggregating event-level data into smaller data sets, while applying business logic (e.g. sessionization) and joining with other data sets.

1. [Data modeling](/analytics/data-modeling/)

<!-- [Identity stitching](/analytics/data-modeling/identity-stitching.html)
[Sessionization](/analytics/data-modeling/sessionization.html)
[Marketing attribution](/analytics/data-modeling/marketing-attribution.html) -->

## Performing Web Analysis using Snowplow data

Snowplow gives companies access to all data. The possible applications are endless. The data modeling step lowers the barrier to entry, and enables analysts to perform a wide variety of both simple and sohpisticated analyses using Snowplow data.

<!-- There are in innumerable ways to analyze Snowplow data.

meaningful patterns in data

 add attribution here as well; but analytics is kept qualitative -->

1. [Customer analytics][customer-analytics]. Understand your customers and users. 
2. [Catalog analytics][catalog-analytics]. Understand the different ways content items (articles / videos) and products in your catalog drive user behavior and value. 
3. [Platform analytics][platform-analytics]. Understand how updates to your application change user behavior and grow value.

## Tools and Techniques

1. [Tools and techniques][tools-and-techniques]. Useful techniques to employ with Snowplow data across a range of analyses.


<!-- 1. [SQL] -->
<!-- 2. [R] -->
<!--3. [Python and Pandas] -->
<!-- 4. [OLAP] -->

[production]: snowplow-data-production.html
[stored]: snowplow-data-storage.html
[structured]: snowplow-table-structure.html
[basic-recipes]: basic-recipes.html
[customer-analytics]: customer-analytics/overview.html
[platform-analytics]: platform-analytics/overview.html
[catalog-analytics]: catalog-analytics/overview.html
[tools-and-techniques]: tools-and-techniques/overview.html
[event-dictionaries]: /analytics/event-dictionaries-and-data-models/event-dictionaries-and-schemas.html
[data-modeling]: /analytics/event-dictionaries-and-data-models/data-modeling.html