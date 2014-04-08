---
layout: post
shortenedlink: JavaScript Tracker 2.0.0 released
title: Snowplow JavaScript Tracker 2.0.0 released
tags: [snowplow, javascript, tracker]
author: Fred
category: Releases
---

We are happy to announce the release of the [Snowplow JavaScript Tracker version 2.0.0] [200-release]. This release makes some changes to the public API as well as introducing a number of new features, including tracker namespacing and new link click tracking and ad tracking capabilities. 

This blog post will cover the following changes:

1. [Changes to the Snowplow API](/blog/2014/04/xx/snowplow-javascript-tracker-2.0.0-released/#api)
2. [New feature: tracker namespacing](/blog/2014/04/xx/snowplow-javascript-tracker-2.0.0-released/#tracker-namespacing)
3. [New feature: link click tracking](/blog/2014/04/xx/snowplow-javascript-tracker-2.0.0-released/#link-click)
4. [New feature: ad tracking](/blog/2014/04/xx/snowplow-javascript-tracker-2.0.0-released/#ads)
5. [New feature: offline tracking](/blog/2014/04/xx/snowplow-javascript-tracker-2.0.0-released/#offline)
6. [Functional tests](/blog/2014/04/xx/snowplow-javascript-tracker-2.0.0-released/#tests)
7. [Other improvements](/blog/2014/04/xx/snowplow-javascript-tracker-2.0.0-released/#other)
8. [Upgrading](/blog/2014/04/xx/snowplow-javascript-tracker-2.0.0-released/#upgrading)
9. [Getting help](/blog/2014/04/xx/snowplow-javascript-tracker-2.0.0-released/#help)

<!--more-->

<h2><a name="api">1. Changes to the Snowplow API</a></h2>

Load sp.js using the following script:

{% highlight html %}
<script async=true>

;(function(p,l,o,w,i,n,g){if(!p[i]){p.GlobalSnowplowNamespace=p.GlobalSnowplowNamespace||[];
p.GlobalSnowplowNamespace.push(i);p[i]=function(){(p[i].q=p[i].q||[]).push(arguments)
};n=l.createElement(o);g=l.getElementsByTagName(o)[0];n.async=1;
n.src=w;g.parentNode.insertBefore(n,g)}}(window,document,"script","../../dist/snowplow.js","snowplow_name_here"));

</script>
{% endhighlight %}

You can replace `"snowplow_name_here"` with any string that would be a valid JavaScript variable name. As can be seen in the examples below, this string becomes the name of the Snowplow function which you will call. The general template for using tracker methods is this:

{% highlight javascript %}
{{Snowplow function name}}({{tracker method name}}, {{tracker method argument 1}}, {{tracker method argument 2}}... );
{% endhighlight %}

This Snowplow function namespacing means that even if there are two Snowplow users on the same web page, there will be no conflict as long as they have chosen different Snowplow function names.

<h2><a name="tracker-namespacing">2. New feature: tracker namespacing</h2></a>

New in version 2.0.0 is the ability to have multiple trackers running at once. This is useful if you want to log events to more than one collector. You can even choose which trackers fire which events.

To initialise a new tracker, use the newly-introduced method `newTracker`:

{% highlight javascript %}
function newTracker(namespace, endpoint, argmap)
{% endhighlight %}

It constructs a new tracker based on three arguments: the name of the new tracker, the endpoint to which events should be logged, and an "argmap" of optional settings. An example:

{% highlight javascript %}
snowplow_name_here('newTracker', 'primary', 'd3rkrsqld9gmqf.cloudfront.net', {
	cookieName: '_example_cookie_name_'
	encodeBase64: false,
	appId: 'CFe23a'
	platform: 'mob'
});

snowplow_name_here('newTracker', 'secondary', 'dzrdr5gkt9b5hp.cloudfront.net', {
	cookieName: '_example_cookie_name_'
	encodeBase64: true,
	appId: 'CFe23a'
	platform: 'mob'
});
{% endhighlight %}

This creates two trackers called "primary" and "secondary" logging events to different Cloudfront subdomains. (Note that the full string "d3rkrsqld9gmqf.cloudfront.net" must be used instead of just "d3rkrsqld9gmqf"). Events logged by the primary tracker will not be Base64-encoded; events logged by the secondary tracker will be. Both trackers use the same cookie name. If you do not set a cookie name, the default `'_sp_'` will be used. Setting a custom cookie name is recommended, as it prevents conflicts when two Snowplow users on the same web page attempt to read and write the same cookie.

You can specify which tracker or trackers should execute a method by appending their names to the end of the method name, separating the two with a colon. To only have the primary tracker track a page view event:

{% highlight javascript %}
snowplow_name_here('trackPageView:primary');
{% endhighlight %}

To have more than one tracker execute a method, separate the tracker names with semicolons:

{% highlight javascript %}
snowplow_name_here('trackPageView:primary;secondary');
{% endhighlight %}

If you do not provide a list of tracker namespaces when calling a method, every tracker you have created will execute that method.

The name of the tracker that fired an event will always be added to the querystring in a newfield, `tna`.

<h2><a name="link-click">3. New feature: link click tracking</a></h2>

You can now track link click events using `enableLinkClickTracking`. This method only needs to be called once. Then whenever a link is clicked, a link click event will automatically be fired. The event will include the link element's CSS id and classes, as well as the destination URL.

Here is the method's signature:

{% highlight javascript %}
function enableLinkClickTracking(excludedClasses, pseudoClicks, context)
{% endhighlight %}

The `excludedClasses` argument can be either a string or an array of strings. If a user clicks on a link one of whose classes is in `excludedClasses`, no event will be fired. For example, you could use this argument to prevent clicks on internal links from being tracked.

The `pseudoClicks` argument can be used to turn on pseudo click tracking, which listens not for click events but for successive mouseup and mousedown events over the same link. This is useful because some browsers, such as Firefox, do not generate click events for the middle mouse button.

Use `enableLinkClickTracking like this:

{% highlight javascript %}
snowplow_name_here('enableLinkClickTracking', 'internal' ,'true');
{% endhighlight %}

You can also use the `trackLinkClick` method to manually track a single link click:

{% highlight javascript %}
function trackLinkClick(elementId, elementClasses, elementTarget, targetUrl, context);
{% endhighlight %}

Use it like this:

{% highlight javascript %}
snowplow_name_here('trackLinkClick', 'first-link', 'link-class', '', 'http://www.example.com');
{% endhighlight %}

(`elementTarget` refers to the link's target attribute, which can specifies where the linked document is opened - for example, a new tab or a new window.)

<h2><a name="ads">4. New feature: ad tracking</a></h2>

This release adds three new ad tracking functions: `trackAdImpression`, `trackAdClick`, and `trackAdConversion`. Each of these fires a special unstructured event. Here are their function signatures:

{% highlight javascript %}
function trackAdImpression(impressionId, costIfCpm, bannerId, zoneId, advertiserId, costModel, campaignId, context)

function trackAdClick(clickId, costIfCpc, targetUrl, bannerId, zoneId, impressionId, advertiserId, costModel, campaignId, context)

function trackAdConversion(conversionId, costIfCpa, category, action, property, initialValue, advertiserId, costModel, campaignId, context)
{% endhighlight %}

Use `trackAdImpression` and `trackAdClick` on the page with your ad, and `trackAdConversion` on the page to which your ad directs the user. The timestamp of the ad click event can be used to match it to the right ad conversion event.

<h2><a name="offline">5. New feature: offline tracking</a></h2>

If the Tracker detects that an event has not successfully reached the collector due to the user being offline, the event will be added to a queue and will be sent once connectivity has been restored. The queue is held in `localStorage` so that the unsent events can be remembered even after the leaving the page.

<h2><a name="tests">6. Functional tests</a></h2>

We have expanded our test suite to include functional tests for our helpers.js and detectors.js modules, run using [Sauce Labs][sauce-labs].

<h2><a name="other">7. Other improvements</a></h2>

We have also:

* Moved fixUpUrl, our proxy detection function, into its own file, lib/proxies.js [#112] [112]
* Fixed the duplication of the querystring parameter lookup function [#111] [111]
* Started rigorously checking whether a page is cached by Yahoo [#142] [142]
* Added tests for proxies.js
* Replaced cookie.js with an external module, browser-cookie-lite [#88] [88]
* Removed references to the legacy referrer cookie [#118] [118]
* Upgraded Intern to version 1.5.0 [#119] [119]
* Added a Sauce Labs button at top of the README [#123] [123]
* Added a "Testing" section to the README with a Sauce Labs full test summary widget [#124] [124]
* Fixed the link in the code climate button in the README [#149] [149]

<h2><a name="upgrading">8. Upgrading </a></h2>

The upgraded minified tracker is available here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/2.0.0/sp.js

If you use the path:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/2/sp.js

then you will automatically get new semantic-minor versions and patches as they are released.

<h2><a name="help">9. Getting help</a></h2>

Check out the [v2.0.0 release page] [200-release] on GitHub for the full list of changes made in this version.

As always, if you run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[sauce-labs]: https://saucelabs.com/home

[200-release]: https://github.com/snowplow/snowplow-javascript-tracker/releases/tag/2.0.0
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

[112]: https://github.com/snowplow/snowplow-javascript-tracker/issues/112
[111]: https://github.com/snowplow/snowplow-javascript-tracker/issues/111
[142]: https://github.com/snowplow/snowplow-javascript-tracker/issues/142
[118]: https://github.com/snowplow/snowplow-javascript-tracker/issues/118
[119]: https://github.com/snowplow/snowplow-javascript-tracker/issues/119
[123]: https://github.com/snowplow/snowplow-javascript-tracker/issues/123
[124]: https://github.com/snowplow/snowplow-javascript-tracker/issues/124
[149]: https://github.com/snowplow/snowplow-javascript-tracker/issues/149
