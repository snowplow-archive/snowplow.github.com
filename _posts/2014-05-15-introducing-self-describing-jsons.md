---
layout: post
title: Introducing self-describing JSONs
tags: [json, json schema, self-describing, self-correlating, schemaver]
author: Alex
category: Research
---

_Initial self-describing JSON draft. Date: 14 May 2014. Draft authors: Alexander Dean, Frederick Blundun._

_Updated 10 June 2014. Changed `iglu://` references to `iglu:` as these resource identifiers do not point to specific hosts._

At Snowplow we have been thinking a lot about how to add schemas to our data models, in place of the [implicit data models] [enriched-event-pojo] and [wiki-based tracker protocols] [tracker-protocol] that we have today. Crucially, whatever we come up with must also work for Snowplow users, who want to be able to add schemas to their own [unstructured events] [unstructured-events] and [custom contexts] [custom-contexts] in Snowplow.

In Tuesday's blog post, we introduced a key building block for our data modelling efforts: [SchemaVer] [schemaver], a way of semantically versioning schema definitions. In this blog post, Fred and I will introduce another building block, which we are calling self-describing JSONs. But first, we'll explain what the problem is that self-describing JSONs solves.

In the rest of the post, we will cover:

1. [The problem](/blog/2014/05/15/introducing-self-describing-jsons/#problem)
2. [Self-describing JSON Schemas](/blog/2014/05/15/introducing-self-describing-jsons/#sdjs)
3. [Self-describing JSONs](/blog/2014/05/15/introducing-self-describing-jsons/#sdj)
4. [Putting all this into practice](/blog/2014/05/15/introducing-self-describing-jsons/#practice)
5. [Prior art](/blog/2014/05/15/introducing-self-describing-jsons/#priorart)
6. [Next steps](/blog/2014/05/15/introducing-self-describing-jsons/#next)
7. [Call for feedback](/blog/2014/05/15/introducing-self-describing-jsons/#feedback)

Let's get started.

<!--more-->

<div class="html">
<h2><a name="problem">1. The problem</a></h2>
</div>

Let's say we have a JSON which looks like this:

{% highlight json %}
{
	"bannerId": "4732ce23d345"
}
{% endhighlight %}

And let's say that we know that this JSON conforms to this schema:

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

And, finally, we know a few things about this schema:

* This is a JSON Schema
* It was created by us (Snowplow Analytics)
* It is version 1-0-0 as per [SchemaVer] [schemaver]
* It describes an ad click

So far, so good. But we now have a few serious gaps in our knowledge:

1. All our knowledge about the schema is _implicit knowledge_ - it's not written down anywhere
2. The JSON Schema itself does not know these four key facts about itself
3. The individual JSON has no direct association with its schema

Combined, these knowledge gaps leave us in a tight spot: when we come back to a folder full of our JSONs, how will we know how to validate them? This is where self-describing JSON comes in:

* We want the JSON Schema to contain a description of itself
* We want the individual JSONs to record which JSON Schema they are associated with

Let's discuss each of these points next.

<div class="html">
<h2><a name="sdjs">2. Self-describing JSON Schemas</a></h2>
</div>

Let's add a new property, `self`, to describe our JSON Schema:

{% highlight json %}
{
	"$schema": "http://json-schema.org/schema#",
	"self": {
		"vendor": "com.snowplowanalytics",
		"name": "ad_click",
		"format": "jsonschema",
		"version": "1-0-0"
	},
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

We have now managed to detail everything we know about this JSON Schema:

* `vendor` tells us who created this JSON Schema
* `name` tells us the type of object described in this JSON Schema
* `format` tells us that this is a JSON Schema (versus some other schema approach)
* `version` tells us the version of this JSON Schema (using [SchemaVer] [schemaver])

This is a good start: our implicit knowledge about this JSON Schema is now captured against the JSON Schema itself. Anywhere the JSON Schema goes, this all-important information about the JSON Schema goes too.

But we still don't have an association between the individual JSON objects and the JSON Schema - let's fix this next.

<div class="html">
<h2><a name="sdj">3. Self-describing JSONs</a></h2>
</div>

How can we associate an individual JSON with its JSON Schema? Let's try a slightly modified JSON format:

{% highlight json %}
{
	"schema": "iglu:com.snowplowanalytics/ad_click/jsonschema/1-0-0",
	"data": {
		"bannerId": "4732ce23d345"
	}
}
{% endhighlight %}

We have made a couple of important changes here:

1. We have added a new top-level field, `schema`, which contains (in a space-efficient format) all the information required to uniquely identify the associated JSON Schema
2. We have moved the JSON's original property inside a `data` field. This sandboxing will prevent any accidental collisions should the JSON already have a `schema` field

Don't worry about the `iglu:` protocol for now - we will come back to this in a future blog post.

Between our self-describing JSON Schemas and our self-describing JSONs, we have joined up all of our implicit knowledge about this JSON instance and its JSON Schema. This should make schema evolution and working with historical data much simpler.

<div class="html">
<h2><a name="practice">4. Putting all this into practice</a></h2>
</div>

If this is the theory, how do we put this into practice? Firstly, we should abide by the [JSON Schema 04 specification] [js-draft04]:

<blockquote>
5.6. Extending JSON Schema<br />
<br />
   Implementations MAY choose to define additional keywords to JSON<br />
   Schema.  Save for explicit agreement, schema authors SHALL NOT expect<br />
   these additional keywords to be supported by peer implementations.<br />
   Implementations SHOULD ignore keywords they do not support.
</blockquote>

And then:

<blockquote>
6. The "$schema" keyword<br />
<br />
6.1. Purpose<br />
<br />
   The "$schema" keyword is both used as a JSON Schema version<br />
   identifier and the location of a resource which is itself a JSON<br />
   Schema, which describes any schema written for this particular<br />
   version.<br />
<br />
   This keyword MUST be located at the root of a JSON Schema.  The value<br />
   of this keyword MUST be a URI [RFC3986] and a valid JSON Reference<br />
   [json-reference]; this URI MUST be both absolute and normalized.  The<br />
   resource located at this URI MUST successfully describe itself.  It<br />
   is RECOMMENDED that schema authors include this keyword in their<br />
   schemas.
</blockquote>

And finally:

<blockquote>
6.2. Customization<br />
<br />
   When extending JSON Schema with custom keywords, schema authors<br />
   SHOULD define a custom URI for "$schema".  This custom URI MUST NOT<br />
   be one of the predefined values.<br />
</blockquote>

Phew! What this means in short is that we should create a JSON Schema document defining our `self` extension to JSON Schema. This will become the new master JSON Schema (indicated with `$schema`) for all self-describing JSON Schemas.

We have done this and made this available at this URI:

[http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#] [self-desc-schema]

Don't worry about that URI for now - we will return to Iglu and the proposed path structure in a future blog post. For now, just notice that the URI's path structure matches our space-efficient `schema` field format above.

The JSON Schema enforces a few formatting rules for the `self` fields:

* `name` and `format` must consist of only letters, numbers, underscores (`_`s) and hyphens (`-`s)
* `vendor` supports the same characters plus periods (`.`)
* `version` must be in [SchemaVer] [schemaver]

Next, we can revise our JSON Schema to flag that this is a self-describing JSON Schema - note the updated `$schema` field:

{% highlight json %}
{
	"$schema": "http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#",
	"self": {
		"vendor": "com.snowplowanalytics",
		"name": "ad_click",
		"format": "jsonschema",
		"version": "1-0-0"
	},
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

As per the `self-desc` JSON Schema definition, note that:

* The four fields `vendor`, `name`, `format`, `version` are all required strings
* No additional fields are allowed within `self`

And how do we now validate a self-describing JSON against its JSON Schema? To recap, our JSON instance looks like this:

{% highlight json %}
{
	"schema": "iglu:com.snowplowanalytics/ad_click/jsonschema/1-0-0",
	"data": {
		"bannerId": "4732ce23d345"
	}
}
{% endhighlight %}

We can validate this in a two-pass fashion:

1. First pass: validate that the JSON is self-describing
2. Second pass: take the `data` field from the JSON, and validate it against the JSON Schema identified by the `schema` field

How do we validate that the JSON is self-describing? We have created a simple JSON Schema for that very purpose:

[http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/instance/jsonschema/1-0-0] [self-desc]

So there we go: this two-step approach lets you validate any self-describing JSON against the schema it claims to adhere to.

<div class="html">
<h2><a name="priorart">5. Prior art</a></h2>
</div>

We were surprised not to find much existing discussion around self-description of schemas and objects in the JSON community. The [JSON Schema 04 specification] [js-draft04] _does_ have a section on what it calls "correlating" JSON instances with their respective JSON Schemas:

<blockquote>
8. Recommended correlation mechanisms for use with the HTTP protocol<br />
<br />
   It is acknowledged by this specification that the majority of<br />
   interactive JSON Schema processing will be over HTTP.  This section<br />
   therefore gives recommendations for materializing an instance/schema<br />
   correlation using mechanisms currently available for this protocol.<br />
   An instance is said to be described by one (or more) schema(s).<br />
<br />
8.1. Correlation by means of the "Content-Type" header<br />
<br />
   It is RECOMMENDED that a MIME type parameter by the name of "profile"<br />
   be appended to the "Content-Type" header of the instance being<br />
   processed.  If present, the value of this parameter MUST be a valid<br />
   URI, and this URI SHOULD resolve to a valid JSON Schema.  The MIME<br />
   type MUST be "application/json", or any other subtype.<br />
<br />
   An example of such a header would be:<br />
<br />
   Content-Type: application/my-media-type+json;<br />
             profile=http://example.com/my-hyper-schema#
</blockquote>

The idea of appending the JSON Schema to the content-type as a `profile` is an interesting one, but it has a few major drawbacks:

1. It is limited to HTTP-based interactions
2. On receipt, the user will have to create some bespoke data structure to record the `profile` alongside the data
3. Recording the full URI to the schema is brittle - what if the location of the JSON Schema changes?

We found more discussion of self-describing objects with their schemas (or at least schema versions) in the Avro community, including this from Martin Kleppmann's excellent article, [Schema evolution in Avro, Protocol Buffers and Thrift] [schema-evolution]:

<blockquote>
"If you’re storing records in a database one-by-one, you may end up with different schema versions written at different times, and so you have to annotate each record with its schema version. If storing the schema itself is too much overhead, you can use a hash of the schema, or a sequential schema version number. You then need a schema registry where you can look up the exact schema definition for a given version number."
</blockquote>

We also found something a little similar to self-describing JSON in the Kiji project, which [uses Avro heavily] [kiji-avro]:

<blockquote>
Kiji uses something we call protocol versioning to get around this issue. Each record type that we intend to operate on has a field named version which is a string. The Kiji TableLayoutDesc Avro record (what your JSON table layout files interact with) includes a version field which today you should set to "layout-1.1".<br />
<br />
In Kiji, a protocol version includes a protocol name and a version number in major.minor.revision format. The protocol name is a sanity check on what kind of record this version pertains to. For example, Kiji table layouts all contain a protocol name of “layout”; this prevents the most basic error of trying to parse a similar but unrelated JSON record object in a place where it shouldn’t be.<br />
<br />
The version number is a standard version number that follows semantic versioning: the major version changes when an incompatible change is introduced; the minor version for a compatible new feature; and the revision for a bug fix.
</blockquote>

The Kiji project uses Semantic Versioning rather than our just-released [SchemaVer] [schemaver] - it's not clear what their "bug fix" is in the context of a schema definition.

<div class="html">
<h2><a name="next">6. Next steps</a></h2>
</div>

We are hugely excited about the potential for self-describing JSONs at Snowplow. Specifically, we think they will bring significant benefits for Snowplow users in terms of:

1. Documenting what types of [unstructured events] [unstructured-events] and [custom contexts] [custom-contexts] you are sending into Snowplow
2. Enabling Snowplow to validate that your unstructured events and custom contexts conform to your schemas
3. Providing ways of programmatically generating other database and schema objects (e.g. Redshift table definitions, Avro objects) from the JSON Schemas

As well as making it easy for Snowplow users to use this new functionality, we intend to "dogfood" self-describing JSONs, for example by replacing our [wiki-based Tracker Protocol] [tracker-protocol] with a self-describing JSON Schema equivalent.

Now that we have a format for self-describing JSONs, the next step is to come up with some form of "schema registry" or repository to hold them in. Stay tuned for a blog post on this coming soon!

<div class="html">
<h2><a name="feedback">7. Call for feedback</a></h2>
</div>

Above all, we would like to stress that this is a draft proposal, and we would love to get feedback from the Snowplow community and beyond on self-describing JSONs and JSON Schemas. Now is the best time for us to get feedback - before we have started to formalize this into the coming Snowplow releases.

So do **[please get in touch] [talk-to-us]** if you have thoughts on self-describing JSONs and JSON Schemas - we'd love to make this a more collaborative effort!

[enriched-event-pojo]: https://github.com/snowplow/snowplow/blob/0.9.2/3-enrich/scala-common-enrich/src/main/scala/com.snowplowanalytics.snowplow.enrich/common/outputs/CanonicalOutput.scala
[tracker-protocol]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol

[custom-contexts]: /blog/2014/01/27/snowplow-custom-contexts-guide/
[unstructured-events]: https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#381-trackunstructevent

[schemaver]: /blog/2014/05/13/introducing-schemaver-for-semantic-versioning-of-schemas/

[js-draft04]: http://tools.ietf.org/html/draft-zyp-json-schema-04#section-5.6
[self-desc-schema]: http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#
[self-desc]: http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/instance/jsonschema/1-0-0

[schema-evolution]: http://martin.kleppmann.com/2012/12/05/schema-evolution-in-avro-protocol-buffers-thrift.html
[kiji-avro]: http://www.kiji.org/2013/04/25/versioned-data-structures-and-avro/

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
