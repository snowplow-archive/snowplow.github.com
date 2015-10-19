---
layout: post
title: Snowplow 72 Great Spotted Kiwi released
title-short: Snowplow 72 Great Spotted Kiwi
tags: [snowplow, deduplication, click tracking, uri redirect, cookie]
author: Alex
category: Releases
---

We are pleased to announce the release of Snowplow version 72 Great Spotted Kiwi. This release adds the ability to track clicks through the Snowplow Clojure Collector, adds a cookie extractor enrichment and introduces new deduplication queries leveraging R71's event fingerprint.

The rest of this post will cover the following topics:

1. [Click tracking](/blog/2015/10/15/snowplow-r72-great-spotted-kiwi-released#click-tracking)
2. [New cookie extractor enrichment](/blog/2015/10/15/snowplow-r72-great-spotted-kiwi-released#cookie-extractor)
3. [New deduplication queries](/blog/2015/10/15/snowplow-r72-great-spotted-kiwi-released#deduplication)
4. [Upgrading](/blog/2015/10/15/snowplow-r72-great-spotted-kiwi-released#upgrading)
5. [Getting help](/blog/2015/10/15/snowplow-r72-great-spotted-kiwi-released#help)
6. [Upcoming releases](/blog/2015/10/15/snowplow-r72-great-spotted-kiwi-released#roadmap)

![great-spotted-kiwi][great-spotted-kiwi]

<!--more-->

<h2 id="click-tracking">1. Click tracking</h2>

Although the Snowplow JavaScript Tracker offers [link click tracking] [js-clicks], there are scenarios where you want to track a link click without having access to JavaScript. Two common examples are: tracking clicks on ad units, and users downloading files using `curl` or `wget`.

To support these use cases we have added a new URI redirect mode into the Clojure Collector. You update your link's URI to point to your event collector, and the collector receives the click, logs a URI redirect event and then performs a 302 redirect to the intended URI. This is the exact model followed by ad servers to track ad clicks.

To use this functionality:

* Set your collector path to `{{collector-domain}}/r/tp2?{{name-value-pairs}}` - the `/r/tp2` tells Snowplow that you are attempting a URI redirect
* Add a `&u={{uri}}` argument to your collector URI, where `{{uri}}` is your URL-encoded final URI to redirect to
* On clicking this link, the collector will register the link and then do a 302 redirect to the supplied `{{uri}}`
* As well as the &u={{uri}} parameter, you can populate the collector URI with any other fields from the Snowplow Tracker Protocol

The URI redirection will be recorded using the JSON Schema [com.snowplowanalytics.snowplow/uri_redirect/jsonschema/1-0-0] [uri-redirect-schema].

For more information on how this functionality works, check out the [Click tracking section] [click-tracking-docs] in our Pixel Tracker documentation.

We will be adding this capability into the Scala Stream Collector in [Release 74] [r74-milestone].

<h2 id="cookie-extractor">2. New cookie extractor enrichment</h2>

One powerful attribute of having Snowplow event collection on your own domain (e.g. `events.snowplowanalytics.com`) is the ability to capture first-party cookies set by other services on your domain such as ad servers or CMSes; these cookies are stored as HTTP headers in the Thrift raw event payload by the Scala Stream Collector.

Prior to this release there was no way of accessing these cookies in the Snowplow Enrichment process - until now, with Snowplow community member [Kacper Bielecki] [kazjote]'s new Cookie Extractor Enrichment. This is our first community-contributed enrichment - a huge milestone and hopefully the first of many! Thanks so much Kacper.

The [example configuration JSON] [example-cookie-extractor] for this enrichment is as follows:

{% highlight json %}
{
    "schema": "iglu:com.snowplowanalytics.snowplow/cookie_extractor_config/jsonschema/1-0-0",
    "data": {
        "name": "cookie_extractor_config",
        "vendor": "com.snowplowanalytics.snowplow",
        "enabled": true,
        "parameters": {
            "cookies": ["sp"]
        }
    }
}
{% endhighlight %}

This default configuration is capturing the Scala Stream Collector's own `sp` cookie - in practice you would probably extract other more valuable cookies available on your company domain. Each extracted cookie will end up a single derived context following the JSON Schema [org.ietf/http_cookie/jsonschema/1-0-0] [http-cookie-schema].

For more information see the [Cookie extractor enrichment] [cookie-extractor-docs] page on the Snowplow wiki.

Please note that this enrichment only works with events recorded by the Scala Stream Collector - the CloudFront and Clojure Collectors do not capture HTTP headers.

<h2 id="deduplication">3. New deduplication queries</h2>

This release comes with [3 new SQL scripts][deduplication-queries] that deduplicate events in Redshift using the event fingerprint that was introduced in [Snowplow R71][r71]. For more information on duplicates, see the [recent blogpost][duplicate-event-post] that explores the phenomenon in more detail.

The [first script][01-events] deduplicates rows with the same `event_id` and `event_fingerprint`. Because these events are identical, the script leaves the earliest one in atomic and moves all others to a separate schema. There is an optional last step that also moves all remaining duplicates (same `event_id` but different `event_fingerprint`). Note that this could delete legitimate events from atomic.

The [second][02-events-without-fingerprint] is an optional script that deduplicates rows with the same `event_id` where at least one row has no `event_fingerprint` (older events). The script is identical to the first script, except that an event fingerprint is generated in SQL.

The [third script][03-example-unstruct] is a template that can be used to deduplicate unstructured event or custom context tables. Note that contexts can have legitimate duplicates (e.g. 2 or more product contexts that join to the same parent event). If that is the case, make sure that the context is defined in such a way that no 2 identical contexts are ever sent with the same event. The script combines rows when all fields but `root_tstamp` are equal. There is an optional last step that moves all remaining duplicates (same `root_id` but at least one field other than `root_tstamp` is different) from atomic to duplicates. Note that this could delete legitimate events from atomic.

These scripts can be run after each load using [SQL Runner][sql-runner]. Make sure to run the [setup queries][setup-queries] first.

<h2 id="upgrading">4. Upgrading</h2>

<h3>Upgrading the Clojure Collector</h3>

This release bumps the Clojure Collector to version **1.1.0**.

To upgrade to this release:

1. Download the new warfile by right-clicking on [this link] [war-download] and selecting "Save As..."
2. Log in to your Amazon Elastic Beanstalk console
3. Browse to your Clojure Collector's application
4. Click the "Upload New Version" and upload your warfile

<h3>Updating the configuration files</h3>

You need to update the version of the Enrich jar in your configuration file:

{% highlight yaml %}
    hadoop_enrich: 1.2.0 # Version of the Hadoop Enrichment process
{% endhighlight %}

If you wish to use the new cookie extractor enrichment, write a configuration JSON and add it to your enrichments folder. The example JSON can be found [here][example-cookie-extractor].

<h3>Updating your database</h3>

Install the following tables in Redshift as required:

* For the new URI redirect functionality, [com_snowplowanalytics_snowplow_uri_redirect_1] [uri-redirect-ddl]
* For the new cookie extractor enrichment, [org_ietf_http_cookie_1] [cookie-ddl]

<h2 id="help">5. Getting help</h2>

For more details on this release, please check out the [R72 Great Spotted Kiwi release notes][r72-release] on GitHub. Specific documentation on the two new features is available here:

* The [Click tracking section] [click-tracking-docs] in our Pixel Tracker documentation
* The [Cookie extractor enrichment] [cookie-extractor-docs] page

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

<h2 id="help">6. Upcoming releases</h2>

By popular request, we are adding a section to these release blog posts to trail upcoming Snowplow releases. Note that these releases are always subject to change between now and the actual release date.

Upcoming releases are:

* [Release 73 Cuban Macaw] [r73-milestone], which removes the JSON fields from `atomic.events` and adds the ability to load bad rows into Elasticsearch
* [Release 74 Bird TBC] [r74-milestone], which brings the Kinesis pipeline up-to-date with the most recent Scala Common Enrich releases. This will also include click redirect support in the Scala Stream Collector

Other milestones being actively worked on include [Avro support #1] [avro-milestone], [Weather enrichment] [weather-milestone] and [Snowplow CLI #2] [cli-milestone].

[great-spotted-kiwi]: /assets/img/blog/2015/10/great-spotted-kiwi.jpg

[js-clicks]: https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#enableLinkClickTracking
[click-tracking-docs]: https://github.com/snowplow/snowplow/wiki/pixel-tracker#click-tracking
[uri-redirect-schema]: http://iglucentral.com/schemas/com.snowplowanalytics.snowplow/uri_redirect/jsonschema/1-0-0
[war-download]: http://s3-eu-west-1.amazonaws.com/snowplow-hosted-assets/2-collectors/clojure-collector/clojure-collector-1.1.0-standalone.war
[uri-redirect-ddl]: https://raw.githubusercontent.com/snowplow/snowplow/release/r72/4-storage/redshift-storage/sql/com.snowplowanalytics.snowplow/uri_redirect_1.sql

[example-cookie-extractor]: https://github.com/snowplow/snowplow/blob/master/3-enrich/config/enrichments/cookie_extractor_config.json
[kazjote]: https://github.com/kazjote
[cookie-extractor-docs]: https://github.com/snowplow/snowplow/wiki/Cookie-extractor-enrichment
[cookie-ddl]: https://raw.githubusercontent.com/snowplow/snowplow/master/4-storage/redshift-storage/sql/org.ietf/http_cookie_1.sql
[http-cookie-schema]: http://iglucentral.com/schemas/org.ietf/http_cookie/jsonschema/1-0-0

[setup-queries]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/setup/deduplicate/setup.sql
[deduplication-queries]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/sql/deduplicate
[01-events]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/sql/deduplicate/01-events.sql
[02-events-without-fingerprint]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/sql/deduplicate/02-events-without-fingerprint.sql
[03-example-unstruct]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/sql/deduplicate/03-example-unstruct.sql
[duplicate-event-post]: /blog/2015/08/19/dealing-with-duplicate-event-ids/
[r71]: /blog/2015/10/02/snowplow-r71-stork-billed-kingfisher-released/#fingerprint
[sql-runner]: https://github.com/snowplow/sql-runner

[r72-release]: https://github.com/snowplow/snowplow/releases/tag/r72-great-spotted-kiwi
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

[r73-milestone]: https://github.com/snowplow/snowplow/milestones/Release%2073%20%5BHAD%5D%20Cuban%20Macaw
[r74-milestone]: https://github.com/snowplow/snowplow/milestones/Release%2074%20%5BKIN%5D%20Bird%20TBC
[avro-milestone]: https://github.com/snowplow/snowplow/milestones/Avro%20support%20%231
[weather-milestone]: https://github.com/snowplow/snowplow/milestones/Weather%20enrichment
[cli-milestone]: https://github.com/snowplow/snowplow/milestones/Snowplow%20CLI%20%232
