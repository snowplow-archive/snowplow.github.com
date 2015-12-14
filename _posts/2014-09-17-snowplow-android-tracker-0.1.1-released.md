---
layout: post
title: Snowplow Android Tracker 0.1.1 released
title-short: Snowplow Android Tracker 0.1.1
tags: [snowplow, analytics, java, android, tracker]
author: Jonathan
category: Releases
---

We are proud to release the [Snowplow Android Tracker] [repo], one of the most requested Trackers so far. This is a major milestone for us, leveraging [Snowplow 0.9.8] [snplow-tag] for mobile analytics support.

The Android Tracker has evolved in tandem with the [Java Tracker][java-repo]. We have based the Android Tracker on the same Java Tracker Core that powers the Java Tracker, along with a few additions, such as tracking geographical location, and sending mobile-specific context data.

So you'll see many similarities between the two Trackers, which I'll explain in further detail in the rest of the post:

1. [Compatibility](/blog/2014/09/17/snowplow-android-tracker-0.1.1-released/#compatibility)
2. [How to install the tracker](/blog/2014/09/17/snowplow-android-tracker-0.1.1-released/#how-to-install)
3. [How to use the tracker](/blog/2014/09/17/snowplow-android-tracker-0.1.1-released/#how-to-use)
4. [Mobile context](/blog/2014/09/17/snowplow-android-tracker-0.1.1-released/#mobile-context)
5. [Location context](/blog/2014/09/17/snowplow-android-tracker-0.1.1-released/#geolocation-context)
6. [Under the hood](/blog/2014/09/17/snowplow-android-tracker-0.1.1-released/#under-the-hood)
7. [Getting help](/blog/2014/09/17/snowplow-android-tracker-0.1.1-released/#help)

<!--more-->

<h2><a name="compatibility">1. Compatibility</a></h2>

The Android Tracker has been built and tested with the Android SDK version 19, but is compatible with SDK version 11 and above. This means that the tracker is compatible with majority of the Android devices currently being used.

<h2><a name="how-to-install">2. How to install the tracker</a></h2>

The release version of this tracker (0.1.1) is available within Snowplow's Maven repository. We have instructions for installing the tracker for Maven, Gradle and SBT in the [Android Tracker Setup guide] [setup-doc].

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
    compile 'com.snowplowanalytics:snowplow-android-tracker:0.1.1'
    compile 'com.snowplowanalytics:snowplow-java-tracker-core:0.1.3'
}
{% endhighlight %}

To send the events, you need to update your `AndroidManifest.xml` with the internet access permission:

{% highlight html %}
<uses-permission android:name="android.permission.INTERNET" />
{% endhighlight %}

<h2><a name="how-to-use">3. How to use the tracker</a></h2>

Using the tracker requires you to import the Tracker module like so:

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

If you create a `Subject` instance, it will attach as much contextual information as it can, including by default the operating system version, device model and manufacturer.

If you construct the `Subject` with an Android [`Context`] [android-context], the Tracker will attach additional context about the user's device, such as screen resolution, carrier information and most importantly, the [Advertising ID] [advertise-id]. The Advertising ID requires the [Play Services SDK][play-services] to be set-up which you can find in more detail at the [Android Tracker Setup guide] [setup-doc].

Here an example of how this would look:

{% highlight java %}
// We attach basic context
Subject subject1 = new Subject();

// We attach additional context
Subject subject2 = new Subject(context);
{% endhighlight %}

The mobile-specific context is added to each event's context array structured using the [mobile context schema] [mobile-context].

If you're using Redshift, you would need to install the mobile_context table using [this script][mobile-script].

<h2><a name="geolocation-context">5. Geolocation context</a></h2>

The `Subject` class also lets you attach location-based contextual information to your events. To grab the location information you need to add the following permissons to your `AndroidManifest.xml`:

{% highlight html %}
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
{% endhighlight %}

Geolocation context requires you to pass an Android [`Context`] [android-context] to the Subject class. The location information will then be added as part of the context array, structured using the [geolocation context schema] [geolocation-context].

If you're using Redshift, you would need to install the geolocation_context table using [this script][geolocation-script].

<h2><a name="under-the-hood">6. Under the hood</a></h2>

The Android Tracker uses an SQLite database to store events, saving them until they have been successfully sent to a collector (i.e. a 200 HTTP response is received back from the request sent). This is the main reason we requre an Android [Context] [android-context] to be passed to the Emitter.

All requests made, either GET or POST, are sent using an [`AsyncTask`] [async] class. This lets us send events using a background thread. Note that we have removed the option to send requests synchronously, which the Java Tracker can do, to avoid blocking calls on the main UI thread.

<h2><a name="help">7. Getting help</a></h2>

This is only our first release of the Android Tracker and we look forward to further releases based on your real-world usage of the tracker.

We're looking forward to user feedback, feature requests or possible bugs. Feel free to [get in touch][talk-to-us] or [raise an issue][issues] on GitHub!

[repo]: https://github.com/snowplow/snowplow-android-tracker
[java-repo]: https://github.com/snowplow/snowplow-java-tracker
[snplow-tag]: https://github.com/snowplow/snowplow/releases/tag/0.9.8

[setup-doc]: https://github.com/snowplow/snowplow/wiki/Android-Tracker-Setup
[tracker-doc]: https://github.com/snowplow/snowplow/wiki/Android-and-Java-Tracker
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow-android-tracker/issues

[ios-blog]: http://snowplowanalytics.com/blog/2014/09/xx/snowplow-ios-tracker-0.1.1-released/
[mobile-context]: http://iglucentral.com/schemas/com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-0
[location-context]: http://iglucentral.com/schemas/com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-0-0

[async]: https://developer.android.com/reference/android/os/AsyncTask.html
[advertise-id]: https://developer.android.com/google/play-services/id.html
[play-services]: http://developer.android.com/google/play-services/index.html
[android-context]: https://developer.android.com/reference/android/content/Context.html

[mobile-context]: http://iglucentral.com/schemas/com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-0
[mobile-script]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.snowplowanalytics.snowplow/mobile_context_1.sql

[geolocation-context]: http://iglucentral.com/schemas/com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-0-0
[geolocation-script]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.snowplowanalytics.snowplow/geolocation_context_1.sql
