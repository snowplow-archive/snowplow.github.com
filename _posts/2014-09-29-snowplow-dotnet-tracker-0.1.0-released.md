---
layout: post
title: Snowplow .NET Tracker 0.1.0 released
title-short: Snowplow .NET Tracker 0.1.0
tags: [snowplow, analytics, c#, dotnet, tracker]
author: Fred
category: Releases
---

We are pleased to announce the release of the first version of the [Snowplow .NET Tracker] [repo]. The tracker supports synchronous and asynchronous GET and POST requests and has an offline mode which stores unsent events using [Message Queueing] [msmq].

This introductory post will cover the following topics:

1. [Installation](/blog/2014/09/26/snowplow-dotnet-tracker-0.1.0-released/#install)
2. [How to use the tracker](/blog/2014/09/26/snowplow-dotnet-tracker-0.1.0-released/#usage)
3. [Features](/blog/2014/09/26/snowplow-dotnet-tracker-0.1.0-released/#offline)
4. [Logging](/blog/2014/09/26/snowplow-dotnet-tracker-0.1.0-released/#logging)
5. [Getting help](/blog/2014/09/26/snowplow-dotnet-tracker-0.1.0-released/#help)

<!--more-->

<div class="html">
<h2><a name="install">1. Installation</a></h2>
</div>

The Snowplow .NET Tracker is published to [NuGet] [nuget], the .NET package manager. To add it to your project, install it in the Visual Studio Package Manager Console:

{% highlight bash %}
Install-Package Snowplow.Tracker
{% endhighlight %}

You will also need to add an assembly reference to the .NET Tracker to your project.

<div class="html">
<h2><a name="usage">2. How to use the tracker</a></h2>
</div>

Add a using directive to the Snowplow Tracker to your project:

{% highlight csharp %}
using Snowplow.Tracker;
{% endhighlight %}

Create an emitter which will asynchronously send HTTP GET requests:

{% highlight csharp %}
var e = new AsyncEmitter("d3rkrsqld9gmqf.cloudfront.net");
{% endhighlight %}

It is also possible to specify the protocol, method, and port that the emitter will use, as well as a `bufferSize` which determines the minimum number of events to queue before sending them all, and `onSuccess` and `onFailure` callbacks to be called depending on whether requests are sent successfully.

Create a subject to hold data about a specific user:

{% highlight csharp %}
var s = new Subject();
s.SetUserId("user-567296");
s.SetTimezone("Europe/London");
s.SetLang("en");
{% endhighlight %}

Create a tracker:

{% highlight csharp %}
var t = new Tracker(e, s, "my-tracker-namespace", "my-application-id");
{% endhighlight %}

Send some events:

{% highlight csharp %}
// Track a page view
t.TrackPageView("http://www.example.com", "title page");

// Track a structured add-to-basket event
t.TrackStructEvent("shop", "add-to-basket", null, "red hat", 2);

// Track an ecommerce transaction
// Use the TransactionItem class for the items within a transaction
var hat = new TransactionItem("pbz0026", 20, 1);
var shirt = new TransactionItem("pbz0038", 15, 1, "shirt", "clothing");
var items = new List<TransactionItem> { hat, shirt };
t.TrackEcommerceTransaction("6a8078be", 35, "affiliation", 3, 0, "Phoenix", "Arizona", "US", "USD", items);

// Track a Snowplow custom unstructured event
var eventJson = new Dictionary<string, object>
{
	{"schema", "iglu:com.acme/test/jsonschema/1-0-0"},
	{"data", new Dictionary<string, string>
	{
		{ "page", "testpage" },
		{ "user", "tester" }
	}
	}
};
t.TrackUnstructEvent(eventJson);

// Track a screen view event with custom context attached
var screenContext = new Dictionary<string, object>
{
	{"schema", "iglu:com.snowplowanalytics.snowplow/screen_type/jsonschema/1-0-0"},
	{"data", new Dictionary<string, object>
	{
		{ "type", "test" },
		{ "public", false }
	}
	}
};

var userContext = new Dictionary<string, object>
{
	{"schema", "iglu:com.snowplowanalytics.snowplow/user/jsonschema/1-0-0"},
	{"data", new Dictionary<string, object>
	{
		{ "age", 40 },
		{ "name", "Ned" }
	}
	}
};

var contextsList = new List<Dictionary<string, object>>
{
	pageContext,
	userContext
};

t.TrackScreenView("Test screen", "id-0004346", contextsList);
{% endhighlight %}

<div class="html">
<h2><a name="offline">3. Offline tracking</a></h2>
</div>

By default, instances of the Emitter class have offline tracking enabled. This means that if the device is offline when an event is sent, that event will be stored in a message queue. When a NetworkAvailabilityChanged event indicates that connectivity has been established, or when another event has been sent successfully, all events in the queue will be resent.

<div class="html">
<h2><a name="logging">4. Logging</a></h2>
</div>

The Emitter and AsyncEmitter classes use [NLog] [nlog] to log messages to the console. You can set the logging level using the static `setLogLevel` method:

{% highlight csharp %}
Log.SetLogLevel(Log.Level.Debug);
{% endhighlight %}

By default the log level is set to Log.Level.Info. The possible levels are:

| **Level**      | **Description**                                             |
|---------------:|:------------------------------------------------------------|
| `Off`          | Nothing logged                                              |
| `Warn`         | Notification for requests with status code not equal to 200 |
| `Info`         | Notification for all requests                               |
| `Debug`        | Contents of all requests                                    |

<div class="html">
<h2><a name="help">5. Getting help</a></h2>
</div>

Some useful resources:

* The [setup guide] [setup]
* The [technical documentation] [technical-documentation]

This is only the first version of the Snowplow .NET Tracker, so please [raise an issue][issues] if you find any bugs. If you have an idea for a new feature or need help getting set up, [get in touch!][talk-to-us]

[repo]: https://github.com/snowplow/snowplow-dotnet-tracker
[msmq]: http://msdn.microsoft.com/en-us/library/ms711472%28v=vs.85%29.aspx
[nuget]: https://www.nuget.org/
[nlog]: http://nlog-project.org/
[setup]: https://github.com/snowplow/snowplow/wiki/.NET-tracker-setup
[technical-documentation]: https://github.com/snowplow/snowplow/wiki/.NET-tracker
[issues]: https://github.com/snowplow/snowplow-dotnet-tracker/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
