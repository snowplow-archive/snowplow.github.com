---
layout: post
title: Looking back on 2015: Most read blogposts
author: Christophe
category: Inside the Plow
---

2015 is drawing to a close. There's no better time to crunch through all those events in Redshift to figure out what people were most interested in these past 12 months.

The Snowplow team has been active with 82 new blogposts (and counting).
- In total people sent **2,953** hours reading on our blog (a metric calculated using our heartbeat in the JS tracker)

## The top 10 in 2015:

1. [First experiments with Apache Spark at Snowplow](/blog/2015/05/21/first-experiments-with-apache-spark/)
2. [Apache Spark Streaming example project released](/blog/2015/06/10/spark-streaming-example-project-0.1.0-released/)
3. [AWS Lambda Node.js example project released](/blog/2015/07/11/aws-lambda-nodejs-example-project-0.1.0-released/)
4. [AWS Lambda Scala example project released](/blog/2015/08/20/aws-lambda-scala-example-project-0.1.0-released/])
5. [Modeling events through entity snapshotting](/blog/2015/01/18/modeling-events-through-entity-snapshotting/)
6. [Snowplow 64 Palila released with support for data models](/blog/2015/04/16/snowplow-r64-palila-released/)
7. [Spark Example Project 0.3.0 released for getting started with Apache Spark on EMR](/blog/2015/05/10/spark-example-project-0.3.0-released/)
8. [Schema Guru 0.1.0 released for deriving JSON Schemas from JSONs](/blog/2015/06/03/schema-guru-0.1.0-released-for-deriving-json-schemas-from-jsons/)
9. [Samza Scala example project released](/blog/2015/09/30/samza-scala-example-project-0.1.0-released/)
10. [JSON schemas for Redshift datatypes](/blog/2015/02/12/redshift-jsonschema-types/)

## From the archives

There are, of course, also the classics.

1. [/blog/2013/02/08/writing-hive-udfs-and-serdes/](Writing Hive UDFs - a tutorial)
2. [/blog/2013/05/30/dealing-with-hadoops-small-files-problem/](Dealing with Hadoop's small files problem)
3. [/blog/2014/04/17/spark-example-project-released/](Spark Example Project released for running Spark jobs on EMR)
4. [/blog/2014/01/15/amazon-kinesis-tutorial-getting-started-guide/](Amazon Kinesis tutorial - a getting started guide)
5. [/blog/2014/05/15/introducing-self-describing-jsons/](Introducing self-describing JSONs)

---- to remove

select

page_urlpath, count(distinct domain_userid)

from atomic.events

where collector_tstamp::date >= '2015-01-01'
and collector_tstamp::date <= '2015-12-31'

and page_urlhost = 'snowplowanalytics.com'
and page_urlpath like '/blog/2015/%'

group by 1 order by 2 desc
