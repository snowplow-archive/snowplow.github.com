---
layout: post
title: Snowplow Objective-C Tracker 0.3.0 released
title-short: Snowplow Objective-C Tracker 0.3.0
tags: [snowplow, analytics, ios, osx, objc, objectivec]
author: Alex
category: Releases
---

We are pleased to release version 0.3.0 of the [Snowplow Objective-C Tracker] [objc-repo]. Many thanks to [James Duncan Davidson] [duncan] and [atdrendel] [atdrendel] from 6Wunderkinder, and former Snowplow intern [Jonathan Almeida] [jonalmeida] for their huge contributions to this release!

In the rest of this post we will cover:

1. [Mac OS-X support](/blog/2015/02/15/snowplow-objective-c-tracker-0.3.0-released/#osxs)
3. [New trackTimingWithCategory event](/blog/2015/02/15/snowplow-objective-c-tracker-0.3.0-released/#timing)
3. [Removed AFnetworking dependency](/blog/2015/02/15/snowplow-objective-c-tracker-0.3.0-released/#nsurl)
4. [Other API changes](/blog/2015/02/15/snowplow-objective-c-tracker-0.3.0-released/#api)
5. [Upgrading](/blog/2015/02/15/snowplow-objective-c-tracker-0.3.0-released/#upgrading)
6. [Getting help](/blog/2015/02/15/snowplow-objective-c-tracker-0.3.0-released/#help)

<!--more-->

<h2><a name="osx">1. Mac OS-X support</a></h2>

The team at 6Wunderkinder have added Mac OS X support to the tracker - necessitating its renaming from the Snowplow "iOS Tracker" to "Objective-C Tracker". You can now embed Snowplow event tracking in your desktop OS-X applications. Huge thanks [James] [duncan] and [atdrendel] [atdrendel] for contributing this excellent new functionality!

Please note that this tracker will attach a new context, called `desktop_context` to events when run in OS-X. The JSON Schema for `desktop_context` is now available in Iglu Central; the JSON Paths file and Redshift table definition will be available from the next Snowplow release, release 61 "Pygmy Parrot".

<h2><a name="timing">2. New trackTimingWithCategory event</a></h2>

You can now track Google Analytics-style user timings, with the new `trackTimingWithCategory` event. Here is an example:

{% highlight objective-c %}
// Upon returning from background
[tracker trackTimingWithCategory:@"Application"
                        variable:@"Background"
                          timing:324
                           label:@"production"];
{% endhighlight %}

Again, the JSON Paths file and Redshift table definition will be available from Snowplow release 61 "Pygmy Parrot".

<h2><a name="nsurl">3. Removed AFnetworking dependency</a></h2>

We received feedback from multiple mobile developers that the tracker's dependency on AFnetworking was making it more difficult for them to integrate it into their apps. Again, the team at 6Wunderkinder stepped up, contributing a patch that swapped out AFnetworking for the standard `NSURLSession`. This change should make it much easier for developers to integrate the Snowplow iOS Tracker. Thanks again guys!

<h2><a name="api">4. Other API changes</a></h2>

Former Snowplow intern [Jonathan Almeida] [jonalmeida] has cleaned up the tracker's API to bring it more in-line with our other trackers. In particular, the class formerly known as `SnowplowRequest` is now called `SnowplowEmitter`. Please update your calling code.

Jonathan has also contributed a new initializer for the `SnowplowEmitter`, with POST as the default method. Many thanks Jonathan!

<h2><a name="upgrading">5. Upgrading</a></h2>

To add the Snowplow Objective-C Tracker as a dependency to your own app, add the following into your Podfile:

{% highlight python %}
pod 'SnowplowTracker', '~> 0.3'
{% endhighlight %}

If you prefer, you can manually add the tracker's source code and dependencies into your project's codebase.

<h2><a name="help">6. Getting help</a></h2>

Useful links:

* The [technical documentation][tech-docs]
* The [setup guide][setup-guide]
* The [0.3.0 release notes][tracker-030]

If you have an idea for a new feature or want help getting things set up, please [get in touch] [talk-to-us]. And [raise an issue] [issues] if you spot any bugs!

[objc-repo]: https://github.com/snowplow/snowplow-objc-tracker
[duncan]: https://github.com/duncan
[atdrendel]: https://github.com/atdrendel
[jonalmeida]: https://github.com/jonalmeida

[tech-docs]: https://github.com/snowplow/snowplow/wiki/iOS-Tracker
[setup-guide]: https://github.com/snowplow/snowplow/wiki/iOS-Tracker-Setup
[tracker-030]: https://github.com/snowplow/snowplow-objc-tracker/releases/tag/0.3.0

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues
