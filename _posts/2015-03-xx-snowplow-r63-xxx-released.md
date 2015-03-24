---
layout: post
shortenedlink: Snowplow 63 released
title: Snowplow 63 Red-Cheeked Cordon-Bleu released
tags: [snowplow, currency, gclid, useragent, ua_parser, forex, oer]
author: Alex
category: Releases
---

We are pleased to announce the immediate availability of Snowplow 63, Red-Cheeked Cordon-Bleu. This is a major release which adds two new enrichments, upgrades existing enrichments and significantly extends and improves our Canonical Event Model for loading into Redshift, Elasticsearch and Postgres.

The new and upgraded enrichments are as follows:

1. New enrichment: parsing useragent strings using the `ua_parser` library
2. New enrichment: converting the money amounts in e-commerce transactions into a base currency using [Open Exchange Rates] [oer]
3. Upgraded: extracting click IDs in our campaign attribution enrichment
4. Upgraded: our existing
5. Upgraded: useragent parsing using the `user_agent_utils` library can now be disabled

This release has been a huge team effort - with particular thanks going to Snowplow winterns [Aalekh Nigam] [aalekh] (2014/15) and [Jiawen Zhou] [jz4112] (2013/14) for their work on the new enrichments and the foundational [scala-forex library] [scala-forex] respectively.

1. [xxx]()
2. [xxx]()
3. [xxx]()


