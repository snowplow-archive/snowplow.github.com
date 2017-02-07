---
layout: post
title: "Introducing Dataflow Runner"
title-short: Dataflow Runner 0.1.0
tags: [snowplow, golang, orchestration, emr]
author: Josh
category: Releases
---

We are pleased to announce the release of [Dataflow Runner] [dataflow-runner-repo], a new open-source system for the creation and running of [AWS EMR][aws-emr] jobflow clusters and steps.  Big thanks to Snowplow intern [Manoj Rajandrakumar][manoj] for all of his hardwork on this project!

This release signals the first step in our journey to deconstruct EmrEtlRunner into two seperate applications which should solve the fundamental problem that EmrEtlRunner complects business logic with general-purpose EMR execution.  This is problematic for a few reasons:

* It makes it very difficult to test EmrEtlRunner thoroughly, because the side effecting EMR execution and the business logic are mixed together
* The jobflow DAG is only constructed at runtime by code, which makes it very difficult to share with other orchestration tools such as Factotum
* EmrEtlRunner ties the Snowplow batch pipeline needlessly closely to EMR
* It makes it impossible for non-Snowplow projects to use our (in theory general-purpose) EMR execution code

In the rest of this post we will cover:

1. [Why Dataflow Runner?](/blog/2017/02/xx/introducing-dataflow-runner#why)
2. [Dataflow Runner 0.1.0](/blog/2017/02/xx/introducing-dataflow-runner#dataflow-runner)
3. [Downloading and running Dataflow Runner](/blog/2017/02/xx/introducing-dataflow-runner#install)
4. [Managing EMR with Dataflow Runner](/blog/2017/02/xx/introducing-dataflow-runner#running)
5. [Roadmap](/blog/2017/02/xx/introducing-dataflow-runner#roadmap)
6. [Contributing](/blog/2017/02/xx/introducing-dataflow-runner#contributing)

<!--more-->

<h2 id="why">1. Why Dataflow Runner?</h2>

In the current market there simply does not exist a general-purpose tool for managing and executing data processing jobs on dataflow fabrics in a simple composable way.  To this end we have created Dataflow Runner which will hopefully fill this hole whilst also allowing us to solve our own issues with EmrEtlRunner by allowing us to abstract all of our business logic away from EMR.

Dataflow Runner is a general-purpose executor for data processing jobs on dataflow fabrics.  In its first form it will only support [AWS EMR][aws-emr] but will eventually support a host of other fabrics such as [YARN][apache-yarn], [Google Cloud Dataproc][google-dataproc] and [Azure HDInsight][azure-hdinsight].

For the full rational please see our [original RFC][emretlrunner-rfc] on the topic.

<h4>Separation of concerns</h4>

To effectively support many different fabrics we needed to remove all business logic from the actual job of running data processing steps.  

WHY?

<h4>Native runtime</h4>

Dataflow Runner is compiled using Golang which means that we can build native binaries for many different platforms.  This means that it is a zero dependency application which is incredibly light and very low intensity on your system resources.  This will allow us to run many many instances of the application concurrently without causing undue system strain.  

WHAT IS THE CURRENT JVM STRAIN?

<h4>Testing</h4>

As Dataflow Runner is now un-opinionated it makes testing very simple.  We can easily run integration tests with on AWS without needing to first setup a full Snowplow pipeline or to send any data.  

WHY IS IT EASIER?

<h2 id="dataflow-runner">2. Dataflow Runner 0.1.0</h2>

In version 0.1.0 of Dataflow Runner you will only able to work with AWS EMR - which mimics our current support in `EmrEtlRunner`.  You will be able to perform three distinct actions with this resource:

1. Launching a new cluster which is ready to run custom steps via the `up` command
2. Adding steps to a newly created cluster via the `run` command
3. Terminating a cluster via the `down` command

There is a fourth command which mimics the current behaviour of EmrEtlRunner which will launch, run steps and terminate in a single blocking action via the `run-transient` command.

The configurations for Dataflow Runner are expressed in self-describing Avro, so they can be versioned and remain human-composable.  The Avro Schema for these configs are available from Iglu Central as:

* [Cluster Configuration](https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.dataflowrunner/ClusterConfig/avro/1-0-0)
* [Playbook Configuration](https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.dataflowrunner/PlaybookConfig/avro/1-0-0)

Any Avro Schema validator can validate/lint a Dataflow Runner config - which should alleviate a great many issues as opposed to the current EmrEtlRunner config which has grown more and more confusing over the years!

Dataflow Runner is currently built for `Linux/amd64`, `Darwin/amd64` and `Windows/amd64` - if there is a platform that you require is missing from this list please let us know!

Crucially, Dataflow Runner has **no install dependencies** and doesn't require a cluster, root access, a database, port 80 and so on.

<h2 id="install">3. Downloading and running Dataflow Runner</h2>

To get Dataflow Runner for Linux/amd64. Get it like so:

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
   0.1.0-rc2

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

<h2 id="running">4. Managing EMR with Dataflow Runner</h2>

To use Dataflow Runner you will need to create two configuration files.  The first being an EMR cluster configuration which will be used to create the cluster ready for use, the second being a series of steps/playbook that will be added to the created cluster.

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

__NOTE__: `credentials` can be fetched from the local environment, IAM role attached to a server or as plain text

To then launch this cluster:

{% highlight bash %}
> dataflow-runner up --emr-config ${path-to-config}
{% endhighlight %}

Eventually you will see output like the following - `EMR cluster launched successfully; Jobflow ID: j-2DPBXD87LSGP9` - this means you are ready to submit some steps!

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

To add these steps:

{% highlight bash %}
> dataflow-runner run --emr-playbook ${path-to-playbook} --emr-cluster j-2DPBXD87LSGP9
{% endhighlight %}

This will add the steps to your cluster step queue - and that is all there is to it!

Once you are done with the cluster you can terminate it using the following:

{% highlight bash %}
> dataflow-runner down --emr-config ${path-to-config} --emr-cluster j-2DPBXD87LSGP9
{% endhighlight %}

<h2 id="roadmap">5. Roadmap for Dataflow Runner</h2>

We're taking an iterative approach with Dataflow Runner - today it only has support for [AWS EMR][aws-emr] but we plan on growing it into a tool that can run on [YARN][apache-yarn], [Google Cloud Dataproc][google-dataproc], [Azure HDInsight][azure-hdinsight] and more!

If you have specific features you'd like to suggest, please [add a ticket] [dataflow-runner-issues] to the GitHub repo.

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
