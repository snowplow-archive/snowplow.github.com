---
layout: post
title: Snowplow 0.6.3 released, with JavaScript and HiveQL bug fixes
title-short: Snowplow 0.6.3
tags: [snowplow, javascript, tracker, hive, hiveql]
author: Alex
category: Releases
---

Today we are releasing Snowplow version **0.6.3** - another clean-up release following on from the 0.6.2 release. This release bumps the JavaScript Tracker to version 0.8.2, and the Hive-data-format HiveQL file to version 0.5.2.

Many thanks to the community members who contributed bug fixes to this release: [Mike Moulton] [mmoulton] @ [meltmedia] [meltmedia], [Simon Andersson] [ramn] @ [Qwaya] [qwaya] and [Michael Tibben] [mtibben] @ [99designs] [99designs].

We'll take a look at both fixes below:

<!--more-->

## JavaScript tracker fixes

This release fixes the issues in the JavaScript tracker raised in [issue 103] [issue-103].

These issues stemmed from the splitting of the JavaScript into multiple files in Snowplow version 0.6.1 (JavaScript tracker version 0.8.0). We do not believe these bugs affected Snowplow data collection, but they are well worth fixing.

Many thanks to [Michael Tibben] [mtibben] and [Simon Andersson] [ramn] for their help in squashing these bugs!

With these fixes we have bumped the JavaScript Tracker to version 0.8.2; the updated minified tracker is available as always here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/0.8.2/sp.js

## HiveQL script fix

This release also fixes a bug ([issue 112] [issue-112]) in the HiveQL file used to generate the **Hive-format** Snowplow event files.

This bug prevented the ETL from running if you were using EmrEtlRunner to generate Hive-format Snowplow event files - in other words if you had set:

    :storage_format: non-hive

in your EmrEtlRunner's `config.yml` file.

Many thanks to [Mike Moulton] [mmoulton] for spotting and fixing this one!

With this fix we have bumped the Hive-format HiveQL file to version 0.5.2. To start using the new file, all you need to do is update your EmrEtlRunner's `config.yml` file by changing:

    :hive_hiveql_version: 0.5.1

to:

    :hive_hiveql_version: 0.5.2

## Getting help

If you have any problems with Snowplow version 0.6.3, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[issue-103]: https://github.com/snowplow/snowplow/issues/103
[issue-112]: https://github.com/snowplow/snowplow/pull/112

[mmoulton]: https://github.com/mmoulton
[meltmedia]: http://meltmedia.com/
[ramn]: https://github.com/ramn
[qwaya]: http://www.qwaya.com
[mtibben]: https://github.com/mtibben
[99designs]: http://99designs.com

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
