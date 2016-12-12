---
layout: post
title: SQL Runner 0.5.0 released
title-short: SQL Runner 0.5.0
tags: [sql, locking, lock, consul, redshift, postgres]
author: Josh
category: Releases
---

We are pleased to announce version [0.5.0] [050-release] of [SQL Runner] [repo]. This release adds some powerful new features, including local and Consul-based remote locking to ensure that SQL Runner runs your playbooks as singletons.

1. [Locking your run](/blog/2016/12/12/sql-runner-0.5.0-released/#lock-your-run)
2. [Checking and deleting locks](/blog/2016/12/12/sql-runner-0.5.0-released/#check-delete-locks)
3. [Running a single query](/blog/2016/12/12/sql-runner-0.5.0-released/#run-single-query)
4. [Other changes](/blog/2016/12/12/sql-runner-0.5.0-released/#other-changes)
5. [Upgrading](/blog/2016/12/12/sql-runner-0.5.0-released/#upgrading)
6. [Getting help](/blog/2016/12/12/sql-runner-0.5.0-released/#help)

<!--more-->

<h2 id="lock-your-run">1. Locking your run</h2>

This release adds the ability to lock your run - this ensures that you cannot accidentally start another job whilst one is already running.  This feature is aimed primarily at automation, whereby you schedule your jobs on a cron or some other scheduler and you need to ensure that each job is a singleton.

We have also introduced two types of locks that you can use:

1. **Hard lock**: This lock will be set and removed only if a job completes successfully; if the job fails then this lock will persist and will subsequently prevent this job from being run again until the lock is removed. The default lock type for SQL Runner
2. **Soft lock**: This lock will be set and removed regardless of if the job completes successfully; it simply prevents concurrent runs from occurring

For those scheduling jobs randomly over a cluster we have also added the ability to set locks using [Consul][consul]. This allows you to set and delete a lock which is then automatically available to all members of the Consul cluster.

To use Consul instead of the local filesystem simply append the `-consul {{ consul_server }}` argument.

To set a hard lock:

{% highlight bash %}
$ ./sql-runner -playbook ${path_to_playbook} -lock /locks/hard/1
$ ./sql-runner -playbook ${path_to_playbook} -lock locks/hard/1 -consul ${consul_server_uri}
{% endhighlight %}

Here's the run failing because of an existing lockfile:

{% highlight bash %}
$ ./sql-runner -playbook ${path_to_playbook} -lock /locks/hard/1
2016/11/08 13:46:16 Error: /locks/hard/1 found on start, previous run failed or is ongoing. Cannot start
{% endhighlight %}

To set a soft lock:

{% highlight bash %}
$ ./sql-runner -playbook ${path_to_playbook} -softLock /locks/soft/1
$ ./sql-runner -playbook ${path_to_playbook} -softLock locks/soft/1 -consul ${consul_server_uri}
{% endhighlight %}

<h2 id="check-delete-locks">2. Checking and deleting locks</h2>

On top of being able to set locks we have also added functions to check and delete these locks. This enables you to automate maintenance of locks based on your own logic.

To check for a lock's existence:

{% highlight bash %}
$ ./sql-runner -checkLock /locks/hard/1
2016/11/08 13:47:57 Error: /locks/hard/1 found, previous run failed or is ongoing

$ ./sql-runner -checkLock locks/soft/1 -consul ${consul_server_uri}
2016/11/08 13:48:40 Success: locks/soft/1 does not exist
{% endhighlight %}

To delete a lock:

{% highlight bash %}
$ ./sql-runner -deleteLock /locks/hard/1
2016/11/08 13:49:31 Deleting lockfile at this key '/locks/hard/1'
2016/11/08 13:49:31 Success: /locks/hard/1 found and deleted

$ ./sql-runner -deleteLock locks/soft/1 -consul ${consul_server_uri}
2016/11/08 13:50:18 Error: locks/soft/1 does not exist, nothing to delete
{% endhighlight %}

<h2 id="run-single-query">3. Running a single query</h2>

This release also adds the ability to run a single query of a step in a playbook. This has two main uses:

1. Allowing you to represent your playbook as a DAG of individual queries, making resumption from a failure point easier to reason about
2. Allowing you to debug individual queries without having to first make new playbooks that contain only the queries in question

To run an individual query:

{% highlight bash %}
$ ./sql-runner -playbook {{ path_to_playbook }}.yml -runQuery "{{ step_name }}::{{ query_name }}"
{% endhighlight %}

__Note__ the usage of a double colon between the elements of the `runQuery` value. For this function to work you must ensure that you do not include a double colon anywhere in either your step or query names.

Sample output from our integration test suite:

{% highlight bash %}
./sql-runner -playbook /vagrant/integration/resources/good-postgres.yml -var test_date=2016_11_08 -lock /vagrant/dist/integration-lock -runQuery "Parallel load::Parallel load 2"
2016/11/08 13:51:36 Checking and setting the lockfile at this key '/vagrant/dist/integration-lock'
2016/11/08 13:51:36 EXECUTING Parallel load 2 (in step Parallel load @ My Postgres database 2): /vagrant/integration/resources/postgres-sql/good/2b.sql
2016/11/08 13:51:36 EXECUTING Parallel load 2 (in step Parallel load @ My Postgres database 1): /vagrant/integration/resources/postgres-sql/good/2b.sql
2016/11/08 13:51:36 SUCCESS: Parallel load 2 (step Parallel load @ target My Postgres database 2), ROWS AFFECTED: 1
2016/11/08 13:51:36 SUCCESS: Parallel load 2 (step Parallel load @ target My Postgres database 1), ROWS AFFECTED: 1
2016/11/08 13:51:36 Deleting lockfile at this key '/vagrant/dist/integration-lock'
2016/11/08 13:51:36 SUCCESS: 2 queries executed against 2 targets
{% endhighlight %}

<h2 id="other-changes">4. Other changes</h2>

The playbook & SQL loading interfaces in our Golang code have been abstracted to allow for easy extensibility ([#62][pull-62]). Big thanks to community member [Lincoln Ritter][lritter] for contributing this functionality!

Under the hood, this release also bumps our Postgres library dependency to `pg.v5` ([#73] [issue-73]), and adds `tcpKeepAlive=true` to help with long-running queries via NAT ([#57] [issue-57]).

<h2 id="upgrading">5. Upgrading</h2>

SQL Runner 0.5.0 is available as a standalone binary for 64-bit Linux, Windows and macOS on Bintray. Download them as follows:

{% highlight bash %}
# Linux
$ wget http://dl.bintray.com/snowplow/snowplow-generic/sql_runner_0.5.0_linux_amd64.zip

# Windows
C:\> Invoke-WebRequest -OutFile sql_runner_0.5.0_windows_amd64.zip http://dl.bintray.com/snowplow/snowplow-generic/sql_runner_0.5.0_windows_amd64.zip

# macOS
$ wget http://dl.bintray.com/snowplow/snowplow-generic/sql_runner_0.5.0_darwin_amd64.zip
{% endhighlight %}

Once downloaded, unzip it (Linux for example):

{% highlight bash %}
$ unzip sql_runner_0.5.0_linux_amd64.zip
{% endhighlight %}

Run it like so:

{% highlight bash %}
$ ./sql-runner
sql-runner version: 0.5.0
Run playbooks of SQL scripts in series and parallel on Redshift and Postgres
Usage:
  -checkLock string
      Checks whether the lockfile already exists
  -consul string
      The address of a consul server with playbooks and SQL files stored in KV pairs
  -deleteLock string
      Will attempt to delete a lockfile if it exists
  -dryRun
      Runs through a playbook without executing any of the SQL
  -fromStep string
      Starts from a given step defined in your playbook
  -help
      Shows this message
  -lock string
      Optional argument which checks and sets a lockfile to ensure this run is a singleton. Deletes lock on run completing successfully
  -playbook string
      Playbook of SQL scripts to execute
  -runQuery string
      Will run a single query in the playbook
  -softLock string
      Optional argument, like '-lock' but the lockfile will be deleted even if the run fails
  -sqlroot string
      Absolute path to SQL scripts. Use PLAYBOOK, BINARY and PLAYBOOK_CHILD for those respective paths (default "PLAYBOOK")
  -var value
      Variables to be passed to the playbook, in the key=value format (default map[])
  -version
      Shows the program version
{% endhighlight %}

<h2 id="help">6. Getting help</h2>

For more details on this release, please check out the [SQL Runner 0.5.0 release notes][050-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[lritter]: https://github.com/lritter
[pull-62]: https://github.com/snowplow/sql-runner/pull/62
[issue-57]: https://github.com/snowplow/sql-runner/issues/57
[issue-73]: https://github.com/snowplow/sql-runner/issues/73

[consul]: https://www.consul.io/
[repo]: https://github.com/snowplow/sql-runner
[issues]: https://github.com/snowplow/sql-runner/issues
[050-release]: https://github.com/snowplow/sql-runner/releases/tag/0.5.0
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
