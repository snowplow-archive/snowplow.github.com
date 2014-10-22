---
layout: page
group: analytics
sub_group: foundation
title: Event dictionaries
shortened-link: Event dictionaries
description: Understanding event dictionaries
weight: 3
---

# Event dictionaries

## What is an event dictionary?

When we setup Snowplow, we need to make sure that we track all the events that are meaningful to our business, so that the data associated with those events is available in Snowplow for analysis.

When we come to analyse Snowplow data, we need to be able to look at the event data and understand, in an unambiguous way, what that data actually means i.e. what it represents.

An event dictionary is a crucial tool in both cases. It is a document that defines the universe of events that a company is interested in tracking. For each event, it defines:

1. What the event is. Often this might be illustrated with e.g. screenshots
2. What data is captured when the event occurs, that represents the evvent. This is a data schema for the event
3. Details on how the relevant Snowplow tracker has been setup to pass the event data into Snowplow

## An example entry in an event dictionary

An example entry in an event dictionary might look like this:

----

#### Event: perform_search

Screenshot

Event schema:

Example data:

Instrumentation guide:

-----

## What is the point of an event dictionary?

Event dictionaries serve a number of purposes:

* They aid analysis, by making sure that everyone using the data understands what each line of data 'means'
* They aid technical setup: instrumentation (tracker setup) is driven by the event dictionary
* They can assist both the product management and analytics development process, by ensuring that the anaytics instrumentation 'keeps up' with an evolving product 

## Understand event dictionaries and schemas?

* [Learn about contexts](contexts.html)