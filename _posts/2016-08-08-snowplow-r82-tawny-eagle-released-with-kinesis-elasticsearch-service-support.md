---
layout: post
title-short: Snowplow 82 Tawny Eagle
title: "Snowplow 82 Tawny Eagle released with Kinesis Elasticsearch Service support"
tags: [snowplow, kinesis, real-time]
author: Josh
category: Releases
---

We are happy to announce the release of [Snowplow 82 Tawny Eagle] [snowplow-release]! This release updates the Kinesis Elasticsearch Sink with support for sending events via HTTP, allowing us to now support [Amazon Elasticsearch Service] [amazon-es-service].

1. [Kinesis Elasticsearch Sink](/blog/2016/08/08/snowplow-r82-tawny-eagle-released-with-kinesis-elasticsearch-service-support#kes)
2. [Distribution changes](/blog/2016/08/08/snowplow-r82-tawny-eagle-released-with-kinesis-elasticsearch-service-support#distribution)
3. [Upgrading](/blog/2016/08/08/snowplow-r82-tawny-eagle-released-with-kinesis-elasticsearch-service-support#upgrading)
4. [Getting help](/blog/2016/08/08/snowplow-r82-tawny-eagle-released-with-kinesis-elasticsearch-service-support#help)

![tawny-eagle][tawny-eagle]

<!--more-->

<h2 id="kes">1. Kinesis Elasticsearch Sink</h2>

This release adds support to the Kinesis pipeline for loading of an Elasticsearch cluster over HTTP. This allows Snowplow to now load [Amazon Elasticsearch Service] [amazon-es-service], which only supports interaction over this API. (The Snowplow batch pipeline already supports loading of Elasticsearch Service for bad rows.)

Under the covers we are using the excellent [Jest] [jest] library as our HTTP client until such time as Elasticsearch has an offical Java client for HTTP; this should be included in Elasticsearch 5.0.0 [per this ticket] [java-client-for-es].

This change should also, pending more testing, allow us to support more versions of Elasticsearch, because the HTTP API is much less opinionated than the Transport Client. Preliminary non-production testing has shown the Kinesis Elasticsearch Sink working up to Elasticsearch version 2.3.4. However, the sink has only been used extensively in production by us on versions 1.4.x and 1.5.x, so please let us know about any issues with versions out of this range.

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

As a step towards supporting [Docker formally][snowplow-docker] for our real-time applications we are now distributing the Kinesis applications as 3 distinct Bintray packages:

* [Snowplow Scala Stream Collector][bt-snowplow-scala-stream-collector]
* [Snowplow Stream Enrich][bt-snowplow-stream-enrich]
* [Snowplow Kinesis Elasticsearch Sink][bt-snowplow-kinesis-elasticsearch-sink]

We continue to make a "meta-distribution" of all three apps available in the [Snowplow] [bt-snowplow] package in Bintray.

<h2 id="upgrading">3. Upgrading</h2>

The Kinesis apps for R82 Tawny Eagle are available in the following zipfiles:

    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_stream_collector_0.7.0.zip
    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_stream_enrich_0.8.1.zip
    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_elasticsearch_sink_0.7.0.zip

Or you can download all of the apps together in this zipfile:

    https://dl.bintray.com/snowplow/snowplow-generic/snowplow_kinesis_r82_tawny_eagle.zip

Only the Elasticsearch Sink app has actually changed. The change does include breaking config changes, so you will need to make some minor changes to your configuration file. To upgrade the Elasticsearch Sink:

* Install the new Elasticsearch Sink app on each server in your Elasticsearch Sink auto-scaling group
* Update your Elasticsearch Sink config with the new `elasticsearch` section:
  - The only new fields are `elasticsearch.client.type` and `elasticsearch.client.port`
  - The following fields have been renamed:
    - `elasticsearch.cluster-name` is now `elasticsearch.cluster.name`
    - `elasticsearch.endpoint` is now `elasticsearch.client.endpoint`
    - `elasticsearch.max-timeout` is now `elasticsearch.client.max-timeout`
    - `elasticsearch.index` is now `elasticsearch.cluster.index`
    - `elasticsearch.type` is now `elasticsearch.cluster.type`

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

Then:

* Update your supervisor process to point to the new Kinesis Elasticsearch Sink app
* Restart the supervisor process on each server running the sink

<h2 id="help">4. Getting help</h2>

For more details on this release, please check out the [release notes][snowplow-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[tawny-eagle]: /assets/img/blog/2016/08/tawny-eagle.jpg
[snowplow-release]: https://github.com/snowplow/snowplow/releases/r82-tawny-eagle

[snowplow-docker]: https://github.com/snowplow/docker-snowplow/issues

[amazon-es-service]: https://aws.amazon.com/elasticsearch-service/
[jest]: https://github.com/searchbox-io/Jest
[java-client-for-es]: https://github.com/elastic/elasticsearch/issues/7743

[bt-snowplow]: https://bintray.com/snowplow/snowplow-generic/snowplow
[bt-snowplow-scala-stream-collector]: https://bintray.com/snowplow/snowplow-generic/snowplow-scala-stream-collector
[bt-snowplow-stream-enrich]: https://bintray.com/snowplow/snowplow-generic/snowplow-stream-enrich
[bt-snowplow-kinesis-elasticsearch-sink]: https://bintray.com/snowplow/snowplow-generic/snowplow-kinesis-elasticsearch-sink

[issues]: https://github.com/snowplow/snowplow/issues/new
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
