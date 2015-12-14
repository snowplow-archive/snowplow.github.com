---
layout: post
title: Snowplow 0.8.8 released with Postgres and Hive support
title-short: Snowplow 0.8.8
tags: [snowplow, postgres, hive, storage]
author: Alex
category: Releases
---

We are pleased to announce the immediate release of Snowplow 0.8.8. This is a big release for us: it adds the ability to store your Snowplow events in the popular [PostgreSQL] [postgres] open-source database. This has been the most requested Snowplow feature all summer, so we are delighted to finally release it.

And if you are already happily using Snowplow with Redshift, there are two other new features to check out:

1. We have added support for multiple storage targets to Snowplow's StorageLoader. This means that you can configure StorageLoader to load into three different Redshift databases, one PostgreSQL database and one Redshift - whatever
2. We have brought back the ability to query your Snowplow events using [HiveQL] [hiveql]. Regardless of which storage target(s) you are using, you can now also run HiveQL queries against your Snowplow events stored in Amazon S3

As well as these new features, we have made a large number of improvements across Snowplow:

* We have made some improvements to the Hadoop-based Enrichment process (bumped to version 0.3.3)
* We have simplified EmrEtlRunner and its configuration file format
* We have improved the performance of the Redshift loading code
* We have added a configuration option for setting `MAXERROR` when loading into Redshift (see the [Redshift `COPY` documentation] [redshift-copy] for details)
* We have moved the Snowplow JavaScript Tracker into [its own repository] [js-tracker]
* We have removed the deprecated Hive ETL and Infobright folders from the repository

After the fold, we will cover the options for upgrading and using the new functionality:

