---
layout: post
title: Snowplow 0.4.10 released
title-short: Snowplow 0.4.10
tags: [snowplow, release, hive, serde]
author: Alex
category: Releases
---

We have just released version **0.4.10** of Snowplow - people using 0.4.8 can jump straight to this version. This version updates:

1. snowplow.js to version 0.7.0
2. the Hive deserializer to version 0.4.9

Big thanks to community members [Michael Tibben] [mtibben] from [99designs] [99designs] and [Simon Andersson] [ramn] from [Qwaya] [qwaya] for their most-helpful contributions to this release!

## Main changes

The main changes are as follows:

* The querystring parameter for site ID which the JavaScript tracker sends to your collector is renamed from `said` to `aid`
* The Hive-based ETL process now extracts the ecommerce tracking fields and the site ID field and adds them into your processed events table
* We fixed a bug in the Hive deserializer where a partially-processed row was returned even if a fatal error was found in the row (now, a null row is returned instead)

The rest of the changes were all enhancements to the Hive deserializer's Specs2 test suite - these improvements should help to accelerate work on the deserializer (we have lots of cool new stuff we want to add to the deserializer!).
<!--more-->

## New event table fields

The new fields in the event table all relate directly to additional tracking functionality which was added to the JavaScript tracker in [Snowplow 0.4.7] [snowplow-0.4.7]. Specifically:

1. The `setSiteId()` functionality is now extracted to the `app_id` field (short for application ID)
2. The ecommerce tracking functionality is now extracted to a set of `tr_` and `ti_` fields

For details on the new fields, please review our latest [Hive events table definition] [hive-table-definition] - there is now a column indicating in which version a given field was added.

## How to get the new version

As usual, the new version of the Hive deserializer is available from the GitHub repository's [Downloads] [downloads] section as **snowplow-log-deserializers-0.4.9.jar**.

The updated snowplow.js is [available in our GitHub repository] [snowplow-js] for you to minify and upload, or alternatively you can use the one on our CDN:

    https://d1fc8wv8zag5ca.cloudfront.net/0.7.0/sp.js

If you have any problems with either of these components, please [raise an issue] [issues]!

## A note on backwards compatibility for the events table

We will continue to add extra fields to the Snowplow events table as we add extra capabilities to the ETL process - for example, we are working on functionality to extract geo-location information from IP addresses via MaxMind.

Starting with our new `app_id` field, we will be adding all such new fields to the **end** of our Hive events table definition. This will mean that you will **not** have to re-run the ETL process across all your historic raw logs, provided you do **not** need the data found in the new fields. This is because a Hive query across both the old event table format and the new table format works as long as you don't explicitly query a new field.

In other words, Hive is futureproofed against new fields being added to the end of your underlying data files, and we'll take advantage of this to improve backwards compatibility for our events table!

[mtibben]: https://github.com/mtibben
[99designs]: http://99designs.com
[ramn]: https://github.com/ramn
[qwaya]: http://www.qwaya.com
[snowplow-0.4.7]: /blog/2012/09/06/snowplow-0.4.7-released/
[snowplow-js]: https://raw.github.com/snowplow/snowplow/master/1-trackers/javascript-tracker/js/snowplow.js
[hive-table-definition]: /analytics/snowplow-table-structure.html
[issues]: https://github.com/snowplow/snowplow/issues
[downloads]: https://github.com/snowplow/snowplow/downloads
