---
layout: post
title: Snowplow Java Tracker 0.8.0 released
title-short: Snowplow Java Tracker 0.8.0
tags: [snowplow, analytics, java, tracker]
author: Josh
category: Releases
---

We are pleased to release version 0.8.0 of the [Snowplow Java Tracker] [java-repo]. This release introduces several performance upgrades and a complete rework of the API. Many thanks to [David Stendardi] [dstendardi] from Viadeo for his contributions!

In the rest of this post we will cover:

1. [API updates](/blog/2015/09/14/snowplow-java-tracker-0.8.0-released/#api)
2. [Emitter changes](/blog/2015/09/14/snowplow-java-tracker-0.8.0-released/#emitter)
3. [Performance](/blog/2015/09/14/snowplow-java-tracker-0.8.0-released/#performance)
4. [Changing the Subject](/blog/2015/09/14/snowplow-java-tracker-0.8.0-released/#changing-the-subject)
5. [Other improvements](/blog/2015/09/14/snowplow-java-tracker-0.8.0-released/#other)
6. [Upgrading](/blog/2015/09/14/snowplow-java-tracker-0.8.0-released/#upgrading)
7. [Documentation](/blog/2015/09/14/snowplow-java-tracker-0.8.0-released/#docs)
8. [Getting help](/blog/2015/09/14/snowplow-java-tracker-0.8.0-released/#help)

<!--more-->

<h2 id="api">1. API updates</h2>

This release introduces a host of API changes to make the Tracker more modular and easier to use. Primary amongst these is the introduction of the [builder pattern][builder-pattern] for almost every object in the Tracker. This pattern lets us:

* Set default values for almost everything without the need for overloaded functions
* Add features without breaking the API in the future
* Add new events for Tracking without changing the API

Please read the [technical documentation][java-manual] for notes on setting up the Tracker.

<h3>Tracker setup</h3>

To setup a basic Tracker under the new API:

{% highlight java %}
OkHttpClient client = new OkHttpClient();
HttpClientAdapter adapter = OkHttpClientAdapter.builder()
    .url("http://acme.com")
    .httpClient(client)
    .build();

Emitter emitter = BatchEmitter.builder()
    .httpClientAdapter(adapter)
    .build();

Tracker tracker = new Tracker.TrackerBuilder(emitter, "namespace", "appid")
    .base64(true)
    .platform(DevicePlatform.Desktop)
    .build();
{% endhighlight %}

<h3>Event tracking: old approach</h3>

We have also updated how you track events. In place of many different types of `trackXXX` functions, we now have a single `track` function which can take different types of `Event`s as its argument. These events are also built using the builder pattern.

Let's look at how we were tracking a page view event before, in version 0.7.0:

{% highlight java %}
tracker.trackPageView("www.example.com", "example", "www.referrer.com");
{% endhighlight %}

For events like an Ecommerce Transaction it quickly becomes difficult to understand:

{% highlight java %}
TransactionItem item1 = new TransactionItem("item_id_1", "item_sku_1", 1.00, 1, "item_name", "item_category", "currency");
TransactionItem item2 = new TransactionItem("item_id_2", "item_sku_2", 1.00, 1, "item_name", "item_category", "currency");

List<TransactionItem> items = new ArrayList<>();
items.add(item1);
items.add(item2);

tracker.trackEcommerceTransaction("6a8078be", 300, "my_affiliate", 30, 10, "London", "Shoreditch", "Great Britain", "GBP", items);
{% endhighlight %}

<h3>Event tracking: new approach</h3>

By contrast, here is a page view in version 0.8.0:

{% highlight java %}
tracker.track(PageView.builder()
    .pageUrl("pageUrl")
    .pageTitle("pageTitle")
    .referrer("pageReferrer")
    .build());
{% endhighlight %}

And here is the ecommerce event:

{% highlight java %}
EcommerceTransactionItem item1 = EcommerceTransactionItem.builder()
    .itemId("item_id_1")
    .sku("item_sku_1")
    .price(1.00)
    .quantity(1)
    .name("item_name")
    .category("item_category")
    .currency("currency")
    .build();

EcommerceTransactionItem item2 = EcommerceTransactionItem.builder()
    .itemId("item_id_2")
    .sku("item_sku_2")
    .price(1.00)
    .quantity(1)
    .name("item_name")
    .category("item_category")
    .currency("currency")
    .build();

tracker.track(EcommerceTransaction.builder()
    .orderId("6a8078be")
    .totalValue(300.00)
    .affiliation("my_affiliate")
    .taxValue(30)
    .shipping(10)
    .city("Shoreditch")
    .state("London")
    .country("Great Britain")
    .currency("GBP")
    .items(item1, item2) // Simply put in any number of items here!
    .build());
{% endhighlight %}

The new builder pattern is slightly more verbose but the readbility is greatly improved. You also no longer have to pass in `null` entries for fields that you don't want to populate.

<h2 id="emitter">2. Emitter changes</h2>

The Emitter has also undergone a major overhaul in this release to allow for greater modularity and asynchronous capability.

<h3>Emitter setup</h3>

Firstly, we have removed the need to define whether you would like to send your events via `GET` or `POST` by introducing two different types of Emitters instead. You now use the `SimpleEmitter` for `GET` requests and the `BatchEmitter` for `POST` requests.

You can build the emitters like so:

{% highlight java %}
Emiter simple = SimpleEmitter.builder()
    .httpClientAdapter( ... )
    .threadCount(20) // Default is 50
    .requestCallback( ... ) // Default is Null
    .build();

Emiter batch = BatchEmitter.builder()
    .httpClientAdapter( ... )
    .bufferSize(20)  // Default is 50
    .threadCount(20) // Default is 50
    .requestCallback( ... ) // Default is Null
    .build();
{% endhighlight %}

Builder functions explained:

* `httpClientAdapter` adds an `HttpClientAdapter` object for the emitter to use
* `threadCount` sets the size of the Thread Pool which can be used for sending events
* `requestCallback` is an optional callback function which is run after each sending attempt; it will return failed event Payloads for further processing
* `bufferSize` is only available for the `BatchEmitter`; it allows you to set how many events go into a `POST` request

<h3>HttpClient setup</h3>

Secondly, we now offer more than one `HttpClient` for sending events. On top of the `ApacheHttpClient` we have now added an `OkHttpClient`. The following objects are what we would embed in the `httpClientAdapter( ... )` builder functions above:

{% highlight java %}
CloseableHttpClient apacheClient = HttpClients.createDefault();
HttpClientAdapter apacheClientAdapter = ApacheHttpClientAdapter.builder()
    .url("http://acme.com")
    .httpClient(apacheClient)
    .build();

OkHttpClient okHttpClient = new OkHttpClient();
HttpClientAdapter okHttpClientAdapter = OkHttpClientAdapter.builder()
    .url("http://acme.com")
    .httpClient(okHttpClient)
    .build();
{% endhighlight %}

Thus you now have control over the actual client used for sending and can define your own custom settings for it.

Builder functions explained:

* `url` is the collector URL where events are going to be sent
* `httpClient` is the `HttpClient` to use

Many thanks to [David Stendardi][dstendardi] from Viadeo for this contribution in making the Tracker so modular!

<h2 id="testing">3. Performance</h2>

This release also fixes a major performance issue experienced around sending events. The Tracker was, up until now, sending all events using a synchronous blocking model. To fix this we are now sending all of our events using a pool of background threads; the pool size is configurable in the emitter creation step. As a result:

* All event sending is now non-blocking and fully asynchronous
* You control the amount of events that can be sent asychronously to directly control the load on your tracker's host system

To emphasise the speed changes we performed some stress testing on the Tracker with the previous model and the new model:

* 1000 `PageView` events were sent into the Tracker
* Request type was `POST`
* Buffer size was 10

Reported Times:

* Version 0.7.0 took ~40 seconds to finish sending, blocking execution
* Version 0.8.0 took ~2-3 seconds to finish sending, non-blocking execution

That is more than a 1300% speed increase! This increase could potentially get even bigger when running the Tracker on more powerful systems and increasing the Thread Pool accordingly.

We also spent some time exploring the most efficient buffer-size for the Tracker on our system. To test this we sent 10k events from the Tracker and recorded the time taken to successfully send all of them. As you would imagine the larger the buffer-size the lower the latency in getting the events to the collector:

<img src="/assets/img/blog/2015/09/buffer-vs-time-java.png" />

If you are expecting large event volumes, do adjust your buffer size and thread count to allow the Tracker to handle this. However please be aware of the 52000 byte limit per request, if you set the buffer too high it is likely you won't be able to successfully send anything!

<h2 id="changing-the-subject">4. Changing the Subject</h2>

In an environment where many different Subjects are involved (e.g. a web server or a RabbitMQ bridge), having a single Subject associated with a Tracker is very restrictive.

This release lets you pass a Subject along with your event, to be used in place of the Tracker's Subject. In this way, you can rapidly switch Subject information between different events:

{% highlight java %}
// Make multiple Subjects
Subject s1 = new Subject.SubjectBuilder()
    .userId("subject-1-uid")
    .build();

Subject s2 = new Subject.SubjectBuilder()
    .userId("subject-2-uid")
    .build();

// Track event with Subject s1
tracker.track(PageView.builder()
    .pageUrl("pageUrl")
    .pageTitle("pageTitle")
    .referrer("pageReferrer")
    .subject(s1)
    .build());

// Track event with Subject s2
tracker.track(PageView.builder()
    .pageUrl("pageUrl")
    .pageTitle("pageTitle")
    .referrer("pageReferrer")
    .subject(s2)
    .build());
{% endhighlight %}

<h2 id="other">5. Other improvements</h2>

Other changes worth highlighting:

* Added several new key-value pairs to the Subject class with new `setXXX` functions ([#125][125], [#124][124], [#88][88], [#87][87])
* Made the `TrackerPayload` much more typesafe by only allowing String values ([#127][127])
* Added a fail-fast check for an invalid collector URL ([#131][131])

<h2 id="docs">6. Upgrading</h2>

The new version of the Snowplow Java Tracker is 0.8.0. The [Java Setup Guide] [java-setup] on our wiki has been updated to the latest version.

**Please** note this releae breaks compatibility with Java 6; from now on we will only be supporting Java 7+.**

<h2 id="docs">7. Documentation</h2>

You can find the updated [Java Tracker usage manual] [java-manual] on our wiki.

You can find the full release notes on GitHub as [Snowplow Java Tracker v0.8.0 release] [java-tracker-release].

<h2 id="help">8. Getting help</h2>

Despite its version number the Java Tracker is still relatively immature and we will be working hard with the community to improve it over the coming weeks and months; in the meantime, do please share any user feedback, feature requests or possible bugs.

Feel free to [get in touch][talk-to-us] or raise an issue [Java Tracker issues] [java-issues] on GitHub!

[java-repo]: https://github.com/snowplow/snowplow-java-tracker

[dstendardi]: https://github.com/dstendardi

[builder-pattern]: http://www.javacodegeeks.com/2013/01/the-builder-pattern-in-practice.html

[131]: https://github.com/snowplow/snowplow-java-tracker/issues/131
[87]: https://github.com/snowplow/snowplow-java-tracker/issues/87
[88]: https://github.com/snowplow/snowplow-java-tracker/issues/88
[124]: https://github.com/snowplow/snowplow-java-tracker/issues/124
[125]: https://github.com/snowplow/snowplow-java-tracker/issues/125
[127]: https://github.com/snowplow/snowplow-java-tracker/issues/127

[java-setup]: https://github.com/snowplow/snowplow/wiki/Java-Tracker-Setup
[java-manual]: https://github.com/snowplow/snowplow/wiki/Java-Tracker
[java-tracker-release]: https://github.com/snowplow/snowplow-java-tracker/releases/tag/java-0.8.0

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[java-issues]: https://github.com/snowplow/snowplow-java-tracker/issues
