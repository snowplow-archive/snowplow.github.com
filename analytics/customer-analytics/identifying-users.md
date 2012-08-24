---
layout: section
category: analytics
analytics_category: customer
title: Identifying users
weight: 2
---

# Identifying users and customers using SnowPlow

All customer analytics starts with a solid understanding of what constitutes a customer and a user: this is missing in traditional web analytics. In this section, we explain how to use SnowPlow to reliably identify customers and users. 

We start by looking at [how SnowPlow sets `user_id`s](#user_id), and what [benefits](#benefits_of_user_id) exposing the `user_id` has for analysts. We then explore [more robust approaches to identifying users](#login-events) through [login events](#login-events). 

<a name="user_id" />
## 1. Understanding `user_id`s

When a user visits a website with SnowPlow tracking, SnowPlow checks the users browser to see if a SnowPlow cookie has been set. If it has not, SnowPlow creates a new `user_id` and drops a browser cookie containing it. Then when the user returns to the site, SnowPlow will recognise the user from the `user_id` stored in the cookie on her browser.

This approach to identifying users is in line with that employed all tag-based web analytics programs. What is unique about SnowPlow is that it exposes the user_id on every line of SnowPlow data to analysts crunching SnowPlow data. 

<a name="benefits_of_user_id" />
## 2. Benefits of exposing the `user_id` for analysis

### 2a. Ability to view a user's complete engagement record

Analysts can quickly zoom in on a user's complete engagement record, including every action they have taken on every single visit to your website(s). Fetching this history is straightforward:

{% highlight mysql %}
SELECT * from events
WHERE user_id = {{USER_ID}}
{% endhighlight %}

### 2b. Ability to track users over multiple customer journeys

Often a user will visit a website several times before completing a particular goal. Whereas traditional web analytics programs only provide analysts with data on the visit when the goal was completed, SnowPlow lets analysts zoom back in time to see all the actions that led up to a goal. This makes it possible, for example, to see which referrer *first* drove a user to a service, who only converted after 3 visits. As a result, the analyst can accurately attribute a return on that marketing spend, that would not be possible if you were only to look at data on a per session basis. (For more on using SnowPlow for [attribution][attribution], see the [attribution section][attribution] of this documentation.)

Each time a user visits a site, SnowPlow sets a visit counter (`visit_id`): this is set to 1 on the user's first visit, 2 on the user's second visit etc. So to calculate the average number of visits required before a customer purchases, we can execute the following query:

{% highlight mysql %}
SELECT 
AVERAGE(visit_id) AS avg_visits_to_purchase
FROM events
WHERE ev_action LIKE 'order-confirmation'
{% endhighlight %}

On websites where users make multiple purchases, we need to divide the number of visits by number of orders, filtering out users who have not made a purchase: 

{% highlight mysql %}
SELECT user_id,
COUNT(txn_id) AS number_of_purchases,
MAX(visit_id) AS number_of_visits,
MAX(visit_id)/COUNT(txn_id) AS visits_to_purchases
FROM events 
WHERE ev_action LIKE 'order-confirmation'
GROUP BY user_id
{% endhighlight %}

We can then average across the results:

{% highlight mysql %}
SELECT
AVG(visits_to_purchases)
FROM (
	SELECT user_id,
	FROM events 
	COUNT(txn_id) AS number_of_purchases,
	MAX(visit_id) AS number_of_visits,
	MAX(visit_id)/COUNT(txn_id) AS visits_to_purchases
	WHERE ev_action LIKE 'order-confirmation'
	GROUP BY user_id
) t
{% endhighlight %}


### 2c. Ability to categorise users by cohorts

Because we can easily slice data by user_id (rather than session), it is easy to define [cohorts][cohort-analysis] to use in [cohort-analysis][cohort-analysis]. For example, to divide users into cohorts based on the month that they first used a service, we can execute the following query:

{% highlight mysql %}
SELECT
CONCAT(YEAR(MIN(dt),"-", MONTH(MIN(dt)) AS cohort,
user_id
FROM events
GROUP BY user_id
{% endhighlight%}

We can then aggregate results for each individual `user_id` by cohort (`group by cohort`), to compare different metrics (e.g. engagement levels) between different cohorts as a whole. (For more in-depth examples of how this is done in practice, see the [cohort analysis][cohort-analysis] section.)

<a name="login-events" />
## 3. More sophisticated approaches to user identification: login events

Whilst exposing the `user_id` makes slicing data by user easy for an analyst, relying on cookies to reliably identify users is risky for a number of reasons:

1. Users may delete cookies between sessions: in which case two or more `user_id`s really represent the same user
2. Users may access your website from different browsers (e.g. a home computer and a work computer, or a mobile device and a desktop): in which case again, two or more `user_id`'s really represent one user

Websites where users login, however, have the opportunity to identify users much more reliably. It is straightforward to incorporate this additional data into SnowPlow, to make customer identification more robust:

When a user logs in to a website, the [SnowPlow event tracker][event-tracking] should be fired to capture the login event. The user's login ID (as defined in whichever system is used to manage the login process e.g. the CMS, Facebook etc.) should be captured in the SnowPlow event tracker. The values should be set as follows:

	event_action: 'login'
	event_value: login_id

where the `login_id` is the `user_id` as defined on the login system, rather than SnowPlow's own `user_id`. These fields then become available in SnowPlow in the `ev_action` and `ev_value` fields. So, to create a map of SnowPlow `user_id`s to the `login_id`s employed in your login, you can run the following query:

{% highlight mysql %}
SELECT
user_id AS snowplow_user_id,
ev_value AS login_id
FROM events
WHERE ev_action LIKE 'login'
GROUP BY user_id, ev_value
{% endhighlight %}

When a user logs in to a service from multiple computers, each SnowPlow `user_id`, associated with each computer, will be matched against their single `login_id`. (I.e. there will be a many-to-one relationship between Snowplow `user_id` and `login_id`.) To perform customer analytics using the more robust method of user identification, we simply aggregate over (`GROUP BY`) `login_id` rather than SnowPlow `user_id`.

## 4. Understand how to use SnowPlow to reliably identify users and customers?

[Read on][join-customer-data] to learn how to join SnowPlow customer data with [other sources of customer data][join-customer-data].

[cohort-analysis]: /analytics/customer-analytics/cohort-analysis.html
[event-tracking]: https://github.com/snowplow/snowplow/wiki/Integrating-SnowPlow-into-your-website#wiki-events
[join-customer-data]: /analytics/customer-analytics/joining-customer-data.html
[attribution]: /analytics/customer-analytics/attributino.html