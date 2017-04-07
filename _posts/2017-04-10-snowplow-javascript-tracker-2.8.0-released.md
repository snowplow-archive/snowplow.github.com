---
layout: post
title: "Snowplow JavaScript Tracker 2.8.0 released"
title-short: Snowplow JavaScript Tracker 2.8.0
tags: [snowplow, javascript, Optimizely]
author: Ben
category: Releases
---

We are pleased to announce a new iteration of our
[JavaScript Tracker][js-tracker]. [Version 2.8.0][2.8.0-tag] is centered around
giving you more flexibility in the area of privacy and as such we'll
introduce the following features:

1. [State storage strategy](
/blog/2017/04/10/snowplow-javascript-tracker-2.8.0-released/#storage-strategy)
2. [Opt-out cookie](
/blog/2017/04/10/snowplow-javascript-tracker-2.8.0-released/#opt-out)
3. [Better form tracking regarding passwords](
/blog/2017/04/10/snowplow-javascript-tracker-2.8.0-release/#passwords)
4. [New OptimizelyX and Parrable contexts](
/blog/2017/04/10/snowplow-javascript-tracker-2.8.0-released/#contexts)
5. [Improved usability and bug fix](
/blog/2017/04/10/snowplow-javascript-tracker-2.8.0-released/#usage)
6. [Upgrading](
/blog/2017/04/10/snowplow-javascript-tracker-2.8.0-released/#upgrade)
7. [Documentation and help](
/blog/2017/04/10/snowplow-javascript-tracker-2.8.0-released/#doc)

<!--more-->

<h2 id="storage-strategy">1. State storage strategy</h2>

In this new version of the JavaScript Tracker, we've decided to overhaul how
the tracker stores information.

This release introduces the [`stateStorageStrategy`][sss] property to the
argmap, it can take three values: cookie, localStorage or none.

The `cookie` value (the default) will store the id and session cookies in
cookies as before if you specified [`useCookies`][uc] to true (the default).

The `localStorage` value will store those two first party cookies in local
storage. This approach is recommended if you're reaching the maximum HTTP
header size of 4kb present on most servers. Additionally, the behavior of
setting [`useLocalStorage`][uls] to true will be maintained: outgoing events
will be first temporarily stored in local storage not to lose any events if the
user goes offline.

The last possible value is `none`. In this case, nothing will be stored (neither
in cookies nor in local storage).

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

Similarly to [the do not track option][dnt], we're introducing a way to set an
opt out cookie. If this cookie is set, no tracking will be performed.

You can set this cookie with:

{% highlight javascript %}
window.snowplow_name_here('setOptOutCookie', 'opt-out');
{% endhighlight %}

where 'opt-out' is the name of your opt-out cookie.

<h2 id="passwords">3. Better form tracking regarding passwords</h2>

Previous versions of the JavaScript Tracker tracked changes to password fields
in forms if you had form tracking enabled through:

{% highlight javascript %}
snowplow_name_here('enableFormTracking');
{% endhighlight %}

Thanks to the work of [Snowflake Analytics' Mike Robins][mike], starting with
version 2.8.0, password fields in forms won't be tracked.

<h2 id="contexts">4. New OptimizelyX and Parrable contexts</h2>

<h3 id="parrable">4.1 Parrable context</h3>

[Parrable](https://www.parrable.com/) is a device identification platform which
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

You can also have a look at
[the JsonSchema for the Parrable context][parrable-context].

Thanks a lot to [Parrable's Chantal Galvez Omaña][chantal] for contributing the
Parrable support to the JavaScript Tracker!

<h3 id="optimizelyx">4.2 OptimizelyX context</h3>

This release also brings support for [OptimizelyX](
https://www.optimizely.com/products/developers/), which supplements the
support for traditional Optimizely
[introduced in version 2.6.0 of the Tracker](
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

The schema for this context is available [in Iglu central][optimizelyx-context].

Note however that if you're planning on leveraging the context's
`variationName`s, you'll have to untick 'Mask descriptive names in project code
and third-party integrations' in the OptimizelyX menu -> Settings -> Privacy.
Otherwise, all variation names will be `null`.

Thanks to [Snowflake Analytics' Mike Robins][mike] for adding the support for
OptimizelyX.

<h2 id="usage">5. Improved usability and other miscellaneous improvements</h2>

In an effort to give you more control, we've exposed a few properties internal
to the tracker such as cookie names, page view ids and domain session indices.

For example, you can retrieve the complete cookie name for the domain cookie
with:

{% highlight javascript %}
window.snowplow_name_here('getCookieName', 'id');
{% endhighlight %}

Same goes for the page view id:

{% highlight javascript %}
window.snowplow_name_here('getPageViewId');
{% endhighlight %}

And the domain session index:

{% highlight javascript %}
window.snowplow_name_here('getDomainSessionIndex');
{% endhighlight %}

In this release, we're also allowing external triggering of the
`activityHandler`. This was motivated by the fact that some events do not
trigger the activity handler despite the user being engaged (e.g. while watching
a video).

You can trigger the activity handler yourself with:

{% highlight javascript %}
window.snowplow_name_here('updatePageActivity');
{% endhighlight %}

This use case and the accompanying implementation was contributed by
[Dean Collins][dean], thanks a lot to him!

A few improvements have also been made to activity tracking in general.

It is now disabled if you don't supply integers to `enableActivityTracking`.
This prevents relentlessly logging page pings if you were to supply an empty
string as `heartBeatDelay`, for example (check issue [#572][572] for more
information).

We are now keeping track of [`setInterval`][set-interval] calls and clearing
them as needed in order to avoid having multiple `setInterval` running at the
same time (check out issue [#571][571] for more details).

<h2 id="upgrade">6. Upgrading</h2>

The tracker is available to use here:

```
http(s)://d1fc8wv8zag5ca.cloudfront.net/2.8.0/sp.js
```

There are no breaking API changes introduced with this release so updating the
tracker should be straightforward.

<h2 id="doc">7. Documentation and help</h2>

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
[parrable-context]: https://raw.githubusercontent.com/snowplow/iglu-central/master/schemas/com.parrable/encrypted_payload/jsonschema/1-0-0
[optimizelyx-context]: https://raw.githubusercontent.com/snowplow/iglu-central/master/schemas/com.optimizely/optimizelyx_summary/jsonschema/1-0-0
[chantal]: https://github.com/chantalgo
[mike]: https://github.com/miike
[dean]: https://github.com/lookaflyingdonkey
[uls]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker-v2.7#2213-configuring-localstorage
[uc]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker-v2.7#2216-disabling-cookies
[sss]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#2214-storage-stategy
[571]: https://github.com/snowplow/snowplow-javascript-tracker/issues/571
[572]: https://github.com/snowplow/snowplow-javascript-tracker/issues/572
[set-interval]: https://www.w3schools.com/jsref/met_win_setinterval.asp
