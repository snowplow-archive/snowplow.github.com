---
layout: post
title: "Huskimo 0.2.0 released: warehouse your Singular marketing spend data in Redshift"
title-short: Huskimo 0.2.0
tags: [huskimo, singular, marketing, advertising, redshift]
author: Alex
category: Releases
---

We are pleased to announce [Huskimo] [huskimo], an all-new open-source product from the Snowplow team. This initial release of Huskimo is for companies who use [Singular] [singular] to manage their mobile marketing campaigns, and would like to analyze their Singular marketing spend data in Amazon Redshift, alongside their Snowplow event data.

![huskimo-img][huskimo-img]

Although this is version 0.2.0 of Huskimo, this is the first publicized release, and so we will take some time in this blog post to explain the rationale for Huskimo as an all-new open-source project.

Read on after the jump for:

1. [Why Huskimo?](/blog/2015/06/21/huskimo-0.2.0-released-warehouse-your-singular-marketing-spend-data-in-redshift#why)
2. [Singular support](/blog/2015/06/21/huskimo-0.2.0-released-warehouse-your-singular-marketing-spend-data-in-redshift#singular)
3. [Running Huskimo](/blog/2015/06/21/huskimo-0.2.0-released-warehouse-your-singular-marketing-spend-data-in-redshift#setup)
4. [Getting help](/blog/2015/06/21/huskimo-0.2.0-released-warehouse-your-singular-marketing-spend-data-in-redshift#help)
5. [Huskimo roadmap](/blog/2015/06/21/huskimo-0.2.0-released-warehouse-your-singular-marketing-spend-data-in-redshift#roadmap)

<!--more-->

<h2><a name="why">1. Why Huskimo?</a></h2>

At Snowplow we strongly believe that _events_ are the most effective currency for capturing digital activity of any form. To enable this, we provide a variety of language/platform specific [trackers] [trackers], plus growing support for various third-party SaaS platforms via [webhooks] [webhooks].

However, not all third-party SaaS platforms are willing or able to expose their internal stateful data as a stream of immutable events; some of these platforms are the very ones that Snowplow users are _most_ excited about querying in Redshift alongside their Snowplow event data.

To bridge the gap, we are now open sourcing the [Huskimo project] [huskimo]. Huskimo has a simple goal: to make essential datasets currently locked away inside various SaaS platforms available for analysis inside Redshift.

At launch, we are supporting just one SaaS platform: [Singular] [singular], which is a tool for managing marketing spend focused on mobile apps and games companies.

<h2><a name="singular">2. Singular support</a></h2>

Huskimo supports two API resources made available by Singular:

1. `stats`: all the campaign statistics for your account
2. `creative_stats`: all the creative statistics for your account

For each resource type, Huskimo will retrieve all records from the Singular API, convert them into a simple TSV file format, and load them into Redshift.

The most complex aspect of Huskimo is dealing with Singular marketing data becoming "golden" - Huskimo's approach to this is covered in the next section.

<h2><a name="singular">3. Marketing data: a primer</a></h2>

Marketing data is notoriously difficult to finalize - it takes days (sometimes weeks) for advertising companies to determine which clicks on ads were real, and which ones were fraudulent. This means that it takes days or weeks for marketing spend data to be finalized (sometimes referred to as "becoming golden").

As a result, we can retrieve Sunday's marketing spend data from Singular on Monday, but if we fetch Sunday's spend data *again* on Tuesday, the numbers for Sunday will very likely have been updated in the meantime.

Huskimo gets around this by:

1. Fetching spend data for each of the past N days (the default is 30), every time Huskimo runs
2. Attaching a `when_retrieved` timestamp to each row of data retrieved from Singular

In other words, if Huskimo runs daily with its "lookback" set to 30 days, then the marketing spend data for say Sunday 21 June 2015 is fetched and stored in Redshift each day for 30 days. When joining your Snowplow event data to your Huskimo marketing spend data in Redshift, it's then simply a matter of using `MAX(retrieved_date)` to reference the most recent (and thus most accurate) report of a given day's marketing spend.

<h2><a name="setup">3. Running Huskimo</a></h2>

Running Huskimo consists of four steps:

1. Install Huskimo
2. Write the Hukimo config file
3. Deploy the Redshift tables
4. Schedule Huskimo to run nightly

We'll cover each of these steps briefly in the next section.

<h3>Install Huskimo</h3>

Huskimo is made available as an executable "fatjar" runnable on any Linux system. It is hosted on Bintray, download it like so:

{% highlight bash %}
$ wget http://dl.bintray.com/snowplow/snowplow-generic/huskimo_0.2.0.zip
{% endhighlight %}

Once downloaded, unzip it:

{% highlight bash %}
$ unzip huskimo_0.2.0.zip
{% endhighlight %}

Assuming you have a recent (Java 7 or 8) runtime on your system, running is as simple as:

{% highlight bash %}
$ ./huskimo --config my-config.yml
{% endhighlight %}

<h3>Write the Huskimo config file</h3>

Huskimo is configured using a YAML-format file which looks like this:

{% highlight yaml %}
fetch:
  lookback: 30 # Number of days back in time from the start date to fetch for
channels:
  - name: ADD HERE
    type: singular # Only Singular supported currently
    api_key: ADD HERE
s3:
  access_key_id: ADD HERE
  secret_access_key: ADD HERE
  region: ADD HERE # Region bucket lives in
  bucket: ADD HERE # Must be s3:// not s3n:// for Redshift
  folder_path: ADD HERE
targets:
  - name: ADD HERE
    type: redshift # Only Redshift support currently
    host: ADD HERE # The endpoint as shown in the Redshift console
    database: ADD HERE # Name of database
    port: 5439 # Default Redshift port
    table: ADD HERE # TODO: move this out
    username: ADD HERE
    password: ADD HERE
{% endhighlight %}

Key things to note:

* The `lookback` period determines how many days back in time to retrieve spend data for
* You can configure Huskimo to extract from one or more Singular accounts
* Login to Singular and head to [https://www.singular.net/api] [singular-api] to retrieve your `api_key`
* You can configure Huskimo to write the extracted data to one or more Redshift databases
* Huskimo requires Amazon S3 details to power the `COPY` into Redshift

<h3>Deploy the Redshift tables</h3>

Before starting Huskimo you must remember to deploy the two Singular tables into Redshift. You can find the table definitions in the file:

[sql/redshift-ddl.sql] [ddl-sql]

Make sure to deploy this file against each Redshift database you want to load Singular data into.

<h3>Schedule Huskimo to run nightly</h3>

You are now ready to schedule Huskimo to run daily.

We typically run Huskimo in the early morning so that the data for yesterday is already available (even if rather incomplete). A cron entry for Huskimo might look something like this:

{% highlight bash %}
30 4            * * *   /opt/huskimo/huskimo-0.2.0 --config /etc/huskimo.yml
{% endhighlight %}

<h2><a name="help">4. Getting help</a></h2>

For more details on this release, please check out the [Huskimo 0.2.0][020-release] on GitHub.

We will be building a dedicated wiki for Huskimo to support its usage; in the meantime, if you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

<h2><a name="why">5. Huskimo roadmap</a></h2>

We will be adding support for further SaaS platforms to Huskimo on a case-by-case basis. The next release (0.3.0) of Huskimo will extract the major resource types from [Twilio] [twilio], the popular Telephony-as-a-Service provider.

We are also particularly interested in adding support for more marketing channels, such as Google AdWords or Facebook. Having these datasets available in Redshift alongside your event data should enable some very powerful marketing attribution and return-on-spend analytics.

**If you are interested in sponsoring a new integration for Huskimo, do [get in touch] [sponsorship-contact]!**

[huskimo-img]: /assets/img/blog/2015/06/huskimo.jpg

[huskimo]: http://collector.snplow.com/r/tp2?u=https%3A%2F%2Fgithub.com%2Fsnowplow%2Fhuskimo
[020-release]: https://github.com/snowplow/huskimo/releases/tag/0.2.0
[ddl-sql]: https://raw.githubusercontent.com/snowplow/huskimo/master/sql/redshift-ddl.sql

[singular]: https://www.singular.net/
[singular-api]: https://www.singular.net/api
[twilio]: https://www.twilio.com/

[trackers]: https://github.com/snowplow/snowplow/tree/master/1-trackers
[webhooks]: https://github.com/snowplow/snowplow/wiki/Setting-up-a-Webhook

[issues]: https://github.com/snowplow/huskimo/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

[sponsorship-contact]: mailto:contact@snowplowanalytics.com
