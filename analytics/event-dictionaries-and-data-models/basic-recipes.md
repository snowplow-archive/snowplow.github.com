---
layout: page
group: analytics
sub_group: foundation
title: Basic recipes
shortened-link: Basic recipes
weight: 9
---

<div class="html">
<a name="top"><h1>Getting familiar with Snowplow data using some simple recipes</h1></a>
</div>

The following queries return basic web analytics data that someone could expect from any standard web analytics package. These are *not* the queries that Snowplow was designed to perform: we built Snowplow to enable analysts to run queries on web analytics data that are **not** possible with other web analytics programs. These queries return the results that **all** web analytics queries return. However, running them can be useful for an analyst to validate Snowplow has been setup correctly (by comparing the output against e.g. Google Analytics), and help her get familiar with writing queries in Snowplow.

For users who are getting started with Snowplow, but are not that familiar with SQL, we recommend consulting our [quick-start guide to using SQL] (/analytics/tools-and-techniques/beginners-guide-to-using-sql-to-query-snowplow-data.html).

Note that in general we expect that most users will run queries against the tables produced in the data-modeling step in the data pipeline, detailed in the [next section](data-modeling.html). However, running these simple queries against the underlying event-level data is a useful exercise for the analyst who wants to become more familiar with Snowplow data, especially data collected from a web analytics enviornment.


