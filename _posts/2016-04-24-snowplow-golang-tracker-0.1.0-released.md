---
layout: post
title: Snowplow Golang Tracker 0.1.0 released
title-short: Snowplow Golang Tracker 0.1.0
tags: [snowplow, analytics, golang, go, tracker]
author: Josh
category: Releases
---

We are pleased to announce the release of the [Snowplow Golang Tracker] [golang-repo]. The Tracker is designed to work asynchronously within your Golang code to provide great performance in your applications and servers, even under heavy load, while also storing all of your events persistently in the event of network failure.

It will also be used as a building block for a number of projects, including a new daemon to support robust asynchronous sending for the [PHP Tracker] [issue-54].

In the rest of this post we will cover:

1. [How to install the tracker](/blog/2016/04/24/snowplow-golang-tracker-0.1.0-released/#how-to-install)
2. [How to use the tracker](/blog/2016/04/24/snowplow-golang-tracker-0.1.0-released/#how-to-use)
3. [Core features](/blog/2016/04/24/snowplow-golang-tracker-0.1.0-released/#features)
4. [Roadmap](/blog/2016/04/24/snowplow-golang-tracker-0.1.0-released/#roadmap)
5. [Documentation](/blog/2016/04/24/snowplow-golang-tracker-0.1.0-released/#docs)
6. [Getting help](/blog/2016/04/24/snowplow-golang-tracker-0.1.0-released/#help)

<!--more-->

<h2 id="how-to-install">1. How to install the tracker</h2>

The release version of this Tracker is available directly from the GitHub repo and you can download it by running the following:

{% highlight bash %}
$ go get gopkg.in/snowplow/snowplow-golang-tracker.v1/tracker
{% endhighlight %}

We are using [gopkg.in](http://labix.org/gopkg.in) as a way of providing easy versioning within the Golang environment.

Please check out the [Golang Tracker setup guide] [golang-setup] on our wiki for more information on setup.

That's it! You're now ready to start using the Tracker.

<h2 id="how-to-use">2. How to use the tracker</h2>

To setup the Go Tracker you first need to import the package into your code:

{% highlight go %}
import "gopkg.in/snowplow/snowplow-golang-tracker.v1/tracker"

// You can also import the package with a shorter name...

import sp "gopkg.in/snowplow/snowplow-golang-tracker.v1/tracker"
{% endhighlight %}

You can then instantiate and start a new tracker like so:

{% highlight go %}
emitter := sp.InitEmitter(sp.RequireCollectorUri("com.acme"))
tracker := sp.InitTracker(sp.RequireEmitter(emitter))
{% endhighlight %}

You are now ready to Track events, so let's send a screen view event:

{% highlight go %}
tracker.TrackScreenView(sp.ScreenViewEvent{ 
  Id: sp.NewString("Screen ID"),
})
{% endhighlight %}

And that's all there is to it! Please check out the [Golang Tracker technical documentation] [golang-manual] on our wiki for the Tracker's full API.

<h2 id="features">3. Core features</h2>

The core features of the Snowplow Go Tracker include:

* Asynchronous event sending
* Outbound events are cached in a [SQLite] [sqlite] database to prevent event loss
* Value checking for all events to ensure invalid events are caught early

The general flow of the Tracker as an event goes through:

* A `tracker.TrackXXX` method is invoked
* The event is stored in the local database
* A long running [goroutine] [goroutine] is invoked to start processing these events (only started if it is not currently running)
* This process will then pull a range of events from the database and begin sending them to your configured collector URI
* More events arriving during sending will just be written to the database, and will then be picked up by the background sending process
* Each request is sent in its own goroutine

This model is very closely related to the one used in the Android, Objective-C and Unity Trackers, which are all backed by Sqlite databases.

If you __absolutely have to__ have the Tracker be non-blocking from end to end you can use the `go` keyword to track events within another `go routine`. The Tracker is thread-safe and will behave as normal; however in load-testing the Tracker better performance was actually found with the blocking approach to adding the event to the database.

In our tests sending 6,000 events to a [Snowplow Mini] [snowplow-mini] collector instance:

* Blocking addition: ~8 seconds
* Async addition: ~10 seconds

As the database can only accept one insert at a time the creation of `go routines` for individual Track invocations actually results in worse performance.

The Tracker also contains full support for secure event sending by both `GET` and `POST` request types, and the ability to combine events, for `POST`, up to a configurable byte limit. This yields much better performance versus our old approach of buffer limits.

<h2 id="roadmap">4. Roadmap</h2>

We have big plans for the Snowplow Golang Tracker at Snowplow, including:

* Building a daemon to be used with the PHP Tracker for robust async sending ([issue #54] [issue-54])
* Powering the [Snowplow Tracking CLI] [tracking-cli], to let Snowplow users send events from the command-line on Linux, Windows and OS-X
* Building an equivalent to Logstash for tailing logfiles into Snowplow as well-structured Snowplow events (working title the [Snowplow Logfile Source] [logfile-source])

<h2 id="docs">5. Documentation</h2>

* [Golang Tracker setup guide] [golang-setup] for setting up the tracker
* [Golang Tracker usage manual] [golang-manual] for instrumenting a Go app with the tracker
* [Golang Tracker GoDoc documentation] [golang-godoc] for GoDoc's auto-generated documentation for the package 

<h2 id="help">6. Getting help</h2>

We hope that you find the Snowplow Golang Tracker useful - of course, this is only its first release, so don't be afraid to [get in touch][talk-to-us] or [raise an issue] [golang-issues] on GitHub!

[goroutine]: https://www.golang-book.com/books/intro/10

[snowplow-mini]: https://github.com/snowplow/snowplow-mini
[sqlite]: https://www.sqlite.org/

[issue-54]: https://github.com/snowplow/snowplow-php-tracker/issues/54
[tracking-cli]: https://github.com/snowplow/snowplow-tracking-cli
[logfile-source]: https://github.com/snowplow/snowplow-logfile-source

[golang-repo]: https://github.com/snowplow/snowplow-golang-tracker
[golang-issues]: https://github.com/snowplow/snowplow-golang-tracker/issues
[golang-manual]: https://github.com/snowplow/snowplow/wiki/Golang-Tracker
[golang-setup]: https://github.com/snowplow/snowplow/wiki/Golang-Tracker-Setup
[golang-godoc]: https://godoc.org/gopkg.in/snowplow/snowplow-golang-tracker.v1/tracker
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
