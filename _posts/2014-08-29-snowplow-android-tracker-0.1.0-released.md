---
layout: post
shortenedlink: Snowplow Android Tracker 0.1.0 released
title: Snowplow Android Tracker 0.1.0 released
tags: [snowplow, analytics, java, android, tracker]
author: Jonathan
category: Releases
---

We are proud to release the [Snowplow Android Tracker][repo], one of the most requested Trackers so far. This is a major milestone for us, since it makes use of [Snowplow 0.9.8][snplow-tag] which was released specfically for mobile tracking support.

The Android Tracker has been going through a lot preparation as we matured the [Java Tracker][java-repo]. We've now based the Android Tracker on the same Java Tracker Core that runs the Java Tracker with a few additions, like tracking geographical location and mobile-specific context data. As such, you'll see many similarities between the two Trackers, which I'll explain in further detail in the rest of the post:

1. [Compatibility](/blog/2014/09/xx/snowplow-android-tracker-0.1.0-released/#compatibility)
2. [How to install the tracker](/blog/2014/09/xx/snowplow-android-tracker-0.1.0-released/#how-to-install)
3. [How to use the tracker](/blog/2014/09/xx/snowplow-android-tracker-0.1.0-released/#how-to-use)
4. [Mobile context](/blog/2014/09/xx/snowplow-android-tracker-0.1.0-released/#mobile-context)
5. [Under the hood](/blog/2014/09/xx/snowplow-android-tracker-0.1.0-released/#under-the-hood)
6. [Getting help](/blog/2014/09/xx/snowplow-android-tracker-0.1.0-released/#help)

<!--more-->

<h2><a name="compatibility">1. Compatibility</a></h2>

The Android tracker has been built and tested with the Android SDK version 19, but is compatible with SDK version 11 and above. This means that the tracker is compatible with majority of the Android devices currently being used.

<h2><a name="how-to-install">2. How to install the tracker</a></h2>

The release version of this tracker (0.1.0) is available within Snowplow's Maven repository. We have instructions for installing the tracker for Maven, Gradle and SBT in the [Android Tracker Setup guide] [setup-doc].

Here is the Gradle setup for example:

{% highlight groovy %}
repositories {
    ...
    maven {
        url "http://maven.snplow.com/releases"
    }
}

dependencies {
    ...
    // Snowplow Android Tracker
    compile 'com.snowplowanalytics:snowplow-android-tracker:0.1.0'
}
{% endhighlight %}

<h2><a name="how-to-use">3. How to use the tracker</a></h2>

Using the tracker is requires you to import the Tracker module like so:
{% highlight java %}
import com.snowplowanalytics.snowplow.tracker.*;
{% endhighlight %}

We need to create an `Emitter` to send events created by the `Tracker`. The `Emitter` instance requires a [Context] [android-context] instance as well for caching, which we explain more about [later in this post](#under-the-hood). For now, here is an example of how the `Emitter` and `Tracker` are created:

{% highlight java %}
Emitter e1 = new Emitter("d3rkrsqld9gmqf.cloudfront.net", context, HttpMethod.POST);
Tracker t1 = new Tracker(e1, "AF003", "cloudfront");
{% endhighlight %}

Now let's send in a couple of events:

{% highlight python %}
t1.trackStructuredEvent("shop", "add-to-basket", "Add To Basket", "pcs", 2);
t1.trackScreenView("HUD > Save Game", "screen23");
{% endhighlight %}

Check out the [Android Tracker documentation] [tracker-doc] on the wiki for the tracker's full API.

<h2><a name="mobile-context">4. Mobile context</a></h2>

The Tracker automatically grabs the user's timezone, user language and other details, in a similar fashion to the Snowplow JavaScript Tracker.

Similar to the [iOS Tracker] [ios-blog], the Android Tracker also grabs a set of mobile-specific contextual data, for example, the device model, manufacturer and operating system version. This is added to each event's context array following the [mobile context schema] [mobile-context].

<h2><a name="under-the-hood">5. Under the hood</a></h2>

Caching
AsyncTask
Location

<h2><a name="help">6. Getting help</a></h2>


[repo]: https://github.com/snowplow/snowplow-android-tracker
[java-repo]: https://github.com/snowplow/snowplow-java-tracker
[snplow-tag]: https://github.com/snowplow/snowplow/releases/tag/0.9.8

[setup-doc]: https://github.com/snowplow/snowplow/wiki/Android-Tracker-Setup
[tracker-doc]: https://github.com/snowplow/snowplow/wiki/Android-and-Java-Tracker

[ios-blog]: http://snowplowanalytics.com/blog/2014/09/xx/snowplow-ios-tracker-0.1.0-released/
[mobile-context]: http://iglucentral.com/schemas/com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-0
[android-context]: https://developer.android.com/reference/android/content/Context.html