---
layout: post
title: Introducing SchemaVer for semantic versioning of schemas
title-short: Introducing SchemaVer
tags: [version, versioning, schema, semver, schemaver]
author: Alex
category: Research
---

_Initial SchemaVer draft. Date: 13 March 2014. Draft authors: Alexander Dean, Frederick Blundun._

As we start to re-structure Snowplow away from [implicit data models] [enriched-event-pojo] and [wiki-based tracker protocols] [tracker-protocol] towards formal schemas (initially Thrift and JSON Schema, later Apache Avro), we have started to think about schema versioning.

<blockquote>
"There are only two types of developer:
the developer who versions his code, and developer_new_newer_newest_v2"
</blockquote>

Proper versioning of _software_ is taken for granted these days - there are various different approaches, but at Snowplow we are big believers in [Semantic Versioning] [semver] (SemVer for short). Here is creator Tom Preston-Werner explaining the crucial semantic aspect of SemVer: "Under this scheme, version numbers and the way they change convey meaning about the underlying code and what has been modified from one version to the next."

We looked around and couldn't find much prior art around semantic versioning of data schemas. The Avro community seems to have gone down [something of a rabbithole] [avro-schema-rabbithole] with their schema versioning - something we are keen to avoid at Snowplow.

Our initial thought was just to fall back to SemVer for schema versioning - after all, database table definitions are a form of schema, and we have been using SemVer for ours ([example] [redshift-ddl]) for some time. However, the more we dug into it, the more we realized that SemVer was not the right fit for semantic versioning of schemas, and we would need to come up with something new. We are calling this new versioning formula for data schemas "SchemaVer".

In the rest of the post, I will go through:

