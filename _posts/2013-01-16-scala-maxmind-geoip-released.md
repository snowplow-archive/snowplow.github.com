---
layout: post
title: Scala MaxMind GeoIP library released
title-short: Scala MaxMind GeoIP library
tags: [snowplow, maxmind, geoip, geography, ip address, enrichment]
author: Alex
category: Releases
---

A short blog post this, to announce the release of [**Scala MaxMind GeoIP**] [scala-maxmind-geoip], our Scala wrapper for the MaxMind [Java Geo-IP] [java-lib] library.

We have extracted Scala MaxMind GeoIP from our current (ongoing) work porting our ETL process from Apache Hive to [Scalding] [scalding]. We extracted this as a separate library for two main reasons:

1. **Being good open-source citizens** - as with our [referer-parser] [referer-parser] library, we believe this library willl be useful to the wider community of software developers, not just Snowplow users
2. **Keeping Snowplow's footprint small** - at Snowplow we believe very strongly in building modular, loosely-coupled software. Massive monolithic systems that 'do everything' are a nightmare to test, maintain and extend - so we prefer to build small, standalone components and libraries which we (and the community) can then compose into larger pipelines and processes

On to the library: for Scala developers, the main benefits of using [scala-maxmind-geoip] [scala-maxmind-geoip] over the MaxMind Java library are:

* **Easier to setup/test** - the SBT project definition automatically pulls down the latest MaxMind Java code and `GeoLiteCity.dat`
* **Better type safety** - the MaxMind Java library is somewhat null-happy. This library uses Option boxing wherever possible
* **Better performance** - as well as or instead of using MaxMind's own caching (`GEOIP_MEMORY_CACHE`), you can also configure an LRU (Least Recently Used) cache of variable size

That's it! And if you have any problems with this Scala library for MaxMind GeoIP lookups, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[scala-maxmind-geoip]: https://github.com/snowplow/scala-maxmind-geoip
[referer-parser]: https://github.com/snowplow/referer-parser
[java-lib]: http://www.maxmind.com/download/geoip/api/java/
[scalding]: https://github.com/twitter/scalding

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
