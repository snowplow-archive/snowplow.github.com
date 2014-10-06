---
layout: post
shortenedlink: JavaScript Tracker 2.1.0 released
title: Snowplow JavaScript Tracker 2.1.0 released with new events
tags: [snowplow, javascript, tracker, event]
author: Fred
category: Releases
---

We are delighted to announce the release of version 2.1.0 of the [Snowplow JavaScript Tracker][repo]! This release contains a number of new features, most prominently several new unstructured events.


<h2><a name="events">1. New events</a></h2>

<h3><a name="forms">1.1 Automatic form tracking</a></h3>

Enable automatic form tracking using the `enableFormTracking` method:

{% highlight javascript %}
snowplow('enableFormTracking');
{% endhighlight %}

Whenever a user changes the value of a field in a form, the Tracker will fire a [`change_form`][change_form] unstructured event capturing the name, type, and CSS classes of the changed element, the ID of the parent form, and the new value of the field.

Whenever a user submits a form, the Tracker will fire a [`submit_form`][submit_form] event. This event captures the ID of the parent form and the names, types, and final values of all `input`, `select`, and `textarea` elements in the form.

When you call the method, it will only attach event listeners to existing forms, so you should call it again whenever you create a new form element. (This is safe - the Tracker will not attach more than one event listener to an element.)

<h3><a name="forms">1.2 `add_to_cart` and `remove_from_cart`</a></h3>

Use the new `trackAddToCart` and `trackRemoveFromCart` methods to track [`add_to_cart`][add_to_cart] and [`remove_from_cart`][remove_from_cart] events. The signatures of the methods are identical:

{% highlight javascript %}
trackRemoveFromCart(sku, name, category, price, quantity, currency, context);
{% endhighlight %}

Use them like this:

{% highlight javascript %}
snowplow('trackAddToCart', 'item-000303', 'small waistcoat', 'clothing', 79.99, 2, 'USD');
{% endhighlight %}

<h3><a name="forms">1.3 `social_interaction`</a></h3>

The `trackSocialInteraction` method lets you track [`social_interaction`][social_interaction] events on you site. This is its signature:

{% highlight javascript %}
trackSocialInteraction(action, network, target, context);
{% endhighlight %}

An example:

{% highlight javascript %}
snowplow('trackSocialInteraction', 'like', 'Facebook', 'blog post 0012');
{% endhighlight %}

<h3><a name="forms">1.4 `site_search`</a></h3>

The new `site_search` event describes a user performing a search on a website. It can capture the search terms and search filters used, the number of results found, and the number of results displayed on the first page.

This is the signature of the corresponding method:

{% highlight javascript %}
trackSiteSearch(terms, filters, totalResults, pageResults, context);
{% endhighlight %}

And an example of `trackSiteSearch` in action:

{% highlight javascript %}
snowplow('trackSiteSearch', ['event', 'streams'], ['books'], 10, 8);
{% endhighlight %}

<h2><a name="events">2. Page performance context </a></h2>

The `trackPageView` method now accepts an additional boolean parameter named "performanceTracking":

{% highlight javascript %}
trackPageView(customTitle, performanceTracking, context);
{% endhighlight %}

If you set this parameter to `true`, a [`PerformanceTiming`][performancetiming] context will be added to the page view event. This context will contain all the data found in the [`window.performance.timing`][navigationtiming] variable, and so can be used to calculate how long the page took to load.

<h2><a name="events">3. Link content </a></h2>

The `link_click` event has been updated to include an optional `content` field. This will be populated with the `innerHTML` property of the link. The `enableLinkClickTracking` now has a "trackContent" parameter which you must set to `true` to capture the innerHTML of clicked links:

{% highlight javascript %}
enableLinkClickTracking(criterion, pseudoClicks, trackContent, context);
{% endhighlight %}

And you can also manually pass the innerHTML into the `trackLinkClick` method, whose signature is now:

{% highlight javascript %}
trackLinkClick(targetUrl, elementId, elementClasses, elementTarget, elementContent, context) ;
{% endhighlight %}

The `enableLinkClickTracking method now accepts an additional boolean parameter named "content".


[repo]: https://github.com/snowplow/snowplow-javascript-tracker
[change_form]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0
[submit_form]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0
[social_interaction]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/social_interaction/jsonschema/1-0-0
[add_to_cart]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/add_to_cart/jsonschema/1-0-0
[remove_from_cart]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/remove_from_cart/jsonschema/1-0-0
[site_search]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/site_search/jsonschema/1-0-0
[performancetiming]: https://github.com/snowplow/iglu-central/blob/master/schemas/org.w3/PerformanceTiming/jsonschema/1-0-0
[navigationtiming]: https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/NavigationTiming/Overview.html
