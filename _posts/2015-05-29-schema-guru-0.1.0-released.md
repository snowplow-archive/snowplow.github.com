---
layout: post
shortenedlink: Schema Guru 0.1.0 released
title: Schema Guru 0.1.0 released
tags: [json, json schema, schema, release]
author: Anton
category: Releases
---

We're pleased to announce the first release of [Schema Guru] [schema-guru],
a tool for automatic deriving JSON Schema.

# Why

If you're planning to build up a communication between several apps, probably it
would be a good idea to somehow describe a protocol of this communication.
Including structure, types and validation parameters.
This is where [JSON Schema] [json-schema] could be very helpful.
JSON Schema is a popular format for JSON data description.

All you need to do is open text editor and write your schema specifying all 
keys, types, validation parameters, nested objects etc. Apparently you find out
that it is a very intricate task, especially if your instances including tens
of keys and some complex structure where many objects deeply nested in others.
And things are getting even worse if you already have a working JSON source and 
need to compare all the instances with schema key-by-key.

On this moment you've probably came up with conclusion that process like that
need to be automated somehow. And luckily for you there're few tools on the net
that could help you to generate JSON Schema. Sadly, all of them have one
crucial drawback: they derive schema from just one JSON instance.
This means that if your instance for some reasons do not include some field,
you must manually find out a right place and write down that field with all
it's validation parameters. And that's often the case, because there's such
thing as optional keys. And one more drawback of this approach is it's 
inaccuracy: for example, if you have a field which value for some reasons is IP
address, our tool could make a decision that this field is always consists of
IP address. And we have no more data to approve or disapprove this assumption.
So all these tools just do not make assumptions about validation rules, and
sometimes that is crucial because JSON Schema main goal is to provide as more
information about a field as possible. We want to know everything about our JSON.

So, JSON Schema by it's nature is a tool which intended to work on many JSON
instances, not just one. This is where Schema Guru comes out. We're trying to
derive schema based on as much information as you can provide. Law of large
numbers reduces mistakes to minimal values. If some field has incopatible properties
in different instances our type results in a coproduct, least specific type,
each instance can be validated against. On the other hand with large data set
we can be sure about specific limitations.

# Current features

+ Derive all [types] [schema-types] defined in JSON Schema specification
+ Derive all string [formats] [schema-formats] defined in specification 
+ Derive integer ranges according byte size and possibility to be negative
+ Derive product types (e.g. if one field is integer and string in different instances)

# Principles of work

In point of fact deriving of JSON Schemas is possible due to assumption that we 
can observe JSON Schema as a [semigroup] (and a monoid actually) with associative
binary merge operation. For example, merge of these two valid schemas 

```
{"key": {"type": "integer"}} merge {"key": {"type": "string"}}
```

Will result in another valid schema:

{% highlight json %}
{"key": {"type": ["integer", "string"]}}
{% endhighlight %}

Which is basically product type.
It isn't hard to prove this operation is associative.

# Example

From the last example we can see that Schema Guru supports product types.
Besides of types itself in result schema remains validation properties 
(such as "format" or "maximum") each of which providently applicable only to
one concrete type.

For example, in following instances we're deriving schema from from object
where field "id" is both string with UUID format and integer:

{% highlight json %}
{ "event": {
    "id": "f1e89550-7fda-11e4-bbe8-22000ad9bf74",
    "length": 42 }}
{% endhighlight %}


{% highlight json %}
{ "event": {
    "id": 123,
    "length": null }}
{% endhighlight %}

Which results in following schema:

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

As you can see we provide pretty strict schema, where "additionalProperties"
disallow you to add any other fields. Sure thing! After million of instances you
must be sure there's no way to miss something.

# What's next

+ Web UI with ability to adjust you schema 
+ Support of other output formats such as [Avro]
+ Enums 
+ Warnings about suspiciously similar keys 
+ Auto-submit schemas on [iglu]
+ Output a [self-descring JSON Schemas] [self-describing-jsons]
+ Add ability to run it as Spark job (thanks to semigroups)
+ ...and much more, ideas are coming up every day.

[json-schema]: http://json-schema.org/
[schema-types]: http://json-schema.org/latest/json-schema-core.html#anchor8
[schema-formats]: http://json-schema.org/latest/json-schema-validation.html#anchor104
[iglu]: http://snowplowanalytics.com/blog/2014/07/01/iglu-schema-repository-released/
[self-describing-jsons]: http://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/
[semigroup]: http://en.wikipedia.org/wiki/Semigroup
[avro]: https://avro.apache.org/
[schema-guru]: https://github.com/snowplow/schema-guru
