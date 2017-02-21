---
layout: post
title: Snowplow .NET Tracker 1.0.0 supporting mobile devices through Xamarin released
title-short: Snowplow .NET Tracker 1.0.0 Released
tags: [snowplow, .NET, NETStandard, Xamarin, Mobile]
author: Ed
category: Releases
---

We're pleased to announce the 1.0.0 release of Snowplow's .NET Tracker. This is a major reboot of the existing .NET Tracker, convering it into a .NET Standard project; this conversion brings with it support for the tracker on mobile devices through Xamarin, plus all platforms that support .NET Core (Windows, Linux and macOS).

Here is our mobile demonstration app for the tracker running on Xamarin:

<img src="/assets/img/blog/2017/02/dotnet-tracker-demo-home-60pc.png"/>

Read on for more:

1. [A brief history of .NET Standard](/blog/2017/02/15/snowplow-dotnet-tracker-1.0.0-released/#history)
2. [Why we are moving the Tracker to .NET Standard](/blog/2017/02/15/snowplow-dotnet-tracker-1.0.0-released/#why-we-are-moving)
3. [Integrating the .NET Tracker](/blog/2017/02/15/snowplow-dotnet-tracker-1.0.0-released/#integration)
4. [Using the .NET Tracker 1.0.0](/blog/2017/02/15/snowplow-dotnet-tracker-1.0.0-released/#use)
5. [The future of the .NET Tracker](/blog/2017/02/15/snowplow-dotnet-tracker-1.0.0-released/#future)

<!--more-->

<h2 id="history">1. A brief history of .NET Standard</h2>

The .NET ecosystem is undergoing a massive transition - we think for the better. When we developed the previous version of the Snowplow .NET Tracker, it was enough to target desktops and servers, and the project was anchored to a .NET framework version, rather than a set of platforms.

However, it didn't take long for new platforms to appear (and to disappear, in some cases). From these changes came "portable class libraries" or PCLs. A PCL is one .NET project anchored to many platforms; PCLs are defined as the subset of all the given features across every platform. In other words: if SomePlatform supports features (A, B, C), and AnotherPlatform supports features (B, C, D), then a PCL targeting both SomePlatform and AnotherPlatform can only use the features (B, C).

We think that the likely intention of PCL was to drive development across all of the .NET platforms into a natural convergence. Unfortunately, this didn't really happen, and so .NET Standard was born as a new harmonization initiative.

.NET Standard is a base class library (BCL) that platforms must be able to execute. This in turn means that libraries can now use a single, unified base class library, and it's up to each platform to provide this. With 
.NET Standard the functionality that library developers can offer does not diminish as the number of platforms you want to support increases.  

Platforms that support newer versions of .NET Standard can run libraries that target older versions of the .NET Standard library. Libraries can then re-target to a newer version of the .NET Standard to expand the API available to them.

All of this means that developing libraries in .NET just became a lot more straightforward - and including them in your application should become easier too!

If you're new to .NET or returning after a break - there's a great [video series here][netstandard-vid] by Immo Landwerth of Microsoft, with more information on the ecosystem changes and the reasons behind them.

<h2 id="why-we-are-moving">2. Why we are moving the Tracker to .NET Standard</h2>

We've made the move to .NET Standard for the Snowplow .NET Tracker for a number of reasons.

The first is that we can support tracking events on many more platforms and device types. This includes Xamarin (iOS/Android mobile), Linux and macOS (through .NET Core). It would have been possible for us to achieve this with a PCL but the development overhead was high. With our new approach, as new platforms emerge the tracker will automatically support them through .NET Standard support.

We also think that by using .NET Standard it should be easier for developers to use the tracker across very different environments, carrying a familiar codebase across each.

<h2 id="integration">3. Integrating the .NET Tracker</h2>

Of course it's not quite as simple as converting everything to .NET Standard. We've now split the Tracker into two NuGet packages:

1. `Snowplow.Tracker`, a fully functional .NET Standard library for tracking Snowplow events
2. `Snowplow.Tracker.PlatformExtensions`, a PCL wrapper extending the functionality of `Snowplow.Tracker` in platform specific ways, e.g. providing mobile contexts on Xamarin

Which of these libraries you'll use will depend on your use case:

#### Integrating a Xamarin app

Use our `Snowplow.Tracker.PlatformExtensions` NuGet package. This provides extra mobile-friendly features out of the box including access to information on the user's device type, operating system and app usage sessions.

#### Integrating a desktop or server-side application

You can use either the `Snowplow.Tracker.PlatformExtensions` NuGet package or the base library `Snowplow.Tracker` (also available via NuGet).

Our platform extensions library provides a .NET 4.6.1 implementation - but you can also use the base library (.NET Standard 1.4 libraries can be used directly by .NET 4.6.1+ platform code). 

The advantage in using the platform extensions is some additional features - for example an "offline mode" where the tracker will not try to send events when the host is offline. The advantage to using the base library
is that if you're multiplatform already (or planning to be) using .NET Standard libraries will simplify your deployment and development process.

#### Integrating a platform that's not supported by our PCL (`Snowplow.Tracker.PlatformExtensions`)

Not all platforms are supported as a PCL within `Snowplow.Tracker.PlatformExtensions`. A good example of this is .NET Core. 

In this case, you can still use the `Snowplow.Tracker` package. The `Snowplow.Tracker` package is the base library and contains everything you'll need to track events on any platform. It targets .NET Standard 1.4 and therefore supported by [these platforms][netstandard-version-matrix].

<h2 id="use">4. Using the .NET Tracker</h2>

There's a quickstart guide available [here][quickstart-guide]. You might also be interested to see our demo applications for [.NET Core][demo-core] and for [Xamarin][mobile-demo]. Details on specific
tracker functions are available in [the wiki documentation][wiki-main]. [A set-up guide][wiki-setup] is also available in the wiki.

If you've found a bug or technical issue - please [raise an issue][issue-tracker]!

<h2 id="future">5. The future of the .NET Tracker</h2>

We hope that Microsoft's aquistion of Xamarin will result in the .NET Standard feature =set expanding to incorporate mobile-centric APIs - which we'll always strive to move into the core library. Although the ecosystem is
in flux today we're expecting great things in the future!

[mobile-demo]: https://github.com/snowplow/snowplow-dotnet-tracker/tree/release/1.0.0/Snowplow.Demo.App/Snowplow.Demo.App
[demo-core]: https://github.com/snowplow/snowplow-dotnet-tracker/blob/release/1.0.0/Snowplow.Demo.Console/Program.cs

[netstandard-vid]: https://www.youtube.com/watch?v=YI4MurjfMn8&index=1&list=PLRAdsfhKI4OWx321A_pr-7HhRNk7wOLLY
[netstandard-version-matrix]: https://github.com/dotnet/standard/blob/master/docs/versions.md

[quickstart-guide]: https://github.com/snowplow/snowplow/wiki/.NET-Tracker-Quickstart-Guide
[wiki-main]: https://github.com/snowplow/snowplow/wiki/.net-tracker
[wiki-setup]: https://github.com/snowplow/snowplow/wiki/.NET-tracker-setup

[issue-tracker]: https://github.com/snowplow/snowplow-dotnet-tracker/issues/new
