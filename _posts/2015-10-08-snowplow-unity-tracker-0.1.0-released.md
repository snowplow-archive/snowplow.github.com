---
layout: post
shortenedlink: Snowplow Unity Tracker 0.1.0 released
title: Snowplow Unity Tracker 0.1.0 released
tags: [snowplow, analytics, unity, tracker]
author: Josh
category: Releases
---

We are pleased to annouce the release of our new [Snowplow Unity Tracker] [unity-repo].  The Tracker is designed to work completely asynchronously to your Unity code to provide great performance even under heavy load.

Use this tracker to add analytics to your Unity apps, and games.

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

The release version of this Tracker as well as all of it's dependencies are included in a single UnityPackage available from our bintray: 

* [SnowplowTracker-0.1.0.unitypackage][package-dl]

Simply add this package to your project and it should drop put all of the required dll's into your Unity Project.

And that's it! You're now ready to start using the tracker.

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
AsyncEmitter e1 = new AsyncEmitter ("com.collector.acme")
Tracker t1 = new Tracker(e1, "Namespace", "AppId");

// Start the Tracker
t1.StartEventTracking();
{% endhighlight %}

You are now ready to Track events!  Now to send a an event...

{% highlight csharp %}
t1.Track (new Structured ()
    .SetCategory ("GameScene")
    .SetAction ("Launch")
    .Build ());
{% endhighlight %}

And that's all there is to it! Please check out the [Unity Tracker documentation] [unity-manual] on the wiki for the tracker's full API.

<h2 id="features">3. Core features</h2>

The core features of the Tracker include:

* Fully Asynchronous event storage and sending
* All events are kept in a SQLite Database to ensure nothing is lost
* User Sessionization with a persistent user id for the life of the application
* Type and value checking for all custom contexts and events to ensure your events are sent properly

An overview of how the Tracker sends events:

<img src="/assets/img/blog/2015/10/Unity-Tracker-Concurrency.jpg" />

The Tracker is setup to ensure that your application will never be blocked while also being completely Thread Safe in its operation.  It will use as many Threads as it needs relative to the amount of events you are tracking.

If you are experiencing any performance issues it is advisable to either:

* Reduce the size of the C# ThreadPool manually; thus restricting the amount of Threads available to the Tracker.
* Reduce the `sendLimit` variable in the Emitter.
  - This variable controls how many events are sent at any one time which becomes very important when it comes to GET requests; where every event is sent individually.

<h2 id="snowplow-pong">4. Snowplow Pong</h2>

Along with the Tracker release we are also including a Snowplow rendition of a classic game, [Pong][pong].  The game allows you to configure a collector endpoint and will then emit a continous stream of events to this endpoint as you play or navigate through the game.

To play the game you will need to:

* Clone the repo: `git clone https://github.com/snowplow/snowplow-unity-tracker.git`
* Open up `snowplow-unity-tracker/DemoGame/DemoGame.sln` in Unity.
* You can then play directly from the Unity IDE or build it yourself for a particular platform.

It is currently only configured to run as a desktop application so you will not be able to play it on your iOS or Android device as of yet.  We will hopefully get it ported to a mobile setup in the future!

Here are some screens from the game:

<img src="/assets/img/blog/2015/10/snowplow_pong_home.png" style="border:1px solid grey; margin-bottom:5px;"/>
<img src="/assets/img/blog/2015/10/snowplow_pong_settings.png" style="border:1px solid grey;"/>

As you can see in the second screen we have configured the Tracker to point at a local collector but you can put in any valid collector endpoint here!

<h2 id="roadmap">5. Roadmap</h2>

We have big plans for the Snowplow Unity Tracker, including but not limited to:

* Adding support for the WebPlayer platform
* Automating the creation of Mobile, Desktop and GeoLocation contexts
* Automating the detection of background/foreground application state for Sessionization

<h2 id="docs">6. Documentation</h2>

You can find the [Unity Tracker usage manual] [unity-manual] on our wiki.

<h2 id="help">7. Getting help</h2>

We hope that you find the Snowplow Unity Tracker helpful - it is still very young, so don't be afraid to [get in touch][talk-to-us] or raise an issue [Unity Tracker issues] [unity-issues] on GitHub!

[unity-repo]: https://github.com/snowplow/snowplow-unity-tracker
[unity-manual]: https://github.com/snowplow/snowplow/wiki/Unity-Tracker
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[unity-issues]: https://github.com/snowplow/snowplow-unity-tracker/issues
[package-dl]: https://bintray.com/snowplow/snowplow-generic
[pong]: https://en.wikipedia.org/wiki/Pong
