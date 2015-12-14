---
layout: post
title: Snowplow 0.5.0 released, now with a Ruby gem to run Snowplow's ETL process on Amazon EMR
title-short: Snowplow 0.5.0
tags: [snowplow, emr, emretlrunner, ruby]
author: Alex
category: Releases
---

We have just released Snowplow **0.5.0**, with an all-new component, the Snowplow EmrEtlRunner. EmrEtlRunner is a Ruby application to run Snowplow's Hive-based ETL (extract, transform, load) process on [Amazon Elastic MapReduce] [amazon-emr] with minimum fuss.

We are hugely grateful to community member [Michael Tibben] [mtibben] from [99designs] [99designs] for his contributions to EmrEtlRunner: thanks to Michael, EmrEtlRunner is more efficient, more flexible and more robust than it otherwise would have been - and ready sooner. Many thanks Michael!

## Using EmrEtlRunner

EmrEtlRunner is a Ruby application which you can setup on your server to regularly take your raw Snowplow logs (as stored in CloudFront access logs) and apply the Hive-based ETL process to them using [Amazon Elastic MapReduce] [amazon-emr]. This ETL process populates a Hive-format events table which you can then use with the HiveQL recipes in our [Analyst's Cookbook] [analysts-cookbook].

For detailed instructions on installing, running and scheduling EmrEtlRunner on your server, please see the [Deploying EmrEtlRunner] [deploying-emr-etl-runner] guide on the Snowplow Analytics wiki.

<!--more-->

## The codebase

If you want to take a look at the code, you can find it in the main repository here: [`3-etl/emr-etl-runner/`] [emr-etl-runner-code]

## Getting help

If you have any problems getting EmrEtlRunner working, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

## In the pipeline

At Snowplow we want to support multiple different storage and analytics options for Snowplow events, alongside our current Hive-based approach. Our first priority is supporting [Infobright Community Edition] [infobright] (ICE) for event storage and querying; extending the current ETL process to load Snowplow events into ICE will be the focus of our next few releases, so please stay tuned!  

[amazon-emr]: http://aws.amazon.com/elasticmapreduce/
[mtibben]: https://github.com/mtibben
[99designs]: http://99designs.com

[analysts-cookbook]: http://snowplowanalytics.com/analytics/index.html
[deploying-emr-etl-runner]: https://github.com/snowplow/snowplow/wiki/Deploying-EmrEtlRunner

[emr-etl-runner-code]: https://github.com/snowplow/snowplow/tree/master/3-etl/emr-etl-runner

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

[infobright]: http://www.infobright.org/
