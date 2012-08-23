---
layout: section
category: analytics
analytics_category: customer
title: Identifying users
weight: 2
---

# Identifying users and customers using SnowPlow

All customer analytics starts with a solid understanding of what constitutes a customer and a user: this is missing in traditional web analytics. In this section, we explain how to use SnowPlow to reliably identify customers and users. This provides a solid foundation for doing more sophisticated customer analytics.

We start by looking at [how SnowPlow sets `user_id`s](#user_id), and what [benefits](#benefits_of_user_id) exposing the `user_id` has for analysts. We then explore more sophisticated approaches to identifying users by through [login events](#login-events). 

<a name="user_id" />
## Understanding `user_id`s

When a user visits a website with SnowPlow tracking, SnowPlow checks the users browser to see if a SnowPlow cookie has been set on it. If it has not, SnowPlow generates a new user_id and stores it on a browser cookie.

This approach to identifying users is in line with that employed all tag-based web analytics programs. What is unique about SnowPlow is that it exposes the user_id on every line of SnowPlow data. 

<a name="benefits_of_user_id" />
## Benefits of exposing the `user_id` for analysis

### Ability to view a user's complete engagement record

Analysts can quickly zoom in on a user's complete engagement record, including every action they have taken on every single visit to your website(s). Fetching this history is straightforward:

{% highlight mysql %}
SELECT * from events
WHERE user_id = {{USER_ID}}
{% endhighlight %}

### Ability to track users over multiple customer journies

Often a user will visit a website several times before completing a particular goal. Whereas traditional web analytics programs only provide analysts with data on the visit when the goal was completed, SnowPlow lets analysts zoom back in time to see all the actions that led up to a goal. This makes it possible, for example, to see which referrer *first* drove a user to a service, who only converted after 3 visits. This makes it possible to attribute a return on that marketing spend, that would not be possible if you were only to look at data on a per session basis.

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
FROM events 
COUNT(txn_id) AS number_of_purchases,
MAX(visit_id) AS number_of_visits,
MAX(visit_id)/COUNT(txn_id) AS visits_to_purchases
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

### Ability to categorise users by cohorts

Because we can easily slice data by user_id (rather than session), it is easy to define [cohorts][cohort-analysis] to use in [cohort-analysis][cohort-analysis]. For example, to divide users into cohorts based on the month that they first used a service, we can execute the following query:

{% highlight mysql %}
SELECT
CONCAT(YEAR(MIN(dt),"-", MONTH(MIN(dt)) AS cohort,
user_id
FROM events
GROUP BY user_id
{% endhighlight%}

We can then aggregate results for each individual `user_id` by cohort, to compare different metrics (e.g. engagement levels) between different cohorts as a whole. (For more in-depth examples of how this is done in practice, see the [cohort analysis][cohort-analysis] section.)

<a name="login-events" />
## More sophisticated approaches to user identification: login events

Whilst exposing the `user_id` makes slicing data by user easy for an analyst, relying on cookie_ids to reliably identify users is risky for a number of reasons:

1. Users may delete cookies between sessions: in which case two `user_id`s really represent the same user
2. Users may access your website from different browsers: in which case again, two `user_id`'s really represent one user

Websites where users login, however, have the opportunity to identify users much more reliably. It is straightforward to incorporate this additional data into SnowPlow, to make customer identification more robust:

When a user logs in to a website, the [SnowPlow event tracker][event-tracking] should be fired to capture the login event. The values should be set as follows:

	event_action: 'login'
	event_value: login_id

where the 'login_id' is the user_id as defined on the login system, rather than SnowPlow's own user_id. These fields then become available in SnowPlow in the `ev_action` and `ev_value` fields. So, to create a map of SnowPlow user_ids to the login_ids employed in your CMS, you can run the following query:

{% highlight mysql %}
SELECT
user_id AS snowplow_user_id,
ev_value AS cms_user_id
FROM events
WHERE ev_action LIKE 'login'
GROUP BY user_id, ev_value
{% endhighlight %}

When a user logs in to a service from multiple computers, each user_id, associated with each computer, will be matched against their single `cms_user_id`. (I.e. there will be a many-to-one relationship between `snowplow_user_id` and `cms_user_id`.) To perform customer analytics using the more robust method of user identification, we simply aggregate over (`GROUP BY`) `cms_user_id` rather than `snowplow_user_id`.

## Understand how to use SnowPlow to reliably identify users and customers?

[Read on][join-customer-data] to learn how to join SnowPlow customer data with [other sources of customer data][join-customer-data].

[cohort-analysis]: /analytics/customer-analytics/cohort-analysis.html
[event-tracking]: https://github.com/snowplow/snowplow/wiki/Integrating-SnowPlow-into-your-website#wiki-events
[join-customer-data]: /analytics/customer-analytics/joining-customer-data.html