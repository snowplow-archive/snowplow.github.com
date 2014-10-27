---
layout: post
shortenedlink: Snowplow 0.9.xx released
title: Snowplow 0.9.xx released with beta Amazon Kinesis support
tags: [snowplow, kinesis, real-time]
author: Fred
category: Releases
---

Back in February, we introduced initial support for real-time event analytics using [Amazon Kinesis][kinesis]. We are happy to announce the release of Snowplow version 0.9.XX in which we begin to improve and extended this support. The major features of this release are the introduction of a stream for bad rows and the move to the latest version of Scala Common Enrich. It also includes a number of contributions from community members.

1. [Bad rows stream](/blog/2014/xx/xx/snowplow-kinesis-0.2.0-released/#bad)
2. [Support for the latest version of Scala Common Enrich](/blog/2014/xx/xx/snowplow-kinesis-0.2.0-released/#sce)
3. [Phil Kallos' contributions](/blog/2014/xx/xx/snowplow-kinesis-0.2.0-released/#pkallos)
4. [Configuring AWS credentials](/blog/2014/xx/xx/snowplow-kinesis-0.2.0-released/#credentials)
5. [Configurable Kinesis endpoint](/blog/2014/xx/xx/snowplow-kinesis-0.2.0-released/#endpoint)
6. [HTTP request character limit override](/blog/2014/xx/xx/snowplow-kinesis-0.2.0-released/#character-limit)
7. [Logging](/blog/2014/xx/xx/snowplow-kinesis-0.2.0-released/#logging)
8. [Getting help](/blog/2014/xx/xx/snowplow-kinesis-0.2.0-released/#help)

<!--more-->

<h2><a name="bad">1. Bad rows stream</a></h2>

The enrichment process now outputs bad rows to a separate stream. If you are using "local mode", the separate stream will be stderr; otherwise it will be a Kinesis stream specified in the configuration file.

Bad rows are converted to JSONs with a "line" field and an "errors" field. The "line" field contains the input serialized Thrift byte array which failed enrichment, base 64 encoded. The "errors" field is an array of error messages explaining what was wrong with the input.

<h2><a name="sce">2. Support for the latest version of Scala Common Enrich</a></h2>

Scala Kinesis Enrich now uses the latest version of Scala Common Enrich, the library shared by Scala Hadoop Enrich and Scala Kinesis Enrich. This means that it supports [configurable enrichments][configurable-enrichments]. You can use the --enrichments command line option to pass a directory of enrichment configuration JSONs like this:

```bash
$ sbt "run --config my.conf --enrichments path/to/enrichment-directory"
```

The enrichments directory replaces the "anon_ip" and "geo_ip" fields in the config file. Instead create anon_ip.json and ip_lookups.json configuration JSONs in the enrichments directory.

Sensible defaults for all available enrichments can be found [here][enrichments-example].

The Scala Kinesis Enrich configuration HOCON now requires a "resolver" field which is used to configure the [Iglu][iglu] Resolver used to validate the enrichment configuration JSONs.

A positive side effect of this transition is that Kinesis Enrich no longer opens a MaxMind database file every time an event is enriched, so the problem of eventually running out of file handles is avoided.

<h2><a name="pkallos">3. Phil Kallos' contributions</a></h2>

We are indebted to community member Phil Kallos (@pkallos on GitHub) who contributed several improvements to the Kinesis flow:

* Improved performance for the Scala Stream Collector through concurrency
* The ability to run the enrichment process without needing permission for the kinesis:ListStreams action
* The ability to configure the AWS access key and secret key from the scalazon CredentialsProvider.InstanceProfile object by setting the access-key and secret-key configuration fields to "iam"

Thanks a lot Phil!

<h2><a name="credentials">4. Configuring AWS credentials</a></h2>

In addition to Phil's contribution, this release adds another way to configure the AWS credentials required to use Amazon Kinesis. If you replace the access-key and secret-key values in the HOCON configuration with "env", they will be set from the environment variables "AWS_ACCESS_KEY_ID" and "AWS_SECRET_ACCESS_KEY". This is useful if you want to keep your credentials out of GitHub.

<h2><a name="maxmind">5. Configurable Kinesis endpoint</a></h2>

Huge thanks to Sam Mason (@sambo1972 on GitHub) who contributed the ability to configure the Kinesis endpoint. In the "streams" section of the configuration HOCON, add the intended endpoint like so:

```
streams {
	in: {
		raw: "SnowplowRaw"
	}
	out: {
		enriched: "SnowplowEnriched"
		enriched_shards: 1 # Number of shards to use if created.
		bad: "SnowplowBad" # Not used until #463
		bad_shards: 1 # Number of shards to use if created.
	}
	# `app-name` is used for a DynamoDB table to maintain stream state.
	app-name: SnowplowKinesisEnrich-${enrich.streams.in.raw}
	# LATEST: most recent data.
	# TRIM_HORIZON: oldest available data.
	# Note: This only effects the first run of this application
	# on a stream.
	initial-position = "TRIM_HORIZON"
	region: "ap-southeast-2"
}
```

The same goes for the "stream" section of the Scala Stream Collector configuration HOCON.

<h2><a name="character-limit">6. HTTP request character limit override</a></h2>

Community member Yuval Herziger (@yuvalherziger on GitHub) noticed that version 0.1.0 of the Scala Stream Collector only accepted requests of up to 2048 characters. He found out how to override this restriction when configuring [spray-can][spray-can] (the server which the collector uses) and his fix has been incorporated into the default configuration files. Thanks Yuval!

<h2><a name="logging">7. Logging</a></h2>

Version 0.1.0 used "Console.println" for logging. We have replaced this with [Java logging][slf4j] for richer messages.

<h2><a name="help">8. Getting help</a></h2>

Documentation for the Kinesis flow is available on the [wiki][docs]. If you want help getting set up please [talk to us][talk-to-us]. This is still only the second version, so if you find a bug, [raise an issue][issues]!

[kinesis]: http://aws.amazon.com/kinesis/
[configurable-enrichments]: http://snowplowanalytics.com/blog/2014/07/26/snowplow-0.9.6-released-with-configurable-enrichments/
[enrichments-example]: https://github.com/snowplow/snowplow/tree/master/3-enrich/emr-etl-runner/config/enrichments
[iglu]: https://github.com/snowplow/iglu-scala-client
[slf4j]: http://www.slf4j.org/
[spray-can]: http://spray.io/documentation/1.1-SNAPSHOT/spray-can/
[docs]: https://github.com/snowplow/snowplow/wiki/Scala-Kinesis-Enrich
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues
