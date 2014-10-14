---
layout: post
shortenedlink: Snowplow 0.9.9 released
title: Snowplow 0.9.9 released with campaign attribution enrichment
tags: [snowplow, enrichments, campaign, attribution]
author: Fred
category: Releases
---

We are pleased to announce the release of Snowplow 0.9.9. This release adds the new `campaign_attribution` enrichment to our enrichment registry. Read on for details...

1. [The `campaign_attribution` enrichment](#campaign-attribution)
2. [New JSON paths and Redshift DDLs](#jsons)
3. [UUID bugfix](#uuid)
4. [Upgrading](#upgrading)
5. [Roadmap](roadmap)
6. [Documentation and help](#help)

<!--more-->

<h2><a name="campagin-attribution">1. The `campaign_attribution` enrichment</a></h2>

Snowplow has five fields relating to campaign attributions: `mkt_medium`, `mkt_source`, `mkt_term`, `mkt_content`, and `mkt_campaign`. In previous versions, the values of these fields were based on the corresponding five Google Analytics querystring fields.

The new `campaign_attribution` enrichment allows you to alter this behavior. For each of the five fields, you can specify an array of querystring fields to examine for a value with which to populate that field.

This is the configuration to use if you want to duplicate the functionality of previous versions, filling in the campaign fields from the utm querystring parameters:

{% highlight json %}
{
    "schema": "iglu:com.snowplowanalytics.snowplow/campaign_attribution/jsonschema/1-0-0",

    "data": {

        "name": "campaign_attribution",
        "vendor": "com.snowplowanalytics.snowplow",     
        "enabled": true,
        "parameters": {
            "mapping": "static",
            "fields": {
                "mktMedium": ["utm_medium"],
                "mktSource": ["utm_source"],
                "mktTerm": ["utm_term"],
                "mktContent": ["utm_content"],
                "mktCampaign": ["utm_campaign"]
            }
        }
    }
}
{% endhighlight %}

The JSON has the same format as the JSONs for the other enrichments: unchanging `name` and `vendor` fields, an `enabled` field which can be used to turn the enrichment off, and a `parameters` field containing data specific to the enrichment:

* The `mapping` must, for now, have the value "static". See [Roadmap](#roadmap) for an explanation of our plans for this field.
* The `fields` field matches each of the five Snowplow mkt_ fields with a list of querystring fields to be populated by.

With the above configuration, if the querystring contained

`...&utm_content=logolink&utm_source=google&utm_medium=cpc&utm_term=shoes&utm_campaign=april_sale...`

then the fields would be populated like this:

| Field          |      Value      |
|---------------:|:----------------|
| `mkt_medium`   | `"cpc"`         |
| `mkt_source`   | `"google"`      |
| `mkt_term`     | `"shoes"`       |
| `mkt_content`  | `"logolink"`    |
| `mkt_campaign` | `"april_sale"`  |

This is the standard Omniture configuration:

{% highlight json %}
{
    "schema": "iglu:com.snowplowanalytics.snowplow/`campaign_attribution`/jsonschema/1-0-0",

    "data": {

        "name": "campaign_attribution",
        "vendor": "com.snowplowanalytics.snowplow",     
        "enabled": true,
        "parameters": {
            "mapping": "static",
            "fields": {
                "mktMedium": [],
                "mktSource": [],
                "mktTerm": [],
                "mktContent": [],
                "mktCampaign": ["cid"],
            }
        }
    }
}
{% endhighlight %}

With this configuration, only the `mkt_campaign` field will be populated.

You can have more than one querystring field in each array:

{% highlight json %}
{
    "schema": "iglu:com.snowplowanalytics.snowplow/`campaign_attribution`/jsonschema/1-0-0",

    "data": {

        "name": "campaign_attribution",
        "vendor": "com.snowplowanalytics.snowplow",     
        "enabled": true,
        "parameters": {
            "mapping": "static",
            "fields": {
                "mktMedium": ["utm_medium", "medium"],
                "mktSource": ["utm_source", "source"],
                "mktTerm": ["utm_term", "legacy_term"],
                "mktContent": ["utm_content"],
                "mktCampaign": ["utm_campaign", "cid", "legacy_campaign"],
            }
        }
    }
}
{% endhighlight %}

The first field name takes precedence. In this example, if there is a "utm_medium" field in the querystring, its value will be used as the 'mkt_medium'; otherwise, if there is a "medium" field in the querystring, its value will be used; otherwise, the `mkt_medium` field will be NULL.

To use the new enrichment, add a "campaign_attribution.json" file to your enrichments directory (which should be inside your config directory).

If you don't want to use this enrichment, you can either set its `enabled` field to `false`, or simply omit it from your enrichments directory.

<h2><a name="jsons">2. New JSON paths and Redshift DDLs</a></h2>

We have added a number of new unstructured events, all of which are available in version 2.1.0 of the [Snowplow JavaScript Tracker][js-tracker]:

* `add_to_cart`
* `remove_from_cart`
* `change_form`
* `submit_form`
* `social_interaction`
* `site_search`

We have also created a new custom context, `PerformanceTiming`, which contains information about the performance of a web page.

For each of these, we have added a JSON path file and a Redshift DDL.

<h2><a name="uuid">3. UUID bugfix</a></h2>

0.9.9 fixes a bug in how Snowplow reads the `event_id` [UUID][uuid-spec]. According to the specification, UUIDs with capital letters are valid on read. This release fixes the bug by downcasing all incoming UUIDs.

<h2><a name="upgrading">4. Upgrading</a></h2>

To use the new enrichment, add a "campaign_attribution.json" file containing a `campaign_attribution` enrichment JSON to your enrichments directory. Note that the previously automatic behaviour of populating the mkt_ fields based on the utm_ querystring fields no longer occurs by default. To reproduce it you must use the standard [Google Analytics configuration][enrichment-example].

<h2><a name="roadmap">5. Roadmap</a></h2>

We plan to extend the `campaign_attribution` enrichment by adding the option to set the `"mapping"` field to "script" to enable JavaScript scripting support. This would allow the use of more complex custom transformations to extract values from the querystring.

<h2><a name="help">6. Documentation and help</a></h2>

Documentation relating to enrichments is available on the wiki:

* [Using EmrEtlRunner] [emretlrunner-wiki]
* [Configuring enrichments] [configuring-enrichments]

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[enrichment-example]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/enrichments/`campaign_attribution`.json
[uuid-spec]: http://www.ietf.org/rfc/rfc4122.txt
[js-tracker]: https://github.com/snowplow/snowplow-javascript-tracker

[configuring-enrichments]: https://github.com/snowplow/snowplow/wiki/Configuring-enrichments
[emretlrunner-wiki]: https://github.com/snowplow/snowplow/wiki/2-Using-EmrEtlRunner
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
