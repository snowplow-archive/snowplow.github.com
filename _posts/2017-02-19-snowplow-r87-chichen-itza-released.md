---
layout: post
title-short: Snowplow 87 Chichen Itza
title: "Snowplow 87 Chichen Itza released"
tags: [snowplow, ebs, emr, manifest, elasticity]
author: Alex
category: Releases
---

We are pleased to announce the immediate availability of [Snowplow 87 Chichen Itza] [snowplow-release].

This release contains a wide array of new features, stability enhancements and performance improvements for EmrEtlRunner and StorageLoader. As of this release EmrEtlRunner lets you specify EBS volumes for your Hadoop worker nodes; meanwhile StorageLoader now writes to a dedicated manifest table to record each load.

Continuing with our release series named for archaelogical site, R87 is [Chichen Itza] [chichen-itza-mexico], the Mayan city in the Yucatan Peninsula in Mexico.

Read on after the fold for:

1. [Specifying EBS volumes for Hadoop in EmrEtlRunner](/blog/2017/02/19/snowplow-r87-chichen-itza-released#ebs)
2. [EmrEtlRunner stability and performance improvements](/blog/2017/02/19/snowplow-r87-chichen-itza-released#emretlrunner-misc)
3. [A load manifest for Redshift](/blog/2017/02/19/snowplow-r87-chichen-itza-released#manifest)
4. [StorageLoader stability improvements](/blog/2017/02/19/snowplow-r87-chichen-itza-released#storageloader-misc)
5. [Upgrading](/blog/2017/02/19/snowplow-r87-chichen-itza-released#upgrading)
6. [Roadmap](/blog/2017/02/19/snowplow-r87-chichen-itza-released#roadmap)
7. [Getting help](/blog/2017/02/19/snowplow-r87-chichen-itza-released#help)

![chichen-itza-mexico][chichen-itza-mexico-img]

<!--more-->

<h2 id="ebs">1. Specifying EBS volumes for Hadoop in EmrEtlRunner</h2>

TO ADD

<h2 id="emretlrunner-misc">2. EmrEtlRunner stability and performance improvements</h2>

We have made a variety of "under-the-hood" improvements to the EmrEtlRunner.

Most noticeably, we have migrated the archival code for raw collector payloads from EmrEtlRunner into the EMR cluster itself, where the work is performed by the [S3DistCp] [s3distcp] distributed tool. This should reduce the strain on your server running EmrEtlRunner, and should improve the speed of that step. Note that as a result of this, the raw files are now archived in the same way as the enriched and shredded files, using `run=` sub-folders.

For more robust monitoring of EMR while waiting for jobflow completion, EmrEtlRunner now anticipates and recovers from additional Elasticity errors (`ThrottlingException` and `ArgumentError`).

For users running Snowplow in a [Lambda architecture] [snowplow-lambda-architecture] we have removed the `UnmatchedLzoFilesError` check, which would prevent EMR from starting even though an LZO index file missing from the processing folder is in fact benign.

In the case that a previous run has failed or is ungoing, EmrEtlRunner now exits out with a dedicated return code (`4`).

Finally, we have bumped the JRuby version for EmrEtlRunner to 9.1.6.0, and upgraded the key Elasticity dependency to 6.0.10.

<h2 id="manifest">3. A load manifest for Redshift</h2>

TO ADD

<h2 id="storageloader-misc">4. StorageLoader stability improvements</h2>

As with EmrEtlRunner, we have bumped the JRuby version for StorageLoader to 9.1.6.0.

We have also fixed a critical bug for loading events into Postgres via StorageLoader ([#2888] [2888]).

<h2 id="upgrading">4. Upgrading</h2>

Upgrading is simple - update the `hadoop_shred` job version in your configuration YAML like so:

{% highlight yaml %}
versions:
  hadoop_enrich: 1.8.0        # UNCHANGED
  hadoop_shred: 0.10.0        # WAS 0.9.0
  hadoop_elasticsearch: 0.1.0 # UNCHANGED
{% endhighlight %}

For a complete example, see our [sample `config.yml` template][emretlrunner-config-yml].

You will also need to deploy the following table for Redshift:

* [com.snowplowanalytics.snowplow/duplicate_1.sql] [duplicate-ddl]

<h2 id="roadmap">5. Roadmap</h2>

As well as the cross-batch deduplication mentioned above, upcoming Snowplow releases include:

* [R8x [HAD] Cross-batch natural deduplication] [r8x-crossbatch-dedupe], removing duplicates across ETL runs using an event manifest in DynamoDB
* XXXX
* [R8x [HAD] 4 webhooks] [r8x-webhooks], which will add support for 4 new webhooks (Mailgun, Olark, Unbounce, StatusGator)

Note that these releases are always subject to change between now and the actual release date.

<h2 id="help">6. Getting help</h2>

For more details on this release, please check out the [release notes] [snowplow-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

[chichen-itza-mexico]: https://en.wikipedia.org/wiki/Chichen_Itza
[chichen-itza-mexico-img]: /assets/img/blog/2016/12/petra-jordan.jpg

[snowplow-release]: https://github.com/snowplow/snowplow/releases/r87-chichen-itza

[snowplow-lambda-architecture]: http://discourse.snowplowanalytics.com/t/how-to-setup-a-lambda-architecture-for-snowplow/249
[s3distcp]: http://docs.aws.amazon.com/emr/latest/ReleaseGuide/UsingEMR_s3distcp.html
[2888]: https://github.com/snowplow/snowplow/issues/2888

[r8x-crossbatch-dedupe]: https://github.com/snowplow/snowplow/milestone/136

[r8x-webhooks]: https://github.com/snowplow/snowplow/milestone/129

[issues]: https://github.com/snowplow/snowplow/issues/new
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
