---
layout: post
title: Using ChartIO to visualise and interrogate Snowplow data
title-short: Using ChartIO to visualise Snowplow data
tags: [chartio, analytics, data visualization, query]
category: Analytics
author: yali
---

In the last couple of weeks, we have been experimenting with [ChartIO] [chartio] - a hosted BI tool for visualising data and creating dashboards. So far, we are very impressed - ChartIO is an excellent analytics tool to use to interrogate and visualise Snowplow data. Given the number of requests we get from Snowplow users to recommend tools to assist with analytics on Snowplow data, we thought it well worth sharing why ChartIO is so good, and give some examples of analyses on Snowplow data using ChartIO.

![chartio-pic-0] [chartio-pic-0]

In this post we cover:

1. [Why is ChartIO so good?] [why]
2. [Setting up ChartIO to work with Snowplow] [setup]
3. [Tutorial: using ChartIO to unpick the drivers of engagement with a site] [engagement]

<h2><a name="why">Why is ChartIO so good?</a></h2>

ChartIO is great for two reasons:

1. **Fast**. ChartIO is quick to setup. (Because it is a hosted product, with a very nice script for establishing an SSH connection between your database and the ChartIO web application.) At the same time, it is very quick, once a data connection is established, to create new graphs and charts and embed them in dashboards.
2. **Easy**. ChartIO is easy to use. This is partly because the UI is really nice. (Lots of drag and drop, easy-to-follow workflow.) But it is also because ChartIO is very simple: it lacks a lot of the complexity of more traditional BI tools like Microstrategy and Pentaho. It is a lot simpler even than more recent innovations in the space like Tableau. Whilst this means it is a bit less powerful, the upside is the tool is a lot easier to use than comparable tools.

ChartIO has one enormous advantage that makes it especially well suited to querying Snowplow data: it does not require the data to be in a specific format before it will let users chart / graph it. That compares with the vast majority of tools (including Tableau, Qlikview, Pentaho and Microstrategy) that all require that any data is structured in a format suitable for [OLAP analysis] [olap] before they can be used. (We covered how to convert Snowplow data into that format in the [analytics cookbook] [olap].) ChartIO **does** work better with data that is formatted in this way, but it still works beautifully with the data as is. As a result, **ChartIO is, we believe, the easiest way to build graphs and dashboards on top of Snowplow data**.

<!--more-->

<h2><a name="setup">Setting up ChartIO to work with Snowplow</a></h2>

You can get started with ChartIO by signing up to a free 30 day trial. Connecting it to Snowplow data is straightforward: full instructions can be found [on the setup guide] [setup-chartio], including how to create your first graph using Snowplow data in ChartIO.


<h2><a name="engagement">Tutorial: using ChartIO to unpick the drivers of engagement with a site</a></h2>

### Before we get started: how will we measure engagement?

As we discuss in detail in the [analytics cookbook] [measuring-engagement], there are many possible ways to measure engagement, and Snowplow supports all of them. We need to pick one or two to use in this tutorial, although it would be possible to perform the analyses described with any measure that suits your business.

For this tutorial we're going to use data from [Psychic Bazaar] [pbz], an online retailer of esoteric products. For an online retailer, whether a visitors makes a purchase is generally more interesting than whether they 'engage' in vaguer terms. So we will use conversion rate as our first measure of engagement. However, to keep our tutorial interesting to people who want to perform the analysis on non-retail sites, we will also look at number of page views over a period of time as a measure of engagement.

### Establishing the baseline: measuring engagement over time

Lets start by looking out how engagement has changed over time on Psychic Bazaar. Let's create a new dashboard to explore this issue in particular. Log into ChartIO and click on the **+Dashboard** link on the left hand menu to create a new dashboard.

![chartio-pic-1] [chartio-pic-1]

Give the dashboard a suitable name and description and then click the relevant button to craete it. Now we need to add a chart to it. Click on the **+Chart** link on the right hand menu. The Chart Creator opens in **interactive mode**, with your database on the top left, a list of tables under it (including the Snowplow events table) and under the table, a list of fields split by which ChartIO believes is a measure and dimension.

