---
layout: post
title: Schema Guru 0.4.0 with Apache Spark support released
title-short: Schema Guru 0.4.0
tags: [json, json schema, schema, iglu, self-describing, redshift, spark, amazon]
author: Anton
category: Releases
---

We are pleased to announce the release of Schema Guru version 0.4.0 with [Apache Spark] [spark] support, new features in both schema and ddl subcommands, bug fixes and other enhancements.

In support of this, we have also released version 0.2.0 of the [schema-ddl] [ddl-repo] library, with Scala 2.11 support, Amazon Redshift `COMMENT ON` and a more precise schema-to-DDL transformation algorithm.

This release post will cover the following topics:

1. [Apache Spark support](/blog/2015/11/17/schema-guru-0.4.0-with-apache-spark-support-released/#spark)
2. [Predefined enumerations](/blog/2015/11/17/schema-guru-0.4.0-with-apache-spark-support-released/#enums)
3. [Comments on Redshift table](/blog/2015/11/17/schema-guru-0.4.0-with-apache-spark-support-released/#comment)
4. [Support for minLength and maxLength properties](/blog/2015/11/17/schema-guru-0.4.0-with-apache-spark-support-released/#length)
5. [Edge cases in DDL generation](/blog/2015/11/17/schema-guru-0.4.0-with-apache-spark-support-released/#edge-cases)
6. [Minor changes](/blog/2015/11/17/schema-guru-0.4.0-with-apache-spark-support-released/#minor)
7. [Bug fixes](/blog/2015/11/17/schema-guru-0.4.0-with-apache-spark-support-released/#bugs)
8. [Upgrading](/blog/2015/11/17/schema-guru-0.4.0-with-apache-spark-support-released/#upgrading)
9. [Getting help](/blog/2015/11/17/schema-guru-0.4.0-with-apache-spark-support-released/#help)
10. [Plans for the next release](/blog/2015/11/17/schema-guru-0.4.0-with-apache-spark-support-released/#roadmap)

<!--more-->

<h2 id="spark">1. Apache Spark support</h2>

This release lets you run Schema Guru's JSON Schema derivation process as an Apache Spark job - letting you derive your schemas from much larger collections of JSON instances.

For users of Amazon Web Services we provide a [tasks.py] [tasks-py] file to quickly deploy an EMR cluster and run your Schema Guru job against your JSON instances stored in Amazon S3.

To use this you will need to have [boto] [boto], [pyinvoke] [pyinvoke] and [awscli] [awscli] packages installed. If you prefer not to install these manually, they are automatically installed via our Vagrant provisioning:

{% highlight bash %}
 host> git clone https://github.com/snowplow/schema-guru
 host> cd schema-guru
 host> vagrant up && vagrant ssh
guest> cd /vagrant
{% endhighlight %}

Either way, you will also need to have:

* An AWS CLI profile, e.g. *my-profile*
* A EC2 keypair, e.g. *my-ec2-keypair*
* At least one Amazon S3 bucket, e.g. *my-bucket*

With all the prerequisites in place you can now run the job:

{% highlight bash %}
guest> cd sparkjob
guest> inv run_emr my-profile my-bucket/input/ my-bucket/output/ my-bucket/errors/ my-bucket/logs my-ec2-keypair
{% endhighlight %}

You can easely modify `tasks.py` to suit your own needs:

* To pass non-default options to the job, e.g. enum cardinality, just modify `args` list in `run_emr` task. All options passed after path to jar file will be accepted as regular Schema Guru options
* You can adapt this script to run Schema Guru against your own non-AWS Spark cluster

<h2 id="enums">2. Predefined enumerations</h2>

While deriving schemas, we often encounter some repeating enumerations like ISO country codes, browser user agents or similar.

In the [0.2.0 release] [020-release], we implemented an enum derivation allowing us automatically recognize set of values whithin some cardinality limit.

However, if during derivation we only see, say, 100 of 165 possible currency codes, it's very unlikely that we don't need other 65. Even if we *did* encounter all 165 currency codes, if our enum detector's cardinality limit is 100 then the enum set will be rejected.

To get around this, you can now specify specific known enumerations with `--enum-sets` option. Built-in sets include [iso_4217] [iso-4217], [iso_3166-1_aplha-2] [iso-3166-1-alpha-2] and [iso_3166-1_aplha-3] [iso-3166-1-alpha-3] (written as they should appear in CLI).

If you need two or more, pass them as multiple options:

{% highlight bash %}
$ ./schema-guru-0.4.0 schema --enum-sets iso_4217 --enum-sets iso_3166-1_aplha-3 /path/to/instances
{% endhighlight %}

Or even better, you can pass special value `all` to include all built-in enum sets.

{% highlight bash %}
$ ./schema-guru-0.4.0 schema --enum-sets all /path/to/instances
{% endhighlight %}

Going further, and taking into account that users with domain-specific enums, you can now also pass in your own predefined enum sets. Just pass in the path to a JSON file containing an array with values, and if the encountered values intersetcs then the enumeration will be enforced in the schema:

{% highlight bash %}
$ ./schema-guru-0.4.0 schema --enum-sets ../favourite_colors.json --enum-sets all /path/to/instances
{% endhighlight %}

Where `favourite_colors.json` might look like this:

{% highlight json %}
["blue", "indigo", "purple", "violet", "white", "black"]
{% endhighlight %}

<h2 id="comment">3. Redshift object comments</h2>

[Amazon Redshift] [redshift] is based on PostgreSQL 8.0.2 and thus they have many similarities and shared features. One powerful feature of PostgreSQL is the ability to `COMMENT ON` on all sort of internal objects, such as tables, data bases, views etc.

Redshift also has the [COMMENT ON] [comment-on] syntax, although the documentation states that we cannot retrieve these comments with a SQL query. After some research we discovered that in fact table comments can be retrieved like so:

{% highlight sql %}
SELECT description FROM pg_description WHERE objoid = 'schema.table'::regclass
{% endhighlight %}

The `ddl` command of Schema Guru now generates a `COMMENT ON` statement for each Redshift table containing the full Iglu URI used to generate this table. In the future we will use this metadata to drive automated table migrations.

<h2 id="length">4. Support for minLength and maxLength properties</h2>

From the beginning the `ddl` subcommand has used `minLength` and `maxLength` properties of string schemas to determine whether column has type `CHAR` (fixed-length) or which `VARCHAR` size it has otherwise.

Given this, it was an omission that the `schema` subcommand does not generate `minLength` and `maxLength` properties. In this version we have fixed this, and all strings in JSON Schemas now have these properties.

**Be aware that this can produce excessively strict JSON Schemas if you process very small set of instances.** For this case we provide `--no-length` option:

{% highlight bash %}
$ ./schema-guru-0.4.0 schema --no-length /path/to/few-instances
{% endhighlight %}

With this setting, no `minLength` nor `maxLength` will appear in the resulting JSON Schema.

<h2 id="edge-cases">5. Edge cases in DDL generation</h2>

It can be challenging to precisely map the very powerful and dynamic set of JSON Schema rules to static database table DDL. With each release we aim to track down and solve the edge cases we have found.

With this release, Schema Guru can now process sub-objects in JSON Schema which lack the `properties` property:

* If the sub-object lacks `properties` but contains `patternProperties` it will be resulted in `VARCHAR(4096)`
* If the sub-object lacks `properties` but `additionalProperties` is set to `false` the object will be silently ignored

Schema Guru is also now aware of nullable parent objects: if a child key is listed in the `required` property, but the containing object is *not* required, then these keys will *not* have a `NOT NULL` constraint in their DDL.

<h2 id="minor">6. Minor changes</h2>

There are some minor changes introduced in this release:

* Schema Guru now throws an exception if you try to use `--with-json-paths` and `--split-product-types` together, because there is no support for split product types in our JSON Path generation code yet
* The `--size` option for the `ddl` subcommand, used to declare default `VARCHAR` size, has been renamed to `--varchar-size` ([issue #98] [issue-98])

<h2 id="bugs">7. Bug fixes</h2>

Since implementing Base64 detection, we sometimes saw false positives where this formatting rule was unfairly applied to short human-readable strings (that happened to also be valid Base64), as per [issue #76] [issue-76]. Now, application of this pattern depends on the total quantity of JSON instances being processed, and the length of the string, so the chance of false detection has been reduced almost to zero.

While generating DDL, Schema Guru now [correctly handles] `maxLength` for complex types like `["object", "string"]` ([issue #35] [issue-35]).

Also, a regression around schemas for array structures, introduced in the [0.2.0 release] [020-release], has been fixed ([issue #81] [issue-81]).

<h2><a name="upgrading">8. Upgrading</a></h2>

<h3>Schema Guru CLI</h3>

Simply download the latest Schema Guru from Bintray:

{% highlight bash %}
$ wget http://dl.bintray.com/snowplow/snowplow-generic/schema_guru_0.4.0.zip
$ unzip schema_guru_0.4.0.zip
{% endhighlight %}

Assuming you have a recent JVM installed, running should be as simple as:

{% highlight bash %}
$ ./schema-guru-0.4.0 {schema|ddl} {input} {options}
{% endhighlight %}

<h3>Schema Guru web UI</h3>

The Web UI can be also downloaded from Bintray:

{% highlight bash %}
$ wget http://dl.bintray.com/snowplow/snowplow-generic/schema_guru_webui_0.4.0.zip
$ unzip schema_guru_webui_0.4.0.zip
{% endhighlight %}

Note that the Web UI has been updated only to reflect the codebase refactoring; no new features have been added.

<h3>Schema Guru Spark job</h3>

For running Schema Guru on Spark, please see the relevant section above. For AWS Elastic MapReduce users, we host the Spark job on S3 as:

s3://snowplow-hosted-assets/schema-guru/spark/schema-guru-sparkjob-0.4.0

You can download this if you want to run this job on Spark elsewhere:

{% highlight bash %}
$ wget https://snowplow-hosted-assets.s3.amazonaws.com/schema-guru/spark/schema-guru-sparkjob-0.4.0
{% endhighlight %}

<h2><a name="help">9. Getting help</a></h2>

For more details on this release, please check out the [Schema Guru 0.4.0] [040-release] on GitHub.

More details about how core of Schema Guru works can be found on the [For Developers] [for-developers] page of the Schema Guru wiki.

In the meantime, if you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

<h2><a name="roadmap">10. Plans for next release</a></h2>

We have plenty of features planned for Schema Guru! The roadmap includes:

* Generating schemas in Apache Avro format ([issue #38] [issue-38])
* Deriving the `required` property in our `schema` subcommand ([issue #54] [issue-54])
* Generating `CREATE TABLE` DDL for other databases ([issue #26] [issue-26])

[spark]: http://spark-project.org/
[pyinvoke]: http://www.pyinvoke.org/
[boto]: https://github.com/boto/boto
[awscli]: https://aws.amazon.com/cli/
[vagrant]: https://www.vagrantup.com/
[avro]: https://avro.apache.org/
[redshift]: http://aws.amazon.com/redshift/

[tasks-py]: https://raw.githubusercontent.com/snowplow/schema-guru/release/0.4.0/sparkjob/tasks.py
[fatjar]: http://dl.bintray.com/snowplow/snowplow-generic/schema_guru_sparkjob_0.4.0.zip
[spark-example-project]: https://github.com/snowplow/spark-example-project
[for-developers]: https://github.com/snowplow/schema-guru/wiki/For-developers

[iso-4217]: https://en.wikipedia.org/wiki/ISO_4217
[iso-3166-1-alpha-2]: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
[iso-3166-1-alpha-3]: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3
[comment-on]: http://docs.aws.amazon.com/redshift/latest/dg/r_COMMENT.html

[ddl-repo]: https://github.com/snowplow/schema-ddl
[issues]: https://github.com/snowplow/schema-guru/issues
[issue-38]: https://github.com/snowplow/schema-guru/issues/38
[issue-54]: https://github.com/snowplow/schema-guru/issues/54
[issue-76]: https://github.com/snowplow/schema-guru/issues/76
[issue-81]: https://github.com/snowplow/schema-guru/issues/81
[issue-98]: https://github.com/snowplow/schema-guru/issues/98
[issue-26]: https://github.com/snowplow/schema-ddl/issues/26
[issue-35]: https://github.com/snowplow/schema-ddl/issues/35
[040-release]: https://github.com/snowplow/schema-guru/releases/tag/0.4.0
[030-release]: https://github.com/snowplow/schema-guru/releases/tag/0.3.0
[020-release]: http://snowplowanalytics.com/blog/2015/07/05/schema-guru-0.2.0-released/
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
