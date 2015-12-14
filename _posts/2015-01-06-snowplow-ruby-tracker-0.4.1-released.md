---
layout: post
title: Snowplow Ruby Tracker 0.4.1 released
title-short: Snowplow Ruby Tracker 0.4.1
tags: [snowplow, analytics, ruby, rails, tracker]
author: Fred
category: Releases
---

We are happy to announce the release of version 0.4.1 of the Snowplow Ruby Tracker. This is a bugfix release which resolves compatibility issues between the Ruby Tracker and the rest of the Snowplow data pipeline.

Please note that version 0.2.0 of the Ruby Tracker is dependent upon Snowplow 0.9.14 for `POST` support; for more information please refer to the [technical documentation][wiki].

Read on for more detail on:

1. [POST request format fix](/blog/2015/01/06/snowplow-ruby-tracker-0.4.1-released/#post)
2. [Compatibility](/blog/2015/01/06/snowplow-ruby-tracker-0.4.1-released/#compatibility)
3. [Getting help](/blog/2015/01/06/snowplow-ruby-tracker-0.4.1-released/#help)

<!--more-->

<h2><a name="post">1. POST request format fix</a></h2>

Version 0.4.0 incorrectly sent POST requests as forms rather than as bodies, so they could not be correctly parsed by a collector. This release fixes that issue, correctly setting the body of the POST request.

<h2><a name="compatibility">2. Compatibility with the rest of Snowplow</a></h2>

This release increases the version of the payload_data JSON schema used for `POST`s to 1-0-2. Earlier (pre-0.9.14) versions of the Snowplow enrichment process expect this JSON to be of version 1-0-0 and will reject events sent by `POST` by version 0.4.1 of the Ruby Tracker. In order to process events sent by `POST` by this version of the Ruby Tracker, you must be running Snowplow version 0.9.14 or greater.

<h2><a name="help">3. Getting help</a></h2>

These links may be useful:

* The [wiki page][wiki]
* The [GitHub repository][repo]

If you have an idea for a new feature or want help getting things set up, please [get in touch] [talk-to-us]. [Raise an issue][issues] in the GitHub repository if you find any bugs.

[repo]: https://github.com/snowplow/snowplow-ruby-tracker
[wiki]: https://github.com/snowplow/snowplow/wiki/Ruby-Tracker
[issues]: https://github.com/snowplow/snowplow-ruby-tracker/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
