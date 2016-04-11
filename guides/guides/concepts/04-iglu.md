---
layout: page
group: guides
subgroup: concepts
breadcrumb: iglu
rank: 4
title: Iglu
description: Understanding Iglu, a machine-readable schema repository.
permalink: /documentation/concepts/iglu/
redirect_from:
  - /analytics/concepts/iglu/
  - /analytics/event-dictionaries-and-data-models/iglu.html
  - /guides/concepts/iglu/
---

In the previous section, we described how both [events](../events) and [contexts](../contexts) have schemas which define what data is recorded about the event, or context, at data capture time.

In this section, we describe the role played by Iglu, our machine-readable schema repository, in enabling Snowplow to correctly process and warehouse that data.

## Schema-ing data in Snowplow

Snowplow gives you a lot of flexibility to define the events you want to capture, and the data schemas for each of those events. In order to use that functionality, Snowplow requires that you put together schemas for your events and contexts, ahead of data collection time. It then uses those schemas to process the data, in particular:

1. To validate that the data coming in is 'good data' that conforms to the schema
2. Process the data correctly, in particular, shredding the JSONs that represent the data into tidy tables in Redshift suitable for analysis

Iglu is a key technology for making this possible.

## An overview of how Iglu is used

Snowplow uses Iglu, a schema repository, to store all the schemas associated with the different events and contexts that are captured via Snowplow. When an event or context is sent into Snowplow, it is sent with a reference to the schema for the event or context, which points to the location of the schema for the event or context in Iglu. To give a concrete example, the following is a call from the Javascript tracker to send a video play event into Snowplow:

{% highlight javascript %}
window.snowplow_name_here('trackUnstructEvent', {
    schema: 'iglu:com.onlinevideoplayer/video_play/jsonschema/1-0-0',
    data: {
        videoId: 'IxuThNgl3YA',
        action: 'pause',
        position: 63
    }
});
{% endhighlight %}

When Snowplow processes that data, it fetches the schema for the video play event from the Iglu repo:

{% highlight json %}
{
    "$schema": "http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#",
    "description": "Schema for playing and pausing a video",
    "self": {
        "vendor": "com.onlinevideoplayer",
        "name": "video_play",
        "format": "jsonschema",
        "version": "1-0-0"
    },

    "type": "object",
    "properties": {
    	"videoId": {
            "type": "string",
            "maxLength": 255
        },
        "action": {
            "enum": ["play", "pause"]
        },
        "styleId": {
            "type": "integer"
        }
    },
    "minProperties":1,
    "additionalProperties": false
}
{% endhighlight %}

It uses the schema to:

1. Validate the data
2. Process the data including shredding the data into its own dedicated in table in Amazon Redshift

The above event would be loaded into a Redshift table with the following schema. (Note how this corresponds to the JSON schema given above.)

{% highlight sql %}
INSERT INTO atomic.com_onlinevideoplayer_video_play_1
VALUES ('IxuThNgl3YA', 'pause', 63);
{% endhighlight %}

The schemas stored in Iglu are the same documented in the event dictionary. You can think of Iglu as a machine-readable schema repository, and the event dictionary as the human readable schema repository. When Snowplow wants to process or store event data, it will refer to the relevant schemas as stored in Iglu to help it to do so. When a data analyst wants to perform an analysis on the data, however, he / she is more likely to consult the event dictionary, where the schema will be available alongside screenshots and descriptions, better enabling her to understand what the data represents.

## Handling schema evolution

Iglu plays a very important role in Snowplow. Not only does it enable different Snowplow users to define their own different data schemas. It also provides a flexible framework to enable them to evolve those schemas over time. All schemas in Iglu are versioned. If an update is made to a schema where previous events or contexts are still compatible with that schema (for example, one or more additional optional fields are added), Snowplow continues to load the new data, coming in with a reference to the new version of the schema, into the same table as the old data from the schema is still stored. (It just extends the table to accommodate the additional fields.) If, on the other hand, a breaking change is made to the schema, Snowplow will load data that conforms to the new schema into a new table in Amazon Redshift. The old data is still available in the old table. (And indeed, any data sent in with the old version of the schema will continue to be loaded into this table.)

This means that an analyst needs to check for the existence of multiple versions of a schema, and ensure that queries are properly executed across both versions of the table. This requires a bit of extra work - but it means that a company can continue to evolve its data model over time, without rendering old data inaccessible, or creating big obstacles for analysts wishing to query the data across points in history where the schema changed.

## Setting up Snowplow for the first time

When you setup Snowplow for the first time, you need to:

1. Identify the different events and contexts you wish to capture, and document them in the [event dictionary](../event-dictionaries-and-schemas).
2. Put together an initial version for the schemas of each of the events and contexts you wish to capture
3. Upload those schemas to an Iglu repo, and configure your Snowplow pipeline to connect with the Iglu repo so that it can fetch the schemas associated with the incoming data
4. Instrument your tracker(s) to send data into Snowplow with the associated schemas in Iglu

## Read on

In the next section, we'll give a [high level overview of the Snowplow data pipeline](../snowplow-data-pipeline), before describing in more detail [how to send data into Snowplow](../sending-data-into-snowplow), and [what the data looks like once it's in Snowplow](../viewing-snowplow-data).
