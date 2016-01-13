---
layout: post
title-short: 3rd party event data is essential to build a single customer view
title: Event data from 3rd party data sources is essential to build a single customer view
tags: [bad data, data pipelines, technical architecture]
author: Yali
category: Inside the Plow
---

One of the big drivers for companies to adopt Snowplow is that they want to build a single customer view. Often for our users, Snowplow enables them to track user behavior across web and mobile, for example, and join that behavioral data to other customer data sets in their data warehouse.

![behavioral data from web and mobile consolidated with customer data in the data warehouse][diagram1]

Most companies engage with users on a very large number of channels: not just via mobile apps and the web. To give you just some examples:

1. You engage with users when you send them emails, or push notifications
2. You engage with users when you present them with display ads (which they may or may not click)
3. You engage with users when they log support queries or call your call centers

Incorporating data from these channels in your single customer view is essential if you want to built a *complete* picture of your customers *complete* journeys.

In this post, we're going to explain why warehousing data from your website and mobile apps are typically not enough - why in addition you need to be tracking event level data that describes how you're engaging with your users via:

1. Digital marketing channels like email and display advertising
2. Mobile specific channels like push messaging
3. High-touch channels like call centers and support forums

We'll talk about the different ways Snowplow enables you to collect and consolidate data from these different sources so that you can build a full single customer view - one that strives to capture *all* the interactions you have with your users across all your channels, not just web and mobile.

<!--more-->

## How does Snowplow enable companies to build single customer views?

Before we dive into all the different sources of data we need to build our single customer view, it is worth recapping how you can use Snowplowto build a single customer view

1. Track and collect event-level data from different places that you engage with your users, e.g. your website and mobile app, via our trackers. With each event send as many user identifiers as are available. (1st party cookies, 3rd party cookies, IDFVs, IDFAs, machine fingerprints, login IDs, Twitter handles, Facebook IDs, email addresses)
2. As part of a (separate, downstream) data modeling process, build a map of the different user identifiers that belong to the same person
3. Use that map to build a consolidated view of each person i.e. your single customer view
4. (Optional) - join that table with other customer data sets (e.g. CRM) that you have available in your data warehouse

The key thing, then, to building a *complete* single customer view is ensuring that we're tracking events across *all* the different touchpoints and channels we engage our users, and they engage us.

## Tracking event level data from locations outside the web and mobile

Broadly speaking, we define two categories of 'locations' where you engage users:

1. Where the systems managing that engagement have been built by you
2. Where the systems managing that engagement are provided by third party systems

In the case of (1), you track event-level data using [Snowplow Trackers][trackers]. In the case of (2), we use webhook integrations to enable you to track event-level data from the third party systems.

It is interesting to note that for many channels, it is possible to engage users using your own internally build systems or a third party. Let us take some examples.

## Email marketing

Email is a very widely used channel. Whilst some of our users use third party systems to manage their email, including [SendGgid] [sendgrid], [Mandrill] [mandrill] or [Mailchimp] [mailchimp], others choose to build their own systems, often employing tools like [AWS Simple Email Service] [ses].

If you've built your own system using e.g. Java or Python, you would typically:

* Track send events directly from your server-side email sending application - recording an event into Snowplow when an email is sent to an individual recording that that email was sent, what it was about, and to whom
* Embed a Snowplow pixel in the email to track if that email is opened
* Decorate any links in the email to your website or app with querystring parameters (and possibly a hashed copy of the email) so you can easily spot users clicking through emails into your website or app

For users who want to use one of the many great third party email marketing services, many of them now support webhooks. This means that as events occur (e.g. emails are sent), they will send event-level data describing those events to an end-point of your choosing. By selecting your Snowplow collector as that endpoint, you can grab those events as part of your Snowplow data pipeline - either to load into your datawarehouse (as we focus on in this post), or even to act on in real-time via [Amazon Kinesis] [kinesis].

That means if you use [Sendgrid] [sendgrid] or [Mandrill] [mandrill], you can use Snowplow to analyze not just what your users have done on your website and mobile app, but which emails you sent them, which landed, which were opened, and which they clicked on as well.

## Push messaging

Push messaging is an incredibly powerful channel that puts your message very prominently in what for most user's is their most important device: their mobile phone.

As with email marketing you may be using a third party to send push messages or have written your own solution (e.g. using [AWS Push Notification service][sns]) or a third party service e.g. [Urban Airship] [urbanairship]. We are delighted that as of release 75, you can now ingest all your event-level Urban Airship data straight into your Snowplow alongside all your mobile and web behavioral data.

## Telephone

For a large number of companies, the traditional telephone is a vital customer channel (both for customer acquisition and customer support).

We have users who are tracking calls using our trackers in their own telephony systems, and users who've made use of our webhook integration with [CallRail] [callrail]

## Display advertising



## What else?

There are many places

[diagram1]: /assets/img/blog/2016/01/single-customer-view-1-web-mobile-crm-datwarehouse.png
[diagram2]: /assets/img/blog/2016/01/single-customer-view-2-ad-server-email-support-forum-call-center.png
[trackers]: https://github.com/snowplow/?utf8=%E2%9C%93&query=tracker
[sendgrid]: https://sendgrid.com
[mandrill]: https://www.mandrill.com
[mailchimp]: http://mailchimp.com/
[ses]: https://aws.amazon.com/ses/
[kinesis]: https://aws.amazon.com/kinesis/
[sns]: https://aws.amazon.com/sns/
[urbanairship]: https://www.urbanairship.com/
[callrail]: http://www.callrail.com/