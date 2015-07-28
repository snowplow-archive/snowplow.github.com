---
layout: page
group: documentation
sub_group: tools
title: An overview of different tools and techniques for analyzing Snowplow data
shortened-link: Tools and techniques
weight: 1
permalink: /documentation/tools/
redirect_from:
  - /analytics/tools/
  - /analytics/tools-and-techniques/overview.html
---

# Tools and techniques

Rather than focus on specific types of business analysis, this section describes general purpose analytic techniques that can be used across many types of end-user analysis, including custom, catalog and platform analytics.

### 1. [Getting started analysing Snowplow data with SQL] [sql]

Snowplow gives you access to your granular, event-level data in a datawarehouse on Amazon Redshift or PostgreSQL. In either case, you can use SQL both to:

1. Perform end-to-end analyses
2. Query the data to pull out just the right "cut" of Snowplow data to analyse in an alternative tool e.g. Excel, R, Looker etc.

The purpose of [this guide] [sql] is to get the person unfamiliar with SQL up and running querying Snowplow data in Redshift / PostgreSQL as quickly as possible.

### 2. [Getting started analysing Snowplow data with R] [r]

R is a wonderfully powerful and flexible environment for performing statistical and graphical analysis. Unfortunately, the command-line approach and compact syntax can make getting up and running with it a steep learning curve for business analysts who are well versed in OLAP and SQL, but don't have much data science experience outside of those types of tools.

The purpose of [this guide] [r] is to introduce the R newbie to the R approach to doing data analysis through concrete examples with Snowplow data.

### 3. [Converting Snowplow data into a format suitable for OLAP reporting tools e.g. Tableau, Qlikview] [convert-data-to-format-for-olap]

Many business intelligence tools treat data as a cube and enable analysts to slice, dice, drill down, roll up and pivot data sets across different dimensions. This type of analysis is typically called [OLAP] [olap], and is the main approach to reporting taken by a range of business intelligence tools including Tableau, Qlikview, Pentaho and Microstrategy.

In order to use OLAP reporting tools like Tableau and Qlikview, you need to restructure Snowplow data from what is effectively a log file format (where each line represents one event that occured in a specific point of time) into a format suitable for OLAP analysis. (For this reason, you cannot run tools like Tableau and Qlikview directly on top of Snowplow data.) In [this guide] [convert-data-to-format-for-olap], we explain what data structure is necessary for OLAP analysis, and how to quickly restructure Snowplow data to enable the use of these tools.



### 3. [Using Mahout recommendation engines to deliver content or product recommendations with Snowplow][recommendation]

Coming soon.

[convert-data-to-format-for-olap]: /analytics/tools-and-techniques/converting-snowplow-data-into-a-format-suitable-for-olap.html
[olap]: http://en.wikipedia.org/wiki/OLAP_cube
[recommendation]: /analytics/tools-and-techniques/using-mahout-recommendation-engines-to-deliver-content-or-product-recommendations-with-snowplow.html
[r]: /analytics/tools-and-techniques/get-started-analysing-snowplow-data-with-r.html
[sql]: /analytics/tools-and-techniques/beginners-guide-to-using-sql-to-query-snowplow-data.html
