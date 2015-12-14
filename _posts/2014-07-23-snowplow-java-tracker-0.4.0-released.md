---
layout: post
title: Snowplow Java Tracker 0.4.0 released
title-short: Snowplow Java Tracker 0.4.0
tags: [snowplow, analytics, java, jvm, tracker]
author: Jonathan
category: Releases
---

We're excited to announce another release of the [Snowplow Java Tracker version 0.4.0] [release-040].

This release makes some significant updates to the Java Tracker. The main objective for this release was to bring the Tracker much closer in functional terms to the [Python Tracker] [python-tracker]. In doing so, we've added new `Emitter`, `TrackerPayload` and `Subject` classes along with various changes to the existing `Tracker` class.

Some of the other more notable features in this release is support for POST requests, sending of events asynchronous and event queueing. I'll be covering everything mentioned above in more detail:

1. [Structural improvements](/blog/2014/07/23/snowplow-java-tracker-0.4.0-released/#structure)
2. [The Emitter class](/blog/2014/07/23/snowplow-java-tracker-0.4.0-released/#emitter)
3. [The TrackerPayload class](/blog/2014/07/23/snowplow-java-tracker-0.4.0-released/#payload)
4. [The Subject class](/blog/2014/07/23/snowplow-java-tracker-0.4.0-released/#subject)
5. [Google Guava Preconditions](/blog/2014/07/23/snowplow-java-tracker-0.4.0-released/#preconditions)
6. [Tracker class constructor](/blog/2014/07/23/snowplow-java-tracker-0.4.0-released/#constructor)
7. [Optional context and timestamp](/blog/2014/07/23/snowplow-java-tracker-0.4.0-released/#optional)
8. [Miscellaneous](/blog/2014/07/23/snowplow-java-tracker-0.4.0-released/#misc)
9. [Support](/blog/2014/07/23/snowplow-java-tracker-0.4.0-released/#support)

<!--more-->

<h2><a name="structure">1. Structural improvements</a></h2>

It's important to first mention the structural changes that have come with this release, since using this version **breaks compatibility** with older versions of the Tracker. Here is a list of the changes made:

- `Tracker` interface and `ContractManager` class have been removed
- `TrackerC` class is replaced with `Tracker`
- `PayloadMap` interface is replaced with `Payload`
- `PayloadMapC` class is replaced with `TrackerPayload`
- There are four new enums:
  - `DevicePlatform` - to specify the build
  - `emitter.BufferOption` - to specify buffer queue should behave
  - `emitter.HttpMethod` - to choose between sending GET or POST requests
  - `emitter.RequestMethod` - to choose how events should be sent

<h2><a name="emitter">2. The Emitter class</a></h2>

`Emitter` lets you create multiple instances of it so you can send events to many collectors if you want. The `Emitter` class supports sending event data via GET or POST requests although note that Snowplow will only be supporting POST data in a future release. This can be set using the `HttpMethod` enum.

Events by default are buffered until they reach 10 events and are then sent in a batch. We now support sending events either in a batch or instantly upon being tracked. `BufferOption` is used to let you switch between the two options.

You can also now choose whether events should be sent asynchronously, using the `RequestMethod` enum.

*The `Emitter` by default, sends events synchronously, using GET requests and with a buffer size of 10 events.*

Here you can find an example of all the options available:

{% highlight java %}
import com.snowplowanalytics.snowplow.tracker.Emitter;
import com.snowplowanalytics.snowplow.tracker.Subject;
import com.snowplowanalytics.snowplow.tracker.Tracker;
import com.snowplowanalytics.snowplow.tracker.emitter.HttpMethod;
import com.snowplowanalytics.snowplow.tracker.emitter.BufferOption;
import com.snowplowanalytics.snowplow.tracker.emitter.RequestMethod;

public static void main(String[] args) {
  // Create a simple emitter which sends events to d3rkrsqld9gmqf.cloudfront.net
  Emitter emitter1 = new Emitter("d3rkrsqld9gmqf.cloudfront.net");

  // You can create an Emitter with the HTTP method of choice
  // Here, we are changing emitter2 to send events as POST requests
  Emitter emitter2 = new Emitter("d3rkrsqld9gmqf.cloudfront.net", HttpMethod.POST);

  // If want to send events immediately, we set the buffer accordingly
  emitter1.setBufferOption(BufferOption.Instant)

  // You can choose to have emitter 2 send events asynchronously
  emitter2.setRequestMethod(RequestMethod.Asynchronous);

  // Create a tracker instance using the two emitters
  Tracker tracker1 = new Tracker(emitter1, "cf", "CF63A");
  Tracker tracker2 = new Tracker(emitter2, "cf", "CF63A");

  // Track the user viewing the page which is sent via emitter1
  tracker1.trackPageView("www.example.com", "Hello, world!", "www.snowplowanalytics.com");

  // Track the user viewing the screen which is sent via emitter2
  tracker2.trackScreenView("Main Screen", "a8shnw7");

}
{% endhighlight %}

<h2><a name="payload">3. The TrackerPayload class</a></h2>

The `TrackerPayload` class implements the new `Payload` interface. It lets you create a `Payload` similar to a `HashMap` but made specifically for tracking events.

Currently, it's used by the `Tracker` class to create each tracking payload, but in the next release, we'll add the ability to add your own `Payload` into an Unstructured Tracking Event.

<h2><a name="subject">4. The Subject class</a></h2>

The `Subject` class functions similar to its Python counterpart: an instance of the `Subject` class represents a user who is performing an event in the **Subject**-**Verb**-**Direct Object** model proposed in our [Snowplow event grammar] [event-grammar]. Although you can create a `Tracker` instance without a `Subject`, you won't be able to add information such as user ID and timezone to your events without one.

Here's an example that shows you how to track more that one user using the `Subject` class:

{% highlight java %}
import com.snowplowanalytics.snowplow.tracker.Emitter;
import com.snowplowanalytics.snowplow.tracker.Subject;
import com.snowplowanalytics.snowplow.tracker.Tracker;
import com.snowplowanalytics.snowplow.tracker.DevicePlatform;

public static void main(String[] args) {
  // Create a simple emitter which sends events to d3rkrsqld9gmqf.cloudfront.net
  Emitter emitter = new Emitter("d3rkrsqld9gmqf.cloudfront.net");

  // Create a Subject
  Subject subject1 = new Subject();

  // Set the Platform using the DevicePlatform enum
  subject1.setPlatform(DevicePlatform.ConnectedTV);

  // Set the user id and screen resolution as well if you want
  subject1.setUserId("0a78f2867de");
  subject1.setScreenResolution(1920, 1080);

  // Create a tracker instance using the Emitter you created
  Tracker tracker = new Tracker(emitter, "cf", "CF63A");

  // Set the subject you created
  tracker.setSubject(subject1);

  // Track the user view the page
  tracker.trackPageView("www.example.com", "Hello, world!", "www.snowplowanalytics.com");

  // Create another Subject instance corresponding to a mobile user
  Subject subject2 = new Subject();
  subject.setPlatform(DevicePlatform.Mobile);
  subject.setUserId("0b08f8be3f1");

  // Change the tracker subject from subject1 to subject2
  // All events fired will have instead have information we set about subject2 attached
  tracker.setSubject(subject2);

  // Tracker user subject2 viewing a page
  tracker.trackPageView("www.example.com", "Hello, world!", "www.snowplowanalytics.com");
}
{% endhighlight %}

It is also possible to set the subject during Tracker initialization:

{% highlight java %}
Tracker tracker = new Tracker(emitter, subject, "cf", "CF63A");
{% endhighlight %}

<h2><a name="preconditions">5. Google Guava Preconditions</a></h2>

We've removed the `ContractManager` class and replaced it with Google's Precondition check. We check to make sure that trackers are not sending null or empty string parameters when tracking events.

For example, if were to track a page view without setting the `pageUrl`:

{% highlight java %}
tracker.trackPageView("", "My Page", "www.example.com");
{% endhighlight %}

We would see an exception sent:

{% highlight java %}
java.lang.IllegalArgumentException: pageUrl cannot be empty
  at com.google.common.base.Preconditions.checkArgument(Preconditions.java:125)
  at com.snowplowanalytics.snowplow.tracker.Tracker.trackPageView(Tracker.java:114)
  at com.snowplowanalytics.snowplow.tracker.TrackerTest.testTrackPageView3(TrackerTest.java:49)
  at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
  at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:57)
  at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
  at org.junit.internal.runners.JUnit38ClassRunner.run(JUnit38ClassRunner.java:84)
  at org.junit.runner.JUnitCore.run(JUnitCore.java:160)
  at com.intellij.junit4.JUnit4IdeaTestRunner.startRunnerWithArgs(JUnit4IdeaTestRunner.java:74)
  at com.intellij.rt.execution.junit.JUnitStarter.prepareStreamsAndStart(JUnitStarter.java:211)
  at com.intellij.rt.execution.junit.JUnitStarter.main(JUnitStarter.java:67)
  at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
  at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:57)
  at com.intellij.rt.execution.application.AppMain.main(AppMain.java:134)
{% endhighlight %}


<h2><a name="optional">6. Tracker class constructor</a></h2>

In the `Tracker` class, you've seen the examples from the previous posts where we've changed the `Tracker` constructor. To formally mention the changes, we now provide four options for the `Tracker` constructor:

{% highlight java %}
// Defaults encoding to true, without setting a Subject
public Tracker(Emitter emitter, String namespace, String appId)

// Defaults encoding to true, and lets you pass in a Subject
public Tracker(Emitter emitter, Subject subject, String namespace, String appId)

// Defaults to not using a Subject
public Tracker(Emitter emitter, String namespace, String appId, boolean base64Encoded);

// Everything can be set during the initial construction
public Tracker(Emitter emitter, Subject subject, String namespace, String appId, boolean base64Encoded)
{% endhighlight %}

Under the hood, the way we construct each specific tracking event is done within tracker class. Previously, the `PayloadC` class would handle this.

<h2><a name="optional">7. Optional context and timestamp</a></h2>

Similar to the `Tracker` constructor, we wanted to make it optional for you to set certain parameters without any magic numbers or null values involved.

Each Tracker now has multiple method signatures letting you send a context and/or timestamp depending on your own needs. Here are the method signatures:

{% highlight java %}
// Default created timestamp with no context
public void trackPageView(String pageUrl, String pageTitle, String referrer)

// Default created timestamp with no context
public void trackPageView(String pageUrl, String pageTitle, String referrer, Map context)

// You pass in your own timestamp with no context passed
public void trackPageView(String pageUrl, String pageTitle, String referrer, double timestamp)

// You can pass the timestamp and context you want
public void trackPageView(String pageUrl, String pageTitle, String referrer, Map context, double timestamp)
{% endhighlight %}

The TransactionItem class also has a method signature for an optional context as well:

{% highlight java %}
public TransactionItem (String order_id, String sku, double price, int quantity, String name, String category, String currency);
{% endhighlight %}

<h2><a name="misc">8. Miscellaneous</a></h2>

With the new classes being created, we've also added more unit tests to verify them. Have a look at some of them for more examples on how they are being used.

The `Constant` and `Parameter` classes have both been updated to support all the tracking parameters that would be used. This will be more useful when you start creating your own `Payload` instances.

<h2><a name="support">9. Support</a></h2>

Please [get in touch] [talk-to-us] if you need help setting up the Snowplow Java Tracker or want to suggest a new feature. The Snowplow Java Tracker is rapidly evolving, so please feel free to [raise an issue] [issues] if you find any bugs or have any feature requests.

For more details on this release, please check out the [0.4.0 Release Notes] [release-040] on GitHub.

[release-040]: https://github.com/snowplow/snowplow-java-tracker/releases/tag/0.4.0
[python-tracker]: https://github.com/snowplow/snowplow-python-tracker

[event-grammar]: /blog/2013/08/12/towards-universal-event-analytics-building-an-event-grammar/

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues
