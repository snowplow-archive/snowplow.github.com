---
layout: post
title: Integrating Snowplow with Google Tag Manager
tags: [snowplow, tag management, google tag manager, datalayer]
author: Yali
category: Releases
---

A month and a half ago, Google launched [Google Tag Manager] [gtm] (GTM), a free tag management solution. That was a defining moment in tag management history as it will no doubt bring tag management, until now the preserve of big enterprises, into the mainstream.

![gtm] [gtm-image]

We have spent some time testing how to get Snowplow tags working well with Google Tag Manager, and have documented our recommended approach to setting up Snowplow with GTM on the [wiki] [integrate-snowplow-gtm].

In the course of reading the literature on tag management and Google Tag Manager in particular, we were struck by a number of issues and misconceptions:

1. Setting up a Tag Management System is a big and complicated job. Much of the literature (especially around Google Tag Manager), and discussion (especially amongst members of the web analytics community) suggests it is very easy. Whilst Google Tag Manager is a straightforward product to use, the process of setting it up is difficult, because it involves thinking through, in a very rigorous way, exactly what data should be passed between the website and GTM. If this is not done properly, GTM will not have the relevant data to pass on to the tags it manages, including Snowplow.
2. Exacerbating the above, there is a lack of detailed literature on how to go about identifying all the data points that should be passed between your website and tag management solution. Nearly all the guides to setting up GTM that we reviewed covered only the most basic of GTM setups, which is just enough to enable page tracking. Clearly, that is not going to be sufficient for anything but the simplest blogs and brochureware sites.
3. One of the tag management features most regularly trumpetted by digital and marketing analysts is that it frees them from having to liaise with their webmasters to add new tags and change existing tag setups. Even with a tag management solution in place, however, this may still be necessary if not all the data that the analyst wants passed through to their analytics package is available in the tag maangement system.

As a step towards addressing the above issues, we have produced a step-by-step guide to both  [setting up Google Tag Manager][setup-gtm] and [setting up Snowplow within GTM][setup-snowplow-in-gtm]. We hope you find it useful. We plan to produce a similar guide to setting up Snowplow within [Qubit's OpenTag solution] [qubit] in due course.

We're very excited by Google's launch of Tag Manager, and recommend all new Snowplow users who are not currently using a tag management system integrate one as part of their Snowplow setup. Specifically:

1. The exercise that companies need to go through when setting up a tag management platform i.e. thinking through all the data points that they want to pass to their tag management system so that they can be passed on to whatever tags are managed in the system, is the same process they should go through when they setup Snowplow, with a view to enabling the widest possible set of analyses on their web analytics data. So even though that exercise is not easy, it is valuable
2. The processing of mapping that data from the structure defined in the tag management system to one which works with Snowplow's data structure is the exact reverse of the analysis process that takes Snowplow data and transforms it back into the structure that's most natural for the company performing the analysis.
3. Once the tag management system has been installed, it becomes easy to upgrade the tags and / or change the configuration. There are a number of improvements we plan to make to our [Javascript tracker] [js-tracker], and having a tag management program will make it easier for companies to take advantage of those upgrades.





[gtm]: http://www.google.com/tagmanager/
[gtm-image]: /assets/img/gtm.JPG
[integrate-snowplow-gtm]: https://github.com/snowplow/snowplow/wiki/Integrating%20javascript%20tags%20with%20Google%20Tag%20Manager#wiki-snowplow-setup
[setup-gtm]: https://github.com/snowplow/snowplow/wiki/Integrating%20javascript%20tags%20with%20Google%20Tag%20Manager#wiki-setup-gtm
[setup-snowplow-in-gtm]: https://github.com/snowplow/snowplow/wiki/Integrating%20javascript%20tags%20with%20Google%20Tag%20Manager#wiki-snowplow-setup
[js-tracker]: https://github.com/snowplow/snowplow/tree/master/1-trackers/javascript-tracker
[qubit]: http://www.opentag.qubitproducts.com/
