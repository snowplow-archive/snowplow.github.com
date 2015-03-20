---
layout: post
shortenedlink: Snowplow 63 released
title: Snowplow 63 XXX released
tags: [snowplow, currency, gclid, useragent]
author: Alex
category: Releases
---

We are pleased to announce the immediate availability of Snowplow 63, XXX. This is a major release which adds in two new enrichments, enhances existing enrichments and significantly updates our enriched event model for loading into Redshift, Elasticsearch and Postgres.

The new and enhanced enrichments are as follows:

1. New enrichment: parsing useragent strings using the 
2. New enrichment: converting the money amounts in e-commerce transactions into xxx
3. Enhanced: xxx
4. Enhanced: our existing
5. Enhanced: xxx

This has been a huge team effort -  with particular thanks going to Snowplow winterns [Aalekh Nigam] [xxx] (2014/15) and [Jiawen Zhou] [xxx] (2013/14) for their work on the new enrichments and the underpinning scala-forex library respectively.

1. [xxx]()
2. [xxx]()
3. [xxx]()
3. [Upgrading: Hadoop flow](#upgrading)
3. [Upgrading: Kinesis flow](#upgrading)
4. [Getting help](#help)

<!--more-->

<h2><a name="xxx">1. New enrichment: xxx</a></h2>

<h2><a name="xxx">2. New enrichment: xxx</a></h2>

<h2><a name="xxx">3. Enhanced enrichment: xxx</a></h2>

<h2><a name="xxx">4. Enhanced enrichment: xxx</a></h2>

<h2><a name="xxx">5. Enhanced enrichment: xxx</a></h2>

<h2><a name="xxx">6. Review of new fields in enriched events</a></h2>

We have updated the Snowplow [Canonical Event Model] [xxx] to support the new enrichments. The new fields required in `atomic.events` (whether Redshift or Postgres) are as follows:

ADD A TABLE OF FIELDS 

We have also made the following changes to the table definitions:

* xxx
* xxx
* xxx

TODO: ping Fred about versioning the canonical event model

TODO: ping Fred about updating the enriched event in elasticsearch JSON Scheam


<div class="html">
<h2><a name="upgrading-kinesis">XXX. Upgrading your Kinesis pipeline</a></h2>
</div>

The new version of the Kinesis pipeline is available on Bintray. The download contains the latest versions of all of the Kinesis apps (Scala Stream Collector, Scala Kinesis Enrich, Kinesis Elasticsearch Sink, and Kinesis S3 Sink):

    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_kinesis_r61_xxx.zip

The main thing to be aware of is that the new 

This release updates:

1. Scala Kinesis Enrich (to version 0.4.0)
2. The format of enriched events as written to the Kinesis stream 
3. The Kinesis Elasticsearch Sink (to version 0.2.0)

The affected components are highlighted in this graph:

xxx

Our recommended approach for upgrading is as follows:

* XXX

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
Scala Common Enrich: used Netaporter to parse querystrings if httpclient fails, thanks @danisola! (#1429)
Scala Hadoop Enrich: bumped to 0.14.0
Scala Hadoop Enrich: bumped Scala Common Enrich to 0.13.0 (#1340)
Scala Hadoop Enrich: added integration tests for currency conversion enrichment (#1430)
Scala Hadoop Enrich: added tests for other new EnrichedEvent fields (#1337)
Scala Hadoop Shred: bumped to 0.4.0
Scala Hadoop Shred: bumped Scala Common Enrich to 0.13.0 (#1343)
Scala Hadoop Shred: bumped json4sJackson to 3.2.11 (#1344)
Scala Hadoop Shred: extracted JSONs from derived_contexts field (#786)
Scala Hadoop Shred: updated to reflect new enriched event format (#1332)
Scala Kinesis Enrich: bumped to 0.4.0
Scala Kinesis Enrich: bumped Scala Common Enrich to 0.13.0 (#1369)
Scala Kinesis Enrich: emitted updated EnrichedEvent (#1368)
Scala Kinesis Enrich: unified logger configuration, thanks @kazjote! (#1367)
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
Kinesis Elasticsearch Sink: bumped to 0.2.0
Kinesis Elasticsearch Sink: added new EnrichedEvent fields (#1345)
Kinesis Elasticsearch Sink: stopped verifying number of fields in enriched event (#1333)
Kinesis Elasticsearch Sink: changed organization to com.snowplowanalytics in BuildSettings (#1279)
Kinesis Elasticsearch Sink: renamed application.conf.example to config.hocon.sample (#1244)


[r63-release]: https://github.com/snowplow/snowplow/releases/tag/r63-xxx-xxx
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
