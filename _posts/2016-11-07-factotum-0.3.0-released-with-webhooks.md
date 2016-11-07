---
layout: post
title: Factotum 0.3.0 released with webhooks
title-short: Factotum 0.3.0
tags: [snowplow, rust, orchestration, dag, data engineering, jobs, tasks, factotum, pipeline]
author: Ed
category: Releases
---

We're pleased to announce the 0.3.0 release of Snowplow's DAG running tool [Factotum][factotum-repo]! This release centers around making DAGs easier to create, monitor and
reason about, including adding outbound webhooks to Factotum.

In the rest of this post we will cover:

1. [Improving the workflow when creating DAGs](/blog/2016/11/07/factotum-0.3.0-released-with-webhooks#workflow)
2. [Improving job monitoring using webhooks](/blog/2016/11/07/factotum-0.3.0-released-with-webhooks#webhooks)
3. [Behaviors on task failure](/blog/2016/11/07/factotum-0.3.0-released-with-webhooks#taskfailure)
4. [Extras](/blog/2016/11/07/factotum-0.3.0-released-with-webhooks#extras)
5. [Downloading and running Factotum](/blog/2016/11/07/factotum-0.3.0-released-with-webhooks#install)
6. [Roadmap](/blog/2016/11/07/factotum-0.3.0-released-with-webhooks#roadmap)
7. [Contributing](/blog/2016/11/07/factotum-0.3.0-released-with-webhooks#contributing)

<!--more-->

<h2 id="workflow">1. Improving the workflow when creating DAGs</h2>

We've decided that to separate commands effectively, we needed to move to a "subcommand" style arguments system. For this reason, what was originally
`factotum <your factfile>` is now `factotum run <your factfile>`. All new features will follow this scheme.

The other improvements around workflow broadly fall into the following categories: factfile validation, dry runs and Graphviz dotfile exports. 
These are discussed in the following sections!

### Validating factfiles

Factfiles have always been schema'd and validated against the [factfile schema][factfile-schema]. It's not always convenient to locate 
this schema and ensure that the factfile you're working on is valid, so as of version 0.3.0 we've introduced a built-in validation command. This
includes checking that: your factfile is valid JSON; that it adheres to the JSON schema; and that each task can be executed. 

You can use it like this: 

```factotum validate <your factfile>```

If the factfile is valid, Factotum will respond:

```<your Factfile> is a valid Factotum Factfile!```

and if it's not, you'll get a message explaining the problem:

```<your Factfile> is not a valid Factotum Factfile: Invalid JSON at line 1 column 1```

### Dry runs

Validating a factfile ensures Factotum can process your job. Dry runs are a way to show how your job will be executed, including
a full output simulation.

Dry runs can be executed in the following way:

```factotum run <your factfile> --dry-run```

which, depending on the factfile will return something like this:

![sample Factotum dry run output](/assets/img/blog/2016/10/cropped_factotum_dry_run_large.png)

The `COMMAND` here is the real command Factotum will use to execute your task, which can be copy-pasted and run in a shell if desired.

### Graphviz dot output

For complicated DAGs, it's not always easy to tell the dependency tree from the text output of a program. That's why as of 0.3.0 Factotum supports
exporting your DAG as a [Graphviz dotfile][dot-format]. This export can be used to visualise your Factfile in any of [a number of programs][graphviz-renderers], 
or a [web based renderer][web-graphviz].

```factotum dot <your factfile> --output dag.dot```

This will build a dotfile representation of `<your Factfile>` and put the result in `dag.dot`. Here's what you can expect to see after you've rendered
this dotfile:

![sample "echo" dotfile graph](/assets/img/blog/2016/10/echo-dot-output.svg)

(I used the command `dot -Tsvg echo.dot -o echo-dot-output.svg` to generate this image, using the `graphviz` package in Ubuntu.)

<h2 id="webhooks">2. Improving job monitoring using webhooks</h2>

Data pipelines typically run on clusters, with a job or part of a job being assigned to one or more machines (which may or may not be virtual). It won't necessarily be known
in advance which box will run a specific job, or be straightforward to work out where a previous run was executed (or even if the box is still running).

This creates a problem unique to cluster-based software: how do I keep an auditable log of the jobs that have run, and how do I know which are currently running (and what they're doing)?

There are a number of ways to "bridge" applications which use traditional log files for cluster use, for example using NFS and a central "log store". However this solution isn't perfect, and
to make a log file really auditable it needs to be structured - a stream of unstructured messages is difficult to reason about (and query).

Many tools such as Airflow or Chronos would at this point bundle in MySQL or Postgres or Cassandra and use that to store state over time. This approach makes technical sense, but it does
create a new and opaque data silo within your organisation; all this information is hidden away somewhere, and liable to change format between releases.

We've chosen a different path based on [the Zen of Factotum][factotum-zen] and the idea that you should be able to depend on an abstraction rather than a specific implementation or tool. As of
release 0.3.0, Factotum now can emit [self describing events][self-describing-events] to a HTTP (or HTTPS) endpoint of your choice with the current state of the running job. This event is also suitable for ingesting
 into your existing Snowplow pipeline (though this is by no means required!).

### Running with webhooks

The new functionality can be run by adding the `--webhook <url>` option. For example:

```factotum run <your factfile> --webhook "http://my-endpoint.com"```

You can ingest these events into Snowplow using the [Iglu webhook adapter POST support (requires R83+)][iglu-post-support]:

```factotum run <your factfile> --webhook "https://my-snowplow-collector.com/com.snowplowanalytics.iglu/v1"```

### When updates are sent

Updates are split into two different event types. The first is triggered when the state of the job changes, for example when the job is started or finished. 
The second is when the state of a specific task changes - for example, when a task is started or failed.

### Update format

Job updates are described by [com.snowplowanalytics.factotum/job_update/jsonschema/1-0-0] [job-update-schema] events, available in Iglu Central.

Here's an example of a job update:

{% highlight JSON %}
{
    "schema": "iglu:com.snowplowanalytics.factotum/job_update/jsonschema/1-0-0",
    "data": {
        "applicationContext": {
            "name": "factotum",
            "version": "0.3.0"
        },
        "factfile": "ewogICAgInNjaGVtYSI6ICJpZ2x1OmNvbS5zbm93cGxvd2FuYWx5dGljcy5mYWN0b3R1bS9mYWN0ZmlsZS9qc29uc2NoZW1hLzEtMC0wIiwKICAgICJkYXRhIjogewogICAgICAgICJuYW1lIjogImVjaG8gb3JkZXIgZGVtbyIsCiAgICAgICAgInRhc2tzIjogWwogICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAibmFtZSI6ICJlY2hvIGFscGhhIiwKICAgICAgICAgICAgICAgICJleGVjdXRvciI6ICJzaGVsbCIsCiAgICAgICAgICAgICAgICAiY29tbWFuZCI6ICJlY2hvIiwKICAgICAgICAgICAgICAgICJhcmd1bWVudHMiOiBbICJhbHBoYSIgXSwKICAgICAgICAgICAgICAgICJkZXBlbmRzT24iOiBbXSwKICAgICAgICAgICAgICAgICJvblJlc3VsdCI6IHsKICAgICAgICAgICAgICAgICAgICAidGVybWluYXRlSm9iV2l0aFN1Y2Nlc3MiOiBbIDMgXSwKICAgICAgICAgICAgICAgICAgICAiY29udGludWVKb2IiOiBbIDAgXQogICAgICAgICAgICAgICAgfQogICAgICAgICAgICB9LAogICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAibmFtZSI6ICJlY2hvIGJldGEiLAogICAgICAgICAgICAgICAgImV4ZWN1dG9yIjogInNoZWxsIiwKICAgICAgICAgICAgICAgICJjb21tYW5kIjogImVjaG8iLAogICAgICAgICAgICAgICAgImFyZ3VtZW50cyI6IFsgImJldGEiIF0sCiAgICAgICAgICAgICAgICAiZGVwZW5kc09uIjogWyAiZWNobyBhbHBoYSIgXSwKICAgICAgICAgICAgICAgICJvblJlc3VsdCI6IHsKICAgICAgICAgICAgICAgICAgICAidGVybWluYXRlSm9iV2l0aFN1Y2Nlc3MiOiBbIDMgXSwKICAgICAgICAgICAgICAgICAgICAiY29udGludWVKb2IiOiBbIDAgXQogICAgICAgICAgICAgICAgfQogICAgICAgICAgICB9LAogICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAibmFtZSI6ICJlY2hvIG9tZWdhIiwKICAgICAgICAgICAgICAgICJleGVjdXRvciI6ICJzaGVsbCIsCiAgICAgICAgICAgICAgICAiY29tbWFuZCI6ICJlY2hvIiwKICAgICAgICAgICAgICAgICJhcmd1bWVudHMiOiBbICJhbmQgb21lZ2EhIiBdLAogICAgICAgICAgICAgICAgImRlcGVuZHNPbiI6IFsgImVjaG8gYmV0YSIgXSwKICAgICAgICAgICAgICAgICJvblJlc3VsdCI6IHsKICAgICAgICAgICAgICAgICAgICAidGVybWluYXRlSm9iV2l0aFN1Y2Nlc3MiOiBbIDMgXSwKICAgICAgICAgICAgICAgICAgICAiY29udGludWVKb2IiOiBbIDAgXQogICAgICAgICAgICAgICAgfQogICAgICAgICAgICB9CiAgICAgICAgXQogICAgfQp9Cg==",
        "jobName": "echo order demo",
        "jobReference": "69d3b6cea7c85404060d7974466cf269fd719ba97cf2781b8c90cb2ea5594908",
        "jobTransition": {
            "currentState": "SUCCEEDED",
            "previousState": "RUNNING"
        },
        "runDuration": "PT2.144857905S",
        "runReference": "bd575102a6dd3669e79bfa92a64c9d750c4d0f59ef4f7281e715f109d623d0b5",
        "runState": "SUCCEEDED",
        "startTime": "2016-10-20T19:59:50.256Z",
        "tags": {
            "foo": "bar",
            "foo2": "bar2"
        },
        "taskStates": [
            {
                "duration": "PT0.002363397S",
                "returnCode": 0,
                "started": "2016-10-20T19:59:50.256Z",
                "state": "SUCCEEDED",
                "stdout": "alpha",
                "taskName": "echo alpha"
            },
            {
                "duration": "PT0.001529858S",
                "returnCode": 0,
                "started": "2016-10-20T19:59:50.260Z",
                "state": "SUCCEEDED",
                "stdout": "beta",
                "taskName": "echo beta"
            },
            {
                "duration": "PT0.002031825S",
                "returnCode": 0,
                "started": "2016-10-20T19:59:50.262Z",
                "state": "SUCCEEDED",
                "stdout": "and omega!",
                "taskName": "echo omega"
            }
        ]
    }
}
{% endhighlight %}

Task updates are described by [com.snowplowanalytics.factotum/task_update/jsonschema/1-0-0] [task-update-schema] events, also available in Iglu Central.

Here's an example of a task update:

{% highlight JSON %}
{
    "schema": "iglu:com.snowplowanalytics.factotum/task_update/jsonschema/1-0-0",
    "data": {
        "applicationContext": {
            "name": "factotum",
            "version": "0.3.0"
        },
        "factfile": "ewogICAgInNjaGVtYSI6ICJpZ2x1OmNvbS5zbm93cGxvd2FuYWx5dGljcy5mYWN0b3R1bS9mYWN0ZmlsZS9qc29uc2NoZW1hLzEtMC0wIiwKICAgICJkYXRhIjogewogICAgICAgICJuYW1lIjogImVjaG8gb3JkZXIgZGVtbyIsCiAgICAgICAgInRhc2tzIjogWwogICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAibmFtZSI6ICJlY2hvIGFscGhhIiwKICAgICAgICAgICAgICAgICJleGVjdXRvciI6ICJzaGVsbCIsCiAgICAgICAgICAgICAgICAiY29tbWFuZCI6ICJlY2hvIiwKICAgICAgICAgICAgICAgICJhcmd1bWVudHMiOiBbICJhbHBoYSIgXSwKICAgICAgICAgICAgICAgICJkZXBlbmRzT24iOiBbXSwKICAgICAgICAgICAgICAgICJvblJlc3VsdCI6IHsKICAgICAgICAgICAgICAgICAgICAidGVybWluYXRlSm9iV2l0aFN1Y2Nlc3MiOiBbIDMgXSwKICAgICAgICAgICAgICAgICAgICAiY29udGludWVKb2IiOiBbIDAgXQogICAgICAgICAgICAgICAgfQogICAgICAgICAgICB9LAogICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAibmFtZSI6ICJlY2hvIGJldGEiLAogICAgICAgICAgICAgICAgImV4ZWN1dG9yIjogInNoZWxsIiwKICAgICAgICAgICAgICAgICJjb21tYW5kIjogImVjaG8iLAogICAgICAgICAgICAgICAgImFyZ3VtZW50cyI6IFsgImJldGEiIF0sCiAgICAgICAgICAgICAgICAiZGVwZW5kc09uIjogWyAiZWNobyBhbHBoYSIgXSwKICAgICAgICAgICAgICAgICJvblJlc3VsdCI6IHsKICAgICAgICAgICAgICAgICAgICAidGVybWluYXRlSm9iV2l0aFN1Y2Nlc3MiOiBbIDMgXSwKICAgICAgICAgICAgICAgICAgICAiY29udGludWVKb2IiOiBbIDAgXQogICAgICAgICAgICAgICAgfQogICAgICAgICAgICB9LAogICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAibmFtZSI6ICJlY2hvIG9tZWdhIiwKICAgICAgICAgICAgICAgICJleGVjdXRvciI6ICJzaGVsbCIsCiAgICAgICAgICAgICAgICAiY29tbWFuZCI6ICJlY2hvIiwKICAgICAgICAgICAgICAgICJhcmd1bWVudHMiOiBbICJhbmQgb21lZ2EhIiBdLAogICAgICAgICAgICAgICAgImRlcGVuZHNPbiI6IFsgImVjaG8gYmV0YSIgXSwKICAgICAgICAgICAgICAgICJvblJlc3VsdCI6IHsKICAgICAgICAgICAgICAgICAgICAidGVybWluYXRlSm9iV2l0aFN1Y2Nlc3MiOiBbIDMgXSwKICAgICAgICAgICAgICAgICAgICAiY29udGludWVKb2IiOiBbIDAgXQogICAgICAgICAgICAgICAgfQogICAgICAgICAgICB9CiAgICAgICAgXQogICAgfQp9Cg==",
        "jobName": "echo order demo",
        "jobReference": "69d3b6cea7c85404060d7974466cf269fd719ba97cf2781b8c90cb2ea5594908",
        "runDuration": "PT1.898637649S",
        "runReference": "bd575102a6dd3669e79bfa92a64c9d750c4d0f59ef4f7281e715f109d623d0b5",
        "runState": "RUNNING",
        "startTime": "2016-10-20T19:59:50.256Z",
        "tags": {
            "foo": "bar",
            "foo2": "bar2"
        },
        "taskStates": [
            {
                "duration": "PT0.002363397S",
                "returnCode": 0,
                "started": "2016-10-20T19:59:50.256Z",
                "state": "SUCCEEDED",
                "stdout": "alpha",
                "taskName": "echo alpha"
            },
            {
                "duration": "PT0.001529858S",
                "returnCode": 0,
                "started": "2016-10-20T19:59:50.260Z",
                "state": "SUCCEEDED",
                "stdout": "beta",
                "taskName": "echo beta"
            },
            {
                "duration": "PT0.002031825S",
                "returnCode": 0,
                "started": "2016-10-20T19:59:50.262Z",
                "state": "SUCCEEDED",
                "stdout": "and omega!",
                "taskName": "echo omega"
            }
        ],
        "taskTransitions": [
            {
                "currentState": "SUCCEEDED",
                "previousState": "RUNNING",
                "taskName": "echo omega"
            }
        ]
    }
}
{% endhighlight %}

Both events share many common fields. A description of all the fields in both events is given below (split up into fields common to both events, and then those specifically
in task updates and job updates).

#### Common Fields

<table class="table table-border">
  <thead>
    <tr>
      <th style="text-align: left">Field</th>
      <th style="text-align: center">Required</th>
      <th style="text-align: left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align: left"><code>schema</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">Self describing event wrapper</td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">Self describing event wrapper</td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.jobName</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">The name of the job, as it appears in the Factfile</td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.jobReference</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">An ID unique to the Factfile for this job. If you’re using <a href="#user-defined-tags">user defined tags</a>, jobs with the same Factfile and differing tags <em>will have different job IDs as tags are included when calculating job IDs</em>.</td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.runReference</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">A globally unique ID for this run</td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.tags</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">An object representing any <a href="#user-defined-tags">user defined tags</a> for the running job</td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.factfile</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">A base64 encoded copy of the Factfile that’s running</td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.applicationContext.version</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">The version of Factotum that’s executing the job</td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.runState</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">The current state of the job. This can be <code>WAITING</code>,<code>RUNNING</code>,<code>SUCCEEDED</code> or <code>FAILED</code></td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.startTime</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">The time the job started, in ISO8601 format</td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.runDuration</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">The running time of the job so far in ISO8601 duration format</td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.taskStates</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">An array of information on the state of each task</td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.taskStates[_].taskName</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">The name of the task, as it appears in the Factfile</td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.taskStates[_].state</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">The current state of the task. This can be <code>WAITING</code>,<code>RUNNING</code>,<code>SUCCEEDED</code>, <code>SUCCEEDED_NO_OP</code>, <code>FAILED</code> or <code>SKIPPED</code></td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.taskStates[_].started</code></td>
      <td style="text-align: center">No</td>
      <td style="text-align: left">Optional. The ISO8601 start time of the task</td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.taskStates[_].duration</code></td>
      <td style="text-align: center">No</td>
      <td style="text-align: left">Optional. The ISO8601 duration of the task</td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.taskStates[_].stdout</code></td>
      <td style="text-align: center">No</td>
      <td style="text-align: left">Optional. The output of the task to <code>stdout</code></td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.taskStates[_].stderr</code></td>
      <td style="text-align: center">No</td>
      <td style="text-align: left">Optional. The output of the task to <code>stderr</code></td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.taskStates[_].returnCode</code></td>
      <td style="text-align: center">No</td>
      <td style="text-align: left">Optional. The return code of the task</td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.taskStates[_].errorMessage</code></td>
      <td style="text-align: center">No</td>
      <td style="text-align: left">Optional. The reason the task failed, or was skipped</td>
    </tr>
  </tbody>
</table>

#### Job transitions

**job_update** events have the following extra fields that provide information about the current state of the job.

<table class="table table-border">
  <thead>
    <tr>
      <th style="text-align: left">Field</th>
      <th style="text-align: center">Required</th>
      <th style="text-align: left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align: left"><code>data.jobTransition</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">An object explaining the reason this event was emitted</td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.jobTransition.previousState</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">The state of the job prior to the change occurring. This can be <code>WAITING</code>,<code>RUNNING</code>,<code>SUCCEEDED</code>, <code>FAILED</code> or null (if the job has started).</td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.jobTransition.currentState</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">The state of the job after the change has occurred. This can be <code>WAITING</code>,<code>RUNNING</code>,<code>SUCCEEDED</code>, or <code>FAILED</code>.</td>
    </tr>
  </tbody>
</table>

#### Task transitions

**task_update** events have the following extra fields that provide information about the changes in state of tasks.

<table class="table table-border">
  <thead>
    <tr>
      <th style="text-align: left">Field</th>
      <th style="text-align: center">Required</th>
      <th style="text-align: left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align: left"><code>data.taskTransitions[_]</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">An array of task level changes in execution. Each element represents the change in state for a single task</td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.taskTransitions[_].taskName</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">The name of the task that has changed state (as it appears in the Factfile).</td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.taskTransitions[_].previousState</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">The state the given task was previously in. This can be <code>RUNNING</code>, <code>WAITING</code>, <code>SUCCEEDED</code>,<code>SUCCEEDED_NO_OP</code>, <code>FAILED</code>, or <code>SKIPPED</code></td>
    </tr>
    <tr>
      <td style="text-align: left"><code>data.taskTransitions[_].currentState</code></td>
      <td style="text-align: center">Yes</td>
      <td style="text-align: left">The state the given task is now in. This can be <code>RUNNING</code>, <code>WAITING</code>, <code>SUCCEEDED</code>,<code>SUCCEEDED_NO_OP</code>, <code>FAILED</code>, or <code>SKIPPED</code>. More information on the current state of the task may be available in the <code>taskStates</code> field.</td>
    </tr>
  </tbody>
</table>


## <a name="user-defined-tags"></a>Tags

Tags are a way to add custom meta-data to your job runs. You can add any set of key-value pairs to your jobs - when using webhooks they'll have the following effects:

1. Appear in all webhook events under the `tags` field
2. Be used in addition to the Factfile itself to calculate the job reference
   * This means that the same Factfile can generate two or more different job references if required

In both events, custom tags look like this:

{% highlight JSON %}
        "tags": {
            "foo": "bar",
            "foo2": "bar2"
        },
{% endhighlight %}

You can add tags to your job with the ``--tag`` argument. To add the `foo` tag with the value `bar`:

```factotum run samples/echo.factotum --webhook http://localhost --tag "foo,bar"```

Multiple tags can be added by repeating the argument:

```factotum run samples/echo.factotum --webhook http://localhost --tag "foo,bar" --tag "foo2,bar2"```

<h2 id="taskfailure">3. Behaviors on task failure</h2>

## Fail fast vs continue as far as possible

In previous releases of Factotum, when a task fails Factotum will stop processing your job as soon as possible. We call this behaviour "failing fast"; this is the default behavior of Make too (without the `--keep-going` flag being enabled). Failing fast is simple and predictable, however it often results in a lot of tasks that could have been run to not run at all. It's also difficult to reason about, because the final state of the DAG depends not just on which tasks failed, but how long different tasks ran for. 

That's why as of this release, we're switching to a different model. Factotum will now "keep going" and complete as many tasks as possible, with the tasks that depend on failing tasks
being the only ones which are skipped.

Here's a few diagrams cataloguing the difference in behavior. On the left is the previous version(s) of Factotum, and on the right is version 0.3.0+:

<hr>

<div style="width: 100%; display: table;" align="center">
    <div style="display: table-row">
        <div style="display: table-cell;"> <h4>Factotum 0.2.0</h4>  <img src="/assets/img/blog/2016/10/factotum_dag_simple_old.svg" alt="no change in simple dags old"> </div>
        <div style="display: table-cell;"> <h4>Factotum 0.3.0+</h4> <img src="/assets/img/blog/2016/10/factotum_dag_simple_new.svg" alt="no change in simple dags new"> </div>
    </div>
</div>

In trivial DAGs (as shown above) the behavior between this version of Factotum and prior versions is the same.

<hr>

<div style="width: 100%; display: table;" align="center">
    <div style="display: table-row">
        <div style="display: table-cell;"> <h4>Factotum 0.2.0</h4>  <img src="/assets/img/blog/2016/10/factotum_dag_example_old.svg" alt="the change in dags old"> </div>
        <div style="display: table-cell;"> <h4>Factotum 0.3.0+</h4> <img src="/assets/img/blog/2016/10/factotum_dag_example_new.svg" alt="the change in dags new"> </div>
    </div>
</div>

In DAGs with multiple dependency trees, in prior versions Factotum would stop as soon as possible (left). In this version Factotum will complete as much as possible (right).

<hr>

<div style="width: 100%; display: table;" align="center">
    <div style="display: table-row">
        <div style="display: table-cell;"> <h4>Factotum 0.2.0</h4>  <img src="/assets/img/blog/2016/10/factotum_dag_complex_old.svg" alt="the change in complex dags old"> </div>
        <div style="display: table-cell;"> <h4>Factotum 0.3.0+</h4> <img src="/assets/img/blog/2016/10/factotum_dag_complex_new.svg" alt="the change in complex dags new"> </div>
    </div>   
</div>

When DAGs split into parallel streams of execution, any sub-task that eventually depends on a failed task will now be skipped (right), compared to terminating at the first failure (prior versions, left).

<hr>

### Terminating early

A task that requests early DAG termination has always worked in the same way as failures (except that it's not a failure!).

To keep things straightforward, we've also altered how "no operations" work in version 0.3.0 to match the new way of handling task failures (shown [above](#taskfailure)). They will continue to
"skip" subsequent tasks without generating an error.

<h2 id="extras">4. Extras</h2>

### macOS support

Factotum 0.3.0 now ships an macOS version. You can see how to get a copy [here](#install)!

### Turning off terminal colours with --no-colours

Colours aren't for everyone, and they can be distracting if you're piping data to a file (or another source that doesn't understand colour codes). In version 0.2.0 
we introduced support for the `CLICOLOR` environment variable (as described [here][cli-color-variable]). In this release we're complementing that with a command
line argument `--no-colour` that forces ANSI terminal colours to be turned off. 

### Eating our own dog food

Factotum is now released using Factotum! This means you can see a real example of using a Factfile [here][factfile-deploy], including an example of "terminating early" and how
it applies to builds.

<h2 id="install">5. Downloading and running Factotum</h2>

Factotum is now available for macOS and Linux (x86_64).

If you're running Linux:

```
wget https://bintray.com/artifact/download/snowplow/snowplow-generic/factotum_0.3.0_linux_x86_64.zip
unzip factotum_0.3.0_linux_x86_64.zip
wget https://raw.githubusercontent.com/snowplow/factotum/master/samples/echo.factotum
```

If you're running macOS:

```
wget https://bintray.com/artifact/download/snowplow/snowplow-generic/factotum_0.3.0_darwin_x86_64.zip
unzip factotum_0.3.0_darwin_x86_64.zip
wget https://raw.githubusercontent.com/snowplow/factotum/master/samples/echo.factotum
```

This series of commands will download the 0.3.0 release, unzip it in your current working directory and download a sample job for you to run. You can then run Factotum in the following way:

```./factotum run ./echo.factotum```

<h2 id="roadmap">6. Roadmap for Factotum</h2>

We’re taking an iterative approach with Factotum - today Factotum won’t give you an entire stack for monitoring, scheduling and running data pipelines, but we plan on growing it into a set of tools that will.

Factotum will continue to be our “job executor”, but a more complete ecosystem will be developed around it - ideas include an optional scheduler, audit logging, user authentication, Mesos support and more. If you have specific features to suggest, [please add a ticket to the GitHub repo][factotum-issues].

<h2 id="contributing">7. Contributing</h2>

Factotum is completely open source - and has been from the start! If you’d like to get involved, or just try your hand at Rust, please check out [the repository][factotum-repo].

[factfile-schema]: http://iglucentral.com/schemas/com.snowplowanalytics.factotum/factfile/jsonschema/1-0-0
[dot-format]: https://en.wikipedia.org/wiki/DOT_(graph_description_language)
[graphviz-renderers]: https://en.wikipedia.org/wiki/DOT_(graph_description_language)#Layout_programs
[web-graphviz]: http://www.webgraphviz.com/
[factotum-zen]: http://snowplowanalytics.com/blog/2016/04/09/introducing-factotum-data-pipeline-runner/#zen
[self-describing-events]: http://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/#sdj
[job-update-schema]: http://iglucentral.com/schemas/com.snowplowanalytics.factotum/job_update/jsonschema/1-0-0
[task-update-schema]: http://iglucentral.com/schemas/com.snowplowanalytics.factotum/task_update/jsonschema/1-0-0
[cli-color-variable]: http://bixense.com/clicolors/
[factfile-deploy]: https://github.com/snowplow/factotum/blob/master/.travis/deploy/deploy.factfile
[factotum-issues]: https://github.com/snowplow/factotum/issues/new
[factotum-repo]: https://github.com/snowplow/factotum
[iglu-post-support]: http://snowplowanalytics.com/blog/2016/09/06/snowplow-r83-bald-eagle-released-with-sql-query-enrichment/#iglu-post
