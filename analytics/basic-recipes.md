---
layout: section
category: analytics
analytics_category: overview
title: Basic recipes
weight: 5
---

# Bread and butter web analytics queries

The following queries return basic web analytics data that someone could expect from any standard web analytics package. These are *not* the queries that SnowPlow was designed to perform: we built SnowPlow to enable analysts to run queries on web analytics data that are **not** possible with other web analytics programs. These queries return the results that **all** web analytics queries return. However, running them can be useful for an analyst to validate SnowPlow has been setup correctly (by comparing the output against e.g. Google Analtyics), and help her get familiar with writing queries in SnowPlow.

The following queries will work with both Hive and Infobright.

1. [Number of unique visitors](#counting-unique-visitors)
2. [Number visits](#counting-visits)
3. [Number of pageviews](#counting-pageviews)
4. [Number of events](#counting-events)
5. [Pages per visit](#pages-per-visit)
6. [Bounce rate](#bounce-rate)
7. [% New visits](#new-visits)
8. [Average visitor duration](#duration)
9. [Repeating queries: a note about efficiency](#efficiency)
10. [Demographics: language](#language)
11. [Demographics: location](#location)
12. [Behaviour: new vs returning](#new-vs-returning)
13. [Behaviour: frequency](#frequency)
14. [Behaviour: recency](#recency)
15. [Behaviour: engagement](#engagement)
16. [Technology: browser](#browser)
17. [Technology: operating system](#os)
18. [Technology: mobile](#mobile)

<a name="counting-unique-visitors" />
## 1. Number of unique visitors 

The number of unique visitors can be calculated by summing the number of distinct `user_id`s in a specified time period e.g. day. (Because each user is assigned a unique user_id, based on a lack of SnowPlow tracking cookies on their browser):

	SELECT 
	dt,
	COUNT(DISTINCT (user_id))
	FROM events
	GROUP BY dt ;

Or by week:

	SELECT
	YEAR(dt),
	WEEKOFYEAR(dt),
	COUNT(DISTINCT(user_id))
	FROM events
	GROUP BY YEAR(dt), WEEKOFYEAR(dt) ;

Or by month:

	SELECT
	YEAR(dt),
	MONTH(dt),
	COUNT(DISTINCT(user_id))
	FROM events
	GROUP BY YEAR(dt), MONTH(dt) ;

<a name="counting-visits" />
## 2. Number of visits

Because each user might visit a site more than once, summing the number of `user_id`s returns the number if *visitors*, NOT the number of *visits*. Every time a user visits the site, however, SnowPlow assigns that session with a `visit_id` (e.g. `1` for their first visit, `2` for their second.) Hence, to count the number of visits in a time period, we concatenate the unique `user_id` with the `visit_id` and then count the number of distinct concatenated entry in the events table:

	SELECT
	dt,
	COUNT( DISTINCT( CONCAT( user_id,"-",visit_id )))
	FROM events 
	GROUP BY dt ;

Again, we can group by week:

	SELECT
	YEAR(dt),
	WEEKOFYEAR(dt),
	COUNT(DISTINCT(CONCAT(user_id, visit_id)))
	FROM events
	GROUP BY YEAR(dt), WEEKOFYEAR(dt) ;


Or month:

	SELECT
	YEAR(dt),
	MONTH(dt),
	COUNT(DISTINCT(CONCAT(user_id, visit_id)))
	FROM events
	GROUP BY YEAR(dt), MONTH(dt) ;

<a name="counting-pageviews" />
## 3. Number of page views

Page views are one type of event that are stored in the SnowPlow events table. Their defining feature is that the `page_title` contain values (are not `NULL`). In the case of an *event* that is not a page view (e.g. an _add to basket_) these fields would all be `NULL`, and the event fields (`ev_category`, `ev_action`, `ev_label` etc.) would contain values. For details, see the [Introduction to the SnowPlow events table](https://github.com/snowplow/snowplow/blog/master/docs/07_snowplow_hive_tables_introduction.md).

To count the number of page views by day, then we simply execute the following query:

	SELECT
	dt,
	COUNT(txn_id)
	FROM events
	WHERE page_title IS NOT NULL
	GROUP BY dt ;

By week:

	SELECT
	YEAR(dt),
	WEEKOFYEAR(dt)
	COUNT(txn_id)
	FROM events
	WHERE page_title IS NOT NULL
	GROUP BY YEAR(dt), WEEKOFYEAR(dt) ;

By month:

	SELECT
	YEAR(dt),
	MONTH(dt)
	COUNT(txn_id)
	FROM events
	WHERE page_title IS NOT NULL
	GROUP BY YEAR(dt), MONTH(dt) ;

<a name="counting-events" />
## 4. Number of events / transactions

Although the number of page views is a standard metric in web analytics, this reflects the web's history as a set of hyperlinked documents rather than the modern reality of web applications that are comprise lots of AJAX events (that need not necessarily result in a page load.)

As a result, counting the total number of events (including page views but also other AJAX events) is actually a more meaningful thing to do than to count the number of page views, as we have done above. We recommend setting up SnowPlow so that *all* events / actions that a user takes are tracked. Hence, running the below queries should return a total sum of events on the site by time period:

	SELECT
	dt,
	COUNT(txn_id)
	FROM events
	GROUP BY dt ;

By week:

	SELECT
	YEAR(dt),
	WEEKOFYEAR(dt)
	COUNT(txn_id)
	FROM events
	GROUP BY YEAR(dt), WEEKOFYEAR(dt) ;

By month:

	SELECT
	YEAR(dt),
	MONTH(dt)
	COUNT(txn_id)
	FROM events
	GROUP BY YEAR(dt), MONTH(dt) ;

As well as looking at page views by time period, we can also look by `user_id`. This gives a good impression of the engagement level of each of our users: how does this vary across our user population, how it varies for a particular user over time, for example.

For example, to examine the engagement by user by month, we execute the following query:

	SELECT
	YEAR(dt),
	MONTH(dt),
	user_id,
	COUNT(txn_id)
	FROM events
	GROUP BY YEAR(dt), MONTH(dt), user_id ;

There is scope to taking a progressively more nuanced approach to measuring user engagement levels. Some of the approaches are described in [this blog post](http://www.keplarllp.com/blog/2012/05/different-approaches-to-measuring-user-engagement-with-snowplow)

<a name="pages-per-visit" />
## 5. Pages per visit

The number of pages per visit can be calculated by visit very straightforwardly:

	SELECT
	user_id,
	visit_id,
	COUNT(txn_id) AS pages_per_visit
	FROM
	events
	WHERE page_title IS NOT NULL
	GROUP BY user_id, visit_id ;

To calculate the average page views per day we average over the results in the above query. This can be performed in Hive in two steps: 

1. Performing the above query, but storing the results in a new table
2. Averaging over that table values

The queries are given below:

	CREATE TABLE pages_per_visit (
	dt STRING,
	user_id STRING,
	visit_id INT,
	pages INT );

	INSERT OVERWRITE TABLE pages_per_visit
	SELECT
	dt,
	user_id,
	visit_id,
	COUNT(txn_id)
	FROM events
	WHERE page_title IS NOT NULL
	GROUP BY dt, user_id, visit_id ;

	SELECT 
	dt,
	AVG(pages)
	FROM pages_per_visit
	GROUP BY dt ;

<a name="bounce-rate" />
## 6. Bounce rate

First we need to look at all the website visits, and flag which of those visits are *bounces*: these are visits where there is only one page view. (So one "event" i.e. only one `txn_id`):

	CREATE TABLE visits_with_bounce_info (
	user_id STRING,
	visit_id INT,
	dt STRING,
	events INT,
	bounce BOOLEAN
	) ;

	INSERT OVERWRITE TABLE visits_with_bounce_info
	SELECT 
	user_id,
	visit_id,
	MIN(dt),
	COUNT(txn_id),
	IF(COUNT(txn_id) = 1, 1, 0)
	FROM events
	GROUP BY user_id, visit_id ;

Then we need to calculate the fraction of visits by time period that are *bounces* e.g. by day:

	SELECT
	dt,
	COUNT( visit_id ) AS total_visits,
	SUM( bounce ) AS bounces,
	SUM( bounce )/COUNT( visit_id ) AS bounce_rate
	FROM visits_with_bounce_info
	GROUP BY dt ;

Or by week:

	SELECT
	YEAR(dt),
	WEEKOFYEAR(dt),
	COUNT( visit_id ) AS total_visits,
	SUM( bounce ) AS bounces,
	SUM( bounce )/COUNT( visit_id ) AS bounce_rate
	FROM visits_with_bounce_info
	GROUP BY YEAR(dt), WEEKOFYEAR(dt) ;

Or by month:

	SELECT
	YEAR(dt),
	MONTH(dt),
	COUNT( visit_id ) AS total_visits,
	SUM( bounce ) AS bounces,
	SUM( bounce )/COUNT( visit_id ) AS bounce_rate
	FROM visits_with_bounce_info
	GROUP BY YEAR(dt), MONTHS(dt) ;

<a name="new-visits" />
## 7. % New visits

A new visit is easily identified as a visit where the visit_id = 1. Hence, to calculate the % of new visits, we need to sum all the visits where `visit_id` = 1 and divide by the total number of visits, in the time period.

First, we calculate the number of new visits in the time period:

	CREATE TABLE new_visits_by_day (
	dt STRING,
	number_new_visits INT) ;

	INSERT OVERWRITE TABLE new_visits_by_day
	SELECT
	dt,
	COUNT(DISTINCT (user_id) )
	FROM events
	WHERE visit_id=1
	GROUP BY dt ;

Secondly, we calculate the total number of visits in the time period:

	CREATE TABLE visits_by_day (
	dt STRING,
	number_of_visits INT) ;

	INSERT OVERWRITE TABLE visits_by_day
	SELECT
	dt,
	COUNT(DISTINCT (CONCAT(user_id,visit_id)) )
	FROM events
	GROUP BY dt ;

Lastly, we take the number of new visits per time period, and divide by the total number of visits

	SELECT
	n.dt,
	n.number_new_visits / v.number_of_visits AS percentage_new_visits
	FROM new_visits_by_day n JOIN visits_by_day v ON n.dt = v.dt;

<a name="duration" />
## 8. Average visitor duration

To calculate this, 1st we need to calculate the duration of every visit:

	CREATE TABLE visits (
	user_id STRING,
	visit_id STRING,
	dt STRING,
	start_time STRING,
	end_time STRING,
	duration DOUBLE
	) ;

	INSERT OVERWRITE TABLE visits
	SELECT
	user_id,
	visit_id,
	MIN(dt),
	MIN(CONCAT(dt," ",tm)),
	MAX(CONCAT(dt," ",tm)),
	UNIX_TIMESTAMP(MAX(CONCAT(dt," ",tm)))-UNIX_TIMESTAMP(MIN(CONCAT(dt," ",tm)))
	FROM events
	GROUP BY user_id, visit_id ;

Then we simply average visit durations over the time period we're interested e.g. by day:

	SELECT
	dt,
	AVG(duration)
	FROM visits
	GROUP BY dt ;

Or by week:

	SELECT 
	YEAR(dt),
	WEEKOFYEAR(dt),
	AVG(duration)
	FROM visits
	GROUP BY YEAR(dt), WEEKOFYEAR(dt) ;

Or by month:

	SELECT 
	YEAR(dt),
	WEEKOFYEAR(dt),
	AVG(duration)
	FROM visits
	GROUP BY YEAR(dt), MONTH(dt) ;

<a name="efficiency" />
## 9. A note about efficiency

Hive and Hadoop more generally are very powerful tools to process large volumes of data. However, data processing is an expensive task, in the sense that every time you execute the query, you have to pay EMR fees to crunch through your data. As a result, where possible, it is advisable not to repeat the same analysis multiple times: for repeated analyses you should save the results of the analysis, and only perform subsequent analysis on new data.

To take the example of logging the number of unique visitors by day: we could run a query to fetch calculate this data up to and included yesterday:

	SELECT 
	dt,
	COUNT(DISTINCT (user_id))
	FROM events
	WHERE dt < '{{TODAY's DATE}}'
	GROUP BY dt ;

We would then save this data in a suitable database / Excel spreadsheet, and add to it by querying just *new* data e.g.

	SELECT 
	dt,
	COUNT(DISTINCT (user_id))
	FROM events
	WHERE dt > '{{NEW DATES}}'
	GROUP BY dt ;

At the moment, the analyst has to manually append the new data to the old. Going forwards, we will build out the SnowPlow functionality so that it is straightforward to build ETL processes to migrate useful cuts of data into analytics databases for further analysis, where Hadoop / Hive is not required for that additional analysis.

<a name="language" />
## 10. Demographics: language

For each event the browser language is stored in the `br_language` field. As a result, counting the number of visits in a time period by language is trivial:

	SELECT 
	br_language,
	COUNT(DISTINCT (CONCAT(user_id, visit_id))) AS visits
	FROM events
	WHERE {{ENTER-DESIRED-TIME-PERIOD}}
	GROUP BY br_language 
	ORDER BY COUNT(DISTINCT (CONCAT(user_id, visit_id))) DESC ;

<a name="location" />
## 11. Demographics: location

[THIS NEEDS TO BE DONE IN CONJUNCTION WITH MAXIMIND DATABASE OR OTHER GEOIP DATABASE, BASED ON IP - TO WRITE]

<a name="new-vs-returning" />
## 12. Behaviour: new vs returning

Within a given time period, we can compare the number of new visitors (for whom `visit_id` = 1) with returning visitors (for whom `visit_id` > 1). First we create a visits table, and differentiate new visits from returning visits

	CREATE TABLE visits_with_new_vs_returning_info (
	user_id STRING,
	visit_id STRING,
	new TINYINT,
	returning TINYINT
	) ;

	INSERT OVERWRITE TABLE visits_with_new_vs_returning_info
	SELECT
	user_id,
	visit_id,
	IF((MAX(visit_id)=1),1,0),
	IF((MAX(visit_id)>1),1,0)
	FROM events
	WHERE {{INSERT-TIME-PERIOD-RESTRICTIONS}}
	GROUP BY user_id, visit_id ;

Now we can sum over the table to calculate the number of new visits vs returning visits

	SELECT
	COUNT(visit_id) AS total_visits,
	SUM(new) AS new_visitors,
	SUM(returning) AS returning_visitors,
	SUM(new)/COUNT(visit_id) AS fraction_new,
	SUM(returning)/COUNT(visit_id) AS fraction_returning
	FROM visits_with_new_vs_returning_info ;

<a name="frequency" />
## 13. Behaviour: frequency

We can look at the distribution of users by number of visits they have performed in a given time period. First, we count the number of visits each user has performed in the specific time period:

	CREATE TABLE users_by_frequency (
	user_id STRING,
	visit_count INT
	) ;

	INSERT OVERWRITE TABLE users_by_frequency 
	SELECT
	user_id,
	COUNT(DISTINCT (visit_id))
	FROM events
	WHERE {{INSERT-CONDITIONS-FOR-TIME-PERIOD-YOU-WANT-TO-EXAMINE}}
	GROUP BY user_id ;

Now we need to categorise each user by the number of visits performed in the time period, and sum the number of users in each category:

	SELECT
	visit_count,
	COUNT(user_id)
	FROM users_by_frequency
	GROUP BY visit_count ;	

<a name="recency" />
## 14. Behaviour: recency

We can look in a specific time period at each user who has visited, and see how many days it has been since they last visited. First, we identify all the users who have visited in our time frame, and grab the timestamp for their last event for each:

	CREATE TABLE users_by_recency (
	user_id STRING,
	last_action_timestamp STRING,
	days_from_today BIGINT
	) ;

	INSERT OVERWRITE TABLE users_by_recency
	SELECT
	user_id,
	MAX(CONCAT(dt, " ", tm)) AS last_action_timestamp,
	CEILING((UNIX_TIMESTAMP() - UNIX_TIMESTAMP(MAX(CONCAT(dt, " ", tm))))/(60*60*24)) AS days_from_today
	FROM events
	WHERE dt>'{{ENTER-START-DATE}}'
	GROUP BY user_id ;

Now we categorise the users by the number of days since they last visited, and sum the number in each category:

	SELECT 
	days_from_today,
	COUNT( user_id )
	FROM users_by_recency
	GROUP BY days_from_today ;

<a name="engagement" />
## 15. Behaviour: engagement

Google Analytics provides two sets of metrics to indicate *engagement*. We think that both are weak (the duration of each visit and the number of page views per visit). Nonetheless, they are both easy to measure using SnowPlow. To start with the duration per visit, we simply execute the following query:

	SELECT
	user_id,
	visit_id,
	UNIX_TIMESTAMP(MAX(CONCAT(dt," ",tm)))-UNIX_TIMESTAMP(MIN(CONCAT(dt," ",tm))) AS duration
	FROM events
	WHERE {{ANY-TIME-PERIOD-LIMITATIONS}}
	GROUP BY user_id, visit_id ;

In the same way, we can look at the number of page views per visit:

	SELECT
	user_id,
	visit_id,
	COUNT(txn_id)
	FROM events
	WHERE page_title IS NOT NULL
	GROUP BY user_id, visit_id ;

<a name="browser" />
## 16. Technology: browser

Browser details are stored in the events table in the `br_name`, `br_family`, `br_version`, `br_type`, `br_renderingengine`, `br_features` and `br_cookies` fields.

Looking at the distribution of visits by browser is straightforward:

	SELECT 
	br_name,
	COUNT( DISTINCT (CONCAT(user_id, visit_id)))
	FROM events
	WHERE {{ANY DATE CONDITIONS}}
	GROUP BY br_name ;

If you didn't want to distinguish between different versions of the same browser in the results, replace `br_name` in the query with `br_family`.

<a name="os" />
## 17. Technology: operating system

Operating system details are stored in the events table in the `os_name`, `os_family` and `os_manufacturer` fields.

Looking at the distribution of visits by operating system is straightforward:

	SELECT
	os_name,
	COUNT( DISTINCT (CONCAT(user_id, visit_id)))
	FROM events
	WHERE {{ANY DATE CONDITIONS}}
	GROUP BY os_name ;

<a name="mobile" />
## 18. Technology: mobile

Mobile technology details are stored in the 4 device/hardware fields: `dvce_type`, `dvce_ismobile`, `dvce_screenwidth`, `dvce_screenheight`.

To work out how the number of visits in a given time period splits between visitors on mobile and those not, simply execute the following query:

	SELECT
	dvce_ismobile,
	COUNT( DISTINCT (CONCAT(user_id, visit_id)))
	FROM events
	WHERE {{ANY DATE CONDITIONS}}
	GROUP BY dvce_ismobile ;

To break down the number of visits from mobile users by device type execute the following query:

	SELECT
	dvce_type,
	COUNT( DISTINCT (CONCAT(user_id, visit_id)))
	FROM events
	WHERE {{ANY DATE CONDITIONS}} AND dvce_ismobile = TRUE
	GROUP BY dvce_type ;