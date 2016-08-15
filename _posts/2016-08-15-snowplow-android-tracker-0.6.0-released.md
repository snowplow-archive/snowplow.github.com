---
layout: post
title: Snowplow Android Tracker 0.6.0 released
title-short: Snowplow Android Tracker 0.6.0
tags: [snowplow, analytics, android, mobile, tracker]
author: Josh
category: Releases
---

We are pleased to announce the release of the [Snowplow Android Tracker][repo] version 0.6.0. The Tracker has undergone a great deal of refactoring to end up with a re-unified library.  We have also added the first round of automated event tracking in the form of uncaught exceptions and lifecycle events.

This release post will cover the following topics:

1. [Removing RxJava](/blog/2016/08/15/snowplow-android-tracker-0.6.0-released/#removing-rxjava)
2. [Singleton](/blog/2016/08/15/snowplow-android-tracker-0.6.0-released/#singleton)
3. [Exception tracking](/blog/2016/08/15/snowplow-android-tracker-0.6.0-released/#exceptions)
4. [LifeCycle events](/blog/2016/08/15/snowplow-android-tracker-0.6.0-released/#lifecycles)
5. [Sessionization](/blog/2016/08/15/snowplow-android-tracker-0.6.0-released/#sessions)
6. [Other changes](/blog/2016/08/15/snowplow-android-tracker-0.6.0-released/#other-changes)
7. [Demo app](/blog/2016/08/15/snowplow-android-tracker-0.6.0-released/#demo-application)
8. [Documentation](/blog/2016/08/15/snowplow-android-tracker-0.6.0-released/#docs)
9. [Getting help](/blog/2016/08/15/snowplow-android-tracker-0.6.0-released/#help)

<!--more-->

<h2><a name="removing-rxjava">1. Removing RxJava</a></h2>

The Android Tracker has seen a rollercoaster of changes and refactors as we try to find the best technology fit for the SDK.  This saw the split of the library into an RxJava and a Classic Java approach - the former as a percieved best practice for concurrency and the later as a lightweight alternative to RxJava (due to the somewhat prohibitive DEX count).

This release brings yet another refactor in that we are now retiring RxJava in favour of the Classic Java approach.  There is no material difference in performance between the two implementations and it allows us to remove a dependancy from the library.  Further we feel that RxJava is a paradigm more suited to much more complex concurrency problems than what we use in the tracker - where we require a background event consumer & sender.

To add the Tracker to your application:

{% highlight %}
compile 'com.snowplowanalytics:snowplow-android-tracker:0.6.0@aar'
{% endhighlight %}

<h2><a name="singleton">2. Singleton</a></h2>

As the Tracker can only be safely used as a Singleton due to its reliance on a SQLite database for event storage we have now forced the implementation of the Tracker as such.

To create the Tracker:

{% highlight java %}
Subject subject = ...;
Emitter emitter = ...;

Tracker.init(new Tracker.TrackerBuilder(emitter, TRACKER_NAMESPACE, TRACKER_APP_ID, context)
    .subject(subject)
    .build()
);
{% endhighlight %}

The tracker can then be accessed from anywhere via:

{% highlight java %}
Tracker.instance().{{ TRACKER_METHOD }};
{% endhighlight %}

It can also be shutdown and reset from anywhere via:

{% highlight java %}
Tracker.close();
{% endhighlight %}

<h2><a name="exceptions">3. Exception tracking</a></h2>

For too long the Javascript Tracker has been the only one with any semblance of automated event tracking.  This release adds the first itteration of hopefully many rounds of automated event tracking in the Android ecosystem.

To this end we have added the ability to automatically track any uncaught fatal exceptions in your application.  This feature adds a custom `Thread.UncaughtExceptionHandler` which will:

- Send a Snowplow event containing the exception information
- Re-throw the exception to the original uncaught exception handler

This event also records the Threads name and ID for debugging purposes.  With this information plus the contextual information we can already send we are hoping to allow you to build very rich error reports which let you figure out what is going wrong in your app with a minimum of fuss.

__Note__: For this feature to work properly it is imperative that the Tracker is setup very early from the Main/UI Thread of your application activity.  This will allow the custom exception handler to automatically propogate to all other threads that get created.

To use this feature add the following builder option to your Tracker setup:

{% highlight java %}
Tracker.init(new Tracker.TrackerBuilder(...)
    .applicationCrash(true)
    .build()
);
{% endhighlight %}

<h2><a name="lifecyles">4. LifeCycle events</a></h2>

Further to the Exception tracking we have also added the ability to automatically track foreground and background events.  The action of your user sending your application in and out of focus.

This coupled with the client session contexts should allow you to build a much more complete picture of your user sessions by showing you exactly where a user left during their session.  As well as allowing you to track how long it took them to come back!

__Note__: This feature is only available on API levels 14+ due to the dependancy on `Application.ActivityLifecycleCallbacks`.

To use this feature add the following builder option to your Tracker setup:

{% highlight java %}
Tracker.init(new Tracker.TrackerBuilder(...)
    .lifecycleEvents(true)
    .build()
);

// Set the lifecycle handler
Tracker.instance().setLifecycleHandler({{ APPLICATION_ACTIVITY }})
{% endhighlight %}

This feature also ties in neatly with client sessionization in that, if implemented, it will automatically notify the sessionization object about foreground and backgroud states - rather than manually having to set this change yourself.

In the future we hope to add many more automated events around the Android LifeCycle to help paint the picture of user interaction in your application.

<h2><a name="sessions">5. Sessionization</a></h2>

Further to improving our understanding of client sessions in the Android Tracker we have also amended what constitutes a new session.  Historically if an application was in the background the session would continue to expire and itterate.  Allowing for very large blocks between session index counts.

Once the application is sent to the background it will now stop itterating immediately after expiration.  It will also immediately resume once it detects that the application has moved to the foreground again.

For more information on this please see [#192](https://github.com/snowplow/snowplow-android-tracker/issues/192).

<h2><a name="other-changes">6. Other changes</a></h2>

We have also:

* Updated the `client_session` context to include the `firstEventId` ([#160][160])
* Updated the `mobile_context` context to include both `networkType` and `networkTechnology ([#180][180]), thanks [@bernardosrulzon](https://github.com/bernardosrulzon)!
* Updated the `geolocation_context` context to include `timestamp` ([#203][203])
* Added support for attaching the `trueTimestamp` to events ([#196][196])

<h2><a name="demo-application">7. Demo app</a></h2>

As part of removing RxJava from the Tracker the demo application has also been greatly simplified.  It also now showcases the new Lifecycle Handler events that have been added to the Tracker.

To get the latest version please download from [here][apk-download]. To install the app you will need to allow installation from sources [other than the Google Play Store][other-sources].

<h2><a name="docs">8. Documentation</a></h2>

You can find the updated [Android Tracker documentation] [android-manual] on our wiki.

As part of this release we have updated our tutorials to help Android developers integrate the Tracker into their apps:

* [Guide to integrating the tracker] [integration]
* [Guide to setting up a test environment] [testing]
* [Walkthrough of our Android demo app] [demo-walkthrough]

You can find the full release notes on GitHub as [Snowplow Android Tracker v0.6.0 release] [android-tracker-release].

<h2><a name="help">9. Getting help</a></h2>

The Android Tracker is still a young project and we will be working hard with the community to improve it over the coming weeks and months; in the meantime, do please share any user feedback, feature requests or possible bugs.

For help on integrating the application please have a look at the [setup][android-setup] and [integration][integration] guides.

Feel free to [get in touch][talk-to-us] or raise an issue in the [Android Tracker's issues] [android-issues] on GitHub!

[repo]: https://github.com/snowplow/snowplow-android-tracker

[160]: https://github.com/snowplow/snowplow-android-tracker/issues/160
[180]: https://github.com/snowplow/snowplow-android-tracker/pull/180
[203]: https://github.com/snowplow/snowplow-android-tracker/issues/203
[196]: https://github.com/snowplow/snowplow-android-tracker/issues/196

[apk-download]: http://dl.bintray.com/snowplow/snowplow-generic/snowplow-demo-app-release-0.3.0.apk
[other-sources]: http://developer.android.com/distribute/tools/open-distribution.html

[android-setup]: https://github.com/snowplow/snowplow/wiki/Android-Tracker-Setup
[android-manual]: https://github.com/snowplow/snowplow/wiki/Android-Tracker
[android-tracker-release]: https://github.com/snowplow/snowplow-android-tracker/releases/tag/0.6.0
[demo-walkthrough]: https://github.com/snowplow/snowplow/wiki/Android-app-walkthrough#walkthrough
[integration]: https://github.com/snowplow/snowplow/wiki/Android-Integration
[testing]: https://github.com/snowplow/snowplow/wiki/Android-Testing-locally-and-Debugging

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[android-issues]: https://github.com/snowplow/snowplow-android-tracker/issues
