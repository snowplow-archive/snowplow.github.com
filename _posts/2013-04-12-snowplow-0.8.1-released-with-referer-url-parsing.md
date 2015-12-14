---
layout: post
title: Snowplow 0.8.1 released with referer URL parsing
title-short: Snowplow 0.8.1
tags: [snowplow, referer parser, parse, referer]
author: Alex
category: Releases
---

Just nine days after our Snowplow 0.8.0 release, we are pleased to have our next release ready: Snowplow **0.8.1**. With the last release we promised that the new Scalding-based ETL/enrichment process would lay a strong technical foundation for our roadmap - and hopefully this release bears that out!

Until this release, Snowplow has provided users the raw referer URL, from which analysts can deduce who the referer was. In this release, Snowplow processes that referer URL to identify what drove a visitor to your website, specifically:

1. Were they driven by a search engine, social network, or link in an email program?
2. If so, which search engine / social network / email program?
3. If they were driven by a search engine, what query did they enter?

This data is key for performing attribution analytics.

Snowplow delivers the above functionality by parsing the page referer URIs which the JavaScript tracker sends to the collector. The Snowplow enrichment layer does a couple of things with these referer URIs:

1. It splits the referer URL into its six components (scheme, host, port, path, query, fragment). This makes querying referer data significantly easier, as we hope to show in future blog posts and attribution analytics recipes
2. It looks up the referer URL in a database of known referers and attempts to extract details about this referer, which you can then use for marketing attribution. (For example - is the referer a search engine, or social network? What query did the user enter in the search engine?)

We will publish a post on how to use the data in a blog post in the near-future. In the rest of this post, then, we will cover:

1. [Referer parsing implementation](/blog/2013/04/12/snowplow-0.8.1-released-with-referer-url-parsing#referer-parsing)
2. [Some example data](/blog/2013/04/12/snowplow-0.8.1-released-with-referer-url-parsing#example-data)
3. [Upgrading and usage](/blog/2013/04/12/snowplow-0.8.1-released-with-referer-url-parsing#upgrading-usage)
4. [Getting help](/blog/2013/04/12/snowplow-0.8.1-released-with-referer-url-parsing#help)

Read on below the fold to find out more.

<!--more-->

<h2><a name="referer-parsing">1. Referer parsing implementation</a></h2>

The extraction of the referer URL into its six components is relatively straightforward. The second stage, looking up the referer URL in a database of known referers, is worth discussing in a little more detail.

Our referer analysis process uses the latest version of our separate and standalone [referer-parser] [referer-parser] library. This library comes with a sizeable database of known referers, including search engines, social networks and webmail providers. You can view the library [here] [library]. It is a straightforward YAML file containing a long list of referers. Because this is an open source list, anyone can contribute additional referers to it. In this way, we hope it will remain one of the most extensive and authoritative lists of referers to use in web analytics.

Snowplow feeds the referer URI and page URI to referer-parser to identify which `refr_medium` this referer URL belongs to:

1. "search" means that this referer is a known search engine
2. "social" means a social network or similar site
3. "email" means a webmail provider such as Yahoo! Mail
4. "internal" means that the referer was another page on the same domain
5. "unknown" means that there was a referer, but we couldn't identify it as belonging to one of the other categories

If the referer can be found in the referer-parser database, Snowplow stores the name of the refering site in the `refr_source` field.

Finally, if the referer is a "search" referer and Snowplow can pull out a search query from the referer URL, it then stores this search term in the `refr_term` field.

<h2><a name="example-data">2. Example data</a></h2>

Here is an excerpt of referer data from an ecommerce retailer - right-click and select "Open in New Tab" to see this at full size:

![parsed-referers-img][parsed-referers-img]

As you can see, in this excerpt we have a variety of different referers - some internal pages and some search pages (Google, Google Images, Bing Images and AOL).

<h2><a name="upgrading-usage">3. Upgrading and usage</a></h2>

As with the 0.8.0 release, this new release assumes that you are running the Hadoop (Scalding) ETL and feeding your data into Redshift.

To upgrade to 0.8.1 from 0.8.0, follow these steps:

### 3.1 ETL

If you are using EmrEtlRunner, you need to update your configuration file, `config.yml`, to the latest version of the Hadoop ETL:

	:snowplow:
	  :hadoop_etl_version: 0.2.0 # Version of the Hadoop ETL

### 3.2 Redshift

We have updated the Redshift table definition, you can find the latest version in the GitHub repository [here] [table-def-sql].

If you already have your Snowplow data in the previous version of the Redshift events table, then we have written [a migration script] [migrate-sql] to handle the upgrade. **Please review this script carefully before running and check that you are happy with how it handles the upgrade.**

Also please note that we have had to remove the "raw" `referrer_url` field from our Redshift events table for space reasons. This means that your historical data will lose **all** referer information in your events table unless you run a re-computation, see below.

### 3.3 (Optional) Re-computation

If you would like to see referer details for historic Snowplow events (i.e. events already in your Snowplow events table in Redshift), then we recommend re-running your Snowplow ETL process across all of your historical raw data.

This is also advisable given that we have removed the raw `referrer_url` field from our Redshift table definition for space reasons.

To re-run your Snowplow ETL process across all your historical data, please see our answer to [I want to recompute my Snowplow events, how?] [recompute-wiki] on the Troubleshooting wiki page.

### 3.4 Usage

And that's it! Once you have made these changes, you should have Snowplow populating the referer details for all new events.

<h2><a name="help">4. Getting help</a></h2>

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

You can see the full list of issues delivered in Snowplow 0.8.1 on [GitHub] [referer-parsing-milestone].

[parsed-referers-img]: /assets/img/blog/2013/04/parsed-referers.png

[table-def-sql]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/table-def.sql
[migrate-sql]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/migrate_0.0.1_to_0.1.0.sql
[recompute-wiki]: https://github.com/snowplow/snowplow/wiki/Troubleshooting#wiki-recompute-events

[referer-parser]: https://github.com/snowplow/referer-parser/tree/feature/social
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[referer-parsing-milestone]: https://github.com/snowplow/snowplow/issues?milestone=16&page=1&state=closed
[library]: https://github.com/snowplow/referer-parser/blob/feature/social/referers.yml
