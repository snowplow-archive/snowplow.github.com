---
layout: post
title: Snowplow Objective-C Tracker 0.4.0 released
title-short: Snowplow Objective-C Tracker 0.4.0
tags: [snowplow, analytics, ios, osx, objc, objectivec]
author: Josh
category: Releases
---

We are pleased to release version 0.4.0 of the [Snowplow Objective-C Tracker] [objc-repo]. Many thanks to [Alex Denisov] [alexdenisov] from Blacklane, [James Duncan Davidson][duncan] from Wunderlist, [Agarwal Swapnil] [agarwalswapnil] and [Hao Lian] [hlian] for their huge contributions to this release!

In the rest of this post we will cover:

1. [Tracker performance](/blog/2015/08/16/snowplow-objective-c-tracker-0.4.0-released/#tracker-performance)
2. [Emitter callback](/blog/2015/08/16/snowplow-objective-c-tracker-0.4.0-released/#emitter-callback)
3. [Static library](/blog/2015/08/16/snowplow-objective-c-tracker-0.4.0-released/#static)
4. [Demonstration app](/blog/2015/08/16/snowplow-objective-c-tracker-0.4.0-released/#demo)
5. [Other changes](/blog/2015/08/16/snowplow-objective-c-tracker-0.4.0-released/#changes)
6. [Upgrading](/blog/2015/08/16/snowplow-objective-c-tracker-0.4.0-released/#upgrading)
7. [Getting help](/blog/2015/08/16/snowplow-objective-c-tracker-0.4.0-released/#help)

<img src="/assets/img/blog/2015/08/demo-app-1.png" style="height: 450px; margin: 0 auto;" />

<!--more-->

<h2><a name="tracker-performance">1. Tracker performance</a></h2>

This release brings a complete rework of how the tracker sends events to address several issues and bugs.

We have removed the event `pending` state to ensure the tracker sends the event `at least once`. This change brings the tracker in-line with a `pessimistic` event sending model rather than `optimistic`.

We now control the number of threads that can be used for sending events; this prevents the application from being impacted if the tracker is suddenly given large amounts of events to track; sending will take a longer time to complete but the tracker will have a vastly reduced footprint.

To simplify the event transmission logic, the Emitter now performs as a singleton:

* Each event is added via a `[tracker trackXXX]` call
* A background thread is created to add the event to the database:
  - If the emitter is not currently running, this thread is elected to orchestrate sending
* The emitter will then pull a maximum range of events from the database:
  - If the database is empty the thread is released
* All sending requests are added to an asynchronous concurrent sending queue
* On completing all requests, the results are processed:
  - Successfully sent events are removed from the database
  - If all events failed to send, then the thread is released
* The Emitter attempts to get more events and start again, until the database is empty

With the new algorithm, we no longer require a `pending` state and we can still send all events in an asynchronous mode. This reduces database thrashing in the case of loss of connectivity of the device (pending to non-pending constantly) as well as ensuring that all events will be sent at least once. We can also control exactly how many requests are open at any one time.

<h2><a name="emitter-callback">2. Emitter callback</a></h2>

This release also includes an emitter callback option. This includes a new protocol in the Emitter which will report the amount of successful and failed requests sent by the emitter. These functions will be called everytime the emitter finishes sending a batch of events, or fails to send a batch of events.

To set it up:

{% highlight objective-c %}
// Import the required protocol into your class header file
import "RequestCallback.h"

// Add the protocol to your interface
@interface MyObjcClass : NSObject <RequestCallback>

// Methods...

@end
{% endhighlight %}

This will allow you to override the `onSuccess` and `onFailure` methods included in the protocol in your paired `.m` file:

{% highlight objective-c %}
- (void) onSuccess:(NSInteger)successCount {
    // Do something!
}

- (void) onFailure:(NSInteger)successCount failure:(NSInteger)failureCount {
    // Do something!
}
{% endhighlight %}

To add this callback to your `SnowplowEmitter` object:

{% highlight objective-c %}
SnowplowEmitter *emitter =
    [[SnowplowEmitter alloc] initWithURLRequest:[NSURL URLWithString:url_]
                                     httpMethod:method_
                                   bufferOption:option_
                                emitterCallback:self]; // New constructor argument!
{% endhighlight %}

In this example, `self` works for the callback because we are creating the Emitter in the same class as the overriden callback methods.

<h2><a name="static">3. Static library</a></h2>

We now also include the option to include the Tracker via a Static Framework downloadable from our Bintray:

[http://dl.bintray.com/snowplow/snowplow-generic/snowplow_objc_tracker_0.4.0.zip] [lib-dl]

To build it locally yourself:

* `git clone https://github.com/snowplow/snowplow-objc-tracker.git`
* Open `Snowplow.xcworkspace` in XCode
* Select the `SnowplowTracker-iOS-Static` scheme and set device to `iOS Device`
* Then run `Archive` from the `Product` menu

Please refer to the [setup guide][setup-guide] for instructions on how to integrate the static library.

Big thanks to [Alex Denisov] [alexdenisov] for adding in the scheme for building a static library for the Tracker! For more information [#171][pr-171].

<h2><a name="demo">4. Demonstration app</a></h2>

This release also bundles with it a demonstration app, allowing you to test-drive the library and providing code samples for integrating the tracker into your own app.

To open the demo app:

* `git clone https://github.com/snowplow/snowplow-objc-tracker.git`
* Open `SnowplowDemo.xcworkspace` in XCode, located in the SnowplowDemo sub-folder
* Change the scheme to `SnowplowDemo` from `SnowplowTracker`
* Change the device to an iPhone 5 or similar
* Click the Run button

Now you just need to enter a valid endpoint URL to send events to. To ease testing we supply a Mountebank local testing endpoint for use with the app:

{% highlight bash %}
 host$ git clone https://github.com/snowplow/snowplow-objc-tracker.git
 host$ cd snowplow-objc-tracker
 host$ vagrant up && vagrant ssh
guest$ cd /vagrant
guest$ mb &
guest$ curl -X POST -d @/vagrant/integration-tests/imposter.json http://localhost:2525/imposters
{% endhighlight %}

The endpoint URL to enter in the demo app is `http://localhost:4545`.

Using this you can then view the sent events at [http://localhost:2525/logs] [mb-logs].

When ready hit the `Start Demo!` button. This will send all available event types to your endpoint, like so:

<img src="/assets/img/blog/2015/08/demo-app-2.png" style="width: 25%;float: left;" />
<img src="/assets/img/blog/2015/08/demo-app-3.png" style="width: 25%;float: left;" />
<img src="/assets/img/blog/2015/08/demo-app-4.png" style="width: 25%;float: left;" />
<img src="/assets/img/blog/2015/08/demo-app-5.png" style="width: 25%;float: left;" />

<h2><a name="changes">5. Other changes</a></h2>

Other updates include:

* Including network information in the `mobile_context`, many thanks to [Duncan][duncan] ([#142][pr-142])
* Macroing out the usage of `sharedApplication` in OpenIDFA to allow Snowplow to be used from an app extensions, thanks [Hao Lian][hlian]! ([#157][pr-157])
* Adding support for iOS 6 by removing `NSURLSession` in favour of `NSURLConnection`, big thanks to [Agarwal][agarwalswapnil] ([#163][pr-163])

<h2><a name="upgrading">6. Upgrading</a></h2>

To add the Snowplow Objective-C Tracker as a dependency to your own app, add the following into your Podfile:

{% highlight python %}
pod 'SnowplowTracker', '~> 0.4'
{% endhighlight %}

If you prefer, you can manually add the tracker's source code and dependencies into your project's codebase, or use the new Static Framework.

<h2><a name="help">7. Getting help</a></h2>

Useful links:

* The [technical documentation][tech-docs]
* The [setup guide][setup-guide]
* The [0.4.0 release notes][tracker-040]

If you have an idea for a new feature or want help getting things set up, please [get in touch] [talk-to-us]. And [raise an issue] [issues] if you spot any bugs!

[objc-repo]: https://github.com/snowplow/snowplow-objc-tracker

[tech-docs]: https://github.com/snowplow/snowplow/wiki/iOS-Tracker
[setup-guide]: https://github.com/snowplow/snowplow/wiki/iOS-Tracker-Setup
[tracker-040]: https://github.com/snowplow/snowplow-objc-tracker/releases/tag/0.4.0

[alexdenisov]: https://github.com/AlexDenisov
[agarwalswapnil]: https://github.com/agarwalswapnil
[hlian]: https://github.com/hlian
[duncan]: https://github.com/duncan

[mb-logs]: http://localhost:2525/logs

[lib-dl]: http://dl.bintray.com/snowplow/snowplow-generic/snowplow_objc_tracker_0.4.0.zip

[pr-142]: https://github.com/snowplow/snowplow-objc-tracker/pull/142
[pr-157]: https://github.com/snowplow/snowplow-objc-tracker/pull/157
[pr-163]: https://github.com/snowplow/snowplow-objc-tracker/pull/163
[pr-171]: https://github.com/snowplow/snowplow-objc-tracker/pull/171

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues
