---
layout: post
title: Snowplow Android Tracker 0.3.0 released
title-short: Snowplow Android Tracker 0.3.0
tags: [snowplow, analytics, android, mobile, tracker]
author: Josh
category: Releases
---

We are pleased to announce the release of the third version of the [Snowplow Android Tracker][repo]. The Tracker has undergone a series of changes including removing the dependancy on the Java Core Library and a move towards using RxJava as a way of implementing asynchronous background tasks.

Big thanks to [Hamid][hamidp] at Trello for his suggestions and guidance in using Rx to track events on Android.

Please note that version 0.3.0 of the Android Tracker is dependent upon Snowplow version 0.9.14 and higher; for more information please refer to the [technical documentation][android-manual].

This release post will cover the following topics:

1. [RxJava replacing AsyncTask](/blog/2015/02/18/snowplow-android-tracker-0.3.0-released/#rx-java)
2. [Emitter updates and changes](/blog/2015/02/18/snowplow-android-tracker-0.3.0-released/#emitter-changes)
3. [Function signatures now use SelfDescribingJson](/blog/2015/02/18/snowplow-android-tracker-0.3.0-released/#self-desc-json)
4. [New Subject methods](/blog/2015/02/18/snowplow-android-tracker-0.3.0-released/#subject-methods)
5. [Under the hood](/blog/2015/02/18/snowplow-android-tracker-0.3.0-released/#under-the-hood)
6. [Evaluating alternatives to RxJava](/blog/2015/02/18/snowplow-android-tracker-0.3.0-released/#evaluating-alternatives)
7. [Documentation](/blog/2015/02/18/snowplow-android-tracker-0.3.0-released/#docs)
8. [Getting help](/blog/2015/02/18/snowplow-android-tracker-0.3.0-released/#help)

<!--more-->

<h2><a name="rx-java">1. RxJava replacing AsyncTask</a></h2>

The main change in this release has been the move away from [AsyncTask][async-task] to [RxJava] [rx-java] for all asynchronous/concurrency needs.

This has been done for a number of reasons. Primarily, the switch is to ensure that the heavy I/O nature of a Tracker in storing and sending event data never blocks the UI thread or the Main running thread of the host Android device, something that is difficult to achieve with AsyncTask. Thanks again to [Hamid][hamidp] for all of his guidance here!

From the [ReactiveX][reactive-x] web page:

> ReactiveX is a library for composing asynchronous and event-based programs by using observable sequences.
>
> It extends the observer pattern to support sequences of data and/or events and adds operators that allow you to compose sequences together declaratively while abstracting away concerns about things like low-level threading, synchronization, thread-safety, concurrent data structures, and non-blocking I/O.

Using RxJava removes the need to write AsyncTask functions, as we can now simply write sequences of Observable functions, instruct them to utilise any of the preconfigured thread pools available and then once we subscribe to the function it will run - all on non-blocking background threads! With RxJava, any process that has to be run many times and for potentially large amounts of time can be quickly and cleanly sent off into the background.

We have now ported over the following Tracker facilities to use RxJava:

- Writing to the local event database
- Reading from the local event database
- Sending to the collector

RxJava also manages sudden spikes in usage to a particular Observable function. If say your application sends 500 events in under a second to the Tracker, Rx will store the excess events in a Backpressure queue and then assign tasks to the thread pool to quickly deal with the sudden influx.

Some other advantages compared to using AsyncTask include:

- No rules over creating and invoking the methods from the UI Thread, unlike AsyncTask. We can invoke Observables anywhere we like
- Not limited by the fact that a task can be executed only once, again unlike AsyncTask. We can invoke Observables many many times and the action can be easily queued.

See the "Threading rules" section in the AsyncTask documentation for more details on the limitations of our previous approach.

Our use of RxJava should make the entire Tracker far more robust in being able to handle sudden influxes of events as well as handling all of our other functions in a non-blocking asynchronous manner.

We are aware of the rather large DEX size that using RxJava brings and will be evaluating [RxAndroid][rx-android-x] as an alternative as soon as it is out of beta. Please see this issue for updates [#99][issue-99].

<h2><a name="emitter-changes">2. Emitter updates and changes</a></h2>

Under the hood, the Emitter's behavior is changed from previous versions. Instead of emitting whenever the buffer limit was reached, we are now emitting on a polling interval. By default the Emitter is configured to check if there any events in the local event database every 5 seconds. If there are any events to send, we retrieve a configured allocation from the database and send them off in batches to the collector.

This flow has been implemented to prevent the Emitter from being over-run by sudden huge volumes of new events, and to handle the requirement otherwise to buffer them all in local memory. This should give us a great deal more control over the network activity going out from the Tracker.

We have also implemented a check to see whether or not the device the Tracker is running on is actually online and able to have events sent from it. If the device is not online we now simply do not attempt to send anything. This allows the Tracker to run very quietly until such time as we can actually send events.  

To enable this checking feature you will need to add the following line to your AndroidManifest file:

{% highlight xml %}
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
{% endhighlight %}

<h2><a name="self-desc-json">3. Function signatures now use SelfDescribingJson</a></h2>

As a way of ensuring that custom contexts and unstructured events are formatted correctly we have moved to using a `SelfDescribingJson` object in the `Tracker.track...` function signatures.  This enforces that unstructured events and individual contexts are sent in with a schema, ready for processing by the rest of the Snowplow pipeline.

To create a `SelfDescribingJson` in the Android Tracker and track it as an unstructured event you can follow this code sample:

{% highlight java %}
// Create a Map of your data
Map<String, Object> data = new HashMap<>();
data.put("levelName", "Barrels o' Fun");
data.put("levelIndex", 23);

// Create the SelfDescribingJson
SelfDescribingJson json = new SelfDescribingJson("iglu:com.acme/save_game/jsonschema/1-0-0", data);

// Track the Event
tracker.trackUnstructuredEvent(json);
{% endhighlight %}

This will be transmitted to Snowplow in the following JSON envelope:

{% highlight json %}
{
    "schema": "iglu:com.acme/save_game/jsonschema/1-0-0",
    "data": {
        "levelName": "Barrels o' Fun",
        "levelIndex": 23
    }
}
{% endhighlight %}

Similarly, you now associate custom contexts with a given event at tracking time using the `context List<SelfDescribingJson>` argument.

For more information on `SelfDescribingJson` and how to use it please check out the [Technical Documentation][android-manual-self].

The Android Tracker is the first tracker to enforce valid `SelfDescribingJson`s for custom contexts and unstructured events in the type system. Expect something similar to be rolled out to other trackers in the near future.

<h2><a name="subject-methods">4. New Subject functions</a></h2>

We have updated the Subject class to allow for more data to be attached to events. You can now attach the following data points:

- `setIpAddress()`
- `setUseragent()`
- `setDomainUserId()`
- `setNetworkUserId()`

These setters are predominantly used in a server-side context but may be of some use in Android.

<h2><a name="under-the-hood">5. Under the hood</a></h2>

The Tracker has also undergone a series of updates and fixes to bring it more in-step with the other Snowplow Trackers.  

This includes updates to the schema versions for POST events ([#75][issue-75]) which adds new available fields and updates to the context schema ([#71][issue-71]) which fixes an issue with empty context arrays being passed through.

<h2><a name="evaluating-alternatives">6. Evaluating alternatives to RxJava</a></h2>

We are aware that it will be difficult for some Android developers to add RxJava to their application. We are working with the community to evaluate other viable alternatives to RxJava/RxAndroid and AsyncTask, to be offered **alongside** (not replacing) our Rx-based approach.

<h2><a name="docs">7. Documentation</a></h2>

You can find the updated [Android Tracker documentation] [android-manual] on our wiki.

You can find the full release notes on GitHub as [Snowplow Android Tracker v0.3.0 release] [android-tracker-release].

<h2><a name="help">8. Getting help</a></h2>

The Android Tracker is still an immature project and we will be working hard with the community to improve it over the coming weeks and months; in the meantime, do please share any user feedback, feature requests or possible bugs.

Feel free to [get in touch][talk-to-us] or raise an issue in the [Android Tracker's issues] [android-issues] on GitHub!

[repo]: https://github.com/snowplow/snowplow-android-tracker
[hamidp]: https://github.com/hamidp

[rx-java]: https://github.com/ReactiveX/RxJava
[reactive-x]: http://reactivex.io/
[rx-android-x]: https://github.com/ReactiveX/RxAndroid
[async-task]: http://developer.android.com/reference/android/os/AsyncTask.html

[android-setup]: https://github.com/snowplow/snowplow/wiki/Android-Tracker-Setup
[android-manual]: https://github.com/snowplow/snowplow/wiki/Android-Tracker
[android-manual-self]: https://github.com/snowplow/snowplow/wiki/Android-Tracker#self-describing-json
[android-tracker-release]: https://github.com/snowplow/snowplow-android-tracker/releases/tag/0.3.0

[issue-71]: https://github.com/snowplow/iglu-central/issues/71
[issue-75]: https://github.com/snowplow/iglu-central/issues/75
[issue-99]: https://github.com/snowplow/snowplow-android-tracker/issues/99

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[android-issues]: https://github.com/snowplow/snowplow-android-tracker/issues