1. [Upgrading](/blog/2013/08/05/snowplow-0.8.8-released-with-postgres-and-hive-support#upgrading)
2. [Loading events into Postgres](/blog/2013/08/05/snowplow-0.8.8-released-with-postgres-and-hive-support#postgres)
3. [Querying events with HiveQL](/blog/2013/08/05/snowplow-0.8.8-released-with-postgres-and-hive-support#hiveql)
4. [Getting help](/blog/2013/08/05/snowplow-0.8.8-released-with-postgres-and-hive-support#help)

<!--more-->

<h2><a name="upgrading">1. Upgrading</a></h2>

There are **three components** to upgrade in this release:

* The Hadoop ETL, to version 0.3.3
* EmrEtlRunner, to version 0.4.0, and its configuration file
* StorageLoader, to version 0.1.0, and its configuration file

Let's take these in turn:

### Hadoop ETL

If you are using EmrEtlRunner, you need to update your configuration file, `config.yml`, to use the latest version of the Hadoop ETL:

{% highlight yaml %}
:snowplow:
  :hadoop_etl_version: 0.3.3 # Version of the Hadoop ETL
{% endhighlight %}

Read on for the rest of the changes you will need to make to `config.yml`.

### EmrEtlRunner

You need to upgrade your EmrEtlRunner installation to the latest code (0.8.8 release) on GitHub:

    $ git clone git://github.com/snowplow/snowplow.git
    $ git checkout 0.8.8
    $ cd snowplow/3-enrich/emr-etl-runner
    $ bundle install --deployment

Next, you need to update the format of your `config.yml` - the format has been simplified significantly. The new format ([as found on GitHub] [etl-config]) looks like this:

{% highlight yaml %}
:aws:
  :access_key_id: ADD HERE
  :secret_access_key: ADD HERE
:s3:
  :region: ADD HERE
  :buckets:
    :assets: s3://snowplow-hosted-assets # DO NOT CHANGE unless you are hosting the jarfiles etc yourself in your own bucket
    :log: ADD HERE
    :in: ADD HERE
    :processing: ADD HERE
    :out: ADD HERE WITH SUB-FOLDER # e.g. s3://my-out-bucket/events
    :out_bad_rows: ADD HERE        # e.g. s3://my-out-bucket/bad-rows
    :out_errors: ADD HERE # Leave blank unless :continue_on_unexpected_error: set to true below
    :archive: ADD HERE
:emr:
  # Can bump the below as EMR upgrades Hadoop
  :hadoop_version: 1.0.3
  :placement: ADD HERE
  :ec2_key_name: ADD HERE
  # Adjust your Hadoop cluster below
  :jobflow:
    :master_instance_type: m1.small
    :core_instance_count: 2
    :core_instance_type: m1.small
    :task_instance_count: 0 # Increase to use spot instances
    :task_instance_type: m1.small
    :task_instance_bid: 0.015 # In USD. Adjust bid, or leave blank for non-spot-priced (i.e. on-demand) task instances
:etl:
  :job_name: SnowPlow ETL # Give your job a name
  :hadoop_etl_version: 0.3.3 # Version of the Hadoop ETL
  :collector_format: cloudfront # Or 'clj-tomcat' for the Clojure Collector
  :continue_on_unexpected_error: false # You can switch to 'true' (and set :out_errors: above) if you really don't want the ETL throwing exceptions
{% endhighlight %}

Note that the `:snowplow:` section has been mostly removed, with `:hadoop_etl_version:` moving into the `:etl:` section.

### StorageLoader

You need to upgrade your StorageLoader installation to the latest code (0.8.8 release) on GitHub:

    $ git clone git://github.com/snowplow/snowplow.git
    $ git checkout 0.8.8
    $ cd snowplow/4-storage/storage-loader
    $ bundle install --deployment

Next, you need to update the format of your `config.yml` - the format has been updated to support multiple storage targets. The new format ([as found on GitHub] [redshift-config]) looks like this:

{% highlight yaml %}
:aws:
  :access_key_id: ADD HERE
  :secret_access_key: ADD HERE
:s3:
  :region: ADD HERE # S3 bucket region must be the same as Redshift cluster region
  :buckets:
    :in: ADD HERE # Must be s3:// not s3n:// for Redshift
    :archive: ADD HERE
:download:
  :folder: # Not required for Redshift
:targets:
  - :name: "My Redshift database"
    :type: redshift
    :host: ADD HERE # The endpoint as shown in the Redshift console
    :database: ADD HERE # Name of database
    :port: 5439 # Default Redshift port
    :table: events
    :username: ADD HERE
    :password: ADD HERE
    :maxerror: 1 # Stop loading on first error, or increase to permit more load errors
{% endhighlight %}

Note the new `:maxerror:` setting - see the [Redshift `COPY` documentation] [redshift-copy] for more on this.

To add another Redshift storage target, just add another configuration block under `:targets:`, starting with `- :name:`.

To add a new Postgres storage target, read on...

<h2><a name="postgres">2. Loading events into Postgres</a></h2>

Loading events into Postgres is quite straightforward:

1. Upgrade to the latest version of Snowplow [as described above](#upgrading)
2. If you don't have one already, setup a Postgres database server
3. Create a `snowplow` database within Postgres
4. Deploy the Snowplow schema and table into `snowplow`
5. Configure StorageLoader to load into Postgres

For help on steps 2-4, please see our new guide, [Setting up PostgreSQL] [postgres-setup]. You can find the new PostgreSQL script on GitHub, [here] [postgres-ddl].

For step 5, you should create a StorageLoader configuration file which looks like this ([as found on GitHub] [postgres-config]):

{% highlight yaml %}
:aws:
  :access_key_id: ADD HERE
  :secret_access_key: ADD HERE
:s3:
  :region: ADD HERE # S3 bucket region
  :buckets:
    :in: ADD HERE
    :archive: ADD HERE
:download:
  :folder: ADD HERE # Postgres-only config option. Where to store the downloaded files
:targets:
  - :name: "My PostgreSQL database"
    :type: postgres
    :host: ADD HERE # Hostname of database server
    :database: ADD HERE # Name of database
    :port: 5432 # Default Postgres port
    :table: atomic.events
    :username: ADD HERE
    :password: ADD HERE
    :maxerror: # Not required for Postgres
{% endhighlight %}

Make sure to set `:folder:` to a local directory where you can download the Snowplow event files to, ready for loading into your local Postgres database server.

<h2><a name="hiveql">3. Querying events with HiveQL</a></h2>

The new release makes it possible again to query your Snowplow events directly on Amazon S3 using [HiveQL] [hiveql].

Steps are as follows:

1. Upgrade to the latest version of Snowplow [as described above](#upgrading)
2. Wait for Snowplow to run at least once following the upgrade
3. Follow the instructions in our updated guide, [Running Hive using the command line tools] [hive-howto]

If you want to run HiveQL queries across your historical event data (i.e. from before the upgrade), this is possible too. You will need to rename the timestamped folders in your event archive from the old format to the new format, by prepending `run=`. So for example, change:

    s3://my-snowplow-archive/events/2013-07-01-04-00-03

To:

    s3://my-snowplow-archive/events/run=2013-07-01-04-00-03

One this is done for all folders, all of your historic event files should be correctly partitioned ready for Hive to query.

<h2><a name="help">4. Getting help</a></h2>

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

For more details on this release, please check out the [0.8.8 Release Notes] [snowplow-088] on GitHub.

[postgres]: http://www.postgresql.org/
[hiveql]: http://hive.apache.org/
[js-tracker]: https://github.com/snowplow/snowplow-javascript-tracker

[etl-config]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample

[redshift-config]: https://github.com/snowplow/snowplow/blob/master/4-storage/storage-loader/config/redshift.yml.sample
[redshift-copy]: http://docs.aws.amazon.com/redshift/latest/dg/r_COPY.html

[postgres-config]: https://github.com/snowplow/snowplow/blob/master/4-storage/storage-loader/config/postgres.yml.sample
[postgres-setup]: https://github.com/snowplow/snowplow/wiki/Setting-up-PostgreSQL
[postgres-ddl]: https://github.com/snowplow/snowplow/blob/master/4-storage/postgres-storage/sql/table-def.sql

[hive-howto]: https://github.com/snowplow/snowplow/wiki/Running-Hive-using-the-command-line-tools
[hive-ddl]: https://github.com/snowplow/snowplow/blob/master/4-storage/hive-storage/hiveql/table-def.q

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[snowplow-088]: https://github.com/snowplow/snowplow/releases/0.8.8
