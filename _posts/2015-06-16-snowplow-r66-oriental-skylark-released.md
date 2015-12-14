---
layout: post
title: Snowplow 66 Oriental Skylark released
title-short: Snowplow 66 Oriental Skylark
tags: [snowplow, hadoop2, rhino, scripting, lambda architecture]
author: Alex
category: Releases
---

We are pleased to announce the release of Snowplow 66, Oriental Skylark. This release upgrades our Hadoop Enrichment process to run on Hadoop 2.4, re-enables our Kinesis-Hadoop lambda architecture and also introduces a new scriptable enrichment powered by JavaScript - our most powerful enrichment yet!

Table of contents:

1. [Our enrichment process on Hadoop 2.4](/blog/2015/06/16/snowplow-r66-oriental-skylark-released#hadoop2)
2. [Re-enabled Kinesis-Hadoop lambda architecture](/blog/2015/06/16/snowplow-r66-oriental-skylark-released#lambda)
3. [JavaScript scripting enrichment](/blog/2015/06/16/snowplow-r66-oriental-skylark-released#js-enrichment)
4. [Other changes](/blog/2015/06/16/snowplow-r66-oriental-skylark-released#other)
5. [Upgrading](/blog/2015/06/16/snowplow-r66-oriental-skylark-released#upgrading)
6. [Getting help](/blog/2015/06/16/snowplow-r66-oriental-skylark-released#help)

![oriental-skylark][oriental-skylark]

<!--more-->

<h2><a name="hadoop2">1. Our enrichment process on Hadoop 2.4</a></h2>

Since the inception of Snowplow three years ago, our Hadoop Enrichment process has been tied to Hadoop 1 and Elastic MapReduce's 2.4.x series AMIs. In the meantime, Elastic MapReduce has been iterating through the [3.x.x series of AMIs] [emr-amis], introducing lots of great features including:

* Hadoop 2.x, along with YARN and new HDFS features e.g. symbolic links
* New features and important bug fixes in [S3DistCp] [s3distcp]
* The ability to run [Spark on an EMR cluster] [spark-emr-blog]

To take advantage of these new features, we are now upgrading our Hadoop Enrichment process to run on Hadoop 2.4 and the EMR 3.x.x series AMIs **exclusively**. Our testing has been with the 3.6.0 AMI, so that is the recommended version currently.

To reflect this breaking change, the new version of Hadoop Enrich is **1.0.0**. Because our Hadoop Shred process works on Hadoop 2.4 without code changes, this version is unchanged at 0.4.0.

We are hugely excited about our move to Hadoop 2.x and YARN! This should allow for some powerful new capabilities in the Snowplow batch pipeline, such as mixed Hadoop/Spark event processing.

<h2><a name="lambda">2. Re-enabled Kinesis-Hadoop lambda architecture</a></h2>

A [Lambda Architecture] [lambda-architecture] is Nathan Marz's term for a hybrid batch and streaming architecture for event processing. There are two reasons why users of Snowplow's Kinesis pipeline should consider a lambda architecture, operating the Hadoop pipeline alongside their existing Kinesis flow:

1. The Hadoop pipeline allows you to re-process your raw events (e.g. when we introduce a new enrichment) long after the raw events have expired from your Kinesis stream
2. The Hadoop pipeline lets you load Snowplow enriched events into Amazon Redshift (or Postgres)

To run the Hadoop pipeline alongside your Kinesis pipeline follow these steps:

1. Deploy the [kinesis-s3] [kinesis-s3] application and configure it to write your Kinesis stream of **raw** Snowplow events to Amazon S3
2. Deploy the Hadoop pipeline and configure EmrEtlRunner to read from the S3 bucket from #1 with `collector_format` set to `thrift`

This release fixes some issues with running the Kinesis-Hadoop lambda architecture which were related to Amazon's introduction of IAM roles for Elastic MapReduce; two of these fixes were implemented in EmrEtlRunner ([#1715] [1715] and [#1647] [1647]), so you will have to upgrade your EmrEtlRunner as per the instructions below.

<h2><a name="js-enrichment">3. JavaScript scripting enrichment</a></h2>

The JavaScript scripting enrichment lets you write a [JavaScript] [js] function which is executed in the Enrichment process for each enriched event, and returns one or more _derived contexts_ which are attached to the final enriched event.

Use this enrichment to apply your own business logic to your enriched events; because your JavaScript function can throw exceptions which are gracefully handled by the calling Enrichment process, you can also use this enrichment to perform simple filtering of events.

This enrichment has been introduced for the **Hadoop pipeline only** in this release; it will be added to the Kinesis pipeline in our next release.

<h3><a name="js-enrichment-usage">3.1 Usage guide</a></h3>

Your JavaScript must include a function, `process(event)`, which:

* Takes a [Snowplow enriched event POJO] [enriched-event-pojo] (Plain Old Java Object) as its sole argument
* Returns a JavaScript array of valid self-describing JSONs, which will be added to the `derived_contexts` field in the enriched event
* Returns `[]` or `null` if there are no contexts to add to this event
* Can `throw` exceptions but note that throwing an exception will cause the entire enriched event to end up in the Bad Bucket or Bad Stream

Note that you can also include other top-level functions and variables in your JavaScript script - but you must include a `process(event)` function somewhere in your script.

For a more detailed usage guide, please see the [JavaScript script enrichment] [js-enrichment-wiki] wiki page.

<h3><a name="js-enrichment-eg">3.2 Example</a></h3>

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

This function is actually serving two discrete roles:

1. If this is a server-sent event, we validate that the `app_id` matches our secret. This is a simple way of preventing a "bad actor" from spoofing our server-sent events
2. If `app_id` is not null, we return a new context for Acme Inc, `derived_app_id`, which contains the upper-cased `app_id`

These are of course just very simple examples - we look forward to seeing what the community come up with!

<h3><a name="js-enrichment-how">3.3 How this enrichment works</a></h3>

This enrichment uses the [Rhino JavaScript engine] [rhino] to execute your JavaScript. Your JavaScript is pre-compiled so that your code should approach native Java speeds.

The `process` function is passed the exact [Snowplow enriched event POJO] [enriched-event-pojo]. The return value from the `process` function is converted into a JSON string (using `JSON.stringify`) in JavaScript before being retrieved in our Scala code. Our Scala code confirms that the return value is either null or an empty or non-empty array of Objects. No validation of the self-describing JSONs inside the array is performed.

If you are interested in learning more about Rhino and the JVM, check out our earlier R&D blog post, [Scripting Hadoop, Part One - Adventures with Scala, Rhino and JavaScript] [rhino-experiments-blog].

<h2><a name="other">4. Other changes</a></h2>

We have also:

* Fixed the various incorrect links in Scala Common Enrich's `README.md`, thank you Snowplow community member and intern [Vincent Ohprecio] [bigsnarfdude]! ([#1669] [1669])
* Made the `mkt_` and `refr_` fields TSV safe - big thanks to Snowplow community member [Jason Bosco] [jasonbosco] for this! ([#1643] [1643])
* Fixed an uncaught NPE exception in our JSON error handling code's `stripInstanceEtc` function ([#1622] [1622])
* On the data modeling side of things, we have removed restrictions in sessions and visitors-source ([#1725] [1725])

<h2><a name="upgrading">5. Upgrading</a></h2>

<h3><a name="upgrading-emretlrunner">5.1 Upgrading your EmrEtlRunner</a></h3>

You need to update EmrEtlRunner to the latest version (**0.15.0**) on GitHub:

{% highlight bash %}
$ git clone git://github.com/snowplow/snowplow.git
$ git checkout r66-oriental-skylark
$ cd snowplow/3-enrich/emr-etl-runner
$ bundle install --deployment
$ cd ../../4-storage/storage-loader
$ bundle install --deployment
{% endhighlight %}

<h4><a name="configuring-emretlrunner">5.2 Updating EmrEtlRunner's configuration</a></h4>

You need to update your EmrEtlRunner's `config.yml` file to reflect the new Hadoop 2.4.0 and AMI 3.6.0 support:

{% highlight yaml %}
:emr:
  :ami_version: 3.6.0 # WAS 2.4.2
{% endhighlight %}

And:

{% highlight yaml %}
  :versions:
    :hadoop_enrich: 1.0.0 # WAS 0.14.1
{% endhighlight %}

For a complete example, see our [sample `config.yml` template][emretlrunner-config-yml].

<h3><a name="upgrading-js">5.3 JavaScript scripting enrichment</a></h3>

You can enable this enrichment by creating a self-describing JSON and adding into your `enrichments` folder. The configuration JSON should validate against the [javascript_script_config schema] [schema].

The configuration JSON for the JavaScript example above would be as follows:

{% highlight json %}
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
{% endhighlight %}

<h2><a name="help">6. Getting help</a></h2>

For more details on this release, please check out the [r66 Oriental Skylark][r66-release] on GitHub.

Documentation on the new JavaScript script enrichment is available on the [wiki] [js-enrichment-wiki].

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[oriental-skylark]: /assets/img/blog/2015/06/skylark-wilhelm-von-white.jpg

[js]: https://en.wikipedia.org/wiki/JavaScript
[rhino]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Rhino
[js-enrichment-wiki]: https://github.com/snowplow/snowplow/wiki/JavaScript-script-enrichment
[js-schema]: http://iglucentral.com/schemas/com.snowplowanalytics.snowplow/javascript_script_config/jsonschema/1-0-0
[enriched-event-pojo]: https://github.com/snowplow/snowplow/blob/master/3-enrich/scala-common-enrich/src/main/scala/com.snowplowanalytics.snowplow.enrich/common/outputs/EnrichedEvent.scala
[rhino-experiments-blog]: /blog/2013/10/21/scripting-hadoop-part-1-adventures-with-scala-rhino-and-javascript/
[lambda-architecture]: http://lambda-architecture.net/
[kinesis-s3]: https://github.com/snowplow/kinesis-s3

[emr-amis]: http://docs.aws.amazon.com/ElasticMapReduce/latest/DeveloperGuide/ami-versions-supported.html
[s3distcp]: http://docs.aws.amazon.com/ElasticMapReduce/latest/DeveloperGuide/UsingEMR_s3distcp.html
[spark-emr-blog]: /blog/2015/05/10/spark-example-project-0.3.0-released/

[bigsnarfdude]: https://github.com/bigsnarfdude
[jasonbosco]: https://github.com/jasonbosco

[1622]: https://github.com/snowplow/snowplow/issues/1622
[1643]: https://github.com/snowplow/snowplow/issues/1643
[1647]: https://github.com/snowplow/snowplow/issues/1647
[1669]: https://github.com/snowplow/snowplow/issues/1669
[1715]: https://github.com/snowplow/snowplow/issues/1715
[1725]: https://github.com/snowplow/snowplow/issues/1725

[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample

[r66-release]: https://github.com/snowplow/snowplow/releases/tag/r66-oriental-skylark
[wiki]: https://github.com/snowplow/snowplow/wiki
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
