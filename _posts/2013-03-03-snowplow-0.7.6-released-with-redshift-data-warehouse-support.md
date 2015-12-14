---
layout: post
title: Snowplow 0.7.6 released with Redshift data warehouse support
title-short: Snowplow 0.7.6
tags: [snowplow, redshift, datawarehouse]
author: Alex
category: Releases
---

We're excited to announce the immediate release of Snowplow version **0.7.6** with support for storing your Snowplow events in [Amazon Redshift] [amazon-redshift].

We were very excited when Amazon announced Redshift back in late 2012, and we have been working to integrate Snowplow data since Redshift became generally available two weeks ago. Our tests with Redshift since launch have not disappointed - and we can't wait to see what the Snowplow community do with the new platform!

In this post we will cover:

1. [Why Redshift is a great fit for Snowplow data](/blog/2013/03/03/snowplow-0.7.6-released-with-redshift-data-warehouse-support#why-redshift)
2. [Changes in this version](/blog/2013/03/03/snowplow-0.7.6-released-with-redshift-data-warehouse-support#this-version)
3. [Setting up Snowplow for Redshift](/blog/2013/03/03/snowplow-0.7.6-released-with-redshift-data-warehouse-support#snowplow-redshift)
4. [Upgrading for Infobright/Hive users](/blog/2013/03/03/snowplow-0.7.6-released-with-redshift-data-warehouse-support#upgrading)
5. [Roadmap and next steps](/blog/2013/03/03/snowplow-0.7.6-released-with-redshift-data-warehouse-support#roadmap)
6. [Getting help](/blog/2013/03/03/snowplow-0.7.6-released-with-redshift-data-warehouse-support#help)

Read on below the fold to find out more.

<!--more-->

<h2><a name="why-redshift">1. Why Amazon Redshift is a great fit for Snowplow data</a></h2>

Snowplow datasets get big very quickly: we store at least one line of data for every single event that occurs on your website or application. Our largest users are recording 100M+ events every day; these data volumes get very big, very quickly.

Whereas traditional web analytics packages deal with this by aggregating data to feed pre-cut reports, we built Snowplow specifically to maintain that granularity, because that granularity is critical to:

* Performing bespoke analyses e.g. analysing conversion rates by product, or segmenting users by behavior
* Joining Snowplow data with third party datasets e.g. from your CMS, CRM, adserver or marketing data

As a result, we built Snowplow on technologies like Hadoop and Hive from the get-go to enable Snowplow users to record and analyse massive volumes of event data.

The trouble with Hadoop and Hive is that they are not great tools for [OLAP analysis] [olap]. As a result, we added support for [Infobright Community Edition] [ice]: an open source columnar database you deploy yourself which scales to terabytes.

With [Amazon Redshift] [amazon-redshift], we now support a columnar database that scales to petabytes. Not only that, but:

* Amazon Redshift is a fully managed service. Unlike Infobright, you do not need to setup and run your own servers: you simply connect to AWS and ask Amazon to fire up a Redshift cluster for you
* Redshift clusters can easily be scaled up and down over time with your data requirements: it is simple to add and remove nodes; you can even snapshot and hibernate them
* A wide range of analytics tools can be plugged directly into Redshift via well supported PostgreSQL JDBC and ODBC drivers. It already works with [Chartio] [chartio]. A dedicated connectors for Tableau is currently in development
* Redshift supports a broader set of SQL functionality than Infobright. In particular, loading data into Redshift is much more straightforward, and debugging errors when they occur much easier
* Data can be loaded directly from S3 into Redshift, making the Snowplow ETL pipeline simpler and more efficient. And support for loading Redshift directly from Elastic MapReduce is in Amazon's roadmap
* Redshift is part of the AWS cloud, around which Snowplow has been built
* Redshift is highly cost-effective: costing as little $1,000 per TB per year

Please read on to find out how to get started with Snowplow and Redshift.

<h2><a name="this-version">2. Changes in this version</a></h2>

This version makes a set of changes to Snowplow to add support for Redshift; it is important to understand these changes even if you are using our Hive or Infobright storage options and are not interested in using Redshift.

The main changes are as follows:

* The HiveQL scripts have been renamed to align with the three storage formats they generate: `mysql-infobright`, `hive` and `redshift`.
* EmrEtlRunner and StorageLoader have both been upgraded, to versions 0.0.9 and 0.0.5 respectively
* The configuration file formats for EmrEtlRunner and StorageLoader have been updated to add support for Redshift and reflect the new naming conventions

Additionally we have fixed two bugs in this version:

1. Our Bash files for automating EmrEtlRunner and/or StorageLoader had a bug where the `BUNDLE_GEMFILE` configuration lines did not end in `/Gemfile`. This has now been fixed. Many thanks to [Eric Zimmerman] [ezwrighter] for reporting this!
2. We have widened the field storing the raw useragent string in Infobright (and Redshift) to 1000 characters: 500 characters wasn't enough

If you are a Snowplow Hive/Infobright user with no interest in Redshift, please jump to [Upgrading for Infobright/Hive users](FIXME#hive-ice-upgrade) for information on how to upgrade.

<h2><a name="snowplow-redshift">3. Setting up Snowplow for Redshift</a></h2>

This is a relatively simple process, which is fully documented on our wiki:

1. [Setup a Redshift cluster] [wiki-setup-redshift]
2. [Configure EmrEtlRunner to output Snowplow events in Redshift format] [wiki-emr-etl-runner]
3. [Configure StorageLoader to load Snowplow events into Redshift] [wiki-storage-loader]
4. (Optional) [Connect Chartio to Snowplow data in Redshift] [wiki-chartio-redshift]

Once you have completed these steps, you should now have a Snowplow eventstream data warehouse setup in Redshift!

<h2><a name="upgrading">4. Upgrading for Infobright/Hive users</a></h2>

These are the steps to upgrade Snowplow to version 0.7.6 if you are using the Hive or Infobright output formats:

### 4.1 EmrEtlRunner

If you are using EmrEtlRunner, you need to update your configuration file, `config.yml`, to use the latest versions of the Hive serde and HiveQL scripts:

    :snowplow:
      :serde_version: 0.5.5
      :hive_hiveql_version: 0.5.7
      :mysql_infobright_hiveql_version: 0.0.8
      :redshift_hiveql_version: 0.0.1

If you are outputting Snowplow events in Infobright format, you need to update this line too:

    :etl:
      ...
      :storage_format: mysql-infobright # Used to be 'non-hive'

### 4.2 Infobright table definition

If you are using Infobright Community Edition for analysis, you will need to update your table definition, because we have widened the `useragent` field.

To make this easier for you, we have created a script:

    4-storage/infobright-storage/migrate_to_008.sh

Running this script will create a new table, `events_008` (version 0.0.8 of the Infobright table definition) in your `snowplow` database, copying across all your data from your existing `events` table, which will not be modified in any way.

### 4.3 StorageLoader

If you are using StorageLoader, you need to update your configuration file, `config.yml`, to the new format:

    :storage:
      :type:     infobright
      :host:     # Not used by Infobright
      :database: ADD IN HERE
      :port:     # Not used by Infobright
      :table:    events_008 # NOT "events_007" any more
      :username: ADD IN HERE
      :password: ADD IN HERE

Note that the `table` field now points to the new `events_008` table created in section 4.2 above.

Done!

<h2><a name="roadmap">5. Roadmap and next steps</a></h2>

We're really excited about the opportunities for building web-scale, low-cost data warehouses for marketing and product analytics with Amazon Redshift, and we're super-excited about all of the potential uses of Snowplow event data within these data warehouses. If you're excited too, do [get in touch] [get-in-touch]!

Separately, this is the last planned release in the 0.7.x series. We're already hard at work on the next release, which will see us swap out the current Hive-based ETL process for a more robust, performant and extensible Hadoop (Cascading/Scalding) ETL process.

To keep track of this new release, please sign up for our [mailing list] [google-group] and checkout our [Roadmap] [roadmap].

<h2><a name="help">6. Getting help</a></h2>

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[amazon-redshift]: http://aws.amazon.com/redshift/
[olap]: http://en.wikipedia.org/wiki/Online_analytical_processing
[ice]: http://www.infobright.com/
[chartio]: http://chartio.com/
[ezwrighter]: https://github.com/EZWrighter

[wiki-setup-redshift]: https://github.com/snowplow/snowplow/wiki/setting-up-redshift
[wiki-emr-etl-runner]: https://github.com/snowplow/snowplow/wiki/1-Installing-EmrEtlRunner
[wiki-storage-loader]: https://github.com/snowplow/snowplow/wiki/1-Installing-the-StorageLoader
[wiki-chartio-redshift]: https://github.com/snowplow/snowplow/wiki/Setting-up-ChartIO-to-visualize-Snowplow-data#wiki-redshift

[get-in-touch]: mailto:sales@snowplowanalytics.com
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[google-group]: https://groups.google.com/forum/?fromgroups#!forum/snowplow-user
[roadmap]: https://github.com/snowplow/snowplow/wiki/Product-roadmap
