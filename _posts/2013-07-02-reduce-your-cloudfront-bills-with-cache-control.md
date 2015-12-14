---
layout: post
title: Reduce your Cloudfront costs with cache control
tags: [amazon, cloudfront, cdn, cache control]
author: Yali
category: Other
---

One of the reasons Snowplow is very popular with very large publishers and online advertising networks is that the cost of using Snowplow to track user behavior across your website or network is significantly lower than with our commercial competitors, and that difference becomes more pronounced as the number of users and events you track per day increases.

We've been very focused on reducing the cost of running Snowplow further. Most of our efforts have focused on EMR costs (see especially last month's [0.8.6 release](/blog/2013/06/03/snowplow-0.8.6-released-with-performance-improvements/)), as EMR costs tend to make up the bulk of Snowplow users AWS bills. However, for Snowplow uses tracking billions of events per month, Cloudfront costs also become significant.

In this post, we explain how to use browser caching to significantly reduce the size of your Cloudfront bills.

1. [Understanding Cloudfront costs and the potential savings](/blog/2013/07/02/reduce-your-cloudfront-bills-with-cache-control/#costs)
2. [How to update your files in S3 to get them to cache in your users' browsers](/blog/2013/07/02/reduce-your-cloudfront-bills-with-cache-control/#update)

![money] [money]

<!--more-->

<h2><a name="costs">Understanding Cloudfront costs and the potential savings</a></h2>

Snowplow users rack up Cloudfront costs because both the Snowplow Javascript file `sp.js` and the `i` pixel are served from Cloudfront. A straightforward way of reducing your Cloudfront costs is to encourage the browsers of users who visit the websites you are tracking to cache `sp.js`. Because this file does not change frequently (it only changes on specific Snowplow upgrades), there is no need for the browser to reload it with each new page view. By getting browsers to cache the file, so that it only loads once per browser (i.e. once per visitor) rather than once per page view, your Cloudfront fees should drop notably. Take for example, an example ad network serving that uses Snowplow to track ad impressions, and serves 30 billion ads per month on 10 billion page views, across a network of 150M uniques.

If the ad network does not setup `sp.js` so that it is cached on visitor's browsers, `sp.js` will be reloaded with every page view. `sp.js` is 32 kilobytes in size, and Cloudfront charges a minimum of $0.12 per Gigabyte served + $0.0075 per 10k requests. Therefore, the monthly cost of serving `sp.js` will be:

<p style="text-align:center">
	`32/1048576 xx (10xx10^9) xx $0.12 + (10xx10^9)/10000 xx $0.0075 = $44121`
</p>

In contrast, if `sp.js` is only requested once per browser i.e. 150M times per month, instead of 10Bn, the cost will be

<p style="text-align:center">
	`32/1048576 xx 150xx10^6 xx $0.12 + (150xx10^6)/10000 xx $0.0075 = $662`
</p>

That's a tidy saving of reduction in Cloudfront cost of 98.5%, from $44k to only $662 per month!

<h2><a name="update">How to update your files in S3 to get them to cache in y our users' browsers</a></h2>

In order to get browsers to cache `sp.js`, we need to set the `Cache control max-age` property on the `sp.js` object. This instructs browsers to keep a local copy of `sp.js` cached, and defines the time period over which it should be cached.

To set this property, we go into the AWS S3 console, identify `sp.js`, right click on it and select **Properties**. Click on the **Metadata** drop down and then click **Add more metadata**:

![add-more-metadata] [properties-filled-in.png]

In the keys dropdown select **Cache control**. In the values field enter `max-age=` and then a value for the lifetime of `sp.js`. In our case, we've set it to 10 years i.e. 315,360,000 seconds.

Save the changes. Note: if you are editing a file in S3 that is already in Cloudfront, you will need to [invalidate it] (http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html#invalidating-objects-console), so that Cloudfront fetches the new version (with the `Cache control max-age` property set) to the edge locations, for loading into your visitors browsers.

### A note distinguishing between caching in Cloudfront edge locations, and the user browser

The above property sets the length of time that `sp.js` should be cached in the Cloudfront Edge location **and** the user browser.

For our purposes, that is fine. However, it is the fact that the object is cached in the user's browser (rather than the Cloudfront edge location) that results in the desired cost saving.


### A note about versioning the cached file

In the event that you update `sp.js` (e.g. because you have upgraded to a newer version of Snowplow), you will want your visitors to reload the new version of `sp.js`. To ensure this happens, we recommend uploading a newer version of `sp.js` to a new subfolder in your S3 bucket, and then updating your Snowplow tags to the updated URL. In our case, for example, we host version 0.11.1 of `sp.js` on:

	http(s)://d1fc8wv8zag5ca.cloudfront.net/0.11.1/sp.js

And version 0.11.2 on:

	http(s)://d1fc8wv8zag5ca.cloudfront.net/0.11.2/sp.js

[properties-filled-in.png]: /assets/img/blog/2013/07/properties-filled-in.png
[money]: /assets/img/blog/2013/07/breaking-bad-money.jpg
