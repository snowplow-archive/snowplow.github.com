---
layout: post
title: Snowplow 0.9.12 released with real-time loading of data into Elasticsearch beta
title-short: Snowplow 0.9.12
tags: [snowplow, kinesis, real-time]
author: Fred
category: Releases
---

Back in February, we introduced initial support for real-time event analytics using [Amazon Kinesis][kinesis]. We are excited to announce the release of Snowplow 0.9.12 which significantly improves and extends our Kinesis support. The major new feature is our all new Kinesis Elasticsearch Sink, which streams event data from Kinesis into [Elasticsearch][elasticsearch] in real-time. The data is then available to power real-time dashboards and analysis (e.g. using [Kibana][kibana]).

![kibana-screenshot-1](/assets/img/blog/2014/11/kibana-screenshot-1.png)

In addition to enabling real-time loading of data into Elasticsearch, we have made a number of other improvements to the real-time flow:

1. Bad rows of data are now loaded into a dedicated bad rows stream in Kinesis
2. The real-time flow now runs the latest version of Scala Common Enrich, making it possible to employ the same configurable enrichments in the real-time flow that are currently available in the batch flow.

This release also makes some improvements to Snowplow Common Enrich and Hadoop Enrich which should be invaluable for users of our batch-based event pipeline. Sections below the fold are as follows:

