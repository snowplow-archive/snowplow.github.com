---
layout: post
title: Transforming Snowplow data so that it can be interrogataed in BI / OLAP tools like Tableau, Qlikview and Pentaho
title-short: Transforming Snowplow data
tags: [snowplow, olap, tableau, pentaho, qlikview, microstrategy, star schema, columnar database]
author: Yali
category: Analytics
---

Because Snowplow does not ship with any sort of user interface, we get many enquiries from current and prospective users who would like to interrogate Snowplow data with popular BI tools like Tableau or Qlikview.

<p style="text-align:center;"><img src="/assets/img/olap/example-cube-2.png" alt="olap cube" width="250"/></p>

Unfortunately, it is not possible to run a tool like Tableau directly on top of the Snowplow events table. That is because these tools require the data to be in a particular format: one in which each line of data is made up of a combination of dimension and metrics fields, such that it is straightforward for the reporting tool to understand how to aggregate metrics by different combinations of dimensions. To give a very simple example of a data set that would play nicely with a reporting tool like Tableau:

| Country       | Date       | Product       | Number Sold       | Revenue       |
|:--------------|:-----------|:--------------|-------------------|--------------:|
| UK            | Sept 2012  | Hats          | 137               | 1779.63       |
| UK            | Oct 2012   | Hats          | 193               | 2507.07       |
| UK            | Oct 2012   | Shoes         | 15                | 1125.00       |
| France        | Oct 2012   | Hats          | 288               | 2877.12       |
| ...           | ...        | ...           | ...               | ...           |

Reporting tools like Tableau recognise that the two right hand columns (number sold and revenue) are metrics, and that analysts will want to examine how those metrics vary by country, time and product (all of which are dimensions). They will give analysts easy-to-use tools to enable them to slice, dice, drill up and drill down those metrics by different combinations of those dimensions. Enabling those operations is straightforward for the reporting tool, because it knows it knows if the analyst wants to report product sales in the UK over time, to filter all results by country (so only lines of data from the UK are included), and display sales of each type of product by month.

This type of dimensional analysis is called [OLAP][olap], and has a long and venerable history in business intelligence. Although the term 'OLAP' is no longer fashionable, this type of analysis is still the predominant one used by anyone who relies on PivotTables in Excel or any mainstream BI tool including Tableau, Qlikview, Microstrategy, Pentaho etc.

<!--more-->

Snowplow data is in a log file format. Whilst each line does include metrics (e.g. revenue) and dimensions (e.g. browser features or operating system details), there are a large number of dimensions that we might want to slice and dice the data on that are not included in each line: these data points have to be inferred by reading across several lines of data. To give just one example: the source of traffic i.e. `mkt_source` for a particular visit is only given on the **first line** of data for that visit. Hence, in order to enable users to analyse page views, customer lifetime value and other metrics by different marketing sources (e.g. to do attribution analysis), we need to work out which source of traffic to attribute that visit to, and label every line of data associated with that visit with that source of traffic.

So in order to use a BI tool like Tableau or Qlikview to interrogate Snowplow data, you need to transform the data first. We've documented how to perform the transformation in the [analytics cookbook] [transform-snowplow-data-for-olap]. We hope it provides a useful guide for anyone interested in interrogating or visualising Snowplow data using BI tools.

We also wonder whether the documentation will be of interest to the wider community of analysts and data scientists interested in using tools like Tableau to query log data. One of the things that surprised us, going in to this exercise, was the lack of material we could find on the internet that covered transforming log data so that it could be analysed using BI tools. We expected this to be well-covered territory: especially given the fact that the vast majority of data processed by Hadoop is log files, and nearly all the BI vendors are working hard to integrate their products with Hadoop. (For example, Tableau now integrates with MapR Hadoop distributions, so you can analyse Hive tables directly in Tableau.) Without the transformation step covered in our [guide] [transform-snowplow-data-for-olap] however, this type of integration is useless.

If we've missed any online literature on the topic, or if there are other people who've looked at this particular problem and come up with different approaches - we'd love to debate them here. Get in touch! For everyone else, we hope you find our [guide] [transform-snowplow-data-for-olap] helpful...


References:

* Snowplow data [canonical data structure][canonical-data-structure].






[olap]: http://en.wikipedia.org/wiki/Online_analytical_processing
[transform-snowplow-data-for-olap]: /analytics/tools-and-techniques/converting-snowplow-data-into-a-format-suitable-for-olap.html
[canonical-data-structure]: https://github.com/snowplow/snowplow/wiki/canonical-event-model
