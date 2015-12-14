---
layout: post
title: Snowplow 0.9.6 released with configurable enrichments
title-short: Snowplow 0.9.6
tags: [snowplow, json, json schema, enrichments]
author: Fred
category: Releases
---

We are pleased to announce the release of Snowplow 0.9.6. This release does four things:

1. It fixes some important bugs discovered in Snowplow 0.9.5, related to our new shredding functionality
2. It introduces new JSON-based configurations for Snowplow's existing enrichments
3. It extends our geo-IP lookup enrichment to support all five of [MaxMind] [maxmind]'s commercial databases
4. It extends our referer-parsing enrichment to support a user-configurable list of internal domains

We are really excited about our new JSON-configurable enrichments. This is the first step on our roadmap to make Snowplow enrichments completely pluggable. In the short-term, it means that we can release new enrichments which won't require you to install a new version of EmrEtlRunner. It also means we can support much more complex (configuration-wise) enrichments than we could previously; finally it also means we can share the same enrichment configurations between our Hadoop and Kinesis-based flows.

The support for the various paid-for [MaxMind] [maxmind] databases is exciting too - we've been using this internally to see which companies are browsing the Snowplow website! We are very pleased to have [MaxMind] [maxmind] as our first commercial data partner and would encourage you to [check out their IP database offerings] [geoip-landing].

Below the fold we will cover:

