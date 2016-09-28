---
layout: post
title-short: Snowplow 84 Stellers Sea Eagle
title: "Snowplow 84 Stellers Sea Eagle released with Elasticsearch 2.x support"
tags: [snowplow, kinesis, real-time, elasticsearch]
author: Josh
category: Releases
---

We are pleased to announce the release of [Snowplow 84 Stellers Sea Eagle] [snowplow-release]. This release brings support for Elasticsearch 2.x to the Kinesis Elasticsearch Sink for both Transport and HTTP clients.

1. [Elasticsearch 2.x support](/blog/2016/09/28/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#elasticsearch-2-x)
2. [Elasticsearch Sink buffer](/blog/2016/09/28/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#sink-buffer)
3. [Override the network_id cookie with nuid param](/blog/2016/09/28/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#nuid-cookie)
4. [Hardcoded cookie path](/blog/2016/09/28/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#cookie-path)
5. [Other changes](/blog/2016/09/28/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#other)
6. [Upgrading](/blog/2016/09/28/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#upgrading)
7. [Roadmap](/blog/2016/09/28/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#roadmap)
8. [Getting help](/blog/2016/09/28/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#help)

![stellers-sea-eagle][stellers-sea-eagle]

<!--more-->

<h2 id="elasticsearch-2-x">1. Elasticsearch 2.x support</h2>

This release brings full support for Elasticsearch 2.x for both the HTTP and Transport clients.  This will allow you to take advantage of the AWS Elasticsearch Service running ES 2.3 as well as being able to update your own clusters to take advantage of all the latests features Elasticsearch has to offer - along with being able to use the latest Kibana.

This is being supported by dynamically building a binary for each version, simply use the one appended by `_1x` or `_2x` for the level you wish to use.

The upgrade process should be fairly painless, however there is one change that could cause issues during migration - which is that field names cannot contain dots any longer.  The core Snowplow field names and shredded selfdescribing events events have always abided by this rule throughout our 1.x support - however it was possible that if a fieldname within your event data JSON contained dots this was loaded as is.

To illustrate consider the following SelfDescribingJson:

{% highlight json %}
{
  "schema": "iglu:com.acme/event/jsonschema/1-0-0",
  "data": {
    "field.with.dots": "value"
  }
}
{% endhighlight %}

This would be loaded into Elasticsearch like so:

> com_acme_event_1: [{"field.with.dots": value}]

Elasticsearch 2.x requires it as follows:

> com_acme_event_1: [{"field_with_dots": value}]

This should be quite a rare scenario as it is quite uncommon to include dots within fieldnames.  For more information ([#2894][2894]).

__NOTE__: From this release onwards these fieldnames will be automatically converted to use underscores in place of dots for both 1.x and 2.x.

<h2 id="sink-buffer">2. Elasticsearch Sink buffer</h2>

Thanks to community member [Stephane Maarek][simplesteph] we realised that the buffer settings were not being correctly applied to the outbound queue of the Elasticsearch Emitter.  

This has now been patched so that the `record` and `byte` limits are adherred to for the emission of events to the cluster - the `time` limit is ignored however.  This is to avoid a situation where we build yet another in-memory queue but more importantly to avoid a situation where we checkpoint (acknowledge that the event has been sent along) before we actually send it.  If we were to checkpoint greedily and the application were to crash we would lose the events!

The new buffer settings work as follows:

* The Emitter receives a buffer of events from the Kinesis
* This buffer is split based on your buffer settings
* Each slice of the buffer is sent in succession
* Once all slices are processed the application checkpoints

It is important that you tune your record and byte limits to match the cluster you are pushing events to.  If the limits are set too high you might not be able to emit successfully very often but if your limits are too low then your event emission is very inefficient.

For more information on this bug and the corresponding commit ([#2895][2895]).

<h2 id="other">3. Override the network_id cookie with nuid param</h2>

This release adds the ability to update your collector cookies value with the `nuid` or `network_user_id` parameter.  If a `nuid` value is available within the querystring of your request this value will then be used to update the cookies value.  

This feature is only available through a querystring parameter lookup so will only work for GET requests at the present.

__NOTE__: This is not a configurable feature and cannot be turned off.

Many thanks to [Christoph Buente][christoph-buente] from [LiveIntent][live-intent] for this contribution!

For more information and the reasoning behind this update ([#2512][2512]).

<h2 id="other">4. Hardcoded cookie path</h2>

To ensure that the cookie path is always valid we have updated the Tracker to statically set the cookie path to "/".  This is to avoid situations where a path resource such as "/r/tp2" results in the cookie path ending up at "/r".  Endpoints such as "/i" do not suffer from this issue.

Thanks again to [Christoph Buente][christoph-buente] for this contribution!

For more information please see ([#2524][2524]).

<h2 id="changes">5. Other changes</h2>

This release also contains further changes such as:

* Allowing the HTTP client timeouts for the Kinesis Elasticsearch Sink to be configured from the HOCON ([#2897][2897])
* Adding environment variable resolution to the Scala Stream Collector, Stream Enrich and the Kinesis Elasticsearch Sink through `Config.resolver()`
* Upgrading Stream Enrich to the latest version of Scala Common Enrich to ensure all the latest updates are available for batch and real-time

<h2 id="upgrading">6. Upgrading</h2>

The Kinesis apps for R84 Stellers Sea Eagle are available in the following zipfiles:

    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_stream_collector_0.8.0.zip
    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_stream_enrich_0.9.0.zip
    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_elasticsearch_sink_0.8.0.zip

Or you can download all of the apps together in this zipfile:

    https://dl.bintray.com/snowplow/snowplow-generic/snowplow_kinesis_r84_stellers_sea_eagle.zip

Only the Elasticsearch Sink app config has changed. The change does **not** include breaking config changes. To upgrade the Elasticsearch Sink:

* Install the new Elasticsearch Sink app on each server in your Elasticsearch Sink auto-scaling group
* Update your Elasticsearch Sink config with the new `elasticsearch.client.http` section:
  - `elasticsearch.client.http.conn-timeout`
  - `elasticsearch.client.http.read-timeout`

__NOTE__: These timeouts are optional and will default to 300000 if they cannot be found in your Config.

Here is the updated config file template:

{% highlight json %}
sink {
  ...
  elasticsearch {

    # Events are indexed using an Elasticsearch Client
    # - type: http or transport (will default to transport)
    # - endpoint: the cluster endpoint
    # - port: the port the cluster can be accessed on
    #   - for http this is usually 9200
    #   - for transport this is usually 9300
    # - max-timeout: the maximum attempt time before a client restart
    client {
      type: "{{sinkElasticseachClient}}"
      endpoint: "{{sinkElasticsearchEndpoint}}"
      port: {{sinkElasticsearchTransportPort}}
      max-timeout: "{{sinkElasticsearchMaxTimeout}}"

      # Section for configuring the HTTP client
      http {
        conn-timeout: "{{sinkElasticsearchClientHttpConnTimeout}}"
        read-timeout: "{{sinkElasticsearchClientHttpReadTimeout}}"
      }
    }
  ...
}
{% endhighlight %}

Then:

* Update your supervisor process to point to the new Kinesis Elasticsearch Sink app
* Restart the supervisor process on each server running the sink

<h2 id="roadmap">7. Roadmap</h2>

We have renamed the upcoming milestones for Snowplow to be more flexible around the ultimate sequencing of releases. Upcoming Snowplow releases, in no particular order, include:

* [R8x [HAD] 4 webhooks] [r8x-webhooks], which will add support for 4 new webhooks (Mailgun, Olark, Unbounce, StatusGator)
* [R8x [HAD] Spark data modeling] [r8x-spark], which will allow arbitrary Spark jobs to be added to the EMR jobflow to perform data modeling prior to (or instead of) Redshift
* [R8x [HAD] Synthetic dedupe] [r8x-dedupe], which will deduplicate event_ids with different event_fingerprints (synthetic duplicates) in Hadoop Shred

Note that these releases are always subject to change between now and the actual release date.

<h2 id="help">8. Getting help</h2>

For more details on this release, please check out the [release notes] [snowplow-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

[stellers-sea-eagle]: /assets/img/blog/2016/09/stellers-sea-eagle.png
[snowplow-release]: https://github.com/snowplow/snowplow/releases/r84-stellers-sea-eagle

[simplesteph]: https://github.com/simplesteph
[christoph-buente]: https://github.com/christoph-buente
[live-intent]: https://liveintent.com/

[2512]: https://github.com/snowplow/snowplow/issues/2512
[2524]: https://github.com/snowplow/snowplow/issues/2524
[2894]: https://github.com/snowplow/snowplow/issues/2894
[2895]: https://github.com/snowplow/snowplow/issues/2895
[2897]: https://github.com/snowplow/snowplow/issues/2897

[r8x-webhooks]: https://github.com/snowplow/snowplow/milestone/129
[r8x-spark]: https://github.com/snowplow/snowplow/milestone/127
[r8x-dedupe]: https://github.com/snowplow/snowplow/milestone/132

[issues]: https://github.com/snowplow/snowplow/issues/new
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
