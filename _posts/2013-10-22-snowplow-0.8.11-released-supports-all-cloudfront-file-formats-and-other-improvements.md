---
layout: post
title: Snowplow 0.8.11 released - supports all Cloudfront log file formats and host of small improvements for power users
title-short: Snowplow 0.8.11
tags: [snowplow release, ip annonymization, privacy, cloudfront logfile format]
author: Alex
category: Releases
---

We're very pleased to announce the release of Snowplow 0.8.11. This releases includes two different sets of updates:

1. **Critical update**: support for Amazon's new Cloudfront log file format (rolled out by Amazon during 21st October 2013)
2. **Nice-to-have** additions - the most significant of which is **IP anonymization**

We'll discuss the updates one at a time, before covering how to [upgrade to the latest version](#upgrade).

1. [Critical upgrade: support for Amazon's new CloudFront log file format](/blog/2013/10/22/snowplow-0.8.11-released-supports-all-cloudfront-file-formats-and-other-improvements/#critical)
2. [IP address anonymization](/blog/2013/10/22/snowplow-0.8.11-released-supports-all-cloudfront-file-formats-and-other-improvements/#ip)
3. [Other updates](/blog/2013/10/22/snowplow-0.8.11-released-supports-all-cloudfront-file-formats-and-other-improvements/#other)
4. [Upgrading](/blog/2013/10/22/snowplow-0.8.11-released-supports-all-cloudfront-file-formats-and-other-improvements/#upgrade)

Before we dive into the detail, thanks to community members [Rob Kingson] [kingo] and  [Simon Rumble] [shermozle] for contributing to this release.

<a name="critical"><h2>1. Critical upgrade: support for Amazon's new CloudFront log file format</h2></a>

Since August, Amazon has made a number of changes to their CloudFront log file format, the most recent of which was pushed live yesterday:

| **Cloudfront log file format**   | **Description**                                                                          |
|:---------------------------------|:-----------------------------------------------------------------------------------------|
| Original format                  | The original CloudFront log file format, around which Snowplow was originally developed. |
| 12 Sep 2012 - 17 Aug 2013 format | The original format with three new fields appended.                                      |
| August 17 unnanounced change     | Surprise change around the URI encoding of fields. See [the Google Group] [original-change] for details.           |
| September 14 resolution          | A new approach to URI encoding, different to the previous two. See [this forum thread] [forum-thread] for details. |
| October 21 update                | Amazon updated the latest log file format with three new fields. See [this post] [latest-update] for details.      |

<!--more-->

The latest version of Snowplow supports *all* the different versions of the file format listed above, including the new format that was rolled out yesterday. It is important to note that the October 21st CloudFront file format is **not** supported by previous Snowplow versions: as a result, we'd expect existing Snowplow users using the CloudFront collector to see a significant number of lines in their bad rows bucket in S3 with the following format:

{% highlight json %}
{
    "line": "2013-10-21\t18:49:02\tCDG51\t474\t80.10.159.93\tGET\td3dxd9302qh2q4.cloudfront.net\t/i\t200\thttp://www.mychoicepad.com/explore/\tMozilla/5.0%2520(iPad;%2520CPU%2520OS%25207_0_2%2520like%2520Mac%2520OS%2520X)%2520AppleWebKit/537.51.1%2520(KHTML,%2520like%2520Gecko)%2520Mobile/11A501\te=pp&page=Explore%2520MyChoicePad%2520-%2520the%2520educational%2520Makaton%2520iPad%2520app&;pp_mix=0&pp_max=67&pp_miy=1224&pp_may=1547&dtm=1382381340983&tid=031666&vp=980x1203&ds=980x2390&vid=1&duid=00ecea075c77a900&p=web&tv=js-0.11.2&fp=1956663502&aid=mychoicepadweb&lang=fr-fr&cs=UTF-8&tz=Europe%252FBerlin&refr=http%253A%252F%252Fwww.mychoicepad.com%252Fmychoicepad%252F&f_pdf=0&f_qt=1&f_realp=0&f_wma=0&f_dir=0&f_fla=0&f_java=0&f_gears=0&f_ag=0&res=768x1024&cd=32&cookie=1&url=http%253A%252F%252Fwww.mychoicepad.com%252Fexplore%252F\t-\tHit\tMBBAElwDr_1_43BnXPZxQwl_PWv0x90I2uu2qXzYOxV5HSsFUAgXaw==\td3dxd9302qh2q4.cloudfront.net\thttp\t823",
    "errors": [
        "Line does not match CloudFront header or data row formats"
    ]
}
{% endhighlight %}

Once you have [upgraded your Snowplow installation to the latest version](#upgrade), you will need to reprocess those bad rows. Instructions on how to do so are given [in this blog post] [reprocess-bad-rows].

<div class="html">
<a name="ip"><h2>2. IP address anonymization</h2></a>
</div>

As well as the critical update, there are a number of *nice-to-have* features bundled in this release. Chief amongst them is IP anonymization. The enrichment process can now be configured to mask IP addresses, so that privacy-conscious Snowplow users can prevent IP addresses being visible to analysts.

Snowplow administrators can setup IP masking via the EmrEtlRunner config file. Instructions on how to do this can be found in the [section on upgrading](#upgrade) below.

<div class="html">
<a name="other"><h2>3. Other updates</h2></a>
</div>

Under the hood, there are a large number of updates we've made to make Snowplow more robust, performant and support developments on our [product roadmap] [product-roadmap]. You can view the [complete changelog here] [changelog].

The most important of these updates is an update to the StorageLoader to make loading into PostgreSQL more robust, by fixing an issue where Postgres was accidentally escaping tabs in the file format, breaking the load. Many thanks to community member [Rob Kingston] [kingo] for contributing this update.

There are also some additional command-line options for our two Ruby apps which should make the Snowplow Enrichment process more flexible:

* Run EmrEtlRunner with `--debug` to make Elastic MapReduce's job debugging available
* Run StorageLoader with `--include vacuum` if you want to include a `VACUUM` step after your table load
* Run StorageLoader with `--skip analyze` if you **don't** need to run a table `ANALYZE` step after your table load
* Run StorageLoader with `--include compupdate` if you want to (re-)generate the compression encodings on your table's fields. This setting uses the new `:comprows:` parameter in the `config.yml` file - see [section 4.2](#storage-loader) below for details

Finally, there are a set of "under the hood" stability and performance and improvements in this release.

**For the definitive list of updates in this release, please see the [v0.8.11 Release Notes] [release-notes] on GitHub.**

<div class="html">
<a name="upgrade" ><h2>4. Upgrading</h2></a>
</div>

Upgrading is a three step process:

4.1 [Update EmrEtlRunner](#emr-etl-runner)
4.2 [Update StorageLoader](#storage-loader)
4.3 [Reprocess any "bad rows"](#reprocess) collected from before the upgrade was completed  

Let's take these in term:

<div class="html">
<a name="emr-etl-runner"><h3>4.1 Update the EmrEtlRunner</h3></a>
</div>

You need to update EmrEtlRunner to the latest code (0.8.11 release) on Github:

{% highlight bash %}
$ git clone git://github.com/snowplow/snowplow.git
$ git checkout 0.8.11
$ cd snowplow/3-enrich/emr-etl-runner
$ bundle install --deployment
{% endhighlight %}

You also need to update the `config.yml` file for EmrEtlRunner to use the latest version of the Hadoop ETL (0.3.5):

{% highlight yaml %}
:snowplow:
  :hadoop_etl_version: 0.3.5
{% endhighlight %}

In addition, you need to add a new "enrichments" section in the `config.yml` file:

{% highlight yaml %}
:enrichments:
  :anon_ip:
    :enabled: false
    :anon_octets: 1 # Or 2, 3 or 4. 0 is same as enabled: false
{% endhighlight %}

To enable IP enrichment, you need to set `anon_ip.enabled` to true, and specify the level of anonymization with `anon_ip.anon_octets` field. If, for example, my IP address is '37.157.33.178', then setting it to different values between 0 and 4 would anonymize my IP address as follows:

| `anon_ip.anon_octets` value             | IP address displayed in Snowplow |
|-----------------------------------------|----------------------------------|
| 0                                       | 37.157.33.178                    |
| 1                                       | 37.157.33.x                      |
| 2                                       | 37.157.x.x                       |
| 3                                       | 37.x.x.x                         |
| 4                                       | x.x.x.x                          |

To see a complete example of the EmrEtlRunner `config.yml` file, see the [Github repo] [emretlrunner-config].

<div class="html">
<a name="storage-loader"><h3>4.2 Update the StorageLoader</h3></a>
</div>

You need to upgrade your StorageLoader installation to the latest code (0.8.11) on Github:

{% highlight bash %}
$ git clone git://github.com/snowplow/snowplow.git
$ git checkout 0.8.11
$ cd snowplow/4-storage/storage-loader
$ bundle install --deployment
{% endhighlight %}

The StorageLoader `config.yml` file includes a new `:comprows:` option for Redshift users. This determines the number of rows that Amazon analyzes in order to determine the best compression encoding format to use for each of the fields in your Redshift event table. Note that this is **only** used if the `--include compupdate` option is specified when running the StorageLoader. For more information on Amazon's `comprows` functionality, see the [Redshift documentation] [comprows-redshift].

An example `config.yml` for StorageLoader for Redshift users, including the new setting, can be found [on Github] [storageloader-config].

<div class="html">
<a name="reprocess"><h3>4.3 Reprocess any "bad rows" generated between October 21st and your upgrade</h3></a>
</div>

As described above, if you have been using the CloudFront collector, you will have a number of rows of data in your "bad bucket" on S3 generated after the new CloudFront log file format was rolled out on October 21st, because these data rows were not supported by the old version of the Snowplow.

You need to reprocess these rows so they are not missing from your final data set. For detailed instructions on how to do this, see [our guide to reprocessing bad data in Snowplow] [reprocess-bad-rows].

[reprocess-bad-rows]: /blog/2013/09/11/reprocessing-bad-data-using-hive-the-json-serde-and-qubole/
[original-change]: https://groups.google.com/forum/#!topic/snowplow-user/HWeSkiiXbdQ
[forum-thread]: https://forums.aws.amazon.com/message.jspa?messageID=491582
[latest-update]: https://forums.aws.amazon.com/ann.jspa?annID=2174&ref_=pe_411040_33444690_11#
[changelog]: https://github.com/snowplow/snowplow/blob/feature/improve-etl/CHANGELOG
[product-roadmap]: https://github.com/snowplow/snowplow/wiki/Product%20roadmap
[emretlrunner-config]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample
[comprows-redshift]: http://docs.aws.amazon.com/redshift/latest/dg/r_COPY.html
[storageloader-config]: https://github.com/snowplow/snowplow/blob/master/4-storage/storage-loader/config/redshift.yml.sample
[kingo]: https://github.com/kingo55
[shermozle]: https://github.com/shermozle
[release-notes]: https://github.com/snowplow/snowplow/releases/tag/0.8.11
