---
layout: post
title-short: "Snowplow 84 Steller's Sea Eagle"
title: "Snowplow 84 Steller's Sea Eagle released with Elasticsearch 2.x support"
tags: [snowplow, kinesis, real-time, elasticsearch]
author: Josh
category: Releases
---

We are pleased to announce the release of [Snowplow 84 Steller's Sea Eagle] [snowplow-release]. This release brings support for Elasticsearch 2.x to the Kinesis Elasticsearch Sink for both Transport and HTTP clients.

1. [Elasticsearch 2.x support](/blog/2016/10/08/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#elasticsearch-2-x)
2. [Elasticsearch Sink buffer](/blog/2016/10/08/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#sink-buffer)
3. [Override the network_id cookie with nuid param](/blog/2016/10/08/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#nuid-cookie)
4. [Hardcoded cookie path](/blog/2016/10/08/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#cookie-path)
5. [Migrating Redshift assets to Iglu Central](/blog/2016/10/08/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#iglu-central)
6. [Other changes](/blog/2016/10/08/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#other)
7. [Upgrading](/blog/2016/10/08/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#upgrading)
8. [Roadmap](/blog/2016/10/08/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#roadmap)
9. [Getting help](/blog/2016/10/08/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#help)

![stellers-sea-eagle] [stellers-sea-eagle]

<!--more-->

<h2 id="elasticsearch-2-x">1. Elasticsearch 2.x support</h2>

This release brings full support for Elasticsearch 2.x for both the HTTP and Transport clients. This lets you use the AWS Elasticsearch Service running ES 2.3, or indeed upgrade your self-hosted Elasticsearch cluster to version 2.x.

We delivered this by dynamically building a Kinesis Elasticsearch Sink binary for both Elasticsearch versions - you'll choose the binary appended by `_1x` or `_2x` as appropriate.

One important thing to flag is that Elasticsearch 2.x no longer allows field names to contain periods (`.`). While we never used periods within Snowplow or Iglu Central property names, your team may have created some, like so:

{% highlight json %}
{
  "schema": "iglu:com.acme/event/jsonschema/1-0-0",
  "data": {
    "field.with.dots": "value"
  }
}
{% endhighlight %}

Previously, this would have loaded into Elasticsearch like so:

{% highlight javascript %}
> com_acme_event_1: [{"field.with.dots": value}]
{% endhighlight %}

From this release on, we are automatically converting the field name's periods to underscores, whether you are loading Elasticsearch 1.x or 2.x:

{% highlight javascript %}
> com_acme_event_1: [{"field_with_dots": value}]
{% endhighlight %}

For more information please see [issue #2894] [2894].

<h2 id="sink-buffer">2. Elasticsearch Sink buffer</h2>

Community member [Stephane Maarek] [simplesteph] flagged to us that our Kinesis Elasticsearch Sink's buffer settings did not seem to be working correctly.

We investigated and found an underlying issue in the Kinesis Connectors library, where every record in a `GetRecords` call is added to the buffer for sinking, without checking between additions whether or not the buffer should be flushed.

In the case that your Elasticsearch Sink has to catch up with a very large number of records, and your `maxRecords` setting is set to 10,000, this can leave the sink struggling to emit to Elasticsearch, because the buffer will be too large to send reliably.

To work around this issue, we updated our Elasticsearch Emitter code to also respect the buffer settings. The new approach works as follows:

* The Emitter receives a buffer of events from the Kinesis stream (up to 10,000)
* This buffer is split based on your `record` and `byte` buffer settings
* Each slice of the buffer is sent in succession
* Once all slices are processed the application checkpoints

It is important that you tune your record and byte limits to match the cluster you are pushing events to. If the limits are set too high you might not be able to emit successfully very often; if your limits are too low then your event sinking to Elasticsearch will be inefficient.

For more information on this issue and the corresponding commit please see [issue #2895] [2895].

<h2 id="nuid-cookie">3. Override the network_id cookie with nuid param</h2>

This release adds the ability to update your Scala Stream Collector's cookie's value with the `nuid` a.k.a. `network_userid` parameter.  If a `nuid` value is available within the querystring of your request, this value will then be used to update the cookie's value.  

This feature is only available through a querystring parameter lookup, so only works for `GET` requests at the present.

Many thanks to [Christoph Buente] [christoph-buente] from Snowplow user [LiveIntent] [live-intent] for this contribution!

For more information and the reasoning behind this update please see [issue #2512] [2512].

<h2 id="other">4. Hardcoded cookie path</h2>

To ensure that the cookie path is always valid we have updated the Scala Stream Collector to statically set the cookie path to "/".  This is to avoid situations where a path resource such as "/r/tp2" results in the cookie path ending up at "/r". Endpoints such as "/i" do not suffer from this issue.

Thanks again to [Christoph Buente] [christoph-buente] for this contribution!

For more information on this please see issue [#2524] [2524].

<h2 id="iglu-central">5. Migrating Redshift assets to Iglu Central</h2>

An Iglu schema registry typically consists of schemas, Redshift table definitions and JSON Paths files - see our [Iglu example schema registry] [iglu-eg-schema-registry] for an example.

When we originally started building out [Iglu Central] [iglu-central], we diverted from this approach and stored the Redshift table definitions and JSON Paths files for Iglu Central schemas in the main Snowplow repository, [snowplow/snowplow] [snowplow-snowplow]. You'll see from the [Snowplow CHANGELOG] [snowplow-changelog] that many Snowplow releases have included Redshift and JSON Paths files, to complement specific schemas in new Iglu Central releases.

In hindsight, splitting the Iglu Central resources across two separate code repositories was a mistake:

* It made it harder to cross-check a JSON Schema with its associated Redshift artifacts
* It meant that the full release of a new schema in Iglu Central has to wait on a (often unrelated) Snowplow release
* It was a blocker on our plans to integrate table definitions and data mapping files (like JSON Paths) more closely into Iglu schema registries

Therefore, in this release we have moved all Redshift table definitions and JSON Paths files from the main Snowplow repository into Iglu Central, specifically in these paths:

* [iglu-central/sql] [iglu-central-redshift-ddl]
* [iglu-central/jsonpaths] [iglu-central-json-paths]

Our hosting of these files for the correct operation of Snowplow is unchanged, and the Snowpow repository continues to hold current and previous definitions of the `atomic.events` table, plus corresponding migration scripts.

<h2 id="changes">6. Other changes</h2>

This release also contains further changes, notably:

* Allowing the HTTP client timeouts for the Kinesis Elasticsearch Sink to be configured from the HOCON configuration file ([issue #2897] [2897])
* Adding environment variable resolution to the Scala Stream Collector, Stream Enrich and the Kinesis Elasticsearch Sink through `Config.resolver()`. Many thanks to community member [Shin] [shin-nien] for contributing this
* Upgrading Stream Enrich to the latest version of Scala Common Enrich to make available all of the new features and latest bug fixes

<h2 id="upgrading">7. Upgrading</h2>

The Kinesis apps for R84 Stellers Sea Eagle are available in the following zipfiles:

    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_scala_stream_collector_0.8.0.zip
    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_stream_enrich_0.9.0.zip
    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_kinesis_elasticsearch_sink_0.8.0_1x.zip
    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_kinesis_elasticsearch_sink_0.8.0_2x.zip

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

<h2 id="roadmap">8. Roadmap</h2>

We have renamed the upcoming milestones for Snowplow to be more flexible around the ultimate sequencing of releases. Upcoming Snowplow releases, in no particular order, include:

* [R8x [HAD] 4 webhooks] [r8x-webhooks], which will add support for 4 new webhooks: Mailgun, Olark, Unbounce, StatusGator
* [R8x [HAD] Synthetic dedupe] [r8x-dedupe], which will deduplicate events with the same `event_id` but different `event_fingerprint`s (synthetic duplicates) in Hadoop Shred

Note that these releases are always subject to change between now and the actual release date.

<h2 id="help">9. Getting help</h2>

For more details on this release, please check out the [release notes] [snowplow-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

[stellers-sea-eagle]: /assets/img/blog/2016/10/stellers-sea-eagle.jpg
[snowplow-release]: https://github.com/snowplow/snowplow/releases/r84-stellers-sea-eagle

[simplesteph]: https://github.com/simplesteph
[christoph-buente]: https://github.com/christoph-buente
[live-intent]: https://liveintent.com/

[2512]: https://github.com/snowplow/snowplow/issues/2512
[2524]: https://github.com/snowplow/snowplow/issues/2524
[2894]: https://github.com/snowplow/snowplow/issues/2894
[2895]: https://github.com/snowplow/snowplow/issues/2895
[2897]: https://github.com/snowplow/snowplow/issues/2897

[snowplow-snowplow]: https://github.com/snowplow/snowplow
[iglu-central]: https://github.com/snowplow/iglu-central
[iglu-eg-schema-registry]: https://github.com/snowplow/iglu-example-schema-registry
[snowplow-changelog]: https://github.com/snowplow/snowplow/blob/master/CHANGELOG

[iglu-central-redshift-ddl]: https://github.com/snowplow/iglu-central/tree/master/sql
[iglu-central-json-paths]: https://github.com/snowplow/iglu-central/tree/master/jsonpaths

[shin-nien]: https://github.com/shin-nien

[r8x-webhooks]: https://github.com/snowplow/snowplow/milestone/129
[r8x-dedupe]: https://github.com/snowplow/snowplow/milestone/132

[issues]: https://github.com/snowplow/snowplow/issues/new
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
