---
layout: post
title: Snowplow JavaScript Tracker 1.0.0 released
title-short: Snowplow JavaScript Tracker 1.0.0
tags: [snowplow, javascript, tracker]
author: Fred
category: Releases
---

We are pleased to announce the release of the [Snowplow JavaScript Tracker version 1.0.0] [100-release].

This release adds new options for user fingerprinting and makes some minor changes to the Tracker API. In addition, we have moved to a module-based project structure and added automated testing.

This post will cover the following topics:

1. [New feature: user fingerprint options](/blog/2014/03/27/snowplow-javascript-tracker-1.0.0-released/#hash)
2. [Changes to the Snowplow API](/blog/2014/03/27/snowplow-javascript-tracker-1.0.0-released/#api)
3. [Move to modules](/blog/2014/03/27/snowplow-javascript-tracker-1.0.0-released/#modules)
4. [Automated testing](/blog/2014/03/27/snowplow-javascript-tracker-1.0.0-released/#tests)
5. [Removed deprecated functionality](/blog/2014/03/27/snowplow-javascript-tracker-1.0.0-released/#deprecated)
6. [Other structural improvements](/blog/2014/03/27/snowplow-javascript-tracker-1.0.0-released/#structure)
7. [Upgrading](/blog/2014/03/27/snowplow-javascript-tracker-1.0.0-released/#upgrading)
8. [Getting help](/blog/2014/03/27/snowplow-javascript-tracker-1.0.0-released/#help)

<!--more-->

<div class="html">
<h2><a name="hash">1. New feature: user fingerprint options</a></h2>
</div>

The Snowplow JavaScript Tracker uses a "user fingerprint" to identify users based on various features of their browser.

This version adds two new functions to control user fingerprinting: `enableUserFingerprinting` and `setUserFingerprintSeed`.

{% highlight javascript %}
function enableUserFingerprinting(enable)

function setUserFingerprintSeed(seed)
{% endhighlight %}

User fingerprinting is turned on by default, but can be turned off like this:

{% highlight javascript %}
_snaq.push(['enableUserFingerprinting', false]);
{% endhighlight %}

If you want to choose the seed used to generate the user fingerprint, use `setUserFingerprintSeed` like this:

{% highlight javascript %}
_snaq.push(['setUserFingerprintSeed', 746392851]);
{% endhighlight %}

If you do not set a custom hash seed, the default seed will be used instead.

<div class="html">
<h2><a name="api">2. Changes to the Snowplow API</a></h2>
</div>

The move to modules has allowed us to tighten our public API, making our helper functions private.

In addition, the global `SnowPlow` object has been renamed to `Snowplow`. This will only affect users who have implemented the synchronous tracker.

<div class="html">
<h2><a name="modules">3. Move to modules</a></h2>
</div>

We have organised our code into modules using [Browserify] [browserify]. Browserify recursively analyzes the dependencies of the Tracker and combines all the required modules into a single bundle. This allowed us to replace much of our code with external [npm] [npm] modules and a minimal [lodash] [lodash] library.

<div class="html">
<h2><a name="tests">4. Automated testing</a></h2>
</div>

We have started to use [Intern] [intern] for non-functional testing of our asynchronous queue and payload builder modules. We have also added [Travis CI] [travis] to the project. Travis runs the Intern tests every time the Javascript Tracker repository is altered, preventing errors from going unnoticed. We plan to expand the test suite to include functional tests in coming versions.

<div class="html">
<h2><a name="deprecated">5. Removed deprecated functionality</a></h2>
</div>

Five deprecated functions have been removed:

* `attachUserId` is removed because there is no longer any need to enable or disable specific user IDs
* `setSiteId` should be replaced with `setAppId`
* `getVisitorId` should be replaced with `getDomainUserId`
* `getVisitorInfo` should be replaced with `getDomainUserInfo`
* `trackEvent` should be replaced with `getStructEvent`, the new name for this

Finally, `trackImpression` has been deprecated in preparation for the addition of an all-new `trackAdImpression` in a coming version.

<div class="html">
<h2><a name="structure">6. Other structural improvements</a></h2>
</div>

We have also:

* Added meta-data to our package.json including a description and keywords [#83] [83]
* Moved the banner into our Gruntfile and dynamically templated in information from our package.json [#82] [82]
* Removed the legacy Piwik plugin framework [#56] [56]
* Named our Grunt tasks [#86] [86]
* Added a "Built with Grunt" badge to the README [#102] [102]
* Relocated some helper functions for consistency [#91] [91]

<div class="html">
<h2><a name="upgrading">7. Upgrading </a></h2>
</div>

**UPDATED** After an important post-release bug fix, the updated minified tracker is available here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/1.0.1/sp.js

If you use the path:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/1/sp.js

then you will automatically get new semantic-minor versions and patches as they are released.

<div class="html">
<h2><a name="help">8. Getting help</a></h2>
</div>

Check out the [v1.0.0 release page] [100-release] on GitHub for the full list of changes made in this version.

As always, if you run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[100-release]: https://github.com/snowplow/snowplow-javascript-tracker/releases/tag/1.0.0
[contexts]: http://snowplowanalytics.com/blog/2014/01/27/snowplow-custom-contexts-guide/
[browserify]: http://browserify.org/
[npm]: https://www.npmjs.org/
[lodash]: http://lodash.com/
[intern]: http://theintern.io/
[travis]: https://travis-ci.org/

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

[83]: https://github.com/snowplow/snowplow-javascript-tracker/issues/83
[82]: https://github.com/snowplow/snowplow-javascript-tracker/issues/82
[56]: https://github.com/snowplow/snowplow-javascript-tracker/issues/56
[91]: https://github.com/snowplow/snowplow-javascript-tracker/issues/91
[86]: https://github.com/snowplow/snowplow-javascript-tracker/issues/86
[102]: https://github.com/snowplow/snowplow-javascript-tracker/issues/102
