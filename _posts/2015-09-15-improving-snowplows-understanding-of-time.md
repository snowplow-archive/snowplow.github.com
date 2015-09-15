---
layout: post
title: "Improving Snowplow's understanding of time"
title-short: "Improving Snowplow's understanding of time"
tags: [snowplow, time, ts, tstamp, event]
author: Alex
category: Releases
---

As we evolve the Snowplow platform, one area we keep coming back to is our understanding and handling of time. The time at which an event took place is a crucial fact for every event - but it's surprisingly challenging to determine accurately. Our approach to date has been to capture as many clues as to the "true timestamp" of an event as we can, and record these faithfully for further analysis.

In this blog post...

ADD TOC



<h2 id="history">1. A brief history of time</h2>

As Snowplow has evolved as a platform we have steadily added timestamps to our Tracker Protocol and Canonical Event Model:

* From the [very start] [changelog-v040] we captured the `collector_tstamp`, which is the time when the event was received by the collector. In the presence of end-user devices with unreliable clocks, the `collector_tstamp` was a safe option for approximating the event's true timestamp
* [Two-and-a-half years ago] [changelog-v074] we added a `dvce_tstamp`, meaning the time by the device's clock when the event was created. Given that a user's events could arrive at a collector slightly out of order (due to the HTTP transport), the `dvce_tstamp` was useful for performing funnel analysis on individual users
* Back in [April this year] [changelog-r63] we added a `dvce_sent_tstamp`, meaning the time by the device's clock when the event was successfully sent to a Snowplow collector. As we added outbound caches to our trackers (particularly the JavaSc

Throughout this evolution, our advice has continued to be to use the `collector_tstamp` for all analysis except for per-user funnel analysis; to this end we use the `collector_tstamp` as our `SORTKEY` in Amazon Redshift.

Two developments have caused us to re-think our approach.

<h2 id="history">2. Time is more complex than we thought</h2>

Two steady developments in how Snowplow is used have caused us to 


This field reflected the fact that our trackers (particularly the mobile ones) were increasingly caching events for some time before sending, for example in the case of network outages

We are pleased to announce version [0.2.0] [020-release] of [SQL Runner] [repo]. SQL Runner is an open source app, written in Go, that makes it easy to execute SQL statements programmatically as part of the Snowplow data pipeline.

To use SQL Runner, you assemble a playbook i.e. a YAML file that lists the different `.sql` files to be run and the database they are to be run against. It is possible to specify which sequence the files should be run, and to run files in parallel.

Read on after the jump for:

1. [New features](/blog/2015/09/13/sql-runner-0.2.0-released/#new-features)
2. [Upgrading](/blog/2015/09/13/sql-runner-0.2.0-released/#upgrading)
3. [Getting help](/blog/2015/09/03/sql-runner-0.2.0-released/#help)

<!--more-->

For more information on SQL Runner please view [the GitHub repository] [repo].

<h2 id="new-features">1. New features</h2>

The main addition is the ability to run SQL against Redshift and Postgres databases which have SSL security enabled. Many thanks to Dennis Waldron from Space Ape Games for contributing this feature!

Update the database targets in your playbooks to use the new `ssl` parameter:

{% highlight yaml %}
targets:
  - name: "My Postgres database 1"
    type: postgres
    host: localhost
    database: sql_runner_tests_1
    port: 5432
    username: postgres
    password:
    ssl: false # SSL disabled by default, or set to true
{% endhighlight %}

Other updates in this version:

* Fixed typo of "queries executed againt targets" ([#20] [issue-20])
* Updated vagrant up to work with latest Peru version ([#25] [issue-25])
* Replaced bitbucket.org/kardianos/osext with github.com/kardianos/osext ([#33] [issue-33])

<h2 id="upgrading">2. Upgrading</h2>

A version of SQL Runner for 64-bit Linux is available on Bintray, download it like so:

{% highlight bash %}
$ wget http://dl.bintray.com/snowplow/snowplow-generic/sql_runner_0.2.0_linux_amd64.zip
{% endhighlight %}

Once downloaded, unzip it:

{% highlight bash %}
$ unzip sql_runner_0.2.0_linux_amd64.zip
{% endhighlight %}

Run it like so:

{% highlight bash %}
$ ./sql-runner
sql-runner version: 0.2.0
Run playbooks of SQL scripts in series and parallel on Redshift and Postgres
Usage:
  -help=false: Shows this message
  -playbook="": Playbook of SQL scripts to execute
  -sqlroot="PLAYBOOK": Absolute path to SQL scripts. Use PLAYBOOK and BINARY for those respective paths
  -version=false: Shows the program version
{% endhighlight %}

Remember to update your database targets in playbooks to use the new `ssl` parameter.

<h2 id="help">3. Getting help</h2>

For more details on this release, please check out the [SQL Runner 0.2.0 release notes][020-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[repo]: https://github.com/snowplow/sql-runner
[issue-20]: https://github.com/snowplow/sql-runner/issues/20
[issue-25]: https://github.com/snowplow/sql-runner/issues/25
[issue-33]: https://github.com/snowplow/sql-runner/issues/33
[issues]: https://github.com/snowplow/sql-runner/issues

[020-release]: https://github.com/snowplow/sql-runner/releases/tag/0.2.0

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
