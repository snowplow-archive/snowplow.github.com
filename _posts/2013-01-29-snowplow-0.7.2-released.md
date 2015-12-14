---
layout: post
title: Snowplow 0.7.2 released, with the new Pixel tracker
title-short: Snowplow 0.7.2
tags: [snowplow, no javascript, pixel, tracker, collector, pixel tracker, tracking pixel]
author: Alex
category: Releases
---

We're excited to announce the release of Snowplow version **0.7.2**. As well as a couple of bug fixes, this release includes our second Snowplow tracker - the [Pixel Tracker] [pixel-tracker], to be used in web environments where a JavaScript-based tracker is not an option.

One of the bug fixes is particularly important: we are recommending that **all users of the Clojure-based Collector upgrade** to the new version (0.2.0) due to a serious bug in the way that event timestamps were recorded.

But first let's look at the Pixel Tracker, and then talk about the other fixes:

## Introducing the Pixel Tracker

The [Pixel Tracker] [pixel-tracker] can be used to log web events in environments that do not support Javascript. Examples of events include:

* Views an HTML email
* Views of product listing on a 3rd party marketplace
* Views a page on a 3rd party hosting site

Our [Pixel Tracking tag wizard] [pixel-tracker] makes it easier to generate pure-HTML tracking tags. Were you to embed these in email marketing messages, for example, you would be able to compare the behavior of users on your website who had opened specific messages with those who had not. The [Pixel Tracker] [pixel-tracker] enables you to track a broader set of user events in Snowplow, so providing greater coverage of your users' journeys. For more information on the [Pixel tracker] [pixel-tracker] see the [blog post] [introducing-pixel-tracker].

<!--more-->

## Important bug fixes

We have fixed an important issue with the logging on the Clojure Collector ([issue 146] [issue-146]). The previous version was logging all event dates using a 12-hour clock - meaning that it was impossible to tell if an event happened in the morning or evening.

As a result of this, we **strongly recommend** that **all** users of the Clojure-based Collector upgrade to the new version, 0.2.0. As always, you can find this version available from our [Hosted assets page] [hosted-assets].

Our second bug ([issue 147] [issue-147]) was spotted and fixed by [Angus Mark] [angus-mark] from [Simply Business] [simply-business] - many thanks Angus! There was a bug in the JavaScript tracker where the secure flag was not being correctly set on Snowplow cookies transmitted over HTTPS.

We don't believe that this bug was breaking any functionality, but you can upgrade to the new version 0.9.1 of the tracker at this URL:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/0.9.1/sp.js

And that's it! As always, if you do run into any issues, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[pixel-tracker]: /no-js-tracker.html

[issue-146]: https://github.com/snowplow/snowplow/issues/146
[hosted-assets]: https://github.com/snowplow/snowplow/wiki/Hosted-assets

[introducing-pixel-tracker]: /blog/2013/01/29/introducing-the-pixel-tracker/

[issue-147]: https://github.com/snowplow/snowplow/pull/147
[angus-mark]: https://github.com/ngsmrk
[simply-business]: http://www.simplybusiness.co.uk/

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
