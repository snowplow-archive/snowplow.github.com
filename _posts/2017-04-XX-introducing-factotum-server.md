---
layout: post
title: Introducing Factotum Server
title-short: Factotum Server 0.1.0
tags: [snowplow, rust, orchestration, dag, data engineering, jobs, tasks, factotum, factotum-server, pipeline, rest, web service]
author: Nicholas
category: Releases
---

We are pleased to announce the release of [Factotum Server][factotum-server-repo], a new open-source system for scheduling and executing [Factotum][factotum-repo] jobs. 

In [previous posts][snowplow-job-make], we have talked about how our pipeline orchestration journey started with `cron` and `make`, before moving on to release [Factotum][factotum-first-blog]. Initially, the only way to interact with Factotum has been through the CLI, but now we have Factotum Server.

Where Factotum fills the gap of our previous Make-based solution, Factotum Server replaces much of our `cron` usage in a form that is accessible via HTTP requests. It is the next natural step for what we already have - read on to find out more.

1. [Why Factotum Server?](#why)
2. [Factotum Server 0.1.0](#factotum)
3. [Downloading and running Factotum Server](#install)
4. [Submitting a job to Factotum](#submitting)
5. [Roadmap](#roadmap)
6. [Contributing](#contributing)

<!--more-->

<h2 id="why">1. Why Factotum Server?</h2>

Factotum Server is an extension of the existing Factotum project, but with a different responsibility, hence the separate project. The server started off as an internal project written in Golang as we reached the limitations of a purely `cron` solution:

<h4>Accessibility</h4>
The desire to use Factotum with all the available options is great, but all that is moot if you have no idea what box to execute the command from or do not even have access to the box itself. Until access is granted, the user is effectively blocked. These are unnecessary barriers for users to perform simple actions.

<h4>Agility</h4>
Logging on and editing the crontab is clunky and prone to human error, especially if there is a knowledge gap. It is easy to schedule the same long-running job repeatedly, or delete a different job from the list. These are more mental gymnastics for the user.

<h4>Security</h4>
Granting user access to a box poses a potential security risk that can be difficult to manage. If the user only requires a simple action to be performed, then there should be a direct way for them to do that without exposing other parts of the system.

<h3>The RESTful Route</h3>

We approached this web service with the following intentions:

<h4>Abstraction</h4>
Behind a web service, the server will offload a lot of the thinking for us - we do not care what box it is running on or how the schedule is organised, we just want the job to run at some point and keep track of jobs submitted.

<h4>Decoupling</h4>
If running the application is no longer tied to a fixed location, then the functionality can evolve without worrying about how users or other applications interact with Factotum directly.

<h4>Integration</h4>
We want to run Factotum jobs on-demand when we want! Submitting a job should be easy and explicit in the name of the action. The RESTful interface allows the functionality to be integrated within other applications, such as instant messaging clients.

<h4>Scalability</h4>
Cron is a ubiquitous time-based job scheduler and does that very well in isolation, but lacks flexibility when used at scale. As we move towards a clustered system, we need something that is aware of state across multiple machines and, ultimately, schedule itself. 

<h2 id="factotum">2. Factotum Server 0.1.0</h2>

Factotum Server, like Factotum, is written in [Rust][rust-lang]. Version 0.1.0 is mostly a port of our internal Golang project to Rust with a few additional optimisations, such as Consul integration.

The main action is submitting new job requests for Factotum, sent via the `/submit` HTTP endpoint, which is described in the example [below](#submitting).

Factotum jobs are executed using the CLI for Factotum, which needs to be available on the same box that the server is running on (otherwise you will have a nice shiny HTTP server that does not do much!). This is currently the **only installation dependency**.

We have adopted a "worker queue" model for scheduling. New requests are appended to a queue of job requests and the next available worker is notified to check the queue. The worker processes the job by executing Factotum in a separate thread, allowing multiple workers to process jobs concurrently. Once complete, the worker will record the outcome and check the queue again for any further requests.

Consul is used as state storage where entries are created for each unique job (the ID is equivalent to the job reference generated in Factotum). Each entry persists the state (`Queued`/`Working`/`Done`), the job request JSON, the server ID the job was last run from, and whether the last run was a success or failure.

More information, including the other available API commands, can be found in our docs [on the wiki][factotum-server-wiki].

Factotum Server is currently built for `Linux/x86_64` and `Darwin/x86_64`. As Factotum becomes available on other platforms, the server should also become available them.

<h2 id="install">3. Downloading and running Factotum Server</h2>

Assuming you are running **64 bit Linux**:

```{bash}
$ wget http://dl.bintray.com/snowplow/snowplow-generic/factotum_server_0.1.0_linux_x86_64.zip
$ unzip factotum_server_0.1.0_linux_x86_64.zip
$ ./factotum-server --help
```

You can then run Factotum Server in the following way:

```{bash}
$ ./factotum-server --factotum-bin=<PATH>
```

This starts up Factotum Server with [preset defaults][factotum-server-defaults], ready to execute job requests using the Factotum binary at the `--factotum-bin` path.

If Factotum is **not** already available:

```{bash}
$ wget http://dl.bintray.com/snowplow/snowplow-generic/factotum_0.4.1_linux_x86_64.zip
$ unzip factotum_0.4.1_linux_x86_64.zip
$ wget https://raw.githubusercontent.com/snowplow/factotum/master/samples/echo.factfile
```

These commands will download the 0.4.1 Factotum release, unzip it in your current working directory, and download a sample job for you to run.

See the [wiki][wiki-home] for further guides and information.

<h2 id="submitting">4. Submitting a job to Factotum</h2>

Assuming the steps [above](#install) have been followed, you now have Factotum Server running with a copy of the Factotum binary, along with an example factfile.

To submit a job, all you need to do is POST the following JSON to `http://localhost:3000/submit`:

```{json}
{
    "jobName": "echotest",
    "factfilePath": "/<PATH>/echo.factfile",
    "factfileArgs": [ "--tag", "foo,bar", "--no-colour" ]
}
```

If you have run Factotum commands before, you will notice that the JSON looks very similar to the arguments passed to the Factotum CLI. `factfilePath` specifies the location of the factfile to run and `factfileArgs` is an array containing the additional options passed to the CLI for running the factfile. `jobName` is a reference used within the server as the name of the request being sent.

Check out [the samples][job-samples] for more sample factfiles or the [wiki][wiki-home] for more information about all things Factotum.

<h2 id="roadmap">5. Roadmap for Factotum Server</h2>

We are taking an iterative approach with Factotum Server - today it can schedule and execute Factotum jobs, but in the future it will be able to recover from job failures and resume incomplete jobs.

Future changes to Factotum will let us remove the current dependency on the CLI. Once the Factotum logic is separated into a common library, this can be used directly instead, and downloading Factotum will not need to be a prerequisite.

If you have specific features you would like to suggest, please [add a ticket][factotum-server-issues] to the GitHub repo.

<h2 id="contributing">6. Contributing</h2>

As with Factotum, Factotum Server is completely open source. If you would like to get involved, or just try your hand at Rust, please check out the [repository][factotum-server-repo].

<!-- Links -->

[job-samples]: https://github.com/snowplow/factotum/tree/master/samples
[wiki-home]: https://github.com/snowplow/factotum/wiki
[factotum-server-wiki]: https://github.com/snowplow/factotum/wiki/Factotum-Server
[factotum-server-defaults]: https://github.com/snowplow/factotum/wiki/Server-User-Guide#cli-arguments
[snowplow-job-make]: http://snowplowanalytics.com/blog/2015/10/13/orchestrating-batch-processing-pipelines-with-cron-and-make/
[factotum-first-blog]: http://snowplowanalytics.com/blog/2016/04/09/introducing-factotum-data-pipeline-runner/
[factotum-server-repo]: https://github.com/snowplow/factotum-server
[factotum-repo]: https://github.com/snowplow/factotum
[rust-lang]: https://www.rust-lang.org/

[factotum-server-issues]: https://github.com/snowplow/factotum-server/issues/new
