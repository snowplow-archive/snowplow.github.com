---
layout: post
title: Scala Weather 0.1.0 released
title-short: Scala Weather 0.1.0 released
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
3. [Cache client](/blog/2015/12/13/scala-weather-0.1.0-released/#cache)
4. [Getting help](/blog/2015/12/13/scala-weather-0.1.0-released/#help)
5. [Plans for next release](/blog/2015/12/13/scala-weather-0.1.0-released/#roadmap)

<!--more-->

<div class="html">
<h2><a name="rationale">1. Why we wrote this library</a></h2>
</div>

The [Snowplow] [snowplow-repo] event analytics platform has a growing collection of [configurable event enrichments] [snowplow-enrichments] - from geo-location through custom JavaScript to currency conversions. But the most-requested enrichment still outstanding is a Weather Enrichment: specifically, using the time and geo-location of each event to retrieve the weather and attach it to the event as a context, ready for later analysis. 

To build this enrichment we needed a couple of things first:

* A reliable weather provider with a robust API. After some experimentation with Wunderground and Yahoo! Weather, we settled on OpenWeatherMap as having the most detailed weather reports and extensive historical data
* A Scala client for OpenWeatherMap, with sophisticated cache capabilities to minimize the number of API calls when embedded in a Snowplow enrichment process running across millions of events

Scala Weather, then, is our idiomatic Scala client for OpenWeatherMap, and the foundation for the new Weather Enrichment in Snowplow, which we hope to release very soon. But Scala Weather, like our [Scala Forex] [scala-forex] project, has a wider scope than just supporting a new Snowplow enrichment: it has an asynchronous as well as synchronous client, and supports current weather lookups and weather forecasts. We hope you find it useful!

<h2 id="usage">2. Basic usage</h2>

To use Scala Weather you need to [sign up] [owm-signup] to OpenWeatherMap.org and obtain API key (App ID).
Free key allow you to perform current weather and forecast lookups.
For history data you'll need [paid plan] [history-plan].

After obtaining a key, you can create async client.

{% highlight scala %}
import com.snowplowanalytics.weather.providers.openweather.OwmAsyncClient
val client = OwmAsyncClient(YOURKEY)
{% endhighlight %}

OpenWeatherMap provides several hosts for API for different purposes, host name can be passed as second parameter.
Currently there's three known hosts:

+ api.openweathermap.org - free access, recommended, used in OwmAsyncClient by default
+ history.openweathermap.org - paid, history only, used in OwmCacheClient by default
+ pro.openweathermap.org - paid, more fast, SSL-enabled

`OwmAsyncClient` is preferred client since it will perform all requests asynchronously 
with [akka-http] [akka-http] under the hood and return it's response wrapped in `Future`.
Another client is `OwmCacheClient`, we'll describe it in details further.

Both clients have same basic set of methods, grouping by data they return:

+ [forecastById] [forecastbyid-def]
+ [forecastByCoords] [forecastbycoords-def]

+ [currentById] [currentbyid-def]
+ [currentByCoords] [currentbycoords-def]

+ [historyById] [historybyid-def]
+ [historyByName] [historybyname-def]
+ [historyByCoords] [historybycoords-def]

These methods try to mimic [OpenWeatherMap API] [owm-api-docs] and have identical to OWM API set of arguments and also groued into three
types, which return corresponding types: `Forecast`, `Current`, `History`. 
`Forecast` and `History` consist of some technical details and list of `Weather` objects, which itself are main 
source of information about weather with data like temperature, humidity, clouds et cetera.
`Current` response closely resembles `Weather` too.

For example, to receive response identical to this: ``api.openweathermap.org/data/2.5/weather?lat=35&lon=139&appid=YOURKEY``,
you could run following code:

{% highlight scala %}
val weatherInLondon: Future[WeatherException \/ Current] = client.currentByCoords(51.507f, 0.127f)
{% endhighlight %}

`\/` stands for [scalaz] [scalaz] [disjunction] [scalaz-disjunction], structure isomorphic with Scala native `Either`.
`WeatherException` represents several possible failure cases like timeout or parsing error.

Both clients don't try to prevalidate your request, so you can pass `start` timestamp greater than `end`, negative count and so on.
All these requests will be sent to API host and handled by OpenWeatherMap.
It is possible in future to implement something like `strict` constructor parameter for clients to prevent meaningless and incorrect requests.

<h2 id="cache">3. Cache client</h2>

Although `OwmAsyncClient` should be used in most cases, whole Scala Weather library was written for `OwmCacheClient`,
because it is the one who does all work for Snowplow weather enrichment.
It stores previously fetched weather data in it's internal [LRU] [lru] cache store.

First difference from asynchronous client is that it returns plain `WeatherException \/ OwmResponse`, not wrapped in Future.
In other words, same method calls will be blocking.

Another difference is additional method `getCachedOrRequest(latitude: Float, longitude: Float, timestamp: Int)`
which first tries to search value in cache and only if weather wasn't found fetches it from API host.
This method works only for historical requests, as they are most valuable and we can do only restricted amount of them.

To construct `OwmCacheClient`, you may pass along with key and API host three additional arguments: cacheSize, timeout and geoPrecision.

`cacheSize` determines how many days our client can store.
It's important to note that cache store full days, but not weather data instances.
It means when we're doing history weather lookup for example for December 6, 09:32:12, it will fetch 
and store several `Weather` objects. Then it pick nearest weather instance for requested timestamp and keep all others in cache.
Exact amount of sent `Weather` objects depends on OpenWeatherMap service and how populated that area is.
Usually it sends 8-20 instances, so we have evenly distributed weather data for a whole day.

`timeout` is obviously time in seconds after which request may be considered unsuccessful.
After timeout request will not abandoned however, it will be stored in cache with corresponding error information
and on next request it will be retried. If it wasn't timeout, but parse error it will always return this 
error and will not try to make request again.
That's why we advice you to set `cacheSize` to size of your plan + some space for errors.

`geoPrecision` determines how precise your cache will be from geospatial perspective.
It basically rounds longitude and latitude to specified part of one.
Best way to understand it is to see examples:

|  `geoPrecision` |  `fraction` |  `coordinate` |  `result value` |
| --------------- | ----------- | ------------- | --------------- |
|  1              |  1/1        |  32.4         |  32.0           |
|  1              |  1/1        |  32.5         |  33.0           |
|  2              |  1/2        |  32.4         |  32.5           |
|  2              |  1/2        |  32.1         |  32.0           |
|  5              |  1/5        |  42.11        |  42.2           |

With lowest precision (`geoPrecision` equals 1) in worst case we'll have infelicity about 60km.
But you need to take in account that primary source of weather inaccuracy is usually not just a distance,
but things like urban/suburbian area or big probabilty of extreme weather change for some places on Earth or
distance to closest weather station (hundreds kilometers in some rare cases).
So, 1 considered as good default value. It's strongly discouraged to set it to value above 10.

<h2><a name="help">4. Getting help</a></h2>

For more details on this release, please check out the [Scala Weather 0.1.0] [010-release] on GitHub.

In the meantime, if you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

<h2><a name="roadmap">5. Plans for next release</a></h2>

Although Scala Weather is feature complete now, we still have some plans for it.
First of all, we're exploring ways to improve the cache, so it could have more dimensions than just primitive spatial and time.
Also we'd be happy to implement interfaces to other weather providers if there's any comparable to OpenWeatherMap.


[snowplow-repo]: https://github.com/snowplow/snowplow
[snowplow-enrichments]: https://github.com/snowplow/snowplow/wiki/Configurable-enrichments

[historybyid-def]: https://github.com/snowplow/scala-weather/blob/5b22a89ed3ba04598caf7ebf75491a21adf11b28/src/main/scala/com.snowplowanalytics/weather/providers/openweather/Client.scala#L49-L70
[historybyname-def]: https://github.com/snowplow/scala-weather/blob/5b22a89ed3ba04598caf7ebf75491a21adf11b28/src/main/scala/com.snowplowanalytics/weather/providers/openweather/Client.scala#L72-L96
[historybycoords-def]: https://github.com/snowplow/scala-weather/blob/5b22a89ed3ba04598caf7ebf75491a21adf11b28/src/main/scala/com.snowplowanalytics/weather/providers/openweather/Client.scala#L98-L125
[currentbyid-def]: https://github.com/snowplow/scala-weather/blob/5b22a89ed3ba04598caf7ebf75491a21adf11b28/src/main/scala/com.snowplowanalytics/weather/providers/openweather/Client.scala#L147-L155
[currentbycoords-def]: https://github.com/snowplow/scala-weather/blob/5b22a89ed3ba04598caf7ebf75491a21adf11b28/src/main/scala/com.snowplowanalytics/weather/providers/openweather/Client.scala#L157-L166
[forecastbyid-def]: https://github.com/snowplow/scala-weather/blob/5b22a89ed3ba04598caf7ebf75491a21adf11b28/src/main/scala/com.snowplowanalytics/weather/providers/openweather/Client.scala#L147-L155
[forecastbycoords-def]: https://github.com/snowplow/scala-weather/blob/5b22a89ed3ba04598caf7ebf75491a21adf11b28/src/main/scala/com.snowplowanalytics/weather/providers/openweather/Client.scala#L137-L145

[scala-forex]: https://github.com/snowplow/scala-forex

[openweathermap]: http://openweathermap.org/
[lru]: https://en.wikipedia.org/wiki/Cache_algorithms#LRU
[owm-api-docs]: http://openweathermap.org/api
[lru]: https://en.wikipedia.org/wiki/Cache_algorithms#LRU
[history-plan]: http://openweathermap.org/price
[owm-signup]: http://home.openweathermap.org/users/sign_up
[scalaz]: https://github.com/scalaz/scalaz
[scalaz-disjunction]: http://docs.typelevel.org/api/scalaz/stable/7.0.0/doc/scalaz/$bslash$div$minus.html
[akka-http]: http://doc.akka.io/docs/akka-stream-and-http-experimental/1.0/scala.html

[010-release]: http://github.com/snowplow/scala-weather/releases/tag/0.1.0
[issues]: http://github.com/snowplow/scala-weather/issues
[repo]: http://githubc.com/snowplow/scala-weather

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[snowplow]: http://snowplowanalytics.com
