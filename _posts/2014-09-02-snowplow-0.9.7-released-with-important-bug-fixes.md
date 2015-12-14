---
layout: post
title: Snowplow 0.9.7 released with important bug fixes
title-short: Snowplow 0.9.7
tags: [snowplow, shred, bug fix, bug, hive]
author: Alex
category: Releases
---

We are pleased to announce the immediate availability of Snowplow version 0.9.7. 0.9.7 is a "tidy-up" release which fixes some important bugs, particularly:

1. A bug in 0.9.5 onwards which was preventing events containing multiple JSONs from being shredded successfully ([#939] [939])
2. Our Hive table definition falling behind Snowplow 0.9.6's enriched event format updates ([#965] [965])
3. A bug in EmrEtlRunner causing issues running Snowplow inside some VPC environments ([#956] [956])

As well as these important fixes, 0.9.7 comes with a set of smaller bug fixes plus two new features:

* The ability to perform shredding without prior enrichment (i.e. shred an existing folder of enriched events)
* The ability to load Redshift from an S3 bucket in a region different to Redshift's own region

Below the fold we will cover:

1. [Shredding bug fix and new shredding functionality](/blog/2014/09/02/snowplow-0.9.7-released-with-important-bug-fixes/#shredding)
2. [Other bug fixes](/blog/2014/09/02/snowplow-0.9.7-released-with-important-bug-fixes/#other-bug-fixes)
3. [Other new functionality](/blog/2014/09/02/snowplow-0.9.7-released-with-important-bug-fixes/#other-new-functionality)
4. [Upgrading](/blog/2014/09/02/snowplow-0.9.7-released-with-important-bug-fixes/#upgrading)
5. [Help](/blog/2014/09/02/snowplow-0.9.7-released-with-important-bug-fixes/#help)

<!--more-->

<h2><a name="shredding">1. Shredding bug fix and new shredding functionality</a></h2>

We discovered a serious bug ([#939] [939]) in the new shredding functionality released in Snowplow 0.9.6. This bug meant that, for any enriched event which contained more than one JSON, none of those JSONs would be successfully shredded. Some examples of enriched events containing more than one JSON would be:

* An unstructured event with a single custom context attached
* A link click with a single custom context attached
* A page view with two custom contexts attached

Events containing zero or one JSONs were not affected by this bug.

This release fixes this bug and also introduces some new functionality to make it easier to re-shred of existing enriched events. You can now run the Shredding process on Elastic MapReduce without the prior Enrichment process, by using the command-line option:

{% highlight bash %}
$ bundle exec bin/snowplow-emr-etl-runner ... --process-shred s3n://my-bucket/enriched/good/run=2014-09-01-03-33-45
{% endhighlight %}

Additionally, we have updated EmrEtlRunner's `--skip` functionality, adding an explicit `--skip enrich` option which can be used to shred without enriching.

For more information on these new options, see [Using EmrEtlRunner] [emretlrunner-wiki] on the Snowplow wiki.

<h2><a name="other-bug-fixes">2. Other bug fixes</a></h2>

<div class="html">
<h3><a name="other-bug-fixes-hive">2.1 Hive table definition</a></h3>
</div>

Our [Hive table definition] [hive-ddl] had fallen behind the updated enriched event format released in Snowplow 0.9.6. This has now been updated to parity with our Redshift and Postgres table definitions ([#965] [965]).

<div class="html">
<h3><a name="other-bug-fixes-emretlrunner">2.2 EmrEtlRunner bug fixes</a></h3>
</div>

Many thanks to [Elasticity] [elasticity] author [Rob Slifka] [rslifka] for his help in tracking down a tricky bug in EmrEtlRunner's VPC-related code ([#956] [956]). If you have been having issues running Snowplow's Elastic MapReduce job inside an Amazon VPC, this release should help.

We also fixed some other smaller issues in EmrEtlRunner:

* We fixed some bugs that had crept in to the behavior of `--process-bucket` ([#973] [973])
* We renamed the `--process-bucket` option to `--process-enrich` to prevent confusion with `--process-shred` ([#972] [972])
* We changed the `-s` option for `--skip` to `-x` prevent clash with `-s` for `--start` ([#975] [975])

<div class="html">
<h3><a name="other-bug-fixes-storageloader">2.3 StorageLoader bug fixes</a></h3>
</div>

We have made some small but important fixes around the loading of JSONs into Redshift:

1. We removed the `EMPTYASNULL` option on our `COPY` command for loading JSONs ([#942] [942]). Converting empty strings into nulls was breaking records which had already passed required-field validation in JSON Schema
2. We added the missing `targetUrl` field to our ad_impression JSON Path file, thanks to [Gireesh Sreepathi] [gisripa] for spotting this ([#951] [951])
3. We made the `jsonpath_assets` parameter in `config.yml` optional, for users who are not using their own JSON Path files ([#958] [958])

<h2><a name="other-new-functionality">3. Other new functionality</a></h2>

As mentioned above, it is now possible to load events and JSONs into Redshift from an S3 bucket in a different region to Redshift's own reion. This is done by setting the `REGION` option on the `COPY` commands to the `:s3:region:` parameter found in `config.yml`.

Separately, we have updated and added new git submodules in the [1-trackers sub-folder] [trackers-folder] of the repository, and improved the associated documentation; many thanks to community member [Ozzie Gooen] [OAGr] for his contribution here!

<h2><a name="upgrading">4. Upgrading</a></h2>

<div class="html">
<h3><a name="upgrading-emretlrunner">4.1 Upgrading EmrEtlRunner and StorageLoader</a></h3>
</div>

You need to update EmrEtlRunner and StorageLoader to the latest code (0.9.7 release) on GitHub:

{% highlight bash %}
$ git clone git://github.com/snowplow/snowplow.git
$ git checkout 0.9.7
$ cd snowplow/3-enrich/emr-etl-runner
$ bundle install --deployment
$ cd ../../4-storage/storage-loader
$ bundle install --deployment
{% endhighlight %}

<div class="html">
<h3><a name="upgrading-config">4.2 Updating EmrEtlRunner's configuration</a></h3>
</div>

In your EmrEtlRunner's `config.yml` file, update your Hadoop shred job's version to 0.2.1, like so:

{% highlight yaml %}
  :versions:
    ...
    :hadoop_shred: 0.2.1 # WAS 0.2.0
{% endhighlight %}

For a complete example, see our [sample `config.yml` template] [emretlrunner-config-yml].

<div class="html">
<h3><a name="upgrading-hive">8.3 Upgrading for Hive users</a></h3>
</div>

You can find the updated Hive file in our repository as [4-storage/hive-storage/hiveql/table-def.q] [hive-ddl].

Note that enriched events generated by pre-0.9.6 Snowplow are not compatible with this updated Hive definition, and will need to be re-generated.

<h2><a name="help">5. Help</a></h2>

Robustness and stability are hugely important to the Snowplow team, and so we are always ready to balance featureful new versions of Snowplow with bug fixing releases such as 0.9.7. For more details on this release, please check out the [0.9.7 Release Notes] [snowplow-097] on GitHub.

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample
[emretlrunner-wiki]: https://github.com/snowplow/snowplow/wiki/2-Using-EmrEtlRunner

[939]: https://github.com/snowplow/snowplow/issues/939
[942]: https://github.com/snowplow/snowplow/issues/942
[951]: https://github.com/snowplow/snowplow/issues/951
[956]: https://github.com/snowplow/snowplow/issues/956
[958]: https://github.com/snowplow/snowplow/issues/958
[965]: https://github.com/snowplow/snowplow/issues/965
[972]: https://github.com/snowplow/snowplow/issues/972
[973]: https://github.com/snowplow/snowplow/issues/973
[975]: https://github.com/snowplow/snowplow/issues/975

[hive-ddl]: https://github.com/snowplow/snowplow/blob/0.9.7/4-storage/hive-storage/hiveql/table-def.q

[gisripa]: https://github.com/gisripa/
[rslifka]: https://github.com/rslifka
[elasticity]: https://github.com/rslifka/elasticity/
[OAGr]: https://github.com/OAGr

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[snowplow-097]: https://github.com/snowplow/snowplow/releases/0.9.7
