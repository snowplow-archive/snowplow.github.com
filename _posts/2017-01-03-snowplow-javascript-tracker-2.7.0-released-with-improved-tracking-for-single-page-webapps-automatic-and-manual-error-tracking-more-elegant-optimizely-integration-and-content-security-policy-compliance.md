---
layout: post
title-short: Snowplow Javascript Tracker 2.7.0 released
title: "Snowplow Javascript Tracker 2.7.0 released with improved tracking for single-page webapps, automatic and manual error tracking, more elegant Optimizely integration and Content Security Policy compliance"
tags: [snowplow, javascript, single page web apps, CSP, Content Security Policy, true timestamp, error tracking, Optimizely]
author: Yali
category: Releases
---

We are delighted to kick off 2017 with a new release of our [Javascript Tracker][snowplow-javascript-tracker]. This includes a number of new and improved features including:

1. [Improved tracking for single-page webapps](#single-page-web-apps)
2. [Content Security Policy compliance](#csp-compliance)
3. [Automatic and manual error tracking](#error-tracking)
4. [New configuration options for first party cookies](#cookie-configuration-options)
5. [More elegant Optimizely integration](#elegant-optimizely-integration)
6. [New `trackSelfDescribingEvent` method](#track-self-describing-event-method)

<h2 id="single-page-web-apps">1. Improved tracking for single-page webapps</h2>

The [`webPage` context][web-page-context] is one of the most useful features of the Javascript tracker. By attaching a page view ID to every event recorded with the tracker, it becomes straightforward, when modeling and analysing the data, to understand what events occur on which web page. This is incredibly useful for understanding when e.g. a user has a website open in multiple tabs, and/or you want to understand the user flow through a website or web app.

Unfortunately, historically, the web page context has not worked well at all for single page web apps the track "virtual page views". Typically in these types of application, a [`trackPageView`][track-pageview] method call is made every time a virtual page view occurs. However, older versions of the tracker would not reset the page view ID when a the `trackPageView` method was called: instead it was only reset when the tracker was reinitialized. That was fine on multi-page web apps, when the tracker is reinitialized with each page load, but not on single page webapps using virtual page views, where it is not.

With version 2.7.0 of the tracker, that ID is now reset every time the `trackPageView` method occurs, making it just as easy to understant what page view to associate specific events with on single page webapps as on multi-page webapps.

<h2 id="csp-compliance">2 Content Security Policy compliance</h2>

[Content Security Policy (CSP)][csp] is a computer security standard introduced to prevent cross-site scripting (XSS), clickjacking and other code injection attacks resulting from execution of malicious content in the trusted web page context.

This release of the tracker is CSP compliant!

<h2 id="error-tracking">3. Automatic and manual error tracking</h2>

The JS tracker now supports automatic error tracking! Simply enable this when initializing the tracker:

```
window.snowplow_name_here('enableErrorTracking');
```

and make sure that you have created the [application error table][application-error-table] in Redshift.

In addition you can manually catch errors and track them using the new [trackError][track-error] method.

<h2 id="cookie-configuration-options">4. New configuration options for first party cookies</h2>

It is now possible to set the lifetime of device/user cookies, or to disable them altogether, on tracker initialization.

Previously these were always set to last for 2 years. Now y ou can configure them as documented [here][cookie-lifetime].

<h2 id="elegant-optimizely-integration">5. More elegant Optimizely integration</h2>

In the [previous tracker release][2.6.0-release] we announced Optimizely integration. This made it is straightforward to automatically grab components of the [Optimizely Data Object][optimizely-data-object] as context with any event that was recorded by the JS tracker.

This release includes a new [Optimizely Summary Context][optimizely-summary-context]: which picks out:

1. Just a subset of fields from the Optimizely Data Object necessary to unambiguously identify what experiment(s) are currently being run, reducing the context footprint
2. Structures the data in a way that makes subsequent analysis much easier

For both the above reasons we recommend all Snowplow-Optimizely users employ the new summary context rather than the prevoius contexts.

Huge thank you to [Snowflake Analytics'][snowflake] [Narbeh Yousefian][narbeh] for suggesting and designing the updated approach.

<h2 id="track-self-describing-event-method">6. New <code>trackSelfDescribingEvent</code> method</h2>

We've added a new `trackSelfDescribing` event method for tracking events where you've defined your own event schema e.g.

{% highlight js %}
window.snowplow_name_here('trackSelfDescribingEvent', {
    schema: 'iglu:com.my_company/save_game/jsonschema/2-0-0',
    data: {
        gameId: '123',
        currentPosition: 15,
        currentScore: 12,
        exitOnCompletion: false,
        playerId: 'abc'
    }
});
{% endhighlight %}

The new method is functionally equivalent to the old (and still valid) `trackUnstructEvent` method. However, the updated name is more accurate: `trackUnstructEvent` suggests that an unstructured event is being tracked, and as the event is schema'd *and* is sent into Snowplow with a reference to it's own schema, it is actually a very structured data set.

<h2 id="installation-instructions">7. Installing the updated tracker</h2>

The tracker is available to use here:

```
http(s)://d1fc8wv8zag5ca.cloudfront.net/2.7.0/sp.js
```

There are no breaking API changes introduced with this release, so updating the tracker should be straightforward.

[snowplow-javascript-tracker]: https://github.com/snowplow/snowplow-javascript-tracker
[web-page-context]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#22141-webpage-context
[track-pageview]: https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#311-trackpageview
[csp]: https://en.wikipedia.org/wiki/Content_Security_Policy
[application-error-table]: https://github.com/snowplow/iglu-central/blob/master/sql/com.snowplowanalytics.snowplow/application_error_1.sql
[track-error]: https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#3161-trackerror
[cookie-lifetime]: visitorCookieDuration
[2.6.0-release]: /blog/2016/03/03/snowplow-javascript-tracker-2.6.0-released-with-optimizely-and-augur-integration/
[optimizely-data-object]: https://help.optimizely.com/hc/en-us/articles/205670207-The-console-data-object-and-Optimizely-log#data_object
[optimizely-summary-context]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#221411-optimizelysummary-context
[snowflake]: https://www.snowflake-analytics.com/
[narbeh]: https://au.linkedin.com/in/narbehyousefian
