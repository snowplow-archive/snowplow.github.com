---
layout: page
group: documentation
sub_group: customer
title: An overview of customer analytics with Snowplow
shortened-link: Customer analytics
weight: 1
permalink: /documentation/recipes/customer-analytics/
redirect_from:
  - /analytics/recipes/customer-analytics/
  - /analytics/customer-analytics/overview.html
---

# Customer analytics

Across different consumer-facing businesses, the leading companies are those that better understand their customers, and use that knowledge to better serve their customers, build better products and better monetize their customer relationships. Customer data and customer analytics are key in enabling this.

To date, web analytics data has **not** been one of the data sets that companies have drawn on
to develop their customer understanding. That is because web analytics data is typically all about **visitors, page views, clicks and conversions; *not* customers and customer journeys**. This is a real shame, because increasingly digital platforms are the primary way that customers engage with products and services.

Snowplow makes it straightforward to use web analytics data to do customer analysis. In this section of the website, we outline *how* to use Snowplow to do this:

### 1. [Identifying users and customers using Snowplow][user-id]

All customer analytics starts with a solid understanding of what constitutes a customer and a user: this is missing in something sorely missing in traditional web analytics. In [this section][user-id], we explain how to use Snowplow to reliably identify customers and users. This provides a solid foundation for doing customer analytics, described in later sections.

### 2. [Joining Snowplow data with other data sources][joining-customer-data]

Other web analytics packages make it very difficult to join web analytics data with other customer data a single customer view to drive commercial decision making, marketing and platform development. Snowplow makes doing this join easy: in [this section][joining-customer-data] we explain how.

### 3. [Customer lifetime value][clv]

Developing a reliable model of customer value is a necessary prerequisite to calculating the return on ad spend, platform development, or service delivery. In [this section][clv], we describe how to use Snowplow to measure your customer lifetime value

### 4. [Cohort analysis][cohort-analysis]

Cohort analyses are longitudal studies that compare groups of users over a period of time. They are hard to perform in traditional web analytics tools because of the difficulty reliably identifying users, grouping them into custom cohorts and then tracking the behavior of cohorts over time. Snowplow makes them easy to perform, as described [here][cohort-analysis]

### 5. [Attribution modeling][attribution]

A perennial problem in digital marketing is working out how much value to ascribe to different marketing channels in a world in which customers are exposed to multiple creatives on different channels and are monetized over multiple sessions. Snowplow provides you with granular data so you can unpick how much value you should attribute to each of your marketing channels: in [this section][attribution] we outline how to do this.

### 6. [Segmenting audience by behavior][behavioral-segmentation]

The granular data provided by Snowplow creates new opportunities to use machine learning tools e.g. [Apache Mahout][mahout] to segment your audience by how they behave, building customer intelligence and opening up new possibilities to tailor products and services to specific audience segments.

Start off by [learning how to use Snowplow to reliably identify users][user-id].

[user-id]: /analytics/customer-analytics/identifying-users.html
[joining-customer-data]: /analytics/customer-analytics/joining-customer-data.html
[clv]: /analytics/customer-analytics/customer-lifetime-value.html
[cohort-analysis]: /analytics/customer-analytics/cohort-analysis.html
[attribution]: /analytics/customer-analytics/attribution.html
[behavioral-segmentation]: /analytics/customer-analytics/behavioral-segmentation.html
[mahout]: http://mahout.apache.org/
