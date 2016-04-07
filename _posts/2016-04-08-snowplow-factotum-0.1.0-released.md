---
layout: post
title: Snowplow Factotum 0.1.0 released
title-short: Snowplow Factotum 0.1.0
tags: [snowplow, rust, orchestration, factotum, pipeline]
author: Ed
category: Releases
---

We are pleased to announce the release of Factotum, a purpose built system for the execution of data pipeline jobs.

Pipeline orchestration is a common problem faced by teams, and one which Snowplow has [discussed in the past][snowplow-job-make].
When looking at the problem we reviewed many existing orchestration tools, including our own. While each one is great at what it does,
they have come up short in key areas that are important to us.

So we created our own - read on to see more:

1. [Why Factotum?](/blog/2016/04/08/snowplow-factotum-0.1.0-released#why)
2. [The zen of Factotum](/blog/2016/04/08/snowplow-factotum-0.1.0-released#zen)
3. [Factotum 0.1.0](/blog/2016/04/08/snowplow-factotum-0.1.0-released#factotum)
4. [Getting started](/blog/2016/04/08/snowplow-factotum-0.1.0-released#install)
5. [Roadmap](/blog/2016/04/08/snowplow-factotum-0.1.0-released#roadmap)
6. [Contributing](/blog/2016/04/08/snowplow-factotum-0.1.0-released#contributing)

<!--more-->

<h2 id="why">1. Why Factotum?</h2>

Let's take a look at some of the existing data pipeline orchestration options available today:

## Specialised tools (AWS Data Pipeline, Luigi, Chronos, Airflow, Azkaban)

These are all amazing tools, and you could successfully run your jobs using any one of them. However, there's a couple of running themes with all these tools that lead us
to think they're not a great fit for us.

### Single sponsorship

Many awesome people at places like Amazon, Linkedin and Airbnb have developed tooling in-house, and have graciously released it as Open Source software.
While this is great for the Open Source community, such tools tend to be overly specialised as they are developed solely to meet their own needs - simple tasks have become very complicated. These are solid pieces of engineering work, but the overhead of dealing with the author's baggage can be considerable.

### Mixing jobs and schedules

At Snowplow we believe that executing a job and scheduling it are unrelated. There's no reason that changing the scheduling of a job should change it's output - or the scheduling of other jobs.
One of the reasons we dislike a lot of these tools is because they link the running of a job to the scheduling of a job.
Chronos (and others) are quite intricately intertwined - jobs execute in a daisy chain of manually defined inter-job dependencies. This can lead to some confusing results.

### DSLs, Python and configuration in the tool

Tooling with an overabundance of specialised configuration, DSLs and so-on that need to be created by a developer creates friction when attempting to migrate to a
different solution.

If you built a series of orchestration jobs in Airflow - how would you switch to Azkaban? What describes how your tasks are run? When you have a DSL or a turing complete job,
the temptation to add in "job duct tape" is incredibly high. We worry a lot about pushing configuration into build tools as it quickly becomes an un-version-controlled mess that nobody dares look at.

Why would running data pipeline jobs be different?

## Build tools

Build tools often have features for dealing with complicated task trees built-in, just like data pipelines. This can make them powerful and flexible solutions for dealing with task orchestration as well as building software.

However build tooling is not really being developed for data pipelines, and they have some limitations:

### Specificity

A software build has a boolean outcome - pass or fail, but that might not be the case for your jobs. A good example of this is if your job is designed to move some data around - if there's no data,
 does the job fail? It's not a failure, but it's also not really a success. It's somewhere in the middle.
We find that a lot of data pipeline jobs can fall into this "middle ground" in which we'd only consider it a problem if it happened repeatedly.

### Job duct tape

If your scheduler runs turing complete jobs, such as executing Python - the temptation to stack slightly different versions of the same code is very high. The temptation is present even when used as a build server - that's exactly why many build tools are job
declarations (e.g. make/Maven) rather than the job itself.

In a good build stack, you might have Jenkins running with a series of Maven builds. Jenkins schedules, Maven executes - this is exactly the separation of concerns we believe a cluster orchestration tool should have,
and we want to replicate this with a tool less specific to compiling Java.

## Infrastructure tools (e.g. Ansible) or home brew Python

### These tools are for running tasks, not DAGs

Infrastructure automation tools such as Ansible, Chef and Puppet can run a set of tasks for you, but they offer little support for handling concurrent tasks with dependencies on each other.
This comes from the convention of thinking of a job as a linear set of tasks that must be executed directly after each other. Each of these tools offers some work-around for supporting something close to a DAG-Style execution,
but it's not a core competency and it isn't easy to get this running - let alone maintain it.

### DSLs and code

Orchestrating your tasks with hand-written code can be a powerful way to build logic into your jobs, but such complexity can spiral out of control easily.
We believe that enforcing a simple set of extensible conventions is a cleaner, more reliable strategy.

<h2 id="zen">2. The zen of Factotum</h2>

After spending time coming to understand the limitations of the existing solutions, we came up with a series of sensible requirements for a job execution tool:

The zen of Factotum;

1) A Turing-complete job is not a job, it's a program

   * Jobs are a graph (DAG), not a linear path.
   * We don't want Bash "duct tape" scripts in the runner - the logic for task execution is the responsibility of the execution tool not the task itself
   * The tasks should be expressed simply, in a human readable format.
       * This format shouldn't be static, and should grow with the tool

2) A job must be composable from other jobs

   * Factotum can call Factotum, this allows some degree of polymorphism while still adhering to the first rule

3) A job exists independently of any job schedule

   * A job is not a schedule, in fact a job has very little to do with its schedule
   * It follows from this that the tool should be completely decoupled from it's scheduler

<h2 id="factotum">3. Factotum 0.1.0</h2>

Armed with the "Zen of Factotum", we have written a tool that executes DAGs.

These DAGs are expressed in self-describing JSON, so they can be versioned and remain human-composable. Factotum is [written in Rust][rust-lang] and so while 0.1.0 only officially supports Linux/x86_64 in time virtually every system will be capable of running it.
Factotum has **no install dependencies** and doesn't require a cluster, root access, a database, port 80 and so on. It executes DAGs and gives you a nice report on what it did - this first release is an iteration on make in our make and cron style orchestration.

<h2 id="install">4. Getting & running Factotum</h2>

*This applies to 64 bit Linux only!*

{% highlight bash %}
wget https://bintray.com/artifact/download/snowplow/snowplow-generic/factotum_0.1.0_linux_x86_64.zip
unzip factotum_0.1.0_linux_x86_64.zip
wget https://raw.githubusercontent.com/snowplow/factotum/master/samples/echo.factotum
{% endhighlight %}

This series of commands will download the 0.1.0 release, unzip it in your current working directory and download a sample job for you to run. You can then run Factotum in the following way:

{% highlight bash %}
factotum ./echo.factotum
{% endhighlight %}

## Writing jobs for Factotum

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

This example defines three tasks that run shell commands - *echo alpha*, *echo beta* and *echo omega*. *echo alpha* has no dependencies - it will run immediately.
*echo beta* depends on the completion of the *echo alpha* task, and so will wait for *echo alpha* to complete.
*echo omega* depends on the *echo beta* task, and so will wait for *echo beta* to be complete before executing.

Given the above, the tasks will be executed in the following sequence: *echo alpha*, *echo beta* and finally, *echo omega*. Tasks can have multiple dependencies in Factotum, and tasks that are parallelizable will be run concurrently.
Check out [the samples][job-samples] for more sample factfiles or the [wiki][factotum-wiki] for a more complete description of the factfile format.

<h2 id="roadmap">5. Roadmap / the future of Factotum</h2>

We're taking an iterative approach here - Factotum won't give you an entire stack for monitoring, scheduling and running data pipelines, but we want to grow it into a set of tools that will. Factotum will continue to be our "job executor", but a more complete ecosystem will be developed around it - in order to schedule jobs without cron, maintain an audit log,
ensure jobs are run by authenticated users and more. Our plan is to base all development on the principles we've laid out here - separation of concerns, plug and play compartmentalization and keeping jobs separate from schedules.

<h2 id="contributing">6. Contributing</h2>

Factotum is completely open source - and has been from the start. If you'd like to get involved, or just try your hand at Rust please check out the [repository][factotum-repo].
If you have any questions or need help getting started, take a look at [discourse][factotum-discourse].

[factotum-discourse]: http://discourse.snowplowanalytics.com/
[job-samples]: https://github.com/snowplow/factotum/tree/master/samples
[factotum-wiki]: https://github.com/snowplow/factotum/wiki
[snowplow-job-make]: http://snowplowanalytics.com/blog/2015/10/13/orchestrating-batch-processing-pipelines-with-cron-and-make/
[factotum-repo]: https://github.com/snowplow/factotum
[rust-lang]: https://www.rust-lang.org/
