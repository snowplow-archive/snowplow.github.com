---
layout: post
title-short: Snowplow 87 Chichen Itza
title: "Snowplow 87 Chichen Itza released"
tags: [snowplow, ebs, emr, redshift, manifest, elasticity]
author: Alex
category: Releases
---

We are pleased to announce the immediate availability of [Snowplow 87 Chichen Itza] [snowplow-release].

This release contains a wide array of new features, stability enhancements and performance improvements for EmrEtlRunner and StorageLoader. As of this release EmrEtlRunner lets you specify EBS volumes for your Hadoop worker nodes; meanwhile StorageLoader now writes to a dedicated manifest table to record each load.

Continuing with this release series named for archaelogical sites, Release 87 is [Chichen Itza] [chichen-itza-mexico], the ancient Mayan city in the Yucatan Peninsula in Mexico.

Read on after the fold for:

1. [Specifying EBS volumes for Hadoop in EmrEtlRunner](/blog/2017/02/21/snowplow-r87-chichen-itza-released#ebs)
2. [EmrEtlRunner stability and performance improvements](/blog/2017/02/21/snowplow-r87-chichen-itza-released#emretlrunner-misc)
3. [A load manifest for Redshift](/blog/2017/02/21/snowplow-r87-chichen-itza-released#manifest)
4. [StorageLoader stability improvements](/blog/2017/02/21/snowplow-r87-chichen-itza-released#storageloader-misc)
5. [Upgrading](/blog/2017/02/21/snowplow-r87-chichen-itza-released#upgrading)
6. [Roadmap](/blog/2017/02/21/snowplow-r87-chichen-itza-released#roadmap)
7. [Getting help](/blog/2017/02/21/snowplow-r87-chichen-itza-released#help)

![chichen-itza-mexico][chichen-itza-mexico-img]

<!--more-->

<h2 id="ebs">1. Specifying EBS volumes for Hadoop in EmrEtlRunner</h2>

A recurring request from the Snowplow community has been for increased control over how the Snowplow batch pipeline runs on Elastic MapReduce.

Over time, our plan is to give you total control over this, with our planned migration from EmrEtlRunner to our new [Dataflow Runner] [dataflow-runner], as per our [RFC] [emretlrunner-rfc]. However, this plan will take some time, and in the meantime we are continuing to invest in improving EmrEtlRunner.

In this release we add the ability to specify an EBS volume to attach to each core instance in your EMR cluster. This is particularly powerful for two scenarios:

1. When you want to use new EBS-only instance types, such as the `c4` series, for your EMR jobs
2. When you have significant event volumes and you would like much more finegrained control over the amount of disk you are allocating to the HDFS cluster that is formed out of the task nodes

EmrEtlRunner lets you attach one EBS volume to each node, broadly exposing the functionality described in the [EMR documentation for Amazon EBS volumes] [emr-ebs-docs]. For an example, please see the upgrade section **5.2 Updating config.yml** below.

<h2 id="emretlrunner-misc">2. EmrEtlRunner stability and performance improvements</h2>

We have made a variety of "under-the-hood" improvements to the EmrEtlRunner.

Most noticeably, we have migrated the archival code for raw collector payloads from EmrEtlRunner into the EMR cluster itself, where the work is performed by the [S3DistCp] [s3distcp] distributed tool. This should reduce the strain on your server running EmrEtlRunner, and should improve the speed of that step. Note that as a result of this, the raw files are now archived in the same way as the enriched and shredded files, using `run=` sub-folders.

For more robust monitoring of EMR while waiting for jobflow completion, EmrEtlRunner now anticipates and recovers from additional Elasticity errors (`ThrottlingException` and `ArgumentError`).

For users running Snowplow in a [Lambda architecture] [snowplow-lambda-architecture] we have removed the `UnmatchedLzoFilesError` check, which would prevent EMR from starting even though an LZO index file missing from the processing folder is in fact benign.

In the case that a previous run has failed or is ungoing, EmrEtlRunner now exits out with a dedicated return code (`4`).

Finally, we have bumped the JRuby version for EmrEtlRunner to 9.1.6.0, and upgraded the key Elasticity dependency to 6.0.10.

<h2 id="manifest">3. A load manifest for Redshift</h2>

As of this release, StorageLoader now populates a manifest table as part of the Redshift load. The table is simply called `manifest` and lives in the same schema as your `events` and other tables.

Here are the last 5 loads for one of our internal pipelines:

{% highlight sql %}
snplow=# select * from atomic.manifest order by etl_tstamp desc limit 5;
       etl_tstamp        |       commit_tstamp        | event_count | shredded_cardinality
-------------------------+----------------------------+-------------+----------------------
 2017-02-21 19:01:49.648 | 2017-02-21 19:28:33.394898 |        4340 |                    8
 2017-02-21 15:02:02.03  | 2017-02-21 15:27:24.534884 |        2891 |                    7
 2017-02-21 11:02:09.63  | 2017-02-21 11:28:00.317476 |        2210 |                    7
 2017-02-21 08:02:14.957 | 2017-02-21 08:27:59.829461 |        1945 |                    6
 2017-02-21 03:01:39.476 | 2017-02-21 03:27:03.493547 |        1986 |                    8
(5 rows)
{% endhighlight %}

The fields are as follows:

* `etl_tstamp` is the time at which the Snowplow pipeline run started
* `commit_tstamp` is the time at which the load transaction **started**
* `event_count` is the number of events loaded into the `events` table as part of this load transaction
* `shredded_cardinality` is how many different self-describing event and context tables were loaded as part of this load transaction

At the moment this manifest table is only informational, however in the future we want to use it proactively - for example to prevent a batch of events from being accidentally double-loaded into Redshift.

<h2 id="storageloader-misc">4. StorageLoader stability improvements</h2>

As with EmrEtlRunner, we have bumped the JRuby version for StorageLoader to 9.1.6.0.

We have also fixed a critical bug for loading events into Postgres via StorageLoader ([#2888] [2888]).

<h2 id="upgrading">5. Upgrading</h2>

<h3 id="upgrading-binaries">5.1 Upgrading EmrEtlRunner and StorageLoader</h3>

The latest version of the EmrEtlRunner and StorageLoader are available from our Bintray [here][app-dl].

<h3 id="upgrading-config.yml">5.2 Updating config.yml</h3>

To make use of the new ability to specify EBS volumes for your EMR cluster's core nodes, update your configuration YAML like so:

{% highlight yaml %}
    jobflow:
      master_instance_type: m1.medium
      core_instance_count: 1
      core_instance_type: c4.2xlarge
      core_instance_ebs:   # Optional. Attach an EBS volume to each core instance.
        volume_size: 200    # Gigabytes
        volume_type: "io1"
        volume_iops: 400    # Optional. Will only be used if volume_type is "io1"
        ebs_optimized: false # Optional. Will default to true
{% endhighlight %}

The above configuration will attach an EBS volume of 200 GiB to each core instance in your EMR cluster; the volumes will be Provisioned IOPS (SSD), with performance of 400 IOPS/GiB. The volumes will *not* be EBS optimized. Note that this configuration has finally allowed us to use the EBS-only `c4` instance types for our core nodes.

For a complete example, see our [sample `config.yml` template][emretlrunner-config-yml].

<h3 id="upgrading-redshift">5.3 Upgrading Redshift</h3>

You will also need to deploy the following manifest table for Redshift:

* [4-storage/redshift-storage/sql/manifest-def.sql ] [manifest-ddl]

This table should be deployed into the same schema as your `events` and other tables.

<h2 id="roadmap">6. Roadmap</h2>

Upcoming Snowplow releases include:

* [R8x [HAD] Cross-batch natural deduplication] [r8x-crossbatch-dedupe], removing duplicates across ETL runs using an event manifest in DynamoDB
* [R9x [HAD] Spark port] [r9x-spark-port], which will port our Hadoop Enrich and Hadoop Shred jobs from Scalding to Apache Spark
* [R9x [HAD] 4 webhooks] [r9x-webhooks], which will add support for 4 new webhooks (Mailgun, Olark, Unbounce, StatusGator)

Note that these releases are always subject to change between now and the actual release date.

<h2 id="help">7. Getting help</h2>

For more details on this release, please check out the [release notes] [snowplow-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

[chichen-itza-mexico]: https://en.wikipedia.org/wiki/Chichen_Itza
[chichen-itza-mexico-img]: /assets/img/blog/2017/02/chichen-itza-mexico.jpg

[snowplow-release]: https://github.com/snowplow/snowplow/releases/r87-chichen-itza
[2888]: https://github.com/snowplow/snowplow/issues/2888

[app-dl]: http://dl.bintray.com/snowplow/snowplow-generic/snowplow_emr_r87_chichen_itza.zip
[manifest-ddl]: https://raw.githubusercontent.com/snowplow/snowplow/master/4-storage/redshift-storage/sql/manifest-def.sql
[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample

[emr-ebs-docs]: http://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-storage-ebs.html

[emretlrunner-rfc]: http://discourse.snowplowanalytics.com/t/splitting-emretlrunner-into-snowplowctl-and-dataflow-runner/350
[dataflow-runner]: https://github.com/snowplow/dataflow-runner
[snowplow-lambda-architecture]: http://discourse.snowplowanalytics.com/t/how-to-setup-a-lambda-architecture-for-snowplow/249
[s3distcp]: http://docs.aws.amazon.com/emr/latest/ReleaseGuide/UsingEMR_s3distcp.html

[r8x-crossbatch-dedupe]: https://github.com/snowplow/snowplow/milestone/136
[r9x-spark-port]: https://github.com/snowplow/snowplow/milestone/137
[r9x-webhooks]: https://github.com/snowplow/snowplow/milestone/129

[issues]: https://github.com/snowplow/snowplow/issues/new
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
