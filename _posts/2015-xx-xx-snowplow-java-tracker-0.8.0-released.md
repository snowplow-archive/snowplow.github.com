---
layout: post
shortenedlink: Snowplow Java Tracker 0.8.0 released
title: Snowplow Java Tracker 0.8.0 released
tags: [snowplow, analytics, java, tracker]
author: Josh
category: Releases
---

We are pleased to release version 0.8.0 of the [Snowplow Java Tracker] [java-repo]. Many thanks to [David Stendardi] [dstendardi] from Viadeo for his contribution to this release!

In the rest of this post we will cover:

1. [API updates](/blog/2015/xx/xx/snowplow-java-tracker-0.8.0-released/#api)
2. [Emitter changes](/blog/2015/xx/xx/snowplow-java-tracker-0.8.0-released/#emitter)
3. [Performance](/blog/2015/xx/xx/snowplow-java-tracker-0.8.0-released/#performance)
4. [Subject switch](/blog/2015/xx/xx/snowplow-java-tracker-0.8.0-released/#subject-switch)
5. [Other changes](/blog/2015/xx/xx/snowplow-java-tracker-0.8.0-released/#other)
6. [Upgrading](/blog/2015/xx/xx/snowplow-java-tracker-0.8.0-released/#upgrading)
7. [Documentation](/blog/2015/xx/xx/snowplow-java-tracker-0.8.0-released/#docs)
8. [Getting help](/blog/2015/xx/xx/snowplow-java-tracker-0.8.0-released/#help)

<!--more-->

<h2><a name="api">1. API updates</a></h2>

This release introduces a host of API changes to make the Tracker more modular and easier to use.  Primary amongst this is the introduction of the [builder pattern][builder-pattern] to almost every object in the Tracker.  This has been implemented for a few reasons:

* Allows us to set default values for almost everything without the need for overloaded functions.
* Allows us to add features without breaking the API in the future.
* Allows us to add new events for Tracking without changing the API.

Please read the [technical documentation][java-manual] for notes on setting up the Tracker.

To setup the Tracker under the new API:

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

We have also updated how you track events.  In place of many different types of `trackXXX` functions, we now have a single `track` function which can take different types of `Event`s. These events are also built using the builder pattern.

To illustrate lets look at how we were tracking a page view event in version 0.7.0:

{% highlight java %}
tracker.trackPageView("www.example.com", "example", "www.referrer.com");
{% endhighlight %}

For events like an Ecommerce Transaction it quickly becomes difficult to reason about:

{% highlight java %}
TransactionItem item1 = new TransactionItem("item_id_1", "item_sku_1", 1.00, 1, "item_name", "item_category", "currency");
TransactionItem item2 = new TransactionItem("item_id_2", "item_sku_2", 1.00, 1, "item_name", "item_category", "currency");

List<TransactionItem> items = new ArrayList<>();
items.add(item1);
items.add(item2);

tracker.trackEcommerceTransaction("6a8078be", 300, "my_affiliate", 30, 10, "London", "Shoreditch", "Great Britain", "GBP", items);
{% endhighlight %}

Here is a page view in version 0.8.0:

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
    .items(item1, item2) // Simply put in any amount of items here!
    .build());
{% endhighlight %}

The new Builder pattern is slightly more verbose but the readbility is greatly improved. Also, you no longer have to pass in `null` entries for fields you don't want to populate.

<h2><a name="emitter">2. Emitter Changes</a></h2>

The Emitter has also undergone a major overhaul in this release to allow for greater modularity and asynchronous capability.

We have removed the need to define whether you would like to send your events via `GET` or `POST` by introducing instead two different types of Emitters.  You now instead use the `SimpleEmitter` if you want to send via `GET` or the `BatchEmitter` if you want to send via `POST`.  

You build the emitters like so:

{% highlight java %}
Emiter simple = SimpleEmitter.builder()
        .httpClientAdapter( {{ An Adapter }} )
        .threadCount(20) // Default is 50
        .requestCallback( {{ A callback }} ) // Default is Null
        .build();

Emiter batch = BatchEmitter.builder()
        .httpClientAdapter( {{ An Adapter }} )
        .bufferSize(20)  // Default is 50
        .threadCount(20) // Default is 50
        .requestCallback( {{ A callback }} ) // Default is Null
        .build();
{% endhighlight %}

Builder functions explained:

* `httpClientAdapter` : Adds an already constructed `HttpClientAdapter` for the emitter to use; must not be Null or an Exception will be thrown.
* `threadCount` : Sets the count of Threads available for sending events on.
* `requestCallback` : Optional callback functions which are run after each sending attempt; will return failed event Payloads which can be re-tracked.
* `bufferSize` : This is only available for the BatchEmitter; allows you to set how many events go into a single POST request.

We now also offer more than one `HttpClient` for sending events.  On top of the Apache Http Client we have used previously we now also offer an OkHttp Client.  The following objects are what get embedded into the above `httpClientAdapter( ... )` builder function.

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

You now have control over the actual client used for sending and can define your own custom settings for both of them.

Builder functions explained:

* `url` : The collector url where events are going to be sent.
* `httpClient` : The custom HttpClient to use.

Many thanks to [David Stendardi] [dstendardi] from Viadeo for this contribution in making the Tracker so modular!

<h2><a name="testing">3. Performance</a></h2>

This release also fixes major performance issues experienced around sending events.  The Tracker was, up until now, sending all events using a Synchronous blocking model.  To fix this we are now sending all of our events using a pool of background threads; the size of which is configurable in the emitter creation step.  What this means:

* All event sending is now non-blocking and fully Asynchronous.
* You control the amount of events that can be sent Asychronously to directly control the load on your system.

To emphasise the speed changes we performed some stress testing on the Tracker with the previous model and the new model of sending.

Test setup:

* 1000 `PageView` events were sent into the Tracker
* Request Type: POST
* Buffer Size: 10

Reported Times:

* Old Model: ~ 40 seconds to finish sending, blocking execution
* New Model: ~ 2-3 seconds to finish sending, non-blocking execution

That is more than a 1300% speed increase by implementing the new Asynchronous model.  This increase could potentially get even bigger when running the Tracker on more powerful systems and increasing the Emitter Thread Pool accordingly.

We also spent a bit of time mapping the most efficient buffer-size for the Tracker.  This was done by sending 10000 events and seeing how long it took for them to all be sent successfully with varying buffer sizes.  As you would imagine the larger the buffer-size the lower the latency in getting the events to the collector.  Do be wary of how large you set the buffer-size though as you could very well start to exceed the maximum POST size allowed of 52000 bytes!

<img src="/assets/img/blog/2015/09/buffer-vs-time-java.png" />

So if you are expecting inordinate amounts of traffic do adjust your buffer size and Thread Count to allow the Tracker to deal with this accordingly!

<h2><a name="subject-switch">4. Subject switch</a></h2>

This release also introduces the ability to insert a custom Subject object with your events.  In an environment where many different Subjects are involved (e.g. a web server or a RabbitMQ bridge), having a single Subject associated with a Tracker is quite restrictive.  You can now pass along a Subject with your event which will then cause the Tracker's subject to be ignored; allowing you to rapidly switch Subject information for events.

{% highlight java %}
// Make multiple Subjects
Subject s1 = new Subject.SubjectBuilder()
    .userId("subject-1-uid")
    .build();

Subject s2 = new Subject.SubjectBuilder()
    .userId("subject-2-uid")
    .build();

// Track Events with subject appended
tracker.track(PageView.builder()
    .pageUrl("pageUrl")
    .pageTitle("pageTitle")
    .referrer("pageReferrer")
    .subject(s1)
    .build());

tracker.track(PageView.builder()
    .pageUrl("pageUrl")
    .pageTitle("pageTitle")
    .referrer("pageReferrer")
    .subject(s2)
    .build());
{% endhighlight %}

This removes the need to constantly update what Subject is attached to the Tracker and allows for very simple multi-Subject Tracking.

<h2><a name="other">5. Other changes</a></h2>

Other changes include:

* Added several new key-value pairs to the Subject class with new `setXXX` functions ([#125][125], [#124][124], [#88][88], [#87][87])
* Made the `TrackerPayload` much more Type-Safe by only allowing String values ([#127][127])
* Added fail-fast if an invalid collector URL is passed in ([#131][131])

<h2><a name="docs">6. Upgrading</a></h2>

The new version of the Snowplow Java Tracker is 0.8.0. The [Java Setup Guide] [java-setup] on our wiki has been updated to the latest version.

<h2><a name="docs">7. Documentation</a></h2>

You can find the updated [Java Tracker usage manual] [java-manual] on our wiki.

You can find the full release notes on GitHub as [Snowplow Java Tracker v0.8.0 release] [java-tracker-release].

<h2><a name="help">8. Getting help</a></h2>

The Java Tracker is still an immature project and we will be working hard with the community to improve it over the coming weeks and months; in the meantime, do please share any user feedback, feature requests or possible bugs.

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
