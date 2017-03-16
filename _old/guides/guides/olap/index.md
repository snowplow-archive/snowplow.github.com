---
layout: page
header: title
group: guides
subgroup: tools
title: Convert Snowplow data into a format suitable for OLAP
permalink: /guides/tools/olap/
redirect_from:
  - /analytics/tools/olap/
  - /analytics/tools-and-techniques/converting-snowplow-data-into-a-format-suitable-for-olap.html
  - /documentation/tools/olap/
---

<div class="html">
<h1><a name="top">Converting Snowplow data into a format suitable for OLAP reporting tools e.g. Tableau, Qlikview, Pentaho, Microstrategy</a></h1>
</div>

Snowplow data is stored in a log file format, where each line of data represents one "event" on a particular user journey. This data structure is unsuitable for traditional BI / analysis tools like Tableau, Qlikview, Pentaho or Microstrategy which require that the data be structured in a format suitable for OLAP analysis. (Sometimes also called _pivot tables_.) In this section of the cookbook, we describe how to restructure Snowplow event data into a format suitable for OLAP analysis, so that it can be interrogated using tools like Tableau and Qlikview.

Although this guide is written specifically for Snowplow data, the basic approach to converting log format data into a structure suitable for OLAP data should work for other log or event data sets as well.

In this recipe, we give an overview of OLAP reporting tools before walking through the steps necessary to convert Snowplow log file format data into a format suitable for data analysis. (So that it can be interrogated by tools like Tableau, Qlikview, Microstrategy etc.)

