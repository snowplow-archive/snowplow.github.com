---
layout: page
group: analytics
sub_group: foundation
title: Event dictionaries
shortened-link: Event dictionaries
description: Understanding event dictionaries
weight: 3
---

# Event dictionaries and schemas

An event dictionary defines the universe of events that a company is interested in tracking. It provides:

* A centralized record of event definitions. This can be used by analysts and consumers of data more generally to understand exactly what each 'event' in the Snowplow database represents in the real world
* A schema for each event that defines the fields that can and must be captured when that event is recorded, and what each field means. Note that Snowplow is fleixible enough to enable end-users to define their own event schemas
* Details on how the relevant tracker has been implemented to capture the event

An example entry in an event dictionary might look like this:

----

#### Event: perform_search

Screenshot

Event schema:

Example data:

Instrumentation guide:

-----

Event dictionaries serve a number of purposes:

* They aid analysis, by making sure that everyone using the data understands what each line of data 'means'
* They aid technical setup: instrumentation (tracker setup) is driven by the event dictionary
* They can assist both the product management and analytics development process, by ensuring that the anaytics instrumentation 'keeps up' with an evolving product 

## Understand event dictionaries and schemas?

* [Learn about contexts](contexts.html)