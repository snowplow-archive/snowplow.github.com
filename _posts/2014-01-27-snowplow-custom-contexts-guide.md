---
layout: post
title: A guide to custom contexts in Snowplow JavaScript Tracker 0.13.0
title-short: Snowplow custom contexts guide
tags: [snowplow, custom, contexts, javascript, tracker]
author: Alex
category: Releases
---

---
**WARNING**: This blog contains an outdated information. To review the current uproach, please, refer to our wiki post [Custom contexts](https://github.com/snowplow/snowplow/wiki/Custom-contexts).
---

Earlier today we [announced the release of Snowplow JavaScript Tracker 0.13.0] [0130-post], which updated all of our `track...()` methods to support a new argument for setting custom JSON contexts.

In our earlier blog post we introduced the idea of custom contexts only very briefly. In this blog post, we will take a detailed look at Snowplow's custom contexts functionality, so you can understand how best to attach custom contexts to your existing Snowplow events.

Understanding the custom context format is important because our Enrichment process does not yet extract custom contexts, so you will not get any feedback yet from the Enrichment process as to whether you are adding them correctly; nor do we have validation for custom context properties in our JavaScript Tracker yet.

In the rest of this post we will cover:

1. [Updated method signatures](/blog/2014/01/27/snowplow-custom-contexts-guide/#sigs)
2. [The `contexts` JavaScript object](/blog/2014/01/27/snowplow-custom-contexts-guide/#contexts)
3. [A detailed example](/blog/2014/01/27/snowplow-custom-contexts-guide/#eg)
4. [Getting help](/blog/2014/01/27/snowplow-custom-contexts-guide/#help)

Let's get started after the jump.

<!--more-->

<div class="html">
<h2><a name="sigs">1. Updated method signatures</a></h2>
</div>

You can add custom contexts to any of the existing `track...()` methods, and in the case of our transaction tracking, with the two `add...()` methods.

For completeness, here is the full list of updated tracking methods. Note that `contexts` is always the last argument:

{% highlight javascript %}
trackPageView(customTitle, contexts)
trackStructEvent(category, action, label, property, value, contexts)
trackUnstructEvent(name, properties, contexts)
addTrans(orderId, affiliation, total, tax, shipping, city, state, country, currency, contexts)
addItem(orderId, sku, name, category, price, quantity, currency, contexts)
{% endhighlight %}

A few notes on this:

* If you set the `contexts` argument on a `trackPageView`, the same context will be attached to all page pings too (assuming you have `enableActivityTracking` enabled)
* Remember that transactions and their child items are processed as separate Snowplow events. Duplicate your transaction `contexts` argument into your items' `contexts` argument if you need the transaction context available to the transaction item events
* If you want to add custom context but don't want to set all the prior arguments, just pad out your function call with empty arguments:

{% highlight javascript %}
_snaq.push(['trackPageView',
              , // <- Skip the custom page title (get page title automatically instead)
              { page: {
                  category: 'sport',
                  last_updated$dt: new Date(2014,1,26)
                }
              }
           ]);
{% endhighlight %}

<div class="html">
<h2><a name="contexts">2. The "contexts" JavaScript object</a></h2>
</div>

The `contexts` argument to any `track...()` or `add...()` method is always optional. If set, it must be a JSON taking the form:

{% highlight javascript %}
{ "context1_name": {
    /* context1 JSON */
  },
  "context2_name": {
    /* context2 JSON */
  },
  ...
}
{% endhighlight %}

If the `contexts` argument is set, it must be a JSON including at least one name: property pair, where:

1. The name is the name for an individual context entry
2. The property is a JSON holding name: property pairs for this context entry

A few dos and don'ts for context names:

* **Do** name each context entry however you like
* **Do** use a context name to identify a set of associated data points which make sense to your business
* **Do** use the same contexts across multiple different events and event types
* **Don't** use multiple different context names to refer to the same set of data points

A few dos and don'ts for the JSONs inside each context entry JSONs:

* **Do** use any of the data types supported by [custom unstructured events] [unstructured-events]
* **Do** use Snowplow datatype suffixes if the data type would otherwise be unclear
* **Don't** nest properties - as with custom unstructured events, the structure must be flat

<div class="html">
<h2><a name="eg">3. A detailed example</a></h2>

<h3>Introduction</h3>
</div>

A detailed example should make custom contexts a little more real.

Let's take a retailer and Snowplow user who sells movie memorabilia online, particularly movie posters. For every movie poster, our retailer cares about the name of the movie, the country which printed the movie poster and the year the poster was printed. She has also done some work understanding her customer base, and can assign all of her visitors a propensity-to-buy score and a customer segment as soon as they add something to their basket.

<div class="html">
<h3>Definition of custom contexts</h3>
</div>

Based on the above, our retailer will define two custom contexts. The first describes a given movie poster:

{% highlight javascript %}
"movie_poster": {
  "movie_name": xxx,
  "poster_country": xxx,
  "poster_year$dt": xxx
}
{% endhighlight %}

And then the second context describes the customer:

{% highlight javascript %}
"customer": {
  "p_buy": xxx,
  "segment": xxx
}
{% endhighlight %}

With her two custom contexts defined, our retailer is now ready to update her Snowplow installation to start collecting this additional data.

<div class="html">
<h3>Definition of custom contexts</h3>
</div>

When a visitor arrives on a page advertising a movie poster, our retailer adds this context to the page view event:

{% highlight javascript %}
_snaq.push(['trackPageView',
              ,                            // <- No custom page title
              { "movie_poster": {          // <- Context entry
                  "movie_name": "Solaris",
                  "poster_country": "JP",
                  "poster_year$dt": new Date(1978, 1, 1)
                }
              }
           ]);
{% endhighlight %}

When the visitor clicks the add to basket button on this poster, the website fires a custom unstructured event to track the add to basket. This time we send the "customer" context as well as the "movie_poster" context:

{% highlight javascript %}
_snaq.push(['trackUnstructEvent',
              'add-to-basket',             // <- Event name
              { "button": "img-overlay",   // <- Event properties
                "stock-level": 2
              },
              { "movie_poster": {          // <- First context entry
                  "movie_name": "Solaris",
                  "poster_country": "JP",
                  "poster_year$dt": new Date(1978, 1, 1)
                },
                "customer": {              // <- Second context entry
                  "p_buy": 0.23,
                  "segment": "whale"
                }
              }
           ]);
{% endhighlight %}

The visitor seems to be having doubts - they head to the contact page and fill out a form. This time we still track the "customer" context (with a reduced propensity-to-buy score), but it doesn't make sense to record this event against any given "movie_poster", so we don't include that context:

{% highlight javascript %}
_snaq.push(['trackStructEvent',
              'comms',                     // <- Category
              'feedback-form',             // <- Action
              ,                            // <- No label
              ,                            // <- No property
              ,                            // <- No value
              { "customer": {              // <- Context entry
                  "p_buy": 0.13,
                  "segment": "whale"
                }
              }
           ]);
{% endhighlight %}

And that completes our example. By defining and implementing these two custom contexts, our retailer has promoted some of her most business-critical data points to the level of first class entities in Snowplow.

This additional context has made standard Snowplow events such as page views much more valuable to her, and should later make it easy to analyze these business-critical data points across multiple event types.

<div class="html">
<h2><a name="help">4. Getting help</a></h2>
</div>

As always, if you do run into any issues or don't understand any of the above guide, please do get in touch with us via [the usual channels] [talk-to-us].

If you have any ideas or feedback for Snowplow's evolving approach to custom contexts, do please share them, either in the comments below or through the usual channels. And please keep an eye on our [Roadmap wiki page] [roadmap] to see how Snowplow's support for custom contexts evolves!

[0130-post]: /blog/2014/01/27/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/
[unstructured-events]: https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#381-trackunstructevent

[roadmap]: https://github.com/snowplow/snowplow/wiki/Product-roadmap
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
