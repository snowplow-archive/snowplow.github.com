---
layout: post
title: Snowplow Python Tracker 0.1.0 by wintern Anuj More released
title-short: Snowplow Python Tracker 0.1.0
tags: [snowplow, analytics, python, django, tracker]
author: Alex
category: Releases
---

We are proud to announce the release of our new [Snowplow Python Tracker] [repo], developed by [Snowplow wintern Anuj More] [anuj-intro]. Anuj was one of our two remote interns this winter, joining the Snowplow team from his base in Mumbai to work on making it easy to send events to Snowplow from Python environments.

The Snowplow Python Tracker is a simple [PyPI-hosted] [pypi] client library for Snowplow, designed to send raw Snowplow events to a Snowplow collector. Use this tracker to add analytics to your Python and Django apps, webapps and games.

In Anuj's own words:

![anuj-img] [anuj-img]

In the rest of this post we will cover:

1. [How to install the tracker](/blog/2014/03/28/snowplow-python-tracker-0.1.0-released/#get)
2. [How to use the tracker](/blog/2014/03/28/snowplow-python-tracker-0.1.0-released/#usage)
3. [Roadmap](/blog/2014/03/28/snowplow-python-tracker-0.1.0-released/#roadmap)
4. [Thanks](/blog/2014/03/28/snowplow-python-tracker-0.1.0-released/#thanks)

<!--more-->

<div class="html">
<h2><a name="get">How to install the tracker</a></h2>
</div>

The release version of this tracker (0.1.0) is available on PyPI, the Python Package Index repository as [snowplow-tracker] [pypi].

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
<h2><a name="usage">How to use the tracker</a></h2>
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

And that's it! Please check out the [Python Tracker documentation] [tracker-doc] on the wiki for the tracker's full API.

<div class="html">
<h2><a name="roadmap">Roadmap</a></h2>
</div>

We have big plans for the Snowplow Python Tracker, including but not limited to:

* Adding support for more Python versions
* Improving the public API
* Adding extra functionality currently only found in our JavaScript Tracker
* Adding support for batched send of multiple events (e.g. via Redis)

If there are other features you would like to see, feel free to [add an issue] [issues] to the repository.

<div class="html">
<h2><a name="thanks">Thanks</a></h2>
</div>

And that's it; huge thanks to Anuj More for his work taking the Snowplow Python Tracker from a concept to a packaged initial release! This was Anuj's first professional development work in Python - and a hugely important release for us.

We hope that you find the Snowplow Python Tracker helpful - it is still very young, so don't be afraid to [get in touch] [talk-to-us] and let us know what features you would like us to add next. And of course, do [raise an issue] [issues] if you spot any bugs!

[anuj-intro]: /blog/2013/12/20/introducing-our-snowplow-winterns/
[anuj-img]: /assets/img/blog/2014/03/anuj-python-tracker.png

[tracker-doc]: https://github.com/snowplow/snowplow/wiki/Python-Tracker
[repo]: https://github.com/snowplow/snowplow-python-tracker
[pypi]: https://pypi.python.org/pypi/snowplow-tracker/0.1.0

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues
