---
layout: post
title: Snowplow Ruby Tracker 0.6.0 released
title-short: Snowplow Ruby Tracker 0.6.0
tags: [snowplow, analytics, ruby, rails, tracker]
author: Ed
category: Releases
---

We are happy to announce the release of version 0.6.0 of the Snowplow Ruby Tracker. This release introduces true timestamp
support, and marks the end of our support for Ruby 1.9.3.

Read on for more detail on:

1. [True timestamp support](/blog/2016/08/16/snowplow-ruby-tracker-0.6.0-released/#ttm)
2. [Device sent timestamp support](/blog/2016/08/16/snowplow-ruby-tracker-0.6.0-released/#stm)
3. [Self describing events](/blog/2016/08/16/snowplow-ruby-tracker-0.6.0-released/#selfdescribingevents)
4. [Upgrading](/blog/2016/08/16/snowplow-ruby-tracker-0.6.0-released/#upgrading)
5. [Getting help](/blog/2016/08/16/snowplow-ruby-tracker-0.6.0-released/#help)

<!--more-->

<h2 id="ttm">1. True timestamp support</h2>

True timestamps in Snowplow are a way to indicate that you really trust the time given as accurate. You can find out more
about how time is handled in Snowplow [in our blog post here][snowplow-time]. All the tracking methods
in this tracker now support sending this timestamp by using a "Timestamp" object. This is *not* a breaking API change and integers will be treated
as before, as device timestamps (nil parameters will also be treated as device timestamps at the current time).

Here's an example of how to attach a true timestamp to a page view as of this release:

{% highlight ruby %}
e = SnowplowTracker::Emitter.new('localhost')
t = SnowplowTracker::Tracker.new(e)

t.track_page_view('http://example.com', 
                  'Snowplow Ruby Tracker 0.6.0 released',
                  'http://www.referrer.com', 
                   nil, 
                   SnowplowTracker::TrueTimestamp.new(1471419787572))
{% endhighlight %}

The other tracking methods work in the same fashion, with the original timestamp field now accepting an integer or a Timestamp object indicating the type of timestamp. 

<h2 id="stm">2. Device sent timestamp support</h2>

This release adds a [device sent timestamp][snowplow-time] to each event transmitted to a collector. This occurs automatically after upgrading to 0.6.0.

<h2 id="selfdescribingevents">3. Track self describing events</h2>
 
After feedback, we've decided that a better description of "unstructured events" is "self describing events". As such, and to keep the Ruby tracker in
line with our other trackers - we've mirrored the "track_unstruct_event" API calls as "track_self_describing_event". These are functionally the same. We will however
look to desupport "track_unstruct_event" in future releases.

Both versions of this call support the true timestamp, and this is not an API breaking change.

<h2 id="upgrading">4. Upgrading</h2>

This release desupports Ruby 1.9.3. The Snowplow Ruby Tracker 0.6.0 now supports Ruby 2.0.0 through to Ruby 2.3.1 (inclusive). No breaking API changes are
included in this release.

<h2 id="help">5. Getting help</h2>

These links may be useful:

* The [wiki page][wiki]
* The [GitHub repository][repo]

If you have an idea for a new feature or want help getting things set up, please [get in touch][talk-to-us]. [Raise an issue][issues] in the GitHub repository if you find any bugs.

[snowplow-time]: http://snowplowanalytics.com/blog/2015/09/15/improving-snowplows-understanding-of-time/
[repo]: https://github.com/snowplow/snowplow-ruby-tracker
[wiki]: https://github.com/snowplow/snowplow/wiki/Ruby-Tracker
[issues]: https://github.com/snowplow/snowplow-ruby-tracker/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
