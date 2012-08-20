---
layout: section
category: product
title: SnowPlow technical architecture
weight: 4
---

# SnowPlow technical architecture

SnowPlow has been built around 5 loosely-coupled modules:

![SnowPlow module architecture] [snowplow-modular-architecture] 


1. **Trackers** fire SnowPlow events
2. **Collectors** receive SnowPlow events from trackers, and write them to logs
3. **ETL** (extract, transform and load) cleans up the raw logs, enriches them with additional external data where appropriate (e.g. from CRM systems, product catalogues) and writes the data to storage
4. **Storage**. where the event data lives, in a place suitable for querying / analysing
5. **Analytics** takes the data from storage and uses it to do useful stuff e.g. answering business questions, segmenting customers, developing recommendations...

### Current technology employed for each module

The current version of SnowPlow employs a range of powerful and scalable technologies and services for each module:

1. **Tracker**: open source, asyncronous javascript tags. Other trackers (e.g. iOS, Android) are on the development roadmap
2. **Collectors**: we currently use an [Amazon CloudFront] [cloudfront]-based collector. This is both very reliable and very scalable, and means that SnowPlow events are processed on the  web page very quickly. (Because Cloudfront is a [CDN] [wikipedia-cdn])
3. **ETL**: we currently run an [Apache Hive] [apache-hive] based ETL process. Built on top of [Hadoop] [hadoop], Hive can scale to handle petabytes of data
4. **Storage**: the resulting data is stored in [Amazon S3] [s3], which offers cost effective storage for enormous quantities of data
5. **Analytics**: currently the majority of analytics is performed using Amazon [Elastic Mapreduce] [emr] and [Apache Hive] [apache-hive]. This has a number of advantages: it scales to petabytes of data and it makes it possible for anyone with a knowledge of SQL to analyse the data. Hive is used generally used to aggregate the data down to a volume that can then be imported into a visualisation tool (e.g. [Tableau] [tableau], [Microstrategy] [microstrategy]) or processed in an analytics / statistics tool (e.g. [R] [r-project]), or stick with plain old [Excel] [excel]. 

The forthcoming version of SnowPlow will offer a number of complimentary modules. In particular, we are in the process of upgrading the ETL, storage and analytics processes, so as well as outputing the data into S3 for analysis in Hive, we output the data to [Infobright] [infobright] to process in SQL. For companies that do not collect petabytes of data, Infobright scales to terabytes and enables for much faster querying at lower server costs. It also is more easily directly integrated into visualisation and business intelligence tools. 

For more information on SnowPlow technology, visit the [technology] [technology] section of the site and / or the [Github repo] [github-repo].

[Learn more] [intro-to-snowplow-analytics] about how to perform analyses in SnowPlow.

[Get started] [get-started] with SnowPlow today.


[snowplow-modular-architecture]: img/snowplow-modular-architecture.png
[technology]: /technology/index.html
[github-repo]: http://github.com/snowplow/snowplow
[wikipedia-cdn]: http://en.wikipedia.org/wiki/Content_delivery_network
[cloudfront]: http://aws.amazon.com/cloudfront/
[apache-hive]: http://hive.apache.org/
[hadoop]: http://hadoop.apache.org/
[s3]: http://aws.amazon.com/s3/
[emr]: http://aws.amazon.com/elasticmapreduce/[r-project]: http://www.r-project.org/
[tableau]: http://www.tableausoftware.com/
[microstrategy]: http://www.microstrategy.co.uk/
[r-project]: http://www.r-project.org/
[tableau]: http://www.tableausoftware.com/
[microstrategy]: http://www.microstrategy.co.uk/
[excel]: http://office.microsoft.com/en-gb/excel/
[infobright]: http://www.infobright.org/
[intro-to-snowplow-analytics]: analysing-data-with-snowplow.html
[get-started]: get-started.html
