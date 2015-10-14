---
layout: post
title: Snowplow 72 Great Spotted Kiwi released
title-short: Snowplow 72 Great Spotted Kiwi
tags: [snowplow, deduplication, click tracking, uri redirect, cookie]
author: Alex
category: Releases
---

We are pleased to announce the release of Snowplow version 72 Great Spotted Kiwi. This release XXX.

The rest of this post will cover the following topics:

1. [Click tracking](/blog/2015/10/15/snowplow-r71-stork-billed-kingfisher-released#click-tracking)
2. [New cookie extractor enrichment](/blog/2015/10/15/snowplow-r71-stork-billed-kingfisher-released#cookie-extractor)
3. [New deduplication queries](/blog/2015/10/15/snowplow-r71-stork-billed-kingfisher-released#deduplication)
4. [Upgrading](/blog/2015/10/15/snowplow-r71-stork-billed-kingfisher-released#upgrading)
5. [Getting help](/blog/2015/10/15/snowplow-r71-stork-billed-kingfisher-released#help)
6. [Upcoming releases](/blog/2015/10/15/snowplow-r71-stork-billed-kingfisher-released#roadmap)

![great-spotted-kiwi][great-spotted-kiwi]

<!--more-->

<h2 id="click-tracking">1. Click tracking</h2>

Add in here.

FOR MORE INFO: xxx

<h2 id="cookie-extractor">2. New cookie extractor enrichment</h2>

Snowplow community member [XXX] [xxx] has contributed XXX

The [example configuration JSON] [example-cookie-extractor] for this enrichment is as follows:

{% highlight json %}
XXX
{% endhighlight %}

FOR MORE INFO:

<h2 id="deduplication">3. New deduplication queries</h2>

This release comes with [3 new SQL scripts][deduplication-queries] that deduplicate events in Redshift using the event fingerprint that was introduced in [Snowplow R71][r71]. For more information on duplicates, see the [recent blogpost][duplicate-event-post] that explores the phenomenon in more detail.

The [first script][01-events] deduplicates rows with the same `event_id` and `event_fingerprint`. Because these events are identical, the script leaves the earliest one in atomic and moves all others to a separate schema. There is an optional last step that also moves all remaining duplicates (same `event_id` but different `event_fingerprint`). Note that this could delete legitimate events from atomic.

The [second][02-events-without-fingerprint] is an optional script that deduplicates rows with the same `event_id` where at least one row has no `event_fingerprint` (older events). The script is identical to the first script, except that an event fingerprint is generated in SQL.

The [third script][03-example-unstruct] is a template that can be used to deduplicate unstructured event or custom context tables. Note that contexts can have legitimate duplicates (e.g. 2 or more product contexts that join to the same parent event). If that is the case, make sure that the context is defined in such a way that no 2 identical contexts are ever sent with the same event. The script combines rows when all fields but `root_tstamp` are equal. There is an optional last step that moves all remaining duplicates (same `root_id` but at least one field other than `root_tstamp` is different) from atomic to duplicates. Note that this could delete legitimate events from atomic.

These scripts can be run after each load using [SQL Runner][sql-runner]. Make sure to run the [setup queries][setup-queries] first.

<h2 id="upgrading">10. Upgrading</h2>

<h3>Updating the configuration files</h3>

You should update the versions of the Enrich jar in your configuration file:

{% highlight yaml %}
    hadoop_enrich: 1.2.0 # Version of the Hadoop Enrichment process
{% endhighlight %}

If you wish to use the new cookie extractor enrichment, write a configuration JSON and add it to your enrichments folder. The example JSON can be found [here][example-cookie-extractor].

<h3>Updating your database</h3>

To use the new cookie extractor enrichment XXX.

<h2 id="help">5. Getting help</h2>

For more details on this release, please check out the [R72 Great Spotted Kiwi release notes][r72-release] on GitHub. Specific documentation on the two new features is available here:

XXX

XXX

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

<h2 id="help">6. Upcoming releases</h2>

By popular request, we are adding a section to these release blog posts to trail upcoming Snowplow releases. Note that these releases are always subject to change between now and the actual release date.

Upcoming releases are:

* [Release 73 Cuban Macaw] [r73-milestone], which removes the JSON fields from `atomic.events` and adds the ability to load bad rows into Elasticsearch
* [Release 74 Bird TBC] [r74-milestone], which brings the Kinesis pipeline up-to-date with the most recent Scala Common Enrich releases

Other milestones being actively worked on include [Avro support #1] [avro-milestone], [Weather enrichment] [weather-milestone] and [Snowplow CLI #2] [cli-milestone].

[great-spotted-kiwi]: /assets/img/blog/2015/10/great-spotted-kiwi.jpg

[setup-queries]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/setup/deduplicate/setup.sql
[deduplication-queries]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/sql/deduplicate
[01-events]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/sql/deduplicate/01-events.sql
[02-events-without-fingerprint]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/sql/deduplicate/02-events-without-fingerprint.sql
[03-example-unstruct]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/sql/deduplicate/03-example-unstruct.sql

[duplicate-event-post]: /blog/2015/08/19/dealing-with-duplicate-event-ids/
[r71]: /blog/2015/10/02/snowplow-r71-stork-billed-kingfisher-released/#fingerprint

[sql-runner]: https://github.com/snowplow/sql-runner

[example-cookie-extractor]: https://github.com/snowplow/snowplow/blob/master/3-enrich/config/enrichments/xxx.json
[cookie-extractor-enrichment]: https://github.com/snowplow/snowplow/wiki/Event-fingerprint-enrichment

[r72-release]: https://github.com/snowplow/snowplow/releases/tag/r72-great-spotted-kiwi
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

[r73-milestone]: https://github.com/snowplow/snowplow/milestones/Release%2073%20%5BHAD%5D%20Cuban%20Macaw
[r74-milestone]: https://github.com/snowplow/snowplow/milestones/Release%2074%20%5BKIN%5D%20Bird%20TBC
[avro-milestone]: xxx
[weather-milestone]: yyy
[cli-milestone]: xxx
