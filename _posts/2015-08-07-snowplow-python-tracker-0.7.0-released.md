---
layout: post
title: Snowplow Python Tracker 0.7.0 released
title-short: Snowplow Python Tracker 0.7.0
tags: [snowplow, analytics, python, django, tracker]
author: Fred
category: Releases
---

We are pleased to announce the release of [version 0.7.0] [pypi] of the Snowplow Python Tracker. This release is focused on making the Tracker more robust.

The rest of this post will cover:

1. [Better concurrency](/blog/2015/08/07/snowplow-python-tracker-0.7.0-released/#threads)
2. [Better error handling](/blog/2015/08/07/snowplow-python-tracker-0.7.0-released/#errors)
3. [The SelfDescribingJson class](/blog/2015/08/07/snowplow-python-tracker-0.7.0-released/#)
4. [Unicode support](/blog/2015/08/07/snowplow-python-tracker-0.7.0-released/#unicode)
5. [Upgrading](/blog/2015/08/07/snowplow-python-tracker-0.7.0-released/#upgrading)
6. [Getting help](/blog/2015/08/07/snowplow-python-tracker-0.7.0-released/#help)

<!--more-->

<h2 id="threads">1. Better concurrency</h2>

The Python Tracker's AsyncEmitter now uses the [Queue][queue] class to implement the producer-consumer pattern where a fixed pool of threads work on sending events. Reusing threads this way performs better than the previous implementation in which a new thread was created for every network request.

You can configure the number of threads to use with the new `thread_count` keyword argument of the AsyncEmitter's constructor. If your application only rarely sends events, the default of 1 thread should be good enough; otherwise try experimenting with different values to determine which works best.

We have also eliminated a race condition where sending many events at once could cause events to be duplicated or skipped.

<h2 id="errors">2. Better error handling</h2>

The previous Tracker version only treated requests with status code 200 as successful. This behavior has been broadened to include all 2xx and 3xx status codes.

If a request causes a network-related exception, the Tracker will now catch that exception and treat the request as failed. This means that network unavailability will no longer cause the Tracker to throw an exception.

<h2 id="selfDescribingJson">3. The SelfDescribingJson class</h2>

The new `SelfDescribingJson` class is used to make building unstructured events and custom contexts more straightforward.

So instead of fully specifying the JSON you wish to send like this:

{% highlight python %}
my_event = {
	'schema': 'iglu:com.acme/myevent/jsonschema/1-0-0',
	'data': {
		'color': 'red'
	}
}
my_context = {
	'schema': 'iglu:com.acme/mycontext/jsonschema/1-0-1',
	'data': {
		'size': 5
	}
}
my_tracker.track_unstruct_event(my_event, [my_context])
{% endhighlight %}

you would now use the `SelfDescribingJson` class to automatically handle the "schema" and "data" fields like this:

{% highlight python %}
from snowplow_tracker import SelfDescribingJson
my_event = SelfDescribingJson(
	'iglu:com.acme/myevent/jsonschema/1-0-0',
	{
		'color': 'red'
	}
)

my_context = SelfDescribingJson(
	'iglu:com.acme/mycontext/jsonschema/1-0-0',
	{
		'size': 5
	}
)

my_tracker.track_unstruct_event(my_event, [my_context])
{% endhighlight %}

**WARNING:** This is a breaking change and old-style API calls which manually construct unstructured events and custom contexts will no longer work.

<h2 id="unicode">4. Unicode support</h2>

Michael Thomas ([@mthomas][mthomas] on GitHub) made the Tracker compatible with Python 2.x's unicode strings. Many thanks Michael!

<h2><a name="upgrading">5. Upgrading</a></h2>

To add the Snowplow Tracker as a dependency to your own Python app, edit your `requirements.txt` and add:

{% highlight python %}
snowplow-tracker ~> 0.7.0
{% endhighlight %}

If you are upgrading from the previous version, note that the AsyncEmitter's new default of a single worker thread may not be fast enough. If this is the case then you may want to experiment with configuring different numbers of worker threads.

You will need to update all unstructured events and contexts using the `SelfDescribingJson` class as described above.

Finally, note that synchronously flushing the AsyncEmitter from inside an `on_success` or `on_failure` callback can now lead to deadlock. This is because these callbacks get executed by the worker threads. You can avoid deadlock by performing the flush in a different thread, but it shouldn't be necessary to do a synchronous flush in a callback at all.

<h2 id="help">6. Getting help</h2>

Useful links:

* The [technical documentation][wiki]
* The [0.7.0 release notes][tracker-070]
* The [package on PyPI][pypi]

If you have an idea for a new feature or want help getting things set up, please [get in touch] [talk-to-us]. And of course [raise an issue] [issues] if you spot any bugs!

[mthomas]: https://github.com/mthomas
[queue]: https://docs.python.org/3/library/queue.html

[repo]: https://github.com/snowplow/snowplow-python-tracker
[pypi]: https://pypi.python.org/pypi/snowplow-tracker/0.6.0.post1
[setup]: https://github.com/snowplow/snowplow/wiki/Python-tracker-setup
[wiki]: https://github.com/snowplow/snowplow/wiki/Python-Tracker
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues

[tracker-070]: https://github.com/snowplow/snowplow-python-tracker/releases/tag/0.7.0
