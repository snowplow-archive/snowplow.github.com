---
layout: post
shortenedlink: How configurable data models and schemas make digital analytics better
title: How configurable data models and schemas make digital analytics better
tags: [snowplow, json, json schema, redshift, iglu, schema, data model, configurable]
author: Yali
category: Analytics
---



Earlier this week, we released Snowplow 0.9.5. This enables our users take a fundamentally new approach to:

1. Defining their own 'event dictionaries' - the data models they use for capturing and storing event data
2. Processing and warehousing that data
3. Managing those data models (and associated schemas) over time

In this post, I'll describe this new approach, to make it as clear as possible how it works, and how it differs from some the two existing approaches in the digital analytics industry today. I'll then explain why we believe this new approach is transformational, so why our users (and businesses in general) should adopt it.

<h2><a name="">Snowplow now supports configurable schemas</a></h2>




<h2><a name="">Why configurable schemas are transformational</a></h2>

* Data schema fits your business, not the other way round
* Explicit data models make data analysis easier and data analysts much more productive
* An end to 'leaky' data pipelines
* Managing schema evolution over time