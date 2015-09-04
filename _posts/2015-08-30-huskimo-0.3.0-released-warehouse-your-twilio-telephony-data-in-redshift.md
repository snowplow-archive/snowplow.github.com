---
layout: post
title: "Huskimo 0.3.0 released: warehouse your Twilio telephony data in Redshift"
title-short: Huskimo 0.3.0 with Twilio support
tags: [huskimo, twilio, telephony, phone, calls, sms, voicemail, redshift]
author: Alex
category: Releases
---

We are pleased to announce the release of [Huskimo] [huskimo] 0.3.0, for companies who use [Twilio] [twilio] and would like to analyze their telephony data in Amazon Redshift, alongside their Snowplow event data.

For readers who missed our [Huskimo introductory post] [huskimo-020]: Huskimo is a new open-source project which connects to third-party SaaS platforms ([Singular] [singular] and now Twilio), exports their data via API, and then uploads that data into your Redshift instance.

Huskimo is a complement to Snowplow's built-in [webhook support] [webhooks] - Huskimo exists because not all SaaS services offer webhooks which expose their internal data as a stream of events. Note that you do not need to use Snowplow to use Huskimo.

Read on after the jump for:

1. [Twilio support](/blog/2015/08/30/huskimo-0.3.0-released-warehouse-your-twilio-telephony-data-in-redshift#twilio)
2. [Other updates](/blog/2015/08/30/huskimo-0.3.0-released-warehouse-your-twilio-telephony-data-in-redshift#other)
3. [Running Huskimo](/blog/2015/08/30/huskimo-0.3.0-released-warehouse-your-twilio-telephony-data-in-redshift#setup)
4. [Getting help](/blog/2015/08/30/huskimo-0.3.0-released-warehouse-your-twilio-telephony-data-in-redshift#help)
5. [Huskimo roadmap](/blog/2015/08/30/huskimo-0.3.0-released-warehouse-your-twilio-telephony-data-in-redshift#roadmap)

<!--more-->

<h2 id="twilio">1. Twilio support</h2>

<h3>Overview</h3>

[Twilio] [twilio] is a cloud telephony service, used by many thousands of companies to develop and operate call, voicemail and texting systems.

Version 0.3.0 of Huskimo supports five resources made available through the [Twilio API] [twilio-api]. These are set out in the following table:

| Resource                            | Fetch                      | Table                           |
|-------------------------------------|----------------------------|---------------------------------|
| [Calls] [twilio-calls]              | New based on `StartTime`   | `twilio_calls`                  |
| [Messages] [twilio-messages]        | New based on `DateSent`    | `twilio_recordings`             |
| [Recordings] [twilio-recordings]    | New based on `DateCreated` | `twilio_messages`               |
| [IncomingPhoneNumbers] [twilio-ipn] | All                        | `twilio_incoming_phone_numbers` |
| pricing.PhoneNumbers                | All                        | `twilio_pricing_phone_numbers`  |

For each resource type, Huskimo will retrieve records from the Twilio RESTful API, convert them into a simple TSV file format, and load them into Redshift. Note that we do not extract any sub-resources from these Twilio resources, so there are no child tables for any of these five resources in Redshift.

In the next section we will explain the algorithm used by Huskimo to extract this data from Twilio.

<h3>Extraction algorithm</h3>

Every time Huskimo runs to extract data from Twilio, it should:

1. Connect to Twilio using the credentials in the configuration file
2. For IncomingPhoneNumbers, fetch all data from that resource
3. For Calls, Messages and Recordings, fetch all data for the given day
4. For pricing.PhoneNumbers, fetch all data using a bespoke algorithm
5. Upload the Twilio usage data into each Amazon Redshift database specified in the configuration file

Note that this behavior is different from how Huskimo extracts data for Singular: because marketing data is difficult to finalize, Huskimo fetches spend data from Singular for each of the past N days (the default is 30), every time Huskimo runs. By contrast we treat Twilio's telephony data as "golden" as soon as it is available, and so there is no equivalent "lookback" approach for Huskimo's treatment of Twilio.

<h3>Algorithm for pricing.PhoneNumbers</h3>

The algorithm for retrieving pricing.PhoneNumbers from Twilio is as follows:

1. Do a `GET` to `pricing.twilio.com/v1/PhoneNumbers/Countries` to get a list of Twilio's countries
2. Loop through each country returned and do a `GET` to `pricing.twilio.com/v1/PhoneNumbers/Countries/{Country}`
3. Flatten each entry in the `phone_number_prices` array returned into its own row in the output table

Thus the output table in Redshift table `twilio_pricing_phone_numbers` looks like this:

|---------|----|----------|------|------|-----|
| Estonia | EE | mobile   | 3.00 | 3.00 | usd |
| Estonia | EE | national | 1.00 | 1.00 | usd |
| Estonia | EE | local    | 0.50 | 0.50 | usd |

<h2><a name="other">2. Other updates</a></h2>

The following general fixes have been applied:

* We have added support for SSL-secured Redshift databases ([#21] [21])
* We have fixed a bug in `deleteFromS3` where only the first 1000 files were deleted ([#18] [18])
* We split `redshift-ddl.sql` into `common-redshift-ddl.sql` and `singular-redshift-ddl.sql` ([#15] [15])

We have also made some updates to Huskimo's Singular support:

* Huskimo now allows `null` for `creative_name` in `singular_creatives` ([#19] [19])
* We fixed macros in fetchAndWrite's Exception ([#16] [16])
* Singular now only fetches channels of type `singular` ([#14] [14])
* We partially fixed an issue where Akka prevents clean exit on Exception ([#1] [1]) - the remainder of the fix should come in 0.3.1 ([#24] [24])

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
$ wget http://dl.bintray.com/snowplow/snowplow-generic/huskimo_0.3.0.zip
{% endhighlight %}

Once downloaded, unzip it:

{% highlight bash %}
$ unzip huskimo_0.3.0.zip
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
    type: singular
    api_user: # Leave blank for Singular
    api_key: ADD HERE
  - name: ADD HERE
    type: twilio
    api_user: ADD HERE # Twilio account sid
    api_key: ADD HERE # Twilio auth token
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
    ssl: false # SSL disabled by default
    ssl_factory: org.postgresql.ssl.NonValidatingFactory # Disable SSL certificate validation by default
    table: ADD HERE # TODO: move this out
    username: ADD HERE
    password: ADD HERE
{% endhighlight %}

Key things to note:

* You can configure Huskimo to extract from one or more Singular or Twilio accounts
* You can configure Huskimo to write the extracted data to one or more Redshift databases
* Huskimo requires Amazon S3 details to power the `COPY` into Redshift

If you are upgrading from version 0.2.0 note the new fields:

1. Under `channels`, `api_user` (leave blank for Singular)
2. Under `targets`, the new fields `ssl` and `ssl_factory` to support the SSL security setting on Redshift databases

<h3>Deploy the Redshift tables</h3>

Before starting Huskimo you must deploy the relevant tables into Redshift. You can find the shared database setup in the file:

[sql/common-redshift-ddl.sql] [common-sql]

If you are extracting data from Twilio, run this script:

[sql/twilio-redshift-ddl.sql] [twilio-sql]

If you are extracting data from Singular, run this script:

[sql/singular-redshift-ddl.sql] [singular-sql]

Make sure to deploy this file against each Redshift database you want to load Singular or Twilio data into.

<h3>Schedule Huskimo to run nightly</h3>

You are now ready to schedule Huskimo to run daily.

We typically run Huskimo in the early morning so that the data for yesterday is already available (even if rather incomplete). A cron entry for Huskimo might look something like this:

{% highlight bash %}
30 4            * * *   /opt/huskimo/huskimo-0.3.0 --config /etc/huskimo.yml
{% endhighlight %}

<h2><a name="help">4. Getting help</a></h2>

For more details on this release, please check out the [Huskimo 0.3.0][030-release] on GitHub.

We will be building a dedicated wiki for Huskimo to support its usage; in the meantime, if you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

<h2><a name="why">5. Huskimo roadmap</a></h2>

We will be adding support for further SaaS platforms to Huskimo on a case-by-case basis.

We are particularly interested in adding support for more marketing channels, such as Google AdWords or Facebook. Having these datasets available in Redshift alongside your event data should enable some very powerful marketing attribution and return-on-spend analytics.

**If you are interested in sponsoring a new integration for Huskimo, do [get in touch] [sponsorship-contact]!**

[huskimo-020]: /blog/2015/06/21/huskimo-0.2.0-released-warehouse-your-singular-marketing-spend-data-in-redshift

[huskimo]: http://collector.snplow.com/r/tp2?u=https%3A%2F%2Fgithub.com%2Fsnowplow%2Fhuskimo
[webhooks]: https://github.com/snowplow/snowplow/wiki/Setting-up-a-Webhook
[ddl-sql]: https://raw.githubusercontent.com/snowplow/huskimo/master/sql/redshift-ddl.sql

[singular]: https://www.singular.net/
[twilio]: https://www.twilio.com/
[twilio-api]: https://www.twilio.com/api

[twilio-calls]: https://www.twilio.com/docs/api/rest/call
[twilio-messages]: https://www.twilio.com/docs/api/rest/message
[twilio-recordings]: https://www.twilio.com/docs/api/rest/recording
[twilio-ipn]: https://www.twilio.com/docs/api/rest/incoming-phone-numbers

[issues]: https://github.com/snowplow/huskimo/issues
[1]: https://github.com/snowplow/huskimo/issues/1
[14]: https://github.com/snowplow/huskimo/issues/14
[15]: https://github.com/snowplow/huskimo/issues/15
[16]: https://github.com/snowplow/huskimo/issues/16
[18]: https://github.com/snowplow/huskimo/issues/18
[19]: https://github.com/snowplow/huskimo/issues/19
[21]: https://github.com/snowplow/huskimo/issues/21
[24]: https://github.com/snowplow/huskimo/issues/24

[common-sql]: https://github.com/snowplow/huskimo/blob/master/sql/common-redshift-ddl.sql
[twilio-sql]: https://github.com/snowplow/huskimo/blob/master/sql/twilio-redshift-ddl.sql
[singular-sql]: https://github.com/snowplow/huskimo/blob/master/sql/singular-redshift-ddl.sql

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[030-release]: https://github.com/snowplow/huskimo/releases/tag/0.3.0

[sponsorship-contact]: mailto:contact@snowplowanalytics.com
