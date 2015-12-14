---
layout: post
title: Snowplow 0.7.0 released, with new Clojure-based collector
title-short: Snowplow 0.7.0
tags: [snowplow, clojure collector, clojure, third party cookies, amazon elastic beanstalk]
author: Alex
category: Releases
---

Today we are hugely excited to announce the release of Snowplow version **0.7.0**, which includes an experimental new [Clojure-based collector] [clj-collector-impl] designed to run on [Amazon Elastic Beanstalk] [aws-eb]. This release allows you to use Snowplow to uniquely identify and track users across multiple domains - even across a whole content or advertising network.

Many thanks to community member [Simon Rumble] [shermozle] for developing many of the ideas underpinning the new collector in [SnowCannon] [snowcannon], his node.js-based collector for Snowplow.

To date, the primary collector for Snowplow events has been our CloudFront-based collector. The CloudFront-based collector has been easy to setup and very reliable, but has one main drawback: it does not support user tracking across multiple domains.

The Clojure-based collector changes this: it sets a unique user ID server-side and returns it to the browser as a third-party cookie; this user ID is then stored with your Snowplow events, instead of the first-party cookie set by the JavaScript tracker. This means that user=123 on, say, [maven.snplow.com](http://maven.snplow.com) will be the same as user=123 on [snowplowanalytics.com] [snowplow-website].

And the other good news is that our Clojure collector automatically logs the raw Snowplow events to Amazon S3 - and it logs in the exact same format as the CloudFront-based collector, so we can use the same ETL process for both collectors!

Read on below the fold for installation instructions and some additional information on this release.

<!--more-->

## Installation instructions

### Clojure-based collector

You will find full instructions on setting up the new Clojure-based collector on our Wiki, [Setting up the Clojure collector] [clj-collector-setup].

### ETL

If you are using EmrEtlRunner, you need to update to the latest version, which is 0.0.7 - this is available by checking out the master branch of the [Snowplow repository] [snowplow-repo].

You will also need to update your configuration file, `config.yml`, to use the latest versions of the HiveQL scripts:

    :snowplow:
      # ...
      :hive_hiveql_version: 0.5.4
      :non_hive_hiveql_version: 0.0.5

### Storage

If you are using StorageLoader, you need to update to the latest version, which is 0.0.3 - this is available by checking out the master branch of the [Snowplow repository] [snowplow-repo].

If you are using Infobright Community Edition, you will need to update your table definition. This is because the `user_id` field was not wide enough to store the new user IDs (UUIDs) set by the Clojure collector. To make this easier for you, we have created a script:

    4-storage/infobright-storage/migrate_to_005.sh

Running this script will create a new table, `events_005` (version 0.0.5 of the table definition) in your `snowplow` database, copying across all your data from your existing `events_004` table, which will not be modified in any way.

Once you have run this, don't forget to update your StorageLoader's `config.yml` to load into the new `events_005` table, not your old `events_004` table:

    :storage:
      # ...
      :table:    events_005 # NOT "events_004" any more

That's it! Your Clojure collector should be ready to run now. However, please read on for an important note about its experimental nature.

## Warning: Experimental!

We want to stress that the new Clojure-based collector is a piece of experimental technology - we are looking to the community to try it out and feedback to us on how it's working for you, especially at scale.

In particular, we would recommend running the Clojure-based collector alongside the CloudFront collector to be confident that it is performing under load and that no events are being dropped. We have run both collectors alongside each other for the [Snowplow Analytics] [snowplow-website] website for four complete days, and total event counts are as follows:

| Date       | CloudFront | Clojure |
|:-----------|:-----------|:--------|
| 2013-01-02 | 275        | 274     |
| 2013-01-01 | 116        | 108     |
| 2012-12-31 | 107        | 109     |
| 2012-12-30 | 142        | 141     |

Overall for the result set, the absolute percentage difference between results for the Cloudfront and Clojure collectors is less than 2% (1.9%). Possible reasons for this discrepancy include:

1. Differences in datestamps - possibly an event fell on either side of a date boundary for each collector
2. Duplicate rows - the two collectors may be occassionally duplicating different rows (see [issue 24] [issue-24])
3. Browsing behavior - it may be that the user navigates away from the page before one or other collector can register the event

We plan on testing all of this further with larger datasets; we also intend to explore the Clojure collector's duplicate rows to check there are no particular issues there.

## Other features in this release

There are two minor changes in this release not related to the Clojure-based collector:

Both EmrEtlRunner and StorageLoader now print "Completed successfully" to `stdout` on completion. This should help to make it clearer (e.g. in logs) that these Ruby programs have completed successfully.

StorageLoader has been updated so that its `--skip` argument works the same way as it does in EmrEtlRunner:

    Specific options:
        ...
        -s, --skip download,load,archive   skip work step(s)

## Getting help

That's it! If you have any problems with Snowplow version 0.7.0, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[clj-collector-impl]: https://github.com/snowplow/snowplow/tree/master/2-collectors/clojure-collector
[aws-eb]: http://aws.amazon.com/elasticbeanstalk/

[shermozle]: https://github.com/shermozle
[snowcannon]: https://github.com/shermozle/SnowCannon

[snowplow-website]: http://snowplowanalytics.com
[snowplow-repo]: http://collector.snplow.com/r/tp2?u=https%3A%2F%2Fgithub.com%2Fsnowplow%2Fsnowplow
[clj-collector-setup]: https://github.com/snowplow/snowplow/wiki/setting-up-the-clojure-collector
[issue-24]: https://github.com/snowplow/snowplow/issues/24

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
