---
layout: post
title: Schema Guru 0.6.0 released
title-short: Schema Guru 0.6.0
tags: [json, json schema, schema, ddl, redshift, schemaver]
author: Anton
category: Releases
---

We are pleased to announce the release of [Schema Guru][repo] 0.6.0 with long-awaited SQL-migrations support.

This release post will cover the following topics:

1. [Introducing migrations](/blog/2016/03/XX/schema-guru-0.6.0-released/#migrations)
2. [Redshift migrations in Schema Guru](/blog/2016/03/XX/schema-guru-0.6.0-released/#implementation)
3. [New force flag](/blog/2016/03/XX/schema-guru-0.6.0-released/#force)
4. [CLI update](/blog/2016/03/XX/schema-guru-0.6.0-released/#cli)
5. [Upgrading](/blog/2016/03/XX/schema-guru-0.6.0-released/#upgrading)
6. [Getting help](/blog/2016/03/XX/schema-guru-0.6.0-released/#help)
7. [Plans for future releases](/blog/2016/03/XX/schema-guru-0.6.0-released/#roadmap)


<!--more-->

<h2><a name="migrations">1. Introducing migrations</a></h2>

Data models tend to evolve along with business processes of a company.
This is inevitable process which is sometimes incredibly hard to handle properly.
At Snowplow we have a [SchemaVer][schemaver] format to address issues related to data model evolution.
Essentially, SchemaVer splits all data structure changes into three groups, telling engineers and analysts whether data versioned as subsequent can fit into storage versioned as initial and vice versa.
Most common type of Schema change is what we call an ADDITION, when we can guarantee all prior data can be consumed and also no data consumer will be broken because of incompatible data.

Usually ADDITIONs expressed as addition (surprisingly) of non-required property in JSON Schema.
Redshift, being a columnar storage can easily add a column at the end of a table (unlike modifying one in the middle).
Suddenly, this Redshift's property fits very well with our needs, since it allows us to express JSON Schema ADDITION as simple `ADD COLUMN` statements to get a correct migration script.
Taking these properties of Schema and Redshift we introduce an ability to generate migration scripts along with table definitions.

<h2><a name="implementation">2. Redshift migrations in Schema Guru</a></h2>

Previously with `schema-guru ddl` command you could get a table definition for MODELs of your Schema and corresponding JSONPaths.
It was simple one-to-one transformation not taking in account any information about previous Schemas.
When users met a need to add several new properties to Schema they had to compare Schemas, write SQL migrations and keeping an eye on column order which is very important in columnar data storages.
It was not just tiresome process, but also very error-prone.

Now having an initial `1-0-0` JSON Schema you can expand it to whatever you need `1-0-*` and Schema Guru will not just add columns in correct order, but also create all necessary migration scripts, so you could migrate from any preceding Schema to any succeeding.
For example, running `schema-guru ddl` on following JSON Schemas:

<pre>
com.acme/event/1-0-0
com.acme/event/1-0-1
com.acme/event/1-0-2
com.acme/event/1-1-0
com.acme/event/1-1-1
</pre>

Will result in following output:

<pre>
sql/com.acme/event/1-0-0/1-0-1.sql  - migration from 1-0-0 to 1-0-1
sql/com.acme/event/1-0-0/1-0-2.sql  - migration from 1-0-0 to 1-0-2
sql/com.acme/event/1-0-1/1-0-2.sql  - migration from 1-0-1 to 1-0-2
sql/com.acme/event/1-1-0/1-1-1.sql  - migration from 1-1-0 to 1-1-1
sql/com.acme/event_1                - actual table definition for 1-1-1
</pre>

From above we can see that Schema Guru generated a list of migration scripts across all ADDITIONs.
Also, please notice that we have no migration from `1-0-2` to `1-1-0`.
Middle number here stands for REVISION, which can include more complex table alteration rather than simple `ADD COLUMN`.
This feature is also coming soon.
Another important thing is that resulting table definition is generated for each MODEL, picking a greatest REVISION or ADDITION.
It means you will always have absolutely different tables for all MODELS.

SchemaVer was created as a general way to express data structure modifications.
It is not coupled with Redshift nor with Snowplow (nor even JSON Schema).
As a small consequence some Schema changes cannot be expressed in SQL.
For example if we added a new property to an object inside array.
Since any JSON array is represented as plain `VARCHAR(5000)` in DDL, it just doesn't make any sense to add anything to table definition.
In this case Schema Guru will just update a [comment][redshift-comments] on table with deployed Schema and won't introduce any alterations.


<h2><a name="force">3. New force flag</a></h2>

Schema Guru is steadily growing smarter at generating table definitions.
However, users still have many cases, where it is just not possible to generate DDL automatically.
It is either too sophisticated for a computer program or giving not enough input data.
In these rare cases users tend to edit their DDL files manually.

While this is totally fine, some users have an issue when Schema Guru silently overrode their edits.
We strongly advice everyone to store JSON Schemas and DDL files in Version Control System like Git so it can be restored any time.
But safety cannot be superfluous and now Schema Guru will not silently override DDL files if they already present on disk.
Instead if file already exists and its content differs from what Schema Guru just generated, user will see a warning.
By "content" we assume only the actual SQL code, not comments or formatting nuances.
Files where only comments or formatting were modified also won't be overriden, user will also see a warning about not-modified content.
So now all generation timestamps in header will be left as is.

To change this behavior user may use a `--force` flag to updated all files, not matter if they were edited or not.

<h2><a name="cli">4. CLI update</a></h2>

In this release we also introduced two minor CLI changes:

1. In Spark Job, `--enum-sets` is not an option anymore, but a flag which can be used to tell Schema Guru to check all known predefined enum sets. It is an analogue for a CLI `schema-guru schema --enum-sets all`. This doesn't affect a CLI app.

2. Schema Guru now doesn't require an `input` argument to be the last in command for both `ddl` and `schema`. Now following command is absolutely valid: `schema-guru ddl --output /event-dictionary /json-schemas --raw-mode`, whereas in previous versions users have to move `/json-schemas` to the end of line.

<h2><a name="upgrading">5. Upgrading</a></h2>

<h3>Schema Guru CLI</h3>

Simply download the latest Schema Guru from Bintray:

{% highlight bash %}
$ wget http://dl.bintray.com/snowplow/snowplow-generic/schema_guru_0.6.0.zip
$ unzip schema_guru_0.6.0.zip
{% endhighlight %}

Assuming you have a recent JVM installed, running should be as simple as:

{% highlight bash %}
$ ./schema-guru-0.6.0 {schema|ddl} {input} {options}
{% endhighlight %}

<h3>Schema Guru web UI and Spark Job</h3>

Web UI and Spark Job has no new features in this release, but as stated in [CLI update section][cli], if you were deriving enum sets with Spark Job, you now must specify `--enum-sets` without parameters. Also, you can safely use 0.4.0 versions of both Spark Job and Web UI without a fear to miss new features or bugfixes.

<h2><a name="help">6. Getting help</a></h2>

For more details on this release, please check out the [Schema Guru 0.6.0] [060-release] on GitHub.

More details on the technical architecture of Schema Guru can be found on the [For Developers][for-developers] page of the Schema Guru wiki.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels] [talk-to-us].

<h2><a name="roadmap">7. Plans for future releases</a></h2>

With new features introduced in this release for `ddl` command, Schema Guru becomes more and more like all-in-one static Iglu generator, making it very different from what it supposed to be initially (app deriving JSON Schemas from a bunch of instances).

It also require us to include in Schema Guru diverse dependencies and features making it harder to follow "Do One Thing and Do It Well" philosophy. This is why we decided to move all features related to DDL into separate project inside [iglu][iglu-repo] repository and switch Schema Guru to its initial purpose, removing `ddl` command and leaving only `schema` command features.

[cli]: /blog/2016/03/XX/schema-guru-0.6.0-released/#cli
[schemaver]: http://snowplowanalytics.com/blog/2014/05/13/introducing-schemaver-for-semantic-versioning-of-schemas/
[redshift-comments]: http://snowplowanalytics.com/blog/2015/11/17/schema-guru-0.4.0-with-apache-spark-support-released/#comment
[iglu-repo]: http://github.com/snowplow/iglu

[for-developers]: https://github.com/snowplow/schema-guru/wiki/For-developers
[repo]: https://github.com/snowplow/schema-guru
[issues]: https://github.com/snowplow/schema-guru/issues
[060-release]: https://github.com/snowplow/schema-guru/releases/tag/0.6.0
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
