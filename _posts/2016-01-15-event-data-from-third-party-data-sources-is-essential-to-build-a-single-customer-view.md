---
layout: post
title-short: Web and mobile data only gets you to first base when building a single customer view
title: Web and mobile data only gets you to first base when building a single customer view
tags: [single customer view, email, puh messaging, telephone, display advertising, impression tracking, click tracking]
author: Yali
category: Inside the Plow
---

One of the main reasons companies adopt Snowplow is to build a single customer view. For many of our users, Snowplow enables them for the first time to join behavioral data gathered from their website and mobile apps and with other customer data sets (e.g. CRM). This simple step drives an enormous amount of value.

![behavioral data from web and mobile consolidated with customer data in the data warehouse][diagram1]

However, this is just the beginning. Most companies engage with users on a very large number of channels: not just via mobile apps and the web. To give just a few examples, companies will often engage with their users via:

1. Outbound messaging e.g. email or push notifications
2. Display advertising
3. Telephone calls (e.g. as part of a customer acuiqisition, service or support)

Incorporating data from these channels in your single customer view is essential if you want to built a *complete* picture of your users' *complete* journeys.

In this post, we're going to look at how you can use Snowplow to track user behaviour from some of these other channels, with a view to building a more complete customer view - looking particularly at email, push messaging, telephone and display advertising.

<!--more-->

![behavioral data from web, mobile, email, push messaging, call center and display advertising channels][diagram2]

## How does Snowplow enable companies to build single customer views?

Before we dive into some of the different sources of data we need to build our single customer view, it is worth recapping how companies use Snowplow to build single customer views. The process is as follows:

1. Track and collect event-level data from different places that you engage with your users, e.g. your website and mobile app, via our trackers. With each event record as many user identifiers as are available (1st party cookies, 3rd party cookies, IDFVs, IDFAs, machine fingerprints, login IDs, Twitter handles, Facebook IDs, email addresses). At collection time we do not need to decide who the user is who is performing a particular action, but we need to collect as much evidence as possible so that we can make that determination later on in the pipeline.
2. As part of a (separate, downstream) data modeling process, build a map (or graph) of the different user identifiers that belong to the same individual user.
3. Use that map to assign each event to a single user, and for each user stitch together the different events that occurred across different channels  to build a consolidated view of each user. This is the single customer view
4. (Optional) - join that table with other customer data sets (e.g. CRM) that you have available in your data warehouse

Note that the above approach is very diffferent from that taken by packaged analytics vendors ([Google Analytics][google-analytics], [Adobe Analytics] [adobe-analytics], [Mixpanel] [mixpanel], [Kissmetrics] [kissmetrics], [Keen.io][keen] etc.) because packaged vendors insist that you decide at data capture time who a user is, whereas Snowplow enables you to defer that decision and evolve the logic for making that decision as 

1. You learn more about your users
2. You start stitching data together from more and more channels

The first key element, then, to building a *complete* single customer view is to strive to track events across *all* the different  channels you engage your users, and they engage you. The second key element is to ensure that events from a single user on one platform can be mapped together with events from a single user on another platform, so that you view of each customer is built from the totality of their interactions across each platform you engage them on. (More on this in a forthcoming blog post.)

## Tracking event level data from locations outside the web and mobile

At Snowplow, we distinguish two categories of channel where you engage your users:

1. Channels where the systems managing that engagement have been built by you
2. Channels where the systems managing that engagement are provided by third parties (generally as SaaS solutions)

In the case of (1), you track event-level data using [Snowplow Trackers][trackers]. In the case of (2), you use webhook integrations to enable you to track event-level data from the third party systems.

For many channels, it is possible to engage users using your own internally build systems or a third party, and this will determinate how you use Snowplow to track those events. Let us dive into the examples to see this in action.

## Email marketing

Email is a very widely used channel. Whilst some of our users use third party systems to manage their email, including [SendGgid] [sendgrid], [Mandrill] [mandrill] or [Mailchimp] [mailchimp], others choose to build their own systems, often employing tools like [AWS Simple Email Service] [ses].

If you've built your own system using e.g. Java or Python, you can track email related events in Snowplow as follows:

* Track email send events directly from your server-side email sending application, using the appropriate Snowplow tracker. (So the [Java tracker] [java-tracker] to track sends from Java app, our [Python tracker] [python-tracker] to track sends from Python app.) This means recording an event when an email is sent to an individual
* Embed a Snowplow pixel in the email to track if that email is opened
* Decorate any links in the email to your website or app with querystring parameters so you can  spot users clicking through emails into your website or app. If you can decorate the links with a hashed version of the email address, you can then map email addresses to cookie IDs, enabling you to join email event data with your web event data, for example.

For users who want to use one of the many great third party email marketing services, many of them now support webhooks. This means that as events occur (e.g. emails are sent), the email provider will send event-level data describing those events to an end-point of your choosing. By selecting your Snowplow collector as that endpoint, you can grab those events as part of your Snowplow data pipeline - either to load into your datawarehouse, or even to act on in real-time via [Amazon Kinesis] [kinesis].

That means you see not just what your users have done in your website and mobile app, but which emails they have opened, which they have ignored, and which they have clicked on into your app or website.

## Push messaging

Push messaging is an incredibly powerful channel that puts your message very prominently in user's most important device: their mobile phone.

As with email marketing you may be using a third party to send push messages or have written your own solution (e.g. using [AWS Push Notification service][sns]) or a third party service e.g. [Urban Airship] [urbanairship]. 

If you have written your own push notificaiton system, you would integrate our trackers to record each push notification that is sent to each of your users. 

We are delighted that as of [release 75][r75], you can now ingest all your event-level Urban Airship data straight into your Snowplow alongside all your mobile and web behavioral data. That means Urban Airship users can automatically track the following events from Urban Airship, alongside all other event data:

* Application opens and first opens
* Application closes
* Message sends
* In-app messages displays
* In-app messages expires
* In-app messages resolutions
* App uninstalls

That is incredibly valuable data to store alongside the user's web, mobile and email engagement data.

## Telephone

For a large number of companies, the traditional telephone is a vital customer channel (both for customer acquisition and customer support).

There are companies running Snowplow that track calls using our trackers in their own telephony systems, and users who've made use of our webhook integration with [CallRail] [callrail]. You would typically  record that a call had taken place, who initiated the call (the user or the company), the purpose the call, the length of the call and any outcomes (e.g. if a transaction was completed, a support ticket raised etc.)

## Display advertising

A large number of Snowplow users (particularly media agencies) track ad impression and ad click events through Snowplow: enabling them to identify what ads a user has seen and clicked on prior to appearing on a website or in an app and making a purchase, for example, in order to build sophisticated attribution models.

Ad impressions are straightforward to track: you simply embed either a Snowplow pixel or the JS tracker in the ad tag. Note that because you can specify the tracker namespace and cookie name, you can ensure that Snowplow tags loaded in an ad tag do not interfere with other Snowplow tags that are loaded on the page. (Either tags that have been loaded on the page or other Snowplow tags embedded in other ads served.) 

Since [release 72] [r72], it is also possible to use Snowplow to do click tracking. Our Clojure Collector supports redircting users - that means you can use it to track clicks-outs from ads by redirecting them through the collector which records them before sending the user onto the click destination. 

## What else?

Building a complete picture of all the different events on all the different touchpoints you engage your users is a big job, that should include interactions in the physical as well as the digital world. We are working hard to extend Snowplow to make it easier to do just that. We would love to hear from you if there are additional integrations you'd like to see us roll out.

## Interested in collecting and acting on *all* your event data, not just data from apps and the web?

Then [get in touch][contact] with the Snowplow team! 
 
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
[r75]: /blog/2016/01/02/snowplow-r75-long-legged-buzzard-released/
[r72]: /blog/2015/10/15/snowplow-r72-great-spotted-kiwi-released/
[contact]: /contact/
[google-analytics]: https://www.google.co.uk/analytics/
[adobe-analytics]: http://www.adobe.com/uk/marketing-cloud/web-analytics.html
[kissmetrics]: https://www.kissmetrics.com/
[mixpanel]: https://mixpanel.com/
[keen]: https://keen.io/

[java-tracker]: https://github.com/snowplow/snowplow-java-tracker
[python-tracker]:https://github.com/snowplow/snowplow-python-tracker