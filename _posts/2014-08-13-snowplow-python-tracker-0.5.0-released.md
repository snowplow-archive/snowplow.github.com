---
layout: post
title: Snowplow Python Tracker 0.5.0 released
title-short: Snowplow Python Tracker 0.5.0
tags: [snowplow, analytics, python, django, tracker]
author: Fred
category: Releases
---

We are happy to announce the release of version 0.5.0 of the Snowplow Python Tracker! This release is focused mainly on synchronizing the Python Tracker's support for POST requests with the rest of Snowplow, but also makes its API more consistent.

In this post we will cover:

1. [POST requests](/blog/2014/08/13/snowplow-python-tracker-0.5.0-released/#post)
2. [New feature: multiple emitters](/blog/2014/08/13/snowplow-python-tracker-0.5.0-released/#multiple-emitters)
3. [More consistent API for callbacks](/blog/2014/08/13/snowplow-python-tracker-0.5.0-released/#on-failure)
4. [More consistent API for tracker methods](/blog/2014/08/13/snowplow-python-tracker-0.5.0-released/#return-value)
5. [UUIDs](/blog/2014/08/13/snowplow-python-tracker-0.5.0-released/#uuid)
6. [Bug fix: flushing an empty buffer](/blog/2014/08/13/snowplow-python-tracker-0.5.0-released/#empty-buffer)
7. [Upgrading](/blog/2014/08/13/snowplow-python-tracker-0.5.0-released/#upgrading)
8. [Support](/blog/2014/08/13/snowplow-python-tracker-0.5.0-released/#support)

<!--more-->

<h2><a name="post">1. Updated POST requests</a></h2>

The POST requests sent by the Python Tracker have been changed in three ways:

* All numerical fields (such as event timestamp) are now converted to strings, so that they can be handled by the same logic that handles fields in GET requests
* Instead of being sent to mycollector.cloudfront.com/i, POST requests are now sent to mycollector.cloudfront.com/com.snowplowanalytics.snowplow/tp2 to flag that they use a slightly different tracker protocol from GET requests
* The content-type for POSTs is now set to "application/json; charset=utf-8"

<h2><a name="multiple-emitters">2. New feature: multiple emitters</a></h2>

It is now possible to create a tracker instance which sends events to multiple emitters by supplying an array of emitters to the tracker constructor:

{% highlight python %}
from snowplow_tracker.tracker import Tracker

get_emitter = Emitter("d3rkrsqld9gmqf.cloudfront.net")
post_emitter = Emitter("d3rkrsqld9gmqf.cloudfront.net", method="post")

t = Tracker([get_emitter, post_emitter], namespace="cf", app_id="my-app-id")
{% endhighlight %}

After constructing the tracker, you can add more emitters:

{% highlight python %}
new_emitter = Emitter("drywb53f72ag6j.cloudfront.net")
t.add_emitter(new_emitter)
{% endhighlight %}

All events created by the tracker will be sent all three emitters.

<h2><a name="on-failure">3. More consistent API for callbacks</a></h2>

In version 0.4.0, the Emitter class was introduced. Emitters could be given two callbacks: `on_success` and `on_failure`. Whenever the Emitter's buffer of events was flushed and a request returned with status code not equal to 200, the on_failure callback would be called with two arguments: the number of requests that succeeded, and an object containing the event data for the requests that failed.

The second argument was handled inconsistently. In the case of GET requests, it was an array of dictionaries, each dictionary containing the name-value pairs for an event. In the case of POST requests, it was a stringified JSON.

This release changes the second argument given to the callback in the POST request case to be of the same form as for the GET request case. This means that the same `on_failure` callback function will work with both types of request.

<h2><a name="return-value">4. More consistent API for tracker methods</a></h2>

In version 0.4.0, the value returned by the tracker methods was variable. If the method caused a synchronous request to be sent, the status code of that request was returned. Otherwise, the tracker instance was returned, allowing chained method calls like:

{% highlight python %}
t.track_screen_view("title screen").track_struct_event("products", "viewed product", "magenta paint")
{% endhighlight %}

This version eliminates the former behavior. All tracker methods now return `self`, and so can be safely chained.

<h2><a name="uuid">5. UUIDs</a></h2>

Previous versions of the Tracker sent a random 6-digit transaction ID used by Snowplow to prevent duplication of events. These were not sufficiently unique, so we have replaced them with [version 4 UUIDs][uuid], which becomes the enriched event's `event_id` (instead of generating a new `event_id` in the Snowplow Enrich process).

<h2><a name="empty-buffer">6. Bug fix: flushing an empty buffer</a></h2>

Version 0.4.0 had a bug where flushing an emitter configured to send POST requests when its buffer was empty caused it to send POST request with no events in. This behavior has been eliminated.

<h2><a name="upgrading">7. Upgrading</a></h2>

The release version of this tracker (0.5.0) is available on PyPI, the Python Package Index repository, as [snowplow-tracker] [pypi]. Download and install it with pip:

{% highlight bash %}
$ pip install snowplow-tracker --upgrade
{% endhighlight %}

Or with setuptools:

{% highlight bash %}
$ easy_install -U snowplow-tracker
{% endhighlight %}

For more information on getting started with the Snowplow Python Tracker, see the [setup page] [setup].

<h2><a name="support">8. Support</a></h2>

Please [get in touch] [talk-to-us] if you need help setting up the Snowplow Python Tracker or want to suggest a new feature. You may find the [wiki page][wiki] useful. And [raise an issue] [issues] if you find any bugs!


[repo]: https://github.com/snowplow/snowplow-python-tracker
[uuid]: http://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_.28random.29
[pypi]: https://pypi.python.org/pypi/snowplow-tracker/0.3.0
[setup]: https://github.com/snowplow/snowplow/wiki/Python-tracker-setup
[wiki]: https://github.com/snowplow/snowplow/wiki/Python-Tracker
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues
