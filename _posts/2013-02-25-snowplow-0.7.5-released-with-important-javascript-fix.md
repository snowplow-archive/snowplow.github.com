---
layout: post
title: Snowplow 0.7.5 released with important JavaScript fix
title-short: Snowplow 0.7.5
tags: [snowplow, javascript, tracker]
author: Alex
category: Releases
---

We are releasing Snowplow version **0.7.5** - which upgrades the JavaScript tracker to version **0.11.1**. This is a small but important release - because we are fixing an issue introduced in Snowplow version a month ago: **if you are on versions 0.9.1 to 0.11.0 of the JavaScript tracker, please upgrade!**

Essentially, version 0.9.1 of the JavaScript tracker (released in Snowplow 0.7.2) fixed [an old bug] [issue-147] which we inherited from the Piwik JavaScript tracker when we forked it early last year; this bug was stopping the secure flag from being set on Snowplow's first-party cookies when sent via HTTPS pages.

Unfortunately, fixing this bug caused a larger problem: sending cookies securely from HTTPS pages meant that HTTP pages could no longer read the cookies, causing the cookies to be regenerated. As a result, Snowplow's `domain_userid` field (the first-party user ID) was being **reset** when a user browsed from an HTTPS page (e.g. checkout) back to an HTTP page.

So, this release fixes [a nasty bug] [issue-181]. Thanks to the Piwik team for their help in brainstorming this problem!

Please update your website(s) to use the latest version of the JavaScript tracker, which is version 0.11.1. As always, the updated minified tracker is available here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/0.11.1/sp.js

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[issue-147]: https://github.com/snowplow/snowplow/pull/147
[issue-181]: https://github.com/snowplow/snowplow/issues/181

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
