---
layout: post
title: Snowplow 0.4.8 released
title-short: Snowplow 0.4.8
tags: [snowplow, ecommerce, multi-site, release]
author: Alex
category: Releases
---

We have just released Snowplow version **0.4.8**, with a set of enhancements to the existing Hive deserializer:

1. The Hive deserializer now supports Amazon's new CloudFront log file format (launched 12 September 2012) as well as the older format
2. The Hive deserializer now supports a tracking pixel called simply `i` (saving some characters versus `ice.png`) ([issue #35] [issue-35])
3. The Hive deserializer now works if the CloudFront distribution has Forward Query String = yes ([issue #39] [issue-39])
4. The Hive deserializer no longer dies if the calling page's querystring is malformed

Many thanks to community member [Michael Tibben] [mtibben] from [99designs] [99designs] in Melbourne for contributing the Forward Query String = yes fix!

## New CloudFront log file format

On 12th September 2012, Amazon [rolled out a new CloudFront log file format] [cf-announcement], adding three additional fields onto the end of each line:

* **cs(Cookie)**, the cookie header in the request (if any). Logging of this field is optional.
* **x-edge-result-type**, the result type of each HTTP(s) request (for example, cache hit/miss/error).
* **x-edge-request-id**, an encrypted string that uniquely identifies a request to help AWS troubleshoot/debug any issues.

As always, please consult the Amazon CloudFront [Developer Guide] [cf-format] for more information on these fields.
<!--more-->

As part of this new **0.4.8** Snowplow release, the Hive deserializer now supports the new CloudFront format as well as the old format: if you deploy the latest version of the deserializer, you should be able to process both old-format and new-format CloudFront logs without issue.

## Support for `i` as the tracking pixel

Currently the Snowplow JavaScript tracker fires a GET request to a tracking pixel called `ice.png`. This works fine, but it makes more sense to call the pixel `i`, for two reasons:

1. We free up 5 extra characters to use for sending data
2. A transparent GIF is smaller to send than a transparent PNG

Thanks to [Simon Rumble] [shermozle] (author of [SnowCannon] [snowcannon]) for pointing this out! In due course we will update the JavaScript tracker and CloudFront collector to implement this change (see issues [#29] [issue-29] and [#25] [issue-25]), but to start off we have added support for `i` to the new version of the Hive deserializer.

This is a small change, but highlights a wider point for Snowplow development: in general, whenever we have a "breaking change" coming upstream, we will try to prepare for this change downstream first, to prevent any disruption to your use of Snowplow.

## Support for Forward Query String = yes

Thanks to [Michael Tibben] [mtibben] from [99designs] [99designs] for spotting that the Hive deserializer does not work if your CloudFront distribution has Forward Query String set to Yes; Michael not only raised the issue but also provided a fix, many thanks Michael!

Most Snowplow users will have Forward Query String in their CloudFront distribution set to No, so this issue will not arise for them; however this fix will be invaluable for anyone who does have it set to Yes. If you want to read more about this, please check out [issue #39] [issue-39].

We're aware that our guide for setting up the CloudFront distribution is a bit out of date (which is how this issue can arise) - we will be refreshing the tracking pixel guide soon ([issue #25] [issue-25])! Many thanks for your patience.

## More robust querystring handling

A small change - we have made the code for extracting marketing attribution more robust. Specifically, the Hive deserializer no longer dies (i.e. throws a non-recoverable `SerDeException`) if the calling page's URL has a malformed querystring.

An example of a malformed querystring would be something like:

    http://www.psychicbazaar.com/2-tarot-cards?n=48?utmsource=GoogleSearch&...

Note the two `?` questionmarks (the second one should be an `&` ampersand). In the case of a malformed querystring like this, the five marketing attribution fields in the Hive output format for this row will all be set to null.

## Deploying the new version

The new version of the Hive deserializer is available from the GitHub repository's [Downloads] [downloads] section as **snowplow-log-deserializers-0.4.8.jar**. If you have any problems running it, please [raise an issue] [issues]!

[issue-25]: https://github.com/snowplow/snowplow/issues/25
[issue-29]: https://github.com/snowplow/snowplow/issues/29
[issue-35]: https://github.com/snowplow/snowplow/issues/35
[issue-39]: https://github.com/snowplow/snowplow/pull/39
[mtibben]: https://github.com/mtibben
[shermozle]: https://github.com/shermozle/
[snowcannon]: https://github.com/shermozle/SnowCannon
[99designs]: http://99designs.com
[cf-announcement]: http://aws.amazon.com/about-aws/whats-new/2012/09/04/cloudfront-support-for-cookies-and-price-classes/
[cf-format]: http://docs.amazonwebservices.com/AmazonCloudFront/latest/DeveloperGuide/AccessLogs.html#LogFileFormat
[issues]: https://github.com/snowplow/snowplow/issues
[downloads]: https://github.com/snowplow/snowplow/downloads
