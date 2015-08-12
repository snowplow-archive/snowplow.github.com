---
layout: post
shortenedlink: Snowplow Objective-C Tracker 0.4.0 released
title: Snowplow Objective-C Tracker 0.4.0 released
tags: [snowplow, analytics, ios, osx, objc, objectivec]
author: Josh
category: Releases
---

We are pleased to release version 0.4.0 of the [Snowplow Objective-C Tracker] [objc-repo]. Many thanks to [alexdenisov][alexdenisov], [duncan][duncan], [agarwalswapnil][agarwalswapnil] and [hlian][hlian] for their huge contributions to this release!

In the rest of this post we will cover:

1. [Tracker Performance](/blog/2015/02/15/snowplow-objective-c-tracker-0.4.0-released/#tracker-performance)
2. [Emitter Callback](/blog/2015/02/15/snowplow-objective-c-tracker-0.4.0-released/#emitter-callback)
3. [Static Library](/blog/2015/02/15/snowplow-objective-c-tracker-0.4.0-released/#static)
4. [Demonstration App](/blog/2015/02/15/snowplow-objective-c-tracker-0.4.0-released/#demo)
5. [Other changes](/blog/2015/02/15/snowplow-objective-c-tracker-0.3.0-released/#changes)
6. [Upgrading](/blog/2015/02/15/snowplow-objective-c-tracker-0.3.0-released/#upgrading)
7. [Getting help](/blog/2015/02/15/snowplow-objective-c-tracker-0.3.0-released/#help)

<img src="/assets/img/blog/2015/08/demo-app-1.png" style="height: 450px; margin: 0 auto;" />

<!--more-->

<h2><a name="tracker-performance">1. Tracker Performance</a></h2>

This release brings a complete a rework of how the Tracker sends events to address several issues and bugs.

We have removed the event `pending` state to ensure the Tracker sends the event `at least once` rather than the event going into a pending state and then never being sent; occuring if the application crashes.  This change brings the Tracker in-line with a `pessimistic` event sending model rather than `optimistic`.

Controlling the amount of Threads that can be used for sending events, this prevents the application from slowing down if there are large amounts of events to send suddenly.  Events will potentially be sent slightly slower as a result but the Tracker will have a vastly reduced footprint.

To reduce the amount of concurrently sending requests and event duplication the Emitter sending now performs as a singleton:

* Event is added via a `[tracker trackXXX]` call.
* A background Thread is created to add the event to the database:
  - If the emitter is not currently running this Thread is elected to orchestrate sending.
* The emitter will then pull a maximum range of events from the database:
  - If the database is empty the Thread is released.
* All sending requests are added to an asynchronous concurrent sending queue.
* On completing all requests the results are processed:
  - Successfully sent events are removed from the database.
  - If only failures occured the Thread is released.
* Emitter attempts to get more events and start again, until the database is empty.

In this way we now do not need to have a `pending` state and we can still send all events in an asynchronous model.  This reduces database thrashing in the case of loss of connectivity of the device (pending to non-pending constantly) as well as ensuring that all events will be sent at least once.

<h2><a name="emitter-callback">2. Emitter Callback</a></h2>

This release also includes an emitter callback option.  This includes a new protocol in the Emitter which will report the amount of successful and failed requests sent by the emitter.  These functions will be called everytime the emitter finishes sending a batch of events, or failing to send a batch of events.

To set it up:

{% highlight objective-c %}
// Import the required protocol into your class header file
#import "RequestCallback.h"

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

// Self works here as we are creating the emitter in the same class as the overriden methods.
{% endhighlight %}

<h2><a name="static">3. Static Library</a></h2>

We now also include the option to include the Tracker via a Static Framework available from our bintray:

* Download link here!

To build it locally yourself:

* `git clone https://github.com/snowplow/snowplow-objc-tracker.git`
* Open `Snowplow.xcworkspace` in XCode
* Select the `SnowplowTracker-iOS-Static` scheme and set device to `iOS Device`
* Then run `Archive` from the `Product` menu.

Please refer to the [setup guide][setup-guide] for how to integrate the Static library.

Big thanks to [AlexDenisov][alexdenisov] for adding in the scheme for building a static library for the Tracker! For more information [#171][pr-171].

<h2><a name="demo">4. Demonstration App</a></h2>

This release also bundles with it a Demonstration app, allowing you to test drive the library and providing code samples for integrating the tracker into your own app.

To open the Demo App:

* `git clone https://github.com/snowplow/snowplow-objc-tracker.git`
* `cd snowplow-objc-tracker/SnowplowDemo`
* Open `SnowplowDemo.xcworkspace` in XCode

You can then launch the `SnowplowDemo` into a local emulator or on your iOS Device.  You will then just need to enter a valid
endpoint URL to send events too and hit the `Start Demo!` button.  This will then send all available event types to this endpoint.

<img src="/assets/img/blog/2015/08/demo-app-2.png" style="width: 24% margin: 0 auto;" />
<img src="/assets/img/blog/2015/08/demo-app-3.png" style="width: 24% margin: 0 auto;" />
<img src="/assets/img/blog/2015/08/demo-app-4.png" style="width: 24% margin: 0 auto;" />
<img src="/assets/img/blog/2015/08/demo-app-5.png" style="width: 24% margin: 0 auto;" />

<h2><a name="changes">5. Other changes</a></h2>

Other updates include:

* Including network information in the `mobile_context`, big thanks to [duncan][duncan]! [#142][pr-142]
* Macroing out the usage of `sharedApplication` in OpenIDFA to allow Snowplow to be used from app extensions, big thanks to [hlian][hlian]! [#157][pr-157]
* Adding support for iOS 6 by removing `NSURLSession` in favour of `NSURLConnection`, big thanks to [agarwalswapnil][agarwalswapnil]! [#163][pr-163]

<h2><a name="upgrading">6. Upgrading</a></h2>

To add the Snowplow Objective-C Tracker as a dependency to your own app, add the following into your Podfile:

{% highlight python %}
pod 'SnowplowTracker', '~> 0.4'
{% endhighlight %}

If you prefer, you can manually add the tracker's source code and dependencies into your project's codebase.

<h2><a name="help">7. Getting help</a></h2>

Useful links:

* The [technical documentation][tech-docs]
* The [setup guide][setup-guide]
* The [0.4.0 release notes][tracker-030]

If you have an idea for a new feature or want help getting things set up, please [get in touch] [talk-to-us]. And [raise an issue] [issues] if you spot any bugs!

[objc-repo]: https://github.com/snowplow/snowplow-objc-tracker

[tech-docs]: https://github.com/snowplow/snowplow/wiki/iOS-Tracker
[setup-guide]: https://github.com/snowplow/snowplow/wiki/iOS-Tracker-Setup
[tracker-040]: https://github.com/snowplow/snowplow-objc-tracker/releases/tag/0.4.0

[alexdenisov]: https://github.com/AlexDenisov
[agarwalswapnil]: https://github.com/agarwalswapnil
[hlian]: https://github.com/hlian
[duncan]: https://github.com/duncan

[pr-142]: https://github.com/snowplow/snowplow-objc-tracker/pull/142
[pr-157]: https://github.com/snowplow/snowplow-objc-tracker/pull/157
[pr-163]: https://github.com/snowplow/snowplow-objc-tracker/pull/163
[pr-171]: https://github.com/snowplow/snowplow-objc-tracker/pull/171

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues
