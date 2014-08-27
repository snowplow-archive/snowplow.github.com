---
layout: post
shortenedlink: Snowplow iOS Tracker 0.1.0 released
title: Snowplow iOS Tracker 0.1.0 released
tags: [snowplow, analytics, ios, tracker]
author: Jonathan
category: Releases
---

We're extremely excited to announce our initial release of the [Snowplow iOS Tracker 0.1.0][repo]

This is one of our highly requested trackers that allows you to track your Snowplow events on your iOS applications and games. This release comes with many features you may already be familiar with in [other Snowplow Trackers][tracker-tag] along with a few extra gems as well!

1. [How to install the tracker](/blog/2014/0x/xx/snowplow-ios-tracker-0.1.0-released/#install)
2. [How to use the tracker](/blog/2014/0x/xx/snowplow-ios-tracker-0.1.0-released/#usage)
3. [Features](/blog/2014/0x/xx/snowplow-ios-tracker-0.1.0-released/#usage)
4. [Getting help](/blog/2014/0x/xx/snowplow-ios-tracker-0.1.0-released/#help)

<!--more-->

<h2><a name="install">1. How to install the tracker</a></h2>

The Snowplow iOS Tracker is published as a Pod on CocoaPods, the dependency manager for Objective-C projects. This makes it easy to install the Tracker with minimal effort, as well as the recommended way for the Tracker to be installed.

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

You can add some additional information, like a user ID:
{% highlight objective-c %}
[tracker setUserId:"a73e94"];
{% endhighlight %}

The Tracker automatically grabs the users timezone, user language and other similar details without needing you to set it.

For mobile specfic contextual data, we grab that information as well as add to the context using the [mobile context schema][mobile-context].

We can fire some events like so:
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

For in-depth usage information on the Snowplow iOS Tracker, see the [wiki page] [wiki].

<h2><a name="usage">3. Features</a></h2>

The Snowplow iOS Tracker comes with a built-in caching feature to store any event that wasn't able to to be sent because of network connectivity failures or if events are unsent before a user exits your application. The events are stored in an sqlite database in the application's Library directory. It uses the [FMDB][fmdb] SQLite wrapper to easily do this.

For sending events, we use the [AFNetworking][afnetworking] library. Sending network requests are much similiar with it, and also future proofs the tracker for new features in the Tracker with how extensible the AFNetworking library is.

<h2><a name="help">4. Getting help</a></h2>

This is an initial release of the iOS Tracker and we're hoping to further develop the Tracker. We're looking forward to user feedback, feature requests or possible bugs. Feel free to [get in touch][talk-to-us] or [raise an issue][issues] on GitHub!

[tracker-tag]: http://snowplowanalytics.com/tags.html#tracker
[fmdb]: https://github.com/ccgus/fmdb
[afnetworking]: https://github.com/AFNetworking/AFNetworking

[repo]: https://github.com/snowplow/snowplow-ios-tracker
[mobile-context]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-0
[wiki]: https://github.com/snowplow/snowplow/wiki/iOS-Tracker
[setup]: https://github.com/snowplow/snowplow/wiki/iOS-tracker-setup
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow-ios-tracker/issues