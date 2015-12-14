---
layout: post
title: Snowplow JavaScript Tracker 2.5.0 released
title-short: Snowplow JavaScript Tracker 2.5.0
tags: [snowplow, javascript, tracker, browser, analytics]
author: Fred
category: Releases
---

We are excited to announce the release of version 2.5.0 of the [Snowplow JavaScript Tracker][release-250]! Among other things, this release adds new IDs for sessions and pageviews, making rich in-page and in-session analytics easier.

Read on for more information:

1. [The session ID](/blog/2015/07/22/snowplow-javascript-tracker-2.5.0-released/#session-id)
2. [The page view ID](/blog/2015/07/22/snowplow-javascript-tracker-2.5.0-released/#pageview-id)
3. [Context-generating functions](/blog/2015/07/22/snowplow-javascript-tracker-2.5.0-released/#context-generating-functions)
4. [New Grunt task](/blog/2015/07/22/snowplow-javascript-tracker-2.5.0-released/#grunt)
5. [Breaking change to trackPageView](/blog/2015/07/22/snowplow-javascript-tracker-2.5.0-released/#breaking1)
6. [Breaking change to session cookie timeouts](/blog/2015/07/22/snowplow-javascript-tracker-2.5.0-released/#breaking2)
7. [Upgrading](/blog/2015/07/22/snowplow-javascript-tracker-2.5.0-released/#upgrading)
8. [Documentation and help](/blog/2015/07/22/snowplow-javascript-tracker-2.5.0-released/#docs)

<!--more-->

<h2 id="session-id">1. The session ID</h2>

In April, Snowplow Release 63 Red-Cheeked Cordon-Bleu added a "domain_sessionid" field to the enriched event model. This JavaScript Tracker release populates this field with a version 4 UUID that is unique to a given session. This ID is stored in the Snowplow ID cookie (which contains other persistent data, including the user ID). The ID is regenerated whenever the user is away from the domain for over 30 minutes (the time taken for the session cookie to expire). This ID is attached to every event.

If cookies are disabled, the session ID will be stored in memory rather than in a cookie. It will be regenerated after 30 minutes.

This release also changes how the JavaScript Tracker measures the visit count (which corresponds to the "domain_sessionidx" field in atomic.events) when cookies are disabled. Previously, every event sent would have visit count equal to 1. Now the Tracker keeps the visit count in memory and increments it when the user is inactive on the page for 30 minutes. Note that the visit count will still reset once the user reloads or leaves the page.

<h2 id="pageview-id">2. The page view ID</h2>

To make it easier to aggregate all events from a particular page load into single rows, we have added the new optional `web_page` context. This context has a single "id" field, containing a unique version 4 UUID for the page view. The UUID is generated on page load and the context is attached to all events fired on the page.

To enable this context, add "webPage" to the "contexts" field of the tracker construction argmap:

{% highlight javascript %}
window.snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
  appId: 'CFe23a',
  platform: 'web',
  contexts: {
    performanceTiming: true,
    ...
    // Page view UUIDs enabled here
    webPage: true
  }
});
{% endhighlight %}

<h2 id="context-generating-functions">3. Context-generating functions</h2>

When you add contexts to a page view, those contexts automatically get added to all subsequent page pings. But what if you want the contexts to update depending on new information?

It is now possible to pass a context-generating function to `trackPageView`. This function should return a (possibly empty) array of custom contexts. For example:

{% highlight javascript %}
// Turn on page pings every 10 seconds
window.snowplow('enableActivityTracking', 10, 10);

window.snowplow(
  'trackPageView',

  // no custom title
  null,

  // The usual array of static contexts
  [{
    schema: 'iglu:com.acme/static_context/jsonschema/1-0-0',
    data: {
      staticValue: new Date().toString()
    }
  }],

  // Function which returns an array of custom contexts
  // Gets called once per page view / page ping
  function() {
    return [{
      schema: 'iglu:com.acme/dynamic_context/jsonschema/1-0-0',
      data: {
        dynamicValue: new Date().toString()
      }
    }];
  }
);
{% endhighlight %}

Once the above code is executed, the initial page view and all page pings will have two contexts attached. The first, a *static context* which contains the datetime from the call to trackPageView, will be the same for all events. The second, a *dynamic context*, will be re-computed for every event, and will have a different datetime in each case.

<h2 id="grunt">4. New Grunt task</h2>

To speed up development, we have added a Grunt task which builds the tracker skipping the steps of building the custom lodash.js library and minification. You can invoke it from the command line in the root directory like this:

{% highlight bash %}
grunt quick
{% endhighlight %}

<h2 id="breaking1">5. Breaking change to trackPageView</h2>

The previous version of the tracker deprecated the "performanceTiming" argument to the `trackPageView` function. This release removes it completely:

{% highlight javascript %}
// Old
// window.snowplow('trackPageView', customTitleString, performanceTimingBoolean, contextsArray);

// New
window.snowplow('trackPageView', customTitleString, contextsArray, contextGeneratingFunction);
{% endhighlight %}

<h2 id="breaking2">6. Breaking change to session cookie timeouts</h2>

Using the `setSessionCookieTimeout` method is no longer effective. This is because the cookie is set as soon as the tracker is created, before the method gets a chance to be called. Instead, you can add a `sessionCookieTimeout` field to the tracker's construction argmap:

{% highlight javascript %}
window.snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
  appId: 'CFe23a',
  platform: 'web',

  sessionCookieTimeout: 3600, // one hour

  contexts: {
    performanceTiming: true,
    webPage: true
  }
});
{% endhighlight %}

<h2 id="upgrading">7. Upgrading</h2>

The upgraded minified tracker is available here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/2.5.0/sp.js

Make sure to update your tracking code to reflect the two **breaking changes** highlighted above.

<h2 id="docs">8. Documentation and help</h2>

Check out the JavaScript Tracker's documentation:

* The [setup guide][setup]
* The [full API documentation][tech-docs]

The [v2.5.0 release page][release-250] on GitHub has the full list of changes made in this version.

Finally, if you run into any issues or have any questions, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[release-250]: https://github.com/snowplow/snowplow-javascript-tracker/releases/tag/2.5.0
[tech-docs]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker
[setup]: https://github.com/snowplow/snowplow/wiki/Javascript-tracker-setup
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
