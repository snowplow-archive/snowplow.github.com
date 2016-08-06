---
layout: post
title-short: Snowplow 82 Tawny Eagle
title: "Snowplow 82 Tawny Eagle released"
tags: [snowplow, kinesis, real-time]
author: Josh
category: Releases
---

We are happy to announce the release of Snowplow 82 Tawny Eagle! This release updates the Elasticsearch Sink with support for sending events via HTTP.

1. [Kinesis Elasticsearch Sink](/blog/2016/08/02/snowplow-r82-tawny-eagle-released#kes)
2. [Distribution changes](/blog/2016/08/02/snowplow-r82-tawny-eagle-released#distribution)
3. [Upgrading](/blog/2016/08/02/snowplow-r82-tawny-eagle-released#upgrading)
4. [Getting help](/blog/2016/08/02/snowplow-r82-tawny-eagle-released#help)

![tawny-eagle][tawny-eagle]

<!--more-->

<h2 id="kes">1. Kinesis Elasticsearch Sink</h2>

This release adds support for loading of an Elasticsearch cluster via a HTTP client.  This has the immediate benefit of being able to support the [Amazon Elasticsearch Service](https://aws.amazon.com/elasticsearch-service/) which only supports interaction over this API.

Under the covers we are using the excellent [Jest](https://github.com/searchbox-io/Jest) library to support the HTTP Client until such a time as Elasticsearch has an offical Java client for HTTP interaction; which should be included in version [5.0.0](https://github.com/elastic/elasticsearch/issues/7743).

This change should also, pending much more testing, allow us to support many more versions of Elasticsearch as the HTTP API tends to be much less opinionated than the Transport Client.  Preliminary testing has shown the sink working up to Elasticsearch version 2.3.4.  That being said the sink has only been tested in production (by us) on versions 1.4.x and 1.5.x; please let us know about any issues with versions out of this range!

You can also now control the logging level of the Elasticsearch Sink from the command line via a system property call of the form:

{% highlight bash %}
java -jar -Dorg.slf4j.simpleLogger.defaultLogLevel=warn snowplow-elasticsearch-sink-0.7.0 --config {{ config file path }}
{% endhighlight %}

Simply change `warn` to any of:

* `error`
* `warn`
* `info`
* `debug`
* `trace`

<h2 id="distribution">2. Distribution changes</h2>

As a step towards supporting [Docker formally][snowplow-docker] for our real-time applications we are now distributing the Kinesis applications into 3 distinct bintray packages:

* [Snowplow Stream Collector][bt-snowplow-scala-stream-collector]
* [Snowplow Stream Enrich][bt-snowplow-stream-stream]
* [Snowplow Kinesis Elasticsearch Sink][bt-snowplow-kinesis-elasticsearch-sink]

<h2 id="upgrading">3. Upgrading</h2>

The Kinesis apps for R82 Tawny Eagle are available in the following zips:

    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_stream_collector_0.7.0.zip
    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_stream_enrich_0.8.1.zip
    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_elasticsearch_sink_0.7.0.zip

Only the Elasticsearch Sink app has actually changed. The change does include breaking config changes, so you will need to make some minor changes to your configuration file. To upgrade the Elasticsearch Sink:

* Install the new Elasticsearch Sink app on each server in your Elasticsearch Sink auto-scaling group
* Update your Elasticsearch Sink config with the new `elasticsearch` section:
  - The only new fields are `elasticsearch.client.type` and `elasticsearch.client.port` the rest have been reorganised.
  - The old-new fields are listed below:
    - `elasticsearch.cluster-name` is now `elasticsearch.cluster.name`
    - `elasticsearch.endpoint` is now `elasticsearch.client.endpoint`
    - `elasticsearch.max-timeout` is now `elasticsearch.client.max-timeout`
    - `elasticsearch.index` is now `elasticsearch.cluster.index`
    - `elasticsearch.type` is now `elasticsearch.cluster.type`

{% highlight %}
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
    }

    cluster {
      name: "{{sinkElasticsearchClusterName}}"
      index: "{{sinkElasticsearchIndex}}"
      type: "{{sinkElasticsearchType}}"
    }
  }
  ...
}
{% endhighlight %}

* Update your supervisor process to point to the new Elasticsearch Sink app
* Restart the supervisor process on each server running Elasticsearch Sink

<h2 id="help">4. Getting help</h2>

For more details on this release, please check out the [release notes][snowplow-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[tawny-eagle]: /assets/img/blog/2016/08/tawny-eagle.jpg
[snowplow-release]: https://github.com/snowplow/snowplow/releases/r82-tawny-eagle

[snowplow-docker]: https://github.com/snowplow/docker-snowplow/issues

[bt-snowplow-scala-stream-collector]: https://bintray.com/snowplow/snowplow-generic/snowplow-scala-stream-collector
[bt-snowplow-stream-enrich]: https://bintray.com/snowplow/snowplow-generic/snowplow-stream-enrich
[bt-snowplow-kinesis-elasticsearch-sink]: https://bintray.com/snowplow/snowplow-generic/snowplow-kinesis-elasticsearch-sink

[issues]: https://github.com/snowplow/snowplow/issues/new
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
