---
layout: post
title: Snowplow 63 Red-Cheeked Cordon-Bleu released
title-short: Snowplow 63 Red-Cheeked Cordon-Bleu
tags: [snowplow, currency, gclid, useragent, ua_parser, forex, oer]
author: Alex
category: Releases
---

We are pleased to announce the immediate availability of Snowplow 63, Red-Cheeked Cordon-Bleu. This is a major release which adds two new enrichments, upgrades existing enrichments and significantly extends and improves our Canonical Event Model for loading into Redshift, Elasticsearch and Postgres.

![red-cheeked-cordon-bleu][red-cheeked-cordon-bleu]

The new and upgraded enrichments are as follows:

1. New enrichment: parsing useragent strings using the [`ua_parser`][ua-parser] library
2. New enrichment: converting the money amounts in e-commerce transactions into a base currency using [Open Exchange Rates][oer]
3. Upgraded: extracting click IDs in our campaign attribution enrichment, so that Snowplow event data can be more precisely joined with campaign data
4. Upgraded: our existing MaxMind-powered IP lookups
5. Upgraded: useragent parsing using the `user_agent_utils` library can now be disabled

This release has been a huge team effort - with particular thanks going to Snowplow winterns [Aalekh Nigam][aalekh] (2014/15) and [Jiawen Zhou][jz4112] (2013/14) for their work on the new enrichments and the foundational [scala-forex library][scala-forex] respectively.

Table of contents:

