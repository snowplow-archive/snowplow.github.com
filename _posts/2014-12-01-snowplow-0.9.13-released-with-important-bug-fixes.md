---
layout: post
title: Snowplow 0.9.13 released with important bug fixes
title-short: Snowplow 0.9.13
tags: [snowplow, enrichment, bug]
author: Fred
category: Releases
---

We are happy to announce the release of Snowplow 0.9.13 fixing two bugs found in last week's release. Read on for more information.

1. [Safer URI parsing](/blog/2014/12/01/snowplow-0.9.13-released-with-important-bug-fixes/#uri)
2. [Fixed dependency conflict](/blog/2014/12/01/snowplow-0.9.13-released-important-bug-fixes/#conflict)
3. [Upgrading](/blog/2014/12/01/snowplow-0.9.13-released-important-bug-fixes/#upgrading)
4. [Help](/blog/2014/12/01/snowplow-0.9.13-released-important-bug-fixes/#help)

<!--more-->

<h2><a name="uri">1. Safer URI parsing</a></h2>

Version 0.9.12 used the [Net-a-Porter URI library][netaporter] to fix up non-compliant URIs which initially failed validation. This made the enrichment process more forgiving of bad URIs. It also introduced a bug: exceptions thrown by the new step were not caught. This release fixes that bug: if a URI fails being parsed by Net-a-Porter, the exception will be caught and the event will fail validation (ending up in bad rows) in the usual way. Thanks to Robert Kingston for bringing this bug to our attention!

<h2><a name="conflict">2. Fixed dependency conflict</a></h2>

The introduction of Net-a-Porter in Common Enrich caused a dependency conflict with the version of [Specs2][specs2] in Kinesis Enrich. Thanks to Konstantinos Servis (@knservis on GitHub), whose pull request fixed this by changing the Specs2 version to prevent the conflict!

<h2><a name="upgrading">3. Upgrading</a></h2>

This release bumps Common Enrich to 0.9.1, Hadoop Enrich to version 0.10.1, and Kinesis Enrich to 0.2.1.

The new Hadoop Enrich and Kinesis Enrich versions are publically available on S3:

    s3://snowplow-hosted-assets/3-enrich/scala-kinesis-enrich/snowplow-kinesis-enrich-0.2.1
    s3://snowplow-hosted-assets/3-enrich/hadoop-etl/snowplow-hadoop-etl-0.10.1.jar

In your EmrEtlRunner's `config.yml` file, update your Hadoop enrich job's version to 0.10.1:

{% highlight yaml %}
  :versions:
    :hadoop_enrich: 0.10.1
{% endhighlight %}

For a complete example, see our [sample `config.yml` template] [emretlrunner-config-yml].

<h2><a name="help">4. Help</a></h2>

If you have any problems or any questions about this release, please [get in touch][talk-to-us]. And do [raise an issue][issues] if you find any bugs!

[netaporter]: https://github.com/Net-a-Porter/scala-uri
[specs2]: http://etorreborre.github.io/specs2/
[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues
