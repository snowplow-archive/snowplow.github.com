---
layout: post
title: Snowplow 0.6.4 released, with Infobright improvements
title-short: Snowplow 0.6.4
tags: [snowplow, infobright, ice, columnar database, release]
author: Alex
category: Releases
---

We're happy to announce our next Snowplow release - version **0.6.4**. This release includes updates:

1. An upgraded Infobright table definition which scales to millions of pageviews easily
2. Clarified Hive table definitions

Before we start - a big thanks to the community members who helped out on this release:

* [Gilles Moncaubeig] [moncaubeig] @ [OverBlog] [overblog] worked closely with us on the updated Infobright table definition
* [Mike Moulton] [mmoulton] @ [meltmedia] [meltmedia] for flagging the missing Hive table definition

We'll take a look at both updates below:

<!--more-->

## Upgraded Infobright table definition

With help from [Gilles Moncaubeig] [moncaubeig] we have upgraded the Infobright table definition so that it can easily scale to loading millions of new Snowplow events per day. It also supports much longer `br_lang` and `page_url` fields, which should prevent you from occasional load errors.

If you are using Infobright Community Edition for analysis, you will need to update your table definition. This is a little complex, because Infobright does not support in-place table or column renames. To make this easier for you, we have created a script:

    4-storage/infobright-storage/migrate_to_004.sh

Running this script will create a new table, `events_004` (version 0.0.4 of the table definition) in your `snowplow` database, copying across all your data from your existing `events` table, which will not be modified in any way.

Once you have run this, don't forget to update your StorageLoader's `config.yml` to load into the new `events_004` table, not your old `events` table:

    :storage:
      :type: infobright
      :database: snowplow
      :table:    events_004 # NOT "events_003" any more

Done!

## Clarified Hive table definitions

We have clarified the two different Hive table definitions, available in this folder:

4-storage/hive-storage

Which format your Snowplow event files are in will depend on how your EmrEtlRunner is configured. If your `config.yml` contains:

    :storage_format: non-hive

then your Snowplow events will be stored in the format shown in [`non-hive-format-table-def.q`] [non-hive-format].

Whereas if your `config.yml` contains:

    :storage_format: non-hive

then your Snowplow events will be stored in the format shown in [`hive-format-table-def.q`] [hive-format].

## Getting help

That's it! If you have any problems with Snowplow version 0.6.4, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[moncaubeig]: https://github.com/moncaubeig
[overblog]: http://en.overblog.com/
[mmoulton]: https://github.com/mmoulton
[meltmedia]: http://meltmedia.com/

[hive-format]: https://github.com/snowplow/snowplow/blob/master/4-storage/hive-storage/hive-format-table-def.q
[non-hive-format]: https://github.com/snowplow/snowplow/blob/master/4-storage/hive-storage/non-hive-format-table-def.q

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
