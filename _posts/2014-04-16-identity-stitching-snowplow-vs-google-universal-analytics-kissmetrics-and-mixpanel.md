---
layout: post
title: Understanding Snowplow's unique approach to identity stitching, including comparisons with Universal Analytics, Kissmetrics and Mixpanel
title-short: Understanding Snowplow's approach to identity stitching
tags: [snowplow, analytics, custom analytics, cohort analytics]
author: Yali
category: Analytics
---

*This post was inspired by two excellent, recently published posts on identity stitching: Yehoshua Coren's post [Universal Analytics is Out of Beta - Time to Switch?][analytics-ninja-post] and Shay Sharon's post on the [intlock][intlock] blog, [The Full Customer Journey - Managing User Identities with Google Universal, Mixpanel and KISSmetrics][shay-sharon-post]. In both posts, the authors explain in great detail the limitations that traditional analytics solutions have when dealing with identity stitching. In this post, I hope to explain how Snowplow's approach to identity stitching is radically different, and as a result, does not suffer from those same limitations.*

![identity stitching] [identity-stitching-img]

1. [What is identity stitching and why does it matter?](/blog/2014/04/16/identity-stitching-snowplow-vs-google-universal-analytics-kissmetrics-and-mixpanel/#what)  
2. [Different approaches to identity stitching in the case where users log in](/blog/2014/04/16/identity-stitching-snowplow-vs-google-universal-analytics-kissmetrics-and-mixpanel/#login)  
3. [Limitations in the approach taken by Universal Analytics, KISSmetrics and Mixpanel](/blog/2014/04/16/identity-stitching-snowplow-vs-google-universal-analytics-kissmetrics-and-mixpanel/#limitations)
4. [Snowplow: a radically different approach to identity stitching](/blog/2014/04/16/identity-stitching-google-snowplow-vs-universal-analytics-kissmetrics-and-mixpanel/#radical-approach-to-identity-stitching)  
5. [The benefits of decoupling data collection and business logic](/blog/2014/04/16/identity-stitching-google-snowplow-vs-universal-analytics-kissmetrics-and-mixpanel/#benefits)

<!--more-->

<div class="html">
<h2><a name="what">1. What is identity stitching and why does it matter?</a></h2>
</div>

*Identity stitching* is the process of identifing all the different events on a particular user's journey and stitching them together to form a complete record of that journey. Identity stitching is a key step in any customer-centric analysis: if we cannot reliably identify that a set of actions were carried out by a particular user, we cannot accurately:

* Count the number of unique users
* Perform cohort analysis
* Build predictive models of user behaviour

Unfortunately, identity stitching is hard. Users typically interact with websites from multiple different devices and browsers. They may regularly clear their cookies. And they may share computers (and hence cookie IDs) with other users.

This is one reason why companies often like to get users to identify themselves on their websites, by logging in. In doing so, the user identifies him or herself in an unambiguous way. When a user does so, we have the opportunity to pass that data into the analytics system, and use it to drive the identity stitching process. In Snowplow, this is done using the [setUserId] [set-user-id] method. One of the selling points of [Universal Analytics] [ua] is that it offers its own, comparable way for [passing in user IDs] [ua-user-id-feature]. KISSmetrics offers a [identify and alias method] [kissmetrics-approach] and Mixpanel offers a [distinct_id and alias method] [mixpanel-approach], both of which enable the passing in of user IDs in for analytics purposes and predate the Snowplow and Universal Analytics approaches.

<div class="html">
<h2><a name="login">2. Different approaches to identity stitching in the case where users log in</a></h2>
</div>

Even when users log in to a website, however, identity stitching is not straightforward. To take an obvious example - a user may visit a site multiple times before he / she registers for that service, which is nearly always a prerequisite before he / she can log in. This represents a key part of the user journey that companies will want to analyze (especially when optimizing their customer acquisition spend). However, as [Shay Sharon explains] [shay-sharon-post], Mixpanel does not correctly attribute event data from sessions that occurred before the user registered - only from earlier events in the the session he / she first logged in. As [Yehoshua Cohen explains] [analytics-ninja-post], Universal Analytics has the same limitation. Only KISSmetrics manages to stitch together data from those earlier sessions to the user ID that was passed in subsequently.

There are other cases, however, where KISSmetrics gets it wrong. To give one example, where two users visit a website from the same computer, but only the second user logs in, KISSmetrics will erroneously count those two users as the same person.

<div class="html">
<h2><a name="limitations">3. Limitations in the approach taken by KISSmetrics, Mixpanel and Universal Analytics</a></h2>
</div>

There are two underlying reasons why Universal Analytics, KISSmetrics and Mixpanel's approach to identity stitching falls short:

1. They all take a one-size fits all approach i.e. the same identity stitching algorithm has to be used by all their customers
2. They have to decide who a user is (i.e. perform the identity stitching) at the point where the data is collected (i.e. when each event in the customer journey occurs). There is limited opportunity to reprocess historic data on the basis of new data that has come to light

<div class="html">
<h2><a name="radical-approach-to-identity-stitching">4.Snowplow: a radically different approach to identity stitching</a></h2>
</div>

Snowplow takes a radically different approach to identity stitching:

1. Data collection is decoupled from identity stitching: these are two separate processes. At data collection time, we collect all the data that is *currently available* on *who* performed the particular action that is being recorded. At analysis time, we can decide whether we think this user was the same user who performed other actions recorded in our data set, based on the *complete event data set*. This is likely to include new bits of data that were not available at the time the original event was recorded.
2. Different businesses running Snowplow can develop and apply their own identity stitching algorithms - there is no reason why two businesses should be forced to adopt the same approach.

To take a simple example, we can implement the approach used by KISSmetrics to perform identity stitching. In this case, we would:

1. Use the `setUserId` method to pass in the user ID to Snowplow when a user logs in. This is saved into the Snowplow events table in the `user_id` field.
2. Create a mapping table of cookie IDs (either `domain_userid` or `network_userid` depending on whether we're using 1st or 3rd party cookies) to `user_id` field.
3. Use the mapping table to perform all customer-centric analysis. In this way, if we have multiple cookie IDs (`domain_userid` or `network_userid`) where the user logged in at any stage of his / her journey, all the events associated with those cookie IDs will be ascribed to the single associated `user_id`.

This approach is described in detail in [the Analytics Cookbook] [identifying-users-with-snowplow].

For many of our users, however, this approach is either too simplistic or inappropriate:

1. There is not a single 'canonical user ID'. Instead, there are multiple user IDs per user: for example, IDs associated with their different applications (there are more than one), others associated with their CRM, others associated with their help desk
2. There are multiple 'levels' of user identity. For example, B2B SaaS providers might provide a single account to a business, with multiple child logins for individual employees. Some analysis might be appropriate to perform at a business level, other at an employee level
3. Sometimes there are events that occur very late in the customer journey, that make it apparent that what looked like two separate users, previously, was really the same user
4. There are a signficant number of cases where multiple users share the same machine (and hence cookie IDs).
5. Their users do not log in

If any of the above are true, a totally different approach to identity stitching is required. Fortunately, businesses running Snowplow are free to develop and employ whatever algorithm they want to perform identity stitching. Snowplow does a number of things to give businesses as much flexibility as possible when developing their own algorithms:

1. It is straightforward, with Snowplow, to pass (literally) an unlimited number of different user identifiers into Snowplow, using user-level [custom context][custom-contexts], with each event
2. In addition to our support for an unlimited number of client-specific IDs, Snowplow provides 1st and 3rd party cookie IDs, IP addresses and browser fingerprints, out-of-the-box, for every single event collected via the JavaScript Tracker
3. With Snowplow you have your complete historical data set to hand, and can apply your algorithm to that data set in its entirity. As a result, it does not matter when in the user journey a key bit of identification data is made available to Snowplow, it is easy to apply that to all your data retrospectively
4. With Snowplow, you can evolve your approach to identity stitching over time. For example, you can monitor the number of times that multiple users sign in from the same computer - and if this becomes very common, be more careful to distinguish different users with the same cookie IDs. Alternatively, you might spot that this behaviour only occurs for specific computers on specific IP addresses, and so treat data from those IP addresses differently to data from other IP addresses. You can even develop or employ machine-learning approaches: based on a subset of data where you know exactly who the user is, infer behavioural patterns that suggest that for example, other distinct sets of cookie IDs really represent the same user. (This is the approach taken by the folks at [Drawbridge] [drawbridge])

<div class="html">
<h2><a name="benefits">5. The benefits of decoupling data collection and business logic</a></h2>
</div>

In general at Snowplow, we believe strongly in decoupling event-data collection from applying business logic to the event data collected. The reason is simple - for a rapidly evolving business, business logic will change over time. If the analytics system is going to be able just to keep pace with the business (and really, we believe that the data should be driving that change, rather than playing catch-up), it needs to be possible to evolve the way business logic is implemented in the analytics system over time. By decoupling the collection of event data from the application of business logic, we buy ourselves that flexibility.

It turns out that identity stitching is just one type of business logic that benefits from this approach. Rules for defining sessions, segmenting audience, assigning users to cohorts, categorising and classifying content items and media and even defining KPIs can all change over time. To date, Snowplow is the only web analytics platform that enables that enables companies to evolve the way business logic is defined on their underlying event data, and apply updated definitions to the complete data set over time.

### Interested in finding out more about how Snowplow can benefit your business?

Then [get in touch] [contact] with our team!

[analytics-ninja-post]: http://www.analytics-ninja.com/blog/2014/04/googles-universal-analytics-out-of-beta.html
[shay-sharon-post]: http://blog.intlock.com/full-customer-journey-part-iimanaging-user-identities-google-universal-mixpanel-kissmetrics/
[intlock]: http://www.intlock.com/
[identity-stitching-img]: /assets/img/blog/2014/04/identity-stitching.png
[ua]: https://support.google.com/analytics/answer/2790010
[ua-user-id-feature]: https://support.google.com/analytics/answer/3123663?hl=en&ref_topic=3123660
[set-user-id]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#user-id
[identifying-users-with-snowplow]: http://snowplowanalytics.com/analytics/customer-analytics/identifying-users.html
[custom-contexts]: http://snowplowanalytics.com/blog/2014/01/27/snowplow-custom-contexts-guide/
[kissmetrics-approach]: http://support.kissmetrics.com/getting-started/understanding-identities.html
[mixpanel-approach]: https://mixpanel.com/help/questions/articles/assigning-your-own-unique-ids-to-users
[contact]: /about/index.html
[drawbridge]: http://www.drawbrid.ge/technology
