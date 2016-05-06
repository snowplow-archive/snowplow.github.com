---
layout: post
title: Why set your data free?
tags: [data, analysis, web analytics, joining data]
author: Yali
category: Analytics
---
At Saturday's [Measure Camp] [measurecamp], I had the chance to introduce Snowplow to a large number of some incredibly thoughtful and insightful people in the web analytics industry.

With each person, I started by explaining that Snowplow gave them direct access to their customer-level and event-level data. The response I got in nearly all cases was: **what does having direct access to my web analytics data enable me to do, that I can't do with Google Analytics / Omniture?** It's such a good question I thought I should publish an answer below:

### 1. Integrate web analytics data with other data sources

Integrating your web analytics data with other data sets enables you to answer a wide range of valuable business questions:

| **Data source**                   | **Example business questions**                       |
|:----------------------------------|:-----------------------------------------------------|
| Marketing spend data e.g. AdWords, ad server data | What is the return on my ad spend? How should I optimize my return on ad spend |
| Customer data e.g. CRM, loyalty   | How does the online behavior of my differnet customer segments vary by segment? Do online promotions drive offline sales? (Or vice versa?) |
| Product / media catalogue data    | What are my most profitable product lines? Do different types of products attract different customer segments? What are the products that drive the most visits? |

Snowplow makes integrating web analytics data with other data sources easier in a two ways:

1. All your Snowplow data is directly accessible in Apache Hive or Infobright. (So no expensive export process is required, prior to linking the data sets.)
2. Custom variables and event tracking give you plenty of opportunity to join e.g. customer IDs or campaigns names to enable `JOIN`s across data set

For more details on how to perform `JOIN`s between Snowplow data and other sources, see refer to the guide to [joining Snowplow engagement data with other sources of customer data] [joiningdata]

### 2. Slice and dice your data by any combination of dimensions / metrics you want

Google Analytics in particular only lets users create reports about of set combinations of dimensions and metrics. Examples of combinations that are **not supported** include:

1. Number of unique visitors by product page
2. Different sources of traffic by product page (and how this changes over time)
3. Engagement levels (e.g. number of visits, number of page views, conversion rates) by traffic source
4. Improvements to conversion rates over time

<!--more-->

In contrast, because Snowplow gives you access to the underlying data, it is possible to use BI tools like [Tableau][tableau] and [PowerPivot][powerpivot] to quickly slice and dice web analytics data by any dimensions / metrics you want. We'll be posting examples of how to do this in the next few days.

### 3. Use machine learning tools on your web analytics data

Machine learning tools, and [Mahout][mahout] in particular, have created some new and exciting opportunities to:

1. Develop product and content recommendation engines, based on user web behavior. (E.g. users who viewed these content items, also viewed...)
2. Segment your audience by online behavior

Snowplow makes it easy to extract the core input data you would need to feed a machine learning algorithm in a single query. (E.g. a matrix mapping users to products by page views / add to baskets / purchases etc.) We will be exploring ways to integrate Snowplow with [Mahout][mahout] in a future blog post.

### 4. View data for individual users over their entire lives

Whereas reports on Google Analytics tend to be about visits, page views or transactions, Snowplow lets you slice data by users over multiple visits, opening up a wide range of possibilities:

1. Develop accurate models of customer lifetime value
2. Develop more rigorous approaches to attribution modelling, by capturing in granular detail which channels touched a user at different points in their lifecycle

### 5. Interested in any / all of the above?

Then [get started][getstarted] with Snowplow, or [get in touch][getintouch] to find out more!


[measurecamp]: http://ukdaa.co.uk/
[joiningdata]: /analytics/customer-analytics/joining-customer-data.html
[tableau]: http://www.tableausoftware.com/
[powerpivot]: http://www.microsoft.com/en-us/bi/powerpivot.aspx
[mahout]: http://mahout.apache.org/
[getstarted]: /trial/
[getintouch]: /about/index.html
