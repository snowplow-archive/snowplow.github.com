---
layout: post
title: Scala Weather 0.1.0 released
title-short: Scala Weather 0.1.0
tags: [release, weather, scala, openweathermap]
author: Anton
category: Releases
---

We are pleased to announce the release of [Scala Weather] [repo] version 0.1.0.

Scala Weather is a high-performance Scala library for fetching historical, forecast and current weather data from the [OpenWeatherMap API] [owm-api-docs].
We are pleased to be working with [OpenWeatherMap.org] [openweathermap], Snowplow's third external data provider after MaxMind and Open Exchange Rates.

This release post will cover the following topics:

1. [Why we wrote this library](/blog/2015/12/13/scala-weather-0.1.0-released/#rationale)
2. [Usage](/blog/2015/12/13/scala-weather-0.1.0-released/#usage)
3. [The cache client](/blog/2015/12/13/scala-weather-0.1.0-released/#cache)
4. [Getting help](/blog/2015/12/13/scala-weather-0.1.0-released/#help)
5. [Plans for next release](/blog/2015/12/13/scala-weather-0.1.0-released/#roadmap)

<!--more-->

<h2 id="rationale">1. Why we wrote this library</h2>

The [Snowplow] [snowplow-repo] event analytics platform has a growing collection of [configurable event enrichments] [snowplow-enrichments] - from geo-location through custom JavaScript to currency conversions. But the most-requested enrichment still outstanding is a Weather Enrichment: specifically, using the time and geo-location of each event to retrieve the weather and attach it to the event as a context, ready for later analysis. 

To build this enrichment we needed a couple of things first:

1. A reliable weather provider with a robust API. After some experimentation with Wunderground and Yahoo! Weather, we settled on OpenWeatherMap as having the most detailed weather reports and extensive historical data
2. A Scala client for OpenWeatherMap, with sophisticated cache capabilities to minimize the number of API calls when embedded in a Snowplow enrichment process running across millions of events

Scala Weather, then, is our idiomatic Scala client for OpenWeatherMap, and the foundation for the new Weather Enrichment in Snowplow, which we hope to release very soon. But Scala Weather, like our [Scala Forex] [scala-forex] project, has a wider scope than just supporting a new Snowplow enrichment: it has an asynchronous as well as synchronous client, and supports current weather lookups and weather forecasts. We hope you find it useful!

<h2 id="usage">2. Basic usage</h2>

To use Scala Weather you need to [sign up] [owm-signup] to OpenWeatherMap to get your API key.

A free key lets you to perform current weather and forecast lookups; for historical data you'll need [paid plan] [history-plan].

After obtaining an API key, you can create a client:

{% highlight scala %}
import com.snowplowanalytics.weather.providers.openweather.OwmAsyncClient
val client = OwmAsyncClient(YOURKEY)
{% endhighlight %}

`OwmAsyncClient` is the recommended client since it performs all requests asynchronously, using [akka-http] [akka-http] under the hood and returning its response wrapped in `Future`. The other client is the synchronous `OwmCacheClient`, which we'll cover below.

OpenWeatherMap provides several hosts for API with various benefits, which you can pass as the second argument:

+ `api.openweathermap.org` - free access, recommended, used in `OwmAsyncClient` by default
+ `history.openweathermap.org` - paid, history only, used in `OwmCacheClient` by default
+ `pro.openweathermap.org` - paid, faster, SSL-enabled

Both clients have same basic set of methods, grouping by data they return:

+ [forecastById] [forecastbyid-def]
+ [forecastByCoords] [forecastbycoords-def]

+ [currentById] [currentbyid-def]
+ [currentByCoords] [currentbycoords-def]

+ [historyById] [historybyid-def]
+ [historyByName] [historybyname-def]
+ [historyByCoords] [historybycoords-def]

These methods were designed to follow OpenWeatherMap's own API calls as closely as possible. All of these calls receive similar arguments to those described in [OpenWeatherMap API documentation] [owm-api-docs]. For example, to receive a response equivalent to the API call `api.openweathermap.org/data/2.5/weather?lat=35&lon=139&appid=YOURKEY`, run the following code:

{% highlight scala %}
val weatherInLondon: Future[WeatherError \/ Current] = asyncClient.currentByCoords(35, 139)
{% endhighlight %}

`\/` is a [scalaz disjunction] [scalaz-disjunction], which is isomorphic with Scala's native `Either`. Depending on the method name, you will get back one of the following case classes: `Forecast`, `Current` or `History`.

Neither client attempts to pre-validate your request, so you could pass a `start` timestamp greater than `end`, or a negative count or similar. These requests will be sent to API host and handled by OpenWeatherMap, possibly leading to a `WeatherError`.

<h2 id="cache">3. The cache client</h2>

Although `OwmAsyncClient` should be used in most cases, the most interesting functionality - the weather cache - is currently only available in the synchronous `OwmCacheClient`, which we will be using inside the Snowplow enrichment engine.

The `OwmCacheClient`:

* Returns plain `WeatherException \/ OwmResponse`, not wrapped in a `Future`
* Stores previously fetched weather data in its internal [LRU] [lru] cache
* Check for the requested weather in the cache before making a call to OpenWeatherMap

To construct an `OwmCacheClient`, pass along the API key and API host but also three additional arguments: `cacheSize`, `timeout` and `geoPrecision`:

* `cacheSize` determines how many daily weather reports for a location can be stored in the cache before entries start getting evicted
* `timeout` is the time in seconds after which the request to OpenWeatherMap is considered unsuccessful
* `geoPrecision` determines how precise your cache will be from geospatial perspective. More on this below

The `geoPrecision` essentially rounds the decimal places part of the geo coordinate to the specified part of 1. Some example settings:

|  `geoPrecision` |  `fraction` |  `coordinate` |  `result value` |
|:----------------|:------------|:--------------|:----------------|
|  1              |  1/1        |  32.4         |  32.0           |
|  1              |  1/1        |  32.5         |  33.0           |
|  2              |  1/2        |  32.4         |  32.5           |
|  2              |  1/2        |  32.1         |  32.0           |
|  5              |  1/5        |  42.11        |  42.2           |

In the worst precision case (`geoPrecision == 1`), our geo-locations for the weather will be up to ~60km out. But you need to note that the primary sources of weather inaccuracies are not usually distance, but things like urban/suburbian area, or rapid extreme weather changes, or the distance to the closest weather station (hundreds kilometers in some rare cases).

So, you can consider 1 as a good default value; it's strongly discouraged to set it higher than 10.

<h2 id="help">4. Getting help</h2>

For more details on this release, please check out the [Scala Weather 0.1.0] [010-release] release notes on GitHub.

In the meantime, if you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

<h2 id="roadmap">5. Plans for next release</h2>

Although Scala Weather is feature-complete as far as the Snowplow Weather Enrichment is concerned, we still have some plans for it. First, we're exploring ways to improve the cache, to include more dimensions than just basic spatial awareness and time.

If there's a feature you'd like to see, or an alternative weather provider that you'd like to see integrated, then pull requests are very welcome!

[snowplow-repo]: https://github.com/snowplow/snowplow
[snowplow-enrichments]: https://github.com/snowplow/snowplow/wiki/Configurable-enrichments

[historybyid-def]: https://github.com/snowplow/scala-weather/blob/5b22a89ed3ba04598caf7ebf75491a21adf11b28/src/main/scala/com.snowplowanalytics/weather/providers/openweather/Client.scala#L49-L70
[historybyname-def]: https://github.com/snowplow/scala-weather/blob/5b22a89ed3ba04598caf7ebf75491a21adf11b28/src/main/scala/com.snowplowanalytics/weather/providers/openweather/Client.scala#L72-L96
[historybycoords-def]: https://github.com/snowplow/scala-weather/blob/5b22a89ed3ba04598caf7ebf75491a21adf11b28/src/main/scala/com.snowplowanalytics/weather/providers/openweather/Client.scala#L98-L125
[currentbyid-def]: https://github.com/snowplow/scala-weather/blob/5b22a89ed3ba04598caf7ebf75491a21adf11b28/src/main/scala/com.snowplowanalytics/weather/providers/openweather/Client.scala#L147-L155
[currentbycoords-def]: https://github.com/snowplow/scala-weather/blob/5b22a89ed3ba04598caf7ebf75491a21adf11b28/src/main/scala/com.snowplowanalytics/weather/providers/openweather/Client.scala#L157-L166
[forecastbyid-def]: https://github.com/snowplow/scala-weather/blob/5b22a89ed3ba04598caf7ebf75491a21adf11b28/src/main/scala/com.snowplowanalytics/weather/providers/openweather/Client.scala#L127-L135
[forecastbycoords-def]: https://github.com/snowplow/scala-weather/blob/5b22a89ed3ba04598caf7ebf75491a21adf11b28/src/main/scala/com.snowplowanalytics/weather/providers/openweather/Client.scala#L137-L145

[scala-forex]: https://github.com/snowplow/scala-forex

[openweathermap]: http://openweathermap.org/
[owm-api-docs]: http://openweathermap.org/api
[history-plan]: http://openweathermap.org/price
[owm-signup]: http://home.openweathermap.org/users/sign_up

[lru]: https://en.wikipedia.org/wiki/Cache_algorithms#LRU
[scalaz-disjunction]: http://docs.typelevel.org/api/scalaz/stable/7.0.0/doc/scalaz/$bslash$div$minus.html
[akka-http]: http://doc.akka.io/docs/akka-stream-and-http-experimental/1.0/scala.html

[010-release]: http://github.com/snowplow/scala-weather/releases/tag/0.1.0
[issues]: http://github.com/snowplow/scala-weather/issues
[repo]: http://github.com/snowplow/scala-weather

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[snowplow]: http://snowplowanalytics.com
