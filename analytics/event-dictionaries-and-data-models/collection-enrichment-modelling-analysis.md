---
layout: page
group: analytics
sub_group: foundation
title: Stages in the Snowplow data pipeline
shortened-link: Snowplow data pipeline stages
description: Understand how the Snowplow data pipeline breaks out data collection, enrichment, modelling and analysis
weight: 6
---

# Data collection, enrichment, modelling and analysis

The Snowplow pipeline is built to enable a very clean separation of the following steps in the data processing flow:

## 1. Data collection

At data collection time, we aim to capture all the data required to accurately represent a particular event that has just occurred.

## 2. Data enrichment

Often there are opportunities to learn more about an event that has occurred, if we combine the data captured at collection time with third party data sources. To give some simple examples:

1. If we capture the IP address of a user who has carried out a particular action at analysis time, we can infer that user's geographic location if we're able to lookup the IP address in a GeoIP database
2. If we know where the user who carried out the action was located, geographically, and the point in time where the event occurred, we will be able to infer the weather where the user was, if we have a database of weather conditions over time by geography

Both the above are examples of 'enrichments'. Enrichments are sometimes called 'dimension widening': we're using 3rd party sources of data to enrich the data we originally collected about the event so that we have more context available for understanding that event.

## 3. Data modelling

The data collection and enrichment process outlined above generates a data set that is an 'event stream': a long list of packets of data, where each packet represents a single event.

Whilst it is possible to do analysis directly on this event stream, it is very common to:

1. Join the event-stream data set with other data sets (e.g. customer data, product data, media data, marketing data, financial data)
2. Aggregate the event-level data into smaller data sets that are easier and faster to run analyses against

This process is called 'data modelling'.

## Understanding the difference between contexts captured at data collection time, and contexts inferred during enrichment

## Understanding where your business logic should sit in the data pipeline



