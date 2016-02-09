---
layout: post
title: Schema Guru 0.5.0 released
title-short: Schema Guru 0.5.0
tags: [json, json schema, schema]
author: Anton
category: Releases
---

We are pleased to announce releases of [Schema Guru][repo] version 0.5.0 and [Schema DDL][ddl-repo] version 0.3.0 with Schema processing enhancements and several bug fixes.

This release post will cover the following topics:

1. [Removing timestamp from DDL file](/blog/2016/02/09/schema-guru-0.5.0-released/#timestamp)
2. [Java interop](/blog/2016/02/09/schema-guru-0.5.0-released/#java)
3. [DDL file version](/blog/2016/02/09/schema-guru-0.5.0-released/#version)
4. [Improvements in Schema-to-DDL transformation](/blog/2016/02/09/schema-guru-0.5.0-released/#schema-to-ddl)
5. [Upgrading](/blog/2016/02/09/schema-guru-0.5.0-released/#upgrading)
6. [Getting help](/blog/2016/02/09/schema-guru-0.5.0-released/#help)
7. [Plans for the next release](/blog/2016/02/09/schema-guru-0.5.0-released/#roadmap)


<!--more-->

<h2 id="timestamp">1. Removing timestamp from DDL file</h2>

Usually Schema Guru users store their DDL files along with JSON Schemas in a single git repository.

If someone  adds new JSON Schemas into repository or modifying old ones and after that regenarate DDL files, all of them contain fresh timestamps.
Basically these fresh timestamps bear no useful information, but result in unwanted git diffs.
To avoid it you now can use `--no-header` option. 
Given it, Schema Guru will produces DDL file without any unneccessary information, just plain DDL.

<h2 id="java">2. Java interop</h2>

We're at Snowplow are heavy Scala users. 
However it's always good to know our libraries can be used from plain old Java code.
Especially taking in account it's very easy to achieve.

Now all schema-to-ddl processing and schema flattening features of Schema DDL are available in Java.

<h2 id="version">3. DDL file version</h2>

Schema DDL had a long-standing subtle bug, versioning all Redshift DDLs with hardcoded `_1` version postfix.
Accoring to [SchemaVer][schemaver] DDL has to be versioned after major JSON Schema version.
For example, Schemas with SchemaVers 1-0-0, 1-2-0, 1-2-3 should all result in table with version postfix `_1`
and events having any of these three versions can be loaded into `_1` table.

Thanks to Github user [Cameron Bytheway][camshaft] this bug has been fixed. 

<h2 id="schema-to-ddl">4. Improvements in Schema-to-DDL transformation</h2>

With each new release Schema Guru becoming smarter in transforming JSON Schemas to DDL files, 
getting new clues about how to map JSON Schema properties into column definitions.

This release brings following improvements:

* Property of type `string` with equal `minLength` and `maxLength` will become `CHAR` even if it can also become `null`
* Property of type `number` having `multipleOf` equal `1` will become `INT`.
* Property of type `number` having `multipleOf` equal `0.01` will become `DECIMAL` with 2 digits after floating point.

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

No changes has been made in both Schema Guru web UI and Spark Job, so you still can freely use 0.4.0 versions.

<h2><a name="help">6. Getting help</a></h2>

For more details on this release, please check out the [Schema Guru 0.5.0] [050-release] on GitHub.

More details about how core of Schema Guru works can be found on the [For Developers] [for-developers] page of the Schema Guru wiki.

In the meantime, if you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

<h2><a name="roadmap">7. Plans for next release</a></h2>

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
