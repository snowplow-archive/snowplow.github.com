---
layout: post
title-short: Snowplow 79 Black Swan
title: "Snowplow 79 Black Swan released"
tags: [snowplow, enrichment, iglu, api, rest]
author: Anton
category: Releases
---

We are pleased to announce the release of [Snowplow 79 Black Swan] [snowplow-release]. This release introduces our new API Request Enrichment, plus a new HTTP Header Extractor Enrichment and several other improvements on the enrichments side.

![black-swan][black-swan]

1. [API Request Enrichment](/blog/2016/04/xx/snowplow-r79-black-swan-released#api-request-enrichment)
2. [HTTP Header Extractor Enrichment](/blog/2016/04/xx/snowplow-r79-black-swan-released#http-header-extractor-enrichment)
3. [Iglu client update](/blog/2016/04/xx/snowplow-r79-black-swan-released#iglu-client)
4. [Other improvements](/blog/2016/04/xx/snowplow-r79-black-swan-released#other)
5. [Upgrading](/blog/2016/04/xx/snowplow-r79-black-swan-released#upgrading)
6. [Getting help](/blog/2016/04/xx/snowplow-r79-black-swan-released#help)

<!--more-->

<h2 id="api-request-enrichment">1. API Request Enrichment</h2>

The [API Request Enrichment] [api-request-enrichment] lets us perform _dimension widening_ on an incoming Snowplow event using any internal or external HTTP-based API. Alongside our [JavaScript Enrichment][js-enrichment], this enrichment is a step on the way to a fully customizable enrichment process for Snowplow.

The API Request Enrichment lets you effectively join arbitrary entities to your events during the enrichment process, as opposed to attaching the data in your tracker or in your event data warehouse. This is very powerful, not least for the real-time use case where performing a relational database join post-enrichment is impractical.

This is our most configurable enrichment yet: the API lookup can be driven by data extracted from any field found in the Snowplow enriched event, or indeed any JSON property found within the `unstruct_event`, `contexts` or `derived_contexts` fields. It lets you extract multiple entities from the API's JSON response as self-describing JSONs for adding back into the `derived_contexts` field.

For a detailed walk-through of the API Request Enrichment, check out our new tutorial, [Integrating Clearbit business data into Snowplow using the API Request Enrichment] [clearbit-tutorial].

You can also find out more on the [API Request Enrichment] [api-request-enrichment] page on the Snowplow wiki.

<h2 id="headerenrichment">2. HTTP Header Extractor Enrichment</h2>

In R72 Great Spotted Kiwi we released the [Cookie Extractor Enrichment] [cookie-extractor-enrichment], allowing users to capture first-party cookies set by other services on your domain such as ad servers or CMSes. This data was extracted from the HTTP headers stored in the Thrift raw event payload by the Scala Stream Collector.

Depending on your tracking implementation, these HTTP headers can contain other relevant data for analytics - and with this release, community member [Khalid Jazaerly] [khalid] has kindly contributed new more powerful [HTTP Header Extractor Enrichment] [hhe-enrichment].

In order to enable it, use a configuration similar to the one for the Cookie Extractor Enrichment:

{% highlight json %}
{
	"schema": "iglu:com.snowplowanalytics.snowplow.enrichments/http_header_extractor_config/jsonschema/1-0-0",
	"data": {
		"vendor": "com.snowplowanalytics.snowplow.enrichments",
		"name": "http_header_extractor_config",
		"enabled": true,
		"parameters": {
			"headersPattern": ".*"
		}
	}
}
{% endhighlight %}

This configuration will extract all headers from HTTP requests, including cookies; in practice you would probably extract more specific headers.
Each extracted header will end up a single derived context following the JSON Schema [org.ietf/http_header/jsonschema/1-0-0][header-schema].

Please note that this enrichment only works with events recorded by the Scala Stream Collector - the CloudFront and Clojure Collectors do not capture HTTP headers.

You can find out more on the [HTTP Header Extractor Enrichment][hhe-enrichment] page on the Snowplow wiki.

<h2 id="igluClient">3. Iglu client update</h2>

In this release we also updated an internal Iglu client to version 0.4.0.
Most important feature of this update is ability to fetch your Schemas from Iglu repositories with authentication support. This can be useful if you want to leave structure of your data confidential.
In order to use API key authentication you need to setup [Iglu Scala repo][iglu-scala] and add `apikey` to HTTP repository `connection` object in your resolver configuration, so it looks like following:

{% highlight json %}
{
	"name": "Iglu Central",
	"priority": 0,
	"vendorPrefixes": [ "com.snowplowanalytics" ],
	"connection": {
		"http": {
			"uri": "http://iglucentral.com",
			"apikey": "YOUR_API_KEY_HERE"
		}
	}
}
{% endhighlight %}

Don't forget also to change SchemaVer from `1-0-0` to `1-0-1`.

Also this update brings two important bug fixes.
Iglu client now will retry Schema request after first two non-404 errors.
Previously Iglu client aggressively cached failed HTTP requests and our users could miss events in `enriched` bucket if they were unlucky enough and their HTTP response timed out unexpectedly.
Also Iglu client now validates fetched Schema before try to validate events against it, which means if JSON Schema appear to be invalid, user will receive meaningful error message about it.

<h2 id="other">4. Other improvements</h2>

We have also:

* Turned off some enrichments in [examples directory][enrichment-configs] which are not supposed to work without additional configuration to not confuse newcomers ([#2326][issue-2326])  ([#2327][issue-2327])
* Improved error messages for Weather Enrichment ([#2325][issue-2325])
* user-agent-utils bumped to newest version, allowing to correctly detect fresh web browsers ([#2516][issue-2516])

<h2 id="upgrading">5. Upgrading</h2>

The latest version of the EmrEtlRunner and StorageLoader are available from our Bintray:

```
http://dl.bintray.com/snowplow/snowplow-generic/snowplow_kinesis_r79_black_swan.zip
```

In the config.yml, update your hadoop_enrich and hadoop_shred job versions like so:

<pre>
versions:
  hadoop_enrich: 1.7.0        # WAS 1.6.0
  hadoop_shred: 0.9.0         # WAS 0.8.0
  hadoop_elasticsearch: 0.1.0 # UNCHANGED
</pre>

If you're planning to use Iglu repository with authentication you need to deploy [Iglu repository] [iglu-scala] with support of it and update your Iglu [resolver configuration][new-resolver-conf] with private `apikey` and new `1-0-1` SchemaVer:

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.iglu/resolver-config/jsonschema/1-0-1",
  "data": {
    "cacheSize": 500,
    "repositories": [
      {
        "name": "Iglu Central",
        "priority": 0,
        "vendorPrefixes": [ "com.snowplowanalytics" ],
        "connection": {
          "http": {
            "uri": "http://iglucentral.com"
          }
        }
      },
      {
        "name": "Private Acme repository for com.acme",
        "priority": 1,
        "vendorPrefixes": [ "com.acme" ],
        "connection": {
          "http": {
            "uri": "http://iglu.acme.com/api",
            "apikey": "APIKEY-FOR-ACME"
          }
        }
      },
      {
        "name": "Private Acme repository for com.ajax",
        "priority": 1,
        "vendorPrefixes": [ "com.ajax" ],
        "connection": {
          "http": {
            "uri": "http://iglu.acme.com/api",
            "apikey": "APIKEY-FOR-AJAX"
          }
        }
      }
    ]
  }
}
{% endhighlight }

Unfortunately, due to [limitation][issue-124] imposed on Iglu by current authentication system, you'll need to add several entries in `repository` array if you're privately hosting Schemas with different vendors even on a single physical repository.

<h2 id="roadmap">8. Roadmap</h2>

Most of our enrichments are used as tools for data dimension widening, becoming a middle JOIN for your atomic data.
Also, you can see HTTP Request Enrichment and JavaScript Enrichment as pioneering custom enrichments, which are not tied to particular data provider or structure of data.
Our current effort is concentrated on next SQL Query Enrichments which should become a third in kind of custom enrichments.

Unfortunately, having these custom enrichments you currently still cannot use more than one of each kind.
We now designing a way in which you could specify an order of enrichment execution steps as [directed acyclic graph][DAG] which should both give our users unlimited power of data gathering as well as opportunity to make the enrichment process parallel.

Upcoming Snowplow releases include:

* [Release 78 Great Hornbill][r78-milestone], which will bring the Kinesis pipeline up-to-date with the most recent Scala Common Enrich releases. This will also include click redirect support in the Scala Stream Collector
* [Release 79 Black Swan][r79-milestone], which will allow enriching an event by requesting data from a third-party API

Note that these releases are always subject to change between now and the actual release date.

<h2 id="help">6. Getting help</h2>

For more details on this release, please check out the [release notes][snowplow-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[black-swan]: /assets/img/blog/2016/04/black-swan.jpg

[clearbit-tutorial]: xxx

[js-enrichment]: https://github.com/snowplow/snowplow/wiki/JavaScript-script-enrichment
[cookie-extractor-enrichment]: https://github.com/snowplow/snowplow/wiki/Cookie-extractor-enrichment
[api-request-enrichment]: https://github.com/snowplow/snowplow/wiki/API-Request-enrichment
[hhe-enrichment]: https://github.com/snowplow/snowplow/wiki/HTTP-header-extractor-enrichment

[header-schema]: https://github.com/snowplow/iglu-central/blob/master/schemas/org.ietf/http_header/jsonschema/1-0-0

[jsonpath]: http://goessner.net/articles/JsonPath/
[khalid]: https://github.com/khalidjaz
[schema-guru]: https://github.com/snowplow/schema-guru

[iglu-setup]: https://github.com/snowplow/iglu/wiki/Setting-up-an-Iglu-repository
[iglu-auth]: https://github.com/snowplow/iglu/wiki/API-authentication
[iglu-scala]:  https://github.com/snowplow/iglu/wiki/Scala-repo
[new-resolver-conf]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.iglu/resolver-config/jsonschema/1-0-1
[DAG]: https://en.wikipedia.org/wiki/Directed_acyclic_graph

[enrichment-configs]: https://github.com/snowplow/snowplow/tree/master/3-enrich/config/enrichments
[issue-124]: https://github.com/snowplow/iglu/issues/124
[issue-2325]: https://github.com/snowplow/snowplow/issues/2325
[issue-2326]: https://github.com/snowplow/snowplow/issues/2326
[issue-2327]: https://github.com/snowplow/snowplow/issues/2327
[issue-2516]: https://github.com/snowplow/snowplow/issues/2516

[snowplow-release]: https://github.com/snowplow/snowplow/releases/r79-black-swan
[wiki]: https://github.com/snowplow/snowplow/wiki
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[changelog]: https://github.com/snowplow/snowplow/blob/master/CHANGELOG
