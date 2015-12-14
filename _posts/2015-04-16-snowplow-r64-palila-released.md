---
layout: post
title: Snowplow 64 Palila released with support for data models
title-short: Snowplow 64 Palila
tags: [snowplow, analytics, data modeling]
author: Christophe
category: Releases
---

We are excited to announce the immediate availability of Snowplow 64, Palila. This is a major release which adds a new [data modeling][github-data-modeling] stage to the Snowplow pipeline, as well as fixes a small number of important bugs across the rest of Snowplow.

In this post, we will cover:

1. [Why model your Snowplow data?](/blog/2015/04/16/snowplow-r64-palila-released#data-modeling)
2. [Understanding how the data modeling takes place](/blog/2015/04/16/snowplow-r64-palila-released#mechanics)
3. [The basic Snowplow data model](/blog/2015/04/16/snowplow-r64-palila-released#basic-model)
4. [Implementing the SQL Runner data model](/blog/2015/04/16/snowplow-r64-palila-released#implementation)
5. [Implementing the Looker data model](/blog/2015/04/16/snowplow-r64-palila-released#looker-implementation)
6. [SQL Runner](/blog/2015/04/16/snowplow-r64-palila-released#sql-runner)
7. [Other updates in this release](/blog/2015/04/16/snowplow-r64-palila-released#other-updates)
8. [Upgrading your Snowplow pipeline](/blog/2015/04/16/snowplow-r64-palila-released#upgrade)
9. [Data modeling roadmap](/blog/2015/04/16/snowplow-r64-palila-released#roadmap)
10. [Documentation and help](/blog/2015/04/16/snowplow-r64-palila-released#help)

![palila][palila]

<!--more-->

<h2><a name="data-modeling">1. Why data modeling?</a></h2>

The data collection and enrichment process produces an event stream, a long list of packets of data where each packet represents a single event. While it is possible to do analysis directly on this event stream, it is common to:

1. join Snowplow data with other data sets (e.g. customer, marketing, CMS, financial data)
2. aggregate the event-level data into data tables that represent entities that are commonly queried e.g. visitors, sessions, applications, products, articles etc.

This serves three purposes:

1. **The same underlying business logic is applied to the data before different users query it**, so that all users who query the data are working from the same underlying set of assumptions and definitions. When we join and aggregate the event level data, we are actually applying business logic to the underlying event-level data. How we aggregate the data will be a function of, for example:
  * How we identify users
  * How we define sessions
  * What dimensions we are interested in, for the key entities that matter to our business
2. **It makes querying more efficient**. The aggregate tables are typically simpler to compose queries against, and can be integrated directly into a business intelligence or pivoting tool
3. **It makes querying faster** because the aggregate data sets are smaller than the event-level data, with `distkeys` and `sortkeys` optimized to support fast joins.

We call this process *data modeling*.

The data modeling process will be very familiar to existing Snowplow users who are also using [Looker][looker]. That is because Looker provides a powerful and flexible framework to enable users to develop and iterate on their data models. Indeed, working with joint Snowplow-Looker customers has been very helpful in driving our thinking about how best to perform data modeling.

It should also be familiar to many other Snowplow users. We've worked with a number of Snowplow clients who do not use Looker, and nearly all of them end up creating aggregate tables to power queries.

In spite of Looker's great data modeling functionality, there are a number of reasons we chose to make data modeling a core step in the Snowplow pipeline:

1. For users who are not using Looker, having a formal framework for managing their data modeling process is very valuable, as we have seen with the users we have implemented this for to date.
2. Looker users with very large data volumes, or data pipelines that run frequently, will struggle to generate their aggregate tables (persistent derived tables in Looker terminology) fast enough if the process is managed via Looker. The reason is that Looker rebuilds these tables from scratch each time they need to be updated (i.e. with every data load). By moving the process of generating those tables outside of Looker, it is possible to update an existing set of tables based just on the new data that has landed with the last data pipeline run, which is significantly faster than reprocessing based on the entire data set. (We've seen queries data modeling queries that took hours compress down to executing in less than 10 minutes.)
3. We found that Looker users often wanted to make their derived tables available to other applications and processes.

So this release offers something for Looker and non-Looker customers alike.

<h2><a name="mechanics">2. Understanding how the data modeling takes place</a></h2>

The data modeling takes place in the data warehouse, once new data has been loaded by the StorageLoader.

![snowplow-data-pipeline][data-modeling-image]

The process works as follows:

1. Instead of loading new data directly into the `atomic` schema, data is loaded into a new `snowplow_landing` schema
2. A set of SQL statements are run on the incremental data, that effectively update a set of aggregate tables in the `snowplow_pivots` schema
3. On completion of those SQL statements, the data is moved from the `snowplow_landing` schema to the `atomic` schema. (This is done directly via SQL.)

The process using our [SQL Runner] [sql-runner] application, described [later](#sql-runner) in this blog post.

<h2><a name="basic-model">3. The basic Snowplow data model</a></h2>

This release comes with a [basic data model][github-data-modeling], a set of SQL queries which aggregate event-level data in Redshift into:

- A sessions table (using client-side sessionization)
- A visitors table (using cookies for identity stitching)
- A page views table

This basic model is meant as an exemplar: it can be useful place for new Snowplow users to start modeling their data. In general, however, we expect data models to be pretty company-specific, reflecting the fact that:

1. Different companies record different events across different channels
2. Different companies track the state of different entities over time
3. Different companies have different business questions they want to ask of the data

Palila also comes with an updated [Looker data model][github-looker], which is based on the same set of SQL queries and can be implemented and modified from the Looker UI.

Both models make minimal assumptions about the internal business logic. What tables are produced and what fields available in each one of them, varies widely between companies in different sectors, and surprisingly even within the same vertical.

<h2><a name="implementation">4. Implementing the SQL Runner data model</a></h2>

The basic data model comes with 2 different sets of [SQL queries][github-data-modeling-sql]:

- In [**full** mode][github-data-modeling-sql-full], the derived tables are recalculated from scratch (i.e. using all events) each time the pipeline runs
- In [**incremental** mode][github-data-modeling-sql-incremental], the tables are updated using only the most recent events

These two version are usually used at different stages in the development/implementation process. We recommend users start with the basic model setup in full mode. Although it is less efficient to recompute the tables from scratch each time, it is easier to iterate the business logic and underlying SQL in the data modeling process when you recompute the data from scratch. We find that users typically iterate on the models very frequently to start off with, but that this frequency decreases markedly over time.

At the point where the models become relatively stable, it then becomes sensible to migrate to the incremental model. This migration can be delayed until such time that the data volume gets too big to make recomputing the tables from scratch each time practical.

This whole process is described in more detail the [setup guide][setup-guide] and in our [analytics cookbook][cookbook-modeling].

<h2><a name="looker-implementation">5. Implementing the Looker data model</a></h2>

Snowplow users who are getting started or trialling Looker may wish to use the [Looker models][lookml] as a starting point to develop their own models.

It should be reasonably straightforward to copy the model into your LookML repository. (This is easiest if it can be done locally and then pushed to Git, rather than through the Looker UI.) Don't forget to update the connection name to reflect the name you've given to your Snowplow data connection.

<h2><a name="sql-runner">6. SQL Runner</a></h2>

SQL Runner is an open source app, written in Go, that makes it easy to execute SQL statements programmatically as part of the Snowplow data pipeline.

To use SQL Runner, you assemble a playbook i.e. a YAML file that lists the different `.sql` files to be run and the database they are to be run against. It is possible to specify which sequence the files should be run, and to run files in parallel.

The Palila release includes both the underlying SQL and the associated playbooks for running them. For more information on SQL Runner please view [the repo][sql-runner].

<h2><a name="other-updates">7. Other updates in this release</a></h2>

There are four important changes in this release:

1. Since 6th April 2015, all new Elastic MapReduce users have been required to use IAM roles with EMR. EmrEtlRunner did not previously support this requirement - but thanks to Elasticity author [Rob Slifka] [rslifka]'s fantastic support, EmrEtlRunner now supports IAM roles for EMR, and we require these to be used ([#1232] [issue-1232])
2. A bug in our new useragent parsing enrichment has been causing jobs to fail with out of memory errors. This has now been fixed for the Hadoop pipeline - many thanks to community member [Dani Solà] [danisola] for identifying this so quickly ([#1616] [issue-1616]). We will fix this for the Kinesis pipeline in the next Kinesis release
3. Dani also flagged that our new `mkt_clickid` column in `atomic.events` is too short to support Google's `gclid` parameter, which can range from 25 to 100 chars. We have widened this column in both Redshift and Postgres ([#1606] [issue-1606] and [#1603] [issue-1603] respectively)
4. Thanks to community member Morten Petersen for spotting that r63's Postgres migration script was missing its `user_id` field. This has now been fixed ([#1620] [issue-1620])

In the next section we will cover how to upgrade Snowplow to include these fixes.

<div class="html">
<h2><a name="upgrade">8. Upgrading your Snowplow pipeline</a></h2>
</div>

<div class="html">
<h3><a name="upgrading-emretlrunner">8.1 Upgrading your EmrEtlRunner</a></h3>
</div>

You need to update EmrEtlRunner to the latest code (**0.14.0**) on GitHub:

{% highlight bash %}
$ git clone git://github.com/snowplow/snowplow.git
$ git checkout r64-palila
$ cd snowplow/3-enrich/emr-etl-runner
$ bundle install --deployment
$ cd ../../4-storage/storage-loader
$ bundle install --deployment
{% endhighlight %}

<div class="html">
<h4><a name="configuring-emretlrunner">8.2 Updating EmrEtlRunner's configuration</a></h4>
</div>

From this release onwards, you must specify IAM roles for Elastic MapReduce to use. If you have not already done so, you can create these default EMR roles using the [AWS Command Line Interface] [install-aws-cli], like so:

{% highlight yaml %}
$ aws emr create-default-roles
{% endhighlight %}

Now update your EmrEtlRunner's `config.yml` file to add the default roles you just created:

{% highlight yaml %}
:emr:
  :ami_version: 2.4.2       # Choose as per http://docs.aws.amazon.com/ElasticMapReduce/latest/DeveloperGuide/emr-plan-ami.html
  :region: eu-west-1        # Always set this
  :jobflow_role: EMR_EC2_DefaultRole # NEW LINE
  :service_role: EMR_DefaultRole     # NEW LINE
{% endhighlight %}

This release also bumps the Hadoop Enrichment process to version **0.14.1**. Update `config.yml` like so:

{% highlight yaml %}
  :versions:
    :hadoop_enrich: 0.14.1 # WAS 0.14.0
{% endhighlight %}

For a complete example, see our [sample `config.yml` template][emretlrunner-config-yml].

<div class="html">
<h4><a name="upgrade-redshift">8.3 Updating your database</a></h4>
</div>

This release widens the `mkt_clickid` field in `atomic.events`. You need to use the appropriate migration script to update to the new table definition:

* [The Redshift migration script] [redshift-migration]
* [The PostgreSQL migration script] [postgres-migration]

And that's it - you should be fully upgraded.

<h2><a name="roadmap">9. Data modeling roadmap</a></h2>

The data modeling step in Snowplow 64 is still very new and experimental — we’re excited to see how it plays out and look forward to the community’s feedback.

There are a number of ways that we can improve the data modeling functionality - these are just some of our ideas, and we've love to bounce them off you, our users:

1. Move the data modeling out of SQL (and Redshift in particular) into EMR (for batch-based processing) or Spark Streaming (for users on the real-time pipeline). This would take a lot of load of the database, and mean that we could express the data modeling in a better suited language. We've been impressed by users who've shown us how they've performed this process in tools including [Scalding][scalding] and [Cascalog][cascalog]
2. Building on the above, we're very interested to figure out what the best way is of expressing the data modeling process. Potentially we could develop a DSL for this. Ideally, we would want to make it possible to express once, and then implement in a range of environments (i.e. stream processing, batch-processing and in-database)

In the shorter term we also plan to extend our data modeling documentation to cover common design patterns, including:

1. Cross platform identity stitching for logged-in users
2. Custom sessionization logic, including for users tracked from mobile apps and marrying server and client-side session data
3. Integrating third party user identification services

Keep checking the blog and [Analytics Cookbook][cookbook] for updates!

<h2><a name="help">10. Documentation and help</a></h2>

For more details on this release, please check out the [R64 Palila Release Notes][r64-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[palila]: /assets/img/blog/2015/04/palila.jpg

[github-looker]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/looker/

[github-data-modeling]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/
[github-data-modeling-playbooks]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/playbooks/

[github-data-modeling-sql]:	https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/sql
[github-data-modeling-sql-full]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/sql/full
[github-data-modeling-sql-incremental]:	https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/sql/incremental

[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample

[github-sql-runner]: https://github.com/snowplow/sql-runner

[setup-guide]: https://github.com/snowplow/snowplow/wiki/Setting-up-Snowplow

[catalog-analytics]: http://snowplowanalytics.com/analytics/catalog-analytics/overview.html
[cookbook-modeling]: http://snowplowanalytics.com/analytics/event-dictionaries-and-data-models/data-modeling.html

[install-aws-cli]: http://docs.aws.amazon.com/cli/latest/userguide/installing.html

[redshift-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/migrate_0.5.0_to_0.6.0.sql
[postgres-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/postgres-storage/sql/migrate_0.4.0_to_0.5.0.sql

[rslifka]: https://github.com/rslifka
[danisola]: https://github.com/danisola

[issue-1603]: https://github.com/snowplow/snowplow/issues/1603
[issue-1606]: https://github.com/snowplow/snowplow/issues/1606
[issue-1616]: https://github.com/snowplow/snowplow/issues/1616
[issue-1620]: https://github.com/snowplow/snowplow/issues/1620
[issue-1232]: https://github.com/snowplow/snowplow/issues/1232

[r64-release]: https://github.com/snowplow/snowplow/releases/tag/r64-palila
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[looker]: http://www.looker.com/
[data-modeling-image]: https://d3i6fms1cm1j0i.cloudfront.net/github-wiki/images/snowplow-architecture-5-data-modeling.png
[sql-runner]: https://github.com/snowplow/sql-runner
[cookbook]: /analytics/index.html
[lookml]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/looker
[scalding]: https://github.com/twitter/scalding
[cascalog]: http://cascalog.org/
