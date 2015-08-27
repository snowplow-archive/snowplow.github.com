---
layout: page
header: title
group: documentation
subgroup: data modeling
title: Data Modeling
description: Introduction to data modeling.
permalink: /documentation/data-modeling/
redirect_from:
  - /analytics/data-modeling/
  - /analytics/event-dictionaries-and-data-models/data-modeling.html
---

## What is data modeling?

##






The data collection and enrichment process generates an event stream. While it is possible to do analysis on this event stream, it is common to join with other data sets (e.g. customer data, product data, marketing data or financial data) and aggregate event-level data into smaller data sets. These are easier to understand and faster to run queries against. Also, if analysis is done against these data sets, the same business logic will be used by all users of the data. Aggregate tables can be:

- User-level tables
- Session-level tables
- Product or media-level tables (catalog analytics)

We call this process of aggregating *data modeling*. At the end of the data modeling exercise, a clean set of tables are available which make it easier to perform analysis on the data. It is easier because the basic tasks of defining users, sessions and other core dimensions and metrics have already been performed, so the analyst has a solid foundation for diving directly into the more interesting, valuable parts of the data analysis.

The tables mentioned before are all illustrative examples of aggregate tables. In practice, what tables are produced, and the different fields available in each, varies widely between companies in different sectors, and surprisingly even varies within the same vertical. That is because part of putting together these aggregate tables involves implementing business-specific logic, including different approaches to:

- Sessionization
- Identity stitching (which users across multiple channels are really the same user)
