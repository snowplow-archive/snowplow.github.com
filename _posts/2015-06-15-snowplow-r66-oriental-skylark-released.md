---
layout: post
shortenedlink: Snowplow 66 released
title: Snowplow 66 Oriental Skylark released
tags: [snowplow, hadoop2, rhino, scripting]
author: Alex
category: Releases
---

We are pleased to announce the release of Snowplow 66, Oriental Skylark. This release upgrades our Hadoop Enrichment process to run on Hadoop 2.4 and also introduces a new scripting enrichment powered by JavaScript - our most powerful enrichment yet.

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


<h2><a name="js-enrichment">X. JavaScript scripting enrichment</a></h2>

This enrichment lets you write a [JavaScript] [js] function which is executed in the Enrichment process for each enriched event, and returns one or more _derived contexts_ which are attached to the final enriched event.

Use this enrichment to apply your own business logic to your enriched events; because your JavaScript function can throw exceptions which are gracefully handled by the calling Enrichment process, you can also use this enrichment to perform simple filtering of events.

This enrichment has been introduced for the **Hadoop pipeline only** in this release; it will be added to the Kinesis pipeline in our next release.

<h3><a name="js-enrichment">X.1 Usage guide</a></h3>

Your JavaScript must include a function, `process(event)`, which:

* Takes a [Snowplow enriched event POJO] [enriched-event-pojo] (Plain Old Java Object) as its sole argument
* Returns a JavaScript array of valid self-describing JSONs, which will be added to the `derived_contexts` field in the enriched event
* Returns `[]` or `null` if there are no contexts to add to this event
* Can `throw` exceptions but note that throwing an exception will cause the entire enriched event to end up in the Bad Bucket or Bad Stream

Note that you can also include other top-level functions and variables in your JavaScript script - but you must include a `process(event)` function somewhere in your script.

For a more detailed usage guide, check out the [JavaScript script enrichment] [js-enrichment-wiki] wiki page.

<h3><a name="js-enrichment">X.2 Example function</a></h3>

Here is an example JavaScript script for this enrichment:

{% highlight javascript %}
const SECRET_APP_ID = "Joshua";

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
{% endhighlight %}

For more informati is provided on the 

 * Performs two roles:
 * 1. If this is a server-side event, we
 *    validate that the app_id is our
 *    valid secret. Prevents spoofing of
 *    our server-side events
 * 2. If app_id is not null, return a new
 *    Acme context, derived_app_id, which
 *    contains the upper-cased app_id
 */

### How this enrichment works

This enrichment uses the [Rhino JavaScript engine] [rhino] to execute your JavaScript. Your JavaScript is pre-compiled so that your code should approach native Java speeds.

The `process` function is passed the exact [Snowplow enriched event POJO] [enriched-event-pojo]. The return value from the `process` function is converted into a JSON string (using `JSON.stringify`) in JavaScript before being retrieved in our Scala code. Our Scala code confirms that the return value is either null or an empty or non-empty array of Objects. No validation of the self-describing JSONs is performed.



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

[js]: xxx
[js-enrichment-wiki]: xxx

[schema]: http://iglucentral.com/schemas/com.snowplowanalytics.snowplow/javascript_script_config/jsonschema/1-0-0

[rhino]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Rhino
[enriched-event-pojo]: https://github.com/snowplow/snowplow/blob/master/3-enrich/scala-common-enrich/src/main/scala/com.snowplowanalytics.snowplow.enrich/common/outputs/EnrichedEvent.scala

[enrichment-scala]: https://github.com/snowplow/snowplow/blob/master/3-enrich/scala-common-enrich/src/main/scala/com.snowplowanalytics.snowplow.enrich/common/enrichments/registry/JavascriptScriptEnrichment.scala

[string-gotcha]: http://nelsonwells.net/2012/02/json-stringify-with-mapped-variables/
[rhino-experiments]: http://snowplowanalytics.com/blog/2013/10/21/scripting-hadoop-part-1-adventures-with-scala-rhino-and-javascript/

[r66-release]: https://github.com/snowplow/snowplow/releases/tag/r66-oriental-skylark
[wiki]: https://github.com/snowplow/snowplow/wiki
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
