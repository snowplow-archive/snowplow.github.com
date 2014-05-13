---
layout: post
shortenedlink: Introducing SchemaVer for semantic versioning of schemas
title: Introducing SchemaVer for semantic versioning of schemas
tags: [version, versioning, schema, semver, schemaver]
author: Alex
category: Research
---

As the old joke goes, there are only two types of developer: the developer who versions his code, and developer_new_newer_newest_v2. As we start to re-structure Snowplow away from [implicit data models] [enriched-event-pojo] and [wiki-based tracker protocols] [tracker-protocol] towards formal schemas (initially Thrift and JSON Schema, later AVRO), we have started to think about schema versioning.

Proper versioning software is taken for granted these days - there are various different approaches, but at Snowplow we are big believers in [Semantic Versioning] [semver] (SemVer for short). Here is specification author Tom Preston-Werner on calling it semantic versioning:

> Under this scheme, version numbers and the way they change convey meaning about the underlying code and what has been modified from one version to the next.

We looked around and couldn't find much prior art around semantic versioning of data schemas. The AVRO community seem to have gone down [something of a rabbithole] [avro-schema-rabbithole] with their schema versioning - something we were eager to avoid at Snowplow.

Our initial thought was just to fall back to SemVer for schema versioning - after all, database table definitions are a form of schema, and we have been using SemVer for ours ([example] [redshift-ddl]) without issue for some time. However, the more we dug into it, the more we realized that SemVer was not the right fit, and we needed something new - something we are called SchemaVer

In the rest of the post, I will go through:

1. SemVer - providing some background for those who are unfamiliar with it
2. SchemaVer - providing our formula for using SchemaVer
3. Design considerations - explaining why SchemaVer is structured the way it is
4. Use cases for SchemaVer - where should we be using SchemaVer
5. Call for feedback - SchemaVer is a draft, and we would love feedback before we formalize it in Snowplow

<!--more-->

<div class="html">
<h2><a name="semver">1. SemVer</a></h2>
</div>

If you are a business/web analyst or data scientist rather than coder, you may not be familiar with [Semantic Versioning] [semver]. SemVer provides a simple formula for managing the version of your software as you roll out new versions. That formula has some edge cases, but at its simplest it looks like:

> Given a version number MAJOR.MINOR.PATCH, increment the:
>
>    MAJOR version when you make incompatible API changes,
>    MINOR version when you add functionality in a backwards-compatible manner, and
>    PATCH version when you make backwards-compatible bug fixes.

It is important to understand what backwards compatibility means here. For SemVer, backwards compatibility is about providing guarantees (through version numbers), that a piece of software can update its dependency on a SemVer-respecting dependency without either:

1. Its code interfacing with the dependency's public API breaking
2. The semantics of the dependency's pre-existing functionality changing - e.g. `.multiply()` suddenly starts dividing 

Semantic Versioning is a great fit for managing the evolution of software in a way that protects the users of that software. But it's not a great fit for versioning schemas, because schemas are not used in the same way as software is.

<div class="html">
<h2><a name="schemaver">2. SchemaVer</a></h2>
</div>

When versioning a data schema, we are concerned with the backwards-compatibility between the new schema and existing data represented in earlier versions of the schema. This is the fundamental building block of SchemaVer, and explains the divergence from SemVer. Let's propose a simple formula for SchemaVer:

Given a version number `MODEL-REVISION-ADDITION`, increment the:

* `MODEL` when you make a breaking schema change which will prevent interaction with all historical data
* `REVISION` when you make a schema change which _may_ prevent interaction with some historical data
* `ADDITION` when you make a schema change that is compatible with all historical data

Syntactically this feels similar to SemVer - but as you can see from the increment rules, the semantics of each element are very different from SemVer.

Let's make SchemaVer a little more concrete with some examples using JSON Schema, in reverse order:

<div class="html">
<h3><a name="addition">2.1 `ADDITION`</a></h3>
</div>

We have an existing JSON Schema, let's call this 1-0-0:

{% highlight json %}
{
	"$schema": "http://json-schema.org/schema#",
	"type": "object",
	"properties": {
		"bannerId": {
			"type": "string"
		}
	},
	"required": ["bannerId"],
	"additionalProperties": false
}
{% endhighlight %}

Now we want to add an additional field to our schema:

{% highlight json %}
{
	"$schema": "http://json-schema.org/schema#",
	"type": "object",
	"properties": {
		"bannerId": {
			"type": "string"
		},
		"impressionId": {
			"type": "string"
		}
	},
	"required": ["bannerId"],
	"additionalProperties": false
}
{% endhighlight %}

Because our new `impressionId` field is **not** a required field, and because version 1-0-0 had `additionalProperties` set to false, we know that all historical data will work with this new schema. Therefore we are looking at an `ADDITION`, bumping the schema version to 1-0-1.

<div class="html">
<h3><a name="addition">2.2 `REVISION`</a></h3>
</div>

Let's now make our JSON Schema support `additionalProperties` - constituting another `ADDITION`, so we are now on 1-0-2:

{% highlight json %}
{
	"$schema": "http://json-schema.org/schema#",
	"type": "object",
	"properties": {
		"bannerId": {
			"type": "string"
		},
		"impressionId": {
			"type": "string"
		}
	},
	"required": ["bannerId"],
	"additionalProperties": true
}
{% endhighlight %}

After a while, we add a new field, `cost`:

{% highlight json %}
{
	"$schema": "http://json-schema.org/schema#",
	"type": "object",
	"properties": {
		"bannerId": {
			"type": "string"
		},
		"impressionId": {
			"type": "string"
		},
		"cost": {
			"type": "number",
			"minimum": 0
		}
	},
	"required": ["bannerId"],
	"additionalProperties": true
}
{% endhighlight %}

Will this new schema validate all historical data? It's not definite - because there could be historical JSONs where the analyst added their own `cost` field, possibly set to a string rather than a number (or a negative number). So we are effectively making a `REVISION` to the data schema - bumping to 1-1-0 (resetting `ADDITION` to 0).

<div class="html">
<h3><a name="addition">2.3 `MODEL`</a></h3>
</div>

Oh dear. We have just realized that we can identify our clicks through a unique `clickId` - no need to be storing the `bannerId` or `impressionId`. Here is our new JSON Schema:

{% highlight json %}
{
	"$schema": "http://json-schema.org/schema#",
	"type": "object",
	"properties": {
		"clickId": {
			"type": "string"
		},
		"cost": {
			"type": "number",
			"minimum": 0
		}
	},
	"required": ["clickId"],
	"additionalProperties": false
}
{% endhighlight %}

We have changed our `MODEL` - we can have no reasonable expectation that any of the historical data can interact with this schema. So our new version is `2-0-0`. We also decided to use the "reboot" of the `MODEL` to switch `additionalProperties` back to false, because it helps us avoid unnecessary `REVISION`s.




[enriched-event-pojo]: https://github.com/snowplow/snowplow/blob/0.9.2/3-enrich/scala-common-enrich/src/main/scala/com.snowplowanalytics.snowplow.enrich/common/outputs/CanonicalOutput.scala
[tracker-protocol]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol

[semver]: http://semver.org/
[avro-schema-rabbithole]: https://issues.apache.org/jira/browse/AVRO-1124#commentauthor_13827415_verbose

[redshift-ddl]: https://github.com/snowplow/snowplow/blob/0.9.2/4-storage/redshift-storage/sql/atomic-def.sql#L12
