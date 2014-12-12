---
layout: post
shortenedlink: Self-describing Thrift
title: Self-describing Thrift
tags: [thrift, schema, iglu, model]
author: Fred
category: Research
---

At Snowplow we have been thinking about versioning [Thrift][thrift] schemas. This was prompted by the realization that once we update the SnowplowRawEvent schema (used to serialize and deserialize the Snowplow events received by the Scala Stream Collector), legacy Thrift records generated using the old schema will no longer pass the enrichment process.

The rest of this post will discuss our proposed solution to this problem.

1. [The problem](/blog/2014/12/xx/self-describing-thrift/#problem)
2. [The unversioned approach](/blog/2014/12/xx/self-describing-thrift/#unversioned)
3. [Adding a schema field](/blog/2014/12/xx/self-describing-thrift/#field)
4. [An example](/blog/2014/12/xx/self-describing-thrift/#example)
5. [Storage](/blog/2014/12/xx/self-describing-thrift/#storage)
6. [Version structure](/blog/2014/12/xx/self-describing-thrift/#version)
7. [Feedback](/blog/2014/12/xx/self-describing-thrift/#feedback)

<h2 name="problem">1. The problem</h2>

A Thrift schema may change over time. Records generated from different versions of a Thrift schema may need to be handled differently. Given a Thrift record, how can we tell which version of the schema was used to generate it?

<h2 name="unversioned">2. The unversioned approach</h2>

One approach to this problem is to only update the schema in a backward-compatible way. This creates the following constraints:

* All new fields must be optional
* Important fields cannot be deleted, even if the information they contain is being moved elsewhere.

This approach means that only one version of the schema is necessary: the latest version. You can always use the latest version of the schema to deserialize records, then check which fields are defined and use this information to decide how to treat the deserialized object.

As well as reducing the flexibility of your schemas by constraining how they can change, this approach is fragile: you may end up needing to check a lot of fields using a complicated branching process in order to decide how to handle the record.

More generally, if don't have any idea how a given Thrift record was generated, it is very difficult to find out: you would need to check which tag numbers are present in the binary format and search for legacy IDLs which use the same tags.

<h2 name="field">3. Adding a schema field</h2>

We solved a similar problem for JSONs using [self-describing JSON][self-describing-json], adding a field to all incoming JSONs which pointed to the schema which describes the JSON. A similar approach works for Thrift.

In a Thrift schema, each field is assigned a tag. It must be a nonnegative integer. This tag is stored in the binary encoding and used in deserialization.

We propose to make Thrift self-describing by adding a "schema" field to all Thrift structs. The schema field would point to the IDL used to define how the byte array should be deserialized. The schema field would always have the same tag - we suggest 31337. This number was picked because it is unlikely to be used in existing struct definitions, making it unlikely that non-self-describing byte arrays will be inaccurately identified as self-describing.

The schema field is a place to store metadata about the record. Given a self-describing Thrift record of uncertain origin, we can pull out the schema field (because we know its tag number) and use it to decide how to treat the record.

One way to pull out the schema field is by attempting to deserialize the record using this schema:

```
struct Sniffer {
	31337: string schema
}
```

Deserializing a self-describing Thrift record into the Sniffer class generated from the above schema will result in a Sniffer object with just one field: the schema.

<h2 name="example">4. An example</h2>

Here is an example using a simplified version of SnowplowRawEvent called SimpleEvent.

First, the IDL before we make it self-describing. We will call this version "version 0".

```
namespace java com.snowplowanalytics.snowplow.collectors.thrift

struct EventClass {
	10: string querystring
	20: optional i64 timestamp
}
```

We now change the tag numbering in an incompatible way, changing the 20 tag from referring to the event's timestamp to referring to its body. This change breaks backward compatibility: if we try to deserialize a version 0 record using the version 1 class, the timestamp field will end up in the body field. At this point we make our records self-describing by adding the schema field:

```
namespace java com.snowplowanalytics.snowplow.SimpleEvent.thrift.v1

struct SimpleEvent {
	31337: string schema
	10: optional string querystring
	20: optional string body
	30: optional i64 timestamp
	40: optional i64 networkUserId
}
```

We make another backward-incompatible change, changing the type of the networkUserId field, so we have to bump the version to v2:

```
namespace java com.snowplowanalytics.snowplow.SimpleEvent.thrift.v2

struct SimpleEvent {
	31337: string schema
	10: optional string querystring
	20: optional string body
	30: optional i64 timestamp
	40: optional string networkUserId
}
```

Now suppose we have a byte array which we believe is some sort of SimpleEvent, but we don't know which version of the SimpleEvent class should be used to deserialize it.

We first check the schema field by partial deserialization:

```scala
val sniffer = new Sniffer
new TDeserializer.deserialize(sniffer, byteArray)
```

If the schema field is not set, the Thrift is not self-describing, so we deserialize it and handle it with the assumption that it was generated using the version 0 of the SimpleEvent class. Otherwise, the schema field tells us exactly which class to use.

```scala
import com.snowplowanalytics.snowplow.Sniffer
import com.snowplowanalytics.snowplow.collectors.thrift.{SnowplowRawEvent => SRE0}
import com.snowplowanalytics.snowplow.SnowplowRawEvent.thrift.v1.{SnowplowRawEvent => SRE1}
import com.snowplowanalytics.snowplow.SnowplowRawEvent.thrift.v2.{SnowplowRawEvent => SRE2}
import org.apache.thrift.TDeserializer

def handleThriftRecord(record: Array[Byte]) {

	val sniffer = new Sniffer
	new TDeserializer().deserialize(sniffer, record)

	if (! sniffer.isSetSchema) {
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
```

<h2 name="storage">5. Schema storage</h2>

We intend to store our Thrift schemas in [Iglu][iglu], the Snowplow schema repository which previously just contained JSON schemas. Whenever a new schema version is pushed to Iglu, it will be automatically compiled and published to Maven.

<h2 name="version">6. Version structure</h2>

The version of a Thrift schema stored in Iglu has three digits: model, addition, and patch.

Model: Incremented when a change is made which breaks the rules of Thrift backward compatibility, such as changing the type of a field.
Addition: Incremented for backward-compatible changes.
Patch: Incremented for changes which fix mistakes rather than changes to the model of the data.

The package of the generated class has four parts: the reverse domain name of the creator of the schema (e.g. "com.snowplowanalytics.snowplow"), the name of the schema (e.g. "SnowplowRawEvent"), the type of the schema (always "thrift" for Thrift schemas), and the version (e.g. "v1"). The "v" before the version number is necessary to make the package name legal. Note that the package name only includes the model version, not the addition or patch. Because of the way that addition is defined, there is never any downside to using the latest addition for a given model. And since patches are essentially bugfixes, there is no reason not to use the latest patch.

<h2 name="feedback">7. Feedback</h2>

This proposal is still at the draft stage so we are interested in hearing about any potential problems or alternative approaches. If you have any thoughts, please [get in touch][contact]!

[thrift]: https://thrift.apache.org/
[self-describing-json]: http://snowplowanalytics.com/blog/2014/12/xx/self-describing-thrift/
[iglu]: https://github.com/snowplow/iglu
[contact]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