1. [Why use OLAP?](#why)
2. [What is OLAP exactly?](#what)
3. [What structure does the data need to be in to support an OLAP cube?](#structure)
4. [Some practical considerations related to databases and tables](#practical)
5. [Converting Snowplow event log data into dimensional OLAP structure: step by step guide](#conversion)
6. [Interrogating the data with Tableau](#tableau-test)
7. [Interrogating the data with Qlikview](#qlikview-test)
8. [Limitations in OLAP analysis](#limitations)

<div class="html">
<a name="why" ><h3>1. Why use OLAP?</h3> </a>
</div>

OLAP tools like Tableau, Qlikview, Pentaho and Microstrategy are very popular amongst data analysts because they

1. Make it easy to slice data along different dimensions, exploring different relationships over time, and answering a wealth of different business questions
2. They do not require much technical knowledge to use. (E.g. no need to know SQL or Python).
3. They are well suited to "train of thought analysis" i.e. moving quickly between one view of the data and another, as insights derived from the first immediately lead to questions that are answered by the second.

OLAP tools are especially well suited for Snowplow web analytics data:

1. There are a wide range of dimensions we might want to slice and dice web analytics data by, including time, user, visit, geography, device, browser, type of web page, web page, content and/or product, acquisition channel...
2. There are a wide variety of metrics we might want to compare between dimension combinations e.g. unique users, visits, page views, events, purchases, conversion rates, revenue...
3. Web analysts are generally very familiar with OLAP analysis / pivot tables: Google Analytics [custom reports] [ga-custom-reports] enables analysts to select metrics and dimensions like a primitive (and incredibly slow) OLAP cube, for example.

Back to [top] (#top).

<div class="html">
<a name="what"><h3>2. What is OLAP exactly?</h3> </a>
</div>

#### 2.1 OLAP overview

OLAP is an approach for analysing multi-dimensional data. OLAP stands for "online analytics processing", but it in fact relates to something much more tightly defined in data analytics: the treating of multidimensional data as a cube.

An OLAP cube is a multi-dimensional array of data. Data points are made up of one or more metrics. (In our cases, uniques, visits, page views, transactions, revenue, number of content items consumed etc.) Data can be viewed by a range of different dimensions. (In our case, examples include time of day, day in the week, time of the year, year, customer cohort, type of device, type of browser etc.) An OLAP reporting tool makes it easy for analysts to view the metrics they want, sliced by the particular dimensions they're interested in. So, for example, if an analyst wanted to see if conversion rates had been improving over time, they might slice the conversion rates metric by the time dimension (e.g. by month), to view if there had been an improvement. If there had been an improvement, they might then drill down to see if that improvement had been across the board: was it true of all customer segments, across all device types etc.?

<div class="html">
<p style="text-align:center;"><img src="/assets/img/olap/example-cube.png" alt="olap cube" width="250"/></p>
</div>

When we say OLAP cube, then, we visualise a "cube" of data points (i.e. metrics) at the intersection of multiple dimensions. (Three in the case of a cube, but more often there are more dimensions. Technically we should talk in terms of a "hyper-cube", but it doens't really matter.)

Back to [top](#top).

#### 2.2 OLAP operations

#### 2.2.1 Slicing data

We "slice" data when we pick two dimensions to view a particular metric by. The analogy is to take a "slice" through an OLAP cube to produce a 2D data set.

<div class="html">
<p style="text-align:center;"><img src="/assets/img/olap/slice.png" alt="slice olap cube" width="180"/></p>
</div>

#### 2.2.2. Dice data

Rather than slice data into two dimensions, we might want to create a subcube with more than 2 dimensions. This operation is called "dice".

<div class="html">
<p style="text-align:center;"><img src="/assets/img/olap/dice.png" alt="dice olap cube" width="140" /></p>
</div>

#### 2.2.3. Drill up and drill down

OLAP dimensions are often organised in a hierarchy. To gives some examples:

	Year -> Quarter -> Month -> Day -> Hour -> Minute -> Second

	Organic referrers -> Google -> specific keywords

	Browser -> browser version

	Category -> Subcategory -> Product

Drilling down refers to moving down the dimension hierarchy - e.g. from viewing sales by month to by week, and then by day. In each case, the level the metrics are being aggregated drops,  so the actual numbers reported fall.

In contrast, drilling up means moving up the dimension hierarchy - e.g. form viewing sales by month to by year. In this case, you're aggregating bigger data sets (a whole year's worth of data), so the the actual numbers get larger.

#### 2.2.4 Pivot

Pivoting means swaping one dimension for another. Typically this is used in two situations:

1. With an initial data set, to spot if there are interesting relationships between particular dimensions (e.g. product mix by city or conversion rate by time of day).
2. To better understand a relationship once one has been spotted. (Does product mix _only_ vary by city? Or is it actually that user segments vary by city, and it is user segment that is predictive of product mix?)

<div class="html">
<p style="text-align:center;"><img src="/assets/img/olap/pivot.png" alt="pivot olap cube" width="140" /></p>
</div>

Back to [top] (#top).

<div class="html">
<a name="structure"><h3>3. What structure does the data need to be in to support an OLAP cube?</h3></a>
</div>

In traditional OLAP parlance, at the heart of OLAP data is a "fact table". In Snowplow paralance, that fact table is really an "events" table. There are two key requirements to fulfil to ensure that events data is structured in a format suitable for processing by an OLAP tool like Tableau:

1. The granularity of the data is sufficient to support the sufficient "drill down". So, for example, if you want to be able to drill down to an individual user level, for example, your data set has to have separate entries for each user, each differentiated by the `user_id` field. Any aggregation of users (e.g. cohorts) must happen in the OLAP tool e.g. Tableau, **not** in the raw data fed into Tableau
2. All the dimensional information associated with each event (or "fact") that you want to slice / dice on must be present in the line of event data.

Of the two requirements outlined above, meeting the first using Snowplow data is easy, because Snowplow data is already stored at the most granular level. (I.e. at least one line of data per "event".) Meeting the second is a bit more nuanced. We discuss both below:

#### 3.1 Getting the granularity of data right

The more granular our data, the more reporting flexibility we have. One of the most frequently cited complaints about Google Analytics, for example, is that the data Google provides isn't sufficiently granular, so you cannot, for example, drill down to explore the way an individual user has engaged with your site.

With OLAP analysis, increased granularity doesn't just support better drill down facilities. It also enables more pivotting possibilities - as you can slice and dice more combinations of metrics against one another.

So granularity is good. The good news is that Snowplow data is very granular: at least one line of data per event. If we wanted (and it's perfectly legitimate to), we could feed Snowplow data into our OLAP reporting tool without aggregating it at all. However, there is a cost associated with this level of granularity: it means that the data volumes are greater, and so it is likely that the reporting tool will work more slowly. This used to be a much more important consideration (when RAM wasn't so cheap, and before columnar databases like Infobright, in-memory databases and SSD drives). However, it is still a reasonable consideration today.

One example of an approach to aggregating Snowplow data: we could aggregate it at the level of the user, session and event. (Be it a particular page load, product add to basket etc.) In this case, if we had a user who had visited a particular page 3x in one session, we would only have one line of data representing those three page views. (As opposed to having three in our original Snowplow events data set.) This would reduce our volume of data somewhat (likely by a factor of 0.1 - 0.25), but still give us a lot of reporting flexibility. (We'd be able to drill down to the user and action level.) We would not, however, be able to perform any path analysis. (I.e. look at the sequence of events in a particular user session.) In any case, this type of analysis isn't well supported by OLAP tools like Tableau.

#### 3.2 Ensure all dimensions information associated with each event is in every line of data

There are a number of dimensions that are already available on every line of Snowplow data. For example, the browser and operating system fields are populated in every line of Snowplow data.

However, there are other dimensions that are not available on every line of Snowplow data. These dimensions need to be inferred by looking at user behavior across multiple lines of data. To give two examples:

Say we are interested in bucketing users into cohorts based on the first time they performed a particular action e.g. "signup". Maybe we bucket users by month. In order to decide which bucket a user belongs, we need to scan all their records to identify the line of data generated when they first signed up, and then read the `dt` field on that line and use that to determine the bucket. This can be accomplished, for example, using the following SQL:

{% highlight mysql %}
SELECT
	user_id,
	CONCAT(YEAR(MIN(dt)), "-", MONTH(MIN(dt)))
FROM
	events
WHERE
	ev_action LIKE "signup"
GROUP BY
	user_id
{% endhighlight %}

When we feed our data into an OLAP reporting tool like Tableau, we need a column in it called "cohort", and for each event for each user, that column needs to be populated with the results from the above query.

To take another example: say we want to bucket users again, but this time by the channel that drove them to our website in the first place. Again, to work this out, we need to look at the first event for each of those users, and see what drove him / her there. Our SQL query would look like:

{% highlight mysql %}
SELECT
	e.user_id,
	mkt_source AS first_referrer
FROM
	events e
INNER JOIN
( 	SELECT
	user_id,
	min(concat(dt," ",tm) ) as first_touch_timestamp
	FROM `events`
	group by user_id ) users
ON users.user_id = e.user_id
AND CONCAT(e.dt, " ", e.tm) = first_touch_timestamp
{% endhighlight %}

In our modified data set for our OLAP reporting tool, we'd want a column for this data (maybe called "first referrer") that was populated with the `first_referrer` field generated by the above query.

In both the above cases, we take data that we deduce about a dimension from scanning multiple rows of events data (in each case, about the "user" dimension), and add it into an additional column to our "event" line of data in or OLAP data set. This means that it is straightforward for the OLAP tool to identify that this event happened for a user who belongs in this particular cohort, and so when aggregating metrics for that cohort, the metric on this line of data should be included. Tools like Tableau will not scan multiple lines of data to infer the dimension value for a particular line of data computation needs to happen to the data set before it is imported in.

Back to [top] (#top).

<div class="html">
<a name="practical"><h3>4. Some practical considerations related to star schemas and columnar databases</h3></a>
</div>

OLAP has a long history (which means it is an old technology). In the literatue on OLAP, data structures are typically described in terms of star schemas: a denormalized data structure with a central "fact table" of the actual events that occured, linked to dimensions table (by lookups) that shed light on each individual action.

<div class="html">
<p style="text-align:center;"><img src="/assets/img/olap/star-schema.png" alt="pivot olap cube" /></p>

<p style="font-size:small;text-align:right">Image taken from <a href="http://en.wikipedia.org/wiki/Star_schema">Wikipedia</a></p>
</div>

Columar databases like Infobright mean organising data formally in a star schema is no longer necessary: we still store denormalized data, but effectively collapse all the dimension tables into the fact table, to create a single "fat" fact table with all the relevant dimensions:

<div class="html">
<p style="text-align:center;"><img src="/assets/img/olap/desired-structure-for-olap.png" alt="desired structure" width="500" /></p>
</div>

Columnar databases make this possible because they make "columns cheap": query times are a function of the number of columns in the query - any that are unused are ignored. Having all the columns in a single table makes querying significantly easier: it means no joins are necessary. It also means tools like Tableau can run directly on our data table, without having to peform any joins themselves. (Which is generally a time consuming operation.)

Back to [top] (#top).

<div class="html">
<a name="conversion"><h3>5. Converting Snowplow event log data into dimensional OLAP structure: step by step guide</h3></a>
</div>

Converting Snowplow event log data into a dimensional OLAP struture is a four step process

1. [Define the structure of our OLAP data table](#structure-2), including both metric and dimension columns
2. [Work out what level of granularity to use](#granularity) i.e. what each line of data reprents. (One event or a higher level of aggregation?)
3. [Define our table](#define)
4. [Work out how to compute each line of data](#compute)
5. [Generate the OLAP data](#generate)

<div class="html">
<h3><a name="structure-2">5.1 Define the structure of our OLAP data table, including both metric and dimension columns</a></h3>
</div>

### 5.1.1 Metrics

Let us start with the metrics we want to include, and make sure we have all the basics we'd expect for any website:

* Uniques
* Visits
* Page views

There are a large number of other metrics we could include, depending on the type of website / web app running Snowplow. For example, an ecommerce site might want to log:

* Number of purchases (transactions)
* Number of products sold
* Value of sales (revenue)
* Number of add-to-baskets
* Number of remove-from-baskets
* Value of goods added-to-basket
* Value of goods removed-from-basket

A content site might want to include:

* Number of articles consumed
* Time spent consuming articles
* Number of articles shared
* Number of articles liked
* Number of articles tweeted
* Number of articles commented on
* Number of videos watched
* Minutes spent streaming media
* Number of videos completed watching
* Number of subscription signups
* Subscription spend
* Number of ad units shown
* Number of ad untis engaged with
* Ad revenue

These are just basic metrics. Later on (once the cube has been created), it should be possible to define more sophisticated metrics e.g.

* Breadth of engagement. (Which we might define as the number of articles read)
* Deptch of engagement. (Which we might define based on the time spent reading articles, or decide that a more engaged user is one who has liked / commented / shared an article.)

A social network might want to include:

* Number of connections initiated
* Number of connections accepted
* Number of posts
* Number of comments
* Number of direct messages
* Number of X way conversations
* Number of shares

To keep this tutorial a manageable length, we'll only include the first three metrics (uniques, visits and page views) in our example. However, extending our OLAP data table to include many more metrics is possible (and recommended): one of the explicit aims of Snowplow, after all, is to enable you to report the metrics that matter to your business, however particular those metrics are. (For a video of an example cube with many more dimensions, see our blog post on [analysing Snowplow data with Tableau] [analysing-snowplow-data-with-tableau].)

### 5.1.2 Dimensions

When deciding which dimensions to include, we need to think about all the entities that matter to our business. Some common entities that all website / webapp owners should be interested in:

* Users (or visitors)
* Visits (or sessions)
* Pages

Depending on the type of website / webapp we run, however, there are many more we might want to include. For example, an online retailer would be interested in :

* Products
* Orders
* Stage in customer funnel (e.g. window shopping vs add to basket vs checkout vs purchase)

A content site would be interested in:

* Articles
* Authors
* Topics

A social network would be interested in:

* Friends
* Groups

Again, to keep this tutorial manageable, we'll concentrate on just the first three entities identified i.e. users, visits, pages. However, we do recommend including **all** the entities in your OLAP data structure that matter to you business. Now, for each entity, we should list what data points we want to capture. Some suggestions:

**User**

* `user_id`
* `cohort` (where maybe we define cohort as the month-year in which he / she started first visited our website)
* The traffic source for the user based on his / her first visit i.e. `mkt_source`, `mkt_medium`, `mkt_term`, `mkt_content`, `mkt_campaign` for the first visit and `page_referrer` for the very first page view of that first visit

**Visit**

* `visit_id`
* Visit date i.e. `dt`
* Visit time e.g. time of initial event or page view
* Traffic source for teh visit i.e. `mkt_source`, `mkt_medium`, `mkt_term`, `mkt_content`, `mkt_campaign` for the first visit and `page_referrer` for the very first page view of that visit

**Page**

* page_url
* page_title

We should recognise that there is a hierarchy in the three entities we've identified: users may visit our website once or more, and on each visit view one or more pages. This will be important when we generate our OLAP data.

Remember - we're only including a handful of dimensions to keep this tutorial manageable. We recommend including as many dimensions as possible, to support as wide a range of OLAP analyses as possible.

<h3><a name="granularity">5.2 Work out what level of granularity to use i.e. what each line of data reprents. (One event or a higher level of aggregation?)</a></h3>

We discussed the merits and costs or keeping more granular data in your OLAP cube. For the sakes of this example, we're going aggregate data by page by visit. That means we will be able to look at the number of page views and number of unique page views by visit, but not analyse e.g. for users who look at a particular web page twice in one session e.g. how many page views they viewed in between the two of the same page.

<div class="html">
<h3><a name="define">5.3 Define our table</a></h3>
</div>

To return to our example, we are now in a position to define the structure of the OLAP data as it would look in <a name="table-def">Infobright</a>:

{% highlight mysql %}

CREATE TABLE IF NOT EXISTS demo_cube (
# DIMENSIONS
	# User
		`user_id` varchar(16) comment 'lookup',
		`cohort` varchar(16) comment 'lookup',
		`first_visit_mkt_source` varchar(255) comment 'lookup',
		`first_visit_mkt_medium` varchar(255) comment 'lookup',
		`first_visit_mkt_term` varchar(255) comment 'lookup',
		`first_visit_mkt_content` varchar(2083),
		`first_visit_mkt_campaign` varchar(255) comment 'lookup',
		`first_visit_page_referrer` varchar(2083),

	# Visit
		`visit_id` int,
 		`dt` date,
		`tm` time,
		`visit_mkt_source` varchar(255) comment 'lookup',
		`visit_mkt_medium` varchar(255) comment 'lookup',
		`visit_mkt_term` varchar(255) comment 'lookup',
		`visit_mkt_content` varchar(2083),
		`visit_mkt_campaign` varchar(255) comment 'lookup',
		`visit_page_referrer` varchar(2083),

	# Page
		`page_url` varchar(2083) comment 'lookup',
		`page_title` varchar(2083) comment 'lookup',

# METRICS
		`page_views` int

) ENGINE BRIGHTHOUSE DEFAULT CHARSET=utf8;

{% endhighlight %}

Note: only one of our three metrics is defined in our table: `page_views`. We do not have a column for `uniques` or `visits`. The reason is that both of these can be _derived_ from the data above: we can work out how many uniques on a particular day by counting the number of distinct `user_id`s. Similarly, we can calculate the number of visits based on the number of distinct `CONCAT(user_id, "-", visit_id)` in a time period.

If we were aggregating our data to a the visit level (so we have one line of data for each visit), we could have an additional metric column called `visits` and set the value to `1` for each line of data. (Because each line of data would represent one visit.) Then summing this value over e.g. time would have given us a visit count. However, in our case, where each line of data represents one page view, there is no way to sum across page views to get visits. (Because we don't know in advance how many page views in a visit.) Instead, we count distinct effective visit identifiers, where our visit identifier is created by concatenating the `user_id` with the `visit_id`.

Similarly, if we were to aggregate our data to the user level (so we have one line of data for each user), we could have a column for both the uniques and visits metrics, where the uniques column would be set to `1` on every data line and the value of `visits` would vary depending on the number of visits by user. However, we would not be able to perform any page level analysis with our data set.

<div class="html">
<h3><a name="compute">5.4 Work out how to compute each line of data</a></h3>
</div>

There are a number of tools we can use to generate out OLAP data set from our Snowplow data set. In this example, we're going to assume our events data is in Infobright, and we'll generate our OLAP data set using just SQL. Note: the same SQL should work equally well to generate an output data set in Hive. However, we would **not** want our OLAP data to live in Hive, as querying it would be much slower than if that data lived in a columnar database like Infobright. Train-of-thought analysis (which OLAP reporting tools excel at) is only possible if querying is fast, and Hive/ map reduce is not fast.

We've decided that we want a line of data for every web page on every visit. We can generate a line of data at this granularity using the following query:

{% highlight mysql %}
SELECT
	user_id,
	visit_id,
	page_url,
	page_title,
	count(distinct(txn_id)) AS page_views
FROM
	events e
GROUP BY
	user_id, visit_id, page_url, page_title
{% endhighlight %}

So far so good, we now have a number of the desired columns in our OLAP data set. We're still missing a number of dimensions, however, that relate to the visit (i.e. `dt`, `tm`, and source of traffic) and user (i.e. cohort and source of traffic).

Let us first generate the missing visit data. We want the date, time and traffic source data fields that are stored in the first line of event data for each visit. We can pull that data from our Snowplow events table by executing the following query:

{% highlight mysql %}
SELECT
	v.user_id,
	v.visit_id,
	e2.mkt_source AS visit_mkt_source,
	e2.mkt_medium AS visit_mkt_medium,
	e2.mkt_term AS visit_mkt_term,
	e2.mkt_content AS visit_mkt_content,
	e2.mkt_campaign AS visit_mkt_campaign,
	e2.page_referrer AS visit_page_referrer
FROM events e2
INNER JOIN
(	SELECT
	user_id,
	visit_id,
	MIN(CONCAT(dt, " ", tm)) AS first_touch_timestamp
	FROM events
	GROUP BY user_id, visit_id) v
ON v.user_id = e2.user_id
AND v.visit_id = e2.visit_id
AND CONCAT(e2.dt, " ", e2.tm) = v.first_touch_timestamp
ORDER BY user_id, visit_id
{% endhighlight %}

And then join it with our original data set to populate the missing visit dimension fields:

{% highlight mysql %}
SELECT
	page_views.user_id,
	page_views.visit_id,
	visits.dt,
	visits.tm,
	visits.visit_mkt_source,
	visits.visit_mkt_medium,
	visits.visit_mkt_term,
	visits.visit_mkt_content,
	visits.visit_mkt_campaign,
	visits.visit_page_referrer,
	page_views.page_url,
	page_views.page_title,
	page_views.page_views
FROM
(	SELECT
		user_id,
		visit_id,
		page_url,
		page_title,
		count(distinct(txn_id)) AS page_views
	FROM
		events e
	GROUP BY
		user_id, visit_id, page_url, page_title
) page_views
LEFT JOIN
	(	SELECT
		v.user_id,
		v.visit_id,
		e2.dt,
		e2.tm,
		e2.mkt_source AS visit_mkt_source,
		e2.mkt_medium AS visit_mkt_medium,
		e2.mkt_term AS visit_mkt_term,
		e2.mkt_content AS visit_mkt_content,
		e2.mkt_campaign AS visit_mkt_campaign,
		e2.page_referrer AS visit_page_referrer
		FROM events e2
		INNER JOIN
		(	SELECT
			user_id,
			visit_id,
			MIN(CONCAT(dt, " ", tm)) AS first_touch_timestamp
			FROM events
			GROUP BY user_id, visit_id) v
		ON v.user_id = e2.user_id
		AND v.visit_id = e2.visit_id
		AND CONCAT(e2.dt, " ", e2.tm) = v.first_touch_timestamp
		GROUP BY user_id, visit_id
) visits
ON page_views.user_id = visits.user_id
AND page_views.visit_id = visits.visit_id
{% endhighlight %}

Now we only need to add the missing user dimension fields i.e. `cohort` and traffic source fields. Both can be derived from the first event that each user takes, _ever_, using the following query:

{% highlight mysql %}
SELECT
	u.user_id,
	CONCAT(YEAR(dt), "-", MONTH(dt)) AS cohort,
	e3.mkt_source AS first_visit_mkt_source,
	e3.mkt_medium AS first_visit_mkt_medium,
	e3.mkt_term AS first_visit_mkt_term,
	e3.mkt_content AS first_visit_mkt_content,
	e3.mkt_campaign AS first_visit_mkt_campaign,
	e3.page_referrer AS first_visit_page_referrer
FROM events e3
INNER JOIN
(	SELECT
	user_id,
	MIN(CONCAT(dt, " ", tm)) AS first_touch_timestamp
	FROM events
	WHERE visit_id = 1
	GROUP BY user_id, visit_id) u
ON u.user_id = e3.user_id
AND CONCAT(e3.dt, " ", e3.tm) = u.first_touch_timestamp
GROUP BY u.user_id
{% endhighlight %}

Now need to join these additional data fields to our data set:

{% highlight mysql %}

SELECT
	page_views.user_id,
	users.cohort,
	users.first_visit_mkt_source,
	users.first_visit_mkt_medium,
	users.first_visit_mkt_term,
	users.first_visit_mkt_content,
	users.first_visit_mkt_campaign,
	users.first_visit_page_referrer,
	page_views.visit_id,
	visits.dt,
	visits.tm,
	visits.visit_mkt_source,
	visits.visit_mkt_medium,
	visits.visit_mkt_term,
	visits.visit_mkt_content,
	visits.visit_mkt_campaign,
	visits.visit_page_referrer,
	page_views.page_url,
	page_views.page_title,
	page_views.page_views
FROM
(	SELECT
		user_id,
		visit_id,
		page_url,
		page_title,
		count(distinct(txn_id)) AS page_views
	FROM
		events e
	GROUP BY
		user_id, visit_id, page_url, page_title
) page_views
LEFT JOIN
	(	SELECT
		v.user_id,
		v.visit_id,
		e2.dt,
		e2.tm,
		e2.mkt_source AS visit_mkt_source,
		e2.mkt_medium AS visit_mkt_medium,
		e2.mkt_term AS visit_mkt_term,
		e2.mkt_content AS visit_mkt_content,
		e2.mkt_campaign AS visit_mkt_campaign,
		e2.page_referrer AS visit_page_referrer
		FROM events e2
		INNER JOIN
		(	SELECT
			user_id,
			visit_id,
			MIN(CONCAT(dt, " ", tm)) AS first_touch_timestamp
			FROM events
			GROUP BY user_id, visit_id) v
		ON v.user_id = e2.user_id
		AND v.visit_id = e2.visit_id
		AND CONCAT(e2.dt, " ", e2.tm) = v.first_touch_timestamp
		GROUP BY user_id, visit_id
) visits
ON page_views.user_id = visits.user_id
AND page_views.visit_id = visits.visit_id
LEFT JOIN
	( 	SELECT
			u.user_id,
			CONCAT(YEAR(dt), "-", MONTH(dt)) AS cohort,
			e3.mkt_source AS first_visit_mkt_source,
			e3.mkt_medium AS first_visit_mkt_medium,
			e3.mkt_term AS first_visit_mkt_term,
			e3.mkt_content AS first_visit_mkt_content,
			e3.mkt_campaign AS first_visit_mkt_campaign,
			e3.page_referrer AS first_visit_page_referrer
		FROM events e3
		INNER JOIN
		(	SELECT
			user_id,
			MIN(CONCAT(dt, " ", tm)) AS first_touch_timestamp
			FROM events
			WHERE visit_id = 1
			GROUP BY user_id, visit_id) u
		ON u.user_id = e3.user_id
		AND CONCAT(e3.dt, " ", e3.tm) = u.first_touch_timestamp
		GROUP BY u.user_id
) users
ON page_views.user_id = users.user_id
{% endhighlight %}

The above query will return Snowplow data in a format suitable for processing in an OLAP reporting tool like Tableau.

<div class="html">
<h3><a name="generate">5.5 Generate the OLAP data</a></h3>
</div>

Generating the data required is as simple as running the above query. However, using SQL statements to generate versions of the Snowplow events data to use in OLAP reporting tools is not computationally efficient: in particular, it requires multiple passes through the entire data set and several joins between subtables derived from the events table, all of which are pretty costly.

For that reason, we recommend using SQL to generate **agile data cubes**: to quickly generate data for querying in Tableau / Qlikview / Pentaho with a view to experimenting with new dimensions and metrics, for example. If it turns out that a particular data cube is of value to you, and you want to continue to use it (and keep it updated), we'd recommend using [Cascading] [cascading] in a Hadoop environment to keep you OLAP data set up-to-date. We will document how to do this in due course.

If you're running Infobright Community Edition, you wont be able to write the output of the query directly into a new table because `INSERT` statements are not supported. Instead, we'll write our results to file, and then import them back into Infobright.

To write the results to file, execute the above query, but add `INTO OUTFILE {{FILENAME}}` at the end of the statement.

Now create a new table to house the data, using the [table definition given above] (#table-def).

Now we can load our saved data into our new table

{% highlight mysql %}
LOAD DATA INFILE '{{FILE PATH AND LOCATION HERE}}'
INTO TABLE demo_cube;
{% endhighlight %}

We're ready to connect our OLAP reporting tool of choice (e.g. Tableau, Qlikview) to our data set in Infobright!

Back to [top] (#top).

<div class="html">
<a name="tableau-test"><h3>6. Interrogating the data with Tableau</h3></a>
</div>

Connecting Tableau desktop edition to Infobright is a bit fiddly: in most cases, your data will be on a remote Infobright instance and you'll want to establish an SSH connection between the PC running Tableau and that instance. Instructions on how to do this is beyond the scope of this tutorial, but a decent explanation of how to setup a tunnel using [Putty][putty] can be found [here][putty-ssh-tunnel-tutorial].

Once you have setup your tunnel, launch Tableau and select **connect to data**. Select **MySQL** from the list of options:

<div class="html">
<p style="text-align:center;"><img src="/assets/img/olap/tableau-1.JPG" alt="connect tableau to data" width="350"/></p>
</div>

In our case I've setup Putty to forward requests to `localhost:1234` to my remote Infobright instance. The server name and port number you'll need to enter will be determined by the nature of the tunnel you've established.

Enter the username and password to log into your Infobright instance and click **Connect**. Select the database you created the table in: your table should be visible:

<div class="html">
<p style="text-align:center;"><img src="/assets/img/olap/tableau-2.JPG" alt="olap cube"/></p>
</div>

You'll be given an option as to how much of the data you want imported into Tableau's fast data engine. If your data set isn't too large, you can try importing all of it. Otherwise, select "import some data" or "Connect live"". Your workbook should launch:

<div class="html">
<p style="text-align:center;"><img src="/assets/img/olap/tableau-3.JPG" alt="olap cube"/></p>
</div>

Tableau's made some guesses as to which one of our columns are dimensions and which are metrics. If the field is numeric, Tableau assumes it is a metric. If it's not, it assumes it's a dimension. That works for _most_ of our fields, but not for `visit_id` (which is a dimension). Simply drag `visit_id` from the **Measures** pane to the **Dimensions pane**:

<div class="html">
<p style="text-align:center;"><img src="/assets/img/olap/tableau-4.JPG" alt="olap cube"/></p>
</div>

Now we need to add our two missing metrics: `uniques` and `visits`. To add `uniques`, right click on `user_id` (in the dimensions pane) and select **Create calculated field**. Tableau gives us the opportunity to create a new, calcultaed field. Fill in the name and formula as below:

<div class="html">
<p style="text-align:center;"><img src="/assets/img/olap/tableau-5.JPG" alt="calculated field - uniques" width="550" /></p>
</div>

Click **OK**: `Uniques` will now be listed as a **Measure**. Now we need to create a new calculated field for **Visits**:

<p style="text-align:center;"><img src="/assets/img/olap/tableau-6.JPG" alt="calculated field - visits" width="550" /></p>

Now we're all set! We can drag and drop our fields and metrics to our heart's content, to explore our data set. To see a video demonstration of how to do this (including with a cube with more dimensions and metrics than in this tutorial) see our blog post on [analysing Snowplow data with Tableau] [analysing-snowplow-data-with-tableau].

Back to [top] (#top).

<div class="html">
<a name="qlikview-test"><h3>7. Interrogating the data with Qlikview</h3></a>
</div>

TO WRITE

Back to [top](#top).

<div class="html">
<a name="limitations"><h3>8. Limitations in OLAP analysis</h3></a>
</div>

One of the things that people often note when running tools like Tableau on top of Snowplow data is that it is quick and easy to put together the vast majority of reports delivered by standard analytics package like Google Analytics and even the type of cohort analysis delivered by toolsl like [Mixpanel][mixpanel] and [Kissmetrics][kissmetrics]. This sometimes leads excited analysts to forget all the analytics possibilities that are **not** supported by OLAP tools:

1. Path / journey analysis
2. Building and testing statistical models of customer behavior e.g. customer lifetime models. (Although the model build might be informed by the results and visualisations generated by an OLAP tool.)
3. Machine learning approaches e.g. clustering and classifying visitors by behavior
4. Predictive analytics: how much do we expect to make from this product launch, or this customer, going forwards?

That is not to take anything away from OLAP tools, just to remind users that they are one in an arsenal of analytic techniques, that Snowplow makes it possible to leverage with web analytics data.

Back to [top](#top).




[ga-custom-reports]: http://www.google.com/analytics/features/custom-reports.html
[cascading]: http://www.cascading.org/
[putty]: http://www.chiark.greenend.org.uk/~sgtatham/putty/
[putty-ssh-tunnel-tutorial]: http://oldsite.precedence.co.uk/nc/putty.html
[analysing-snowplow-data-with-tableau]: /blog/2012/10/24/web-analytics-with-tableau-and-snowplow/
[mixpanel]: https://mixpanel.com/
[kissmetrics]: http://www.kissmetrics.com/
