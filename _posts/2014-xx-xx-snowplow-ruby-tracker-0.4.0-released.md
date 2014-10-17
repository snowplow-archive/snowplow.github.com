---
layout: post
shortenedlink: Snowplow Ruby Tracker 0.4.0 released
title: Snowplow Ruby Tracker 0.4.0 released
tags: [snowplow, analytics, ruby, rails, tracker]
author: Fred
category: Releases
---

We are pleased to announce the release of version 0.4.0 of the Snowplow Ruby Tracker. This release adds several methods to help identify users, one of which can be used to send the user ID to a collector as a cookie.

The rest of this post will cover:

1. [`set_domain_user_id`](/blog/2014/xx/xx/snowplow-ruby-tracker-0.4.0-released/#duid)
2. 

1. [The Subject class](/blog/2014/08/29/snowplow-ruby-tracker-0.3.0-released/#subject)
2. [The Emitter class](/blog/2014/08/29/snowplow-ruby-tracker-0.3.0-released/#emitter)
3. [Chainable methods](/blog/2014/08/29/snowplow-ruby-tracker-0.3.0-released/#chainable-methods)
4. [Logging](/blog/2014/08/29/snowplow-ruby-tracker-0.3.0-released/#logging)
5. [Contracts](/blog/2014/08/29/snowplow-ruby-tracker-0.3.0-released/#contracts)
6. [Other changes](/blog/2014/08/29/snowplow-ruby-tracker-0.3.0-released/#changes)
7. [Upgrading](/blog/2014/08/29/snowplow-ruby-tracker-0.3.0-released/#upgrading)
8. [Getting help](/blog/2014/08/29/snowplow-ruby-tracker-0.3.0-released/#help)

<!--more-->

<h2><a name="ip">1. `set_ip_address`</a></h2>

The `ip_address` field in the Snowplow event model is used to look up information about a user's geographical location (among other things - see our [scala-maxmind-iplookups][iplookups] project for more detail). If you have access to a user's IP address, you can add it to all events concerning that user with the `set_ip_address` method:

```python
subject.set_ip_address("37.157.33.93")
```

<h2><a name="ua">2. `set_useragent`</a></h2>

The `useragent` field contains information (sometimes called the "browser string") about the user's browser. You can set this field with the `set_useragent` method:

```python
subject.set_useragent(""Mozilla/5.0 (Windows NT 5.1; rv:23.0) Gecko/20100101 Firefox/23.0"")
```

<h2><a name="duid">3. `set_domain_user_id`</a></h2>

The `domain_userid` field in the Snowplow event model refers to the user ID set by the [Snowplow JavaScript Tracker][js-tracker] and stored in the [ID cookie][id-cookie]. If you extract that ID, you can use the `set_domain_user_id` method to associate a subject with it:

```python
subject.set_domain_user_id("c7aadf5c60a5dff9")
```

This is useful if you are tracking events both server-side and client-side and wish to know when they concern the same user.

<h2><a name="nuid">4. `set_network_user_id`</a></h2>

The `network_userid` field is a user ID set by the [Snowplow Clojure Collector][clojure-collector] via a third party cookie. Similarly to the `set_domain_user_id` method, the `set_network_user_id` lets you associate a subject with a network user ID:

```python
subject.set_network_user_id("ecdff4d0-9175-40ac-a8bb-325c49733607")
```

<h2><a name="upgrading">7. Upgrading</a></h2>


<h2><a name="help">8. Getting help</a></h2>

Useful links:

* The [wiki page][wiki]
* The [Github repository][repo]
* The [0.4.0 release notes][tracker-040]

If you have an idea for a new feature or want help getting things set up, please [get in touch] [talk-to-us]. This is only the second release of the Ruby Tracker, so we're keen to hear people's opinions. And [raise an issue] [issues] if you spot any bugs!

[js-tracker]: https://github.com/snowplow/snowplow-javascript-tracker
[id-cookie]: https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#the-id-cookie
[iplookups]: https://github.com/snowplow/scala-maxmind-iplookups
[clojure-collector]: https://github.com/snowplow/snowplow/tree/master/2-collectors/clojure-collector

[repo]: https://github.com/snowplow/snowplow-ruby-tracker
[wiki]: https://github.com/snowplow/snowplow/wiki/Ruby-Tracker
[setup]: https://github.com/snowplow/snowplow/wiki/Ruby-tracker-setup
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow-ruby-tracker/issues

[37]: https://github.com/snowplow/snowplow-ruby-tracker/issues/37
[38]: https://github.com/snowplow/snowplow-ruby-tracker/issues/38

[tracker-030]: https://github.com/snowplow/snowplow-ruby-tracker/releases/tag/0.4.0
