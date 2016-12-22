---
layout: post
title: Factotum 0.4.0 released with support for constraints
title-short: Factotum 0.4.0
tags: [snowplow, rust, orchestration, dag, data engineering, jobs, tasks, factotum, pipeline]
author: Josh
category: Releases
---

We're pleased to announce the 0.4.0 release of Snowplow's DAG running tool [Factotum][factotum-repo]! This release centers around making DAGs safer to run on distributed clusters by constraining the run to a specific host.

In the rest of this post we will cover:

1. [Constraining job runs](/blog/2016/12/22/factotum-0.4.0-released-with-support-for-constraints#constraints)
2. [Downloading and running Factotum](/blog/2016/12/22/factotum-0.4.0-released-with-support-for-constraints#install)
3. [Roadmap](/blog/2016/12/22/factotum-0.4.0-released-with-support-for-constraints#roadmap)
4. [Contributing](/blog/2016/12/22/factotum-0.4.0-released-with-support-for-constraints#contributing)

<!--more-->

<h2 id="constraints">1. Constraining job runs</h2>

This release adds the ability to constrain your DAG's execution to a single host. This allows for job distribution to many servers while ensuring that the job is only run once and from one place; you can use this for example to distribute a single cron file to multiple boxes, knowing that only one server's Factotum instance will successfully invoke a given DAG.

To constrain the DAG simply append the following:

```
./factotum run ./echo.factotum --constraint "host,${your_hostname}"
```

The hostname can be:

* A wildcard `*` which means that this check always passes
* The hostname of the server
* The internal IP of the server

For example running the `echo.factfile` sample with constraints that all pass:

```
$ ./factotum run echo.factfile --constraint "host,*"
$ ./factotum run echo.factfile --constraint "host,Joshuas-iMac.local"
$ ./factotum run echo.factfile --constraint "host,192.168.1.44" # Ethernet
$ ./factotum run echo.factfile --constraint "host,192.168.1.12" # WiFi
```

However, if I change these to non-valid values:

```
$ ./factotum run echo.factfile --constraint "host,hostname"
$ Warn: the specifed host constraint "hostname" did not match, no tasks have been executed. Reason: could not find any IPv4 addresses for the supplied hostname
```

This means that we failed to lookup any addresses associated with the hostname given: we have nothing to compare against our local interfaces and as such we cannot obtain a match.

If I were to disconnect my WiFi network interface:

```
$ ./factotum run echo.factfile --constraint "host,192.168.1.12"
$ Warn: the specifed host constraint "192.168.1.12" did not match, no tasks have been executed. Reason: failed to match any of the interface addresses to the found host addresses
```

This means that we were able to get addresses from the local interfaces as well as from the supplied IP address, but a match could not be found within both lists.

__Note__: A failure to match the host constraint will result in an exit code of 0. This is because a non-matching host is considered a no-operation ("noop").

<h2 id="install">2. Downloading and running Factotum</h2>

Factotum is available for macOS and Linux (x86_64).

The following series of commands will download the 0.4.0 release, unzip it in your current working directory and download a sample job for you to run.

If you're running Linux:

```
$ wget https://bintray.com/artifact/download/snowplow/snowplow-generic/factotum_0.4.0_linux_x86_64.zip
$ unzip factotum_0.4.0_linux_x86_64.zip
$ wget https://raw.githubusercontent.com/snowplow/factotum/master/samples/echo.factfile
```

If you're running macOS:

```
$ wget https://bintray.com/artifact/download/snowplow/snowplow-generic/factotum_0.4.0_darwin_x86_64.zip
$ unzip factotum_0.4.0_darwin_x86_64.zip
$ wget https://raw.githubusercontent.com/snowplow/factotum/master/samples/echo.factfile
```

You can then run Factotum in the following way:

```
$ ./factotum run ./echo.factfile
```

<h2 id="roadmap">3. Roadmap for Factotum</h2>

We’re taking an iterative approach with Factotum - today Factotum won’t give you an entire stack for monitoring, scheduling and running data pipelines, but we plan on growing it into a set of tools that will.

Coming up soon, we are looking forward to open-sourcing a prototype job server for Factotum, which allows you to submit jobs for Factotum to run over HTTP.

If you have specific features to suggest, [please add a ticket to the GitHub repo][factotum-issues].

<h2 id="contributing">4. Contributing</h2>

Factotum is completely open source - and has been from the start! If you’d like to get involved, or just try your hand at Rust, please check out [the repository][factotum-repo].

[factotum-issues]: https://github.com/snowplow/factotum/issues/new
[factotum-repo]: https://github.com/snowplow/factotum
