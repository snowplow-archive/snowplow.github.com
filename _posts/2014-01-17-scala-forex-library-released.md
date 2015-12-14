---
layout: post
title: Scala Forex library by wintern Jiawen Zhou released
title-short: Scala Forex library
tags: scala forex currency exchange rate
author: Alex
category: Releases
---

We are proud to announce the release of our new [Scala Forex] [scala-forex] library, developed by [Snowplow wintern Jiawen Zhou] [jiawen-intro]. Jiawen joined us in the Snowplow offices in London this winter and was tasked with taking Scala Forex from a README file to an enterprise-strength Scala library for foreign exchange operations. One month later and we are hugely excited to be sharing her work with the community!

Scala Forex is a high-performance Scala library for performing exchange rate lookups and currency conversions, leveraging the excellent [Open Exchange Rates web service] [ore-signup]. We are excited to be working with [Open Exchange Rates] [ore-signup], Snowplow's second external data provider after MaxMind.

In Jiawen's own words:

![jiawen-img] [jiawen-img]

In the rest of this post we will cover:

1. [Why we wrote this library](/blog/2014/01/17/scala-forex-library-released/#rationale)
2. [How the library is architected](/blog/2014/01/17/scala-forex-library-released/#architecture)
3. [How to use the library](/blog/2014/01/17/scala-forex-library-released/#usage)
4. [Thanks](/blog/2014/01/17/scala-forex-library-released/#thanks)

<!--more-->

<div class="html">
<h2><a name="rationale">Why we wrote this library</a></h2>
</div>

Late last year a Snowplow customer asked us if we could add currency conversions into their custom Snowplow implementation. This seemed like a great idea to explore, and we started to sketch out an approach:

1. Add a new currency field into our ecommerce transaction tracking, to indicate the currency of the transaction (see [this ticket] [js-currency] for the JavaScript)
2. In our Enrichment process, convert all transactions to the Snowplow user's "base currency"
3. In our Storage targets, store both the original transaction value and the value converted to the user's base currency, for easy revenue analysis

The big missing piece for the above was a Scala library to handle currency conversions. We had some very specific requirements for this library:

1. It had to support close to all of the world's national currencies
2. It had to support historical ("end of day") currency conversions. This is because a Snowplow Enrichment process can be run over many days or months of historical event data
3. It had to minimize the number of external web service calls. Running in an environment like Hadoop or Kinesis, we cannot afford to call a web service each time for millions of individual events

Custom building a Scala library calling out to the [Open Exchange Rates web service] [ore-signup] seemed the right way to meet these requirements, and so Scala Forex was born!

<div class="html">
<h2><a name="architecture">How the library is architected</a></h2>
</div>

Scala Forex makes heavy use of the Joda-Money and Joda-Time libraries in its public API. These are enterprise-grade Java libraries for working with currency, money and time, and we were keen not to re-invent the wheel!

Under the covers, Jiawen's library makes heavy use of two "least recently used" (LRU) caches, one to hold historic exchange rates and one to hold recent rates. It is these LRU caches which minimize calls out to the [Open Exchange Rates web service] [ore-signup], which is critical for performance (and cost) reasons.

The library is thoroughly tested using Specs2 (including Specs2 tables), and Mockito to verify cache behaviour. The library is integrated into Travis CI for continuous testing.

<div class="html">
<h2><a name="usage">How to use the library</a></h2>
</div>

Using the library is straightforward: you initialize Scala Forex with general and OER-specific configuration, and then use a simple Scala DSL to both look up exchange rates and perform currency conversions.

For detailed guidance on configuring the library, please see the [Configuration section] [readme-config] of the Scala Forex README.

<div class="html">
<h3>Exchange rate lookups</h3>
</div>

Once initialized, an exchange rate lookup is as simple as:

{% highlight scala %}
val jpy2gbp = fx.rate("JPY").to("GBP").nowish
{% endhighlight %}

Here's a slightly more complex example, of looking up a historic rate:

{% highlight scala %}
// Base currency is USD
val tradeDate = new DateTime(2011, 3, 13, 11, 39, 27, 567, DateTimeZone.forID("America/New_York"))
val usd2yen = fx.rate.to("JPY").at(tradeDate)
{% endhighlight %}

For detailed help on currency lookups, please see the [Rate Lookup section] [readme-rate] of the Scala Forex README.

<div class="html">
<h3>Currency conversions</h3>
</div>

A currency conversion can be as simple as:

{% highlight scala %}
// Base currency is GBP
val gbpPriceInEuros = fx.convert(9.99).to("EUR").now
{% endhighlight %}

Here's a slightly more complex example, of converting a trade using the end of day rate:

{% highlight scala %}
val eodDate = new DateTime(2011, 3, 13, 0, 0)
val tradeInYen = fx.convert(10000, "GBP").to("JPY").at(eodDate)
{% endhighlight %}

For detailed help on currency conversions, please see the [Currency Conversion section] [readme-convert] of the Scala Forex README.

<div class="html">
<h2><a name="thanks">Thanks</a></h2>
</div>

And that's it; huge thanks to Jiawen Zhou for delivering such a sophisticated library in such a short time - and in a language she had never used before!

We hope that you find the Scala Forex library helpful - and stay tuned for when we can integrate it into Snowplow as part of our planned new currency enrichment capabilities!

[scala-forex]: https://github.com/snowplow/scala-forex
[ore-signup]: https://openexchangerates.org/signup?r=snowplow

[jiawen-intro]: /blog/2013/12/20/introducing-our-snowplow-winterns/
[jiawen-img]: /assets/img/blog/2014/01/jiawen-scala-forex.png

[js-currency]: https://github.com/snowplow/snowplow-javascript-tracker/issues/34

[readme-config]: https://github.com/snowplow/scala-forex#22-configuration
[readme-rate]: https://github.com/snowplow/scala-forex#31-rate-lookup
[readme-convert]: https://github.com/snowplow/scala-forex#32-currency-conversion
