---
layout: post
title: Snowplow Ruby Tracker 0.3.0 released
title-short: Snowplow Ruby Tracker 0.3.0
tags: [snowplow, analytics, ruby, rails, tracker]
author: Fred
category: Releases
---

We are happy to announce the release of the Snowplow Ruby Tracker version 0.3.0. This version adds support for asynchronous requests and POST requests, and introduces the new Subject and Emitter classes.

The rest of this post will cover:

1. [The Subject class](/blog/2014/08/29/snowplow-ruby-tracker-0.3.0-released/#subject)
2. [The Emitter class](/blog/2014/08/29/snowplow-ruby-tracker-0.3.0-released/#emitter)
3. [Chainable methods](/blog/2014/08/29/snowplow-ruby-tracker-0.3.0-released/#chainable-methods)
4. [Logging](/blog/2014/08/29/snowplow-ruby-tracker-0.3.0-released/#logging)
5. [Contracts](/blog/2014/08/29/snowplow-ruby-tracker-0.3.0-released/#contracts)
6. [Other changes](/blog/2014/08/29/snowplow-ruby-tracker-0.3.0-released/#changes)
7. [Upgrading](/blog/2014/08/29/snowplow-ruby-tracker-0.3.0-released/#upgrading)
8. [Getting help](/blog/2014/08/29/snowplow-ruby-tracker-0.3.0-released/#help)

<!--more-->

<h2><a name="subject">1. The Subject class</a></h2>

An instance of the Subject class represents a user who is performing an event in the **Subject**-**Verb**-**Direct Object** model proposed in our [Snowplow event grammar] [event-grammar]. User-specific data like timezone and language are attached to instances of the Subject class.

If your tracker will only be tracking one user, you don't have to create a Subject instance at all - one will be created automatically for you. The only change you need to make is setting the new `subject` argument to `nil` when initializing your tracker:

{% highlight ruby %}
# Create a tracker without specifying a subject
my_tracker = Snowplow::Tracker.new(my_emitter, nil, 'my_tracker_name', 'my_app_id')
{% endhighlight %}

(The first argument, `my_emitter`, will be explained later.)

If you want more than one subject:

{% highlight ruby %}
require 'snowplow_tracker'

# Create a simple Emitter which will log events to http://d3rkrsqld9gmqf.cloudfront.net/i
e = SnowplowTracker::Emitter.new("d3rkrsqld9gmqf.cloudfront.net")

# Create an initial Subject instance
s0 = SnowplowTracker::Subject.new

# Create a Tracker instance
t = SnowplowTracker::Tracker.new(e, s0, "cf", "CF63A")

# Set some data for the initial subject
# Events we fire will have this data attached as long as s0 is the current subject
s0.set_user_id('7834').set_lang('en')

# Create a new Subject corresponding to a pc user
s1 = SnowplowTracker::Subject.new

# Set some data for that user
s1.set_platform("pc")
s1.set_user_id("0a78f2867de")

# Set s1 as the Tracker's subject and track s1 viewing a page
# All events fired will have instead have information we set about s1 attached
# All events fired will have the information we set about s1 attached
t.set_subject(s1).track_page_view("http://www.example.com")

# Change the tracker subject from s1 back to s0
# All events fired will have instead have information we set about s0 attached
t.set_subject(s0)

# Track user s0 viewing a page
t.track_page_view("http://www.example.com")

{% endhighlight %}

<h2><a name="emitter">2. The Emitter class</a></h2>

<h3>Overview</h3>

Each tracker instance must now be initialized with an Emitter which is responsible for firing events to a Collector. An Emitter instance is initialized with two arguments: an endpoint and an optional configuration hash. For example:

{% highlight ruby %}
# Create an emitter
my_emitter = Snowplow::Emitter.new('d3rkrsqld9gmqf.cloudfront.net', {
  :protocol => 'https',
  :method => 'post',
  :port => 80,
  :buffer_size => 0,
  :on_success => lambda { |success_count|
    puts '#{success_count} events sent successfully'
  },
  :on_failure => lambda { |success_count, failures|
    puts '#{success_count} events sent successfully, #{failures.size} events sent unsuccessfully'
  }
})
{% endhighlight %}

Every setting in the configuration hash is optional. Here is what they do:

* `:protocol` determines whether events will be sent using HTTP or HTTPS. It defaults to "http"
* `:method` determines whether events will be sent using GET or POST. It defaults to "get"
* `:port` determines the port to use
* `:buffer_size` is the number of events which will be queued before they are all sent, a process called "flushing". When using GET, it defaults to 0 because each event has its own request. When using POST, it defaults to 10, and the buffered events are all sent together in a single request
* `:on_success` is a callback which is called every time the buffer is flushed and every event in it is sent successfully (meaning with status code 200). It should accept one argument: the number of requests sent this way
* `on_failure` is a callback which is called if the buffer is flushed but not every event is sent successfully. It should accept two arguments: the number of successfully sent events and an array containing the unsuccessful events

Once the emitter is created, create a tracker like this:

{% highlight ruby %}
# Create a tracker
my_tracker = Snowplow::Tracker.new(my_emitter, 'my_tracker_name', 'my_app_id')
{% endhighlight %}

You can then track events as in previous versions of the Ruby Tracker.

<h3>The AsyncEmitter class</h3>

The AsyncEmitter works just like the Emitter, but is asynchronous - whenever the buffer is flushed a new thread is created. This means that the requests the AsyncEmitter sends do not block.

<h3>Multiple Emitters</h3>

It is also possible to initialize a tracker with an array of emitters, in which case events will be sent to all of them:

{% highlight ruby %}
# Create a tracker with multiple emitters
my_tracker = Snowplow::Tracker.new([my_sync_emitter, my_async_emitter], 'my_tracker_name', 'my_app_id')
{% endhighlight %}

You can also add new emitters after creating a tracker with the `add_emitter` method:

{% highlight ruby %}
# Create a tracker with multiple emitters
my_tracker.add_emitter(another_emitter)
{% endhighlight %}

<h3>Flushing</h3>

You can manually flush all emitters associated with a tracker using the `flush` method:

{% highlight ruby %}
# Flush all emitters
t.flush
{% endhighlight %}

This is useful if you are about to halt the process but do not want to lose your buffered events.

The flush method takes an optional `sync` argument which determines whether AsyncEmitters will be flushed synchronously. Set `sync` to `true` and the method will block until all flushing threads have finished.

<h2><a name="chainable-methods">3. Chainable methods</a></h2>

All Tracker methods and Subject methods now return `self` and so are chainable:

{% highlight ruby %}
e = Snowplow::Emitter.new('d3rkrsqld9gmqf.cloudfront.net')
s = Snowplow::Subject.new.set_user_id('user-45672').set_color_depth(24)
t = Snowplow::Tracker.new(e).set_subject(s).track_screen_view('my_title_screen')
{% endhighlight %}

<h2><a name="logging">4. Logging</a></h2>

This release introduces logging using Ruby's built-in Logger class. The log level is set to INFO by default but can be changed:

{% highlight ruby %}
require 'logger'
SnowplowTracker::LOGGER.level = Logger::DEBUG
{% endhighlight %}

The levels are:

| **Level**      | **Description**                                             |
|---------------:|:------------------------------------------------------------|
| `FATAL`        | Nothing logged                                              |
| `WARN`         | Notification for requests with status code not equal to 200 |
| `INFO`         | Notification for all requests                               |
| `DEBUG`        | Contents of all requests                                    |

<h2><a name="disabling-contracts">5. Disabling contracts</a></h2>

The Snowplow Ruby Tracker uses the [Ruby Contracts gem][contracts] for typechecking. Version 0.3.0 offers the option to turn contracts on or off:

{% highlight ruby %}
# Turn contracts off
SnowplowTracker::disable_contracts

# Turn contracts back on
SnowplowTracker::enable_contracts
{% endhighlight %}

<h2><a name="changes">6. Other changes</a></h2>

We have also:

* Changed the default platform to "srv" (which is short for "server") [#37][37]
* Made the screen name argument to `track_screen_view` optional [#38][38]

<h2><a name="upgrading">7. Upgrading</a></h2>

There are three breaking changes to the API, two of which involving the tracker constructor: the first argument is now an Emitter rather than a Sstring, and there is a new second argument which may be a Subject but otherwise defaults to `nil`. An example of how to update your code:

{% highlight ruby %}
# Version 0.2.0
t = SnowplowTracker::Tracker.new('d3rkrsqld9gmqf.cloudfront.net', 'my_tracker_namespace', 'my_app_id')

# Version 0.3.0
e = SnowplowTracker::AsyncEmitter.new('d3rkrsqld9gmqf.cloudfront.net')
t = SnowplowTracker::Tracker.new(e, nil 'my_tracker_namespace', 'my_app_id')

{% endhighlight %}

The final change is that all tracker methods now return the tracker instance, self.

<h2><a name="help">8. Getting help</a></h2>

Useful links:

* The [wiki page][wiki]
* The [Github repository][repo]
* The [0.3.0 release notes][tracker-030]

If you have an idea for a new feature or want help getting things set up, please [get in touch] [talk-to-us]. This is only the second release of the Ruby Tracker, so we're keen to hear people's opinions. And [raise an issue] [issues] if you spot any bugs!

[event-grammar]: /blog/2013/08/12/towards-universal-event-analytics-building-an-event-grammar/
[contracts]: https://github.com/egonSchiele/contracts.ruby

[repo]: https://github.com/snowplow/snowplow-ruby-tracker
[wiki]: https://github.com/snowplow/snowplow/wiki/Ruby-Tracker
[setup]: https://github.com/snowplow/snowplow/wiki/Ruby-tracker-setup
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow-ruby-tracker/issues

[37]: https://github.com/snowplow/snowplow-ruby-tracker/issues/37
[38]: https://github.com/snowplow/snowplow-ruby-tracker/issues/38

[tracker-030]: https://github.com/snowplow/snowplow-ruby-tracker/releases/tag/0.3.0
