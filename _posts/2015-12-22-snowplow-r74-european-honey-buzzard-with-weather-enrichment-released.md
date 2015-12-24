---
layout: post
title: Snowplow 74 European Honey Buzzard with Weather Enrichment released
title-short: Snowplow 74 European Honey Buzzard
tags: [snowplow, weather, openweathermap, enrichment]
author: Anton
category: Releases
---

We are pleased to announce the release of Snowplow release 74 European Honey Buzzard. This release adds a Weather Enrichment to the Hadoop pipeline - making Snowplow the first event analytics platform with built-in weather analytics!

The rest of this post will cover the following topics:

1. [Introducing the weather enrichment](/blog/2015/12/22/snowplow-r74-european-honey-buzzard-with-weather-enrichment-released#introducing)
2. [Configuring the weather enrichment](/blog/2015/12/22/snowplow-r74-european-honey-buzzard-with-weather-enrichment-released#configuring)
3. [Upgrading](/blog/2015/12/22/snowplow-r74-european-honey-buzzard-with-weather-enrichment-released#upgrading)
4. [Getting help](/blog/2015/12/22/snowplow-r74-european-honey-buzzard-with-weather-enrichment-released#help)
5. [Upcoming releases](/blog/2015/12/22/snowplow-r74-european-honey-buzzard-with-weather-enrichment-released#roadmap)

![european-honey-buzzard][european-honey-buzzard]

<!--more-->

<h2 id="introducing">1. Introducing the weather enrichment</h2>

Snowplow has a steadily growing collection of [configurable event enrichments] [snowplow-enrichments] - from marketing campaign attribution through geo-location to custom JavaScript. But the most-requested enrichment remains a Weather Enrichment: specifically, using the time and geo-location of each event to retrieve the weather and attach it to the event as a context, ready for later analysis.

There is a strong body of research to suggest that the weather is a major influence on the behavior of your end-users, for an example see the paper [The Effect of Weather on consumer Spending] [weather-paper] (Murray, Di Muro, Finn, Leszczyc, 2010). To be able to perform these kinds of analyses, it's critical to be able to attach the correct weather to each event prior to storing and analyzing those events in Redshift, Spark or similar.

To date, enterprising analysts have needed to manually integrate a weather lookup into their JavaScript event tracking - see this excellent tutorial by Simo Ahava for [adding weather as a custom dimension in Google Analytics] [ga-weather-post]. To make things much simpler for Snowplow users, we have now implemented a weather enrichment, powered by our [Scala Weather library] [scala-weather-post], which:

* Runs inside our Snowplow Enrichment process
* Looks up the weather for each event from [OpenWeatherMap.org] [openweathermap]
* Caches the weather for this time and place to minimize the number of requests to OpenWeatherMap.org
* Adds the weather represented by [org.openweathermap/weather/jsonschema/1-0-0] [weather-schema] to the event's `derived_contexts`

Note that this release only adds this enrichment for the Snowplow Hadoop pipeline; we will be adding this to the Kinesis pipeline in the next release of that pipeline.

<h2 id="configuring">2. Configuring the weather enrichment</h2>

To use the new Weather Enrichment functionality you need to:

1. Obtain an OpenWeatherMap.org [API key] [owm-signup] to perform historical requests. Note that you will need to subscribe to a paid plan for historical data
2. [Enable the MaxMind IP lookups enrichment] [maxmind-enrichment-wiki] so that each event has the user's geo-location attached
3. [Configure the weather enrichment] [weather-enrichment-wiki] with your API key, preferred geo-precision and other parameters

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

To go through each of these settings in turn:

* `apiKey` is your key you need to obtain from OpenWeatherMap.org
* `cacheSize` is the number of requests the underlying Scala Weather client should store. The number of requests for your plan, plus 1% for errors, should work well
* `timeout` is the time in seconds after which request should be considered failed. Notice that failed weather enrichment will cause your whole enriched event to end up in the bad bucket
* `apiHost` is set to one of several available API hosts - for most cases `history.openweathermap.org` should be fine
* `geoPrecision` is the fraction of one to which geo coordinates will be rounded for storing in the cache. Setting this to 1 gives you ~60km inaccuracy (worst case), the most precise value of 10 gives you ~6km inaccuracy (worst case)

<h2 id="upgrading">3. Upgrading</h2>

To take advantage of this new enrichment, update the "hadoop_enrich" jar version in the "emr" section of your configuration YAML:

{% highlight yaml %}
  versions:
    hadoop_enrich: 1.4.0 # WAS 1.3.0
    hadoop_shred: 0.6.0 # UNCHANGED
    hadoop_elasticsearch: 0.1.0 # UNCHANGED
{% endhighlight %}

Make sure to add a `weather_enrichment_config.json` configured as above into your `enrichments` folder too.

Finally, if you are using Snowplow with Amazon Redshift, you will need to deploy the following table into your database:

* [`org.openweathermap/weather_1.sql`] [weather-ddl]

<h2 id="help">4. Getting help</h2>

For more details on this release, please check out the [R74 European Honey Buzzard release notes][r74-release] on GitHub. Specific documentation on the new enrichment is available here:

* The [Weather enrichment] [weather-enrichment-wiki] page

If you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

<h2 id="roadmap">5. Upcoming releases</h2>

By popular demand, we are adding a section to our release blog posts to trail upcoming Snowplow releases. Note that these releases are always subject to change between now and the actual release date.

Upcoming releases are:

* [Release 75 Long-Legged Buzzard] [r75-milestone], which adds support for ingesting events from SendGrid and Urban Airship into Snowplow
* [Release 76 Bird TBC] [r76-milestone], which will refresh our EmrEtlRunner app, including updating Snowplow to using the EMR 4.x AMI series
* [Release 77 Bird TBC] [r77-milestone], which will bring the Kinesis pipeline up-to-date with the most recent Scala Common Enrich releases. This will also include click redirect support in the Scala Stream Collector

[european-honey-buzzard]: /assets/img/blog/2015/12/european-honey-buzzard.png
[snowplow-enrichments]: https://github.com/snowplow/snowplow/wiki/Configurable-enrichments

[scala-weather-post]: /blog/2015/12/13/scala-weather-0.1.0-released/
[weather-paper]: http://www.kylemurray.com/papers/MDFP_JRCS2010.pdf
[openweathermap]: http://openweathermap.org/
[owm-signup]: http://home.openweathermap.org/users/sign_up
[ga-weather-post]: http://www.simoahava.com/web-development/universal-analytics-weather-custom-dimension/

[weather-schema]: http://iglucentral.com/schemas/org.openweathermap/weather/jsonschema/1-0-0
[weather-enrichment-wiki]: https://github.com/snowplow/snowplow/wiki/Weather-enrichment
[maxmind-enrichment-wiki]: https://github.com/snowplow/snowplow/wiki/IP-lookups-enrichment

[weather-enrichment-config]: https://github.com/snowplow/snowplow/blob/feature/weather/3-enrich/config/enrichments/weather_enrichment_config.json

[weather-ddl]: https://raw.githubusercontent.com/snowplow/snowplow/master/4-storage/redshift-storage/sql/org.openweathermap/weather_1.sql

[r74-release]: https://github.com/snowplow/snowplow/releases/tag/r74-european-honey-buzzard
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

[r75-milestone]: https://github.com/snowplow/snowplow/milestones/Release%2075%20%5BHAD%5D%20Long-Legged%20Buzzard
[r76-milestone]: https://github.com/snowplow/snowplow/milestones/Release%2076%20%5BCLI%5D%20Bird%20TBC
[r77-milestone]: https://github.com/snowplow/snowplow/milestones/Release%2077%20%5BKIN%5D%20Bird%20TBC