![chartio-pic-2] [chartio-pic-2]

In interactive mode, ChartIO lets you drag and drop measures into the **Measures**, **Dimensions** and **Filters** dialogue box to generate graphs. We're not going to do that, though, because we want to be explicit about how ChartIO uses Snowplow data. So we're going to use **Query mode** by clicking on the **Query mode** hyperlink on the top left of the **Layer 1** box. This enables us to enter a SQL query directly. ChartIO will graph the results:

![chartio-pic-3] [chartio-pic-3]

Now we're ready to graph engagement levels over time. Let's start with our first measure of engagement: conversion levels. We want to look at what % of users who visit our site each month that perform a transaction. To do this, we first need to identify users who have performed a transaction each month, using the following query:

{% highlight mysql %}
SELECT
MONTH(dt),
user_id,
1 AS buyer
FROM events_005
WHERE event='transaction'
GROUP BY dt, user_id
{% endhighlight %}

Now we join this table with the events table to list all the users who have visited each month and identify which of them has bought:

{% highlight mysql %}
SELECT
visitors.`month`,
visitors.user_id,
buyer
FROM (
	SELECT
	MONTH(dt) AS `month`,
	user_id
	FROM events_005
	GROUP BY `month`, user_id) visitors
LEFT JOIN (
	SELECT
	MONTH(dt) AS `month`,
	user_id,
	1 AS buyer
	FROM events_005
	WHERE event='transaction'
	GROUP BY `month`, user_id ) buyers
ON visitors.`month` = buyers.`month`
AND visitors.user_id = buyers.user_id
ORDER BY visitors.`month`, visitors.user_id
{% endhighlight %}

Now we can aggregate over the results of the above query, calculating the conversion rate by dividing the number of buyers by the total number of visitors:

{% highlight mysql %}
SELECT
`month`,
`converted_visitors` / visitors AS conversion_rate
FROM (
	SELECT
	visitors.`month`,
	visitors.user_id,
	buyer
	FROM (
		SELECT
		MONTH(dt) AS `month`,
		user_id
		FROM events_005
		GROUP BY `month`, user_id) visitors
	LEFT JOIN (
		SELECT
		MONTH(dt) AS `month`,
		user_id,
		1 AS buyer
		FROM events_005
		WHERE event='transaction'
		GROUP BY `month`, user_id ) buyers
	ON visitors.`month` = buyers.`month`
	AND visitors.user_id = buyers.user_id
	ORDER BY visitors.`month`, visitors.user_id
) e
GROUP BY `month`
{% endhighlight %}

Pop the above query in the ChartIO query box:

![chartio-pic-4] [chartio-pic-4]

and click the **Chart Query** button below. ChartIO will respond with a table of data. We can graph the data by clicking on any of the graph icons above the data table. Choosing the line graph, I get:

![chartio-pic-6] [chartio-pic-6]

We can then rename the graph (by clicking the **edit** hyperlink that appears when you hover over **Chart Title**) and save the graph to our dashboard by clicking **Save to Exploring engagement** button. ChartIO lets us resize and position the graph on the dashboard:

![chartio-pic-7] [chartio-pic-7]

Great! We can see conversion rates were reasonably stable between September and November of the year, but peaked at the end of the year at a height they were previously in June. The figure for September seems suspiciously high - we'll drill into this in more detail in a bit. Next we will plot our alternative measure of engagement over time: the number of pageviews per user per month, and see how that has changed over time.

Calculating the number of pageviews per user per month is straightforward in Snowplow - we can use the following query:

{% highlight mysql %}
SELECT
MONTH(dt) AS `month`,
user_id,
count(*) AS page_views
FROM events_005
WHERE event='page_view'
GROUP BY `month`, user_id
{% endhighlight %}

Now we want to aggregate users by the number of pageviews each has done by month:

{% highlight mysql %}
SELECT
`month`,
page_views,
count(distinct(user_id)) AS uniques
FROM (
	SELECT
	MONTH(dt) AS `month`,
	user_id,
	count(*) AS page_views
	FROM events_005
	WHERE event='page_view'
	GROUP BY `month`, user_id
) t
ORDER BY `month` ASC, page_views DESC
{% endhighlight %}

Lastly we want to bucket values of page views e.g. into 1, 2-5, 6-10, 11-25 and 25+. We can introduce a bucketing into our previous query:

{% highlight mysql %}
SELECT
`month`,
page_views,
CASE
	WHEN page_views > 25 THEN '25+'
	WHEN page_views > 10 THEN '11-25'
	WHEN page_views >  5 THEN '6-10'
	WHEN page_views >  1 THEN '2-5'
	ELSE '1'
END AS bucket,
count(distinct(user_id)) AS uniques
FROM (
	SELECT
	MONTH(dt) AS `month`,
	user_id,
	count(*) AS page_views
	FROM events_005
	WHERE event='page_view'
	GROUP BY `month`, user_id
) t
ORDER BY `month` ASC, page_views DESC
{% endhighlight %}

And then aggregate by bucket in the next query:

{% highlight mysql %}
SELECT
`month`,
bucket,
sum(uniques) AS uniques
FROM (
	SELECT
	`month`,
	page_views,
	CASE
		WHEN page_views > 25 THEN '25+'
		WHEN page_views > 10 THEN '11-25'
		WHEN page_views >  5 THEN '06-10'
		WHEN page_views >  1 THEN '02-05'
		ELSE '01'
	END AS bucket,
	count(distinct(user_id)) AS uniques
	FROM (
		SELECT
		MONTH(dt) AS `month`,
		user_id,
		count(*) AS page_views
		FROM events_005
		WHERE event='page_view'
		GROUP BY `month`, user_id
	) t
	ORDER BY `month` ASC, page_views DESC
) u
GROUP BY `month`, bucket
ORDER BY `month`, bucket
{% endhighlight %}

Create a new chart in ChartIO using the above query and graph it using the first bar chart icon. Give the graph a suitable name:

![chartio-pic-8] [chartio-pic-8]

This graph tells an interesting story. Overall, the number of unique visitors per month has grown pretty dramatically over time, peaking at about 1700 uniques in November. It is not so easy to tell how the distribution of users by engagement level has changed over time: this is easier if we change the graph to be a "percent bar":

![chartio-pic-9] [chartio-pic-9]

This graph suggests that engagement levels dropped in October, but climbed dramatically from then to December. Curiously, there was no drop in overall engagement level as user numbers increased on the site between August and October: that means that the new users acquired were "high quality" or "highly engaged". This is a useful graph: let's add it to our dashboard alongside the first graph we created:

![chartio-pic-10] [chartio-pic-10]

Just to put the two baseline graphs in context, let's add a third graph the tracks the number of unique users per month to our dashboard. Add a new chart using the following simple query:

{% highlight mysql %}
SELECT
MONTH(dt) AS `month`,
COUNT(DISTINCT(user_id)) as uniques
FROM events_004
GROUP BY `month`
ORDER BY `month`
{% endhighlight %}

And pop it on the dashboard:

![chartio-pic-11] [chartio-pic-11]

Our baseline data tells us an interesting story, which from the dashboard, we're in a position to summarise:

* Overall, visitor numbers have increased pretty dramatically between June and September
* Over that same period, there was no corresponding drop in engagement, in terms of numbers of page views by visit. If anything, there was a slight increase
* Looking at conversion rates over the same time, the picture is much more hairy. (With a surprising spike in July.) In fact, we know this was to do with a bug on the website, which prevented data being collected from any page apart from the checkout page. Hence user numbers are underreported, but conversion rates are overstated, for July
* Conversion rates and average page views per visit rise in December

### Unpicking the drivers of changing engagement levels

For our sample data set there appears to be a rather interesting rise in engagement level (as measured by both conversion rates and page views by month) between November and December. What's driving that increase? What clues can our Snowplow data give us?

We can divide drivers into two groups: those that effect all users on our website, and those that only effect some of them. If, for example, we performed a measure rearchitecture of our entire site, that is likely to effect **all** users' behavior. But if we upgraded the site for mobile, then we would **only** expect that to impact user behavior for people browsing from mobile sites.

A good approach, then, to unpick what's driving growth in engagement levels is to see if this growth is consistent across all users, or just some of them. One easy way to do this is to compare engagement rates between different types of users, to see if we can spot a difference. It makes sense to start off with factors we have a hunch might be driving those changes (e.g. because we're familiar with what has changed at those business over the months in question.) To give a specific examples:

#### Comparing engagement levels between users from paid search campaigns and not-paid search campaigns

Psychic Bazaar's only direct marketing spend is on paid search campaigns on Google and Bing. We might therefore wonder whether a change to those campaigns drove the uplift in engagement we see on the site in September. To do this, first we need to identify all the users acquired via paid search:

{% highlight mysql %}
SELECT
user_id,
'1' AS paid_search
FROM events_005
WHERE mkt_medium = 'cpc'
GROUP BY user_id
{% endhighlight %}

Compare this with our data on which users have converted:

{% highlight mysql %}
SELECT
user_id,
'1' AS buyer
FROM events_005
WHERE event = transaction
GROUP BY user_id
{% endhighlight %}

And our list of **all** users:

{% highlight mysql %}
SELECT
user_id,
'1' AS visitor
FROM events_005
GROUP BY user_id
{% endhighlight %}

We join the three data sets:

{% highlight mysql %}
SELECT
visitors.user_id,
buyer,
paid_search
FROM (
	SELECT
	user_id,
	'1' AS visitor
	FROM events_005
	GROUP BY user_id
	) visitors
LEFT JOIN (
	SELECT
	user_id,
	'1' AS buyer
	FROM events_005
	WHERE event = transaction
	GROUP BY user_id
) buyers
ON visitors.user_id = buyers.user_id
LEFT JOIN (
	SELECT
	user_id,
	'1' AS paid_search
	FROM events_005
	WHERE mkt_medium = 'cpc'
	GROUP BY user_id
	) paid_search
ON visitors.user_id = paid_search.user_id
{% endhighlight %}

And then aggregate over the result set to compare conversion rates:

{% highlight mysql %}
SELECT
paid_search,
sum(buyer)/sum(visitor) AS conversion_rate
FROM (
SELECT
visitors.user_id,
buyer,
paid_search
FROM (
		SELECT
		user_id,
		'1' AS visitor
		FROM events_005
		GROUP BY user_id
		) visitors
	LEFT JOIN (
		SELECT
		user_id,
		'1' AS buyer
		FROM events_005
		WHERE event = transaction
		GROUP BY user_id
	) buyers
	ON visitors.user_id = buyers.user_id
	LEFT JOIN (
		SELECT
		user_id,
		'1' AS paid_search
		FROM events_005
		WHERE mkt_medium = 'cpc'
		GROUP BY user_id
		) paid_search
	ON visitors.user_id = paid_search.user_id
	) t
GROUP BY paid_search
{% endhighlight %}

Plotting the data in ChartIO we can see that users acquired from paid campaigns are much more likely to convert:

![chartio-pic-12] [chartio-pic-12]

This naturally leads to the question: has the number of users acquired from paid search increased over the time period? (Especially between November and December, when our increase in conversion rates is most noticeable?) We can find out by graphing the following query, which looks at the number of uniques by month divided by whether they were acquired by paid search or not:

{% highlight mysql %}
SELECT
MONTH(dt) AS `month`,
paid_search,
COUNT(DISTINCT(e.user_id)) AS uniques
FROM events_005 e
LEFT JOIN (
	SELECT
	user_id,
	'1' AS paid_search
	FROM events_005
	WHERE mkt_medium = 'cpc'
	GROUP BY user_id
) paid_search
ON e.user_id = paid_search.user_id
GROUP BY `month`, paid_search
{% endhighlight %}

