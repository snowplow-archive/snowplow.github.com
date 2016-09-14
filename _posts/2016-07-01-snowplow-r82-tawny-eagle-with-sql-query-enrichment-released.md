---
layout: post
title-short: Snowplow 82 Tawny Eagle
title: "Snowplow 82 Tawny Eagle with SQL Query Enrichment released"
tags: [snowplow, enrichment, iglu, api, sql]
author: Anton
category: Releases
---

We are pleased to announce the release of [Snowplow 82 Tawny Eagle] [snowplow-release]. This release brings new SQL Query Enrichment as well as support of POST requests in our Iglu webhook Adapter and several important bugfixes.

1. [SQL Query Enrichment](/blog/2016/07/01/snowplow-r82-tawny-eagle-with-sql-query-enrichment-released#sql-query-enrichment)
2. [HTTP POST support for Iglu Adapter Webhook](/blog/2016/07/01/snowplow-r82-tawny-eagle-with-sql-query-enrichment-released#iglu-adapter-post)
3. [Other improvements](/blog/2016/07/01/snowplow-r82-tawny-eagle-with-sql-query-enrichment-released#other)
4. [Upgrading](/blog/2016/07/01/snowplow-r82-tawny-eagle-with-sql-query-enrichment-released#upgrading)
5. [Roadmap](/blog/2016/07/01/snowplow-r82-tawny-eagle-with-sql-query-enrichment-released#roadmap)
6. [Getting help](/blog/2016/07/01/snowplow-r82-tawny-eagle-with-sql-query-enrichment-released#help)

![tawny-eagle][tawny-eagle]

<!--more-->

<h2 id="sql-query-enrichment">1. SQL Query Enrichment</h2>

The [SQL Query Enrichment] [sql-query-enrichment] lets you perform _dimension widening_ on an incoming Snowplow event using company's own internal data stored in SQL tables. This is our second enrichment after [API Request Enrichment] [api-request-enrichment] in a row of highly flexible enrichments that allow you to JOIN your events with data from custom data sources, like closed CRM or EPM databases.

With SQL Query Enrichment you can build SQL query from some prepared statement and dynamically fill placeholders with data deliberately extracted from incoming events, and then perform this constructed query against your SQL database. Result of query will be attached back to your event as a separate derived context with predefined schema URI.

Configuration of SQL Query enrichment closely resembles one from [API Request Enrichment] [api-request-enrichment], while HTTP-specific configuration replaced with SQL-specific. Yet again, it share similar logic: it tries to extract values from `EnrichedEvent` POJO properties, matched unstructured event or matched contexts. And if all placeholders were substituted succesully - query get executed and each returned column transformed into flat JSON object, where each key corresponds to some column's name.

For a detailed walk-through of the SQL Query Enrichment, check out our new tutorial, **[TUTORIAL TODO] [TUTORIAL-TODO]**. If you are interested in more deep concise and technical overview - you can find detailed description on the [SQL Query Enrichment] [sql-query-enrichment] page on the Snowplow wiki.

<h2 id="http-header-extractor-enrichment">2. HTTP POST support for Iglu Adapter</h2>

WIP: Iglu Adapter Webhook overview.

<h2 id="other">3. Other improvements</h2>

We have also:

* Fixed bug in EmrEtlRunner with double compression in shred step if enrich step was skipped ([#2586] [issue-2586])


<h2 id="upgrading">4. Upgrading</h2>

The latest version of the EmrEtlRunner and StorageLoader are available from our Bintray [here] [app-dl].

<h3>config.yml</h3>

Also you will need to update the `hadoop_enrich` jar versions in the `enrich` section:

{% highlight yaml %}
versions:
  hadoop_enrich: 1.8.0        # WAS 1.8.0
  hadoop_shred: 0.9.0         # UNCHANGED
  hadoop_elasticsearch: 0.1.0 # UNCHANGED
{% endhighlight %}

For a complete example, see our [sample `config.yml` template][emretlrunner-config-yml].

<h2 id="roadmap">6. Roadmap</h2>

* [r83 Bird TBC] [r83-milestone]

<h2 id="help">7. Getting help</h2>

For more details on this release, please check out the [release notes][snowplow-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[tawny-eagle]: /assets/img/blog/2016/07/tawny-eagle.jpg

[js-enrichment]: https://github.com/snowplow/snowplow/wiki/JavaScript-script-enrichment
[api-request-enrichment]: https://github.com/snowplow/snowplow/wiki/API-Request-enrichment
[sql-query-enrichment]: https://github.com/snowplow/snowplow/wiki/API-Request-enrichment

[enrichment-configs]: https://github.com/snowplow/snowplow/tree/master/3-enrich/config/enrichments

[issue-2586]: https://github.com/snowplow/snowplow/issues/2586

[r83-milestone]: https://github.com/snowplow/snowplow/issues?q=is%3Aopen+is%3Aissue+milestone%3A%22Release+83+%5BHAD%5D+Bird+TBC%22

[app-dl]: http://dl.bintray.com/snowplow/snowplow-generic/snowplow_emr_r82_tawny_eagle.zip

[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample

[snowplow-release]: https://github.com/snowplow/snowplow/releases/r82-tawny-eagle
[wiki]: https://github.com/snowplow/snowplow/wiki
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[changelog]: https://github.com/snowplow/snowplow/blob/master/CHANGELOG
