---
layout: post
title: SQL Runner 0.4.0 released
title-short: SQL Runner 0.4.0
tags: [sql, redshift, ssl]
author: Josh
category: Releases
---

We are pleased to announce version [0.4.0] [040-release] of [SQL Runner] [repo]. SQL Runner is an open source app, written in Go, that makes it easy to execute SQL statements programmatically as part of a Snowplow data pipeline.

This release adds some powerful new features to SQL Runner - many thanks to community member [Alessandro Andrioni][andrioni] for his huge contributions towards yet another release!

1. [Consul support](/blog/2015/12/03/sql-runner-0.4.0-released/#consul)
2. [Dry run mode](/blog/2015/12/03/sql-runner-0.4.0-released/#dry-run)
3. [Environment variables template function](/blog/2015/12/03/sql-runner-0.4.0-released/#env-vars)
4. [File loading order](/blog/2015/12/03/sql-runner-0.4.0-released/#file-loading)
5. [Upgrading](/blog/2015/12/03/sql-runner-0.4.0-released/#upgrading)
6. [Getting help](/blog/2015/12/03/sql-runner-0.4.0-released/#help)

<!--more-->

<h2 id="consul">1. Consul support</h2>

This release adds support for running the SQL Runner with playbooks and SQL files being pulled directly from a [Consul][consul] key-value store.  This mode can be activated by passing the following argument:

{% highlight bash %}
$ sql-runner -consul localhost:8500 -playbook runner/playbook-1 ...
{% endhighlight %}

__Note__: Only pass the host name and port number.

This command will instruct the SQL Runner to search the key-value store of the Consul server for your playbook and associated SQL files.  In the above example the `key` that would be used is `runner/playbook-1`.

In this mode you can also specify a new `-sqlroot` argument:

* `-sqlroot PLAYBOOK_CHILD` which will assume the sqlroot is the same as your playbook key: i.e. `sqlroot == runner/playbook-1`.  
* This allows you to treat the key for your playbook as a data and folder node

By default the `-sqlroot PLAYBOOK` argument is applied which will result in: `sqlroot == runner` - essentially just starting one level higher in the key hierarchy.

<h2 id="dry-run">2. Dry run mode</h2>

Dry run mode is activated with the `-dryRun` flag. This allows you to validate that SQL Runner can find and successfully populate (if templates) all of your SQL files. This is useful for asserting that all of your SQL files are valid before doing a live run against your database targets.

We are planning on expanding this mode in the future, to also check the connection to the target so that you can be sure that during a live run everything should work. ([#51][51])

<h2 id="env-vars">3. Environment variables template function</h2>

Expanding on our template options, you can now load variables directly from your environment. To use:

{% highlight bash %}
CREATE TABLE some_schema.{{systemEnv "ENV_TABLE_NAME"}} (
  age int
);
{% endhighlight %}

You can of course also substitute `ENV_TABLE_NAME` for a custom variable passed either via the `-var` argument or inside your plabook:

{% highlight bash %}
CREATE TABLE some_schema.{{systemEnv .envTableNameVar}} (
  age int
);
{% endhighlight %}

<h2 id="file-loading">4. File loading order</h2>

Historically SQL Runner would load SQL files "just in time", i.e. immediately prior to the execution of the associated step. This could prove problematic if a SQL file near the end of your playbook could not be found or failed to successfully template, or if changes were made to SQL files during execution.

All SQL files are now loaded into memory at start-up, and the SQL Runner will fail-fast if any of the SQL files are missing or fail templating.

<h2 id="upgrading">5. Upgrading</h2>

SQL Runner 0.4.0 is available as a standalone binary for 64-bit Linux, Windows and OS X on Bintray. Download them like so:

{% highlight bash %}
# Linux
$ wget http://dl.bintray.com/snowplow/snowplow-generic/sql_runner_0.4.0_linux_amd64.zip

# Windows
C:\> Invoke-WebRequest -OutFile sql_runner_0.4.0_windows_amd64.zip http://dl.bintray.com/snowplow/snowplow-generic/sql_runner_0.4.0_windows_amd64.zip

# OSX
$ wget http://dl.bintray.com/snowplow/snowplow-generic/sql_runner_0.4.0_darwin_amd64.zip
{% endhighlight %}

Once downloaded, unzip it (Linux for example):

{% highlight bash %}
$ unzip sql_runner_0.4.0_linux_amd64.zip
{% endhighlight %}

Run it like so:

{% highlight bash %}
$ ./sql-runner
sql-runner version: 0.4.0
Run playbooks of SQL scripts in series and parallel on Redshift and Postgres
Usage:
  -help=false: Shows this message
  -playbook="": Playbook of SQL scripts to execute
  -sqlroot="PLAYBOOK": Absolute path to SQL scripts. Use PLAYBOOK, BINARY and CONSUL for those respective paths (default "PLAYBOOK")
  -fromStep="": Starts from a given step defined in your playbook
  -var=map[]: Variables to be passed to the playbook, in the key=value format (default map[])
  -version=false: Shows the program version
  -consul="": The address of a consul server with playbooks and SQL files stored in KV pairs
  -dryRun=false: Runs through a playbook without executing any of the SQL
{% endhighlight %}

<h2 id="help">6. Getting help</h2>

For more details on this release, please check out the [SQL Runner 0.4.0 release notes][040-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[andrioni]: https://github.com/andrioni

[51]: https://github.com/snowplow/sql-runner/issues/51
[consul]: https://www.consul.io/
[repo]: https://github.com/snowplow/sql-runner
[issues]: https://github.com/snowplow/sql-runner/issues
[040-release]: https://github.com/snowplow/sql-runner/releases/tag/0.4.0
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
