---
layout: post
shortenedlink: Schema Guru 0.2.0 released
title: Schema Guru 0.2.0 released with brand-new web UI and support for self-describing JSON Schema
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
7. [Self-describing Schema](/blog/2015/07/05/schema-guru-0.2.0-released/#self-describing)
8. [Plans for the next release](/blog/2015/07/05/schema-guru-0.2.0-released/#roadmap)

<!--more-->

<div class="html">
<h2><a name="webui">1. Web UI</a></h2>
</div>

The fFirst big feature of version 0.2.0 is the new web UI. Sometimes you just want to create a schema quickly and don't want to mess with CLI.
For this use case we implemented a single page web app for Schema Guru. The web UI also shows you a "diff" of how your schema changes with the addition of each extra JSON instance:

![schema-guru-webui-screenshot][pic]

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

Like Schema Guru detecting a string format, if even a single input JSON instance does not match pattern, then the pattern won't be added to the final schema.

<div class="html">
<h2><a name="enums">5. Enums</a></h2>
</div>

One more JSON Schema feature - enums.
You can specify enum cardinality tolerance in both CLI and Web UI and if set of all values of key is less or equal to this cardinality, your final schema will contain enum property.
By default enum recognition is disabled.
In future versions we plan to add predefined enum sets like ISO 4217, ISO 3166-1, months, days of weeks, etc.


<div class="html">
<h2><a name="segmentation">6. Schema segmentation</a></h2>
</div>

Sometimes vendor outputs big number of slightly similar, but still different instances and adds metainformation to it.
In that case to separate different types of Schema we can specify JSON Path to property with Schema's name.
For example:

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

and

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

These schemas obviously contains information about different events, but they has common origin.
We can specify path to event name and output directory:

{% highlight bash %}
$ ./schema-guru-0.2.0 --dir /path/to/all_events --output-dir /home/guru/event_schemas --schema-by $.event
{% endhighlight %}

Now in event_schemas directory will appear at least two schemas: Purchased_an_Item.json and Posted_a_Comment.json.
Notice that Schema Guru expect this path will be plain string.
If path haven't found or it isn't plain string schema will named unmatched.json and all "unmatched" schemas will be merged together.

<div class="html">
<h2><a name="self-describing">7. Self-describing Schema</a></h2>
</div>

Last feature is support of [Self-describing Schemas][self-describing].
To describe it very shortly and roughly: it adds meta information about schema to itself with following properties: vendor, name, version and format.
In our case format will always contain "jsonschema" (at least for now).
Another properties you need to specify manually with following CLI options: --vendor, --name and --version (default is 0-1-0) respectively.
One more additional feature is name property autofill in case of schema segmentation: name property and filename will be the same and thus only required option will be --vendor.


<div class="html">
<h2><a name="roadmap">8. Plans for the next release</a></h2>
</div>

In our next release we are planning to:

* Implement Spark support to distribute Schema derivation, make Web UI more user-friendly and featurefull and also make Schema Guru play well with our upcomming tool [iglu-utils][iglu-utils].


[repo]: https://github.com/snowplow/schema-guru
[first-release]: http://snowplowanalytics.com/blog/2015/06/03/schema-guru-0.1.0-released-for-deriving-json-schemas-from-jsons/
[ndjson]: http://ndjson.org/
[levenshtein]: https://en.wikipedia.org/wiki/Levenshtein_distance
[base64-regex]: http://stackoverflow.com/questions/475074/regex-to-parse-or-validate-base64-data/475217#475217
[self-describing]: http://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/
[iglu-utils]: https://github.com/snowplow/iglu-utils