1. [SemVer](/blog/2014/05/13/introducing-schemaver-for-semantic-versioning-of-schemas/#semver) - providing some background for those who are unfamiliar with it
2. [SchemaVer](/blog/2014/05/13/introducing-schemaver-for-semantic-versioning-of-schemas/#schemaver) - providing our formula for using SchemaVer
3. [Design considerations](/blog/2014/05/13/introducing-schemaver-for-semantic-versioning-of-schemas/#design) - explaining why SchemaVer is structured the way it is
4. [Use cases](/blog/2014/05/13/introducing-schemaver-for-semantic-versioning-of-schemas/#usecases) - where should we be using SchemaVer
5. [Call for feedback](/blog/2014/05/13/introducing-schemaver-for-semantic-versioning-of-schemas/#feedback) - SchemaVer is a draft, and we would love feedback before we formalize it in Snowplow

<!--more-->

<div class="html">
<h2><a name="semver">1. SemVer</a></h2>
</div>

If you are a business/web analyst or data scientist rather than coder, you may not be familiar with [Semantic Versioning] [semver]. SemVer provides a simple formula for managing the version of your software as you roll out new versions. That formula has some edge cases, but at its simplest it looks like:

<blockquote>
Given a version number MAJOR.MINOR.PATCH, increment:<br />
<br />
- MAJOR when you make incompatible API changes,<br />
- MINOR when you add functionality in a backwards-compatible manner, and<br />
- PATCH when you make backwards-compatible bug fixes.
</blockquote>

It is important to understand what backwards compatibility means here. For SemVer, backwards compatibility is about providing guarantees (through version numbers), that a piece of software can update its dependency on a SemVer-respecting dependency without either:

1. its code interfacing with the dependency's public API breaking, _or_:
2. the semantics of the dependency's existing functionality changing - e.g. `.multiply()` suddenly starts dividing

Semantic Versioning is a great fit for managing the evolution of software in a way that protects the users of that software. But it's not a great fit for versioning schemas, because schemas are used in a fundamentally different way to software.

<div class="html">
<h2><a name="schemaver">2. SchemaVer</a></h2>
</div>

When versioning a data schema, we are concerned with the backwards-compatibility between the new schema and existing data represented in earlier versions of the schema. This is the fundamental building block of SchemaVer, and explains the divergence from SemVer.

Let's propose a simple formula for SchemaVer:

Given a version number `MODEL-REVISION-ADDITION`, increment the:

* `MODEL` when you make a breaking schema change which will prevent interaction with _any_ historical data
* `REVISION` when you make a schema change which _may_ prevent interaction with _some_ historical data
* `ADDITION` when you make a schema change that is compatible with _all_ historical data

Syntactically this feels similar to SemVer - but as you can see from the increment rules, the semantics of each element are very different from SemVer.

Let's make SchemaVer more concrete with some examples using JSON Schema, in reverse order:

<div class="html">
<h3><a name="addition">2.1 ADDITION</a></h3>
</div>

We have an existing JSON Schema, let's call this `1-0-0`:

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

Because our new `impressionId` field is **not** a required field, and because version `1-0-0` had `additionalProperties` set to false, we know that all historical data will work with this new schema.

Therefore we are looking at an `ADDITION`, and so we bump the schema version to `1-0-1`.

<div class="html">
<h3><a name="addition">2.2 REVISION</a></h3>
</div>

Let's now make our JSON Schema support `additionalProperties` - this constitutes another `ADDITION`, so we are now on `1-0-2`:

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

Will this new schema validate all historical data? Unfortunately we can't be certain, because there could be historical JSONs where the analyst added their own `cost` field, possibly set to a string rather than a number (or a negative number).

So we are effectively making a `REVISION` to the data schema - so we bump the version to `1-1-0` (resetting `ADDITION` to 0).

<div class="html">
<h3><a name="addition">2.3 MODEL</a></h3>
</div>

Oh dear - we have just realized that we can identify our clicks through a unique `clickId` - no need to be storing the `bannerId` or `impressionId`. Here is our new JSON Schema:

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

We have changed our `MODEL` - because we can have no reasonable expectation that any of the historical data can interact with this schema. That means our new version is `2-0-0`.

Note that we also decided to use this "reboot" of the `MODEL` to change `additionalProperties` back to false, because (as we have learnt) it will help us to avoid unnecessary `REVISION`s in the future.

<div class="html">
<h3><a name="notes">2.4 A few supplementary rules</a></h3>
</div>

At this point we should probably add a few supplementary rules around SchemaVer, especially as they differ from SemVer:

* We use hyphens (`-`s) to separate the version parts, not periods (`.`s) as in SemVer
* Versioning starts from 1, not 0 as in SemVer
* SemVer has a "get out of jail free" card, where you start your initial development release at 0.1.0 and then increment the `MINOR` version for each subsequent release. There is no equivalent for SchemaVer: we don't start on an unstable development version 0

<div class="html">
<h2><a name="design">3. Design considerations</a></h2>
</div>

If we have designed SchemaVer right, then hopefully it should seem straightforward, perhaps even obvious. However, we evaluated and discarded many different options while designing SchemaVer. We'll go through some of these in this section, to "show our working".

First off, the names `MODEL`, `ADDITION` and `REVISION` went through many revisions. We are pretty happy with these now.

Initially we were keen to use periods to separate the version elements, to allow existing SemVer libraries to work with SchemaVer. Unfortunately, we realized that an analyst looking at a table definition versioned as `1.0.5` would have no idea if the table was schema'ed using SemVer or SchemaVer. So we needed a visual cue to indicate that this was SchemaVer - hence the hyphens.

We gave some serious thought to recreating SemVer's unstable `MAJOR` version 0 idea. On balance, this seemed a bad idea for SchemaVer: because inevitably some `MODEL` version 0s will go into production, and then we lose our all-important guarantees about the relationship between schema versions and the historical data.

We experimented with ways to make `SchemaVer` fully deterministic - in other words, could we come up with a formula whereby a computer could correctly auto-increment the SchemaVer just by studying the new and previous schema definition?

We _have_ succeeded in making `ADDITION` fully deterministic - but there are clearly shades of grey in the separation of `MODEL` and `REVISION`. We think those shades of grey are useful - because they allow schema authors to exercise their own discretion in not incrementing the `MODEL` unless absolutely necessary.

<div class="html">
<h2><a name="usecases">4. Use cases</a></h2>
</div>

We plan to use SchemaVer throughout Snowplow to add semantic versioning to all of our data structures. In fact the process of designing SchemaVer has already helped us: the process has made us much more aware of the types of schema constraints (and lack of constraints) which lead to `MODEL`, `REVISION` and `ADDITION` increments. We are now actively working to minimize `MODEL` and `REVISION` increments for Snowplow schemas - and we would encourage our community to do the same when creating schemas for their custom contexts and unstructured events.

We hope that SchemaVer is useful outside of just JSON Schema versioning. We are exploring approaches to versioning database table definitions with SchemaVer, and hope to start a dialog with the Apache Avro community, who have a lot of prior experience attempting to uniquely identify, validate and version data schemas (see e.g. [AVRO-1006] [avro-1006]).

More broadly, we believe that there are some interesting potential use cases for SchemaVer outside of Snowplow. For example in RESTful APIs: many of these are versioned at the API level ("Desk.com API v2"), but we would like to see the data structures returned from API GET requests conforming to publically available, SchemaVer-versioned JSON Schemas. This would make interactions with RESTful APIs much less error-prone.

We are also keen to explore adjacent use cases for SchemaVer in other document-oriented software systems, such as CMSes, ecommerce solutions and NoSQL datastores.

<div class="html">
<h2><a name="feedback">5. Call for feedback</a></h2>
</div>

Above all, we would like to stress that this is a draft proposal, and we would love to get feedback from the Snowplow community and beyond on semantic schema versioning. Now is the best time for us to get feedback - before we have started to formalize SchemaVer into the coming Snowplow releases.

So do **[please get in touch] [talk-to-us]** if you have thoughts on semantic schema versioning or our proposed SchemaVer specification - we'd love to make this a more collaborative effort!

[enriched-event-pojo]: https://github.com/snowplow/snowplow/blob/0.9.2/3-enrich/scala-common-enrich/src/main/scala/com.snowplowanalytics.snowplow.enrich/common/outputs/CanonicalOutput.scala
[tracker-protocol]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol

[semver]: http://semver.org/
[avro-schema-rabbithole]: https://issues.apache.org/jira/browse/AVRO-1124#commentauthor_13827415_verbose

[redshift-ddl]: https://github.com/snowplow/snowplow/blob/0.9.2/4-storage/redshift-storage/sql/atomic-def.sql#L12

[avro-1006]: https://issues.apache.org/jira/browse/AVRO-1006
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
