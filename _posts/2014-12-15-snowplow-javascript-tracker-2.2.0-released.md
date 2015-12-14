---
layout: post
title: Snowplow JavaScript Tracker 2.2.0 released
title-short: Snowplow JavaScript Tracker 2.2.0
tags: [snowplow, javascript, tracker, event]
author: Fred
category: Releases
---

We are happy to announce the release of version 2.2.0 of the [Snowplow JavaScript Tracker][repo]. This release improves the Tracker's callback support, making it possible to use access previously internal variables such as the tracker-generated user fingerprint and user ID. It also adds the option to disable the Tracker's use of `localStorage` and first-party cookies.

The rest of this blog post will cover the following topics:

1. [More powerful callbacks](/blog/2014/12/15/snowplow-javascript-tracker-2.2.0-released/#callbacks)
2. [Disabling localStorage and cookies](/blog/2014/12/15/snowplow-javascript-tracker-2.2.0-released/#localstorage)
3. [Non-integer offsets](/blog/2014/12/15/snowplow-javascript-tracker-2.2.0-released/#offsets)
4. [Upgrading](/blog/2014/12/15/snowplow-javascript-tracker-2.2.0-released/#upgrading)
5. [Getting help](/blog/2014/12/15/snowplow-javascript-tracker-2.2.0-released/#help)

<!--more-->

<h2><a name="callbacks">1. More powerful callbacks</a></h2>

Version 2.1.1 added support for custom callbacks to be executed when sp.js loads:

{% highlight javascript %}
snowplow(function () {
	console.log("sp.js has loaded");
});
{% endhighlight %}

This release extends that support by calling the callback function as a method on an internal `trackerDictionary` object. This sets the value of `this` in the callback to the `trackerDictionary`, allowing you to call methods which return results on individual tracker instances.

An example which extracts all the available fields:

{% highlight javascript %}
// Configure a tracker instance named "cf"
snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
	appId: 'snowplowExampleApp',
	platform: 'web'
});

// Set a callback to be executed once sp.js loads
snowplow(function () {

	// Get the fingerprint which the tracker
	// generates based on browser features
	var userFingerprint = this.cf.getUserFingerprint();

	// Get the ID stored in the first party cookie
	var domainUserId = this.cf.getDomainUserId();

	// Get all information stored in the first party cookie
	var domainUserInfo = this.cf.getDomainUserInfo();

	// Get the ID which you set for the user
	var businessUserId = this.cf.getUserId();

	doSomethingWith(userFingerprint, domainUserId);
});
{% endhighlight %}

Note that `getDomainUserInfo()` returns an array containing 6 elements:

0. A string set to `'1'` if this is the user's first session and `'0'` otherwise
1. The domain user ID
2. The timestamp at which the cookie was created
3. The number of times the user has visited the site
4. The timestamp for the current visit
5. The timestamp of the last visit

This change is backward-compatible unless you were relying on your callback function being executed in the global context (meaning that `this` is set to `window`).

We would like to thank Snowplow community member Rob Murphy ([@murphybob] [murphybob]) for his help developing this feature!

<h2><a name="localstorage">2. Disabling localStorage and cookies</a></h2>

The Snowplow JavaScript Tracker maintains a queue of events that have failed to send. This means that if a visitor loses and later regains connectivity, no data will be lost. By default the tracker will use `localStorage` to store this queue so the events are recoverable even after the user leaves the site.

You can now disable this use of `localStorage` by setting a flag in the argmap used to create a new tracker instance. You can also disable the use of first-party cookies:

{% highlight javascript %}
// Configure a tracker instance named "cf"
snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
	appId: 'snowplowExampleApp',
	platform: 'web',

	// disable localStorage
	useLocalStorage: false,

	// disable first-party cookies
	useCookies: false
});
{% endhighlight %}

Disabling first-party cookies can be useful if you are deploying the JavaScript Tracker in an environment where first-party cookies are forbidden (for example, in ad tags running on Google domains).

<h2><a name="offsets">3. Non-integer offsets</a></h2>

Snowplow page ping events include the maximum and minimum scroll distances since the last page ping. We found that it is possible for the scroll values reported by the browser to not be whole numbers, causing the event to fail enrichment (which requires these fields to be integers). We have fixed this bug by rounding the relevant values to the nearest integer.

<h2><a name="upgrading">4. Upgrading</a></h2>

The new minified and gzipped JavaScript is available at

`http(s)://d1fc8wv8zag5ca.cloudfront.net/2.2.0/sp.js`

<h2><a name="help">5. Getting help</a></h2>

Check out the [documentation][docs] for more help and examples.

If you have any suggestions for new features or need help getting set up, please [get in touch][talk-to-us]. And [raise an issue][issues] if you spot a bug!

[murphybob]: https://github.com/murphybob
[repo]: https://github.com/snowplow/snowplow-javascript-tracker
[core]: https://www.npmjs.org/package/snowplow-tracker-core
[docs]: https://github.com/snowplow/snowplow/wiki/Javascript-Tracker
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
