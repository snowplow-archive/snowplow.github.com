---
layout: page
group: documentation
subgroup: analytics
breadcrumb: customer analytics
subbreadcrumb: identifying users
title: Identifying users
permalink: /documentation/recipes/customer-analytics/identifying-users.html
redirect_from:
  - /analytics/recipes/customer-analytics/identifying-users.html
  - /analytics/customer-analytics/identifying-users.html
---

# Identifying users and customers using Snowplow

All customer analytics starts with a solid understanding of what constitutes a customer and a user: this is missing in traditional web analytics. In this section, we explain how to use Snowplow to reliably identify customers and users:

1. [Understanding the different Snowplow user IDs](#user_id). An overview of the different user IDs that Snowplow recognises
2. [The benefits of exposing user IDs](#benefits_of_user_id). The value that aggregating and filtering on user_ids provides data analysts
3. [The benefits of exposing multiple user IDs](#benefits_of_multiple_user_ids). The value that exposing multiple user IDs provides data analysts
4. [Robust approaches to identifying customers through tracking login events, using multiple IDs] (#login-events). A guide to reliable approach to identifying users, based on using Snowplow to track login events


<h2><a name="user_id">1. Understanding user IDs</a></h2>

Every line of Snowplow table includes placeholders for three different user IDs:

1. The `domain_userid`. This is a user ID that is set via a first party cookie. It can therefore be used to track user behavior within a particular webdomain e.g. `mynewssite.com`
2. The `network_userid`. This is a user ID that is set via a third party cookie. It can be used to track user behavior across a network of sites on different domains.
3. A `user_id` that can be set to custom values. This can be used to assign e.g. an ID set by a CRM system to Snowplow data.

In addition, there are two additional fields that can be used to identify users:

1. `user_ipaddress`
2. `user_fingerprint`

There are strengths and weaknesses associated with each different type of user identifier. In many cases, we recommend using a combination of two or three of them to power the most robust set of user analytics. (More on this below.) In this introductory section, however, we'll stick to outlining the benefits and limitations of each:

#### 1. The `domain_userid`

The `domain_userid` is set via a first party cookie in the Snowplow Javascript (`sp.js`).

Because it is set via a first party cookie, the `domain_userid` is rarely blocked.

However, because it is tied to a first party cookie, it cannot be used to track users across domains: if you have Snowplow set up across a network of sites, the same user on different sites will have different `domain_userid`s. (At least one for each site.)

#### 2. The `network_userid`

The `network_userid` is tied to a third party cookie. Because of this, it can be used to track an individual across multiple different domains.

Third party cookies are increasingly being blocked on browsers. For example, mobile Safari currently blocks them, and there are plans for Firefox to block them by default. As a result, it is likely that a data tied to third party cookies will only be recorded for a shrinking subset of users.

Currently, the `network_userid` is **only** set if you use the [Clojure collector][clojure-collector], not if you use the Cloudfront collector. (Unlike the Clojure collector, the Cloudfront collector does not set 3rd party cookies.)

#### 3. The `user_id`

Many companies and business already set their identifiers for their users and / or customers. (For example, when the user creates an account, or completes a first purchase.) In these cases, that user ID can be passed into Snowplow as the `user_id` using the [setUserID][setuserid] method. This makes it easy to join Snowplow event data with other customer data sets e.g. CRM data.

#### 4. The `user_ipaddress`

IP addresses can be useful tools to use for identifying users. In particular, these can often be mapped to geographic locations, or specific companies / businesses.

Often, however, several users will connect from the same IP address. As a result, companies only typically use IP address as one of many clues to identifying a user, rather than the sole identifier.

#### 5. The `user_fingerprint`

This is an experimental feature, that uses specific browser features (e.g. plugins that have been installed) to "fingerprint" the browser.

We are not sure how well this works in practice (i.e. how unique different browsers are). It may be useful to stitch together sessions on occasions where a user's cookies have been deleted, for example.

<h2><a name="benefits_of_user_id">2. Benefits of exposing the user IDs for analysis</a></h2>

### 2a. Ability to view a user's complete engagement record

Analysts can quickly zoom in on a user's complete engagement record, including every action they have taken on every single visit to your website(s). Fetching this history is straightforward:

{% highlight mysql %}
/* PostgreSQL / Redshift */
SELECT
*
FROM "atomic".events
WHERE domain_userid = '{ENTER USER ID HERE}'
ORDER BY dvce_tstamp
{% endhighlight %}

E.g. executing the query in Navicat:

![user-actions-over-time-navicat][user-actions-over-time-navicat]

### 2b. Ability to track users over multiple sessions

Often a user will visit a website several times before completing a particular goal. Whereas traditional web analytics programs only provide analysts with data on the visit when the goal was completed, Snowplow lets analysts zoom back in time to see all the actions that led up to a goal. This makes it possible, for example, to see which referrer *first* drove a user to a service, who only converted after 3 visits. As a result, the analyst can accurately attribute a return on that marketing spend, that would not be possible if you were only to look at data on a per session basis. (For more on using Snowplow for [attribution][attribution], see the [attribution section][attribution] of this documentation.)

Each time a user visits a site, Snowplow sets a session counter (`domain_sessionidx`): this is set to 1 on the user's first visit, 2 on the user's second visit etc. So to view how many visits a customer makes before purchasing, we can execute a query like this:

{% highlight mysql %}
/* PostgreSQL / Redshift */
SELECT
domain_sessionidx,
COUNT(DISTINCT(domain_userid))
FROM "atomic".events
WHERE ev_action = 'order-complete'
AND domain_sessionidx IS NOT NULL
GROUP BY 1
ORDER BY 1
{% endhighlight %}

Plotting the results in ChartIO:

![breakdown-of-purchases-by-number-of-visits-to-purchase][breakdown-of-purchases-by-number-of-visits-to-purchase]

### 2c. Ability to categorise users by cohorts

Because we can easily slice data by user  (rather than session), it is easy to define [cohorts][cohort-analysis] to use in [cohort-analysis] [cohort-analysis]. For example, to divide users into cohorts based on the month that they first used a service, we can execute the following query:

{% highlight mysql %}
/* PostgreSQL / Redshift */
SELECT
domain_userid,
DATE_TRUNC('month', MIN(collector_tstamp)) AS "cohort"
FROM "atomic"."events"
GROUP BY 1
{% endhighlight %}

We can then aggregate results for each individual `user_id` by cohort (`group by cohort`), to compare different metrics (e.g. engagement levels) between different cohorts as a whole. (For more in-depth examples of how this is done in practice, see the [cohort analysis] [cohort-analysis] section.)

<h2><a name="benefits_of_multiple_user_ids">3. The benefits of exposing multiple user IDs</a></h2>

Most web analytics system (notably Google's Universal Analytics) only accommodate a single user ID. We've deliberately supported three as we believe there are pros and cons of each type of user identifier, and having a combination available gives analysts maximum flexibility to identify users as reliably as possible. (Which is rarely 100% reliably...)

### 3a. Advantages of storing both a domain and network user ID

For businesses that wish to track users across multiple domains (notably content networks and ad networks), there are significant advantages to using the `network_userid` over the `domain_userid`: namely that it is straightforward to analyse a user's behavior across multiple sites.

However, a growing proportion of browsers and users are dropping support for third party cookies.

By maintaining support for both first party cookies (`domain_userid`) and third party cookies (`network_userid`), Snowplow makes it possible to use the `network_userid` to identify users where those users have are happy to be tracked using third party cookies. For those users who are not (whom it is easy to identify because they do not have values set for `network_userid`), it is possible to fall back on `domain_userid`.

This makes it possible to perform statistical analyses on network behavior based on the subset of users who are comfortable with third party cookies. It makes it clear which users are and are not covered by the sample.

It also leaves open the possibility of joining domain identifiers from different domains using cookie sync technologies.

### 3b. Advantages of maintaining a separate user identifier for businesses to populate with their own customer IDs

Enabling businesses to set their own user ID where it is available is a very powerful feature: it makes it possible, for example, to join Snowplow behavioral data with other customer data sets e.g. CRM, marketing etc.

Rather then override the `domain_userid` and / or `network_userid`, however, we have a separate field `user_id` set aside for this purpose. This is to give analysts maximum flexibility when analysing user behavior over the user's entire behavior. To illustrate this with an example:

* Consider the case of an online retailer with a long sales cycle. (I.e. it might be common for a user to make multiple visits to the site before making a purchase.)
* A user looking at making a purchase will typically visit the site multiple times before purchasing. In this case, it is possible to track his / her behavior using either the `domain_userid` or `network_userid`
* Once the user has bought an item, they will have created an account. At that stage, the retailer might ascribe that user a user ID, based on the user's name / address
* It will be possible for the company to perform attribution analytics (i.e. tracking the user from e.g. clicking on an ad to making a purchase) using e.g. the `domain_userid`
* Going forwards, however, the user may make several more purchases. Because they use the same account, it is possible to identify that it really is the same user making multiple purchases over time, using the `user_id`. This is true even if that user makes those purchases from different computers / devices, and hence different browsers. (So different `domain_userid` and `network_userid`.)

More details on best practice in user identification is explored in the following section:

<h2><a name="login-events">4. More sophisticated approaches to user identification: login events</a></h2>

Relying on cookies to reliably identify users is risky for a number of reasons:

1. Users may delete cookies between sessions: in which case two or more `user_id`s really represent the same user
2. Users may access your website from different browsers (e.g. a home computer and a work computer, or a mobile device and a desktop): in which case again, two or more `user_id`'s really represent one user

Websites where users login, however, have the opportunity to identify users much more reliably. It is straightforward to incorporate this additional data into Snowplow, to make customer identification more robust:

When a user logs in to a website, the [Snowplow event tracker][event-tracking] should be fired to capture the login event. The user's login ID (as defined in whichever system is used to manage the login process e.g. the CMS, Facebook etc.) should be captured and passed to Snowplow using the setUserId call:

{% highlight javascript %}
_snaq.push(['setUserId', 'joe.blogs@email.com']);
{% endhighlight %}

It is then possible to map `user_id` to e.g. `domain_userid` by executing the following query:

{% highlight mysql %}
/* PostgreSQL / Redshift */
CREATE VIEW business_to_cookie_id_map AS
SELECT
domain_userid,
user_id
FROM "atomic".events
WHERE domain_userid IS NOT NULL
AND user_id IS NOT NULL
GROUP BY 1,2
{% endhighlight %}

This type of mapping table is reliable and flexible, because it can accommodate many-to-many relationships between `user_id` and `domain_userid`. Consider the following two cases:

1. A user logs in to his / her account from multiple devices. In that case, there would be many `domain_userid` to each `user_id`. That is fine, because we can aggregate data by `user_id` to capture the user's behavior across all those different devices.
2. Multiple users log in and out of their account from a single shared computer. In that case, there would be many `user_id` to each `domain_userid`. In that case, we'd need to be careful to aggregate records between log in and out events and ascribe them to a single user, so that we can differentiate actions performed by different users on the same computer.

## 4. Understand how to use Snowplow to reliably identify users and customers?

[Read on][join-customer-data] to learn how to join Snowplow customer data with [other sources of customer data][join-customer-data].

[cohort-analysis]: /analytics/customer-analytics/cohort-analysis.html
[event-tracking]: https://github.com/snowplow/snowplow/wiki/javascript-tracker#wiki-events
[join-customer-data]: /analytics/customer-analytics/joining-customer-data.html
[attribution]: /analytics/customer-analytics/attribution.html
[setuserid]: https://github.com/snowplow/snowplow/wiki/javascript-tracker#wiki-user-id
[user-actions-over-time-navicat]: /assets/img/analytics/customer-analytics/user-actions-over-time-navicat.JPG
[breakdown-of-purchases-by-number-of-visits-to-purchase]: /assets/img/analytics/customer-analytics/breakdown-of-purchases-by-number-of-visits-to-purchase.png
[clojure-collector]: https://github.com/snowplow/snowplow/wiki/Setting-up-the-Clojure-collector
[cloudfront-collector]: https://github.com/snowplow/snowplow/wiki/Setting-up-the-Cloudfront-collector
