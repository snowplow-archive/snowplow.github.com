---
layout: post
title: Iglu Ruby Client 0.1.0 released
title-short: Iglu Ruby Client
tags: [iglu, ruby, json, jsonschema]
author: Anton
category: Releases
---

We are pleased to announce the initial release of the [Iglu Ruby Client][repo], our third library in the family of [Iglu] [iglu-repo] clients.

In the rest of this post we will cover:

1. [Introducing Iglu Ruby Client](/blog/2017-02-08-iglu-ruby-client-0.1.0-released/#intro)
2. [Use cases](/blog/2017-02-08-iglu-ruby-client-0.1.0-released/#use-cases)
3. [Setup guide](/blog/2017-02-08-iglu-ruby-client-0.1.0-released/#setup-guide)
4. [Usage](/blog/2017-02-08-iglu-ruby-client-0.1.0-released/#usage)
5. [Roadmap and upcoming features](/blog/2017-02-08-iglu-ruby-client-0.1.0-released/#roadmap)
6. [Getting help](/blog/2017-02-08-iglu-ruby-client-0.1.0-released/#help)

<!--more-->

<h2 id="intro">1. Introducing Iglu Ruby Client</h2>

Iglu clients are simple SDKs which let users fetch schemas for self-describing data and validate that data against its schema.

As part of broadening the utility of the Iglu platform, we are pleased to introduce the Iglu Ruby Client. You can embed this client inside web applications written in Ruby on Rails or Sinatra, or inside Ruby- or JRuby-based CLI applications; we created this SDK originally for use inside Snowplow's own JRuby-based CLI apps.

This is our third Iglu client. Our [Iglu Scala Client][scala-client-repo] is the reference implementation and works at the core of the Snowplow pipeline, validating all data flowing through the platform; our [Iglu Objective-C Client] [objc-client-repo] lets you test and validate all of your Snowplow self-describing JSONs directly in your OS X and iOS applications.

<h2 id="use-cases">2. Use cases</h2>

This library lets you add a layer of JSON validation to your Ruby-based web applications, servers and CLI tools.

If you are sending events to Snowplow from Ruby, it is important to check that the self-describing JSONs you are sending to Snowplow will not cause validation issues downstream. If they do not validate, then Snowplow events will fail validation until you can get the problem fixed.

You can now run the following assertions directly in your application:

* That your resolver config is valid as per the [Iglu technical documentation] [iglu-docs]
* That your self-describing JSONs can be resolved correctly against your Iglu repositories
* That your self-describing JSONs pass validation against their respective JSON Schemas

This removes the need of manually and painstakingly validating that your events and corresponding JSON Schemata are correct.

As well as these Snowplow-oriented use cases, nothing prevents you from using Iglu technology more broadly, for example in conjunction with REST APIs to document and evolve API endpoints, and to eagerly validate data that clients and servers passing to each other.

Please share any novel use cases for this client on our Discourse!

<h3 id="setup-guide">3. Setup guide</h3>

Iglu Ruby Client has been tested with Ruby versions from 2.0 up to 2.4, including [JRuby][jruby] and can be used as a dependency for other gems as well as included into jars.

It is published on [RubyGems.org][rubygems] and can be installed with via `gem` utility:

`gem install iglu-ruby-client`

To add it as a dependency to your own Ruby gem, please edit your gemfile and add:

{% highlight sh %}
$ gem 'iglu-ruby-client'
{% endhighlight %}

<h3 id="usage">4. Usage</h3>

Here is a basic usage of Ruby Iglu resolver:

{% highlight ruby %}
require 'iglu-client'

resolver_config = {
 :schema => "iglu:com.snowplowanalytics.iglu/resolver-config/jsonschema/1-0-2",
 :data => {
   :cacheSize => 500,
   :repositories => [{:name => "Iglu Central", :priority => 0, :vendorPrefixes => ["com.snowplowanalytics"], :connection => {:http => {:uri => "http://iglucentral.com"}}}]
  }
}

resolver = Iglu::Resolver.parse(resolver_config)

{% endhighlight %}

The above snippet initializes the client from a [resolver configuration][resolver-config] (versions up to `1-0-2` are supported in initial release) which contains [Iglu Central][iglu-central].

As in the Iglu Scala Client, the Ruby `Resolver` gives full information about what exactly went wrong on invalid JSON, but unlike Scala it throws an exception, rather than returning a plain value:

{% highlight ruby %}
invalid_json = {
  :schema => "iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0", 
  :data => {:latitude => 30.8, :longitude => "invalid"}
}

resolver.validate(invalid_json)
JSON::Schema::ValidationError: The property '#/longitude' of type String did not match the following type: number
from /Library/Ruby/Gems/2.0.0/gems/json-schema-2.7.0/lib/json-schema/attribute.rb:18:in `validation_error'
{% endhighlight %}

For valid JSON it will return a `true` value:

{% highlight ruby %}
valid_json = {
  :schema => "iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0", 
  :data => {:latitude => 30.8, :longitude => 62.1}
}
resolver.validate(valid_json) # Evaluates to true
{% endhighlight %}

For more advanced usage, please see the [Ruby client] [documentation] page on the Iglu wiki.

<h2 id="roadmap">5. Roadmap and upcomming features</h2>

Iglu Ruby Client is still a young project, and does not yet have feature parity with our Iglu Scala Client, the reference implementation.

In particular:

* Although you must set the `cacheSize` for each registry in the resolver configuration, it is not actually used. While Iglu Scala Client uses this for eviction from its LRU cache, by contrast the Ruby client currently grows its cache indefinitely ([#3][issue-3])
* Iglu Ruby Client doesn't yet support recently introduced `cacheTtl` configuration property ([#6] [issue-6])

<h2 id="help">6. Getting help</h2>

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[iglu-repo]: https://github.com/snowplow/iglu
[iglu-docs]: https://github.com/snowplow/iglu/wiki

[scala-client-repo]: https://github.com/snowplow/iglu-scala-client
[objc-client-repo]: https://github.com/snowplow/iglu-objc-client
[resolver-config]: https://github.com/snowplow/iglu/wiki/Iglu-client-configuration
[iglu-central]: https://github.com/snowplow/iglu-central/

[rubygems]: https://rubygems.org/
[jruby]: http://jruby.org/
[warbler]: https://github.com/jruby/warbler

[documentation]: https://github.com/snowplow/iglu/wiki/Ruby-client

[repo]: https://github.com/snowplow/iglu-ruby-client
[issues]: https://github.com/snowplow/snowplow/iglu-ruby-client/issues
[issue-3]: https://github.com/snowplow/iglu-ruby-client/issues/3
[issue-6]: https://github.com/snowplow/iglu-ruby-client/issues/6
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
