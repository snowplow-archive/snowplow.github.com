---
layout: post
title: .NET Tracker 1.0.0 supporting mobile devices through Xamarin released
title-short: .NET Tracker 1.0.0 Released
tags: [snowplow, .NET, NETStandard, Xamarin, Mobile]
author: Ed
category: Releases
---

We're pleased to announce the 1.0.0 release of Snowplow's .NET Tracker. This is a major reboot of the existing .NET Tracker, convering it into a NETStandard project; this conversion brings with it support for the tracker on mobile devices through Xamarin, plus all platforms that support .NET Core (Windows, Linux and macOS).

ADD A PICTURE HERE OF THE MOBILE DEMO APP RUNNING XAMARIN

Read on for more:

1. [A brief history of .NET Standard](/blog/2017/02/07/dotnet-tracker-1.0.0-released-as-netstandard-library#netstandard-history)
2. [Why we are moving the tracker to .NET Standard](/blog/2017/02/07/dotnet-tracker-1.0.0-released-as-netstandard-library#why-we-are-moving)
3. [Integrating the .NET Tracker](/blog/2017/02/07/dotnet-tracker-1.0.0-released-as-netstandard-library#integration)
3. [Using the .NET Tracker 1.0.0](/blog/2017/02/07/dotnet-tracker-1.0.0-released-as-netstandard-library#use)
4. [Future of the .NET Tracker](/blog/2017/02/07/dotnet-tracker-1.0.0-released-as-netstandard-library#future)

<!--more-->

<h2 id="netstandard-history">1. A brief history of .NET Standard</h2>

The .NET ecosystem is undergoing a massive transition - we think for the better. When we developed the previous version of the Snowplow .NET Tracker it was enough to target desktops and servers, and the project was anchored to a .NET framework version, rather than a set of platforms.

However, it didn't take long for new platforms to appear (and to disappear, in the case of Silverlight). From these changes came "portable class libraries" or PCLs. A PCL is one project anchored to many platforms; PCLs are defined as the subset of all the given features across every platform. In other words: if SomePlatform supports features (A, B, C), and AnotherPlatform supports features (B, C, D), then a PCL targeting both SomePlatform and AnotherPlatform can only use the features (B, C).

We think that the likely intention of PCL was to drive development across all of the .NET platforms into a natural convergence. Unfortunately, this didn't really happen, and so .NET Standard was born as a new harmonization initiative.

[[[ PARAGRAPH ON NETStandard - how it fixes things, what is is; "Now each platform must be able to execute the NETStandard library as it's base class library (BCL)." ]]]

If you're new to .NET or returning after a break - there's a great [video series here][netstandard-vid] by Immo Landwerth of Microsoft, with much more information on the ecosystem changes and the reasons behind them.

<h2 id="why-we-are-moving">2. Why we are moving the tracker to .NET Standard</h2>

[[[ WHY HAVE WE DECIDED TO MOVE ???? XAMARIN, future platforms, etc etc ]]]

This is why we've decided to adopt the new NetStandard approach for our Snowplow .NET Tracker. As an exciting side note - the .NET standard is tracking the features in .NET Core, it's now essentially a .NET standard reference implementation that works on many environments. [[[ I don't understand this sentence ]]] 

<h2 id="integration">3. Integrating the .NET Tracker</h2>

Of course it's not quite as simple as converting everything to .NET Standard. We've split the Tracker into two NuGetPackages:

1. `Snowplow.Tracker`, a fully functional .NET Standard library for tracking Snowplow events
2. `Snowplow.Tracker.PlatformExtensions`, a PCL wrapper extending the functionality of `Snowplow.Tracker` in platform specific ways, e.g. providing mobile contexts on Xamarin

Which of these libraries you'll deploy will depend on your use case:

#### Integrating a Xamarin app

Use our `Snowplow.Tracker.PlatformExtensions` package.

[[[ TIDY UP THIS: This is particularly interesting for mobile devices - just by including the Snowplow Tracking library you normally get access to information on the users' device type, operating system and the times a user is using your application.

This is why we've added a PCL wrapper around our .NETStandard base tracker, enhancing the base functionality in platform specific ways. This is supported by Xamarin, so if you're writing applications for Xamarin you'll only need to write code in one place to gather information
about both your iOS and Android users. ]]] 

#### Integrating a desktop or server-side application

If you're writing a desktop or server-side application - you can still use the PCL. One of the platforms our PCL targets is .NET 4.6.1. If you're using a platform that isn't supported by our PCL extension - you can still use the .NETStandard base tracker, and set up your own events -
the platform extensions are just a curated collection of platform specific features we can provide to you for free.  

#### Integrating an unusual platform

Not all platforms are supported as a PCL within `Snowplow.Tracker.PlatformExtensions`.

In this case, you can still use the `Snowplow.Tracker` package. The `Snowplow.Tracker` package is the base library and contains everything you'll need to track events on any platform. It is .NETStandard 1.4 and supported by [these platforms][netstandard-version-matrix].

FINISH THIS SUB-SECTION

<h2 id="use">4. Using the .NET Tracker</h2>

### With Xamarin

#### Install the NuGet package

The package is available on NuGet, you can use the Visual Studio package manager as follows:

`Package-Install Snowplow.Tracker.PlatformExtensions`

Alternatively using the Visual Studio GUI to install the package `Snowplow.Tracker.PlatformExtensions`. You don't need to include the `Snowplow.Tracker` package if you're using the `Snowplow.Tracker.PlatformExtensions` package,
it's implicitly included for you. 

#### Instantiating the tracker

If you're using a Xamarin PCL project - you should include the tracker into the (shared) PCL project. The tracker will then be available for your iOS and Android projects too.
You'll need to instantiate the tracker before you use it, the tracker follows a singleton pattern. When you start your application, you should start the tracker - and when your application is closing
it's important to close the tracker too.

{% highlight csharp %}         
// This is a provided class that sends logs to STDOUT - but you can implement the interface and route the tracker logs anywhere
var logger = new ConsoleLogger();

// This is where your Snowplow collector lives
var dest = new SnowplowHttpCollectorEndpoint(emitterUri, method: method, port: port, protocol: protocol, l: logger);

// Note: Maintain reference to Storage as this will need to be disposed of manually
_storage = new LiteDBStorage(SnowplowTrackerPlatformExtension.Current.GetLocalFilePath("events.db"));
var queue = new PersistentBlockingQueue(_storage, new PayloadToJsonString());

// Note: When using GET requests the sendLimit equals the number of concurrent requests - to many of these will break your application!
var sendLimit = method == HttpMethod.GET ? 10 : 100;

// Note: To make the tracker more battery friendly and less likely to drain batteries there are two settings to take note of here:
//       1. The stopPollIntervalMs: Controls how often we look to the database for more events
//       2. The deviceOnlineMethod: Is run before going to the database or attempting to send events, this will prevent any I/O from
//          occurring unless you have an active network connection
var emitter = new AsyncEmitter(dest, queue, sendLimit: sendLimit, stopPollIntervalMs: 1000, sendSuccessMethod: EventSuccessCallback, 
    deviceOnlineMethod: SnowplowTrackerPlatformExtension.Current.IsDeviceOnline, l: logger);

var userId = PropertyManager.GetStringValue(KEY_USER_ID, SnowplowCore.Utils.GetGUID());
PropertyManager.SaveKeyValue(KEY_USER_ID, userId);

var subject = new Subject()
    .SetPlatform(Platform.Mob)
    .SetUserId(userId)
    .SetLang("en");

if (useClientSession)
{
    _clientSession = new ClientSession(SnowplowTrackerPlatformExtension.Current.GetLocalFilePath("client_session.dict"), l: logger);
}

// Note: You can either attach contexts to each event individually or for the more common contexts such as Desktop, Mobile and GeoLocation
//       you can pass a delegate method which will then be called for each event automatically.

MobileContextDelegate mobileContextDelegate = null;
if (useMobileContext)
{
    mobileContextDelegate = SnowplowTrackerPlatformExtension.Current.GetMobileContext;
}

GeoLocationContextDelegate geoLocationContextDelegate = null;
if (useMobileContext)
{
    geoLocationContextDelegate = SnowplowTrackerPlatformExtension.Current.GetGeoLocationContext;
}

// Attach the created objects and begin all required background threads!
Instance.Start(emitter: emitter, subject: subject, clientSession: _clientSession, trackerNamespace: _trackerNamespace, 
    appId: _appId, encodeBase64: false, synchronous: false, mobileContextDelegate: mobileContextDelegate, 
    geoLocationContextDelegate: geoLocationContextDelegate, l: logger);
{% endhighlight %}    


To send events:

{% highlight csharp %}     
// This example is to send a Screen View event
Instance.Track(new ScreenView()
    .SetId("example-screen-id")
    .SetName("Example Screen")
    .Build());
{% endhighlight %}  

To stop the tracker:


{% highlight csharp %}     
// Note: This will also stop the ClientSession and Emitter objects for you!
Instance.Stop();

// Note: Dispose of Storage to remove lock on database file!
if (_storage != null)
{
    _storage.Dispose();
    _storage = null;
}

if (_clientSession != null)
{
    _clientSession = null;
}

SnowplowTrackerPlatformExtension.Current.StopLocationUpdates();
{% endhighlight %}  

We've also created a detailed sample mobile application for you [mobile-app-demo][mobile-demo].

### With .NET Framework 4.6.1+ and Snowplow.Tracker.PlatformExtensions

The platform extensions library, in addition to Xamarin provides a .NET 4.6.1 implementation that allows use of MSMQ as a storage solution (the default is still LiteDB - MSMQ is optional). It also contains information on if the device is online.

As before, to start the tracker:

{% highlight csharp %}     
            // This is a provided class that sends logs to STDOUT - but you can implement the interface and route the tracker logs anywhere
            var logger = new ConsoleLogger();

            // This is where your Snowplow collector lives
            var dest = new SnowplowHttpCollectorEndpoint(emitterUri, method: method, port: port, protocol: protocol, l: logger);

            // Note: Maintain reference to Storage as this will need to be disposed of manually
            _storage = new LiteDBStorage(SnowplowTrackerPlatformExtension.Current.GetLocalFilePath("events.db"));
            var queue = new PersistentBlockingQueue(_storage, new PayloadToJsonString());

            // Note: When using GET requests the sendLimit equals the number of concurrent requests - to many of these will break your application!
            var sendLimit = method == HttpMethod.GET ? 10 : 100;

            // Note: To make the tracker more battery friendly and less likely to drain batteries there are two settings to take note of here:
            //       1. The stopPollIntervalMs: Controls how often we look to the database for more events
            //       2. The deviceOnlineMethod: Is run before going to the database or attempting to send events, this will prevent any I/O from
            //          occurring unless you have an active network connection
            var emitter = new AsyncEmitter(dest, queue, sendLimit: sendLimit, stopPollIntervalMs: 1000, sendSuccessMethod: EventSuccessCallback, 
                deviceOnlineMethod: SnowplowTrackerPlatformExtension.Current.IsDeviceOnline, l: logger);

            // Attach the created objects and begin all required background threads!
            Instance.Start(emitter: emitter, subject: subject, clientSession: _clientSession, trackerNamespace: _trackerNamespace, 
                appId: _appId, encodeBase64: false, synchronous: false, mobileContextDelegate: mobileContextDelegate, 
                geoLocationContextDelegate: geoLocationContextDelegate, l: logger);
{% endhighlight %}  

To send events:

{% highlight csharp %}     
            // This example is to send a Page View event
            Instance.Track(new PageView()
                .SetPageUrl("http://example.page.com")
                .SetReferrer("http://example.referrer.com")
                .SetPageTitle("Example Page")
                .Build());
{% endhighlight %}  

And finally, it's important to stop the tracker when your application is closing:

{% highlight csharp %}     
            Instance.Stop();

            // Note: Dispose of Storage to remove lock on database file!
            if (_storage != null)
            {
                _storage.Dispose();
                _storage = null;
            }
{% endhighlight %}  

#### Install the NuGet package

Using the Visual Studio package manager as follows:

`Package-Install Snowplow.Tracker`

#### Creating and using the tracker

The API when using the core library is slightly different to those using the PlatformExtensions.

To create an instance of the tracker:

{% highlight csharp %}     
           var logger = new ConsoleLogger();
           Tracker.Tracker.Instance.Start(collectorHostname, "snowplow-demo-app.db", l: logger);
{% endhighlight %}  

To send events:

{% highlight csharp %}     
                // This example sends a PageView event
                Tracker.Tracker.Instance.Track(new PageView().SetPageUrl("http://helloworld.com/sample/sample.php").Build());
{% endhighlight %}  

And finally, as with the platform extensions it's important to close the tracker as your application exits.

{% highlight csharp %}     
            // Flushing is optional - it'll try sending all the events that haven't been sent yet
            Tracker.Tracker.Instance.Flush();
            Tracker.Tracker.Instance.Stop();
{% endhighlight %}  

In addition to the Xamarin sample project, we have a comparable one for .NET core [here][demo-core]. 

<h2 id="future">5. Future of the .NET Tracker</h2>

We hope that Microsoft's aquistion of Xamarin will result in the NETStandard feature set expanding to incorporate mobile centric APIs - we'll always move the things we can into the core library. Although the ecosystem is
in flux today we're expecting things to level out in the future!


[factotum-issues]: https://github.com/snowplow/factotum/issues/new
[factotum-repo]: https://github.com/snowplow/factotum
[mobile-demo]: https://github.com/snowplow/snowplow-dotnet-tracker/tree/release/1.0.0/Snowplow.Demo.App/Snowplow.Demo.App
[demo-core]: https://github.com/snowplow/snowplow-dotnet-tracker/blob/release/1.0.0/Snowplow.Demo.Console/Program.cs
[netstandard-vid]: https://www.youtube.com/watch?v=YI4MurjfMn8&index=1&list=PLRAdsfhKI4OWx321A_pr-7HhRNk7wOLLY
[netstandard-version-matrix]: https://github.com/dotnet/standard/blob/master/docs/versions.md
