---
layout: post
title: Snowplow 70 Bornean Green Magpie released
title-short: Snowplow 70 Bornean Green Magpie
tags: [snowplow, emr, emretlrunner, storageloader, jruby]
author: Fred
category: Releases
---

We are happy to announce the release of Snowplow version 70 Bornean Green Magpie. This release focuses on improving our StorageLoader and EmrEtlRunner components and is the first step towards combining the two into a single CLI application.

The rest of this post will cover the following topics:

1. [Combined configuration](/blog/2015/08/19/snowplow-r70-bornean-green-magpie-released#combinedConfiguration)
2. [Move to JRuby](/blog/2015/08/19/snowplow-r70-bornean-green-magpie-released#jruby)
3. [Improved retry logic](/blog/2015/08/19/snowplow-r70-bornean-green-magpie-released#retries)
4. [App monitoring with Snowplow](/blog/2015/08/19/snowplow-r70-bornean-green-magpie-released#monitoring)
5. [Compression support](/blog/2015/08/19/snowplow-r70-bornean-green-magpie-released#compression)
6. [Loading Postgres via stdin](/blog/2015/08/19/snowplow-r70-bornean-green-magpie-released#postgresStdin)
7. [Multiple in buckets](/blog/2015/08/19/snowplow-r70-bornean-green-magpie-released#multipleInBuckets)
8. [New safety checks](/blog/2015/08/19/snowplow-r70-bornean-green-magpie-released#safetyChecks)
9. [Other changes](/blog/2015/08/19/snowplow-r70-bornean-green-magpie-released#other-changes)
10. [Upgrading](/blog/2015/08/19/snowplow-r70-bornean-green-magpie-released#upgrading)
11. [Getting help](/blog/2015/08/19/snowplow-r70-bornean-green-magpie-released#help)

![bornean-green-magpie][bornean-green-magpie]

<!--more-->

<h2 id="combinedConfiguration">1. Combined configuration</h2>

This release unifies the configuration file format for the EmrEtlRunner and the StorageLoader. This means that you only need a single configuration file, shared between the two apps.

An [example configuration file][example-config] is available in the repository.

This release also includes a script named [combine_configurations.rb][combine_configurations] which can be used to combine your existing configuration files into one. Use it like this:

{% highlight bash %}
ruby combine_configurations.rb runner.yml loader.yml combined.yml resolver.json
{% endhighlight java %}

This will result in the two configuration files being combined into a single file named `combined.yml`. It will also extract the Iglu resolver into a JSON file named `resolver.json`. This is because the Iglu resolver is now passed to the EmrEtlRunner as a self-describing JSON using a dedicated command-line argument (i.e. the same format as Scala Kinesis Enrich uses).

Please note that the `combine_configurations.rb` script has only been tested on Snowplow R64 and upwards.

<h2 id="jruby">2. Move to JRuby</h2>

We have ported the EmrEtlRunner and StorageLoader to [JRuby][jruby]. Both apps are now deployable as single "fat jars" which can be run like any other jarfile: no Ruby installation is required, just a Java Runtime Environment (1.7+). This is an exciting step forwards for Snowplow, because dealing with Ruby, Bundler and RVM has been a major painpoint for Snowplow users.

Both applications are now available pre-built in a single zipfile hosted in our Bintray:

[http://dl.bintray.com/snowplow/snowplow-generic/snowplow_emr_r70_bornean_green_magpie.zip] [app-dl]

If you prefer to build yourself: both apps now have a `build.sh` script which installs the necessary dependencies and saves the fat jar in the "deploy" directory.

Now that both apps use the same configuration file and are built in the same way, our next goal is to combine them into a single "Snowplow CLI" application, again built in JRuby.

<h2 id="retries">3. Improved retry logic</h2>

Occasionally an EMR job will fail before any step has begun due to a "bootstrap failure". In these cases, since no data has been moved or processed, it is always safe to restart the job. Rather than crashing, the new EmrEtlRunner version will detect that the job has halted due to a bootstrap failure and will keep attempting to restart the job until the job succeeds, the job fails for another reason, or the new `bootstrap_failure_tries` configuration setting is exceeded.

Additionally, the process of polling the EMR job to check its status is now resilient to more errors; [Dani Sola] [danisola] from Simply Business contributed error handling to prevent the connection timeouts from crashing the EmrEtlRunner. Thanks Dani!

<h2 id="monitoring">4. App monitoring with Snowplow</h2>

You can now configure both apps to turn on internal Snowplow tracking - this is another step in us making Snowplow "self-hosting", meaning that one Snowplow instance can be used to monitor the performance of another Snowplow instance.

The EmrEtlRunner will fire an event whenever an EMR job starts, succeeds, or fails. These events include data about the name and status of the job and its individual steps. The StorageLoader will fire an event whenever a database load succeeds or fails. In the case of failure, the event will include the error message.

The new `tags` configuration field can hold a dictionary of name-value pairs. These will get attached to all the above Snowplow events as a context; in a future release we plan to also attach these tags to the running job on EMR.

<h2 id="compression">5. Compression support</h2>

Dani Sola has added support for compressing enriched events using [gzip][gzip]. Redshift can [automatically handle][redshift-load-compressed] loading gzipped files, so this is a good way to reduce the total storage your enriched events require. It will also significantly speed up the related file move operations. Thanks again Dani!

<h2 id="environmentVariables">6. Environment variables in configuration files</h2>

If you don't want to hardcode your AWS credentials in the configuration file, you can now read them in from environment variables by using [Ruby ERB templates][erb]:

{% highlight yaml %}
aws:
  access_key_id: <%= ENV['AWS_SNOWPLOW_ACCESS_KEY'] %>
  secret_access_key: <%= ENV['AWS_SNOWPLOW_SECRET_KEY'] %>
{% endhighlight %}

Thanks to Snowplow community member [Eric Pantera] [epantera] from Viadeo for contributing this feature!

<h2 id="postgresStdin">7. Loading Postgres via stdin</h2>

When the StorageLoader is loading a PostgreSQL database, it now performs the `COPY` via stdin rather than directly from the downloaded local event files. This means that the StorageLoader doesn't have to be run on the same physical machine as the Postgres database. This has two main advantages:

1. The StorageLoader can now load Postgres databases running on [Amazon RDS] [rds]
2. Many users had problems setting up the correct permissions for Postgres to read local files. This is no longer required

Big thanks to [Matt Walker] [mrwalker] from Radico for contributing this feature!

<h2 id="multipleInBuckets">8. Multiple in buckets</h2>

The "in" bucket section of the configuration YAML is now an array, because you can now process raw events from multiple buckets at once. All "in" buckets must use the same collector logging format currently.

<h2 id="safetyChecks">9. New safety checks</h2>

When the EmrEtlRunner is launched, it will now immediately abort if the bucket for good shredded events is non-empty.

If the collector format is set to "thrift", the processing bucket should always contain an even number of files when the job starts. This is because for every `.lzo` file there should be exactly one `.lzo.index` file containing the metadata on how to split it. (See the [hadoop-lzo project][hadoop-lzo] for more information on splittable lzo.) If the number of files is odd, then at least one pair of files is incomplete, and the EmrEtlRunner will fail early.

<h2 id="other">10. Other changes</h2>

We have also:

* Added the ability to read the config file via stdin in ErmEtlRunner and StorageLoader by setting the `--config` option to "-" ([#1772][1772], [#1773][1773])
* Moved the folder of sample enrichment configuration JSONs out of the EmrEtlRunner subproject ([#1574][1574])
* Allowed the "bootstrap" configuration field to be `nil` ([#1575][1575])
* Updated the sample configuration file to use m1.medium instead of m1.small (thanks [Iain Gray][iaingray])
* Updated the Vagrant quickstart to automatically install Postgres ([#1767][1767])

<h2 id="upgrading">11. Upgrading</h2>

<h3>Installing EmrEtlRunner and StorageLoader</h3>

Download the EmrEtlRunner and StorageLoader from our Bintray:

[http://dl.bintray.com/snowplow/snowplow-generic/snowplow_emr_r70_bornean_green_magpie.zip] [app-dl]

Unzip this file to a sensible location (e.g. `/opt/snowplow-r70`).

Check that you have a compatible JRE (1.7+) installed by invoking one of the two apps:

{% highlight bash %}
./snowplow-emr-etl-runner --version
snowplow-emr-etl-runner 0.17.0
{% endhighlight %}

That's it - you are ready to update the configuration files.

<h3>Updating the configuration files</h3>

Your two old configuration files will no longer work. Use the aforementioned [combine_configurations.rb][combine_configurations] script to turn them into a unified configuration file and a resolver JSON.

For reference:

* [config/iglu_resolver.json][example-resolver] - example resolver JSON
* [emr-etl-runner/config/config.yml.sample][example-config] - example unified configuration YAML

Note that field names in the unified configuration file no longer start with a colon - so `region: us-east-1` not `:region: us-east-1`.

<h3>Using the new command-line options</h3>

The EmrEtlRunner now **requires** a `--resolver` argument which should be the path to your new resolver JSON.

Also note that when specifying steps to skip using the `--skip` option, the "archive" step has been renamed to "archive_raw" in the EmrEtlRunner and "archive_enriched" in the StorageLoader. This is in preparation for merging the two applications into one.

<h2 id="help">12. Getting help</h2>

For more details on this release, please check out the [R70 Bornean Green Magpie release notes][r70-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[bornean-green-magpie]: /assets/img/blog/2015/06/bornean-green-magpie.jpg
[example-config]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample
[example-resolver]: https://github.com/snowplow/snowplow/blob/master/3-enrich/config/iglu_resolver.json
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
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

[app-dl]: http://dl.bintray.com/snowplow/snowplow-generic/snowplow_emr_r70_bornean_green_magpie.zip
[rds]: https://aws.amazon.com/rds/
[r70-release]: https://github.com/snowplow/snowplow/releases/tag/r70-bornean-green-magpie

[1575]: https://github.com/snowplow/snowplow/issues/1575
[1574]: https://github.com/snowplow/snowplow/issues/1574
[1767]: https://github.com/snowplow/snowplow/issues/1767
[1772]: https://github.com/snowplow/snowplow/issues/1772
[1773]: https://github.com/snowplow/snowplow/issues/1773
[1817]: https://github.com/snowplow/snowplow/issues/1817
