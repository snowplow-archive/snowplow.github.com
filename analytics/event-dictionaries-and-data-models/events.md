---
layout: page
group: analytics
sub_group: foundation
title: Events
shortened-link: Events
description: Understanding events - the central type at the heart of the Snowplow platform
weight: 2
---

# Events

## What is an event?

An event is something that occurred in a particular point in time. Examples of events include:

* Load a web page
* Add an item to basket
* Load a bank balance
* Perform a search
* Click a link
* Like a video

Snowplow is an event analytics platform. Once you have setup one or more Snowplow trackers, every time an event occurs, Snowplow should spot the event, use data to represent the event and send that packet of data, representing the event, into the Snowplow data pipeline where it is:

1. Processed and enriched (e.g. additional data points inferred about the event)
2. Loaded into a data warehouse to enable analysis 
3. Loaded into a unified log so that it is available to be consumed by a data-driven system

## Understand events?

* [Learn about event dictionaries and schemas](event-dictionaries-and-schemas.html)
* [Back to basic concepts](foundational-concepts.html)