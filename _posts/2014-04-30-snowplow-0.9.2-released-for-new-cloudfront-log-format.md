---
layout: post
title: Snowplow 0.9.2 released to support new CloudFront log format
title-short: Snowplow 0.9.2
tags: [snowplow, cloudfront, access log, hive]
author: Alex
category: Releases
---

We have now released Snowplow 0.9.2, adding Snowplow support for the updated [CloudFront access log file format] [cf-access-log] introduced by Amazon on the morning of 29th April. This release was a highly collaborative effort with the Snowplow community (see [this email thread] [email-thread] for background).

**If you currently use the Snowplow CloudFront-based event collector, you are recommended to upgrade to this release as soon as possible.**

As well as support for the new log file format, this release also features a new standalone Scalding job to make re-processing "bad" rows easier, and also some Hive script updates to bring our Hive support in step with our Postgres and Redshift schemas.

Read on below the fold for:

1. [Changes in this release](/blog/2014/04/30/snowplow-0.9.2-released-for-new-cloudfront-log-format/#cf-update)
2. [Other changes in this release](/blog/2014/04/30/snowplow-0.9.2-released-for-new-cloudfront-log-format/#other)
3. [Upgrading](/blog/2014/04/30/snowplow-0.9.2-released-for-new-cloudfront-log-format/#upgrading)
4. [Getting help](/blog/2014/04/30/snowplow-0.9.2-released-for-new-cloudfront-log-format/#help)

<!--more-->

<div class="html">
<h2><a name="cf-update">1. Updated CloudFront log support</a></h2>
</div>

On the morning of 29th April, AWS introduced a new column, `time-taken`, onto the end of the CloudFront access log file format. The existing version of Scala Hadoop Enrich (0.4.0) would reject these lines as invalid, so we have released a new version, 0.5.0, which supports the new format as well as the prior ones.

To prevent this issue recurring in the future, we have updated Scala Hadoop Enrich to accept additional new arguments added after `time-taken` at some point in the future; this code is fully tested.

<div class="html">
<h2><a name="other">2. Other changes in this release</a></h2>
</div>

To help users to recover the "bad" rows which Snowplow attempted to process following the 29th April, this release also includes an all-new component, the [Snowplow Hadoop Bad Rows job] [bad-rows-job].

Hadoop Bad Rows is a Scalding job, runnable on Elastic MapReduce, which reads in Snowplow's bad rows JSON output, extracts the raw Snowplow events and writes them to file, ready for subsequent reprocessing with the EmrEtlRunner. Help on usage is provided in the Upgrading section below.

Lastly, this release also includes updates to our [HiveQL definition of the Snowplow event table] [hiveql-def]; this brings our Hive definitions inline with our Redshift and Postgres definitions, and lets you work with the latest format of Snowplow enriched events in Hive again.

<div class="html">
<h2><a name="upgrading">3. Upgrading</a></h2>
</div>

Upgrading is a three step process:

1. [Check dependencies](#check)
2. [Upgrade](#upgrade)
3. [Recover missing data](#recover)

Let's take these in term:

<div class="html">
<a name="check"><h3>3.1 Check dependencies</h3></a>
</div>

Before upgrading, please ensure that you are on an up-to-date version of Snowplow - specifically **0.9.1**, which introduced changes to the Snowplow enriched event format.

**If you attempt to jump straight to 0.9.2, your enriched events will not load into your legacy Redshift or Postgres schema.**

For upgrading to 0.9.1, please see the [0.9.1 Release blog post] [091-blog].

<div class="html">
<a name="upgrade"><h3>3.2 Upgrade</h3></a>
</div>

Upgrading is super simple: simply update the `config.yml` file for EmrEtlRunner to use the latest version of the Hadoop ETL (0.5.0):

{% highlight yaml %}
:snowplow:
  :hadoop_etl_version: 0.5.0
{% endhighlight %}

<div class="html">
<a name="recover"><h3>3.3 Recover missing data</h3></a>
</div>

**Update: since releasing this version of Snowplow, [we have learnt] [error-in-bad-row-reprocessing] that the suggested upgrade process listed below has the unfortunate side effect of URL-encoding all string columns in the recovered data. For that reason, we recommend waiting until the next version of Snowplow is released, where this bug will be addressed. If waiting is not possible, please consult [this thread] [error-in-bad-row-reprocessing] for some alternative fixes that work in the short-term.**

Any Snowplow batch runs _after_ the CloudFront change but _before_ your upgrade to 0.9.2 will have resulted in valid events ending up in your bad rows bucket. Happily, we can use the [Snowplow Hadoop Bad Rows job] [bad-rows-job] to recover them. Read on for instructions.

For every run to recover data from, you can run the Hadoop Bad Rows job using the [Amazon Ruby EMR client] [emr-client]:

{% highlight bash %}
$ elastic-mapreduce --create --name "Extract raw events from Snowplow bad row JSONs" \
  --instance-type m1.xlarge --instance-count 3 \
  --jar s3://snowplow-hosted-assets/3-enrich/scala-bad-rows/snowplow-bad-rows-0.1.0.jar \
  --arg com.snowplowanalytics.hadoop.scalding.SnowplowBadRowsJob \
  --arg --hdfs \
  --arg --input --arg s3n://[[PATH_TO_YOUR_FIXABLE_BAD_ROWS]] \
  --arg --output --arg s3n://[[PATH_WILL_BE_STAGING_FOR_EMRETLRUNNER]]
{% endhighlight %}

Replace the `[[...]]` placeholders above with the appropriate bucket paths. **Please note:** if you have multiple runs to fix, then we suggest running the above multiple times, one per run to fix, rather than running it against your whole bad rows bucket - it should be much faster.

Now you are ready to process the recovered raw events with Snowplow. Unfortunately, the filenames generated by the Bad Rows job are not compatible with the EmrEtlRunner currently (we will fix this in a future release). In the meantime, here is a workaround:

1. Edit `config.yml` and change `:collector_format: cloudfront` to `:collector_format: clj-tomcat`
2. Edit `config.yml` and point the `:processing:` bucket setting to wherever your extracted bad rows are located
3. Run EmrEtlRunner with `--skip staging`

If you are a Qubole and/or Hive user, you can find an alternative approach to recovering the bad rows in our blog post, [Reprocessing bad rows of Snowplow data using Hive, the JSON Serde and Qubole] [qubole-json-blog].

<div class="html">
<h2><a name="help">4. Getting help</a></h2>
</div>

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

For more details on this release, please check out the [0.9.2 Release Notes] [snowplow-092] on GitHub.

[email-thread]: https://groups.google.com/forum/#!topic/snowplow-user/dXpPKhsRZZ4
[cf-access-log]: http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/AccessLogs.html

[bad-rows-job]: https://github.com/snowplow/snowplow/tree/master/3-enrich/scala-hadoop-bad-rows
[hiveql-def]: https://github.com/snowplow/snowplow/blob/master/4-storage/hive-storage/hiveql/table-def.q

[091-blog]: http://snowplowanalytics.com/blog/2014/04/11/snowplow-0.9.1-released-with-initial-json-support/#upgrading
[qubole-json-blog]: http://snowplowanalytics.com/blog/2013/09/11/reprocessing-bad-data-using-hive-the-json-serde-and-qubole/

[emr-client]: http://aws.amazon.com/developertools/2264

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[snowplow-092]: https://github.com/snowplow/snowplow/releases/0.9.2
[error-in-bad-row-reprocessing]: https://groups.google.com/forum/#!topic/snowplow-user/Rsefh6CSq1c
