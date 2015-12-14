---
layout: post
title: Spark Example Project 0.3.0 released for getting started with Apache Spark on EMR
title-short: Spark Example Project 0.3.0
tags: [snowplow, spark, emr, example, tutorial]
author: Alex
category: Releases
---

We are pleased to announce the release of our [Spark Example Project 0.3.0] [spark-repo], building on the [original release of the project] [010-release] last year.

This release is part of a renewed focus on the [Apache Spark] [spark] stack at Snowplow. In particular, we are exploring Spark's applicability to two Snowplow-specific problem domains:

1. Using Spark and [Spark Streaming] [spark-streaming] to implement [r64 Palila] [r64-release]-style data modeling outside of Redshift SQL
2. Using Spark Streaming to deliver "analytics-on-write" realtime dashboards as part of our Kinesis pipeline

Expect to see further releases, blog posts and tutorials from the Snowplow team on Apache Spark and Spark Streaming soon!

In the rest of this blog post we'll talk about:

1. [Spark 1.3.0 support](/blog/2015/05/10/spark-example-project-0.3.0-released/#130)
2. [Simplified Elastic MapReduce support](/blog/2015/05/10/spark-example-project-0.3.0-released/#emr)
3. [Automated job upload and running on EMR](/blog/2015/05/10/spark-example-project-0.3.0-released/#invoke)
4. [Getting help](/blog/2015/05/10/spark-example-project-0.3.0-released/#help)

<!--more-->

<div class="html">
<h2><a name="130">1. Spark 1.3.0 support</a></h2>
</div>

The project has been updated to [Spark 1.3.0] [spark-130], the most recent version of Spark supported on Amazon Elastic MapReduce. Many thanks to community member [Vincent Ohprecio] [bigsnarfdude] for contributing this upgrade!

<div class="html">
<h2><a name="emr">2. Simplified Elastic MapReduce support</a></h2>
</div>

When we worked on the Spark Example Project last year, getting it working in a non-interactive fashion was challenging: it involved a custom Bash script, and even then was restricted to a relatively old Spark version (0.8.x).

Since then, AWS's support for running Spark on Elastic MapReduce has evolved significantly, as part of the excellent open source [emr-bootstrap-actions] [emr-bootstrap-actions] initiative. This has enabled us to remove our custom Bash script, and bump our Spark support to 1.3.0 as above.

<div class="html">
<h2><a name="invoke">3. Automated job upload and running on EMR</a></h2>
</div>

At Snowplow we have been experimenting with a combination of [Invoke] [invoke] plus [Boto] [boto] to automate tasks around Amazon Web Services. Invoke is a Python task runner, and Boto is the official AWS library for Python (also underpinning the AWS CLI tools).

To make it easier to upload and run Spark jobs on Elastic MapReduce, we have created an Invoke [tasks.py] [tasks-py] file with two commands. The first is `upload`, which uploads the assembled fatjar and input data to Amazon S3:

{% highlight bash %}
inv upload aws-profile spark-example-project-bucket
{% endhighlight %}

The second command is `run_emr`, which executes the Spark job on Elastic MapReduce:

{% highlight bash %}
inv run_emr aws-profile spark-example-project-bucket ec2-keypair subnet-3dc2bd2a
{% endhighlight %}

As well as helping users to get started with the Spark Example Project, the new `tasks.py` file should be a good starting point for automating your own non-interactive Spark jobs on EMR.

<div class="html">
<h2><a name="help">4. Getting help</a></h2>
</div>

We hope you find [Spark Example Project] [spark-repo] useful. As always with releases from the Snowplow team, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

Stay tuned for more announcements from Snowplow about Spark and Spark Streaming in the future!

[010-release]: /blog/2014/04/17/spark-example-project-released
[r64-release]: /blog/2015/04/16/snowplow-r64-palila-released/
[spark-repo]: https://github.com/snowplow/spark-example-project

[spark]: https://spark.apache.org/
[spark-streaming]: https://spark.apache.org/streaming/
[spark-130]: https://spark.apache.org/releases/spark-release-1-3-0.html

[invoke]: http://www.pyinvoke.org/
[boto]: https://boto.readthedocs.org/en/latest/
[tasks-py]: https://github.com/snowplow/spark-example-project/blob/master/tasks.py

[bigsnarfdude]: https://github.com/bigsnarfdude

[emr-bootstrap-actions]: https://github.com/awslabs/emr-bootstrap-actions

[issues]: https://github.com/snowplow/spark-example-project/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
