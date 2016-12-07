---
layout: post
title-short: Snowplow 86 Petra
title: "Snowplow 86 Petra released"
tags: [snowplow, sql, data modeling, duplicates, event duplication, de-dupe, de-duplication]
author: Anton
category: Releases
---

We are pleased to announce the release of [Snowplow 86 Petra] [snowplow-release]. This release introduces additional event de-duplication functionality for our Redshift load process, plus [[POINT ABOUT SQL DATA MODELING]]. This release also adds support for Ohio XXXXXXXXX.

1. [DEDUPE](/blog/2016/09/06/snowplow-r83-bald-eagle-released-with-sql-query-enrichment#synthetic-dedupe)
2. [NEW SQL DATA MODELING](/blog/2016/09/06/snowplow-r83-bald-eagle-released-with-sql-query-enrichment#sql-data-modeling)
3. [Support for us-east-2 (Ohio)](/blog/2016/09/06/snowplow-r83-bald-eagle-released-with-sql-query-enrichment#us-east-2)
4. [Upgrading](/blog/2016/09/06/snowplow-r83-bald-eagle-released-with-sql-query-enrichment#upgrading)
5. [Roadmap](/blog/2016/09/06/snowplow-r83-bald-eagle-released-with-sql-query-enrichment#roadmap)
6. [Getting help](/blog/2016/09/06/snowplow-r83-bald-eagle-released-with-sql-query-enrichment#help)

![petra-jordan][petra-jordan]

<!--more-->

<h2 id="sql-query-enrichment">1. DEDUPE</h2>

XXXX

<h2 id="sql-data-modeling">2. NEW SQL DATA MODELING</h2>

XXXX

<h2 id="other">4. Ohio</h2>

We are delighted to be finally adding support for the XXXXXX [EU Frankfurt] [region-eu-central-1] (eu-central-1) XXXXXXXX AWS region in this release, following on from EU Frankfurt (eu-central-1) in R83 Bald Eagle.

AWS has a healthy [roadmap of new data center regions] [region-roadmap] opening over the coming months; we are committed to Snowplow supporting these new regions as they become available.

ALEX TO ADD

<h2 id="upgrading">5. Upgrading</h2>

Upgrading is simple - update the `hadoop_enrich` job version in your configuration YAML like so:

{% highlight yaml %}
versions:
  hadoop_enrich: 1.8.0        # UNCHANGED
  hadoop_shred: 0.10.0        # WAS 0.9.0
  hadoop_elasticsearch: 0.1.0 # UNCHANGED
{% endhighlight %}

For a complete example, see our [sample `config.yml` template][emretlrunner-config-yml].

ALEX - ADD PARA ON DEPLOYING THE NEW DUPES TABLE.

<h2 id="roadmap">X. Roadmap</h2>

XXXXXXX We have renamed the upcoming milestones for Snowplow to be more flexible around the ultimate sequencing of releases XXXXX. Upcoming Snowplow releases XXXXXXXXXX include:

* [R8x xxx] [xxx] stability XXXXXXXXXXXXXXXXXXX
* [R8x [HAD] 4 webhooks] [r8x-webhooks], which will add support for 4 new webhooks (Mailgun, Olark, Unbounce, StatusGator)
* [R8x [HAD] DashDB support] [xxxx], xxxx

Note that these releases are always subject to change between now and the actual release date.

<h2 id="help">X. Getting help</h2>

For more details on this release, please check out the [release notes] [snowplow-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

[petra-jordan]: /assets/img/blog/2016/12/xxxxxx
[snowplow-release]: https://github.com/snowplow/snowplow/releases/r86-petra

[region-ohio]: https://aws.amazon.com/blogs/aws/aws-region-germany/
[region-roadmap]: https://aws.amazon.com/about-aws/global-infrastructure/

[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample

[r8x-webhooks]: https://github.com/snowplow/snowplow/milestone/129
[r8x-spark]: https://github.com/snowplow/snowplow/milestone/127

[issues]: https://github.com/snowplow/snowplow/issues/new
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
