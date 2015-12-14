---
layout: post
title: Snowplow JavaScript Tracker 0.13.0 released with custom contexts
title-short: JavaScript Tracker 0.13.0
tags: [snowplow, javascript, tracker, custom context, data model, event grammar]
author: Alex
category: Releases
---

We're pleased to announce the immediate availability of the [Snowplow JavaScript Tracker version 0.13.0] [0130-release]. This is the first new release of the Snowplow JavaScript Tracker since separating it from the main Snowplow repository last year.

The primary objective of this release was to introduce some key new tracking capabilities, in preparation for adding these to our Enrichment process. Secondarily, we also wanted to perform some outstanding housekeeping and tidy-up of the newly-independent repository.

In the rest of this post, then, we will cover:

1. [New feature: custom contexts](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#contexts)
2. [New feature: transaction currencies](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#currency)
3. [New feature: specifying the tracking platform](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#platform)
4. [Project tidy-up](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#tidyup)
5. [Upgrading](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#upgrading)
6. [Getting help](/blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#help)

<!--more-->

<div class="html">
<h2><a name="contexts">1. New feature: custom contexts</a></h2>
</div>

The most exciting new feature is the addition of custom contexts to all of our `track...()` methods for event tracking.

**Please note that this release only adds custom contexts to the JavaScript Tracker. Adding custom contexts to our Enrichment process and Storage targets is on the roadmap - but rest assured we are working on it!**

<div class="html">
<h3>1.1 What are custom contexts?</h3>
</div>

Context is what describes the circumstances surrounding an individual event - for example, when the event happened, where it happened, or how it happened. For the original blog post where we introduced our ideas around event context, see [Towards universal event analytics - building an event grammar] [event-grammar-post].

Our JavaScript Tracker already captures lots of standard web context by default: event time, user timezone, monitor color depth, browser features etc. This new feature will allow you to define and track your own custom contexts - ones which make sense to _your_ business.

Think "custom variables" but much more powerful and flexible!

<div class="html">
<h3>1.2 When to use custom contexts?</h3>
</div>

Custom contexts are great for a couple of use cases:

1. Whenever you want to augment a standard Snowplow event type with some additional data
2. If your business has a set of crosscutting data points/models which you want to record against multiple event types

You can attach custom contexts to any Snowplow event type - even custom unstructured events.

<div class="html">
<h3>1.3 Usage</h3>
</div>

To support custom contexts, we have added a new argument, called `contexts`, onto the end of each `track...()` and `add...()` method. For example, here is the new signature for tracking a page view:

{% highlight javascript %}
function trackPageView(customTitle, contexts)
{% endhighlight %}

The `contexts` argument is always optional on any event call. If set, it must be a JSON taking the form:

{% highlight javascript %}
{ "context1_name": {
    ...
  },
  "context2_name": {
    ...
  },
  ...
}
{% endhighlight %}

The format of the JSON properties for each individual context follows the exact same rules as our [unstructured events' JSON properties] [unstructured-events].

If you are interested in finding out more about custom contexts, we have written a [follow-up blog post] [howto-post] - please [read this post] [howto-post] for more information.

<h3>1.4 Roadmap</h3>

We are well aware that this release is only the start of adding custom contexts to Snowplow. We are working on a common solution to Enriching and Storing both unstructured events and custom contexts.

Please keep an eye on our [Roadmap wiki page] [roadmap] to see how Snowplow's support for custom contexts (and unstructured events) evolves.

<div class="html">
<h2><a name="currency">2. New feature: transaction currencies</a></h2>
</div>

We have updated our ecommerce tracking methods to add support for setting the currency which the transaction took place in.

The new `currency` argument is the penultimate argument (the last before `context`, see above) to both the `addTrans()` and `addItem()` methods. Use it like so:

{% highlight javascript %}
_snaq.push(['addTrans',
    '1234',           // order ID - required
    'Acme Clothing',  // affiliation or store name
    '11.99',          // total - required
    '1.29',           // tax
    '5',              // shipping
    'San Jose',       // city
    'California',     // state or province
    'USA',            // country
    'USD'             // currency
  ]);

_snaq.push(['addItem',
    '1234',           // order ID - required
    'DD44',           // SKU/code - required
    'T-Shirt',        // product name
    'Green Medium',   // category or variation
    '11.99',          // unit price - required
    '1',              // quantity - required
    'USD'             // currency
  ]);
{% endhighlight %}

Please make sure to pass in the valid [ISO 4217] [iso-4217] code for your currency. This will ensure that your ecommerce transactions are compatible with the currency conversion enrichment we are currently developing (see [this blog post] [forex-post] for details).

Don't forget to set the currency on **both** the parent transaction and its child items.

<div class="html">
<h2><a name="platform">3. New feature: specifying the tracking platform</a></h2>
</div>

Many thanks to community member [Ryan Sorensen] [rcs] for contributing the new `setPlatform()` method.

This allows you to override the default tracking platform ("web") with another of the [platform values supported in the Snowplow Tracker Protocol] [protocol-platform]. For example, to set the platform to "mob" for mobile:

{% highlight javascript %}
_snaq.push(['setPlatform', 'mob']);
{% endhighlight %}

Thanks for your contribution Ryan!

<div class="html">
<h2><a name="tidyup">4. Project tidy-up</a></h2>
</div>

We have taken advantage of the move to a separate repository to perform some much needed tidy-up of the tracker codebase:

* Added a complete [historic CHANGELOG] [changelog]
* Back-filled git tags for all of the tracker's releases
* Restructured the folders
* Added a package.json
* Added a node.js-friendly .gitignore
* Added some useful helper functions

As well as tidying up the repository, these updates should lay the groundwork for us replacing our custom `snowpak.sh` Bash build script with a Grunt-based build process in the [next release] [0140-issues].

<div class="html">
<h2><a name="upgrading">5. Upgrading</a></h2>
</div>

**UPDATED** After an important post-release bug fix, the updated minified tracker is available here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/0.13.1/sp.js

Please note that as of this release, we are moving the Snowplow JavaScript Tracker to true [semantic versioning] [semver]. This means that going forwards we are also making this tracker available as:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/0/sp.js

where 0 is the semantic MAJOR version. If you prefer, you can use this URI path and then get new features and bug fixes automatically as we roll-out MINOR and PATCH updates to the tracker. Any breaking changes will mean a new MAJOR version, which will be hosted on `/1/sp.js`, i.e. it won't break your existing installation.

<div class="html">
<h2><a name="help">6. Getting help</a></h2>
</div>

Check out the [v0.13.0 release page] [0130-release] on GitHub for the full list of changes made in this version.

As always, if you run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[event-grammar-post]: /blog/2013/08/12/towards-universal-event-analytics-building-an-event-grammar/
[forex-post]: /blog/2014/01/17/scala-forex-library-released/
[howto-post]: /blog/2014/01/27/snowplow-custom-contexts-guide/
[unstructured-events]: https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#381-trackunstructevent

[rcs]: https://github.com/rcs
[iso-4217]: http://en.wikipedia.org/wiki/ISO_4217#Active_codes
[protocol-platform]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol#11-application-parameters

[semver]: http://semver.org/spec/v2.0.0.html
[changelog]: https://github.com/snowplow/snowplow-javascript-tracker/blob/master/CHANGELOG
[roadmap]: https://github.com/snowplow/snowplow/wiki/Product-roadmap
[0130-release]: https://github.com/snowplow/snowplow-javascript-tracker/releases/tag/0.13.0
[0140-issues]: https://github.com/snowplow/snowplow-javascript-tracker/issues?milestone=3&page=1&state=open

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
