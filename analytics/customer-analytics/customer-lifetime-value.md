---
layout: section
category: analytics
analytics_category: customer
title: Customer Lifetime Value
weight: 4
---

# Measuring customer lifetime value with SnowPlow

1. [What is customer lifetime value?](#what-is-customer-lifetime-value)
2. [Why is calculating customer lifetime value so important?](#why-is-it-important)
3. [Why traditional web analytics tools suck at customer lifetime value](#why-competitors-suck)
4. [Calculating customer lifetime value with SnowPlow](#calculating-clv)

<a name="what-is-customer-lifetime-value" />
## What is customer lifetime value?

The idea behind **customer lifetime value*** (CLV) is simple: it is the total amount of value derived by a business from a customer over the customer's complete *lifetime* engaging with the business / product / company. Calculating and maximizing a customer's lifetime value contrasts with other approaches to increasing value e.g.:

1. Optimizing **basket size**: where we optimize a specific "shopping visit", rather than *all* the shopping visits performed by the customer. Amazon Prime is a great example of an initiative that reduces basket size (by encouraging members to place single item orders) but grows customer value nevertheless (by driving increased number of purchases by customer).
2. Optimizing **occupancy**: where we optimize the revenue / profit per room or per seat rather than per customer.
3. Optimizing **sell-through rates**: where we optimize either the fraction of something that is sold (where we do not control the total volume available e.g. ad inventory), or the volume produced to maximize profit (e.g. physical CDs: the more we cut the more we can sell, but the more are likely to remain unsold and therefore a net cost to the business)

<a name="why-is-it-important" />
## Why is customer lifetime value important?

Maximizing customer lifetime value is generally the most sustainable way to drive value growth for any consumer-facing business, because: 

1. It forces the business to take a long term approach to value creation rather than e.g. short term promotions that maximize revenue on a particular shopping trip, or particular product line, at the expense of eroding brand value.
2. It emphasizes customer loyalty, which has repeatedly been shown to be an intangible asset that successful companies can monetize over long periods of time.
3. It generally points to bigger opportunities for value creation (e.g. moving into new markets / complimentary services) rather than smaller opportunities (e.g. *produce less of this particular CD because we do not think it will sell well in this market*). In general, that is because the upper limit to the value you can generate from each customer will be much higher than the upper limit for a basket of goods or bed in a hotel, for example.

Maximizing customer lifetime value is only possible if you can measure it (and therefore track improvements over time). So measuring customer lifetime value is critical to driving long term growth for consumer-facing businesses.

<a name="why-competitors-suck" />
## Why traditional web analytics tools suck at customer lifetime value

Traditionally, web analytics tools have sucked at enabling analysts to calculate customer lifetime value:

1. They don't make it easy to capture value outside of transaction-based businesses e.g. ecommerce
2. They don't make it easy (or often possible) to slice all historical data by customer
3. They don't integrate with other systems used in other channels, to enable a holistic view of customer behaviour and value across online and offline channels
4. They don't provide the granular data required to build sophisticated models to forecast customer value going forwards

Fortunately, SnowPlow addresses the above limitations, enabling analysts to calculate customer lifetime value as detailed below.

<a name="calculating-clv" />
## Calculating customer lifetime value with SnowPlow

There are diffent levels of sophistication to calculate customer lifetime value. The diagram below illustrates some different approaches:

<p style="text-align:center"><img src="img/lifetime-value-segmentation.jpg" title="clv-segmentation" /></p>

We can distinguish different levels of sophistication when measuring customer lifetime value: 

1. The simplest approach: defining customer lifetime value as the total revenue earned from this customer to date.
2. A more sophisticated approach: estimating the total lifetime value of the customer (past and future) based on their data to date. For example, a mobile telco business may assume an average length of contract for each customer, and project forward the amount of expected revenue earned from each customer based on their expected contract length. This figure could then be included as part of the total customer lifetime value.
3. We can be more sophisticated about how we model future revenue, for example, by using different figures for different customers based on what customer segment they belong to. 
4. Further to projecting revenues going forwards, we might want to discount future revenue to net present value in our calculation.
5. Instead of measuring the revenue earned for each customer, we might want to look at profit. This prevents a business focusing unnecessarily on high revenue but unprofitable customer segments.
6. Instead of looking at the revenue / profit directly attributable to each customer, we might want to value the other activities that a customer engages with that create value but do not directly result in revenue. This is important for social networks / community sites where users contribute content, for example.

Which approach you adopt will depend on your own circumstances, data quality and customer understanding: a cruder approach will often suffice and a more sophisticated approach may be misleading if there isn't the customer understanding in place to justify the assumptions an analyst uses in predicting future revenue / profits per customer.

In all cases, however, SnowPlow provides a solid foundation for doing the customer-lifetime value calculations. Below, we detail how to calculate customer lifetime value using a number of approaches:

1. [Summing historical revenue by customers over time](#direct-historical-revenue-by-customer)
2. [Including all revenue per customer across multiple channels](#cross-channel)
3. [Including indirect value as well as direct revenue / profit](#indirect)
4. [Include expected future value](#future-value)

<a name="direct-historical-revenue-by-customer" />
### 1. Summing historical revenue by customer over time

SnowPlow makes it easy to sum the amount of direct revenue attributable to each customer over their entire user history.

Let's start with the example of an online retailer, that has implemented SnowPlow so that every time an order is completed, an event is fired where:

	ev_category = 'ecommerce'
	ev_action = 'order-complete'
	ev_label = *ORDER_ID* (for joining data with transaction system)
	ev_value = *total revenue*

Then to calculate the total revenue by customer over time, we'd simply execute the following query:

{% highlight: mysql%}
SELECT
user_id,
SUM(ev_value)
FROM events
WHERE ev_action LIKE 'order-complete'
GROUP BY user_id
{% endhighlight %}

If there are several different types of events where revenue is directly attributable (e.g. customer submits a lead form as well as buys a product), we simply add the additional event types to our `WHERE` clause:

{% highlight: mysql%}
SELECT
user_id,
SUM(ev_value)
FROM events
WHERE ev_action LIKE 'order-complete'
OR ev_action LIKE 'submit-lead-form'
GROUP BY user_id
{% endhighlight %}

<a name="cross-channel" />
### 2. Including all revenue per customer across multiple channels

Many businesses monetize customers on multiple channels, not just web. To sum revenues across all those channels, you will need to join  your web analytics data with your offline sales data on a per-customer basis. Details of how to do this is documented [here][joining-snowplow-data].

<a name="indirect" />
### 3. Including indirect value as well as direct revenue / profit

For many online businesses, customers engage in multiple value-generating activities that only generates revenue indirectly. To give some examples:

1. Inviting a friend to use a service. (E.g. on a social network, community site or group buying site.) 
2. Writing user-generated content e.g. a review
3. Viewing a web page. (If there is ad content on the page.)
4. Signing up for email marketing
5. Signing up to a new freemium service

How you ascribe to actions like the ones listed above will be subject to a blog post in the future. (There are wide range of possible techniques: because SnowPlow gives you access to granular event-level detail, it enables you to use a wide range of techniques to analyse the associated value.) The important thing to understand from the perspective of this guide is that there is a value that you ascribe at the time you perform the analysis. When you perform the anaysis, you create a table with the different values:

{% highlight: mysql %}
CREATE TABLE events_by_value (
	ev_action STRING,
	value FLOAT)
{% endhighlight%}

Populate the above table with each different type of event and the value you want to ascribe it. You can then add up the value of actions that indirectly drive revenue by joining the above table with the SnowPlow events table:

{% highlight: mysql %}
SELECT
e.user_id,
SUM(v.value)
FROM events e
JOIN events_by_value v
ON e.ev_action = v.ev_action
GROUP BY user_id
{% endhighlight %}

You would then sum the indirect value by `user_id` generated by the above query with the direct revenue attributable to each user calculated in the [previous section](#direct-historical-revenue-by-customer)

<a name="future-value" />
### 4. Include expected future value

Like ascribing value to actions that only indirectly generate revenue, documenting all the different approaches to estimating future value from each customer is beyond the scope of this guide, it's something we will cover in a blog post in due course.

Here, we assume that you have a process of segmenting your customers, and have a future value you assign to customers in each of those segments. In this circumstance, you will need to create a two tables in Hive / Infobright - the first records each segment and the future value ascribed to people in each segment:

{% highlight: mysql %}
CREATE TABLE future_value_by_segment (
	segment STRING,
	value FLOAT )
{% endhighlight %}

And another table that maps `user_id`s to each segment:

{% highlight: mysql %}
CREATE TABLE user_ids_by_segment (
	segment STRING,
	user_id STRING
)
{% endhighlight %}

You would populate the above 2 tables and then execute a query like the following, to calculate estimated future value for each customer:

{% highlight: mysql %}
SELECT
user_id,
SUM(value) AS future_value
FROM future_value_by_segment f
JOIN user_ids_by_segment u
ON f.segment = u.segment
GROUP BY user_id
{% endhighlight %}

The resulting `future_value` by `user_id` would be added to the past value calculated for each user (including both direct revenue and indirect value, as desired) to derive an overall figure for customer lifetime value for each `user_id`.

## Want to learn more?

Read this [Keplar blog post][keplar-clv] on calculating customer lifetime value, find out [how to measure user engagement][user-engagement] using SnowPlow find out about [how to perform cohort analysis][cohort] using SnowPlow.

[clv-img-1]: img/lifetime-value-segmentation.jpg
[joining-snowplow-data]: /analytics/customer-analytics/joining-customer-data.html
[keplar-clv]: http://www.keplarllp.com/blog/2012/06/different-approaches-to-measuring-customer-lifetime-value-with-snowplow
[user-engagement]: /analytics/customer-analytics/user-engagement.html
[cohort]: /analytics/customer-analytics/cohort-analysis.html