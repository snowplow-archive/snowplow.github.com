---
layout: post
shortenedlink: Snowplow 0.9.9 released
title: Snowplow 0.9.9 released with campaign attribution enrichment
tags: [snowplow, enrichments, campaign, attribution]
author: Fred
category: Releases
---

We are pleased to announce the release of Snowplow 0.9.9. This is primarily a bug fix release, although it also adds the new `campaign_attribution` enrichment to our enrichment registry. Here are the sections after the fold:

1. [The `campaign_attribution` enrichment](#campaign-attribution)
2. [Clojure Collector fixes](#clj-fixes)
3. [StorageLoader fixes](#storagerloader-fixes)
4. [EmrEtlRunner fixes and enhancements](#xxx)
3. [Hadoop Enrich fixes and enhancements](#uuid)
4. [Upgrading](#upgrading)
5. [Roadmap](roadmap)
6. [Documentation and help](#help)

<!--more-->

<h2><a name="campaign-attribution">1. The `campaign_attribution` enrichment</a></h2>

Snowplow has five fields relating to campaign attributions: `mkt_medium`, `mkt_source`, `mkt_term`, `mkt_content`, and `mkt_campaign`. In previous versions of Snowplow, the values of these fields were based on the corresponding five `utm_` fields supported by Google for [campaign manual tagging] [manual-tagging].

The new `campaign_attribution` enrichment allows you to alter this behavior. For each of the five fields, you can specify an array of querystring fields to check for the appropriate value.

<div class="html">
<h3><a name="ca-standard-config">2.1 Standard configuration</a></h3>
</div>

This is the configuration to use if you want to duplicate the functionality of previous Snowplow versions, populating the campaign fields from the standard `utm_` querystring parameters:

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

The JSON has the same format as the JSONs for the other enrichments: static `name` and `vendor` fields, an `enabled` field which can be used to turn the enrichment off, and a `parameters` field containing data specific to the enrichment:

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

<div class="html">
<h3><a name="ca-multiple-fields">2.2 Multiple fields</a></h3>
</div>

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

The first field name found takes precedence. In this example, if there is a "utm_medium" field in the querystring, its value will be used as the 'mkt_medium'; otherwise, if there is a "medium" field in the querystring, its value will be used; otherwise, the `mkt_medium` field will be `null`.

<div class="html">
<h3><a name="ca-roadmap">2.3 Attribution roadmap</a></h3>
</div>

We plan on extending the `campaign_attribution` enrichment to also extract the advert's click ID as well, if found ([#1073] [issue-1073]). This will serve as a good basis for more granular campaign analytics.

We have also sketched out a potential option to set the `"mapping"` field to "script" to enable JavaScript scripting support ([#436] [issue-436]). This would allow the use of more complex custom transformations to extract campaign attribution values from the querystring.

<h2><a name="uuid">3. UUID bugfix</a></h2>

0.9.9 fixes a bug in how Snowplow reads the `event_id` [UUID][uuid-spec]. According to the specification, UUIDs with capital letters are valid on read. This release fixes the bug by downcasing all incoming UUIDs.

<h2><a name="upgrading">4. Upgrading</a></h2>

To use the new enrichment, add a "campaign_attribution.json" file to your enrichments directory (which should be inside your config directory). **If you do not

If you don't want to use this enrichment, you can either set its `enabled` field to `false`, or simply omit it from your enrichments directory.

To use the new enrichment, add a "campaign_attribution.json" file containing a `campaign_attribution` enrichment JSON to your enrichments directory. Note that the previously automatic behaviour of populating the mkt_ fields based on the utm_ querystring fields no longer occurs by default. To reproduce it you must use the standard [Google Analytics configuration][enrichment-example].



<h2><a name="help">6. Documentation and help</a></h2>

Documentation relating to enrichments is available on the wiki:

* [Using EmrEtlRunner] [emretlrunner-wiki]
* [Configuring enrichments] [configuring-enrichments]

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[enrichment-example]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/enrichments/`campaign_attribution`.json
[manual-tagging]: https://support.google.com/analytics/answer/1033863
[issue-1073]: https://github.com/snowplow/snowplow/issues/1073
[issue-436]: https://github.com/snowplow/snowplow/issues/436

[uuid-spec]: http://www.ietf.org/rfc/rfc4122.txt
[js-tracker]: https://github.com/snowplow/snowplow-javascript-tracker

[configuring-enrichments]: https://github.com/snowplow/snowplow/wiki/Configuring-enrichments
[emretlrunner-wiki]: https://github.com/snowplow/snowplow/wiki/2-Using-EmrEtlRunner
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
