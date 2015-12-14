---
layout: post
title: Using Qubole to crunch your Snowplow web data using Apache Hive
tags: [qubole, hive, emr]
author: Yali
category: Analytics
---

We've just published a getting-started guide to using [Qubole][qubole], a managed Big Data service, to query your Snowpow data. You can read the guide [here] [qubole-wiki].

![qubole-logo] [qubole-logo]

Snowplow delivers event data to users in a number of different places:

1. Amazon Redshift or PostgreSQL, so you can analyze the data using traditional analytics and BI tools
2. Amazon S3, so you can analyze that data using Hadoop-backed, big data tools e.g. [Mahout] [mahout], [Hive] [hive] and [Pig] [pig], on EMR

Since we started offering support for Amazon Redshift and more recently PostgreSQL, our focus on the blog and in the [Analytics Cookbook] [cookbook] has been on using traditional analytics tools e.g. [Tableau] [tableau], [R] [r] and [Excel] [excel] to crunch the data. However, there are a host of reasons when you might want to crunch the data using one of the new generation of big data tools. Two give two examples:

1. You may want to join your Snowplow data with other data sets, and those data sets are not structured. (E.g. they are in JSON, or custom text file formats.)
2. You want to use specific algorithms or libraries that have been built for big data tools e.g. Mahout recommendation or clustering algorithms.

<!--more-->

For situations when you want to use big data tools to crunch your Snowplow and other data in S3, an increasingly attractive alternative to doing that in EMR is to use [Qubole] [qubole].

![qubole-ui] [qubole-ui]

[Qubole] [qubole] runs on top of Amazon Web Services. It interfaces directly with S3, in just the same way that EMR does. However, Qubole is a significantly more polished product than EMR. Data scientists can  explore their data in S3, create tables and query those tables all via an easy-to-use web UI. You can test queries on samples of the data, easily run and monitor multiple queries in parallel and download the results of queries directly to your local computer, so you can quickly visualize it in Excel or R.

It's not just the UI that makes using Qubole a lot nicer than EMR. Qubole handles the behind the scenes scaling of your cluster, so you don't have to. Queries that do not require map reduce jobs to produce outputs, e.g. reading data directly from S3, can be executed without spinning up clusters (and so return much faster). Clusters that are no longer used, are automatically shut down. (Am I the only person who's got in trouble for leaving a big cluster running over night?)

Qubole is a particular nice service if you want to use Apache Hive. It was developed by the same engineers who originally built Apache Hive at Facebook. In the [guide to getting started with Qubole] [qubole-wiki], which we have just published, we walk Snowplow users through the process of running their first query Apache Hive query on Snowplow data with Qubole.

We intend to follow-up the getting started guide with a set of recipes for using both [Hive] [hive] and [Mahout] [mahout] via Qubole. Stay tuned!

As always, we welcome comments and feedback - especially on how you find the combination of Qubole's data crunching capability, on Snowplow's granular event-level data.




[cookbook]: /analytics/index.html
[qubole]: http://www.qubole.com/#All
[qubole-ui]: /assets/img/blog/2013/09/qubole-ui.png
[qubole-wiki]: https://github.com/snowplow/snowplow/wiki/Setting-up-Qubole-to-analyze-Snowplow-data-using-Apache-Hive
[qubole-logo]: /assets/img/blog/2013/09/qubole-logo.png
[tableau]: http://www.tableausoftware.com/
[r]: http://cran.r-project.org/
[excel]: http://office.microsoft.com/en-gb/excel/
[pig]: http://pig.apache.org/
[hive]: http://hive.apache.org/
[mahout]: http://mahout.apache.org/
