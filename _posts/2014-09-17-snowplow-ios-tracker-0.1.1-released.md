---
layout: post
title: Snowplow iOS Tracker 0.1.1 released
title-short: Snowplow iOS Tracker 0.1.1
tags: [snowplow, analytics, ios, tracker]
author: Jonathan
category: Releases
---

We're extremely excited to announce our initial release of the [Snowplow iOS Tracker] [repo].

Mobile trackers have been one of the Snowplow community's most highly requested features, and we are very pleased to finally have this ready for release. The Snowplow iOS Tracker will allow you to track Snowplow events from your iOS applications and games.

This release comes with many features you may already be familiar with in [other Snowplow Trackers] [tracker-tag], along with a few extra tricks as well!

1. [How to install the tracker](/blog/2014/09/17/snowplow-ios-tracker-0.1.1-released/#install)
2. [How to use the tracker](/blog/2014/09/17/snowplow-ios-tracker-0.1.1-released/#usage)
3. [Mobile context](/blog/2014/09/17/snowplow-ios-tracker-0.1.1-released/#mobile-context)
4. [Under the hood](/blog/2014/09/17/snowplow-ios-tracker-0.1.1-released/#under-the-hood)
5. [Getting help](/blog/2014/09/17/snowplow-ios-tracker-0.1.1-released/#help)

<!--more-->

<h2><a name="install">1. How to install the tracker</a></h2>

The Snowplow iOS Tracker is published as a Pod on [CocoaPods] [cocoapods], the dependency manager for Objective-C projects. This makes it easy to install the Tracker with minimal effort, and is the recommended way for installing the Tracker.

First, make sure you have CocoaPods installed on your machine if you haven't already:

{% highlight bash %}
$ gem install cocoapods
{% endhighlight %}

To add the Snowplow iOS Tracker as a dependency to your iOS project, create a `Podfile` and add the following line:

{% highlight ruby %}
platform :ios
pod 'SnowplowTracker'
{% endhighlight %}

Then execute the following line to download and install the Snowplow Tracker:
{% highlight bash %}
$ pod install
{% endhighlight %}

The Snowplow iOS Tracker is compatible with iOS applications 7.0 and higher. The [setup page][setup] has more information on the Tracker's dependencies.

<h2><a name="usage">2. How to use the tracker</a></h2>

To use the Tracker you need to create a Tracker and Request instance. The `SnowplowRequest` class is used to send events created by the `SnowplowTracker`.

You can create a `SnowplowRequest` instance easily:

{% highlight objective-c %}
NSURL *url = [NSURL URLWithString:"collector.acme.net"];
SnowplowRequest *collector = [[SnowplowRequest alloc] initWithURLRequest:url
                                                              httpMethod:@"POST"];
{% endhighlight %}

And a `SnowplowTracker` in a similar fashion:

{% highlight objective-c %}
SnowplowTracker *tracker = [[SnowplowTracker alloc] initWithCollector:collector
                                                                appId:@"AF003"
                                                        base64Encoded:false
                                                            namespace:@"cloudfront"];
{% endhighlight %}

You can easily add some additional information to each event, such as a user ID:

{% highlight objective-c %}
[tracker setUserId:"a73e94"];
{% endhighlight %}

We can then fire some events like so:

{% highlight objective-c %}
[tracker trackPageView:@"www.example.com"
                 title:@"example page"
              referrer:@"www.referrer.com"];

[tracker trackStructuredEvent:"shop"
                       action:"add-to-basket"
                     property:"pcs"
                        value:2
                    timestamp:1369330909];
{% endhighlight %}

For in-depth information on using the Snowplow iOS Tracker, please see the [wiki page] [wiki].

<h2><a name="mobile-context">3. Mobile context</a></h2>

The Tracker automatically grabs the user's timezone, user language and other details, in a similar fashion to the Snowplow JavaScript Tracker.

The Tracker also grabs a set of mobile-specific contextual data, which we add to each event's context array following the [mobile context schema] [mobile-context].

If you're using Redshift, you would need to install the mobile_context table using [this script][mobile-script].

<h2><a name="under-the-hood">4. Under the hood</a></h2>

The Snowplow iOS Tracker comes with a built-in caching feature to store any event that wasn't able to to be sent because of network connectivity failures or if events are unsent before a user exits your application. The events are stored in an sqlite database in the application's Library directory. The Tracker uses the [FMDB][fmdb] SQLite wrapper to do this.

For sending events, we use the [AFNetworking][afnetworking] library. This simplifies the process of sending network requests, and should make it easier to extend the Tracker in the future.

<h2><a name="help">5. Getting help</a></h2>

This is an initial release of the iOS Tracker and we look forward to further releases based on your real-world usage of the tracker. We're looking forward to user feedback, feature requests or possible bugs. Feel free to [get in touch][talk-to-us] or [raise an issue][issues] on GitHub!

[tracker-tag]: http://snowplowanalytics.com/tags.html#tracker
[fmdb]: https://github.com/ccgus/fmdb
[afnetworking]: https://github.com/AFNetworking/AFNetworking

[cocoapods]: http://cocoapods.org/

[repo]: https://github.com/snowplow/snowplow-ios-tracker
[mobile-context]: http://iglucentral.com/schemas/com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-0
[mobile-script]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.snowplowanalytics.snowplow/mobile_context_1.sql
[wiki]: https://github.com/snowplow/snowplow/wiki/iOS-Tracker
[setup]: https://github.com/snowplow/snowplow/wiki/iOS-tracker-setup
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow-ios-tracker/issues
