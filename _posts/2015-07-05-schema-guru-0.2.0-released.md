---
layout: post
title: Schema Guru 0.2.0 released with brand-new web UI and support for self-describing JSON Schema
title-short: Schema Guru 0.2.0
tags: [json, json schema, schema, iglu, self-describing]
author: Anton
category: Releases
---

Almost a month has passed since the [first release][first-release] of [Schema Guru][repo], our tool for deriving JSON Schemas from multiple JSON instances. That release was something of a proof-of-concept - in this 0.2.0 release we are adding much richer functionality, plus deeper integration with the Snowplow platform.

This release post will cover the following new features:

1. [Web UI](/blog/2015/07/05/schema-guru-0.2.0-released/#webui)
2. [Newline-delimited JSON](/blog/2015/07/05/schema-guru-0.2.0-released/#ndjson)
3. [Duplicated keys warning](/blog/2015/07/05/schema-guru-0.2.0-released/#duplicates)
4. [Base64 pattern](/blog/2015/07/05/schema-guru-0.2.0-released/#base64)
5. [Enums](/blog/2015/07/05/schema-guru-0.2.0-released/#enums)
6. [Schema segmentation](/blog/2015/07/05/schema-guru-0.2.0-released/#segmentation)
7. [Self-describing schemas](/blog/2015/07/05/schema-guru-0.2.0-released/#self-describing)
8. [Upgrading](/blog/2015/07/05/schema-guru-0.2.0-released/#upgrading)
9. [Getting help](/blog/2015/07/05/schema-guru-0.2.0-released/#getting-help)
10. [Plans for the next release](/blog/2015/07/05/schema-guru-0.2.0-released/#roadmap)

<div class="html">
<h2><a name="webui">1. Web UI</a></h2>
</div>

The first big feature of version 0.2.0 is the new web UI, which you can try out at [schemaguru.snowplowanalytics.com] [webui-demo].

Sometimes you just want to create a schema quickly and don't want to mess with a CLI. For this use case we implemented a single page web app version of Schema Guru which embeds the same logic as the CLI.

The web UI also shows you a "diff" of how your schema changes with the addition of each extra JSON instance:

![schema-guru-webui-screenshot] [pic]

<!--more-->

<div class="html">
<h2><a name="ndjson">2. Newline-delimited JSON</a></h2>
</div>

Frequently you will have multiple JSON instances stored in a single file; in fact a specification for this exists, called [Newline delimited JSON] [ndjson]. The specification states that every JSON instance must exist on one line and delimited with others by newline symbol.

The specification also states that files following this format must have the `.ndjson` extension; if you want the Schema Guru web UI to process NDJSON, then your files **must** have the `.ndjson` extension currently.

You also can switch configure the Schema Guru CLI to process NDJSON files by passing it `--ndjson` flag. Again, if you you want to process a whole directory of NDJSON, each files **must** have the `.ndjson` extension currently.

<div class="html">
<h2><a name="duplicates">3. Duplicated keys warning</a></h2>
</div>

Developers are humans too and can sometimes make mistakes when generating JSONs. One common case is case conflicts, for example if the last version of your app ran in Python and used `snake_case` for its keys, while the new version of your app is written in Java and uses `camelCase`. Another common issue is typos introduced into JSON property names.

Now if Schema Guru encounters suspiciously similar keys, it will warn you; this works both in the CLI and the web UI. Under the hood we use [Levenshtein distance] [levenshtein] to detect the duplicated keys.

<div class="html">
<h2><a name="base64">4. Base64 pattern</a></h2>
</div>

In the previous release we implementing all string formats supported by the JSON Schema specification has. Another common format for strings in JSON is Base64 encoding. From this release, if a string value matches the [Base64 regular expression] [base64-regex], Schema Guru will add this regex to string's pattern.

Like Schema Guru detecting string formats, if even a single input JSON instance does not match pattern, then the pattern won't be added to the final schema.

<div class="html">
<h2><a name="enums">5. Enums</a></h2>
</div>

We are pleased to add support for another JSON Schema feature: enums.

By default enum recognition is disabled; to enable it, specify an enum cardinality tolerance in either the CLI or the web UI. If the number of discrete values found for a JSON property is less than or equal to this cardinality, then the property will be defined using a fully-specified enum in the JSON Schema.

In future versions we plan to add pre-defined enum sets such as ISO 4217, ISO 3166-1, months, days of weeks, etc.

<div class="html">
<h2><a name="segmentation">6. Schema segmentation</a></h2>
</div>

Sometimes you will have a whole collection of newline-delimited JSONs which are lumped into the same folder but represent a set of fundamentally different _types_. A good example of this are the JSON event archives provided by analytics companies such as [Mixpanel] [mixpanel], [Keen.io] [keenio] and [Segment] [segment].

To derive JSON Schemas from these JSON collections, you can now use a [JSON Path] [json-path] to specify which property in the JSON instances determines the type of the JSON instance, and thus which named JSON Schema the instance will be used to derive.

Let's take these two JSONs:

{% highlight json %}
{ "version": 1,
  "type": "track",
  "userId": "019mr8mf4r",
  "event": "Purchased an Item",
  "properties": {
    "revenue": "39.95",
    "shippingMethod": "2-day" },
  "timestamp" : "2012-12-02T00:30:08.276Z" }
{% endhighlight %}

and:

{% highlight json %}
{ "version": 1,
  "type": "track",
  "userId": "019mr8mf4r",
  "event": "Posted a Comment",
  "properties": {
    "body": "This book is gorgeous!",
    "attachment": false },
  "timestamp" : "2012-12-02T00:28:02.273Z" }
{% endhighlight %}

These JSONs contain information about two different event types, so we should use them to derive two distinct schemas. We can use the new `--schema-by` CLI argument to achieve this:

{% highlight bash %}
$ ./schema-guru-0.2.0 --dir /path/to/all_events --output-dir /home/guru/event_schemas --schema-by $.event
{% endhighlight %}

Now at least two schemas will be written to the `event_schemas` folder: `Purchased_an_Item.json` and `Posted_a_Comment.json`.

If any supplied JSON instance doesn't contain the property at the specified JSON Path, or the property is not a string, then that instance will instead be used to derive a new `unmatched.json` JSON Schema.

<div class="html">
<h2><a name="self-describing">7. Self-describing schemas</a></h2>
</div>

The last new feature is support for [self-describing JSON Schema] [self-describing]. Enabling this feature will add metadata to the schema, specifically the properties: vendor, name, version and format.

For now, the format will always be `jsonschema`. You can specify the other properties manually with the following CLI options:

* `--vendor`, e.g. `--vendor com.snowplowanalytics.snowplow`
* `--name`, e.g. `--name buy_virtual_currency`
* `--version`, e.g. `--version 2-0-0`. The default is 0-1-0 but will be changed to 1-0-0 following [this bug fix] [issue-80]

If you are segmenting schemas with `--schema-by`, then the `name` property will be auto-filled, so the only required option is `--vendor`.

<h2><a name="upgrading">8. Upgrading</a></h2>

Simply download the latest Schema Guru from Bintray:

{% highlight bash %}
$ wget http://dl.bintray.com/snowplow/snowplow-generic/schema_guru_0.2.0.zip
$ unzip schema_guru_0.2.0.zip
{% endhighlight %}

Assuming you have a recent JVM installed, running should be as simple as:

{% highlight bash %}
$ ./schema-guru-0.2.0 --dir /path/to/all_events
{% endhighlight %}

<h2><a name="help">9. Getting help</a></h2>

For more details on this release, please check out the [Schema Guru 0.2.0] [020-release] on GitHub.

We will be building a dedicated wiki for Huskimo to support its usage; in the meantime, if you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

<div class="html">
<h2><a name="roadmap">10. Plans for the next release</a></h2>
</div>

In our next release we are planning to:

* Implement [Apache Spark] [spark] support to allow the derivation of JSON schemas from much larger JSON archives stored in Amazon S3
* Make the new web UI user-friendly and featureful
* Improve the integration of Schema Guru with our upcomming [iglu-utils] [iglu-utils] tool

Stay tuned!

[pic]: /assets/img/blog/2015/06/schema-guru-webui-screenshot.png
[repo]: http://collector.snplow.com/r/tp2?u=https%3A%2F%2Fgithub.com%2Fsnowplow%2Fschema-guru
[webui-demo]: http://schemaguru.snowplowanalytics.com/

[first-release]: http://snowplowanalytics.com/blog/2015/06/03/schema-guru-0.1.0-released-for-deriving-json-schemas-from-jsons/
[020-release]: https://github.com/snowplow/schema-guru/releases/tag/0.2.0

[mixpanel]: https://mixpanel.com/
[keenio]: https://keen.io/
[segment]: https://segment.com/

[spark]: https://spark.apache.org/

[json-path]: http://jsonpath.curiousconcept.com/
[ndjson]: http://ndjson.org/
[levenshtein]: https://en.wikipedia.org/wiki/Levenshtein_distance
[base64-regex]: http://stackoverflow.com/questions/475074/regex-to-parse-or-validate-base64-data/475217#475217

[issues]: https://github.com/snowplow/schema-guru/issues
[issue-80]: https://github.com/snowplow/schema-guru/issues/80
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

[self-describing]: http://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/
[iglu-utils]: https://github.com/snowplow/iglu-utils
