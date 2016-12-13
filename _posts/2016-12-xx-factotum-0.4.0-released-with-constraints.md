---
layout: post
title: Factotum 0.4.0 released with constraints
title-short: Factotum 0.4.0
tags: [snowplow, rust, orchestration, dag, data engineering, jobs, tasks, factotum, pipeline]
author: Josh
category: Releases
---

We're pleased to announce the 0.4.0 release of Snowplow's DAG running tool [Factotum][factotum-repo]! This release centers around making DAGs safer to run on distributed clusters by locking the run to a host.

In the rest of this post we will cover:

1. [Constraining job runs](/blog/2016/12/xx/factotum-0.4.0-released-with-constraints#constraints)
2. [Downloading and running Factotum](/blog/2016/12/xx/factotum-0.4.0-released-with-constraints#install)
3. [Roadmap](/blog/2016/12/xx/factotum-0.4.0-released-with-constraints#roadmap)
4. [Contributing](/blog/2016/12/xx/factotum-0.4.0-released-with-constraints#contributing)

<!--more-->

<h2 id="constraints">1. Constraining job runs</h2>

This release adds the ability to constrain your DAG to a single host.  This allows for job distribution to many servers while ensuring that the job is only run once and from one place.  From a management standpoint this greatly simplifies server setup as each box now has the exact same settings but it is smart enough to know where to run.

To constrain the DAG simply append the following:

```
./factotum run ./echo.factotum --constraint "host,${your_hostname}"
```

The hostname can be:

* A wildcard `*` which means that this check always validates
* The hostname of the server
* The internal IP of the server

For example running the `echo.factfile` sample with constraints that all validate:

```
$host ./factotum run echo.factfile --constraint "host,*"
$host ./factotum run echo.factfile --constraint "host,Joshuas-iMac.local"
$host ./factotum run echo.factfile --constraint "host,192.168.1.44" # Ethernet
$host ./factotum run echo.factfile --constraint "host,192.168.1.12" # WiFi
```

However if I change these to non-valid values:

```
$host ./factotum run echo.factfile --constraint "host,hostname"
$host Error: the specifed host constraint "hostname" is invalid. Reason: found external IP(s) but failed to list IP(s) for hostname
```

What this error means is that we were able to list probable IPs for this host but that the hostname provided - when we attempted to get an IP for it - did not match the found list.  So it fails to resolve and thus will not run.

If I were to disconnect one of the Network Interfaces:

```
$host ./factotum run echo.factfile --constraint "host,192.168.1.12"
$host Error: the specifed host constraint "192.168.1.12" is invalid. Reason: did not find matching IP for hostname
```

This error means that we could not find a hostname associated with the IP provided.

<h2 id="install">2. Downloading and running Factotum</h2>

Factotum is available for macOS and Linux (x86_64).

If you're running Linux:

```
wget https://bintray.com/artifact/download/snowplow/snowplow-generic/factotum_0.4.0_linux_x86_64.zip
unzip factotum_0.4.0_linux_x86_64.zip
wget https://raw.githubusercontent.com/snowplow/factotum/master/samples/echo.factfile
```

If you're running macOS:

```
wget https://bintray.com/artifact/download/snowplow/snowplow-generic/factotum_0.4.0_darwin_x86_64.zip
unzip factotum_0.4.0_darwin_x86_64.zip
wget https://raw.githubusercontent.com/snowplow/factotum/master/samples/echo.factfile
```

This series of commands will download the 0.4.0 release, unzip it in your current working directory and download a sample job for you to run. You can then run Factotum in the following way:

```./factotum run ./echo.factfile```

<h2 id="roadmap">3. Roadmap for Factotum</h2>

We’re taking an iterative approach with Factotum - today Factotum won’t give you an entire stack for monitoring, scheduling and running data pipelines, but we plan on growing it into a set of tools that will.

Factotum will continue to be our “job executor”, but a more complete ecosystem will be developed around it - ideas include an optional scheduler, audit logging, user authentication, Mesos support and more. If you have specific features to suggest, [please add a ticket to the GitHub repo][factotum-issues].

<h2 id="contributing">4. Contributing</h2>

Factotum is completely open source - and has been from the start! If you’d like to get involved, or just try your hand at Rust, please check out [the repository][factotum-repo].

[factotum-issues]: https://github.com/snowplow/factotum/issues/new
[factotum-repo]: https://github.com/snowplow/factotum
