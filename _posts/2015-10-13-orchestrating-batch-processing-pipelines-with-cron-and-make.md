---
layout: post
title: "Orchestrating batch processing pipelines with cron and make"
title-short: "Orchestrating batch processing pipelines with cron and make"
tags: [cron, make, orchestration, pipeline, etl]
author: Alex
category: Inside the Plow
---

At Snowplow we are often asked how best to orchestrate multi-stage ETL pipelines, where these pipelines typically include [Snowplow] [snowplow] and our [SQL Runner] [sql-runner], sometimes [Huskimo] [huskimo] and often third-party apps and scripts.

There is a wide array of tools available for this kind of orchestration, including [AWS Data Pipeline] [aws-data-pipeline], [Luigi] [luigi], [Chronos] [chronos], [Jenkins] [jenkins] and [Airflow] [airflow]. These tools tend to have the following two capabilities:

1. A job-scheduler, which determines when each batch processing job will run
2. A DAG-runner, which can treat a job as a [directed acyclic graph] [dag] of inter-dependent steps and run those steps in the correct order 

Make no mistake - these are powerful tools which let you orchestrate sophisticated batch processing pipelines. But with that power comes complexity, and operating these systems reliably is not always straightforward - for example see [Kyle Kingsbury's recent testing of Chronos] [aphyr-chronos], where he wrote:

<blockquote>
If you already use Chronos, I suggest you... ensure your jobs are OK with never being run at all
</blockquote>

If you are just starting out building your first batch processing pipeline, consider a much simpler approach: combining the standard Unix tools `cron` and `make` to orchestrate your jobs. This blog post walks you through this approach:

1. [Introducing our batch pipeline](/blog/2015/10/13/orchestrating-batch-processing-pipelines-with-cron-and-make#pipeline)
2. [Defining our job's DAG in make](/blog/2015/10/13/orchestrating-batch-processing-pipelines-with-cron-and-make#make)
3. [Running our Makefile](/blog/2015/10/13/orchestrating-batch-processing-pipelines-with-cron-and-make#running)
4. [Scheduling our Makefile in cron](/blog/2015/10/13/orchestrating-batch-processing-pipelines-with-cron-and-make#cron)
5. [Handling job failures](/blog/2015/10/13/orchestrating-batch-processing-pipelines-with-cron-and-make#failures)
6. [Conclusion](/blog/2015/10/13/orchestrating-batch-processing-pipelines-with-cron-and-make#conclusion)

<!--more-->

<h2 id="pipeline">Introducing our batch pipeline</h2>

Let's imagine that we need to setup a batch-processing pipeline with the following components:

* Amazon SNS notifications at the start and (successful) end of each run
* Our EmrEtlRunner and StorageLoader applications to run Snowplow on EMR and load into Redshift
* Our Huskimo project to extract marketing spend data from Singular
* Some data modeling performed in Redshift using our SQL Runner app

We'll assume that the SQL data modeling is dependent on both our Snowplow load and our Huskimo run. Putting all this together, we end up with a processing graph which looks like this:

![job-sketch] [job-sketch]

We're now going to express this DAG in a Makefile ready for Make.

<h2 id="make">Defining our job's DAG in make</h2>

Make is a software build tool first released in 1977. It uses files called Makefiles to specify how to build the target program. A Makefile lets you specify tasks that contribute to the build, and express dependencies between these tasks, forming a directed acyclic graph.

Because the tasks in a Makefile are just shell commands, we can use `make` to orchestrate a batch processing pipeline, as long as each individual step in the pipeline is invokable from a shell.

Here's the Makefile for our job, `example-dag.makefile` with a simple `echo` to represent each task, plus some `sleep`s to make it easier to see what is going on when we run it:

{% highlight makefile %}
done: send-completed-sns

send-starting-sns:
	echo "Sending SNS for job starting" && sleep 5
snowplow-emr-etl-runner: send-starting-sns
	echo "Running Snowplow EmrEtlRunner" && sleep 5
snowplow-storage-loader: snowplow-emr-etl-runner
	echo "Running Snowplow StorageLoader" && sleep 5
huskimo: send-starting-sns
	echo "Running Huskimo" && sleep 2
sql-runner: snowplow-storage-loader huskimo
	echo "Running data models" && sleep 5
send-completed-sns: sql-runner
	echo "Sending SNS for job completion" && sleep 2
{% endhighlight %}

By default Make will attempt to build the first rule found in the supplied Makefile - I like to call the first rule `done` and make it dependent on the last task in our DAG. You can see that the rest of our rules consist of:

1. A name or "target"
2. One or more dependencies on other targets, after the `:`
3. The shell command to run, on a tab-indented newline

To learn a lot more about the Makefile syntax, check out the [GNU make manual] [make-docs].

Let's visualize this Makefile, using the [makefile2dot] [makefile2dot] Python script:

{% highlight bash %}
$ sudo apt-get install graphviz python
...
$ sudo wget https://raw.githubusercontent.com/vak/makefile2dot/master/makefile2dot.py
...
$ python makefile2dot.py <example-dag.makefile |dot -Tpng > example-dag.png
{% endhighlight %}

Here is the generated diagram:

![job-makefile] [job-makefile]

The DAG flows bottom-to-top, which is a little quirky - it reflects the fact that Makefiles normally create a target which is built *on top of* multiple intermediate files.

<h2 id="running">Running our Makefile</h2>

Now that we have our Makefile, we need to run it! Here is the command we'll use, together with the output:

{% highlight bash %}
$ make -k -j -f example-dag.makefile
echo "Sending SNS for job starting" && sleep 5
Sending SNS for job starting
echo "Running Snowplow EmrEtlRunner" && sleep 5
echo "Running Huskimo" && sleep 2
Running Snowplow EmrEtlRunner
Running Huskimo
echo "Running Snowplow StorageLoader" && sleep 5
Running Snowplow StorageLoader
echo "Running data models" && sleep 5
Running data models
echo "Sending SNS for job completion" && sleep 2
Sending SNS for job completion
{% endhighlight %}

In reverse order, our command line arguments to `make` are as follows:

* `-f` specifies the Makefile to run (otherwise the default is `Makefile` in the current directory)
* `-j` lets Make run with as much parallelism as is needed - so that our Huskimo and Snowplow tasks can run at the same time
* `-k` means "keep going" through the DAG as far as possible - so for example, even if Huskimo fails, we can still complete the Snowplow tasks before failing the overall job

<h2 id="cron">Scheduling our Makefile in cron</h2>

So `make` has given us the DAG component of our orchestration problem - what about the scheduling aspect? For this, we can simply use [Cron] [cron].

Edit your crontab:

{% highlight bash %}
$ crontab -e
{% endhighlight %}

And add an entry to run our Makefile every morning at 3am UTC:

{% highlight bash %}
0 3            * * *   make -k -j -f example-dag.makefile
{% endhighlight %}

And that's it! We now have our DAG scheduled to run nightly.

<h2 id="failures">Handling job failures</h2>

Our job will fail if one or more of the steps fails - meaning that a shell command in the step returns a non-zero code.

Let's simulate a failure with the following `failing-dag.makefile` - note the `exit 1` under the StorageLoader rule:

{% highlight makefile %}
done: send-completed-sns

send-starting-sns:
	echo "Sending SNS for job starting" && sleep 5
snowplow-emr-etl-runner: send-starting-sns
	echo "Running Snowplow EmrEtlRunner" && sleep 5
snowplow-storage-loader: snowplow-emr-etl-runner
	echo "Running Snowplow StorageLoader - BROKEN" && exit 1
huskimo: send-starting-sns
	echo "Running Huskimo" && sleep 2
sql-runner: snowplow-storage-loader huskimo
	echo "Running data models" && sleep 5
send-completed-sns: sql-runner
	echo "Sending SNS for job completion" && sleep 2
{% endhighlight %}

Let's run this:

{% highlight bash %}
$ make -k -j -f failing-dag.makefile
echo "Sending SNS for job starting" && sleep 5
Sending SNS for job starting
echo "Running Snowplow EmrEtlRunner" && sleep 5
echo "Running Huskimo" && sleep 2
Running Snowplow EmrEtlRunner
Running Huskimo
echo "Running Snowplow StorageLoader - BROKEN" && exit 1
Running Snowplow StorageLoader - BROKEN
make: *** [snowplow-storage-loader] Error 1
make: Target `done' not remade because of errors.
{% endhighlight %}

Make has faithfully reported our failure! So how do we recover from this? Typically we will:

1. Fix the underlying problem
2. Resume the failed DAG either from the failed step, or from the step immediately after the failed step

Some of the orchestration tools in this post's introduction make this recovery process quite straightforward - things are a little more complex with our `make`-based approach.

The first thing we need to remember is that we are running with the `-k` flag, meaning that processing *kept going post-failure*, continuing to run steps on any branches of the DAG which were not (yet) dependent on the failing step.

This behavior makes it much easier to reason about our job failure. We don't have to worry about what was running at the exact time of step failure; instead we just review the DAG to see which steps cannot have run:

![failure-sketch] [failure-sketch]

When troubleshooting a job failure, always review the Make error output carefully to make sure that there weren't in fact failures in multiple branches of the DAG!

With this done, we can now produce a scratch Makefile just for the job resumption, `resume-dag.makefile`:

{% highlight makefile %}
done: send-completed-sns

snowplow-storage-loader:
	echo "Running Snowplow StorageLoader - FIXED"
sql-runner: snowplow-storage-loader
	echo "Running data models" && sleep 5
send-completed-sns: sql-runner
	echo "Sending SNS for job completion" && sleep 2
{% endhighlight %}

Note how we removed all the completed steps, and removed dangling references to the completed steps in the dependencies of the outstanding steps.

A quick visualization of this Makefile:

{% highlight bash %}
$ python makefile2dot.py <resume-dag.makefile |dot -Tpng > resume-dag.png
{% endhighlight %}

Here is the now much simpler DAG:

![resume-makefile] [resume-makefile]

Finally let's run this:

{% highlight bash %}
$ make -k -j -f resume-dag.makefile
echo "Running Snowplow StorageLoader - FIXED"
Running Snowplow StorageLoader - FIXED
echo "Running data models" && sleep 5
Running data models
echo "Sending SNS for job completion" && sleep 2
Sending SNS for job completion
{% endhighlight %}

Great - we've now completed our recovery from the job failure.

<h2 id="conclusion">Conclusion</h2>

This blog post has shown how you can use simple tools, `make` and `cron`, to orchestrate complex batch processing jobs.

The Makefile-based approach is simple, some might say crude - it certainly doesn't have all the bells and whistles of a tool like Chronos or Airflow. However, this approach has many fewer failure states and it can be much easier to reason about and resolve job failures.

Even if you plan on implementing a full-blown distributed orchestration tool, it can be worth prototyping new jobs using something as simple as Make - give it a go and let us know your thoughts in the comments!

[snowplow]: http://snowplowanalytics.com/
[huskimo]: https://github.com/snowplow/huskimo
[sql-runner]: https://github.com/snowplow/sql-runner

[aws-data-pipeline]: https://aws.amazon.com/datapipeline/
[luigi]: https://github.com/spotify/luigi
[airflow]: http://nerds.airbnb.com/airflow/
[chronos]: https://github.com/mesos/chronos
[aphyr-chronos]: https://aphyr.com/posts/326-call-me-maybe-chronos
[jenkins]: https://jenkins-ci.org/

[dag]: https://en.wikipedia.org/wiki/Directed_acyclic_graph
[make]: http://www.gnu.org/software/make/
[make-docs]: http://www.gnu.org/software/make/manual/make.html
[makefile2dot]: https://github.com/vak/makefile2dot

[cron]: https://en.wikipedia.org/wiki/Cron

[job-sketch]: /assets/img/blog/2015/10/job-sketch.jpg
[job-makefile]: /assets/img/blog/2015/10/example-dag.png
[failure-sketch]: /assets/img/blog/2015/10/failure-sketch.jpg
[resume-makefile]:/assets/img/blog/2015/10/resume-dag.png

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
