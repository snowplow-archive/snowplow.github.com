---
layout: post
title: Snowplow Java Tracker 0.5.0 released
title-short: Snowplow Java Tracker 0.5.0
tags: [snowplow, analytics, java, jvm, tracker]
author: Jonathan
category: Releases
---

We're excited to announce another release of the [Snowplow Java Tracker version 0.5.0][repo]

This release comes with a few changes to the Tracker method signatures to support our upcoming Snowplow 0.9.7 release with POST support, bug fixes, and more. Notably, we've added a new class for supporting your context data.

I'll be covering everything mentioned above in more detail:

1. [Project structure changes](/blog/2014/08/18/snowplow-java-tracker-0.5.0-released/#structure)
2. [Collector endpoint changes for POST requests](/blog/2014/08/18/snowplow-java-tracker-0.5.0-released/#endpoint)
3. [The SchemaPayload Class](/blog/2014/08/18/snowplow-java-tracker-0.5.0-released/#schemapayload)
4. [Emitter callback](/blog/2014/08/18/snowplow-java-tracker-0.5.0-released/#callback)
5. [Configuring the buffer](/blog/2014/08/18/snowplow-java-tracker-0.5.0-released/#buffersize)
6. [Tracker context bug fix](/blog/2014/08/18/snowplow-java-tracker-0.5.0-released/#trackerbug)
7. [Miscellaneouss](/blog/2014/08/18/snowplow-java-tracker-0.5.0-released/#misc)
8. [Support](/blog/2014/08/18/snowplow-java-tracker-0.5.0-released/#support)

<!--more-->

<h2><a name="structure">1. Project structure changes</a></h2>

We have changed the project structure so that the Java Tracker is now java-tracker-core as a subproject of the root `snowplow-java-tracker` project. The structure looks something like this:

{% highlight bash %}
snowplow-java-tracker/
|_ build.gradle
|_ ...
|_ java-tracker-core/
   |_ build.gradle
   |_ ...
{% endhighlight %}

This is part of a re-structuring to make space for a `java-tracker-server` that we're looking to add in the future, and to allow code re-use with the Snowplow Android Tracker, which is coming soon. What this means for you, is that some enum classes have been moved from the `com.snowplowanalytics.snowplow.tracker` package to `com.snowplowanalytics.snowplow.tracker.core`.
If you're pulling the tracker straight from GitHub and you come across any caching warnings, try removing your current Tracker project and do a clean pull.

<h2><a name="endpoint">2. Collector endpoint changes for POST requests</a></h2>

We decided to [make a change to the collector endpoint][61] for POST requests, so that the URI path would follow the format `/[api_vendor]/[api_version]`. This is similar to how we append `/i` to the collector endpoint. So an example of what the URI would look would be:

{% highlight bash %}
http://collector.acme.net/com.snowplowanalytics.snowplow/tp2
{% endhighlight %}

If requests are being sent as GET, we default to appending the original `/i` to the end of the collector URI.

<h2><a name="schemapayload">2. The SchemaPayload Class</a></h2>

A new class `SchemaPayload` has been added as a wrapper around your custom contexts. The idea is to make sure that each context is a valid self-describing JSON which Snowplow can process. Hence, a `SchemaPayload` instance provides two methods `setSchema` and `setData`. Here's an example if your context was a simple map:

{% highlight java %}
// Let's say your context is a simple map
Map<String, String> contextMap = new HashMap<String, String>();
contextMap.put("someContextKey", "someContextValue");

// Create a SchemaPayload to wrap that context
SchemaPayload schemaPayload = new SchemaPayload();
// Set the schema you that describes your context
schemaPayload.setSchema("iglu:com.snowplowanalytics.snowplow/my_schema/jsonschema/1-0-0");
// Set the context as the data
schemaPayload.setData(contextMap);

// All contexts need to be passed in as a list so we add it to one
ArrayList<SchemaPayload> contextList = new ArrayList<SchemaPayload>();
contextList.add(schemaPayload);

// For completeness, let's add this context to a page view without Base64 encoding
tracker.trackPageView("www.mypage.com", "My Page", "www.me.com", contextList);
{% endhighlight %}

What this ends up looking like in a JSON format, note the `co` property:

{% highlight javascript %}
{
  "schema": "iglu:com.snowplowanalytics.snowplow/payload_data/jsonschema/1-0-0",
  "data": [
    {
      "e": "pv",
      "url": "www.mypage.com",
      "page": "My Page",
      "refr": "www.me.com",
      "aid": "cloudfront",
      "tna": "AF003",
      "tv": "java-0.5.0",
      "dtm": "1407831713559",
      "co": "{\"schema\":\"iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0\",\"data\":[{\"schema\":\"setse\",\"data\":{\"someContextKey\":\"someContextValue\"}}]}",
      "tz": "America/Toronto",
      "p": "pc",
      "vp": "320x480",
      "eid": "c7526a7f-a545-431e-a224-277c791111c1"
    }
  ]
}
{% endhighlight %}

The new class also changes the track methods from accepting a context of `List<Map>` to `List<SchemaPayload>`. Here's an example of the new method signatures:

{% highlight java %}
// Previous
trackPageView(String pageUrl, String pageTitle, String referrer, List<Map> context, double timestamp)
// Now
trackPageView(String pageUrl, String pageTitle, String referrer, List<SchemaPayload> context, double timestamp)
{% endhighlight %}

<h2><a name="callback">4. Emitter callback</a></h2>

The Emitter class now supports callbacks for success/failure of sending events. If events fail to send, you can now choose how to handle that failure, by passing in a class using the `RequestCallback` interface to the `Emitter` object. Here's an example to make it easier to understand:

{% highlight java %}
Emitter emitter = new Emitter(testURL, HttpMethod.GET, new RequestCallback() {
  @Override
  public void onSuccess(int successCount) {
    System.out.println("Success count for POST/GET:" + successCount);
  }

  @Override
  public void onFailure(int successCount, List<Payload> failedEvent) {
    System.out.println("Failure, successCount: " + successCount + "\nfailedEvent:\n" + failedEvent.toString());
  }
});
{% endhighlight %}

If events are all successfully sent, the `onSuccess` method returns the number of successful events sent. If there were any failures, the `onFailure` method returns the successful events sent (if any) and a *list of events* that failed to be sent (i.e. the HTTP state code did not return 200).

We've also added two new Emitter constructors to support callbacks:
{% highlight java %}
Emitter(String URI, RequestCallback callback)
Emitter(String URI, HttpMethod httpMethod, RequestCallback callback)
{% endhighlight %}

This is an optional feature, so if you choose to not worry about the failed events, you can still use the original `Emitter` constructors:
{% highlight java %}
Emitter(String URI)
Emitter(String URI, HttpMethod httpMethod)
{% endhighlight %}

<h2><a name="buffersize">5. Configuring the buffer</a></h2>

We've changed the default behavior of sending events in this update. When you create an `Emitter` and set the `HttpMethod` to send GET requests, we default the Emitter to send events instantly upon being tracked. It makes most sense to send GET requests immediately since they cannot be grouped like events sent via POST.

Here is a short example:
{% highlight java %}
// By default BufferOption.Instant is set for GET
Emitter emitter = new Emitter("collector.acme.net", HttpMethod.GET);

// By default BufferOption.Default is set as the buffer option for POST...
Emitter emitter = new Emitter("collector.acme.net", HttpMethod.POST);

// ... but we can still change that if we like
emitter.setBufferOption(BufferOption.Instant);
{% endhighlight %}

<h2><a name="trackerbug">6. Tracker context bug fix</a></h2>

There was [a bug][56] in our tracking method signatures whereby the context argument was passed as a `Map`. We have now fixed this: all signatures expect a `List` of contexts, using the new `SchemaPayload` as mentioned above. The new type for passing the context is `List<SchemaPayload>`.

<h2><a name="misc">7. Miscellaneous</a></h2>

We have made a few miscellaneous fixes in this version, including:

* We have added some unit tests for the `Subject` class
* Base64 encoding of unstructured event and context JSONs now uses `UTF-8` not `US-ASCII`

<h2><a name="support">7. Support</a></h2>

Please [get in touch] [talk-to-us] if you need help setting up the Snowplow Java Tracker or want to suggest a new feature. And of course if you find any bugs, please do [raise an issue] [issues].

For more details on this release, please check out the [0.5.0 Release Notes] [release-050] on GitHub.

[56]: https://github.com/snowplow/snowplow-java-tracker/issues/56
[60]: https://github.com/snowplow/snowplow-java-tracker/issues/60
[61]: https://github.com/snowplow/snowplow-java-tracker/issues/61

[repo]: https://github.com/snowplow/snowplow-java-tracker/tree/0.5.0
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues
[release-050]: https://github.com/snowplow/snowplow-java-tracker/releases/tag/0.5.0
