---
layout: post
title: Snowplow Objective-C Tracker 0.6.0 released
title-short: Snowplow Objective-C Tracker 0.6.0
tags: [snowplow, analytics, ios, osx, objc, objectivec, tvos]
author: Josh
category: Releases
---

We are pleased to release version 0.6.0 of the [Snowplow Objective-C Tracker] [objc-repo]. This release refactors the event tracking API, introduces tvOS support and fixes an important bug with client sessionization ([#257][257]). Many thanks to community member [Jason][iamjason] for his contributions to this release!

In the rest of this post we will cover:

1. [Event batching](/blog/2016/01/18/snowplow-objective-c-tracker-0.6.0-released/#event-batching)
2. [Event creation](/blog/2016/01/18/snowplow-objective-c-tracker-0.6.0-released/#event-creation)
3. [API updates](/blog/2016/01/18/snowplow-objective-c-tracker-0.6.0-released/#api-updates)
4. [Geolocation context](/blog/2016/01/18/snowplow-objective-c-tracker-0.6.0-released/#geo)
5. [iOS 9.0 and XCode 7 changes](/blog/2016/01/18/snowplow-objective-c-tracker-0.6.0-released/#ios-9.0)
6. [tvOS support](/blog/2016/01/18/snowplow-objective-c-tracker-0.6.0-released/#tvos)
7. [Demonstration app](/blog/2016/01/18/snowplow-objective-c-tracker-0.6.0-released/#demo)
8. [Other changes](/blog/2016/01/18/snowplow-objective-c-tracker-0.6.0-released/#changes)
9. [Upgrading](/blog/2016/01/18/snowplow-objective-c-tracker-0.6.0-released/#upgrading)
10. [Getting help](/blog/2016/01/18/snowplow-objective-c-tracker-0.6.0-released/#help)

<!--more-->

<h2><a name="event-batching">1. Event batching</a></h2>

Historically, the Objective-C Tracker used 10 events as a hard upper-limit to the number of events to send to a Snowplow collector at a time in a single `POST`. 

As of this release, we are replacing this with a limit on the number of bytes in a single `POST`. This defaults to 40,000 bytes, but you can override it like so:

{% highlight objective-c %}
SPEmitter *emitter = [SPEmitter build:^(id<SPEmitterBuilder> builder) {
        [...]
        [builder setByteLimitGet:52000]; // Default is 40000
        [builder setByteLimitPost:52000]; // Default is 40000
    }];
{% endhighlight %}

As you can see, this release also implements a byte limit for `GET`s, which always contain only 1 event.

In the case that a single event exceeds the byte limit, the tracker will attempt to send that event on its own, but won't attempt to resend the event in the case of a failure (i.e. won't write that event to the event store). In other words, the tracker will "fire and forget" outsized events.

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

While the builder pattern introduces some verbosity, it has several key advantages:

* No need to set `nil` values for fields that are not required and that you do not want to fill
* Allows us to extend the API without having to introduce breaking API changes in the future
* Allows you to build an event ahead of time without having to send it instantly

Please refer to the [technical documentation][tech-docs] for other examples.

<h2><a name="api-updates">3. API updates</a></h2>

With the aforementioned performance updates the `SPEmitter` has undergone some important updates:

* Added `setProtocol` builder function for choosing between HTTP and HTTPS. It defaults to HTTPS
* Changed `setUrlEndpoint` builder function to accept an `NSString` instead of an NSURL
  - You now only need to set the resource name for the collector (i.e. `host/path`, **not** `http(s)://host/path`)
  - **If your endpoint uses unsecured HTTP (not HTTPS), then you must `setProtocol` to `SPHttp`**
  - **If your application is running on iOS 9, tvOS 9 or OS X 10.11 or later you will need to use `SPHttps` as per Apple's [Application Transport Security] [ats]**
* Removed `setBufferOption` builder function in favour of `setByteLimitX`, below
* Added `setByteLimitGet` builder function for setting a `GET` request byte maximum
* Added `setByteLimitPost` builder function for setting a `POST` request byte maximum

The tracking functions within `SPTracker` have all been updated to fit the new builder pattern for event creation. Each tracking function now accepts only a single variable in the form of the event object created. Here is a table of the updated tracking functions:
    
| Old function name           | New function name        | New argument type |
|-----------------------------|--------------------------|-------------------|
| `trackPageView`             | `trackPageViewEvent`     | `SPPageView`      |
| `trackStructuredEvent`      | `trackStructuredEvent`   | `SPStructured`    |
| `trackUnstructuredEvent`    | `trackUnstructuredEvent` | `SPUnstructured`  |
| `trackScreenView`           | `trackScreenViewEvent`   | `SPScreenView`    |
| `trackTimingWithCategory`   | `trackTimingEvent`       | `SPTiming`        |
| `trackEcommerceTransaction` | `trackEcommerceEvent`    | `SPEcommerce`     |

To access the new builders (`SPPageViewBuilder` et al), make sure to import this new file into your code:

{% highlight objective-c %}
import "SPEvent.h"
{% endhighlight %}

<h2><a name="geo">4. Geolocation context</a></h2>

We have also added support for Snowplow's [geolocation context] [geolocation-context]. During `SPSubject` creation you can now specify if you intend to use this context:

{% highlight objective-c %}
SPSubject * subject = [[SPSubject alloc] initWithPlatformContext:YES andGeoContext:YES];
{% endhighlight %}

Whereas in the JavaScript and Android Trackers we can automatically fetch the geo-location data for you, in this tracker you need to supply the geo-location data yourself. At a minimum you must populate the latitude and longitude fields:

{% highlight objective-c %}
[subject setGeoLatitude:123.123]
[subject setGeoLongitude:-123.123]
{% endhighlight %}

The context will then be automatically added to all of your subsequent events. If you don't set the latitude and longitude, then the geolocation context will not be added.

<h2><a name="ios-9.0">5. iOS 9.0 and XCode 7 changes</a></h2>

With the release of iOS 9.0 we have updated the Tracker as follows:

* We have removed the ability to use OpenIDFA under iOS 9.0+ (this is still functional for older versions) ([#175][175])

With the release of XCode 7 we have updated the Tracker as follows:

* We have fixed a classname collision between `SPUtils` and `WatchKit.framework` ([#228][228])
* We have handled the deprecation of OpenIDFA's calendar in iOS 8 ([#230][230])

Many thanks to [Jason][iamjason] for bringing both of these issues to our attention!

<h2><a name="tvos">6. tvOS support</a></h2>

We have also added the ability to use the Tracker from within a [tvOS] [tvos] application in concert with the release of XCode 7.1.

Simply add the SnowplowTracker dependency to your podfile as you would normally:

{% highlight python %}
pod 'SnowplowTracker', '~> 0.6'
{% endhighlight %}

Please note that to use `tvOS` you will need version 0.39.+ of CocoaPods.

<h2><a name="demo">7. Demonstration app</a></h2>

The demo application has again been updated to reflect all of the changes that have taken place. If you are unsure about your own implementation or need any sample code please do review the code available [here][demo-code] and [here][demo-code-1].

<h2><a name="changes">8. Other changes</a></h2>

Other updates include:

* Fixed a bug where the first `client_session` was passing an empty string instead of a null value ([#257][257])
* Added precondition checks to all core object construction ([#117][117])
* Added a SelfDescribingJson class to ensure we build objects correctly ([#119][119])
* Upgraded the client_session schema to 1-0-1 and started recording the firstEventId ([#194][194])
* Added tests to assert that all generated schemas are valid using SnowplowIgluClient ([#222][222])
* Fixed floats and doubles not being correctly shortened to two decimal places ([#232][232])

<h2><a name="upgrading">9. Upgrading</a></h2>

To add the Snowplow Objective-C Tracker as a dependency to your own app, add the following into your Podfile:

{% highlight python %}
pod 'SnowplowTracker', '~> 0.6'
{% endhighlight %}

If you prefer, you can manually add the tracker's source code and dependencies into your project's codebase, or use the [Static Framework for iOS] [lib-dl].

<h2><a name="help">10. Getting help</a></h2>

Useful links:

* The [technical documentation][tech-docs]
* The [setup guide][setup-guide]
* The [0.6.0 release notes][tracker-060]

If you have an idea for a new feature or want help getting things set up, please [get in touch] [talk-to-us]. And [raise an issue] [issues] if you spot any bugs!

[objc-repo]: https://github.com/snowplow/snowplow-objc-tracker
[tech-docs]: https://github.com/snowplow/snowplow/wiki/iOS-Tracker
[setup-guide]: https://github.com/snowplow/snowplow/wiki/iOS-Tracker-Setup
[tracker-060]: https://github.com/snowplow/snowplow-objc-tracker/releases/tag/0.6.0

[geolocation-context]: http://iglucentral.com/schemas/com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0
[tvos]: https://developer.apple.com/tvos/
[ats]: https://forums.developer.apple.com/thread/3544

[194]: https://github.com/snowplow/snowplow-objc-tracker/issues/194
[119]: https://github.com/snowplow/snowplow-objc-tracker/issues/119
[117]: https://github.com/snowplow/snowplow-objc-tracker/issues/117
[175]: https://github.com/snowplow/snowplow-objc-tracker/issues/175
[231]: https://github.com/snowplow/snowplow-objc-tracker/issues/231
[228]: https://github.com/snowplow/snowplow-objc-tracker/issues/228
[230]: https://github.com/snowplow/snowplow-objc-tracker/issues/230
[222]: https://github.com/snowplow/snowplow-objc-tracker/issues/222
[232]: https://github.com/snowplow/snowplow-objc-tracker/issues/232
[257]: https://github.com/snowplow/snowplow-objc-tracker/issues/257
[iamjason]: https://github.com/iamjason
[demo-code]: https://github.com/snowplow/snowplow-objc-tracker/blob/master/SnowplowDemo/SnowplowDemo/DemoUtils.m
[demo-code-1]: https://github.com/snowplow/snowplow-objc-tracker/blob/master/SnowplowDemo/SnowplowDemo/ViewController.m
[9.0-release-notes]: https://developer.apple.com/library/prerelease/ios/releasenotes/General/WhatsNewIniOS/Articles/iOS9.html
[lib-dl]: http://dl.bintray.com/snowplow/snowplow-generic/snowplow_objc_tracker_0.6.0.zip
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues
