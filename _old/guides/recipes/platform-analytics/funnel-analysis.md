---
layout: page
group: guides
subgroup: analytics
title: Funnel analysis
permalink: /guides/recipes/platform-analytics/funnel-analysis.html
redirect_from:
  - /analytics/recipes/platform-analytics/funnel-analysis.html
  - /analytics/platform-analytics/funnel-analysis.html
  - /documentation/recipes/platform-analytics/funnel-analysis.html
---

<h1>Funnel analysis</h1>

<h2><a name="overview">1. An overview of funnel analysis</a></h2>

Funnel analysis is one of the two most common types of platform analytics performed with web analytics data.

The concept behind funnel analysis is straightforward. Your platform is designed to support users working through one or more different workflows: where each workflow is a series of steps necessary to deliver a specific outcome. Examples of workflows include:

1. Buying a product
2. Paying a bill
3. Researching the answer to a specific question
4. Signing up for a service
5. Checking your bank balance

In a funnel analysis, you:

1. Identify a specific workflow: this is your funnel
2. Identify the steps that a user must take to work through that funnel
3. Identify the set of users who start on that funnel
4. Analyse what fraction of that set of users drop out at each step in the funnel
5. Work out what caused the user to drop out of the funnel, with a view to improving your product so that a smaller fraction of users drop out at each step.

Funnel analysis is very commonly employed on online shops, for example, to understand what fraction of visitors to the website 'convert' (i.e. make a purchase), and how far other users make it through the purchase funnel. This sort of analysis is typically used to optimize the checkout process, for example.

