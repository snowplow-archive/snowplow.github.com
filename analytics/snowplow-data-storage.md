---
layout: page
group: analytics
sub_group: overview
title: How Snowplow stores data
shortened-link: Data storage
weight: 3
---

# Understanding how your Snowplow data is stored

Currently, Snowplow supports storing your data in three storage targets: [Amazon S3](#s3), Amazon [Redshift](#redshift) and [PostgreSQL](#postgres). We are working to support [a growing range of data storage options](#other) - this is because where your data lives has important implications for the type of analysis tools you can use to process that data. The more storage locations we make it easy for you to pipe your Snowplow data, the more analysis tools you will be able to plug directly into that data. Many Snowplow uses already store data on _both_ S3 _and_ Redshift / PostgreSQL, to exploit tools that work well with both storage solutions. 

Understanding how your Snowplow data is stored and formatted will better position you to analyse that data using a broad range of tools.

<div class="html">
<h2><a name="redshift">Storage in Redshift</a></h2>
</div>

![redshift-logo] [redshift-logo]

Storing your Snowplow data in Amazon Redshift has a number of benefits:

* Amazon Redshift is a fully-managed service
* Amazon Redshift scales up to handle Petabytes of data
* Redshift clusters can be scaled up over time: Amazon makes it easy to add and remove nodes
* A wide range of analytics tools can be plugged directly into Redshift via well-supported PostgreSQL JDBC and ODBC drivers. (E.g. it works particularly well with [Looker][looker], [ChartIO][chartio] and [Tableau][tableau], for example.) 
* Redshift supports a broad set of SQL functionality
* Redshift is highly cost effective: costing as little as $1000 per TB per year

Data is stored in Redshfit as a single 'fat table'.

<div class="html">
<h2><a name="postgres">Storage in PostgreSQL</a></h2>
</div>

![postgres-logo] [postgres-img]

Whilst Snowplow has been built to be scalable, many companies use Snowplow that do not require the ability to store and query billions of lines of data every month. For many of these companies, storing their Snowplow data in PostgreSQL has a number of benefits:

* It enables analysts to query the data using a very broad set of analytics and BI tools
* It is significiantly cheaper than Amazon Redshift at lower data volumes

PostgreSQL is especially easy to setup on Amazon RDS.

<div class="html">
<h2><a name="s3">Storage in Amazon S3</a></h2>
</div>

![s3-logo] [s3-logo]

Storing your Snowplow data in Amazon S3 has a number of benefits:

* It is incredibly scalable: S3 can store as much data as you can throw at it
* You can process data stored in S3 directly using [Qubole] [qubole] or [Amazon Elastic Mapreduce] [emr]: making it possible to use tools like [Hive] [hive], [Pig] [pig], [Mahout] [mahout] and [HBase] [hbase] to process your data. 
* Your data processing infrastructure is elastic: it scales with query volume / complexity as well as data volume, unlike databases like Redshift and Postgres.

Data is currently stored in S3 in flat-file, tab-delimited format, which makes it easy to query using any of the above tools. A table definition can be found [here] [hive-table-def]. Remember: each event is represented by a single line of data.

Going forwards, our intention is to change the format of data stored in S3 to use [Avro] [avro]. This will better enable us to grow out the range of event-specific and platform-specific fields.

For a guide to getting started using Hive to query your data in S3, see the [getting started] [getting-started-with-hive] section on the [setup guide] [setup-guide].


<div>
<h2><a name="other">Other storage options on the roadmap</a></h2>
</div>

We plan to incorporate [Neo4J] [neo4j], [SkyDB] [skydb], [Google BigQuery] [bigquery] and [Elastic Search] [elastic-search] to enable richer querying of time series event data.


[Learn more][table-structure] about how data is structured.


[apachehive]: #apachehive
[infobright]: #infobright
[infobright-website]: http://www.infobright.org/
[wiki]: http://github.com/snowplow/snowplow/wiki
[github-repo]: http://github.com/snowplow/snowplow
[s3]: http://aws.amazon.com/s3/
[serde]: https://github.com/snowplow/snowplow/tree/master/3-etl/hive/snowplow-log-deserializers
[table-structure]: snowplow-table-structure.html
[hive]: http://hive.apache.org/
[emr]: http://aws.amazon.com/elasticmapreduce/
[emr-cli]: http://aws.amazon.com/developertools/2264
[tableau]: http://www.tableausoftware.com/
[microstrategy]: http://www.microstrategy.co.uk/
[r]: http://www.r-project.org/
[table-structure]: snowplow-table-structure.html
[hosted-serde]: https://github.com/snowplow/snowplow/wiki/Hosted-assets
[emr-etl-runner]: https://github.com/snowplow/snowplow/wiki/hive-etl-setup
[hive]: http://hive.apache.org/
[pig]: http://pig.apache.org/
[mahout]: http://mahout.apache.org/
[hbase]: http://hbase.apache.org/
[hive-table-def]: https://github.com/snowplow/snowplow/blob/master/4-storage/hive-storage/hiveql/table-def.q
[getting-started-with-hive]: https://github.com/snowplow/snowplow/wiki/Running-Hive-using-the-command-line-tools
[setup-guide]: https://github.com/snowplow/snowplow/wiki/Setting-up-Snowplow
[s3-logo]: /assets/img/amazon_s3_logo.jpg
[redshift]: http://aws.amazon.com/redshift/
[skydb]: http://skydb.io/
[infobright-logo]: /assets/img/infobright_logo.JPG
[avro]: http://avro.apache.org/
[redshift-logo]: /assets/img/amazon-redshift.png
[chartio]: http://chartio.com/
[tableau]: http://www.tableausoftware.com/
[neo4j]: http://www.neo4j.org/
[postgres-img]: /assets/img/analytics/tools/postgres.png
[emr]: http://aws.amazon.com/elasticmapreduce/
[qubole]: http://qubole.com/
[looker]: http://looker.com/
[bigquery]: https://cloud.google.com/bigquery/
[elastic-search]: http://www.elasticsearch.org/
