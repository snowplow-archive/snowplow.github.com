---
layout: post
shortenedlink: Snowplow Android Tracker 0.5.0 released
title: Snowplow Android Tracker 0.5.0 released
tags: [snowplow, analytics, android, mobile, tracker]
author: Josh
category: Releases
---

We are pleased to announce the release of the fifth version of the [Snowplow Android Tracker][repo]. The Tracker has undergone a series of changes all aimed at making it vastly more performant as well as the addition of client-side sessionization for the Tracker.

This release post will cover the following topics:

1. [Client Side Sessionization](/blog/2015/07/20/snowplow-android-tracker-0.5.0-released/#sessionization)
2. [Tracker Performance](/blog/2015/07/20/snowplow-android-tracker-0.5.0-released/#performance)
3. [Event Building](/blog/2015/07/20/snowplow-android-tracker-0.5.0-released/#event-building)
4. [Other Changes](/blog/2015/07/20/snowplow-android-tracker-0.5.0-released/#other-changes)
5. [Demo app](/blog/2015/07/20/snowplow-android-tracker-0.5.0-released/#demo-application)
6. [Documentation](/blog/2015/07/20/snowplow-android-tracker-0.5.0-released/#docs)
7. [Getting help](/blog/2015/07/20/snowplow-android-tracker-0.5.0-released/#help)

<!--more-->

<h2><a name="sessionization">1. Client Side Sessionization</a></h2>

This release brings with it the possibility of adding a new `client_session` context to each of your Snowplow events.  Allowing you to easily group events from a single user into a single journey (...or session).  This functionality can be activated by passing in the following builder commands to the Tracker creation step:

{% highlight java %}
Tracker tracker = new Tracker.TrackerBuilder( ... )
    .sessionContext(true) // To use the session context
    .sessionCheckInterval(10000) // Checks every 10 seconds
    .foregroundTimeout(600000) // Timeout after 10 minutes
    .backgroundTimeout(300000) // Timeout after 5 minutes
    .build();
{% endhighlight %}

Once sessionization has been turned on several things will begin to happen:

1. A `client_session` context will be appended to each event that is sent.
2. A polling check will be started to check whether or not the session has timed out.
  - You can configure how often to check with the `sessionCheckInterval` command.
  - If your app is in the foreground and no events have been sent for, in this case, 10 minutes; the session will be updated and a new session started.
  - There is a different timeout for if your application is detected to be in the background.
3. Each time the session information is updated it is stored locally in a private file so as to preserve a unique user id for the life of the application.
4. Each time an event is sent from the Tracker the timeout for the session is reset.

Essentially session information will survive for the life of the application until it is uninstalled from the Android device.

An important note here is that we cannot detect if the application is in the background or not from a library standpoint.  You will be required to update your applications `onPause()` and `onResume()` functions to change this value manually in the session.  The following samples can be copied into an application activity to set the background state of the application for the session checker:

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

<h2><a name="performance">2. Tracker Performance</a></h2>

Several updates have been made to how the Tracker functions to improve performance and to reduce the memory footprint of the Tracker.  

First and foremost events sent from the Tracker are now sent asynchronously over many threads as opposed to sequentially on a single background thread.  This has drastically improved the speed at which the Tracker can send events to collection endpoints.

Secondly we have also improved the speed at which events are added and removed from the local SQLite database by enabling `writeAheadLogging`.  This means that we can now read and write to the database at the same time! Meaning that there is no waiting time for the Tracker in terms of picking up events to send to the endpoint and adding events is never halted during big read operations.  A huge gain in terms of needed processing time.

This means the Tracker now processes everything it possibly can using a concurrent model, orchestrated by a configurable thread pool that you can define the size of!

{% highlight java %}
Tracker tracker = new Tracker.TrackerBuilder( ... )
    .threadCount(20) // A pool of 20 threads
    .build();
{% endhighlight %}

NOTE: The Thread Pool must be at least 2 in size due to the nature of the Emitter functioning as a singleton.

Please also note that if you make the Thread Pool too large it can have serious performance implications.  An issue was discovered with using the RxJava default io scheduler in that it would grow the Thread Pool as demand increased, sometimes up to 500 threads, this in turn rendered the demonstration applications UI unresponsive and then subsequently crashed the application. See [this ticket][140] for more information.

Different devices might be able to take advantage of more or less threads depending on the weight of the application the Tracker is going into as well as the speed of the host devices processor.

We have also implemented a much needed fix for reducing the memory footprint of the library which in some cases was approaching the 100mb mark!  This has been done by setting the large arrays of events pulled from the database for sending to `null` as soon as they are no longer required, allowing the garbage collector to work much more efficiently.

<h2><a name="event-building">3. Event Building</a></h2>

Along with all the performance updates there has also been a fundamental change to how all the `tracker.track` functions operate.  You now need only pass a `type` of event to the `track` function instead of using many different types of `track` functions.  All events are now built using the builder pattern as well.

To illustrate lets look at how we were tracking a page view event in 0.4.0:

{% highlight java %}
tracker.trackPageView("www.example.com", "example", "www.referrer.com");
{% endhighlight %}

Now this is a relatively simple event but for things like an Ecommerce Transaction it quickly becomes difficult to reason about:

{% highlight java %}
TransactionItem item1 = new TransactionItem("item_id_1", "item_sku_1", 1.00, 1, "item_name", "item_category", "currency");
TransactionItem item2 = new TransactionItem("item_id_2", "item_sku_2", 1.00, 1, "item_name", "item_category", "currency");

List<TransactionItem> items = new ArrayList<>();
items.add(item1);
items.add(item2);

tracker.trackEcommerceTransaction("6a8078be", 300, "my_affiliate", 30, 10, "London", "Shoreditch", "Great Britain", "GBP", items);
{% endhighlight %}

Doing the same operations in this release:

{% highlight java %}
tracker.track(PageView.builder()
    .pageUrl("pageUrl")
    .pageTitle("pageTitle")
    .referrer("pageReferrer")
    .build());
{% endhighlight %}

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

List<TransactionItem> items = new ArrayList<>();
items.add(item1);
items.add(item2);

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
    .items(items)
    .build());
{% endhighlight %}

As you can see it does cause you to use a few more lines of code but the readbility is greatly improved.  On top of which there is no more need to pass in `null` entries for fields you did not want to populate.  You just simply do not use that builder option.

On top of this you can now chose when you want to actually track an item, you can simply create an Event object and add it to be tracked and sent when you please.

<h2><a name="other-changes">4. Other Changes</a></h2>

We have also:

* Added a function the tracker which allows you to instanstly turn off all tracking and event collection `tracker.stopDataCollection();`, to start collection again simply run `tracker.startDataCollection()`. ([#6][6])
* Added the ability to set a custom event id for any event using the builder option `.eventId("some-id")` ([#59][59])
* Fixed a bug whereby a needed field was not being set for the `mobile_context` ([#135][135])
* Fixed a bug whereby the emitter send operation might not timeout ([#138][138])

<h2><a name="demo-application">5. Demo app</a></h2>

The demonstration application has also undergone a few minor updates.  We now have a radio button group which will allow you to switch of all data collection as noted in [this ticket][6].  Located under the `Collection` header simply press `ON` or `OFF` to toggle this setting.

Under the `Metrics` header we are also now taking note of the amount of sessions the Tracker has gone through.  You can see that it will indeed survive application and phone restarts.

To get the latest version please download from [here][download].  To install the app you will need to allow installation from sources [other than the Google Play Store][other-sources].

<h2><a name="docs">6. Documentation</a></h2>

You can find the updated [Android Tracker documentation] [android-manual] on our wiki.

As part of this release we have also several new tutorials to help Android developers integrate the tracker into their apps:

* [Guide to integrating the tracker] [integration]
* [Guide to setting up a test environment] [testing]
* [Walkthrough of our Android demo app] [demo-walkthrough]

You can find the full release notes on GitHub as [Snowplow Android Tracker v0.5.0 release] [android-tracker-release].

<h2><a name="help">7. Getting help</a></h2>

The Android Tracker is still an immature project and we will be working hard with the community to improve it over the coming weeks and months; in the meantime, do please share any user feedback, feature requests or possible bugs.

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
