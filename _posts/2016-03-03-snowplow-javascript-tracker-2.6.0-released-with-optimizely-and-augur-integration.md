---
layout: post
title: Snowplow JavaScript Tracker 2.6.0 released with Optimizely and Augur integration
title-short: Snowplow JavaScript Tracker 2.6.0
tags: [snowplow, javascript, tracker, browser, analytics]
author: Josh
category: Releases
---

We are excited to announce the release of version 2.6.0 of the [Snowplow JavaScript Tracker][release-260]! This release brings turnkey [Optimizely][optimizely] and [Augur.io][augur] integration, so you can automatically grab A/B testing data (from Optimizely) and device and user recognition data (from Augur) with the events you track with the JavaScript Tracker.

In addition, we have rolled out support for Enhanced Ecommerce tracking, improved domain management and better handling of time! Read on to find out more...

![Optimizely and Augur logos][optimizely-augur-logos]

1. [Optimizely integration](/blog/2016/03/03/snowplow-javascript-tracker-2.6.0-released-with-optimizely-and-augur-integration/#optimizely-integration)  
2. [Augur.io integration](/blog/2016/03/03/snowplow-javascript-tracker-2.6.0-released-with-optimizely-and-augur-integration/#augur-integration)
3. [Enhanced Ecommerce tracking](/blog/2016/03/03/snowplow-javascript-tracker-2.6.0-released-with-optimizely-and-augur-integration/#enhanced-ecommerce)
4. [Better automatic domain management (for cookies) and other new functionality](/blog/2016/03/03/snowplow-javascript-tracker-2.6.0-released-with-optimizely-and-augur-integration/#new-functionality)
5. [Improved handling of time](/blog/2016/03/03/snowplow-javascript-tracker-2.6.0-released-with-optimizely-and-augur-integration/#improved-handling-of-time)
6. [Updates and Bug fixes](/blog/2016/03/03/snowplow-javascript-tracker-2.6.0-released-with-optimizely-and-augur-integration/#updates-bugs)
7. [Upgrading](/blog/2016/03/03/snowplow-javascript-tracker-2.6.0-released-with-optimizely-and-augur-integration/#upgrading)
8. [Documentation and help](/blog/2016/03/03/snowplow-javascript-tracker-2.6.0-released-with-optimizely-and-augur-integration/#docs)

<!--more-->

<h2 id="optimizely-integration">1. Optimizely integration</h2>

The Optimizely integration delivers your Optimizely testing data with each event tracked in Snowplow, making it easy to identify:

1. Whether an experiment was running when the event was recorded
2. If so, which variation the user is exposed to
3. All the relevant metadata associated with the experiment (and any others that are running)

It is very common for Snowplow users to track A/B testing data in Snowplow. This means you can assess the effectiveness of different experiments directly by analyzing your Snowplow data. This is enormously valuable, as it means you can not only measure the impact of individaul experiments, but slice results by any of the myriad dimensions that Snowplow makes available to you. (Including any that you build yourself on the event-level data, e.g. behavioural segments.) In addition, you can build a picture, for individual users, of the different experiments that they have been exposed to over their lifetimes, enabling you to model the impact of individual and collective testing on user behaviour over a long time horizon.

The integration makes it simple for Optimizely users to grab their Optimizely data in Snowplow: previously users had to write custom JavaScript to grab the relevant fields from the [Optimizely `data object`][optimizely-data-object] and push it into Snowplow, either using their own events (*experiment 'a' run*) or context (*event 'b' occurred whilst experiment 'a' was running*). Now Optimizely users can simply specify which parts of the data object they would like recorded in Snowplow when the JavaScript is initialized, and the tracker will take care of the rest, grabbing the relevant data from Optimizely and sending it as custom context with every event that is recorded into Snowplow. It is as simple as follows:

{% highlight javascript %}
window.snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
  appId: 'CFe23a',
  platform: 'web',
  contexts: {
    ...
    'optimizelyExperiments': true,
    'optimizelyStates': true,
    'optimizelyVariations': true,
    'optimizelyVisitor': true,
    'optimizelyAudiences': true,
    'optimizelyDimensions': true
  }
});
{% endhighlight %}

The integration works by auto-populating the different contexts listed above (Experiments, States, Variations, Visitor, Audiences and Dimensions. You can view the different Redshift table definitions that are populated using the Optimizely context below:

<table class="table">
  <tr><th>Tracker Argument</th><th>Corresponding Redshift table definition</th></tr>
  <tr><td><code>optimizelyExperiments</code></td><td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.optimizely/experiment_1.sql"><code>com.optimizely/experiment_1.sql</code></a></td></tr>
  <tr><td><code>optimizelyStates</code></td><td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.optimizely/state_1.sql"><code>com.optimizely/state_1.sql</code></a></td></tr>
  <tr><td><code>optimizelyVariations</code></td><td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.optimizely/variation_1.sql"><code>com.optimizely/variation_1.sql</code></a></td></tr>
  <tr><td><code>optimizelyVisitor</code></td><td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.optimizely/visitor_1.sql"><code>com.optimizely/visitor_1.sql</code></a></td></tr>
  <tr><td><code>optimizelyAudiences</code></td><td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.optimizely/visitor_audience_1.sql"><code>com.optimizely/visitor_audience_1.sql</code></a></td></tr>
  <tr><td><code>optimizelyDimensions</code></td><td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.optimizely/visitor_dimension_1.sql"><code>com.optimizely/visitor_dimension_1.sql</code></a></td></tr>
</table>

Some notes on using these contexts:

* All but the `optimizelyVisitor` context return an array of contexts to be sent with the event. This can cause the size of the event payload to sky-rocket. As a result, we recommend setting the tracker to `POST` events to Snowplow rather than use `GET`, as there are limitations the size of the request that can be sent using `GET`. Documentation on setting the tracker to use `POST` can be found [here] [js-tracker-post].
* All of the contexts are dynamically rebuilt with each event sent so as to represent any changes that might have occurred with either source.
* The activated contexts will be sent with every event.

<h2 id="augur-integration">2. Augur.io integration</h2>

[Augur.io][augur] is a device and user recognition service, that amongst other things has robust device fingerprinting technology that does not rely on cookies. 

The Augur.io integration means that Augur device recognition data is automatically captured and passed into Snowplow with each event recorded, which includes the following data points:

* A consumer UUID (that can be used instead of existing user identifiers like cookie IDs, or in combination with existing IDs)
* A device ID
* A flag that indicates if the device is a bot
* A flag that indicates if the user is 'in cognito'
* A flag that indicates if the user is browsing via a proxy

The full SQL table definition can be found [here](https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/io.augur.snowplow/identity_lite_1.sql).

Like the Optimizely integration, the Augur integration is enabled when you initialize the JavaScript:

{% highlight javascript %}
window.snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
  appId: 'CFe23a',
  platform: 'web',
  contexts: {
    ...
    'augurIdentityLite': true
  }
});
{% endhighlight %}

Note that you need to set up your own Augur account and to be loading the Augur Javascript separately for this integration to work. Please see the [Augur website][augur] for details.

<h2 id="enhanced-ecommerce">3. Enhanced Ecommerce tracking</h2>

It has always been possible for Snowplow users to track enhanced ecommerce-like events, including product views (impressions), add to baskets and remove from baskets events.

A number of our users come to Snowplow from Google Analytics, having already implemented [Enhanced Ecommerce] [enhanced-ecommerce]. With this release, they can now mirror their GA enhanced ecommerce integrations in Snowplow directly, cutting down implementation time.

There are two ways to setup enhanced ecommerce tracking in Snowplow:

1. Assuming you setup Enhanced Ecommerce via GTM and the GTM dataLayer, we recommend integrating Snowplow tracking tags as documented [here][enhanced-ecommerce-via-gtm].  
2. If you have not integrated Enhanced Ecommerce via GTM, you can mirror the integration in Snowplow using the new [Enhanced Ecommerce][enhanced-ecommerce] methods listed below.


<table>
  <tr>Tracker Function<th></th><th>Corresponding Redshift table definition</th></tr>
  <tr><td><code>trackEnhancedEcommerceAction</code></td>               <td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.google.analytics.enhanced-ecommerce/action_1.sql"><code>com.google.analytics.enhanced-ecommerce/action_1.sql</code></a></td></tr>
  <tr><td><code>addEnhancedEcommerceActionContext</code></td>    <td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.google.analytics.enhanced-ecommerce/action_field_object_1.sql"><code>com.google.analytics.enhanced-ecommerce/action_field_object_1.sql</code></a></td></tr>
  <tr><td><code>addEnhancedEcommerceImpressionContext</code></td><td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.google.analytics.enhanced-ecommerce/impression_field_object_1.sql"><code>com.google.analytics.enhanced-ecommerce/impression_field_object_1.sql</code></a></td></tr>
  <tr><td><code>addEnhancedEcommerceProductContext</code></td>   <td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.google.analytics.enhanced-ecommerce/product_field_object_1.sql"><code>com.google.analytics.enhanced-ecommerce/product_field_object_1.sql</code></a></td></tr>
  <tr><td><code>addEnhancedEcommercePromoContext</code></td>     <td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.google.analytics.enhanced-ecommerce/promo_field_object_1.sql"><code>com.google.analytics.enhanced-ecommerce/promo_field_object_1.sql</code></a></td></tr>
</table>

<h2 id="new-functionality">4. Better automatic domain management (for cookies) and other new functionality</h2>

The first party cookies set by the Javascript tracker are automatically set to the top-level domain of the web page. That means if a user is on `www.mysite.com`, they will be set to `www.mysite.com`. If the user moves to a new top level domain e.g. `blog.mysite.com`, a new cookie will be set on the new top level domain `blog.mysite.com`. That means the `domain_userid` value recorded for the user on `www.mysite.com` will be different to the `domain_userid` value set on `blog.mysite.com`.

That is not ideal: in general we would like each user (or failing that device) to have a consistent first party cookie ID across different top level domains. Previously, this was achieved by setting the cookie domain to `.mysite.com` when initializing the tracking:

{% highlight javascript %}
window.snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
  appId: 'CFe23a',
  platform: 'web',
  ...
  cookieDomain: '.mysite.com'
});
{% endhighlight %}

That was fine for users rolling out Snowplow tracking on one domain, but for users who wanted to roll out Snowplow across hundreds of domains, it created friction because a different tag (with a different `cookieDomain` value) needed to be set for each root domain.

Now that is no longer necessary, you can simply set `discoverRootDomain` to `true`, and the cookie domain will automatically be set to the root domain rather than the top level domain:

{% highlight javascript %}
window.snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
  appId: 'CFe23a',
  platform: 'web',
  ...
  forceUnsecureTracker: true,
  discoverRootDomain: true
});
{% endhighlight %}

We have also added a feature that enables you to force sending data from the tracker via `HTTP` rather than `HTTPS`. Note that this should only be used in test environments. To force sending events via HTTP, set `forceUnsecureTracker` to `true in the tracker initialization:

{% highlight javascript %}
window.snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
  appId: 'CFe23a',
  platform: 'web',
  ...
  forceUnsecureTracker: true
});
{% endhighlight %}

<h2 id="improved-handling-of-time">5. Improved handling of time</h2>

Previously, the tracker recorded the timestamp on the client device when an event was recorded. This is the value that you see when querying the `dvce_created_tstamp` in Redshift.

Now the tracker records the timestamp when the event was recorded *and* the timestamp when the event was sent to Snowplow. Note that there can often been a delay between an event happening and the data being sent, because:

* The tracker fires events asyncronously (so as not to interfere with page load times). As a result events are cached in `localStorage` and only sent through to Snowplow when there is an opportunity
* If the user is browsing in an area of low connectivity, or a user leaves the website before the Snowplow tag has had a chance to fire, the event will only be sent once the user is back in an area of high connectivity and back on the website (so the Javascript is reloaded)

Snowplow uses the combination of the `dvce_created_tstamp`, `dvce_sent_tstamp` and `collector_tstamp` to figure out the actual time (in UTC) when the event occurred and report that in the `derived_tstamp` field for easy use in time-based analysis. For more information on the algorithm used, please see our earlier blog post [improving Snowplow's understanding of time] [improving-snowplow-understanding-of-time]. As far as we are aware we are the only analytics provider with a robust approach to handling late arrival of data.

<h2 id="updates-bugs">6. Updates and Bug fixes</h2>

Other updates include:

* Attempting to create a new Tracker using an existing namespace does nothing ([#411][411])
* `domainUserId` is now a UUID ([#274][274])
* Fixed issue with grunt-cloudfront library ([#426][426])
* Fixed `doNotTrack` in IE 11 and Safari 7.1.3+, thanks Grzegorz Ewald! ([#440][440])
* Fixed bug where properties from `Object.prototype` were incorrectly added to `PerformanceTiming` context ([#458][458])

<h2 id="upgrading">7. Upgrading</h2>

The upgraded minified tracker is available here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/2.6.0/sp.js

<h2 id="docs">8. Documentation and help</h2>

Check out the JavaScript Tracker's documentation:

* The [setup guide][setup]
* The [full API documentation][tech-docs]

The [v2.6.0 release page][release-260] on GitHub has the full list of changes made in this version.

Finally, if you run into any issues or have any questions, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[optimizely]: https://www.optimizely.com/
[optimizely-data-object]: https://help.optimizely.com/hc/en-us/articles/205670207-The-console-data-object-and-Optimizely-log#data_object
[optimizely-augur-logos]: /assets/img/blog/2016/03/optimizely-and-augur-logos.png
[augur]: https://www.augur.io/#landingPage
[enhanced-ecommerce]: https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce
[enhanced-ecommerce-via-gtm]: https://github.com/snowplow/snowplow/wiki/Integrating-Javascript-tags-with-enhanced-ecommerce
[js-tracker-post]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#2215-post-support
[release-260]: https://github.com/snowplow/snowplow-javascript-tracker/releases/tag/2.6.0
[tech-docs]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker
[setup]: https://github.com/snowplow/snowplow/wiki/Javascript-tracker-setup
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[enhanced-ecommerce]: https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#314-enhanced-ecommerce-tracking
[optimizely-1]: https://raw.githubusercontent.com/snowplow/iglu-central/master/schemas/com.optimizely/experiment/jsonschema/1-0-0
[optimizely-2]: https://raw.githubusercontent.com/snowplow/iglu-central/master/schemas/com.optimizely/state/jsonschema/1-0-0
[optimizely-3]: https://raw.githubusercontent.com/snowplow/iglu-central/master/schemas/com.optimizely/variation/jsonschema/1-0-0
[optimizely-4]: https://raw.githubusercontent.com/snowplow/iglu-central/master/schemas/com.optimizely/visitor/jsonschema/1-0-0
[optimizely-5]: https://raw.githubusercontent.com/snowplow/iglu-central/master/schemas/com.optimizely/visitor_audience/jsonschema/1-0-0
[optimizely-6]: https://raw.githubusercontent.com/snowplow/iglu-central/master/schemas/com.optimizely/visitor_dimension/jsonschema/1-0-0
[augur-1]: https://raw.githubusercontent.com/snowplow/iglu-central/master/schemas/io.augur.snowplow/identity_lite/jsonschema/1-0-0
[enhanced-1]: https://raw.githubusercontent.com/snowplow/iglu-central/master/schemas/com.google.analytics.enhanced-ecommerce/action/jsonschema/1-0-0
[enhanced-2]: https://raw.githubusercontent.com/snowplow/iglu-central/master/schemas/com.google.analytics.enhanced-ecommerce/actionFieldObject/jsonschema/1-0-0
[enhanced-3]: https://raw.githubusercontent.com/snowplow/iglu-central/master/schemas/com.google.analytics.enhanced-ecommerce/impressionFieldObject/jsonschema/1-0-0
[enhanced-4]: https://raw.githubusercontent.com/snowplow/iglu-central/master/schemas/com.google.analytics.enhanced-ecommerce/productFieldObject/jsonschema/1-0-0
[enhanced-5]: https://raw.githubusercontent.com/snowplow/iglu-central/master/schemas/com.google.analytics.enhanced-ecommerce/promoFieldObject/jsonschema/1-0-0
[274]: https://github.com/snowplow/snowplow-javascript-tracker/issues/274
[355]: https://github.com/snowplow/snowplow-javascript-tracker/issues/355
[411]: https://github.com/snowplow/snowplow-javascript-tracker/issues/411
[426]: https://github.com/snowplow/snowplow-javascript-tracker/issues/426
[440]: https://github.com/snowplow/snowplow-javascript-tracker/pull/440
[458]: https://github.com/snowplow/snowplow-javascript-tracker/issues/458

[improving-snowplow-understanding-of-time]: /blog/2015/09/15/improving-snowplows-understanding-of-time/
