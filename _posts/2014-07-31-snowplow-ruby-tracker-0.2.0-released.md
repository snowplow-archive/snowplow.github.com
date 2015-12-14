---
layout: post
title: Snowplow Ruby Tracker 0.2.0 released
title-short: Snowplow Ruby Tracker 0.2.0
tags: [snowplow, analytics, python, django, tracker]
author: Fred
category: Releases
---

We are pleased to announce the release of the Snowplow Ruby Tracker version 0.2.0. This release brings the Ruby Tracker up to date with the other Snowplow trackers, particularly around support of self-describing custom contexts and unstructured events.

Huge thanks go to Elijah Tabb, a.k.a. [ebear][ebear], for contributing the updated `track_unstruct_event` and `track_screen_view` tracker API methods among other features!

Read on for more information...

1. [New tracker initialization method](/blog/2014/07/31/snowplow-ruby-tracker-0.2.0-released/#initialization)
2. [Updated format for unstructured events](/blog/2014/07/31/snowplow-ruby-tracker-0.2.0-released/#unstruct-events)
3. [Updated format for custom contexts](/blog/2014/07/31/snowplow-ruby-tracker-0.2.0-released/#contexts)
4. [Setting the event ID in the tracker](/blog/2014/07/31/snowplow-ruby-tracker-0.2.0-released/#uuid)
5. [Other improvements](/blog/2014/07/31/snowplow-ruby-tracker-0.2.0-released/#improvements)
6. [Getting help](/blog/2014/07/31/snowplow-ruby-tracker-0.2.0-released/#improvements)

<!--more-->

<h2><a name="initialization">1. New tracker initialization method</a></h2>

The initialization method for the Tracker class has been updated. This is its new signature:

{% highlight ruby %}
Contract String, Maybe[String], Maybe[String], Bool => Tracker
def initialize(endpoint, namespace=nil, app_id=nil, encode_base64=@@default_encode_base64)
{% endhighlight %}

The change is that the `context_vendor` argument has been removed. This is because [contexts are now self-describing JSONs](/blog/2014/04/23/snowplow-ruby-tracker-0.1.0-released/#contexts), so sending a `context_vendor` is redundant.

An example of tracker initialization in version 0.2.0:

{% highlight ruby %}
require 'snowplow-tracker'

t = SnowplowTracker::Tracker.new('d3rkrsqld9gmqf.cloudfront.net', 'my_tracker_name', 'my_app_id')
{% endhighlight %}

<h2><a name="unstruct-events">2. Updated format for unstructured events</a></h2>

Previously, several arguments were required to build an unstructured event: the name of the event, the JSON describing the event, and the event vendor (the company that developed the event model). Now the signature of `track_unstruct_event` has been simplified:

{% highlight ruby %}
Contract @@SelfDescribingJson, Maybe[@@ContextsInput], Maybe[Num] => [Bool, Num]
def track_unstruct_event(event_json, context=nil, tstamp=nil)
{% endhighlight %}

A usage example:

{% highlight ruby %}
t.track_unstruct_event({
  'schema' => 'iglu:com.acme/viewed_product/jsonschema/1-0-0',
  'data' => {
    'product_id' => 'ASO01043',
    'price' => 49.95
  }
})
{% endhighlight %}

The `event_json` argument has two fields: "schema" and "data". The schema field contains a reference to the JSON schema for the event, and the data field contains describes the event itself. Together they constitute a [self-describing JSON][self-describing-jsons].

The `tstamp` argument is unchanged: it's an optional timestamp for the event, given in milliseconds since the Unix epoch.

The next section deals with the changes to how the `context` argument works.

<h2><a name="unstruct-events">3. Updated format for custom contexts</a></h2>

Custom contexts describe the circumstances around an individual event. In this version, custom contexts must be self-describing JSONs. Each of the Ruby tracker's `trackXXX` methods accepts an array of custom contexts as the penultimate optional argument (before the `tstamp` argument).

An example, attaching two custom contexts to a page view event:

{% highlight ruby %}
t.track_page_view('http://www.example.com', 'title page', 'http://www.referrer.com', [{
  'schema' => 'iglu:com.acme/viewed_product/jsonschema/1-0-0',
  'data' => {
    'product_id' => 'ASO01043',
    'price' => 49.95
  }
},
{
  'schema' => 'iglu:com.my_company/viewed_product/jsonschema/1-0-0',
  'data' => {
    'user_type' => 'tester'
  }
}])
{% endhighlight %}

When tracking an ecommerce transaction, you can attach an array of custom contexts which will be sent with the transaction:

{% highlight ruby %}
t.track_ecommerce_transaction({
  # map of arguments for the transaction event
  'order_id' => '12345',
  'total_value' => 35,
  'affiliation' => 'my_company',
  'tax_value' => 0,
  'shipping' => 0,
  'city' => 'Phoenix',
  'state' => 'Arizona',
  'country' => 'USA',
  'currency' => 'GBP'
},
[{
  # first item
  'sku' => 'pbz0026',
  'price' => 20,
  'quantity' => 1,
  # context for first item
  'context' => [{
    'schema' => 'iglu:com.my_company/promotions/jsonschema/1-0-0',
    'data' => {
      'promotion_name' => 'half price'
      'promotion_duration' => 24
    }
  }]
},
{
  # second item
  'sku' => 'pbz0038',
  'price' => 15,
  'quantity' => 1,
  'name' => 'crystals',
  'category' => 'magic'
}],
[{
  # context for overall transaction
  'schema' => 'iglu:com.my_company/page_type/jsonschema/1-0-0',
  'data' => {
    'type' => 'test_page'
  }
}])
{% endhighlight %}

Under the hood, this complicated example will send three events: one transaction event and two transaction item events. The transaction event has an array containing one "page_type" custom context attached. The first transaction item event has an array containing one "promotions" custom context attached.

<h2><a name="uuid">4. Setting the event ID in the tracker</a></h2>

We are phasing out the old "tid" transaction ID field because, as a random 6-digit number, it wasn't sufficiently unique. It has been replaced with an "eid" field containing a [UUID][uuid]. If set, this "eid" UUID will be used as the "event_id" for this event.

This is hugely valuable if the Snowplow Enrichment process is running in an at-least-once stream processing system, because you can use the tracker-set event ID to identify duplicates downstream of the Enrichment.

<h2><a name="improvements">5. Other improvements</a></h2>

We have also:

* Updated `track_screen_view` to send a valid self-describing JSON - thanks @ebear! [#21][21]
* Fixed broken links in the README [#27][27]
* Fixed the coveralls.io button in the Github repository [#17][17]

<h2><a name="help">6. Getting help</a></h2>

Useful links:

* The [wiki page][wiki]
* The [Github repository][repo]
* The [0.2.0 release notes][tracker-020]

If you have an idea for a new feature or want help getting things set up, please [get in touch] [talk-to-us]. This is only the second release of the Ruby Tracker, so we're keen to hear people's opinions. And [raise an issue] [issues] if you spot any bugs!

[ebear]: https://github.com/ebear

[repo]: https://github.com/snowplow/snowplow-ruby-tracker
[wiki]: https://github.com/snowplow/snowplow/wiki/Ruby-Tracker
[setup]: https://github.com/snowplow/snowplow/wiki/Ruby-tracker-setup
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow-ruby-tracker/issues

[17]: https://github.com/snowplow/snowplow-ruby-tracker/issues/17
[21]: https://github.com/snowplow/snowplow-ruby-tracker/issues/21
[27]: https://github.com/snowplow/snowplow-ruby-tracker/issues/27

[self-describing-jsons]: http://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/
[json-schema]: http://json-schema.org/
[uuid]: http://en.wikipedia.org/wiki/Universally_unique_identifier

[tracker-020]: https://github.com/snowplow/snowplow-ruby-tracker/releases/tag/0.2.0
