---
layout: post
title: A guide to unstructured events in Snowplow 0.8.3
tags: [snowplow, unstructured, events, javascript, tracker]
author: Alex
category: Releases
---

Earlier today we [announced the release of Snowplow 0.8.3] [snowplow-083-blog], which updated our JavaScript Tracker to add the ability to send custom unstructured events to a Snowplow collector with `trackUnstructEvent()`.

In our earlier blog post we briefly introduced the capabilities of `trackUnstructEvent` with some example code. In this blog post, we will take a detailed look at Snowplow's custom unstructured events functionality, so you can understand how best to send unstructured events to Snowplow.

Understanding the unstructured event format is important because our Enrichment process does not yet extract unstructured events, so you will not get any feedback yet from the ETL as to whether you are tracking them correctly. (Nor do we have validation for unstructured event properties in our JavaScript Tracker yet.)

In the rest of this post, then, we will cover:

1. [Basic usage](/blog/2013/05/14/snowplow-unstructured-events-guide#basic-usage)
2. [The `properties` JavaScript object](/blog/2013/05/14/snowplow-unstructured-events-guide#properties-object)
3. [Supported datatypes](/blog/2013/05/14/snowplow-unstructured-events-guide#supported-datatypes)
4. [Getting help](/blog/2013/05/14/snowplow-unstructured-events-guide#help)

<!--more-->

<h2><a name="basic-usage">1. Basic usage</a></h2>

Tracking an unstructured event with the JavaScript Tracker is very straightforward - use the `trackUnstructEvent(name, properties)` function:

* `name` is the name of the unstructured event. This is case-sensitive; spaces etc are allowed
* `properties` is a JavaScript object

Here is an example:

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

Every call to `trackUnstructEvent` has the same structure - the complexity comes from knowing how to structure the `properties` JavaScript object. We will discuss this next:

<h2><a name="properties-object">2. The 'properties' JavaScript object</a></h2>

The `properties` JavaScript consists of a set of individual `name: value` properties.

The structure must be flat - in other words, properties cannot be nested. Continuing with the exampe code above, this means that the following is **not** allowed:

{% highlight javascript %}
{
    category: { primary: 'Womenswear', secondary: 'Dresses'}, // NOT allowed
}
{% endhighlight %}

The `properties` JavaScript object supports a wide range of datatypes - see below for details.

<h2><a name="supported-datatypes">3. Supported datatypes</a></h2>

Snowplow unstructured events support a relatively rich set of datatypes. Because these datatypes do not always map directly onto JavaScript datatypes, we have introduced some "type suffixes" for the JavaScript property names, to tell Snowplow what Snowplow datatype we want the JavaScript data to map onto.

Our datatypes, then, are as follows:

| Snowplow datatype | Description                  | JavaScript datatype  | Type suffix(es)      | Supports array? |
|:------------------|:-----------------------------|:---------------------|:---------------------|:----------------|
| Null              | Absence of a value           | Null                 | -                    | No              |
| String            | String of characters         | String               | -                    | Yes             |
| Boolean           | True or false                | Boolean              | -                    | Yes             |
| Integer           | Number without decimal       | Number               | `$int`               | Yes             |
| Floating point    | Number with decimal          | Number               | `$flt`               | Yes             |
| Geo-coordinates   | Longitude and latitude       | \[Number, Number\]   | `$geo`               | Yes             |
| Date              | Date and time (ms precision) | Number               | `$dt`, `$tm`, `$tms` | Yes             |
| Array             | Array of values              | \[x, y, z\]          | -                    | -               |

Let's go through each of these in turn, providing some examples as we go:

### Null

Tracking a Null value for a given field is straightforward:

{% highlight javascript %}
{
    returns_id: null
}
{% endhighlight %}

### String

Tracking a String is easy:

{% highlight javascript %}
{
    product_id: 'ASO01043' // Or "ASO01043"
}
{% endhighlight %}

### Boolean

Tracking a Boolean is also straightforward:

{% highlight javascript %}
{
    trial: true
}
{% endhighlight %}

### Integer

To track an Integer, use a JavaScript Number but add a type suffix like so:

{% highlight javascript %}
{
    in_stock$int: 23
}
{% endhighlight %}

**Warning:** if you do not add the `$int` type suffix, Snowplow will assume you are tracking a Floating point number.

### Floating point

To track a Floating point number, use a JavaScript Number; adding a type suffix is optional:

{% highlight javascript %}
{
    price$flt: 4.99,
    sales_tax: 49.99 // Same as $sales_tax:$flt
}
{% endhighlight %}

### Geo-coordinates

Tracking a pair of Geographic coordinates is done like so:

{% highlight javascript %}
{
    check_in$geo: [40.11041, -88.21337] // Lat, long
}
{% endhighlight %}

Please note that the datatype takes the format **latitude** followed by **longitude**. That is the same order used by services such as Google Maps.

**Warning:** if you do not add the `$geo` type suffix, then the value will be incorrectly interpreted by Snowplow as an Array of Floating points.

### Date

Snowplow Dates include the date _and_ the time, with milliseconds precision. There are three type suffixes supported for tracking a Date:

* `$dt` - the Number of days since the epoch
* `$tm` - the Number of seconds since the epoch
* `$tms` - the Number of milliseconds since the epoch. This is the default for JavaScript Dates if no type suffix supplied

You can track a date by adding either a JavaScript Number _or_ JavaScript Date to your `properties` object. The following are all valid dates:

{% highlight javascript %}
{
    birthday$dt: new Date(1980,11,10), // Sent to Snowplow as birthday$dt: 3996
    birthday2$dt: 3996, // ^ Same as above

    registered$tm: new Date(2013,05,13,14,20,10), // Sent to Snowplow as registered$tm: 1371129610
    registered2$tm: 1371129610, // Same as above

    last_action$tms: 1368454114215, // Accurate to milliseconds
    last_action2: new Date() // Sent to Snowplow as last_action2$tms: 1368454114215
}
{% endhighlight %}

Note that the type prefix only indicates how the JavaScript Number sent to Snowplow is interpreted - all Snowplow Dates are stored to milliseconds precision (whether or not they include that level of precision).

**Two warnings:**

1. If you specify a JavaScript Number but do not add a valid Date suffix (`$dt`, `$tm` or `$tms`), then the value will be incorrectly interpreted by Snowplow as a Number, not a Date
2. If you specify a JavaScript Number but add the wrong Date suffix, then the Date will be incorrectly interpreted by Snowplow, for example:

{% highlight javascript %}
{
    last_ping$dt: 1371129610 // Should have been $tm. Snowplow will interpret this as the year 3756521449
}
{% endhighlight %}

### Arrays

You can track an Array of values of any data type other than Null.

Arrays must be homogeneous - in other words, all values within the Array must be of the same datatype. This means that the following is **not** allowed:

{% highlight javascript %}
{
    sizes: ['xs', 28, 'l', 38, 'xxl'] // NOT allowed
}
{% endhighlight %}

By contrast, the following are all allowed:

{% highlight javascript %}
{
    sizes: ['xs', 's', 'l', 'xl', 'xxl'],
    session_starts$tm: [1371129610, 1064329730, 1341127611],
    check_ins$geo: [[-88.21337, 40.11041], [-78.81557, 30.22047]]
}
{% endhighlight %}

<h2><a name="help">4. Getting help</a></h2>

As always, if you do run into any issues or don't understand any of the above guide, please do get in touch with us via [the usual channels] [talk-to-us].

And if you have any ideas or feedback for Snowplow' custom unstructured events, do please share them, either in the comments below or through the usual channels.

[snowplow-083-blog]: /blog/2013/05/14/snowplow-0.8.3-released-with-unstructured-events
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
