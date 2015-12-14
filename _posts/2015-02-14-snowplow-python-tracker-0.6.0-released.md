---
layout: post
title: Snowplow Python Tracker 0.6.0 released
title-short: Snowplow Python Tracker 0.6.0
tags: [snowplow, analytics, python, django, tracker]
author: Fred
category: Releases
---

We are pleased to announce the release of [version 0.6.0.post1] [pypi] of the Snowplow Python Tracker. This version adds several methods to help identify users by adding client-side data to events. This makes the Tracker more powerful when used in conjunction with a web framework such as [Django][django] or [Flask][flask].

The rest of this post will cover:

1. [set_ip_address](/blog/2015/02/14/snowplow-python-tracker-0.6.0-released/#ip)
2. [set_useragent_user_id](/blog/2015/02/14/snowplow-python-tracker-0.6.0-released/#ua)
3. [set_domain_user_id](/blog/2015/02/14/snowplow-python-tracker-0.6.0-released/#nuid)
4. [set_network_user_id](/blog/2015/02/14/snowplow-python-tracker-0.6.0-released/#duid)
5. [Improved logging](/blog/2015/02/14/snowplow-python-tracker-0.6.0-released/#logging)
6. [Upgrading and compatibility](/blog/2015/02/14/snowplow-python-tracker-0.6.0-released/#upgrading-compatibility)
7. [Other changes](/blog/2015/02/14/snowplow-python-tracker-0.6.0-released/#other)
8. [Getting help](/blog/2015/02/14/snowplow-python-tracker-0.6.0-released/#help)

<!--more-->

<h2><a name="ip">1. set_ip_address</a></h2>

The `ip_address` field in the Snowplow event model is used to look up information about a user's geographical location among other things. If you have access to a user's IP address, you can add it to all events concerning that user with the `set_ip_address` method:

{% highlight python %}
subject.set_ip_address("37.157.33.93")
{% endhighlight %}

<h2><a name="ua">2. set_useragent</a></h2>

The `useragent` field contains information (sometimes called the "browser string") about the user's browser. You can set this field with the `set_useragent` method:

{% highlight python %}
subject.set_useragent("Mozilla/5.0 (Windows NT 5.1; rv:23.0) Gecko/20100101 Firefox/23.0")
{% endhighlight %}

<h2><a name="duid">3. set_domain_user_id</a></h2>

The `domain_userid` field in the Snowplow event model refers to the user ID set by the [Snowplow JavaScript Tracker][js-tracker] and stored in the [ID cookie][id-cookie]. If you extract that ID, you can use the `set_domain_user_id` method to associate a subject with it:

{% highlight python %}
subject.set_domain_user_id("c7aadf5c60a5dff9")
{% endhighlight %}

This is useful if you are tracking events both server-side and client-side and want to know when they concern the same user.

<h2><a name="nuid">4. set_network_user_id</a></h2>

The `network_userid` field is a user ID set by Snowplow's [Clojure Collector][clojure-collector] and [Scala Stream Collector][ssc] via a third party cookie. Similarly to the `set_domain_user_id` method, the `set_network_user_id` lets you associate a subject with a network user ID:

{% highlight python %}
subject.set_network_user_id("ecdff4d0-9175-40ac-a8bb-325c49733607")
{% endhighlight %}

<h2><a name="logging">5. Improved logging</a></h2>

The tracker now logs the endpoint to which events are being sent and, at debug level, each individual event. This brings logging up to par with the [Ruby Tracker][ruby-tracker].

<h2><a name="other">6. Other changes</a></h2>

Some other improvements have been made to the Python Tracker:

* We have eliminated unnecessary whitespace from the JSON body of POST requests ([issue #110][issue-110])
* Unicode characters in unstructured events and custom contexts are now preserved rather than converted to ASCII ([issue #123][issue-123])
* We have added more integration tests for POST requests ([issue #122][issue-122])

<h2><a name="upgrading-and-compatibility">7. Upgrading and compatibility</a></h2>

To add the Snowplow Tracker as a dependency to your own Python app, edit your `requirements.txt` and add:

{% highlight python %}
snowplow-tracker ~> 0.6.0.post1
{% endhighlight %}

This version increases the schema version for the JSON holding your custom contexts to 1-0-1 and the schema for all POST request payloads to 1-0-2. **These schema versions aren't supported by versions of Snowplow before 0.9.14, so please upgrade if you have not already.**

<h2><a name="help">8. Getting help</a></h2>

Useful links:

* The [technical documentation][wiki]
* The [0.6.0.post1 release notes][tracker-060]
* The [package on PyPI][pypi]

If you have an idea for a new feature or want help getting things set up, please [get in touch] [talk-to-us]. And [raise an issue] [issues] if you spot any bugs!

[django]: https://www.djangoproject.com/
[flask]: http://flask.pocoo.org/

[repo]: https://github.com/snowplow/snowplow-python-tracker
[uuid]: http://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_.28random.29
[pypi]: https://pypi.python.org/pypi/snowplow-tracker/0.6.0.post1
[setup]: https://github.com/snowplow/snowplow/wiki/Python-tracker-setup
[wiki]: https://github.com/snowplow/snowplow/wiki/Python-Tracker
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues
[js-tracker]: https://github.com/snowplow/snowplow-javascript-tracker
[clojure-collector]: https://github.com/snowplow/snowplow/wiki/Clojure-collector
[ssc]: https://github.com/snowplow/snowplow/wiki/Scala-Stream-Collector
[ruby-tracker]: https://github.com/snowplow/snowplow-ruby-tracker
[id-cookie]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#the-id-cookie
[iplookups]: https://github.com/snowplow/scala-maxmind-iplookups

[tracker-060]: https://github.com/snowplow/snowplow-python-tracker/releases/tag/0.6.0.post1

[issue-110]: https://github.com/snowplow/snowplow-python-tracker/issues/110
[issue-122]: https://github.com/snowplow/snowplow-python-tracker/issues/122
[issue-123]: https://github.com/snowplow/snowplow-python-tracker/issues/123
