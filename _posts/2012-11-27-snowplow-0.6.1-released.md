---
layout: post
title: Snowplow 0.6.1 released, with lots of small improvements
title-short: Snowplow 0.6.1
tags: [snowplow, storageloader, infobright, ice, release]
author: Alex
category: Releases
---

We're happy to announce our next Snowplow release - version **0.6.1**. This release includes updates:

1. **Additional data collection**. The Javascript tracker has been updated to capture additional data points, including a user fingerprint (which can be used as a `user_id` for companies tracking users across domains), the tracker version, browser timezone and color depth
2. **Javascript tracker updates**. A number of updates have been made to make the Javascript tracker more robust
3. **Updates to the ETL flow** so that the `user_agent` string and `platform` captured and stored in Hive / Infobright
4. **Improved EmrEtlRunner command line options** now provide more flexibility when writing your data to storage
5. **Bug fixes** related to loading Snowplow data into Infobright

Before we start - a big thanks to the community members who helped out on this release in a big way:

* [Simon Andersson] [ramn] @ [Qwaya] [qwaya] substantially re-factored the JavaScript tracker, splitting it into multiple smaller files, which made our work significantly easier :-)
* [Gilles Moncaubeig] [moncaubeig] @ [OverBlog] [overblog] contributed the user fingerprinting code - thanks Gilles!
* [Michael Tibben] [mtibben] @ [99designs] [99designs] continued his great work on EmrEtlRunner with improved command line options

<!--more-->

## JavaScript tracker updates

We have released a new version of the JavaScript tracker, **0.8.0**. As always, we are hosting this new version on CloudFront if you don't want to host it yourself:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/0.8.0/sp.js

But before you update your tags, we need to share a few important things about this new version, including a **breaking change**:

### Changes to the JavaScript API

Three main changes have been made to the JavaScript tracker's API - please note that the first is a **breaking change**, while the other two deprecate some existing functions (and introduce new ones):

1. The tracker now GETs `i` not `ice.png` **(BREAKING CHANGE)** - version 0.8.0 of the JavaScript tracker now GETs a transparent 1x1 GIF called `i`, no longer `ice.png`. If you are using the CloudFront Collector, you **must** upload our [`i`] [i-pixel] pixel to sit in your S3 bucket alongside `ice.png`. Don't forget to make it publically readable. [SnowCannon] [snowcannon], the node.js collector, already supports `i`
2. The `setAccount()` function was badly named. We have added a new function, `setCollectorCf()`, which does the exact same thing, and we will remove `setAccount()` in a future version. If you continue to use `setAccount()`, then a warning message will be printed to `console.log`, but it will still work
3. The `getTracker()` function (which not many people need to use) was badly named. As wth point 2 above: we have added `getTrackerCf()` and `getTrackerUrl()`, and deprecated `getTracker()` for now

As always, our JavaScript tracker's current API is fully documented on our Wiki, on the [JavaScript Tracker] [javascript-tracker] page.

### New tracking data

Version 0.8.0 of the JavaScript tracker now passes additional data along to the Snowplow collector. This additional data is as follows:

* **Tracker version** - so you will always know which version of the JavaScript tracker generated a given Snowplow event
* **User fingerprint** - we are still working on a new collector which supports cross-domain user tracking. In the meantime, we are releasing an experimental feature: a 'user fingerprint' based on various (hopefully unique) attributes of the user's browser. Many thanks to [Gilles] [moncaubeig] for contributing this feature; to read more about this, please take a look at [issue #70] [issue-70] in GitHub
* **Timezone** - tells you what timezone the user in, recording the [Olsen key] [olsen-key] for the user's timezone
* **Color depth** - the bit depth of the browser's color palette for displaying images (in bits per pixel)

We have updated the ETL and storage systems (e.g. Hive and Infobright table definitions) to extract and store these new fields.

We have updated the [Snowplow Tracker Protocol] [tracker-protocol] page on our Wiki with these additions.

## ETL and storage improvements

This release includes various improvements to Snowplow ETL and storage which are unrelated to the JavaScript tracker changes above. To break these down:

### Additional data being saved

* **Useragent** - the raw browser useragent is now being logged in a new `useragent` field. Previously we were throwing this useful data away
* **Platform** - the tracker's `platform` type is now extracted and stored. The JavaScript tracker always sets this field to `web`

### Bug fixes

Just one bug fix - in the StorageLoader, we changed the field encloser for Infobright to `NULL`, where previously it was `''` (two empty quotes). This was to fix [issue #88] [issue-88], where Infobright was throwing an error and dying if a field's value started with a double-quote.

### Improved EmrEtlRunner command-line options

EmrEtlRunner now has some improved command-line options:

Firstly, the `--skip` argument now can take a list of individual steps to skip. So for example you could run **only** the Hive job with the command-line option:

    $ bundle exec snowplow-emr-etl-runner --skip staging,archive --config ./config.yml

Secondly, there is now a new option, `--process-bucket`. This runs the Hive job only on the contents of the specified bucket. This implies `--skip staging,archive` as well. An example of usage:

    $ bundle exec snowplow-emr-etl-runner --process-bucket s3n://my-logs-to-process --config ./config.yml

Many thanks to [Mike Tibben] [mtibben] for contributing these new options!

### Placeholders for event and event_id

* **Event** - we have renamed the `event_name` field in Infobright to simply `event`. This is still a placeholder (it will be populated in a future version of Snowplow)
* **Event ID** - there has been some confusion over the uniqueness of the current `txn_id` field - see [issue #89] [issue-89] for the discussion. We plan on adding a properly unique `event_id` for each event in the ETL layer; in the meantime we have added the `event_id` field in as a placeholder

## Upgrading to the new version

### Tracker and collector

We have discussed above how to update your JavaScript tracker and CloudFront collector to support this new version 0.6.1. If you are using [SnowCannon] [snowcannon], the node.js collector, you don't have to modify it - it already supports the new `i` pixel.

### ETL

To upgrade your ETL system, first re-deploy EmrEtlRunner from GitHub as per the [EmrEtlRunner Setup Guide] [emr-etl-runner-setup-guide], and then update the ETL dependencies at the bottom of your `config.yml` file like so:

    :snowplow:
      :serde_version: 0.5.2
      :hive_hiveql_version: 0.5.1
      :non_hive_hiveql_version: 0.0.3

### Storage

#### Hive

If you are only using Hive for storage and analytics, you do not need to do anything to support this new release - because we add all new fields to the end of the file format, and field renames (like `event_name` to `event`) don't affect Hive on Amazon EMR.

#### Infobright

If you are using Infobright Community Edition for analysis, you will need to update your table definition. This is a little complex, because Infobright does not support in-place table or column renames. To make this easier for you, we have created a script:

    4-storage/infobright-storage/migrate_to_003.sh

Running this script will create a new table, `events_003` (version 0.0.3 of the table definition) in your `snowplow` database, copying across all your data from your existing `events` table, which will not be modified in any way.

Once you have run this, don't forget to update your StorageLoader's `config.yml` to load into the new `events_003` table, not your old `events` table:

    :storage:
      :type: infobright
      :database: snowplow
      :table:    events_003 # NOT "events" any more

Done!

## Getting help

If you have any problems with version 0.6.1, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

And do let us know if the new features - such as user fingerprinting - are useful!

[ramn]: https://github.com/ramn
[qwaya]: http://www.qwaya.com
[mtibben]: https://github.com/mtibben
[99designs]: http://99designs.com
[moncaubeig]: https://github.com/moncaubeig
[overblog]: http://en.overblog.com/

[i-pixel]: https://github.com/snowplow/snowplow/blob/master/2-collectors/cloudfront-collector/assets/i?raw=true
[snowcannon]: https://github.com/shermozle/SnowCannon
[javascript-tracker]: https://github.com/snowplow/snowplow/wiki/javascript-tracker
[olsen-key]: http://en.wikipedia.org/wiki/Tz_database
[issue-70]: https://github.com/snowplow/snowplow/issues/70

[tracker-protocol]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol

[issue-88]: https://github.com/snowplow/snowplow/issues/88
[issue-89]: https://github.com/snowplow/snowplow/issues/89

[emr-etl-runner-setup-guide]: https://github.com/snowplow/snowplow/wiki/deploying-emretlrunner

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
