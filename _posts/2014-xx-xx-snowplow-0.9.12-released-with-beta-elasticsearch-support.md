---
layout: post
shortenedlink: Snowplow 0.9.12 released
title: Snowplow 0.9.12 released with beta Elasticsearch support
tags: [snowplow, kinesis, real-time]
author: Fred
category: Releases
---

Back in February, we introduced initial support for real-time event analytics using [Amazon Kinesis][kinesis]. We are excited to announce the release of Snowplow 0.9.12 which improves and extends our Kinesis support. The major new features are the introduction of a stream for bad rows and the new Kinesis Elasticsearch Sink which consumes a stream of enriched Snowplow events (or bad rows) and writes them to [Elasticsearch][elasticsearch].

This release also makes some improvements to Snowplow Common Enrich and Hadoop Enrich which should be valuable for users of our batch-based event pipeline. Sections below the fold are as follows:

1. [Bad rows stream](/blog/2014/xx/xx/snowplow-0.9.12-released-with-beta-elasticsearch-support/#bad)
2. [Snowplow Elasticsearch Sink](/blog/2014/xx/xx/snowplow-0.9.12-released-with-beta-elasticsearch-support/#elasticsearch)
3. [Support for the latest version of Scala Common Enrich](/blog/2014/xx/xx/snowplow-0.9.12-released-with-beta-elasticsearch-support/#sce)
4. [Phil Kallos' contributions](/blog/2014/xx/xx/snowplow-0.9.12-released-with-beta-elasticsearch-support/#pkallos)
5. [Configuring AWS credentials](/blog/2014/xx/xx/snowplow-0.9.12-released-with-beta-elasticsearch-support/#credentials)
6. [Configurable Kinesis endpoint](/blog/2014/xx/xx/snowplow-0.9.12-released-with-beta-elasticsearch-support/#endpoint)
7. [HTTP request character limit override](/blog/2014/xx/xx/snowplow-0.9.12-released-with-beta-elasticsearch-support/#character-limit)
8. [Logging](/blog/2014/xx/xx/snowplow-0.9.12-released-with-beta-elasticsearch-support/#logging)
9. [New tnuid field](/blog/2014/xx/xx/snowplow-0.9.12-released-with-beta-elasticsearch-support/#tnuid)
10. [More relaxed URI parsing](/blog/2014/xx/xx/snowplow-0.9.12-released-with-beta-elasticsearch-support/#netaporter)
11. [Upgrading](/blog/2014/xx/xx/snowplow-0.9.12-released-with-beta-elasticsearch-support/#upgrading)
12. [Getting help](/blog/2014/xx/xx/snowplow-0.9.12-released-with-beta-elasticsearch-support/#help)

<!--more-->

<h2><a name="bad">1. Bad rows stream</a></h2>

The Kinesis-based enrichment process now outputs bad rows to a separate stream. If you are using "local mode", the separate stream will be `stderr`; otherwise it will be a Kinesis stream specified in the configuration file.

Bad rows are converted to JSONs with a "line" field and an "errors" field. The "line" field contains the input serialized Thrift byte array which failed enrichment, Base64-encoded. The "errors" field is an array of error messages explaining what was wrong with the input.

<h2><a name="elasticsearch">2. Snowplow Elasticsearch Sink</a></h2>

The new Snowplow Elasticsearch Sink reads events from a Kinesis stream, transforms them into JSON, and writes them to an [Elasticsearch][elasticsearch] cluster in real time. It can be configured to read from either a stream of successfully enriched Snowplow events or the new bad rows stream.

If the sink cannot convert an event to JSON or the JSON is rejected by Elasticsearch, the failed event will be written to a Kinesis bad rows stream along with a message explaining what went wrong.

The sink uses the [Amazon Kinesis Connector Library][akcl].

The jar is available from:

```
https://s3-eu-west-1.amazonaws.com/snowplow-hosted-assets/4-storage/kinesis-elasticsearch-sink/snowplow-elasticsearch-sink-0.1.0
```

and a sample configuration file can be found at

```
https://github.com/snowplow/snowplow/blob/master/4-storage/kinesis-elasticsearch-sink/src/main/resources/application.conf.example
```

For more information about the Snowplow Elasticsearch Sink, see these wiki pages:

* [Setup guide][elasticsearch-setup]
* [Technical documentation][elasticsearch-techdocs]

<h2><a name="sce">3. Support for the latest version of Scala Common Enrich</a></h2>

Scala Kinesis Enrich now uses the latest version of Scala Common Enrich, the library shared by Scala Hadoop Enrich and Scala Kinesis Enrich. This means that it supports [configurable enrichments][configurable-enrichments]. You can use the --enrichments command line option to pass a directory of enrichment configuration JSONs like this:

```bash
$ ./scala-kinesis-enrich-0.2.0 --config my.conf --enrichments path/to/enrichment-directory
```

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

Huge thanks to Sam Mason (@sambo1972 on GitHub) who contributed the ability to configure the Kinesis endpoint. In the "streams" section of the configuration HOCON, add the intended endpoint like so:

```
streams {
	...
	region: "ap-southeast-2"
}
```

The same goes for the "stream" section of the Scala Stream Collector configuration HOCON.

<h2><a name="character-limit">7. HTTP request character limit override</a></h2>

Community member Yuval Herziger (@yuvalherziger on GitHub) noticed that version 0.1.0 of the Scala Stream Collector only accepted requests of up to 2048 characters. He found out how to override this restriction when configuring [spray-can][spray-can] (the server which the collector uses) and his fix has been incorporated into the default configuration files. Thanks Yuval!

<h2><a name="logging">8. Logging</a></h2>

Version 0.1.0 used "Console.println" for logging. We have replaced this with [Java logging][slf4j] for richer messages.

<h2><a name="tnuid">9. New tnuid field</a></h2>

Version 0.9.0 of Scala Common Enrich allows you set the `network_userid` field from the querystring of a GET request or body of a POST request rather than using a header. If you have access to the network user ID cookie set by the [Clojure Collector][clojure-collector], you can add it to events tracked server-side to match up server-side and client-side events generated by the same user.

<h2><a name="netaporter">10. More relaxed URI parsing</a></h2>

Big thanks to @rupeshmane, who used the [NET-A-PORTER][netaporter] URI parsing library to make the enrichment process more forgiving of non-compliant URIs. URIs which would previously fail with an error, for example due to containing illegal characters such as `|`, can now be parsed.

<h2><a name="upgrading">11. Upgrading</a></h2>

There are several changes you need to make to move to the new versions of the Scala Stream Collector and Scala Kinesis Enrich:

* You must provide a "region" field (with a value like "us-east-1") in the configuration files.
* You must provide a "resolver" field in the Scala Kinesis Enrich containing the data used to configure the Iglu resolver
* If you run Scala Kinesis Enrich without the --enrichments option, the IP anonymization enrichment and the IP address lookup enrichment will not run automatically

New templates for the two configuration files can be found on GitHub (you will need to edit the AWS credentials and the stream names):

* [Scala Stream Collector configuration][ssc-conf]
* [Scala Kinesis Enrich configuration][ske-conf]

And a sample enrichment directory containing sensible configuration JSONs can be found [here][enrichments-example].

You can upgrade immediately to the new version of Scala Hadoop Enrich, which is available in this bucket:

```
s3://snowplow-hosted-assets/3-enrich/hadoop-etl/snowplow-hadoop-etl-0.10.0.jar
```

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
[pkallos]: https://github.com/pkallos/
[spray-can]: http://spray.io/documentation/1.1-SNAPSHOT/spray-can/
[ssc-conf]: https://github.com/snowplow/snowplow/blob/master/2-collectors/scala-stream-collector/src/main/resources/application.conf.example
[ske-conf]: https://github.com/snowplow/snowplow/blob/master/3-enrich/scala-kinesis-enrich/src/main/resources/default.conf
[clojure-collector]: https://github.com/snowplow/snowplow/tree/master/2-collectors/clojure-collector
[netaporter]: https://github.com/NET-A-PORTER/scala-uri
[docs]: https://github.com/snowplow/snowplow/wiki/Scala-Kinesis-Enrich
[elasticsearch-setup]: https://github.com/snowplow/snowplow/wiki/kinesis-elasticsearch-sink-setup
[elasticsearch-techdocs]: https://github.com/snowplow/snowplow/wiki/kinesis-elasticsearch-sink
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues
