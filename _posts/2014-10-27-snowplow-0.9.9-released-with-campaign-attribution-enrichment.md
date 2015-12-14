---
layout: post
title: Snowplow 0.9.9 released with campaign attribution enrichment
title-short: Snowplow 0.9.9
tags: [snowplow, enrichments, campaign, attribution]
author: Fred
category: Releases
---

We are pleased to announce the release of Snowplow 0.9.9. This is primarily a comprehensive bug fix release, although it also adds the new `campaign_attribution` enrichment to our enrichment registry. Here are the sections after the fold:

1. [The campaign_attribution enrichment](/blog/2014/10/27/snowplow-0.9.9-released-with-campaign-attribution-enrichment/#campaign-attribution)
2. [Clojure Collector fixes](/blog/2014/10/27/snowplow-0.9.9-released-with-campaign-attribution-enrichment#clj-collector)
3. [StorageLoader fixes](/blog/2014/10/27/snowplow-0.9.9-released-with-campaign-attribution-enrichment#storagerloader)
4. [EmrEtlRunner fixes and enhancements](/blog/2014/10/27/snowplow-0.9.9-released-with-campaign-attribution-enrichment#emretlrunner)
5. [Hadoop Enrich fixes and enhancements](/blog/2014/10/27/snowplow-0.9.9-released-with-campaign-attribution-enrichment#hadoop-enrich)
6. [Upgrading](/blog/2014/10/27/snowplow-0.9.9-released-with-campaign-attribution-enrichment#upgrading)
7. [Documentation and help](/blog/2014/10/27/snowplow-0.9.9-released-with-campaign-attribution-enrichment#help)

<!--more-->

<h2><a name="campaign-attribution">1. The campaign_attribution enrichment</a></h2>

Snowplow has five fields relating to campaign attribution: `mkt_medium`, `mkt_source`, `mkt_term`, `mkt_content`, and `mkt_campaign`. In previous versions of Snowplow, the values of these fields were based on the corresponding five `utm_` fields supported by Google for [campaign manual tagging] [manual-tagging].

The new `campaign_attribution` enrichment allows you to alter this behavior. For each of the five fields, you can specify an array of querystring fields to check for the appropriate value.

<div class="html">
<h3><a name="ca-standard-config">1.1 Standard configuration</a></h3>
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

* The `mapping` must, for now, have the value "static". See the [Roadmap section below](#ca-roadmap) for an explanation of our plans for this field.
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
<h3><a name="ca-multiple-fields">1.2 Multiple fields</a></h3>
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
<h3><a name="ca-roadmap">1.3 Attribution roadmap</a></h3>
</div>

We plan on extending the `campaign_attribution` enrichment to also extract the advert's click ID as well, if found ([#1073] [issue-1073]). This will serve as a good basis for more granular campaign analytics.

We have also sketched out a potential option to set the `"mapping"` field to "script" to enable JavaScript scripting support ([#436] [issue-436]). This would allow the use of more complex custom transformations to extract campaign attribution values from the querystring.

<h2><a name="clj-collector">2. Clojure Collector fixes</a></h2>

We have fixed a pair of bugs which caused issues with the IP addresses recorded by the Clojure Collector, especially when running in a VPC with multiple nodes. The tickets are here:

* Fixed regression in log record format caused by #854 ([#992] [issue-992])
* Correctly handles multiple IPs in X-Forwarded-For ([#970] [issue-970])

Thank you for your patience in the resolution of these issues - we have had the updated version in test with various respondents and everything seems to be functioning correctly now.

<h2><a name="storageloader">3. StorageLoader fixes</a></h2>

There was an issue ([#1012] [issue-1012]) where the StorageLoader was attempting to fetch JSON Path files from the main Snowplow Hosted Assets bucket, which is in `eu-west-1`. For users trying to load shredded JSONs into a Redshift instance in another region, the `COPY FROM JSON` was failing because any JSON Path files must be in the same region as the target table.

We have fixed this by mirroring all of our hosted assets (including JSON Path files) to per-region buckets (`s3://snowplow-hosted-assets-us-east-1` etc). Then StorageLoader chooses the correct Snowplow Hosted Assets bucket to use, based on the region of the target Redshift database.

<h2><a name="emretlrunner">4. EmrEtlRunner fixes and enhancements</a></h2>

We have resolved two issues which should facilitate the smoother running of EmrEtlRunner:

1. We fixed a regression with `--process-enrich`, thanks to community member [Rob Kingston] [kingo55] for spotting this ([#1089] [issue-1089])
2. Now if there are no rows to process, EmrEtlRunner correctly returns a 0 status code at the command-line, not a 1 as before ([#1018] [issue-1018])

To make EmrEtlRunner more robust in scenarios where it is run very frequently (e.g. every hour), we have added in checks that the `:enriched:good` and `:shredded:good` folders are empty before starting jobflow steps that would write additional data to them. Please see [issue #1124] [issue-1124] for more details on this.

<h2><a name="hadoop-enrich">5. Hadoop Enrich fixes and enhancements</a></h2>

0.9.9 fixes a bug in how Snowplow's Hadoop Enrichment process validates an incoming (i.e. tracker-generated) `event_id` UUID. According to [the specification] [uuid-spec], UUIDs with capital letters are valid on read. This release fixes the bug by downcasing all incoming UUIDs.

This release also now supports trackers sending in the original client's useragent via the `&ua=` parameter (new in the [Snowplow Tracker Protocol] [snowplow-tp]). This is useful for situations where your tracker does not reflect the true source of the event, e.g. with the Ruby Tracker reporting a user's checkout event in Rails.

Finally, this version of the Hadoop Enrichment process introduces some more robust handling of numeric field validation ([#570] [issue-570] and [#1062] [issue-1062]).

<h2><a name="upgrading">6. Upgrading</a></h2>

<div class="html">
<h3><a name="upgrading-emretlrunner">6.1 Upgrading EmrEtlRunner and StorageLoader</a></h3>
</div>

You need to update EmrEtlRunner and StorageLoader to the latest code (**0.9.2** and **0.3.3** respectively) on GitHub:

{% highlight bash %}
$ git clone git://github.com/snowplow/snowplow.git
$ git checkout 0.9.9
$ cd snowplow/3-enrich/emr-etl-runner
$ bundle install --deployment
$ cd ../../4-storage/storage-loader
$ bundle install --deployment
{% endhighlight %}

<div class="html">
<h3><a name="configuring-emretlrunner">6.2 Updating EmrEtlRunner's configuration</a></h3>
</div>

This release bumps the Hadoop Enrichment process to version **0.8.0**.

In your EmrEtlRunner's `config.yml` file, update your Hadoop enrich job's version to 0.8.0, like so:

{% highlight yaml %}
  :versions:
    :hadoop_enrich: 0.8.0 # WAS 0.7.0
{% endhighlight %}

For a complete example, see our [sample `config.yml` template] [emretlrunner-config-yml].

<div class="html">
<h3><a name="configuring-attribution">6.3 Configuring campaign attribution</a></h3>
</div>

**If you upgrade Hadoop Enrich to version 0.8.0 as above, you MUST also follow these steps, or else campaign attribution will be disabled.**

To use the new enrichment, add a "campaign_attribution.json" file containing a `campaign_attribution` enrichment JSON to your enrichments directory. Note that the previously automatic behaviour of populating the `mkt_` fields based on the `utm_` querystring fields no longer occurs by default. To reproduce it you **must** use the [Google-like manual tagging configuration][enrichment-example].

<div class="html">
<h3><a name="upgrading-collector">6.4 Updating your Clojure Collector</a></h3>
</div>

This release bumps the Clojure Collector to version **0.8.0**.

To upgrade to this release:

1. Download the new warfile by right-clicking on [this link] [war-download] and selecting "Save As..."
2. Log in to your Amazon Elastic Beanstalk console
3. Browse to your Clojure Collector's application
4. Click the "Upload New Version" and upload your warfile

<h2><a name="help">7. Documentation and help</a></h2>

Documentation relating to enrichments is available on the wiki:

* [Using EmrEtlRunner] [emretlrunner-wiki]
* [Configuring enrichments] [configuring-enrichments]

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[enrichment-example]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/enrichments/`campaign_attribution`.json

[manual-tagging]: https://support.google.com/analytics/answer/1033863

[uuid-spec]: http://www.ietf.org/rfc/rfc4122.txt
[js-tracker]: https://github.com/snowplow/snowplow-javascript-tracker

[configuring-enrichments]: https://github.com/snowplow/snowplow/wiki/Configuring-enrichments
[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample
[emretlrunner-wiki]: https://github.com/snowplow/snowplow/wiki/2-Using-EmrEtlRunner

[war-download]: http://s3-eu-west-1.amazonaws.com/snowplow-hosted-assets/2-collectors/clojure-collector/clojure-collector-0.8.0-standalone.war
[snowplow-tp]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol#2-platform-specific-parameters

[kingo55]: https://github.com/kingo55

[issue-436]: https://github.com/snowplow/snowplow/issues/436
[issue-570]: https://github.com/snowplow/snowplow/issues/570
[issue-970]: https://github.com/snowplow/snowplow/issues/970
[issue-992]: https://github.com/snowplow/snowplow/issues/992
[issue-1012]: https://github.com/snowplow/snowplow/issues/1012
[issue-1018]: https://github.com/snowplow/snowplow/issues/1018
[issue-1062]: https://github.com/snowplow/snowplow/issues/1062
[issue-1073]: https://github.com/snowplow/snowplow/issues/1073
[issue-1089]: https://github.com/snowplow/snowplow/issues/1089
[issue-1124]: https://github.com/snowplow/snowplow/issues/1124

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
