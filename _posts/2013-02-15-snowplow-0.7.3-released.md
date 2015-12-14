---
layout: post
title: Snowplow 0.7.3 released, tracking additional data
title-short: Snowplow 0.7.3
tags: [snowplow, javascript, tracker, release]
author: Alex
category: Releases
---

We're excited to announce the release of Snowplow version **0.7.3**. This release adds a set of **16 all-new fields** to our event model:

* A new Event Vendor field
* The Page URL split out into its component parts (scheme, host, port, path, querystring, fragment/anchor)
* The web page's character set
* The web page's width and height
* The browser's viewport (i.e. visible width and height)
* For page pings, we are now tracking the user's scrolling during the last ping period (four fields)

These fields should make a new set of analyses on Snowplow data, including analysing how deeply users engage with different web pages (e.g. what percentage of a web page have they viewed, and how fast). In addition, it should make some analyses easier, e.g. aggregating (and comparing) metrics by page by page and domain.

In addition, the new release includes some minor bug fixes. In this post we will cover:

1. [The new fields](/blog/2013/02/15/snowplow-0.7.3-released#new-fields)
2. [Bug fixes](/blog/2013/02/15/snowplow-0.7.3-released#bug-fixes)
3. [Breaking changes](/blog/2013/02/15/snowplow-0.7.3-released#breaking-changes)
4. [Upgrading](/blog/2013/02/15/snowplow-0.7.3-released#upgrade)

<h2><a name="new-fields">1. New fields</a></h2>

We are hugely excited to be including 16 new fields in this release - we believe that these fields should unlock a whole host of new analyses on Snowplow data.

For completeness, we list out all of the new fields below. Note that all of the new fields are available in both the S3 (aka Hive) and Infobright (aka non-Hive) storage outputs:

| Field              | Datatype | Description                                          |
|:-------------------|:---------|:-----------------------------------------------------|
| `event_vendor`     | string   | Which company or org. defined this event type        |
| `page_urlscheme`   | string   | Scheme aka protocol, e.g. "https"                    |
| `page_urlhost`     | string   | Host aka domain, e.g. "www.snowplowanalytics.com"    |
| `page_urlport`     | int      | Port if specified, 80 if not                         |
| `page_urlpath`     | string   | Path to page, e.g. "/product/index.html"             |
| `page_urlquery`    | string   | Querystring, e.g. "id=GTM-DLRG"                      |
| `page_urlfragment` | string   | Fragment aka anchor, e.g. "4-conclusion"             |
| `br_viewwidth`     | integer  | The width of the browser's viewport in pixels        |
| `br_viewheight`    | integer  | The height of the browser's viewport in pixels       |
| `doc_charset`      | string   | The page's character encoding, e.g. "UTF-8"          |
| `doc_width`        | integer  | The total width of the page (incl. non-viewed area)  |
| `doc_height`       | integer  | The total height of the page (incl. non-viewed area) |
| `pp_xoffset_min`   | integer  | Minimum page x offset seen in the last ping period   |
| `pp_xoffset_max`   | integer  | Maximum page x offset seen in the last ping period   |
| `pp_yoffset_min`   | integer  | Minimum page y offset seen in the last ping period   |
| `pp_yoffset_max`   | integer  | Maximum page y offset seen in the last ping period   |

Don't worry if some of these new fields don't make immediate sense based on the descriptions above - we will take a look at each of these fields in the sub-sections below:

<!--more-->

### 1.1 Event vendor

As we have [previously blogged] [help-us-develop-the-snowplow-event-model], we are in the process of developing the Snowplow event model: the list of first-class events for which we've defined a structured data model. As we stressed in the [blog post] [help-us-develop-the-snowplow-event-model], we well understand that different models will be appropriate for different websites and applications, and that model we develop will not be ideal for everyone. In the future, we plan to enable different companies to develop their own first class data model within Snowplow. As a first step in this direction, we have added the **Event vendor** field to the Snowplow data model: when a company develops its own event data model, it will be identifiable to that vendor using this field. This will open up the possibility of:

1. Ingesting proprietary events from third-party systems (e.g. `event_vendor`="com.sendgrid" or "com.appnexus")
2. Ingesting clickstream events from other analytics services (e.g. `event_vendor`="com.adobe" or "com.mixpanel")
3. Tracking custom events defined by a specific Snowplow user (e.g. `event_vendor`="au.com.asnowplowuser")

At the moment, however, all events will have an `event_vendor` field that will be "com.snowplowanalytics" (using the Java package-style naming convention).

### 1.2 Page URL components

We have split the `page_url` into its six component parts (the unprocessed `page_url` field is left unchanged). Having these fields broken out should make it much easier to do page URL-based analyses, such as aggregating data for specific `page_url`s (ignoring query strings) or investigating HTTPS traffic.

### 1.3 Viewport fields

Each event now tracks the current viewport of the browser - in other words, the viewable area (width x height) current available within the browser.

This will enable analysts to distinguish browsing behavior based on viewport size, and see if there are specific events on a customer journey that trigger a user resizing his / her browser. (Which is a useful user-experience indicator.)

### 1.4 Document width and height

We are now tracking the complete width and height of the current document (aka web page) on each event. This tells you the total width and height of the current page, as perceived by the browser. This measures the whole document - i.e. including the non-viewable part of the document.

This can be used in conjunction with the new viewport fields (above) and page ping offsets (below) to analyse what fraction of a document a user has engaged with, and over what time period.

### 1.5 Page ping offsets

These four new offset fields are perhaps the most complex new additions. First of all: these fields are only set if you `enableActivityTracking()` on your site. In a nutshell, activity tracking:

* Silently checks for user activity (mouse movements, scrolling, key presses etc) on a page for a specified time period (e.g. 10 seconds)
* If any user activity was detected in those 10 seconds, the tracker sends a "page ping" back to Snowplow. (No user activity, no page ping)
* This is then repeated for each new time period, until the user navigates away from the page

In this release we are sending four new offset fields along with each page ping event. These offsets track the **minimum** and **maximum** horizontal and vertical page offsets scrolled to by the user in the last page ping period. In other words: these four fields tell you how far left/right and up/down the user scrolled during the last ping period.

**Simply put: these new offset fields are designed to provide a clear view of how your users scroll around your webpages over time.** (Especially when combined with the viewport and document width and height fields also listed above.)

Huge thanks to [Rob Kingston] [kingo55] for providing the original idea and implementation around page ping offsets, and helping us to test our implementation!

### 1.6 Document characterset

Each event now tracks the document's charset where available (not all browsers set this).

<div class="html">
<a name="bug-fixes"><h2>2. Bug fixes</h2></a>
</div>

As well as the new fields introduced above, this release also includes a small set of bug fixes in the JavaScript tracker which are worth noting:

1. Our `logImpression()` method was not working (it was using the wrong argument names) - this has now been fixed.
2. The activity tracking (page ping) behavior was too fragile: if a single monitoring period elapsed with no activity, then all future monitoring would be cancelled. This could easily lead to on-page activity not being recorded. This has now been fixed

<div class="html">
<a name="breaking-changes"><h2>3. Breaking changes and deprecations</h2></a>
</div>

The following table tracks the breaking changes and deprecations in this version. **When upgrading to the latest version of the JavaScript tracker (0.10.0), please update your JavaScript tags as per the instructions below to avoid problems:**

| Type of change  | Component               | Change                         | Comment                                |
|:----------------|:------------------------|:-------------------------------|----------------------------------------|
| Breaking change | JavaScript tracker      | `setAccount()` removed         | Use `setCollectorCf()` instead         |
| Breaking change | JavaScript tracker      | `setTracker()` removed         | Use `getTrackerCf()` instead           |
| Breaking change | JavaScript tracker      | `setHeartBeatTimer()` removed  | Use `enableActivityTracking()` instead |
| Deprecation     | JavaScript tracker      | `trackEvent()` deprecated      | Use `trackStructEvent()` instead       |
| Data change     | S3 & Infobright storage | `event`="custom" changed       | Changed to `event`="struct"            |

The first three changes are simply cleanup: we are removing tracker methods which we previously deprecated some time ago.

The last two changes are us starting to re-structure our event tracking - we are making space in our event model to support unstructured events, which will be coming soon. Please check out our previous blog post, [Help us build out the Snowplow Event Model] [event-model-post] for more background on this.

<div class="html">
<a name="upgrade"><h2>4. Upgrading</h2></a>
</div>

Upgrading is a three-step process:

### 4.1 JavaScript tracker

Please update your website(s) to use the latest version of the JavaScript tracker, which is version 0.10.0. As always, the updated minified tracker is available here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/0.10.0/sp.js

**Don't forget to update your Snowplow tags as per the updates in [breaking changes] (#breaking-changes) and deprecations above.**

### 4.2 ETL

If you are using EmrEtlRunner, you need to update your configuration file, `config.yml`, to use the latest versions of the Hive serde and HiveQL scripts:

    :snowplow:
      :serde_version: 0.5.4
      :hive_hiveql_version: 0.5.5
      :non_hive_hiveql_version: 0.0.6

### 4.3 Infobright

If you are using Infobright Community Edition for analysis, you will need to update your table definition. To make this easier for you, we have created two scripts:

    4-storage/infobright-storage/migrate_004_to_006.sh
    4-storage/infobright-storage/migrate_005_to_006.sh

Choose the appropriate script depending on whether your current events table is `events_004` or `events_005`.

Running this script will create a new table, `events_006` (version 0.0.6 of the Infobright table definition) in your `snowplow` database, copying across all your data from your existing `events` table, which will not be modified in any way.

Once you have run this, don't forget to update your StorageLoader's `config.yml` to load into the new `events_006` table, not your old `events` table:

    :storage:
      :type: infobright
      :database: snowplow
      :table:    events_006 # NOT "events_004" or "events_005" any more

Done!

## 5. Getting help

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[event-model-post]: /blog/2013/02/04/help-us-build-out-the-snowplow-event-model/

[kingo55]: https://github.com/kingo55

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[help-us-develop-the-snowplow-event-model]: /blog/2013/02/04/help-us-build-out-the-snowplow-event-model/
