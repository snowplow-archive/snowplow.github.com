---
layout: page
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

The Snowplow data collection and enrichment process generates an event stream. These events are stored in Amazon S3 and also available in Amazon Redshift. It's possible to use the event stream itself. For example, a data scientist might use it to create a decision tree or train a recommendation algorithm.

For a business user, however, most value lies in linking events together. A single page view does not provide much insight into how the business is doing, but when this page view is combined with other events, it starts to provide insight into what the user was trying to achieve and whether she succeeded. It can indicate how far along in the user journey she is and how likely she is to sign up. These are concepts that have meaning to a business user.

Data modeling is the process of learning about the data and developing a data model that combines events and in the process creates meaning. It's common to join the events table with other data sets (e.g. customer data, product data, marketing data and financial data) and aggregate these enriched events into smaller data sets. There are several benefits to this approach:

- These derived datasets are easier to understand because business logic as been applied (i.e. meaning has been added).
- It ensures that all users use combine events using the same logic (e.g. the same session definitions or user identifiers)
- Because the event-level data is never modified, it's always possible recompute the derived tables based on new insights (e.g. improved segmentation algorithms)

These derived tables are available to analytics and business users and can be accessed from BI tools such as Looker and Tableau.

## Data modeling in SQL

It's possible run SQL queries as part of the Snowplow pipeline through our open source SQL Runner application. We recommend an iterative approach when it developing SQL data models:

First, start with a basic model that recomputes on all data each time the pipeline runs (which makes it easier to iterate because all derived tables are dropped and recomputed each time). This basic model can, for example, include a basic sessions table. More dimensions and measures are added during this phase, and the result is shared with business users. Their feedback is used to guide the development of these models.

When the data models have been fleshed out, it's possible to move to a model that doesn't drop and recompute the derived tables, but updates them using events in the last batch (what we call incremental models).

## How to write performant incremental data models?

1. Load new events into atomic (as before).
2. Keep a lightweight manifest to track what events have been processed before. For example, a table with `etl_tstamp` and event count which gets updated each time a batch is done processing.
3. Each time the SQL queries run, restrict the selection to (at least) those events that have not been processed before. However, it's also important to write the queries so that the same event can be processed more than once without changing the outcome.
4. When aggregating event into, for example, sessions, it's important to make a distinction between:
  - Operations such as `MIN`, `MAX` and certain window functions (`FIRST_VALUE`), which do not need other events in that session to be calculated.
  - Operations that do need all events belonging to a particular session, such as `COUNT DISTINCT` or `SUM` (in order to make the operation idempotent). These values are computed using all historical events belonging to that session, not just the ones in the batch that is being processed. Note that this means recomputing *some* sessions using *all* historical data (the most recent ones), which is still more performant than recomputing *all* sessions.

## Technical requirements

Because the SQL queries are run as part of the Snowplow pipeline, it is important that these queries are written according to a few principles. When the derived models are recalculated with each run, there are no requirements.

When the data model is run in an incremental mode, the data models should be written so that:

- The models have a lightweight manifest that tracks which events have been processed and which ones haven't: We recommend event count per `etl_tstamp`
- The models are idempotent: Each event should be processed at least once and the output doesn't change when events are processed more than once
- The models are recoverable: No matter at which step the model breaks, we should be able to rerun from step 1 without corrupting the derived tables

<!--

- identify the ‘key’ e.g. user ID for user table
- identify the subset of rows in table that will be updated based on new data (e.g. user IDs in the landing schema)
- divide metrics into two categories:
- simple e.g. min, max and derived dimensions e.g. landing page, exit page
- complex e.g. sum, count, count distinct
- for simple metrics and derived dimensions, calculate based on data in batch and data saved from previous batches
- for complex metrics recalculate from events table, but only using the subset of keys relevant to this batch (makes the SQL fast and robust)†

Have a way of keeping track of which events are included, so that data can safely arrive whilst the data modeling is being done. (Event / run manifest)
-->
