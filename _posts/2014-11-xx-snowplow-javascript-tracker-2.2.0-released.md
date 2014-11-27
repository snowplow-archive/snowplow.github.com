---
layout: post
shortenedlink: JavaScript Tracker 2.2.0 released
title: Snowplow JavaScript Tracker 2.1.1 released
tags: [snowplow, javascript, tracker, event]
author: Fred
category: Releases
---

We are happy to announce the release of version 2.2.0 of the [Snowplow JavaScript Tracker][repo]. This release improves the Tracker's callback support, making it possible to use access previously internal variables such as the tracker-generated user fingerprint and user ID.

This blog post will cover the following topics:

1. [More powerful callbacks](/blog/2014/11/xx/snowplow-javascript-tracker-2.2.0-released/#callbacks)

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

The domainUserInfo variable will be an array containing 6 elements:

0. A string set to `'1'` if this is the user's first session and `'0'` otherwise
1. The domain user ID
2. The timestamp at which the cookiie was created
3. The number of times the user has visited the site
4. The timestamp for the current visit
5. The timestamp of the last visit

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

[0.9.10-release]: /blog/2014/11/06/snowplow-0.9.10-released-for-js-tracker-2.1.0-support/


[204]: https://github.com/snowplow/snowplow-javascript-tracker/issues/204
[254]: https://github.com/snowplow/snowplow-javascript-tracker/issues/254
[266]: https://github.com/snowplow/snowplow-javascript-tracker/issues/266
[267]: https://github.com/snowplow/snowplow-javascript-tracker/issues/267
[216]: https://github.com/snowplow/snowplow-javascript-tracker/issues/216
[150]: https://github.com/snowplow/snowplow-javascript-tracker/issues/150
[76]: https://github.com/snowplow/snowplow-javascript-tracker/issues/76
[169]: https://github.com/snowplow/snowplow-javascript-tracker/issues/169

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
