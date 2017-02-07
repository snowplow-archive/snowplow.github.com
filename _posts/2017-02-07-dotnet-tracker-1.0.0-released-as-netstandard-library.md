---
layout: post
title: .NET Tracker 1.0.0 supporting mobile devices through Xamarin released
title-short: .NET Tracker 1.0.0 Released
tags: [snowplow, .NET, NETStandard, Xamarin, Mobile]
author: Ed
category: Releases
---

We're pleased to announce the 1.0.0 release of Snowplow's .NET tracker. This is a major reboot of the existing .NET tracker making it a netstandard project - it's now supported on mobile devices through Xamarin,
and all platforms that support .NET Core (Windows, Linux and macOS!).

Read on more:

1. [NETStandard in a nutshell](/blog/2017/02/07/dotnet-tracker-1.0.0-released-as-netstandard-library#netstandard)
2. [The .NET Tracker 1.0.0 Deployment](/blog/2017/02/07/dotnet-tracker-1.0.0-released-as-netstandard-library#deployment)
3. [Using the .NET Tracker 1.0.0](/blog/2017/02/07/dotnet-tracker-1.0.0-released-as-netstandard-library#use)
4. [Future of the .NET Tracker](/blog/2017/02/07/dotnet-tracker-1.0.0-released-as-netstandard-library#future)

<!--more-->

<h2 id="netstandard">1. NETStandard in a nutshell</h2>

The .NET ecosystem is undergoing a massive transition - we think for the better. When we developed the previous version of the Snowplow .NET tracker it was enough to target desktops, and the project was anchored at
a .NET framework version rather than a set of platforms. It didn't take long for new platforms to appear (and disapear in the case of Silverlight). From this came "portable class libraries" or PCLs. A PCL is one project anchored to many
platforms. PCL's are defined as the subset of all the features across every platform. So if platform 1 supports features A,B and C, and platform 2 supports B,C and D a PCL targeting both can only use the features B and C.
I'm sure at the time it was hoped that this would drive development across each platform into a natural convergence. This hasn't really happened, and the tail is wagging the dog a little.

This is why we've decided to adopt the new Netstandard approach for our core library. Now each platform must be able to execute the NETStandard library as it's base class library (BCL). As an exciting side note - the .NET standard is tracking the features
in .NET Core, it's now essentially a .NET standard reference implementation that works on many environments.  

If you're new to .NET or returning after a break - there's a great [video series here][netstandard-vid] by Immo Landwerth (of Microsoft) with much more information on the ecosystem changes and the reasons behind them.

<h2 id="deployment">2. The .NET Tracker 1.0.0 Deployment</h2>

Of course it's not quite as simple as converting everything to NETStandard. We've split the Tracker into two NuGetPackages - `Snowplow.Tracker`, a fully functional NETStandard library for tracking Snowplow events and `Snowplow.Tracker.PlatformExtensions`
a PCL wrapper extending the functionality of `Snowplow.Tracker` in platform specific ways (for example - providing mobile contexts on Xamarin).

The `Snowplow.Tracker` package is the core library and contains everything you'll need to track events on any platform. Snowplow trackers however usually provide a rich set of events for you
outside of the box. This is particularly interesting for mobile devices - just by including the Snowplow Tracking library you normally get access to information on the users' device type, operating system and the times a user is using your application.

This is why we've added a PCL wrapper around our .NETStandard core, enhancing the base functionality in platform specific ways. This is supported by Xamarin, so if you're writing applications for Xamarin you'll only need to write code in one place to gather information
about both your iOS and Android users. 

If you're writing a desktop or server-side application - you can still use the PCL. One of the platforms our PCL targets is .NET 4.6.1. If you're using a platform that isn't supported by our PCL extension - you can still use the .NETStandard core, and set up your own events -
the platform extensions are just a curated collection of platform specific features we can provide to you for free.  

So - the headline is if you're writing for a desktop or Xamarin app, you should use our `Snowplow.Tracker.PlatformExtensions` package. If you can't use this because you're targeting an unusual platform, you can still use the `Snowplow.Tracker` package (which is .NETStandard 1.4 and supported by [these platforms][netstandard-version-matrix].

<h2 id="use">3. Using the .NET Tracker</h2>

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

### With .NET Core using Snowplow.Tracker (the NETStandard 1.4 core)


If you're writing an application for a platform our platform extensions doesn't support, or for some reason don't need the extra features our PlatformExtensions library provides the `Snowplow.Tracker` package is
a complete tracking solution in itself. 

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

<h2 id="future">4. Future of the .NET Tracker</h2>

We hope that Microsoft's aquistion of Xamarin will result in the NETStandard feature set expanding to incorporate mobile centric APIs - we'll always move the things we can into the core library. Although the ecosystem is
in flux today we're expecting things to level out in the future!


[factotum-issues]: https://github.com/snowplow/factotum/issues/new
[factotum-repo]: https://github.com/snowplow/factotum
[mobile-demo]: https://github.com/snowplow/snowplow-dotnet-tracker/tree/release/1.0.0/Snowplow.Demo.App/Snowplow.Demo.App
[demo-core]: https://github.com/snowplow/snowplow-dotnet-tracker/blob/release/1.0.0/Snowplow.Demo.Console/Program.cs
[netstandard-vid]: https://www.youtube.com/watch?v=YI4MurjfMn8&index=1&list=PLRAdsfhKI4OWx321A_pr-7HhRNk7wOLLY
[netstandard-version-matrix]: https://github.com/dotnet/standard/blob/master/docs/versions.md