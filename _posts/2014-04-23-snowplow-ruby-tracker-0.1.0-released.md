---
layout: post
title: Snowplow Ruby Tracker 0.1.0 released
title-short: Snowplow Ruby Tracker 0.1.0
tags: [snowplow, analytics, python, django, tracker]
author: Fred
category: Releases
---

We are happy to announce the release of the new [Snowplow Ruby Tracker] [repo]. This is a Ruby gem designed to send Snowplow events to a Snowplow collector from a Ruby or Rails environment. This post will cover installing and setting up the Tracker, and provide some basic information about its features:

1. [How to install the tracker](/blog/2014/04/23/snowplow-ruby-tracker-0.1.0-released/#install)
2. [How to use the tracker](/blog/2014/04/23/snowplow-ruby-tracker-0.1.0-released/#usage)
3. [Features](/blog/2014/04/23/snowplow-ruby-tracker-0.1.0-released/#roadmap)
4. [Getting help](/blog/2014/04/23/snowplow-ruby-tracker-0.1.0-released/#help)

<!--more-->

<div class="html">
<h2><a name="install">1. How to install the tracker</a></h2>
</div>

The Snowplow Ruby Tracker is published to [RubyGems] [rubygems], the Ruby community's gem hosting service. This makes it easy to install the Tracker locally, or add it as a dependency into your own Ruby app.

To install the Tracker locally:

{% highlight bash %}
$ gem install snowplow-tracker
{% endhighlight %}

To add the Snowplow Ruby Tracker as a dependency to your own Ruby gem, edit your gemfile and add:

{% highlight ruby %}
gem 'snowplow-tracker'
{% endhighlight %}

The Snowplow Ruby Tracker is compatible with Ruby versions 1.9.3, 2.0.0, and 2.1.0. The [setup page] [setup] has more information on the Tracker's own dependencies.

<div class="html">
<h2><a name="usage">2. How to use the tracker</a></h2>
</div>

Require the Snowplow Tracker like this:

{% highlight ruby %}
require 'snowplow-tracker'
{% endhighlight %}

Initialize a Tracker like this:

{% highlight ruby %}
tracker = SnowplowTracker::Tracker.new('d3rkrsqld9gmqf.cloudfront.net', 'cf', '')
{% endhighlight %}

Set some additional information:

{% highlight ruby %}
tracker.set_user_id('a73e94')
tracker.set_platform('mob')
tracker.set_lang('en')
{% endhighlight %}

And fire some events:

{% highlight ruby %}
tracker.track_page_view("www.example.com", "example page", "www.referrer.com")

tracker.track_struct_event("shop", "add-to-basket", None, "pcs", 2, 1369330909)

tracker.track_ecommerce_transaction({
  'order_id' => '12345',
  'total_value' => 35,
  'affiliation' => 'my_company',
  'tax_value' => 0,
  'shipping' => 0,
  'city' => 'Phoenix',
  'state' => 'Arizona',
  'country' => 'USA',
  'currency' => 'GBP'
  },
  [ {
  'sku' => 'pbz0026',
  'price' => 20,
  'quantity' => 1
  },
  {
  'sku' => 'pbz0038',
  'price' => 15,
  'quantity' => 1,
  'name' => 'crystals',
  'category' => 'magic'
  } ])

{% endhighlight %}

For in-depth usage information on the Snowplow Ruby Tracker, see the [wiki page] [wiki].

<div class="html">
<h2><a name="usage">3. Features</a></h2>
</div>

The functionality and architecture of the Snowplow Ruby Tracker is very similar to that of the Snowplow Python Tracker. It has support for the same Snowplow events, and custom contexts can be attached to every event.

The [contracts] [contracts] library for Ruby provides type checking. We have written a test suite using [RSpec] [rspec] and [webmock] [webmock].

<div class="html">
<h2><a name="help">4. Getting help</a></h2>
</div>

Since this is the first release of the Ruby Tracker, we're keen to hear people's opinions. If you have an idea for a new feature or want help getting things set up, please [get in touch] [talk-to-us]. And [raise an issue] [issues] if you spot any bugs!

[contracts]: https://rubygems.org/gems/contracts
[rspec]: https://rubygems.org/gems/rspec
[webmock]: https://rubygems.org/gems/webmock

[rubygems]: http://rubygems.org/gems/snowplow-tracker

[repo]: https://github.com/snowplow/snowplow-ruby-tracker
[wiki]: https://github.com/snowplow/snowplow/wiki/Ruby-Tracker
[setup]: https://github.com/snowplow/snowplow/wiki/Ruby-tracker-setup
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow-ruby-tracker/issues
