---
layout: post
shortenedlink: Snowplow 65 released
title: Snowplow 65 Scarlet Rosefinch released
tags: [snowplow, kinesis, real-time]
author: Fred
category: Releases
---

We are pleased to announce the release of Snowplow 65, Scarlet Rosefinch. This release greatly improves the efficiency and reliability of Snowplow's real-time [Kinesis][kinesis] pipeline.

Table of contents:

1. [Enhanced performance](/blog/2015/xx/xx/snowplow-r65-scarlet-rosefinch#enhancedPerformance)
2. [CORS support](/blog/2015/xx/xx/snowplow-r65-scarlet-rosefinch#cors)
3. [Increased reliability](/blog/2015/xx/xx/snowplow-r65-scarlet-rosefinch#reliability)
4. [Loading configuration from DynamoDB](/blog/2015/xx/xx/snowplow-r65-scarlet-rosefinch#dynamodb)
5. [Removal of automatic stream creation](/blog/2015/xx/xx/snowplow-r65-scarlet-rosefinch#automaticStreams)
6. [Improved Elasticsearch index initialization](/blog/2015/xx/xx/snowplow-r65-scarlet-rosefinch#tokenization)
7. [Other changes](/blog/2015/xx/xx/snowplow-r65-scarlet-rosefinch#otherChanges)
8. [Upgrading](/blog/2015/xx/xx/snowplow-r65-scarlet-rosefinch#upgrading)
9. [Getting help](/blog/2015/xx/xx/snowplow-r65-scarlet-rosefinch#help)

<!--more-->

<h2><a name="enhancedPerformance">1. Enhanced performance</a></h2>

The new PutRecords API enabled the biggest performance improvement: rather than sending events to Kinesis one at a time, we can now send batches of up to 500. This greatly increases the event volumes with which the Scala Stream Collector and Scala Kinesis Enrich can cope.

You might not want to always wait for full 500 events before sending the stored records to Kinesis, so the configuration for both applications now has a `buffer` section which provides greater control over when the stored records get sent.

It has three fields:
`byte-limit`: If the stored records total at least this many bytes, flush the buffer.
`record-limit`: If at least this many records are in the buffer, flush the buffer.
`time-limit`: If at least this many milliseconds have passed since the buffer was last flushed, flush the buffer.

An example with sensible defaults:

```
buffer: {
    byte-limit: 4500000 # 4.5MB
    record-limit: 500 # 500 records
    time-limit: 60000 # 1 minute
}
```

Additionally, the Scala Stream Collector has a ShutdownHook which sends all stored records. This prevents stored events from being lost when the collector is shut down.

<h2><a name="cors">2. CORS support</a></h2>

The Scala Stream Collector now supports CORS requests. This means that you can send events to it from Snowplow's client-side JavaScript Tracker using POST rather than GET. This is advantageous because it means that your requests are no longer subject to Internet Explorer's querystring size limit.

The Scala Stream Collector now also supports cross-origin requests from the Snowplow ActionScript 3.0 Tracker.

<h2><a name="reliability">3. Increased reliability</a></h2>

If an attempt to write records to Kinesis failed, previous versions of the Kinesis apps would just log an error message. The new release prevents events from being lost in the event that Kinesis is temporarily unreachable by implementing an exponential backoff strategy with jitter when PutRecords requests fail.

The minimum and maximum backoffs to use are configurable in the `backoffPolicy` for the Scala Stream Collector and Scala Kinesis Enrich:

```
backoffPolicy: {
    minBackoff: 3000 # 3 seconds
    maxBackoff: 600000 # 5 minutes
}
```

<h2><a name="dynamodb">4. Loading configuration from DynamoDB</a></h2>

The command-line arguments to Scala Kinesis Enrich have also changed. It used to be the case that you provided a `--config` argument, pointing to a HOCON file with configuration for the app, together with an optional `--enrichments` argument, pointing to a directory containing the JSON configurations for the enrichments you wanted to make use of:

```
./scala-kinesis-enrich-0.4.0 --config my.conf --enrichments path/to/enrichments
```

Scarlet Rosefinch makes three changes:

* The "resolver" section of the configuration HOCON has been split into a separate JSON file which should be specified using the command line argument `--resolver`.
* If you want to get the resolver JSON and the enrichment JSONs from the local filesystem, you need to preface their filepaths with "file:".
* You can now load the resolver JSON and enrichment JSONs from DynamoDB.

To duplicate the old behaviour, convert the `resolver` section of your configuration HOCON to JSON and put it in its own file, "resolver.json". Then start the enricher like this:

```
./scala-kinesis-enrich-0.4.0 --config my.conf --resolver file:resolver.json --enrichments file:path/to/enrichments
```

To get the resolver from DynamoDB, create a table named "my_resolver_table" with hashkey "id" and add an item to the table of the following form:

```
{
    "id": "my_resolver",
    "json": {{The resolver as a JSON string}}
}
```

Then provide the `resolver` argument as follows:

```
--resolver dynamodb:us-east-1/my_resolver_table/my_resolver
```

To get the enrichments from DynamoDB, the enrichment JSONs must all be stored in the same table. Call this table "my_enrichments_table". The enrichments' hash keys should have a common prefix, for example "enrich_":

```
{
    "id": "enrich_anon_ip",
    "json": {{anon_ip enrichment configuration JSON}}
}

{
    "id": "enrich_ip_lookups",
    "json": {{ip_lookups enrichment configuration JSON}}
}
```

Then provide the `resolver` argument as follows:

```
--enrichments dynamodb:us-east-1/my_enrichments_table/enrich_
```

If you are using a different AWS region, replace "us-east-1" accordingly.

The full command:

```
./scala-kinesis-enrich-0.5.0 --config my.conf --resolver dynamodb:us-east-1/my_resolver_table/my_resolver --enrichments dynamodb:us-east-1/my_enrichments_table/enrich_
```

<h2><a name="automaticStreams">5. Removal of automatic stream creation</a></h2>

The Kinesis apps will no longer automatically create a stream if they detect that the configured stream does not exist. This is so that if you make a typo when configuring the stream name, the error will be obvious immediately rather than creating a stream which no other app interacts with.

<h2><a name="tokenization">6. Improved Elasticsearch index initialization</a></h2>

We now recommend that when setting up your Elasticsearch index, you turn off tokenization of string fields. You can do this by choosing "keyword" as the default analyzer:

```
curl -XPUT 'http://localhost:9200/snowplow' -d '{
    "settings": {
        "analysis": {
            "analyzer": {
                "default": {
                    "type": "keyword"
                }
            }
        }
    },
    "mappings": {
        "enriched": {
            "_timestamp" : {
                "enabled" : "yes",
                "path" : "collector_tstamp"
            },
            "_ttl": {
              "enabled":true,
              "default": "604800000"
            },
            "properties": {
                "geo_location": {
                    "type": "geo_point"
                }
            }
        }
    }
}'
```

This has two positive effects:

* URLs shouldn't be tokenized
* Not having to tokenize every string field improves the performance of the Elasticsearch cluster

<h2><a name="upgrading">7. Upgrading</a></h2>

A full list of the changes needed to upgrade:

<h4>Scala Stream Collector</h4>

Add `backoffPolicy` and `buffer` fields to the configuration HOCON

<h4>Scala Kinesis Enrich</h4>

Add `backoffPolicy` and `buffer` fields to the configuration HOCON

<h4>Kinesis LZO S3 Sink</h4>

Rename the outermost key in the configuration HOCON from "connector" to "sink"
Replace the "s3/endpoint" field with an "s3/region" field (like "us-east-1")

<h4>Kinesis Elasticsearch Sink</h4>

Rename the outermost key in the configuration HOCON from "connector" to "sink"

<h2><a name="otherChanges">8. Other changes</a></h2>

We have also:

* Added macros to the "config.hocon.sample" sample configuration files
* Fixed a bug which caused the Kinesis Elasticsearch Sink to silently drop inputs containing fewer than 24 tab-separated
* Fixed a bug which prevented the applications from using a DynamoDB table in the configured region
* Added the ability to prevent the Scala Stream Collector from setting 3rd-party cookies by setting the cookie expiration field to 0
* Parallelized the processing of raw events in Scala Kinesis Enrich to improve performance
* Started logging the names of the streams to which the Scala Stream Collector and Scala Kinesis Enrich send events
* Bumped the 

<h2><a name="help">9. Getting help</a></h2>

For more details on this release, please check out the [r65 Scarlet Rosefinch][r65-release] on GitHub. 

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[kinesis]: http://aws.amazon.com/kinesis/

[r65-release]: https://github.com/snowplow/snowplow/releases/tag/r65-scarlet-rosefinch
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
