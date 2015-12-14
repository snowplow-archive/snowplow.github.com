---
layout: post
title: Snowplow 0.8.4 released with MaxMind geo-IP lookups
title-short: Snowplow 0.8.4
tags: [snowplow, maxmind, geoip, enrichment]
author: Alex
category: Releases
---

We are pleased to announce the immediate availability of Snowplow **0.8.4**. This is a big release, which adds geo-IP lookups to the Snowplow Enrichment stage, using the excellent [GeoLite City database] [geolite] from [MaxMind, Inc] [maxmind]. This has been one of the most requested features from the Snowplow community, so we are delighted to launch it. Now you can determine the location of your website visitors directly from the Snowplow events table, and plot that data on a wide range of mapping tools including [Tableau] [tableau-mapping] or [Vincent] [vincent-mapping]:

<a href="/assets/img/blog/2013/05/pbz-global-visitors.jpg"><img src="/assets/img/blog/2013/05/pbz-global-visitors.jpg" /></a>

*Click on the image above to enlarge it*

Here is some example geo-IP data:

<a href="/assets/img/blog/2013/05/geoip-data.png"><img src="/assets/img/blog/2013/05/geoip-data.png" /></a>

*Click on the image above to enlarge it*

As well as geo-IP enrichment, there are a number of other code improvements to the Hadoop ETL, plus some minor improvements to EmrEtlRunner and some corresponding updates to the Redshift table. In this post we will cover:

1. [The new geo-IP capabilities](/blog/2013/05/16/snowplow-0.8.4-released-with-maxmind-geoip#geoip)
2. [Other changes](/blog/2013/05/16/snowplow-0.8.4-released-with-maxmind-geoip#other-changes)
3. [Upgrading](/blog/2013/05/16/snowplow-0.8.4-released-with-maxmind-geoip#upgrading)
4. [Getting help](/blog/2013/05/16/snowplow-0.8.4-released-with-maxmind-geoip#help)

<!--more-->

<h2><a name="geoip">1. The new geo-IP capabilities</a></h2>

When we released Snowplow 0.8.0 back in April, we promised that the new Scalding-based ETL process would provide a solid bedrock on which we could build a bunch of data enrichments to perform on the raw Snowplow logs to make Snowplow data more interesting to analyse. With version 0.8.1, we included a referer parsing enrichment, which looked up external page referers against a database of search engines and social networks, and used associatd rules to infer additional data about what drove those visitors to your site. This release adds our second big enrichment: the ETL process now lookups every IP address against MaxMind's [GeoLite City database] [geolite] in order to determine the location of a visitors - specifically (wherever possible):

* `geo_country` - the two-letter [ISO 3166-1 alpha-2] [3166-1] country code associated with the IP address
* `geo_region` -  the two letter [ISO-3166-2] [3166-2] or [FIPS 10-4] [fips] code for the state or region associated with the IP address
* `geo_city` - the city or town name associated with the IP address
* `geo_zipcode` - the zip or postal code associated with the IP address
* `geo_latitude` - the latitude associated with the IP address
* `geo_longitude` - the longitude associated with the IP address

For more information on these six fields we recommend reading the [GeoIP CSV Databases technical reference] [geoip-data-ref] on the MaxMind website.

Providing all this data directly in the Snowplow events table makes it easy to create geographic maps like the one below using Snowplow data directly: we will cover how to do this in a forthcoming blog post.

<a href="/assets/img/blog/2013/05/pbz-europe-visitors.jpg"><img src="/assets/img/blog/2013/05/pbz-europe-visitors.jpg" /></a>

<h2><a name="other-changes">2. Other changes</a></h2>

In this release we have also made some functional improvements to the Hadoop (Scalding) ETL, plus some minor improvements to EmrEtlRunner and some updates to the Redshift table. To take these in turn:

### Hadoop ETL

We have made various improvements to the Hadoop ETL:

* We have bumped the version of [referer-parser] [referer-parser] - the latest version includes a fix to better attribute Google referer URLs
* We have added truncation of `refr_urlpath`, `refr_urlquery` and `urlfragment`, to prevent Redshift load errors
* We now remove tabs and newlines from referer search terms (`refr_term`), again to prevent Redshift load errors
* We have fixed a nasty bug where the client timestamp was being inaccurately localised to the Hadoop cluster's local time ([issue #238] [issue-238]) - thanks [Gabor] [rgabo] for spotting this
* We have made the code around page URL extraction more robust in the case that a page URL cannot be extracted
* If you are running the latest version of the Clojure Collector, then the specific version number will now be extracted into the `v_collector` field

### EmrEtlRunner

We have updated EmrEtlRunner to supply the location of the MaxMind GeoLite City database to the Scalding ETL.

We have also improved the notification messages when the ETL job is started on Elastic MapReduce, and the notification message if the job should fail.

### Redshift events table

We have updated the Redshift events table to include new fields for the geo-IP location - see [above](#geoip) for the six new field names.

Also, we have renamed the five `ev_` fields in the Redshift table definition to start with `se_`, e.g. `se_action`. This is to make these column names consistent with our structured events terminology.

<h2><a name="upgrading">3. Upgrading</a></h2>

There are **three components** to upgrade in this release:

* The Scalding ETL, to version 0.3.0
* EmrEtlRunner, to version 0.2.0
* The Redshift events table, to version 0.2.0

Let's take these in turn:

### Hadoop ETL

If you are using EmrEtlRunner, you need to update your configuration file, `config.yml`, to the latest version of the Hadoop ETL:

	:snowplow:
	  :hadoop_etl_version: 0.3.0 # Version of the Hadoop ETL

### EmrEtlRunner

You need to upgrade your EmrEtlRunner installation to the latest code (0.8.4 release) on GitHub:

    $ git clone git://github.com/snowplow/snowplow.git
    $ git checkout 0.8.4

### Redshift events table

We have updated the Redshift table definition - you can find the latest version in the GitHub repository [here] [table-def-sql].

If you already have your Snowplow data in the previous version of the Redshift events table, we have written [a migration script] [migrate-sql] to handle the upgrade. **Please review this script carefully before running and check that you are happy with how it handles the upgrade.**

<h2><a name="help">4. Getting help</a></h2>

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

You can see the full list of issues delivered in Snowplow 0.8.4 on [GitHub] [geoip-milestone].

[geolite]: http://dev.maxmind.com/geoip/legacy/geolite
[maxmind]: http://www.maxmind.com

[geoip-img]: /assets/img/blog/2013/05/geoip-data.png

[3166-1]: http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
[3166-2]: http://en.wikipedia.org/wiki/ISO_3166-2
[fips]: http://en.wikipedia.org/wiki/FIPS_10-4
[geoip-data-ref]: http://dev.maxmind.com/geoip/legacy/csv

[table-def-sql]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/table-def.sql
[migrate-sql]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/migrate_0.1.0_to_0.2.0.sql

[rgabo]: https://github.com/rgabo
[issue-238]: https://github.com/snowplow/snowplow/issues/238

[referer-parser]: https://github.com/snowplow/referer-parser

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[geoip-milestone]: https://github.com/snowplow/snowplow/issues?milestone=17&page=1&state=closed

[tableau-mapping]: http://kb.tableausoftware.com/articles/knowledgebase/mapping-basics
[vincent-mapping]: http://wrobstory.github.io/2013/04/python-maps-chloropleth.html
