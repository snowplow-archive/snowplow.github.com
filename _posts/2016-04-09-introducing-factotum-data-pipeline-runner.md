---
layout: post
title: "Introducing Factotum data pipeline runner"
title-short: Factotum 0.1.0
tags: [snowplow, rust, orchestration, dag, data engineering, jobs, tasks, factotum, pipeline]
author: Ed
category: Releases
---

We are pleased to announce the release of [Factotum] [factotum-repo], a new open-source system for the execution of data pipeline jobs.

Pipeline orchestration is a common problem faced by data teams, and one which Snowplow has [discussed in the past][snowplow-job-make]. As part of the Snowplow Managed Service we operate numerous data pipelines for customers, with many pipelines including with customer-specific [event data modeling] [event-data-modeling].

As we started to outgrow our existing Make-based solution, we reviewed many job orchestration tools. While each one is great at what it does, they have come up short in key areas that are important to us and our customers. So we created our own, Factotum - read on to find out more:

1. [Why Factotum?](/blog/2016/04/09/introducing-factotum-data-pipeline-runner#why)
2. [The Zen of Factotum](/blog/2016/04/09/introducing-factotum-data-pipeline-runner#zen)
3. [Factotum 0.1.0](/blog/2016/04/09/introducing-factotum-data-pipeline-runner#factotum)
4. [Downloading and running Factotum](/blog/2016/04/09/introducing-factotum-data-pipeline-runner#install)
5. [Writing jobs for Factotum](/blog/2016/04/09/introducing-factotum-data-pipeline-runner#authoring)
6. [Roadmap](/blog/2016/04/09/introducing-factotum-data-pipeline-runner#roadmap)
7. [Contributing](/blog/2016/04/09/introducing-factotum-data-pipeline-runner#contributing)

<!--more-->

<h2 id="why">1. Why Factotum?</h2>

Let's take a look at some of the existing data pipeline orchestration options available today:

<h3>1.1 Specialised tools (AWS Data Pipeline, Luigi, Chronos, Airflow, Azkaban)</h3>

These are all great tools, and you could successfully run your data pipeline jobs using any one of them. However, there are some issues with these tools that lead us to think they're not a great fit for us:

<h4>Single sponsorship</h4>

Many awesome people at places like Amazon, LinkedIn and Airbnb have developed jobflow tooling in-house, and have graciously released them as open source software. Unfortunately these tools tend to be shared rather late in their gestation, and are closely tied to the originating companies' own needs. As a result, simple tasks have become very complicated.

<h4>Mixing jobs and schedules</h4>

At Snowplow we believe that executing a job and scheduling it are two separate things. There's no reason that changing the scheduling of a job should change its output - or the scheduling of other jobs. One of our frustrations with some of these tools is that they link the running of a job to the scheduling of a job.

To paraphrase The Wire, "you come at the king [cron], you best not miss". These tools typically replace cron with proprietary schedulers which are [hard to reason about] [airflow-schedule-issues] or [even unreliable] [jepsen-chronos].

<h4>Complex DSLs and Turing-complete jobs</h4>

Most of these tools use specialised configurations, DSLs and similar that require an engineer to own and operate. This creates harder to reason about your job, to edit it and to validate it. It also creates lock-in: if you write a series of orchestration jobs in Airflow in Python - how would you switch to Azkaban? What describes how your tasks are run?

When you have a DSL or a Turing-complete job, the temptation to add in "job duct tape" is incredibly high. It's easy for the separation of church and state (orchestration of data flow versus data flow itself) to become blurred too.

<h3>Build tools</h3>

Build tools often have features for dealing with complicated task trees built-in, just like data pipelines. This can make them powerful and flexible solutions for dealing with task orchestration as well as building software.

However build tools did not evolve specifically to serve data pipelines, and they have some limitations:

<h4>Inflexible outcomes</h4>

A software build has a boolean outcome - pass or fail, but that might not be the case for your jobs. A good example of this is if your job is designed to move some data around - if there's no data, should the job fail? It's not a failure, but it's also not really a success. Build tools are not great at handling this kind of "noop" scenario.

<h4>Composability</h4>

Composing a jobflow DAG from smaller jobflow DAGs is an important part of making complex jobflows manageable. Unfortunately build tools don't make this easy.

<h2 id="zen">2. The zen of Factotum</h2>

After reviewing the existing solutions, we came up with a series of must-have requirements for a job execution tool, which we are calling the "Zen of Factotum":

<h3>1. A Turing-complete job is not a job, it's a program</h3>

   * Jobs are a graph (DAG), not a linear path
   * We don't want Bash or Python or Ruby "duct tape" scripts in the runner - the logic for task execution is the responsibility of the execution tool not the task itself
   * The tasks should be expressed simply, in a human readable format.
       * This format shouldn't be static, and should grow with the tool

<h3>2. A job must be composable from other jobs</h3>

   * Factotum jobs can embed other Factotum jobs, allowing some degree of polymorphism while still adhering to the first rule

<h3>3. A job exists independently of any job schedule</h3>

   * A job is not a schedule, in fact a job has very little to do with its schedule
   * It follows from this that job specification should be completely decoupled from its scheduler
   * Factotum should not mandate a specific scheduler -

<h2 id="factotum">3. Factotum 0.1.0</h2>

Armed with the "Zen of Factotum", we have written a tool that executes DAGs.

These DAGs are expressed in self-describing JSON, so they can be versioned and remain human-composable. The JSON Schema for these Factotum "factfiles" is available from Iglu Central as [com.snowplowanalytics.factotum/factfile/jsonschema/1-0-0] [factfile-schema], so any JSON Schema validator can validate/lint a Factotum DAG.

Factotum is our first project written in [Rust][rust-lang], and so while 0.1.0 only officially supports Linux/x86_64, in time Factotum should be runnable on alomst every platform.

Crucially, Factotum has **no install dependencies** and doesn't require a cluster, root access, a database, port 80 and so on. It executes DAGs and gives you a nice report on what it did.

<h2 id="install">4. Downloading and running Factotum</h2>

Currently Factotum is only available for 64 bit Linux. Get it like so:

{% highlight bash %}
wget https://bintray.com/artifact/download/snowplow/snowplow-generic/factotum_0.1.0_linux_x86_64.zip
unzip factotum_0.1.0_linux_x86_64.zip
wget https://raw.githubusercontent.com/snowplow/factotum/master/samples/echo.factotum
{% endhighlight %}

This series of commands will download the 0.1.0 release, unzip it in your current working directory and download a sample job for you to run. You can then run Factotum in the following way:

{% highlight bash %}
factotum ./echo.factotum
{% endhighlight %}

<h2 id="authoring">5. Writing jobs for Factotum</h2>

Factfiles are self-describing JSON which declare a series of tasks and their dependencies. For example:

{% highlight json %}
{
    "schema": "iglu:com.snowplowanalytics.factotum/factfile/jsonschema/1-0-0",
    "data": {
        "name": "Factotum demo",
        "tasks": [
            {
                "name": "echo alpha",
                "executor": "shell",
                "command": "echo",
                "arguments": [ "alpha" ],
                "dependsOn": [],
                "onResult": {
                    "terminateJobWithSuccess": [],
                    "continueJob": [ 0 ]
                }
            },
            {
                "name": "echo beta",
                "executor": "shell",
                "command": "echo",
                "arguments": [ "beta" ],
                "dependsOn": [ "echo alpha" ],
                "onResult": {
                    "terminateJobWithSuccess": [],
                    "continueJob": [ 0 ]
                }
            },
            {
                "name": "echo omega",
                "executor": "shell",
                "command": "echo",
                "arguments": [ "and omega!" ],
                "dependsOn": [ "echo beta" ],
                "onResult": {
                    "terminateJobWithSuccess": [],
                    "continueJob": [ 0 ]
                }
            }
        ]
    }
}
{% endhighlight %}

This example defines three tasks that run shell commands - *echo alpha*, *echo beta* and *echo omega*:

* *echo alpha* has no dependencies - it will run immediately
* *echo beta* depends on the completion of the *echo alpha* task, and so will wait for *echo alpha* to complete
* *echo omega* depends on the *echo beta* task, and so will wait for *echo beta* to be complete before executing

Given the above, the tasks will be executed in the following sequence: *echo alpha*, *echo beta* and finally, *echo omega*. Tasks can have multiple dependencies in Factotum, and tasks that are parallelizable will be run concurrently.

Check out [the samples][job-samples] for more sample factfiles or the [wiki][factotum-wiki] for a more complete description of the factfile format.

<h2 id="roadmap">6. Roadmap for Factotum</h2>

We're taking an iterative approach with Factotum - today Factotum won't give you an entire stack for monitoring, scheduling and running data pipelines, but we plan on growing it into a set of tools that will.

Factotum will continue to be our "job executor", but a more complete ecosystem will be developed around it - ideas include an optional scheduler, audit logging, user authentication and more. If you have specific features you'd like to suggest, please [add a ticket] [factotum-issues] to the GitHub repo.

Our plan is to base all development on the principles we've laid out here - seperation of concerns, plug-and-play compartmentalization and keeping jobs separate from schedules.

<h2 id="contributing">7. Contributing</h2>

Factotum is completely open source - and has been from the start! If you'd like to get involved, or just try your hand at Rust, please check out the [repository][factotum-repo].

[event-data-modeling]: http://snowplowanalytics.com/blog/2016/03/16/introduction-to-event-data-modeling/

[factotum-discourse]: http://discourse.snowplowanalytics.com/
[job-samples]: https://github.com/snowplow/factotum/tree/master/samples
[factotum-wiki]: https://github.com/snowplow/factotum/wiki
[snowplow-job-make]: http://snowplowanalytics.com/blog/2015/10/13/orchestrating-batch-processing-pipelines-with-cron-and-make/
[factotum-repo]: https://github.com/snowplow/factotum
[rust-lang]: https://www.rust-lang.org/

[factotum-issues]: https://github.com/snowplow/factotum/issues/new
[factfile-schema]: http://iglucentral.com/schemas/com.snowplowanalytics.factotum/factfile/jsonschema/1-0-0

[factotum-discourse]: http://discourse.snowplowanalytics.com/c/for-engineers/factotum

[airflow-schedule-issues]: https://github.com/airbnb/airflow/issues?utf8=%E2%9C%93&q=is%3Aissue+schedule
[jepsen-chronos]: https://aphyr.com/posts/326-jepsen-chronos
