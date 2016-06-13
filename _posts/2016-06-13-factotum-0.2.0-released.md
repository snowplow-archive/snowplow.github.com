---
layout: post
title: Factotum 0.2.0 released
title-short: Factotum 0.2.0
tags: [snowplow, rust, orchestration, dag, data engineering, jobs, tasks, factotum, pipeline]
author: Ed
category: Releases
---

We are pleased to announce release 0.2.0 of Snowplow's DAG running tool, [Factotum][factotum-repo]. This release introduces variables for jobs and the ability to start jobs from a given task.

In the rest of this post we will cover:

1. [Job configuration variables](/blog/2016/06/13/factotum-0.2.0-released#vars)
2. [Starting a job from a given task](/blog/2016/06/13/factotum-0.2.0-released#resumes)
3. [Output improvements](/blog/2016/06/13/factotum-0.2.0-released#output)
4. [Downloading and running Factotum](/blog/2016/06/13/factotum-0.2.0-released#install)
5. [Roadmap](/blog/2016/06/13/factotum-0.2.0-released#roadmap)
6. [Contributing](/blog/2016/06/13/factotum-0.2.0-released#contributing)

<!--more-->

<h2 id="vars">1. Job configuration variables</h2>

Jobs often contain per-run information such as a target hostname or IP address. In Factotum 0.1.0 it was only possible to set this information by editing the factfile manually. In Factotum 0.2.0, we provide the means to supply this information at run time through a job argument. Job configurations are free-form JSON and can contain arbitrarily complex information, which has a designated placeholder in the job specification.

Here's a quick example of how it works:

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.factotum/factfile/jsonschema/1-0-0",
  "data": {
    "name": "Variables demo",
    "tasks": [
      {
        "name": "Say something",
        "executor": "shell",
        "command": "echo",
        "arguments": [ "{% raw %}{{ message }}{% endraw %}" ],
        "dependsOn": [],
        "onResult": {
          "terminateJobWithSuccess": [],
          "continueJob": [ 0 ]
        }
      }
    ]
  }
}
{% endhighlight %}

Given the factfile above, you can see there's now a placeholder denoted with `{% raw %}{{ message }}{% endraw %}` inside the task's arguments. Passing a configuration JSON with a "message" field will now cause this tasks arguments to change to the supplied "message". You can supply this configuration using a new argument to Factotum, "-e" or "--env" followed with some JSON.

Check out this example, using the above factfile:

{% highlight bash %}
$ factotum samples/variables.factotum -e '{ "message": "hello world" }'
Task 'Say something' was started at 2016-06-12 21:04:02.274382495 UTC
Task 'Say something' stdout:
hello world
Task 'Say something': succeeded after 0.0s
1/1 tasks run in 0.0s
{% endhighlight %}

This functionality is built using the [mustache] [mustache-url] templating system - which we're making a standard for Factotum going forwards.

If you find it challenging to construct the JSON for your variables on the command-line, considering adding the excellent [jq] [jq] utility into your pipeline.

<h2 id="resumes">2. Starting a job from an arbitrary task</h2>

An unfortunate fact of life is that jobs occasionally fail part way through - for example, if your server loses network connectivity during a task. Factotum 0.2.0 includes functionality to (re)start a job from a given point, allowing you to
skip tasks that have already been run.

This functionality is provided using the "--start" (or "-s") command line option. Given the Factfile below:

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.factotum/factfile/jsonschema/1-0-0",
  "data": {
    "name": "echo order demo",
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

You can start from the "echo beta" task using the following:

{% highlight bash %}
$ factotum samples/echo.factotum --start "echo beta"
Task 'echo beta' was started at 2016-06-12 21:27:34.702377410 UTC
Task 'echo beta' stdout:
beta
Task 'echo beta': succeeded after 0.0s
Task 'echo omega' was started at 2016-06-12 21:27:34.704229360 UTC
Task 'echo omega' stdout:
and omega!
Task 'echo omega': succeeded after 0.0s
2/2 tasks run in 0.0s
{% endhighlight %}

Which skips the task "echo alpha", and starts from "echo beta". 

In more complicated DAGs, there are some tasks which cannot *currently* be the starting point for jobs. Resuming a job from such tasks would be ambiguous, typically because the DAG has parallel execution branches and a single start point does not tell Factotum enough about the start state of all of the branches.

For example, given the following DAG:

![dag resume diagram](/assets/img/blog/2016/06/dag_resume_factotum.png)

starting from "B" is not possible, as the dependant task "E" depends on "C". An error will be thrown if a user attempts to start from "B"; starting from the task "D", or "E" however is possible, if desired.

In a future release of Factotum we plan on letting a user start from any set of complete coordinates within the DAG (see [issue #54] [issue-54]).

<h2 id="output">3. Output improvements</h2>

You may have noticed from the previous examples that Factotum now provides a lot more information on job execution. The main changes are:

* Terminal colours can be switched off by setting the environment variable `CLICOLOR` to `0` (though we plan on moving this to a CLI argument command, see [issue #53] [issue-53])
* Task durations are now human-readable
* A summary of the number of tasks run is printed when the job finishes/terminates
* A task's output on `stdout` is only shown if the task produces output
* A task's output on `stderr` is printed to `stderr` again by the Factotum process (this can simplify capturing output from Factotum)
* Tasks now have their launch time displayed along with a tidied up summary of the result

This was based on feedback from using Factotum in production at Snowplow!

<h2 id="install">4. Downloading and running Factotum</h2>

Currently Factotum is only available for 64 bit Linux. Get it like so:

{% highlight bash %}
wget https://bintray.com/artifact/download/snowplow/snowplow-generic/factotum_0.2.0_linux_x86_64.zip
unzip factotum_0.2.0_linux_x86_64.zip
wget https://raw.githubusercontent.com/snowplow/factotum/master/samples/echo.factotum
{% endhighlight %}

This series of commands will download the 0.2.0 release, unzip it in your current working directory and download a sample job for you to run. You can then run Factotum in the following way:

{% highlight bash %}
factotum ./echo.factotum
{% endhighlight %}
 
<h2 id="roadmap">5. Roadmap for Factotum</h2>

We're taking an iterative approach with Factotum - today Factotum won't give you an entire stack for monitoring, scheduling and running data pipelines, but we plan on growing it into a set of tools that will.

Factotum will continue to be our "job executor", but a more complete ecosystem will be developed around it - ideas include an optional scheduler, audit logging, user authentication, Mesos support and more. If you have specific features to suggest, please [add a ticket] [factotum-issues] to the GitHub repo.

<h2 id="contributing">6. Contributing</h2>

Factotum is completely open source - and has been from the start! If you'd like to get involved, or just try your hand at Rust, please check out the [repository][factotum-repo].

[factotum-discourse]: http://discourse.snowplowanalytics.com/
[job-samples]: https://github.com/snowplow/factotum/tree/master/samples
[factotum-wiki]: https://github.com/snowplow/factotum/wiki
[snowplow-job-make]: http://snowplowanalytics.com/blog/2015/10/13/orchestrating-batch-processing-pipelines-with-cron-and-make/

[issue-53]: https://github.com/snowplow/factotum/issues/53
[issue-54]: https://github.com/snowplow/factotum/issues/54

[jq]: https://stedolan.github.io/jq/

[factotum-repo]: https://github.com/snowplow/factotum
[rust-lang]: https://www.rust-lang.org/
[mustache-url]: https://mustache.github.io/
[factotum-issues]: https://github.com/snowplow/factotum/issues/new
[factfile-schema]: http://iglucentral.com/schemas/com.snowplowanalytics.factotum/factfile/jsonschema/1-0-0
