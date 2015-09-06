---
layout: post
title: Schema Guru 0.3.0 released for generating Redshift tables from JSON Schemas
title-short: Schema Guru 0.3.0
tags: [json, json schema, schema, iglu, self-describing, redshift]
author: Anton
category: Releases
---

We are pleased to announce the release of Schema Guru 0.3.0 and Schema DDL 0.1.0, our tools to work with JSON Schemas.

This release post will cover the following new topics:

1. [Meet the Schema DDL library](/blog/2015/07/29/schema-guru-0.3.0-released-for-generating-redshift-tables-from-json-schemas/#schemaddl)
2. [Commands and CLI changes](/blog/2015/07/29/schema-guru-0.3.0-released-for-generating-redshift-tables-from-json-schemas/#commands)
3. [Overview of the ddl command](/blog/2015/07/29/schema-guru-0.3.0-released-for-generating-redshift-tables-from-json-schemas/#ddl-command)
4. [ddl command for Snowplow users](/blog/2015/07/29/schema-guru-0.3.0-released-for-generating-redshift-tables-from-json-schemas/#ddl-for-snowplow)
5. [Advanced options for ddl command](/blog/2015/07/29/schema-guru-0.3.0-released-for-generating-redshift-tables-from-json-schemas/#ddl-options)
6. [Upgrading](/blog/2015/07/29/schema-guru-0.3.0-released-for-generating-redshift-tables-from-json-schemas/#upgrading)
6. [Getting help](/blog/2015/07/29/schema-guru-0.3.0-released-for-generating-redshift-tables-from-json-schemas/#help)
7. [Plans for next release](/blog/2015/07/29/schema-guru-0.3.0-released-for-generating-redshift-tables-from-json-schemas/#roadmap)

<!--more-->

<h2 id="schemaddl">1. Meet the Schema DDL library</h2>

[Schema DDL] [ddl-repo] is a new Scala library which lets you generate [Redshift] [redshift] table definitions and JSON Paths mapping files from JSON Schemas. It supports both "vanilla" [JSON Schema] [json-schema] and our own [Self-describing Schema] [self-describing] variant.

Currently there's only one DDL generator, `schemaddl.generators.redshift`, and one utility generator, `schemaddl.generators.SchemaFlattener` for representing JSON Schemas as a flat data structure.
In future releases we plan on adding generators for other database targets, including PostgreSQL, Vertica, Azure SQL Data Warehouse and Google BigQuery.

If you are interested in the code, check out [Ddl.scala] [ddl-scala], the AST-like set of case classes that let us model Redshift's `CREATE TABLE` DDL.

As a first step, Schema DDL 0.1.0 has been added to the new release of Schema Guru to power the new `ddl` subcommand there. In the future, we plan on embedding Schema DDL into our [Iglu repository server] [iglu], so that database table definitions can be auto-generated from JSON Schemas.

<h2 id="commands">2. Commands and CLI changes</h2>

With the addition of DDL generation functionality to Schema Guru we moved everything related to schema derivation into the `schema` subcommand; all new functionality related to DDL generation is part of the new `ddl` subcommand.

To make both of these commands consistent we also made few changes in ``schema`` options. For example now you don't need to specify whether your input is a file or directory full of schemas - just use the positional parameter with input and Schema Guru will decide how to process it. Both examples are valid:

{% highlight bash %}
$ ./schema-guru-0.3.0 schema --schema-by $.event /path/to/all_instances
...
$ ./schema-guru-0.3.0 schema /path/to/single_instance.json
{% endhighlight %}

Note that the positional parameter must be placed after all options.

In previous releases you had to specify different output options for a single schema output (`--output`) versus multiple schemas (`--output-dir`). Now it's the single `--output` option, which is required when you process multiple JSON Schemas but can be omitted when you are generating a single schema (which will be printed to stdout).

The `ddl` command works in a similar way: input is a required positional parameter, and you also may specify path to output dir; if you didn't it will create a `sql` directory (and potentially a `jsonpaths` directory) in your current directory. Other `ddl` options will be covered in following sections.

Note that if you specify a directory as input it will be processed recursively for both commands, so ensure that this directory contains only files you want to process,
otherwise your JSON Schema may be polluted (`schema` command) or you will see error messages (`ddl` command).

<h2 id="ddl-command">3. Overview of the ddl command</h2>

Let's imagine that we have a set of JSONs that we want to load into Redshift, and these JSONs are modeled by a set of JSON Schemas.

We can use the new `ddl` subcommand to generate Redshift `CREATE TABLE` statements for each of these JSON Schemas, plus accompanying JSON Paths files to support Redshift's [COPY from JSON] [copy-from-json] command.

Let's take some example JSON Schemas from Alex's [Unified Log Processing] [ulp] book:

{% highlight bash %}
$ git clone https://github.com/alexanderdean/Unified-Log-Processing.git
$ cd Unified-Log-Processing/ch12/12.2
$ cat
$ ~/schema-guru-0.3.0 ddl --raw --with-json-paths ./schemas
File [~/Unified-Log-Processing/ch12/12.2/./sql/./driver_delivers_package.sql] was written successfully!
File [~/Unified-Log-Processing/ch12/12.2/./jsonpaths/./driver_delivers_package.json] was written successfully!
File [~/Unified-Log-Processing/ch12/12.2/./sql/./driver_misses_customer.sql] was written successfully!
File [~/Unified-Log-Processing/ch12/12.2/./jsonpaths/./driver_misses_customer.json] was written successfully!
File [~/Unified-Log-Processing/ch12/12.2/./sql/./mechanic_changes_oil.sql] was written successfully!
File [~/Unified-Log-Processing/ch12/12.2/./jsonpaths/./mechanic_changes_oil.json] was written successfully!
File [~/Unified-Log-Processing/ch12/12.2/./sql/./truck_arrives.sql] was written successfully!
File [~/Unified-Log-Processing/ch12/12.2/./jsonpaths/./truck_arrives.json] was written successfully!
File [~/Unified-Log-Processing/ch12/12.2/./sql/./truck_departs.sql] was written successfully!
File [~/Unified-Log-Processing/ch12/12.2/./jsonpaths/./truck_departs.json] was written successfully!
{% endhighlight %}

What just happened? First we fed five JSON Schemas into Schema Guru's `ddl` command. Here's the `truck_arrives.json` JSON Schema:

{% highlight json %}
{
  "type": "object",
  "properties": {
    "event": {
      "enum": [ "TRUCK_ARRIVES" ]
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "vehicle": {
      "type": "object",
      "properties": {
        "vin": {
          "type": "string",
          "minLength": 17,
          "maxLength": 17
        },
        "mileage": {
          "type": "integer",
          "minimum": 0,
          "maximum": 2147483647
        }
      },
      "required": [ "vin", "mileage" ],
      "additionalProperties": false
    },
    "location": {
      "type": "object",
      "properties": {
        "latitude": {
          "type": "number"
        },
        "longitude": {
          "type": "number"
        },
        "elevation": {
          "type": "integer",
          "minimum": -32768,
          "maximum": 32767
        }
      },
      "required": [ "latitude", "longitude", "elevation" ],
      "additionalProperties": false
    }
  },
  "required": [ "event", "timestamp", "vehicle", "location" ],
  "additionalProperties": false
}
{% endhighlight %}

Then Schema Guru generated five matching Redshift table definitions. Here is `truck_arrives.sql`:

{% highlight sql %}
-- AUTO-GENERATED BY schema-ddl DO NOT EDIT
-- Generator: schema-ddl 0.1.0
-- Generated: 2015-07-29 15:30

-- Source: truck_arrives.json

CREATE TABLE IF NOT EXISTS truck_arrives (
    "event"              CHAR(13)         NOT NULL,
    "location.elevation" SMALLINT         NOT NULL,
    "location.latitude"  DOUBLE PRECISION NOT NULL,
    "location.longitude" DOUBLE PRECISION NOT NULL,
    "timestamp"          TIMESTAMP        NOT NULL,
    "vehicle.mileage"    INT              NOT NULL,
    "vehicle.vin"        CHAR(17)         NOT NULL
);
{% endhighlight %}

Note that all nested properties are flattened into dot-separated column name, all camelCased keys are transformed to snake_cased, and columns are ordered by nullness and then alphabetically.

And because we ran with `--with-json-paths`, Schema Guru also generated five JSON Paths files to map the JSON instances to the new Redshift table definition. Here is `truck_arrives.json`:

{% highlight json %}
{
    "jsonpaths": [
        "$.data.event",
        "$.data.location.elevation",
        "$.data.location.latitude",
        "$.data.location.longitude",
        "$.data.timestamp",
        "$.data.vehicle.mileage",
        "$.data.vehicle.vin"
    ]
}
{% endhighlight %}

Phew! That completes our example.

<h2 id="ddl-for-snowplow">4. ddl command for Snowplow users</h2>

As existing Snowplow users have probably guessed, Schema Guru's new `ddl` command is purpose-built for the task of creating Snowplow event dictionaries!

Simply remove the `--raw` option and the `ddl` command will work great with a Snowplow-compatible collection of self-describing JSON Schemas; no longer will you have to write Redshift table definitions and JSON Paths mappings by hand. Note that we recommend bumping the default `VARCHAR` size to 4096 to prevent issues with column truncation in Redshift.

Let's work through an example, using [the Snowplow website's event dictionary] [website-event-dictionary]. First let's clone the event dictionary and move the existing `sql` and `jsonpaths` folders out of harm's way:

{% highlight bash %}
$ git clone https://github.com/snowplow/snowplow-website-event-dictionary.git
$ cd snowplow-website-event-dictionary
$ find . -type f -not -iwholename '*.git*'
./jsonpaths/com.snowplowanalytics.snowplow-website/register_for_real_time_form_submitted_1.json
./jsonpaths/com.snowplowanalytics.snowplow-website/signup_form_submitted_1.json
./jsonpaths/com.snowplowanalytics.snowplow-website/trial_form_submitted_1.json
./README.md
./schemas/com.snowplowanalytics.snowplow-website/register_for_real_time_form_submitted/jsonschema/1-0-0
./schemas/com.snowplowanalytics.snowplow-website/signup_form_submitted/jsonschema/1-0-0
./schemas/com.snowplowanalytics.snowplow-website/trial_form_submitted/jsonschema/1-0-0
./sql/com.snowplowanalytics-snowplow-website/register_for_real_time_form_submitted_1.sql
./sql/com.snowplowanalytics-snowplow-website/signup_form_submitted_1.sql
./sql/com.snowplowanalytics-snowplow-website/trial_form_submitted_1.sql
$ mv sql sql-old
$ mv jsonpaths jsonpaths-old
{% endhighlight %}

Now let's run Schema Guru against our event dictionary:

{% highlight bash %}
$ ~/schema-guru-0.3.0 ddl --with-json-paths --size 4096 ./schemas
File [/vagrant/schema-guru/snowplow-website-event-dictionary/./sql/com.snowplowanalytics.snowplow-website/register_for_real_time_1.sql] was written successfully!
File [/vagrant/schema-guru/snowplow-website-event-dictionary/./jsonpaths/com.snowplowanalytics.snowplow-website/register_for_real_time_1.json] was written successfully!
File [/vagrant/schema-guru/snowplow-website-event-dictionary/./sql/com.snowplowanalytics.snowplow-website/signup_form_submitted_1.sql] was written successfully!
File [/vagrant/schema-guru/snowplow-website-event-dictionary/./jsonpaths/com.snowplowanalytics.snowplow-website/signup_form_submitted_1.json] was written successfully!
File [/vagrant/schema-guru/snowplow-website-event-dictionary/./sql/com.snowplowanalytics.snowplow-website/trial_form_submitted_1.sql] was written successfully!
File [/vagrant/schema-guru/snowplow-website-event-dictionary/./jsonpaths/com.snowplowanalytics.snowplow-website/trial_form_submitted_1.json] was written successfully!
{% endhighlight %}

Great - that's now generated all of our table definitions, ready for deploying into Redshift, and our JSON Paths mappings, ready for uploading to Iglu or Amazon S3.

We can take a sneak peak at one of our tables, `com_snowplowanalytics_snowplow_website_trial_form_submitted_1.sql`:

{% highlight sql %}
-- AUTO-GENERATED BY schema-ddl DO NOT EDIT
-- Generator: schema-ddl 0.1.0
-- Generated: 2015-07-29 15:38

-- Source: iglu:com.snowplowanalytics.snowplow-website/trial_form_submitted/jsonschema/1-0-0

CREATE SCHEMA IF NOT EXISTS atomic;

CREATE TABLE IF NOT EXISTS atomic.com_snowplowanalytics_snowplow_website_trial_form_submitted_1 (
    "schema_vendor"    VARCHAR(128)  ENCODE RUNLENGTH NOT NULL,
    "schema_name"      VARCHAR(128)  ENCODE RUNLENGTH NOT NULL,
    "schema_format"    VARCHAR(128)  ENCODE RUNLENGTH NOT NULL,
    "schema_version"   VARCHAR(128)  ENCODE RUNLENGTH NOT NULL,
    "root_id"          CHAR(36)      ENCODE RAW       NOT NULL,
    "root_tstamp"      TIMESTAMP     ENCODE RAW       NOT NULL,
    "ref_root"         VARCHAR(255)  ENCODE RUNLENGTH NOT NULL,
    "ref_tree"         VARCHAR(1500) ENCODE RUNLENGTH NOT NULL,
    "ref_parent"       VARCHAR(255)  ENCODE RUNLENGTH NOT NULL,
    "email"            VARCHAR(4096)                  NOT NULL,
    "name"             VARCHAR(4096)                  NOT NULL,
    "company"          VARCHAR(4096),
    "events_per_month" VARCHAR(23),
    FOREIGN KEY (root_id) REFERENCES atomic.events(event_id)
)
DISTSTYLE KEY
DISTKEY (root_id)
SORTKEY (root_tstamp);
{% endhighlight %}

Note how the table contains all of the "boilerplate" columns required by the Snowplow shredding process.

And here is the corresponding JSON Paths file:

{% highlight json %}
{
    "jsonpaths": [
        "$.schema.vendor",
        "$.schema.name",
        "$.schema.format",
        "$.schema.version",
        "$.hierarchy.rootId",
        "$.hierarchy.rootTstamp",
        "$.hierarchy.refRoot",
        "$.hierarchy.refTree",
        "$.hierarchy.refParent",
        "$.data.email",
        "$.data.name",
        "$.data.company",
        "$.data.eventsPerMonth"
    ]
}
{% endhighlight %}

Again, this file is now ready for use in the Snowplow shredding process. If you are interested, you can compare the machine-generated files above to the original human-generated files now in the `-old` folders.

<h2 id="ddl-options">5. Advanced options for ddl command</h2>

<h3 id="ddl-size">--size for default VARCHAR size</h3>

In the absence of any other clues about size (e.g `maxLength` or `enum`), `VARCHAR`s in generated Redshift tables default to a size of 255. You can override this with the `--size` option:

{% highlight bash %}
$ ./schema-guru-0.3.0 ddl --size 32 /path/to/schemas
{% endhighlight %}

<h3 id="ddl-schema">--schema for specifying your tables' schema</h3>

By default, tables are generated in the `atomic` schema, while the `--raw` option generates tables without a named schema.

If you want to specify your own schema for the `CREATE TABLE` DDL, use the ``--schema`` option:

{% highlight bash %}
$ ./schema-guru-0.3.0 ddl --schema mobile /path/to/schemas
{% endhighlight %}

<h3 id="ddl-product-types">--split-product-types for specifying your tables' schema</h3>

A JSON Schema product type consists of two or more different types, like this: `["string", "integer"]`. If we encounter a product type when generating Redshift table definitions, currently we use a `VARCHAR(4096)`. However, this loses some type safety.

An alternative is to split a product type into multiple columns using `--split-product-types`. For example, this JSON property:

{% highlight json %}
{
    "action": {
        "type": ["integer", "string"],
        "format": "date-time",
        "minimum": 0,
        "maximum": 64
    }
}
{% endhighlight %}

Will be represented as two different columns:

{% highlight sql %}
    "action_string"   TIMESTAMP,
    "action_integer"  SMALLINT
{% endhighlight %}

Notes:

* Constraints in the JSON Schema will be preserved on the element of the split type to which they correspond
* Avoid using this option with `--with-json-paths` - a JSON Paths file for split product types will likely break a Redshift `COPY from JSON` load

<h3 id="ddl-db">--db for specifying database type</h3>

Currently only Redshift is supported by the ``ddl`` command, but going forwards we plan on supporting other databases. You will be able to specify the database target with the `--db` option:

{% highlight bash %}
$ ./schema-guru-0.3.0 ddl --db redshift /path/to/schemas
{% endhighlight %}

There is no need to use this option yet, given that only Redshift is currently supported.

<h2><a name="upgrading">6. Upgrading</a></h2>

Simply download the latest Schema Guru from Bintray:

{% highlight bash %}
$ wget http://dl.bintray.com/snowplow/snowplow-generic/schema_guru_0.3.0.zip
$ unzip schema_guru_0.3.0.zip
{% endhighlight %}

Assuming you have a recent JVM installed, running should be as simple as:

{% highlight bash %}
$ ./schema-guru-0.3.0 {schema|ddl} {input} {options}
{% endhighlight %}

Note that the web UI is unchanged in this release.

<h2><a name="help">7. Getting help</a></h2>

For more details on this release, please check out the [Schema Guru 0.3.0] [030-release] on GitHub.

In the meantime, if you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

<h2><a name="roadmap">8. Plans for next release</a></h2>

We have plenty planned for the Schema Guru, Schema DDL and Iglu roadmaps! A few things that we are working on:

* Implementing [Apache Spark] [spark] support for Schema Guru so that we can derive JSON Schemas from much larger volumes of JSON instances
* Detecting known enum sets when generating Schemas (any suggestions [highly appreciated] [issue-66]!)
* Adding the ability to generate `CREATE TABLE` DDL for other databases

[repo]: http://collector.snplow.com/r/tp2?u=https%3A%2F%2Fgithub.com%2Fsnowplow%2Fschema-guru
[ddl-repo]: https://github.com/snowplow/schema-ddl
[self-describing]: http://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/
[json-schema]: http://json-schema.org/

[redshift]: http://aws.amazon.com/redshift/
[redshift-copy]: http://docs.aws.amazon.com/redshift/latest/dg/r_COPY.html
[copy-from-json]: http://docs.aws.amazon.com/redshift/latest/dg/copy-usage_notes-copy-from-json.html
[spark]: https://spark.apache.org/

[ddl-scala]: https://github.com/snowplow/schema-ddl/blob/master/src/main/scala/com.snowplowanalytics/schemaddl/generators/redshift/Ddl.scala
[ulp]: http://manning.com/dean/

[website-event-dictionary]: https://github.com/snowplow/snowplow-website-event-dictionary

[iglu]: http://collector.snplow.com/r/tp2?u=https%3A%2F%2Fgithub.com%2Fsnowplow%2Figlu

[issues]: https://github.com/snowplow/schema-guru/issues
[issue-66]: https://github.com/snowplow/schema-guru/issues/66
[030-release]: https://github.com/snowplow/schema-guru/releases/tag/0.3.0
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
