---
layout: post
shortenedlink: Snowplow Android Tracker 0.4.0 released
title: Snowplow Android Tracker 0.4.0 released
tags: [snowplow, analytics, android, mobile, tracker]
author: Josh
category: Releases
---

We are pleased to announce the release of the fourth version of the [Snowplow Android Tracker][repo]. The Tracker has undergone a series of changes in light of the issues around the Android [dex limit][], resulting in the library being split to allow for users to either opt in for the RxJava Tracker or not.

Big thanks to [Duncan][duncand] at Wunderlist for his work on splitting apart the libraries and providing an RxJava free version for those missing the dex space for it.

This release post will cover the following topics:

1. [RxJava alternatives](/blog/2015/06/18/snowplow-android-tracker-0.4.0-released/#rx-java-alternatives)
2. [Tracker updates](/blog/2015/06/18/snowplow-android-tracker-0.4.0-released/#tracker-updates)
2. [Emitter updates](/blog/2015/06/18/snowplow-android-tracker-0.4.0-released/#emitter-updates)
3. [Under the hood](/blog/2015/06/18/snowplow-android-tracker-0.4.0-released/#under-the-hood)
4. [Demo Application](/blog/2015/06/18/snowplow-android-tracker-0.4.0-released/#demo-application)
5. [Documentation](/blog/2015/06/18/snowplow-android-tracker-0.4.0-released/#docs)
6. [Getting help](/blog/2015/06/18/snowplow-android-tracker-0.4.0-released/#help)

<!--more-->

<h2><a name="rx-java-alternatives">1. RxJava alternatives</a></h2>

RxJava was brought into the Android Tracker as the better alternative to traditional Android AsyncTasks and for the speed at which it can process data; see our [last][android-0.3.0] blog post for the rational.  However it also brought with it a sizeable amount of functions to add to the dex count of any application the tracker would be integrated into. This prompted work to begin on a lighter version of the tracker; utilizing the inbuilt concurrency available to us without the overhead of RxJava.

The unique situation of having to make the library have as small a footprint as possible yielded the need to split the library into three parts; a core library, an RxJava library and a Classic library.  Essentially the RxJava and Classic libraries simply extend the core with their own concurrency logic.

<h2><a name="tracker-updates">2. Tracker updates</a></h2>

Another significant change is the move to greater concurrency in the Tracker.  All `tracker.trackXXX` functions are now operated on within a threadpool to remove any impact the tracker could have on the UI/Main Thread.  Essentially from the instant you start tracking all of the processing is moved to background threads, so there is nothing blocking for your application to deal with.

On top of this you can now also set how much logging you would like to see from the Tracker.  The new builder option:

{% highlight java %}
Tracker t1 = new Tracker
    .TrackerBuilder( ... )
    .level(LogLevel.VERBOSE) // Logging Options
    .build();
{% endhighlight %}

By default all logging from the Tracker is turned off but you can change the logging level between `VERBOSE`, `DEBUG` and `ERROR`.

<h2><a name="emitter-updates">3. Emitter updates</a></h2>

The emitter has also had five new options added to its builder.  You can now control:

* The amount of time between emitter attempts (`emitterTick`)
* The amount of times the emitter will attempt to send if there are no events to send (`emptyLimit`)
* The maximum amount of events to pull out of the database per emitter cycle (`sendLimit`):
  - This is controlled so you do not pull in huge amounts of events into heap but rather grab only a controlled amount.
* The maximum byte limit for request sending for both GET and POST requests.

To understand how you can modify the emitter this is a general flow of how it runs:

1. An event is added to the database, if the emitter is not running start it and attempt to send.
2. If the device is `offline` exit the emitter.
3. If the device is `online` and there are events to send, grab up to the `sendLimit` from the database and then sent.
4. Each event is tested to be under the specified byte limit before sending:
  - Posts are bundled together up until the byte limit.
5. After sending the emitter will then check if any more events have been added to the database:
  - If empty the `emptyCount` will itterate every tick amount that was specified.
  - If the `emptyLimit` is reached the emitter will halt.

The emitter will only be started again on a new event addition or on calling the emitter `flush()` function.

Updated emitter building example:

{% highlight java %}
Emitter e1 = new Emitter
    .EmitterBuilder( ... )
    .sendLimit(500) // Will get up to 500 events from the Database
    .emptyLimit(10) // Emitter will tick 10 times before shutting down
    .tick(5) // Emitter will tick every 5 seconds
    .byteLimitGet(40000) // The maximum GET payload must be less than 40000 bytes
    .byteLimitPost(40000) // The maximum POST payload must be less than 40000 bytes
    .build();
{% endhighlight %}

<h2><a name="under-the-hood">4. Under the hood</a></h2>

Among the splitting of libraries there have also been a range of other improvements.  Notably the dependency on Jackson JSON processor has been removed and the need to have any Google Play Services libraries has also been removed; for those developing for older versions of Android or those with a very tight dex limit.

If you do import Google Play Services you will now only need to import the analytics specific package as well instead of the entire Play Services setup:

{% highlight golang %}

compile 'com.google.android.gms:play-services-analytics:7.5.0'

{% endhighlight %}

<h2><a name="demo-application">5. Demo Application</a></h2>

This release also brings with it a Demonstration Application which will allow you to test drive both the Classic and the RxJava Trackers available.  The application allows you to send every possible combination of events to an endpoint of your choosing via HTTP or HTTPS and via GET or POST.  You can grab the APK from [here][apk-download].  To install you will need to allow installation from sources [other than the Google Play Store][other-sources].

For setting up an endpoint quickly and easily we are now also including [Ngrok][ngrok] along with [Mountebank][mountebank] in the Vagrant VM environment:

{% highlight bash %}  
 host$ git clone https://github.com/snowplow/snowplow-android-tracker.git
 host$ cd snowplow-android-tracker
 host$ vagrant up && vagrant ssh
guest$ cd /vagrant
guest$ chmod +x ./testing/setup.bash
guest$ ./testing/setup.bash
{% endhighlight %}

Then in your host machine navigate to `http://localhost:4040/`, the Ngrok interface.  Put in the endpoint provided into the application and send away!

<h2><a name="docs">6. Documentation</a></h2>

You can find the updated [Android Tracker documentation] [android-manual] on our wiki.

You can find the full release notes on GitHub as [Snowplow Android Tracker v0.4.0 release] [android-tracker-release].

<h2><a name="help">7. Getting help</a></h2>

The Android Tracker is still an immature project and we will be working hard with the community to improve it over the coming weeks and months; in the meantime, do please share any user feedback, feature requests or possible bugs.

Feel free to [get in touch][talk-to-us] or raise an issue in the [Android Tracker's issues] [android-issues] on GitHub!

[repo]: https://github.com/snowplow/snowplow-android-tracker
[duncand]: https://github.com/duncan

[android-0.3.0]: http://snowplowanalytics.com/blog/2015/02/18/snowplow-android-tracker-0.3.0-released/
[apk-download]: http://PUT_IN_URL/
[other-sources]: http://developer.android.com/distribute/tools/open-distribution.html
[ngrok]: https://ngrok.com/
[mountebank]: http://www.mbtest.org/

[android-setup]: https://github.com/snowplow/snowplow/wiki/Android-Tracker-Setup
[android-manual]: https://github.com/snowplow/snowplow/wiki/Android-Tracker
[android-manual-self]: https://github.com/snowplow/snowplow/wiki/Android-Tracker#self-describing-json
[android-tracker-release]: https://github.com/snowplow/snowplow-android-tracker/releases/tag/0.4.0

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[android-issues]: https://github.com/snowplow/snowplow-android-tracker/issues
