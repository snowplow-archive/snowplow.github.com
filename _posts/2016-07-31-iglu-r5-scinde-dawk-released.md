---
layout: post
title: Iglu Schema Registry 5 Scinde Dawk released
title-short: Iglu 5 Scinde Dawk
tags: [iglu, json, json schema, registry]
author: Anton
category: Releases
---

We are pleased to announce the fifth release of the [Iglu Schema Registry System][iglu-repo], with an initial release of `igluctl` - an Iglu command-line tool and Schema DDL as part of Iglu project.

Read on for more information on Release 5 Scinde Dawk, named after the [first postage stamp in Asia] [scinde-dawk]:

1. [igluctl](/blog/2016/07/31/iglu-r5-scinde-dawk-released/#igluctl)
2. [Schema DDL](/blog/2016/07/31/iglu-r5-scinde-dawk-released/#schema-ddl)
3. [Migration guide](/blog/2016/07/31/iglu-r5-scinde-dawk-released/#migration)
4. [Iglu roadmap](/blog/2016/07/31/iglu-r5-scinde-dawk-released/#roadmap)
5. [Getting help](/blog/2016/07/31/iglu-r5-scinde-dawk-released/#help)

![scinde-dawk-img] [scinde-dawk-img]

<!--more-->

<h2 id="igluctl">1. igluctl</h2>

The main feature of this release is our new `igluctl` command-line application, which collects various separate Iglu-related tools into a single easy-to-use CLI app.

At launch, [`igluctl`] [igluctl-wiki] includes three commands:

* `static generate` - which started life as Schema Guru's `schema-guru ddl` command
* `static push` - which originated as Iglu's Registry Syncer bash script
* `lint` - a brand new command, which performs syntax and consistency checking for JSON Schemas

<h3 id="igluctl-static-generate">1.1 static generate</h3>

From its [0.3.0 release] [schema-guru-030], [Schema Guru] [schema-guru] has included a `ddl` subcommand, which reads JSON Schemas and creates corresponding Redshift table definitions plus JSON Paths files to load these tables.

To centralize all tools related to Iglu in one place, we decided to factor out this functionality from Schema Guru and embed it into `igluctl`. In this release there are no new features and the command's interface remains the same as it was for Schema Guru, except `schema-guru ddl` has been replaced with `igluctl static generate`.

<h3 id="igluctl-static-push">1.2 static push</h3>

Another ported command is `static push`, which was previously a dedicated bash script inside Iglu project on GitHub. It allows you to upload set of JSON Schemas from a local static registry to Iglu's [Scala schema registry] [scala-registry].

`static push` accepts three required positional arguments: `input`, `host` and `apikey`:

* `input` is just a directory containing JSON Schemas
* `host` is domain name or IP address of your Scala schema registry
* `apikey` is the master API key, which you must create manually, and willl be used to create temporary read and write keys (they will be automatically deleted after command completed)

You can find out more Iglu's Scala schema registry and how to set it up on its dedicated [wiki page] [scala-registry-setup].

<h3 id="igluctl-lint">1.3 lint</h3>

The third and most exciting subcommand of `igluctl` is `lint`, which allows you to perform syntax and consistency checking of your JSON Schemas. `lint` is an all-new command, and we're not aware of anything similar outside of the Snowplow ecosystem.

`igluctl lint`accepts one required argument, `input`, which is a path to a local static registry or a single JSON Schema, and one optional argument, `--skip-warnings` which forces `igluctl` to omit warnings about unknown properties if required.

A typical use of the `lint` command would look like following:

{% highlight bash %}
$ igluctl lint /path/to/static/registry
{% endhighlight %}

We strongly advise you to use `igluctl lint` to increase quality of your JSON Schemas! This command can surface difficult to detect mistakes in the schema'ing process across the following categories:

**Syntax errors**. These are the most obvious errors. Each JSON Schema must conform to the JSON Meta Schema, which states for example that the value of property `maximum` must be a positive integer, the value of `required` must be a non-empty array and so on.

**Consistency check**. Unfortunately, the current specification of JSON Schema does not include some checks. For example, if you have the key `foo` inside `required` property, some predefined set of keys in `properties` without `foo` and at the same time `additionalProperties` is `false`, it's still a valid JSON Schema, but it cannot validate any possible JSON instance. `igluctl` can identify these and other inconsistencies.

**Iglu-specific errors**. These are errors that don't make a JSON Schema invalid or unusable itself, but they do make their behavior unpredictable inside Iglu-aware applications. The most notable example is when the schema's path within the Iglu static registry conflicts with the schema's self-describing metadata.

**Minor errors**. These are errors that other validation tools mark as warnings (and *can* be omitted by `lint` using `--skip-warnings`), but in fact can prove critical. The most common case is an unknown property: JSON Schema tolerates this and states that it is up to the validating application to implement some property, but this latitude can leads to confusions and further mistakes. For example, we've seen people confuse the `maximum` property with `maxValue` from JSON Schema pre-DraftV4, which means that the JSON Schema will validate incorrect instances, and tools like `static generate` will then produce incorrect DDL.

Performing these kinds of check will help you to maintain quality of your JSON Schemas at a high level, which can reduce data loss and increase the stability of your data pipeline. In future versions we're planning to introduce [severity levels][iglu-issue-175] to handle even more subtle things that can possibly lead to undesired behavior.

<h2 id="schema-ddl">2. Schema DDL</h2>

The standalone [Schema DDL library] [schema-ddl-repo] has been in use inside Snowplow for about year, providing a partial [abstract syntax tree][ast] for Redshift tables. As part of the restructuring of Iglu, we are moving Schema DDL into the main Iglu project.

As part of this move, the main package is `com.snowplowanalytics.iglu.schemaddl`, instead of the previous `com.snowplowanalytics.schemaddl`. This breaking change allowed us to reorganize the existing package stucture, making the Redshift DDL AST available as `com.snowplowanalytics.iglu.schemaddl.redshift`, the first of many. This highlights the purpose of the Schema DDL project: to contain abstract syntax trees (ASTs) and related functions for various data definition languages and schema formats.

And to double down on this, in this release we also introduce a new AST for JSON Schema, available at `com.snowplowanalytics.iglu.schemaddl.jsonschema`.
JSON Schema's AST can be used to parse arbitray JSON into typesafe AST and drives schema linting and DDL derivation for JSON Schema; in future it will be used more widely for various Iglu-related tasks.

The Schema DDL artifact now is also available on JCenter and Maven Central, and can be included into SBT project as follows:

{% highlight scala %}
"com.snowplowanalytics" %% "schema-ddl" % "0.4.0"
{% endhighlight %}

<h2 id="migration">3. Migration guide</h2>

Given that Redshift table and JSON Paths file generation is now available as part of `igluctl`, we will be deprecating `schema-guru ddl` command - of course, everything related to JSON Schema derivation remains. It means we strongly encourage you to switch to `igluctl` as soon as possible for DDL generation.

You can download `igluctl` from Bintray using the following link:

{% highlight bash %}
$ wget http://dl.bintray.com/snowplow/snowplow-generic/igluctl_0.1.0.zip
$ unzip -j igluctl_0.1.0.zip
{% endhighlight %}

Migration should be fairly easy: you just need to replace `./schema-guru ddl` with `./igluctl static generate`. All options remain the same with only two minor  behavioral changes:

* The command now exits with status 1 if any error has been encountered in any JSON Schema
* The default Redshift [encoding][redshift-encoding] for BOOLEAN column is now `RUNLENGTH` instead of `RAW`

<h2 id="roadmap">4. Iglu roadmap</h2>

At this moment, we have two major independent goals for Iglu:

1. First-class support for database table definitions and mappings between these definitions and corresponding schemas. This should allow users of the Snowplow platform to concentrate on schema definitions and forget about tedious table deployments and manual data migrations
2. Schema inference. This is one more step towards making Iglu "just work", without users having to do exhaustive upfront schema definition

Stay tuned!

<h2 id="help">5. Getting help</h2>

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[scinde-dawk]: https://en.wikipedia.org/wiki/Scinde_Dawk
[scinde-dawk-img]: /assets/img/blog/2016/07/scinde-dawk.png

[iglu-issue-175]: https://github.com/snowplow/iglu/issues/175

[igluctl-wiki]: https://github.com/snowplow/iglu/wiki/Igluctl
[schema-guru-030]: http://snowplowanalytics.com/blog/2015/07/29/schema-guru-0.3.0-released-for-generating-redshift-tables-from-json-schemas/
[schema-guru]: https://github.com/snowplow/schema-guru
[self-describing-schemas]: https://github.com/snowplow/iglu/wiki/Self-describing-JSON-Schemas
[scala-registry]: https://github.com/snowplow/iglu/tree/master/2-repositories/scala-repo-server
[scala-registry-setup]: https://github.com/snowplow/iglu/wiki/Scala-repo-server-setup

[schema-ddl-repo]: https://github.com/snowplow/schema-ddl

[ast]: https://en.wikipedia.org/wiki/Abstract_syntax_tree
[redshift-encoding]: http://docs.aws.amazon.com/redshift/latest/dg/t_Compressing_data_on_disk.html

[iglu-repo]: https://github.com/snowplow/iglu
[issues]: https://github.com/snowplow/snowplow/iglu
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
