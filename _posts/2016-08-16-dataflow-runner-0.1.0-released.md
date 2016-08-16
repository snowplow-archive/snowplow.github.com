---
layout: post
title: "Dataflow Runner 0.1.0 released"
title-short: Dataflow Runner 0.1.0
tags: [snowplow, jobs, EMR, release]
author: Manoj
category: Releases
---

We are pleased to announce version [0.1.0] [010-release] of [Datafow Runner] [repo]. Dataflow Runner is an open source app, written in Go, that makes it easy to create Emr cluster and execute jobs in the clusters.

A huge thanks to our Summer Intern [Manoj Rajandrakumar]  for contributing to the release of Dataflow-runner - thank you Manoj!

1. [Create a new EMR cluster](/blog/2015/11/05/Dataflow-runner-0.1.0-released/#create_cluster)
2. [Run Job Steps on a cluster](/blog/2015/11/05/Dataflow-runner-0.1.0-released/#run_jobs)
3. [Getting help](/blog/2015/11/05/dataflow-runner-0.1.0-released/#help)

<!--more-->

<h2 id="create_cluster">1. Create a new EMR cluster</h2>

With Dataflow Runner 0.1.0, you can now create an AWS EMR cluster using configuration details from a json file and get the jobflowId for the cluster.

```
$ dataflow-runner up emr_cluster.json --region xxx
Jobflow ID: j-1WJAF3S7TRUXM
```

An example instance of emr_cluster.json looks like 

```
{
  "schema": "iglu:com.snowplowanalytics.dataflow-runner.emr/Cluster/avro/1-0-0",
  "data": {
      "name": "xxx",
      "roles": {
        "jobflow": "EMR_EC2_DefaultRole"
        "service": "EMR_DefaultRole"
      },
      "ec2": {
        "amiVersion": "4.5.0",
        "keyName": "snowplow-yyy-key",
        "location": {
          "classic": {
            "availabilityZone": "us-east-1a"
          } // OR 
          "vpc": {
            "subnetId": "xxx"
          }
        },
        "instances": {
          "master": {
            "type": "m1.medium"
          },
          "core": {
            "type": "c3.4xlarge",
            "count": 3,
          },
          "task": {
            "type": "m1.medium",
            "count": 0,
            "bid": 0.0.15
          }
        }
      }
    }
  }
}
```
It creates the cluster and prints out the jobflowId of the cluster.


<h2 id="resume">2. Run Job Steps on a cluster</h2>

With Dataflow Runner 0.1.0, you can now run Jobs on an EMR cluster by defining jobs in the form of an avro file(playbook.avro).

``
$ dataflow-runner run playbook.avro --region xxx --emr-cluster yyy
``

An example instance of playbook avro in json format looks like 
```
{
  "schema": "iglu:com.snowplowanalytics.dataflow-runner/Playbook/avro/1-0-0",
  "data": {
    "steps": [
      {
        "type": "CUSTOM_JAR",
        "name": "Combine Months",
        "actionOnFailure": "TERMINATE_CLUSTER",
        "jar": "/usr/share/aws/emr/s3-dist-cp/lib/s3-dist-cp.jar",
        "arguments": [
          "--src",
          "s3n://{{my-output-bucket/enriched/bad}}/",
          "--dest",
          "hdfs:///local/monthly/"
        ]
      },
      {
        "type": "CUSTOM_JAR",
        "name": "Combine Months",
        "actionOnFailure": "CONTINUE",
        "jar": "s3://snowplow-hosted-assets/3-enrich/hadoop-event-recovery/snowplow-hadoop-event-recovery-0.2.0.jar",
        "arguments": [
          "com.snowplowanalytics.hadoop.scalding.SnowplowEventRecoveryJob",
          "--hdfs",
          "--input",
          "hdfs:///local/monthly/*",
          "--output",
          "hdfs:///local/recovery/"
        ]
      }
    ]
  }
}
```

Some notes on this:

* It handles Bootstrap failure condition by retrying a fixed number of times before it throws an error.
* The --time flag will run the steps in a non-blocking manner

Run it like so:

```
$ dataflow-runner 
Usage:
  app [command]

Available Commands:
  run         run job steps
  up          create a cluster
  version     version of dataflow runner
  
Flags:
  -h, --help   help for app

Use "app [command] --help" for more information about a command.
```

<h2 id="help">3. Getting help</h2>

For more details on this release, please check out the [Dataflow Runner 0.1.0 release notes][010-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[rmanojcit]: https://github.com/rmanojcit

[repo]: https://github.com/snowplow/dataflow-runner
[issues]: https://github.com/snowplow/dataflow-runner/issues
[010-release]: https://github.com/snowplow/dataflow-runner/releases/tag/0.1.0
[talk-to-us]: https://github.com/snowplow/dataflow-runner/wiki/Talk-to-us
