---
layout: post
title: Snowplow Objective-C Tracker 0.6.0 released
title-short: Snowplow Objective-C Tracker 0.6.0
tags: [snowplow, analytics, ios, osx, objc, objectivec]
author: Josh
category: Releases
---

We are pleased to release version 0.6.0 of the [Snowplow Objective-C Tracker] [objc-repo].  This release introduces several performance upgrades and some breaking API changes. Many thanks to [Jason][iamjason] for his contribution to this release!

In the rest of this post we will cover:

1. [Tracker performance](/blog/2015/11/04/snowplow-objective-c-tracker-0.6.0-released/#tracker-performance)
2. [Event creation](/blog/2015/11/04/snowplow-objective-c-tracker-0.6.0-released/#event-creation)
3. [API updates](/blog/2015/11/04/snowplow-objective-c-tracker-0.6.0-released/#api-updates)
4. [iOS 9.0 changes](/blog/2015/11/04/snowplow-objective-c-tracker-0.6.0-released/#ios-9.0)
5. [Demonstration app](/blog/2015/11/04/snowplow-objective-c-tracker-0.6.0-released/#demo)
6. [Other changes](/blog/2015/11/04/snowplow-objective-c-tracker-0.6.0-released/#changes)
7. [Upgrading](/blog/2015/11/04/snowplow-objective-c-tracker-0.6.0-released/#upgrading)
8. [Getting help](/blog/2015/11/04/snowplow-objective-c-tracker-0.6.0-released/#help)

<!--more-->

<h2><a name="tracker-performance">1. Tracker performance</a></h2>

This release brings about a rethink to POST requests and the count of events we send.  Historically a POST consisted of a predetermined count of events, a batch.  This batch was limited to a maximum of 10 events in the case of the Objective-C Tracker.  We have now removed this limitation and imposed a much more performant metric for determining a POST size; the maximum amount of bytes the collector can receive.

Imagine a single event is 1000 bytes in size.  This meant that the maximum amount of bytes we are able to send is 10000, less than a 5th of what the collectors can safely handle.  To send 50 events would subsequently result in 5 seperate requests being sent.

Under the new metric we can send all 50 of those events in a single request.  Resulting in better sending performance and far less network activity.

Please note that this limit currently defaults to 40000 bytes to leave a safe margin beneath the maximum of 52000.  However this can be easily changed in the constructor like so:

{% highlight objective-c %}
SPEmitter *emitter = [SPEmitter build:^(id<SPEmitterBuilder> builder) {
        [...]
        [builder setByteLimitGet:52000]; // Default is 40000
        [builder setByteLimitPost:52000]; // Default is 40000
    }];
{% endhighlight %}

NOTE: If you exceed 52000 there is no guarantee that your events will send.

<h2><a name="event-creation">2. Event creation</a></h2>

Following from the Android Tracker we have now implemented builder patterns for all of the events available to the Tracker.  This is quite a large API change but one which will allow future customization with much greater ease.

To illustrate the change we will send a PageView event under the old and new styles:

{% highlight objective-c %}
// Deprecated
[tracker trackPageView:@"DemoPageUrl" 
                 title:nil 
              referrer:@"DemoPageReferrer"];

// New
SPPageView *event = [SPPageView build:^(id<SPPageViewBuilder> builder) {
    [builder setPageUrl:@"DemoPageUrl"];
    [builder setReferrer:@"DemoPageReferrer"];
}];
[tracker trackPageViewEvent:event];
{% endhighlight %}

While the builder pattern introduces some level of verbosity it has several key advantages:

* No need to set `nil` values for fields that are not required and that you do not want to fill.
* Allows us to extend the API without having to introduce API changes in the future.
* Allows you to build an event ahead of time without having to send it instantly.

Please refer to the [technical documentation][tech-docs] for other examples.

<h2><a name="api-updates">3. API updates</a></h2>

With the aforementioned performance updates the SPEmitter has undergone some minor updates:

* Removed `setBufferOption` builder function in favour of using ByteLimits.
* Added `setProtocol` builder function for choosing between `HTTP` and `HTTPS`
* Added `setByteLimitGet` builder function for setting a GET request byte maximum
* Added `setByteLimitPost` builder function for setting a POST request byte maximum
* Changed `setUrlEndpoint` builder function to accept an NSString instead of an NSURL
  - You now only need to set the resource name for the collector.

The SPTracker has also had all of its tracking functions updated to match the changes to how events are constructed.  The function names are mostly the same however they now accept only a single variable in the form of the event object created.

{% highlight objective-c %}
// Create the event object
SPPageView *event = [SPPageView build:^(id<SPPageViewBuilder> builder) {
    [builder setPageUrl:@"DemoPageUrl"];
    [builder setReferrer:@"DemoPageReferrer"];
}];

// Track the event
[tracker trackPageViewEvent:event];
{% endhighlight %}

We have also added support for the Geo-Location context.  Due to the difficulty involved in actually getting the relevant data we have left it up to you, the developer, to get the data for us to add to the Tracker.

During SPSubject creation you can now specify if you intend to use this context:

{% highlight objective-c %}
SPSubject * subject = [[SPSubject alloc] initWithPlatformContext:YES andGeoContext:YES];
{% endhighlight %}

You will then need to populate the various geo-location data points.  At a minimum you must populate the Latitude and Longitude fields:

{% highlight objective-c %}
[subject setGeoLatitude:123.123]
[subject setGeoLongitude:-123.123]
{% endhighlight %}

The context will then be automatically added to all of your events.

<h2><a name="ios-9.0">4. iOS 9.0 and XCode 7 changes</a></h2>

With the release of iOS 9.0 several parts of the Tracker have been updated to keep everything running smoothly:

* Have removed the ability to use OpenIDFA under iOS 9.0+ (still functional for older versions) ([#175][175])

With the release of XCode 7+ we have also had to instrument several other changes:

* Fixed a classname collision with SPUtils and WatchKit.framework, many thanks to [Jason][iamjason] ([#228][228])
* Updated a deprecated function use for iOS 8, many thanks to [Jason][iamjason] ([#230][230])

We have also added the ability to use the Tracker from within a `tvOS` application to go with the release of XCode 7.1.  Simply add the SnowplowTracker dependency to your podfile as you would normally.

{% highlight python %}
pod 'SnowplowTracker', '~> 0.6'
{% endhighlight %}

Please note that to use `tvOS` you will need version 0.39.+ of cocoapods.

<h2><a name="demo">5. Demonstration app</a></h2>

The demonstration application has again been updated to reflect all of the changes that have taken place.  If you are unsure about your own implementation or need any sample code please do review the code available [here][demo-code] and [here][demo-code-1].

<h2><a name="changes">6. Other changes</a></h2>

Other updates include:

* Added precondition checks to all core object construction ([#117][117])
* Added a SelfDescribingJson class to ensure we build objects correctly ([#119][119])
* Upgraded the client_session schema to 1-0-1 and started recording the firstEventId ([#194][194])
* Added tests to assert that all generated schemas are valid using SnowplowIgluClient ([#222][222])
* Fixed floats and doubles not being correctly shortened to two decimal places ([#232][232])

<h2><a name="upgrading">7. Upgrading</a></h2>

To add the Snowplow Objective-C Tracker as a dependency to your own app, add the following into your Podfile:

{% highlight python %}
pod 'SnowplowTracker', '~> 0.6'
{% endhighlight %}

If you prefer, you can manually add the tracker's source code and dependencies into your project's codebase, or use the Static Framework.

<h2><a name="help">8. Getting help</a></h2>

Useful links:

* The [technical documentation][tech-docs]
* The [setup guide][setup-guide]
* The [0.6.0 release notes][tracker-060]

If you have an idea for a new feature or want help getting things set up, please [get in touch] [talk-to-us]. And [raise an issue] [issues] if you spot any bugs!

[objc-repo]: https://github.com/snowplow/snowplow-objc-tracker
[tech-docs]: https://github.com/snowplow/snowplow/wiki/iOS-Tracker
[setup-guide]: https://github.com/snowplow/snowplow/wiki/iOS-Tracker-Setup
[tracker-060]: https://github.com/snowplow/snowplow-objc-tracker/releases/tag/0.6.0
[194]: https://github.com/snowplow/snowplow-objc-tracker/issues/194
[119]: https://github.com/snowplow/snowplow-objc-tracker/issues/119
[117]: https://github.com/snowplow/snowplow-objc-tracker/issues/117
[175]: https://github.com/snowplow/snowplow-objc-tracker/issues/175
[231]: https://github.com/snowplow/snowplow-objc-tracker/issues/231
[228]: https://github.com/snowplow/snowplow-objc-tracker/issues/228
[230]: https://github.com/snowplow/snowplow-objc-tracker/issues/230
[222]: https://github.com/snowplow/snowplow-objc-tracker/issues/222
[232]: https://github.com/snowplow/snowplow-objc-tracker/issues/232
[iamjason]: https://github.com/iamjason
[demo-code]: https://github.com/snowplow/snowplow-objc-tracker/blob/master/SnowplowDemo/SnowplowDemo/DemoUtils.m
[demo-code-1]: https://github.com/snowplow/snowplow-objc-tracker/blob/master/SnowplowDemo/SnowplowDemo/ViewController.m
[9.0-release-notes]: https://developer.apple.com/library/prerelease/ios/releasenotes/General/WhatsNewIniOS/Articles/iOS9.html
[lib-dl]: http://dl.bintray.com/snowplow/snowplow-generic/snowplow_objc_tracker_0.6.0.zip
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues
