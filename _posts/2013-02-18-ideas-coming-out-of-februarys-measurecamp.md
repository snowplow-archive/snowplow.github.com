---
layout: post
title: Reflections on Saturday's Measurecamp
tags: [snowplow, measure, measurecamp, keywords, audience segmentation, server side tracking]
author: Yali
category: Analytics
---

On Satuday both Alex and I were lucky enough to attend London's second [Measurecamp] [measurecamp], an unconference dedicated to digital analytics. The venue was packed with smart people sharing some really interesting ideas - we can't do justice to all those ideas here, so I've just outlined my favourite two from the day:

1. [Using keywords to segment audience by product and interest match] [keywords], courtesy of [Carmen Mardiros] [carmen]
2. [Transferring commercially sensitive data into your web analytics platform via a server-side dataLayer] [server-side-datalayer], courtesy of [Matt Clarke] [techpad]

I've also post the slides I'd put together on [customer lifetime value] [clv] for the event: I didn't end up sharing these on the day, because the room where the session took place didn't have a projector. That was just as well, as I think we had a much more interesting conversation about customer lifetime value as a result.

<h2><a name="keywords">1. Using keywords to segment audience by product and interest match</a></h2>

In this rather excellent presentation, [Carmen] [carmen] showed how you can use keywords users enter (either in searches directing them to your website, or on internal searches) to classify audience in especially meaningful buckets e.g.

* Are they already a customer?
* Are they brand aware?
* Are they looking to purchase vs looking for support?
* Are they interested broadly or narrowly in your area?

<!--more-->

And then test whether those audience behaved in significantly different ways to validate your segmentation. (For example, comparing bounce rates or conversion rates between segments.) Once validated, the segmentation enables you to apply segment-specific KPI: for example, it is meaningless analysing purchase conversion rates for users who have already bought, and are returning to the site for support-related queries.

<iframe src="http://www.slideshare.net/slideshow/embed_code/16581811" width="427" height="356" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC;border-width:1px 1px 0;margin-bottom:5px" > </iframe>

<div style="margin-bottom:5px"> <strong> <a href="http://www.slideshare.net/carmenmardiros/getting-to-the-people-behind-the-keywords-16581811" title="Getting to the People Behind The Keywords" target="_blank">Getting to the People Behind The Keywords</a> </strong> from <strong><a href="http://www.slideshare.net/carmenmardiros" target="_blank">Carmen Mardiros</a></strong> </div>

An especially exciting prospect going forwards is to use machine learning to extend the segmentation beyond the subset of users for whom we have keyword data: so we can classify users who have not entered keywords, but appear to behave in a similar way to those who have, into the same buckets. This would be especially powerful with Snowplow data, as we have a user's complete click stream to work with when identifying users who "look-like" those we have classified on the basis of keywords alone. I hope to explore this in the near future, and blog about it here.

<h2><a name="server-side-datalayer">Transferring commercially-sensitive data into your web analytics platform via a server-side dataLayer</a></h2>

In another excellent presentation, [Matt Clarke] [techpad] talked through his experience implementing [Universal Analytics] [ua] at an online retailer. The key driver for Matt in choosing to implement Universal Analytics was a desire to deliver more commercially meaningful from Google Analytics, including:

* Profitability of individual marketing campaigns (e.g. AdWords)
* Conversion rates by product and by brand

In order to report on the above, it is necessary to capture margin data with every sale (in the case of 1) and record views, add to baskets and transactions by product and brand (in the case of 2). In both instances, Matt needed to pass more data into his web analytics platform than Google Analytics has traditionally allowed, which made Google's new Universal Analytics an attractive alternative.

Passing this commercially sensitive data into Univesal Analytics is not trivial, however. Pushing it through the client-side dataLayer would make it available to any competitor. So instead, Matt passed the data server side into Universal Analytics. Universal Analytics does not have a PHP tracker, but Matt was able to effectively build his own using Google's [Measurement Protocol] [measurement-protocol]. By syncronising the client ID sent by the Javascript tracker with his own server-side tracker, Matt enables Universal Analtyics to stitch together the data generated client and server side. You can see more details in Matt's presentation below:

<iframe src="http://www.slideshare.net/slideshow/embed_code/16578670" width="427" height="356" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC;border-width:1px 1px 0;margin-bottom:5px" > </iframe>

<div style="margin-bottom:5px"> <strong> <a href="http://www.slideshare.net/MattClarke4/measurecamp-improving-e-commerce-tracking-with-universal-analytics" title="Measurecamp - Improving e commerce tracking with universal analytics" target="_blank">Measurecamp - Improving e commerce tracking with universal analytics</a> </strong> from <strong><a href="http://www.slideshare.net/MattClarke4" target="_blank">Matt Clarke</a></strong> </div>

Matt's presentation is a must-read for anyone who wants to push web analytics tools into a more powerful business analytics tool. For us at Snowplow, it really highlights the need to enable server side tracking alongside client-side tracking: previously it hadn't occurred to me that a Snowplow user might want to use both approaches together, and replicate the dataLayer approach that has become best practice client-side on the server-side.

<h2><a name="clv">Customer lifetime value</a></h2>

These are the slides I prepared for my session on customer lifetime value:

<iframe src="http://www.slideshare.net/slideshow/embed_code/16598692" width="427" height="356" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC;border-width:1px 1px 0;margin-bottom:5px" > </iframe>

<div style="margin-bottom:5px"> <strong> <a href="http://www.slideshare.net/yalisassoon/customer-lifetime-value-16598692" title="Customer lifetime value" target="_blank">Customer lifetime value</a> </strong> from <strong><a href="http://www.slideshare.net/yalisassoon" target="_blank">yalisassoon</a></strong> </div>

We had a very interesting discussion about the challenges both of tracking user behavior across user lifetime, and started to explore approaches to developing predictive models for customer lifetime value. In 30 minutes we didn't get the chance to develop these very far - I hope we find another forum (maybe G+?) to continue the conversation. Many thanks to all those who attended: I learnt a lot from you.

## Thank you Measurecamp

Big thanks to the [Measurecamp Team] [measurecamp-team]. It was a brilliant event, and we're looking forward to the next one in 6 months time!


[keywords]: /blog/2013/02/18/ideas-coming-out-of-februarys-measurecamp#keywords
[server-side-datalayer]: /blog/2013/02/18/ideas-coming-out-of-februarys-measurecamp#server-side-datalayer
[clv]: /blog/2013/02/18/ideas-coming-out-of-februarys-measurecamp#clv

[measurecamp]: http://www.measurecamp.org/
[carmen]: https://twitter.com/carmenmardiros
[techpad]: https://twitter.com/TechPad
[keywords-pres]: http://www.slideshare.net/carmenmardiros/getting-to-the-people-behind-the-keywords-16581811
[ua-pres]: http://www.slideshare.net/MattClarke4/measurecamp-improving-e-commerce-tracking-with-universal-analytics
[ua]: http://support.google.com/analytics/bin/answer.py?hl=en&answer=2790010&topic=2790009&ctx=topic
[measurement-protocol]: https://developers.google.com/analytics/devguides/collection/protocol/v1/
[pete]: https://twitter.com/peter_oneill
[measurecamp-team]: http://www.measurecamp.org/attendees/
