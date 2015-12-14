---
layout: post
title: Snowplow JavaScript Tracker 0.14.0 released with new features
title-short: Snowplow JavaScript Tracker 0.14.0
tags: [snowplow, javascript, tracker]
author: Fred
category: Releases
---


*Alex writes: this is the first blog post - and code release - by Snowplow "springtern" Fred Blundun. Stay tuned for another blog post soon introducing Fred!*

We are pleased to announce the release of the [Snowplow JavaScript Tracker version 0.14.0] [0140-release].

In this release we have introduced some new tracking options and compressed our tracker for better load times. We have also updated our build process to use [Grunt] [grunt].

This blog post will cover the following changes:

1. [New feature: gzipping](/blog/2014/02/12/snowplow-javascript-tracker-0.14.0-released/#gzipping)
2. [New feature: set user ID from a cookie](/blog/2014/02/12/snowplow-javascript-tracker-0.14.0-released/#cookie)
3. [New feature: set user ID from a querystring](/blog/2014/02/12/snowplow-javascript-tracker-0.14.0-released/#querystring)
4. [New feature: pass a referrer through an iframe](/blog/2014/02/12/snowplow-javascript-tracker-0.14.0-released/#iframe)
5. [New feature: respecting Do Not Track](/blog/2014/02/12/snowplow-javascript-tracker-0.14.0-released/#donottrack)
6. [New build process](/blog/2014/02/12/snowplow-javascript-tracker-0.14.0-released/#grunt)
7. [Other structural improvements](/blog/2014/02/12/snowplow-javascript-tracker-0.14.0-released/#structure)
8. [Upgrading](/blog/2014/02/12/snowplow-javascript-tracker-0.14.0-released/#gzipping)
9. [Getting help](/blog/2014/02/12/snowplow-javascript-tracker-0.14.0-released/#gzipping)

<!--more-->

<div class="html">
<h2><a name="gzipping">1. New feature: gzipping</a></h2>
</div>

Our hosted JavaScript JavaScript Tracker is now gzipped for CloudFront delivery using a Grunt plugin. This decreases the file size by about 70%, improving load times and perceived website speed. All modern browsers support gzipping ([reference] [gzip-browsers]).

<div class="html">
<h2><a name="cookie">2. New feature: set user ID from a cookie</a></h2>
</div>

This new function allows you to set the visitor's business user ID to the value of a first-party cookie. Its signature is:

{% highlight javascript %}
function setUserIdFromCookie(cookieName);
{% endhighlight %}

For example, this code:

{% highlight javascript %}
_snaq.push(['setUserIdFromCookie', '_sp_id.4209']);
{% endhighlight %}

will look for a cookie whose name is "_sp_id.4209". If one is found, the user ID will be set to the value of that cookie.

<div class="html">
<h2><a name="querystring">3. New feature: set user ID from a querystring</a></h2>
</div>

We have added support for setting the visitor's business user ID from a field in the querystring of either the current page's URL or the referring page's URL.
The signatures for the new functions are:

{% highlight javascript %}
function setUserIdFromLocation(querystringField);
function setUserIdFromReferrer(querystringField);
{% endhighlight %}

For example, to set the user's ID to the value of the "id" field in the local querystring, use:

{% highlight javascript %}
_snaq.push([['setUserIdFromLocation', 'id']]);
{% endhighlight %}

And to set it to the value of the "id" field in the referrer querystring, use:

{% highlight javascript %}
_snaq.push([['setUserIdFromReferrer', 'id']]);
{% endhighlight %}

<div class="html">
<h2><a name="iframe">4. New feature: pass a referrer through an iframe</a></h2>
</div>

You can now pass the referrer back to Snowplow from inside an iframe. To do this, set `referrer=x` in the querystring of the iframe's URL, where 'x' is the required referrer. This also works if you set `referer=x` (with one 'r').

Many thanks to community member [Josh Spivey] [joshspivey] for this idea and some suggested code!

<div class="html">
<h2><a name="donottrack">5. New feature: respecting Do Not Track</a></h2>
</div>

Most browsers offer a Do Not Track feature, allowing users to request not to be tracked by websites. You can now respect that preference with:

{% highlight javascript %}
function respectDoNotTrack(enable);
{% endhighlight %}

Use this function like so:

{% highlight javascript %}
_snaq.push(['respectDoNotTrack', true]);
{% endhighlight %}

If the browser's Do Not Track feature is enabled, the above code will prevent the Snowplow JavaScript Tracker from either setting first-party cookies or sending events to a collector.

<div class="html">
<h2><a name="grunt">6. Switched to Grunt-based build process</a></h2>
</div>

We have replaced our custom `snowpak.sh` Bash script with a standardised [Grunt] [grunt] file. This let us use Grunt plugins to automate the build process, from file concatentation and YUI Compression through to uploading to S3 and CloudFront invalidation.

It should also help us move to a more modular project structure and add a test suite in the [next release] [100-issues].

<div class="html">
<h2><a name="structure">7. Other structural improvements</a></h2>
</div>

We have also:

* Moved cookie-related functionality into a new file [(#77)] [77]
* Moved requestStringBuilder into a new file [(#55)] [55]
* Moved functions to detect browser attributes into a new file [(#37)] [37]
* Removed getLegacyCookieName [(#50)] [50]
* Removed the legacy Piwik debug code [(#65)] [65]

<div class="html">
<h2><a name="upgrading">8. Upgrading </a></h2>
</div>

The upgraded minified tracker is available here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/0.14.0/sp.js

If you are currently using the path:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/0/sp.js

then you will get the new version automatically.

<div class="html">
<h2><a name="help">9. Getting help </a></h2>
</div>

Check out the [v0.14.0 release page] [0140-release] on GitHub for the full list of changes made in this version.

As always, if you run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[gzip-browsers]: http://webmasters.stackexchange.com/questions/22217/which-browsers-handle-content-encoding-gzip-and-which-of-them-has-any-special

[0140-release]: https://github.com/snowplow/snowplow-javascript-tracker/releases/tag/0.14.0
[100-issues]: https://github.com/snowplow/snowplow-javascript-tracker/issues?milestone=4&page=1&state=open

[joshspivey]: https://github.com/joshspivey

[grunt]: [http://gruntjs.com/

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

[77]: https://github.com/snowplow/snowplow-javascript-tracker/issues/77
[55]: https://github.com/snowplow/snowplow-javascript-tracker/issues/55
[37]: https://github.com/snowplow/snowplow-javascript-tracker/issues/37
[50]: https://github.com/snowplow/snowplow-javascript-tracker/issues/50
[65]: https://github.com/snowplow/snowplow-javascript-tracker/issues/65
