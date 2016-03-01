---
layout: post
title: Snowplow JavaScript Tracker 2.6.0 released
title-short: Snowplow JavaScript Tracker 2.6.0
tags: [snowplow, javascript, tracker, browser, analytics]
author: Josh
category: Releases
---

We are excited to announce the release of version 2.6.0 of the [Snowplow JavaScript Tracker][release-260]! This release brings turnkey [Optimizely][optimizely] and [Augur.io][augur] integration, so you can automatically grab A/B testing data (from Optimizely) and device and user recognition data (via Augur.io) with the events you track with the Jaavascript tracker.

Read on for more information:

1. [Optimizely integration](/blog/2016/02/29/snowplow-javascript-tracker-2.6.0-released/#optimizely-integration)  
2. [Augur.io integration](/blog/2016/02/29/snowplow-javascript-tracker-2.6.0-released/#augur-integration)
3. [EnhancedEcommerce tracking](/blog/2016/02/29/snowplow-javascript-tracker-2.6.0-released/#enhanced-ecommerce)
4. [New functionality](/blog/2016/02/29/snowplow-javascript-tracker-2.6.0-released/#new-functionality)
5. [Updates and Bug fixes](/blog/2016/02/29/snowplow-javascript-tracker-2.6.0-released/#updates-bugs)
6. [Upgrading](/blog/2016/02/29/snowplow-javascript-tracker-2.6.0-released/#upgrading)
7. [Documentation and help](/blog/2016/02/29/snowplow-javascript-tracker-2.6.0-released/#docs)

<!--more-->

<h2 id="optimizely-integration">1. Optimizely integration</h2>

The Optimizely integration delivers your Optimizely testing data with each Snowplow event, making it easy to identify:

1. Whether an experiment was running when the event was recorded
2. If so, which group the user belonged to
3. All the relevant group and experiment metadata

It is very common for Snowplow users to track A/B testing data in Snowplow. This means you can assess the effectiveness of different experiments directly by analyzing your Snowplow data. This is enormously valuable, as it means you can not only measure the impact of individaul experiments, but slice results by any of the myriad dimensions that Snowplow makes available to you. (Including any that you build yourself on the event-level data, e.g. behavioural segments.) In addition, you can build a picture, for individual users, of the different experiments that they have been exposed to over their lifetimes, enabling you to model the impact of individual and collective testing on user behaviour over a long time horizon.

The integration makes it simple for Optimizely users to grab their Optimizely data in Snowplow: previously users had to write custom Javascript to grab the relevant fields from the [Optimizely `data object`][optimizely-data-object] and push it into Snowplow, either using their own events (*experiment 'a' run*) or context (event 'b' occurred whilst experiment 'a' was running). Now Optimizely users can simply specify which parts of the data object they would like recorded in Snowplow when the Javascript is initialized, and the tracker will take care of the rest, grabbing the relevant data from Optimizely and sending it as custom context with every event that is recorded into Snowplow. It is as simple as follows:

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
  <tr><td><code>optimizelyExperiments</code></td><td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.optimizely/experiment_1.sql"></a><code>com.optimizely/experiment_1.sql</code></td></tr>
  <tr><td><code>optimizelyStates</code></td><td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.optimizely/state_1.sql"><code>com.optimizely/state_1.sql</code></a></td></tr>
  <tr><td><code>optimizelyVariations</code></td><td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.optimizely/variation_1.sql"><code>com.optimizely/variation_1.sql</code></a></td></tr>
  <tr><td><code>optimizelyVisitor</code></td><td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.optimizely/visitor_1.sql"><code>com.optimizely/visitor_1.sql</code></a></td></tr>
  <tr><td><code>optimizelyAudiences</code></td><td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.optimizely/visitor_audience_1.sql"><code>com.optimizely/visitor_audience_1.sql</code></a></td></tr>
  <tr><td><code>optimizelyDimensions</code></td><td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.optimizely/visitor_dimension_1.sql"><code>com.optimizely/visitor_dimension_1.sql</code></a></td></tr>
</table>

Some notes on using these contexts:

* All but the `optimizelyVisitor` context  return an array of contexts to be sent with the event.  This can cause the size of the event to sky-rocket and subsequently can cause events sent via a GET Request to fail, as the end of the payload gets clipped. As a result, we recommend you set the tracker to use `POST` rather than `GET` if you wish to use the Optmizely integration.
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

The full SQL table definition can be found here: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/io.augur.snowplow/identity_lite_1.sql.

Like the Optimizely integration, the Augur integration is enabled when you initialize the Javascript:

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

<h2 id="enhanced-ecommerce">3. EnhancedEcommerce tracking</h2>

It has always been possible for Snowplow users to track enhanced ecommerce-like events, including product views (impressions), add to baskets and remove from baskets events.

A number of our users come to Snowplow from Google Analytics, having already implemented Enhanced Ecommerce. With this release, they can now mirror their GA enhanced ecommerce integrations in Snowplow directly, cutting down on implementation time.

There are two ways to setup enhanced ecommerce tracking in Snowplow:

1. Assuming you setup Enhanced Ecommerce via GTM and the GTM dataLayer, we recommend integrating Snowplow tracking tags as documented [here][enhanced-ecommerce-via-gtm]  
2. If you have not integrated Enhanced Ecommerce via GTM, you can mirror the integration in Snowplow using the new [Enhanced Ecommerce][enhanced-ecommerce] methods listed below


| Tracker Function                              | JsonSchema                                                                                   |
|-----------------------------------------------|----------------------------------------------------------------------------------------------|
| `trackEnhancedEcommerceAction`                | [com.google.analytics.enhanced-ecommerce/action/jsonschema/1-0-0][enhanced-1]                |
| `trackEnhancedEcommerceActionFieldObject`     | [com.google.analytics.enhanced-ecommerce/actionFieldObject/jsonschema/1-0-0][enhanced-2]     |
| `trackEnhancedEcommerceImpressionFieldObject` | [com.google.analytics.enhanced-ecommerce/impressionFieldObject/jsonschema/1-0-0][enhanced-3] |
| `trackEnhancedEcommerceProductFieldObject`    | [com.google.analytics.enhanced-ecommerce/productFieldObject/jsonschema/1-0-0][enhanced-4]    |
| `trackEnhancedEcommercePromoFieldObject`      | [com.google.analytics.enhanced-ecommerce/promoFieldObject/jsonschema/1-0-0][enhanced-5]      |

<table>
  <tr>Tracker Function<th></th><th>Corresponding Redshift table definition</th></tr>
  <tr><td><code>trackEnhancedEcommerceAction</code></td><td><a href="https://raw.githubusercontent.com/snowplow/iglu-central/master/schemas/com.optimizely/experiment/jsonschema/1-0-0">com.google.analytics.enhanced-ecommerce/action/jsonschema/1-0-0</a></td></tr>
  <tr><td><code>trackEnhancedEcommerceActionFieldObject</code></td><td><a href=""></a></td></tr>
  <tr><td><code>trackEnhancedEcommerceImpressionFieldObject</code></td><td></td><a href=""></a></tr>
  <tr><td><code>trackEnhancedEcommerceProductFieldObject</code></td><td></td><a href=""></a></tr>
  <tr><td><code>trackEnhancedEcommercePromoFieldObject</code></td><td></td><a href=""></a></tr>
</table>

<h2 id="new-functionality">4. New functionality</h2>

New Tracker functions include:

* Added `forceUnsecureTracker`: This allows you to force the Tracker to use HTTP for all requests.
  - This setting should __only__ be used in a testing environment.
* Added `discoverRootDomain`: Will set the config cookie domain to the root domain of the page automatically.

To enable these settings:

{% highlight javascript %}
window.snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
  appId: 'CFe23a',
  platform: 'web',
  ...
  forceUnsecureTracker: true,
  discoverRootDomain: true
});
{% endhighlight %}

<h2 id="updates-bugs">5. Updates and Bug fixes</h2>

Other updates include:

* Events now include the time they were sent from the Tracker ([#355][355])
* Attempting to create a new Tracker using an existing namespace does nothing ([#411][411])
* Made `domainUserId` a UUID ([#274][274])
* Fixed issue with grunt-cloudfront library ([#426][426])
* Fixed `doNotTrack` in IE 11 and Safari 7.1.3+, thanks Grzegorz Ewald! ([#440][440])
* Fixed bug where properties from `Object.prototype` were incorrectly added to PerformanceTiming context ([#458][458])

<h2 id="upgrading">6. Upgrading</h2>

The upgraded minified tracker is available here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/2.6.0/sp.js

Make sure to update your tracking code to reflect the two **breaking changes** highlighted above.

<h2 id="docs">7. Documentation and help</h2>

Check out the JavaScript Tracker's documentation:

* The [setup guide][setup]
* The [full API documentation][tech-docs]

The [v2.6.0 release page][release-260] on GitHub has the full list of changes made in this version.

Finally, if you run into any issues or have any questions, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[optimizely]: https://www.optimizely.com/
[optimizely-data-object]: https://help.optimizely.com/hc/en-us/articles/205670207-The-console-data-object-and-Optimizely-log#data_object
[augur]: https://www.augur.io/#landingPage
[enhanced-ecommerce-via-gtm]: https://github.com/snowplow/snowplow/wiki/Integrating-Javascript-tags-with-enhanced-ecommerce
[release-260]: https://github.com/snowplow/snowplow-javascript-tracker/releases/tag/2.6.0
[tech-docs]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker
[setup]: https://github.com/snowplow/snowplow/wiki/Javascript-tracker-setup
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[enhanced-ecommerce]: https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce
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
