---
layout: post
shortenedlink: Snowplow 63 released
title: Snowplow 63 Red-Cheeked Cordon-Bleu released
tags: [snowplow, currency, gclid, useragent, ua_parser, forex, oer]
author: Alex
category: Releases
---

We are pleased to announce the immediate availability of Snowplow 63, Red-Cheeked Cordon-Bleu. This is a major release which adds two new enrichments, upgrades existing enrichments and significantly extends and improves our Canonical Event Model for loading into Redshift, Elasticsearch and Postgres.

![red-cheeked-cordon-bleu] [red-cheeked-cordon-bleu]

The new and upgraded enrichments are as follows:

1. New enrichment: parsing useragent strings using the `ua_parser` library
2. New enrichment: converting the money amounts in e-commerce transactions into a base currency using [Open Exchange Rates] [oer]
3. Upgraded: extracting click IDs in our campaign attribution enrichment
4. Upgraded: our existing MaxMind-powered IP lookups
5. Upgraded: useragent parsing using the `user_agent_utils` library can now be disabled

This release has been a huge team effort - with particular thanks going to Snowplow winterns [Aalekh Nigam] [aalekh] (2014/15) and [Jiawen Zhou] [jz4112] (2013/14) for their work on the new enrichments and the foundational [scala-forex library] [scala-forex] respectively.

Table of contents:

