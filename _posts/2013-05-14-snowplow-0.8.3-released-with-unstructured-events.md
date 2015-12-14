---
layout: post
title: Snowplow 0.8.3 released with unstructured events
title-short: Snowplow 0.8.3
tags: [snowplow, unstructured events, javascript, tracker]
author: Alex
category: Releases
---

We're pleased to announce the release of Snowplow **0.8.3**. This release updates our JavaScript Tracker to version 0.11.2, adding the ability to send custom unstructured events to a Snowplow collector with `trackUnstructEvent()`. The Clojure Collector is also bumped to 0.5.0, to include some important bug fixes.

**Please note that this release only adds unstructured events to the JavaScript Tracker - adding unstructured events to our Enrichment process and storage targets is on the roadmap - but rest assured we are working on it!**

Many thanks to community members [Gabor Ratky] [rgabo], [Andras Tarsoly] [tarsolya] and [Laszlo Bacsi] [lackac], all from [Secret Sauce Partners] [sspinc], for contributing this great feature: Gabor and his team took JavaScript unstructured events from an item on our roadmap to a code-complete feature, big thanks guys! (And if you are interested in seeing how the design and implementation of this powerful feature evolved, do have a read of the [original GitHub pull request] [pull-198].)

In the rest of this post, then, we will cover:

1. [What are unstructured events?](/blog/2013/05/14/snowplow-0.8.3-released-with-unstructured-events/#definition)
2. [When to use unstructured events?](/blog/2013/05/14/snowplow-0.8.3-released-with-unstructured-events/#when)
3. [Usage](/blog/2013/05/14/snowplow-0.8.3-released-with-unstructured-events/#usage)
4. [Upgrading](/blog/2013/05/14/snowplow-0.8.3-released-with-unstructured-events/#upgrading)
5. [Roadmap for unstructured events](/blog/2013/05/14/snowplow-0.8.3-released-with-unstructured-events/#roadmap)
6. [Getting help](/blog/2013/05/14/snowplow-0.8.3-released-with-unstructured-events/#help)

<!--more-->

<h2><a name="definition">1. What are unstructured events?</a></h2>

[Custom unstructured events] [unstruct-events] are user events which do not fit one of the existing Snowplow event types (page views, ecommerce transactions etc), and do not fit easily into our existing [custom structured event] [struct-events] format. A custom unstructured event consists of two elements:

* A `name`, e.g. "Game saved" or "returned-order"
* A set of `name: value` properties (also known as a hash, associative array or dictionary)

You might recognise what we call custom unstructured events from other analytics tools including MixPanel, KISSmetrics and Keen.io, where they are the primary trackable event type.

<h2><a name="when">2. When to use unstructured events?</a></h2>

Custom unstructured events are great for a couple of use cases:

1. Where you want to track event types which are proprietary/specific to your business (i.e. not already part of Snowplow)
2. Where you want to track events which have unpredictable or frequently changing properties

**Note:** because unstructured events are *not* currently processed by the ETL and enrichment step, or added to storage, we recommend using [custom structured events] [struct-events] for custom events types, assuming that you can fit your events into our custom structured event schema.

<h2><a name="usage">3. Usage</a></h2>

Tracking an unstructured event with the JavaScript Tracker is very straightforward - use the `trackUnstructEvent(name, properties)` function.

Here is an example taken from our codebase:

{% highlight javascript %}
_snaq.push(['trackUnstructEvent', 'Viewed Product',
                {
                    product_id: 'ASO01043',
                    category: 'Dresses',
                    brand: 'ACME',
                    returning: true,
                    price: 49.95,
                    sizes: ['xs', 's', 'l', 'xl', 'xxl'],
                    available_since$dt: new Date(2013,3,7)
                }
            ]);
{% endhighlight %}

We have written a [follow-up blog post] [howto-post] to provide more information on using the new `trackUnstructEvent` functionality - please [read this post] [howto-post] for more information.

<h2><a name="upgrading">4. Upgrading</a></h2>

There are two components to upgrade in this release:

* The JavaScript Tracker, to version 0.11.2
* The Clojure Collector, to version 0.5.0

If you are running the Clojure Collector, you must upgrade the Clojure Collector **before** upgrading the JavaScript Tracker, or you will experience some data loss.

### Clojure Collector

This release bumps the Clojure Collector to version **0.5.0**. To upgrade to this release:

1. Download the new warfile by right-clicking on [this link] [war-download] and selecting "Save As..."
2. Log in to your Amazon Elastic Beanstalk console
3. Browse to your Collector's application
4. Click the "Upload New Version" and upload your warfile

### JavaScript Tracker

Please update your website(s) or tag manager to use the latest version of the JavaScript Tracker, which is version 0.11.2. As always, the updated minified tracker is available here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/0.11.2/sp.js

<h2><a name="roadmap">5. Roadmap</a></h2>

We are well aware that this release is only the start of adding custom unstructured events to Snowplow.

It makes sense to work next on extracting unstructured events in our Enrichment process; unfortunately this is not trivial, because our Enrichment process currently only outputs to Redshift, and Redshift has no support for JSON objects or maps of properties, which we would need to store the unstructured event properties.

Therefore we are exploring two different strands:

1. **Storing Snowplow events in Avro**. Avro is a rich data serialization system that will allow us to store the unstructured event properties within the event object. Initially, you would be able to query these Avro-serialized events using a range of tools on Hadoop including Pig, Hive, Scalding and Cascalog. It should also be relatively straightforward to load these events into NoSQL databases such as MongoDB. We would then work on mapping the Avro events into Redshift
2. **Storing Snowplow events in PostgreSQL**. Postgres has a JSON datatype, although the querying capabilities on that JSON datatype are so-far very primitive. Nonetheless, it should be possible to at least store the unstructured event properties in an appropriate JSON field in Postgres

If you have a preference for one of the two above options, or a suggested third approach, then [get in touch] [talk-to-us] and let us know as soon as possible, as we are thining through these alternatives now.

Please keep an eye on our [Roadmap wiki page] [roadmap] to see how Snowplow's support for unstructured events evolves.

<h2><a name="help">6. Getting help</a></h2>

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

And if you want to find out more about the syntax for `trackUnstructEvent`, do checkout our [Snowplow Unstructured Events Guide] [howto-post], which was also published today.

[rgabo]: https://github.com/rgabo
[tarsolya]: https://github.com/tarsolya
[lackac]: https://github.com/lackac
[sspinc]: http://secretsaucepartners.com/
[pull-198]: https://github.com/snowplow/snowplow/pull/198

[struct-events]: https://github.com/snowplow/snowplow/wiki/canonical-event-model#wiki-customstruct
[unstruct-events]: https://github.com/snowplow/snowplow/wiki/canonical-event-model#wiki-customunstruct

[howto-post]: /blog/2013/05/14/snowplow-unstructured-events-guide

[war-download]: http://s3-eu-west-1.amazonaws.com/snowplow-hosted-assets/2-collectors/clojure-collector/clojure-collector-0.5.0-standalone.war

[roadmap]: https://github.com/snowplow/snowplow/wiki/Product-roadmap

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
