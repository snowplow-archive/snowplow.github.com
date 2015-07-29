---
layout: post
shortenedlink: Schema Guru 0.3.0 and Schema DDL 0.1.0 released
title: Schema Guru 0.3.0 and Schema DDL 0.1.0 released
tags: [json, json schema, schema, iglu, self-describing, redshift]
author: Anton
category: Releases
---

We are pleased to announce the release of Schema Guru 0.3.0 and Schema DDL 0.1.0,
our tools to derive and process JSON Schemas.

This release post will cover the following new topics:

1. [Meet The Schema DDL](/blog/2015/06/30/schema-guru-0.3.0-and-schema-ddl-0.1.0-released/#schemaddl)
2. [Commands and CLI Changes](/blog/2015/06/30/schema-guru-0.3.0-and-schema-ddl-0.1.0-released/#commands)
3. [ddl Command in Nutshell](/blog/2015/06/30/schema-guru-0.3.0-and-schema-ddl-0.1.0-released/#ddl-nutshell)
4. [Options for ddl Command](/blog/2015/06/30/schema-guru-0.3.0-and-schema-ddl-0.1.0-released/#ddl-options)
5. [Product Types](/blog/2015/06/30/schema-guru-0.3.0-and-schema-ddl-0.1.0-released/#product)
6. [Upgrading](/blog/2015/06/30/schema-guru-0.3.0-and-schema-ddl-0.1.0-released/#upgrading)
6. [Getting Help](/blog/2015/06/30/schema-guru-0.3.0-and-schema-ddl-0.1.0-released/#help)
7. [Plans for Next Release](/blog/2015/06/30/schema-guru-0.3.0-and-schema-ddl-0.1.0-released/#roadmap)

<!--more-->

<h2><a name="schemaddl">1. Meet The Schema DDL</a></h2>

[Schema DDL] [ddl-repo] in it's pre-0.1.0 age was a CLI application allowing you to process a single instance of [Self-describing Schema] [self-describing] and produce corresponding [Redshift] [redshift] table DDL file.
While developing [Schema Guru] [repo], it became obvious that both of projects share big amount of schema-processing logic and repeat each other's chunks of code.
Also we came up with new features for Schema Guru related not only to JSON Schema derivation, but also to JSON Schema processing and linting.
It means that we really can incorporate lot of processing logic into one project and reduce amount of code in another.

Thus after short discussion we decided to make Schema DDL a separate library of generators related to Schema-to-DDL transformation and use it as dependency in Schema Guru.
Currently there's only one DDL generator - ``schemaddl.generators.redshift`` and one utility generator - ``schemaddl.generators.SchemaFlattener`` for representing JSON Schema as flat data structure.
In next releases we plan to add at least generator for PostgreSQL and probably for Vertica and MS SQL Data Warehouse.

Beside of Redshift generator itself, you may also take a look AST-like set of case classes helping us to construct table and columns DDL.

<h2><a name="commands">2. Commands and CLI changes</a></h2>

With addition of DDL generation functionality to Schema Guru we moved everything related to Schema derivation into ``schema`` subcommand and all new functionality related to to DDL generation resides in ``ddl`` subcommand.
To make both of these commands consistent we also made few changes in ``schema`` options.

For example now you don't need to specify whether your input is a file or directory full of schemas.
You just need to use positional parameter with input and Schema Guru will decide how to process it.
Both examples are valid:

{% highlight bash %}
$ ./schema-guru-0.3.0 schema --schema-by $.event /path/to/all_events 
{% endhighlight %}

{% highlight bash %}
$ ./schema-guru-0.3.0 schema /path/to/single_instance.json
{% endhighlight %}

Note that positional parameter must be placed after all options.

In previous versions we were also obliged to specify different output options when expecting single Schema output (``--output``) and set schemas (``--output-dir``).
Now it's the single ``--output`` option, which is required when you segment JSON Schemas and can be omitted when you expecting single Schema (it will be printed to stdout).

``ddl`` command works almost in the same way, you also specify input as required positional parameter, you also may specify path to output dir, but if you didn't it will create ``sql`` directory (and problably ``jsonpaths``) in you current directory instead of printing it to stdout.
Other ``ddl`` options will be covered in following sections.

Note that if you specify directory as input it will be processed recursively for both commands,
so try to be sure that directory contains only files you really want to process,
otherwise your JSON Schema may be polluted (``schema`` command) or error messages will be printed (``ddl`` command).

<h2><a name="ddl-nutshell">3. ddl Command in Nutshell</a></h2>

As stated above to make DDL from JSON Schema you now can use ``ddl`` command with only one required positional paramater:

{% highlight bash %}
$ ./schema-guru-0.3.0 ddl /path/to/dir_with_selfdesc_schemas
{% endhighlight %}

Assuming that your directory contains only Self-describing Schema.
Schema Guru will use info taken from ``$.self`` to generate DDL file path and name of table.

All nested properties will be flatten into dot-separated column name, all camelCased keys will be transformed to snake_cased and ordered by alphabet and nullness.
Here's example:

{% highlight json %}
{ "type": "object",
  "properties": {
    "userId": { "type": "string" },
    "action": { "enum": ["POST", "COMMENT", "CLICK"] },
    "timestamp" : { "type": "string", "format": "date-time" }
    "attachment": {
        "type": "object",
        "properties": {
            "name": { "type": "string" },
            "size": { "type": "integer" }
    }}}},
{% endhighlight %}

Will be transformed into:

{% highlight sql %}
    "action"          VARCHAR(7)
    "attachment.name" VARCHAR(255)
    "attachment.size" BIGINT
    "timestamp"       TIMESTAMP
    "user_id"         VARCHAR(255)
{% endhighlight %}

DDL files will be placed in ``sql`` directory in your current path.

<h2><a name="ddl-options">4. Options for ddl command</a></h2>

Currently only Redshift is supported by ``ddl`` command, but in near future antoher databases will be supported 
and you'll be able to specify DDL format you want with ``--db`` option:

{% highlight bash %}
$ ./schema-guru-0.3.0 ddl --db redshift /path/to/schema.json
{% endhighlight %}

Now you don't need to use it at all, redshift is only supported and thus default value.

Redhift uses [COPY] [redshift-copy] command to load raw data into table. 
To put it into correct positions it needs JSONPaths file containing ordered array of JSON Paths.
You can tell Schema Guru to generate JSONPaths with ``--with-json-paths`` option.
It will place ``jsonpaths`` dir alongside with ``sql``:

{% highlight bash %}
$ ./schema-guru-0.3.0 ddl --with-json-paths {{input}}
{% endhighlight %}

With ``ddl`` command you can set a default VARCHAR size. If there's no other clues about size (like ``maxLength`` or ``enum``), this value will be used:

{% highlight bash %}
$ ./schema-guru-0.3.0 ddl --size 32 {{input}}
{% endhighlight %}

By default it's a 255.

Here in Snowplow, our tables resides in ``atomic`` DB schema and we use it by default, but you also can specify it with ``--schema`` option:

{% highlight bash %}
$ ./schema-guru-0.3.0 ddl --schema business {{input}}
{% endhighlight %}

If you're not a Snowplow user or have a lot of non-self-describing schemas you probably want to generate raw DDL.
Raw DDL does not include fields specific to Snowplow or self-describing schema like ``schema_vendor`` or ``ref_tree``.
Also it doesn't have ``atomic`` DB schema by default. And table name will be just a filename without ``.json``.

{% highlight bash %}
$ ./schema-guru-0.3.0 ddl --raw {{input}}
{% endhighlight %}

If somebody didn't know, Redshift DDL is very similar with PostgreSQL DDL.
And current ``ddl`` command with ``--raw`` option doesn't output anything specific to Redhisft.
You can easely use it to create PostgreSQL table.

<h2><a name="product">5. Product types</a></h2>

Last option is so important that I've decided to dedicate separate paragraph to it.
Most painful thing about mapping dynamic types to static is so called product types, which consists of two or more different types, like this: ``["string", "integer"]``.
How to map this to DDL? We have to options.

First one and default is to use generic type. In our case generic type is ``VARCHAR(4096)``.
You can represent almost anything with it, even array, and you'll be notified about product type been encountered.
But you loose safety.

Another option is to split types with ``--split-product-types``.
For example, following field:

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

Will be represented as two different columns with it's types as postfix:

{% highlight sql %}
    "action_string"   TIMESTAMP
    "action_integer"  SMALLINT
{% endhighlight %}

Note that source field contains constraints for both types and all these constraints will be used to construct result columns.

<h2><a name="upgrading">6. Upgrading</a></h2>

Simply download the latest Schema Guru from Bintray:

{% highlight bash %}
$ wget http://dl.bintray.com/snowplow/snowplow-generic/schema_guru_0.3.0.zip
$ unzip schema_guru_0.3.0.zip
{% endhighlight %}

Assuming you have a recent JVM installed, running should be as simple as:

{% highlight bash %}
$ ./schema-guru-0.3.0 schema /path/to/all_events
{% endhighlight %}

or 

{% highlight bash %}
$ ./schema-guru-0.3.0 ddl /path/to/schema.json
{% endhighlight %}

Schema DDL is included in fat jar, so you don't need to do anything to get it work.

<h2><a name="help">7. Getting help</a></h2>

For more details on this release, please check out the [Schema Guru 0.3.0] [030-release] on GitHub.

We will be building a dedicated wiki for Huskimo to support its usage;
in the meantime, if you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

<h2><a name="roadmap">8. Plans for next release</a></h2>

Most of our efforts now concentrated around implementing [Spark] [spark] support.
Also we're planning to implement detection of known enum set (any ideas will be [highly appreciated] [issue-66])
and implement basic DDL generation support in web UI.


[repo]: https://github.com/snowplow/schema-guru
[ddl-repo]: https://github.com/snowplow/schema-ddl
[self-describing]: http://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/

[redshift]: http://aws.amazon.com/redshift/
[redshift-copy]: http://docs.aws.amazon.com/redshift/latest/dg/r_COPY.html
[spark]: https://spark.apache.org/

[issues]: https://github.com/snowplow/schema-guru/issues
[issue-66]: https://github.com/snowplow/schema-guru/issues/66
[030-release]: https://github.com/snowplow/schema-guru/releases/tag/0.3.0
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

