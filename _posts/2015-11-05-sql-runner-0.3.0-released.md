---
layout: post
title: "SQL Runner 0.3.0 released"
title-short: SQL Runner 0.3.0
tags: [sql, redshift, ssl]
author: Josh
category: Releases
---

We are pleased to announce version [0.3.0] [030-release] of [SQL Runner] [repo]. SQL Runner is an open source app, written in Go, that makes it easy to execute SQL statements programmatically as part of a Snowplow data pipeline.

This release adds some powerful new features to SQL Runner - many thanks to community member [Alessandro Andrioni][andrioni] for his huge contributions towards this release!

For the first time, we are also publishing SQL Runner binaries for Windows and OS X to make it easier to test your SQL Runner playbooks locally.

1. [Command-line variables](/blog/2015/11/05/sql-runner-0.3.0-released/#cli-vars)
2. [Resuming a playbook from partway thru](/blog/2015/11/05/sql-runner-0.3.0-released/#resume)
3. [AWS credentials template functions](/blog/2015/11/05/sql-runner-0.3.0-released/#aws-creds)
4. [Upgrading](/blog/2015/11/05/sql-runner-0.3.0-released/#upgrading)
5. [Getting help](/blog/2015/11/05/sql-runner-0.3.0-released/#help)

<!--more-->

<h2 id="cli-vars">1. Command-line variables</h2>

With SQL Runner 0.3.0, you can now add extra variables to a playbook run dynamically, using the `-var` CLI argument. This allows you to pass in a series of key-pair values which will be used for templating purposes.

{% highlight bash %}
$ sql-runner -var key1=val1 -var key2=val2
{% endhighlight %}

This can be useful in a few ways:

* To define a variable dynamically rather than statically (e.g. pass in an important timestamp)
* To avoid storing sensitive variables in playbooks
* To override existing variables set in the playbook for testing or debugging purposes

Many thanks to [Alessandro Andrioni][andrioni] for this great new feature!

<h2 id="resume">2. Resuming a playbook from partway thru</h2>

Running SQL against a database is an inherently brittle process, and as a result playbooks can occasionally fail part way through. Once the underlying issue has been fixed, you typically want to restart the playbook, either from the step that failed or from step immediately after.

In this release you can now restart a playbook run from partway thru the playbook:

{% highlight bash %}
$ sql-runner -fromStep "The step to start from" ...
{% endhighlight %}

Some notes on this:

* When passing the step name ensure that you wrap it in double quote marks
* The step name must be present in the supplied playbook, or the SQL Runner will fail-fast
* All targets will be started from the same step

<h2 id="aws-creds">3. AWS credentials template functions</h2>

The `COPY` and `UNLOAD` Redshift SQL statements are powerful tools for loading and extracting data, but unfortunately they require the embedding of AWS credentials to operate. To make this more secure, in this release we have introduced four new template functions:

* `awsEnvCredentials`: retrieves your AWS credentials from the environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
* `awsProfileCredentials`: supports getting credentials from a regular AWS credentials file
* `awsEC2RoleCredentials`: supports getting role-based AWS credentials
* `awsChainCredentials`: tries to get credentials from each of the three methods above, in the order given

Each of these will output the string in the Redshift credentials format; `CREDENTIALS 'aws_access_key_id=%s;aws_secret_access_key=%s'`.

If AWS credentials cannot be found in the searched locations, then each target will fail.

Again, many thanks to [Alessandro Andrioni][andrioni] for contributing this powerful new functionality.

<h2 id="upgrading">4. Upgrading</h2>

SQL Runner 0.3.0 is available as a standalone binary for 64-bit Linux, Windows and OS X on Bintray. Download them like so:

{% highlight bash %}
# Linux
$ wget http://dl.bintray.com/snowplow/snowplow-generic/sql_runner_0.3.0_linux_amd64.zip

# Windows
C:\> Invoke-WebRequest -OutFile sql_runner_0.3.0_windows_amd64.zip http://dl.bintray.com/snowplow/snowplow-generic/sql_runner_0.3.0_windows_amd64.zip

# OSX
$ wget http://dl.bintray.com/snowplow/snowplow-generic/sql_runner_0.3.0_darwin_amd64.zip
{% endhighlight %}

Once downloaded, unzip it (Linux for example):

{% highlight bash %}
$ unzip sql_runner_0.3.0_linux_amd64.zip
{% endhighlight %}

Run it like so:

{% highlight bash %}
$ ./sql-runner
sql-runner version: 0.3.0
Run playbooks of SQL scripts in series and parallel on Redshift and Postgres
Usage:
  -help=false: Shows this message
  -playbook="": Playbook of SQL scripts to execute
  -sqlroot="PLAYBOOK": Absolute path to SQL scripts. Use PLAYBOOK and BINARY for those respective paths
  -fromStep="": Starts from a given step defined in your playbook
  -var=map[]: Variables to be passed to the playbook, in the key=value format (default map[])
  -version=false: Shows the program version
{% endhighlight %}

<h2 id="help">5. Getting help</h2>

For more details on this release, please check out the [SQL Runner 0.3.0 release notes][030-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[andrioni]: https://github.com/andrioni

[repo]: https://github.com/snowplow/sql-runner
[issues]: https://github.com/snowplow/sql-runner/issues
[030-release]: https://github.com/snowplow/sql-runner/releases/tag/0.3.0
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