Back to [top](#top).

<h2>2. Strengths and limitations of funnel analyses</h2>

The primary strength of a funnel analysis is that it is incredibly actionable: a funnel analysis will tell you very specifically where on a user journey the platform is not working so well (because users are dropping out of the workflow at a specific step in the workflow). It then becomes possible to test different iterations of your platform and compare the drop-off between versions, measure any uplift and quantify the associated benefit.

There are two primary limitations of funnel analyses, which are worth elaborating on in a little detail, before we proceed:

1. [It is not always straightforward to identify which users should be included in the funnel analysis] (#who-to-include)
2. [Funnel analysis is not effective for measuring platform performance where different workflows can be distinguished so easily] (#difficult-to-distinguish-workflow)

<h3>Who to include in a funnel analysis?</h3>

A funnel analysis measures the 'effectiveness' of your platform by enabling you to measure the fraction of users who drop out at each stage of the funnel: any drop off is taken to be a fault of the platform that needs to be rectified. A perfect platform, then, is one where all users who embark on a workflow finish it.

One of the problems, however, with these assumptions, is that in the real world, it is possible for a user to accidentally start a workflow. By "accidentally", we mean that the user has no desire or intention to get to the end of the workflow.

If you have a lot of users accidentally starting a workflow, it is likely that your drop off rates at each step will be much higher than you'd hope. This does not mean that there is something wrong with the steps in the workflow: instead it means that the wrong people are being pushed into the funnel.

In an ideal world, you should **only include users / visitors in a funnel analysis who have clearly (through their online behavior) expressed a desire for the outcome of the workflow**. If you run an online shop, for example, you should include all visitors who've come to your site to buy products, but exclude users who are visiting e.g. to look up your contact details, or want to arrange a refund, for example.

<h3>Can we distinguish different workflows in our platform clearly?</h3>

On some platforms it is very easy to define one or more workflows. On a lead-generation microsite, for example, there is generally *nothing* for a user to do *except* for filling in a webform and submitting their details.

On many platforms, however, there are multiple things that a visitor might want to do and correspondingly, multiple workflows that they embark on. Consider the case of an online marketplace like eBay for example. A visitor may arrive with the intention of buying a specific item. She may arrive with the intention of buying something (e.g. a present), but without a clear idea what it is she'd like to buy. She may, alternatively, be on the website to sell something. Or she may be in the market either to buy or sell something, but only for the right price: hence she is on the website to determine the price she'd be able to buy / sell an item for.

Working out the intentions of the user is key to knowing which funnel analysis to include this user on. To complicate matters further, however, many of the funnels "overlap": the user journey for researching the price of an item (either to buy or to sell) may start off almost exactly the same as the user journey for buying a specific item, for example. Without a reliable way to segment users into each workflow, it becomes impossible to perform funnel analysis for either of the two overlapping workflows.

The less clearly we can distinguish users with different intentions and different workflows with different goals, the less useful (and potentially more misleading) funnel analyses become.

Back to [top](#top).

<h2>3. With Snowplow, you can analyse <strong>any funnel</strong></h2>

In web analytics, funnel analyses have been made especially popular by Google Analytics.

The major limitation of performing funnel analytics in GA, however, is that the funnel has to be defined in advance of collecting data. So, if you want to track the progress of users through your online shop to purchase, for example, you need to create your funnel, wait a few weeks until you have sufficient data to make an analysis statistically significant, and then perform the analysis.

In Snowplow by contrast, you can define *any* funnel retrospectively on the data you have already collected. This gives you a lot more flexibility to explore a wide variety of workflows that your users are working through, some of which you may not have been aware existed before you started mining your Snowplow data.

In the rest of this recipe, we run through the process of performing a funnel analysis with Snowplow data.

Back to [top](#top).

<h2>4. Performing funnel analysis in Snowplow: a worked example</h2>

For our worked example, we're going to perform a funnel analysis for an online retailer: [www.psychicbazaar.com] (http://www.psychicbazaar.com/index.php). We're going to look at the purchase funnel, and the following specific steps on it:

1. Visiting the website
2. Adding a product to the basket
3. Starting to fill in the checkout form
4. Finishing the checkout form, and going to Paypal to make a payment
5. Completing the order

We're going to build up a query, in steps, that returns a line of data for each our visits, with details of what stage in the funnel the user gets to.

### Step 1: identifying visitors to include in our funnel analysis

It is straightforward to run a query to return the list of visits for our website:

{% highlight mysql %}
/* Infobright / MySQL */
SELECT
	domain_userid,
	domain_sessionidx,
	MIN(TIMESTAMP(collector_dt, collector_tm)) AS tstamp
FROM `events_008`
GROUP BY domain_userid, domain_sessionidx
{% endhighlight %}

For this tutorial, we're going to include *all* the visitors who come to the website in our funnel analysis. However, as highlighted [above] (#who-to-include), we might want to refine this to users who've come to the website from specific marketing channels or who have landed on a subset of landing pages (e.g. on the shop rather than the blog, for example).

### Step 2: identify which of those users added a product to basket

On the Psychic Bazaar website, add-to-baskets are AJAX events that are tracked using Snowplow's [custom structured event tracking][struct-event]. When an add-to-basket occurs, a custom event is fired with:

* `ev_category` = 'ecomm'
* `ev_action` = 'add-to-basket'
* `ev_label` = product SKU
* `ev_property` = quantity of product added to basket
* `ev_value` = value of goods added to basket

We can therefore return all the add-to-basket events with the following query:

{% highlight mysql %}
/* Infobright / MySQL */
SELECT
	domain_userid,
	domain_sessionidx,
	COUNT(*) AS number_of_add_to_baskets,
	SUM(ev_property) AS number_of_items_added,
	SUM(ev_value) AS value_of_goods_added
FROM `events_008`
WHERE ev_category = 'ecomm'
AND ev_action = 'add-to-basket'
GROUP BY domain_userid, domain_sessionidx
{% endhighlight %}

We can combine this data with our visits data:

{% highlight mysql %}
/* Infobright / MySQL */
SELECT
v.domain_userid,
v.domain_sessionidx,
v.tstamp,
a.number_of_add_to_baskets,
a.number_of_items_added,
a.value_of_goods_added,
FROM (
	SELECT
	domain_userid,
	domain_sessionidx,
	MIN(TIMESTAMP(collector_dt, collector_tm)) AS tstamp
	FROM `events_008`
	WHERE domain_userid IS NOT NULL
	AND page_url LIKE '%psychicbazaar.com%'
	GROUP BY domain_userid, domain_sessionidx
) v
LEFT JOIN (
	SELECT
	domain_userid,
	domain_sessionidx,
	COUNT(*) AS number_of_add_to_baskets,
	SUM(ev_property) AS number_of_items_added,
	SUM(ev_value) AS value_of_goods_added
	FROM `events_008`
	WHERE ev_category = 'ecomm'
	AND ev_action = 'add-to-basket'
	GROUP BY domain_userid, domain_sessionidx
) a ON v.domain_userid = a.domain_userid AND v.domain_sessionidx = a.domain_sessionidx
{% endhighlight %}

### Step 3: Identifying users who *started* to fill in the checkout form

The Psychic Bazaar checkout page is a long webform where the user enters all the required postage details (e.g. name, email address, shipping address).

A Snowplow structured event tag is fired when a user enters a value in any of the webform entries. For the sakes of keeping this tutorial simple, we're going to count starting to fill in the webform (by entering an email address) as a step, and submitting the webform (and going to Paypal) as the next step. We will ignore the intervening steps, although we could easily extend our query to include them as well.

When a user enters their email address at the top of the checkout page, a structured event is fired where:

* `ev_category` = 'ecomm'
* `ev_action` = 'checkout'
* `ev_label` = 'id_email'

So to identify which visits included this step we execute the following query:

{% highlight mysql %}
/* Infobright / MySQL */
SELECT
	domain_userid,
	domain_sessionidx,
	1 AS start_checkout
FROM `events_008`
WHERE ev_category = 'ecomm'
AND ev_action = 'checkout'
AND  ev_label = 'id_email'
GROUP BY domain_userid, domain_sessionidx
{% endhighlight %}

### Step 4: Identifying users who *finished* the checkout form

When a user clicks the submit button on the bottom of the checkout page, a structured event is fired where:

* `ev_category` = 'ecomm'
* `ev_action` = 'checkout'
* `ev_label` = 'paypal-button'

To identify which visits included this step we execute the following query:

{% highlight mysql %}
SELECT
	domain_userid,
	domain_sessionidx,
	COUNT(*) AS number_of_clicks_on_paypal_button
FROM `events_008`
WHERE ev_category = 'ecomm'
AND ev_action = 'checkout'
AND ev_label = 'paypal-button'
GROUP BY domain_userid, domain_sessionidx
{% endhighlight %}

### Step 5: Identifying users who complete their order

When a user completes his / her order, a [transaction event] [transaction-event] is fired. We can therefore identify all the visits where there was a sale by executing the following query:

{% highlight mysql %}
/* Infobright / MySQL */
SELECT
	domain_userid,
	domain_sessionidx,
	tr_orderid,
	tr_total
FROM `events_008`
WHERE event = 'transaction'
GROUP BY domain_userid, domain_sessionidx, tr_orderid, tr_total
{% endhighlight %}

### Step 6: Consolidating the different queries into a single query that returns the complete data set

We can join the above queries together into a single query that generates a complete data set, with one row of data per visit, where it is straightforward to deduce from the columns what stage in the workflow each customer made it:

{% highlight mysql %}
/* Infobright / MySQL */
SELECT
v.domain_userid,
v.domain_sessionidx,
v.tstamp,
a.number_of_add_to_baskets,
a.number_of_items_added,
a.value_of_goods_added,
c.start_checkout,
fc.number_of_clicks_on_paypal_button,
o.tr_orderid,
o.tr_total
FROM (
	SELECT
	domain_userid,
	domain_sessionidx,
	MIN(TIMESTAMP(collector_dt, collector_tm)) AS tstamp
	FROM `events_008`
	WHERE page_url LIKE '%psychicbazaar.com%'
	GROUP BY domain_userid, domain_sessionidx
) v
LEFT JOIN (
	SELECT
	domain_userid,
	domain_sessionidx,
	COUNT(*) AS number_of_add_to_baskets,
	SUM(ev_property) AS number_of_items_added,
	SUM(ev_value) AS value_of_goods_added
	FROM `events_008`
	WHERE ev_category = 'ecomm'
	AND ev_action = 'add-to-basket'
	GROUP BY domain_userid, domain_sessionidx
) a ON v.domain_userid = a.domain_userid AND v.domain_sessionidx = a.domain_sessionidx
LEFT JOIN (
	SELECT
	domain_userid,
	domain_sessionidx,
	1 AS start_checkout
	FROM `events_008`
	WHERE ev_category = 'ecomm'
	AND ev_action = 'checkout'
	AND (ev_label = 'email' OR ev_label = 'id_email')
	GROUP BY domain_userid, domain_sessionidx
) c ON v.domain_userid = c.domain_userid AND v.domain_sessionidx = c.domain_sessionidx
LEFT JOIN (
	SELECT
	domain_userid,
	domain_sessionidx,
	COUNT(*) AS number_of_clicks_on_paypal_button
	FROM `events_008`
	WHERE ev_category = 'ecomm'
	AND ev_action = 'checkout'
	AND ev_label = 'paypal-button'
	GROUP BY domain_userid, domain_sessionidx
) fc ON v.domain_userid = fc.domain_userid AND v.domain_sessionidx = fc.domain_sessionidx
LEFT JOIN (
	SELECT
	domain_userid,
	domain_sessionidx,
	tr_orderid,
	tr_total
	FROM `events_008`
	WHERE event = 'transaction'
	GROUP BY domain_userid, domain_sessionidx, tr_orderid, tr_total
) o ON v.domain_userid = o.domain_userid AND v.domain_sessionidx = o.domain_sessionidx
{% endhighlight %}

The output of the query looks something like this (click to enlarge):

<a href="/assets/img/analytics/platform-analytics/funnel-analysis/funnel-data.png"><img src="/assets/img/analytics/platform-analytics/funnel-analysis/funnel-data.png" /></a>

Now that we have our data ready, we can visualize and interrogate it further in [Tableau](#tableau) or [R](#r).

Back to [top](#top).

<h2><a name="tableau">5. Visualizing funnel analysis with Tableau</a></h2>

First, create a new data source in Tableau, and execute the above query to pull the required data from Snowplow into Tableau.

Tableau assumes that `domain_sessionidx` is a metric - drag it from the "Measures" pane to the "Dimensions pane" to set Tableau straight.

Next let's create a single dimension to capture how far in the funnel each visit is. Create another calcualted field, and enter the following in the formula window:

{% highlight numpy %}
IF([tr_total] > 0) THEN '5. Order complete'
ELSEIF ([number_of_clicks_on_paypal_button] > 0) THEN '4. Checkout finished'
ELSEIF ([start_checkout] > 0) THEN '3. Started checkout'
ELSEIF ([number_of_add_to_baskets] > 0) THEN '2. Added product(s) to basket'
ELSE '1. Visit' END
{% endhighlight %}

This field categorises each session by how far in the funnel the user progressed. Call this field 'Funnel' and save it.

Now we can plot how the funnel has changed over time, for example. Drag 'Funnel' to the Rows shelf, drag 'tstamp' to the columns shelf, set 'tstamp' to the desired time period (e.g. months). Then drag the 'Number of Records' measure into the table. (Remember - for our data set - each record represents one session.)

To make it easier to compare funnels between time periods, let's plot percentages of visits rather than actual numbers. Click on the measure 'SUM(Number of Records)', select 'Add Table Calculation' from the drop down and select 'Calculation Type: Percent of Total' and 'Summarize the values from: Table (Down)'. Your data set should look something like this:

![data-in-tableau] [img2]

We can now plot the results using a stacked bar graph. Click on the stacked bar icon in the 'Show Me' toolbar to do this:

![visualization-in-tableau] [img3]

Note: in the above graph we've editted the y-axis so instead of extending from 0-100%, it extends from 0-10%, to make it easier to read.

The above graph is clear to read. It tells a worrying story: conversion rates on Psychic Bazaar have dropped since a peak in January 2013.


[struct-event]: https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#wiki-custom-structured-events
[transaction-event]: https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#wiki-ecommerce
[img1]: /assets/img/analytics/platform-analytics/funnel-analysis/tableau-define-session.JPG
[img2]: /assets/img/analytics/platform-analytics/funnel-analysis/data-in-tableau.jpg
[img3]: /assets/img/analytics/platform-analytics/funnel-analysis/visualization-in-tableau.jpg
