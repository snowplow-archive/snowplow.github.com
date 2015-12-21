---
layout: post
title: Snowplow 74 BIRD-TBC released
title-short: Snowplow 74 BIRD-TBC
tags: [snowplow, weather, enrichment]
author: Alex
category: Releases
---

We are pleased to announce the release of Snowplow version 74 BIRD-TBC.
This release adds click redirect support in the Scala Stream Collector and
weather enrichment.
The rest of this post will cover the following topics:

1. [Weather enrichment](/blog/2015/12/xx/snowplow-r74-BIRD-TBC-released#weather)
2. [Click redirect support](/blog/2015/12/xx/snowplow-r74-BIRD-TBC-released#click)
3. [Upgrading](/blog/2015/12/xx/snowplow-r74-BIRD-TBC-released#upgrading)
4. [Getting help](/blog/2015/12/xx/snowplow-r74-BIRD-TBC-released#help)
5. [Upcoming releases](/blog/2015/12/xx/snowplow-r74-BIRD-TBC-released#roadmap)

<!--more-->

<h2 id="weather">1. Weather enrichment</h2>

For a [long time] [weather-issue], one of the most-requested and still unimplemented Snowplow enrichments was weather enrichment.
Basic idea of weather enrichment is that taking geographical coordinates and exact time event occur,
we can receive all information about weather conditions in which that exact event happened.
This information opens an opportunity to build incredible useful data models
which can help to [understand] [weather-paper] behavior of your product's audience in context of weather.

To use weather enrichment functionality you need to:

* Obtain OpenWeatherMap.org [API key] [owm-price] to perform historical requests. Note that you need to subscribe paid plan for historical data. Free key and common subsription plan both doesn't provide access to historical data.
* [Enable MaxMind enrichment] [maxmind-enrichment-wiki] to obtain user geographical coordinates
* [Configure weather enrichment] [weather-enrichemnt-wiki] with your API key, preferred geo precision and other parameters

The [example configuration] [weather-enrichment-config] JSON for this enrichment is as follows:

{% highlight json %}
{
    "schema": "iglu:com.snowplowanalytics.snowplow.enrichments/weather_enrichment_config/jsonschema/1-0-0",

    "data": {
        "enabled": true,
        "vendor": "com.snowplowanalytics.snowplow.enrichments",
        "name": "weather_enrichment_config",
        "parameters": {
            "apiKey": "{{KEY}}",
            "cacheSize": 2550,
            "geoPrecision": 1,
            "apiHost": "history.openweathermap.org",
            "timeout": 5
        }
    }
}
{% endhighlight %}

We recommend you to caclulate cache size with following formula: `(requests /
nodes + 1%) / run`, where `requests` is amount of requests available on your
OpenWeatherMap.org plan (5000 for starter plan), `nodes` is amount of worker
nodes on your hadoop cluster, `run` is amount of runs of your enrichment per day
and `1%` is just reserved space for errors, which should prevent client to repeat
unsuccessful requests. So, for single run per day on starter subscription plan
and two-nodes EMR cluster cache size should be `(5000 / 2 + 1%) / 1 = 2550`. 

<h2 id="click">2. Click redirect</h2>

Previously [added] [click-tracking] in R72 Great Spotted Kiwi.
TODO

<h2 id="upgrading">3. Upgrading</h2>

TODO

<h2 id="help">4. Getting help</h2>

For more details on this release, please check out the [R74 BIRD-TBC release notes][r74-release] on GitHub.
Specific documentation on the new features is available here:

* The [Weather enrichment] [weather-enrichment-wiki] page

If you have any questions or run into any problems, please raise an [issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

<h2 id="roadmap">5. Upcoming releases</h2>

TODO

[weather-issue]: https://github.com/snowplow/snowplow/issues/456
[scala-weather-post]: http://snowplowanalytics.com/blog/2015/12/13/scala-weather-0.1.0-released/
[owm-price]: http://openweathermap.org/price
[weather-enrichment-wiki]: https://github.com/snowplow/snowplow/wiki/Weather-enrichment
[maxmind-enrichemnt-wiki]: https://github.com/snowplow/snowplow/wiki/IP-lookups-enrichment
[weather-paper]: http://www.kylemurray.com/papers/MDFP_JRCS2010.pdf
[weather-enrichment-config]: https://github.com/snowplow/snowplow/blob/feature/weather/3-enrich/config/enrichments/weather_enrichment_config.json

[click-tracking]: https://github.com/snowplow/snowplow.github.com/blob/master/_posts/2015-10-15-snowplow-r72-great-spotted-kiwi-released.md#1-click-tracking

[r74-release]: https://github.com/snowplow/snowplow/releases/tag/r74-BIRD-TBC
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
