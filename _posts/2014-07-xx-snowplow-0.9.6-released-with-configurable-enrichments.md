---
layout: post
shortenedlink: Snowplow 0.9.6 released
title: Snowplow 0.9.6 released with configurable enrichments
tags: [snowplow, json, json schema, enrichments]
author: Fred
category: Releases
---

We are happy to announce the release of Snowplow 0.9.6. This release does three things:

1. It fixes some important bugs discovered in Snowplow 0.9.5, related to context and event shredding
2. It introduces new JSON-based configurations for Snowplow's existing enrichments
3. It extends our geo-IP lookup enrichment to support all five of MaxMind's commercial databases

We are really excited about our new JSON-configurable enrichments. This is the first step on our roadmap to make Snowplow enrichments completely pluggable. In the short-term, it means that we can release new enrichments which won't require you to install a new version of EmrEtlRunner.

The support for the various paid-for MaxMind databases is exciting too. We are very pleased to have MaxMind as our first commercial data partner and would encourage you to check out their IP database offerings.

Below the fold we will cover:

1. [New format for enrichment configuration](/blog/2014/07/xx/snowplow-0.9.6-released-with-configurable-enrichments/#new-format)
2. [An example: configuring the anon_ip enrichment](/blog/2014/07/xx/snowplow-0.9.6-released-with-configurable-enrichments/#anon-ip)
3. [The referer_parser enrichment](/blog/2014/07/xx/snowplow-0.9.6-released-with-configurable-enrichments/#referer-parser)
4. [The ip_lookups enrichment](/blog/2014/07/xx/snowplow-0.9.6-released-with-configurable-enrichments/#ip-lookups)
5. [Changes to atomic.events table definitions]
6. [Other changes](/blog/2014/07/xx/snowplow-0.9.6-released-with-configurable-enrichments/#other-changes)
7. [Upgrading](/blog/2014/07/xx/snowplow-0.9.6-released-with-configurable-enrichments/#upgrading)
8. [Documentation and help](/blog/2014/07/xx/snowplow-0.9.6-released-with-configurable-enrichments/#help)

TODO: bug fixes

<!--more-->

<h2><a name="new-format">1. New format for enrichment configuration</a></h2>

The new version of Snowplow supports three configurable enrichments: the `anon_ip` enrichment, the `ip_lookups` enrichment, and the `referer_parser` enrichment. Each of these can be configured using a [self-describing JSON][self-describing-json]. The enrichment configuration JSONs follow a common pattern:

{
    "schema": "iglu:((self-describing JSON schema for the enrichment))",

    "data": {

        "name": "enrichment name",
        "vendor": "enrichment vendor",
        "enabled": true / false,
        "parameters": {
            ((enrichment-specific settings))
        }
    }
}

The "enabled" field lets you switch the enrichment on or off and the "parameters" field contains the data specific to the enrichment.

These JSONs should then be placed in a single directory, and that directory's filepath should be passed to the EmrEtlRunner as a new option called `--enrichments`:

{% highlight bash %}
$ bundle exec bin/snowplow-emr-etl-runner --config config/config.yml --enrichments config/enrichments
{% endhighlight %}

For example, if you want to configure all three enrichments, your config directory might have this structure:

config/
	config.yml
	enrichments/
		anon_ip.json
		ip_lookups.json
		referer_parser.json

The JSON files in config/enrichments will then be packaged up by EmrEtlRunner and sent to the Hadoop job. Some notes on this:

* Only files with the `.json` file extension will be packaged up and sent to Hadoop
* Any enrichment for which no JSON can be found will be disabled in Hadoop
* Related, the `ip_lookups` and `referer_parser` enrichments no longer automatically happen - you need to provide configuration JSONs with the "enabled" field set to `true` if you want them. Sensible default configuration JSONs are available on Github [here][emretlrunner-config-jsons].

In previous versions of Snowplow, it was possible to configure the IP anonymization enrichment in the configuration YAML file. Note that this is no longer possible. See an example of a config.yml with this field removed on Github [here][emretlrunner-config-yml]. 

<h2><a name="anon-ip">2. An example: configuring the anon_ip enrichment</a></h2>

The functionality of the IP anonymization enrichment remains unchanged: it lets you anonymize part (or all) of each user's IP address. Here's an example configuration JSON for this enrichment:

{
	"schema": "iglu:com.snowplowanalytics.snowplow/anon_ip/jsonschema/1-0-0",

	"data": {

		"name": "anon_ip",
		"vendor": "com.snowplowanalytics.snowplow",
		"enabled": true,
		"parameters": {
			"anonOctets": 3
		}
	}
}

This is the simplest enrichment: the only field in "parameters" is "anonOctets", which is the number of octets of each IP address to anonymize. In this case it is set to 3, so 37.157.26.115 would be anonymized to 37.x.x.x.

<h2><a name="referer-parser">3. The referer_parser enrichment</a></h2>

Snowplow uses the [Referer-Parser][referer-parser-repo] to extract useful information from referer URLs. For example, the referer

"http://www.google.com/search?q=snowplow+enrichments&hl=en&client=safari"

would be identified as a Google search using the terms "snowplow" and "enrichments".

If the referer URI's host is the same as the current page's host, the referer will be counted as internal.

The latest version of the Referer-Parser adds the option to pass in a list of additional domains which should count as internal. The Referer-Parser enrichment can now be configured to take advantage of this:

{
	"schema": "iglu:com.snowplowanalytics.snowplow/referer_parser/jsonschema/1-0-0",

	"data": {

		"name": "referer_parser",
		"vendor": "com.snowplowanalytics.snowplow",
		"enabled": true,
		"parameters": {
			"internalDomains": [
				"mysubdomain1.mysite.com",
				"mysubdomain2.mysite.com"
			]
		}
	}
}

Using the above configuration will ensure that all referrals from the internal subdomains "mysubdomain1.mysite.com" and "mysubdomain2.mysite.com" will be counted as internal rather than unknown.

<h2><a name="ip-lookups">4. The ip_lookups enrichment</a></h2>

Previous versions of Snowplow used a [MaxMind][maxmind] database to look up a user's geographic location based on their IP address. This version expands on that functionality by adding the option to use other MaxMind databases to look up additional information. The full list of supported databases:

1) [GeoIPCity][geolitecity] and the free version [GeoLiteCity][geolitecity] look up a user's geographic location. The enrichment uses this information to populate the `geo_country`, `geo_region`, `geo_city`, `geo_zipcode`, `geo_latitude`, `geo_longitude`, and `geo_region_name` fields. [This blog post][maxmind-post] has more information.

2) [GeoIP ISP][geoipisp] looks up a user's ISP address. This populates the new `ip_isp` field.

3) [GeoIP Organization][geoiporg] looks up a user's organization. This populates the new `ip_organization` field.

3) [GeoIP Domain][geoipdomain] looks up the second level domain name associated with a user's IP address. This populates the new `ip_domain` field.

5) [GeoIP Netspeed][geoipnetspeed] estimates a user's connection speed. This populates the new `ip_organization` field.

An example configuration JSON, using only the free GeoLiteCity database and the proprietary GeoIP ISP database:

```json
{
	"schema": "iglu:com.snowplowanalytics.snowplow/ip_lookups/jsonschema/1-0-0",

	"data": {

		"name": "ip_lookups",
		"vendor": "com.snowplowanalytics.snowplow",
		"enabled": true,
		"parameters": {
			"geo": {
				"database": "GeoLiteCity.dat",
				"uri": "http://snowplow-hosted-assets.s3.amazonaws.com/third-party/maxmind"
			},
			"organization": {
				"database": "GeoIPISP.dat",
				"uri": "http://my-bucket.s3.amazonaws.com/third-party/maxmind"
			},
		}
	}
}
```

The `database` field contains the name of the database file.

The `uri` field contains the URI of the bucket in which the database file is found. The GeoLiteCity database is hosted by Snowplow at the above URI.

<h2><a name="atomic-events">5. Changes to atomic.events table definition</a></h2>

As well as adding fields corresponding to the new MaxMind lookups, we have created a new `etl_tstamp` field. This is populated by a timestamp created in the EmrEtlRunner, and describes when ETL for a particular row began.
We have also deleted the `event_vendor` and `ue_name` fields and renamed `ue_properties` to `unstruct_event`, in accordance with the new format for unstructured events.
Migration scripts are available for [Redshift][redshift-migration] and [Postgres][postgres-migration].

<h2><a name="other-changes">6. Other changes</a></h2>

We have also:

* extracted `CanonicalInput`'s `userId` as `network_userid` (thanks @pkallos!) [#855][855]
* Applied runlength encoding to all Redshift fields based on IP address [#883][883]
* Added validation to ensure that the transaction ID field is an integer [#428][428]
* Fixed the contract on the `partition_by_run` function in EmrEtlRunner so that a folder does not need to be supplied [#894][894]

<h2><a name="upgrading">7. Upgrading</a></h2>

**EmrEtlRunner**

You need to update EmrEtlRunner to the latest code (0.9.6 release) on GitHub:

{% highlight bash %}
$ git clone git://github.com/snowplow/snowplow.git
$ git checkout 0.9.6
$ cd snowplow/3-enrich/emr-etl-runner
$ bundle install --deployment
{% endhighlight %}

You also need to update the `config.yml` file as described above, removing any lines relating to IP anonymization or MaxMind. If you wish to use any of the configurable enrichments, you need to create a directory of configuration JSONs and pass that directory to the EmrEtlRunner using the new `--enrichments` option.

* [An example `config.yml` file][emretlrunner-config-yml]
* [An example enrichments directory][emretlrunner-config-jsons]

**Storage**

You need to use the appropriate migration script to update to the new table definition.

* [The Redshift migration script][redshift-migration]
* [The Postgres migration script][postgres-migration]

<h2><a name="help">8. Documentation and help</a></h2>

Documentation relating to enrichments is available on the wiki:

* [Using EmrEtlRunner][emretlrunner-wiki]
* [Configuring enrichments][configuring-enrichments]

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

For more details on this release, please check out the [0.9.6 Release Notes] [snowplow-096] on GitHub.

[self-describing-json]: http://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/
[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample
[emretlrunner-config-jsons]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/enrichments
[referer-parser-repo]: https://github.com/snowplow/referer-parser
[maxmind]: https://www.maxmind.com/en/geolocation_landing?rld=snowplow
[geoipcity]: http://dev.maxmind.com/geoip/legacy/install/city/?rld=snowplow
[geolitecity]: http://dev.maxmind.com/geoip/legacy/geolite/?rld=snowplow
[geoipisp]: https://www.maxmind.com/en/isp?rld=snowplow
[geoiporg]: https://www.maxmind.com/en/organization?rld=snowplow
[geoipdomain]: https://www.maxmind.com/en/domain?rld=snowplow
[geoipnetspeed]: https://www.maxmind.com/en/netspeed?rld=snowplow
[redshift-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/migrate_0.3.0_to_0.4.0.sql
[postgres-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/postgres-storage/sql/migrate_0.2.0_to_0.3.0.sql

[configuring-enrichments]: https://github.com/snowplow/snowplow/wiki/Configuring-enrichments
[emretlrunner-wiki]: https://github.com/snowplow/snowplow/wiki/2-Using-EmrEtlRunner

[855]: https://github.com/snowplow/snowplow/issues/855
[428]: https://github.com/snowplow/snowplow/issues/428
[894]: https://github.com/snowplow/snowplow/issues/894
[883]: https://github.com/snowplow/snowplow/issues/182

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[snowplow-096]: https://github.com/snowplow/snowplow/releases/0.9.6
