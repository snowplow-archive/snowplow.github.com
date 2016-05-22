---
layout: post
title: Iglu Schema Registry 4 Epaulettes released
title-short: Iglu 4 Epaulettes
tags: [iglu, json, json schema, registry]
author: Anton
category: Releases
---

We are pleased to announce the fourth release of the [Iglu Schema Registry System][iglu-repo], with an initial release of the Iglu Core library, implemented in Scala.

Read on for more information on Release 4 Epaulettes, named after the [famous stamp] [epaulettes]:

1. [Scala Iglu Core](/blog/2016/05/05/iglu-schema-registry-system-4-epaulettes-released/#core)
2. [Registry Syncer updates](/blog/2016/05/05/iglu-schema-registry-system-4-epaulettes-released/#syncer)
3. [Iglu roadmap](/blog/2016/05/05/iglu-schema-registry-system-4-epaulettes-released/#roadmap)
4. [Getting help](/blog/2016/04/24/snowplow-golang-tracker-0.1.0-released/#help)

![epaulettes-img] [epaulettes-img]

<!--more-->

<h2 id="iglu-core">1. Scala Iglu Core</h2>

<h3 id="iglu-core-why">Why we created Iglu Core</h3>

Our initial development of Iglu two years ago was a somewhat piecemeal process. The design was centred on a few core ideas such as [self-describing schemas] [self-describing-schemas], [SchemaVer] [schemaver] and several associated applications and libraries, including [Schema Guru][schema-guru], [Iglu Scala Client] [iglu-scala-client] and of course the [Snowplow platform][snowplow] itself.

Working on these applications, we found ourselves implementing the same Iglu-related data structures and functions multiple times. To clean up this rather piecemeal approach, we decided to extract this common functionality into a single library - Iglu Core.

The goal of Iglu Core is to provide a reference implementation of the Iglu concepts, which can then be re-implemented for other languages. This is important because Iglu is designed to be platform and language independent - it should be as usable from Scala as it is from Arduino or C++ or JavaScript.

<h3 id="iglu-core-core">Core concepts</h3>

The key elements introduced in our Iglu Core library are:

* `SchemaKey`, which contains information about the schema for a self-describing entity. A self-describing entity can be JSON data, a JSON Schema or any other rich schema or type system that can be made self-describing
* `SchemaVer`, part of the `SchemaKey` holding semantic information about the schema's version. This is a triplet of `MODEL`, `REVISION` and `ADDITION`
* `SchemaCriterion`, a default way to filter self-describing entities. It holds a `SchemaKey` where some or all of the version components (`MODEL`, `REVISION`, `ADDITION`) can be unfilled

<h3 id="iglu-core-scala">Scala-specific features</h3>

Alongside the key elements set out above, the Scala implementation of Iglu Core has some neat Scala-specific features.

Everything else in Scala Iglu Core is specific for Scala implementation.
Most useful feature of Scala Iglu Core is type classes for injecting and extracting `SchemaKey` for various data types, such as representations of JSON in different Scala libraries.
One more Scala-specific feature is container classes `SelfDescribingSchema` and `SelfDescribingData`.
It basically just represents pair of `SchemaKey` along with data (or Schema) it describes.
These can be used to store, serialize and pass around data between various Scala libraries in more type-safe and concise way.

<h3 id="iglu-core-usage">Using Iglu Core</h3>

Overall, you don't have to know any details about Scala Iglu Core type classes and how to implement them since we're also providing complete implementations for several popular JSON libraries such as [Json4s][json4s] and [Circe][circe], you can just include them as dependencies to your projects and have all features Iglu Core provides:

{% highlight scala %}
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

<h2 id="roadmap">3. Iglu roadmap</h2>

We have a lot planned for Iglu - both in terms of new functionality and ongoing clean-up and consolidation of our existing Iglu technology.

The next release will introduce an Iglu command-line tool, "Iglu CLI", to help users with various Iglu-related tasks. To start with, we will port over to Iglu CLI:

* Schema Guru's current `schema-guru ddl` command, which will evolve into a static registry generator comamnd in Iglu CLI
* Our Registry Syncer, which will be ported from Bash into Scala and added as an Iglu CLI sub-command

Beyond Iglu CLI we have plenty more planned for Iglu, including adding first class support within Iglu for database table definitions (such as Redshift), mappings between different data formats (e.g. JSON Schema to Redshift), and schema migrations. Stay tuned!

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
