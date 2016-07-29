---
layout: post
title: Iglu Schema Registry 5 Scinde Dawk
title-short: Iglu 5 Scinde Dawk
tags: [iglu, json, json schema, registry]
author: Anton
category: Releases
---

We are pleased to announce the fifth release of the [Iglu Schema Registry System][iglu-repo], with an initial release of the Igluctl - an Iglu command-line tool and Schema DDL as part of Iglu project.

Read on for more information on Release 5 Scinde Dawk, named after the [first postage stamp in Asia] [scinde-dawk]:

1. [Igluctl](/blog/2016/07/30/iglu-r4-scinde-dawk-released/#core)
2. [Schema DDL](/blog/2016/07/30/iglu-r4-scinde-dawk-released/#schema-ddl)
3. [Iglu roadmap](/blog/2016/07/30/iglu-r4-scinde-dawk-released/#roadmap)
4. [Getting help](/blog/2016/07/30/iglu-r4-scinde-dawk-released/#help)


![scinde-dawk-img] [scinde-dawk-img]

<!--more-->

<h2 id="iglu-core">1. Igluctl</h2>

Main feature of this release is new `igluctl` command, that incoroporates various previously scattered around Iglu-related tools into a single well-organized tool.

For this release, Igluctl include three commands:

* `static generate` - previously known as `schema-guru ddl`
* `static push` - previously known as Registry Syncer bash script
* `lint` - brand new command

Since its [0.3.0 release][schema-guru-030], Schema Guru was including a `ddl` subcommand, allowing to transform JSON Schemas to DDL files.
Trying to gather all tools related to Iglu in one place we decided to factor out this functionality from Schema Guru and embed it into Igluctl.
In this release there's no new features or changed behavior and interface of command also remains pretty much the same as it was for Schema Guru, except obviously `schema-guru ddl` has been replaced with `igluctl static generate`.

Another ported command is `static push` which previously was a dedicated bash script inside Iglu project on Github.
It allows you to upload set of JSON Schemas from static registry to Scala Registry.
So far we do not recommend to use Scala Registry as replacement of Static Registry, but still if you have reasons to switch to it - you can use `static push` to simplify migration process.
`static push` accepts three required positional arguments: `input`,`host` and `apikey`.
First two are pretty self-descriptive, `input` is just a directory containing JSON Schemas and `host` is domain name or IP address of Scala Registry.
Third one, `apikey` is master API key which you must create manually and which need be used to create temporary read and write keys (they will be automatically deleted after command completed).
You can find out more API key, Scala Registry and how to set it up on its dedicated [wiki page][scala-registry-setup].

Third and most exciting command is `lint`, allowing you to perform syntax and consistency check (will be described below) of your JSON Schemas.
Unlike mentioned above commands, `lint` bears brand new functionality which was previously unavailable not only inside Snowplow ecosystem, but also in any other tools we're aware of.

Its interface pretty simple - it accepts one required argument `input`, which is path to local registry or single JSON Schema and one option `--skip-warnings` which forces Igluctl to omit warnings about unknwon properties (we advice you to not use it, though), so most common use would look like following:

{% highlight bash %}
$ igluctl lint /path/to/static/registry
{% endhighlight %}

`lint` can be used to increase quality of your JSON Schemas and often if even to fix errors that you can even not aware of.
All common mistakes in schemaing process can be divided into following groups:

**Syntax errors**. These are most obvious ones. Each JSON Schema must conform to JSON Meta Schema, which states for example that value of property `maximum` must be a positive integer, value of `required` must be non-empty array and so on. Syntax checks can be performed using many other JSON Schema validators, including online tools.

**Consistency check**. Unfortunately, current specification of JSON Schema doesn't include some checks. For example, if you have key `foo` inside `required` property, some predefined set of keys in `properties` without `foo` and at the same time `additionalProperties` is `false`, it's still a valid JSON Schema, but if you look closer you'll notice that it cannot validate any possible JSON instance, it is inconsistent Schema, which properties are dissonant with others. There's many more similar cases that can be uncovered only be Igluctl.

**Iglu-specific errors**. These are errors that don't make JSON Schema invalid or unusable itself, instead they make their behavior unpredictable only inside Iglu-aware applications. Most notable case is when its path on Static Registry dissonant with Self-describing info.

**Minor errors**. These are errors that marked as warnings in other validation tools (and can be omitted using `--skip-warings` options), but in fact they can be critial. Most common case is unknwon property. JSON Schema tolerate it and states that it is up to validator application to implement some property (or string format) or not. But in fact, these leads to all kinds of confustions and further mistakes. For example, we've seen people confuse `maximum` property with `maxValue` from JSON Schema pre-DraftV4, which means Schema will validate, invalid instance and what is more important it gives wrong information to derivation tools, like `static generate`, which will produce incorrect DDL.

Performing this kinds of check will help you to maintain quality of your JSON Schemas at very high level, which can reduce data loss and increase stability of your data pipeline.

<h2 id="schema-ddl">2. Schema DDL</h2>

Schema DDL was used in Snowplow for about year, serving part of abstract syntax tree for Redshift DDL.
But as Iglu becomes mature project, we're starting to see its purpose and scope of work more clearly, which leads to little reshapings of our libraries.
First part of of this reshapings was `igluctl static`, which now gathers commands previously implemented as stand-alone.
Second part of reshaping is move of Schema DDL into Iglu project, as it was nicely coupled with our schemaing approach and other Iglu subsystems.

It also includes major change in stucture of project.
Redshift AST, previously avaiable at `com.snowplowanalytics.schemaddl.generators.redshift.Ddl` now has been moved to `com.snowplowanalytics.iglu.schemaddl.redshift` package (notice `iglu` part).
`generators` pacakge is still available, but now contains only functions related to DDL and migrations generation.

Now `redshift` package also includes AST for `ALTER TABLE` statement.

Schema DDL now also comes with abstract syntax tree for JSON Schema, our second AST, which allows you to parse arbitray JSON into typesafe AST.
This AST drives Schema linting and DDL derivation and in future will be used more widely for various Iglu-related tasks.

Schema DDL now is also available on JCenter and can be included into SBT project like following:

{% highlight scala %}
"com.snowplowanalytics" % "schema-ddl" %% "0.4.0"
{% endhighlight %}

<h2 id="roadmap">3. Iglu roadmap</h2>

At this moment, we have two major independent goals for Iglu Registry system:

* First class support for database table definitions and mappings between this definitions and corresponding schemas. This should allow users of Snowplow platform to concentrate on single schema definitions and forget about tedious table deployments and manual data migration process.
* Schema inference. This is one more step to make Iglu system "just work", without user interaction.

Stay tuned!

<h2 id="help">4. Getting help</h2>

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[scinde-dawk]: https://en.wikipedia.org/wiki/Scinde_Dawk
[scinde-dawk-img]: /assets/img/blog/2016/07/scinde-dawk.png

[schema-guru-030]: http://snowplowanalytics.com/blog/2015/07/29/schema-guru-0.3.0-released-for-generating-redshift-tables-from-json-schemas/
[igluctl-wiki]: https://github.com/snowplow/iglu/wiki/Igluctl
[redshift-copy]: http://docs.aws.amazon.com/redshift/latest/dg/r_COPY.html

[snowplow]: https://github.com/snowplow/snowplow
[schema-guru]: https://github.com/snowplow/schema-guru
[self-describing-schemas]: https://github.com/snowplow/iglu/wiki/Self-describing-JSON-Schemas

[static-registry-setup]: https://github.com/snowplow/iglu/wiki/Static-repo-setup
[scala-registry-setup]: https://github.com/snowplow/iglu/wiki/Scala-repo-server-setup

[iglu-repo]: https://github.com/snowplow/iglu
[issues]: https://github.com/snowplow/snowplow/iglu
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
