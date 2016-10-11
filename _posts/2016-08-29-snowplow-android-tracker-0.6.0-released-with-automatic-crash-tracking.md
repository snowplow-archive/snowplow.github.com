---
layout: post
title: Snowplow Android Tracker 0.6.0 released with automatic crash tracking
title-short: Snowplow Android Tracker 0.6.0
tags: [snowplow, analytics, android, mobile, tracker]
author: Josh
category: Releases
---

We are pleased to announce the release of the [Snowplow Android Tracker][repo] version 0.6.0. This is our first mobile tracker release featuring automated event tracking, in the form of uncaught exceptions and lifecycle events. The Tracker has also undergone a great deal of refactoring to simplify its codebase and make it easier to use.  

This release post will cover the following topics:

1. [Uncaught exception tracking](/blog/2016/08/29/snowplow-android-tracker-0.6.0-released-with-automatic-crash-tracking/#exceptions)
2. [Lifecycle event tracking](/blog/2016/08/29/snowplow-android-tracker-0.6.0-released-with-automatic-crash-tracking/#lifecycles)
3. [Removing RxJava](/blog/2016/08/29/snowplow-android-tracker-0.6.0-released-with-automatic-crash-tracking/#removing-rxjava)
4. [Singleton setup](/blog/2016/08/29/snowplow-android-tracker-0.6.0-released-with-automatic-crash-tracking/#singleton)
5. [Client session updates](/blog/2016/08/29/snowplow-android-tracker-0.6.0-released-with-automatic-crash-tracking/#sessions)
6. [True Timestamp](/blog/2016/08/29/snowplow-android-tracker-0.6.0-released-with-automatic-crash-tracking/#true-timestamp)
7. [API changes](/blog/2016/08/29/snowplow-android-tracker-0.6.0-released-with-automatic-crash-tracking/#api-changes)
8. [Other changes](/blog/2016/08/29/snowplow-android-tracker-0.6.0-released-with-automatic-crash-tracking/#other-changes)
9. [Demo app](/blog/2016/08/29/snowplow-android-tracker-0.6.0-released-with-automatic-crash-tracking/#demo-application)
10. [Documentation](/blog/2016/08/29/snowplow-android-tracker-0.6.0-released-with-automatic-crash-tracking/#docs)
11. [Getting help](/blog/2016/08/29/snowplow-android-tracker-0.6.0-released-with-automatic-crash-tracking/#help)

<!--more-->

<h2><a name="exceptions">1. Uncaught exception tracking</a></h2>

Our Javascript Tracker has had rich automated automated event tracking capabilities for several years, and we are hugely excited to start bringing similar functionality to our mobile trackers.

To start, we have added the ability to automatically track any uncaught fatal exceptions in your Android app. This feature adds a custom `Thread.UncaughtExceptionHandler` which will:

- Send a Snowplow event containing the exception information
- Re-throw the exception to the original uncaught exception handler

This event also records the thread's name and ID for debugging purposes. With this information plus the existing contextual data the Android Tracker sends, you can build very rich error reporting.

__Note__: for this feature to work properly it is imperative that the Tracker is setup very early from the Main/UI Thread of your application activity. This will allow the custom exception handler to automatically propogate to all other threads that are created.

To use this feature add the following builder option to your Tracker setup:

{% highlight java %}
Tracker.init(new Tracker.TrackerBuilder(...)
  .applicationCrash(true)
  .build()
);
{% endhighlight %}

Once this feature is activated you will see new events similar to the below:

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.snowplow\\/unstruct_event\\/jsonschema\\/1-0-0",
  "data": {
    "schema": "iglu:com.snowplowanalytics.snowplow\\/application_error\\/jsonschema\\/1-0-0",
    "data": {
      "exceptionName": "java.lang.IllegalStateException",
      "programmingLanguage": "JAVA",
      "threadId": 1,
      "threadName": "main",
      "isFatal": true,
      "stackTrace": "java.lang.IllegalStateException: IllegalState detected!\\n\\tat com.snowplowanalytics.snowplowtrackerdemo.Demo$2.onClick(Demo.java:129)\\n\\tat android.view.View.performClick(View.java:5198)\\n\\tat android.view.View$PerformClick.run(View.java:21147)\\n\\tat android.os.Handler.handleCallback(Handler.java:739)\\n\\tat android.os.Handler.dispatchMessage(Handler.java:95)\\n\\tat android.os.Looper.loop(Looper.java:148)\\n\\tat android.app.ActivityThread.main(ActivityThread.java:5417)\\n\\tat java.lang.reflect.Method.invoke(Native Method)\\n\\tat com.android.internal.os.ZygoteInit$MethodAndArgsCaller.run(ZygoteInit.java:726)\\n\\tat com.android.internal.os.ZygoteInit.main(ZygoteInit.java:616)\\n",
      "lineNumber": 129,
      "className": "com.snowplowanalytics.snowplowtrackerdemo.Demo$2",
      "message": "IllegalState detected!"
    }
  }
}
{% endhighlight %}

This will allow you to build views around:

- What uncaught exceptions are present in your application
- What events occurred prior to the crash (by building paths through individual users' event streams)
- Which device types are particularly vulnerable to this crash )by merging this with the `mobile_context`)

Just to name a few possibilities!

__Important__: before enabling this feature you should deploy the appropriate Redshift table. The Redshift DDL for this can be found at the following link:

[application_error_1.sql](https://raw.githubusercontent.com/snowplow/snowplow/master/4-storage/redshift-storage/sql/com.snowplowanalytics.snowplow/application_error_1.sql)

<h2><a name="lifecyles">2. Lifecycle event tracking</a></h2>

In addition to the crash tracking we have also added the ability to automatically track Android app foreground and background events, automatically trigged when your user brings your application in and out of focus.

This coupled with the client session contexts should allow you to build a much more complete picture of your user sessions by showing you exactly where a user left during their session, as well as allowing you to track how long it took them to come back!

__Note__: This feature is only available on API levels 14+ due to the dependency on `Application.ActivityLifecycleCallbacks`.

To use this feature add the following builder option to your Tracker setup:

{% highlight java %}
Tracker.init(new Tracker.TrackerBuilder(...)
  .lifecycleEvents(true)
  .build()
);

// Set the lifecycle handler
Tracker.instance().setLifecycleHandler({{ APPLICATION_ACTIVITY }})
{% endhighlight %}

This handler also ties in nicely with our existing Android client sessionization in that, if implemented, the handler will automatically notify the sessionization object about foreground and backgroud states - rather than you having to manually set this change yourself.

An app backgrounding event will look like this resembles the following:

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.snowplow/application_background/jsonschema/1-0-0",
  "data": {
    "backgroundIndex": 5
  }
}
{% endhighlight %}

And a foregrounding lifecycle event like this:

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.snowplow/application_foreground/jsonschema/1-0-0",
  "data": {
    "foregroundIndex": 6
  }
}
{% endhighlight %}

Everytime your application goes to the background or to the foreground a unique index is incremented to keep track of how many times the user goes back and forth from your applications focus.

In the future we hope to add many more automated events around the Android app lifecycle, to help you paint a picture of user interaction in your app!

__Important__: Before enabling this feature you should deploy the appropriate Redshift tables. The Redshift DDL for these can be found at the following links:

- [application_background_1.sql](https://raw.githubusercontent.com/snowplow/snowplow/master/4-storage/redshift-storage/sql/com.snowplowanalytics.snowplow/application_background_1.sql)
- [application_foreground_1.sql](https://raw.githubusercontent.com/snowplow/snowplow/master/4-storage/redshift-storage/sql/com.snowplowanalytics.snowplow/application_foreground_1.sql)

<h2><a name="removing-rxjava">3. Removing RxJava</a></h2>

The Android Tracker has seen some significant refactorings as we triangulate towards the best technology fit for the SDK. A while back, this saw the split of the library into an RxJava and a "Classic Java" approach - the former as a percieved best practice for concurrency and the later as a lightweight alternative to RxJava (due to the somewhat prohibitive DEX count).

This release brings another refactor: we are now permanently retiring RxJava in favour of the Classic Java approach. From testing we saw no material difference in performance between the two implementations and retiring RxJava allows us to remove a dependency from the library. While RxJava is a great fit for complex concurrency patterns, we learnt that it was overkill for the Snowplow Android Tracker.

To add the Tracker to your application now just refer to:

{% highlight java %}
compile 'com.snowplowanalytics:snowplow-android-tracker:0.6.0@aar'
{% endhighlight %}

<h2><a name="singleton">4. Singleton setup</a></h2>

As the Tracker can only be safely used as a singleton due to its reliance on a singular SQLite database for event persistence, we have now enforced the creation of the Tracker as such.

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

<h2><a name="sessions">5. Client session updates</a></h2>

Further to improving our understanding of client sessions in the Android Tracker we have also adjusted our logic for determining a new session.  Historically if an application was in the background, then the session would continue to expire and iterate, which could lead to very large gaps between session index counts.

From this release, once the application is sent to the background, it will now stop iterating the session index immediately after the current session expires. It will also immediately resume once it detects that the app has moved to the foreground again.

For more information on this please see [#192](https://github.com/snowplow/snowplow-android-tracker/issues/192).

<h2><a name="true-timestamp">6. True timestamp</a></h2>

True timestamps in Snowplow are a way to indicate that you can trust the time given as accurate; this is particularly useful if you are using a tracker to “replay” events with definitive timestamps into Snowplow. You can find out more about how time is handled in Snowplow [in our blog post here](http://snowplowanalytics.com/blog/2015/09/15/improving-snowplows-understanding-of-time/).

All the tracking methods in the Android Tracker now support sending this timestamp by using a "trueTimestamp" builder option. This is not a breaking API change.

To use the new option:

{% highlight java %}
Tracker.instance().track(PageView.builder()
  .pageUrl("pageUrl")
  .pageTitle("pageTitle")
  .referrer("pageReferrer")
  .trueTimestamp(1471419787572)
  .build());
{% endhighlight %}

__Note__: use the true timestamp option sparingly in client environments like Android - remember that the clock on an Android device is not trustworthy, and that in most cases you are better off relying on Snowplow's own timestamp derivation algorithm.

<h2><a name="api-changes">7. API changes</a></h2>

The Subject class no longer controls the creation of the `mobile_context` and `geolocation_context`.  These are now setup by:

{% highlight java %}
Tracker.init(new Tracker.TrackerBuilder(...)
  .geoLocationContext(true)
  .mobileContext(true)
  .build()
);
{% endhighlight %}

__Warning__: In past releases the `mobile_context` was included by attaching a Subject with an application context object.  However from 0.6.x we have changed this to be an explicit option in the Tracker builder.  We believe this provides much better clarity and control over what is actually attached to your event as it leaves the Tracker.  To ensure consistent behaviour between 0.5.x and 0.6.x please ensure that your Tracker builder contains `mobileContext(true)` as indicated above.

__Note__: if you are building your application for API 24+, you will need to manually request the geolocation manifest permissions for the Tracker. For sample code please see the [technical documentation](https://github.com/snowplow/snowplow/wiki/Android-Tracker#322-geolocation_context).

`Unstructured` events are now called `SelfDescribing` events, to reflect the fact that these events are in fact well-structured using JSON Schema. This is a breaking naming change and will need to be updated within your application

`TimingWithCategory` events are now called `Timing` events. This is a breaking naming change and will need to be updated within your application.

<h2><a name="other-changes">8. Other changes</a></h2>

We have also:

* Updated the `client_session` context to include the `firstEventId` ([#160][160])
* Updated the `mobile_context` context to include both `networkType` and `networkTechnology` ([#180][180]), thanks community member [Bernardo Srulzon][bernardosrulzon]!
* Updated the `geolocation_context` context to include `timestamp` ([#203][203])

<h2><a name="demo-application">9. Demo app</a></h2>

As part of removing RxJava from the Tracker, the demo app has also been greatly simplified. It also now showcases the new Android lifecycle events that have been added to the Tracker.

To get the latest version please download from [here][apk-download]. To install the app you will need to allow installation from sources [other than the Google Play Store][other-sources].

<h2><a name="docs">10. Documentation</a></h2>

You can find the updated [Android Tracker documentation] [android-manual] on our wiki.

As part of this release we have updated our tutorials to help Android developers integrate the Tracker into their apps:

* [Guide to integrating the tracker] [integration]
* [Guide to setting up a test environment] [testing]
* [Walkthrough of our Android demo app] [demo-walkthrough]

You can find the full release notes on GitHub as [Snowplow Android Tracker v0.6.0 release] [android-tracker-release].

<h2><a name="help">11. Getting help</a></h2>

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

[bernardosrulzon]: https://github.com/bernardosrulzon

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[android-issues]: https://github.com/snowplow/snowplow-android-tracker/issues
