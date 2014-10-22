---
layout: page
group: analytics
sub_group: foundation
title: Basic concepts
shortened-link: Basic concepts
description: Basic concepts - understanding event dictionaries, grammars and data modelling with Snowplow
weight: 1
---

# Basic concepts

## Who this section is for

It is possible to use Snowplow data to answer questions and generate insight without a deep knowledge of the basic concepts that underpin the Snowplow approach to event data collection, warehouse and analysis. If you are serious about using Snowplow in the most effective way, however, and are looking to perform more sophisticated analyses, or empower a broader range of business users to expore Snowplow data, we strongly recommend becoming familiar with these foundational concepts.

## What are the basic concepts?

Snowplow is built around the following core concepts:

1. [Events](events.html)
2. [Event dictionaries and schemas](event-dictionaries-and-schemas.html)
3. [Contexts](contexts.html)

Once you have understood the core concepts, it should be straightforward to understand:

1. [How event data is sent into Snowplow](sending-data-into-snowplow.html)
2. [What the data looks like once it is in Snowplow](#viewing-the-data-in-snowplow.html)

This then provides a solid foundation for understanding how to 

1. [Instrument Snowplow trackers](instrument-snowplow-trackers.html)
2. [Perform basic anayses on Snowplow data](perform-basic-analyses-on-snowplow-data.html)
3. [Model Snowplow data: aggregate event level data to create useful intermediary tables to enable faster, more convenient analysis](model-snowplow-data.html)





<h2><a name="contexts">3. Contexts</a></h2>

When an event occurs, it generally involves a number of entities, and takes place in a particular setting. For example, the search event in the example above has:

1. A user entity, who performed the search
2. A web page in which the event occurred
3. A set of e.g. products that were returned from the search

All the above are examples of 'contexts'. A context is the group of entities associated with events. What makes contexts interesting is that they are common across multiple different event types. For example, the following events for a retailer will all involve a 'product' context:

* View product
* Select product
* Like product
* Add product to basket
* Purchase product
* Review product
* Recommend product

Our retailer might want to describe product using a number of fields including:

* SKU
* Name
* Unit price
* Category
* Tags

Rather than define all the set of product-related fields for all the different product-related events, Snowplow makes it possible to define a single product schema, and pass this as a context with any product related event. Our product schema might look as follows:

```json
product schema
```

It is possible to setup Snowplow without defining and using any contexts. However, we find contexts provide a convenient short hand when figuring out what data should be passed into Snowplow, and managing the Snowplow schema over time.

<h2><a name="sending-data-into-snowplow">4. Understanding how event data is sent into Snowplow</a></h2>

Data is sent into Snowplow by Snowplow trackers.

When you record an event into Snowplow which you have defined and schemad yourself, you send that data in with the schema associated with it. For example, if we were recording the `perform_search` event documented in the above example via the Javascript tracker, we would track the event using the following tag:

```js

```

Note that we send the event data into Snowplow with a reference to the associated schema for the data. The schema lives in [Iglu] [iglu]. Click [here] [iglu] for more information on Iglu.

<h2><a name="viewing-the-data-in-snowplow">5. Understanding what the data looks like once it is in Snowplow</a></h2>



<h2><a name="data-modelling">6. Aggregating on event-strams: data modelling</a></h2>

Snowplow delivers your entire event stream into your data warehouse.

It is possible to run queries against the entire event stream in Snowplow. In practice, however, it is very common to aggregate the data into a set of shorter tables (with fewer rows then the events table) to support querying. Part of this data modelling exercise involves applying business-specific logic and rules to the underlying data, for example:

1. Figuring out how to combine different events captured against different user identifiers (cookie IDs, login credentials) and combine them into a finite set of records that summarize who that user is
2. Combining multiple micro events into macro events that summarize e.g. how far a user has progressed through a funnel or engaged with a content item (e.g. article or TV series)
3. Grouping sequences of events into 'sessions'
4. Joining event data in Snowplow with other sources of data