3. [Upgrading: Hadoop flow](#upgrading)
3. [Upgrading: Kinesis flow](#upgrading)
4. [Getting help](#help)

<!--more-->

<h2><a name="xxx">1. New enrichment: xxx</a></h2>



<h2><a name="xxx">2. New enrichment: xxx</a></h2>

<h2><a name="xxx">3. Enhanced enrichment: click ID extraction for campaign attribution</a></h2>

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

<h2><a name="xxx">4. Enhanced enrichment: IP lookups using MaxMind</a></h2>



<h2><a name="xxx">5. Enhanced enrichment: useragent parsing using `user_agent_utils`</a></h2>

Our existing useragent parsing enrichment built on [user_agent_utils] [user_agent_utils] is no longer hardcoded to run - instead, it is now a user-configurable enrichment. The fields that it populates in `atomic.events` are unchanged.

To enable it to run as before, you **must** add in a JSON configuration file into your folder of enrichments. See [X.2 Configuring enrichments](#configuring-enrichments) for details.

<h2><a name="xxx">6. Other improvements to Scala Common Enrich</a></h2>

TODO: Scala Common Enrich: used Netaporter to parse querystrings if httpclient fails, thanks @danisola! (#1429)

<h2><a name="xxx">6. Review of new fields in enriched events</a></h2>

We have updated the Snowplow [Canonical Event Model] [xxx] (TODO) to reflect the fields required by the new enrichments. The new fields required in `atomic.events` (whether Redshift or Postgres) are as follows:

ADD A TABLE OF FIELDS 

We have also made the following changes to the table definitions:

* xxx
* xxx
* xxx



<h2><a name="xxx">7. Kinesis application updates</a></h2>

This release updates:

1. Scala Kinesis Enrich, to version 0.4.0
2. Kinesis Elasticsearch Sink, to version 0.2.0

The main update to both Kinesis applications is to support the new enriched event format (see above for details). Other noteworthy updates to the Scala Kinesis Enrich:

* Scala Kinesis Enrich: bumped Scala Common Enrich to 0.13.0 (#1369) - what version was it on previously?
* unified logger configuration, thanks @kazjote! (#1367)

An important update to the Kinesis Elasticsearch Sink: we have stopped verifying the number of fields found in enriched event (#1333)


To use the new UA parser context:

Redshift: added Redshift DDL for ua_parser_context (#789)
StorageLoader: wrote JSON Path file for ua_parser_context (#790)

<div class="html">
<h2><a name="upgrading-kinesis">XXX. Upgrading your Elastic MapReduce pipeline</a></h2>
</div>

There are two steps to upgrading the EMR pipeline:

1. Upgrade your EmrEtlRunner to use the latest Hadoop job versions
2. Upgrade your Redshift and/or Postgres `atomic.events` table to the latest definitions

<div class="html">
<h3><a name="configuring-emretlrunner">6.1 Updating EmrEtlRunner's configuration</a></h3>
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
<h3><a name="configuring-enrichments">6.2 Configuring enrichments</a></h3>
</div>

To continue parsing useragent strings using the `user_agent_utils` library, you **must** add a new JSON configuration file into your folder of enrichment JSONs:

{% highlight json %}
xxx
{% endhighlight %}



Configuring other enrichments is at your discretion. Useful resources:

* https://github.com/snowplow/snowplow/wiki/configurable-enrichments
* https://github.com/snowplow/snowplow/tree/feature/core-2015-refresh/3-enrich/emr-etl-runner/config/enrichments 

<div class="html">
<h3><a name="configuring-emretlrunner">6.2 Updating your Redshift installation</a></h3>
</div>



If you want to make use of the new ua_parser based useragent parsing enrichment, you must also deploy the new table:

* xxx


<div class="html">
<h3><a name="configuring-emretlrunner">6.2 Updating your PostgreSQL installation</a></h3>
</div>

SECTION TO COME.

<div class="html">
<h2><a name="upgrading-kinesis">XXX. Upgrading your Kinesis pipeline</a></h2>
</div>

The new version of the Kinesis pipeline is available on Bintray. The download contains the latest versions of all of the Kinesis apps (Scala Stream Collector, Scala Kinesis Enrich, Kinesis Elasticsearch Sink, and Kinesis S3 Sink):

    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_kinesis_r61_xxx.zip

The updated components are highlighted in this graph:

xxx

Our recommended approach for upgrading is as follows:

1. Kill your Scala Kinesis Enrich cluster
2. Leave your Kinesis Elasticsearch Sink cluster running until all remaining enriched events are loaded, then kill this cluster too
3. Upgrade your Scala Kinesis Enrich cluster to the new version
4. Upgrade your Kinesis Elasticsearch Sink cluster to the new version
5. Restart your Scala Kinesis Enrich cluster
6. Restart your Kinesis Elasticsearch Sink cluster

<h2><a name="help">XX. Getting help</a></h2>

For more details on this release, please check out the [r63 XXX Release Notes] [r63-release] on GitHub. 

If you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].


Common: updated kinesis push to remove sub-folders from zipfile (#1378)
Scala Common Enrich: bumped to 0.13.0
Scala Common Enrich: bumped referer-parser to 0.2.3 (#670)
Scala Common Enrich: converted transactions from given currency to base currency (#370)
Scala Common Enrich: bumped CampaignAttributionEnrichment version to 0.2.0 (#1338)
Scala Common Enrich: added mkt_clickid and mkt_network fields to POJO (#1073)
Scala Common Enrich: added derived_contexts field to POJO (#787)
Scala Common Enrich: added geo_timezone field to POJO (#787)
Scala Common Enrich: added etl_tags field to POJO (#1247)
Scala Common Enrich: added currency fields to POJO (#1316)
Scala Common Enrich: changed enrichment configuration to use SchemaCriterion rather than SchemaKey (#1353)
Scala Common Enrich: extracted original IP address from CollectorPayload headers (#1372)
Scala Common Enrich: extracted dvce_sent_tstamp from stm field (#1383)
Scala Common Enrich: added dvce_sent_tstamp to POJO (#1384)
Scala Common Enrich: added refr_domain_userid and refr_dvce_sent_tstamp to POJO (#1449)
Scala Common Enrich: added session_id field to POJO (#1538)
Scala Common Enrich: populated refr_ fields based on page_url querystring (#1461)
Scala Common Enrich: populated session_id field based on "sid" parameter (#1541)
Scala Common Enrich: parsed the page URI in the EnrichmentManager (#1463)
Scala Common Enrich: added ua-parser enrichment (#62)
Scala Common Enrich: added ability to disable user-agent-utils enrichment (#792)

Scala Hadoop Enrich: bumped to 0.14.0
Scala Hadoop Enrich: bumped Scala Common Enrich to 0.13.0 (#1340)
Scala Hadoop Enrich: added integration tests for currency conversion enrichment (#1430)
Scala Hadoop Enrich: added tests for other new EnrichedEvent fields (#1337)
Scala Hadoop Shred: bumped to 0.4.0
Scala Hadoop Shred: bumped Scala Common Enrich to 0.13.0 (#1343)
Scala Hadoop Shred: bumped json4sJackson to 3.2.11 (#1344)
Scala Hadoop Shred: extracted JSONs from derived_contexts field (#786)
Scala Hadoop Shred: updated to reflect new enriched event format (#1332)
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
StorageLoader: wrote JSON Path file for ua_parser_context (#790)

[scala-forex]: xxx
[oer]: https://openexchangerates.org/signup?r=snowplow
[user-agent-utils]: xxx


[aalekh]: https://github.com/AALEKH
[jz4112]: https://github.com/jz4112
[kazjote]: https://github.com/kazjote
[danisola]: https://github.com/danisola

[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample

[issue-1547]: https://github.com/snowplow/snowplow/issues/1547



[r63-release]: https://github.com/snowplow/snowplow/releases/tag/r63-xxx-xxx
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
