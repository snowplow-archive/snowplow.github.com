---
layout: post
title: Implementing Snowplow with QuBit's OpenTag
title-short: Using OpenTag with Snowplow
tags: [javascript, tracker, tag management, datalayer]
author: Yali
category: Documentation
---

This is a short blog post to highlight a new section on the [Snowplow setup guide] [setup-guide] covering [how to integrate Snowplow with QuBit's OpenTag tag management system] [setup-snowplow-with-opentag].

In November last year, we started playing with tag management systems: testing Snowplow with Google Tag Manager, and documented how to setup Snowplow with GTM on the [Snowplow setup guide] [setup-snowplow-with-gtm]. We were impressed on a number of fronts, but thought that the much more thought need to be put into what data was passed into the tag management system than people typically admit. (We documented our thoughts, at the time, on [this blog post] [gtm-post].)

Since then, we've recommended that **all** new Snowplow users setup a tag management system, prior to integrating Snowplow on their website, if they have not already done so. The benefits of doing so are well documented elsewhere. For Snowplow users, there are two big benefits in particular, that we will flag:

1. Going through the exercise of implementing a tag management solution forces companies to take a rigorous look at the data they pass from their website into the tag manager, especially when declaring the data explicitly using things like the `dataLayer` (in GTM) or the `Universal Variable` in OpenTag. This makes it easier for analysts, down the line, to understand _what_ data has been passed into their web analytics system, and how that data has been generated: key bits of information that can often get lost months after web analytics platforms like Snowplow have been implemented. In addition, it makes the analytics as a whole more robust, as the generation of data is decoupled from the generation of other elements of web pages, which means web developers can continue to improve site functionality, safe in the knowledge they wont break anything on the analytics side.
2. A selfish reason, perhaps, but having our customers use a tag management platforms gives us the freedom to improve Snowplow tracking tags where we see the opportunity, safe in the knowledge that we're not causing our clients too much difficulty to upgrade their tags.

![qubit-opentag-logo] [qubit-opentag-logo]

We were eager, having integrated Snowplow with GTM, to integrate it with an open source tag management system. After all, a big selling point of Snowplow is that it is open source: enabling companies to setup, own and manage their own data infrastructure, without relying on a third party to mediate their access to their own data. We were therefore delighted that QuBit has developed an open source tag management system, [OpenTag] [opentag], and that we have finally documented [how to integrate it with Snowplow] [setup-snowplow-with-opentag].

There is a lot we like about QuBit's OpenTag:

1. **Open source**. You can view the [OpenTag.js] [opentag-js] on Github to get a handle on exactly how OpenTag works
2. **Low cost hosted service**. QuBit offers free hosting for sites with less than 1M page views per month, and $99 per 10M page views thereafter
3. **Easy-to-implement host-yourself option**. You can use OpenTag's web UI to configure all your tags for free and publish the results to a Javascript file that you can then host on your own CDN (e.g. Amazon Cloudfront). By not using Qubit to host the configured javascript file with all your different tags, you are not locked into QuBit as a vendor. In addition, the cost of managing your tags across large sites, content networks and ad networks is kept at a bare minimum.

In order to make it easier for new Snowplow users to implement OpenTag alongside Snowplow, and existing OpenTag users to implement Snowplow, we've documented how to setup Snowplow in OpenTag on our [setup guide] [setup-snowplow-with-opentag].

Keep plowing!



[opentag]: http://www.opentag.qubitproducts.com/
[setup-snowplow-with-gtm]: https://github.com/snowplow/snowplow/wiki/Integrating-javascript-tags-with-Google-Tag-Manager
[gtm-post]: /blog/2012/11/16/integrating-snowplow-with-google-tag-manager/
[setup-snowplow-with-opentag]: https://github.com/snowplow/snowplow/wiki/Integrating%20Javascript%20tags%20with%20QuBit%20OpenTag
[qubit-opentag-logo]: /assets/img/blog/2013/01/qubit-opentag.png
[opentag-js]: https://github.com/QubitProducts/OpenTag/blob/master/OpenTag.js
[setup-guide]: https://github.com/snowplow/snowplow/wiki/Snowplow-setup-guide
