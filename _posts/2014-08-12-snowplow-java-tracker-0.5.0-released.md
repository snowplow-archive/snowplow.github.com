---
layout: post
shortenedlink: Snowplow Java Tracker 0.5.0 released
title: Snowplow Java Tracker 0.5.0 released
tags: [snowplow, analytics, java, jvm, tracker]
author: Jonathan
category: Releases
---

We're excited to announce another release of the [Snowplow Java Tracker version 0.5.0][repo]

This release comes with a few changes to the Tracker method signatures to support our upcoming Snowplow 0.9.7 release with POST support, bug fixes, and more. Notably, we've added a new class for supporting your context data.

I'll be covering everything mentioned above in more detail:

1. [Collector endpoint changes for POST requests](/blog/2014/08/12/snowplow-java-tracker-0.5.0-released/#endpoint)
2. [The SchemaPayload Class](/blog/2014/08/12/snowplow-java-tracker-0.5.0-released/#schemapayload)
3. [Emitter callback](/blog/2014/08/12/snowplow-java-tracker-0.5.0-released/#callback)
4. [Configuring the buffer size](/blog/2014/08/12/snowplow-java-tracker-0.5.0-released/#buffersize)
5. [Tracker context bug fix](/blog/2014/08/12/snowplow-java-tracker-0.5.0-released/#trackerbug)
6. [Miscellaneouss](/blog/2014/08/12/snowplow-java-tracker-0.5.0-released/#misc)
7. [Support](/blog/2014/08/12/snowplow-java-tracker-0.5.0-released/#support)

<!--more-->

<h2><a name="endpoint">1. Collector endpoint changes for POST requests</a></h2>

We decided to [make a change to the collector endpoint][61] for POST requests that made, so that the URI path would follow the format `/[api_vendor]/[api_version]`. This is similar to how we append `/i` to the collector endpoint. So an example of what the URI would look would be:

{% highlight bash %}
http://d3rkrsqld9gmqf.cloudfront.net/com.snowplowanalytics.snowplow/tp2
{% endhighlight %}

If requests are being sent as GET, we default to appending the original `/i` to the end of the collector URI.

<h2><a name="schemapayload">2. The SchemaPayload Class</a></h2>

A new class `SchemaPayload` is added as a wrapper that to be used around your context. The idea behind the class is to make sure that the context added follows are new schema. Hence, a `SchemaPayload` can be used with only it's two main methods `setSchema` and `setData`. Here's an example if your context was a simple map:

{% highlight java %}
// Let's say your context is a simple map
Map<String, String> contextMap = new HashMap<String, String>();
contextMap.put("someContextKey", "someContextValue");

// Create a SchemaPayload to wrap that context
SchemaPayload schemaPayload = new SchemaPayload();
// Set the schema you that fits your context as required
schemaPayload.setSchema("iglu:com.snowplowanalytics.snowplow/my_schema/jsonschema/1-0-0");
// Set the context as the data
schemaPayload.setData(contextMap);

// All contexts need to be passed in as a list so we add it to one
ArrayList<SchemaPayload> contextList = new ArrayList<SchemaPayload>();
contextList.add(schemaPayload);

// For completeness, lets add this context to track a page view without Base64 encoding
tracker.trackPageView("www.mypage.com", "My Page", "www.me.com", contextList);
{% endhighlight %}

What this ends up looking like in a JSON format:

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

<h2><a name="callback">3. Emitter callback</a></h2>
The Emitter class now supports callbacks for success/failure of sending events. If events failed to be sent we didn't want to just drop them, but rather give you the option on how to handle that case. You can now pass in a class using the `RequestCallback` interface to the `Emitter` object. Here's an example which should be easier to understand:
{% highlight java %}
Emitter emitter = new Emitter(testURL, HttpMethod.GET, new RequestCallback() {
  @Override
  public void onSuccess(int bufferLength) {
    System.out.println("Buffer length for POST/GET:" + bufferLength);
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

<h2><a name="buffersize">4. Configuring the buffer size</a></h2>

When you create an `Emitter` and set the `HttpMethod` to send GET requests, we default the Emitter to send events instantly upon being tracked.

<h2><a name="trackerbug">5. Tracker context bug fix</a></h2>

[A bug existed][56] in our tracking method signatures that would pass the context argument as a `Map`, this has now been fixed to pass in a list of contexts, using the new `SchemaPayload` as mentioned above.

<h2><a name="misc">6. Miscellaneous</a></h2>

A few miscellaneous changes that have changed in this version, include the addition of some unit tests for the `Subject` class, and Base64 encoding now uses `UTF-8` from `US-ASCII`.

<h2><a name="support">7. Support</a></h2>

Please [get in touch] [talk-to-us] if you need help setting up the Snowplow Java Tracker or want to suggest a new feature. If you find any bugs, please do [raise an issue] [issues].

For more details on this release, please check out the [0.5.0 Release Notes] [release-050] on GitHub.

[56]:			https://github.com/snowplow/snowplow-java-tracker/issues/56
[60]:			https://github.com/snowplow/snowplow-java-tracker/issues/60
[61]:			https://github.com/snowplow/snowplow-java-tracker/issues/61

[repo]: 		https://github.com/snowplow/snowplow-java-tracker/tree/0.5.0
[talk-to-us]:   https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: 		https://github.com/snowplow/snowplow/issues
[release-050]: 	https://github.com/snowplow/snowplow-java-tracker/releases/tag/0.5.0