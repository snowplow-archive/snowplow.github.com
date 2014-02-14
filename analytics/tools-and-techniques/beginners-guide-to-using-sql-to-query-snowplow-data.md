---
layout: page
group: analytics
sub_group: tools-and-techniques
title: Get started using SQL to analyze Snowplow data
shortened-link: Get started with SQL
weight: 2
---

<h1><a name="top">The complete beginners guide to using SQL to querying Snowplow data</a></h1>

The purpose of this guide is to get the user unfamiliar with SQL up and running  and querying Snowplow data in Redshift or PostgreSQL as quickly as possible, learning by example. 

1. [Before you get started: install a SQL GUI] (#gui)
2. [An overview of the Snowplow table and views] (#overview)
3. [The basic structure of a SQL query] (#basic-structure)  
  a. [The SELECT clause] (#select)  
  b. [The FROM clause] (#from)  
  c. [The WHERE clause] (#where)  
  d. [The LIMIT clause] (#limit)  
4. [Aggregating data] (#aggregate)  
  a. [COUNT DISTINCT examples] (#count-distinct)  
  b. [The GROUP BY clause] (#group-by)   
  c. [A handy shortcut] (#shortcut)    
  d. [Grouping by different date values] (#dates)
5. [Combining simple queries] (#combining-queries)  
  a. [Using the output of one query as the input for another query] (#output-input)  
  b. [Joining result sets by common keys] (#joins)  
6. [Windowing functions] (#window)
7. [Other useful functions and clauses] (#other)


<h2><a name="gui">1. Before you get started: install a SQL GUI</a></h2>

It is possible to execute all your SQL statements from the command line, via [psql] [psql].

If you are learning SQL, however, we strongly recommend you download a GUI. (We use and recommend [Navicat] [navicat].) This offers a number of advantages, which are particularly useful for beginners:

* Ability to open and inspect tables and views directly
* Auto completion when entering queries. (Reduces risks of spelling mistakes, which can often break queries.)
* Syntax highlighting. (Makes debugging queries much easier)
* Ability to run and keep tabs on multiple queries in parallel
* Ability to easily export data for import into other analytics programs

Navicat is available across platforms and can be downloaded from [here] [navicat]. Once you have installed it locally,  instructions on how to setup a connection to your Snowplow database can be found [here] [redshift-setup] for Redshift, and [here] [postgres-setup] for PostgreSQL.

The rest of this tutorial assumes you are running Navicat. However, it should still be straightforward to follow using an alternative SQL front-end of your choosing.

Back to [top] (#top).

<h2><a name="overview">2. An overview of the Snowplow tables and views</a></h2>

Before we dive in and start querying Snowplow data, let's take a look at it in Navicat. Open up Navicat, then double click on your connection to the Snowplow database, and then double click on the Snowplow database itself:

![snowplow-data-in-navicat][img-1]

In our case we're looking at the database named `snplow2`. You'll notice below it there are a number of different schema:

* The `atomic` schema. This is where granular Snowplow data is stored, in the `atomic.events` table
* Three schemas called `cubes_ecomm`, `cubes_pages` and `cubes_visits`. These are "views" on the data in `atomic.events` which have been optimized for opening in an OLAP tool e.g. Microsoft PowerPivot or Tableau. 
* Three schemas called `recipes_basic`, `recipes_catalog` and `recipes_customers`. These contain "views" on the data for common analyses.
* We also have a `public` schema, which is empty, and a `looker_scratch` schema, which is used by [Looker] [looker], a BI tool we use extensively to mine Snowplow data, to persist temporary tables used for analysis.

For this tutorial, we're going to focus on the `atomic.events` table. Double click on the `atomic` schema, and then double click on the **tables** subdirectory and then on `events` table specifically. The events table should open up:

![snowplow-data-in-navicat][img-2]

You should now have a view of the first 1000 lines of Snowplow data in your database. You should be able to scroll right to see the full list of columns available. (Note that some of these will be sparsely populated.) You should also be able to scroll down to see more records.

Back to [top](#top).

<h2><a name="basic-structure">3. The basic structure of a SQL query</a></h2>

Let's write our first SQL query! Click on the **Query** button in the Navicat toolbar and then select **New Query**. In the query editor, type in the following query,

{% highlight psql %}
SELECT 
	collector_tstamp,
	domain_userid,
	domain_sessionidx,
	event,
	page_urlpath
FROM atomic.events
WHERE 
	collector_tstamp > '2013-11-17'
ORDER BY collector_tstamp
LIMIT 100;
{% endhighlight %}

Now press on the **Run** button in the toolbar. The results of the query should be displayed beneathe the query itself:

![snowplow-data-in-navicat][img-3]

Note that the results is another table of data.

There's a fair bit in this query, so let's unpack it, a few lines at the time:

Back to [top](#top).

<h3><a name="select">3a. The SELECT clause</a></h3>

The query starts with the `SELECT` statement, which is followed by a list of fields in the Snowplow events table:

{% highlight psql %}
SELECT 
	collector_tstamp,
	domain_userid,
	domain_sessionidx,
	event,
	page_urlpath
...
{% endhighlight %}

The `SELECT` statement simply determines which of the fields should be included in the query. In our case, we've picked five fields. We could have picked more of less.

Note that the list of fields is comma separated. If you forget a single comma - the query will fail. So be super careful to include one between each field, but not one between the last field and the `FROM` keyword.

If we want to include *all* the fields in our query, then rather than type them all out, we can simply use a `*` to indicate we want all of them i.e.:

{% highlight psql %}
SELECT 
	*
FROM atomic.events
WHERE 
	collector_tstamp > '2013-11-17'
ORDER BY collector_tstamp
LIMIT 100;
{% endhighlight %}

When thinking about which fields to include in your query, it may be helpful to reference the [Snowplow Canonical event model] [canonical-event-model].

Back to [top](#top).

<h3><a name="from">3b. The FROM clause</a></h3>

{% highlight psql %}
FROM atomic.events
{% endhighlight %}

The `FROM` statement lets Redshift / PostgreSQL know *which* table or view we wish to query. For example, rather than querying the `atomic.events` table, we could query the `cubes_visits.basic` view instead e.g.

{% highlight psql %}
SELECT 
	*
FROM cubes_visits.basic
WHERE visit_start_ts > '2013-11-17'
LIMIT 100;
{% endhighlight %}

![snowplow-data-in-navicat][img-4]

Back to [top](#top).

<h3><a name="where">3c. The WHERE clause</a></h3>

{% highlight psql %}
WHERE 
	collector_tstamp > '2013-11-17'
{% endhighlight %}

The `WHERE` statement acts as a filter: only lines of data in our table / view which meet the conditions specified in the `WHERE` clause are included in the query. Any other rows of data are ignored.

The `WHERE` clause is particularly important when analyzing Snowplow data, which is typically a very large data set. To make analyses more manageable, we often limit the scope to certain periods of time, and use the `WHERE` clause to power that filtering process. We can, for example, specify multiple conditions in the `WHERE` clause e.g.:

{% highlight psql %}
SELECT *
FROM atomic.events
WHERE
	collector_tstamp > '2013-11-01'
	AND collector_tstamp < '2013-11-08'
{% endhighlight %}

In the above case, the `WHERE` clause ensures that only records in the week between November 1st and November 7th (inclusive) are included in our query results.

We can also apply the `WHERE` clause to *any* field in our query. For example, as well as filtering, on date, we can also filter data rows by geographic location:

{% highlight psql %}
SELECT *
FROM atomic.events
WHERE
	collector_tstamp > '2013-11-01'
	AND collector_tstamp < '2013-11-08'
	AND geo_country = 'US'
{% endhighlight %}

In the above example, only data rows for users in the US for the first week in November are returned.

Back to [top](#top).

<h3><a name="limit">3c. The LIMIT clause</a></h3>

The limit cause limits the size of the result set returned. In our case, we instructed Redshift to only return 100 lines of data to us in our result set.

The limit can be set to any positive number. Alternatively, the `LIMIT` clause can be omitted alltogether, in which case the complete result set is returned.

Back to [top](#top).

<h2><a name="aggregate">4. Aggregating data</a></h2>

The above statements should be enough to enable you to select just those rows of data that you are interested in looking at (via the `WHERE` statement) and just those fields you are interested in (via the `SELECT` statement).

Often, however, you wont want to access the actual event-level records themselves. Instead, you'll want to perform calculations across the results in multiple records and just returning the results of those calculations.

Let's try performing a simple calculation. Enter the following query into Navicat, and click on the **Run** button to execute it.

{% highlight psql %}
SELECT
	COUNT(*)
FROM atomic.events
{% endhighlight %}

The above query looks like the previous queries we entered. However, instead of specifying a list of fields under the `SELECT` statement, we've specified a function `COUNT`. When you execute the query, only a single row with a single value should be returned:

![snowplow-data-in-navicat][img-5]

The number given is the number of rows in the table, in total.

There are a number of aggregation functions that are worth being familiar with:

| **Function** | **Description**                                                                |
|:-------------|:-------------------------------------------------------------------------------|
| `COUNT()`    | Counts the number of records / records                                         |
| `COUNT((DISTINCT ))`| Counts the number of distinct values of a particular field. Useful for calculating e.g. number of uniques or sessions. |
| `SUM()`      | Sums the values of entries in a particular field. Useful for calculating e.g. total transaction values. |
| `AVG()`      | Returns the average value in a field |
| `MAX()`      | Returns the maximum value in a field |
| `MIN()`      | Returns the minimum value in a field |

Each of these can be applied over the values of a particular field in multiple records, to give a result.

Back to [top](#top).

<h3><a name="count-distinct">4a. COUNT DISTINCT examples</a></h3>

In the previous example, we counted the number of records in the `atomic.events` table by executing `SELECT COUNT(*) FROM atomic.events`.

If instead, we want to know how many unique visitors came to our website, we execute the following query:

{% highlight psql %}
SELECT
	COUNT(DISTINCT(domain_userid)) AS "Uniques"
FROM atomic.events
{% endhighlight %}

Note that each user is assigned a first party cookie ID, so by counting the number of different cookie IDs, we can calculate the number of uniques to our website.

Also note that we have added a `AS "Uniques"` to the end of our `SELECT` statement. This instructs Redshift / PostgreSQL to name the output of that field "Uniques". This is nice aesthetically - it doesn't change the actual substance of the query. However, it can be useful when [chaining multiple SQL statements together] (#combining-queries), as a way to refer back to specific aggregations performed by earlier steps.

What if we want to count the number of visits to our website? It's possible that one or more of our visitors has visited the site on more than one occasion. On each occasion, he / she will have the same cookie ID (i.e. value for `domain_userid`), but a different `domain_sessionidx` value. (This will be 1 for the user's first visit, 2 for his / her second visit etc.) To calculate this, then we need to count the number of distinct `domain_userid` - `domain_sessionidx` combinations. We can concatenate the two together using the PosgreSQL [concatenate function] [concatenate], which is represented by the `||` symbol:

{% highlight psql %}
SELECT
	COUNT(DISTINCT( domain_userid || '-' || domain_sessionidx )) AS "Visits"
FROM atomic.events
{% endhighlight %}

We can also choose to return both the number of uniques and number of visits to our website at the same time:

{% highlight psql %}
SELECT
	COUNT(DISTINCT(domain_userid)) AS "Uniques",
	COUNT(DISTINCT( domain_userid || '-' || domain_sessionidx )) AS "Visits"
FROM atomic.events
{% endhighlight %}

![snowplow-data-in-navicat][img-6]

Back to [top](#top).

<h3><a name="group-by">4b. The GROUP BY clause</a></h3>

Up until now, we've been running each aggregate function against our entire data table, and returning a single value.

Typically, however, we want to segment our data (e.g. by user or by day or by geography or by browser), calculate our aggregate metric for each group and then compare the results for those different groups against one another.

This is achieved using the `GROUP BY` clause. To understand how it works, it's best to use an example:

{% highlight psql %}
SELECT
	geo_country,
	COUNT(DISTINCT(domain_userid)) AS "Uniques"
FROM atomic.events
GROUP BY geo_country
{% endhighlight %}

![snowplow-data-in-navicat][img-7]

The above query returns the number of uniques for each country. You'll see that we get back one line of data for each distinct value of `geo_country` that Redshift finds in the `geo_country` field.

Alternatively, we could `GROUP BY` users, and calculate the number of events for each user:

{% highlight psql %}
SELECT
	domain_userid,
	COUNT(*) AS "Number of events"
FROM atomic.events
GROUP BY domain_userid
{% endhighlight %}

To make our results more interesting, we might choose to order the output by the number of events, with the largest values first. To do so, we would add an `ORDER BY` clause to the end of our statement:

{% highlight psql %}
SELECT
	domain_userid,
	COUNT(*) AS "Number of events"
FROM atomic.events
GROUP BY domain_userid
ORDER BY "Number of events" DESC
{% endhighlight %}

We can group by *combinations* of fields, rather than just individual fields. For example, we can calculate the number of events per visit, rather than per visitor, by grouping on a combination of `domain_userid` AND `domain_sessionidx`:

{% highlight psql %}
SELECT
	domain_userid,
	domain_sessionidx,
	COUNT(*) AS "Number of events"
FROM atomic.events
GROUP BY domain_userid, domain_sessionidx
ORDER BY "Number of events" DESC
{% endhighlight %}

Note that this returns a line of data for every `domain_userid` / `domain_sessionidx` combination.

Also note that any field that is **not** part of the GROUP BY clause needs to include an aggregate function. (I.e. either we're using a field to to determine what we are grouping over, or we are including a field because it is being aggregated over itself. We can't include a field that is not being aggregated over, or used to specify over what to aggregate. If we try to do this, we'll get an error when we try and execute the query.)

Back to [top](#top).

<h3><a name="shortcut">4c. A handy shortcut: referring to fields by their position in GROUP BY and ORDER BY clauses</a></h3>

Rather than give the actual field names in the `GROUP BY` or `ORDER BY` clauses, we can instead refer to them by their position in the result set e.g. the following is equivalent to the previous query:

{% highlight psql %}
SELECT
	domain_userid,
	domain_sessionidx,
	COUNT(*) AS "Number of events"
FROM atomic.events
GROUP BY 1,2
ORDER BY 3 DESC
{% endhighlight %}

This is a big time saver as queries get bigger... 

Back to [top](#top).

<h3><a name="dates">4d. Grouping by different date values</a></h3>

Very often, we want to `GROUP BY` time intervals e.g. days, weeks, or months.

This can be done using a combination of the `DATE_TRUNC()` function, which rounds a timestamp values to e.g. hours / days / weeks / months / years etc, and `GROUP BY` functionality. For example, to count the number of uniques per day, we can run:

{% highlight psql %}
SELECT
	DATE_TRUNC('day', collector_tstamp) AS "Date",
	COUNT(DISTINCT( domain_userid )) AS "Uniques"
FROM atomic.events
GROUP BY 1
ORDER BY 1 ASC
{% endhighlight %}

We can, alternatively, group the results by week:

{% highlight psql %}
SELECT
	DATE_TRUNC('week', collector_tstamp) AS "Date",
	COUNT(DISTINCT( domain_userid )) AS "Uniques"
FROM atomic.events
GROUP BY 1
ORDER BY 1 ASC
{% endhighlight %}

Or month: 

{% highlight psql %}
SELECT
	DATE_TRUNC('month', collector_tstamp) AS "Date",
	COUNT(DISTINCT( domain_userid )) AS "Uniques"
FROM atomic.events
GROUP BY 1
ORDER BY 1 ASC
{% endhighlight %}

Back to [top](#top).

<h2><a name="combining-queries">5. Combining simple queries to perform more complicated analysis</a></h2>

As should be clear from the above, the SQL querying syntax is reasonably succinct: there is not a lot to it. (There are many more advanced functions that I have not been able to cover in this short intro, but most of it is there already.)

Performing more complicated analysis generally involves stringing together different queries. There are a number of ways this can be done:

<h3><a name="output-input">5a. Using the output of one query as the input for another query</a></h3>

We can chain queries together, so that one operates on the output of the next.

To take an example, let's say that we want to plot the distribution of visits by the number of events per visit. In this case, it is easy to see how we would calculate the number of events per visit:

{% highlight psql %}
SELECT
	domain_userid,
	domain_sessionidx,
	COUNT(*) AS "Number of events"
FROM atomic.events
GROUP BY 1,2
{% endhighlight %}

As a second step, we'd take the output of the query above, and group visits by the number of events in them, to get our frequency table:

{% highlight psql %}
SELECT
"Number of events" AS "Number of events per visit",
COUNT(*) As "Frequency"
FROM (
	SELECT
		domain_userid,
		domain_sessionidx,
		COUNT(*) AS "Number of events"
	FROM atomic.events
	GROUP BY 1,2 ) AS t
GROUP BY 1
ORDER BY 2 DESC
{% endhighlight %}

Note that in the above query, the `FROM` clause specifies the previous query rather than specifying a specific table or view.

This notation is fine for relatively simple queries, but when we start creating very long chains of queries, can be hard to read and debug. As a result, we generally recommend creating views for the interim tables, and saving these to their own schema e.g. a `staging` schema. The following is equivalent to the above, but significantly easier to follow:

{% highlight psql %}
CREATE VIEW staging.num_events_by_session AS
SELECT
	domain_userid,
	domain_sessionidx,
	COUNT(*) AS "Number of events"
FROM atomic.events
GROUP BY 1,2;
{% endhighlight %}

{% highlight psql %}
SELECT
"Number of events" AS "Number of events per visit",
COUNT(*) As "Frequency"
FROM staging.num_events_by_session
GROUP BY 1
ORDER BY 2 DESC;
{% endhighlight %}

Note that we have "saved" the results of the first query as a view, and then run our second query on that view. In Redshift / PostgreSQL, views are ways of saving queries so they can be operated on by other queries. Unlike tables, the results of the view are not persisted in actual tables - every time you call the view, the query that was used to create it is run from scratch.

Also note that the above is two queries: each ends with a semicolon. (So Redshift / PostgreSQL knows they are two queries, rather than one. This is important, because the second query is only valid once the 1st has been executed - otherwise there is no `staging.num_events_by_session` to query.) 

Back to [top](#top).

<h3><a name="joins">5b. Joining result sets by common keys</a></h3>

Sometimes we will want to join two result sets into a single table, merging records in one table with those in another based on a common key.

This is performed by the `JOIN` operator. Let us demonstrate how this works with an example: let's say that we are interested in aggregating our data so that we have one line per visit, and for each visit, we want to know from which website the visitor was refered to our website from. This data is stored in the `refr_` fields i.e.:

* `refr_medium`
* `refr_source`
* `refr_term`
* `refr_urlhost`
* `refr_urlpath`

However, we want the value of these fields for the *first* record in the visit i.e. the record of the landing page view. For each visit, this should be the line of data where the `dvce_tstamp` is the lowest, because it is the *first* event of the visit.

To fetch the referer data by visit, then, we first fetch data to identify each of our visits, and for each of those visits, fetch the minimum `dvce_tstamp`:

{% highlight psql %}
CREATE VIEW staging.sessions_with_first_touch_time AS 
SELECT
	domain_userid,
	domain_sessionidx,
	MIN(collector_tstamp) AS "first_touch_time_collector"
FROM atomic.events
GROUP BY 1,2;
{% endhighlight %}

Next, we use the values in that table to go back to the atomic.events table and pull out the `refr` field details *only* for records that match the session and the `first_touch_time_collector`

{% highlight psql %}
SELECT
	a.domain_userid,
	a.domain_sessionidx,
	first_touch_time_collector,
	refr_medium,
	refr_source,
	refr_term,
	refr_urlhost,
	refr_urlpath
FROM 
	staging.sessions_with_first_touch_time AS a LEFT JOIN atomic.events AS b
ON a.domain_userid = b.domain_userid 
AND a.domain_sessionidx = b.domain_sessionidx 
AND a.first_touch_time_collector = b.dvce_tstamp
{% endhighlight %}

Notes:

* We have performed a `LEFT JOIN`. This means that we will get at least one line of data for *every* line of data in the left table in our join, the `staging.sessions_with_first_touch_time` table, even if no corresponding records are found in the right (`atomic.events`) table. (We get more than one line of data for each record in the first table if there is more than one record in the second table that matches it.)
* If we had performed an `INNER JOIN` (by ommitting the `LEFT` keyword), we would have dropped any rows where a match was not made. 
* We have aliased the tables / views themselves in the above query, so that `staging.sessions_with_first_touch_time` is referred to as `a` and `atomic.events` is referred to as `b`. This is simply a convenience, it doesn't change the actual query.
* We've had to specify `a.domain_userid` and `a.domain_sessionidx` in the `SELECT` clause, as otherwise, Redshift / PostgreSQL will not know whether to return the `domain_userid` and `domain_sessionidx` from the first table or the second. (It actually doesn't matter - the results are the same if you replace the `a.` with a `b.`, but the query engine will complain if you omit the `a.` or `b.` altogether.)

Back to [top](#top).

<h2><a name="window">6. Windowing functions</a></h2>

At the start of this guide, we covered how to select individual records in your table using the `SELECT` clause, and how to aggregate groups of records using the `GROUP BY` clause.

Sometimes, however, we will want to update the value of a single record based on its position or relationship to a larger group of records. Alternatively, we may want to use aggregate records for the group and use those values to update individual records. (E.g. what fraction of the group total does this individual record represent?) In these cases, window functions become invaluable. 

Particularly useful with Snowplow data is the ability to use window functions to rank events by the order that they have occurred, for a specific visitor. For example, we might want to know in what order a user has performed a series of page views. To do this, we can execute the following query:

{% highlight psql %}
SELECT
	domain_userid,
	domain_sessionidx,
	page_urlpath,
	RANK() OVER (PARTITION BY domain_userid, domain_sessionidx ORDER BY dvce_tstamp) AS "rank_asc"
FROM atomic.events
WHERE event = 'page_view'
{% endhighlight %}

We can then use those results to easily identify landing page views (those with `"rnk" = 1`) and aggregate across our data set to understand how visitors are to move between one particular web page and another.

`RANK()` is just one of the windowing functions available. For more details on windows functions in Redshift see the [Amazon documentation] [redshift-window] or the [PostgreSQL documentation] [postgres-window] for PostgreSQL. 

Back to [top](#top).

<h2><a name="other">7. Other useful functions and clauses</a></h2>

The purpose of this guide was not to be exhaustive, but to give the reader enough to give him / her a flying start using SQL to query Snowplow data.

Some other clauses that SQL users should be aware of:

1. The `HAVING` clause enables you to filter results *after* an aggregation has occured. (Rather than filtering the raw lines of data operated on, which the `WHERE` clause does.)
2. The `UNION` and `UNION ALL` operators provide a way to combine data sets for two tables which have the same fields. The combined table includes the rows from both the input tables: each row is just as it was in the original data tables. This differs from the use of `JOIN`, where the rows are effectively merged between the two tables. (So records are longer - they span more fields.) 

Back to [top](#top).

[psql]: http://www.postgresql.org/docs/9.2/assets/app-psql.html
[navicat]: http://www.navicat.com/
[redshift-setup]: https://github.com/snowplow/snowplow/wiki/setting-up-redshift#wiki-connect
[postgres-setup]: https://github.com/snowplow/snowplow/wiki/setting-up-postgresql#124-connect-to-your-postgresql-instance-remotely
[looker]: http://looker.com/
[concatenate]: http://www.postgresql.org/docs/9.1/assets/functions-string.html
[img-1]: /assets/img/analytics/tools/sql/1.JPG
[img-2]: /assets/img/analytics/tools/sql/2.JPG
[img-3]: /assets/img/analytics/tools/sql/3.JPG
[img-4]: /assets/img/analytics/tools/sql/4.JPG
[img-5]: /assets/img/analytics/tools/sql/5.JPG
[img-6]: /assets/img/analytics/tools/sql/6.JPG
[img-7]: /assets/img/analytics/tools/sql/7.JPG
[redshift-window]: http://docs.aws.amazon.com/redshift/latest/dg/c_Window_functions.html
[postgres-window]: http://www.postgresql.org/docs/9.1/assets/tutorial-window.html
[canonical-event-model]: https://github.com/snowplow/snowplow/wiki/canonical-event-model
