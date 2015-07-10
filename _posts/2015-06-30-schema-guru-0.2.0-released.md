---
layout: post
shortenedlink: Schema Guru 0.2.0 released
title: Schema Guru 0.2.0 released with brand-new Web UI and support of self-describing schema
tags: [json, json schema, schema, iglu, self-describing]
author: Anton
category: Releases
---

Almost month passed since [first release][first-releas] of [Schema Guru][repo], our tools for deriving most precise JSON Schema.
That release was something like proof-of-concept implementing very basic features of JSON Schema.
Now it is time for something more exciting and useful, especially for Snowplow Platform.

This release post will cover the following new features:

1. [Web UI](/blog/2015/06/30/schema-guru-0.2.0-released/#webui)
2. [Newline-delimited JSON](/blog/2015/06/30/schema-guru-0.2.0-released/#ndjson)
3. [Duplicated keys warning](/blog/2015/06/30/schema-guru-0.2.0-released/#duplicates)
4. [Base64 pattern](/blog/2015/06/30/schema-guru-0.2.0-released/#base64)
5. [Enums](/blog/2015/06/30/schema-guru-0.2.0-released/#enums)
6. [Schema segmentation](/blog/2015/06/30/schema-guru-0.2.0-released/#segmentation)
7. [Self-describing Schema](/blog/2015/06/30/schema-guru-0.2.0-released/#self-describing)
8. [Plans for next release](/blog/2015/06/30/schema-guru-0.2.0-released/#plans)

<!--more-->

<div class="html">
<h2><a name="webui">1. Web UI</a></h2>
</div>

First big feature of 0.2.0 is Web UI.
Sometimes you just want to check what your schema will look like and don't want to mess with CLI.
For cases like that we implemented single page app with interface for Schema Guru.
Web UI provides you more control on how your schema changes with each particular JSON instance.
For more precise control you can exclude and include uploaded instances, see diff and even type in your own.
Hint: you can click on instance in the list to show it's preview or parsing error message.

![schema-guru-webui-screenshot][pic]

<div class="html">
<h2><a name="ndjson">2. Newline-delimited JSON</a></h2>
</div>

In many cases, especially for Big Data, JSON output has a streaming nature.
Most common case is logging.
Sometimes it means that we need to store series of instances in one file.
For this purpose exists [Newline delimited JSON specification][ndjson].

Actually there's nothing special in this specification, it states that every JSON instance must exist on one line and delimited with others by newline symbol.
Also it states that file containing this series of JSONs SHOULD have .ndjson extension.
That is important for us, because if you want Web UI handle NDJSON, file MUST have .ndjson extension.

You also can switch CLI app to process NDJSON passing it --ndjson flag.
If you you want to process whole directory of NDJSON, all files also MUST have .ndjson extension.

<div class="html">
<h2><a name="duplicates">3. Duplicated keys warning</a></h2>
</div>

Developers are humans too and thus sometimes make mistakes.
One possible case is messed case, for example when last version of app worked
on Python and used snake_case for it's keys and current version works on Java
and uses camelCase.
Now if Schema Guru encounters suspiciously similar keys it will warn you in both CLI and Web UI.
Good old typos are handled too.


<div class="html">
<h2><a name="base64">4. Base64 pattern</a></h2>
</div>

In the previous release we implementing all string formats JSON Schema specification has.
One more common type of strings in JSON is base64.
Sadly there's no such format in specification.
Therefore, if string matches [base64 regular expression][base64-regex], Schema Guru will add this regex to string's pattern.
It works much the same as format: if even single instance's does not match pattern, it won't be added to final schema.


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
<h2><a name="plans">8. Plans for next release</a></h2>
</div>

In our next release we planning to implement Spark support to distribute Schema derivation, make Web UI more user-friendly and featurefull and also make Schema Guru play well with our upcomming tool [iglu-utils][iglu-utils].


[repo]: https://github.com/snowplow/schema-guru
[first-release]: http://snowplowanalytics.com/blog/2015/06/03/schema-guru-0.1.0-released-for-deriving-json-schemas-from-jsons/
[ndjson]: http://ndjson.org/
[base64-regex]: http://stackoverflow.com/questions/475074/regex-to-parse-or-validate-base64-data/475217#475217
[self-describing]: http://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/
[iglu-utils]: https://github.com/snowplow/iglu-utils
