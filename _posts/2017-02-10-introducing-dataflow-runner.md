---
layout: post
title: "Introducing Dataflow Runner"
title-short: Dataflow Runner 0.1.0
tags: [snowplow, golang, orchestration, emr]
author: Josh
category: Releases
---

We are pleased to announce the release of [Dataflow Runner] [dataflow-runner-repo], a new open-source system for the creation and running of [AWS EMR][aws-emr] jobflow clusters and steps. Big thanks to Snowplow intern [Manoj Rajandrakumar][manoj] for all of his hard work on this project!

This release signals the first step in our journey to deconstruct EmrEtlRunner into two separate applications, a Dataflow Runner and `snowplowctl`, per our [RFC][emretlrunner-rfc] on Discourse.

In the rest of this post we will cover:

1. [Why Dataflow Runner?](/blog/2017/02/10/introducing-dataflow-runner#why)
2. [Dataflow Runner 0.1.0](/blog/2017/02/10/introducing-dataflow-runner#dataflow-runner)
3. [Downloading and running Dataflow Runner](/blog/2017/02/10/introducing-dataflow-runner#install)
4. [Running a jobflow on EMR](/blog/2017/02/10/introducing-dataflow-runner#running)
5. [Roadmap](/blog/2017/02/10/introducing-dataflow-runner#roadmap)
6. [Contributing](/blog/2017/02/10/introducing-dataflow-runner#contributing)

<!--more-->

<h2 id="why">1. Why Dataflow Runner?</h2>

Looking around, we could not find a tool for managing and executing data processing jobs on dataflow fabrics such as EMR in a simple, declarative way. Dataflow Runner is designed to fill this gap, and letting us move away from our existing EmrEtlRunner tooling.

Dataflow Runner is a general-purpose executor for data processing jobs on dataflow fabrics. Initially it only supports [AWS EMR][aws-emr] but will eventually support a host of other fabrics, including [Google Cloud Dataproc][google-dataproc] and [Azure HDInsight][azure-hdinsight]. We are also interested in supporting on-premise Hadoop, Spark and Flink deployments, most likely via [YARN][apache-yarn].

For the full rationale, do check out our [original RFC][emretlrunner-rfc] on the topic.

The key features of the Dataflow Runner design are as follows:

<h4>Separation of concerns</h4>

Dataflow Runner aims to solve the fundamental problem of EmrEtlRunner complecting business logic with general-purpose EMR execution. This was problematic for a few reasons:

* It makes it very difficult to test EmrEtlRunner thoroughly, because the side effecting EMR execution and the business logic are mixed together
* The jobflow DAG is only constructed at runtime by code, which makes it very difficult to share with other orchestration tools such as Factotum
* EmrEtlRunner ties the Snowplow batch pipeline needlessly closely to EMR
* It makes it impossible for non-Snowplow projects to use our (in theory general-purpose) EMR execution code

<h4>Native runtime</h4>

Dataflow Runner is written in Golang, letting us build native binaries for various platforms. This makes Dataflow Runner a zero-dependency application, which is lightweight and places little strain on your system. This allows you to run many instances of Dataflow Runner concurrently on your orchestration cluster.  

<h4>Testing</h4>

It is much easier for us to test Dataflow Runner than it was to test EmrEtlRunner. As Dataflow Runner is a general-purpose application for running jobs on dataflow fabrics, it is straightforward for us to run integration tests on AWS without depending on a functional Snowplow pipeline.

<h2 id="dataflow-runner">2. Dataflow Runner 0.1.0</h2>

In version 0.1.0 of Dataflow Runner you will only able to work with AWS EMR - which mimics our current support in `EmrEtlRunner`. You can perform three distinct actions with this resource:

1. Launching a new cluster which is ready to run custom steps, via the `up` command
2. Adding steps to a newly created cluster, via the `run` command
3. Terminating a cluster, via the `down` command

There is a fourth command which mimics the current behavior of EmrEtlRunner: `run-transient`, which will launch, run steps and terminate in a single blocking action.

The configurations for Dataflow Runner are expressed in self-describing Avro, so they can be versioned and remain human-composable. The Avro Schema for these configs are available from Iglu Central as:

* [Cluster configuration](https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.dataflowrunner/ClusterConfig/avro/1-0-0)
* [Playbook configuration](https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.dataflowrunner/PlaybookConfig/avro/1-0-0)

Any Avro schema validator can validate/lint a Dataflow Runner config - which should makes these configurations more manageable compared to EmrEtlRunner's current YAML-based config.

Dataflow Runner is currently built for `Linux/amd64`, `Darwin/amd64` and `Windows/amd64` - if you require a different platform, please let us know!

Crucially, Dataflow Runner has **no install dependencies** and doesn't require a cluster, root access, a database, port 80 and so on.  The binaries can be found at the following locations:

* Linux: http://dl.bintray.com/snowplow/snowplow-generic/dataflow_runner_0.1.0_linux_amd64.zip
* Windows: http://dl.bintray.com/snowplow/snowplow-generic/dataflow_runner_0.1.0_windows_amd64.zip
* macOS: http://dl.bintray.com/snowplow/snowplow-generic/dataflow_runner_0.1.0_darwin_amd64.zip

<h2 id="install">3. Downloading and running Dataflow Runner</h2>

To get Dataflow Runner for Linux/amd64:

{% highlight bash %}
wget https://bintray.com/artifact/download/snowplow/snowplow-generic/dataflow_runner_0.1.0_linux_amd64.zip
unzip dataflow_runner_0.1.0_linux_amd64.zip
{% endhighlight %}

This series of commands will download the 0.1.0 release and unzip it in your current working directory. You can then run Dataflow Runner in the following way:

{% highlight bash %}
> dataflow-runner --help
NAME:
   dataflow-runner - Run templatable playbooks of Hadoop/Spark/et al jobs on Amazon EMR

USAGE:
   dataflow-runner [global options] command [command options] [arguments...]

VERSION:
   0.1.0

AUTHOR:
   Joshua Beemster <support@snowplowanalytics.com>

COMMANDS:
     up             Launches a new EMR cluster
     run            Adds jobflow steps to a running EMR cluster
     down           Terminates a running EMR cluster
     run-transient  Launches, runs and then terminates an EMR cluster
     help, h        Shows a list of commands or help for one command

GLOBAL OPTIONS:
   --help, -h     show help
   --version, -v  print the version

COPYRIGHT:
   (c) 2016-2017 Snowplow Analytics, LTD
{% endhighlight %}

<h2 id="running">4. Running a jobflow on EMR</h2>

To use Dataflow Runner you will need to create two configuration files. The first is an EMR cluster configuration, which will be used to launch the cluster; the second is the "playbook" containing a sequential series of steps that you want executed on a given cluster.

Here is the cluster configuration - note that this is EMR-specific:

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.dataflowrunner/ClusterConfig/avro/1-0-0",
  "data": {
    "name": "dataflow-runner - cluster name",
    "logUri": "s3://your-emr-logs/",
    "region": "us-east-1",
    "credentials": {
      "accessKeyId": "env",
      "secretAccessKey": "env"
    },
    "roles": {
      "jobflow": "EMR_EC2_DefaultRole",
      "service": "EMR_DefaultRole"
    },
    "ec2": {
      "amiVersion": "4.5.0",
      "keyName": "key-123ABC",
      "location": {
        "vpc": {
          "subnetId": "subnet-123ABC"
        }
      },
      "instances": {
        "master": {
          "type": "m1.medium"
        },
        "core": {
          "type": "m1.medium",
          "count": 1
        },
        "task": {
          "type": "m1.medium",
          "count": 0,
          "bid": "0.015"
        }
      }
    }
  }
}
{% endhighlight %}

This is a barebones configuration but you are also able to add tags, bootstrap actions and extra cluster configuration options.

__NOTE__: `credentials` can be fetched from the local environment, an IAM role attached to a server or as plaintext.

To then launch this cluster:

{% highlight bash %}
> dataflow-runner up --emr-config ${path-to-config}
{% endhighlight %}

Eventually you will see output like the following - `EMR cluster launched successfully; Jobflow ID: j-2DPBYD87LTGP8` - this means you are ready to submit some steps!

Here is a playbook containing a single step - this playbook is *not* EMR-specific:

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.dataflowrunner/PlaybookConfig/avro/1-0-0",
  "data": {
    "region": "us-east-1",
    "credentials": {
      "accessKeyId": "env",
      "secretAccessKey": "env"
    },
    "steps": [
      {
        "type": "CUSTOM_JAR",
        "name": "Custom Step Name",
        "actionOnFailure": "CANCEL_AND_WAIT",
        "jar": "/usr/share/aws/emr/s3-dist-cp/lib/s3-dist-cp.jar",
        "arguments": [
          "--src", "s3n://your-s3-bucket/enriched/bad/",
          "--dest", "hdfs:///local/monthly/"
        ]
      }
    ]
  }
}
{% endhighlight %}

To run this playbook against your cluster:

{% highlight bash %}
> dataflow-runner run --emr-playbook ${path-to-playbook} --emr-cluster j-2DPBXD87LSGP9
{% endhighlight %}

This will add the steps to your cluster queue - and the step, a file copy, will execute once all previous steps have completed on the cluster.

Once you are done with the cluster you can terminate it using the following:

{% highlight bash %}
> dataflow-runner down --emr-config ${path-to-config} --emr-cluster j-2DPBXD87LSGP9
{% endhighlight %}

To execute all of the above, including spinning up and shutting down the cluster, in one command it's simply:

{% highlight bash %}
> dataflow-runner run-transient --emr-config ${path-to-config} --emr-playbook ${path-to-playbook}
{% endhighlight %}

__NOTE__: For help and documentation on each command please see the [documentation](https://github.com/snowplow/dataflow-runner/wiki/Guide-for-analysts).

<h2 id="roadmap">5. Roadmap for Dataflow Runner</h2>

We're taking an iterative approach with Dataflow Runner - today it only has support for [AWS EMR][aws-emr] but we plan on growing it into a tool that can run on [YARN][apache-yarn], [Google Cloud Dataproc][google-dataproc], [Azure HDInsight][azure-hdinsight] and more!

From the Snowplow perspective we are exploring how to migrate our users from EmrEtlRunner to Dataflow Runner, per our [RFC][emretlrunner-rfc]. We don't plan on doing this immediately - Dataflow Runner needs to become more mature first, and there are still important jobflow execution features in EmrEtlRunner that have no equivalent yet in Dataflow Runner. However, expect to see some initial integration efforts between Snowplow and Dataflow Runner soon!

And of course if you have specific features you'd like to suggest, please [add a ticket] [dataflow-runner-issues] to the GitHub repo.

<h2 id="contributing">6. Contributing</h2>

Dataflow Runner is completely open source - and has been from the start! If you'd like to get involved, or just try your hand at Golang, please check out the [repository][dataflow-runner-repo].

[manoj]: https://github.com/rmanojcit
[emretlrunner-rfc]: http://discourse.snowplowanalytics.com/t/splitting-emretlrunner-into-snowplowctl-and-dataflow-runner/350

[dataflow-runner-repo]: https://github.com/snowplow/dataflow-runner
[dataflow-runner-issues]: https://github.com/snowplow/dataflow-runner/issues/new

[aws-emr]: https://aws.amazon.com/emr/
[apache-yarn]: https://hadoop.apache.org/docs/r2.7.1/hadoop-yarn/hadoop-yarn-site/YARN.html
[google-dataproc]: https://cloud.google.com/dataproc/
[azure-hdinsight]: https://azure.microsoft.com/en-us/services/hdinsight/
