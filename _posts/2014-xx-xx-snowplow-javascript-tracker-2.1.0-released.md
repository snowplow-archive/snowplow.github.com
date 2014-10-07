---
layout: post
shortenedlink: JavaScript Tracker 2.1.0 released
title: Snowplow JavaScript Tracker 2.1.0 released with new events
tags: [snowplow, javascript, tracker, event]
author: Fred
category: Releases
---

We are delighted to announce the release of version 2.1.0 of the [Snowplow JavaScript Tracker][repo]! This release contains a number of new features, most prominently several new unstructured events.

This blog post will cover the following topics:


1. [New events](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#events)
  1.1 [Automatic form tracking](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#forms)
  1.2 [`add_to_cart` and `remove_from_cart`](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#cart)
  1.3 [`social_interaction`](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#social)
  1.4 [`site_search`](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#search)
2. [Page performance context](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#performance)
3. [Link content](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#content)
4. [Tracker core integration](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#core)
5. [Custom callbacks](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#callbacks)
6. [`forceSecureTracker`](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#https)
7. [Outbound queue](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#outbound)
8. [New default cookie path](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#cookies)
9. [New example page](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#example)
10. [Other improvements](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#other)
11. [Upgrading](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#upgrading)
12. [Getting help](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#help)

<!--more-->

<h2><a name="events">1. New events</a></h2>

<h3><a name="forms">1.1 Automatic form tracking</a></h3>

Enable automatic form tracking using the `enableFormTracking` method:

{% highlight javascript %}
snowplow('enableFormTracking');
{% endhighlight %}

Whenever a user changes the value of a field in a form, the Tracker will fire a [`change_form`][change_form] unstructured event capturing the name, type, and CSS classes of the changed element, the ID of the parent form, and the new value of the field.

Whenever a user submits a form, the Tracker will fire a [`submit_form`][submit_form] event. This event captures the ID of the parent form and the names, types, and final values of all `input`, `select`, and `textarea` elements in the form.

When you call the method, it will only attach event listeners to existing forms, so you should call it again whenever you create a new form element. (This is safe - the Tracker will not attach more than one event listener to an element.)

<h3><a name="cart">1.2 `add_to_cart` and `remove_from_cart`</a></h3>

Use the new `trackAddToCart` and `trackRemoveFromCart` methods to track [`add_to_cart`][add_to_cart] and [`remove_from_cart`][remove_from_cart] events. The signatures of the methods are identical:

{% highlight javascript %}
trackRemoveFromCart(sku, name, category, price, quantity, currency, context);
{% endhighlight %}

Use them like this:

{% highlight javascript %}
snowplow('trackAddToCart', 'item-000303', 'small waistcoat', 'clothing', 79.99, 2, 'USD');
{% endhighlight %}

<h3><a name="social">1.3 `social_interaction`</a></h3>

The `trackSocialInteraction` method lets you track [`social_interaction`][social_interaction] events on you site. This is its signature:

{% highlight javascript %}
trackSocialInteraction(action, network, target, context);
{% endhighlight %}

An example:

{% highlight javascript %}
snowplow('trackSocialInteraction', 'like', 'Facebook', 'blog post 0012');
{% endhighlight %}

<h3><a name="search">1.4 `site_search`</a></h3>

The new `site_search` event describes a user performing a search on a website. It can capture the search terms and search filters used, the number of results found, and the number of results displayed on the first page.

This is the signature of the corresponding method:

{% highlight javascript %}
trackSiteSearch(terms, filters, totalResults, pageResults, context);
{% endhighlight %}

And an example of `trackSiteSearch` in action:

{% highlight javascript %}
snowplow('trackSiteSearch', ['event', 'streams'], ['books'], 10, 8);
{% endhighlight %}

<h2><a name="performance">2. Page performance context </a></h2>

The `trackPageView` method now accepts an additional boolean parameter named "performanceTracking":

{% highlight javascript %}
trackPageView(customTitle, performanceTracking, context);
{% endhighlight %}

If you set this parameter to `true`, a [`PerformanceTiming`][performancetiming] context will be added to the page view event. This context will contain all the data found in the [`window.performance.timing`][navigationtiming] variable, and so can be used to calculate how long the page took to load.

<h2><a name="content">3. Link content </a></h2>

The `link_click` event has been updated to include an optional `content` field. This will be populated with the `innerHTML` property of the link. The `enableLinkClickTracking` now has a "trackContent" parameter which you must set to `true` to capture the innerHTML of clicked links:

{% highlight javascript %}
enableLinkClickTracking(criterion, pseudoClicks, trackContent, context);
{% endhighlight %}

The `enableLinkClickTracking` method, which is used to track individual clicks manually, now accepts an additional string parameter named "content":

{% highlight javascript %}
trackLinkClick(targetUrl, elementId, elementClasses, elementTarget, elementContent, context);
{% endhighlight %}

<h2><a name="core">4. Tracker core integration </a></h2>

The [Snowplow JavaScript Tracker Core][tracker-core] was designed to contain the functionality common to both the client-side JavaScript Tracker and the [Node.js Tracker][nodejs-tracker]. This release integrates the core into the client-side Tracker. As a consequence, the random 6-digit "transaction ID" attached to all events has been replaced by a unique type 4 UUID. This makes the false positive rate for detecting duplicate events negligible.

<h2><a name="callbacks">5. Custom callbacks </a></h2>

You can now specify callback functions which will only be called when sp.js has been loaded and initialized:

{% highlight javascript %}
function snowplowCallback() {
	console.log("Snowplow has loaded");
}

snowplow(snowplowCallback);
{% endhighlight %}

<h2><a name="https">6. `forceSecureTracker` </a></h2>

By default, events are sent to a collector using the same protocol ("http" or "https") as the current page. Huge thanks to community member @kujo4pmZ for contributing the option to force the tracker to send all events over https! Just add a `forceSecureTracker` field when creating a tracker:

{% highlight javascript %}
        window.snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', { // Initialise a tracker
          appId: 'CFe23a',
          platform: 'mob',
          forceSecureTracker: true // Requests will be made over https
        });
{% endhighlight %}

<h2><a name="outbound">7. Outbound queue </a></h2>

Previous versions of the tracker had a `pageUnloadTimer` which you could use to set a pause between an event being created and the page unloading, to give the tracker time to fire the event. Version 2.1.0 makes the timeout more intelligent: once all queued events have been sent, the page will unload, even if the `pageUnloadTimer` has not yet expired.

<h2><a name="cookies">8. New default cookie path </a></h2>

The Tracker now sets cookies on the path "/", so they will be accessible from any page in the domain. This prevents multiple cookies from being set for a single user.

<h2><a name="example">9. New example page </a></h2>

The new [async-large.html][async-large] file shows how the Snowplow JavaScript Tracker works even if two people are independently loading and using it on the same page. It also provides examples of all the new unstructured events.

<h2><a name="other">10. Other improvements </a></h2>

We have also:

* Moved the context field to the end of the querystring in case it gets truncated [#204][204]
* Improved the efficiency of link click tracking [#254][254]
* Extracted link tracking functionality into its own file [#266][266]
* Renamed the "dist" directory to "deploy" [#216][216]
* Improved the CodeClimate rating for the project [#150][150]
* Added further Intern unit tests [#76][76]
* Added a section to the README for contributors on getting the Vagrant environment set up [#169][169]

<h2><a name="other">11. Upgrading </a></h2>

The new minified and gzipped JavaScript is available at

`http(s)://d1fc8wv8zag5ca.cloudfront.net/2.1.0/sp.js``

Note that this version introduces breaking changes to the `trackPageView`, `enableLinkClickTracking`, and `trackLinkClick` methods, all of which now have an additional penultimate parameter.

The deprecated legacy method `trackImpression` has been removed entirely; use `trackAdImpression` instead.

<h2><a name="other">12. Getting help </a></h2>

Get the full documentation for version 2.1.0 [here][docs].

If you have any suggestions for new features or need help getting set up, please [get in touch][talk-to-us]. And [raise an issue][issues] if you spot a bug!

[repo]: https://github.com/snowplow/snowplow-javascript-tracker
[change_form]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0
[submit_form]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0
[social_interaction]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/social_interaction/jsonschema/1-0-0
[add_to_cart]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/add_to_cart/jsonschema/1-0-0
[remove_from_cart]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/remove_from_cart/jsonschema/1-0-0
[site_search]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/site_search/jsonschema/1-0-0
[performancetiming]: https://github.com/snowplow/iglu-central/blob/master/schemas/org.w3/PerformanceTiming/jsonschema/1-0-0
[navigationtiming]: https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/NavigationTiming/Overview.html
[tracker-core]: https://www.npmjs.org/package/snowplow-tracker-core
[nodejs-tracker]: https://github.com/snowplow/snowplow-nodejs-tracker
[async-large]: https://github.com/snowplow/snowplow-javascript-tracker/blob/master/examples/web/async-large.html
[docs]: https://github.com/snowplow/snowplow/wiki/Javascript-Tracker

[204]: https://github.com/snowplow/snowplow-javascript-tracker/issues/204
[254]: https://github.com/snowplow/snowplow-javascript-tracker/issues/254
[266]: https://github.com/snowplow/snowplow-javascript-tracker/issues/266
[216]: https://github.com/snowplow/snowplow-javascript-tracker/issues/216
[150]: https://github.com/snowplow/snowplow-javascript-tracker/issues/150
[76]: https://github.com/snowplow/snowplow-javascript-tracker/issues/76
[169]: https://github.com/snowplow/snowplow-javascript-tracker/issues/169

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
