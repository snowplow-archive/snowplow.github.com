---
layout: section
category: analytics
analytics_category: customer
title: Cohort Analysis
weight: 6
---

# Performing cohort analyses with SnowPlow

1. [What is cohort analysis?](#what)
2. [Steps to performing a cohort analysis](#steps)

<a name="what" />
## What is a cohort analysis?

A cohort analysis is a longitudal study that compares two or more groups of customers / users (cohorts) over a period of time. The term cohort analysis therefore encompasses a wide variety of analyses:

1. **We can vary our cohort definitions, depending on what we want to test**. (For example, if we wanted to see if customers acquired from particular marketing channels were more valuable over their lifetimes, we'd define our cohorts based on the customer acquisition channel. On the other hand, if we wanted to see if we've got better at converting freemium users to paid users over time, we'd compare cohorts of users who started with the service a long time ago, with those that started more recently: defining our cohorts by month joined.) 
2. **We can vary the metric we are comparing between are cohorts**. (For example, comparing the average lifetime value of customers in each cohort, or the average engagement level.)

For more detail on the variations possible with cohort analyses, see [this Keplar blog post] [varieties-of-cohort-analyses].

<a name="steps" />
## Steps to performing a cohort analysis

All cohort analyses can be performed with the following steps:

1. [Cohort definition](#cohort-definition): write a query that links each user_id with with the appropriate cohort (group)
2. [Metric definition](#metric-definition): write a query that calculates the required metric for each user
3. [Combine the results](#combinetheresults) from the above two queries to calculate an aggregated metric for each cohort

<a name="cohort-definition" />
## 1. Cohort definition

Regardless of the type of cohort analysis we want to perform, we start by creating a table that maps user_ids to cohorts:

{% highlight:mysql %}
CREATE TABLE user_cohort_map (
	cohort STRING,
	user_id STRING
) ;
{% endhighlight %}


### 1a. Defining cohorts by when a user first visits the website

In this case we want to compare users who first visited us in January with those that first visited us in February, March, April etc.

To do this, we need to lookup the date that a user first visited the site (i.e. when `visit_id`=1, check `dt`) and then group users by month:
	
{% highlight:mysql %}
INSERT OVERWRITE TABLE user_cohort_map
SELECT
SUBSTRING(MIN(dt), 1, 7) AS cohort,
user_id
FROM events
WHERE visit_id=1
GROUP BY user_id ;
{% endhighlight %}

The query applies a filter `visit_id=1` so that we only look at first visits. We then group all the results by user_id, so we have one line of data for user. We take the minimum `dt` logged (in case a visit spanned two days) and take a substring of the data to fetch just the month and year. (So `SUBSTRING('2012-05-23',7)='2012-05'`, which is one of our cohorts.)

### 1b. Definine a cohort by when a user first performed a specific action

For many SaaS providers, it is not when a user first visits the site that is really important, but when a user actually signed up for a service, or performed some other specific action for the first time. 

In this case we use a variation of the above query:

{% highlight:mysql %}
INSERT OVERWRITE TABLE user_cohort_map
SELECT
MIN(SUBSTRING(dt, 1, 7)) AS cohort,
user_id
FROM events
WHERE 
ev_category LIKE '<INSERT RELEVANT CATEGORY e.g. subscription>'
AND ev_action LIKE '<INSERT RELEVANT ACTION e.g. signup>' ;
{% endhighlight %} 

Alternatively we may want to define our cohorts based on the first date a user visited a specific page:

{% highlight:mysql %}
INSERT OVERWRITE TABLE user_cohort_map
SELECT
MIN(SUBSTRING(dt, 1, 7)) AS cohort,
user_id
FROM events
WHERE 
pageurl LIKE= '{{INSERT RELEVANT PAGEURL}}' ; 
{% endhighlight %}

### 1c. Definine a cohort by the channel a user was acquired on

This is important if we want to e.g. compare the lifetime value of customers acquired from different channels.

In this case, we need to look again at the first time a user visited the site, see how they were referred to the site, and then classify them by cohort accordingly. If we were interested in compare users who'd found the site organically, vs those from CPC campaigns, vs those referred from 3rd party sites, for example, we'd look at the `mkt_medium` field:

{% highlight:mysql %}
INSERT OVERWRITE TABLE user_cohort_map
SELECT
mkt_medium AS cohort,
user_id
FROM events
WHERE visit_id=1
GROUP BY mkt_medium, user_id ; 
{% endhighlight %}

Alternatively, we might want to distinguish between CPC traffic from Google with other PPC sources. In this case we would use a combination of `mkt_source` and `mkt_medium` to define our cohorts:

{% highlight:mysql %}
INSERT OVERWRITE TABLE user_cohort_map
SELECT
CONCAT(mkt_source, " / ", mkt_medium) AS cohort,
user_id
FROM events
WHERE visit_id=1
GROUP BY mkt_source, mkt_medium, user_id ;
{% endhighlight %}

By including the other marketing fields (`mkt_term`, `mkt_content`, `mkt_campaign`) we can define cohorts more precisely e.g. to compare users acquired with different keyword combinations, or who had seen different ad versions.

### 1d. Other ways to define cohorts

SnowPlow makes it possible to define cohorts based on a wide variety of criteria, including definitions obtained from data that exists outside of SnowPlow. (This data will need to be uploaded to SnowPlow before it can be used.) For more information, [get in touch] [get-in-touch]


<a name="metric-definition" />
## 2. Metric definitions

As a second step, we need to define a query that measure the _thing_ we want to compare between our cohorts. We therefore need to populate a table like the one below:

{% highlight:mysql %}
CREATE TABLE metric_by_user (
user_id STRING,
time_period STRING,
metric_value INT /* May also be FLOAT / DOUBLE */
) ;
{% endhighlight %}

There is a wide range `metric_value`s we might want to compare between cohorts: most either get at how engaged a particular cohort is, or how valuable a particular cohort is. 

### 2a. Measuring user engagement

There are a [wide variety of ways to measure user engagement][user-engagement]. Here we give just a couple of examples:

To start with, we could look at the number of actions / events performed by each user each month:

{% highlight: mysql %}
INSERT OVERWRITE TABLE metric_by_user
SELECT
user_id,
CONCAT(YEAR(dt),"-",MONTH(dt)) AS time_period,
COUNT(txn_id) AS metric_value
FROM events
GROUP BY user_id, YEAR(dt), MONTH(dt) ;
{% endhighlight %}

Alternatively, we might want to just look at the average number of visits per month. (Maybe we're doing the analysis for a search or affiliate site, that aims to build a loyal base of repeat users who visit the site frequently but then get off it quickly onto other sites where they make purchases.)

{% highlight:mysql %}
INSERT OVERWRITE TABLE metric_by_user
SELECT
user_id,
CONCAT(YEAR(dt),"-",MONTH(dt)) AS time_period,
COUNT(visit_id) AS metric_value
FROM events
GROUP BY user_id, YEAR(dt), MONTH(dt) ;
{% endhighlight %}

### 2b. Measuring customer value

There are a [wide variety of ways to measure customer value and lifetime value][clv]. Here we give just one example - for a retailer that wants to compare purchase value per month:

{% highlight:mysql %}
INSERT OVERWRITE TABLE metric_by_user
SELECT
user_id,
CONCAT(YEAR(dt),"-",MONTH(dt)) AS time_period,
SUM(ev_value) AS metric_value
FROM events
WHERE ev_category LIKE 'ecomm'
AND ev_action LIKE 'buy'
GROUP BY user_id,
{% endhighlight %}

### 2c. Other metrics to compare

SnowPlow makes it possible to compare a large number of other metrics. For specific help / questions, [get in touch] [get-in-touch].

<a name="combinetheresults" />
## 3. Combining the results in the final cohort analysis

To perform the actual cohort analysis, all we have to do is to `JOIN` our two tables `user_cohort_map` and `metric_by_user` to aggregate results by cohort by time period so that we can compare them alongside each other:

{% highlight:mysql %}
CREATE TABLE cohort_analysis_results (
cohort STRING,
time_period STRING,
metric_value FLOAT /* Can be DOUBLE */
) ;

INSERT OVERWRITE TABLE cohort_analysis_results
SELECT
c.cohort,
m.time_period,
AVG(metric_value)
FROM
user_cohort_map c
JOIN metric_by_user m
ON c.user_id = m.user_id
GROUP BY c.cohort, m.time_period ;
{% endhighlight %}

Note: this is the same query *regardless* of what cohort definition was chosen in step 1, or what metric definition was chosen in step 2.

In the above case, we've used the `AVG()` function to aggregate the metric over all users in each cohort. This is the most common aggregation function to use with SnowPlow. To use a more unusual function (e.g. a percentile), it may be necessary to write a user-defined-function (UDF) to perform the required aggregation.

For more about cohort analyses and performing them on SnowPlow, view the [blog post series] [cohort-analysis-blog-post-series] on [Keplar LLP] [keplarllp].

[user-engagement]: /analytics/customer-analytics/user-engagement.html
[clv]: /analytics/customer-analytics/customer-lifetime-value.html
[cohort-analysis-blog-post-series]: http://www.keplarllp.com/blog/2012/05/performing-cohort-analysis-on-web-analytics-data-using-snowplow
[get-in-touch]: mailto:contact@snowplowanalytics.com
[keplarllp]: http://www.keplarllp.com
[varieties-of-cohort-analyses]: http://www.keplarllp.com/blog/2012/05/on-the-wide-variety-of-different-cohort-analyses-possible-with-snowplow