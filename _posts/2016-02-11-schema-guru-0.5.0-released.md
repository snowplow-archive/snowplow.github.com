---
layout: post
title: Schema Guru 0.5.0 released
title-short: Schema Guru 0.5.0
tags: [json, json schema, schema, ddl, redshift]
author: Anton
category: Releases
---

We are pleased to announce the releases of [Schema Guru][repo] 0.5.0 and [Schema DDL][ddl-repo] 0.3.0, with JSON Schema and Redshift DDL processing enhancements and several bug fixes.

This release post will cover the following topics:

1. [More git-friendly DDL files](/blog/2016/02/11/schema-guru-0.5.0-released/#git-friendly)
2. [Added Java interoperability](/blog/2016/02/11/schema-guru-0.5.0-released/#java)
3. [Fixed DDL file version bug](/blog/2016/02/11/schema-guru-0.5.0-released/#version)
4. [Improvements in Schema-to-DDL transformation](/blog/2016/02/11/schema-guru-0.5.0-released/#schema-to-ddl)
5. [Upgrading](/blog/2016/02/11/schema-guru-0.5.0-released/#upgrading)
6. [Getting help](/blog/2016/02/11/schema-guru-0.5.0-released/#help)
7. [Plans for future releasess](/blog/2016/02/11/schema-guru-0.5.0-released/#roadmap)

<!--more-->

<h2 id="git-friendly">1. More git-friendly DDL files</h2>

Usually Schema Guru users store their DDL files along with their JSON Schemas in a single git repository; if the user adds or modifies their schemas and then regenerates the DDL files, all of the DDL files will then contain fresh timestamps, leading to confusing `git diff`s.

To avoid this you can now use `--no-header` option, whereby Schema Guru will generates DDL files without any header information, just plain DDL.

<h2 id="java">2. Added Java interoperability</h2>

Java users have been keen to use Schema Guru from their code - from this release, all the schema-to-DDL processing and schema flattening features of the Schema DDL library are available from Java.

<h2 id="version">3. Fixed DDL file version bug</h2>

Schema DDL had a long-standing bug where it versioned all Redshift DDLs with hardcoded `_1` version postfix.

To work well with [SchemaVer][schemaver], our Redshift DDL should be versioned after the `MODEL` element of JSON Schema version. For example, schemas with SchemaVers 1-0-0, 1-2-0 or 1-2-3 should all result in table with a version postfix `_1`, and events having any of these three versions can be loaded into this `_1` table.

Many thanks to community member [Cameron Bytheway][camshaft] for his fix here! 

<h2 id="schema-to-ddl">4. Improvements in Schema-to-DDL transformation</h2>

With each new release Schema Guru is steadily growing smarter at transforming JSON Schemas into DDL files, 
detecting various clues about how to map JSON Schema properties into column definitions.

This release brings the following improvements:

* Property of type `string` with equal `minLength` and `maxLength` will become `CHAR` even if it can also become `null`
* Property of type `number` having `multipleOf` equal `1` will become `INT`
* Property of type `number` having `multipleOf` equal `0.01` will become `DECIMAL` with 2 digits after floating point (this is useful for monetary amounts)

<h2><a name="upgrading">5. Upgrading</a></h2>

<h3>Schema Guru CLI</h3>

Simply download the latest Schema Guru from Bintray:

{% highlight bash %}
$ wget http://dl.bintray.com/snowplow/snowplow-generic/schema_guru_0.5.0.zip
$ unzip schema_guru_0.5.0.zip
{% endhighlight %}

Assuming you have a recent JVM installed, running should be as simple as:

{% highlight bash %}
$ ./schema-guru-0.5.0 {schema|ddl} {input} {options}
{% endhighlight %}

<h3>Schema Guru web UI and Spark Job</h3>

No changes have been made to either Schema Guru web UI and Spark Job, so you still can freely use 0.4.0 versions. Versions with the 0.5.0 badge are also available on Bintray for consistency.

<h2><a name="help">6. Getting help</a></h2>

For more details on this release, please check out the [Schema Guru 0.5.0] [050-release] on GitHub.

More details on the technical architecture of Schema Guru can be found on the [For Developers] [for-developers] page of the Schema Guru wiki.

If you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

<h2><a name="roadmap">7. Plans for future releases</a></h2>

We have plenty of features planned for Schema Guru! The roadmap includes:

* Generating schemas in Apache [Avro][avro] format ([issue #38] [issue-38])
* Deriving the `required` property in our `schema` subcommand ([issue #54] [issue-54])
* Generating `CREATE TABLE` DDL for other databases ([issue #26] [issue-26])

[schemaver]: http://snowplowanalytics.com/blog/2014/05/13/introducing-schemaver-for-semantic-versioning-of-schemas/
[vagrant]: https://www.vagrantup.com/
[avro]: https://avro.apache.org/
[for-developers]: https://github.com/snowplow/schema-guru/wiki/For-developers
[camshaft]: https://github.com/camshaft

[repo]: https://github.com/snowplow/schema-guru
[ddl-repo]: https://github.com/snowplow/schema-ddl
[issues]: https://github.com/snowplow/schema-guru/issues
[issue-38]: https://github.com/snowplow/schema-guru/issues/38
[issue-54]: https://github.com/snowplow/schema-guru/issues/54
[issue-26]: https://github.com/snowplow/schema-ddl/issues/26
[050-release]: https://github.com/snowplow/schema-guru/releases/tag/0.5.0
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
