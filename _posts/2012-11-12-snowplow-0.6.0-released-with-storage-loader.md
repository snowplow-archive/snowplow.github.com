---
layout: post
title: Snowplow 0.6.0 released, with the new StorageLoader
title-short: Snowplow 0.6.0
tags: [snowplow, storageloader, infobright, ice, columnar database, analytics database]
author: Alex
category: Releases
---

We're very pleased to start the week by releasing a new version of Snowplow - version **0.6.0**. This is a big release for us - as it includes the first version of our all-new StorageLoader. The release also includes a small set of tweaks and bug fixes across the existing Snowplow components, but let's start by introducing StorageLoader:

## Introducing StorageLoader

Up until now, Snowplow has stored all its data in S3, where it can be queried in Hive. However, our vision with Snowplow has always been to enable to the broadest set of analyses on Snowplow data as possible. That means making it as easy as possible to keep up to date versions of Snowplow data in many different types of database. The StorageLoader is a key component to fulfilling that vision.

![snowplow-loader-image] [snowplow-loader-image]

StorageLoader is a Ruby application that downloads Snowplow event files from S3 and loads them into an alternative database. It has been built to make keeping an up to date version of your Snowplow data in other databases as easy as possible. Currently, it only supports loading the data into [Infobright Community Edition (ICE)] [ice] - a high-performance columnar database based on MySQL. However, we plan to extend it over the next few months to support a range of other databases including:

* [Google Big Query] [google-big-query] for fast analysis of massive data sets. (This could be very powerful for rapid analytics across Snowplow's granular data)
* [SkyDB] [sky-db] for event path analysis and other, broader types of event stream analytics
* [PostgreSQL] [postgres] for web analytics for web properties where the levels of traffic are not Facebook-scale

<!--more-->

There are significant advantages to storing data in Infobright instead of (or as well as) S3:

* In many cases, query times are much faster
* There are a wide range of analytics tools that plug directly into Infobright. (Any tool that plugs into MySQL.) These can now be run directly on top of Snowplow data. (These tools include R and Tableau.)
* For more details on the pros and cons of storage in S3 vs Infobright, see our [guide to choosing between the two] [choose-storage-module].

As you can hopefully get a sense looking at our roadmap for other databases to support, there are obvious advantages to using some of the other databases on our roadmapGoing forwards, we expect that many companies using Snowplow will store that Snowplow data in more than one store, to enable a very broad range of analytics from different types of tools.

## Using the StorageLoader

You can configure StorageLoader with the details of the Infobright table to insert your Snowplow events into, and then you schedule StorageLoader (e.g. in a cronjob) to regularly download your Snowplow events and load them into Infobright. StorageLoader can run as soon as EmrEtlRunner has completed its job (and we include a script to run both in one go).

With this setup, you will have your Snowplow events easily accessible and queryable in a local Infobright instance - but you can still fall back to querying the data in Hive if you wish.

The following setup guides should be helpful in terms of setting up StorageLoader:

* [Infobright storage setup guide] [infobright-storage-setup] walks you through the process of installing Infobright and setting it up to house Snowplow data
* [StorageLoader setup guide] [storage-loader-setup] walks you through installing and configuring StorageLoader to regularly load Snowplow data into Infobright

## The codebase

If you want to take a look at the code, you can find it in the main repository here: [4-storage/storage-loader/] [storage-loader-code]

## Getting help

If you have any problems getting StorageLoader working, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

## Other fixes in 0.6.0

We have made a number of other fixes across Snowplow to prepare the ground for StorageLoader:

**EmrEtlRunner** has been bumped to 0.0.5, including upgrading it to Sluice 0.0.4 (which has some bug fixes around S3 path handling).

The **Hive deserializer** has been bumped to 0.5.1, and now outputs booleans such as `br_cookies` as 0 or 1 (instead of true or false) for the non-Hive output.

The **non-Hive format HiveQL script** has been bumped to 0.0.2 and now uses the new 0 or 1 approach to booleans. This is necessary so that true/false values can be successfully loaded into Infobright.

The **setup_infobright.sql** script has been bumped to 0.0.2 - we have changed the columns defined as booleans to be tinyint(1)s. This is just a formality, because Infobright creates 'boolean' columns as tinyint(1)s anyway.

We will keep you posted as we roll out support for additional database options in StorageLoader! (And welcome suggestinos for other databases we should build support for.)

[ice]: http://www.infobright.org/
[storage-loader-setup]: https://github.com/snowplow/snowplow/wiki/StorageLoader-setup
[infobright-storage-setup]: https://github.com/snowplow/snowplow/wiki/infobright-storage-setup
[storage-module-selection]: https://github.com/snowplow/snowplow/wiki/choosing-a-storage-module
[storage-loader-code]: https://github.com/snowplow/snowplow/tree/master/4-storage/storage-loader
[choose-storage-module]: https://github.com/snowplow/snowplow/wiki/choosing-a-storage-module

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

[postgres]: http://www.postgresql.org
[sky-db]: http://skydb.io
[google-big-query]: https://developers.google.com/bigquery
[mysql]: http://www.mysql.com

[snowplow-loader-image]: /assets/img/SnowplowLoader.jpg
