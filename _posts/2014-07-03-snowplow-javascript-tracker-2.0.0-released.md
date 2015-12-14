---
layout: post
title: Snowplow JavaScript Tracker 2.0.0 released
title-short: Snowplow JavaScript Tracker 2.0.0
tags: [snowplow, javascript, tracker, browser, analytics]
author: Fred
category: Releases
---

We are happy to announce the release of the [Snowplow JavaScript Tracker version 2.0.0] [release-200]. This release makes some significant changes to the public API as well as introducing a number of new features, including tracker namespacing and new link click tracking and ad tracking capabilities.

This blog post will cover the following changes:

1. [Changes to the Snowplow API](/blog/2014/07/03/snowplow-javascript-tracker-2.0.0-released/#api)
2. [New feature: tracker namespacing](/blog/2014/07/03/snowplow-javascript-tracker-2.0.0-released/#tracker-namespacing)
3. [New feature: link click tracking](/blog/2014/07/03/snowplow-javascript-tracker-2.0.0-released/#link-click)
4. [New feature: ad tracking](/blog/2014/07/03/snowplow-javascript-tracker-2.0.0-released/#ads)
5. [New feature: offline tracking](/blog/2014/07/03/snowplow-javascript-tracker-2.0.0-released/#offline)
6. [Self-describing JSONs](/blog/2014/07/03/snowplow-javascript-tracker-2.0.0-released/#schemas)
7. [Functional tests](/blog/2014/07/03/snowplow-javascript-tracker-2.0.0-released/#tests)
8. [Other improvements](/blog/2014/07/03/snowplow-javascript-tracker-2.0.0-released/#other)
9. [Upgrading](/blog/2014/07/03/snowplow-javascript-tracker-2.0.0-released/#upgrading)
10. [Documentation and getting help](/blog/2014/07/03/snowplow-javascript-tracker-2.0.0-released/#help)

<!--more-->

<h2><a name="api">1. Changes to the Snowplow API</a></h2>

Load sp.js using the following script:

{% highlight html %}
<script async=true>

;(function(p,l,o,w,i,n,g){if(!p[i]){p.GlobalSnowplowNamespace=p.GlobalSnowplowNamespace||[];
p.GlobalSnowplowNamespace.push(i);p[i]=function(){(p[i].q=p[i].q||[]).push(arguments)
};p[i].q=p[i].q||[];n=l.createElement(o);g=l.getElementsByTagName(o)[0];n.async=1;
n.src=w;g.parentNode.insertBefore(n,g)}}(window,document,"script","//d1fc8wv8zag5ca.cloudfront.net/2.0.0/sp.js","snowplow_name_here"));

</script>
{% endhighlight %}

You can replace `"snowplow_name_here"` with any string that would be a valid JavaScript variable name. As can be seen in the examples below, this string becomes the Snowplow function which you will call. The general template for using tracker methods is this:

{% highlight javascript %}
snowplow_function(tracker_method_name, tracker_method_argument_1, tracker_method_argument_2, ...);
{% endhighlight %}

If you believe there could be another copy of Snowplow running on a given website, rename the Snowplow function to something unique, to guarantee that there won't be a conflict between the two copies. This is particularly important for widget, advertising and analytics companies using Snowplow - because your customers may be using Snowplow themselves.

<h2><a name="tracker-namespacing">2. New feature: tracker namespacing</a></h2>

New in version 2.0.0 is the ability to have multiple trackers running at once. This is useful if you want to log events to more than one collector - for example, you could send events to both our tried-and-tested CloudFront Collector and our experimental Scala Stream Collector. You can even choose which trackers fire which events.

To initialize a new tracker, use the newly-introduced method `newTracker`:

{% highlight javascript %}
function newTracker(namespace, endpoint, argmap)
{% endhighlight %}

It constructs a new tracker based on three arguments: the name of the new tracker, the endpoint to which events should be logged, and an "argmap" of optional settings. An example:

{% highlight javascript %}
window.snowplow_name_here('newTracker', 'primary', 'd3rkrsqld9gmqf.cloudfront.net', {
	cookieName: '_example_cookie_name_',
	encodeBase64: false,
	appId: 'CFe23a',
	platform: 'mob'
});

window.snowplow_name_here('newTracker', 'secondary', 'dzrdr5gkt9b5hp.cloudfront.net', {
	cookieName: '_example_cookie_name_',
	encodeBase64: true,
	appId: 'CFe23a',
	platform: 'mob'
});
{% endhighlight %}

This creates two trackers called "primary" and "secondary" logging events to different Cloudfront subdomains. (Note that the full string `"d3rkrsqld9gmqf.cloudfront.net"` must be used instead of just `"d3rkrsqld9gmqf"`). Events logged by the primary tracker will not be Base64-encoded; events logged by the secondary tracker will be. Both trackers use the same cookie name. If you do not set a cookie name, the default `'_sp_'` will be used. Setting a custom cookie name is recommended, as it prevents conflicts when two Snowplow users on the same web page attempt to read and write the same cookie.

You can specify which tracker or trackers should execute a method by appending their names to the end of the method name, separating the two with a colon. To only have the primary tracker track a page view event:

{% highlight javascript %}
window.snowplow_name_here('trackPageView:primary');
{% endhighlight %}

To have more than one tracker execute a method, separate the tracker names with semicolons:

{% highlight javascript %}
window.snowplow_name_here('trackPageView:primary;secondary');
{% endhighlight %}

If you do not provide a list of tracker namespaces when calling a method, every tracker that you have created will execute that method.

The name of the tracker that fired an event will always be added to the querystring in a newfield, `tna`.

<h2><a name="link-click">3. New feature: link click tracking</a></h2>

*Note: Link click tracking is implemented using the new self-describing JSON format for unstructured events. Loading link clicks into Redshift will depend on Snowplow 0.9.5, coming soon.*

You can now track link click events using `enableLinkClickTracking`. This method only needs to be called once. Then whenever a link is clicked, a link click event will automatically be fired. The event will include the link element's CSS id and classes, as well as the destination URL.

The [JSON Schema for a link click] [link-click-json-schema] is available on Iglu Central.

Here is the method's signature:

{% highlight javascript %}
function enableLinkClickTracking(criterion, pseudoClicks, context)
{% endhighlight %}

Use it like this to turn on click tracking for every link:

{% highlight javascript %}
window.snowplow_name_here('enableLinkClickTracking');
{% endhighlight %}

The `criterion` argument lets you fine-tune which links you want to be tracked with either a whitelist, a blacklist, or a filter function.

<div class="html">
<h3><a name="link-click-blacklist">3.1 Blacklists</a></h3>
</div>

A blacklist is an array of CSS class names for links which should **not** be tracked. For example, the below code will stop link click events firing for links with the class "barred" or "untracked", but will fire link click events for all other links:

{% highlight javascript %}
window.snowplow_name_here('enableLinkClickTracking', {'blacklist': ['barred', 'untracked']});
{% endhighlight %}

If there is only one class name you wish to blacklist, it doesn't have to be in an array:

{% highlight javascript %}
window.snowplow_name_here('enableLinkClickTracking', {'blacklist': 'barred'});
{% endhighlight %}

<div class="html">
<h3><a name="link-click-whitelist">3.2 Whitelists</a></h3>
</div>

A whitelist is the opposite of a blacklist. With this option, **only** clicks on links belonging to one of the whitelisted classes will be tracked.

{% highlight javascript %}
window.snowplow_name_here('enableLinkClickTracking', {'whitelist': ['unbarred', 'tracked']});
{% endhighlight %}

If there is only one class name you wish to whitelist, it doesn't have to be in an array:

{% highlight javascript %}
window.snowplow_name_here('enableLinkClickTracking', {'whitelist': 'unbarred'});
{% endhighlight %}

<div class="html">
<h3><a name="link-click-filters">3.3 Filter functions</a></h3>
</div>

Finally, if neither of the above options provides finegrained-enough control, you can use a filter function instead. It should take one argument, the link element, and return either `true` (in which case clicks on the link will be tracked) or `false` (in which case they won't be).

The following code will enable click tracking for those and only those links which have an `id` attribute:

{% highlight javascript %}
function myFilter (linkElement) {
  return typeof linkElement.id !== "undefined";
}

snowplow_name_here('enableLinkClickTracking', {'filter': myFilter});
{% endhighlight %}

The `pseudoClicks` argument can be used to turn on pseudo-click tracking, which listens not for click events but for successive mouseup and mousedown events over the same link. This is useful because some browsers, including Firefox, do not generate click events for the middle mouse button.

Use `enableLinkClickTracking like this:

{% highlight javascript %}
window.snowplow_name_here('enableLinkClickTracking', 'internal', true);
{% endhighlight %}

You can also use the `trackLinkClick` method to manually track a single link click:

{% highlight javascript %}
function trackLinkClick(targetUrl, elementId, elementClasses, elementTarget, context);
{% endhighlight %}

Use it like this:

{% highlight javascript %}
window.snowplow_name_here('trackLinkClick', 'http://www.example.com', 'first-link', ['link-class'], '_blank');
{% endhighlight %}

Finally, if you add links to the document after calling `enableLinkClickTracking`, use `refreshLinkClick` tracking to add click tracking to all new links which meet any criterion you have already set up using `enableLinkClickTracking`:

{% highlight javascript %}
window.snowplow_name_here('refreshLinkClickTracking');
{% endhighlight %}

<h2><a name="ads">4. New feature: ad tracking</a></h2>

This release adds three new ad tracking functions: `trackAdImpression`, `trackAdClick`, and `trackAdConversion`. Each of these fires a dedicated unstructured event. Here are their function signatures:

{% highlight javascript %}
function trackAdImpression(impressionId, costModel, targetUrl, cost, bannerId, zoneId, advertiserId, campaignId, context)

function trackAdClick(targetUrl, clickId, costModel, cost, targetUrl, bannerId, zoneId, impressionId, advertiserId, campaignId, context)

function trackAdConversion(conversionId, costModel, cost, category, action, property, initialValue, advertiserId, campaignId, context)
{% endhighlight %}

The JSON Schemas for these new events are all available on Iglu Central:

* [Ad impression JSON Schema] [ad-impression-json-schema]
* [Ad click JSON Schema] [ad-click-json-schema]
* [Ad conversion JSON Schema] [ad-conversion-json-schema]

Use `trackAdImpression` and `trackAdClick` on the page where your ad is served, and `trackAdConversion` on the page(s) where users convert.

For an example of all three functions in action on a page with three distinct ads, see [this file] [ad-example].

<h2><a name="offline">5. New feature: offline tracking</a></h2>

Thanks to community member [Ryan Sorensen][rcs]'s contribution, events fired while a user is offline are no longer lost forever. If the Tracker detects that an event has not successfully reached the collector due to the user being offline, the event will be added to a queue and will be sent once connectivity has been restored. The queue is held in browser Local Storage so that the unsent events can be remembered even after the leaving the page.

<h2><a name="schemas">6. Self-describing JSONs</a></h2>

*Note: The new self-describing JSON format for unstructured events relies on Snowplow 0.9.5, coming soon.*

Snowplow unstructured events and custom contexts are now defined using [JSON schema][json-schema], and should be passed to the Tracker using [self-describing JSONs][self-describing-jsons]. Here is an example of the new format for unstructured events:

{% highlight javascript %}
window.snowplow_name_here('trackUnstructEvent', {
    schema: 'iglu:com.acme_company/viewed_product/jsonschema/2-0-0',
    data: {
        productId: 'ASO01043',
        category: 'Dresses',
        brand: 'ACME',
        returning: true,
        price: 49.95,
        sizes: ['xs', 's', 'l', 'xl', 'xxl'],
        availableSince: new Date(2013,3,7)
    }
});
{% endhighlight %}

The `data` field contains the actual properties of the event and the `schema` field of the JSON points to the JSON schema against which the contents of the `data` field should be validated. The `data` field should be flat, rather than nested. The user who sent in the above event would need to have defined a schema for a `viewed_product` event. The schema would probably describe which fields the JSON can contain, which of those fields are required and which are optional, and the type of data found in each field.

Custom contexts work similarly. Since an event can have multiple contexts attached, the `contexts` argument of each `trackXXX` method must be a array:

{% highlight javascript %}
window.snowplow_name_here('trackPageView', null , [{
    schema: 'iglu:org.schema/WebPage/jsonschema/1-0-0',
    data: {
        author: 'Yali Sassoon',
        inLanguage: 'en-US',
        datePublished: new Date(2014,1,26),
        keywords: ['analytics', 'redshift']
    }
},
{
    schema: 'iglu:com.acme/user/jsonschema/2-0-0',
    data: {
      userType: 'tester',
    }
}]);
{% endhighlight %}

Note that if the `contexts` argument is provided, it cannot be an empty array.

This example shows a page view event with two custom contexts attached: one describing the page using [schema.org's WebPage schema] [webpage-schema-org], and another describing the user.

<h2><a name="tests">7. Functional tests</a></h2>

We have expanded our test suite to include functional tests for our helpers.js and detectors.js modules, run using [Sauce Labs][sauce-labs]. The results of the the tests for different browser / OS combinations can be seen in the new "Testing" section of the README.

<h2><a name="other">8. Other improvements</a></h2>

We have also:

* Moved fixUpUrl, our proxy detection function, into its own file, lib/proxies.js [#112] [112]
* Fixed the duplication of the querystring parameter lookup function [#111] [111]
* Started rigorously checking whether a page is cached by Yahoo [#142] [142]
* Replaced cookie.js with an external module, browser-cookie-lite [#88] [88]
* Removed references to the legacy referrer cookie [#118] [118]
* Fixed the warnings generated by the Closure Compiler, thanks [@steve-gh] [steve-gh]! [#170] [170]
* Upgraded Intern to version 1.5.0 [#119] [119]
* Fixed the link in the code climate button in the README [#149] [149]
* Deleted the obsolete example file ads/sync.html [#182] [182]

<h2><a name="upgrading">9. Upgrading </a></h2>

The upgraded minified tracker is available here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/2.0.0/sp.js

Please note that you will need to update your Snowplow JavaScript tags significantly from the 1.x.x versions to support [the new v2.0.0 API] [api-docs].

<h2><a name="help">10. Documentation and getting help</a></h2>

You can find the [full API documentation] [api-docs] for the Snowplow JavaScript Tracker version 2.0.0 on the Snowplow wiki.

Check out the [v2.0.0 release page] [release-200] on GitHub for the full list of changes made in this version.

As always, if you run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[rcs]: https://github.com/rcs
[steve-gh]: https://github.com/steve-gh
[sauce-labs]: https://saucelabs.com/home
[json-schema]: http://json-schema.org/
[self-describing-jsons]: http://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/

[release-200]: https://github.com/snowplow/snowplow-javascript-tracker/releases/tag/2.0.0
[ad-example]: https://github.com/snowplow/snowplow-javascript-tracker/blob/master/examples/ads/async.html
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

[link-click-json-schema]: http://iglucentral.com/schemas/com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-0
[ad-impression-json-schema]: http://iglucentral.com/schemas/com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0
[ad-click-json-schema]: http://iglucentral.com/schemas/com.snowplowanalytics.snowplow/ad_click/jsonschema/1-0-0
[ad-conversion-json-schema]: http://iglucentral.com/schemas/com.snowplowanalytics.snowplow/ad_conversion/jsonschema/1-0-0
[webpage-schema-org]: http://schema.org/WebPage

[api-docs]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker

[88]: https://github.com/snowplow/snowplow-javascript-tracker/issues/88
[112]: https://github.com/snowplow/snowplow-javascript-tracker/issues/112
[111]: https://github.com/snowplow/snowplow-javascript-tracker/issues/111
[142]: https://github.com/snowplow/snowplow-javascript-tracker/issues/142
[118]: https://github.com/snowplow/snowplow-javascript-tracker/issues/118
[119]: https://github.com/snowplow/snowplow-javascript-tracker/issues/119
[123]: https://github.com/snowplow/snowplow-javascript-tracker/issues/123
[124]: https://github.com/snowplow/snowplow-javascript-tracker/issues/124
[149]: https://github.com/snowplow/snowplow-javascript-tracker/issues/149
[170]: https://github.com/snowplow/snowplow-javascript-tracker/issues/170
[182]: https://github.com/snowplow/snowplow-javascript-tracker/issues/182
