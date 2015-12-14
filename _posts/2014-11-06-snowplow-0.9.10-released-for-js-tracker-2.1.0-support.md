---
layout: post
title: Snowplow 0.9.10 released with support for new JavaScript Tracker v2.1.0 events
title-short: Snowplow 0.9.10
tags: [snowplow, enrichments, campaign, attribution]
author: Alex
category: Releases
---

We are pleased to announce the release of Snowplow 0.9.10. This is a minimalistic release designed to support the new events and context of the Snowplow JavaScript Tracker v2.1.1, also [released today] [js-tracker-release]

This release is primarily targeted at Snowplow users of Amazon Redshift who are upgrading to the latest Snowplow JavaScript Tracker (v2.1.0+).

Here are the sections after the fold:

1. [New Redshift tables](/blog/2014/11/06/snowplow-0.9.10-released-for-js-tracker-2.1.0-support/#redshift-ddl)
2. [New JSON Path files](/blog/2014/11/06/snowplow-0.9.10-released-for-js-tracker-2.1.0-support/#json-paths-files)
3. [A note on link_clicks](/blog/2014/11/06/snowplow-0.9.10-released-for-js-tracker-2.1.0-support/#a-note)
4. [Upgrading](/blog/2014/11/06/snowplow-0.9.10-released-for-js-tracker-2.1.0-support/#upgrading)
5. [Documentation and help](/blog/2014/11/06/snowplow-0.9.10-released-for-js-tracker-2.1.0-support/#help)

<!--more-->

<h2><a name="redshift-ddl">1. New Redshift tables</a></h2>

This release defines the following new tables for Redshift:

* `w3_org_performance_timing_1` (a context)
* `com_snowplowanalytics_snowplow_social_interaction_1` (an event)
* `com_snowplowanalytics_snowplow_site_search_1` (an event)
* `com_snowplowanalytics_snowplow_change_form_1` (an event)
* `com_snowplowanalytics_snowplow_submit_form_1` (an event)
* `com_snowplowanalytics_snowplow_remove_from_cart_1` (an event)
* `com_snowplowanalytics_snowplow_add_to_cart_1` (an event)

These tables are all closely modeled on the new JSON Schemas introduced into [Iglu Central] [iglu-central] ([repository] [iglu-central-repo]) in support of the new JavaScript Tracker release.

<h2><a name="json-path-files">2. New JSON Path files</a></h2>

To successfully shred the Tracker's new event and context JSONs into the new Redshift table definitions, we have defined new JSON Paths files:

* `org.w3/performance_timing_1.json`
* `com.snowplowanalytics.snowplow/social_interaction_1.json`
* `com.snowplowanalytics.snowplow/site_search_1.json`
* `com.snowplowanalytics.snowplow/change_form_1.json`
* `com.snowplowanalytics.snowplow/submit_form_1.json`
* `com.snowplowanalytics.snowplow/remove_from_cart_1.json`
* `com.snowplowanalytics.snowplow/add_to_cart_1.json`

<h2><a name="a-note">3. A note on link_clicks</a></h2>

Version 2.1.0 of the JavaScript Tracker added a new (optional) field to tracked link clicks, called `elementContent`.

In support of this, we released a new version of the `link_click` JSON Schema to Iglu Central, with SchemaVer 1-0-1 (compare link_click [1-0-0] [lc-1-0-0] with [1-0-1] [lc-1-0-1]). Due to a limitation in the way we perform shredding of JSONs, we are currently unable to introduce a new `element_content` into the Redshift table for support of this new field.

To be clear: you can send link clicks with the new `elementContent` attached; these will validate correctly and be stored in Snowplow enriched events (as JSON) correctly; the new field (but not the row) will simply be discarded on its way into Redshift.

We plan to fix this limitation in a future Snowplow release ([#1149] [issue-1149], [#1152] [issue-1152]).

<h2><a name="upgrading">4. Upgrading</a></h2>

You will need to deploy the tables for any new events/context you want to support into your Amazon Redshift database. Make sure to deploy these into the same schema as your `events` table resides in.

You can find all Redshift table definitions in our GitHub repository under [4-storage/redshift-storage/sql] [ddl-repo].

The StorageLoader will automatically pick up the new JSON Paths files - you do not have need to deploy these.

<h2><a name="help">5. Documentation and help</a></h2>

Documentation relating to the new events and contexts is available in the [full documentation for the JavaScript Tracker v2.1.1][docs].

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[js-tracker-release]: /blog/2014/11/06/snowplow-javascript-tracker-2.1.1-released
[iglu-central]: http://iglucentral.com/
[iglu-central-repo]: https://github.com/snowplow/iglu-central

[ddl-repo]: https://github.com/snowplow/snowplow/tree/master/4-storage/redshift-storage/sql
[lc-1-0-0]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-0
[lc-1-0-1]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1

[issue-1149]: https://github.com/snowplow/snowplow/issues/1149
[issue-1152]: https://github.com/snowplow/snowplow/issues/1152

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[docs]: https://github.com/snowplow/snowplow/wiki/Javascript-Tracker
