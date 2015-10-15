---
layout: post
title: Snowplow Unity Tracker 0.1.0 released
title-short: Snowplow Unity Tracker 0.1.0
tags: [snowplow, analytics, unity, tracker, mono, gaming]
author: Josh
category: Releases
---

We are pleased to announce the release of our much-requested [Snowplow Unity Tracker] [unity-repo]. This Tracker rounds out our support for popular mobile environments, and is an important part of our analytics offering for videogame companies. The Tracker is designed to work completely asynchronously within your Unity code to provide great performance in your games, even under heavy load.

In the rest of this post we will cover:

1. [How to install the tracker](/blog/2015/10/08/snowplow-unity-tracker-0.1.0-released/#how-to-install)
2. [How to use the tracker](/blog/2015/10/08/snowplow-unity-tracker-0.1.0-released/#how-to-use)
3. [Core features](/blog/2015/10/08/snowplow-unity-tracker-0.1.0-released/#features)
4. [Snowplow Pong](/blog/2015/10/08/snowplow-unity-tracker-0.1.0-released/#snowplow-pong)
5. [Roadmap](/blog/2015/10/08/snowplow-unity-tracker-0.1.0-released/#roadmap)
6. [Documentation](/blog/2015/10/08/snowplow-unity-tracker-0.1.0-released/#docs)
7. [Getting help](/blog/2015/10/08/snowplow-unity-tracker-0.1.0-released/#help)

<!--more-->

<h2 id="how-to-install">1. How to install the tracker</h2>

The release version of this Tracker as well as all of its dependencies are included in a single UnityPackage available from our BinTray:

[snowplow_unity_tracker_0.1.0][package-dl]

Simply add this package to your project and it should add all of the required DLLs into your Unity Project.

And that's it! You're now ready to start using the Tracker.

<h2 id="how-to-use">2. How to use the tracker</h2>

To setup the Tracker you first need to add the following `using` lines to your Unity Scripts:

{% highlight csharp %}
using SnowplowTracker;
using SnowplowTracker.Emitters;
using SnowplowTracker.Events;
{% endhighlight %}

You can then instantiate and start a new Tracker like so:

{% highlight csharp %}
// Create Emitter and Tracker
AsyncEmitter e1 = new AsyncEmitter ("com.collector.acme");
Tracker t1 = new Tracker (e1, "Namespace", "AppId");

// Start the Tracker
t1.StartEventTracking ();
{% endhighlight %}

You are now ready to Track events! Now let's send an event:

{% highlight csharp %}
t1.Track (new Structured ()
    .SetCategory ("GameScene")
    .SetAction ("Launch")
    .Build ());
{% endhighlight %}

And that's all there is to it! Please check out the [Unity Tracker documentation] [unity-manual] on our wiki for the Tracker's full API.

<h2 id="features">3. Core features</h2>

The core features of the Tracker include:

* Fully asynchronous event storage and sending
* Outbound events are cached in a [SQLite] [sqlite] database to prevent event loss
* User sessionization with a persistent user ID for the life of the application
* Type and value checking for all custom contexts and events to ensure your events are sent properly

An overview of how the Tracker sends events:

<img src="/assets/img/blog/2015/10/Unity-Tracker-Concurrency.jpg" />

The Tracker is setup to ensure that your application will never be blocked while also being completely thread-safe in its operation. It will use as many rhreads as it needs relative to the amount of events you are tracking.

If you are experiencing any performance issues you can either:

* Reduce the size of the C# ThreadPool manually; thus restricting the amount of Threads available to the Tracker
* Reduce the `sendLimit` variable in the Emitter - this variable controls how many events are sent at any one time, which is very important for `GET` requests, where every event is sent individually

<h2 id="snowplow-pong">4. Snowplow Pong</h2>

Along with the Tracker release, we are also including a Snowplow interpretation of a classic game, [Pong][pong]. The game allows you to configure a Snowplow collector endpoint and will then emit a continous stream of events to this collector as you play through the game.

To play the game you will need to:

* Clone the repo: `git clone https://github.com/snowplow/snowplow-unity-tracker.git`
* Open up `snowplow-unity-tracker/DemoGame/DemoGame.sln` in Unity.
* You can then play directly from the Unity IDE or build it yourself for a particular platform.

It is currently only configured to run as a desktop application so you will not be able to play it on your iOS or Android device as of yet. We will hopefully port it to a mobile setup in the future!

Here are some screens from the game:

<img src="/assets/img/blog/2015/10/snowplow_pong_home.png" style="border:1px solid grey; margin-bottom:5px;"/>
<img src="/assets/img/blog/2015/10/snowplow_pong_settings.png" style="border:1px solid grey;"/>

As you can see in the second screen we have configured the Tracker to point at a local collector but you can put in any valid collector endpoint here.

<h2 id="roadmap">5. Roadmap</h2>

We have big plans for the Snowplow Unity Tracker, including but not limited to:

* Adding support for the WebPlayer platform ([#2] [issue-2])
* Automating the creation of Mobile, Desktop and GeoLocation contexts ([#4] [issue-4])
* Automating the detection of background/foreground application state for sessionization ([#5] [issue-5])

<h2 id="docs">6. Documentation</h2>

You can find the [Unity Tracker usage manual] [unity-manual] on our wiki.

<h2 id="help">7. Getting help</h2>

We hope that you find the Snowplow Unity Tracker useful - of course, this is only its first release, so don't be afraid to [get in touch][talk-to-us] or raise an issue [Unity Tracker issues] [unity-issues] on GitHub!

[unity-repo]: https://github.com/snowplow/snowplow-unity-tracker
[unity-manual]: https://github.com/snowplow/snowplow/wiki/Unity-Tracker
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[unity-issues]: https://github.com/snowplow/snowplow-unity-tracker/issues
[package-dl]: http://dl.bintray.com/snowplow/snowplow-generic/snowplow_unity_tracker_0.1.0.zip
[sqlite]: https://www.sqlite.org/
[pong]: https://en.wikipedia.org/wiki/Pong

[issue-2]: https://github.com/snowplow/snowplow-unity-tracker/issues/2
[issue-4]: https://github.com/snowplow/snowplow-unity-tracker/issues/4
[issue-5]: https://github.com/snowplow/snowplow-unity-tracker/issues/5
