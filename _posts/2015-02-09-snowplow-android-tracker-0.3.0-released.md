---
layout: post
shortenedlink: Snowplow Android Tracker
title: Snowplow Android Tracker Released
tags: [snowplow, analytics, android, tracker]
author: Josh
category: Releases
---

We are pleased to announce the release of the third version of the [Snowplow Android Tracker][repo]. The Tracker has undergone a series of changes including removing the dependancy on the Java Core Library and a move towards using RxJava as a way of implementing Asynchronous background tasks.

Please note that version 0.3.0 of the Android Tracker is dependent upon Snowplow version 0.9.14 and higher; for more information please refer to the [technical documentation][android-manual].

This release post will cover the following topics:

1. [RxJava instead of AsyncTask](/blog/2015/02/09/snowplow-android-tracker-0.3.0-released/#rx-java)
2. [Emitter updates and changes](/blog/2015/02/09/snowplow-android-tracker-0.3.0-released/#emitter-changes)
3. [Getting the tracker up to speed](/blog/2015/02/09/snowplow-android-tracker-0.3.0-released/#getting-up-to-speed)
4. [Documentation](/blog/2015/02/09/snowplow-android-tracker-0.3.0-released/#docs)
5. [Getting help](/blog/2015/02/09/snowplow-android-tracker-0.3.0-released/#help)

<h2><a name="rx-java">1. RxJava instead of AsyncTask</a></h2>

The main change in this release has been the move away from using traditional AsyncTask's towards utilising RxJava for all asynchronous/concurrency needs.  This has been done for a number of reasons. Primarily, it has been used to ensure that the heavy I/O nature of a Tracker in storing and sending event data will never end up blocking the User Interface thread or the Main running thread of the Android device it is running on, something that AsyncTask could not manage nearly as easily or elegantly.

From the [ReactiveX][reactive-x] web page:

"ReactiveX is a library for composing asynchronous and event-based programs by using observable sequences.

It extends the observer pattern to support sequences of data and/or events and adds operators that allow you to compose sequences together declaratively while abstracting away concerns about things like low-level threading, synchronization, thread-safety, concurrent data structures, and non-blocking I/O."

Essentially using RxJava removes the need to write obtuse AsyncTask functions as we can now simply write sequences of Observable functions, instruct them to utilise any of the preconfigured thread pools available and then once we subscribe to the function it will run... all on non-blocking background threads! Any process that has to be run many times and for potentially large amounts of time can be quickly and cleanly sent off into the background.

Using RxJava we have now ported over the following functions:

- Writing to the database
- Reading from the database
- Sending to the collector

RxJava also manages sudden spikes in usage to a particular observable function. Say for example your application sends 5000 events in under a second to the Tracker.  Rx will store the excess events in a Backpressure queue and then assign tasks to the thread pool to quickly deal with the sudden influx.

Some other advantages over using [AsyncTask][async-task] include:

- No rules over creating and invoking the methods from the UI Thread (See Threading rules on the linked page).  We can invoke Observables anywhere we like.
- Not limited by the fact that a task can be executed only once (See Threading rules on the linked page).  We can invoke Observables many many times and the action can be easily queued.

This process will make the entire Tracker far more robust in being able to handle sudden influx's of events as well as handling all of our other functions in a non-blocking asynchronous manner.

<h2><a name="emitter-changes">2. Emitter updates and changes</a></h2>

The emitter has been updated to function to a slightly different flow to the previous versions.  Instead of emitting everytime the buffer limit was reached we are now emitting on a polling interval.  By default we are now configured to check if there any events in the database every 5 seconds.  If there are any events to send we pull out a configured allotment and send them off to the collector.

This flow has been implemented to prevent the emitting service from getting overrun by huge amounts of events suddenly needing to be sent and the inherent need to buffer them all in local memory. Giving us a great deal more control over the network activity going out from the Tracker.

We have also implemented a check to see whether or not the device the Tracker is running on is actually online and able to have events sent from it.  If the device is not online we now simply do not attempt to send anything.  This allows the Tracker to run very quietly until such time as we can actually send events.  

To enable this checking feature however you will need to add the following line to your AndroidManifest file:

{% highlight xml %}
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
{% endhighlight %}

<h2><a name="docs">3. Getting the tracker up to speed</a></h2>

The Tracker has also undergone a series of updates and fixes to get it back up to speed with the rest of the Snowplow Trackers.  

This includes updates to the schema versions for POST events ([#75][payload-data]) which adds new available fields and updates to the context schema ([#71][contexts]) which fixes an issue with empty context arrays being passed through.

We have also updated the available Subject class functions to allow for more data to be packed along with events.  

You can now set the following information:

- setIpAddress()
- setUseragent()
- setDomainUserId()
- setNetworkUserId()

<h2><a name="docs">5. Documentation</a></h2>

You can find the updated [Android Tracker documentation] [android-manual] on our wiki.

You can find the full release notes on GitHub as [Snowplow Android Tracker v0.3.0 release] [android-tracker-release].

<h2><a name="help">6. Getting help</a></h2>

The Android Tracker is still an immature project and we will be working hard with the community to improve it over the coming weeks and months; in the meantime, do please share any user feedback, feature requests or possible bugs.

Feel free to [get in touch][talk-to-us] or raise an issue [Android Tracker issues] [android-issues] on GitHub!

[android-repo]: https://github.com/snowplow/snowplow-android-tracker

[reactive-x]: http://reactivex.io/
[async-task]: http://developer.android.com/reference/android/os/AsyncTask.html

[android-setup]: https://github.com/snowplow/snowplow/wiki/Java-Tracker-Setup
[android-manual]: https://github.com/snowplow/snowplow/wiki/Android-Tracker
[android-tracker-release]: https://github.com/snowplow/snowplow-android-tracker/releases/tag/android-0.3.0

[payload-data]: https://github.com/snowplow/iglu-central/issues/75
[contexts]: https://github.com/snowplow/iglu-central/issues/71

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[android-issues]: https://github.com/snowplow/snowplow-android-tracker/issues
