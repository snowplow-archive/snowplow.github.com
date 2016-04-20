---
layout: post
title-short: Snowplow 79 Black Swan
title: "Snowplow 79 Black Swan released"
tags: [snowplow, enrichment, iglu, api, rest]
author: Anton
category: Releases
---


We are pleased to announce the release of [Snowplow 79 Black Swan] [snowplow-release]! This release brings brand new API Request Enrichment as well as new HTTP Header Extractor Enrichment and several more improvements on enrichments side.

![black-swan][black-swan]

1. [API Request Enrichment](/blog/2016/04/xx/snowplow-r79-black-swan-released#requestEnrichment)
2. [HTTP Header Extractor Enrichment](/blog/2016/04/xx/snowplow-r79-black-swan-released#headerEnrichment)
3. [Iglu client update](/blog/2016/04/xx/snowplow-r79-black-swan-released#igluClient)
4. [Other improvements](/blog/2016/04/xx/snowplow-r79-black-swan-released#other)
5. [Upgrading](/blog/2016/04/xx/snowplow-r79-black-swan-released#upgrading)
6. [Getting help](/blog/2016/04/xx/snowplow-r79-black-swan-released#help)

<!--more-->

<h2 id="requestEnrichment">1. API Request Enrichment</h2>

<h3> 1.1 Introducing API Request Enrichment</h3>

API Request Enrichment lets you attach your custom contexts received from stand-alone (dedicated or third-party) REST-service, using URL built from particular event's data.
Input data to generate URL can be any of event's primitive properties (whose mapping directly to atomic.events table), custom context sent by tracker, unstructured event properties or even custom contexts derived by other enrichments.

Using this enrichment companies with very domain-specific data models can attach contexts derived from truly unique sources.
This data sources can include company's CRM data, rare domain-specific data providers or inner REST-service.
This is our second, after [JavaScript Enrichment][js-enrichment] step towards entirely customizable enrichment process.
And comparing to JavaScript Enrichment it is much safer and easier to use.

<h3> 1.2 Using API Request Enrichment</h3>

In order to enable API Request Enrichment you can use configuration similar to following:

{% highlight json %}
{% raw %}
{
  "enabled": true,
  "parameters": {
    "inputs": [
      {
        "key": "user",
        "pojo": {
          "field": "user_id"
        }
      },
      {
        "key": "user",
        "json": {
          "field": "contexts",
          "schemaCriterion": "iglu:com.snowplowanalytics.snowplow/client_session/jsonschema/1-*-*",
          "jsonPath": "$.userId"
        }
      },
      {
        "key": "client",
        "pojo": {
          "field": "app_id"
        }
      }
    ],
    "api": {
      "http": {
        "method": "GET",
        "uri": "http://api.acme.com/users/{{client}}/{{user}}?format=json",
        "timeout": 5000,
        "authentication": {
          "httpBasic": {
            "username": "xxx",
            "password": "yyy"
          }
        }
      }
    },
    "outputs": [ {
      "json": {
        "jsonPath": "$.record",
        "schema": "iglu:com.acme/user/jsonschema/1-0-0"
      }
    } ],
    "cache": {
      "size": 3000,
      "ttl": 60
    }
  }
}
{% endraw %}
{% endhighlight %}

Above configuration should be a self-explanatory example of what you can do with new API Request Enrichment.
Dedicated [API Request Enrichment page][api-enrichment] on our wiki provides more detailed and always up-to-date information on how to use it.

Few important things to notice:

* we're using [JSONPath][jsonpath] format to query JSON, don't confuse it with similar formats
* if you want to include whole response as context - use `$`
* if provided JSONPath will be invalid - all events attempted to being enriched will be sent to `enriched/bad`
* if any of key wasn't found - HTTP request won't be sent and new context won't be derived, but event will be processed as usual
* if server returned any non-successful response - event will be sent to `enriched/bad` bucket
* if server response returned JSON which invalidated by schema provided in output - event will be sent to `shredded/bad`

Don't forget that enrichment process usually executing on big and powerful computing cluster which may send enormous amount of HTTP requests to your (or data provider's) server, so we advice you to make sure you have appropriately configured cache and powerful enough HTTP server as it can drastically slowdown whole ETL process.

Bear in mind also that it is up to you to write and [host][iglu-setup] Self-describing JSON Schemas as well as Redshift DDL files for contexts provided by your API.
You may find [Schema Guru][schema-guru] useful for this purposes.

<h3> 1.3 Improving Snowplow Enrichments </h3>

Most of our enrichments are used as tools for data dimension widening, becoming a middle JOIN for your atomic data.
Also, you can see HTTP Request Enrichment and JavaScript Enrichment as pioneering custom enrichments, which are not tied to particular data provider or structure of data.
Our current effort is concentrated on next SQL Query Enrichments which should become a third in kind of custom enrichments.

Unfortunately, having these custom enrichments you currently still cannot use more than one of each kind.
We now designing a way in which you could specify an order of enrichment execution steps as [directed acyclic graph][DAG] which should both give our users unlimited power of data gathering as well as opportunity to make the enrichment process parallel.

<h2 id="headerEnrichment">2. HTTP Header Extractor Enrichment</h2>

In R72 we presented Cookie Extractor Enrichments, allowing our users to capture first-party cookies from installed on their domain services.
However, it is also possible to extract even more data hidden in request headers.

For this release our community member [Khalid Jazaerly][khalid] has kindly contributed new more powerful HTTP Header Extractor Enrichment.
In order to enable it, you can use configuration closely resembling one from Cooke Extractor Enrichment:

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


Above configuration will extract all headers from HTTP requests, including cookies and auxiliary headers.
However, in practice you would probably extract more specific headers.
Each extracted header will end up a single derived context following the JSON Schema [org.ietf/http_header/jsonschema/1-0-0][header-schema].

Please note that this enrichment only works with events recorded by the Scala Stream Collector - the CloudFront and Clojure Collectors do not capture HTTP headers.

You can find out more about [HTTP Header Extractor Enrichment][hhe-enrichment] on its dedicated page on Snowplow wiki.

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


<h2 id="help">6. Getting help</h2>

For more details on this release, please check out the [release notes][snowplow-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[black-swan]: /assets/img/blog/2016/04/black-swan.jpg

[js-enrichment]: https://github.com/snowplow/snowplow/wiki/JavaScript-script-enrichment
[header-schema]: https://github.com/snowplow/iglu-central/blob/master/schemas/org.ietf/http_header/jsonschema/1-0-0
[hhe-enrichment]: https://github.com/snowplow/snowplow/wiki/HTTP-header-extractor-enrichment
[jsonpath]: http://goessner.net/articles/JsonPath/
[khalid]: https://github.com/khalidjaz
[schema-guru]: https://github.com/snowplow/schema-guru
[api-enrichment]: https://github.com/snowplow/snowplow/wiki/API-Request-enrichment
[iglu-setup]: https://github.com/snowplow/iglu/wiki/Setting-up-an-Iglu-repository
[iglu-auth]: https://github.com/snowplow/iglu/wiki/API-authentication
[iglu-scala]:  https://github.com/snowplow/iglu/wiki/Scala-repo
[DAG]: https://en.wikipedia.org/wiki/Directed_acyclic_graph

[enrichment-configs]: https://github.com/snowplow/snowplow/tree/master/3-enrich/config/enrichments
[issue-2325]: https://github.com/snowplow/snowplow/issues/2325
[issue-2326]: https://github.com/snowplow/snowplow/issues/2326
[issue-2327]: https://github.com/snowplow/snowplow/issues/2327
[issue-2516]: https://github.com/snowplow/snowplow/issues/2516

[snowplow-release]: https://github.com/snowplow/snowplow/releases/r79-black-swan
[wiki]: https://github.com/snowplow/snowplow/wiki
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[changelog]: https://github.com/snowplow/snowplow/blob/master/CHANGELOG
