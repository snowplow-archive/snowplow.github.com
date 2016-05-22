---
layout: post
title: Iglu Schema Registry 4 Epaulettes released
title-short: Iglu 4 Epaulettes
tags: [iglu, json, json schema, registry]
author: Anton
category: Releases
---

We are pleased to announce the fourth release of the [Iglu Schema Registry System][iglu-repo], with an initial release of the Iglu Core library, implemented in Scala.

Read on for more information on Release 4 Epaulettes, named after the [famous Belgian postage stamps] [epaulettes]:

1. [Scala Iglu Core](/blog/2016/05/22/iglu-r4-epaulettes-released/#core)
2. [Registry Syncer updates](/blog/2016/05/22/iglu-r4-epaulettes-released/#syncer)
3. [Iglu roadmap](/blog/2016/05/22/iglu-r4-epaulettes-released/#roadmap)
4. [Getting help](/blog/2016/05/22/iglu-r4-epaulettes-released/#help)

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

Scala Iglu Core contains type classes for injecting and extracting the `SchemaKey` for various data types, including representations of JSON in different Scala libraries including [Json4s][json4s] and [Circe][circe].

The library also offers container classes called `SelfDescribingSchema` and `SelfDescribingData`, to represent the `SchemaKey` along with the data that key describes.

Use these containers to store, serialize and exchange data inside your Scala code in a more type-safe and concise way.

<h3 id="iglu-core-usage">Using Iglu Core</h3>

Iglu Core has been designed around Snowplow and Iglu's own requirements, but we expect the library will be useful to external implementers as well.

Typically you won't have to learn the details of the Scala Iglu Core's type classes, since we are also providing complete implementations for popular Scala JSON libraries, starting with [iglu-core-json4s] [iglu-core-json4s] and [iglu-core-circe] [iglu-core-circe].

Just include the appropriate implementation as a dependency in your project (the artifacts are available in Maven Central):

{% highlight scala %}
val igluCirce = "com.snowplowanalytics" %% "iglu-core-json4s"  % "0.1.0"

// Or:

val igluJson4s = "com.snowplowanalytics" %% "iglu-core-circe"  % "0.1.0"
{% endhighlight %}

Here is an example using iglu-core-json4s:

{% highlight scala %}
import com.snowplowanalytics.iglu.core.json4s._

implicit val stringifyData = StringifyData

val schemaKey = SchemaKey("com.acme", "event", "jsonschema", SchemaKey(1,0,0))
val data: JValue = ???

SelfDescribingData(schemaKey, data).asString
{% endhighlight %}

More detailed information can be found on wiki pages dedicated to [Iglu Core][iglu-core] and [Scala Iglu Core][scala-iglu-core].

<h2 id="syncer">2. Registry Syncer updates</h2>

Until recently, a [static Iglu registry] [static-registry-setup] was the default way to host schemas; that is now changing as the [Scala-based RESTful registry server] [scala-registry-setup] starts to mature.

To help our users work with the registry server, Iglu includes a tool called [Registry Syncer] [registry-syncer], a simple Bash script allowing you to populate a registry server over HTTP in a few commands.

This release introduce following some minor improvements to Registry Syncer:

* We changed the name from Repo Syncer (as we are now referring to "schema registries" not "schema repositories")
* The synchronization process now stops on the first failure
* We use `PUT` instead of `POST`, so existing schemas can be automatically overridden

In order to bootstrap your RESTful registry server with schemas you will need to:

1. [Setup][scala-registry-setup] the registry server
2. [Create][super-api-key] a super API key
3. Run the Registry Syncer like so:

{% highlight bash %}
${iglu_dir}/0-common/registry-syncer/sync.bash http://iglu.acme.com:8080 ${super_api_key} ${schemas_dir}
{% endhighlight %}

where `${iglu_dir}` holds a checked-out copy of the [Iglu repository] [iglu-repo], `${super_api_key}` is the API key you created earlier and `${schemas_dir}` holds a directory of schemas.

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
[iglu-core-json4s]: http://search.maven.org/#search|ga|1|iglu-core-json4s
[iglu-core-circe]: http://search.maven.org/#search|ga|1|iglu-core-circe

[static-registry-setup]: https://github.com/snowplow/iglu/wiki/Static-repo-setup
[scala-registry-setup]: https://github.com/snowplow/iglu/wiki/Scala-repo-server-setup
[super-api-key]: https://github.com/snowplow/iglu/wiki/Create-the-super-API-key

[registry-syncer]: https://github.com/snowplow/iglu/master/0-common/registry-syncer

[iglu-repo]: https://github.com/snowplow/iglu
[issues]: https://github.com/snowplow/snowplow/iglu
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
