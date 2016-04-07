---
layout: post
title: Schema Guru 0.6.0 released with SQL migrations support
title-short: Schema Guru 0.6.0
tags: [json, json schema, schema, ddl, redshift, schemaver]
author: Anton
category: Releases
---

We are pleased to announce the release of [Schema Guru][repo] 0.6.0, with long-awaited initial support for database migrations in SQL. This release is an important step in allowing Iglu users to easily and safely upgrade Redshift table definitions as they evolve their underlying JSON Schemas.

This release post will cover the following topics:

1. [Introducing migrations](/blog/2016/04/07/schema-guru-0.6.0-released-with-sql-migrations-support/#migrations)
2. [Redshift migrations in Schema Guru](/blog/2016/04/07/schema-guru-0.6.0-released-with-sql-migrations-support/#implementation)
3. [New --force flag](/blog/2016/04/07/schema-guru-0.6.0-released-with-sql-migrations-support/#force)
4. [Minor CLI changes](/blog/2016/04/07/schema-guru-0.6.0-released-with-sql-migrations-support/#cli)
5. [Upgrading](/blog/2016/04/07/schema-guru-0.6.0-released-with-sql-migrations-support/#upgrading)
6. [Getting help](/blog/2016/04/07/schema-guru-0.6.0-released-with-sql-migrations-support/#help)
7. [Plans for future releases](/blog/2016/04/07/schema-guru-0.6.0-released-with-sql-migrations-support/#roadmap)

<!--more-->

<h2 id="migrations">1. Introducing migrations</h2>

In data-sophisticated companies, data models or schemas can evolve rapidly. To help to support that rapid evolution, at Snowplow we introduced the [SchemaVer][schemaver] versioning system to allow schemas to evolve in a safe way.

The most common form of schema evolution is an `ADDITION`, where we for example bump the SchemaVer from 1-0-0 to 1-0-1. An `ADDITION` is where we can guarantee that:

1. All existing data is still compatible with the updated schema
2. All existing data consumers are still compatible with the new data

Many `ADDITION`s consist simply of the addition of one or more new optional properties to the schema. This is easy to handle in a columnar database like Amazon Redshift: we can simply apply `ADD COLUMN` statements to add the new properties to the end of the existing table.

Previously, Iglu users had to handle schema updates manually, by comparing the schemas, writing SQL migrations by hand and keeping an eye on the all-important column order. Schema Guru was little help here, because running the `schema-guru ddl` command on a schema version 1-0-4 (say) would generate a "clean slate" Redshift table which ignored the previous column orders.

We have seen first-hand that this was a very error-prone process. Taking these capabilities of JSON Schema and Redshift together, this release can now generate SQL migration scripts for existing Redshift tables, along with full SQL table definitions.

<h2 id="implementation">2. Redshift migrations in Schema Guru</h2>

With this release, Schema Guru's `ddl` command will generate a Redshift SQL migration file between **all** `ADDITION` versions, as well as a SQL file to create the highest `ADDITION` version from scratch.

For example, running `schema-guru ddl` on the following JSON Schemas:

{% highlight bash %}
com.acme/event/1-0-0
com.acme/event/1-0-1
com.acme/event/1-0-2
{% endhighlight %}

Will result in the following output:

{% highlight bash %}
sql/com.acme/event/1-0-0/1-0-1.sql  -- migration from 1-0-0 to 1-0-1
sql/com.acme/event/1-0-0/1-0-2.sql  -- migration from 1-0-0 to 1-0-2
sql/com.acme/event/1-0-1/1-0-2.sql  -- migration from 1-0-1 to 1-0-2
sql/com.acme/event_1.sql            -- actual table definition for 1-0-2
{% endhighlight %}

From this we can see that Schema Guru generated a list of migration scripts across all `ADDITION`s.

Here is an example migration script, which updates `com.amazon.aws.cloudfront/wd_access_log/jsonschema` from [version 1-0-0] [wd-access-log-1-0-0] directly to [version 1-0-2] [wd-access-log-1-0-0]:

{% highlight sql %}
-- WARNING: only apply this file to your database if the following SQL returns the expected:
--
-- SELECT pg_catalog.obj_description(c.oid) FROM pg_catalog.pg_class c WHERE c.relname = 'com_amazon_aws_cloudfront_wd_access_log_1';
--  obj_description
-- -----------------
--  iglu:com.amazon.aws.cloudfront/wd_access_log/jsonschema/1-0-0
-- (1 row)

BEGIN TRANSACTION;

  ALTER TABLE com_amazon_aws_cloudfront_wd_access_log_1
    ADD COLUMN "cs_cookie"          VARCHAR(4096)    ENCODE LZO,
    ADD COLUMN "x_edge_request_id"  VARCHAR(2000)    ENCODE LZO,
    ADD COLUMN "x_edge_result_type" VARCHAR(32)      ENCODE LZO,
    ADD COLUMN "cs_bytes"           DOUBLE PRECISION ENCODE RAW,
    ADD COLUMN "cs_protocol"        VARCHAR(5)       ENCODE LZO,
    ADD COLUMN "x_host_header"      VARCHAR(2000)    ENCODE LZO;

  COMMENT ON TABLE "com_amazon_aws_cloudfront_wd_access_log_1" IS 'iglu:com.amazon.aws.cloudfront/wd_access_log/jsonschema/1-0-2';

END TRANSACTION; 
{% endhighlight %}

**Warning: this new migration capability is experimental: please exercise caution with this feature and always visually inspect any migration script before applying it to a Redshift database.**

This migration capability is also incomplete: to date it only supports the addition of new optional columns. We have an open ticket, [#140] [issue-140], to track other possible migration scenarios - please add your suggestions/priorities to that ticket.

<h2 id="force">3. New --force flag</h2>

Schema Guru is steadily getting smarter at generating table definitions - however, users will still encounter rare cases where it is just not possible to generate the correct DDL automatically. In these cases users tend to edit their DDL files manually.

Once a user has manually edited schemas, he or she is at risk of accidentally overwriting those schemas by re-running Schema Guru. As of this release, Schema Guru will not silently overwrite DDL files if a given file is already present on disk and holds different contents to Schema Guru's new output; indeed Schema Guru only checks the actual SQL code - not comments or formatting.

Instead of silently overwriting the file, Schema Guru will report a warning for that file. To override this behavior a user may use the new `--force` flag to update all files regardless of manual changes.

<h2 id="cli">4. Minor CLI changes</h2>

In this release we also introduced two minor CLI changes:

1. In the Spark Job, `--enum-sets` is no longer an option, but instead a flag which can be used to tell Schema Guru to check all known predefined enum sets. It is equivalent to `schema-guru schema --enum-sets all` in the CLI. This doesn't affect a CLI app
2. Schema Guru no longer expects the `input` argument to be in the last position for the `ddl` and `schema` commands. The following command is now valid: `schema-guru ddl --output /event-dictionary /json-schemas --raw-mode`, whereas in previous versions users have to move `/json-schemas` to the end of line

<h2 id="upgrading">5. Upgrading</h2>

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

<h3>Schema Guru's Web UI and Spark Job</h3>

Schema Guru's Web UI and Spark Job have no new features in this release, but as stated in [CLI update section][cli], if you were deriving enum sets with the Spark Job, you now must specify `--enum-sets` without parameters. Also, you can safely use 0.4.0 versions of both Spark Job and Web UI without a fear to miss new features or bugfixes.

<h2 id="help">6. Getting help</a></h2>

For more details on this release, please check out the [Schema Guru 0.6.0] [060-release] on GitHub.

More details on the technical architecture of Schema Guru can be found on the [For Developers][for-developers] page of the Schema Guru wiki.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels] [talk-to-us].

<h2 id="roadmap">7. Plans for future releases</a></h2>

With the new features introduced in this release for the `ddl` command, this side of Schema Guru has evolved into a de facto Iglu static schema registry generator (a little like [Jekyll] [jekyll] but for Iglu). This use case is very separate from Schema Guru's original purpose, the `schema` command, which aims to derive JSON Schemas from a collection of instances.

The current design also bundles many different dependencies and features into Schema Guru, making it harder to follow "Do One Thing and Do It Well" philosophy.

Given the above, we are now planning to move all features related to the `ddl` command into a separate project inside [iglu][iglu-repo] repository. Schema Guru will revert to its initial purpose - we have no plans to change the `schema` command capabilities.

[cli]: /blog/2016/04/07/schema-guru-0.6.0-released-with-sql-migrations-support/#cli
[schemaver]: http://snowplowanalytics.com/blog/2014/05/13/introducing-schemaver-for-semantic-versioning-of-schemas/
[iglu-repo]: http://github.com/snowplow/iglu

[for-developers]: https://github.com/snowplow/schema-guru/wiki/For-developers
[repo]: https://github.com/snowplow/schema-guru
[issues]: https://github.com/snowplow/schema-guru/issues
[060-release]: https://github.com/snowplow/schema-guru/releases/tag/0.6.0
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

[wd-access-log-1-0-0]: http://www.iglucentral.com/schemas/com.amazon.aws.cloudfront/wd_access_log/jsonschema/1-0-0
[wd-access-log-1-0-2]: http://www.iglucentral.com/schemas/com.amazon.aws.cloudfront/wd_access_log/jsonschema/1-0-2
[issue-140]: https://github.com/snowplow/schema-guru/issues/140

[jekyll]: https://jekyllrb.com/
