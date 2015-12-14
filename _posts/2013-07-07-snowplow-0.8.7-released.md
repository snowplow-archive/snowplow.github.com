---
layout: post
title: Snowplow 0.8.7 released with JavaScript Tracker improvements
title-short: Snowplow 0.8.7
tags: [snowplow, javascript, tracker, release]
author: Alex
category: Releases
---

After a brief summer intermission, we are pleased to announce the release of [Snowplow **0.8.7**] [snowplow-087]. This is a small release, primarily consisting of bug fixes for the JavaScript Tracker, which is bumped to version 0.12.0.

As well as some tweaks and improvements, this release fixes bugs which only occurred on older versions of Internet Explorer, and fixes a bug which prevented the `setCustomUrl()` method from working properly. Many thanks to community member [mfu0] [mfu0] and Snowplow client [BigCommerce] [bigcommerce] for bringing some of these issues to our attention.

As always, the updated minified tracker is available here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/0.12.0/sp.js

Please note that this release implements the latest version of the [Snowplow Tracker Protocol] [tracker-protocol], whereby custom structured event fields now start with `se_` rather than `ev_`. This change is backwards compatible with all versions of the Hadoop-based ETL, but **not** with the Hive-based ETL. If you are still using the Hive ETL, we **strongly** recommend you upgrade to the Hadoop ETL.

This is the first Snowplow release to make use of the new [GitHub Releases] [github-releases] functionality - so do check out the [0.8.7 Release Notes] [snowplow-087].

Finally, we should mention that this is the last Snowplow release with the JavaScript Tracker as part of the main Snowplow repository. As the number of Snowplow trackers grows (it's now four and counting), it makes more sense for each tracker to have its own repository, bug tracker, CI configuration and so forth. Don't worry though - the JavaScript Tracker will remain _primus inter pares_ among the Snowplow trackers. We will make this split in the next Snowplow release.

[snowplow-087]: https://github.com/snowplow/snowplow/releases/0.8.7
[bigcommerce]: http://www.bigcommerce.com/
[mfu0]: https://github.com/mfu0
[tracker-protocol]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol
[github-releases]: https://github.com/blog/1547-release-your-software
