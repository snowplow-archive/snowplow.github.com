---
layout: post
title: Schema Guru 0.1.0 released for deriving JSON Schemas from JSONs
title-short: Schema Guru 0.1.0
tags: [json, json schema, schema, iglu]
author: Anton
category: Releases
---

We're pleased to announce the first release of [Schema Guru] [schema-guru],
a tool for automatic deriving JSON Schemas from a collection of JSON instances. This release is part of a new R&D focus at Snowplow Analytics in improving the tooling available around JSON Schema, a technology used widely in our own [Snowplow] [snowplow] and [Iglu] [iglu] projects.

![schema-guru-shape-sorter] [pic]

Read on after the fold for:

1. [Why Schema Guru?](/blog/2015/06/03/schema-guru-0.1.0-released-for-deriving-json-schemas-from-jsons/#why)
2. [Current features](/blog/2015/06/03/schema-guru-0.1.0-released-for-deriving-json-schemas-from-jsons/#features)
3. [Design principles](/blog/2015/06/03/schema-guru-0.1.0-released-for-deriving-json-schemas-from-jsons/#principles)
4. [A fuller example](/blog/2015/06/03/schema-guru-0.1.0-released-for-deriving-json-schemas-from-jsons/#eg)
5. [Getting help](/blog/2015/06/03/schema-guru-0.1.0-released-for-deriving-json-schemas-from-jsons/#help)
6. [Roadmap](/blog/2015/06/03/schema-guru-0.1.0-released-for-deriving-json-schemas-from-jsons/#roadmap)

<!--more-->

<div class="html">
<h2><a name="why">1. Why Schema Guru?</a></h2>
</div>

If you want several different apps or services to communicate, at some point you will need to describe a protocol for this communication. [JSON Schema] [json-schema] can be very helpful here: it is a declarative format for expressing rules about JSON structures.

So you open your text editor and start writing your JSON Schema, specifying all the
keys, types, validation parameters, nested objects and so on. But this quickly becomes painful - especially if your instances including lots
of keys and complex structure where objects nest deeply in other objects. And things get even worse if your developers have already generated JSON instances somehow and you need to cross-check these instances against your schema.

What if we could automate this process somehow? There are a few pre-existing tools,
most notably the [jsonschema.net website] [jsonschema-net]. Unfortunately, these tools all derive your schema from just one JSON instance. This is problematic because JSONs often have very "jagged edges": two JSON instances which should belong to the same schema may have a different subset of properties, types and formats.

So, to generate a JSON Schema safely, we need to work from as many JSON instances as possible. Schema Guru lets us derive our schema from a whole collection of JSON instances: the law of large numbers should do the rest!

<div class="html">
<h2><a name="features">2. Current features</a></h2>
</div>

The initial 0.1.0 release of Schema Guru has the following features:

+ Derive all [types] [schema-types] defined in JSON Schema specification
+ Derive all string [formats] [schema-formats] defined in specification
+ Derive integer ranges according byte size and possibility to be negative
+ Derive product types (e.g. if one field is integer and string in different instances)

<div class="html">
<h2><a name="principles">3. Design principles</a></h2>
</div>

Our deriving of JSON Schemas from multiple instances is possible due to the observation that a JSON Schema is a [semigroup] [semigroup] with an associative binary merge operation. For example, the merger of these two valid schemas:

{% highlight json %}
{"key": {"type": "integer"}} merge {"key": {"type": "string"}}
{% endhighlight %}

Will result in another valid schema:

{% highlight json %}
{"key": {"type": ["integer", "string"]}}
{% endhighlight %}

Which is basically a product type. To put it another way: the merger of two JSON Schemas yields a third, equally- or more-permissive schema, against which any JSON instance which validates against either or both of the two parent schemas will also validate.

The fact that this merge operation is [associative] [associative] means that we should be able to scale Schema Guru to massively parallel schema-derivation workloads, running in Hadoop, Spark or similar.

<div class="html">
<h2><a name="eg">4. A fuller example</a></h2>
</div>

From the last example we can see that Schema Guru supports JSON Schema's various types. But Schema Guru can also detect the various JSON Schema validation properties, such as `format` or `maximum`.

Let's give an example. Here is a JSON instance:

{% highlight json %}
{ "event": {
    "id": "f1e89550-7fda-11e4-bbe8-22000ad9bf74",
    "length": 42 }}
{% endhighlight %}

And a second one:

{% highlight json %}
{ "event": {
    "id": 123,
    "length": null }}
{% endhighlight %}

Running Schema Guru against both of these instances generates the following JSON Schema:

{% highlight json %}
{ "type" : "object",
  "properties" : {
    "event" : {
      "type" : "object",
      "properties" : {
        "id" : {
          "type" : [ "string", "integer" ],
          "format" : "uuid",
          "minimum" : 0,
          "maximum" : 32767 },
        "length" : {
          "type" : [ "integer", "null" ],
          "minimum" : 0,
          "maximum" : 32767 } },
      "additionalProperties" : false } },
  "additionalProperties" : false
{% endhighlight %}

You can see that our generated JSON Schema now contains two properties, where:

1. The `id` property could be a UUID string or a small integer
2. The `length` property could be a small integer or null

As you can see we generate a pretty strict schema, where the `additionalProperties` setting rules out any properties not observed in the instances fed to Schema Guru. We're planning on adding options to Schema Guru to make these types of settings more "tunable".

<h2><a name="help">5. Getting help</a></h2>

Schema Guru is of course very young - so we look forward to community feedback on what new features to prioritize. Feel free to [get in touch][talk-to-us] or [raise an issue][issues] on GitHub!

<h2><a name="roadmap">6. Roadmap</a></h2>

We have lots of features planned for Schema Guru:

* A web UI with ability to adjust you schema
* Support for other output formats such as [Avro] [avro]
* Enum detection
* Warnings about suspiciously-similar keys
* Auto-submitting generated schemas to your [Iglu repository] [iglu]
* Outputting [self-describing JSON Schemas] [self-describing-jsons]
* Running Schema Guru as a Spark job on JSON collections stored in Amazon S3 (thanks to semigroups)
* ...and much more, ideas are coming up every day!

[pic]: /assets/img/blog/2015/06/schema-guru-shape-sorter.jpg

[json-schema]: http://json-schema.org/
[schema-types]: http://json-schema.org/latest/json-schema-core.html#anchor8
[schema-formats]: http://json-schema.org/latest/json-schema-validation.html#anchor104
[self-describing-jsons]: http://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/
[semigroup]: http://en.wikipedia.org/wiki/Semigroup
[associative]: http://en.wikipedia.org/wiki/Associative_property
[avro]: https://avro.apache.org/
[schema-guru]: http://collector.snplow.com/r/tp2?u=https%3A%2F%2Fgithub.com%2Fsnowplow%2Fschema-guru

[snowplow]: http://collector.snplow.com/r/tp2?u=https%3A%2F%2Fgithub.com%2Fsnowplow%2Fsnowplow
[iglu]: http://collector.snplow.com/r/tp2?u=https%3A%2F%2Fgithub.com%2Fsnowplow%2Figlu
[jsonschema-net]: http://jsonschema.net/#/

[issues]: https://github.com/snowplow/schema-guru/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
