---
layout: post
shortenedlink: Introducing self-describing JSONs
title: Introducing self-describing JSONs
tags: [json, json schema, self-describing, self-correlating, schemaver]
author: Alex
category: Research
---

_Initial self-describing JSON draft. Date: 14 March 2014. Draft authors: Alexander Dean, Frederick Blundun._

At Snowplow we have been thinking a lot about how to add schemas to our data models, in place of the [implicit data models] [enriched-event-pojo] and [wiki-based tracker protocols] [tracker-protocol] that we have today. Crucially, whatever we come up with must also work for Snowplow users, who want to be able to add schemas to their own [unstructured events] [unstructured-events] and [custom contexts] [custom-contexts] in Snowplow.

In yesterday's blog post, we introduced a key building block for our data modelling efforts: [SchemaVer] [schemaver], a way of semantically versioning schema definitions. In this blog post, Fred and I will introduce another building block, which we are calling self-describing JSONs. But first, we'll explain what the problem is that self-describing JSONs solves.

In the rest of the post, we will cover:

1. xxx
2. yyy
3. zzz

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
    }
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

We've managed to detail everything we know about this JSON Schema:

* `vendor` tells us who created this JSON Schema
* `name` tells us the type of object described in this JSON Schema
* `format` tells us that this is a JSON Schema (versus some other schema technology)
* `version` tells us the version of this JSON Schema (using [SchemaVer] [schemaver])

This is a good start - our implicit knowledge about this JSON Schema is now captured against the JSON Schema itself. Anywhere the JSON Schema goes, this super-important information about the JSON Schema goes too. But we still don't have an association between the individual JSON objects and the JSON Schema - let's fix this next.

<div class="html">
<h2><a name="sdj">3. Self-describing JSONs</a></h2>
</div>

How can we associate an individual JSON with its JSON Schema? Let's try a slightly modified JSON format:

{% highlight json %}
{
	"schema": "com.snowplowanalytics/ad_click/jsonschema/1-0-0",
	"data": {
		"bannerId": "4732ce23d345"
	}
}
{% endhighlight %}

We have made a couple of important changes here:

* We have added a new top-level field, `schema`, which contains (in a space-efficient format) all the information required to uniquely identify the associated JSON Schema
* We have moved the JSON's original property inside a `data` field. This sandboxing will prevent any accidental collisions should the JSON already have a `schema` field

Between our self-describing JSON Schemas and our self-describing JSONs, we have filled in all of our knowledge gaps. This should make schema evolution and working with historical data much simpler.

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

Phew! What this means in short is that we should create a JSON Schema document defining our `self` extension to JSON Schema. We have done this and made this available at this URI:

[http://iglucentral.com/schemas/com.snowplowanalytics/self_desc_schema/jsonschema/1-0-0] [self-desc-schema]

Don't worry about the URI for now - we will come back to Iglu Central Repository and the proposed path structure in a future blog post. For now, just notice that the path structure is identical to our space-efficient `schema` field format.

Next, we can revise our JSON Schema to flag that it is a self-describing JSON Schema:

{% highlight json %}
{
	"$schema": "http://iglucentral.com/schemas/com.snowplowanalytics/self_desc_schema/jsonschema/1-0-0",
	"self": {
        "vendor": "com.snowplowanalytics",
        "name": "ad_click",
        "format": "jsonschema",
        "version": "1-0-0"
    }
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

As per the `self_desc` JSON Schema definition, note that:

* The `self` field is required in a self-describing JSON Schema
* The four fields `vendor`, `name`, `format`, `version` are all required strings
* No additional fields are allowed within `self`

How do we now validate a self-describing JSON against its JSON Schema? We do it in a two-pass fashion:

1. First pass: validate that the JSON is self-describing
2. Second pass: take the `data` field from the JSON, and validate it against the JSON Schema identified by the `schema` field

How do we validate that the JSON is self-describing? We have created a simple JSON Schema for that very purpose:

[http://iglucentral.com/schemas/com.snowplowanalytics/self_desc/jsonschema/1-0-0] [self-desc]

So there we go: this approach will let you validate any self-describing JSON against the schema it claims to adhere to.

<div class="html">
<h2><a name="practice">5. XXX</a></h2>
</div>


<div class="html">
<h2><a name="feedback">6. Call for feedback</a></h2>
</div>

Above all, we would like to stress that this is a draft proposal, and we would love to get feedback from the Snowplow community and beyond on self-describing JSONs and JSON Schemas. Now is the best time for us to get feedback - before we have started to formalize this into the coming Snowplow releases.

So do **[please get in touch] [talk-to-us]** if you have thoughts on self-describing JSONs and JSON Schemas - we'd love to make this a more collaborative effort!

[enriched-event-pojo]: https://github.com/snowplow/snowplow/blob/0.9.2/3-enrich/scala-common-enrich/src/main/scala/com.snowplowanalytics.snowplow.enrich/common/outputs/CanonicalOutput.scala
[tracker-protocol]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol

[custom-contexts]: 
[unstructured-events]: 

[schemaver]: /blog/2014/05/13/introducing-schemaver-for-semantic-versioning-of-schemas/

[js-draft04]: http://tools.ietf.org/html/draft-zyp-json-schema-04#section-5.6
[self-desc-schema]: http://iglucentral.com/schemas/com.snowplowanalytics/self_desc_schema/jsonschema/1-0-0
[self-desc]: http://iglucentral.com/schemas/com.snowplowanalytics/self_desc/jsonschema/1-0-0

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
