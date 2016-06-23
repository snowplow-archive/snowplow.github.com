---
layout: post
title: Snowplow C++ Tracker 0.1.0 released
title-short: Snowplow C++ Tracker 0.1.0
tags: [snowplow, analytics, cpp, c++, tracker]
author: Ed
category: Releases
---

We are pleased to announce the release of the [Snowplow C++ Tracker] [cpp-repo]. The Tracker is designed to work asynchronously and dependency-free within your C++ code to provide great performance in your applications, games and servers, even under heavy load, while also storing all of your events persistently allowing recovery from temporary network outages.

In the rest of this post we will cover:

1. [How to install the tracker](/blog/2016/06/23/snowplow-cpp-tracker-0.1.0-released/#how-to-install)
2. [How to use the tracker](/blog/2016/06/23/snowplow-cpp-tracker-0.1.0-released/#how-to-use)
3. [Core features](/blog/2016/06/23/snowplow-cpp-tracker-0.1.0-released/#features)
4. [Roadmap](/blog/2016/06/23/snowplow-cpp-tracker-0.1.0-released/#roadmap)
5. [Documentation](/blog/2016/06/23/snowplow-cpp-tracker-0.1.0-released/#docs)
6. [Getting help](/blog/2016/06/23/snowplow-cpp-tracker-0.1.0-released/#help)

<!--more-->

<h2 id="how-to-install">1. How to install the tracker</h2>

This tracker is source-only and requires no external dependencies. You can get the source code bundle here:

{% highlight bash %}
$ wget https://github.com/snowplow/snowplow-cpp-tracker/archive/master.zip
{% endhighlight %}

Please check out the [C++ Tracker setup guide] [cpp-setup] on our wiki for more information on setup.

That's it! You're now ready to start using the Tracker.

<h2 id="how-to-use">2. How to use the tracker</h2>

To setup the C++ Tracker you first need include the source files in your project:

* If you're using Visual Studio 2015, you'll need to add everything in `include/` and `src/` into your project
* If you're using macOS or `gcc`, you'll need to:
  - Add the `include/` and `src/` directories into your build
  - Compile/link `include/sqlite3.c` and `include/sqlite3.h` (C bindings) separately

You can then instantiate and start a new tracker like so:

{% highlight cpp %}
#include "tracker.hpp"

Emitter emitter("com.acme.collector", Emitter::Method::POST, Emitter::Protocol::HTTP, 500, 52000, 52000, "events.db");
Tracker *t = Tracker::init(emitter, NULL, NULL, NULL, NULL, NULL, NULL);
{% endhighlight %}

You are now ready to track events, so let's send a screen view event:

{% highlight cpp %}
string name = "Screen ID - 5asd56";

Tracker::ScreenViewEvent sve;
sve.name = &name;

Tracker::instance()->track_screen_view(sve);
{% endhighlight %}

And that's all there is to it! Please check out the [C++ Tracker technical documentation] [cpp-manual] on our wiki for the tracker's full API.

<h2 id="features">3. Core features</h2>

The core features of the Snowplow C++ Tracker include:

* Asynchronous event sending
* Outbound events are cached in a [SQLite] [sqlite] database to prevent event loss
* Value checking for all events to ensure invalid events are caught early

The general flow of the Tracker as an event goes through:

* A `Tracker::instance()->track_*` method is invoked
* The event is stored in the local database
* A long running worker thread processes these events (started on `Tracker::init()`)
* This process will then pull a range of events from the database and begin sending them to your configured collector URI
* More events arriving during sending will just be written to the database, and will then be picked up by the background sending process
* Each request is sent using a `std::future`

This model is very closely related to the one used in the Golang, Android, Objective-C and Unity Trackers, which are all backed by Sqlite databases.

The Tracker also contains full support for secure event sending by both `GET` and `POST` request types, and the ability to combine events, for `POST`, up to a configurable byte limit. This yields much better performance versus our old approach of buffer limits.

<h2 id="roadmap">4. Roadmap</h2>

Currently the Snowplow C++ Tracker only supports macOS and Windows, but we're looking to support Linux in the future!

<h2 id="docs">5. Documentation</h2>

* [C++ Tracker setup guide] [cpp-setup] for setting up the tracker
* [C++ Tracker usage manual] [cpp-manual] for instrumenting a C++ app with the tracker

<h2 id="help">6. Getting help</h2>

We hope that you find the Snowplow C++ Tracker useful - of course, this is only its first release, so don't be afraid to [get in touch][talk-to-us] or [raise an issue] [cpp-issues] on GitHub!

[snowplow-mini]: https://github.com/snowplow/snowplow-mini
[sqlite]: https://www.sqlite.org/

[tracking-cli]: https://github.com/snowplow/snowplow-tracking-cli

[cpp-repo]: https://github.com/snowplow/snowplow-cpp-tracker
[cpp-issues]: https://github.com/snowplow/snowplow-cpp-tracker/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

[cpp-setup]: https://github.com/snowplow/snowplow/wiki/CPP-Tracker-Setup
[cpp-manual]: https://github.com/snowplow/snowplow/wiki/CPP-Tracker 
