---
layout: page
header: title
group: documentation
title: Documentation
description: How to get the most out of Snowplow.
permalink: /documentation/
redirect_from:
  - /analytics/
---

## Foundational concepts

It is possible to use Snowplow data to answer questions and generate insight without a deep knowledge of the basic concepts that underpin the Snowplow approach to event data collection, warehouse and analyses. If you are serious about using Snowplow in the most effective way, however, and are looking to perform more sophisticated analyses, or empower a broader range of business users to explore Snowplow data, we strongly recommend becoming familiar with these foundational concepts.

This sections covers a broad range of topics:

- [Introduction][concepts]
- [Events][events]
- [Event dictionaries and schemas][dictionaries]
- [Contexts][contexts]
- [Iglu][iglu]
- [The Snowplow data pipeline][pipeline]
- [Sending data into Snowplow][sending-data]
- [Viewing Snowplow data][viewing-data]

## Data modeling with Snowplow data

The Snowplow data collection and enrichment process produces a data stream, where each data packet represents a single event. This is a rich data set and the possible applications of this data are endless. While it is common to do analysis against the event-level data, it is recommended to also aggregate data into smaller data sets. Data modeling is the process aggregating event-level data into smaller data sets, while applying business logic (e.g. sessionization) and joining with other data sets.

- [Data modeling][data-modeling]
- [Sessionization][sessionization]

## Analytics with Snowplow data

Snowplow gives companies access to their event-level data. This makes it possible to perform a whole range of sophisticated analysis that are otherwise not possible. The data modeling step lowers the barrier to entry, by codifying the underlying aggregation and business logic, so analysts can focus on performing a wide variety of analyses using Snowplow data. This section contains a whole range of recipes that highlight what is possible with event-level data:

- [Customer analytics][customer-analytics]: Understand customers and users
- [Catalog analytics][catalog-analytics]: Understand how content and product drives behavior and value
- [Platform analytics][platform-analytics]: Understand how updates change user behavior and drive value

## Tools and techniques

Useful tools and techniques to get the most out of your Snowplow data:

- [Tools and techniques][tools-and-techniques]

<!-- Links -->

[concepts]: concepts/
[events]: concepts/events/
[dictionaries]: concepts/event-dictionaries-and-schemas/
[contexts]: concepts/contexts/
[iglu]: concepts/iglu/
[pipeline]: concepts/snowplow-data-pipeline/
[sending-data]: concepts/sending-data-into-snowplow/
[viewing-data]: concepts/viewing-snowplow-data/

[data-modeling]: data-modeling/
[sessionization]: data-modeling/sessionization/

[customer-analytics]: recipes/customer-analytics/
[catalog-analytics]: recipes/catalog-analytics/
[platform-analytics]: recipes/platform-analytics/

[tools-and-techniques]: tools/
