---
layout: post
title: Snowplow 0.4.7 released with additional JavaScript tracking options
title-short: Snowplow 0.4.7
tags: [snowplow, ecommerce, multi-site, javascript, release]
author: Alex
category: Releases
---

We have just released Snowplow version **0.4.7**. This release bumps the Snowplow JavaScript tracker to version **0.6**, with two significant new features:

1. The ability to set a site ID for your tracking - useful for multi-site publishers
2. The ability to log ecommerce transactions - useful for merchants wanting to track orders

A huge thanks to community member [Simon Andersson] [ramn] from [Qwaya] [qwaya] for contributing the ecommerce tracking functionality - thank you Simon!

We'll take a look at both of these new features in turn:

## Site ID

The Snowplow JavaScript tracker now lets you set a site identifier before you start logging events. The new method for this is called `setSiteId()` - it takes one argument, the identifier you have assigned to this site. For example:

{% highlight javascript %}
_snaq.push(['setAccount', 'd3rkrsqld9gmqf']);
_snaq.push(['setSiteId', 'CFe23a']);
_snaq.push(['trackPageView']);
{% endhighlight %}

The querystring passed to your Snowplow collector will now include the following parameter:

    ...&said=CFe23a&...

where `said` stands for _Site or App ID_ - because we plan on using the same parameter for mobile and desktop app tracking as well.
<!--more-->

This new feature should be helpful for anyone running multiple sites (or perhaps clients) against the same Snowplow collector - it means that you can easily partition your Snowplow events by site, whilst still being able to run cross-site analyses should you so wish.

Note that we haven't yet added extracting `said` to our ETL process, but we have an [open ticket for this] [said-etl].

## Ecommerce transactions

To date, we have been analysing e-commerce transactions using Snowplow by:

* Logging every _product add to basket_ event
* Logging every _product remove from basket_ event
* Netting these events off to determine the final contents of the order

This approach works, but it adds complexity in the analysis step. Happily community member Simon Andersson has contributed an alternative solution: dedicated Snowplow e-commerce transaction tracking, similar to the functionality found in the Google Analytics JavaScript API.

The idea is that you add the new tracking code to your shop's checkout confirmation page, so that the completed order can be sent to Snowplow. A complete example of the new tracking code looks like this:

{% highlight javascript %}
var orderId = 'order-123';

// addTrans sets up the transaction, should be called first.
_snaq.push(['addTrans',
  orderId,                // order ID - required
  '',                     // affiliation or store name
  '8000',                 // total - required
  '',                     // tax
  '',                     // shipping
  '',                     // city
  '',                     // state or province
  ''                      // country
  ]);

// addItem is called for each item in the shopping cart.
_snaq.push(['addItem',
  orderId,                // order ID - required
  '1001',                 // SKU - required
  'Blue t-shirt',         // product name
  '',                     // category
  '2000',                 // unit price - required
  '2'                     // quantity - required
  ]);
_snaq.push(['addItem',
  orderId,                // order ID - required
  '1002',                 // SKU - required
  'Red shoes',            // product name
  '',                     // category
  '4000',                 // unit price - required
  '1'                     // quantity - required
  ]);

// trackTrans sends the transaction to Snowplow tracking servers.
// Must be called last to commit the transaction.
_snaq.push(['trackTrans']);
{% endhighlight %}

The above example creates an order (aka "transaction") with ID `order-123` and then adds two line items (two blue t-shirts and one pair of red shoes) as line items to the order. The final `trackTrans` call sends this complete order to Snowplow as three separate events - one each for the order and its line items.

This new functionality should be useful for anybody who wants to track orders transacted in a online shopping cart such as Magento, PrestaShop or Spree.

Note that we haven't yet added extracting these e-commerce orders to our ETL process, but we have an [open ticket for this] [ecomm-etl].

## Upgrading

We have made the minified JavaScript tracker version 0.6 available on this URL:

    http://d1fc8wv8zag5ca.cloudfront.net/0.6/sp.js

There are no breaking changes with the previous version 0.5, so you can upgrade your existing Snowplow JavaScript tracker without issue.

Note that we have now added versioning to the JavaScript tracker's URL. This is because we have "breaking changes" to the JavaScript tracker in the pipeline (see e.g. issues [#29] [issue-29] and [#32] [issue-32]).

## Thanks

A final note to say thanks again to [Simon Andersson] [ramn] for contributing the ecommerce tracking functionality! Community contributors like Simon A and Simon R(umble) are helping us to quickly make the Snowplow vision a reality.

And of course, we welcome contributions across the five Snowplow sub-systems. If you would like help implementing a new tracker, trying a different ETL approach or loading Snowplow events into an alternative database, please [get in touch] [contact]!

[ramn]: https://github.com/ramn
[qwaya]: http://www.qwaya.com
[said-etl]: https://github.com/snowplow/snowplow/issues/33
[ecomm-etl]: https://github.com/snowplow/snowplow/issues/34
[issue-29]: https://github.com/snowplow/snowplow/issues/29
[issue-32]: https://github.com/snowplow/snowplow/issues/32
[contact]: mailto:contribute@snowplowanalytics.com
