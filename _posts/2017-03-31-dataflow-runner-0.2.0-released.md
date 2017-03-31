---
layout: post
title: "Dataflow Runner 0.2.0 released"
title-short: Dataflow Runner 0.2.0
tags: [snowplow, golang, orchestration, emr]
author: Ben
category: Releases
---

Building on [the initial release of Dataflow Runner last month](
/blog/2017/02/10/introducing-dataflow-runner), we are proud to announce [version
0.2.0][release-020], aiming to bring Dataflow Runner up to feature parity with our long-standing [EmrEtlRunner application][emr-etl-runner].

As a quick reminder, Dataflow Runner is a cloud-agnostic tool to create clusters
and run jobflows which, for the moment, only supports [AWS EMR][emr].

If you need a refresher on the rationale behind Dataflow Runner, feel free to
checkout [the RFC on the subject][eer-rfc].

In the rest of this post, we will cover:

1. [Support for EMR Applications](/blog/2017/03/31/dataflow-runner-0.2.0-released#apps)
2. [Support for Elastic Block Store](/blog/2017/03/31/dataflow-runner-0.2.0-released#ebs)
3. [Configurable logging level](/blog/2017/03/31/dataflow-runner-0.2.0-released#log)
4. [Other updates](/blog/2017/03/31/dataflow-runner-0.2.0-released#updates)
5. [Roadmap](/blog/2017/03/31/dataflow-runner-0.2.0-released#roadmap)
6. [Contributing](/blog/2017/03/31/dataflow-runner-0.2.0-released#contributing)

<!--more-->

<h2 id="apps">1. Support for EMR Applications</h2>

[EMR Applications][emr-apps] are a way to tell EMR what you want installed on
your cluster when you launch it. There are various big data applications
to choose from such as Flink, Spark or Hive.

As we're moving the batch pipeline away from [Scalding][scalding] to
[Spark][spark], as detailed in the [Spark RFC][spark-rfc], the need to support
EMR Applications in Dataflow Runner became apparent, since Spark is not
installed by default when launching an EMR cluster.

To specify which applications you want installed on your EMR cluster, you just have to add a JSON array to your cluster configuration as shown:

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.dataflowrunner/ClusterConfig/avro/1-1-0",
  "data": {
    "name": "dataflow-runner - cluster name",
    // omitted for brevity
    "applications": [ "Hadoop", "Spark" ]
  }
}
{% endhighlight %}

Note that, compared with version 0.1.0 of Dataflow Runner, the Avro schema
version has been changed to 1-1-0. The schema itself has been updated to reflect
the improvements made in version 0.2.0 of Dataflow Runner. However, the two
schemas being fully backward-compatible, if you do not wish to use the new
features introduced in this release you do not have to change anything. You can
find the up-to-date schema on [GitHub][avro-schema].

You can also find a full example of a cluster configuration on
[GitHub][cluster-config].

<h2 id="ebs">2. Support for Elastic Block Store</h2>

Another feature which was recently added to EmrEtlRunner [in Snowplow Chichen Itza](
/blog//2017/02/21/snowplow-r87-chichen-itza-released#ebs) is support for
[Elastic Block Store][ebs] (EBS for short). We wanted to support this
in Dataflow Runner as well.

In 0.2.0, you're now able to specify an EBS volume for each instance in your EMR
cluster, be it master, core or task instances. To do so, you'll need to modify
the EC2 instances part of your cluster configuration file and add the wanted
EBS configurations, an example follows.

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.dataflowrunner/ClusterConfig/avro/1-1-0",
  "data": {
    "name": "dataflow-runner - cluster name",
    // omitted for brevity
    "ec2": {
      // omitted for brevity
      "instances": {
        "master": {
          "type": "m1.medium",
          "ebsConfiguration": {
            "ebsOptimized": true,
            "ebsBlockDeviceConfigs": [
              {
                "volumesPerInstance": 1,
                "volumeSpecification": {
                  "iops": 3000,
                  "sizeInGB": 10,
                  "volumeType": "io1"
                }
              }
            ]
          }
        },
        "core": {
          "type": "m1.medium",
          "count": 3,
          "ebsConfiguration": {
            "ebsOptimized": true,
            "ebsBlockDeviceConfigs": [
              {
                "volumesPerInstance": 1,
                "volumeSpecification": {
                  "iops": 5000,
                  "sizeInGB": 20,
                  "volumeType": "io1"
                }
              }
            ]
          }
        },
        "task": {
          "type": "m1.medium",
          "count": 3,
          "bid": "0.015",
          "ebsConfiguration": {
            "ebsOptimized": true,
            "ebsBlockDeviceConfigs": [
              {
                "volumesPerInstance": 1,
                "volumeSpecification": {
                  "iops": 5000,
                  "sizeInGB": 10,
                  "volumeType": "io1"
                }
              }
            ]
          }
        }
      }
    }
  }
}
{% endhighlight %}

Again, you can also refer to the cluster configuration example on
[GitHub][cluster-config] for details.

<h2 id="log">3. Configurable logging level</h2>

We've also added a little option to set the logging level to keep Dataflow
Runner from being too noisy. You can set it for any `dataflow-runner` command
with the --log-level flag. Supported log levels are `debug`, `info`, `warning`,
`error`, `fatal` and `panic`.

As an example, we could run:

{% highlight bash %}
> dataflow-runner up --emr-config emr-config.json --log-level fatal
{% endhighlight %}

<h2 id="updates">4. Other updates</h2>

Dataflow Runner 0.2.0 also brings another couple of changes under the hood:

- It is built against Go 1.8 ([issue #13](https://github.com/snowplow/dataflow-runner/issues/13))
- To increase test coverage, we adopted the excellent built-in EMR mocking
capabilities of the [Go AWS SDK][emriface] ([issue #10](
https://github.com/snowplow/dataflow-runner/issues/10))

<h2 id="roadmap">5. Roadmap</h2>

The major long-term goal for Dataflow Runner is still to support multiple cloud providers such as Google Cloud
Dataproc or Azure HDInsight.

In the shorter term, we've also started a discussion around finding ways to react to step failures;
this is the only remaining feature for Dataflow Runner to reach feature parity
with EmrEtlRunner (see [issue #15](
https://github.com/snowplow/dataflow-runner/issues/15)).

If you have other features in mind, feel free to log an issue in
[the GitHub repository][df-runner-issues].

<h2 id="contributing">6. Contributing</h2>

You can check out the [repository][df-runner-repo] if you'd like to get involved! In particular, any preparatory work getting other cloud providers integrated would be much appreciated.

[release-020]: https://github.com/snowplow/dataflow-runner/releases/tag/0.2.0

[eer-rfc]: http://discourse.snowplowanalytics.com/t/splitting-emretlrunner-into-snowplowctl-and-dataflow-runner/350
[spark-rfc]: http://discourse.snowplowanalytics.com/t/migrating-the-snowplow-batch-jobs-from-scalding-to-spark/492

[avro-schema]: http://iglucentral.com/schemas/com.snowplowanalytics.dataflowrunner/ClusterConfig/avro/1-1-0
[cluster-config]: https://github.com/snowplow/dataflow-runner/blob/master/config/cluster.json.sample
[df-runner-issues]: https://github.com/snowplow/dataflow-runner/issues
[df-runner-repo]: https://github.com/snowplow/dataflow-runner

[emr]: https://aws.amazon.com/emr/
[ebs]: https://aws.amazon.com/ebs/
[emr-apps]: http://docs.aws.amazon.com/emr/latest/ReleaseGuide/emr-release-components.html#w1ab1c17c11
[emriface]: https://docs.aws.amazon.com/sdk-for-go/api/service/emr/emriface/

[emr-etl-runner]: https://github.com/snowplow/snowplow/tree/master/3-enrich/emr-etl-runner

[scalding]: https://github.com/twitter/scalding
[spark]: http://spark.apache.org/