Plotting the above graph shows that growth in paid search traffic accounts for some of the growth in traffic volumes between July and September. However, there was **no** increase in traffic from paid search terms between November and December, so this does **not** account for the rising conversion rate in December.

![chartio-pic-13] [chartio-pic-13]

#### Other factors that might account for the rise

There is a wealth of other factors that we can explore using Snowplow data, to see if they account for the rise in engagement levels / conversion rates in December. Doing so is beyond the scope of this blog post. However, we can outline them:

| **Factor** | **How we would test it**                                                |
|:-----------|:------------------------------------------------------------------------|
| Improvement to the site structure (e.g. homepage) | Investigate how engagement levels vary by visit by landing page, and see if those changes by landing page on dates when those web pages were updated |
| Improvements to the checkout flow | Compare the conversion funnel between November and December - see if there's a specific point in the funnel where conversion rates change, and see if that change can be attributed to a development change |
| A change in the makeup of the users e.g. so that in December, a bigger portion of the userbase are repeat visitors | Explore whether there is a change in makeup (e.g. more repeat visitors as a proportion of uniques) and see if there's a corresponding difference in conversion rates by different types of users (e.g. new vs returning). Note: this is the same approach as described above for  user acquired from *paid search*. |
| Christmas  | Hard to prove definitively - but if no other factor can be identified, and the engagement level drops back in January, then the December bump might be season. |

Snowplow makes it possible to drill into all of the above, and other factors we can think of, to see which is responsible for driving changing engagement levels.

## Summarising our thoughts on ChartIO

From our experience with it in the last couple of weeks, we believe that ChartIO is an excellent tool for visualising Snowplow data. We highly recommend Snowplow users give it a try,: ChartIO's simplicitly, speed, and lack of assumptions about the way data is structured make it an ideal analytics tool to run directly on top of Snowplow data stored in Infobright.

We're going to continue to use ChartIO (and blog about the results). We'd love to hear from other Snowplow users who are using it.

[chartio]: http://chartio.com/
[why]: /blog/2013/01/08/using-chartio-to-visualise-and-interrogate-snowplow-data#why
[setup]: /blog/2013/01/08/using-chartio-to-visualise-and-interrogate-snowplow-data#setup
[engagement]: /blog/2013/01/08/using-chartio-to-visualise-and-interrogate-snowplow-data#engagement
[olap]: /analytics/tools-and-techniques/converting-snowplow-data-into-a-format-suitable-for-olap.html
[setup-chartio]: https://github.com/snowplow/snowplow/wiki/Setting-up-ChartIO-to-visualize-Snowplow-data
[pbz]: http://www.psychicbazaar.com/
[measuring-engagement]: /analytics/customer-analytics/user-engagement.html
[chartio-pic-0]: /assets/img/blog/2013/01/chartio-0.png
[chartio-pic-1]: /assets/img/blog/2013/01/chartio-1.png
[chartio-pic-2]: /assets/img/blog/2013/01/chartio-2.png
[chartio-pic-3]: /assets/img/blog/2013/01/chartio-3.png
[chartio-pic-4]: /assets/img/blog/2013/01/chartio-4.png
[chartio-pic-5]: /assets/img/blog/2013/01/chartio-5.png
[chartio-pic-6]: /assets/img/blog/2013/01/chartio-6.png
[chartio-pic-7]: /assets/img/blog/2013/01/chartio-7.png
[chartio-pic-8]: /assets/img/blog/2013/01/chartio-8.png
[chartio-pic-9]: /assets/img/blog/2013/01/chartio-9.png
[chartio-pic-10]: /assets/img/blog/2013/01/chartio-10.png
[chartio-pic-11]: /assets/img/blog/2013/01/chartio-11.png
[chartio-pic-12]: /assets/img/blog/2013/01/chartio-12.png
[chartio-pic-13]: /assets/img/blog/2013/01/chartio-13.png
