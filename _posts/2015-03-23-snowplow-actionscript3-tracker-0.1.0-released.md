---
layout: post
shortenedlink: Snowplow ActionScript 3 Tracker 0.1.0 released
title: Snowplow ActionScript3 Tracker 0.1.0 released
tags: [snowplow, analytics, actionscript, flash, actionscript3, as3]
author: Alex
category: Releases
---

We are proud to announce the release of our new [Snowplow ActionScript 3 Tracker] [repo], contributed by Snowplow customer [Viewbix] [viewbix]. This is Snowplow's first customer-contributed tracker - an exciting milestone for us! Huge thanks to Dani, Ephraim, Nati and the team at Viewbix for making this tracker a reality!

The Snowplow ActionScript 3 Tracker supports [ActionScript 3.0] [as3], and lets you add analytics to your Flash Player 9+, Flash Lite 4 and AIR games, apps and widgets.

In the rest of this post we will cover:

1. [How to install the tracker](/blog/2015/03/23/snowplow-actionscript3-tracker-0.1.0-released/#get)
2. [How to use the tracker](/blog/2015/03/23/snowplow-actionscript3-tracker-0.1.0-released/#use)
3. [Getting help](/blog/2015/03/23/snowplow-actionscript3-tracker-0.1.0-released/#help)

<!--more-->

<div class="html">
<h2><a name="get">How to install the tracker</a></h2>
</div>

The release version of this tracker (0.1.0) is available from BinTray, the Python Package Index repository as [snowplow-tracker] [pypi].

If you haven't already, start by downloading and installing the tracker. The easiest way is with pip:

{% highlight bash %}
$ pip install snowplow-tracker --upgrade
{% endhighlight %}

Or with setuptools:

{% highlight bash %}
$ easy_install -U snowplow-tracker
{% endhighlight %}

Please note that we currently only support Python 3.3, but we have plans to add support for earlier Python versions soon.

And that's it! You're now ready to start using the tracker.

<div class="html">
<h2><a name="use">How to use the tracker</a></h2>
</div>

Require the Tracker module in your Python code like so:

{% highlight python %}
from snowplow_tracker.tracker import Tracker
{% endhighlight %}

You are now ready to initialize a tracker instance:

{% highlight python %}
t = Tracker.cloudfront("d3rkrsqld9gmqf") # or...
t = Tracker.hostname("my-company.c.snplow.com")
{% endhighlight %}

Now let's send in a couple of events:

{% highlight python %}
t.track_struct_event("shop", "add-to-basket", None, "pcs", 2, 1369330909)
t.track_page_view("www.example.com", "example", "www.referrer.com")
{% endhighlight %}

And that's it! Please check out the [ActionScript 3.0 Tracker documentation] [tracker-doc] on the wiki for the tracker's full API.

<h2><a name="help">3. Getting help</a></h2>

The ActionScript 3.0 Tracker is a young project and we will be working hard with the community to improve it over the coming weeks and months; in the meantime, do please share any user feedback, feature requests or possible bugs.

Feel free to [get in touch][talk-to-us] or raise an issue in the [ActionScript 3.0 Tracker's issues] [as3-issues] on GitHub!

[viewbix]: http://viewbix.com/

[tracker-doc]: https://github.com/snowplow/snowplow/wiki/Python-Tracker
[repo]: https://github.com/snowplow/snowplow-actionscript3-tracker
[pypi]: https://pypi.python.org/pypi/snowplow-tracker/0.1.0

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues
