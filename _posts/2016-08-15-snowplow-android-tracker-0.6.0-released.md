---
layout: post
title: Snowplow Android Tracker 0.6.0 released
title-short: Snowplow Android Tracker 0.6.0
tags: [snowplow, analytics, android, mobile, tracker]
author: Josh
category: Releases
---

We are pleased to announce the release of the [Snowplow Android Tracker][repo] version 0.6.0. The Tracker has undergone a great deal of refactoring to end up with a re-unified library.  We have also added the first round of automated event tracking in the form of uncaught exceptions and lifecycle events!

This release post will cover the following topics:

1. [Removing RxJava](/blog/2016/08/24/snowplow-android-tracker-0.6.0-released/#removing-rxjava)
2. [Singleton setup](/blog/2016/08/24/snowplow-android-tracker-0.6.0-released/#singleton)
3. [Uncaught exception tracking](/blog/2016/08/24/snowplow-android-tracker-0.6.0-released/#exceptions)
4. [Lifecycle event tracking](/blog/2016/08/24/snowplow-android-tracker-0.6.0-released/#lifecycles)
5. [Client session updates](/blog/2016/08/24/snowplow-android-tracker-0.6.0-released/#sessions)
6. [True Timestamp](/blog/2016/08/24/snowplow-android-tracker-0.6.0-released/#true-timestamp)
7. [API changes](/blog/2016/08/24/snowplow-android-tracker-0.6.0-released/#api-changes)
8. [Other changes](/blog/2016/08/24/snowplow-android-tracker-0.6.0-released/#other-changes)
9. [Demo app](/blog/2016/08/24/snowplow-android-tracker-0.6.0-released/#demo-application)
10. [Documentation](/blog/2016/08/24/snowplow-android-tracker-0.6.0-released/#docs)
11. [Getting help](/blog/2016/08/24/snowplow-android-tracker-0.6.0-released/#help)

<!--more-->

<h2><a name="removing-rxjava">1. Removing RxJava</a></h2>

The Android Tracker has seen a rollercoaster of changes and refactors as we try to find the best technology fit for the SDK.  This saw the split of the library into an RxJava and a Classic Java approach - the former as a percieved best practice for concurrency and the later as a lightweight alternative to RxJava (due to the somewhat prohibitive DEX count).

This release brings yet another refactor in that we are now retiring RxJava in favour of the Classic Java approach.  From testing there is no material difference in performance between the two implementations and it allows us to remove a dependancy from the library.  Further we feel that RxJava is a paradigm more suited to much more complex concurrency patterns than what we use in the tracker - where we simply require a background event consumer & sender.

That being said there is definetly a place for RxJava in Android, we just cannot justify the complexity of maintaining essentially two trackers for no material gain.

To add the Tracker to your application now:

{% highlight %}
compile 'com.snowplowanalytics:snowplow-android-tracker:0.6.0@aar'
{% endhighlight %}

<h2><a name="singleton">2. Singleton setup</a></h2>

As the Tracker can only be safely used as a singleton due to its reliance on a SQLite database for event persistence, we have now forced the implementation of the Tracker as such.

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

<h2><a name="exceptions">3. Uncaught exception tracking</a></h2>

For too long the Javascript Tracker has been the only one with any semblance of automated event tracking.  This release adds the first itteration of hopefully many rounds of automated event tracking in the Android ecosystem.

To this end we have added the ability to automatically track any uncaught fatal exceptions in your application.  This feature adds a custom `Thread.UncaughtExceptionHandler` which will:

- Send a Snowplow event containing the exception information
- Re-throw the exception to the original uncaught exception handler

This event also records the Threads name and ID for debugging purposes.  With this information plus the contextual information we can already send we are hoping to allow you to build very rich error reports which let you figure out what is going wrong in your app with a minimum of fuss.

__Note__: For this feature to work properly it is imperative that the Tracker is setup very early from the Main/UI Thread of your application activity.  This will allow the custom exception handler to automatically propogate to all other threads that are created.

To use this feature add the following builder option to your Tracker setup:

{% highlight java %}
Tracker.init(new Tracker.TrackerBuilder(...)
  .applicationCrash(true)
  .build()
);
{% endhighlight %}

Once this feature is activated you will get something resembling the below output:

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
- If these exceptions are only present on certain devices by merging this with the `mobile_context`

Just to name a few possibilities!

__Important__:  Before switching this feature on for batch processing you must deploy the appropriate Redshift DDL and JsonPath.  These can be found at the following links:

- [Redshift DDL](https://raw.githubusercontent.com/snowplow/snowplow/feature/application-schemas/4-storage/redshift-storage/sql/com.snowplowanalytics.snowplow/application_error_1.sql)
- [JsonPath](https://raw.githubusercontent.com/snowplow/snowplow/feature/application-schemas/4-storage/redshift-storage/jsonpaths/com.snowplowanalytics.snowplow/application_error_1.json)

<h2><a name="lifecyles">4. Lifecycle event tracking</a></h2>

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

This handler also ties in nicely with client sessionization in that, if implemented, the handler will automatically notify the sessionization object about foreground and backgroud states - rather than you having to manually set this change yourself.

The payload from these events resembles the following:

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.snowplow\\/unstruct_event\\/jsonschema\\/1-0-0",
  "data": {
    "schema": "iglu:com.snowplowanalytics.snowplow\\/application_background\\/jsonschema\\/1-0-0",
    "data": {
      "backgroundIndex": 6
    }
  }
}
{% endhighlight %}

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.snowplow\\/unstruct_event\\/jsonschema\\/1-0-0",
  "data": {
    "schema": "iglu:com.snowplowanalytics.snowplow\\/application_foreground\\/jsonschema\\/1-0-0",
    "data": {
      "foregroundIndex": 5
    }
  }
}
{% endhighlight %}

Everytime your application goes to the background or to the foreground a unique index is incremented to keep track of how many times the user goes back and forth from your applications focus.

In the future we hope to add many more automated events around the Android LifeCycle to help paint the picture of user interaction in your application!

__Important__:  Before switching this feature on for batch processing you must deploy the appropriate Redshift DDLs and JsonPaths.  These can be found at the following links:

- `application_background`: 
  - [Redshift DDL](https://raw.githubusercontent.com/snowplow/snowplow/feature/application-schemas/4-storage/redshift-storage/sql/com.snowplowanalytics.snowplow/application_background_1.sql)
  - [JsonPath](https://raw.githubusercontent.com/snowplow/snowplow/feature/application-schemas/4-storage/redshift-storage/jsonpaths/com.snowplowanalytics.snowplow/application_background_1.json)
- `application_foreground`: 
  - [Redshift DDL](https://raw.githubusercontent.com/snowplow/snowplow/feature/application-schemas/4-storage/redshift-storage/sql/com.snowplowanalytics.snowplow/application_foreground_1.sql)
  - [JsonPath](https://raw.githubusercontent.com/snowplow/snowplow/feature/application-schemas/4-storage/redshift-storage/jsonpaths/com.snowplowanalytics.snowplow/application_foreground_1.json)

<h2><a name="sessions">5. Client session updates</a></h2>

Further to improving our understanding of client sessions in the Android Tracker we have also amended what constitutes a new session.  Historically if an application was in the background the session would continue to expire and itterate.  Allowing for very large blocks between session index counts.

Once the application is sent to the background it will now stop itterating immediately after expiration.  It will also immediately resume once it detects that the application has moved to the foreground again.

For more information on this please see [#192](https://github.com/snowplow/snowplow-android-tracker/issues/192).

<h2><a name="true-timestamp">6. True Timestamp</a></h2>

True timestamps in Snowplow are a way to indicate that you really trust the time given as accurate; this is particularly useful if you are using a tracker to “replay” events with definitive timestamps into Snowplow. You can find out more about how time is handled in Snowplow [in our blog post here](http://snowplowanalytics.com/blog/2015/09/15/improving-snowplows-understanding-of-time/).

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

<h2><a name="api-changes">7. API changes</a></h2>

The Subject class no longer controls the creation of the `mobile_context` and `geolocation_context`.  These are now setup by:

{% highlight java %}
Tracker.init(new Tracker.TrackerBuilder(...)
  .geoLocationContext(true)
  .mobileContext(true)
  .build()
);
{% endhighlight %}

__Note__: If you are building your application for API 24+ you will need to manually request the geolocation manifest permissions for the Tracker.  For sample code please see the [technical documentation](https://github.com/snowplow/snowplow/wiki/Android-Tracker#322-geolocation_context).

<h2><a name="other-changes">8. Other changes</a></h2>

We have also:

* Updated the `client_session` context to include the `firstEventId` ([#160][160])
* Updated the `mobile_context` context to include both `networkType` and `networkTechnology` ([#180][180]), thanks [@bernardosrulzon](https://github.com/bernardosrulzon)!
* Updated the `geolocation_context` context to include `timestamp` ([#203][203])
* Added support for attaching the `trueTimestamp` to events ([#196][196])

<h2><a name="demo-application">9. Demo app</a></h2>

As part of removing RxJava from the Tracker the demo application has also been greatly simplified.  It also now showcases the new Lifecycle Handler events that have been added to the Tracker.

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

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[android-issues]: https://github.com/snowplow/snowplow-android-tracker/issues
