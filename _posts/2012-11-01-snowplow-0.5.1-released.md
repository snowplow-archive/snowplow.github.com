---
layout: post
title: Snowplow 0.5.1 released, with lots of small improvements
title-short: Snowplow 0.5.1
tags: [snowplow, release]
author: Alex
category: Releases
---

We have just released Snowplow **0.5.1**! Rather than one large new feature, version 0.5.1 is an incremental release which contains lots of small fixes and improvements to the ETL and storage sub-systems. The two big themes of these updates are:

1. Improving the robustness of the ETL process
2. Laying the foundations for loading Snowplow events into [Infobright Community Edition] [infobright] (ICE)

To take each of these themes in turn:

## 1. A more robust ETL process

The Hive deserializer now has improved error handling - many thanks to community member [Michael Tibben] [mtibben] from [99designs] [99designs] for his help here!

Firstly, the Hive deserializer is now setup to log warnings (rather than die) on non-critical data quality issues.

Additionally, there is now an option (switched off by default) to continue processing even on unexpected row-level errors (such as an input file not matching the expected CloudFront format). We have added a configuration option to the EmrEtlRunner's [configuration file] [emr-etl-runner-config] to support this:

    :etl:
      :continue_on_unexpected_error: false

<!--more-->

Switch this to 'true' to continue processing on unexpected row-level errors.

## 2. Groundwork for Infobright compatibility

We have added a table definition (and supporting scripts) for setting up a Snowplow events table in Infobright - you can find these in the main repository under [`snowplow/4-storage/infobright-storage`] [ice-setup].

Some early ETL design decisions meant that the Snowplow event files being generated before 0.5.1 were not compatible with being loaded into Infobright (or similar relational databases like Postgres or MySQL). We have made some updates to the ETL process in 0.5.1 to fix this:

1. In the Hive deserializer, we now convert tabs to 4 spaces to prevent a stray tab from breaking our load into Infobright
2. Databases like Infobright don't support Hive's `ARRAY<STRING>` syntax, so we have updated the Hive deserializer to also output individual booleans for the browser features, alongside the browser features array
3. We have created a new HiveQL script which outputs Snowplow event files in a format which can be easily loaded into Infobright - this is called [`non-hive-rolling-etl.q`] [non-hive-hiveql]
4. We have added a configuration option to the EmrEtlRunner's [configuration file] [emr-etl-runner-config] so that you can choose whether to output Hive-format or non-Hive-format event files

On point 4: we believe that most people will want to load their Snowplow event files into other database systems, such as Infobright (or eventually, Postgres, Google BigQuery, SkyDB etc). Therefore, the default setting for the [configuration option] [emr-etl-runner-config] in the EmrEtlRunner is to output your Snowplow event files in the non-Hive-format:

    :etl:
      :storage_format: non-hive

As the comment says, if you will **only** be doing analysis in Hive, you could switch this setting to 'hive' and benefit from the slightly-tweaked, Hive-friendly file format.

## Getting help

If you have any problems getting version 0.5.1 working, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

## In the pipeline

At Snowplow we want to support multiple different storage and analytics options for Snowplow events, alongside our current Hive-based approach. This version 0.5.1 provides the building blocks for our Infobright support - for the next release, we are working on a Storage Loader component to download your event files from Amazon S3 and load them into your local Infobright instance. We'll keep you posted on our progress here!

[infobright]: http://www.infobright.org/
[mtibben]: https://github.com/mtibben
[99designs]: http://99designs.com
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues

[non-hive-hiveql]: https://github.com/snowplow/snowplow/blob/master/3-etl/hive-etl/hiveql/non-hive-rolling-etl.q
[emr-etl-runner-config]: https://github.com/snowplow/snowplow/blob/master/3-etl/emr-etl-runner/config/config.yml
[ice-setup]: https://github.com/snowplow/snowplow/tree/master/4-storage/infobright-storage