1. [Number of unique visitors](#counting-unique-visitors)
2. [Number visits](#counting-visits)
3. [Number of pageviews](#counting-pageviews)
4. [Number of events](#counting-events)
5. [Pages per visit](#pages-per-visit)
6. [Bounce rate](#bounce-rate)
7. [% New visits](#new-visits)
8. [Average visitor duration](#duration)
9. [Demographics: language](#language)
10. [Demographics: location](#location)
11. [Behavior: new vs returning](#new-vs-returning)
12. [Behavior: frequency](#frequency)
13. [Behavior: recency](#recency)
14. [Behavior: engagement](#engagement)
15. [Technology: browser](#browser)
16. [Technology: operating system](#os)
17. [Technology: mobile](#mobile)

<div class="html">
<a name="counting-unique-visitors"><h2>1. Number of unique visitors </h2></a>
</div>

The number of unique visitors can be calculated by summing the number of distinct `domain_userid`s in a specified time period. (Because each user is assigned a unique domain_userid, based on a lack of Snowplow tracking cookies on their browser):

{% highlight sql %}
/* Redshift / PostgreSQL */
SELECT
DATE_TRUNC('day', collector_tstamp) as "Date",
COUNT(DISTINCT(domain_userid)) as "Uniques"
FROM "atomic".events
WHERE collector_tstamp > current_date - integer '31'
GROUP BY 1
ORDER BY 1;
{% endhighlight %}

In ChartIO:

![uniques-by-day][uniques-by-day]

[Back to top](#top)

<div class="html">
<a name="counting-visits"><h2>2. Number of visits</h2></a>
</div>

Because each user might visit a site more than once, summing the number of `domain_userid`s returns the number if *visitors*, NOT the number of *visits*. Every time a user visits the site, however, Snowplow assigns that session with a `domain_sessionidx` (e.g. `1` for their first visit, `2` for their second.) Hence, to count the number of visits in a time period, we concatenate the unique `domain_userid` with the `domain_sessionidx` and then count the number of distinct concatenated entry in the events table:

{% highlight sql %}
/* Redshift / PostgreSQL */
SELECT
DATE_TRUNC('day', collector_tstamp) as "Date",
COUNT(DISTINCT(domain_userid || '-' || domain_sessionidx)) as "Visits"
FROM "atomic".events
WHERE collector_tstamp > current_date - integer '31'
GROUP BY 1
ORDER BY 1;
{% endhighlight %}

In ChartIO:

![visits-by-day][visits-by-day]

[Back to top](#top)

<div class="html">
<a name="counting-pageviews"><h2>3. Number of page views</h2></a>
</div>

Page views are one type of event that are stored in the Snowplow events table. They can easily be identified using the `event` field, which is set to 'page_view'.

To count the number of page views by day, then we simply execute the following query:

{% highlight sql %}
/* Redshift / PostgreSQL */
SELECT 
DATE_TRUNC('day', collector_tstamp) AS "Date",
COUNT(*) AS "page_views"
FROM "atomic".events
WHERE collector_tstamp > current_date - integer '31'
AND event = 'page_view'
GROUP BY 1
ORDER BY 1;
{% endhighlight %}

In ChartIO:

![pageviews-by-day][pageviews-by-day]

[Back to top](#top)

<div class="html">
<a name="counting-events"><h2>4. Number of events</h2></a>
</div>

Although the number of page views is a standard metric in web analytics, this reflects the web's history as a set of hyperlinked documents rather than the modern reality of web applications that are comprise lots of AJAX events (that need not necessarily result in a page load.)

As a result, counting the total number of events (including page views but also other AJAX events) is actually a more meaningful thing to do than to count the number of page views, as we have done above. We recommend setting up Snowplow so that *all* events / actions that a user takes are tracked. Hence, running the below queries should return a total sum of events on the site by time period:

{% highlight sql %}
/* Redshift / PostgreSQL */
SELECT
DATE_TRUNC('day', collector_tstamp) AS "Date",
event,
COUNT(*) AS "Number"
FROM "atomic".events
WHERE collector_tstamp > current_date - integer '31'
GROUP BY 1,2
ORDER BY 1,2;
{% endhighlight %}

In ChartIO:

![events-by-day][events-by-day]

[Back to top](#top)

 <a name="pages-per-visit"><h2>5. Pages per visit</h2></a>

The number of pages per visit can be calculated by visit very straightforwardly:

{% highlight sql %}
/* Redshift / PostgreSQL */
SELECT
domain_userid || '-' || domain_sessionidx AS "session",
COUNT(*) as "pages_visited"
FROM events
WHERE event = 'page_view'
AND collector_tstamp > current_date - integer '31' 
GROUP BY 1
{% endhighlight %}

We can then aggregate our data by number of pages per visit, to produce a frequency table:

{% highlight sql %}
/* Redshift / PostgreSQL */
CREATE VIEW basic_recipes.pages_per_visit AS
SELECT
pages_visited,
COUNT(*) as "frequency"
FROM (
	SELECT
	domain_userid || '-' || domain_sessionidx AS "session",
	COUNT(*) as "pages_visited"
	FROM events
	WHERE event = 'page_view'
	AND collector_tstamp > current_date - integer '31' 
	GROUP BY 1
) AS page_view_per_visit
GROUP BY 1
ORDER BY 1;
{% endhighlight %}

In ChartIO:

![page-views-per-visit-frequency-table-chartio][page-views-per-visit-frequency-table-chartio]

[Back to top](#top)

<div class="html">
<a name="bounce-rate"><h2>6. Bounce rate</h2></a>
</div>

First we need to identify all the sessions that were 'bounces'. These are visits where there is only a single event captured: the initial page view:

{% highlight sql %}
/* Redshift / PostgreSQL */
SELECT
domain_userid,
domain_sessionidx,
MIN(collector_tstamp) as "time_first_touch",
COUNT(*) as "number_of_events",
CASE WHEN count(*) = 1 THEN 1 ELSE 0 END AS bounces
FROM events
WHERE collector_tstamp > current_date - integer '31'
GROUP BY 1,2;
{% endhighlight %}

This query returns a line of data for every session. For each, it logs a timestamp, the number of events, and a flag that is set to 1 if the visitor bounced.

To calculate bounce rate by day, we take the above table, aggregate the results by day, sum the number of bounces and divide it by the total number of sessions:

{% highlight sql %}
/* Redshift / PostgreSQL */
SELECT
DATE_TRUNC('day', time_first_touch) AS "Date",
SUM(bounces)::REAL/COUNT(*) as "Bounce rate"
FROM (
	SELECT
	domain_userid,
	domain_sessionidx,
	MIN(collector_tstamp) as "time_first_touch",
	COUNT(*) as "number_of_events",
	CASE WHEN count(*) = 1 THEN 1 ELSE 0 END AS bounces
	FROM "atomic".events
	WHERE collector_tstamp > current_date - integer '31'
	GROUP BY 1,2
) v
GROUP BY 1
ORDER BY 1;
{% endhighlight %}

Note that we have to cast sum(bounces) as a 'real' number, to force Redshift / PostgreSQL to output a real number rather than an integer for the bounce rate.

In ChartIO:

![fraction-of-visits-per-day-that-bounce][fraction-of-visits-per-day-that-bounce]

[Back to top](#top)

<div class="html">
<a name="new-visits"><h2>7. % New visits</h2></a>
</div>

A new visit is easily identified as a visit where the domain_sessionidx = 1. Hence, to calculate the % of new visits, we need to sum all the visits where `domain_sessionidx` = 1 and divide by the total number of visits, in the time period.

First, we create a table with every visit stored, and identify which visits were "new":

{% highlight mysql %}
/* Redshift / PostgreSQL */
SELECT
MIN(collector_tstamp) AS "time_first_touch",
domain_userid, 
domain_sessionidx,
CASE WHEN domain_sessionidx = 1 THEN 1 ELSE 0 END AS "first_visit"
FROM events
WHERE collector_tstamp > current_date - integer '31'
GROUP BY domain_userid, domain_sessionidx;
{% endhighlight %}

Then we aggregate the visits over our desired time period, and calculate the fraction of them that are new:

{% highlight mysql %}
/* Redshift / PostgreSQL */
SELECT
DATE_TRUNC('day', time_first_touch) AS "Date",
SUM(first_visit)::REAL/COUNT(*) as "fraction_of_visits_that_are_new"
FROM (
	SELECT
	MIN(collector_tstamp) AS "time_first_touch",
	domain_userid, 
	domain_sessionidx,
	CASE WHEN domain_sessionidx = 1 THEN 1 ELSE 0 END AS "first_visit"
	FROM "atomic".events
	WHERE collector_tstamp > current_date - integer '31'
	GROUP BY domain_userid, domain_sessionidx) v
GROUP BY 1
ORDER BY 1;
{% endhighlight %}

In ChartIO:

![fraction-of-visits-per-day-where-the-visitor-is-new][fraction-of-visits-per-day-where-the-visitor-is-new]

[Back to top](#top)

<div class="html">
<a name="duration"><h2>8. Average visitor duration</h2></a>
</div>

To calculate this, 1st we need to calculate the duration of every visit:

{% highlight mysql %}
/* Redshift / PostgreSQL */
SELECT
domain_userid,
domain_sessionidx,
MIN(collector_tstamp) as "start_time",
MAX(collector_tstamp) as "finish_time",
MAX(collector_tstamp) - min(collector_tstamp) as "duration"
FROM "atomic".events
WHERE collector_tstamp > current_date - integer '31'
GROUP BY 1,2;
{% endhighlight %}

Then we simply average visit durations over the time period we're interested e.g. by day:

{% highlight mysql %}
/* Redshift / PostgreSQL */
SELECT
DATE_TRUNC('day', start_time) AS "Date",
AVG(duration)/1000000 as "average_visit_duration_seconds"
FROM (
	SELECT
	domain_userid,
	domain_sessionidx,
	MIN(collector_tstamp) as "start_time",
	MAX(collector_tstamp) as "finish_time",
	MAX(collector_tstamp) - min(collector_tstamp) as "duration"
	FROM "atomic".events
	WHERE collector_tstamp > current_date - integer '31'
	GROUP BY 1,2
) v
group by 1
order by 1;
{% endhighlight %}

[Back to top](#top)

<div class="html">
<a name="language"><h2>9. Demographics: language</h2></a>
</div>

For each event the browser language is stored in the `br_language` field. As a result, counting the number of visitors in a time period by language is trivial:

{% highlight mysql %}
/* Redshift / PostgreSQL */
SELECT
br_lang,
COUNT(DISTINCT(domain_userid)) as "visitors"
FROM "atomic".events
WHERE collector_tstamp > current_date - integer '31'
GROUP BY br_lang
ORDER BY 2 DESC;
{% endhighlight %}

In ChartIO:

![visitors-by-language-chartio][visitors-by-language-chartio]

[Back to top](#top)

<div class="html">
<a name="location"><h2>10. Demographics: location</h2></a>
</div>

We can identify the geographic location of users using the `geo_country`, `geo_region`, `geo_city`, `geo_zipcode`, `geo_latitude` and `geo_longitude` fields.

To calculate the number of visitors in the last month by country, simply execute:

{% highlight mysql %}
/* Redshift / PostgreSQL */
SELECT
geo_country,
COUNT(DISTINCT(domain_userid)) as "visitors"
FROM "atomic".events
WHERE collector_tstamp > current_date - integer '31'
GROUP BY 1
ORDER BY 2 DESC;
{% endhighlight %}

In ChartIO:

![visitors-by-country][visitors-by-country-chartio]

To create a geographical plot, you'll need to use another tool like [R] [r] or [Tableau] [tableau].

[Back to top](#top)

<div class="html">
<a name="new-vs-returning"><h2>11. Behavior: new vs returning</h2></a>
</div>

Within a given time period, we can compare the number of new visitors (for whom `domain_sessionidx` = 1) with returning visitors (for whom `domain_sessionidx` > 1): 

{% highlight sql %}
/* Redshift / PostgreSQL */
SELECT
domain_userid,
domain_sessionidx,
MIN(collector_tstamp) as time_first_touch,
CASE WHEN domain_sessionidx = 1 THEN 'new' ELSE 'returning' END AS "new_vs_returning"
FROM "atomic".events
WHERE collector_tstamp > current_date - integer '31'
GROUP BY domain_userid, domain_sessionidx;
{% endhighlight %}

Then we can aggregate them by time period, to get the total new vs returning e.g. by day:

{% highlight sql %}
/* Redshift / PostgreSQL */
SELECT
DATE_TRUNC('day', time_first_touch) AS "Date",
SUM(first_visit)::REAL/COUNT(*) as "fraction_of_visits_that_are_new"
FROM (
	SELECT
	MIN(collector_tstamp) AS "time_first_touch",
	domain_userid, 
	domain_sessionidx,
	CASE WHEN domain_sessionidx = 1 THEN 1 ELSE 0 END AS "first_visit"
	FROM "atomic".events
	WHERE collector_tstamp > current_date - integer '31'
	GROUP BY domain_userid, domain_sessionidx) v
GROUP BY 1
ORDER BY 1;
{% endhighlight %}

In ChartIO:

![new-vs-returning-visits-by-day][new-vs-returning-visits-by-day]

[Back to top](#top)

<div class="html">
<a name="frequency"><h2>12. Behavior: frequency</h2></a>
</div>

We can plot the distribution of visits in a time period by the number of visits each visitor has performed:

{% highlight sql %}
SELECT
domain_sessionidx as "Number of visits",
COUNT(DISTINCT(domain_userid)) as "Frequency"
FROM "atomic".events
WHERE collector_tstamp > current_date - integer '31'
GROUP BY 1
ORDER BY 2;
{% endhighlight %}

In ChartIO:

![distribution-of-visitors-by-number-of-visits][distribution-of-visitors-by-number-of-visits]

[Back to top](#top)

<div class="html">
<a name="recency"><h2>13. Behavior: recency</h2></a>
</div>

We can plot the distribution of visits by the number of days since the previous visit. To do this, we first identify all the visits in our time period:

{% highlight mysql %}
/* Redshift / PostgreSQL */
SELECT
domain_userid,
domain_sessionidx,
domain_sessionidx - 1 as "previous_domain_sessionidx",
MIN(collector_tstamp) as "time_first_touch"
FROM "atomic".events
WHERE collector_tstamp > current_date - integer '31'
GROUP BY 1, 2;
{% endhighlight %}

We can join the above table with a similar table, but join each visit to data for the previous visit, so we can calculate the number of days between visits:

{% highlight mysql %}
/* Redshift / PostgreSQL */
SELECT
n.domain_userid,
n.domain_sessionidx,
EXTRACT(EPOCH FROM (n.time_first_touch - p.time_first_touch))/3600/24 as "days_between_visits",
CASE
	WHEN n.domain_sessionidx = 1 THEN '0'
	WHEN extract(epoch FROM (n.time_first_touch - p.time_first_touch))/3600/24 < 1 THEN '1'
	WHEN extract(epoch FROM (n.time_first_touch - p.time_first_touch))/3600/24 < 2 THEN '2'
	WHEN extract(epoch FROM (n.time_first_touch - p.time_first_touch))/3600/24 < 3 THEN '3'
	WHEN extract(epoch FROM (n.time_first_touch - p.time_first_touch))/3600/24 < 4 THEN '4'
	WHEN extract(epoch FROM (n.time_first_touch - p.time_first_touch))/3600/24 < 5 THEN '5'
	WHEN extract(epoch FROM (n.time_first_touch - p.time_first_touch))/3600/24 < 10 THEN '6-10'
	WHEN extract(epoch FROM (n.time_first_touch - p.time_first_touch))/3600/24 < 25 THEN '11-25'
	ELSE '25+' END as "Days between visits"
FROM (
	SELECT
	domain_userid,
	domain_sessionidx,
	domain_sessionidx - 1 as "previous_domain_sessionidx",
	MIN(collector_tstamp) as "time_first_touch"
	FROM "atomic".events
	WHERE collector_tstamp > current_date - integer '31'
	GROUP BY 1,2
) n
LEFT JOIN (
	SELECT
	domain_userid,
	domain_sessionidx,
	MIN(collector_tstamp) as "time_first_touch"
	FROM "atomic".events
	GROUP BY 1,2
) p on n.previous_domain_sessionidx = p.domain_sessionidx
and n.domain_userid = p.domain_userid;
{% endhighlight %}

Finally, we group the results by the number of days between visits, to plot a frequency table:

{% highlight sql %}
/* Redshift / PostgreSQL */
SELECT
"Days between visits",
COUNT(*) as "Number of visits"
FROM (
	SELECT
	n.domain_userid,
	n.domain_sessionidx,
	EXTRACT(EPOCH FROM (n.time_first_touch - p.time_first_touch))/3600/24 as "days_between_visits",
	CASE
		WHEN n.domain_sessionidx = 1 THEN '0'
		WHEN extract(epoch FROM (n.time_first_touch - p.time_first_touch))/3600/24 < 1 THEN '1'
		WHEN extract(epoch FROM (n.time_first_touch - p.time_first_touch))/3600/24 < 2 THEN '2'
		WHEN extract(epoch FROM (n.time_first_touch - p.time_first_touch))/3600/24 < 3 THEN '3'
		WHEN extract(epoch FROM (n.time_first_touch - p.time_first_touch))/3600/24 < 4 THEN '4'
		WHEN extract(epoch FROM (n.time_first_touch - p.time_first_touch))/3600/24 < 5 THEN '5'
		WHEN extract(epoch FROM (n.time_first_touch - p.time_first_touch))/3600/24 < 10 THEN '6-10'
		WHEN extract(epoch FROM (n.time_first_touch - p.time_first_touch))/3600/24 < 25 THEN '11-25'
		ELSE '25+' END as "Days between visits"
	FROM (
		SELECT
		domain_userid,
		domain_sessionidx,
		domain_sessionidx - 1 as "previous_domain_sessionidx",
		MIN(collector_tstamp) as "time_first_touch"
		FROM "atomic".events
		WHERE collector_tstamp > current_date - integer '31'
		GROUP BY 1,2
	) n
	LEFT JOIN (
		SELECT
		domain_userid,
		domain_sessionidx,
		MIN(collector_tstamp) as "time_first_touch"
		FROM "atomic".events
		GROUP BY 1,2
	) p ON n.previous_domain_sessionidx = p.domain_sessionidx
	AND n.domain_userid = p.domain_userid
) t
GROUP BY 1
ORDER BY 1;
{% endhighlight %}

In ChartIO:

![days-since-last-visit-in-chartio][days-since-last-visit-in-chartio]

[Back to top](#top)

<div class="html">
<a name="engagement"><h2>14. Behavior: engagement</h2></a>
</div>

Google Analytics provides two sets of metrics to indicate *engagement*:

1. Visit duration
2. Page depth (i.e. number of pages visited per session)

Both of these are flakey and unsophisticated measures of engagement. Nevertheless, they are easy to report on in Snowplow. To plot visit duration, we execute the following query: 

{% highlight sql %}
/* Redshift / PostgreSQL */
SELECT
domain_userid,
domain_sessionidx,
CASE 
	WHEN extract(EPOCH FROM (MAX(dvce_tstamp)-MIN(dvce_tstamp))) > 1800 THEN 'g. 1801+ seconds' 
	WHEN extract(EPOCH FROM (MAX(dvce_tstamp)-MIN(dvce_tstamp))) > 600 THEN 'f. 601-1800 seconds' 
	WHEN extract(EPOCH FROM (MAX(dvce_tstamp)-MIN(dvce_tstamp))) > 180 THEN 'e. 181-600 seconds' 
	WHEN extract(EPOCH FROM (MAX(dvce_tstamp)-MIN(dvce_tstamp))) > 60 THEN 'd. 61 - 180 seconds' 
	WHEN extract(EPOCH FROM (MAX(dvce_tstamp)-MIN(dvce_tstamp))) > 30 THEN 'c. 31-60 seconds' 
	WHEN extract(EPOCH FROM (MAX(dvce_tstamp)-MIN(dvce_tstamp))) > 10 THEN 'b. 11-30 seconds' 
	ELSE 'a. 0-10 seconds' END AS "Visit duration"
FROM "atomic".events
WHERE collector_tstamp > current_date - integer '31'
GROUP BY 1,2;
{% endhighlight %}

Then we aggregate the results for each bucket, so we have frequency by bucket:

{% highlight mysql %}
/* Redshift / PostgreSQL */
SELECT
"Visit duration",
COUNT(*) as "Number of visits"
FROM (
	SELECT
	domain_userid,
	domain_sessionidx,
	CASE 
		WHEN extract(EPOCH FROM (MAX(dvce_tstamp)-MIN(dvce_tstamp))) > 1800 THEN 'g. 1801+ seconds' 
		WHEN extract(EPOCH FROM (MAX(dvce_tstamp)-MIN(dvce_tstamp))) > 600 THEN 'f. 601-1800 seconds' 
		WHEN extract(EPOCH FROM (MAX(dvce_tstamp)-MIN(dvce_tstamp))) > 180 THEN 'e. 181-600 seconds' 
		WHEN extract(EPOCH FROM (MAX(dvce_tstamp)-MIN(dvce_tstamp))) > 60 THEN 'd. 61 - 180 seconds' 
		WHEN extract(EPOCH FROM (MAX(dvce_tstamp)-MIN(dvce_tstamp))) > 30 THEN 'c. 31-60 seconds' 
		WHEN extract(EPOCH FROM (MAX(dvce_tstamp)-MIN(dvce_tstamp))) > 10 THEN 'b. 11-30 seconds' 
		ELSE 'a. 0-10 seconds' END AS "Visit duration"
	FROM "atomic".events
	WHERE collector_tstamp > current_date - integer '31'
	GROUP BY 1,2
) t
GROUP BY 1
ORDER BY 1;
{% endhighlight %}

We can then plot the results in ChartIO:

![visits-by-duration-chartio][visits-by-duration-chartio]

We can also look at the number of page views per visit:

{% highlight sql %}
/* Redshift / PostgreSLQ */ 
select
domain_userid,
domain_sessionidx,
count(*) as "Page views per visit"
from events
where collector_tstamp > current_date - integer '31'
and event = 'page_view'
group by domain_userid, domain_sessionidx;
{% endhighlight %}

We then aggregate those results together by the number of page views per visit

{% highlight sql %}
/* Redshift / PostgreSLQ */
SELECT
"Page views per visit",
COUNT(*) as "Number of visits"
FROM (
	SELECT
	domain_userid,
	domain_sessionidx,
	COUNT(*) as "Page views per visit"
	FROM "atomic".events
	WHERE collector_tstamp > current_date - integer '31'
	AND event = 'page_view'
	GROUP BY 1,2
) t
GROUP BY 1
ORDER BY 1;
{% endhighlight %}

In ChartIO:

![visits-in-the-last-month-by-page-depth][visits-in-the-last-month-by-page-depth]


[Back to top](#top)

<div class="html">
<a name="browser"><h2>15. Technology: browser</h2></a>
</div>

Browser details are stored in the events table in the `br_name`, `br_family`, `br_version`, `br_type`, `br_renderingengine`, `br_features` and `br_cookies` fields.

Looking at the distribution of visits by browser is straightforward:

{% highlight sql %}
/* Redshift / PostgreSQL */
SELECT
br_family as "Browser",
COUNT(DISTINCT(domain_userid || domain_sessionidx)) as "Visits"
FROM "atomic"events
WHERE collector_tstamp > current_date - integer '31'
GROUP BY 1
ORDER BY 2 DESC;
{% endhighlight %}

In ChartIO:

![visits-by-browser-type][visits-by-browser-type]


[Back to top](#top)

<div class="html">
<a name="os"><h2>16. Technology: operating system</h2></a>
</div>

Operating system details are stored in the events table in the `os_name`, `os_family` and `os_manufacturer` fields.

Looking at the distribution of visits by operating system is straightforward:

{% highlight sql %}
/* Redshift / PostgreSQL */
CREATE VIEW basic_recipes.technology_os AS
SELECT 
os_name as "Operating System",
COUNT(DISTINCT(domain_userid || domain_sessionidx)) as "Visits"
FROM "atomic".events
WHERE collector_tstamp > current_date - integer '31'
GROUP BY 1 
ORDER BY 2 DESC; 
{% endhighlight %}

Again, we can plot the results in ChartIO:

![visits-by-operating-system][visits-by-operating-system]

[Back to top](#top)

<div class="html">
<a name="mobile"><h2>17. Technology: mobile</h2></a>
</div>

To work out how the number of visits in a given time period splits between visitors on mobile and those not, simply execute the following query:

{% highlight mysql %}
/* Redshift / PostgreSQL */
CREATE VIEW basic_recipes.technology_mobile AS
SELECT 
CASE WHEN dvce_ismobile=1 THEN 'mobile' ELSE 'desktop' END AS "Device type",
COUNT(DISTINCT(domain_userid || domain_sessionidx)) as "Visits"
FROM "atomic".events
WHERE collector_tstamp > current_date - integer '31'
GROUP BY 1;
{% endhighlight %}

Plotting the results in ChartIO:

![split-in-visits-by-mobile-vs-desktop][split-in-visits-by-mobile-vs-desktop]

[Back to top](#top)


[page-ping]: /blog/2012/12/26/snowplow-0.6.5-released/
[measure-user-engagement]: /analytics/customer-analytics/user-engagement.html
[uniques-by-day]: /assets/img/analytics/basic-recipes/uniques-by-day-chartio.png
[visits-by-day]: /assets/img/analytics/basic-recipes/visits-by-day-chartio.png
[pageviews-by-day]: /assets/img/analytics/basic-recipes/pageviews-by-day-chartio.png
[events-by-day]: /assets/img/analytics/basic-recipes/events-by-day-chartio.png
[avg-pvs-per-visit-per-week-chartio]: /assets/img/analytics/basic-recipes/avg-pvs-per-visit-per-week.png
[fraction-of-visits-per-day-that-bounce]: /assets/img/analytics/basic-recipes/fraction-of-visits-per-day-that-bounce-chartio.png
[fraction-of-visits-per-day-where-the-visitor-is-new]: /assets/img/analytics/basic-recipes/fraction-of-visits-per-day-where-the-visitor-is-new-chartio.png
[average-duration-by-month]: /assets/img/analytics/basic-recipes/average-visit-duration-by-month-chartio.png
[visitors-by-language-chartio]: /assets/img/analytics/basic-recipes/visitors-by-language-chartio.png
[new-vs-returning-visits-by-day]: /assets/img/analytics/basic-recipes/new-vs-returning-visits-by-day-chartio.png
[distribution-of-visitors-by-number-of-visits]: /assets/img/analytics/basic-recipes/distribution-of-visitors-by-number-of-visits.png
[days-since-last-visit-in-chartio]: /assets/img/analytics/basic-recipes/days-since-last-visit-in-chartio.png
[visits-by-duration-chartio]: /assets/img/analytics/basic-recipes/visits-by-duration-chartio.png
[visits-in-the-last-month-by-page-depth]: /assets/img/analytics/basic-recipes/visits-in-last-month-by-page-depth-chartio.png
[visits-by-browser-type]: /assets/img/analytics/basic-recipes/visits-by-browser-type-chartio.png
[visits-by-operating-system]: /assets/img/analytics/basic-recipes/visits-by-operating-system-chartio.png
[split-in-visits-by-mobile-vs-desktop]: /assets/img/analytics/basic-recipes/split-in-visits-by-mobile-vs-desktop-chartio.png
[page-views-per-visit-frequency-table-chartio]: /assets/img/analytics/basic-recipes/page-views-per-visit-frequency-table-chartio.png
[visitors-by-country-chartio]: /assets/img/analytics/basic-recipes/visitors-by-country-chartio.png 
[tableau]: http://www.tableausoftware.com/
[r]: http://cran.r-project.org/

