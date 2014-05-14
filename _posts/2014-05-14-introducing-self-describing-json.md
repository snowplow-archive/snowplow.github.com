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



[enriched-event-pojo]: https://github.com/snowplow/snowplow/blob/0.9.2/3-enrich/scala-common-enrich/src/main/scala/com.snowplowanalytics.snowplow.enrich/common/outputs/CanonicalOutput.scala
[tracker-protocol]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol

[custom-contexts]: 
[unstructured-events]: 

[schemaver]: /blog/2014/05/13/introducing-schemaver-for-semantic-versioning-of-schemas/
