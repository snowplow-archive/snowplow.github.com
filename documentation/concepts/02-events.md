---
layout: page
header: title
group: documentation
subgroup: concepts
breadcrumb: events
title: Events
description: Understanding events.
permalink: /documentation/concepts/events/
redirect_from:
  - /analytics/concepts/events/
  - /analytics/event-dictionaries-and-data-models/events.html
---

## What is an event?

An event is something that occurred in a particular point in time. Examples of events include:

* Load a web page
* Add an item to basket
* Enter a destination
* Check a balance
* Search for an item
* Share a video

Snowplow is an event analytics platform. Once you have setup one or more Snowplow trackers, every time an event occurs, Snowplow should spot the event, generate a packet of data to describe the event, and send that event into the Snowplow data pipeline.

To use Snowplow successfully, you need to have a good idea of:

* What events you care about in your business
* What events occur in your website / mobile application / server side systems / factories / call centers / dispatch centers
* What decisions you make based on those events
* What you need to know about those events to make those decisions

## Get *events*?

Then [learn about event dictionaries and schemas](../event-dictionaries-and-schemas).
