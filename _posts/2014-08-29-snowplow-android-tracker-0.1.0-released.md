---
layout: post
shortenedlink: Snowplow Android Tracker 0.1.0 released
title: Snowplow Android Tracker 0.1.0 released
tags: [snowplow, analytics, java, android, tracker]
author: Jonathan
category: Releases
---

We are proud to release the [Snowplow Android Tracker][repo], one of the most requested Trackers so far. This is a major milestone for us, since it makes use of [Snowplow 0.9.8][snplow-tag] which was released specfically for mobile tracking support.

The Android Tracker has been going through a lot preparation as we matured the [Java Tracker][java-repo]. We've now based the Android Tracker on the same Java Tracker Core that runs the Java Tracker along with a few additions, like tracking geographical location, and mobile-specific context data. As such, you'll see many similarities between the two Trackers, which I'll explain in further detail in the rest of the post:

1. [Compatibility](/blog/2014/09/xx/snowplow-android-tracker-0.1.0-released/#compatibility)
2. [How to install the tracker](/blog/2014/09/xx/snowplow-android-tracker-0.1.0-released/#how-to-install)
3. [How to use the tracker](/blog/2014/09/xx/snowplow-android-tracker-0.1.0-released/#how-to-use)
4. [Mobile context](/blog/2014/09/xx/snowplow-android-tracker-0.1.0-released/#mobile-context)
5. [Location context](/blog/2014/09/xx/snowplow-android-tracker-0.1.0-released/#location)
6. [Subject class](/blog/2014/09/xx/snowplow-android-tracker-0.1.0-released/#subject)
7. [Under the hood](/blog/2014/09/xx/snowplow-android-tracker-0.1.0-released/#under-the-hood)
8. [Getting help](/blog/2014/09/xx/snowplow-android-tracker-0.1.0-released/#help)

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

We need to create an `Emitter` to send events created by the `Tracker`. The `Emitter` instance requires an Android [`Context`] [android-context] instance as well for caching, which we explain more about [later in this post](#under-the-hood). For now, here is an example of how the `Emitter` and `Tracker` are created:

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

<h2><a name="location">5. Location context</a></h2>

The Tracker can also grab location-based contextual information as part of the [geolocation context][location-context]. To grab the location information you need to add the following permissons to your `AndroidManifest.xml`:
{% highlight html %}
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
{% endhighlight %}

When you create a Subject class, you also need to pass an Android [`Context`] [android-context] to it to retrieve the location information like so:
{% highlight java %}
Subject subject = new Subject(context);
{% endhighlight %}

The location information will be added as part of the context array, similar to how it's done with the mobile context.

<h2><a name="subject">6. Subject class</a></h2>

If you create a `Subject` object and pass a [`Context`] [android-context] to it, we're able to extra more useful information from the user's device; screen resolution, carrier information but more importantly, the [Advertising ID] [advertise-id].

Here an example of how this would look:

{% highlight java %}
// We grab basic information that we're able to
Subject subject1 = new Subject();

// We're able to grab more useful information
Subject subject = new Subject(context);
{% endhighlight %}

<h2><a name="under-the-hood">7. Under the hood</a></h2>

One of the features that makes the Android Tracker different from most, is that it uses an SQLite database to store events created. It saves them until they have been successfully sent to a collector (i.e. a 200 HTTP response is received back from the request sent). This is the main reason we requre an Android [Context] [android-context] to be passed to the Emitter.

All requests made, GET or POST, are sent using an [`AsyncTask`] [async] class to have the requests sent on a background thread, as well as having removed the option to send requests synchronously, similar to how the Java Tracker can.

<h2><a name="help">8. Getting help</a></h2>

This too is an initial release of the Android Tracker and we look forward to further releases based on your real-world usage of the tracker. We're looking forward to user feedback, feature requests or possible bugs. Feel free to [get in touch][talk-to-us] or [raise an issue][issues] on GitHub!


[repo]: https://github.com/snowplow/snowplow-android-tracker
[java-repo]: https://github.com/snowplow/snowplow-java-tracker
[snplow-tag]: https://github.com/snowplow/snowplow/releases/tag/0.9.8

[setup-doc]: https://github.com/snowplow/snowplow/wiki/Android-Tracker-Setup
[tracker-doc]: https://github.com/snowplow/snowplow/wiki/Android-and-Java-Tracker
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow-android-tracker/issues

[ios-blog]: http://snowplowanalytics.com/blog/2014/09/xx/snowplow-ios-tracker-0.1.0-released/
[mobile-context]: http://iglucentral.com/schemas/com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-0
[location-context]: http://iglucentral.com/schemas/com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-0-0

[async]: https://developer.android.com/reference/android/os/AsyncTask.html
[advertise-id]: https://developer.android.com/google/play-services/id.html
[android-context]: https://developer.android.com/reference/android/content/Context.html