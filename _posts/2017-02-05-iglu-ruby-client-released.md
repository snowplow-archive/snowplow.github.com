---
layout: post
title: Iglu Ruby Client 0.1.0 released
title-short: Iglu Ruby Client
tags: [iglu, ruby, json, jsonschema]
author: Anton
category: Releases
---

We are pleased to announce the initial release of the [Iglu Ruby Client][repo], our third library in family of Iglu clients.

In the rest of this post we will cover:

1. [Introducing Iglu Ruby Client](/blog/2017-02-07-iglu-ruby-client-0.1.0-released/#intro)
2. [Setup Guide](/blog/2017-02-07-iglu-ruby-client-0.1.0-released/#setup-guide)
3. [Usage](/blog/2017-02-07-iglu-ruby-client-0.1.0-released/#usage)
4. [Roadmap and lacking features](/blog/2017-02-07-iglu-ruby-client-0.1.0-released/#roadmap)
5. [Getting help](/blog/2017-02-07-iglu-ruby-client-0.1.0-released/#help)

<!--more-->

<h2 id="intro">1. Introducing Iglu Ruby Client</h2>

Iglu clients are small SDKs providing users an API to fetch schemas for self-describing data and validate it.
Currently, [Iglu Scala Client][scala-client-repo] is reference implementation and works at the core of Snowplow pipeline, validating all data passing through.
However, there's a clear lack of Iglu implementations for commonly used programming languages.
Iglu Ruby Client addresses this issue, becoming third official Iglu client and first one with good chance of broad adoption.

At Snowplow, Iglu used primarily in data pipelines, however, nothing prevents developers from using it in conjunction with REST APIs to document and 
evolve API endpoints and eagerly validate data clients and servers passing to each other.
For this purpose Iglu Ruby Client can be used with one of the world's most popular web frameworks - Ruby on Rails.

Another application of new client is Snowplow batch pipeline CLI, which in upcoming 89th release will use self-describing JSONs to configure storage targets configuration.

<h3 id="setup-guide">2. Setup guide</h3>

Iglu Ruby Client was tested with Ruby versions from 2.0 up to 2.4, including [JRuby][jruby] and can be used as a dependency for other gems as well as included into jars.

It is published on [RubyGems.org][rubygems] and can be installed with via `gem` utility:

`gem install iglu-ruby-client`

To add it as a dependency to your own Ruby gem, edit your gemfile and add:

{% highlight ruby %}
gem 'iglu-ruby-client'
{% endhighlight %}

<h3 id="usage">3. Usage</h3>

Below you can see basic usage example:

{% highlight ruby %}
require 'iglu-client'

resolver = Iglu::Resolver.parse(JSON.parse(resolver_config, {:symbolize_names => true}))
resolver.validate(json)
{% endhighlight %}

Above snippet initializes client from [resolver configuration][resolver-config] (versions up to `1-0-2` are supported in initial release) and validates self-describing JSON.
Note that it is highly recommended to use JSONs as hashes with symbolized keys.
Unlike Iglu Scala Client which never throws exceptions and return errors as values, Ruby client uses more common for dynamic languages approach,
specifically it throws `IgluError` exception on any non-success case, like non-self-describing JSON, not found schema, connection error etc and returns plain value (same self-describing JSON) on success.
To just lookup schema without any self-describing JSON, you can use `lookup_schema` method, which accepts schema key as object or URI.

`iglu-ruby-client` gem also provides somewhat similar to [Iglu core][iglu-core] functionality.
Specifically, you can initialize and utilize entities specific to Iglu system, such as schema key, self-describing data, SchemaVer etc.
Same classes will be included in Iglu Ruby Core library when it'll be released.

Ruby Client supports somewhat similar to [JVM embedded][embedded] registry. 
It also can be constructed from `embedded` connection using path inside gems and JRuby jars (created using warbler) but it has few important differences with JVM embedded registry:

* It can accept absolute filesystem paths
* Paths are relative from ruby file where registry is initialized
* There's no way to automatically merge all embedded registries, each should be created explicitly

Our own's [bootstrap resolver][bootstrap-resolver] can be used as an example on how to use embedded regsitries in Ruby.

<h2 id="roadmap">4. Roadmap and lacking features</h2>

Our Scala client works as reference-implementation, which means it receives all features first, while other for implementations it could take some time to be delivered and we don't have strict parity in features so far.
It also means that very fresh Ruby Client has some inconsistencies in behavior, which will be eliminated in future releases.
Most significant inconsistency is lack of bounds in cache - Scala client uses LRU cache that drops all looked up entities after amount of schemas exceeds bounds specified using `cacheSize`.
This is not a case for Ruby Client, which grows its cache infinitely.

Also Ruby client doesn't support recently introduced `cacheTtl` proprty.

Although, `cacheSize` doesn't make any difference to Ruby resolver - it still must be present in configuration, because otherwise configuration is invalid.

<h2 id="help">5. Getting help</h2>

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[scala-client-repo]: https://github.com/snowplow/iglu-scala-client
[resolver-config]: https://github.com/snowplow/iglu/wiki/Iglu-client-configuration
[iglu-core]: https://github.com/snowplow/iglu/wiki/Iglu-core
[embedded]: https://github.com/snowplow/iglu/wiki/JVM-embedded-repo
[bootstrap-resolver]: https://github.com/snowplow/iglu-ruby-client/blob/release/0.1.0/lib/iglu-client/bootstrap.rb

[rubygems]: https://rubygems.org/
[jruby]: http://jruby.org/
[warbler]: https://github.com/jruby/warbler

[repo]: https://github.com/snowplow/iglu-ruby-client
[issues]: https://github.com/snowplow/snowplow/iglu-ruby-client/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
