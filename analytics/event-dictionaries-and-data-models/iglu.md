---
layout: page
group: analytics
sub_group: foundation
title: Iglu
shortened-link: Iglu
description: Iglu is a machine-readable schema repository
weight: 4
---

# Iglu

In the previous section, we described how both [events][events] and [contexts][contexts] have schemas which define what data is recorded about the event, or context, at data capture time.

In this section, we describe the role played by Iglu, our machine-readable schema repository, in enabling Snowplow to enable users to define their own schemas, whilst elegantly handle, process and warehouse their data.

## An overview of how Iglu is used

Snowplow uses Iglu, a schema respository, to store all the schemas associated with the different events and contexts that are captured via Snowplow. When an event or context is sent into Snowplow, it is sent with a reference to the schema for the event or context, which points to the location of the schema for the event or context in Iglu. To give a concrete example, the following is a call from the Javascript tracker to send a video play event into Snowplow:


```js
Example video play event for com.onlinevideolpayer.video_play
```

When Snowplow processes that data, it fetches the schema for the video play event from the Iglu repo:

```json
Schema for the video play event
```

It uses the schema to:

1. Validate the data
2. Process the data including shredding the data into its own dedicated in table in Amazon Redshift

The above event would be loaded into a Redshift table with the following schema. (Note how this corresponds to the JSON schema given above.)

```sql


```

## Handling schema evolution

Iglu plays a very important role in Snowplow. Not only does it enable different Snowplow users to define their own different data schemas. It also provides a flexible framework to enable them to evolve those schemas over time. All schemas in Iglu are versioned. If an update is made to a schema where previous events or contexts are still compatible with that schema (for example, one or more additional optional fields are added), Snowplow continues to load the new data, coming in with a reference to the new version of the schema, into the same table as the old data from the schema is still stored. (It just extends the table to accommodate the additional fields.) If, on the other hand, a breaking change is made to the schema, Snowplow will load data that conforms to the new schema into a new table in Amazon Redshift. The old data is still available in the old table. (And indeed, any data sent in with the old version of the schema will continue to be loaded into this table.)

This means that an analyst or data modeller needs to check for the existence of multiple versions of a schema, and ensure that queries are properly executed across both versions of the table. Crucially, it means that a company can continue to evolve its data model over time, without rendering old data inaccessible, or creating big obstacles for analysts wishing to query the data across points in history where the schema changed.

## What this means for a user setting up Snowplow for the first time

When you setup Snowplow for the first time, you need to:

1. Identify the different events and contexts you wish to capture, and document them in the [event dictionary][event-dictionary].
2. Put together an initial version for the schemas of each of the events and contexts you wish to capture
3. Upload those schemas to an Iglu repo, and configure your Snowplow pipeline to connect with the Iglu repo so that it can fetch the schemas associated with the incoming data
4. Instrument your tracker(s) to send data into Snowplow with the associated schemas in Iglu 

events:
contexts:
event-dictionary: