---
layout: post
title: Snowplow Tracker for Lua event analytics released
title-short: Snowplow Tracker for Lua
tags: [snowplow, lua, event, tracker]
author: Alex
category: Releases
---

We are very pleased to announce the release of our [SnowplowTracker for Lua event analytics] [snowplow-lua-tracker]. This is our fourth tracker to be released, following on from our [JavaScript] [snowplow-js-tracker], [Pixel] [snowplow-pixel-tracker] and [Arduino] [snowplow-arduino-tracker] Trackers.

As a lightweight, easily-embeddable scripting language, [Lua] [lua] is available in a huge number of different computing environments and platforms, from [World of Warcraft] [wow] through [OpenResty] [openresty] to [Adobe Lightroom] [lightroom]. And now, the Snowplow Lua Tracker lets you collect event data from these Lua-based applications, Lua web servers/frameworks, or from the Lua scripting layer within your games or apps - here's a taster:

{% highlight lua %}
local t = snowplow.newTrackerForCf( "d3rkrsqld9gmqf" )
t:setAppId( "my-warcraft-addon" )
local s, msg = t:trackStructEvent( "shop", "add-to-basket", nil, "armour-vi", 2 )
{% endhighlight %}

We are hugely excited about our new event tracker for Lua. The first analytics tracker ever released for the Lua language, SnowplowTracker continues Snowplow's push into the tracking and analysis of non-Web events. Moreover, as part of our commitment to [High-Fidelity Analytics] [high-fidelity], this tracker:

1. Is our first to include a full suite of unit and integration tests, built using the excellent [Busted] [busted]
2. Uses contracts-style argument validation throughout, to prevent incorrectly-structured events from being sent to Snowplow

After the jump we will cover:

1. [Supported events](/blog/2013/07/03/snowplow-tracker-for-lua-event-analytics-released#supported-events)
2. [Usage example](/blog/2013/07/03/snowplow-tracker-for-lua-event-analytics-released#usage-example)
3. [Finding out more](/blog/2013/07/03/snowplow-tracker-for-lua-event-analytics-released#read-more)

<!--more-->

<h2><a name="supported-events">1. Supported events</a></h2>

The Lua Tracker supports three types of event:

1. `trackStructEvent()` - for tracking Google Analytics-style custom structured events with five fields (category, action, label, property, value)
2. `trackUnstructEvent()` - for tracking Mixpanel-style custom unstructured events, consisting of an event name plus event properties in a Lua table
3. `trackScreenView()` - for tracking views of individual screens within a game, app or similar

Please note that currently only `trackStructEvent()` is supported within the Snowplow ETL and Redshift table definition; adding support for unstructured events and screen views is on our roadmap.

<h2><a name="usage example">2. Usage example</a></h2>

Using the SnowplowTracker from Lua is really simple.

First require the library and instantiate a new tracker:

{% highlight lua %}
local snowplow = require( "snowplow" )
local tracker = snowplow.newTrackerForUri( "snplow.mydomain.com" )
{% endhighlight %}

You can adjust the default configuration if you like:

{% highlight lua %}
tracker:encodeBase64( false ) -- Default is true
tracker:platform( "tv" ) -- Default is "pc"
{% endhighlight %}

Add any additional information about the app, user or device that you know:

{% highlight lua %}
tracker:setUserId( "bob@example.com" )
tracker:setAppId( "my-lightroom-plugin" )
tracker:setScreenResolution( 1068, 720 )
{% endhighlight %}

Now you are ready to track your events:

{% highlight lua %}
tracker:trackUnstructEvent( "save-file", { save_id = "4321",
                                           compression = 98,
                                           description = "Backup without layers",
                                           read_only = false
                                         }
                          )
{% endhighlight %}

And that's it!

<h2><a name="usage example">3. Finding out more</a></h2>

To read through the complete API for this Lua event tracker, please see the [Lua Tracker page] [lua-tracker-wiki] on the Snowplow wiki.

For setting up the tracker in various Lua environments (including [LuaRocks] [luarocks]), please see the [Lua Tracker Setup page] [lua-tracker-setup-wiki] on the Snowplow wiki.

To check out the code itself, please see our [snowplow-lua-tracker] [snowplow-lua-tracker] repository in GitHub.

[snowplow-lua-tracker]: https://github.com/snowplow/snowplow-lua-tracker
[snowplow-js-tracker]: https://github.com/snowplow/snowplow/tree/master/1-trackers/javascript-tracker
[snowplow-pixel-tracker]: https://github.com/snowplow/snowplow/tree/master/1-trackers/no-js-tracker
[snowplow-arduino-tracker]: https://github.com/snowplow/snowplow-arduino-tracker

[lua]: http://www.lua.org/

[wow]: http://www.wowwiki.com/Lua
[openresty]: http://openresty.org/
[lightroom]: http://www.adobe.com/devnet/photoshoplightroom.html

[high-fidelity]: http://snowplowanalytics.com/blog/2013/04/10/snowplow-event-validation/

[busted]: http://olivinelabs.com/busted/
[luarocks]: http://luarocks.org/repositories/rocks/

[lua-tracker-wiki]: https://github.com/snowplow/snowplow/wiki/Lua-Tracker
[lua-tracker-setup-wiki]: https://github.com/snowplow/snowplow/wiki/Lua-tracker-setup
