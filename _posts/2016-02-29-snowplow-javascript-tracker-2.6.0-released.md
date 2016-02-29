---
layout: post
title: Snowplow JavaScript Tracker 2.6.0 released
title-short: Snowplow JavaScript Tracker 2.6.0
tags: [snowplow, javascript, tracker, browser, analytics]
author: Josh
category: Releases
---

We are excited to announce the release of version 2.6.0 of the [Snowplow JavaScript Tracker][release-260]! This release brings support for building and attaching [Optimizely][optimizely] and [Augur][augur]  contexts with your events so you can get an even richer dataset to work with.

Read on for more information:

1. [Optimizely and Augur](/blog/2016/02/29/snowplow-javascript-tracker-2.6.0-released/#optimizely-augur)
2. [EnhancedEcommerce methods](/blog/2016/02/29/snowplow-javascript-tracker-2.6.0-released/#enhanced-ecommerce)
3. [New functionality](/blog/2016/02/29/snowplow-javascript-tracker-2.6.0-released/#new-functionality)
4. [Updates and Bug fixes](/blog/2016/02/29/snowplow-javascript-tracker-2.6.0-released/#updates-bugs)
5. [Upgrading](/blog/2016/02/29/snowplow-javascript-tracker-2.6.0-released/#upgrading)
6. [Documentation and help](/blog/2016/02/29/snowplow-javascript-tracker-2.6.0-released/#docs)

<!--more-->

<h2 id="optimizely-augur">1. Optimizely and Augur</h2>

You can now attach Optimizely and Augur contexts to all of your events, allowing you to capture the incredibly rich dataset provided by these plugins to further help you understand your users behaviour.  This release has support for 6 Optimizely contexts and 1 Augur context, which we hope to expand on in the future.  You can view the linked JsonSchema files below to see what will be captured in these contexts:

| Tracker Argument        | JsonSchema                                                        |
|-------------------------|-------------------------------------------------------------------|
| `augurIdentityLite`     | [io.augur.snowplow/identity_lite/jsonschema/1-0-0][augur-1]       |
| `optimizelyExperiments` | [com.optimizely/experiment/jsonschema/1-0-0][optimizely-1]        |
| `optimizelyStates`      | [com.optimizely/state/jsonschema/1-0-0][optimizely-2]             |
| `optimizelyVariations`  | [com.optimizely/variation/jsonschema/1-0-0][optimizely-3]         |
| `optimizelyVisitor`     | [com.optimizely/visitor/jsonschema/1-0-0][optimizely-4]           |
| `optimizelyAudiences`   | [com.optimizely/visitor_audience/jsonschema/1-0-0][optimizely-5]  |
| `optimizelyDimensions`  | [com.optimizely/visitor_dimension/jsonschema/1-0-0][optimizely-6] |

Some notes on using these contexts:

* All but the `optimizelyVisitor` context actually return an array of contexts to be sent with the event.  This can cause the size of the event to skyrocket and subsequently can cause events sent via a GET Request to fail, as the end of the payload gets clipped.
  - In short we recommend using POST if you intend to use these contexts.
* All of the contexts are dynamically rebuilt with each event sent so as to represent any changes that might have occurred with either source.
* The activated contexts will be sent with every event.

To enable the new contexts you will need to add the following keys to the tracker construction argmap:

{% highlight javascript %}
window.snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
  appId: 'CFe23a',
  platform: 'web',
  contexts: {
    ...
    'augurIdentityLite': true,
    'optimizelyExperiments': true,
    'optimizelyStates': true,
    'optimizelyVariations': true,
    'optimizelyVisitor': true,
    'optimizelyAudiences': true,
    'optimizelyDimensions': true
  }
});
{% endhighlight %}

<h2 id="enhanced-ecommerce">2. EnhancedEcommerce methods</h2>

This release also brings support for Google Analytics style [Enhanced Ecommerce][enhanced-ecommerce] events.

The new tracker function names:

| Tracker Function                              | JsonSchema                                                                                   |
|-----------------------------------------------|----------------------------------------------------------------------------------------------|
| `trackEnhancedEcommerceAction`                | [com.google.analytics.enhanced-ecommerce/action/jsonschema/1-0-0][enhanced-1]                |
| `trackEnhancedEcommerceActionFieldObject`     | [com.google.analytics.enhanced-ecommerce/actionFieldObject/jsonschema/1-0-0][enhanced-2]     |
| `trackEnhancedEcommerceImpressionFieldObject` | [com.google.analytics.enhanced-ecommerce/impressionFieldObject/jsonschema/1-0-0][enhanced-3] |
| `trackEnhancedEcommerceProductFieldObject`    | [com.google.analytics.enhanced-ecommerce/productFieldObject/jsonschema/1-0-0][enhanced-4]    |
| `trackEnhancedEcommercePromoFieldObject`      | [com.google.analytics.enhanced-ecommerce/promoFieldObject/jsonschema/1-0-0][enhanced-5]      |

<h2 id="new-functionality">3. New functionality</h2>

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

<h2 id="updates-bugs">4. Updates and Bug fixes</h2>

Other updates include:

* Events now include the time they were sent from the Tracker ([#355][355])
* Attempting to create a new Tracker using an existing namespace does nothing ([#411][411])
* Made `domainUserId` a UUID ([#274][274])
* Fixed issue with grunt-cloudfront library ([#426][426])
* Fixed `doNotTrack` in IE 11 and Safari 7.1.3+, thanks Grzegorz Ewald! ([#440][440])
* Fixed bug where properties from `Object.prototype` were incorrectly added to PerformanceTiming context ([#458][458])

<h2 id="upgrading">5. Upgrading</h2>

The upgraded minified tracker is available here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/2.6.0/sp.js

Make sure to update your tracking code to reflect the two **breaking changes** highlighted above.

<h2 id="docs">6. Documentation and help</h2>

Check out the JavaScript Tracker's documentation:

* The [setup guide][setup]
* The [full API documentation][tech-docs]

The [v2.6.0 release page][release-260] on GitHub has the full list of changes made in this version.

Finally, if you run into any issues or have any questions, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[optimizely]: https://www.optimizely.com/
[augur]: https://www.augur.io/#landingPage
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
