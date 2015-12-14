---
layout: post
title: Snowplow Python Tracker 0.4.0 released
title-short: Snowplow Python Tracker 0.4.0
tags: [snowplow, analytics, python, django, tracker]
author: Fred
category: Releases
---

We are happy to announce the release of the Snowplow Python Tracker version 0.4.0.

This version introduces the Subject class, which lets you keep track of multiple users at once, and several Emitter classes, which let you send events asynchronously, pass them to a Celery worker, or even send them to a Redis database. We have added support for sending batches of events in POST requests, although the Snowplow collectors do not yet support POST requests.

We have also made changes to the format of unstructured events and custom contexts, to support our new work around [self-describing JSON Schemas] [self-describing].

In the rest of the post we will cover:

1. [The Subject class](/blog/2014/06/10/snowplow-python-tracker-0.4.0-released/#subject)
2. [The Emitter classes](/blog/2014/06/10/snowplow-python-tracker-0.4.0-released/#emitter)
3. [Tracker method return values](/blog/2014/06/10/snowplow-python-tracker-0.4.0-released/#return)
4. [Logging](/blog/2014/06/10/snowplow-python-tracker-0.4.0-released/#logging)
5. [Pycontracts](/blog/2014/06/10/snowplow-python-tracker-0.4.0-released/#contracts)
6. [The RedisWorker class](/blog/2014/06/10/snowplow-python-tracker-0.4.0-released/#worker)
7. [Self-describing JSONs](/blog/2014/06/10/snowplow-python-tracker-0.4.0-released/#schemas)
8. [Upgrading](/blog/2014/06/10/snowplow-python-tracker-0.4.0-released/#upgrading)
9. [Support](/blog/2014/06/10/snowplow-python-tracker-0.4.0-released/#support)

<!--more-->

<h2><a name="subject">1. The Subject class</a></h2>

An instance of the Subject class represents a user who is performing an event in the **Subject**-**Verb**-**Direct Object** model proposed in our [Snowplow event grammar] [event-grammar]. Although you can create a Tracker instance without a Subject, you won't be able to add information such as user ID and timezone to your events without one.

If you are tracking more than one user at once, create a separate Subject instance for each. An example:

{% highlight python %}
from snowplow_tracker import Subject, Emitter, Tracker

# Create a simple Emitter which will log events to http://d3rkrsqld9gmqf.cloudfront.net/i
e = Emitter("d3rkrsqld9gmqf.cloudfront.net")

# Create a Tracker instance
t = Tracker(emitter=e, namespace="cf", app_id="CF63A")

# Create a Subject corresponding to a pc user
s1 = Subject()

# Set some data for that user
s1.set_platform("pc")
s1.set_user_id("0a78f2867de")

# Set s1 as the Tracker's subject
# All events fired will have the information we set about s1 attached
t.set_subject(s1)

# Track user s1 viewing a page
t.track_page_view("http://www.example.com")

# Create another Subject instance corresponding to a mobile user
s2 = Subject()

# All methods of the Subject class return the Subject instance so methods can be chained:
s2.set_platform("mob").set_user_id("0b08f8be3f1")

# Change the tracker subject from s1 to s2
# All events fired will have instead have information we set about s2 attached
t.set_subject(s2)

# Track user s2 viewing a page
t.track_page_view("http://www.example.com")

{% endhighlight %}

It is also possible to set the subject during Tracker initialization:

{% highlight python %}
t = Tracker(emitter=e, subject=s1, namespace="cf", app_id="CF63A")
{% endhighlight %}

<h2><a name="emitter">2. The Emitter classes</a></h2>

Trackers must be initialized with an Emitter.

This is the signature of the constructor for the base Emitter class:

{% highlight python %}
def __init__(self, endpoint,
             protocol="http", port=None, method="get",
             buffer_size=None, on_success=None, on_failure=None):
{% endhighlight %}

The only field which must be set is the `endpoint`, which is the collector to which the emitter logs events. `port` is the port to connect to, `protocol` is either `"http"` or `"https"`, and `method` is either "get" or "post".

When the emitter receives an event, it adds it to a buffer. When the queue is full, all events in the queue get sent to the collector. The buffer_size argument allows you to customize the queue size. By default, it is 1 for GET requests and 10 for POST requests. If the emitter is configured to send POST requests, then instead of sending one for every event in the buffer, it will send a single request containing all those events in JSON format.

`on_success` is an optional callback that will execute whenever the queue is flushed successfully, that is, whenever every request sent has status code 200. It will be passed one argument: the number of events that were sent.

`on_failure` is similar, but executes when the flush is not wholly successful. It will be passed two arguments: the number of events that were successfully sent, and an array of unsent requests.

<h3>AsyncEmitter</h3>

The AsyncEmitter class works just like the base Emitter class, but uses threads, allowing it to send HTTP requests in a non-blocking way.

<h3>CeleryEmitter</h3>

The CeleryEmitter class works just like the base Emitter class, but it registers sending requests as a task for a [Celery][celery] worker. If there is a module named snowplow_celery_config.py on your `PYTHONPATH`, it will be used as the Celery configuration file; otherwise, a default configuration will be used. You can run the worker using this command:

{% highlight bash %}
celery -A snowplow_tracker.emitters worker --loglevel=debug
{% endhighlight %}

Note that `on_success` and `on_failure` callbacks cannot be supplied to this emitter.

<h3>RedisEmitter</h3>

Use a RedisEmitter instance to store events in a [Redis][redis] database for later use. This is the RedisEmitter constructor function:

{% highlight python %}
def __init__(self, rdb=None, key="snowplow"):
{% endhighlight %}

`rdb` should be an instance of either the `Redis` or `StrictRedis` class, found in the redis module. If it is not supplied, a default will be used. `key` is the key used to store events in the database. It defaults to "snowplow". The format for event storage is a Redis list of JSON strings.

<h3>Flushing</h3>

You can flush the buffer of an emitter associated with a tracker instance `t` like this:

{% highlight python %}
t.flush()
{% endhighlight %}

This synchronously sends all events in the emitter's buffer.

<h3>Custom emitters</h3>

You can create your own custom emitter class, either from scratch or by subclassing one of the existing classes. The only requirement for compatibility is that is must have an `input` method which accepts a Python dictionary of name-value pairs.

<h2><a name="return">3. Tracker method return values</a></h2>

If you are using the synchronous Emitter and call a tracker method which causes the emitter to send a request, that tracker method will return the status code for the request:

{% highlight python %}
e = Emitter("d3rkrsqld9gmqf.cloudfront.net")
t = Tracker(e)

print(t.track_page_view("http://www.example.com")) # Prints 200
{% endhighlight %}

This is useful for initial testing.

Otherwise, the tracker method will return the tracker instance, allowing tracker methods to be chained:

{% highlight python %}
e = AsyncEmitter("d3rkrsqld9gmqf.cloudfront.net")
t = Tracker(e)

t.track_page_view("http://www.example.com").track_screen_view("title screen")
{% endhighlight %}

The `set_subject` method will always return the Tracker instance.

<h2><a name="logging">4. Logging</a></h2>

The emitters.py module has Python logging turned on. The logger prints messages about what emitters are doing. By default, only messages with priority "INFO" or higher will be logged.

To change this:

{% highlight python %}
from snowplow_tracker import logger

# Log all messages, even DEBUG messages
logger.setLevel(10)

# Log only messages with priority WARN or higher
logger.setLevel(30)

# Turn off all logging
logger.setLevel(60)
{% endhighlight %}

<h2><a name="contracts">5. Pycontracts</a></h2>

The Snowplow Python Tracker uses the [Pycontracts][contracts] module for type checking. The option to turn type checking off has been moved out of Tracker construction:

{% highlight python %}
from snowplow_tracker import disable_contracts
disable_contracts()
{% endhighlight %}

Switch off Pycontracts to improve performance in production.

<h2><a name="worker">6. The RedisWorker class</a></h2>

The tracker comes with a RedisWorker class which sends Snowplow events from Redis to an emitter. The RedisWorker constructor is similar to the RedisEmitter constructor:

{% highlight python %}
def __init__(self, _consumer, key=None, dbr=None):
{% endhighlight %}

This is how it is used:

{% highlight python %}
from snowplow_tracker import AsyncEmitter
from snowplow_tracker.redis_worker import RedisWorker

e = Emitter("d3rkrsqld9gmqf.cloudfront.net")

r = RedisWorker(e, key="snowplow_redis_key")

r.run()

{% endhighlight %}

This will set up a worker which will run indefinitely, taking events from the Redis list with key "snowplow_redis_key" and inputting them to an AsyncEmitter, which will send them to a Collector. If the process receives a SIGINT signal (for example, due to a Ctrl-C keyboard interrupt), cleanup will occur before exiting to ensure no events are lost.

<h2><a name="schemas">7. Self-describing JSONs</a></h2>

Snowplow unstructured events and custom contexts are now defined using [JSON schema][json-schema], and should be passed to the Tracker using [self-describing JSONs][self-describing-jsons]. Here is an example of the new format for unstructured events:

{% highlight python %}

t.track_unstruct_event({
	"schema": "iglu:com.acme/viewed_product/jsonschema/2-1-0",
	"data": {
		"product_id": "ASO01043",
		"price": 49.95
	}
})

{% endhighlight %}

The `data` field contains the actual properties of the event and the `schema` field points to the JSON schema against which the contents of the `data` field should be validated. The `data` field should be flat, rather than nested.

Custom contexts work similarly. Since and event can have multiple contexts attached, the `contexts` argument of each `trackXXX` method must (if provided) be a non-empty array:

{% highlight python %}

t.track_page_view("localhost", None, "http://www.referrer.com", [{
    schema: "iglu:com.example_company/page/jsonschema/1-2-1",
    data: {
        pageType: 'test',
        lastUpdated: new Date(2014,1,26)
    }
},
{
    schema: "iglu:com.example_company/user/jsonschema/2-0-0",
    data: {
      userType: 'tester'
    }
}])

{% endhighlight %}

The above example shows a page view event with two custom contexts attached: one describing the page and another describing the user.

As part of this change we have also removed type hint suffices from unstructured events and custom contexts. Now that JSON schemas are responsible for type checking, there is no need to include types a a part of field names.

<h2><a name="upgrading">8. Upgrading</a></h2>

The release version of this tracker (0.4.0) is available on PyPI, the Python Package Index repository, as [snowplow-tracker] [pypi]. Download and install it with pip:

{% highlight bash %}
$ pip install snowplow-tracker --upgrade
{% endhighlight %}

Or with setuptools:

{% highlight bash %}
$ easy_install -U snowplow-tracker
{% endhighlight %}

For more information on getting started with the Snowplow Python Tracker, see the [setup page] [setup].

<h2><a name="support">9. Support</a></h2>

Please [get in touch] [talk-to-us] if you need help setting up the Snowplow Python Tracker or want to suggest a new feature. The Snowplow Python Tracker is still young, so of course do [raise an issue] [issues] if you find any bugs.

For more details on this release, please check out the [0.4.0 Release Notes] [release-040] on GitHub.

[self-describing]: /blog/2014/06/06/making-snowplow-schemas-flexible-a-technical-approach/
[event-grammar]: /blog/2013/08/12/towards-universal-event-analytics-building-an-event-grammar/

[73]: https://github.com/snowplow/snowplow-python-tracker/issues/73
[36]: https://github.com/snowplow/snowplow-python-tracker/issues/36

[celery]: http://www.celeryproject.org/
[redis]: http://redis.io/
[json-schema]: http://json-schema.org/
[self-describing-jsons]: http://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/

[repo]: https://github.com/snowplow/snowplow-python-tracker
[contracts]: https://github.com/AndreaCensi/contracts
[wiki]: https://github.com/snowplow/snowplow/wiki/Python-Tracker
[pypi]: https://pypi.python.org/pypi/snowplow-tracker/0.4.0
[setup]: https://github.com/snowplow/snowplow/wiki/Python-tracker-setup
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues
[release-040]: https://github.com/snowplow/snowplow-python-tracker/releases/tag/0.4.0
