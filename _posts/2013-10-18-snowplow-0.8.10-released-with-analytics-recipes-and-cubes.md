---
layout: post
title: Snowplow 0.8.10 released with analytics cubes and recipes 'baked in'
title-short: Snowplow 0.8.10
tags: [snowplow, analysis, pivot, bi, sql, olap]
author: Yali
category: Releases
---

We are pleased to announce the release of Snowplow 0.8.10. In this release, we have taken many of the SQL recipes we have covered in the [Analysts Cookbook] [cookbook] and 'baked them' into Snowplow by providing them as views that can be added directly to your Snowplow data in Amazon Redshift or PostgreSQL.

1. [Background on this release](/blog/2013/10/18/snowplow-0.8.10-released-with-analytics-recipes-and-cubes/#background)
2. [Reorganizing the Snowplow database](/blog/2013/10/18/snowplow-0.8.10-released-with-analytics-recipes-and-cubes/#schema)
3. [Seeing a recipe in action: charting the number of uniques over time](/blog/2013/10/18/snowplow-0.8.10-released-with-analytics-recipes-and-cubes/#recipe-use)
4. [Seeing a cube in action: interrogating the visitors cube in Tableau](/blog/2013/10/18/snowplow-0.8.10-released-with-analytics-recipes-and-cubes/#visitor-cube)
5. [Installing this release](/blog/2013/10/18/snowplow-0.8.10-released-with-analytics-recipes-and-cubes/#setup)
6. [Next steps: where to go from here](/blog/2013/10/18/snowplow-0.8.10-released-with-analytics-recipes-and-cubes/#next-steps)

<div class="html">
<a name="background"><h2>1. Background on this release</h2></a>
</div>

One of the things we've learnt from many new Snowplow users, is that they want to get up and running analyzing Snowplow data as fast as possible: often by putting a familiar business intelligence tool directly on top of Snowplow data, to start exploring and visualizing that data.

For those users, a frustration with Snowplow is that each analysis typically starts with having to write a SQL query on the Snowplow data, to transform it into a format suitable for analysing in a BI / OLAP tool. Whilst we believe it is a strength that Snowplow gives you the flexibility to design and structure a wide range of different analyses, we recognise that for new users in particular, it would be nicer if they could dive straight into the data in their BI tool of choice.

This release aims to bridge that gap: we are providing a range of recipes and cubes as SQL views into the atomic Snowplow data; all of these are suitable for being loaded into BI tools like Excel, ChartIO and Tableau, directly.

<!--more-->

<div class="html">
<a name="schema"><h2>2. Reorganizing the Snowplow database</h2></a>
</div>

With this release we have reorganized Snowplow data:

1. The `events` table is now located in the `atomic` schema. (This is new for Redshift users, not for Postgres users.)
2. There are three new schemas that contain "cubes" - i.e. views of the Snowplow data that can be consumed directly in a pivot / OLAP / BI tool e.g. PowerPivot or Tableau. These are `cubes_pages`, `cubes_visits` and `cubes_transactions`.
3. There are three new schemas that contain "recipes" - views of the Snowplow data that can be visualized directly in any graphics package. These are `recipes_basic`, `recipes_customer` and `recipes_catalog`

<div class="html">
<a name="recipe-use"><h2>3. Seeing a recipe in action: charting the number of uniques over time</h2></a>
</div>

Let's start by showing how easy the views make it to start plotting Snowplow data in ChartIO. Log into ChartIO and create a new connection to your database, just as before, but this time set the **Schema name** field to be 'recipes_basic' rather than 'atomic'. (This is necessary, because ChartIO requires a different connection for each schema on your database, rather than a single connection per database.)

<div class="html">
![chartio-setup] [chartio-connection]
</div>

Now go back into ChartIO and select to create a new graph. Select your new data source: a long list of different "recipes" should be displayed. Select the **Uniques And Visits By Day** from the list - this will reveal the dimensions and metrics returned in that view:

![chartio-setup-2] [chartio-select-view]

Now you can simply drag the relevant metrics and dimensions over from the list into the design pane. Let's simply plot uniques by date: drag the **Date** dimension to the dimensions pane, and the **Uniques** measure over to the **Measures** pane:

![chartio-setup-select-dimensions] [chartio-setup-select-dimensions]

Now click **Chart Query** to draw the graph. Simple visualization of Snowplow data with no SQL required!

![chartio-setup-3] [chartio-final-graph]

<div class="html">
<a name="visitor-cube"><h2>4. Seeing a cube in action: interrogating the visitors cube in Tableau</h2></a>
</div>

We've included a number of "cube views" in the new release. These can be opened directly into your pivoting tool of choice.

For this example, we're going to open the `cubes_visits.referer_entries_and_exits` view directly into Tableau.

Open up Tableau, select to create a new database connection, enter your database details. Select the `referer_entries_and_exits` view to connect to.

![talbeau-setup-1][tableau-1]

Note: if you are connecting to the views in Redshift, you will need to add the new schemas to your `search_path` before they are visible in Tableau. You can, however, access them directly by selecting **Custom SQL** and entering `SELECT * FROM cubes_visits.referer_entries_and_exits`.

Tableau will ask whether you want to import all the data, or connect live. If you have a lot of data, we recommend connecting live.

![tableau-setup-2][tableau-2]

You can now drag and drop any of the dimensions and any of the metrics listed. For example, we can drag in `entry_page_path`, `visit_start_ts` and `visit_duration` to see how average visit lengths have changed per landing page over time:

![tableau-setup-3][tableau-3]

<div class="html">
<a name="setup"><h2>5. Installing this release</h2></a>
</div>

### 5.1 Redshift users

If you're using Redshift, you will need to migrate your Snowplow events table from the `public` schema to the `atomic` schema. This can be done using [this migration script] [redshift-migration].

You will then you need to update your [StorageLoader config file] [storageloader-config] to ensure that from now on, all new data is loaded into the `atomic.events` table, rather than the `public.events` table. You do this by updating the file so that the `:table:` key is set to 'atomic.events' rather than just 'events':

{% highlight yaml %}
:targets:
  - :name:     "Snowplow PostgreSQL"
    :type:     postgres
    :host:     ec2-54-221-8-121.compute-1.amazonaws.com
    :database: snplow2
    :port:     5432
    :table:    atomic.events
{% endhighlight %}

Now you need to create the new schemas for the different views, and define each view. The following six scripts need to be run:

1. [recipes-basic.sql] [recipes-basic]
2. [recipes-catalog.sql] [recipes-catalog]
3. [recipes-customers] [recipes-customers]
4. [cube-visits.sql] [cube-visits]
5. [cube-transactions.sql] [cube-transactions]
6. [cube-pages.sql] [cube-pages]

These can be run directly using the `psql` command line tool, as described [in the setup guide][setup-views].

Finally, you will want to add the new schemas to your `search_path`. This is necessary for the views in these schemas to show up in tools like Tableau and SQL Workbench. An explanation of how to update the search path is given [here, in the setup guide] [search-path-setup].

### 5.2 PostgreSQL users

If you are using PostgreSQL, your events data should already be in the `atomic.events` schema.

You need to do is updated your events table definition, as per [this migration script] [postgres-migration].

Afterwards, you can create the new schemas and views, by running the following scripts:

1. [recipes-basic.sql] [recipes-basic-pg]
2. [recipes-catalog.sql] [recipes-catalog-pg]
3. [recipes-customers] [recipes-customers-pg]
4. [cube-visits.sql] [cube-visits-pg]
5. [cube-transactions.sql] [cube-transactions-pg]
6. [cube-pages.sql] [cube-pages-pg]

These can be run directly using the `psql` command line tool, as described [in the setup guide][setup-views].

<div class="html">
<a name="next-steps"><h2>6. Next steps: where to go from here</h2></a>
</div>

We'll be covering how to use the recipes and cubes in more detail in forthcoming blog posts, and of course adding new recipes to the [Analysts Cookbook] [cookbook]. In the meantime, we recommend that curious users start experimenting with the different views, and refer to the underlying SQL to understand how they're created, and indeed how they can tweak those statements to deliver the data formatted as they need.

[cookbook]: http://snowplowanalytics.com/analytics/index.html
[recipes-basic]: https://github.com/snowplow/snowplow/blob/feature/recipe-views/5-analytics/postgresql/recipes/recipes-basic.sql
[recipes-customer]: https://github.com/snowplow/snowplow/blob/feature/recipe-views/5-analytics/postgresql/recipes/recipes-customers.sql
[recipes-catalog]: https://github.com/snowplow/snowplow/blob/feature/recipe-views/5-analytics/postgresql/recipes/recipes-catalog.sql

[basic-recipes]: /analytics/basic-recipes.html
[customer-recipes]: http://snowplowanalytics.com/analytics/customer-analytics/overview.html
[catalog-recipes]: http://snowplowanalytics.com/analytics/catalog-analytics/overview.html
[catalog-analytics]: http://snowplowanalytics.com/analytics/catalog-analytics/overview.html

[cube-visits]: https://github.com/snowplow/snowplow/blob/feature/recipe-views/5-analytics/postgresql/cubes/cube-visits.sql
[cube-transactions]: https://github.com/snowplow/snowplow/blob/feature/recipe-views/5-analytics/postgresql/cubes/cube-transactions.sql
[cube-pages]: https://github.com/snowplow/snowplow/blob/feature/recipe-views/5-analytics/postgresql/cubes/cube-pages.sql

[setup-views]: https://github.com/snowplow/snowplow/wiki/Setting-up-the-prebuilt-views-in-Redshift-and-PostgreSQL
[chartio-connection]: /assets/img/blog/2013/10/chartio-connection.png
[chartio-select-view]: /assets/img/blog/2013/10/chartio-2.png
[chartio-setup-select-dimensions]: /assets/img/blog/2013/10/chartio-select-dimensions.png
[chartio-final-graph]: /assets/img/blog/2013/10/chartio-final-graph.png

[tableau-1]: /assets/img/blog/2013/10/tableau-connection.JPG
[tableau-2]: /assets/img/blog/2013/10/tableau-1.JPG
[tableau-3]: /assets/img/blog/2013/10/tableau-visualization.JPG

[redshift-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/migrate_0.2.1_to_0.2.2.sql
[postgres-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/postgres-storage/sql/migrate_0.1.0_to_0.1.1.sql

[storageloader-config]: https://github.com/snowplow/snowplow/blob/master/4-storage/storage-loader/config/redshift.yml.sample

[recipes-basic]: https://github.com/snowplow/snowplow/blob/master/5-analytics/redshift-analytics/recipes/recipes-basic.sql
[recipes-catalog]: https://github.com/snowplow/snowplow/blob/master/5-analytics/redshift-analytics/recipes/recipes-catalog.sql
[recipes-customers]: https://github.com/snowplow/snowplow/blob/master/5-analytics/redshift-analytics/recipes/recipes-customers.sql

[cube-pages]: https://github.com/snowplow/snowplow/blob/master/5-analytics/redshift-analytics/cubes/cube-pages.sql
[cube-transactions]: https://github.com/snowplow/snowplow/blob/master/5-analytics/redshift-analytics/cubes/cube-transactions.sql
[cube-visits]: https://github.com/snowplow/snowplow/blob/master/5-analytics/redshift-analytics/cubes/cube-visits.sql

[recipes-basic-pg]: https://github.com/snowplow/snowplow/blob/master/5-analytics/postgres-analytics/recipes/recipes-basic.sql
[recipes-catalog-pg]: https://github.com/snowplow/snowplow/blob/master/5-analytics/postgres-analytics/recipes/recipes-catalog.sql
[recipes-customers-pg]: https://github.com/snowplow/snowplow/blob/master/5-analytics/postgres-analytics/recipes/recipes-customers.sql

[cube-pages-pg]: https://github.com/snowplow/snowplow/blob/master/5-analytics/postgres-analytics/cubes/cube-pages.sql
[cube-transactions-pg]: https://github.com/snowplow/snowplow/blob/master/5-analytics/postgres-analytics/cubes/cube-transactions.sql
[cube-visits-pg]: https://github.com/snowplow/snowplow/blob/master/5-analytics/postgres-analytics/cubes/cube-visits.sql
[search-path-setup]: https://github.com/snowplow/snowplow/wiki/setting-up-redshift#wiki-search_path
