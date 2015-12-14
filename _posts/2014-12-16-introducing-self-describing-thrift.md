---
layout: post
title: Introducing self-describing Thrift
tags: [thrift, schema, iglu, model]
author: Fred
category: Research
---

At Snowplow we have been thinking about how to version [Thrift][thrift] schemas. This was prompted by the realization that we need to update the [SnowplowRawEvent schema] [snowplow-raw-event-idl], which we use to serialize the Snowplow events received by the Scala Stream Collector. We want to update this in a way that supports further schema evolution in the future.

The rest of this post will discuss our proposed solution to this problem:

1. [The problem](/blog/2014/12/16/introducing-self-describing-thrift/#problem)
2. [The un-versioned approach](/blog/2014/12/16/introducing-self-describing-thrift/#unversioned)
3. [Adding a schema field](/blog/2014/12/16/introducing-self-describing-thrift/#schema)
4. [An example](/blog/2014/12/16/introducing-self-describing-thrift/#example)
5. [Storage](/blog/2014/12/16/introducing-self-describing-thrift/#storage)
6. [Versioning](/blog/2014/12/16/introducing-self-describing-thrift/#versioning)
7. [Namespacing](/blog/2014/12/16/introducing-self-describing-thrift/#namespacing)
8. [Feedback](/blog/2014/12/16/introducing-self-describing-thrift/#feedback)

By the way: if you are not well-acquainted with Thrift, do check out the excellent [Thrift: The Missing Guide] [gupta] by [Diwaker Gupta] [diwakergupta].

<!--more-->

<h2 name="problem">1. The problem</h2>

Simply put, a Thrift schema may change over time. Records generated from different versions of a Thrift schema may need to be handled differently. Given a Thrift record, how can we tell which version of the schema was used to generate it?

<h2 name="unversioned">2. The un-versioned approach</h2>

One approach to this problem is to only update the schema in a backward-compatible way. This creates the following constraints:

* All new fields must be optional
* Important fields cannot be deleted, even if the information they contain is being moved elsewhere

This approach means that only one version of the schema is necessary: the latest version. You can always use the latest version of the schema to deserialize records, then check which fields are defined and use this information to decide how to treat the deserialized object.

However, this approach reduces the flexibility of your schemas by constraining how they can change; this approach is also fragile: you may end up needing to review a lot of fields using a complicated branching process in order to decide how to handle the record.

But more generally, if you have _no_ idea how a given Thrift record was generated, it is very difficult to find out: you would need to reverse engineer the byte payload in some way and compare it to legacy IDLs which use the same tags and datatypes.

For more information on backward compatibility in Thrift schemas, see [this page][backward-compatibility-rules].

<h2 name="schema">3. Adding a schema field</h2>

We solved a similar problem for JSONs using [self-describing JSON] [self-describing-json], an approach where we added a field to all JSONs which identified the schema which describes the JSON. We believe that the same approach can work for other serialization formats, including Thrift -in fact Martin Kleppmann made a similar proposal for Avro in his excellent [blog post on Schema Evolution] [kleppmann].  

In a Thrift schema, each field is assigned a [unique non-negative integer or "tag"] [defining-structs]. This tag is stored in the binary encoding and used in deserialization.

We propose to make Thrift self-describing by adding a "schema" field to all Thrift structs. The schema field would reference the IDL used to define how the byte array should be deserialized. The schema field would always have the same tag - we suggest [31337] [eleet-defn] ("elite" in leetspeak). This number was picked because it is unlikely to be used in existing struct definitions, and thus:

1. We won't accidentally identify non-self-describing Thrifts as self-describing
2. Thrift users can easily upgrade existing Thrifts to be self-describing (as indeed we plan to upgrade our SnowplowRawEvent)

The schema field will be a place to store metadata about the record. Given a self-describing Thrift record of uncertain origin, we can pull out the schema field (because we know its tag number) and use it to decide how to treat the record.

What kind of metadata should we put in the schema field? At Snowplow we are using [Iglu] [iglu] schema URIs very successfully for JSON Schema - let's extend this to Thrift! An example Iglu schema URI for Thrift might look something like this:

{% highlight c %}
iglu:com.snowplowanalytics.snowplow/SimpleEvent/thrift/1-0-0
{% endhighlight %}

One way to pull out the schema field is by attempting to deserialize the record using this schema:

{% highlight c %}
struct SchemaSniffer {
	31337: string schema
}
{% endhighlight %}

Deserializing a self-describing Thrift record into the class generated from this schema will produce a SchemaSniffer object with just one field: the schema.

<h2 name="example">4. An example</h2>

Here is an example using a simplified version of our `SnowplowRawEvent` called `SimpleEvent`.

First, let's consider the prelapsarian IDL before we make it self-describing. We will call this un-versioned Thrift IDL "version 0":

{% highlight c %}
namespace java com.snowplowanalytics.snowplow.collectors.thrift

struct SimpleEvent {
	10: string querystring
	20: optional i64 timestamp
}
{% endhighlight %}

We now change the tag numbering in an incompatible way, changing the `20` tag from referring to the event's timestamp to referring to its body. This change breaks backward compatibility: if we try to deserialize a version 0 record using the version 1 class, the timestamp field will end up in the body field. At this point we also make our records self-describing by adding the schema field:

{% highlight c %}
namespace java com.snowplowanalytics.snowplow.SimpleEvent.thrift.v1

struct SimpleEvent {
	31337: string schema
	10: optional string querystring
	20: optional string body
	30: optional i64 timestamp
	40: optional i64 networkUserId
}
{% endhighlight %}

We make another backward-incompatible change, changing the type of the `networkUserId` field, so we have to bump the model version to v2:

{% highlight c %}
namespace java com.snowplowanalytics.snowplow.SimpleEvent.thrift.v2

struct SimpleEvent {
	31337: string schema
	10: optional string querystring
	20: optional string body
	30: optional i64 timestamp
	40: optional string networkUserId
}
{% endhighlight %}

Now suppose we have a byte array that we believe is some sort of `SimpleEvent`, but we don't know which version of the `SimpleEvent` class should be used to deserialize it.

We first check the schema field by partial deserialization (all code in Scala):

{% highlight scala %}
val sniffer = new SchemaSniffer
new TDeserializer.deserialize(sniffer, byteArray)
{% endhighlight %}

If the schema field is not set, the Thrift is not self-describing, so we deserialize it and handle it with the assumption that it was generated using the version 0 of the `SimpleEvent` class. Otherwise, the schema field tells us exactly which class to use. Here is some Scala code which can handle all three versions of the `SimpleEvent`:

{% highlight scala %}
import com.snowplowanalytics.snowplow.Sniffer
import com.snowplowanalytics.snowplow.legacy.thrift.{SimpleEvent => SE0}
import com.snowplowanalytics.snowplow.SimpleEvent.thrift.v1.{SimpleEvent => SE1}
import com.snowplowanalytics.snowplow.SimpleEvent.thrift.v2.{SimpleEvent => SE2}
import org.apache.thrift.TDeserializer

def handleThriftRecord(record: Array[Byte]) {

  val sniffer = new SchemaSniffer
  new TDeserializer().deserialize(sniffer, record)

  if (!sniffer.isSetSchema) {
    deserializeAndHandleUsingVersion0(record)
  } else {
    sniffer.getSchema match {
      case "iglu:com.snowplowanalytics.snowplow/SimpleEvent/thrift/1-0-0" =>
        deserializeAndHandleUsingVersion1(record)

      case "iglu:com.snowplowanalytics.snowplow/SimpleEvent/thrift/2-0-0" =>
        deserializeAndHandleUsingVersion2(record)

      case s => println(s"Unexpected Thrift schema $s")
    }
  }
}
{% endhighlight %}

<h2 name="storage">5. Schema storage</h2>

We intend to store our Thrift schemas in [Iglu] [iglu], the schema repository from Snowplow Analytics which previously was used exclusively for JSON Schemas. Ideally, whenever a new schema version is pushed to Iglu, it would be automatically compiled and published to Maven.

<h2 name="versioning">6. Versioning</h2>

The version of a Thrift schema stored in Iglu will take the form: `MODEL-REVISION-ADDITION.PATCH`. To go through each of these in turn:

* `MODEL` is incremented when a change is made which breaks the rules of Thrift backward compatibility, such as changing the type of a field.
* `REVISION` is a change which is backward compatible but not forward compatible. Records created from the old version of the schema can be deserialized using the new schema, but not the other way around. Example: adding a new field to a union type
* `ADDITION` is a change which is both backward compatible and forward compatible. The previous version of the schema can be used to deserialize records created from the new version of the schema, and vice versa. Example: adding a new optional field
* `PATCH` is incremented for changes which fix mistakes in the definition of the schema, rather than changes to the model of the data

The first version of a given schema will always be 1-0-0.0.

<h2 name="namespacing">7. Namespacing</h2>

Namespaces in Thrift are similar to packages in Java or modules in Ruby. For self-describing Thrifts, the namespace should have four parts which map onto the four components of an Iglu schema URI:

1. The reverse domain name of the creator of the schema, e.g. `com.snowplowanalytics.snowplow`
2. The name of the schema, e.g. `SimpleEvent`
3. The type of the schema, always `thrift` for Thrift schemas
4. The model version, e.g. `v1`. The "v" before the version number is necessary to make the package name legal in some languages (such as Java)

Note that the Thrift namespace only includes the model version, not the revision, addition or patch. You will always want to work with the latest `REVISION-ADDITION.PATCH` available to you: it should only be different `MODEL`s that you will want to be able to distinguish between in the same codebase.

<h2 name="feedback">8. Feedback</h2>

This proposal is still at the draft stage and we are interested in hearing about any potential problems or alternative approaches. In particular, we would be interested in any thoughts on how our approach should handle the evolution of Thrift Typedefs, Enums or Constants.

If you have any thoughts, please [get in touch][contact]!

[thrift]: https://thrift.apache.org/
[gupta]: http://diwakergupta.github.io/thrift-missing-guide
[kleppmann]: http://martin.kleppmann.com/2012/12/05/schema-evolution-in-avro-protocol-buffers-thrift.html
[self-describing-json]: http://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/

[snowplow-raw-event-idl]: https://github.com/snowplow/snowplow/blob/feature/ssc-post-support/2-collectors/thrift-raw-event/src/main/thrift/snowplow-raw-event.thrift
[defining-structs]: http://diwakergupta.github.io/thrift-missing-guide/#_defining_structs
[diwakergupta]: https://github.com/diwakergupta

[eleet-defn]: http://www.urbandictionary.com/define.php?term=31337

[iglu]: http://collector.snplow.com/r/tp2?u=https%3A%2F%2Fgithub.com%2Fsnowplow%2Figlu
[contact]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[backward-compatibility-rules]: http://architects.dzone.com/articles/big-data-chapter-excerpt
