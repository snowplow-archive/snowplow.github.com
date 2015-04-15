---
layout: post
shortenedlink: Snowplow 64 released
<<<<<<< HEAD
title: Snowplow 64 Palila released with support for data-models
=======
title: Snowplow 64 Palila released
>>>>>>> 665f54386479c981a2963ad1d426a262527f9a9c
tags: [snowplow, analytics, data modeling]
author: Christophe
category: Releases
---

We are excited to announce the immediate availability of Snowplow 64, Palila. This is a major release which adds a new [data modeling][github-data-modeling] stage to the Snowplow pipeline.

In this post, we will cover:

1. [Why model your Snowplow data?](/blog/2015/04/15/snowplow-r64-palila-released#data-modeling)
2. [Understanding how the data modeling takes place](/blog/2015/04/15/snowplow-r64-palila-released#mechanics)
3. [The basic Snowplow data model](/blog/2015/04/15/snowplow-r64-palila-released#basic-model)
4. [Implementing the data model](/blog/2015/04/15/snowplow-r64-palila-released#implementation)
5. [SQL Runner](/blog/2015/04/15/snowplow-r64-palila-released#sql-runner)
6. [Data modeling roadmap](/blog/2015/04/15/snowplow-r64-palila-released#roadmap)
7. [Documentation and help](/blog/2015/04/15/snowplow-r64-palila-released#help)

![palila][palila]

<!--more-->

<h2><a name="data-modeling">1. Why data modeling?</a></h2>

<<<<<<< HEAD
The data collection and enrichment process produces an event stream, a long list of packets of data where each packet represents a single event. While it is possible to do analysis directly on this event stream, it is common to:

1. join Snowplow data with other data sets (e.g. customer, marketing, CMS, financial data)
2. aggregate the event-level data into data tables that represent entities that are commonly queried e.g. visitors, sessions, applications, products, articles etc.

This serves three purposes:

1. **The same underlying business logic is applied to the data before different users query it**. When we join and aggregate the event level data, we are actually applying business logic to the underlying event-level data. How we aggregate the data will be a function of, for example:
  * How we identify users
  * How we define sessions
  * What dimensions we are interested in, for the key entities that matter to our business
2. **It makes querying more efficient**. The aggregate tables are typically simpler to compose queries against, and can be integrated directly into a business intelligence or pivot tool
3. **It makes querying faster** because the aggregate data sets are smaller than the event-level data, with `distkeys` and `sortkeys` optimized to support fast joins.

We call this process of aggregating *data modeling*. 

The data modeling process will be very familiar to existing Snowplow users who are also using [Looker][looker]. That is because Looker provides a powerful and flexible framework to enable users to devleop and iterate on their data models. Indeed, working with joint Snowplow-Looker customers has been very helpful in driving our thinking about how best to perform data modeling.

It should also be familiar to any Snowplow user has created a users or single customer view table, as this is an example of data modeling. We've found that the vast majority of our users have done this amongst those that are not using Looker.

In spite of Looker's great data-modeling functionality, there are a number of reasons we chose to make it possible to perform the data-modeling step as part of the core Snowplow pipeline:

1. Not all Snowplow users use Looker. Some use other Business Intelligence tools, some use a variety of other statistical and analytical tools directly on the event-level data. For these users, the ability to do data modeling will be enormously valuable.
2. Looker users with very large data volumes, or data pipelines that run frequently, will struggle to generate their aggregate tables (persistent derived tables in Looker terminology) fast enough if the process is managed via Looker. The reason is that Looker rebuilds these tables from scratch each time they need to be updated (i.e. with every data load). By moving the process of generating those tables outside of Looker, it is possible to update an existing set of tables based just on the new data that has landed with the last data pipeline run, which is significantly faster than reprocessing based on the entire data set. 
3. We found that Looker users often wanted to make their derived tables available to other applications and processes.

So this release offers something for Looker and non-Looker customers alike.

<h2><a name="basic-model">2. Understanding how the data modeling takes place</a></h2>

The data modeling takes place in the datawarehouse, once new data has been loaded by the StorageLoader. 

![snowplow-data-pipeline][data-modeling-image]

The process works as follows:

1. Instead of loading new data directly into the `atomic` schema, data is loaded into a new `snowplow_landing` schema
2. A set of SQL statements are run on the incremental data, that effectively update a set of aggregate tables in the `snowplow_pivots` schema
3. On completion of those SQL statements, the data is moved from the `snowplow_landing` schema to the `atomic` schema. (This is done directly via SQL.)

The process using our [SQL-Runner] [sql-runner] application, described [later](#sql-runner) in this blog post.

<h2><a name="basic-model">3. The basic Snowplow data model</a></h2>
=======
The data collection and enrichment process produces an event stream, a long list of packets of data where each packet represents a single event. While it is possible to do analysis on this event stream, it is common to aggregate event-level data into smaller data sets and join it with other data sets (e.g. customer data, product data, marketing data or financial data). These smaller data sets are easier to understand and faster to run queries against. It also ensures that all analysis done against these data sets uses the same business logic (i.e. how events are aggregated into, for example, sessions).

Examples of aggregated tables include:

- User-level tables
- Session-level tables
- Product or content-level tables ([catalog analytics][catalog-analytics])

We call this process of aggregating *data modeling*. At the end of the data modeling exercise, a clean set of tables is available, which makes it easier to perform analysis on the data. Easier because the data volumes are smaller, and because the basic tasks of defining users, sessions and other core dimensions and metrics have already been performed, so the analyst has a solid foundation for diving directly into the more interesting, valuable parts of the data analysis.

<h2><a name="basic-model">2. The basic Snowplow data model</a></h2>
>>>>>>> 665f54386479c981a2963ad1d426a262527f9a9c

This release comes with a [basic data model][github-data-modeling], a set of SQL queries which aggregate event-level data in Redshift into:

- A sessions table (using client-side sessionization)
- A visitors table (using cookies for identity stitching)
- A page views table

<<<<<<< HEAD
This basic model is meant as an exemplar: it can be useful place for new Snowplow users to start modeling their data. In general, however, we expect data models to be pretty company-specific, reflecting the fact that:

1. Different companies record different events across different channels
2. Different entities over time
3. Different companeis have different business questions they want to ask of the data

Palila also comes with an updated [Looker data model][github-looker], which is based on the same set of SQL queries and can be implemented and modified from the Looker UI. 

Both models make minimal assumptions about the internal business logic. What tables are produced and what fields available in each one of them, varies widely between companies in different sectors, and surprisingly even within the same vertical. 

<h2><a name="implementation">4. Implementing the Redshift data model</a></h2>
=======
Palila also comes with an updated [Looker data model][github-looker], which is based on the same set of SQL queries and can be implemented and modified from the Looker UI. Looker users with large data volumes, or who use multiple BI tools, might benefit from moving the data modeling step (i.e. the SQL component in LookML) from Looker to Redshift. Data modeling in Redshift makes it possible to compute the derived tables more efficiently (the tables don't have to be regenerated from scratch each time new events are added), and different applications have access the same set of tables.

Both models make minimal assumptions about the internal business logic. What tables are produced and what fields available in each one of them, varies widely between companies in different sectors, and surprisingly even within the same vertical. We therefore expect our users to customize these data models to include business-specific logic.

<h2><a name="implementation">3. Implementing the Redshift data model</a></h2>
>>>>>>> 665f54386479c981a2963ad1d426a262527f9a9c

The basic Redshift data model comes with 2 different sets of [SQL queries][github-data-modeling-sql]:

- In [**full** mode][github-data-modeling-sql-full], the derived tables are recalculated from scratch (i.e. using all events) each time the pipeline runs
- In [**incremental** mode][github-data-modeling-sql-incremental], the tables are updated using only the most recent events


These 2 modes are usually used at different stages in the implementation process. First, the basic model is set up in Redshift in full mode. Although it is less efficient to recompute the tables from scratch each time, it is easier to iterate the business logic and underlying SQL in the data modeling process when you recompute the data from scratch. We find that users typically iterate on the models very frequently to start off with, but that this frequency decreass markedly over time.

At the point where the models become relatively stable, it then becomes sensible to migrate to the incremental model. 

This whole process is described in more detail the [setup guide][setup-guide] and in our [analytics cookbook][cookbook-modeling].

<h2><a name="sql-runner">5. SQL Runner</a></h2>

SQL-Runner is an open source app, written in Go, that makes it easy to execute SQL statements programmatically as part of the Snowplow data pipeline.

To use SQL-Runner, you assemble a playbook i.e. a YAML file that lists the different `.sql` files to be run and the database they are to be run against. It is possible to specify which sequence the files should be run, and to run files in parallel.

The Palila release includes both the underlying SQL and the associated playbooks for running them. For more information on SQL-Runner view [the repo][sql-runner]. 

<h2><a name="roadmap">6. Data modeling roadmap</a></h2>

The data modeling step in Snowplow 64 is still very new and experimental — we’re excited to see how it plays out and look forward to the community’s feedback.

There are a number of ways that we can improve the data-modeling functionality - these are just some of our ideas, and we've love to bounce them off our users:

1. Move the data modeling out of SQL (and Redshift in particular) into EMR (for batch-based processing) or Spark streaming (for users on the real-time pipeline). This would take a lot of load of the database, and mean that we could express the data modeling in a better suited language. We've been impressed by users who've shown us how they've performed this process in tools including [Scalding][scalding] and [Cascalog][cascalog].
2. Building on the above, we're very interested to figure out what the best way is of expressing the data modeling process. Potentially we could develop a DSL for this. Ideally, we would want to make it possible to express once, and then implement in a range of environments (i.e. stream processing, batch-processing and in-database).

In the shorter term we also plan to extend our data-modeling documentation to cover common design patterns, including:

1. Cross platform identity stitching for logged-in users
2. Custom sessionization logic, including for users tracked from mobile apps and marrying server and client-side session data
3. Integrating third party user identification services

Keep checking the blog and [Analytics Cookbook][cookbook] for updates!

<h2><a name="help">7. Documentation and help</a></h2>

For more details on this release, please check out the [R64 Palila Release Notes][r64-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[palila]: /assets/img/blog/2015/04/palila.jpg

[github-looker]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/looker/

[github-data-modeling]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/
[github-data-modeling-playbooks]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/playbooks/

[github-data-modeling-sql]:	https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/sql
[github-data-modeling-sql-full]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/sql/full
[github-data-modeling-sql-incremental]:	https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/sql/incremental

[github-sql-runner]: https://github.com/snowplow/sql-runner

[setup-guide]: https://github.com/snowplow/snowplow/wiki/Setting-up-Snowplow

[catalog-analytics]: http://snowplowanalytics.com/analytics/catalog-analytics/overview.html
[cookbook-modeling]: http://snowplowanalytics.com/analytics/event-dictionaries-and-data-models/data-modeling.html

[r64-release]: https://github.com/snowplow/snowplow/releases/tag/r64-xxx-xxx
[issues]: https://github.com/snowplow/snowplow/issues
<<<<<<< HEAD
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-
[looker]: http://www.looker.com/
[data-modeling-image]: https://d3i6fms1cm1j0i.cloudfront.net/github-wiki/images/snowplow-architecture-5-data-modeling.png
[sql-runner]: https://github.com/snowplow/sql-runner
[cookbook]: /analytics/index.html
=======
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
>>>>>>> 665f54386479c981a2963ad1d426a262527f9a9c
