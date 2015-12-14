---
layout: post
title: Snowplow Python Tracker 0.3.0 released
title-short: Snowplow Python Tracker 0.3.0
tags: [snowplow, analytics, python, django, tracker]
author: Fred
category: Releases
---

We are pleased to announce the release of the [Snowplow Python Tracker version 0.3.0][repo]. In this version we have added support for Snowplow custom contexts for all events. We have also updated the API for tracker initialization and ecommerce transaction tracking, added the option to turn off Pycontracts to improve performance, and added an event vendor parameter for custom unstructured events.

In the rest of the post we will cover:

1. [Tracker initialization](/blog/2014/04/25/snowplow-python-tracker-0.3.0-released/#tracker-initialization)
2. [Disabling contracts](/blog/2014/04/25/snowplow-python-tracker-0.3.0-released/#contracts)
3. [Ecommerce tracking](/blog/2014/04/25/snowplow-python-tracker-0.3.0-released/#ecommerce)
4. [Custom contexts](/blog/2014/04/25/snowplow-python-tracker-0.3.0-released/#contexts)
5. [Event vendors](/blog/2014/04/25/snowplow-python-tracker-0.3.0-released/#event-vendor)
6. [Context vendors](/blog/2014/04/25/snowplow-python-tracker-0.3.0-released/#context-vendor)
6. [Tracking method return values](/blog/2014/04/25/snowplow-python-tracker-0.3.0-released/#other)
7. [Other improvements](/blog/2014/04/25/snowplow-python-tracker-0.3.0-released/#other)
8. [Upgrading](/blog/2014/04/25/snowplow-python-tracker-0.3.0-released/#upgrading)
9. [Support](/blog/2014/04/25/snowplow-python-tracker-0.3.0-released/#support)

<!--more-->

<h2><a name="tracker-initialization">1. Tracker initialization</a></h2>

Several optional configuration arguments have been added to the `Tracker` class's initialization function. Its new signature looks like this:

{% highlight python %}
def __init__(self, collector_uri,
             namespace=None, app_id=None, context_vendor=None, encode_base64=True, contracts=True):
{% endhighlight %}

The example below would initialize a tracker whose name is "cf" for an application whose ID is "ae9f587d23". It would disable Pycontracts. It does not change the default behaviour of Base64-encoding event data.

{% highlight python %}
from snowplow_tracker.tracker import Tracker

t = Tracker("d3rkrsqld9gmqf.cloudfront.net", "cf", "ae9f587d23", "com.example", False)
{% endhighlight %}

<h2><a name="contracts">2. Disabling contracts</a></h2>

The Python Tracker uses the [Pycontracts][contracts] module for type checking, so a runtime error will be raised if you pass a method a parameter of the wrong type. This check does introduce a performance hit, so we have added the option to disable Pycontracts when configuring a tracker by setting the `contracts` argument to `False`:

{% highlight python %}
from snowplow_tracker.tracker import Tracker

t = Tracker("d3rkrsqld9gmqf.cloudfront.net", contracts=False)
{% endhighlight %}

<h2><a name="ecommerce">3. Ecommerce tracking</a></h2>

In previous versions of the Python Tracker, you had to individually call a tracking method for each item in the ecommerce transaction and for the transaction as a whole. The new version has a single method called `track_ecommerce_transaction` that is called once per transaction. This is its signature:

{% highlight python %}
def track_ecommerce_transaction(self, order_id, total_value,
                                affiliation=None, tax_value=None, shipping=None,
                                city=None, state=None, country=None, currency=None,
                                items={},
                                context=None, tstamp=None):
{% endhighlight %}

The required fields are `order_id`, `total_value`, and `items`.

The relevant argument here is `items`. This should be an array, each of whose entries is a dictionary containing data about a single item in the transaction. The mandatory fields in the dictionary are `sku`, `price`, and `quantity`.

An example may help. The call to track an ecommerce transaction in which two items are sold might look like this:

{% highlight python %}
t.track_ecommerce_transaction("6a8078be", 45, city="London", currency="GBP", items=
    [{  
        "sku": "pbz0026",
        "price": 20,
        "quantity": 1,
        "name": "crystal ball"
    },
    {
        "sku": "pbz0038",
        "price": 15,
        "quantity": 1,
        "name": "tarot deck"
    }])
{% endhighlight %}             

This will fire three events: one for each transaction item and one for the transaction as a whole. The `order_id` and `currency` fields will be attached to all three events; the `total_value` and `city` fields will only be attached to the transaction event, not the transaction item events.

The three events are guaranteed to have the same `dtm` and `tid` fields, where `dtm` is the timestamp and `tid` is a random 6-digit transaction ID attached to every Snowplow event.

For more detailed documentation, including a full list of fields available for each item in the transaction, see the [wiki][wiki].

<h2><a name="contexts">4. Custom contexts</a></h2>

In short, custom contexts let you add additional information about the circumstances surrounding an event in the form of a Python dictionary object. Each tracking method now accepts an additional optional contexts parameter before the optional timestamp parameter:

{% highlight python %}
def track_page_view(self, page_url, page_title=None, referrer=None, context=None, tstamp=None):
{% endhighlight %}

The context argument is a Python dictionary. Each of its keys is the name of a context, and each of its values is the flat (not nested) dictionary for that context. So if a visitor arrives on a page advertising a movie, the context argument might look like this:

{% highlight python %}
{
    "movie_poster": {          # Context entry
        "movie_name": "Solaris",
        "poster_country": "JP",
        "poster_year$dt": new Date(1978, 1, 1)
    }
}
{% endhighlight %}

This is how to fire a page view event with the above custom context:

{% highlight python %}
t.track_page_view("http://www.films.com", "Homepage", context={
    "movie_poster": {
        "movie_name": "Solaris",
        "poster_country": "JP",
        "poster_year$dt": new Date(1978, 1, 1)
    }
})
{% endhighlight %}

In order to avoid confusion between custom contexts defined by different companies, fill in the `context_vendor` argument when initializing a tracker:

{% highlight python %}
from snowplow_tracker.tracker import Tracker

t = Tracker("d3rkrsqld9gmqf.cloudfront.net", context_vendor="com.example")
{% endhighlight %}

Then whenever the tracker fires an event with a custom context, the event will include the context vendor you provide.

The context vendor string should contain no characters other than lowercase letters, underscores, and dots. It should be your company's reversed Internet domain name - for example, "uk.co.example_biz" for contexts developed at the company with domain name "example-biz.co.uk".

For more on custom contexts, see the [blog post][contexts] which introduced them in the Snowplow JavaScript Tracker.

<h2><a name="event-vendor">5. Event vendors</a></h2>

The event vendor parameter represents the company who developed the model for an event. It is analogous to the context vendor parameter, although it is not part of tracker construction. All events other than custom unstructured events have "com.snowplowanalytics" automatically set in their event vendor field.

Custom unstructured events now have a mandatory `event_vendor` initial field:

{% highlight python %}
def track_unstruct_event(self, event_vendor, event_name, dict_, context=None, tstamp=None):
{% endhighlight %}

Use it like this:

{% highlight python %}
t.track_unstruct_event("com.your_company", "viewed_product",  {
	"product_id": "ASO01043",
	"price": 49.95
})
{% endhighlight %}

The event vendor string should follow the same rules as the context vendor string.

<h2><a name="return">6. Tracking method return values</a></h2>

Each tracking method now returns a tuple based on the status code of the request it fired. If the code is between 0 and 400, it returns a tuple whose first element is `true` and whose second is the code:

{% highlight python %}
(true, 200)
{% endhighlight %}

If the code is a number not in that range, the first element is instead `false`:

{% highlight python %}
(false, 500)
{% endhighlight %}

Finally, if the host is not found:

{% highlight python %}
(false, "Host [http://d3rkrsqld9gmqf.cloudfront.net/i?{{querystring}}] not found (possible connectivity error")
{% endhighlight %}

<h2><a name="other">7. Other improvements </a></h2>

We have also:

* Added classifiers to setup.py [#48][48]
* Added a coveralls code coverage button to the README [#63][63]

<h2><a name="upgrading">8. Upgrading</a></h2>

The release version of this tracker (0.3.0) is available on PyPI, the Python Package Index repository, as [snowplow-tracker] [pypi]. Download and install it with pip:

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

[48]: https://github.com/snowplow/snowplow-python-tracker/issues/48
[63]: https://github.com/snowplow/snowplow-python-tracker/issues/63

[repo]: https://github.com/snowplow/snowplow-python-tracker
[contracts]: https://github.com/AndreaCensi/contracts
[wiki]: https://github.com/snowplow/snowplow/wiki/Python-Tracker
[contexts]: http://snowplowanalytics.com/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#contexts
[pypi]: https://pypi.python.org/pypi/snowplow-tracker/0.3.0
[setup]: https://github.com/snowplow/snowplow/wiki/Python-tracker-setup
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues
