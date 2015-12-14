---
layout: post
title: SnowCannon - a node.js collector for Snowplow
title-short: SnowCannon
author: Alex
category: Releases
tags: [node.js]
---

We are hugely excited to introduce [SnowCannon] [snowcannon-on-github], a Node.js collector for Snowplow, authored by [@shermozle] (http://twitter.com/shermozle).

SnowCannon is an alternative collector to the default cloudfront collector included with Snowplow. It offers a number of significant advantages over the Cloudfront connector:

1. It allows the use of 3rd party cookies. In particular, this makes it possible to track usage across multiple domains
2. It enables real-time analytics. (This is not possible with the Cloudfront-enabled collector, where there's a 20-30 minute delay between the javascript tracking event and the associated log being written to S3.)

To learn more about SnowCannon, visit the [Github repo] [snowcannon-on-github].

SnowCannon is the first user-contributed module for Snowplow, and we are delighted to see community members working to build out the Snowplow platform. There are other contributions in the works, including a Snowplow IOS client, that we hope to be announcing shortly.

To encourage users to extend Snowplow, we've architected Snowplow in a module way, to enable developers to swap out elements in the Snowplow stack with their own elements or complimenet those already in the stack with parallel implementations. Learn more about the Snowplow architecture [here] [technical-architecture].

[snowcannon-on-github]: https://github.com/shermozle/SnowCannon
[technical-architecture]: /product/technical-architecture.html
