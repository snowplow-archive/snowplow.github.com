---
layout: page
group: analytics
sub_group: customer
title: Measuring user engagement with Snowplow
shortened-link: User engagement
weight: 5
permalink: /documentation/recipes/customer-analytics/user-engagement.html
redirect_from:
  - /analytics/recipes/customer-analytics/user-engagement.html
  - /analytics/customer-analytics/user-engagement.html
---

# Measuring user engagement with Snowplow

1. [What is user engagement?](#what)
2. [Different proxies for measuring user engagement](#proxies)
3. [Measuring the number of days per week / month that users visit the site](#days-per-time-period)
4. [Measuring the number of visits by each user per day / week / month](#visits-per-time-period)
5. [Measuring the number of events per visit](#events-per-visit)
6. [Weighting events by value](#weighted-events-per-visit)

<div class="html">
<a name="what" ><h2>What is user engagement?</h2></a>
</div>

User engagement is a critical metric to understand for every business with an online component. What constitutes "successful engagement" depends very much on the specific business: if you are a content business, you should be interested in getting users to engage either frequently (e.g. every day for newspapers) and deeply (e.g. view several articles per session). For a search engine, successful engagement might look completely different however: a successful engagement might mean finding the right link in as short a time as possible and then disappearing from the site. In that case, shorter visitor duration might indicate a better user experience.

We can differentiate different levels of sophistication of approach when it comes to measuring user engagement. To take the example of a media website, an analyst who distinguishes the breadth of engagement (how wide a variety of content a user engages with) with the depth of engagement (i.e. how deeply a user engages with each article) is more engagement than one who simply looks at the time spent on the website, or the number of page views. However, we might want to be even more sophisticated in our approach: distinguishing users who have to look through a number of articles to find the one they want (which is not a good user experience) with those that engage with multiple articles because the website is good at recommending related content to them every time they finish one article. Learning how to spot the difference between the two cases, one "successful" and one "unsuccessful", takes some care.

Because what constitutes "successful engagement" varies depending on the type of business and type of website, we cannot offer a definitive guide to measuring engagement. Instead, we give a number of different queries, which reflect a number of different approaches to measuring engagement. Snowplow is flexible enough that most businesses should be able to develop robust engagement metrics and use Snowplow to report on those metrics.

Note: for a more in-depth discussion of measuring user engagement, particularly with respect to performing cohort analyses, see [this post][user-engagement-keplar-blog-post] on the Keplar blog covering [different approaches to measuring user engagement][user-engagement-keplar-blog-post] on the [Keplar blog][keplar-blog].

<div class="html">
<a name="proxies"><h2>Different proxies for measuring user engagement</h2></a>
</div>

### Measuring engagement breadth i.e. how often a user visits a site

1. [Number of days per time week / month that user visits site](#days-per-time-period)
2. [Number of visits by each user per day / week / month](#visits-per-time-period)

### Measuring engagement depth

3. [Number of events per visit](#events-per-visit)
4. [Weighting events by value](#weighted-events-per-visit)

<div class="html">
<a name="days-per-time-period"><h3>1. Measuring the number of days per month that users visit the site</h3></a>
</div>

This is a key metric employed by the social network Facebook, amongst others.

To calculate it, calculate for each user how many days they've visited our website for each month:

{% highlight sql %}
/* PostgreSQL / Redshift */
SELECT
DATE_TRUNC('month', collector_tstamp) AS "Month",
domain_userid,
COUNT(DISTINCT(DATE_TRUNC('day', collector_tstamp))) AS "Days_visited_website"
FROM "atomic".events
GROUP BY 1,2
{% endhighlight %}

Now we can aggregate over that data to calculate the distribution, by month, or users, by the number of days they have logged in:

{% highlight sql %}
/* PostgreSQL / Redshift */
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

Note: as well as looking at how the distribution of users by engagement level changes over time, we might also want to look at how it changes for a fixed group of users. This is normally performed as part of a [cohort analysis][cohort-analysis].

<div class="html">
<a name="visits-per-time-period"><h3>2. Number of visits by each user per day / week / month</h3></a>
</div>

A similar metric is calculated by countint the number of visits (sessions) that each user makes in a given time period. The difference here, is that if a user visits a site more than once a day, each individual visit contributes to the "engagement" value assigned to that user. When we look at the number of days per month a user visits a website, by contrast, we do not distinguish users who've visited once from users who've visited twice.

Which approach is better depends on the type of product / service you offer online and the way users engage with it. If users typically open your service in a browser window, and then leave it on (but in the background), distinguishing users who visit once and twice a day may not be meaningful. If each visit is distinct, however, this metric might be preferable.

To calculate it, we first calculate the number of visits performed per user per time period. (In the below example we use a month as a time period):

{% highlight sql %}
/* PostgreSQL / Redshift */
SELECT
DATE_TRUNC('month', collector_tstamp) AS "Month",
domain_userid,
COUNT(DISTINCT(domain_sessionidx)) AS "Visits_per_month"
FROM "atomic".events
GROUP BY 1,2;
) ;
{% endhighlight %}

Now we can aggregate over the above data to view the distribution of users, by numbers of visits per time period, in each time period:

{% highlight sql %}
/* PostgreSQL / Redshift */
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
ORDER BY 1,2
{% endhighlight %}

<div class="html">
<a name="events-per-visit"><h3>3. Number of events per visit</h3></a>
</div>

We can take the number of "events" that occur on each visit as a proxy for how "engaged" the user was during that visit. (With more events indicating a deeper level of engagement.)

Counting the number of events per user per visit is straightforward:

{% highlight sql %}
/* PostgreSQL / Redshift */
SELECT
domain_userid,
COUNT(*) AS "engagement_level"
FROM "atomic".events
GROUP BY 1 ;
{% endhighlight %}

We can then look at the distribution of users by engagement level:

{% highlight sql %}
/* PostgreSQL / Redshift */
SELECT
engagement_level,
COUNT(*)
FROM (
	SELECT
	domain_userid,
	COUNT(*) AS "engagement_level"
	FROM "atomic".events
	GROUP BY 1
) t
GROUP BY 1 ;
{% endhighlight %}

If we want to see whether this metric is improving over time, we can repeat the above, but this time note the date of each visit, and aggregate by time period:

{% highlight mysql %}
/* PostgreSQL / Redshift */
SELECT
Month,
engagement_level,
COUNT(*) AS "Frequency"
FROM (
	SELECT
	DATE_TRUNC('month', collector_tstamp) AS "Month",
	domain_userid,
	COUNT(*) AS "engagement_level"
	FROM "atomic".events
	GROUP BY 1,2
) t
GROUP BY 1,2 ;
{% endhighlight %}

<div class="html">
<a name="weighted-events-per-visit"><h3>4. Weighting events by value</h3></a>
</div>

TO WRITE

## Want to learn more?

Find out [how to perform cohort analysis][cohort-analysis] using Snowplow.

[user-engagement-keplar-blog-post]: http://www.keplarllp.com/blog/2012/05/different-approaches-to-measuring-user-engagement-with-snowplow
[keplar-blog]: http://www.keplarllp.com/blog
[cohort-analysis]: /analytics/customer-analytics/cohort-analysis.html
