---
layout: post
title-short: Snowplow 79 Black Swan
title: "Snowplow 79 Black Swan with API Request Enrichment released"
tags: [snowplow, enrichment, iglu, api, rest]
author: Anton
category: Releases
---

We are pleased to announce the release of [Snowplow 79 Black Swan] [snowplow-release]. This appropriately-named release introduces our powerful new API Request Enrichment, plus a new HTTP Header Extractor Enrichment and several other improvements on the enrichments side.

1. [API Request Enrichment](/blog/2016/05/12/snowplow-r79-black-swan-with-api-request-enrichment-released#api-request-enrichment)
2. [HTTP Header Extractor Enrichment](/blog/2016/05/12/snowplow-r79-black-swan-with-api-request-enrichment-released#http-header-extractor-enrichment)
3. [Iglu client update](/blog/2016/05/12/snowplow-r79-black-swan-with-api-request-enrichment-released#iglu-client)
4. [Other improvements](/blog/2016/05/12/snowplow-r79-black-swan-with-api-request-enrichment-released#other)
5. [Upgrading](/blog/2016/05/12/snowplow-r79-black-swan-with-api-request-enrichment-released#upgrading)
6. [Roadmap](/blog/2016/05/12/snowplow-r79-black-swan-with-api-request-enrichment-released#roadmap)
7. [Getting help](/blog/2016/05/12/snowplow-r79-black-swan-with-api-request-enrichment-released#help)

![black-swan][black-swan]

<!--more-->

<h2 id="api-request-enrichment">1. API Request Enrichment</h2>

The [API Request Enrichment] [api-request-enrichment] lets us perform _dimension widening_ on an incoming Snowplow event using any internal or external HTTP-based API. We are super-excited about this capability - a first for any event analytics platform. Alongside our [JavaScript Enrichment][js-enrichment], this enrichment is a step on the way to a fully customizable enrichment process for Snowplow.

The API Request Enrichment lets you effectively join arbitrary entities to your events during the enrichment process, as opposed to attaching the data in your tracker or in your event data warehouse. This is very powerful, not least for the real-time use case where performing a relational database join post-enrichment is impractical.

This is our most configurable enrichment yet: the API lookup can be driven by data extracted from any field found in the Snowplow enriched event, or indeed any JSON property found within the `unstruct_event`, `contexts` or `derived_contexts` fields. It lets you extract multiple entities from the API's JSON response as self-describing JSONs for adding back into the `derived_contexts` field.

For a detailed walk-through of the API Request Enrichment, check out our new tutorial, [Integrating Clearbit business data into Snowplow using the API Request Enrichment] [clearbit-tutorial].

You can also find out more on the [API Request Enrichment] [api-request-enrichment] page on the Snowplow wiki.

<h2 id="http-header-extractor-enrichment">2. HTTP Header Extractor Enrichment</h2>

In R72 Great Spotted Kiwi we released the [Cookie Extractor Enrichment] [cookie-extractor-enrichment], allowing users to capture first-party cookies set by other services on your domain such as ad servers or CMSes. This data was extracted from the HTTP headers stored in the Thrift raw event payload by the Scala Stream Collector.

Depending on your tracking implementation, these HTTP headers can contain other relevant data for analytics - and with this release, community member [Khalid Jazaerly] [khalid] has contributed a new powerful [HTTP Header Extractor Enrichment] [hhe-enrichment] to extract these.

The configuration is similar to the one for the Cookie Extractor Enrichment:

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

This configuration will extract all headers from HTTP requests, including cookies; in practice you would probably extract more specific headers. Each extracted header will be stored as a single derived context with the JSON Schema [org.ietf/http_header/jsonschema/1-0-0][header-schema].

Please note that this enrichment only works with events recorded by the Scala Stream Collector - the CloudFront and Clojure Collectors do not capture HTTP headers.

You can find out more on the [HTTP Header Extractor Enrichment][hhe-enrichment] page on the Snowplow wiki.

<h2 id="iglu-client">3. Iglu client update</h2>

This release also updates the Iglu client used by our Hadoop Enrich and Hadoop Shred components to [version 0.4.0] [iglu-scala-client-040]. This version lets you fetch your schemas from Iglu registries with [authentication support] [iglu-auth], allowing you to keep your proprietary schemas private.

To use registry authentication, you need to be using the Iglu schema registry server released as part of [Iglu R3 Penny Black] [iglu-r3]; the [setup guide] [iglu-setup] is on the Iglu wiki. Then in the Iglu resolver configuration JSON you use with Snowplow, you will need to add `apikey` to the HTTP repository `connection` object, like so:

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.iglu/resolver-config/jsonschema/1-0-1",
  "data": {
    "cacheSize": 500,
    "repositories": [
      {
        "name": "Iglu Central",
        ...
      },
      {
        "name": "Snowplow Schema Registry",
        "priority": 0,
        "vendorPrefixes": [
          "com.snowplowanalytics.snowplow-website"
        ],
        "connection": {
          "http": {
            "uri": "OUR REGISTRY URI",
            "apikey": "OUR REGISTRY API KEY"
          }
        }
      }
      ...
{% endhighlight %}

Note also the change of the schema from `1-0-0` to `1-0-1`.

This update also contains two important bug fixes:

1. Previously the client aggressively cached failed schema lookups, which could cause a whole set of events to fail if the first lookup of a schema failed unexpectedly. Now, the client will retry the lookup 3 times before caching a schema as missing ([issue #38] [isc-issue-38])
2. The client now validates retrieved schemas before validating events against it. This means that the user will get a meaningful error message if the JSON Schema is invalid ([issue #47] [isc-issue-47])

<h2 id="other">4. Other improvements</h2>

We have also:

* Disabled the [sample enrichment configurations][enrichment-configs] which need user-specific information, to avoid confusion ([#2326][issue-2326]), ([#2327][issue-2327])
* Improved the error messages for the Weather Enrichment ([#2325][issue-2325])
* Bumped our User Agent Utils Enrichment to use the latest version of the library, to better detect recent web browsers ([#2516][issue-2516])

<h2 id="upgrading">5. Upgrading</h2>

<h3>config.yml</h3>

The recommended AMI version to run Snowplow is now **4.5.0** - update your configuration YAML as follows:

{% highlight yaml %}
emr:
  ami_version: 4.5.0 # WAS 4.3.0
{% endhighlight %}

Next, update your `hadoop_enrich` and `hadoop_shred` job versions like so:

{% highlight yaml %}
versions:
  hadoop_enrich: 1.7.0        # WAS 1.6.0
  hadoop_shred: 0.9.0         # WAS 0.8.0
  hadoop_elasticsearch: 0.1.0 # UNCHANGED
{% endhighlight %}

For a complete example, see our [sample `config.yml` template][emretlrunner-config-yml].

<h3>iglu_resolver.json</h3>

If you want to use an Iglu registry with authentication, add a private `apikey` to the registry's configuration entry and set the schema version to [1-0-1][resolver-conf-101]. Here is an example:

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
{% endhighlight %}

Unfortunately, due to a [current limitation] [i-issue-124] in Iglu's authentication system, you'll need to add one entry into the `repository` array for each set of schemas with a distinct `vendorPrefix` within a single registry. We plan on fixing this in an Iglu release soon.

<h2 id="roadmap">6. Roadmap</h2>

This enrichment is the first in a series of new flexible dimension widening enrichments for Snowplow; we are hard at work on a [SQL Query Enrichment] [issue-2321], which we will again release with an in-depth tutorial. 

As we release more generic enrichments like the JavaScript Scripting Enrichment and the API Request Enrichment, the fact that you can only use one of each enrichment type becomes a more painful limitation. We are now designing a way of specifying an order of enrichment execution steps as [directed acyclic graph] [dag] - which should have performance benefits as well as be much more powerful. Stay tuned on this.

In the meantime, upcoming Snowplow releases include:

* [Release 80 Southern Cassowary][r80-milestone], which will bring various performance improvements and bug fixes to the Kinesis pipeline
* [Release 81 Bird TBC][r81-milestone], which will allow arbitrary Spark jobs to be added to the EMR jobflow to perform data modeling prior to Redshift

Note that these releases are always subject to change between now and the actual release date.

<h2 id="help">7. Getting help</h2>

For more details on this release, please check out the [release notes][snowplow-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[black-swan]: /assets/img/blog/2016/04/black-swan.jpg

[clearbit-tutorial]: http://discourse.snowplowanalytics.com/t/integrating-clearbit-data-into-snowplow-using-the-api-request-enrichment/210

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
[resolver-conf-101]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.iglu/resolver-config/jsonschema/1-0-1
[iglu-scala-client-040]: https://github.com/snowplow/iglu-scala-client/releases/tag/0.4.0
[iglu-r3]: blog/2016/03/04/iglu-r3-penny-black-released/

[enrichment-configs]: https://github.com/snowplow/snowplow/tree/master/3-enrich/config/enrichments
[issue-2321]: https://github.com/snowplow/snowplow/issues/2321
[issue-2325]: https://github.com/snowplow/snowplow/issues/2325
[issue-2326]: https://github.com/snowplow/snowplow/issues/2326
[issue-2327]: https://github.com/snowplow/snowplow/issues/2327
[issue-2516]: https://github.com/snowplow/snowplow/issues/2516
[i-issue-124]: https://github.com/snowplow/iglu/issues/124
[isc-issue-38]: https://github.com/snowplow/iglu-scala-client/issues/38
[isc-issue-47]: https://github.com/snowplow/iglu-scala-client/issues/47

[r80-milestone]: https://github.com/snowplow/snowplow/issues?q=is%3Aopen+is%3Aissue+milestone%3A%22Release+80+[KIN]+Southern+Cassowary%22
[r81-milestone]: https://github.com/snowplow/snowplow/issues?q=is%3Aopen+is%3Aissue+milestone%3A%22Release+81+[HAD]+Bird+TBC%22
[dag]: https://en.wikipedia.org/wiki/Directed_acyclic_graph

[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample

[snowplow-release]: https://github.com/snowplow/snowplow/releases/r79-black-swan
[wiki]: https://github.com/snowplow/snowplow/wiki
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[changelog]: https://github.com/snowplow/snowplow/blob/master/CHANGELOG