1. [Important bug fixes for 0.9.5](/blog/2014/07/26/snowplow-0.9.6-released-with-configurable-enrichments/#bug-fixes)
2. [New format for enrichment configuration](/blog/2014/07/26/snowplow-0.9.6-released-with-configurable-enrichments/#new-format)
3. [An example: configuring the anon_ip enrichment](/blog/2014/07/26/snowplow-0.9.6-released-with-configurable-enrichments/#anon-ip)
4. [The referer_parser enrichment](/blog/2014/07/26/snowplow-0.9.6-released-with-configurable-enrichments/#referer-parser)
5. [The ip_lookups enrichment](/blog/2014/07/26/snowplow-0.9.6-released-with-configurable-enrichments/#ip-lookups)
6. [Changes to the atomic.events table](/blog/2014/07/26/snowplow-0.9.6-released-with-configurable-enrichments/#atomic-events)
7. [Other changes](/blog/2014/07/26/snowplow-0.9.6-released-with-configurable-enrichments/#other-changes)
8. [Upgrading](/blog/2014/07/26/snowplow-0.9.6-released-with-configurable-enrichments/#upgrading)
9. [Documentation and help](/blog/2014/07/26/snowplow-0.9.6-released-with-configurable-enrichments/#help)

<!--more-->

<h2><a name="bug-fixes">1. Important bug fixes for 0.9.5</a></h2>

We have identified several bugs in our new shredding functionality released in 0.9.5 a fortnight ago, now fixed in 0.9.6. These are:

* Trailing empty fields in an enriched event TSV row would cause shredding for that row to fail with a "Line does not match Snowplow enriched event" error. Now fixed ([#921] [921])
* The StorageLoader now knows to look in Amazon's eu-west-1 region for the `snowplow-hosted-assets` S3 bucket, regardless of which region the user has specified for their own JSON Path files ([#895] [895])
* We fixed the contract on the `partition_by_run` function in EmrEtlRunner. This bug was causing issues if `:continue_on_unexpected_error:` was set to `false` with the `:errors:` buckets empty ([#894] [894])

<h2><a name="new-format">2. New format for enrichment configuration</a></h2>

The new version of Snowplow supports three configurable enrichments: the `anon_ip` enrichment, the `ip_lookups` enrichment, and the `referer_parser` enrichment. Each of these can be configured using a [self-describing JSON] [self-describing-json]. The enrichment configuration JSONs follow a common pattern:

{% highlight json %}
{
    "schema": "iglu:((self-describing JSON schema for enrichment))",
    "data": {
        "name": "enrichment name",
        "vendor": "enrichment vendor",
        "enabled": true / false,
        "parameters": {
            ((enrichment-specific settings))
        }
    }
}
{% endhighlight %}

The `"enabled"` field lets you switch the enrichment on or off and the `"parameters"` field contains the data specific to the enrichment.

These JSONs should be placed in a single directory, and that directory's filepath should be passed to the EmrEtlRunner as a new command-line option called `--enrichments`:

{% highlight bash %}
$ bundle exec bin/snowplow-emr-etl-runner --config config/config.yml --enrichments config/enrichments
{% endhighlight %}

For example, if you want to configure all three enrichments, your config directory might have this structure:

{% highlight yaml %}
config/
  config.yml
  enrichments/
    anon_ip.json
    ip_lookups.json
    referer_parser.json
{% endhighlight %}

The JSON files in `config/enrichments` will then be packaged up by EmrEtlRunner and sent to the Hadoop job. Some notes on this:

* The filenames do not matter, but only files with the `.json` file extension will be packaged up and sent to Hadoop
* Any enrichment for which no JSON can be found will be disabled (i.e. not run) in the Hadoop enrichment code
* Thus the `ip_lookups` and `referer_parser` enrichments **no longer happen automatically** - you must provide configuration JSONs with the "enabled" field set to `true` if you want them. Sensible default configuration JSONs are available on Github [here] [emretlrunner-config-jsons].

The new JSON-based configurations are discussed in further detail on the [Configuring enrichments] [configuring-enrichments] wiki page.

<h2><a name="anon-ip">3. An example: configuring the anon_ip enrichment</a></h2>

The functionality of the IP anonymization enrichment remains unchanged: it lets you anonymize part (or all) of each user's IP address. Here's an example configuration JSON for this enrichment:

{% highlight json %}
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
{% endhighlight %}

This is a simple enrichment: the only field in `"parameters"` is `"anonOctets"`, which is the number of octets of each IP address to anonymize. In this case it is set to 3, so 37.157.26.115 would be anonymized to 37.x.x.x.

<h2><a name="referer-parser">4. The referer_parser enrichment</a></h2>

Snowplow uses the [Referer-Parser][referer-parser-repo] to extract useful information from referer URLs. For example, the referer:

"http://www.google.com/search?q=snowplow+enrichments&hl=en&client=safari"

would be identified as a Google search using the terms "snowplow" and "enrichments".

If the referer URI's host is the same as the current page's host, the referer will be counted as internal.

The latest version of the referer-parser project adds the option to pass in a list of additional domains which should count as internal. The referer_parser enrichment can now be configured to take advantage of this:

{% highlight json %}
{
	"schema": "iglu:com.snowplowanalytics.snowplow/referer_parser/jsonschema/1-0-0",

	"data": {

		"name": "referer_parser",
		"vendor": "com.snowplowanalytics.snowplow",
		"enabled": true,
		"parameters": {
			"internalDomains": [
				"mysubdomain1.acme.com",
				"mysubdomain2.acme.com"
			]
		}
	}
}
{% endhighlight %}

Using the above configuration will ensure that all referrals from the internal subdomains "mysubdomain1.acme.com" and "mysubdomain2.acme.com" will be counted as internal rather than unknown.

<h2><a name="ip-lookups">5. The ip_lookups enrichment</a></h2>

Previous versions of Snowplow used a free [MaxMind] [maxmind] database to look up a user's geographic location based on their IP address. This version expands on that functionality by adding the option to use other, paid-for, [MaxMind][maxmind] databases to look up additional information. The full list of supported databases:

1) [GeoIPCity][geolitecity] and the free version [GeoLiteCity][geolitecity] look up a user's geographic location. The ip_lookups enrichment uses this information to populate the `geo_country`, `geo_region`, `geo_city`, `geo_zipcode`, `geo_latitude`, `geo_longitude`, and `geo_region_name` fields. The paid-for database is more accurate than the free version. [This blog post][maxmind-post] has more background information

2) [GeoIP ISP][geoipisp] looks up a user's ISP address. This populates the new `ip_isp` field

3) [GeoIP Organization][geoiporg] looks up a user's organization. This populates the new `ip_organization` field

4) [GeoIP Domain][geoipdomain] looks up the second-level domain name associated with a user's IP address. This populates the new `ip_domain` field

5) [GeoIP Netspeed][geoipnetspeed] estimates a user's connection speed. This populates the new `ip_organization` field

Here is An example configuration JSON, using the free GeoLiteCity database and the proprietary GeoIP ISP database only:

{% highlight json %}
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
				"uri": "s3://acme-proprietary-assets/third-party/maxmind"
			},
		}
	}
}
{% endhighlight %}

The `database` field contains the name of the database file.

The `uri` field contains the URI of the bucket in which the database file is found. The GeoLiteCity database is freely hosted by Snowplow at the supplied URI. In this example, the user has purchased MaxMind's commercial "GeoIPISP.dat" and is hosting it in their own private S3 bucket.

<h2><a name="atomic-events">6. Changes to the atomic.events table</a></h2>

We have updated the table definitions to support the extended MaxMind enrichment - see above for the new field names. We have also applied runlength encoding to all Redshift fields which are driven off the IP address ([#883][883]).

To bring the tables inline with the design changes made to contexts and unstructured events in recent releases, we have deleted the `event_vendor` and `ue_name` fields and renamed `ue_properties` to `unstruct_event`.

Finally, we have created a new `etl_tstamp` field. This is populated by a timestamp created in the EmrEtlRunner, and describes when ETL for a particular row began.

Migration scripts are available for [Redshift][redshift-migration] and [Postgres][postgres-migration].

<h2><a name="other-changes">7. Other changes</a></h2>

We have also made some small but valuable improvements to the Hadoop-based Enrichment process:

1. We are now extracting `CanonicalInput`'s `userId` as `network_userid` if set, thanks community member [Phil Kallos] [pkallos]! ([#855] [855])
2. We are now validating that the transaction ID field is an integer ([#428] [428])
3. We can now extract the `event_id` UUID from the incoming querystring if set. This should prove very helpful for the Kinesis flow wherever at-least-once processing is in effect ([#723] [723])
4. We have upgraded the version of user-agent-utils we are using (thanks again Phil!)

<h2><a name="upgrading">8. Upgrading</a></h2>

<div class="html">
<h3><a name="upgrading-emretlrunner">8.1 Upgrading EmrEtlRunner and StorageLoader</a></h3>
</div>

You need to update EmrEtlRunner and StorageLoader to the latest code (0.9.6 release) on GitHub:

{% highlight bash %}
$ git clone git://github.com/snowplow/snowplow.git
$ git checkout 0.9.6
$ cd snowplow/3-enrich/emr-etl-runner
$ bundle install --deployment
$ cd ../../4-storage/storage-loader
$ bundle install --deployment
{% endhighlight %}

<div class="html">
<h3><a name="upgrading-config">8.2 Updating EmrEtlRunner's configuration</a></h3>
</div>

Update your EmrEtlRunner's `config.yml` file. First update **both** of your Hadoop job versions to, respectively:

{% highlight yaml %}
  :versions:
    :hadoop_enrich: 0.6.0 # WAS 0.5.0
    :hadoop_shred: 0.2.0 # WAS 0.1.0
{% endhighlight %}

Next, **completely delete** the `:enrichments:` section at the bottom:

{% highlight yaml %}
:enrichments:
  :anon_ip:
    :enabled: true
    :anon_octets: 2
{% endhighlight %}

For a complete example, see our [sample `config.yml` template] [emretlrunner-config-yml].

<div class="html">
<h3><a name="upgrading-enrichments">8.3 Adding enrichments</a></h3>
</div>

Finally, if you wish to use any of the configurable enrichments, you need to create a directory of configuration JSONs and pass that directory to the EmrEtlRunner using the new `--enrichments` option.

For help on this, please read our overview above; also check out the [example enrichments directory] [emretlrunner-config-jsons], and review the [configuration guide] [configuring-enrichments] for the new JSON-based enrichments.

**Important:** don't forget to update any Bash script that you use to run your EmrEtlRunner job, to include the `--enrichments` argument. If you forget to do this, then all of your enrichments will be switched off. You can see updated versions of these Bash files here:

* [snowplow-emr-etl-runner.sh] [emretlrunner-bash]
* [snowplow-runner-and-loader.sh] [runner-loader-bash]

<div class="html">
<h3><a name="upgrading-storage">8.4 Migrating atomic.events</a></h3>
</div>

You need to use the appropriate migration script to update to the new table definition:

* [The Redshift migration script] [redshift-migration]
* [The PostgreSQL migration script] [postgres-migration]

And that's it - you should be fully upgraded.

<h2><a name="help">9. Documentation and help</a></h2>

Documentation relating to enrichments is available on the wiki:

* [Using EmrEtlRunner] [emretlrunner-wiki]
* [Configuring enrichments] [configuring-enrichments]

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

For more details on this release, please check out the [0.9.6 Release Notes] [snowplow-096] on GitHub.

[self-describing-json]: http://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/
[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample
[emretlrunner-config-jsons]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/enrichments
[referer-parser-repo]: https://github.com/snowplow/referer-parser

[pkallos]: https://github.com/pkallos

[maxmind]: https://www.maxmind.com/en/geolocation_landing?rld=snowplow
[geoipcity]: http://dev.maxmind.com/geoip/legacy/install/city/?rld=snowplow
[geolitecity]: http://dev.maxmind.com/geoip/legacy/geolite/?rld=snowplow
[geoipisp]: https://www.maxmind.com/en/isp?rld=snowplow
[geoiporg]: https://www.maxmind.com/en/organization?rld=snowplow
[geoipdomain]: https://www.maxmind.com/en/domain?rld=snowplow
[geoipnetspeed]: https://www.maxmind.com/en/netspeed?rld=snowplow
[geoip-landing]: https://www.maxmind.com/en/geolocation_landing?rld=snowplow

[redshift-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/migrate_0.3.0_to_0.4.0.sql
[postgres-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/postgres-storage/sql/migrate_0.2.0_to_0.3.0.sql

[configuring-enrichments]: https://github.com/snowplow/snowplow/wiki/Configuring-enrichments
[emretlrunner-wiki]: https://github.com/snowplow/snowplow/wiki/2-Using-EmrEtlRunner

[428]: https://github.com/snowplow/snowplow/issues/428
[723]: https://github.com/snowplow/snowplow/issues/723
[855]: https://github.com/snowplow/snowplow/issues/855
[883]: https://github.com/snowplow/snowplow/issues/883
[894]: https://github.com/snowplow/snowplow/issues/894
[895]: https://github.com/snowplow/snowplow/issues/895
[921]: https://github.com/snowplow/snowplow/issues/921

[emretlrunner-bash]: https://github.com/snowplow/snowplow/blob/0.9.6/3-enrich/emr-etl-runner/bin/snowplow-emr-etl-runner.sh
[runner-loader-bash]:https://github.com/snowplow/snowplow/blob/0.9.6/4-storage/storage-loader/bin/snowplow-runner-and-loader.sh

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[snowplow-096]: https://github.com/snowplow/snowplow/releases/0.9.6
