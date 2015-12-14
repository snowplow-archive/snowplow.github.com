---
layout: post
title: Snowplow JavaScript Tracker 2.3.0 released
title-short: Snowplow JavaScript Tracker 2.3.0
tags: [snowplow, javascript, tracker, browser, analytics]
author: Fred
category: Releases
---

We are pleased to announce the release of version 2.3.0 of the [Snowplow JavaScript Tracker][release-230]! This release adds a number of new features including the ability to send events by `POST` rather than `GET`, some new contexts, and improved automatic form tracking.

This blog post will cover the changes in detail.

1. [POST support](/blog/2015/03/03/snowplow-javascript-tracker-2.3.0-released/#post)
2. [Customizable form tracking](/blog/2015/03/03/snowplow-javascript-tracker-2.3.0-released/#forms)
3. [Automatic contexts](/blog/2015/03/03/snowplow-javascript-tracker-2.3.0-released/#contexts)
4. [Development quickstart](/blog/2015/03/03/snowplow-javascript-tracker-2.3.0-released/#quickstart)
5. [Other improvements](/blog/2015/03/03/snowplow-javascript-tracker-2.3.0-released/#other)
6. [Upgrading](/blog/2015/03/03/snowplow-javascript-tracker-2.3.0-released/#upgrading)
7. [Documentation and getting help](/blog/2015/03/03/snowplow-javascript-tracker-2.3.0-released/#help)

<!--more-->

<h2><a name="post">1. POST support</a></h2>

Until now, the JavaScript Tracker has sent events to Snowplow using `GET` requests, with the event payload in the querystring. The recently released [version 1.0.0] [clj-collector-release] of the [Clojure Collector][clojure-collector] added [CORS][cors] support, so it can now accept `POST` requests from the browser. This has two advantages:

- Internet Explorer's [querystring limit][ie-limit] means that a large event payload sent via `GET` could be truncated. There is no such size limit on `POST` requests
- It's possible to batch multiple events into a single request

<h3>An example</h3>

{% highlight javascript %}
window.snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
	appId: 'my-application',
	platform: 'web',
	post: true, // Use POST rather than GET
	bufferSize: 3 // Batch size for POST requests - defaults to 1
});
{% endhighlight %}

This snippet configures a tracker to wait until 3 events have occurred, then batch them together in a single `POST` request.

The JavaScript Tracker stores events in `localStorage` and only deletes them once they have been sent successfully. When a user leaves the page, the tracker will try to send all buffered events, but even if it fails they will still be present in `localStorage` and will be sent the next time the user is on a page belonging to the same host.

Note that if `localStorage` is unavailable, the bufferSize will always be set to 1 (meaning that events are `POST`ed as soon as they occur) to minimise the risk of losing buffered events when the user leaves the page.

Internet Explorer versions 9 and earlier do not support cross-origin XMLHttpRequests so the Tracker will default to `GET` requests in those environments. Going forward, we intend to add support for sending cross-origin POST requests using the XDomainRequest object available in Internet Explorer 8 and 9.

<h2><a name="forms">2. Customizable form tracking</a></h2>

The `enableFormTracking` method turns on automatic form tracking - whenever a visitor edits a field of a form or submits a form, a `change_form` or `submit_form` unstructured event will automatically be generated.

This release adds an additional `config` argument to `enableFormTracking`, allowing you to choose which fields and which forms get tracked. This is invaluable for automatically tracking forms which contain PII, financial or otherwise sensitive data.

 The configuration object should have two elements: "forms" and "fields". The "forms" value specifies which forms on the page will be tracked; the "fields" value specifies which fields of the tracked forms will be tracked.

There are three possible ways to specify which elements should be tracked:

* A whitelist: only track those elements whose class (in the case of forms) or name (in the case of fields) is in a given array
* A blacklist: track every element whose class/name is not in a given array
* A filter: track every element for which a given function returns true

<h3>An example</h3>

This tracks only forms with the "signup" or "order" class, and tracks every field of those forms except for those named "password".

{% highlight javascript %}
var config = {
	forms: {
		whitelist: ['signup', 'order']
	},
	fields: {
		blacklist: ['password']
	}
};
{% endhighlight %}

This tracks every form (the default when a field is not specified) and tracks every field with `id` not equal to "private".

{% highlight javascript %}
var config = {
	fields: {
		filter: function (fieldElement) {
			return fieldElement.id !== 'private';
		}
	}
};
{% endhighlight %}

<h2><a name="contexts">3. Automatic contexts</a></h2>

Version 2.1.0 added the automatically generated PerformanceTiming context containing information from the [Navigation Timing API][navigation-timing], which could be attached to all page views and page pings. This was activated using a boolean argument to the `trackPageView` method.

This release adds two new optional generated contexts: the Google Analytics `cookies` context and the `geolocation_context` context. If enabled, these two contexts plus the PerformanceTiming context will be now added to **every event**, not just page views and page pings.

We strongly recommend using `POST` if you are attaching one or more of these contexts to your events.

<h3>gaCookies</h3>

If this context is enabled, the JavaScript Tracker will look for Google Analytics cookies (specifically the "__utma", "__utmb", "__utmc", "__utmv", "__utmz", and "_ga" cookies) and combine their values into a context which gets sent with every event.

<h3>geolocation</h3>

This context is built from the [Geolocation API][geolocation-api]. If you enable it and a user hasn't already given permission to use their geolocation information, a prompt will appear asking if they wish to share their location. If they accept, the geolocation context will be added to all subsequent events.

<h3>performanceTiming</h3>

This context is unchanged, although the way it is enabled in the Tracker has been updated - see the next section for details.

<h3>Usage</h3>

These optional contexts are now configured in the argmap when creating a new tracker. **Note that the `performanceTracking` boolean argument to the `trackPageView` method has been deprecated. You should remove it from your `trackPageView` calls.**

Use the new `contexts` field in the tracker constructor to choose which contexts are set:

{% highlight javascript %}
// Configuring a tracker to send all three contexts
window.snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
	appId: 'my-application',
	platform: 'web',
	contexts: {
		geolocation: true,
		performanceTiming: true,
		gaCookies: true
	}
});
{% endhighlight %}

<h2><a name="quickstart">4. Development quickstart</a></h2>

We have added a Vagrantfile to the repository so that as long as you have [VirtualBox][virtualbox-install] and [Vagrant][vagrant-install] installed, it is now trivial to get started contributing to the JavaScript Tracker:

{% highlight bash %}
 host$ git clone https://github.com/snowplow/snowplow-javascript-tracker.git
 host$ cd snowplow-javascript-tracker
 host$ vagrant up && vagrant ssh
guest$ cd /vagrant
guest$ sudo npm install
{% endhighlight %}

<h2><a name="other">5. Other improvements</a></h2>

We have also:

* Prevented the tracker from sending NaN in the page ping offset fields [#324][324]
* Added tests for the detection of document size and browser features [#270][270]
* Added integration tests using the full tracker [#154][154]
* Moved the grunt-yui-compressor dependency into the Snowplow organization [#172][172]
* Renamed the "deploy" folder to "dist" [#319][319]

<h2><a name="upgrading">6. Upgrading</a></h2>

The upgraded minified tracker is available here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/2.3.0/sp.js

There is one backwards-incompatible change: the `trackPageView` method now takes only takes two arguments, `customTitle` and `context`, rather than three. **Calls with three arguments will generate a deprecation warning in the user's browser console, but will otherwise continue to work.**

<h2><a name="help">7. Documentation and getting help</a></h2>

You can find the [full API documentation] [tech-docs] for the Snowplow JavaScript Tracker version 2.3.0 on the Snowplow wiki.

Check out the [v2.3.0 release page] [release-230] on GitHub for the full list of changes made in this version.

Finally, if you run into any issues or have any questions, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[clj-collector-release]: /blog/2015/03/02/snowplow-r61-pygmy-parrot-released/#clj-collector-updates
[release-230]: https://github.com/snowplow/snowplow-javascript-tracker/releases/tag/2.3.0
[clojure-collector]: https://github.com/snowplow/snowplow/tree/master/2-collectors/clojure-collector
[cors]: http://en.wikipedia.org/wiki/Cross-origin_resource_sharing
[ie-limit]: http://stackoverflow.com/questions/812925/what-is-the-maximum-possible-length-of-a-query-string
[navigation-timing]: https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/NavigationTiming/Overview.html
[geolocation-api]: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation
[vagrant-install]: http://docs.vagrantup.com/v2/installation/index.html
[virtualbox-install]: https://www.virtualbox.org/wiki/Downloads
[tech-docs]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker
[324]: https://github.com/snowplow/snowplow-javascript-tracker/issues/324
[325]: https://github.com/snowplow/snowplow-javascript-tracker/issues/325
[270]: https://github.com/snowplow/snowplow-javascript-tracker/issues/270
[154]: https://github.com/snowplow/snowplow-javascript-tracker/issues/154
[172]: https://github.com/snowplow/snowplow-javascript-tracker/issues/172
[319]: https://github.com/snowplow/snowplow-javascript-tracker/issues/319
