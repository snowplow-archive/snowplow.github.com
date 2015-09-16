---
layout: post
shortenedlink: Schema Guru 0.4.0 released
title: Schema Guru 0.4.0 released with Apache Spark Job
title-short: Schema Guru 0.4.0
tags: [json, json schema, schema, iglu, self-describing, redshift, spark, amazon]
author: Anton
category: Releases
---

We are pleased to announce 0.4.0 release of Schema Guru with [Apache Spark] [spark] support, massive core refactoring, new features in both schema and ddl subcommands, bug fixes and other enhancements.
Also [Schema DDL] [ddl-repo] 0.2.0 released with Scala 2.11 support, Amazon Redshift COMMENT ON tweak and more precise Schema-to-DDL transformation.


This release post will cover the following topics:

1. [Apache Spark Job](/blog/2015/09/15/schema-guru-0.4.0-released/#spark)
2. [Core refactoring](/blog/2015/09/15/schema-guru-0.4.0-released/#refactoring)
3. [Predefined enum sets](/blog/2015/09/15/schema-guru-0.4.0-released/#enums)
4. [Comments on Redshift table](/blog/2015/09/15/schema-guru-0.4.0-released/#comment)
5. [Support for minLength and maxLength properties](/blog/2015/09/15/schema-guru-0.4.0-released/#length)
6. [Edge cases in DDL generation](/blog/2015/09/15/schema-guru-0.4.0-released/#edge-cases)
7. [Minor changes](/blog/2015/09/15/schema-guru-0.4.0-released/#minor)
8. [Bug fixes](/blog/2015/09/15/schema-guru-0.4.0-released/#bugs)
9. [Upgrading](/blog/2015/09/15/schema-guru-0.4.0-released/#upgrading)
10. [Getting help](/blog/2015/09/15/schema-guru-0.4.0-released/#help)
11. [Plans for the next release](/blog/2015/09/15/schema-guru-0.4.0-released/#roadmap)

<!--more-->

<h2 id="spark">1. Apache Spark Job</h2>

Biggest new thing of this release is ability to run JSON Schema derivation as Apache Spark job on AWS Elastic MapReduce cluster or on your own.

For AWS setup we provide [pyinvoke] [pyinvoke] tasks file which allow you quickly deploy EMR cluster and run job on huge sets of JSON instances storing in S3 buckets.
Tasks file and other parts of job based on our [Spark Example Project] [spark-example-project].

To publish and run Schema derivation job you need to have [boto] [boto], [pyinvoke] [pyinvoke] and [awscli] [awscli] packages installed.
One way is to install everything using vagrant provisioning:

{% highlight bash %}
 host> git clone https://github.com/snowplow/schema-guru
 host> cd schema-guru
 host> vagrant up && vagrant ssh
guest> cd /vagrant
guest> sbt "project schema-guru-sparkjob" "assembly"
{% endhighlight %}

This will install all tools you need to vagrant guest machine and assemble fatjar.

Another way is to download [fatjar] [fatjar] with Schema Guru Spark job from Bintray, install pyinvoke, boto and awscli manually, then download [tasks.py] [tasks-py] and point `DIR_WITH_JAR` variable in it to actual directory with JAR file.

Whichever way you choose you will also need to have:

* An AWS CLI profile, e.g. *guru-profile*
* A EC2 keypair, e.g. *spark-ec2-keypair*
* A VPC public subnet, e.g. *subnet-3dc2bd2a*
* At least one Amazon S3 bucket e.g. *guru-bucket*

Optionally you can have different buckets for input JSONs, output Schemas, output errors and warnings, store JAR file, but in this case notice that they have to belong to one AWS region.

After you have all prerequisites you can upload fatjar to chosen S3 bucket and run the job:

{% highlight bash %}
$ cd sparkjob
$ inv upload guru-profile guru-jar-bucket
$ inv run_emr guru-profile guru-bucket guru-bucket/warnings/ guru-bucket/output/ guru-bucket/jsons/ spark-ec2-keypair subnet-3dc2bd2a
{% endhighlight %}

Notice presence of trailing slashes in all arguments except bucket for storing jar.
Also warnings and output dirs should not exist.

You can easely modify `tasks.py` to suit your own needs. 
For example, to pass non-default options to job, like enum cardinality just modify `args` list in `run_emr` task.
All options passed after path to jar file will be accepted as usual Schema Guru options.
Spark job accept same options as CLI application but `--output` isn't optional since we can't output to terminal and also we have optional `--errors-path` (without it warnings and errors output will be suppressed).

<h2 id="refactoring">2. Core refactoring</h2>

Schema Guru moving towards general purpose Schema processing library.
And as first step in this direction we made a big core refactoring allowing us to merge, traverse, modify schemas in type-safe manner.
More details about how core of Schema Guru works can be found on [For Developers] [for-developers] page of Schema Guru wiki.
Next step in this direction will be support another schema outputs like [Apache Avro] [avro].

<h2 id="enums">3. Predefined enum sets</h2>

While deriving schema we often encounter some repeating enum sets like country codes defined by ISO, user agents or something very domain-specific.
In [0.2.0 release] [020-release] we implemented an enum derivation allowing us automatically recognize set of values whithin some cardinality limit.
But if we met only 100 of 165 known currency codes it's very unlikely we don't need other 65, and even if we met all 165 known codes, but limit enum carindinality to only 100 all encountered values will be discarded because of this limit.

Now you can specify some specific known enum sets with `--enum-sets` option. 
Built-in sets include [iso_4217] [iso-4217], [iso_3166-1_aplha-2] [iso-3166-1-alpha-2] and [iso_3166-1_aplha-3] [iso-3166-1-alpha-3] (written as they should appear in CLI).

If you need two or more, pass it as multioption:

{% highlight bash %}
$ ./schema-guru-0.4.0 schema --enum-sets iso_4217 --enum-sets iso_3166-1_aplha-3 /path/to/instances
{% endhighlight %}

Or even better, you can pass special value `all` to include all built-in enum sets.

{% highlight bash %}
$ ./schema-guru-0.4.0 schema --enum-sets all /path/to/instances
{% endhighlight %}

And this is not the end. Taking in account that some users may have very domain-specific enums, we allow user to pass his own predefined enum set.
Instead of `all` or predefined set just pass the path to JSON file containing array with values and if encountered values intersetcs with it result schema will have full set.

{% highlight bash %}
$ ./schema-guru-0.4.0 schema --enum-sets ../favourite_colors.json --enum-sets all /path/to/instances
{% endhighlight %}

Where favourite_colors.json may look like this:

{% highlight json %}
["blue", "indigo", "purple", "violet", "white", "black"]
{% endhighlight %}

<h2 id="comment">4. Redshift object comments</h2>

[Amazon Redshift] [redshift] is based on PostgreSQL 8.0.2 and thus they have many similarities and shared features.
One nice feature PostgreSQL has is comments on all sort of internal objects, like tables, data bases, views etc.
Redshift [has] [comment-on] this feature too, but documentation states that we cannot retrieve these comments with SQL query.
After some research here at Snowplow we discovered that this is not true and table comments can be retrieved with query like this:

{% highlight sql %}
SELECT description FROM pg_description WHERE objoid = 'schema.table'::regclass
{% endhighlight %}

Now `ddl` command of Schema Guru generates `COMMENT ON` statement for each Redshift table containing Iglu URI with schema version.
This metadata can be used to determine which version of schema currently deployed in Redshift and how we can upgrade it.

<h2 id="length">5. Support for minLength and maxLength properties</h2>

From the beginning `ddl` subcommand used `minLength` and `maxLength` properties of string schemas to determine whether column has type `CHAR` (fixed-length) or which `VARCHAR` size it has otherwise.
Taking this in account it's strange to not generate `minLength` and `maxLength` properties with `schema` subcommand.
Now we've fixed that issue and all strings in JSON Schemas has these properties.
Be aware of that while processing too small set of instances.

<h2 id="edge-cases">6. Edge cases in DDL generation</h2>

Sometimes it isn't easy to precisely map very powerful and dynamic set of rules of JSON Schema to static DDL.
Edge cases are infinite, and we coninuosly working on finding and solving these cases.

Now Schema Guru can process object schemas without `properties` property.
If it doesn't contains `properties`, but contains `patternProperties` it will be resulted in `VARCHAR(4096)`.
If it doesn't contains `properties`, but `additionalProperties` is set to `false` it will be skipped, but won't throw an exception.

Also Schema Guru is aware of nullable parent objects.
If some keys listed in `required` property, but object itself isn't required - all these keys will not have `NOT NULL` in column DDL.

<h2 id="minor">7. Minor changes</h2>

Few minor changes was introduced in this release.
Now Schema Guru throws exception when you try to use --with-json-paths and --split-product-types in conjunction, becuase it will defenitely lead to malformed output.
Also `--size` option for `ddl` subcommand used to declare default `VARCHAR` size was renamed to `--varchar-size` to be more self-descriptive.

<h2 id="bugs">8. Bug fixes</h2>

Since we implemented base64 detection, it sometimes [misapplied] [issue-76] to short plain strings. 
Now application of this pattern depends on total quantity of JSON instances being processing and length of the string, so chance of false detection reduced almost to zero.

While generating DDL, Schema Guru now [correctly handling] [issue-35] `maxLength` for complex types like `["object", "string"]`.

Also, bug with incorrect schema for array structures introduced in [0.2.0 release] [020-release] was fixed.

<h2><a name="upgrading">9. Upgrading</a></h2>

Simply download the latest Schema Guru from Bintray:

{% highlight bash %}
$ wget http://dl.bintray.com/snowplow/snowplow-generic/schema_guru_0.4.0.zip
$ unzip schema_guru_0.4.0.zip
{% endhighlight %}

Assuming you have a recent JVM installed, running should be as simple as:

{% highlight bash %}
$ ./schema-guru-0.4.0 {schema|ddl} {input} {options}
{% endhighlight %}

Web UI can be also downloaded from Bintray:

{% highlight bash %}
$ wget http://dl.bintray.com/snowplow/snowplow-generic/schema_guru_webui_0.4.0.zip
$ unzip schema_guru_webui_0.4.0.zip
{% endhighlight %}

Note that Web UI changed only to reflect core refactoring, no new features were added.

<h2><a name="help">10. Getting help</a></h2>

For more details on this release, please check out the [Schema Guru 0.4.0] [040-release] on GitHub.

In the meantime, if you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

<h2><a name="roadmap">11. Plans for next release</a></h2>

We still have plenty features planned for the Schema Guru! Things that will most likely appear in next release:

* `required` property derived in `schema` command
* Output Schema in Apache Avro format
* Adding the ability to generate `CREATE TABLE` DDL for other databases

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
[issue-76]: https://github.com/snowplow/schema-guru/issues/76
[issue-35]: https://github.com/snowplow/schema-ddl/issues/35
[040-release]: https://github.com/snowplow/schema-guru/releases/tag/0.4.0
[030-release]: https://github.com/snowplow/schema-guru/releases/tag/0.3.0
[020-release]: http://snowplowanalytics.com/blog/2015/07/05/schema-guru-0.2.0-released/
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