1. [Snowplow Elasticsearch Sink](/blog/2014/11/26/snowplow-0.9.12-released-with-real-time-load-into-elasticsearch-beta/#elasticsearch)
2. [Bad rows stream](/blog/2014/11/26/snowplow-0.9.12-released-with-real-time-load-into-elasticsearch-beta/#bad)
3. [Support for the latest version of Scala Common Enrich](/blog/2014/11/26/snowplow-0.9.12-released-with-real-time-load-into-elasticsearch-beta/#sce)
4. [Phil Kallos' contributions](/blog/2014/11/26/snowplow-0.9.12-released-with-real-time-load-into-elasticsearch-beta/#pkallos)
5. [Configuring AWS credentials](/blog/2014/11/26/snowplow-0.9.12-released-with-real-time-load-into-elasticsearch-beta/#credentials)
6. [Configurable Kinesis endpoint](/blog/2014/11/26/snowplow-0.9.12-released-with-real-time-load-into-elasticsearch-beta/#endpoint)
7. [HTTP request character limit override](/blog/2014/11/26/snowplow-0.9.12-released-with-real-time-load-into-elasticsearch-beta/#character-limit)
8. [For Hadoop Enrich users: support for tnuid](/blog/2014/11/26/snowplow-0.9.12-released-with-real-time-load-into-elasticsearch-beta/#tnuid)
9. [For Hadoop Enrich users: more relaxed URI parsing](/blog/2014/11/26/snowplow-0.9.12-released-with-real-time-load-into-elasticsearch-beta/#netaporter)
10. [Upgrading](/blog/2014/11/26/snowplow-0.9.12-released-with-real-time-load-into-elasticsearch-beta/#upgrading)
11. [Roadmap and contributing](/blog/2014/11/26/snowplow-0.9.12-released-with-real-time-load-into-elasticsearch-beta/#roadmap-etc)
12. [Getting help](/blog/2014/11/26/snowplow-0.9.12-released-with-real-time-load-into-elasticsearch-beta/#help)

<!--more-->

<h2><a name="elasticsearch">1. Snowplow Elasticsearch Sink</a></h2>

We are hugely excited to be able to load Snowplow data, in real-time, into Elasticsearch. Elasticsearch is a very powerful database for enabling real-time reporting and dashboarding - we've started to explore and visualize Snowplow data in it using Kibana and have been impressed with the results.

![kibana-screenshot-2](/assets/img/blog/2014/11/kibana-screenshot-2.png)

We plan to blog in more detail on performing analyses and building visualization in Elasticsearch and Kibana in the near future.

Under the hood, the new Snowplow Elasticsearch Sink reads events from a Kinesis stream, transforms them into JSON, and writes them to an [Elasticsearch][elasticsearch] cluster in real-time. It can be configured to read from either a stream of successfully enriched Snowplow events or the new bad rows stream. The sink uses the [Amazon Kinesis Connector Library][akcl].

The overall architecture now looks like this:

![architecture](/assets/img/blog/2014/11/kinesis-elasticsearch-release.png)

If the sink cannot convert an event to JSON or the JSON is rejected by Elasticsearch, the failed event will be written to a Kinesis bad rows stream along with a message explaining what went wrong.

The jar is available from Snowplow Hosted Assets as [snowplow-elasticsearch-sink-0.1.0] [es-sink-asset].

A sample configuration file can be found in our GitHub as [application.conf.example] [es-sink-config].

For more information about the Snowplow Elasticsearch Sink, see these wiki pages:

* [Setup guide][elasticsearch-setup]
* [Technical documentation][elasticsearch-techdocs]

<h2><a name="bad">2. Bad rows stream</a></h2>

The Kinesis-based enrichment process now outputs bad rows to a separate stream. If you are using "local mode", the separate stream will be `stderr`; otherwise it will be a Kinesis stream specified in the configuration file.

Bad rows are converted to JSONs with a "line" field and an "errors" field. The "line" field contains the incoming serialized Thrift byte array which failed enrichment, Base64-encoded. The "errors" field is an array of error messages explaining what was wrong with the input.

<h2><a name="sce">3. Support for the latest version of Scala Common Enrich</a></h2>

Scala Kinesis Enrich now uses the latest version of Scala Common Enrich, the library shared by Scala Hadoop Enrich and Scala Kinesis Enrich. This means that it supports [configurable enrichments][configurable-enrichments]. You can use the -enrichments command line option to pass a directory of enrichment configuration JSONs like this:

{% highlight bash %}
$ ./scala-kinesis-enrich-0.2.0 -config my.conf -enrichments path/to/enrichment-directory
{% endhighlight %}

The enrichments directory replaces the "anon_ip" and "geo_ip" fields in the config file. Instead, create anon_ip.json and ip_lookups.json configuration JSONs in the enrichments directory.

Sensible defaults for all available enrichments can be found [here][enrichments-example].

The Scala Kinesis Enrich [HOCON] [hocon] configuration file now requires a "resolver" field which is used to configure the [Iglu][iglu] Resolver used to validate the enrichment configuration JSONs.

As part of this update, we have also fixed the bug whereby Kinesis Enrich opened a MaxMind database file every time an event is enriched (!).

<h2><a name="pkallos">4. Phil Kallos' contributions</a></h2>

We are hugely indebted to community member Phil Kallos ([@pkallos] [pkallos]) who contributed several key improvements to the Kinesis flow:

* Improved performance for the Scala Stream Collector through concurrency
* The ability to run the enrichment process without needing permission for the kinesis:ListStreams action
* The ability to configure the AWS access key and secret key from Scalazon's `CredentialsProvider.InstanceProfile` object by setting the access-key and secret-key configuration fields to "iam"

And there are more pull requests from Phil to be merged into future Kinesis releases too. Big thanks Phil!

<h2><a name="credentials">5. Configuring AWS credentials</a></h2>

In addition to Phil's contribution on AWS credentials, this release adds another way to configure the AWS credentials required to use Amazon Kinesis. If you replace the access-key and secret-key values in the HOCON configuration with "env", they will be set from the environment variables "AWS_ACCESS_KEY_ID" and "AWS_SECRET_ACCESS_KEY".

This is useful if you want to keep your credentials out of GitHub.

<h2><a name="maxmind">6. Configurable Kinesis endpoint</a></h2>

Huge thanks to Sam Mason ([@sambo1972] [sambo1972]) who contributed the ability to configure the Kinesis endpoint. In the "streams" section of the configuration HOCON, add the intended endpoint like so:

{% highlight json %}
streams {
	...
	region: "ap-southeast-2"
}
{% endhighlight %}

The same goes for the "stream" section of the Scala Stream Collector's HOCON configuration file.

<h2><a name="character-limit">7. HTTP request character limit override</a></h2>

Community member Yuval Herziger ([@yuvalherziger] [yuvalherziger]) noticed that version 0.1.0 of the Scala Stream Collector only accepted requests of up to 2048 characters. He discovered how to override this restriction by configuring [spray-can][spray-can] (the HTTP server which the collector uses) and his fix has been incorporated into the default configuration files. Thanks Yuval!

<h2><a name="tnuid">8. For Hadoop Enrich users: support for tnuid</a></h2>

Version 0.9.0 of Scala Common Enrich allows you extract the `network_userid` field from the querystring of a GET request or body of a POST request rather than using a header.

If you have access to the network user ID cookie set by the [Clojure Collector][clojure-collector], you can now add it to events tracked server-side to match up server-side and client-side events generated by the same user.

<h2><a name="netaporter">9. For Hadoop Enrich users: more relaxed URI parsing</a></h2>

Big thanks to Rupesh Mane ([@rupeshmane] [rupeshmane]), who used the [Net-a-Porter][netaporter] URI parsing library to make the enrichment process more forgiving of non-compliant URIs. Many URIs which would previously fail with an error, for example due to containing illegal characters such as `|`, can now be parsed.

This should significantly reduce the number of events which end up in the bad rows bucket due to malformed page or referer URIs.

<h2><a name="upgrading">10. Upgrading</a></h2>

<div class="html">
<h3><a name="upgrading-kinesis">10.1 For the Kinesis pipeline</a></h3>
</div>

There are several changes you need to make to move to the new versions of the Scala Stream Collector and Scala Kinesis Enrich:

* You must provide a "region" field (with a value like "us-east-1") in the configuration files
* You must provide a "resolver" field in the Scala Kinesis Enrich containing the data used to configure the Iglu resolver
* If you run Scala Kinesis Enrich without the -enrichments option, the IP anonymization enrichment and the IP address lookup enrichment will **not** run automatically

New templates for the two configuration files can be found on GitHub (you will need to edit the AWS credentials and the stream names):

* [Scala Stream Collector configuration][ssc-conf]
* [Scala Kinesis Enrich configuration][ske-conf]

And a sample enrichment directory containing sensible configuration JSONs can be found [here][enrichments-example].

<div class="html">
<h3><a name="upgrading-hadoop">10.2 For the Hadoop pipeline</a></h3>
</div>

This release bumps the Hadoop Enrichment process to version **0.10.0**.

In your EmrEtlRunner's `config.yml` file, update your Hadoop enrich job's version to 0.10.0, like so:

{% highlight yaml %}
  :versions:
    :hadoop_enrich: 0.10.0 # WAS 0.9.0
{% endhighlight %}

For a complete example, see our [sample `config.yml` template] [emretlrunner-config-yml].

<h2><a name="roadmap-etc">11. Roadmap and contributing</a></h2>

We have plenty more planned for the Kinesis event pipeline! You can find the next milestones here:

* [Third Kinesis Release] [kinesis-release-3]
* [Fourth Kinesis Release] [kinesis-release-4]

Beyond these releases, our further plans for the Kinesis flow include:

* Analytics-on-write leveraging the new [Amazon Kinesis Aggregators] [kinesis-aggs] framework
* Real-time shredding of events into Redshift and other columnar databases
* Support for other storage types including timeseries and in-memory grids
* In-stream decisioning, alerting and response loops

We have been delighted by the quality and breadth of the community contributions to the Kinesis pipeline so far - so if any of our roadmap for real-time captures your imagination, get involved!

<h2><a name="help">12. Getting help</a></h2>

Documentation for the Kinesis flow is available on the [wiki][docs]. If you want help getting set up please [talk to us][talk-to-us]. This is still only our second release on the Kinesis flow, so if do you find a bug, [raise an issue][issues]!

[kinesis]: http://aws.amazon.com/kinesis/
[elasticsearch]: http://www.elasticsearch.org/
[akcl]: https://github.com/awslabs/amazon-kinesis-connectors/
[configurable-enrichments]: http://snowplowanalytics.com/blog/2014/07/26/snowplow-0.9.6-released-with-configurable-enrichments/
[enrichments-example]: https://github.com/snowplow/snowplow/tree/master/3-enrich/emr-etl-runner/config/enrichments
[hocon]: https://github.com/typesafehub/config/blob/master/HOCON.md
[iglu]: https://github.com/snowplow/iglu-scala-client
[slf4j]: http://www.slf4j.org/
[pkallos]: https://github.com/pkallos
[sambo1972]: https://github.com/sambo1972
[yuvalherziger]: https://github.com/yuvalherziger
[rupeshmane]: https://github.com/rupeshmane
[spray-can]: http://spray.io/documentation/1.1-SNAPSHOT/spray-can/
[ssc-conf]: https://github.com/snowplow/snowplow/blob/master/2-collectors/scala-stream-collector/src/main/resources/application.conf.example
[ske-conf]: https://github.com/snowplow/snowplow/blob/master/3-enrich/scala-kinesis-enrich/src/main/resources/default.conf
[clojure-collector]: https://github.com/snowplow/snowplow/tree/master/2-collectors/clojure-collector

[es-sink-asset]: https://s3-eu-west-1.amazonaws.com/snowplow-hosted-assets/4-storage/kinesis-elasticsearch-sink/snowplow-elasticsearch-sink-0.1.0
[es-sink-config]: https://github.com/snowplow/snowplow/blob/master/4-storage/kinesis-elasticsearch-sink/src/main/resources/application.conf.example

[kinesis-release-3]: https://github.com/snowplow/snowplow/milestones/Third%20Kinesis%20Release
[kinesis-release-4]: https://github.com/snowplow/snowplow/milestones/Fourth%20Kinesis%20Release
[kinesis-aggs]: https://github.com/awslabs/amazon-kinesis-aggregators

[netaporter]: https://github.com/NET-A-PORTER/scala-uri
[docs]: https://github.com/snowplow/snowplow/wiki/Scala-Kinesis-Enrich
[elasticsearch-setup]: https://github.com/snowplow/snowplow/wiki/kinesis-elasticsearch-sink-setup
[elasticsearch-techdocs]: https://github.com/snowplow/snowplow/wiki/kinesis-elasticsearch-sink
[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues
[kibana]: http://www.elasticsearch.org/overview/kibana/
