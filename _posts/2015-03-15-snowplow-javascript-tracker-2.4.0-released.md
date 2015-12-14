---
layout: post
title: Snowplow JavaScript Tracker 2.4.0 released
title-short: Snowplow JavaScript Tracker 2.4.0
tags: [snowplow, javascript, tracker, browser, analytics]
author: Fred
category: Releases
---

We are pleased to announce the release of version 2.4.0 of the [Snowplow JavaScript Tracker][release-240]! This release adds support for cross-domain tracking and a new method to track timing events.

Read on for more information:

1. [Tracking users cross-domain](/blog/2015/03/15/snowplow-javascript-tracker-2.4.0-released/#cross-domain)
2. [Tracking timings](/blog/2015/03/15/snowplow-javascript-tracker-2.4.0-released/#timing)
3. [Dynamic handling of single-page apps](/blog/2015/03/15/snowplow-javascript-tracker-2.4.0-released/#single-page)
4. [Improved PerformanceTiming context](/blog/2015/03/15/snowplow-javascript-tracker-2.4.0-released/#performance-timing)
5. [Other improvements](/blog/2015/03/15/snowplow-javascript-tracker-2.4.0-released/#other)
6. [Upgrading](/blog/2015/03/15/snowplow-javascript-tracker-2.4.0-released/#upgrading)
7. [Documentation and help](/blog/2015/03/15/snowplow-javascript-tracker-2.4.0-released/#help)

<!--more-->

<h2><a name="cross-domain">1. Tracking users cross-domain</a></h2>

Version 2.4.0 of the JavaScript Tracker adds support for tracking users cross-domain. When a user clicks on one of the links you have specified (or navigates to that link using the keyboard), the Tracker adds the user's domain user ID together with a timestamp for the click to the querystring of that link in an "_sp=..." querystring field. If the JavaScript Tracker is also present on the destination page, it will send the URL of the page - including the new querystring field - with all events.

Snowplow r63 (coming soon), will add new `refr_domain_userid` and `refr_dvce_tstamp` fields to the `atomic.events` table, which will then be populated based on the "_sp" field.

You can control which links should be decorated using a filter function. For each link element on the page, the function will be called with that link as its argument. If the function returns `true`, event listeners will be added to the link and will decorate it when the user navigates to it.

To enable cross-domain tracking, add this function to the tracker constructor argmap with the key "crossDomainLinker".

For example, this function would only decorate those links whose destination is "http://acme.de" or whose HTML id is "crossDomainLink":

{% highlight javascript %}
snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
  crossDomainLinker: function (linkElement) {
    return (linkElement.href === "http://acme.de" || linkElement.id === "crossDomainLink");
  }
});
{% endhighlight %}

If you want to decorate every link to the domain github.com:

{% highlight javascript %}
snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
  crossDomainLinker: function (linkElement) {
    return /^https:\/\/github\.com/.test(linkElement.href);
  }
});
{% endhighlight %}

If you want to decorate every link, regardless of its destination:

{% highlight javascript %}
snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
  crossDomainLinker: function (linkElement) {
    return true;
  }
});
{% endhighlight %}

If new links are added to the page after the tracker is initialized, you can enable decoration for them using the `crossDomainLinker` tracker method:

{% highlight javascript %}
snowplow('crossDomainLinker', function (linkElement) {
    return (linkElement.href === "http://acme.de" || linkElement.id === "crossDomainLink");
  })
{% endhighlight %}

<h2><a name="timing">2. Tracking timings</a></h2>

The new `trackTiming` method can be used to track user timing information. This example uses the method to send a `timing` event describing how long it took a map to load:

{% highlight javascript %}
snowplow(
  'trackTiming',
  'load',            // Category of the timing variable
  'map_loaded',      // Variable being recorded
  50,                // Milliseconds taken
  'Map loading time' // Optional label
 );
{% endhighlight %}

You can see the JSON schema for the event that the method generates [here][timing-schema].

<h2><a name="single-page">3. Dynamic handling of single-page apps</a></h2>

Previous versions of the JavaScript Tracker would retrieve the page's URL and referrer's URL on page load and never update them. This was problematic for single-page applications (SPAs), with Snowplow users resorting to manually setting a custom page/referrer URLs whenever the URL changed inside the SPA.

Version 2.4.0 of the Tracker automatically detects when the page URL changes and updates the page URL and referrer accordingly. The referrer is replaced by the old page URL. Note that you must send at least one event each time the URL changes, because the Tracker will not notice a skipped URL. This means that if the user navigates from `page1` to `page2` to `page3`, but no events are fired while on `page3`, the referrer reported for all events fired on `page3` will stil be `page1`.

When you use the `setCustomUrl`, the page URL reported by the Tracker will "stick" at the supplied value until the JavaScript Tracker is reloaded - unless of course you call `setCustomUrl` again. Setting the referrer URL using `setReferrerUrl` is similarly sticky.

<h2><a name="performance-timing">4. Improved PerformanceTiming context</a></h2>

We recently added the ability to add a context containing data from the [Navigation Timing API][navigation-timing] to all events. At the time the context gets constructed, some of the timing metrics (typically `loadEventEnd`, `loadEventStart`, and `domComplete`) are usually not yet available.

With this releaes, the context is recalculated with every event instead of being cached, so missing timing metrics will be added to subsequent events as soon as those metrics become available.

<h2><a name="other">5. Other improvements</a></h2>

We have also:

* Started adding common contexts (including the `PerformanceTiming` context) to `form_change`, `form_submit`, and `link_click` events, the only event types to which they were not already automatically added if enabled [#340][340]
* Increased the reliability of the JavaScript Tracker's document size detection [#334][334]
* Started randomly generating the [ngrok][ngrok] subdomain used for our integration tests to prevent clashes when the tests are run more than once simultaneously [#333][333]
* Updated the Vagrant setup to work with the latest version of Peru [#336][336]

<h2><a name="upgrading">6. Upgrading</a></h2>

The upgraded minified tracker is available here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/2.4.0/sp.js

This release is fully backward-compatible.

<h2><a name="help">7. Documentation and help</a></h2>

Check out the JavaScript Tracker's documentation:

* The [setup guide][setup]
* The [full API documentation][tech-docs]

The [v2.4.0 release page][release-240] on GitHub has the full list of changes made in this version.

Finally, if you run into any issues or have any questions, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[release-240]: https://github.com/snowplow/snowplow-javascript-tracker/releases/tag/2.4.0
[timing-schema]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/timing/jsonschema/1-0-0
[ngrok]: https://ngrok.com/
[333]: https://github.com/snowplow/snowplow-javascript-tracker/issues/333
[334]: https://github.com/snowplow/snowplow-javascript-tracker/issues/334
[336]: https://github.com/snowplow/snowplow-javascript-tracker/issues/336
[340]: https://github.com/snowplow/snowplow-javascript-tracker/issues/340
[tech-docs]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker
[setup]: https://github.com/snowplow/snowplow/wiki/Javascript-tracker-setup
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[navigation-timing]: http://www.w3.org/TR/navigation-timing/
