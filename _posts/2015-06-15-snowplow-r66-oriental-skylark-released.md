---
layout: post
shortenedlink: Snowplow 66 released
title: Snowplow 66 Oriental Skylark released
tags: [snowplow, hadoop2, rhino, scripting]
author: Fred
category: Releases
---

We are pleased to announce the release of Snowplow 66, Oriental Skylark. This release upgrades our Hadoop Enrichment process to run on Hadoop 2.4 and also introduces a new scripting enrichment powered by JavaScript.

Table of contents:

1. [Enhanced performance](/blog/2015/05/08/snowplow-r65-scarlet-rosefinch-released#enhancedPerformance)
2. [CORS support](/blog/2015/05/08/snowplow-r65-scarlet-rosefinch-released#cors)
3. [Increased reliability](/blog/2015/05/08/snowplow-r65-scarlet-rosefinch-released#reliability)
4. [Loading configuration from DynamoDB](/blog/2015/05/08/snowplow-r65-scarlet-rosefinch-released#dynamodb)
5. [Randomized partition keys for bad streams](/blog/2015/05/08/snowplow-r65-scarlet-rosefinch-released#randomization)
6. [Removal of automatic stream creation](/blog/2015/05/08/snowplow-r65-scarlet-rosefinch-released#automaticStreams)
7. [Improved Elasticsearch index initialization](/blog/2015/05/08/snowplow-r65-scarlet-rosefinch-released#tokenization)
8. [Other changes](/blog/2015/05/08/snowplow-r65-scarlet-rosefinch-released#otherChanges)
9. [Upgrading](/blog/2015/05/08/snowplow-r65-scarlet-rosefinch-released#upgrading)
10. [Getting help](/blog/2015/05/08/snowplow-r65-scarlet-rosefinch-released#help)

![scarlet-rosefinch][scarlet-rosefinch]

<!--more-->

<h2><a name="enhancedPerformance">1. Enhanced performance</a></h2>

Kinesis' new [PutRecords API][putrecords] enabled the biggest performance improvement: rather than sending events to Kinesis one at a time, we can now send batches of up to 500. This greatly increases the event volumes which the Scala Stream Collector and Scala Kinesis Enrich can handle.

You might not want to always wait for a full 500 events before sending the stored records to Kinesis, so the configuration for both applications now has a `buffer` section which provides greater control over when the stored records get sent.

It has three fields:

1. `byte-limit`: if the stored records total at least this many bytes, flush the buffer
2. `record-limit`: if at least this many records are in the buffer, flush the buffer
3. `time-limit`: if at least this many milliseconds have passed since the buffer was last flushed, flush the buffer

An example with sensible defaults:

{% highlight bash %}
buffer: {
    byte-limit: 4500000 # 4.5MB
    record-limit: 500 # 500 records
    time-limit: 60000 # 1 minute
}
{% endhighlight %}

Additionally, the Scala Stream Collector has a `ShutdownHook` which sends all stored records. This prevents stored events from being lost when the collector is shut down cleanly.

<h2><a name="cors">2. CORS support</a></h2>

The Scala Stream Collector now supports [CORS][cors] requests, so you can send events to it from Snowplow's client-side [JavaScript Tracker][js-tracker] using POST rather than GET. This means that your requests are no longer subject to Internet Explorer's querystring size limit.

The Scala Stream Collector also now supports cross-origin requests from the [Snowplow ActionScript 3.0 Tracker][as-tracker].

<h2><a name="reliability">3. Increased reliability</a></h2>

If an attempt to write records to Kinesis failed, previous versions of the Kinesis apps would just log an error message. The new release prevents events from being lost in the event that Kinesis is temporarily unreachable by implementing an [exponential backoff strategy with jitter][backoff] when PutRecords requests fail.

The minimum and maximum backoffs to use are configurable in the `backoffPolicy` for the Scala Stream Collector and Scala Kinesis Enrich:

{% highlight bash %}
backoffPolicy: {
    minBackoff: 3000 # 3 seconds
    maxBackoff: 600000 # 5 minutes
}
{% endhighlight %}

<h2><a name="dynamodb">4. Loading configuration from DynamoDB</a></h2>

The command-line arguments to Scala Kinesis Enrich have also changed. It used to be the case that you provided a `--config` argument, pointing to a [HOCON][hocon] file with configuration for the app, together with an optional `--enrichments` argument, pointing to a directory containing the JSON configurations for the enrichments you wanted to make use of:

{% highlight bash %}
./scala-kinesis-enrich-0.4.0 --config my.conf --enrichments path/to/enrichments
{% endhighlight %}

Scarlet Rosefinch makes three changes:

* The "resolver" section of the configuration HOCON has been split into a separate JSON file which should be specified using the command line argument `--resolver`.
* If you want to get the resolver JSON and the enrichment JSONs from the local filesystem, you need to preface their filepaths with "file:".
* You can now also load the resolver JSON and enrichment JSONs from DynamoDB

To recreate the pre-r65 behavior, convert the `resolver` section of your configuration HOCON to JSON and put it in its own file, "iglu_resolver.json". Then start the enricher like this:

{% highlight bash %}
./scala-kinesis-enrich-0.4.0 --config my.conf --resolver file:iglu_resolver.json --enrichments file:path/to/enrichments
{% endhighlight %}

To get the resolver from DynamoDB, create a table named "snowplow_config" with hashkey "id" and add an item to the table of the following form:

{% highlight json %}
{
    "id": "iglu_resolver",
    "json": "{The resolver as a JSON string}"
}
{% endhighlight %}

Then provide the `resolver` argument as follows:

{% highlight bash %}
--resolver dynamodb:us-east-1/snowplow_config/iglu_resolver
{% endhighlight %}

To get the enrichments from DynamoDB, the enrichment JSONs must all be stored in a table - you can reuse the "snowplow_config" table. The enrichments' hash keys should have a common prefix, for example "enrich_":

{% highlight json %}
{
    "id": "enrich_anon_ip",
    "json": "{anon_ip enrichment configuration as a JSON string}"
}

{
    "id": "enrich_ip_lookups",
    "json": "{ip_lookups enrichment configuration as a JSON string}"
}
{% endhighlight %}

Then provide the `resolver` argument as follows:

{% highlight bash %}
--enrichments dynamodb:us-east-1/snowplow_config/enrich_
{% endhighlight %}

If you are using a different AWS region, replace "us-east-1" accordingly.

The full command:

{% highlight bash %}
./scala-kinesis-enrich-0.5.0 --config my.conf \
  --resolver dynamodb:us-east-1/snowplow_config/iglu_resolver \
  --enrichments dynamodb:us-east-1/snowplow_config/enrich_
{% endhighlight %}

<h2><a name="randomization">5. Randomized partition keys for bad streams</a></h2>

When sending a record to Kinesis, you provide a [partition key][partition-key]. The hash of this key determines which shard will process the record. The good events generated by Scala Kinesis Enrich use the `user_ipaddress` field of the event as the key, so that events from a single user will all be in the right order in the same shard.

Previously, the bad events generated by Scala Kinesis Enrich and the Kinesis Elasticsearch Sink all had the same partition key. This meant that no matter how many shards the stream for bad records contained, all bad records would be processed by the same shard. Scarlet Rosefinch fixes this by using random partition keys for bad events.

<h2><a name="automaticStreams">6. Removal of automatic stream creation</a></h2>

The Kinesis apps will no longer automatically create a stream if they detect that the configured stream does not exist.

This means that if you make a typo when configuring the stream name, the mistake will immediately cause an error rather than creating an incorrectly named new stream which no other app knows about.

<h2><a name="tokenization">7. Improved Elasticsearch index initialization</a></h2>

We now recommend that when setting up your Elasticsearch index, you turn off [tokenization][tokenization] of string fields. You can do this by choosing "keyword" as the default analyzer:

{% highlight bash %}
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
{% endhighlight %}

This has two positive effects:

* URLs are no longer incorrectly tokenized
* Not having to tokenize every string field improves the performance of the Elasticsearch cluster


<h2><a name="js-enrichment">X. JavaScript scripting enrichment</a></h2>

We are pleased to introduce our most powerful enrichment yet - the JavaScript scripting enrichment. This enrichment lets you write a JavaScript function which is executed in the Enrichment process for each enriched event, and returns one or more _derived contexts_ which are attached to the final enriched event.

Use this enrichment to apply your own business logic to your enriched events at the row-level; JavaScript functions across multiple rows are not supported. Because your JavaScript function can throw exceptions which are gracefully handled by the calling Enrichment process, you can also use this enrichment to provide simple filtering of events.

<h3><a name="js-enrichment">X. JavaScript scripting enrichment</a></h3>


### Example

#### JavaScript function

Your JavaScript must include a function, `process(event)`, which:

* Takes a [Snowplow enriched event POJO] [enriched-event-pojo] (Plain Old Java Object) as its sole argument
* Returns a JavaScript array of valid self-describing JSONs, which will be added to the `derived_contexts` field in the enriched event
* Returns `[]` or `null` if there are no contexts to add to this event
* Can `throw` exceptions but note that throwing an exception will cause the entire enriched event to end up in the Bad Bucket or Bad Stream

Note that you can also include other top-level functions and variables in your JavaScript script - but you must include a `process(event)` function somewhere in your script.

Here is an example:

```javascript
const SECRET_APP_ID = "Joshua";

/**
 * Performs two roles:
 * 1. If this is a server-side event, we
 *    validate that the app_id is our
 *    valid secret. Prevents spoofing of
 *    our server-side events
 * 2. If app_id is not null, return a new
 *    Acme context, derived_app_id, which
 *    contains the upper-cased app_id
 */
function process(event) {
    var appId = event.getApp_id();

    if (platform == "server" && appId != SECRET_APP_ID) {
        throw "Server-side event has invalid app_id: " + appId;
    }

    if (appId == null) {
        return [];
    }

    var appIdUpper = new String(appId.toUpperCase());
    return [ { schema: "iglu:com.acme/derived_app_id/jsonschema/1-0-0",
               data:  { appIdUpper: appIdUpper } } ];
}
```

Please note:

* You must use a Java-style getter to retrieve the `app_id` from the event ([more information] [rhino-experiments])
* We have to convert the uppercased `appId` back to a JavaScript String (from a Java String) before we return it ([more information] [string-gotcha])

#### JSON configuration file

The self-describing JSON to configure this enrichment with the above JavaScript script is as follows:

```json
{
    "schema": "iglu:com.snowplowanalytics.snowplow/javascript_script_config/jsonschema/1-0-0",
    "data": {
        "vendor": "com.snowplowanalytics.snowplow",
        "name": "javascript_script_config",
        "enabled": true,
        "parameters": {
            "script": "Y29uc3QgU0VDUkVUX0FQUF9JRCA9ICJKb3NodWEiOw0KDQovKioNCiAqIFBlcmZvcm1zIHR3byByb2xlczoNCiAqIDEuIElmIHRoaXMgaXMgYSBzZXJ2ZXItc2lkZSBldmVudCwgd2UNCiAqICAgIHZhbGlkYXRlIHRoYXQgdGhlIGFwcF9pZCBpcyBvdXINCiAqICAgIHZhbGlkIHNlY3JldC4gUHJldmVudHMgc3Bvb2Zpbmcgb2YNCiAqICAgIG91ciBzZXJ2ZXItc2lkZSBldmVudHMNCiAqIDIuIElmIGFwcF9pZCBpcyBub3QgbnVsbCwgcmV0dXJuIGEgbmV3DQogKiAgICBBY21lIGNvbnRleHQsIGRlcml2ZWRfYXBwX2lkLCB3aGljaA0KICogICAgY29udGFpbnMgdGhlIHVwcGVyLWNhc2VkIGFwcF9pZA0KICovDQpmdW5jdGlvbiBwcm9jZXNzKGV2ZW50KSB7DQogICAgdmFyIGFwcElkID0gZXZlbnQuZ2V0QXBwX2lkKCk7DQoNCiAgICBpZiAocGxhdGZvcm0gPT0gInNlcnZlciIgJiYgYXBwSWQgIT0gU0VDUkVUX0FQUF9JRCkgew0KICAgICAgICB0aHJvdyAiU2VydmVyLXNpZGUgZXZlbnQgaGFzIGludmFsaWQgYXBwX2lkOiAiICsgYXBwSWQ7DQogICAgfQ0KDQogICAgaWYgKGFwcElkID09IG51bGwpIHsNCiAgICAgICAgcmV0dXJuIFtdOw0KICAgIH0NCg0KICAgIHZhciBhcHBJZFVwcGVyID0gbmV3IFN0cmluZyhhcHBJZC50b1VwcGVyQ2FzZSgpKTsNCiAgICByZXR1cm4gWyB7IHNjaGVtYTogImlnbHU6Y29tLmFjbWUvZGVyaXZlZF9hcHBfaWQvanNvbnNjaGVtYS8xLTAtMCIsDQogICAgICAgICAgICAgICBkYXRhOiAgeyBhcHBJZFVwcGVyOiBhcHBJZFVwcGVyIH0gfSBdOw0KfQ=="
        }
    }
}
```

The "parameters" fields are as follows:

* "script": Your JavaScript function, Base64 encoded. You can use either URL-safe or regular Base64 encoding

### How this enrichment works

This enrichment uses the [Rhino JavaScript engine] [rhino] to execute your JavaScript. Your JavaScript is pre-compiled so that your code should approach native Java speeds.

The `process` function is passed the exact [Snowplow enriched event POJO] [enriched-event-pojo]. The return value from the `process` function is converted into a JSON string (using `JSON.stringify`) in JavaScript before being retrieved in our Scala code. Our Scala code confirms that the return value is either null or an empty or non-empty array of Objects. No validation of the self-describing JSONs is performed.

You can review the exact Scala code which executes your JavaScript script in the [JavascriptScriptEnrichment.scala] [enrichment-scala] file.

### Do's and Don'ts

This is our most powerful enrichment yet - here are some do's and don'ts to avoid potential footguns.

Do:

* use [Snowplow version tags] [snowplow-tags] to confirm the fields available in your Snowplow version's enriched event POJO
* return as many contexts as you want
* throw an exception if you want this enriched event to end up in the Bad Bucket or Bad Stream
* include minified, self-contained JavaScript libraries that your `process(event)` function needs
* test this enrichment on sample sets of events before putting it into production
* ensure your new contexts are defined in Iglu, Redshift, JSON Paths etc

Don't:

* mutate existing fields in the supplied enriched event - return a new context instead
* try to share state across multiple enriched events - write your own Scalding or Spark job instead
* include CPU-intensive tasks without being aware of the impact on your event processing time

[schema]: http://iglucentral.com/schemas/com.snowplowanalytics.snowplow/javascript_script_config/jsonschema/1-0-0

[rhino]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Rhino
[enriched-event-pojo]: https://github.com/snowplow/snowplow/blob/master/3-enrich/scala-common-enrich/src/main/scala/com.snowplowanalytics.snowplow.enrich/common/outputs/EnrichedEvent.scala

[enrichment-scala]: https://github.com/snowplow/snowplow/blob/master/3-enrich/scala-common-enrich/src/main/scala/com.snowplowanalytics.snowplow.enrich/common/enrichments/registry/JavascriptScriptEnrichment.scala

[string-gotcha]: http://nelsonwells.net/2012/02/json-stringify-with-mapped-variables/
[rhino-experiments]: http://snowplowanalytics.com/blog/2013/10/21/scripting-hadoop-part-1-adventures-with-scala-rhino-and-javascript/

[snowplow-tags]: https://github.com/snowplow/snowplow/tags


<h2><a name="otherChanges">8. Other changes</a></h2>

We have also:

* Started logging the names of the streams to which the Scala Stream Collector and Scala Kinesis Enrich write events ([#1503][1503], [#1493][1493])
* Added macros to the "config.hocon.sample" sample configuration files ([#1471][1471], [#1472][1472], [#1513][1513], [#1515][1515])
* Fixed a bug which caused the Kinesis Elasticsearch Sink to silently drop inputs containing fewer than 24 tab-separated fields ([#1584][1584])
* Fixed a bug which prevented the applications from using a DynamoDB table in the configured region ([#1576][1576], [#1582][1582], [#1583][1583])
* Added the ability to prevent the Scala Stream Collector from setting 3rd-party cookies by setting the cookie expiration field to 0 ([#1363][1363])
* Bumped the version of Scala Common Enrich used by Scala Kinesis Enrich to 0.13.1 ([#1618][1618])
* Bumped the version of [Scalazon][scalazon] we use to 0.11 to access PutRecords ([#1492][1492], [#1504][1504])
* Stopped Scala Kinesis Enrich outputting records of over 50kB because they are exceed Kinesis' size limit ([#1649][1649])

<h2><a name="upgrading">9. Upgrading</a></h2>

The Kinesis apps for r65 Scarlet Rosefinch are now all available in a single zip file here:

    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_kinesis_r65_scarlet_rosefinch.zip

Upgrading will require various configuration changes to each of the four applications:

<h3>Scala Stream Collector</h3>

* Add `backoffPolicy` and `buffer` fields to the configuration HOCON.

<h3>Scala Kinesis Enrich</h3>

* Add `backoffPolicy` and `buffer` fields to the configuration HOCON
* Extract the resolver from the configuration HOCON into its own JSON file, which can be stored locally or in DynamoDB
* Update the command line arguments as detailed [above](#dynamodb)

<h3>Kinesis LZO S3 Sink</h3>

* Rename the outermost key in the configuration HOCON from "connector" to "sink"
* Replace the "s3/endpoint" field with an "s3/region" field (such as "us-east-1")

<h3>Kinesis Elasticsearch Sink</h3>

* Rename the outermost key in the configuration HOCON from "connector" to "sink"

And that's it - you should now be fully upgraded!

<h2><a name="help">10. Getting help</a></h2>

For more details on this release, please check out the [r65 Scarlet Rosefinch][r65-release] on GitHub. 

Documentation for all the Kinesis apps is available on the [wiki][wiki].

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[scarlet-rosefinch]: /assets/img/blog/2015/05/scarlet-rosefinch.jpg

[kinesis]: http://aws.amazon.com/kinesis/
[putrecords]: http://docs.aws.amazon.com/cli/latest/reference/kinesis/put-records.html
[cors]: http://en.wikipedia.org/wiki/Cross-origin_resource_sharing
[js-tracker]: https://github.com/snowplow/snowplow-javascript-tracker
[as-tracker]: https://github.com/snowplow/snowplow-actionscript3-tracker
[backoff]: http://www.awsarchitectureblog.com/2015/03/backoff.html
[scalazon]: https://github.com/cloudify/scalazon
[hocon]: https://github.com/typesafehub/config/blob/master/HOCON.md
[partition-key]: http://docs.aws.amazon.com/kinesis/latest/dev/key-concepts.html#partition-key
[tokenization]: http://www.elastic.co/guide/en/elasticsearch/reference/1.x/analysis-standard-tokenizer.html

[r65-release]: https://github.com/snowplow/snowplow/releases/tag/r65-scarlet-rosefinch
[wiki]: https://github.com/snowplow/snowplow/wiki
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

[1537]: https://github.com/snowplow/snowplow/issues/1537
[1503]: https://github.com/snowplow/snowplow/issues/1503
[1493]: https://github.com/snowplow/snowplow/issues/1493
[1513]: https://github.com/snowplow/snowplow/issues/1513
[1515]: https://github.com/snowplow/snowplow/issues/1515
[1471]: https://github.com/snowplow/snowplow/issues/1471
[1472]: https://github.com/snowplow/snowplow/issues/1472
[1513]: https://github.com/snowplow/snowplow/issues/1513
[1584]: https://github.com/snowplow/snowplow/issues/1584
[1576]: https://github.com/snowplow/snowplow/issues/1576
[1583]: https://github.com/snowplow/snowplow/issues/1583
[1582]: https://github.com/snowplow/snowplow/issues/1582
[1363]: https://github.com/snowplow/snowplow/issues/1363
[1618]: https://github.com/snowplow/snowplow/issues/1618
[1492]: https://github.com/snowplow/snowplow/issues/1492
[1504]: https://github.com/snowplow/snowplow/issues/1504
[1649]: https://github.com/snowplow/snowplow/issues/1649
