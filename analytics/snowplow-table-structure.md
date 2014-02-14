---
layout: page
group: analytics
sub_group: overview
title: How data is structured in Snowplow
shortened-link: Data structure
weight: 4
---

# Snowplow data structure

This guide covers:

1. [The Snowplow event model](#event-model)
2. [The way Snowplow data is stored today](#stored-today)
3. [How we plan to evolve the structure of Snowplow data in the near future](#evolve)


<h2><a name="event-model">An overview of the Snowplow event model</a></h2>

At its heart, Snowplow is a platform for capturing, storing and analysing event-stream data: focused on web event data. Many of the core design decisions related to the way that data is structured stem from this:

* **Single table**. Snowplow data is stored in a single table representing the "stream of events" that have occured
* **Each line of data represents one event**. As far as possible, every line of data represents a single event. 
* **Immutable log**. The Snowplow data table is designed to be immutable: the data in each line should not change over time. Now, there are certainly cases when you'd want to perform an analysis using dimensions that might change over time: for example, the segment a customer belongs to might change over time, as the customer is successfully migrated to a higher-value user, or as the customer grows older. The design of the Snowplow events table is such that the data captured is correct _at the time of capture_. So if the segment that a customer belongs to is recorded in a data line - that was correct at the time the event happened. If an analyst wants to perform a retrospective analysis of historical data based on the segment the customer belongs in **today**, that is possible. However, the analyst should do it **without** modifying the earlier records in the Snowplow events table. (Instead, she should create a new table listing the current segments that each customer belongs to, and then perform the analysis by joining that table with the Snowplow events table.)
* **Structured events**. There are a wide variety of events that occur on the web that are of interest across a range of websites and webapps: these include _page views_, _plays of media (e.g. video)_, _add to baskets_, _ad impression_ etc. We are building out a structured event model that represents these common events as first-class citizens with specific fields associated with each. At the same time, we recognise that there are also custom events that are only interesting to specific websites / apps (e.g. _login events_, _send message_) and custom dimensions that only a handful of users might want to store for paricular standard events (e.g. _page views_). So we've build the Snowplow event model to include both event-specific event types that include fields that are available for customisation, and generic 'custom events' that can be used to track events that are not recognised as 1st class citizens in the Snowplow event model.
* **Unstructured events**. We recognise that in certain situations, a business might want to track events using their own data model, rather than adopting the standard model we are building out in collaboration with the Snowplow community. We intend to build out support for 'unstructured events' in the near future, to cater to this requirement.

<h2><a name="stored-today">The way Snowplow data is stored today</a></h2>

Currently, whether the data is stored in S3 or in Infobright, Snowplow data is structured as a single fat table. Each line represents a single event. Each line is "fat" because there are a large number of fields. This is not surprising - there are:

* Fields that are common across all events and platform (e.g. date, time, `user_id`)
* Fields that are platform specific (e.g. `page_url`, `page_title`, `page_referrer`, `br_features` for web events)
* Fields that are event specific (e.g. `tr_orderid`, `ti_sku`, `tr_price` for transaction events)

A [complete list of fields by type] [canonical-event-model] is given on the [wiki] [canonical-event-model].

The Hive table definition of the data as stored on S3 is given [here] [hive-table-def]. The Infobright table definition of the data as stored on Infobright is given [here] [infobright-table-def]. The structure of the data is very similar, with some minor changes to accommodate data types (e.g. arrays) that are supported by Hive but not Infobright.

<h2><a name="evolve">How we plan to evolve the structure of Snowplow data in the near future</a></h2>

As the number of platforms and specific events that Snowplow supports grows, so to will the "fatness" of the table, as we incorporate more-and-more fields.

In order to better manage this, we intend to move the storage of Snowplow events in S3 to [Avro] [avro]. Avro is a data serialization format that enables us to group fields together (so all the fields related to e.g. _ad impressions_ can be treated as a single unit), to evolve the data schema over time without having to reprocess historical data, and to not have to worry about having large numbers of fields that are not populated. (E.g. fields that relate to events other than the current event being stored.) The Avro structure will follow the [canonical event model] [canonical-event-model] as described on the [detailed wiki page] [canonical-event-model]. We will add Avro-IDL definitions to the document shortly.

## Next steps

Understand how Snowplow data is generated, stored and structured? Then [get started querying it] [basic-recipes]!

[basic-recipes]: basic-recipes.html
[canonical-event-model]: https://github.com/snowplow/snowplow/wiki/canonical-event-model#wiki-web
[hive-table-def]: https://github.com/snowplow/snowplow/blob/master/4-storage/hive-storage/hive-format-table-def.q
[infobright-table-def]: https://github.com/snowplow/snowplow/blob/master/4-storage/infobright-storage/sql/table-def.sql
[avro]: http://avro.apache.org/