---
layout: post
title: Iglu Schema Registry System 4 Epaulettes released
title-short: Iglu 4 Epaulettes
tags: [iglu, json, json schema, registry]
author: Anton
category: Releases
---

![epaulettes-img] [epaulettes-img]

We are pleased to announce the 4th release of the [Iglu Schema Registry System][iglu-repo] with initial release of Iglu Core.

Read on for more information on Release 4 [Epaulettes][epaulettes].

1. [Scala Iglu Core](/blog/2016/05/05/iglu-schema-registry-system-4-epaulettes-released/#core)
2. [Registry Syncer updates](/blog/2016/05/05/iglu-schema-registry-system-4-epaulettes-released/#syncer)
3. [Future](/blog/2016/05/05/iglu-schema-registry-system-4-epaulettes-released/#future)
4. [Getting help](/blog/2016/04/24/snowplow-golang-tracker-0.1.0-released/#help)

<!--more-->

<h2 id="iglu-core">1. Scala Iglu Core</h2>

On its very early stages, development of Iglu could be described as a very sporadical process.
It was built around few core ideas like [Self-describing Schemas][self-describing-schemas], [SchemaVer][schemaver] and several applications and libraries working with Self-describing Schemas such as [Schema Guru][schema-guru], [Iglu Scala Client][iglu-scala-client] and [Snowplow platform][snowplow].

While we were working on these applications, we implemented data structures and related functions common for all of them.
But these common entities were scattered around in different codebases. This scattering result in unwanted code duplication and inconsistent behavior. To fix it we decided to extract these very basic data structures and functions into separate library - Scala Iglu Core.

Beside of consistent behavior and deduplication of code, we pursued one more important goal - provide a reference-implementation of Iglu concepts for other languages. This is important because Iglu was designed to be not dependent on any particular programming language or platform which means nothing stops users from implementing their own registries, clients or other apps using Iglu technologies.

Mentioned above core entities include following data structures:

* `SchemaKey` - contains information about Schema for Self-describing entity. Where "entity" can be: JSON data, JSON Schema itself or data/schema for any datatype that can be self-describing.
* `SchemaVer` - part of SchemaKey with information about Schema version. Triplet of `MODEL`, `REVISION`, `ADDITION`.
* `SchemaCriterion` - default way to filter Self-describing entities. Represents SchemaKey divided into six parts, where last three (MODEL, REVISION, ADDITION) can be unfilled

Everything else in Scala Iglu Core is specific for Scala implementation.
Most useful feature of Scala Iglu Core is type classes for injecting and extracting `SchemaKey` for various data types, such as representations of JSON in different Scala libraries.
One more Scala-specific feature is container classes `SelfDescribingSchema` and `SelfDescribingData`.
It basically just represents pair of `SchemaKey` along with data (or Schema) it describes.
These can be used to store, serialize and pass around data between various Scala libraries in more type-safe and concise way.
Overall, you don't have to know any details about Scala Iglu Core type classes and how to implement them since we're also providing complete implementations for several popular JSON libraries such as [Json4s][json4s] and [Circe][circe], you can just include them as dependencies to your projects and have all features Iglu Core provides:

{% highlight %}

import com.snowplowanalytics.iglu.core.json4s._

implicit val stringifyData = StringifyData

val schemaKey = SchemaKey("com.acme", "event", "jsonschema", SchemaKey(1,0,0))
val data: JValue = ???

SelfDescribingData(schemaKey).asString

{% endhighlight %}

More detailed information can be found on wiki pages dedicated to [Iglu Core][iglu-core] and [Scala Iglu Core][scala-iglu-core].

<h2 id="syncer">2. Registry Syncer updates</h2>

Until recently, Iglu Static Repo was default way for hosting Schemas. Now situation is changing as Scala repo server started to mature.
To help our users migrate from Static Repo to more feature-full Scala Repo, we're developing Registry Syncer, simple shell-script allowing you to fulfill Scala repo from local directory in a few commands.

In order to bootstrap your Scala Repo Server with Schemas from Static Repo you'll need to [setup][setup-scala-repo] Scala Repo, [create][super-api-key] super API key and run Registry Syncer like following: `./sync.bash http://iglu.acme.com:8080 UUID-SUPER-API-KEY ~/iglu-central/schemas/`.

This release introduce following minor improvements to Registry Syncer:

* name changed from Repo Syncer as first step of renaming all Repositories into Registries
* synchronization now stops on first failure (like unknown super API key)
* PUT is using instead of POST allowing to seamlessly override existing Schemas
* UI improvements

<h2 id="future">3. The future</h2>

Our current primary goal can be described as "Iglu CLI" and can be seen as a Static Iglu Generator with features previously available as a separate `schema-guru ddl` command. This feature starting to make Iglu not just a way to store JSON Schemas, but full-feautered Schema registry technology supporting variety of data-description formats. And what is more important - it will significantly alleviate manual labor for users of Snowplow platform as they now will be not required to generate and upload JSONPath files as well as their Redshift DDLs. All data-description will be on Iglu's behalf.


<h2 id="help">4. Getting help</h2>

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[epaulettes]: https://en.wikipedia.org/wiki/Epaulettes_(stamp)
[epaulettes-img]: /assets/img/blog/2016/05/epaulette.jpg

[snowplow]: https://github.com/snowplow/snowplow
[schema-guru]: https://github.com/snowplow/schema-guru
[iglu-scala-client]: https://github.com/snowplow/iglu-scala-client
[json4s]: http://json4s.org/
[circe]: https://github.com/travisbrown/circe

[self-describing-schemas]: https://github.com/snowplow/iglu/wiki/Self-describing-JSON-Schemas
[schemaver]: https://github.com/snowplow/iglu/wiki/SchemaVer
[iglu-core]: https://github.com/snowplow/iglu/wiki/Iglu-core
[scala-iglu-core]: https://github.com/snowplow/iglu/wiki/Scala-iglu-core
[setup-scala-repo]: https://github.com/snowplow/iglu/wiki/Scala-repo-server-setup
[super-api-key]: https://github.com/snowplow/iglu/wiki/Create-the-super-API-key

[iglu-repo]: https://github.com/snowplow/iglu
[issues]: https://github.com/snowplow/snowplow/iglu
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
