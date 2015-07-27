---
layout: post
shortenedlink: Kinesis S3 0.3.0 released
title: Kinesis S3 0.3.0 released
tags: [snowplow, emr, emretlrunner, storageloader, ruby]
author: Fred
category: Releases
---

We are happy to announce the release of Snowplow version 70 bornean-green-magpie. This release focuses on improving the StorageLoader and EmrEtlRunner and is the first step towards combining the two into a single application.

The rest of this post will cover the following topics:

1. [Combined configuration](/blog/2015/xx/xx/snowplow-r70-bornean-green-magpie-released#combinedConfiguration)
2. [Move to JRuby](/blog/2015/xx/xx/snowplow-r70-bornean-green-magpie-released#jruby)
3. [Improved retry logic](/blog/2015/xx/xx/snowplow-r70-bornean-green-magpie-released#retries)
4. [Internal monitoring](/blog/2015/xx/xx/snowplow-r70-bornean-green-magpie-released#monitoring)
5. [Compression support](/blog/2015/xx/xx/snowplow-r70-bornean-green-magpie-released#compression)
6. [Loading Postgres via stdin](/blog/2015/xx/xx/snowplow-r70-bornean-green-magpie-released#postgresStdin)
7. [Multiple in buckets](/blog/2015/xx/xx/snowplow-r70-bornean-green-magpie-released#multipleInBuckets)
8. [New safety checks](/blog/2015/xx/xx/snowplow-r70-bornean-green-magpie-released#safetyChecks)
9. [Other changes](/blog/2015/xx/xx/snowplow-r70-bornean-green-magpie-released#other-changes)
10. [Upgrading](/blog/2015/xx/xx/snowplow-r70-bornean-green-magpie-released#upgrading)
11. [Getting help](/blog/2015/xx/xx/snowplow-r70-bornean-green-magpie-released#help)

![bornean-green-magpie][bornean-green-magpie]

<!--more-->

<h2 id="combinedConfiguration">1. Combined configuration</h2>

This release unifies the configuration file format for the EmrEtlRunner and the StorageLoader. This means that you only need a single configuration file, shared between the two apps.

An [example configuration file][example-config] is available in the repository.

This release also includes a script named [combine_configurations.rb][combine_configurations] which can be used to combine your existing configuration files into one. Use it like this:

```
ruby combine_configurations.rb eer_config.yml storage_loader_config.yml resolver.json combined.yml
```

This will result in the two configuration files being combined into a single file named `combined.yml`. It will also extract the Iglu resolver into a JSON file named `resolver.json`. This is because the resolver is now passed to the EmrEtlRunner as a dedicated command-line argument.

<h2 id="jruby">2. Move to JRuby</h2>

We have ported the StorageLoader to [JRuby][jruby]. Both apps can now be bundled as fat jars which can be run like any other jar: no Ruby installation is required, just a JVM.

Each subproject now has a "build.sh" script which installs the necessary dependencies and saves the fat jar in the "deploy" directory.

Now that both apps use the same configuration file and are compiled in the same way, our next goal is to combine them into a single "Snowplow CLI" application.

<h2 id="retries">3. Improved retry logic</h2>

Occasionally an EMR job will fail before any step has begun due to a "bootstrap failure". In these cases, since no data has been moved or processed, it is always safe to restart the job. Rather than crashing, the new EmrEtlRunner version will detect that the job has halted due to a bootstrap failure and will keep attempting to restart the job until the job succeeds, the job fails for another reason, or the `bootstrap_failure_tries` configuration setting is exceeded.

Additionally, the process of polling the EMR job to check its status is now resilient to more errors. For example, Dani Sola contributed error handling to prevent the connection timeouts from crashing the EmrEtlRunner. Thanks [@danisola][danisola]!

<h2 id="monitoring">4. Internal monitoring</h2>

You can now configure both apps to turn on internal Snowplow tracking. The EmrEtlRunner will fire an event whenever an EMR job starts, succeeds, or fails. These events include data about the name and status of the job and its individual steps. The StorageLoader will fire an event whenever a database load succeeds or fails. In the case of failure, the event will include the error message.

The new `tags` configuration field can hold a dictionary of name-value pairs. These will also get attached to all the above events as a context.

<h2 id="compression">5. Compression support</h2>

Dani Sola has added support for compressing enriched events using [gzip][gzip]. Redshift can [automatically handle][redshift-load-compressed] loading gzipped files, so this is a good way to reduce the total storage your enriched events require. Thanks again [@danisola][danisola]!

<h2 id="environmentVariables">4. Environment variables in configuration files</h2>

If you don't want to hardcode your AWS credentials in the configuration file, you can now read them in from environment variables by using [ERB templates][erb]:

```yml
aws:
  access_key_id: <%= ENV['AWS_SNOWPLOW_ACCESS_KEY'] %>
  secret_access_key: <%= ENV['AWS_SNOWPLOW_SECRET_KEY'] %>
```

Thanks to Snowplow community member Eric Pantera ([@epantera][epantera] on GitHub) for contributing this feature!

<h2 id="postgresStdin">6. Loading Postgres via stdin</h2>

When the StorageLoader's endpoint is Postgres rather than Redshift, it now copies the enriched events from stdin rather than directly from the local file into which they have been downloaded. This means that the StorageLoader doesn't have to be run on the same physical machine as the Postgres database.

Big thanks to Matt Walker, a.k.a. [@mrwalker][mrwalker], for contributing this feature!

<h2 id="multipleInBuckets">7. Multiple in buckets</h2>

The "in" bucket section of the configuration YAML is now an array, because you can now process raw events from multiple buckets at once.

<h2 id="safetyChecks">8. New safety checks</h2>

When the EmrEtlRunner is launched, it will now immediately abort if the bucket for good shredded events is nonempty.

If the collector format is set to "thrift", the processing bucket should always contain an even number of files when the job starts. This is because for every .lzo file there should be exactly one .lzo.index file containing information on how to split it. (See the [hadoop-lzo project][hadoop-lzo] for more information on splittable lzo.) If the number of files is odd, the EmrEtlRunner will fail early.

<h2 id="other">9. Other changes</h2>

We have also:

* Added the ability to read the config file via stdin by setting the --config option to "-" ([#1772][1772], [#1773][1773])
* Moved the folder of sample enrichment configuration JSONs out of the EmrEtlRunner subproject ([#1574][1574])
* Allowed the "bootstrap" configuration field to be `nil` ([#1575][1575])
* Updated the sample configuration file to use m1.medium instead of m1.small (thanks [@iaingray][iaingray])
* Updated the Vagrant quickstart to automatically install Postgres ([#1767][1767])

<h2 id="upgrading">10. Upgrading</h2>

The EmrEtlRunner now requires a --resolver argument which should be the path to the resolver JSON.

Your two old configuration files will no longer work. Use the aforementioned [combine_configurations.rb][combine_configurations] script to turn them into a unified configuration file and a resolver JSON.

You can use the [example unified configuration file][example-config] as a reference.

Also note that when specifying steps to skip using the --skip option, the "archive" step has been renamed to "archive_raw" in the EmrEtlRunner and "archive_enriched" in the StorageLoader.

<h2 id="help">11. Getting help</h2>

For more details on this release, please check out the [Kinesis S3 0.3.0 release][0.3.0-release] on GitHub. 

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[bornean-green-magpie]: /assets/img/blog/2015/06/bornean-green-magpie.jpg
[example-config]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample
[issues]: https://github.com/snowplow/kinesis-s3/issues
[talk-to-us]: https://github.com/snowplow/kinesis-s3/wiki/Talk-to-us
[0.3.0-release]: https://github.com/snowplow/kinesis-s3/releases/tag/0.3.0
[combine_configurations]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/combine_configurations.rb
[jruby]: http://jruby.org/
[epantera]: https://github.com/epantera
[danisola]: https://github.com/danisola
[mrwalker]: https://github.com/mrwalker
[iaingray]: https://github.com/iaingray
[erb]: http://ruby-doc.org/stdlib-2.2.2/libdoc/erb/rdoc/ERB.html
[gzip]: http://www.gzip.org/
[lzo]: http://docs.aws.amazon.com/redshift/latest/dg/lzo-encoding.html
[redshift-load-compressed]: http://docs.aws.amazon.com/redshift/latest/dg/t_loading-gzip-compressed-data-files-from-S3.html
[hadoop-lzo]: https://github.com/twitter/hadoop-lzo

[1767]: https://github.com/snowplow/snowplow/issues/1767
[1772]: https://github.com/snowplow/snowplow/issues/1772
[1773]: https://github.com/snowplow/snowplow/issues/1773