1. [New enrichment: useragent parsing using ua_parser](#uap)
2. [New enrichment: currency conversion for e-commerce transaction](#forex)
3. [Upgraded enrichment: click ID extraction for campaign attribution](#clid)
4. [Upgraded enrichment: timezone lookup from IP address using MaxMind](#tz)
5. [Upgraded enrichment: useragent parsing using user_agent_utils](#uau)
6. [Other improvements to Scala Common Enrich](#enrich)
7. [Updates to atomic.events](#events)
8. [Updates to the Kinesis applications](#kinesis)
9. [Upgrading your Snowplow pipeline](#upgrade)
10. [Getting help](#help)

<!--more-->

<h2><a name="uap">1. New enrichment: useragent parsing using ua_parser</a></h2>

Since close to its inception, Snowplow has used the [user-agent-utils] [user-agent-utils] Java library to perform useragent parsing. Various limitations with that library have led us to explore and evaluate other options, including the [ua-parser] [ua-parser] project with its [uap-java] [uap-java] library for the JVM. Testing suggests that this library handles some useragent strings (such as mobile app useragents) better than user-agent-utils.

As part of our move towards pluggable enrichments, from this release Snowplow users can employ user-agent-utils, or ua-parser, or both, or neither. We believe we are the first analytics platform to give users such a high degree of choice in their Enrichment process.

The behavior of user-agent-utils if enabled is unchanged; if ua-parser is enabled, then the Snowplow Enrichment process will write its results into a new context, [ua_parser_context] [ua-parser-schema].

For more details on this enrichment, see the [ua parser enrichment] [ua-parser-enrichment] wiki page.

<h2><a name="forex">2. New enrichment: currency conversion for e-commerce transactions</a></h2>

For more details on this enrichment, see the [Currency conversion enrichment] [currency-conversion-enrichment] wiki page.

<h2><a name="clid">3. Upgraded enrichment: click ID extraction for campaign attribution</a></h2>

Many advertising systems attach a globally unique "click ID" tracking parameter to destination URIs to help advertisers attribute clicks to campaigns. The most well known of these click IDs are `gclid` (Google), `msclkid` (Microsoft) and `dclid` (DoubleClick).

We have extended our existing campaign attribution enrichment to look for and extract the value assigned to this click ID, populating the `mkt_clickid` field with the click ID and the `mkt_network` field with the name of the network.

By default the campaign attribution enrichment identifies the three click IDs given above, but you can also configure the enrichment with your own list of click IDs and network names:

{% highlight json %}
{
    "schema": "iglu:com.snowplowanalytics.snowplow/campaign_attribution/jsonschema/1-0-1",

    "data": {

        "name": "campaign_attribution",
        "vendor": "com.snowplowanalytics.snowplow",
        "enabled": false,
        "parameters": {
            "mapping": "static",
            "fields": {
                ...
                "mktClickId": {
                	"gclid": "Google AdWords",
                    "customclid": "Private Network"
                }
            }
        }
    }
}
{% endhighlight %}

If you know of another click ID that would be useful to the wider Snowplow community, please do add it to [this ticket] [issue-1547].

For more details on this enrichment, see the [campaign attribution enrichment] [campaign-attribution-enrichment] wiki page.

<h2><a name="tz">4. Upgraded enrichment: timezone lookup from IP address using MaxMind</a></h2>

We have extended the IP lookup enrichment to extract the timezone information that MaxMind provides about an IP address. This timezone information is stored in a new field in the [Canonical Event Model] [canonical-event-model], `geo_timezone`.

For more details on this enrichment, see the [IP lookups enrichment] [ip-lookups-enrichment] wiki page.

<h2><a name="uau">5. Upgraded enrichment: useragent parsing using user_agent_utils</a></h2>

Our existing useragent parsing enrichment built on [user_agent_utils] [user_agent_utils] is no longer hardcoded to run - instead, it is now a user-configurable enrichment. The fields that it populates in `atomic.events` are unchanged.

To enable it to run as before, you **must** add in a JSON configuration file into your folder of enrichments. See [9.1.1 Configuring enrichments](#configuring-enrichments) for details.

For more details on this enrichment, see the [ua parser enrichment] [ua-parser-enrichment] wiki page.

<h2><a name="enrich">6. Other improvements to Scala Common Enrich</a></h2>

* used Netaporter to parse querystrings if httpclient fails, thanks @danisola! ([#1429] [issue-1429])
* populated refr_ fields based on page_url querystring ([#1461] [issue-1461])
* populated session_id field based on "sid" parameter ([#1541] [issue-1541])
* extracted dvce_sent_tstamp from stm field ([#1383] [issue1383-])
* bumped referer-parser to 0.2.3 ([#670] [issue-670])
* extracted original IP address from CollectorPayload headers ([#1372] [issue-1372])

<h2><a name="events">7. Updates to atomic.events</a></h2>

We have updated the Snowplow [Canonical Event Model] [canonical-event-model] to reflect the fields required by the new enrichments. The new fields required in `atomic.events` (whether Redshift or Postgres) are as follows:



ADD A TABLE OF FIELDS 

We have also made the following changes to the table definitions:

* xxx
* xxx
* xxx

```
Redshift: added refr_domain_userid and refr_dvce_tstamp to atomic.events (#1450)
Redshift: added dvce_sent_tstamp column (#1385)
Redshift: added foreign key constraint to all Redshift shredded tables (#1365)
Redshift: changed JSON field encodings to lzo (closes #1350)
Redshift: added migration script for 0.4.0 to 0.5.0 (#1335)
Redshift: added etl_tags column (#1245)
Redshift: removed primary key constraint on event_id (#1187)
Redshift: added column for mkt_clickid and mkt_network (#1093)
Redshift: widened domain_userid column to hold UUID (#1090)
Redshift: added Redshift DDL for ua_parser_context (#789)
Redshift: added new derived_contexts field (#784)
Redshift: updated ip_address to support IPv6 addresses (#656)
Redshift: added new currency fields (#366)
Redshift: added session_id column (#1539)
Postgres: added refr_domain_userid and refr_dvce_tsramp to atomic.events (#1451)
Postgres: added dvce_sent_tstamp column (#1386)
Postgres: added migration script for 0.3.0 to 0.4.0 (#1347)
Postgres: added column for geo_timezone (#1336)
Postgres: added etl_tags column (#1246)
Postgres: removed primary key constraint on event_id (#1187)
Postgres: added column for mkt_clickid and mkt_network (#1092)
Postgres: widened domain_userid column to hold UUID (#1091)
Postgres: added new derived_contexts field (#785)
Postgres: updated ip_address to support IPv6 addresses (#655)
Postgres: added new currency fields (#365)
Redshift: added session_id column (#1540)
```

<h2><a name="kinesis">8. Updates to the Kinesis applications</a></h2>

The main update to both Kinesis applications is to support the new enriched event format (see [7. Updates to atomic.events](#events) for details). Other noteworthy updates to the Scala Kinesis Enrich:

* The Scala Kinesis Enrich application now uses Scala Common Enrich 0.13.0, the latest version ([#1369] [issue-1369]). Previously it was using Scala Common Enrich 0.11.0. This means that you can take advantage of all the enrichment updates in the Kinesis flow, and it also brings the Kinesis flow up-to-date with the various [encoding-related fixes] [r62-encoding-fixes] implemented in Scala Common Enrich 0.12.0
* unified logger configuration, thanks @kazjote! ([#1367] [issue-1367])

There is also an important update to the Kinesis Elasticsearch Sink: we have stopped verifying the number of fields found in enriched event ([#1333] [issue-1333])

<div class="html">
<h2><a name="upgrade">9. Upgrading your Snowplow pipeline</a></h2>
</div>

<div class="html">
<h3><a name="configuring-enrichments">9.1 Common</a></h3>
</div>

This section contains upgrading instructions which are common to both our Elastic MapReduce and Kinesis pipelines.

<div class="html">
<h4><a name="configuring-enrichments">9.1.1 Configuring enrichments</a></h3>
</div>

To continue parsing useragent strings using the `user_agent_utils` library, you **must** add a new JSON configuration file into your folder of enrichment JSONs:

{% highlight json %}
{
	"schema": "iglu:com.snowplowanalytics.snowplow/user_agent_utils_config/jsonschema/1-0-0",

	"data": {

		"vendor": "com.snowplowanalytics.snowplow",
		"name": "user_agent_utils_config",
		"enabled": true,
		"parameters": {}
	}
}
{% endhighlight %}

The name of the file is not important but must end in `.json`.

Configuring other enrichments is at your discretion. Useful resources here are:

* [Configurable enrichments wiki page] [configurable-enrichments]
* [Example enrichment JSON configuration files] [enrichment-jsons]

<div class="html">
<h3><a name="upgrading-emr">9.2. Upgrading your Elastic MapReduce pipeline</a></h3>

There are two steps to upgrading the EMR pipeline:

1. Upgrade your EmrEtlRunner to use the latest Hadoop job versions
2. Upgrade your Redshift and/or Postgres `atomic.events` table to the latest definitions

<div class="html">
<h4><a name="configuring-emretlrunner">9.2.1 Updating EmrEtlRunner's configuration</a></h4>
</div>

This release bumps:

1. The Hadoop Enrichment process to version **0.14.0**
2. The Hadoop Shredding process to version **0.4.0**

In your EmrEtlRunner's `config.yml` file, update your Hadoop jobs versions like so:

{% highlight yaml %}
  :versions:
    :hadoop_enrich: 0.14.0 # WAS 0.13.0
    :hadoop_shred: 0.4.0 # WAS 0.3.0
{% endhighlight %}

For a complete example, see our [sample `config.yml` template] [emretlrunner-config-yml].

<div class="html">
<h4><a name="upgrade-redshift">9.2.2 Updating your database</a></h4>
</div>

You need to use the appropriate migration script to update to the new table definition:

* [The Redshift migration script] [redshift-migration]
* [The PostgreSQL migration script] [postgres-migration]

And that's it - you should be fully upgraded.

If you want to make use of the new ua_parser based useragent parsing enrichment in Redshift, you must also deploy the new table into your `atomic` schema:

* [com_snowplowanalytics_snowplow_ua_parser_context_1] [ua-parser-table]

<div class="html">
<h2><a name="upgrading-kinesis">9.3 Upgrading your Kinesis pipeline</a></h2>
</div>

<div class="html">
<h4><a name="downloading-kinesis">9.3.1 Downloading binaries</a></h4>
</div>

This release updates:

1. Scala Kinesis Enrich, to version 0.4.0
2. Kinesis Elasticsearch Sink, to version 0.2.0

The new version of the Kinesis pipeline is available on Bintray as [snowplow_kinesis_r61_red_cheeked_cordon_bleu.zip] [kinesis-dl]. The download contains the latest versions of all of the Kinesis apps (Scala Stream Collector, Scala Kinesis Enrich, Kinesis Elasticsearch Sink, and Kinesis S3 Sink).

<div class="html">
<h4><a name="upgrading-kinesis">9.3.2 Upgrading a live Kinesis pipeline</a></h4>
</div>

The components in the Kinesis topology updated in this release are highlighted in this graph:

xxx

Our recommended approach for upgrading is as follows:

1. Kill your Scala Kinesis Enrich cluster
2. Leave your Kinesis Elasticsearch Sink cluster running until all remaining enriched events are loaded, then kill this cluster too
3. Upgrade your Scala Kinesis Enrich cluster to the new version
4. Upgrade your Kinesis Elasticsearch Sink cluster to the new version
5. Restart your Scala Kinesis Enrich cluster
6. Restart your Kinesis Elasticsearch Sink cluster

<h2><a name="help">10. Getting help</a></h2>

For more details on this release, please check out the [r63 Red-Cheeked Cordon-Bleu Release Notes] [r63-release] on GitHub. 

If you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

[red-cheeked-cordon-bleu]: /assets/img/blog/2015/03/red-cheeked-cordon-bleu.png

[scala-forex]: https://github.com/snowplow/scala-forex/
[oer]: https://openexchangerates.org/signup?r=snowplow
[user-agent-utils]: https://github.com/HaraldWalker/user-agent-utils
[ua-parser]: https://github.com/ua-parser
[uap-java]: https://github.com/ua-parser/uap-java

[configurable-enrichments]: https://github.com/snowplow/snowplow/wiki/configurable-enrichments
[ua-parser-enrichment]: https://github.com/snowplow/snowplow/wiki/ua-parser-enrichment
[user-agent-utils-enrichment]: https://github.com/snowplow/snowplow/wiki/user-agent-utils-enrichment
[campaign-attribution-enrichment]: https://github.com/snowplow/snowplow/wiki/Campaign-attribution-enrichment
[ip-lookups-enrichment]: https://github.com/snowplow/snowplow/wiki/IP-lookups-enrichment
[currency-conversion-enrichment]: https://github.com/snowplow/snowplow/wiki/currency-conversion-enrichment
[enrichment-jsons]: https://github.com/snowplow/snowplow/tree/master/3-enrich/emr-etl-runner/config/enrichments 
[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample

[aalekh]: https://github.com/AALEKH
[jz4112]: https://github.com/jz4112
[kazjote]: https://github.com/kazjote
[danisola]: https://github.com/danisola

[issue-670]: https://github.com/snowplow/snowplow/issues/670
[issue-1333]: https://github.com/snowplow/snowplow/issues/1333
[issue-1367]: https://github.com/snowplow/snowplow/issues/1367
[issue-1369]: https://github.com/snowplow/snowplow/issues/1369
[issue-1372]: https://github.com/snowplow/snowplow/issues/1372
[issue-1383]: https://github.com/snowplow/snowplow/issues/1383
[issue-1429]: https://github.com/snowplow/snowplow/issues/1429
[issue-1461]: https://github.com/snowplow/snowplow/issues/1461
[issue-1541]: https://github.com/snowplow/snowplow/issues/1541
[issue-1547]: https://github.com/snowplow/snowplow/issues/1547

[ua-parser-schema]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/ua_parser_context/jsonschema/1-0-0
[ua-parser-table]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.snowplowanalytics.snowplow/ua_parser_context_1.sql

[canonical-event-model]: https://github.com/snowplow/snowplow/wiki/Canonical-event-model
[redshift-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/migrate_0.4.0_to_0.5.0.sql
[postgres-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/postgres-storage/sql/migrate_0.3.0_to_0.4.0.sql

[r62-encoding-fixes]: http://snowplowanalytics.com/blog/2015/03/02/snowplow-r61-pygmy-parrot-released/#hadoop-improvements

[kinesis-dl]: http://dl.bintray.com/snowplow/snowplow-generic/snowplow_kinesis_r61_red_cheeked_cordon_bleu.zip
[r63-release]: https://github.com/snowplow/snowplow/releases/tag/r63-xxx-xxx
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
