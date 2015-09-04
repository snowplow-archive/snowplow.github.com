---
layout: post
title: Snowplow Android Tracker 0.5.0 released
title-short: Snowplow Android Tracker 0.5.0
tags: [snowplow, analytics, android, mobile, tracker]
author: Josh
category: Releases
---

We are pleased to announce the release of the [Snowplow Android Tracker][repo] version 0.5.0. The Tracker has undergone a series of performance improvements, plus the addition of client-side sessionization.

This release post will cover the following topics:

1. [Client-side sessionization](/blog/2015/07/28/snowplow-android-tracker-0.5.0-released/#sessionization)
2. [Tracker performance](/blog/2015/07/28/snowplow-android-tracker-0.5.0-released/#performance)
3. [Event building](/blog/2015/07/28/snowplow-android-tracker-0.5.0-released/#event-building)
4. [Other changes](/blog/2015/07/28/snowplow-android-tracker-0.5.0-released/#other-changes)
5. [Demo app](/blog/2015/07/28/snowplow-android-tracker-0.5.0-released/#demo-application)
6. [Documentation](/blog/2015/07/28/snowplow-android-tracker-0.5.0-released/#docs)
7. [Getting help](/blog/2015/07/28/snowplow-android-tracker-0.5.0-released/#help)

<img src="/assets/img/blog/2015/07/android-app-classic-0.2.0-2.png" style="height: 450px; margin: 0 auto;" />

<!--more-->

<h2><a name="sessionization">1. Client-side sessionization</a></h2>

This release lets you add a new `client_session` context to each of your Snowplow events, allowing you to easily group events from a single user into a single session. This functionality can be activated by passing in the following builder commands to the Tracker creation step:

{% highlight java %}
Tracker tracker = new Tracker.TrackerBuilder( ... )
    .sessionContext(true)     // To use the session context
    .sessionCheckInterval(10) // Checks every 10 seconds (default is 15)
    .foregroundTimeout(300)   // Timeout after 5 minutes (default is 10)
    .backgroundTimeout(120)   // Timeout after 2 minutes (default is 5)
    .build();
{% endhighlight %}

Once sessionization has been turned on several things will begin to happen:

1. A `client_session` context will be appended to each event that is sent
2. A polling check will be started to check whether or not the session has timed out
  - You can configure how often to check with the `sessionCheckInterval` method
  - If your app is in the foreground and no events have been sent for the `foregroundTimeout` period, the session will be updated and a new session started
  - There is a separate timeout if your application is detected to be in the background
3. Each time the session information is updated it is stored locally in a private file which should persist for the life of the application
4. Each time an event is sent from the Tracker, both timeouts for the session are reset

Session information should survive for the life of the application, i.e. until it is uninstalled from the Android device.

An important note here is that we cannot detect if the application is in the background or not from a library standpoint. You will have to update your applications `onPause()` and `onResume()` functions to manually flag this change. The following samples can be copied into an application activity to set the background state of the application for the session checker:

{% highlight java %}
@Override
protected void onPause() {
    super.onPause();
    tracker.getSession().setIsBackground(true);
}

@Override
protected void onResume() {
    super.onResume();
    tracker.getSession().setIsBackground(false);
}
{% endhighlight %}

If you know of a better way to detect this state in Android please let us know in the comments below!

<h2><a name="performance">2. Tracker performance</a></h2>

Several updates have been made to how the Tracker functions to improve performance and to reduce the memory footprint of the Tracker.  

Firstly, events sent from the Tracker are now sent asynchronously over many threads as opposed to sequentially on a single background thread. This has drastically improved the speed at which the Tracker can send events to Snowplow collectors.

Secondly, we have also improved the speed at which events are added and removed from the local SQLite database by enabling `writeAheadLogging`. This means that we can now read and write to the database at the same time; this prevents contention between adding events to the outbound queue and emitting them to a collector.

This means the Tracker now processes as much as possible using a concurrent model, orchestrated by a configurable thread pool that you can define the size of:

{% highlight java %}
Tracker tracker = new Tracker.TrackerBuilder( ... )
    .threadCount(20) // A pool of 20 threads
    .build();
{% endhighlight %}

**Note:** the thread pool must be at least 2 in size due to the nature of the Emitter functioning as a singleton.

Please also note that if you make the thread pool too large it can have serious performance implications. An issue was discovered with using the RxJava default I/O scheduler in that it would grow the thread pool on demand, sometimes up to 500 threads, this in turn rendered the demonstration applications UI unresponsive and then subsequently crashed the application. See [this ticket][140] for more information.

Finally, we have also implemented an important fix to reduce the library's memory footprint. We now nullify the large arrays of events fetched from the database for sending as soon as they are no longer required, allowing the Android garbage collector to work much more efficiently.

<h2><a name="event-building">3. Event building</a></h2>

Alongside the performance updates we have made a fundamental change to how all the `tracker.track` functions operate. In place of many different types of `track` functions, we now have a single `track` function which can take different types of `Event`s. These events are now built using the Builder pattern.

To illustrate lets look at how we were tracking a page view event in version 0.4.0:

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

Here is a page view in version 0.5.0:

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

<h2><a name="other-changes">4. Other changes</a></h2>

We have also:

* Added a function in the Tracker which allows you to instantly turn off all tracking and event collection `tracker.pauseEventTracking()` and to start collection again run `tracker.resumeEventTracking()` ([#6][6])
* Added the ability to set a custom event id for any event using the Builder option `.eventId("some-id")` ([#59][59])
* Fixed a bug whereby a needed field was not being set for the `mobile_context` ([#135][135])
* Fixed a bug whereby the Emitter's send operation might not time out as required ([#138][138])

<h2><a name="demo-application">5. Demo app</a></h2>

The demonstration app has also undergone a few minor updates. We now have a radio button group which will allow you to switch of all data collection as noted in [this ticket][6]. Located under the `Collection` header, simply press `ON` or `OFF` to toggle this setting.

Under the `Metrics` header we now also deplay how many sessions the Tracker has observed; you can see that it will indeed survive application and phone restarts.

To get the latest version please download from [here][apk-download]. To install the app you will need to allow installation from sources [other than the Google Play Store][other-sources].

<h2><a name="docs">6. Documentation</a></h2>

You can find the updated [Android Tracker documentation] [android-manual] on our wiki.

As part of this release we have updated our tutorials to help Android developers integrate the Tracker into their apps:

* [Guide to integrating the tracker] [integration]
* [Guide to setting up a test environment] [testing]
* [Walkthrough of our Android demo app] [demo-walkthrough]

You can find the full release notes on GitHub as [Snowplow Android Tracker v0.5.0 release] [android-tracker-release].

<h2><a name="help">7. Getting help</a></h2>

The Android Tracker is still a young project and we will be working hard with the community to improve it over the coming weeks and months; in the meantime, do please share any user feedback, feature requests or possible bugs.

For help on integrating the application please have a look at the [setup][android-setup] and [integration][integration] guides.

Feel free to [get in touch][talk-to-us] or raise an issue in the [Android Tracker's issues] [android-issues] on GitHub!

[repo]: https://github.com/snowplow/snowplow-android-tracker

[6]: https://github.com/snowplow/snowplow-android-tracker/issues/6
[59]: https://github.com/snowplow/snowplow-android-tracker/issues/59
[135]: https://github.com/snowplow/snowplow-android-tracker/issues/135
[138]: https://github.com/snowplow/snowplow-android-tracker/issues/138
[140]: https://github.com/snowplow/snowplow-android-tracker/issues/140

[apk-download]: http://dl.bintray.com/snowplow/snowplow-generic/snowplow-demo-app-release-0.2.0.apk
[other-sources]: http://developer.android.com/distribute/tools/open-distribution.html

[android-setup]: https://github.com/snowplow/snowplow/wiki/Android-Tracker-Setup
[android-manual]: https://github.com/snowplow/snowplow/wiki/Android-Tracker
[android-tracker-release]: https://github.com/snowplow/snowplow-android-tracker/releases/tag/0.5.0
[demo-walkthrough]: https://github.com/snowplow/snowplow/wiki/Android-app-walkthrough#walkthrough
[integration]: https://github.com/snowplow/snowplow/wiki/Android-Integration
[testing]: https://github.com/snowplow/snowplow/wiki/Android-Testing-locally-and-Debugging

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[android-issues]: https://github.com/snowplow/snowplow-android-tracker/issues
