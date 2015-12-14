---
layout: post
title: Snowplow 0.7.1 released, with easier-to-run Ruby apps
title-short: Snowplow 0.7.1
tags: [snowplow, release, ruby, bundler, rvm]
author: Alex
category: Releases
---

We're happy to announce the release of Snowplow version **0.7.1**. This release is designed to make it much easier to install and run the two Snowplow Ruby applications:

1. [EmrEtlRunner] [emr-etl-runner-repo] - which runs the Snowplow ETL job
2. [StorageLoader] [storage-loader-repo] - which loads Snowplow events into Infobright

From the feedback we received, setting up and running these two Ruby apps was the most challenging (and error-prone) part of the Snowplow experience. Many thanks to all of those in the community who reported bugs with our original approach and suggested fixes!

To streamline this process and reduce the chances of problems occurring, we have updated both Ruby apps to work in a [RVM+Bundler] [rvm-bundler] environment, inline with Ruby community best practice. Specifically, we have:

* Created a simple [guide to setting up Ruby and RVM] [ruby-rvm-setup] ready for Snowplow
* Updated both of our Ruby apps to use RVM and Bundler
* Updated our cronjob shell scripts to work with RVM and Bundler
* Updated the setup guides ([EmrEtlRunner] [emr-etl-runner-setup]; [StorageLoader] [storage-loader-setup]) for both apps to follow RVM and Bundler best practice

This release bumps EmrEtlRunner to version 0.0.8 and StorageLoader to version 0.0.4.

And that's it! Hopefully this release fixes all of the Ruby-related issues encountered by Snowplow users - but of course there might still be a couple of teething issues. If you spot anything that still doesn't seem right, do please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[emr-etl-runner-repo]: https://github.com/snowplow/snowplow/tree/master/3-etl/emr-etl-runner
[storage-loader-repo]: https://github.com/snowplow/snowplow/tree/master/4-storage/storage-loader

[emr-etl-runner-setup]: https://github.com/snowplow/snowplow/wiki/EmrEtlRunner-setup
[storage-loader-setup]: https://github.com/snowplow/snowplow/wiki/StorageLoader-setup

[rvm-bundler]: https://rvm.io/integration/bundler/
[ruby-rvm-setup]: https://github.com/snowplow/snowplow/wiki/Ruby-and-RVM-setup

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
