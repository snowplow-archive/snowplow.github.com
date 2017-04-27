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

Where Factotum fills the gap of our previous make-based solution, Factotum Server replaces much of our Cron usage in a form that is accessible via HTTP requests. We hope that the Factotum jobserver is useful to the wider job-running community - read on to find out more.

1. [Why Factotum Server?](/blog/2017/04/24/introducing-factotum-server#why)
2. [Job server as web service](/blog/2017/04/24/introducing-factotum-server#web-service)
3. [Factotum Server 0.1.0](/blog/2017/04/24/introducing-factotum-server#factotum)
4. [Downloading and running Factotum Server](/blog/2017/04/24/introducing-factotum-server#install)
5. [Submitting a job to Factotum](/blog/2017/04/24/introducing-factotum-server#submittingxxx)
6. [Roadmap](/blog/2017/04/24/introducing-factotum-server#roadmap)
7. [Contributing](/blog/2017/04/24/introducing-factotum-server#contributing)

<!--more-->

<h2 id="why">1. Why Factotum Server?</h2>

Factotum Server is an extension to the existing Factotum project, and broadens the scope of what is possible with Factotum. The job server started off as an internal project written in Golang as we found ourselves needing to run Factotum factfiles outside of regular Cron scheduling, for example:

* Manually kicking off ad hoc runs of regularly scheduled jobs
* Manually resuming failed scheduled jobs from partway through the DAG

We did not undertake building YAJS (Yet Another Job Server) lightly! But we had some key requirements:

<h3>First class support for Factotum</h3>

It was important that the job server be 100% compatible with the job running behaviour of Factotum CLI and specifically Factotum's factfile format.

<h3>Support for clustering</h3>

We are running Factotum CLI on many servers in our orchestration cluster. It was important that our job server could also be distributed across multiple boxes, which meant building in support for our preferred HA distributed system to share state: [Consul][consul-io] from HashiCorp.

<h3>Webhook all the things</h3>

The webhook-first approach we took with Factotum has worked out great: we ingest the webhooks natively into our internal Snowplow pipeline and use this for all sorts of DAG monitoring and visualisation. It removes a ton of complexity from the core of Factotum and allows us to monitor and visualise DAGs in a much more Snowplow-idiomatic way. It's important that our job server speaks the same webhooks.

<h2 id="web-service">2. Job server as web service</h2>

What kind of interface should we use for Factotum Server? We had some design goals we wanted to fulfil:

<h4>Abstraction</h4>
We don't want to care which box a given job is running on - we just want the job to run and for the job server to keep track of jobs submitted. We want the job server to be easily distributed behind a load balancer.

<h4>Simple job requests</h4>
We want running Factotum jobs on-demand to be simple and explicit. A RESTful-inspired HTTP interface makes it easy to run jobs from a shell, and to integrate job-running into GUIs and ChatOps.

From this it was clear that we needed to build the Factotum Server as an HTTP service.

<h2 id="factotum">3. Factotum Server 0.1.0</h2>

Factotum Server, like Factotum, is written in [Rust][rust-lang]. Version 0.1.0 is mostly a port of our internal Golang project to Rust, with certain Snowplow-isms removed.

The main action is submitting new job requests for Factotum, sent via the `/submit` HTTP endpoint, which is described in the example [below](#submitting).

Factotum jobs are executed using the CLI for Factotum, which needs to be available on the same box that the server is running on. This along with Consul (see [below](#consul-install)) are Factotum's **only operational dependencies**.

We have adopted a "worker queue" model for scheduling:

- New requests are appended to a queue of job requests and the next available worker is notified to check the queue
- The worker processes the job by executing Factotum in a separate thread, allowing multiple workers to process jobs concurrently
- The worker will record the outcome on completion and check the queue again for any further requests

Consul is used as our distributed state storage where entries are created for each unique job, and the job ID is generated in the same way as [Factotum's job reference][factotum-common-fields]. Each entry persists:

* The job status `QUEUED`, `WORKING`, or `DONE`
* The job request JSON
* The server ID the job was last run from
* The outcome of the last run `WAITING`, `RUNNING`, `SUCCEEDED`, or `FAILED`

More information, including the other available API commands, can be found in our docs [on the wiki][factotum-server-wiki].

Factotum Server is currently built for `Linux/x86_64` and `Darwin/x86_64`. As Factotum becomes available on other platforms, the server should also become available there.

<h2 id="install">4. Downloading and running Factotum Server</h2>

Assuming you are running **64 bit Linux**:

{% highlight bash %}
$ wget http://dl.bintray.com/snowplow/snowplow-generic/factotum_server_0.1.0_linux_x86_64.zip
$ unzip factotum_server_0.1.0_linux_x86_64.zip
$ ./factotum-server --help
{% endhighlight %}

You can then run Factotum Server in the following way:

{% highlight bash %}
$ ./factotum-server --factotum-bin=<PATH>
{% endhighlight %}

This starts up Factotum Server with [preset defaults][factotum-server-defaults], ready to execute job requests using the Factotum binary at the `--factotum-bin` path.

<h4 id="factotum-install">Factotum Setup</h4>

If Factotum is **not** already available:

{% highlight bash %}
$ wget http://dl.bintray.com/snowplow/snowplow-generic/factotum_0.4.1_linux_x86_64.zip
$ unzip factotum_0.4.1_linux_x86_64.zip
$ wget https://raw.githubusercontent.com/snowplow/factotum/master/samples/echo.factfile
{% endhighlight %}

These commands will download the 0.4.1 Factotum release, unzip it in your current working directory, and download a sample job for you to run.

See the [wiki][wiki-home] for further guides and information.

<h4 id="consul-install">Consul Setup</h4>

Installing Consul is out of scope of this blog post - however HashiCorp has a [getting started guide for Consul][consul-install].

<h2 id="submitting">5. Submitting a job to Factotum</h2>

Assuming that the steps [above](#install) have been followed, you now have Factotum Server running with a copy of the Factotum binary, along with Consul and an example factfile.

To submit a job, all you need to do is POST the following JSON to `http://localhost:3000/submit`:

{% highlight json %}
{
    "jobName": "echotest",
    "factfilePath": "/<PATH>/echo.factfile",
    "factfileArgs": [ "--tag", "foo,bar", "--no-colour" ]
}
{% endhighlight %}

If you have run Factotum commands before, you will notice that the JSON looks very similar to the arguments passed to the Factotum CLI.

 - `jobName` is an internal reference used within the server as the name of the request being sent (not to be confused with the server generated [job reference][factotum-common-fields])
 - `factfilePath` specifies the location of the factfile to run. Currently only local filepaths are supported, so you will need to use rsync, ansible-pull or similar to ensure that the factfile is available on all instances running Factotum Server
 - `factfileArgs` is an array containing the additional options passed to the CLI for running the factfile

Check out [the samples][job-samples] for more sample factfiles or the [wiki][wiki-home] for more information.

<h2 id="roadmap">6. Roadmap for Factotum Server</h2>

We are taking an iterative approach with Factotum Server - today it can schedule and execute Factotum jobs, but in the future it will be able to recover from job failures and resume incomplete jobs.

An important future change is to remove the server's current dependency on the Factotum CLI. Once the Factotum logic is separated into a common library, this can be used directly instead, and Factotum Server will not have to shell out to Factotum CLI to actually run jobs.

Although it's not a high-priority internal requirement, we would welcome a contribution of a local storage option as a single-server alternative to Consul. Please see the ticket, [Add support for RocksDB for state storage #4][issue-4], if you would like to help out here.

If you have specific features you would like to suggest, please [add a ticket][factotum-server-issues] to the GitHub repo.

<h2 id="contributing">7. Contributing</h2>

As with Factotum, Factotum Server is completely open source. If you would like to get involved, or just try your hand at Rust, please check out the [repository][factotum-server-repo].

<!-- Links -->

[job-samples]: https://github.com/snowplow/factotum/tree/master/samples
[wiki-home]: https://github.com/snowplow/factotum/wiki
[factotum-server-wiki]: https://github.com/snowplow/factotum/wiki/Factotum-Server
[factotum-server-defaults]: https://github.com/snowplow/factotum/wiki/Factotum-Server-User-Guide#cli-arguments
[snowplow-job-make]: http://snowplowanalytics.com/blog/2015/10/13/orchestrating-batch-processing-pipelines-with-cron-and-make/
[factotum-first-blog]: http://snowplowanalytics.com/blog/2016/04/09/introducing-factotum-data-pipeline-runner/
[factotum-common-fields]: https://snowplowanalytics.com/blog/2016/11/07/factotum-0.3.0-released-with-webhooks/#common-fields
[factotum-server-repo]: https://github.com/snowplow/factotum-server
[factotum-repo]: https://github.com/snowplow/factotum
[rust-lang]: https://www.rust-lang.org/
[consul-io]: https://www.consul.io/
[consul-install]: https://www.consul.io/intro/getting-started/install.html

[issue-4]: https://github.com/snowplow/factotum-server/issues/4
[factotum-server-issues]: https://github.com/snowplow/factotum-server/issues/new
