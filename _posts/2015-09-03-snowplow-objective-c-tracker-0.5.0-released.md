---
layout: post
title: Snowplow Objective-C Tracker 0.5.0 released
title-short: Snowplow Objective-C Tracker 0.5.0
tags: [snowplow, analytics, ios, osx, objc, objectivec]
author: Josh
category: Releases
---

We are pleased to release version 0.5.0 of the [Snowplow Objective-C Tracker] [objc-repo].  This release introduces client sessionization, several performance upgrades and some breaking API changes.

In the rest of this post we will cover:

1. [Client sessionization](/blog/2015/09/03/snowplow-objective-c-tracker-0.5.0-released/#sessionization)
2. [Tracker performance](/blog/2015/09/03/snowplow-objective-c-tracker-0.5.0-released/#tracker-performance)
3. [Event decoration](/blog/2015/09/03/snowplow-objective-c-tracker-0.5.0-released/#event-decoration)
4. [API changes](/blog/2015/09/03/snowplow-objective-c-tracker-0.5.0-released/#api-changes)
5. [Demonstration app](/blog/2015/09/03/snowplow-objective-c-tracker-0.5.0-released/#demo)
6. [Other changes](/blog/2015/09/03/snowplow-objective-c-tracker-0.5.0-released/#changes)
7. [Upgrading](/blog/2015/09/03/snowplow-objective-c-tracker-0.5.0-released/#upgrading)
8. [Getting help](/blog/2015/09/03/snowplow-objective-c-tracker-0.5.0-released/#help)

<!--more-->

<h2><a name="sessionization">1. Client sessionization</a></h2>

This release lets you add a new `client_session` context to each of your Snowplow events, allowing you to easily group events from a single user into a single session. This functionality can be activated by passing in the following builder commands to the Tracker creation step:

{% highlight objective-c %}
SPTracker * tracker = [SPTracker build:^(id<SPTrackerBuilder> builder) {
  [...]
  [builder setSessionContext:YES];
  [builder setForegroundTimeout:300]; // 5 min   (default is 10 min)
  [builder setBackgroundTimeout:150]; // 2.5 min (default is 5 min)
  [builder setCheckInterval:10]; // 10 sec (default is 15 sec)
}];
{% endhighlight %}

* `setForegroundTimeout`: how long a session lasts in the foreground (seconds)
* `setBackgroundTimeout`: how long a session lasts in the background (seconds)
* `setCheckInterval`: the time between session validation checks (seconds)

Once sessionization has been turned on several things will begin to happen:

1. A `client_session` context will be appended to each event that is sent
2. A polling check is started to check whether or not the session has timed out
  - If your app is in the foreground and no events have been sent for the `foregroundTimeout` period, the session will be updated and a new session started
  - There is a separate timeout if your application is detected to be in the background
3. Each time the session information is updated it is stored locally in a private file which should persist for the install-life of the application
4. Each time an event is sent from the Tracker the timeout is reset

Session information should survive for the install-life of the application, i.e. until it is uninstalled from the iOS/OSX device.

<h2><a name="tracker-performance">2. Tracker performance</a></h2>

Tracker performance, especially in mobile devices, is of huge importance. To this end several core aspects of the tracker have been updated to make it as performant as possible.

Primary among these is the creation of an `SPSubject` class. This class has been introduced to remove the need to generate and fetch all event decoration information on each event track call. We can now store all event decoration information on Tracker creation and simply append the information to the events as we go. This change prevents the memory footprint from increasing with every event and removes many unneccesary cpu cycles from being used.

Tracker event sending is now controlled by whether or not the device has an active network connection.  This stops CPU cycles being used when the Tracker can't actually send events.

You can now also control the size of the Thread Pool used for event sending and the count of events retrieved from the database per event sending attempt. The first change allows you to either make the Tracker more performant by adding more available Threads, or slightly slower but less resource-intensive. The second change lets you have direct control over how many events are pulled into local memory at any one time.  These options allow you to tune the Tracker to the device to get the best performance possible.

These options are set during Emitter construction like so:

{% highlight objective-c %}
SPEmitter *emitter = [SPEmitter build:^(id<SPEmitterBuilder> builder) {
        [...]
        [builder setEmitRange:500]; // Default is 150
        [builder setEmitThreadPoolSize:30]; // Default is 15
    }];
{% endhighlight %}

<h2><a name="event-decoration">3. Event decoration</a></h2>

Along with the performance changes that the `SPSubject` class brings, it is now much easier to decide whether to attach the Subject to an event or not.

To create and attach an `SPSubject`:

{% highlight objective-c %}
SPSubject * subject = [[SPSubject alloc] init];

// Or if you would like a platform context...

SPSubject * subject = [[SPSubject alloc] initWithPlatformContext:YES];

// To attach it...

SPTracker * tracker = [SPTracker build:^(id<SPTrackerBuilder> builder) {
  [builder setSubject:subject];
  [...];
}];
{% endhighlight %}

The new controls for event decoration include:

* Whether or not a platform (desktop or mobile) context will be added to an event; historially this was always added
* Being able to update key values pairs that were previously set automatically without any way to alter
* Being able to add a huge new range of key value pairs to events that were not available in prior releases

The last two points are implemented through a series of `[subject setXXX:]` functions; please have a look at the [documentation][subject-set-functions] for what functions are available.

<h2><a name="api-changes">4. API changes</a></h2>

The main API Changes revolve around class name changes and the introduction of a builder pattern for the `SPTracker` and `SPEmitter` objects.  The former has been introduced to bring the library a little more in-line with best practices for Objective-C development. The later has been introduced to remove the need for enormous `init` functions with many overloaded alternatives; as well as setting us up for future additions without any new breaks to the API.

How to create a Tracker & Emitter under the new API with all options:

{% highlight objective-c %}
SPEmitter *emitter = [SPEmitter build:^(id<SPEmitterBuilder> builder) {
  [builder setUrlEndpoint:_url]; // Required
  [builder setBufferOption:SPBufferDefault]; // Optional
  [builder setHttpMethod:SPRequestPost]; // Optional
  [builder setEmitRange:500]; // Optional
  [builder setEmitThreadPoolSize:30]; // Optional
  [builder setCallback:self]; // Optional
}];

SPSubject * subject = [[SPSubject alloc] initWithPlatformContext:YES]; // Optional

SPTracker * tracker = [SPTracker build:^(id<SPTrackerBuilder> builder) {
  [builder setEmitter:emitter]; // Required
  [builder setSubject:subject]; // Optional
  [builder setAppId:_appId]; // Optional
  [builder setTrackerNamespace:_namespace]; // Optional
  [builder setBase64Encoded:YES]; // Optional
  [builder setSessionContext:YES]; // Optional
  [builder setForegroundTimeout:300]; // Optional
  [builder setBackgroundTimeout:150]; // Optional
  [builder setCheckInterval:10]; // Optional
}];
{% endhighlight %}

To create a Tracker & Emitter with the bare minimum settings:

{% highlight objective-c %}
SPEmitter *emitter = [SPEmitter build:^(id<SPEmitterBuilder> builder) {
  [builder setUrlEndpoint:_url]; // Required
}];

SPTracker * tracker = [SPTracker build:^(id<SPTrackerBuilder> builder) {
  [builder setEmitter:emitter]; // Required
}];
{% endhighlight %}

Those `setXXX` functions can all be called again after the initial construction if you need to update any aspect of these objects.  For example switching to a new emitter:

{% highlight objective-c %}
[tracker setEmitter:_newEmitter];
{% endhighlight %}

<h2><a name="demo">5. Demonstration app</a></h2>

The demonstration application has been updated to reflect all of the above changes so you can see how the client sessionization works and how the application responds to you turning off your internet connection.

The application also showcases a new Tracker ability to opt in/out of Tracking on the fly. This new function allows you to instanstly disable all Tracking and Sessionization aspects of the Tracker like so:

{% highlight objective-c %}
[tracker pauseEventTracking];
{% endhighlight %}

After this function is called no new events will be built or stored in the local database.  To re-enable event tracking:

{% highlight objective-c %}
[tracker resumeEventTracking];
{% endhighlight %}

You can play with this option by clicking the toggle next to `Tracking` to `OFF` and attempting to add events. You should notice that the `Made` counter continues to itterate but that the Tracker's `DB Count` and `Sent Count` do not change.

<img src="/assets/img/blog/2015/09/demo-app-1.png" style="width: 33%;float: left;" />
<img src="/assets/img/blog/2015/09/demo-app-2.png" style="width: 33%;float: left;" />
<img src="/assets/img/blog/2015/09/demo-app-3.png" style="width: 33%;float: left;" />

New labels explained:

* Session Count: how many sessions have been started during this applications installation period.
* Running: whether or not the emitter is currently sending events
* Online: whether the application has detected an active network connection
* Background: whether the application is in the background or not

<h2><a name="changes">6. Other changes</a></h2>

Other updates include:

* Fixed bug where the Emitter and Session objects were never deallocated due to NSTimer maintaining a Strong reference to the target ([#215][215])
* Fixed bug in the Emitter where the event sending pool was editing a non-thread safe object at the same time ([#216][216])
* Fixed bug where the Emitter timer could initiate a sending block on the Main Thread, many thanks to [Amornchai Kanokpullwad][zoonooz] ([#197][PR-197])
* Fixed bug in `SPRequestCallback` where Foundation was imported in the wrong spot ([#202][202])
* Added the device sending time to the event ([#158][158])
* Updated the test suite to adequately test the library for both iOS and OSX ([#208][208])

<h2><a name="upgrading">7. Upgrading</a></h2>

To add the Snowplow Objective-C Tracker as a dependency to your own app, add the following into your Podfile:

{% highlight python %}
pod 'SnowplowTracker', '~> 0.5'
{% endhighlight %}

If you prefer, you can manually add the tracker's source code and dependencies into your project's codebase, or use the Static Framework.

Once updated you will also need to change all header names to the new `SP...` notation as well as updating your Tracker and Emitter instances to use the new builder pattern mentioned above.

<h2><a name="help">8. Getting help</a></h2>

Useful links:

* The [technical documentation][tech-docs]
* The [setup guide][setup-guide]
* The [0.5.0 release notes][tracker-050]

If you have an idea for a new feature or want help getting things set up, please [get in touch] [talk-to-us]. And [raise an issue] [issues] if you spot any bugs!

[objc-repo]: https://github.com/snowplow/snowplow-objc-tracker
[tech-docs]: https://github.com/snowplow/snowplow/wiki/iOS-Tracker
[setup-guide]: https://github.com/snowplow/snowplow/wiki/iOS-Tracker-Setup
[tracker-050]: https://github.com/snowplow/snowplow-objc-tracker/releases/tag/0.5.0

[zoonooz]: https://github.com/zoonooz

[158]: https://github.com/snowplow/snowplow-objc-tracker/issues/158
[PR-197]: https://github.com/snowplow/snowplow-objc-tracker/pull/197
[202]: https://github.com/snowplow/snowplow-objc-tracker/issues/202
[208]: https://github.com/snowplow/snowplow-objc-tracker/issues/208
[215]: https://github.com/snowplow/snowplow-objc-tracker/issues/215
[216]: https://github.com/snowplow/snowplow-objc-tracker/issues/216

[lib-dl]: http://dl.bintray.com/snowplow/snowplow-generic/snowplow_objc_tracker_0.5.0.zip

[subject-set-functions]: https://github.com/snowplow/snowplow/wiki/iOS-Tracker#3-adding-extra-data

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues
