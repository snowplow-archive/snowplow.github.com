---
layout: post
title: Iglu schema repository 0.1.0 released
title-short: Iglu schema repository 0.1.0
tags: [snowplow, iglu, schema, json schema, repository, registry]
author: Alex
category: Releases
---

![snowplow-plus-iglu-img] [snowplow-plus-iglu-img]

We are hugely excited to announce the release of Iglu, our first new product since launching our Snowplow prototype two and a half years ago.

Iglu is a machine-readable schema repository initially supporting JSON Schemas. It is a key building block of the next Snowplow release, 0.9.5, which will validate incoming unstructured events and custom contexts using JSON Schema.

As far as we know, Iglu is the first machine-readable schema repository for JSON Schema, and the first technology which supports schema resolution from multiple public and (soon) private schema repositories.

In the rest of this post we will cover:

1. [On the importance of schemas](/blog/2014/07/01/iglu-schema-repository-released/#schemas)
2. [The origins of Iglu](/blog/2014/07/01/iglu-schema-repository-released/#origins)
3. [Iglu architecture](/blog/2014/07/01/iglu-schema-repository-released/#architecture)
4. [Using Iglu](/blog/2014/07/01/iglu-schema-repository-released/#usage)
5. [Limitations and roadmap](/blog/2014/07/01/iglu-schema-repository-released/#roadmap)
6. [Learning more and getting help](/blog/2014/07/01/iglu-schema-repository-released/#help)

<!--more-->

<div class="html">
<h2><a name="schemas">1. On the importance of schemas</a></h2>
</div>

Snowplow is evolving from a web analytics platform into a general event analytics platform, supporting events coming from mobile apps, the internet of things, games, cars, connected TVs and so forth. This means an explosion in the variety of events that Snowplow needs to support: games saved, clusters started, tills opened, cars started - in fact the potential variety of events is almost infinite.

<div class="html">
<h3><a name="event-explosion">1.1 Dealing with the explosion in events</a></h3>
</div>

Historically, there have been two approaches to dealing with the explosion of possible event types:

![custom-variables-vs-schema-less-jsons-img] [custom-variables-vs-schema-less-jsons-img]

Custom variables as used by Google Analytics, SiteCatalyst, Piwik and other web analytics packages are extremely limited - we plan to explore these limitations in a future blog post. Schema-less JSONs as offered by Mixpanel, KISSmetrics and others are much more powerful, but they have a different set of problems:

![schema-less-json-issues-img] [schema-less-json-issues-img]

<div class="html">
<h3><a name="schema-loss">1.2 On schema loss</a></h3>
</div>

The issues illustrated above primarily relate to the lack of a defined schema for these events as they flow into and then thru the analytics system. More generally, we could say that the problem is that the original schemas have been _lost_. The entities snapshotted in an event typically started life as Active Record models, Protocol Buffers, Backbone.js models or N(Hibernate) objects or similar (and before that, often as RDBMS or NoSQL records). In other words, they started life with a schema, but that schema has been discarded on ingest into the analytics system.

As a result, the business analyst or data scientist typically has to maintain a mental model of the source data schemas when using the analytics system:

![schema-loss-img] [schema-loss-img]

This is a hugely error-prone and wasteful exercise:

* Each analyst has to maintain their own mental model of the source data schemas
* Source data schemas evolve over time. Analysts have to factor this evolution into their analyses (e.g. "what is the proportion of new users providing their age _since the optional age field was introduced on 1st May_?")
* There are no safeguards that the events have not been corrupted or diverged from schema in some way

<div class="html">
<h2><a name="origins">2. The origins of Iglu</a></h2>
</div>

The obvious answer was to introduce [JSON Schema] [json-schema] support for all JSONs sent in to Snowplow - i.e. unstructured events and custom contexts. JSON Schema is a standard for describing a JSON data format; it supports validating that a given JSON conforms to a given JSON Schema.

But as we started to experiment with JSON Schema, it became obvious that JSON Schema was just one building block: there were several other pieces we needed, none of which seem to exist already. In defining and building these missing pieces, Iglu was born.

<div class="html">
<h3><a name="self-desc">2.1 Self-describing JSONs</a></h3>
</div>

As you've seen, we made the design decision that whenever a developer or analyst wanted to send in any JSON to Snowplow, they should first create a [JSON Schema] [json-schema] for that event. Here is an example JSON Schema for a `video_played` event based on the Mixpanel example above:

{% highlight json %}
{
	"$schema": "http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#",
	"description": "Schema for a video_played event",
	"self": {
		"vendor": "com.channel2.vod",
		"name": "video_played",
		"format": "jsonschema",
		"version": "1-0-0"
	},
	"type": "object",
	"properties": {
		"length": {
			"type": "number"
		},
		"id": {
			"type": "string"
		},
		"tags": {
			"type": "array",
			"items": {
				"type": "string"
			}
		},
	},
	"required": ["length", "id"],
	"additionalProperties": false
}
{% endhighlight %}

(Note that this is actually a [self-describing JSON Schema] [self-describing-jsons-post].)

We made a further design decision that the JSON sent in to Snowplow should report the exact JSON Schema that could be used to validate it. Rather than embed the JSON Schema inside the JSON, which would be extremely wasteful of space, we came up with a convenient short-hand that looked like this:

{% highlight json %}
{
	"schema": "iglu:com.channel2.vod/video_played/jsonschema/1-0-0",
	"data":	{
		"length": 213,
		"id":     "hY7gQrO"
	}
}
{% endhighlight %}

We called this format a [self-describing JSON] [self-describing-jsons-post]. The `iglu:` entry is what we are calling an Iglu "schema key", consisting of the following parts:

![iglu-schema-key-img] [iglu-schema-key-img]

We explained the origins of SchemaVer, our schema versioning system, in our blog post [Introducing SchemaVer for semantic versioning of schemas] [schemaver-post].

<div class="html">
<h3><a name="a-repo">2.2 A schema repository</a></h3>
</div>

Next, we needed somewhere to store JSON Schemas like `video_played` above - a home for schemas where:

1. Developers and analysts could refer back to the schema to help with analytics instrumenting and data analysis
2. Snowplow could retrieve the schema in order to validate that the incoming events indeed conformed to the schemas that they claimed to represent
3. Snowplow could retrieve the schema to support converting the incoming events into other formats, such as Redshift database tables
4. Developers could upload new versions of the schema (with analysts' oversight), to allow the data model to evolve over time

It became obvious that we needed some kind of "registry" or "repository" of schemas:

![snowplow-plus-iglu-img] [snowplow-plus-iglu-img]

<div class="html">
<h3><a name="reqs">2.3 Locking down our requirements</a></h3>
</div>

As we worked on Snowplow 0.9.5, we were able to firm up a set of core requirements for our schema repository:

1. It must store schemas in **semantic namespaces** - the storage taxonomy should support the four elements (vendor, name, format, version) we had identified for self-describing JSONs
2. It must allow schemas to be stored **privately** - because many companies regard their data models as commercially sensitive IP
3. It must support a **central repository** of publically available schemas - similar to how [RubyGems.org] [rubygems] or [Maven Central] [maven-central] host publically available Ruby gems or Java libraries
4. It must be **de-centralized** - meaning that a user can self-host this schema repository system end-to-end, even replacing or ignoring the central repository if they want
5. It must be **storage-agnostic** - so that repositories can be embedded inside software, hosted over HTTP(S), stored in private Amazon S3 buckets and so on
6. It must support **efficient schema resolution** - in other words, a client library should be able to track down a schema from all the available repositories with a minimum of lookups, and then cache that schema for subsequent use

With this laundry list of requirements, we started to look at what open-source software was already available.

<div class="html">
<h3><a name="prior-art">2.4 Prior art</a></h3>
</div>

We looked to see if there were any existing solutions around schema registries or repositories for JSON Schema or other schema systems.

We found very little in the way of schema systems for JSON Schema or XML: for JSON Schema we only found this static repository [sample-json-schemas] [sample-json-schemas] by Francis Galiegue, one of the JSON Schema authors. Googling for "XML schema repository" turned up very little: only [xml.org] [xml-org], but this seemed to be article-oriented rather than machine-readable.

By contrast, the Apache Avro community seemed ahead of the pack. We found two projects to develop machine-readable schema repositories for Avro:

* A community-wide effort to build a [RESTful schema repository for Avro] [avro-1124]
* An [Avro schema registry from LinkedIn] [camus-schema-registry] to support their Kafka->HDFS pipeline (which is called Camus)

The main differences we could ascertain between our requirements and the Avro efforts were as follows:

1. The focus on Apache Avro versus our priorities around JSON Schema support
2. The Avro efforts seemed to assume that each user would install one, private schema repository. We envisage a de-centralized set of private schema repositories plus a central public repository - so fundamentally resolving schemas from N repositories, not 1
3. The Avro community does not seem to have a semantic versioning approach to schemas like [SchemaVer] [SchemaVer]. This would make reasoning about schema-data compatibility difficult  

Given these differences, we decided to take the learnings from the Avro community and start work on our own repository technology designed to meet Snowplow's specific requirements around schemas: Iglu.

<div class="html">
<h2><a name="architecture">3. Iglu architecture</a></h2>
</div>

Iglu is a machine-readable, open-source (Apache License 2.0) schema repository, initially for JSON Schema only. A schema repository (sometimes called a schema registry) is like npm or Maven or git but holds data schemas instead of software or code.

<div class="html">
<h3><a name="tech-101">3.1 Iglu technology 101</a></h3>
</div>

Iglu consists of three key technical aspects:

1. Iglu clients that can resolve schemas from one or more Iglu repositories (and eventually publish new schemas to repositories etc)
2. Iglu repositories that can host a set of JSON Schemas
3. A common architecture that informs all aspects of Iglu - for example, Iglu schema keys, SchemaVer for versioning schemas, Iglu's rules for resolving schemas from multiple repositories

These pieces fit together like this:

![iglu-technical-architecture] [iglu-technical-architecture]

<div class="html">
<h3><a name="iglu-central">3.3 Iglu Central</a></h3>
</div>

Iglu Central is a public repository of JSON Schemas. Think of Iglu Central as like [RubyGems.org] [rubygems-org] or [Maven Central] [maven-central] but for storing publically-available JSON Schemas.

We are using Iglu Central to host all of the JSON Schemas which are used in different parts of Snowplow; the schemas for Iglu Central are stored in GitHub, in [snowplow/iglu-central] [iglucentral-github].

Here is an illustration of various Iglu clients talking to Iglu Central; we also show an Iglu Central mirror for a client working behind a firewall:

![iglu-central-img] [iglu-central-img]

As far as we know, Iglu Central is the first public **machine-readable** schema repository - all prior efforts we have seen are human-browsable directories of articles about schemas (e.g. [schema.org] [schema-org]).

Iglu Central is hosted by Snowplow at [http://iglucentral.com] [iglucentral-website]. Although Iglu Central is primarily designed to be consumed by Iglu clients, the root index page for Iglu Central links to all schemas currently hosted on Iglu Central.

<div class="html">
<h2><a name="usage">4. Using Iglu</a></h2>
</div>

While we have deliberately engineered Iglu as a standalone product, we expect that most initial usage of Iglu will be in conjunction with Snowplow.

<div class="html">
<h3><a name="snowplow-usage">Using Iglu with Snowplow</a></h3>
</div>

Based on our early internal testing of Iglu, we envisage that a Snowplow user will want to:

1. Create JSON Schemas for their unstructured events and custom contexts
2. Define Iglu schema keys for these JSON Schemas
3. Create their own Iglu schema repository and host their JSON Schemas in it
4. Configure their Snowplow Enrichment process to fetch these JSON Schemas from their private repository

Separately, we hope that software vendors, analysts and data scientists will contribute their own schemas to Iglu Central; it would be awesome in particular if companies offering streaming APIs or webhooks would publish JSON Schemas for their event streams into Iglu Central. Let's schema everything!

We will discuss how to use Iglu with Snowplow in much more detail following the release of Snowplow 0.9.5.

<div class="html">
<h3><a name="iglu-central">Using Iglu standalone</a></h3>
</div>

While heavily influenced by our requirements for Snowplow, we have deliberately created Iglu as a standalone product, one which we hope will be broadly useful as a schema repository technology.

If you are interested in using Iglu without Snowplow, then we would recommend reading the [Iglu wiki] [iglu-wiki] in detail. Wherever you find blocking gaps in the documentation, do please [raise an issue] [iglu-issues] in GitHub.

For an in-depth understanding of how Iglu works, we recommend browsing through the source for the [Iglu Scala client] [iglu-scala-client-github]. The next Snowplow release, 0.9.5, will make heavy use of our new Scala client for Iglu, so the client code is a good starting point for understanding the underlying design of Iglu.

<div class="html">
<h2><a name="roadmap">5. Limitations and roadmap</a></h2>
</div>

We have deliberately tried to keep the scope of Iglu 0.1.0 as minimal as possible. The major known technical limitations at this time are:

* Iglu only supports self-describing JSON Schemas
* The only client libraries/resolvers currently available is for Scala (although it may be possible to use this from Java code)
* Iglu only supports clients reading schemas from repositories at this time; this is no functionality for clients to publish new schemas to repositories (instead new schemas must be manually added)
* There is as yet no way of making a truly private (versus privacy through obscurity) remote repository

Our first development priority for Iglu is creating a RESTful schema repository server which allows users to publish new schemas to the repository, and has some basic authentication to keep schemas private. For more details on what is coming next in Iglu, check out the [Product roadmap] [product-roadmap] on the wiki.

<div class="html">
<h2><a name="help">6. Learning more and getting help</a></h2>
</div>

When we created Snowplow at the beginning of 2012, it didn't need a lot of explanation - as an open source web analytics system, it fitted into a well-understood software category. As a schema repository, Iglu is a much more unusual beast - so do please [get in touch] [talk-to-us] and tell us your feedback, ask any questions or contribute!

The key resource for learning more about Iglu is the [Iglu wiki] [iglu-wiki] on GitHub - do check it out. Wherever you find blocking gaps in the documentation, please [raise an issue] [iglu-issues] in GitHub.

We are hugely excited about the release of Iglu - we hope that the Snowplow community shares our excitement. Let's work together to make end-to-end-schemas a reality for web and event analytics. And stay tuned for the Snowplow 0.9.5 release (coming soon) for some more guidance on using Iglu with Snowplow!

[schemaver-post]: http://snowplowanalytics.com/blog/2014/05/13/introducing-schemaver-for-semantic-versioning-of-schemas/
[self-describing-jsons-post]: http://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/

[json-schema]: http://json-schema.org/
[rubygems]: http://rubygems.org/
[maven-central]: http://search.maven.org/
[schema-org]: http://schema.org/
[sample-json-schemas]: https://github.com/fge/sample-json-schemas
[xml-org]: http://www.xml.org/
[avro-1124]: https://issues.apache.org/jira/browse/AVRO-1124
[camus-schema-registry]: https://github.com/linkedin/camus/tree/master/camus-schema-registry

[custom-variables-vs-schema-less-jsons-img]: /assets/img/blog/2014/07/custom-variables-vs-schema-less-jsons.png
[schema-less-json-issues-img]: /assets/img/blog/2014/07/schema-less-json-issues.png
[schema-loss-img]: /assets/img/blog/2014/07/schema-loss.png
[iglu-schema-key-img]: /assets/img/blog/2014/07/iglu-schema-key.png
[snowplow-plus-iglu-img]: /assets/img/blog/2014/07/snowplow-plus-iglu.png
[iglu-technical-architecture]: /assets/img/blog/2014/07/iglu-technical-architecture.png
[iglu-central-img]: /assets/img/blog/2014/07/iglu-central.png

[iglu-wiki]: https://github.com/snowplow/iglu/wiki
[iglu-issues]: https://github.com/snowplow/iglu/issues?milestone=&page=1&state=open
[iglu-scala-client-github]: https://github.com/snowplow/iglu-scala-client
[iglucentral-github]: https://github.com/snowplow/iglu-central
[iglucentral-website]: http://iglucentral.com
[product-roadmap]: https://github.com/snowplow/iglu/wiki/Product-roadmap

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[SchemaVer]: /blog/2014/05/13/introducing-schemaver-for-semantic-versioning-of-schemas/
[rubygems-org]: https://rubygems.org/