1. [New enrichment: useragent parsing using ua_parser](/blog/2015/04/02/snowplow-r63-red-cheeked-cordon-bleu-released#uap)
2. [New enrichment: currency conversion for e-commerce transaction](/blog/2015/04/02/snowplow-r63-red-cheeked-cordon-bleu-released#forex)
3. [Upgraded enrichment: click ID extraction for campaign attribution](/blog/2015/04/02/snowplow-r63-red-cheeked-cordon-bleu-released#clid)
4. [Upgraded enrichment: timezone lookup from IP address using MaxMind](/blog/2015/04/02/snowplow-r63-red-cheeked-cordon-bleu-released#tz)
5. [Upgraded enrichment: useragent parsing using user_agent_utils](/blog/2015/04/02/snowplow-r63-red-cheeked-cordon-bleu-released#uau)
6. [Other improvements to Scala Common Enrich](/blog/2015/04/02/snowplow-r63-red-cheeked-cordon-bleu-released#enrich)
7. [Updates to atomic.events](/blog/2015/04/02/snowplow-r63-red-cheeked-cordon-bleu-released#events)
8. [Updates to the Kinesis applications](/blog/2015/04/02/snowplow-r63-red-cheeked-cordon-bleu-released#kinesis)
9. [Upgrading your Snowplow pipeline](/blog/2015/04/02/snowplow-r63-red-cheeked-cordon-bleu-released#upgrade)
10. [Getting help](/blog/2015/04/02/snowplow-r63-red-cheeked-cordon-bleu-released#help)  

<!--more-->

<h2><a name="uap">1. New enrichment: useragent parsing using ua_parser</a></h2>

Since close to its inception, Snowplow has used the [user-agent-utils][user-agent-utils] Java library to perform useragent parsing. Various limitations with that library have led us to explore and evaluate other options, including the [ua-parser][ua-parser] project with its [uap-java][uap-java] library for the JVM. Testing suggests that this library handles some useragent strings (such as mobile app useragents) better than user-agent-utils. We particularly like that the 'database' the [ua-parser][ua-parser] looks user agent strings up against is a YAML file, making it straightforward for users to update the treatment of new useragents as they emerge themselves, rather than waiting on a new release of [user-agent-utils][user-agent-utils].

As part of our move towards pluggable enrichments, from this release Snowplow users can employ user-agent-utils, or ua-parser, or both, or neither. We believe we are the first analytics platform to give users such a high degree of choice in their Enrichment process.

The behavior of user-agent-utils if enabled is unchanged; if ua-parser is enabled, then the Snowplow Enrichment process will write its results into a new context, [ua_parser_context][ua-parser-schema].

For more details on this enrichment, see the [ua parser enrichment][ua-parser-enrichment] wiki page.

<h2><a name="forex">2. New enrichment: currency conversion for e-commerce transactions</a></h2>

Since early 2014, Snowplow trackers including the JavaScript Tracker have let you [record the currency][js-issue-34] in which an e-commerce transaction took place. This is the first release of Snowplow which extracts those currency fields into our [Canonical Event Model][canonical-event-model] - but we have gone further and this release also includes a new enrichment which will automatically convert these transactions into your "base" or "home" currency for reporting and analytics.

Working with [Open Exchange Rates][oer], our new currency conversion enrichment will look up the end-of-day ("EOD") rate between your transaction's currency and your preferred base currency for the day prior to the e-commerce transaction, and use this to convert all monetary amounts in your e-commerce currency into your base currency. The converted values are all stored in new fields, so you can continue to work with the original amounts as well.

To take advantage of this new enrichment, you will need to sign up for an account at [Open Exchange Rates][oer] and provide your API key in the enrichment's JSON configuration file.

For more details on this enrichment, see the [Currency conversion enrichment][currency-conversion-enrichment] wiki page.

<h2><a name="clid">3. Upgraded enrichment: click ID extraction for campaign attribution</a></h2>

Many advertising systems attach a globally unique "click ID" tracking parameter to destination URIs to help advertisers attribute clicks to campaigns. The most well known of these click IDs are `gclid` (Google), `msclkid` (Microsoft) and `dclid` (DoubleClick).

We have extended our existing campaign attribution enrichment to look for and extract the value assigned to this click ID, populating the `mkt_clickid` field with the click ID and the `mkt_network` field with the name of the network. This should make it possible to join Snowplow data back to campaign data from marketing channel that drove the user to your site in a much more precise way than is possible using the existing source / medium / term / campaign / content parameters, so you can report exactly what you paid for that click, and then calculate the return on investment for it, based on the user's subsequent actions.

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

If you know of another click ID that would be useful to the wider Snowplow community, please do add it to [this ticket][issue-1547].

For more details on this enrichment, see the [campaign attribution enrichment][campaign-attribution-enrichment] wiki page.

<h2><a name="tz">4. Upgraded enrichment: timezone lookup from IP address using MaxMind</a></h2>

We have extended the IP lookup enrichment to extract the timezone information that MaxMind provides about an IP address. This timezone information is stored in a new field in the [Canonical Event Model][canonical-event-model], `geo_timezone`.

For more details on this enrichment, see the [IP lookups enrichment][ip-lookups-enrichment] wiki page.

<h2><a name="uau">5. Upgraded enrichment: useragent parsing using user_agent_utils</a></h2>

Our existing useragent parsing enrichment built on [user-agent-utils][user-agent-utils] is no longer hardcoded to run - instead, it is now a user-configurable enrichment. The fields that it populates in `atomic.events` are unchanged.

To enable it to run as before, you **must** add in a JSON configuration file into your folder of enrichments. See [9.1.1 Configuring enrichments](#configuring-enrichments) for details.

For more details on this enrichment, see the [ua parser enrichment][ua-parser-enrichment] wiki page.

<h2><a name="enrich">6. Other improvements to Scala Common Enrich</a></h2>

A set of smaller new features and capabilities have been to Scala Common Enrich in this release:

* Netaporter's more permissive URI library is used to parse querystrings if the Apache Commons httpclient fails. Many thanks to [Dani Solà][danisola] for this contribution! ([#1429][issue-1429])
* The `refr_domain_userid` and `refr_dvce_tstamp` fields as set by the JavaScript Tracker's new cross-domain linker are now extracted ([#1461][issue-1461]). This makes it possible for users running a network of websites to stitch user actions across domains using only first party cookies. (We will cover how to do this in a future blog post.)
* The `session_id` field is now populated based on the "sid" parameter. Session ID is a client-side generated UUID to complement the existing session index ([#1541][issue-1541])
* The `dvce_sent_tstamp` field is now populated based on the "stm" parameter. This is useful for determining when a tracker sent an event (versus creating that event) ([#1383][issue1383-])
* bumped referer-parser to 0.2.3 ([#670][issue-670])
* extracted original IP address from CollectorPayload headers ([#1372][issue-1372])

<h2><a name="events">7. Updates to atomic.events</a></h2>

This release makes a comprehensive set of updates to the `atomic.events` table (whether Redshift or Postgres), specifically:

1. New fields as per the updated [Canonical Event Model][canonical-event-model]. These new fields are largely for the new enrichments, but we are also aiming to somewhat "future-proof" `atomic.events` by adding new fields which we plan on using in the near future
2. Updates to existing fields, primarily so Snowplow can record a wider range of values in those fields

<div class="html">
<h3><a name="new-fields">7.1 New fields</a></h3>
</div>

The new fields required in `atomic.events` (whether Redshift or Postgres) are as follows:

<table class="table table-striped">
    <thead>
        <tr>
            <th>Column name</th>
            <th>Data type (1)</th>
            <th>From (2)</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>tr_currency</code></td>
            <td><code>char(3)</code></td>
            <td>Tracker</td>
            <td>Currency for e-commerce transaction</td>
        </tr>
        <tr>
            <td><code>tr_total_base</code></td>
            <td><code>dec(18, 2)</code></td>
            <td>CCE</td>
            <td>Conversion to base currency</td>
        </tr>
        <tr>
            <td><code>tr_tax_base</code></td>
            <td><code>dec(18, 2)</code></td>
            <td>CCE</td>
            <td>Conversion to base currency</td>
        </tr>
        <tr>
            <td><code>tr_shipping_base</code></td>
            <td><code>dec(18, 2)</code></td>
            <td>CCE</td>
            <td>Conversion to base currency</td>
        </tr>
        <tr>
            <td><code>ti_currency</code></td>
            <td><code>char(3)</code></td>
            <td>Tracker</td>
            <td>Currency for e-commerce transaction item</td>
        </tr>
        <tr>
            <td><code>ti_price_base</code></td>
            <td><code>dec(18, 2)</code></td>
            <td>CCE</td>
            <td>Conversion to base currency</td>
        </tr>
        <tr>
            <td><code>base_currency</code></td>
            <td><code>char(3)</code></td>
            <td>CCE</td>
            <td>CCE configuration option</td>
        </tr>
        <tr>
            <td><code>geo_timezone</code></td>
            <td><code>varchar(64)</code></td>
            <td>ILE</td>
            <td>Timezone for IP address</td>
        </tr>
        <tr>
            <td><code>mkt_clickid</code></td>
            <td><code>varchar(64)</code></td>
            <td>CAE</td>
            <td>Unique ID for advertising click</td>
        </tr>
        <tr>
            <td><code>mkt_network</code></td>
            <td><code>varchar(64)</code></td>
            <td>CAE</td>
            <td>Advertising network of click ID</td>
        </tr>
        <tr>
            <td><code>etl_tags</code></td>
            <td><code>varchar(500)</code></td>
            <td>Enrich</td>
            <td>Tags describing this run. Not yet implemented</td>
        </tr>
        <tr>
            <td><code>dvce_sent_tstamp</code></td>
            <td><code>timestamp</code></td>
            <td>Tracker</td>
            <td>When device sent event</td>
        </tr>
        <tr>
            <td><code>refr_domain_userid</code></td>
            <td><code>varchar(36)</code></td>
            <td>Tracker</td>
            <td>Extracted from cross-domain linker</td>
        </tr>
        <tr>
            <td><code>refr_dvce_tstamp</code></td>
            <td><code>timestamp</code></td>
            <td>Tracker</td>
            <td>Extracted from cross-domain linker</td>
        </tr>
        <tr>
            <td><code>derived_contexts</code></td>
            <td><code>varchar(15000)</code></td>
            <td>Enrich</td>
            <td>Contexts derived in the Enrich process</td>
        </tr>
        <tr>
            <td><code>domain_sessionid</code></td>
            <td><code>char(36)</code></td>
            <td>Tracker</td>
            <td>Client-side session ID, complements index</td>
        </tr>
        <tr>
            <td><code>derived_tstamp</code></td>
            <td><code>timestamp</code></td>
            <td>Enrich</td>
            <td>Calculated timestamp. Not yet implemented</td>
        </tr>
    </tbody>
</table>

(1) The data type is taken from Redshift; data types for some columns in Postgres are different

(2) Where:

* CCE = Currency conversion enrichment
* ILE = IP lookups enrichment
* CAE = Campaign attribution enrichment

<div class="html">
<h3><a name="updated-fields">7.2 Updated fields</a></h3>
</div>

We have also made the following changes to the table definitions:

<table class="table table-striped">
    <thead>
        <tr>
            <th>Column name</th>
            <th>New data type (1)</th>
            <th>Old data type</th>
            <th>Reason</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>user_ipaddress</code></code></td>
            <td><code>varchar(45)</code></td>
            <td><code>varchar(19)</code></td>
            <td>To support IPv6 addresses</td>
        </tr>
        <tr>
            <td><code>unstruct_event</code></td>
            <td><code>varchar(15000)</code>*</td>
            <td><code>varchar(10000)</code></td>
            <td>To support larger JSONs</td>
        </tr>
        <tr>
            <td><code>domain_userid</code></td>
            <td><code>varchar(36)</code></td>
            <td><code>varchar(16)</code></td>
            <td>To support UUIDs as domain user IDs</td>
        </tr>
        <tr>
            <td><code>contexts</code></td>
            <td><code>varchar(15000)</code>*</td>
            <td><code>varchar(10000)</code></td>
            <td>To support more custom contexts</td>
        </tr>
        <tr>
            <td><code>page_urlpath</code></td>
            <td><code>varchar(3000)</code></td>
            <td><code>varchar(1000)</code></td>
            <td>To support longer page URL paths</td>
        </tr>
        <tr>
            <td><code>page_urlquery</code></td>
            <td><code>varchar(6000)</code></td>
            <td><code>varchar(3000)</code></td>
            <td>To support longer page URL queries (e.g. from ad servers)</td>
        </tr>
        <tr>
            <td><code>page_urlfragment</code></td>
            <td><code>varchar(3000)</code></td>
            <td><code>varchar(255)</code></td>
            <td>To support longer page fragments</td>
        </tr>
        <tr>
            <td><code>refr_urlpath</code></td>
            <td><code>varchar(3000)</code></td>
            <td><code>varchar(1000)</code></td>
            <td>To support longer page URL queries (e.g. from ad servers)</td>
        </tr>
        <tr>
            <td><code>refr_urlquery</code></td>
            <td><code>varchar(6000)</code></td>
            <td><code>varchar(3000)</code></td>
            <td></td>
        </tr>
        <tr>
            <td><code>refr_urlfragment</code></td>
            <td><code>varchar(3000)</code></td>
            <td><code>varchar(255)</code></td>
            <td>To support longer page fragments</td>
        </tr>
        <tr>
            <td><code>se_category</code></td>
            <td><code>varchar(1000)</code></td>
            <td><code>varchar(255)</code></td>
            <td>To support longer category labels</td>
        </tr>
        <tr>
            <td><code>se_action</code></td>
            <td><code>varchar(1000)</code></td>
            <td><code>varchar(255)</code></td>
            <td></td>
        </tr>
        <tr>
            <td><code>se_label</code></td>
            <td><code>varchar(1000)</code></td>
            <td><code>varchar(255)</code></td>
            <td></td>
        </tr>
        <tr>
            <td><code>se_property</code></td>
            <td><code>varchar(1000)</code></td>
            <td><code>varchar(255)</code></td>
            <td></td>
        </tr>
    </tbody>
</table>

\* Also changed column encoding in Redshift from `raw` to `lzo`

(1) The data type is taken from Redshift; data types for some columns in Postgres are different

In addition to these changes, for Postgres we have removed the primary key constraint on event_id ([#1187][issue-1187]).

Finally, we have also added a foreign key constraint to all Redshift shredded JSON tables to make the joins back to the parent `atomic.events` table more performant ([#1365][issue-1365]).

<h2><a name="kinesis">8. Updates to the Kinesis applications</a></h2>

The main update to both Kinesis applications is to support the new enriched event format (see [7. Updates to atomic.events](#events) for details). Other noteworthy updates to the Scala Kinesis Enrich:

* The Scala Kinesis Enrich application now uses Scala Common Enrich 0.13.0, the latest version ([#1369][issue-1369]). Previously it was using Scala Common Enrich 0.11.0. This means that you can take advantage of all the enrichment updates in the Kinesis flow, and it also brings the Kinesis flow up-to-date with the various [encoding-related fixes][r61-encoding-fixes] implemented in Scala Common Enrich 0.12.0
* Community member [Kacper Bielecki][kazjote] updated the Scala Kinesis Enrich's logging configuration ([#1367][issue-1367])

There is also an important update to the Kinesis Elasticsearch Sink: we have stopped verifying the number of fields found in enriched event ([#1333][issue-1333]). This should make the Elasticsearch Sink more tolerant of potential future updates to Scala Kinesis Enrich.

<div class="html">
<h2><a name="upgrade">9. Upgrading your Snowplow pipeline</a></h2>
</div>

<div class="html">
<h3><a name="configuring-enrichments">9.1 Common</a></h3>
</div>

This section contains upgrading instructions which are common to both our Elastic MapReduce and Kinesis pipelines.

<div class="html">
<h3><a name="configuring-enrichments">9.1.1 Configuring enrichments</a></h3>
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

* [Configurable enrichments wiki page][configurable-enrichments]
* [Example enrichment JSON configuration files][enrichment-jsons]

<div class="html">
<h3><a name="upgrading-emr">9.2. Upgrading your Elastic MapReduce pipeline</a></h3>
</div>

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

For a complete example, see our [sample `config.yml` template][emretlrunner-config-yml].

<div class="html">
<h4><a name="upgrade-redshift">9.2.2 Updating your database</a></h4>
</div>

You need to use the appropriate migration script to update to the new table definition:

* [The Redshift migration script][redshift-migration]
* [The PostgreSQL migration script][postgres-migration]

And that's it - you should be fully upgraded.

If you want to make use of the new ua_parser based useragent parsing enrichment in Redshift, you must also deploy the new table into your `atomic` schema:

* [com_snowplowanalytics_snowplow_ua_parser_context_1][ua-parser-table]

<div class="html">
<h2><a name="upgrading-kinesis">9.3 Upgrading your Kinesis pipeline</a></h2>
</div>

<div class="html">
<h4><a name="downloading-kinesis">9.3.1 Downloading binaries</a></h4>
</div>

This release updates:

1. Scala Kinesis Enrich, to version 0.4.0
2. Kinesis Elasticsearch Sink, to version 0.2.0

The new version of the Kinesis pipeline is available on Bintray as [snowplow_kinesis_r61_red_cheeked_cordon_bleu.zip][kinesis-dl]. The download contains the latest versions of all of the Kinesis apps (Scala Stream Collector, Scala Kinesis Enrich, Kinesis Elasticsearch Sink, and Kinesis S3 Sink).

<div class="html">
<h4><a name="upgrading-kinesis">9.3.2 Upgrading a live Kinesis pipeline</a></h4>
</div>

The components in the Kinesis topology updated in this release are highlighted in this graph:

![r63-kinesis-changes][r63-kinesis-changes]

Our recommended approach for upgrading is as follows:

1. Kill your Scala Kinesis Enrich cluster
2. Leave your Kinesis Elasticsearch Sink cluster running until all remaining enriched events are loaded, then kill this cluster too
3. Upgrade your Scala Kinesis Enrich cluster to the new version
4. Upgrade your Kinesis Elasticsearch Sink cluster to the new version
5. Restart your Scala Kinesis Enrich cluster
6. Restart your Kinesis Elasticsearch Sink cluster

<h2><a name="help">10. Getting help</a></h2>

For more details on this release, please check out the [r63 Red-Cheeked Cordon-Bleu Release Notes][r63-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[red-cheeked-cordon-bleu]: /assets/img/blog/2015/04/red-cheeked-cordon-bleu.png

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
[issue-1187]: https://github.com/snowplow/snowplow/issues/1187
[issue-1333]: https://github.com/snowplow/snowplow/issues/1333
[issue-1365]: https://github.com/snowplow/snowplow/issues/1365
[issue-1367]: https://github.com/snowplow/snowplow/issues/1367
[issue-1369]: https://github.com/snowplow/snowplow/issues/1369
[issue-1372]: https://github.com/snowplow/snowplow/issues/1372
[issue-1383]: https://github.com/snowplow/snowplow/issues/1383
[issue-1429]: https://github.com/snowplow/snowplow/issues/1429
[issue-1461]: https://github.com/snowplow/snowplow/issues/1461
[issue-1541]: https://github.com/snowplow/snowplow/issues/1541
[issue-1547]: https://github.com/snowplow/snowplow/issues/1547

[js-issue-34]: https://github.com/snowplow/snowplow-javascript-tracker/issues/34

[ua-parser-schema]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/ua_parser_context/jsonschema/1-0-0
[ua-parser-table]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.snowplowanalytics.snowplow/ua_parser_context_1.sql

[canonical-event-model]: https://github.com/snowplow/snowplow/wiki/Canonical-event-model
[redshift-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/migrate_0.4.0_to_0.5.0.sql
[postgres-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/postgres-storage/sql/migrate_0.3.0_to_0.4.0.sql

[r61-encoding-fixes]: http://snowplowanalytics.com/blog/2015/03/02/snowplow-r61-pygmy-parrot-released/#hadoop-improvements

[r63-kinesis-changes]: /assets/img/blog/2015/03/r63-kinesis-updates.png

[kinesis-dl]: http://dl.bintray.com/snowplow/snowplow-generic/snowplow_kinesis_r61_red_cheeked_cordon_bleu.zip
[r63-release]: https://github.com/snowplow/snowplow/releases/tag/r63-red-cheeked-cordon-bleu
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[tropical-parulas]: /assets/img/blog/2015/03/tropical-parulas.jpg
