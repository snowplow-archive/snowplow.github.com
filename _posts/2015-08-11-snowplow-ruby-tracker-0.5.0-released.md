---
layout: post
title: Snowplow Ruby Tracker 0.5.0 released
title-short: Snowplow Ruby Tracker 0.5.0
tags: [snowplow, analytics, ruby, rails, tracker]
author: Fred
category: Releases
---

We are happy to announce the release of version 0.5.0 of the Snowplow Ruby Tracker. As well as making the Tracker more robust, this release introduces several breaking API changes.

Read on for more detail on:

1. [Improved concurrency](/blog/2015/08/11/snowplow-ruby-tracker-0.5.0-released/#threads)
2. [More robust error handling](/blog/2015/08/11/snowplow-ruby-tracker-0.5.0-released/#errors)
3. [The SelfDescribingJson class](/blog/2015/08/11/snowplow-ruby-tracker-0.5.0-released/#selfDescribingJson)
4. [New setFingerprint method](/blog/2015/08/11/snowplow-ruby-tracker-0.5.0-released/#fingerprint)
5. [Upgrading](/blog/2015/08/11/snowplow-ruby-tracker-0.5.0-released/#upgrading)
6. [Getting help](/blog/2015/08/11/snowplow-ruby-tracker-0.5.0-released/#help)

<!--more-->

<h2 id="threads">1. Improved concurrency</h2>

The Ruby Tracker's `AsyncEmitter` class now uses the [Queue][queue] class to implement the producer-consumer pattern, where a fixed pool of threads work on sending events. Reusing threads this way performs better than the previous implementation in which a new thread was created for every network request.

You can configure the number of threads to use with the new `thread_count` field of the AsyncEmitter's configuration hash like this:

{% highlight ruby %}
my_emitter = AsyncEmitter.new(MY_ENDPOINT, {
  :thread_count => 10
})
{% endhighlight %}

If your application only rarely sends events, the default of 1 thread should be good enough; otherwise try experimenting with different values to determine which works best.

We have also eliminated a race condition where sending many events at once could cause events to be duplicated or skipped.

<h2 id="errors">2. More robust error handling</h2>

The previous tracker version only treated requests with status code 200 as successful. This behavior has been broadened to include all 2xx and 3xx status codes.

The tracker now catches all network-related exceptions and treats the events which caused them as failed. This means that network unavailability no longer causes the tracker to throw exceptions.

<h2 id="selfDescribingJson">3. The SelfDescribingJson class</h2>

The new `SelfDescribingJson` class makes it easier to build unstructured events and custom contexts.

Instead of fully specifying JSONs like this:

{% highlight ruby %}
my_event = {
  'schema' => 'iglu:com.acme/myevent/jsonschema/1-0-0',
  'data' => {
    'color' => 'red'
  }
}
my_context = {
  'schema' => 'iglu:com.acme/mycontext/jsonschema/1-0-1',
  'data' => {
    'size' => 5
  }
}
my_tracker.track_unstruct_event(my_event, [my_context])
{% endhighlight %}

you would now use the `SelfDescribingJson` class to automatically handle the "schema" and "data" fields like this:

{% highlight ruby %}
my_event = SnowplowTracker::SelfDescribingJson.new(
  'iglu:com.acme/myevent/jsonschema/1-0-0',
  {
    'color' => 'red'
  }
)

my_context = SnowplowTracker::SelfDescribingJson.new(
  'iglu:com.acme/mycontext/jsonschema/1-0-0',
  {
    'size' => 5
  }
)

my_tracker.track_unstruct_event(my_event, [my_context])
{% endhighlight %}

Note that this is a breaking change and old-style API calls which manually construct unstructured events and custom contexts will no longer work.

<h2 id="fingerprint">4. New setUserFingerprint method</h2>

Thanks to Snowplow community member Kacper Bielecki ([@kazjote][kazjote] on GitHub), you can now set a user fingerprint for a Subject like this:

{% highlight ruby %}
my_subject.set_fingerprint(7304597607)
{% endhighlight %}

Thanks a lot Kacper!

<h2 id="upgrading">5. Upgrading</h2>

This release increases the version of the `contexts` schema from 1-0-0 to 1-0-1 to allow empty contexts arrays. Because of this, it is only compatible with version 0.9.14 and later of the core Snowplow platform.

You will need to update all unstructured events and contexts to use the `SelfDescribingJson` class mentioned above.

The `tracker.flush` method now takes one boolean argument, `async`, which defaults to `false`. Usage of this method is demonstrated below:

{% highlight ruby %}
# Perform an asynchronous flush, which moves all buffered events to the work queue to be sent to the collector but doesn't block
my_tracker.flush(true)

# Perform a synchonous flush, blocking until all events have been sent
my_tracker.flush
{% endhighlight %}

The Emitter class's `buffer_size` configuration option used to be 0-indexed, so with the following configuration the Emitter would send events in batches of 6:

{% highlight ruby %}
my_emitter = AsyncEmitter.new(MY_ENDPOINT, {
  :buffer_size => 5
})
{% endhighlight %}

The `buffer_size` is now 1-indexed, so that with this configuration events will be sent in batches of 5.

Due to JRuby compatibility issues, we have made the Ruby Tracker's dependency on the [Contracts](contracts) gem more strict: rather than allowing all Contracts versions since 0.3.0, the Gemfile now requires a Contracts version between 0.7 and 0.11 (inclusive).

<h2 id="help">6. Getting help</h2>

These links may be useful:

* The [wiki page][wiki]
* The [GitHub repository][repo]

If you have an idea for a new feature or want help getting things set up, please [get in touch] [talk-to-us]. [Raise an issue][issues] in the GitHub repository if you find any bugs.

[queue]: http://ruby-doc.org/stdlib-2.0.0/libdoc/thread/rdoc/Queue.html
[contracts]: https://github.com/egonSchiele/contracts.ruby
[kazjote]: https://github.com/kazjote

[repo]: https://github.com/snowplow/snowplow-ruby-tracker
[wiki]: https://github.com/snowplow/snowplow/wiki/Ruby-Tracker
[issues]: https://github.com/snowplow/snowplow-ruby-tracker/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
