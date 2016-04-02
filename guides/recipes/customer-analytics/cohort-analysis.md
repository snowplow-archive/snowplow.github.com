---
layout: page
group: guides
subgroup: analytics
breadcrumb: customer analytics
subbreadcrumb: cohort Analysis
title: Cohort Analysis
permalink: /guides/recipes/customer-analytics/cohort-analysis.html
redirect_from:
  - /analytics/recipes/customer-analytics/cohort-analysis.html
  - /analytics/customer-analytics/cohort-analysis.html
  - /documentation/recipes/customer-analytics/cohort-analysis.html
---

# Performing cohort analyses with Snowplow

1. [What is cohort analysis?](#what)
2. [Steps to performing a cohort analysis](#steps)

<div class="html">
<a name="what"><h2>What is a cohort analysis?</h2></a>
</div>

A cohort analysis is a longitudal study that compares two or more groups of customers / users (cohorts) over a period of time. The term cohort analysis therefore encompasses a wide variety of analyses:

1. **We can vary our cohort definitions, depending on what we want to test**. (For example, if we wanted to see if customers acquired from particular marketing channels were more valuable over their lifetimes, we'd define our cohorts based on the customer acquisition channel. On the other hand, if we wanted to see if we've got better at converting freemium users to paid users over time, we'd compare cohorts of users who started with the service a long time ago, with those that started more recently: defining our cohorts by month joined.)
2. **We can vary the metric we are comparing between are cohorts**. (For example, comparing the average lifetime value of customers in each cohort, or retention levels by cohort)

For more detail on the variations possible with cohort analyses, see [this Keplar blog post] [varieties-of-cohort-analyses].

<div class="html">
<a name="steps"><h2>Steps to performing a cohort analysis</h2></a>
</div>

All cohort analyses can be performed with the following steps:

1. [Cohort definition](#cohort-definition): write a query that links each user ID (usually the `domain_userid` or `network_userid`) with with the appropriate cohort (group)
2. [Metric definition](#metric-definition): write a query that calculates the required metric for each user
3. [Combine the results](#combinetheresults) from the above two queries to calculate an aggregated metric for each cohort

<div class="html">
<a name="cohort-definition"><h2>1. Cohort definition</h2></a>
</div>

Regardless of the type of cohort analysis we want to perform, we start by mapping user IDs to cohorts:

{% highlight sql %}
/* Pseudo-SQL */
CREATE VIEW user_cohort_map AS
SELECT
domain_userid,
... AS cohort,
FROM "atomic".events
GROUP BY 1,2;
{% endhighlight %}


### 1a. Defining cohorts by when a user first visits the website

In this case we want to compare users who first visited us in January with those that first visited us in February, March, April etc.

To do this, we need to lookup the timestamp from when a user first visited the site (i.e. the minimum value for `collector_tstamp` for each user) and then group users by month:

{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW recipes_customer.cohort_dfn_by_month_first_touch_website AS
SELECT
domain_userid,
DATE_TRUNC('month', MIN(collector_tstamp)) AS cohort
FROM "atomic".events
GROUP BY 1;
{% endhighlight %}


### 1b. Definine a cohort by when a user first performed a specific action

For many SaaS providers, it is not when a user first visits the site that is really important, but when a user actually signed up for a service, or performed some other specific action for the first time.

In this case we use a variation of the above query:

{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW recipes_customer.cohort_dfn_by_month_signed_up AS
SELECT
domain_userid,
DATE_TRUNC('month', MIN(collector_tstamp)) AS cohort
FROM "atomic".events
WHERE se_action = 'sign-up'
GROUP BY domain_userid;
{% endhighlight %}

Note that the above query assumes that a signup is tracked using [custom structured event tracking] [custom-structured-events], where the event action field is set to 'sign-up'.


### 1c. Definine a cohort by the channel a user was acquired on

This is important if we want to e.g. compare the lifetime value of customers acquired from different channels.

In this case, we need to look again at the first time a user visited the site, see how they were referred to the site, and then classify them by cohort accordingly. If we were interested in compare users who'd found the site organically, vs those from CPC campaigns, vs those referred from 3rd party sites, for example, we'd look at the `mkt_medium` field:

{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW recipes_customer.cohort_dfn_by_paid_channel_acquired_by_month AS
SELECT
domain_userid,
channel_acquired_medium,
channel_acquired_source,
month_acquired
FROM (
	SELECT
	domain_userid,
	mkt_medium AS channel_acquired_medium,
	mkt_source AS channel_acquired_source,
	DATE_TRUNC('month', collector_tstamp) AS month_acquired,
 	rank() over (partition by domain_userid order by collector_tstamp) AS r
	FROM "atomic".events
	WHERE mkt_medium IS NOT NULL
	AND mkt_medium != ''
	AND domain_sessionidx = 1
) t
WHERE r = 1;
{% endhighlight %}



By including the other marketing fields (`mkt_content`, `mkt_name`) we can define cohorts more precisely e.g. to compare users acquired with different keyword combinations, or who had seen different ad versions.

We may also want to define cohorts based on a the `refr_...` rather than `mkt_...` fields (e.g. because we are interested in comparing the behaviour of users from organic rather than paid campaigns), or define our cohorts based a combination of `refr_...` and `mkt_...` fields, e.g.:

{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW recipes_customer.cohort_dfn_by_refr_channel_acquired_by_month AS
SELECT
domain_userid,
refr_acquired_medium,
refr_acquired_source,
month_acquired
FROM (
	SELECT
	domain_userid,
	refr_medium AS refr_acquired_medium,
	refr_source AS refr_acquired_source,
	DATE_TRUNC('month', collector_tstamp) AS month_acquired,
 	rank() over (partition by domain_userid order by collector_tstamp) AS r
	FROM "atomic".events
	WHERE refr_medium != 'internal'
) t
WHERE r = 1;
{% endhighlight %}


### 1d. Other ways to define cohorts

Snowplow makes it possible to define cohorts based on a wide variety of criteria, including definitions obtained from data that exists outside of Snowplow. (This data will need to be uploaded to Snowplow before it can be used.) For more information, [get in touch] [get-in-touch].

<div class="html">
<a name="metric-definition"><h2>2. Metric definitions</h2></a>
</div>

As a second step, we need to define a query that measure the _thing_ we want to compare between our cohorts. We therefore need to populate a table like the one below:

{% highlight sql %}
/* Pseudo-SQL */
CREATE VIEW metric_by_user  AS
SELECT
domain_userid,
DATE_TRUNC('month', collector_tstamp) AS month,
... AS metric
FROM "atomic".events
GROUP BY 1,2;
{% endhighlight %}

There is a wide range `metric_value`s we might want to compare between cohorts: most either get at how engaged a particular cohort is, or how valuable a particular cohort is.

### 2a. Measuring user retention

Tracking retention levels by cohort is one of the most common types of cohort analysis. In this case, we simply check to see how many of our original cohort return, each time period, to continue to use our service.

If retention simply means return to our website, we can measure this using the following query:

{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW recipes_customer.retention_by_user_by_month AS
SELECT
domain_userid,
DATE_TRUNC('month', collector_tstamp) AS months_active
FROM "atomic".events
GROUP BY 1,2;
{% endhighlight %}

### 2b. Measuring user engagement

There are a [wide variety of ways to measure user engagement][user-engagement]. Here we give just a couple of examples:

To start with, we could look at the number days per month that a user visited our website:

{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW recipes_customer.engagement_users_by_days_p_month_on_site AS
SELECT
"Month",
"Days_visited_website",
COUNT(domain_userid) AS "Frequency"
FROM (
	SELECT
	DATE_TRUNC('month', collector_tstamp) AS "Month",
	domain_userid,
	COUNT(DISTINCT(DATE_TRUNC('day', collector_tstamp))) AS "Days_visited_website"
	FROM "atomic".events
	GROUP BY 1,2 ) t
GROUP BY 1,2
ORDER BY 1,2;
{% endhighlight %}

Alternatively, we might want to just look at the average number of visits per month. (Maybe we're doing the analysis for a search or affiliate site, that aims to build a loyal base of repeat users who visit the site frequently but then get off it quickly onto other sites where they make purchases.)

{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW recipes_customer.engagement_users_by_visits_per_month AS
SELECT
"Month",
"Visits_per_month",
COUNT(*) AS "Frequency"
FROM (
	SELECT
	DATE_TRUNC('month', collector_tstamp) AS "Month",
	domain_userid,
	COUNT(DISTINCT(domain_sessionidx)) AS "Visits_per_month"
	FROM "atomic".events
	GROUP BY 1,2
) t
GROUP BY 1,2
ORDER BY 1,2;
{% endhighlight %}

### 2c. Measuring customer value

There are a [wide variety of ways to measure customer value and lifetime value][clv]. Here we give just one example - for a retailer that wants to compare purchase value per month:

{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW recipes_customer.clv_total_transaction_value_by_user_by_month AS
SELECT
domain_userid,
month,
SUM(tr_total) AS "total_transaction_value_by_user"
FROM (
	SELECT
	domain_userid,
	DATE_TRUNC('month', collector_tstamp) AS month,
	tr_orderid,
	tr_total
	FROM "atomic".events
	WHERE event='transaction'
	GROUP BY 1,2,3,4 ) AS t -- deduped transaction table
GROUP BY 1,2;
{% endhighlight %}

### 2d. Other metrics to compare

Snowplow makes it possible to compare a large number of other metrics. For specific help / questions, [get in touch] [get-in-touch].

<a name="combinetheresults"><h2>3. Combining the results in the final cohort analysis</h2></a>

To perform the actual cohort analysis, we `JOIN` our two tables: the user-cohort-map table and our user-metric table, and aggregate results by cohort by time period so that we can compare them alongside each other. For example, if we want to do a cohort analysis, that uses the date that a user first touches our website to define cohort and compares retention rates by cohort, the following query does the tricky:

{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW recipes_customer.cohort_retention_by_month_first_touch AS
SELECT
cohort,
months_active AS month_actual,
rank() OVER (PARTITION BY cohort ORDER BY months_active ASC) AS month_rank,
COUNT(DISTINCT(m.domain_userid)) AS uniques,
COUNT(DISTINCT(m.domain_userid)) / (first_value(COUNT(DISTINCT(m.domain_userid))) OVER (PARTITION BY cohort))::REAL AS fraction_retained
FROM recipes_customer.cohort_dfn_by_month_first_touch_website c
JOIN recipes_customer.retention_by_user_by_month m
ON c.domain_userid = m.domain_userid
GROUP BY 1,2
ORDER BY 1,2;
{% endhighlight %}

If we'd like to compare retention rates between cohorts defined by referer channels:

{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW recipes_customer.cohort_retention_by_week_by_refr_acquired AS
SELECT
refr_acquired_medium,
refr_acquired_source,
weeks_active AS week_actual,
rank() OVER (PARTITION BY refr_acquired_medium, refr_acquired_source ORDER BY weeks_active ASC) AS week_rank,
COUNT(DISTINCT(m.domain_userid)) AS uniques,
COUNT(DISTINCT(m.domain_userid)) / (first_value(COUNT(DISTINCT(m.domain_userid))) OVER (PARTITION BY refr_acquired_medium, refr_acquired_source))::REAL AS fraction_retained
FROM recipes_customer.cohort_dfn_by_refr_channel_acquired_by_week c
JOIN recipes_customer.retention_by_user_by_week m
ON c.domain_userid = m.domain_userid
GROUP BY 1,2,3
ORDER BY 1,2,3;
{% endhighlight %}

For more about cohort analyses and performing them on Snowplow, view the [blog post series] [cohort-analysis-blog-post-series] on [Keplar LLP] [keplarllp].

[user-engagement]: /analytics/customer-analytics/user-engagement.html
[clv]: /analytics/customer-analytics/customer-lifetime-value.html
[cohort-analysis-blog-post-series]: http://www.keplarllp.com/blog/2012/05/performing-cohort-analysis-on-web-analytics-data-using-snowplow
[get-in-touch]: mailto:contact@snowplowanalytics.com
[keplarllp]: http://www.keplarllp.com
[varieties-of-cohort-analyses]: http://www.keplarllp.com/blog/2012/05/on-the-wide-variety-of-different-cohort-analyses-possible-with-snowplow
[custom-structured-events]: https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#wiki-custom-structured-events
