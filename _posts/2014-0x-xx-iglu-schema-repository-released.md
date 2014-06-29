---
layout: post
shortenedlink: Iglu schema repository released
title: Iglu schema repository 0.1.0 released
tags: [snowplow, iglu, schema, json schema, repository, registry]
author: Alex
category: Releases
---

We are hugely excited to announce the release of Iglu, our first new product since we open sourced our first Snowplow prototype two and a half years ago.

Iglu is a machine-readable schema repository initially supporting JSON Schemas. It is a key building block of the next Snowplow release, 0.9.5, which will validate incoming unstructured events and custom contexts using JSON Schema.

As far as we know, Iglu is the first machine-readable schema repository for JSON Schema, and the first technology which supports schema resolution from multiple public and private schema repositories.

In the rest of this post we will cover:

1. [On the importance of schemas](/blog/2014/06/20/snowplow-java-tracker-0.1.0-released/#background)
2. [The origins of Iglu](/blog/2014/06/20/snowplow-java-tracker-0.1.0-released/#compatibility)
3. [xxx](/blog/2014/06/20/snowplow-java-tracker-0.1.0-released/#get)
4. [xxx](/blog/2014/06/20/snowplow-java-tracker-0.1.0-released/#usage)
5. [Roadmap](/blog/2014/06/20/snowplow-java-tracker-0.1.0-released/#roadmap)
6. [Thanks](/blog/2014/06/20/snowplow-java-tracker-0.1.0-released/#thanks)

<!--more-->

<div class="html">
<h2><a name="schemas">On the importance of schemas</a></h2>
</div>

<div class="html">
<h3><a name="event-explosion">Dealing with the event explosion</a></h3>
</div>

Snowplow is evolving from a web analytics platform into a general event analytics platform, supporting events coming from mobile apps, the internet of things, games, cars, connected TVs and so forth. This means an explosion in the variety of events that Snowplow needs to support: games saved, clusters started, tills opened, cars started - in fact the potential variety of events is almost infinite.

Historically, there have been two historic approaches to dealing with the explosion of possible event types:

<< IMAGE >>

Custom variables as used by GA, SiteCat, Piwik and other web analytics packages are extremely limited - we plan to explore these limitations in a future blog post. Schema-less JSONs as offered by Mixpanel, KISSmetrics and others are much more powerful, but they have a different set of problems:

<< IMAGE >>

<div class="html">
<h3><a name="schema-loss">On schema loss</a></h3>
</div>

The issues illustrated above primarily relate to the lack of a defined schema for these events as they flow into and then thru the analytics system. More generally, we could say that the problem is that the original schemas have been _lost_. The entities snapshotted in an event typically started life as Active Record models, Protocol Buffers, Backbone.js models or N(Hibernate) objects or similar (and before that, often as RDBMS or NoSQL records). In other words, they started life with a schema, but that schema has been discarded on ingest into the analytics system.

As a result, the business analyst or data scientist typically has to maintain a mental model of the source data schemas when using the analytics system:

<< IMAGE >>

This is a hugely error-prone and wasteful exercise:

* Each analyst has to maintain their own mental model of the source data schemas
* Source data schemas evolve over time. Analysts have to factor this evolution into their analyses (e.g. "proportion of new users providing their age _since the optional age field was introduced on 1st May")
* There are no safeguards that the events sent in weren't corrupted or off-schema in some way

<div class="html">
<h3><a name="event-explosion">The solution: JSON Schema</a></h3>
</div>

The obvious answer was to introduce [JSON Schema] [json-schema] support for all JSONs sent in to Snowplow - i.e. unstructured events and custom contexts. JSON Schema is a standard for describing a JSON data format; it supports validating that a given JSON conforms to a given JSON Schema.

But as we started to experiment with JSON Schema, it became obvious that JSON Schema was just one building block: there were several other pieces we needed, none of which seem to exist already. In defining and building these missing pieces, Iglu was born.

<div class="html">
<h2><a name="schemas">The origins of Iglu</a></h2>
</div>

We made the design decision that whenever a developer or analyst wanted to send in any JSON to Snowplow, they should first create a [JSON Schema] [json-schema] for that event. Here is an example JSON Schema for a `video_played` event:

```json
TO COME
```

(Note that this is actually a [self-describing JSON Schema](Self-describing-JSONs-and-JSON-Schemas).)

We made a further design decision that the JSON sent in to Snowplow should report the exact JSON Schema that could be used to validate it. Rather than embed the JSON Schema inside the JSON, which would be extremely wasteful of space, we came up with a convenient short-hand that looked like this:

```json
{
	"schema": "iglu:com.channel2.vod/video_played/jsonschema/1-0-0",
	"data":	{
		"length": 213,
		"id":     "hY7gQrO"
	}
}
```

We called this format a [self-describing JSON](Self-Describing-JSONs-and-JSON-Schemas). Here are the individual pieces of 

Next, we needed somewhere to store JSON Schemas like `video_played` above - a home for schemas where:

1. Developers and analysts could refer back to the schema to help with analytics instrumenting and data analysis
2. Snowplow could retrieve the schema in order to validate that the incoming events indeed conformed to the schemas that they claimed to represent
3. Snowplow could retrieve the schema to support converting the incoming events into other formats, such as Redshift database tables
4. Developers could upload new versions of the schema (with analysts' oversight)

It became obvious that we needed some kind of "registry" or "repository" of schemas.

 But it's not enough to support JSON Schema - we also needed:

* A way to associate a JSON with its JSON Schema at the point of tracking
* A way to version JSON Schemas to support the evolution of those JSONs over time


 add support for schemas to our JSON support in Snowplow, so that a structured understanding of the event could be passed through into the analytics system.

<< IMAGE >>

 have been _discarded_ by the analytics system, and the analyst using the 

Web analysts are comfortable working with a small number of event types - page views, ecommerce transactions, add to baskets.

t was super-important to us that the

 From working with various other analytics tools previously we had understood ability of platforms like Mixpanel and KISSmetrics to send in what Snowplow calls "unstructured events" in the form of arbitrary JSON envelopes was powerful, and much more attractive to developers and analysts than the "custom variables" approach of Google Analytics and Adobe SiteCatalyst
2. While powerful, arbitrary JSONs were **lossy** because the schema(s) associated with the events' underlying data and entities were discarded at the point of tracking the event

Here is an example of a Mixpanel event, with some commentary on the issues we saw with this approach:


Why do we refer to this approach as "lossy"? Because typically these events are describing entities which started life in a schema'ed way - be it as .



[json-schema]: http://json-schema.org/
