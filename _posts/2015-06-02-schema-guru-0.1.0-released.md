---
layout: post
shortenedlink: Schema Guru 0.1.0 released
title: Schema Guru 0.1.0 released for deriving JSON Schemas from JSONs
tags: [json, json schema, schema, iglu]
author: Anton
category: Releases
---

We're pleased to announce the first release of [Schema Guru] [schema-guru],
a tool for automatic deriving JSON Schemas from a collection of JSON instances.

Read on after the fold for:

1. [Why Schema Guru?](/blog/2015/06/02/schema-guru-0.1.0-released-for-deriving-json-schemas-from-jsons/#why)
2. [Current features](/blog/2015/06/02/schema-guru-0.1.0-released-for-deriving-json-schemas-from-jsons/#features)
3. [Principles of work](/blog/2015/06/02/schema-guru-0.1.0-released-for-deriving-json-schemas-from-jsons/#principles)
4. [An example](/blog/2015/06/02/schema-guru-0.1.0-released-for-deriving-json-schemas-from-jsons/#eg)
5. [Getting help](/blog/2015/06/02/schema-guru-0.1.0-released-for-deriving-json-schemas-from-jsons/#help)
6. [Roadmap](/blog/2015/06/02/schema-guru-0.1.0-released-for-deriving-json-schemas-from-jsons/#roadmap)

<!--more-->

<div class="html">
<h2><a name="why">1. Why Schema Guru?</a></h2>
</div>

If you're planning to communicate between several different apps or services, it's invariably a good idea to somehow describe a protocol of this communication, including entity structures, types and validation parameters. This is where [JSON Schema] [json-schema] can be very helpful: JSON Schema is a popular format for JSON data description, used widely in our own [Snowplow] [snowplow] and [Iglu] [iglu] projects.

So you open your text editor and start writing your schema specifying all 
keys, types, validation parameters, nested objects etc. But you will quickly find that it is a very intricate task, especially if your instances including tens
of keys and some complex structure where many objects deeply nested in others.
And things get even worse if you have already generated JSON instances somehow and 
need to compare all the instances with the schema key-by-key.

What if we could automate this process somehow? There are a few tools
that could help you to generate JSON Schema, such as the [jsonschema.net website] [jsonschema-net].
Unfortunately, all of the existing tools derive your schema from just one JSON instance. This is problematic, because JSON instances often have very "jagged edges":

1. JSON Schema supports optional properties - so any given JSON may not contain all of the
   properties that should belong in the JSON Schema
2. JSON Schema supports rich validation rules (e.g. this String is an IP address) - but some
   valid instances of the schema may not meet those rules 

So, to generate a JSON Schema we need to work on as many JSON
instances as possible. Schema Guru works on a folder full of JSON instances: the law of large
numbers should give us stable long-term results for our schemas. For example, if some field has incompatible properties
in different instances, Schema Guru will generate a coproduct, i.e. the least specific type which every
each instance can be validated against.

<div class="html">
<h2><a name="features">2. Current features</a></h2>
</div>

The initial 0.1.0 release of Schema Guru has the following features:

+ Derive all [types] [schema-types] defined in JSON Schema specification
+ Derive all string [formats] [schema-formats] defined in specification 
+ Derive integer ranges according byte size and possibility to be negative
+ Derive product types (e.g. if one field is integer and string in different instances)

<div class="html">
<h2><a name="principles">3. Principles of work</a></h2>
</div>

Our deriving of JSON Schemas is possible due to the observation that a JSON Schema is a [semigroup] [semigroup] with associative
binary merge operation. For example, the merger of these two valid schemas:

{% highlight json %}
{"key": {"type": "integer"}} merge {"key": {"type": "string"}}
{% endhighlight %}

Will result in another valid schema:

{% highlight json %}
{"key": {"type": ["integer", "string"]}}
{% endhighlight %}

Which is basically a product type. The fact that this operation is associative means that we should be able to scale Schema Guru to massively parallel workloads running in Hadoop, Spark or similar.

<div class="html">
<h2><a name="eg">4. An example</a></h2>
</div>

From the last example we can see that Schema Guru supports JSON Schema's various types. Schema Guru can also detect JSON Schema's various validation properties, such as "format" or "maximum".

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

Running Schema Guru on both of these instances results in the following JSON Schema:

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

You can see that our JSON Schema contains two properties, where:

1. The `id` property could be a UUID String or a small Integer
2. The `length` property could be a small Integer or null

As you can see we generate a pretty strict schema, where the "additionalProperties" setting rules out 
any properties not observed in the instances fed to Schema Guru.

<h2><a name="help">5. Getting help</a></h2>

Schema Guru is of course very young - so we look forward to community feedback on what new features to prioritize. Feel free to [get in touch][talk-to-us] or [raise an issue][issues] on GitHub!

<h2><a name="roadmap">6. Roadmap</a></h2>

We have lots of features planned for Schema Guru:

* A web UI with ability to adjust you schema 
* Support for other output formats such as [Avro] [avro]
* Enum detection
* Warnings about suspiciously similar keys 
* Auto-submitting generated schemas to your [Iglu] [repository]
* Outputting [self-descring JSON Schemas] [self-describing-jsons]
* Running Schema Guru as a Spark job on JSON collections in Amazon S3 (thanks to semigroups)
* ...and much more, ideas are coming up every day!

[json-schema]: http://json-schema.org/
[schema-types]: http://json-schema.org/latest/json-schema-core.html#anchor8
[schema-formats]: http://json-schema.org/latest/json-schema-validation.html#anchor104
[self-describing-jsons]: http://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/
[semigroup]: http://en.wikipedia.org/wiki/Semigroup
[avro]: https://avro.apache.org/
[schema-guru]: https://github.com/snowplow/schema-guru

[snowplow]: https://github.com/snowplow/snowplow
[iglu]: https://github.com/snowplow/iglu
[jsonschema-net]: http://jsonschema.net/#/

[issues]: https://github.com/snowplow/snowplow-scala-tracker/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
