---
layout: post
title: "Snowplow JavaScript Tracker 2.8.0 released"
title-short: Snowplow JavaScript Tracker 2.8.0
tags: [snowplow, javascript, parrable, optimizely, optimizelyx, privacy, optout]
author: Ben
category: Releases
---

We are pleased to announce a new release of the [Snowplow JavaScript Tracker][js-tracker]. [Version 2.8.0][2.8.0-tag] gives you much more flexibility flexibility and control in the area of in-browser user privacy, as well as adding new integrations for Parrable and OptimizelyX.

Read on below the fold for:

1. [State storage strategy](
/blog/2017/04/10/snowplow-javascript-tracker-2.8.0-released/#storage-strategy)
2. [Opt-out cookie](
/blog/2017/04/10/snowplow-javascript-tracker-2.8.0-released/#opt-out)
3. [Better form tracking for passwords](
/blog/2017/04/10/snowplow-javascript-tracker-2.8.0-release/#passwords)
4. [New OptimizelyX and Parrable contexts](
/blog/2017/04/10/snowplow-javascript-tracker-2.8.0-released/#contexts)
5. [Extracting key data from the tracker](
/blog/2017/04/10/snowplow-javascript-tracker-2.8.0-released/#get-data)
6. [Improved page activity handling](
/blog/2017/04/10/snowplow-javascript-tracker-2.8.0-released/#page-activity)
7. [Upgrading](
/blog/2017/04/10/snowplow-javascript-tracker-2.8.0-released/#upgrade)
8. [Documentation and help](
/blog/2017/04/10/snowplow-javascript-tracker-2.8.0-released/#doc)

<!--more-->

<h2 id="storage-strategy">1. State storage strategy</h2>

This release introduces the [`stateStorageStrategy`][sss] property to the
tracker configuration, taking one of three values: `cookie`, `localStorage` or `none`.

The `cookie` value (the default) will store the id and session data in
cookies, which was the prior behavior if you set [`useCookies`][uc] to true or left it unspecified. The outgoing event buffer (previously controlled using [`useLocalStorage`][uls]) will continue to use local storage.

**BEN IS THIS CORRECT RE local storage for the event buffer ^^?**

The `localStorage` value will store those two first-party cookies in local
storage. This approach is recommended if you are reaching the maximum HTTP
header size of 4kb present on most servers. The outgoing event buffer will continue to use local storage.

The last possible value is `none`. In this case, **nothing** will be stored, neither
in cookies nor in local storage. This is equivalent to setting the old [`useCookies`][uc] _and_
[`useLocalStorage`][uls] settings both to false.

Since the `useLocalStorage` and `useCookies` argmap parameters have been made
redundant by the introduction of `stateStorageStrategy`, they've been
deprecated.

As an example, we could get the JavaScript Tracker to use local storage with:

{% highlight javascript %}
window.snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
  appId: 'CFe23a',
  platform: 'web',
  stateStorageStrategy: 'localStorage'
});
{% endhighlight %}

<h2 id="opt-out">2. Opt-out cookie</h2>

Similar to [the Do Not Track option][dnt], we're introducing a way to set an
opt out cookie. If this cookie is set, no tracking will be performed.

You can set this cookie with:

{% highlight javascript %}
window.snowplow_name_here('setOptOutCookie', 'opt-out');
{% endhighlight %}

where 'opt-out' is the name of your opt-out cookie.

<h2 id="passwords">3. Better form tracking for passwords</h2>

Previous versions of the JavaScript Tracker tracked changes to password fields
in forms if you had form tracking enabled via:

{% highlight javascript %}
snowplow_name_here('enableFormTracking');
{% endhighlight %}

Thanks to the work of [Snowflake Analytics' Mike Robins][miike], as of this release password fields in forms won't be auto-tracked.

<h2 id="contexts">4. New OptimizelyX and Parrable contexts</h2>

<h3 id="parrable">4.1 Parrable context</h3>

[Parrable][parrable] is a device identification platform which
lets you idenitfy devices across browser and apps without personally
identifiable information. This release introduces support for a Parrable context
which will keep track of this identifier.

You can enable this context when initializing the JavaScript Tracker:

{% highlight js %}
window.snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
  appId: 'CFe23a',
  platform: 'web',
  contexts: {
    ...
    'parrable': true
  }
});
{% endhighlight %}

You can also have a look at [the JSON Schema for the Parrable context][parrable-context].

There are further setup steps required to make use of Parrable data in the Snowplow pipeline; we will provide a tutorial for this soon.

Many thanks to [Parrable's Chantal Galvez Omaña][chantal] for contributing the
Parrable support to the JavaScript Tracker!

<h3 id="optimizelyx">4.2 OptimizelyX context</h3>

This release also brings support for [OptimizelyX][optimizelyx], which supplements the
support for the original Optimizely service introduced in [version 2.6.0 of the Tracker](
/blog/2016/03/03/snowplow-javascript-tracker-2.6.0-released-with-optimizely-and-augur-integration/#optimizely-integration).

You can enable this context like any other:

{% highlight js %}
window.snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
  appId: 'CFe23a',
  platform: 'web',
  contexts: {
    ...
    'optimizelyXSummary': true
  }
});
{% endhighlight %}

The schema for this context is available [in Iglu Central][optimizelyx-context].

If you are planning on leveraging the context's
`variationName`s, please untick 'Mask descriptive names in project code
and third-party integrations' in the OptimizelyX menu -> Settings -> Privacy.
Otherwise, all variation names will be `null`.

Thanks to [Snowflake Analytics' Mike Robins][mike] for adding the support for
OptimizelyX.

<h2 id="get-data">5. Extracting key data from the tracker</h2>

In an effort to give you more control, we've exposed a few properties internal
to the tracker such as cookie names, page view IDs and domain session indices.

For example, you can retrieve the complete cookie name for the domain cookie
with:

{% highlight javascript %}
window.snowplow_name_here('getCookieName', 'id');
{% endhighlight %}

**BEN CAN YOU EXPLAIN WHAT THE COOKIE BASENAME - HERE 'id' SIGNIFIES?**

Same goes for the page view ID:

{% highlight javascript %}
window.snowplow_name_here('getPageViewId');
{% endhighlight %}

And the domain session index:

{% highlight javascript %}
window.snowplow_name_here('getDomainSessionIndex');
{% endhighlight %}

**HOW DO THESE get()s WORK IN AN ASYNC TRACKER? THEY FEEL VERY SYNCHRONOUS**

5. [Extracting key data from the tracker](
/blog/2017/04/10/snowplow-javascript-tracker-2.8.0-released/#)

<h2 id="page-activity">6. Improved page activity handling</h2>

In this release, we are also allowing external triggering of the
`activityHandler`. This was motivated by the fact that some events do not
trigger the activity handler despite the user being engaged (e.g. while watching
a video).

You can trigger the activity handler yourself with:

{% highlight javascript %}
window.snowplow_name_here('updatePageActivity');
{% endhighlight %}

This use case and the accompanying implementation was contributed by
[Dean Collins][dean], many thanks Dean!

A few improvements have also been made "under the hood" to activity tracking in general.

Activity tracking is now disabled if you don't supply integers to `enableActivityTracking`.
This is a safety feature, as corrupt non-integer arguments could cause a relentless loop of back-to-back page pings (see [issue #572][572] for more
information).

We are also now keeping track of [`setInterval`][set-interval] calls and clearing
them as needed in order to avoid having multiple `setInterval` running at the
same time ([issue #571][571]).

<h2 id="upgrade">7. Upgrading</h2>

The tracker is available to use here:

```
http(s)://d1fc8wv8zag5ca.cloudfront.net/2.8.0/sp.js
```

There are no breaking API changes introduced with this release, but the following options in the configuration argmap have been deprecated and will fire warnings:

* `useLocalStorage`
* `useCookies`

Please migrate these to the new `stateStorageStrategy` parameter as detailed above.

If you enable the OptimizelyX context, you will need to deploy the following table to your Redshift cluster:

**BEN PLEASE ADD**

If you enable the Parrable context, you will also need to update the configuration of your Snowplow pipeline to make best use of this. A tutorial on doing this will follow soon.

<h2 id="doc">8. Documentation and help</h2>

Check out the JavaScript Tracker's documentation:

* The [setup guide][setup]
* The [full API documentation][docs]

The [v2.8.0 release page][2.8.0-tag] on GitHub has the full list of changes made
in this version.

Finally, if you run into any issues or have any questions, please
[raise an issue][issues] or get in touch with us via [the usual channels][talk].

[js-tracker]: https://github.com/snowplow/snowplow-javascript-tracker
[2.8.0-tag]: https://github.com/snowplow/snowplow-javascript-tracker/releases/tag/2.8.0
[setup]: https://github.com/snowplow/snowplow/wiki/Javascript-tracker-setup
[issues]: https://github.com/snowplow/snowplow-javascript-tracker/issues
[talk]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[docs]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker
[dnt]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#respect-do-not-track
[parrable]: https://www.parrable.com/
[parrable-context]: http://iglucentral.com/schemas/com.parrable/encrypted_payload/jsonschema/1-0-0
[optimizelyx]: https://www.optimizely.com/products/developers/
[optimizelyx-context]: http://iglucentral.com/schemas/schemas/com.optimizely.optimizelyx/summary/jsonschema/1-0-0
[chantal]: https://github.com/chantalgo
[miike]: https://github.com/miike
[dean]: https://github.com/lookaflyingdonkey
[uls]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker-v2.7#2213-configuring-localstorage
[uc]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker-v2.7#2216-disabling-cookies
[sss]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#2214-storage-stategy
[571]: https://github.com/snowplow/snowplow-javascript-tracker/issues/571
[572]: https://github.com/snowplow/snowplow-javascript-tracker/issues/572
[set-interval]: https://www.w3schools.com/jsref/met_win_setinterval.asp
