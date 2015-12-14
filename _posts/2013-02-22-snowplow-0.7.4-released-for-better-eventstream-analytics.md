---
layout: post
title: Snowplow 0.7.4 released for better eventstream analytics
title-short: Snowplow 0.7.4
tags: [snowplow, javascript, tracker, release]
author: Alex
category: Releases
---

Another week, another release! We're excited to announce Snowplow version **0.7.4**. The primary purpose of this release is to clean up and rationalise our event data model, in particular around **user IDs** and **event timestamps**. This release should lay the foundations for more sophisticated eventstream analytics (such as funnel analysis), by:

* Enabling companies to assign custom user IDs (e.g. when a customer logs on)
* Distinguish between IDs set at a domain level (via first-party cookies) and at a network level (via third-party cookies)
* Enable precise ordering of events in a user's click stream with accuracy correct to the milli-second

Many thanks to Snowplow users [Simply Business] [simply-business] and [Simon Rumble] [shermozle] (APN) for suggesting many of these changes and helping us to design them.

In this post we will cover:

1. [Our new user IDs](/blog/2013/02/22/snowplow-0.7.4-released-for-better-eventstream-analytics#user-ids)
2. [Our new event timestamps](/blog/2013/02/22/snowplow-0.7.4-released-for-better-eventstream-analytics#event-tstamps)
3. [Bug fixes](/blog/2013/02/22/snowplow-0.7.4-released-for-better-eventstream-analytics#bug-fixes)
4. [Breaking changes](/blog/2013/02/22/snowplow-0.7.4-released-for-better-eventstream-analytics#deprecations)
5. [Upgrading](/blog/2013/02/22/snowplow-0.7.4-released-for-better-eventstream-analytics#upgrading)
6. [Getting help](/blog/2013/02/22/snowplow-0.7.4-released-for-better-eventstream-analytics#help)

Read on below the fold to find out more!

<!--more-->

<h2><a name="user-ids">1. Our new user IDs</a></h2>

Historically, Snowplow has supported a single `user_id` field. Unfortunately, there were three issues with this:

1. Snowplow was **overloading** the field with two different meanings - if a user was running the CloudFront collector, the `user_id` field contained a user ID from a first-party cookie (set by the JavaScript tracker). If a user was running the Clojure collector, the `user_id` field contained a cross-domain user ID as set by in a third-party cookie (and the JavaScript-set first-party cookie was ignored).
2. Both meanings of `user_id` were **web-specific** - neither made sense for user tracking in a mobile app or any other platform which does not support cookies
3. No support for a **custom** user ID - Snowplow did not allow you to track a custom `user_id` specific to your business, such as your users' account numbers in your ecommerce package

In this release, we aim to solve these issues by separating out user IDs into three separate fields:

| Field              | Description                                                                                                     |
|:-------------------|:----------------------------------------------------------------------------------------------------------------|
| `user_id`          | A custom user ID which you can set. Will be supported by all trackers (except the Pixel tracker)                |
| `domain_userid`    | A user ID set by the JavaScript tracker in a first-party cookie; tied to the current domain                     |
| `network_userid`   | A user ID set by the Clojure collector in a third-party cookie; shared across a network of different domains    |

To make use of the new custom user ID, you can use the following new method in the JavaScript tracker:

{% highlight javascript %}
_snaq.push(['setUserId', 'alex-123']); // Business-defined user ID
{% endhighlight %}

Please note that you must call `setUserId()` on every page where you know the user ID - in other words the setting does not survive a pageload.

Whether or not each type of user ID is available for your analysis depends on the combination of your tracker and collector:

| Tracker         | Collector  | -> | `user_id`\* | `domain_userid` | `network_userid` |
|:----------------|:-----------|:---|:------------|:----------------|:-----------------|
| JS tracker      | CloudFront | -> | Yes         | Yes             | No               |
| JS tracker      | Clojure    | -> | Yes         | Yes             | Yes              |
| Pixel tracker   | CloudFront | -> | N/A         | No              | No               |
| Pixel tracker   | Clojure    | -> | N/A         | No              | Yes              |
| Non-web tracker | Any        | -> | Yes         | No              | No               |

\* Assuming you have added a call to `setUserId()` - which isn't possible in the Pixel tracker.


<h2><a name="event-tstamps">2. Our new event timestamps</a></h2>

Previously our data model included two fields, `dt` and `tm`, to track the date and time at which each event occurred. This timestamp was based on when the Snowplow event collector _received_ the event, **not** when the tracker _sent_ the event.

There are a couple of limitations to using a collector-based timestamp for eventstream analysis:

1. If two events occur almost simultaneously in the client, there is no guarantee which will be received by the collector first (because of the unpredictability of the HTTP connection)
2. If a tracker batches events and then sends them in one batch (e.g. a cellphone out of cell coverage) , then all of the events in that batch will end up with the same collector timestamp, despite occurring at different times

For this reason, in this release we are introducing a tracker-based timestamp, which is set by the tracker when the event occurs, and is stored in our data model alongside the collector timestamp. This means that we now have five timestamp fields:

| Field              | Datatype | Description                                       |
|:-------------------|:---------|:--------------------------------------------------|
| `collector_dt`     | string   | Date when the collector received the event        |
| `collector_tm`     | string   | Time when the collector received the event        |
| `dvce_dt`          | string   | Date on the client device when the event occurred |
| `dvce_tm`          | string   | Time on the client device when the event occurred |
| `dvce_epoch`       | bigint   | Milliseconds since the epoch (1/1/1970) on the client device when the tracker sent the event |

Note that we include a super-precise `dvce_epoch` field because our `dvce_tm` field is not accurate to milliseconds; when querying within a given user session, simply order by `dvce_epoch` to get the user's eventstream accurately ordered to the millisecond.

**A word of warning:** tracker timestamps are great for understanding the correct order of, and elapsed time between, events from a specific user session. However, they are not a safe way of understanding when a given event actually occurred, because you **cannot** trust the clocks on users' devices. So, stick to the collector timestamp if you need to understand when in the real-world events occurred across multiple users.

<div class="html">
<a name="bug-fixes"><h2>3. Bug fixes</h2></a>
</div>

As well as the new fields introduced above, this release also includes an important bug fix in the JavaScript tracker, related to our newly-named `domain_userid`. Many thanks to [Angus Mark] [angus-mark] at [Simply Business] [simply-business] for alerting us to this.

Previously, the site/app ID as set by `setSiteId()` was used as an input into naming the first-party cookie which stores the `domain_userid`. This had the unfortunate side effect that, if you used multiple site IDs for different parts of your site, your visitors would end up with different `domain_userid`s for the different parts of your site.

This release fixes this problem - and it does so in a way that should not corrupt or reset any of your existing `domain_userids`. Going forwards, you can set different parts of your site to different app IDs without "fragmenting" your `domain_userid`s.

<div class="html">
<a name="deprecations"><h2>4. Deprecations</h2></a>
</div>

Making the above changes to clean up our event data model have necessarily involved some deprecations, as set out in the table below. **When upgrading to the new version of the JavaScript tracker (0.11.0), please update your JavaScript tags as per the instructions below to avoid problems:**

| Type of change  | Component               | Change                         | Comment                                    |
|:----------------|:------------------------|:-------------------------------|--------------------------------------------|
| Deprecation     | JavaScript tracker      | `attachUserId()` deprecated    | Remove - this doesn't do anything any more |
| Deprecation     | JavaScript tracker      | `setSiteId()` deprecated       | Use `setAppId()` instead                   |
| Deprecation     | JavaScript tracker      | `getVisitorId()` deprecated    | Use `getDomainUserId()` instead            |
| Deprecation     | JavaScript tracker      | `getVisitorInfo()` deprecated  | Use `getDomainUserInfo()` instead          |
| Data change     | S3 & Infobright storage | `visit_id` renamed             | Now called `domain_sessionidx`             |

The first change is because we are no longer overloading the `user_id` field with multiple different meanings. The next three changes are simply to bring the JavaScript method names inline with the field names we are using in our data model.

The final change is to rename the `visit_id` field to `domain_sessionidx`. The field's contents is unchanged, but we have updated the name to reflect that:

1. The field holds the current count (aka index) of visits by this user, not a random ID
2. Going forwards we will be tracking different types of sessions (mobile, desktop etc), not just website visits
3. The field is generated by the JavaScript tracker, using a first party cookie. The name `domain_sessionidx` makes the limited scope of this field clearer

<div class="html">
<a name="upgrading"><h2>5. Upgrading</h2></a>
</div>

Because we are making some significant changes to the event data model, such as "unpacking" the overloaded `user_id` field, this upgrade is relatively complex. **Please read this upgrade guide in full first before starting your upgrade**.

The upgrade process has multiple steps - we will discuss each step in turn, and then suggest a way of scheduling this upgrade to prevent any data corruption.

### 4.1 JavaScript tracker

Please update your website(s) to use the latest version of the JavaScript tracker, which is version **0.11.0**. As always, the updated minified tracker is available here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/0.11.0/sp.js

**Don't forget to update your Snowplow tags as per the updates in [Deprecations](#deprecations) above.**

### 4.2 Clojure collector

If you are using the CloudFront collector, you can skip this step.

If you are using the Clojure collector, you will need to upgrade it to the latest version, **0.3.0**. You can find the new version packaged as a complete WAR file on our [Hosted assets] [hosted-assets] page. If you have forgotten how to deploy the Clojure-based collector, you will find full instructions on our Wiki, [Setting up the Clojure collector] [clj-collector-setup] (you can skip most of the setup steps).

### 4.3 ETL

If you are using EmrEtlRunner, you need to update your configuration file, `config.yml`, to use the latest versions of the Hive serde and HiveQL scripts:

    :snowplow:
      :serde_version: 0.5.5
      :hive_hiveql_version: 0.5.6
      :non_hive_hiveql_version: 0.0.7

### 4.4 Infobright

If you are using Infobright Community Edition for analysis, you will need to update your table definition. To make this easier for you, we have created two scripts:

    4-storage/infobright-storage/migrate_006_cf_to_007.sh
    4-storage/infobright-storage/migrate_006_clj_to_007.sh

Choose the appropriate script depending on which collector you are using: "cf" means the CloudFront collector, "clj" the Clojure collector.

Running this script will create a new table, `events_007` (version **0.0.7** of the Infobright table definition) in your `snowplow` database, copying across all your data from your existing `events_006` table, which will not be modified in any way.

Once you have run this, don't forget to update your StorageLoader's `config.yml` to load into the new `events_007` table, not your old `events` table:

    :storage:
      :type: infobright
      :database: snowplow
      :table:    events_007 # NOT "events_006" any more

### 4.5 Scheduling the upgrade

This upgrade has to be carefully scheduled because we are changing the meaning of the `uid` field in the JavaScript tracker, and we are moving data from the old `user_id` field into the new `network_userid` or `domain_userid` fields.

Our suggested approach is as follows:

1. Setup the new JavaScript tracker version 0.11.0 in your tag manager as per section 4.1 above, but **do not** publish it live yet
2. (If you are using the Clojure collector) Get the Clojure collector version 0.3.0 ready in Elastic Beanstalk as per section 4.2 above, but **do not** deploy it live yet
3. Start a manual run of the EmrEtlRunner for your site...
4. **As soon as** the manual run has copied all of your available Snowplow logs into your Processing Bucket, publish the new JavaScript tracker live, and deploy your new Clojure collector live (if you are using it)
5. Wait for the EmrEtlRunner operation complete
6. If you are using Infobright, run the StorageLoader and wait for it to finish
7. Now upgrade the ETL as per section 4.3 above
8. Now upgrade Infobright (if you are using it) as per section 4.4 above

This upgrade approach should prevent any user ID data from ending up in the wrong fields in your Snowplow event store.

<h2><a name="help">6. Getting help</a></h2>

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[shermozle]: https://github.com/shermozle
[angus-mark]: https://github.com/ngsmrk
[simply-business]: http://www.simplybusiness.co.uk/

[hosted-assets]: https://github.com/snowplow/snowplow/wiki/Hosted-assets
[clj-collector-setup]: https://github.com/snowplow/snowplow/wiki/setting-up-the-clojure-collector

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
