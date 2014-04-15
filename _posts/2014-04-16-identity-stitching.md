---
layout: post
shortenedlink: Understanding Snowplow's unique approach to identity stitching
title: Understanding Snowplow's unique approach to identity stitching, including comparisons with Universal Analytics, Kissmetrics and Mixpanel
tags: [snowplow, analytics, custom analytics, cohort analytics]
author: Yali
category: Analytics
---

*This post was inspired by two excellent, recently published posts on identity stitching: Yeshua Coren's post [Universal Analytics is Out of Beta - Time to Switch?][analytics-ninja-post] and Shay Sharon's post on the [intlock][intlock] blog, [The Full Customer Journey - Managnig User Identities with Google Universal, Mixpanel and KISSmetrics][shay-sharon-post]. In both posts, the authors explain in great detail the limitations that traditional analytics solutions have when dealing with identity stitching. In this post, I hope to explain how Snowplow's approach to identity stitching is radically different, and as a result, does not suffer from those same limitations.*

![identity stitching] [identity-stitching-img]

## What is identity stitching and why does it matter?

*Identity stitching* is the process of identifing all the different events on a particular user's journey and stitching them together to form a complete record of that journey. Identity stitching is a key step in any customer-centric analysis: if we cannot reliably identify who is performing a particular action, we cannot accurately:

* Count the number of unique users 
* Perform cohort analysis 
* Build predictive models of user behaviour 

Unfortunately, identity stitching is hard. Users typically interact with websites from multiple different devices and browsers. They may regularly clear their cookies. And they may share computers with other users.

This is one reason why companies often like to get users to identify themselves on their websites, by logging in. In doing so, the user identifies him or herself in an unambiguous way. When a user does so, we have the opportunity to pass that data into the analytics system, and use it to drive the identity stitching process. In Snowplow, this is done using the [setUserId] [set-user-id] method. One of the selling points of [Universal Analytics] [ua] is that it offers its own, comparable way for [passing in user IDs] [ua-user-id-feature]. Both KISSmetrics and Mixpanel have their own versions (which predate both the Snowplow and Universal Analytics approaches), and provide key selling points for both systems.

<!--more-->

## Different approaches to identity stitching in the case where users log in

Even when users log in to a website, however, identity stitching is not straightforward. To take an obvious example - a user may visit a site multiple times before he / she registers for that service, which is nearly always a prerequisite before he / she can log in. This represents a key part of the user journey that companies will want to analyze (especially when optimizing their customer acquisition spend). However, as [Shay Sharon explains] [shay-sharon-post], Mixpanel does not correctly attribute event data from previous sessions - only from earlier events in the first session where he / she logged in. As [Yeshua Cohen explains] [analytics-ninja-post], neither does Universal Analytics. Only KISSmetrics manages to get this right.

There are other cases, however, where KISSmetrics gets it wrong. To give one example, where two users visit a website from the same computer, but only the second user logs in, KISSmetrics will erroneously count those two users as the same person. (For details, see [Shay Sharon's post] [shay-sharon-post] - he explains the intricacies of each particular case much more clearly than I can.)

## Limitations in the approach taken by all three solutions

If we take a step back, we can see that there are three reasons that all three solutions have particular weaknesses:

1. Identity stitching is a hard problem to solve. (Alas, nothing we can do about this...)
2. They all take a one-size fits all approach i.e. the same identity stitching algorithm has to be used by all their customers
3. They have to decide who a user is (i.e. perform the identity stitching) at the point where the data is collected (i.e. when each event in the customer journey occurs). There is limited opportunity to reprocess historic data on the basis of new data that has come to light.

## Snowplow: a radically different approach to identity stitching

Snowplow takes a radically different approach to identity stitching:

1. Decouple the data collection step from the identity stitching step. At data collection time, collect all the data you can about *who* performed the particular action that is being recorded. At analysis time, we can decide whether we think this user was the same user who performed other actions in our data set.
2. Enable businesses running Snowplow to develop their own identity stitching algorithms. 

To take a simple example, we *can* simply implement the approach used by Kissmetrics to perform identity stitching. In this case, we would:

1. Use the `setUserId` method to pass in the user ID to Snowplow when a user logs in. This is saved into the Snowplow events table in the `user_id` field.
2. Create a mapping table of cookie IDs (either `domain_userid` or `network_userid` depending on whether we're using 1st or 3rd party cookies) to `user_id` field.
3. Use the mapping table to perform all customer-centric analysis. In this way, if we have multiple cookie IDs (`domain_userid` or `network_userid`) where the user logged in at any stage of his / her journey, all the events associated with those cookie IDs will be ascribed to the single associated `user_id`.

This approach is described at length in [the Analytics Cookbook] [identifying-users-with-snowplow].

For many of our users, however, this approach is too simplistic:

1. There is not a single 'canonical user ID'. Instead, there are multiple user IDs per user: for example, IDs associated with their different applications (there are more than one), others associated with their CRM, others associated with their help desk.
2. There are multiple 'levels' of user identity. For example, B2B SaaS providers might provide a single account to a business, with multiple child IDs for individual employees. Some analysis might be appropriate to perform at a business level, other at an employee level.
3. Sometimes there are events very late in the customer journey that make it apparent that what looked like two separate users, previously, was really the same user.
4. There are a signficant number of cases where multiple users share the same machine.
5. Users in general do not log in. 

If any of the above are true, a totally different approach to identity stitching is required. Fortunately, businesses running Snowplow are free to develop and employ whatever algorithm they want to perform identity stitching. Snowplow does a number of things to give businesses as much flexibility as possible when developing their own algorithms:

1. It is straightforward, with Snowplow, to pass (literally) an unlimited number of different user identifiers into Snowplow, using user-level [custom context][custom-contexts], with each event.
2. With Snowplow you have your complete historical data set to hand, and can apply your algorithm to that data set in its entirity. As a result, it does not matter when in the user journey a key bit of identification data is made available to Snowplow, it is easy to apply that to all your data retrospectively.
3. With Snowplow, you can evolve your approach to identity stitching over time. For example, you can monitor the number of times that multiple users sign in from the same computer - and if this becomes very common, be more careful to distinguish different users with the same cookie IDs. Alternatively, you might spot that this behaviour only occurs for specific computers on specific IP addresses, and so data from those IP addresses should be treated differently to data from other IP addresses.

[analytics-ninja-post]: http://www.analytics-ninja.com/blog/2014/04/googles-universal-analytics-out-of-beta.html
[shay-sharon-post]: http://blog.intlock.com/full-customer-journey-part-iimanaging-user-identities-google-universal-mixpanel-kissmetrics/
[intlock]: http://www.intlock.com/
[identity-stitching-img]: /assets/img/blog/2014/04/identity-stitching.png
[ua]: https://support.google.com/analytics/answer/2790010
[ua-user-id-feature]: https://support.google.com/analytics/answer/3123663?hl=en&ref_topic=3123660
[set-user-id]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#user-id
[identifying-users-with-snowplow]: http://snowplowanalytics.com/analytics/customer-analytics/identifying-users.html
[custom-contexts]: http://snowplowanalytics.com/blog/2014/01/27/snowplow-custom-contexts-guide/