---
layout: post
title-short: Snowplow 80 Southern Cassowary
title: "Snowplow 80 Southern Cassowary released"
tags: [snowplow, kinesis, real-time]
author: Fred
category: Releases
---

[Snowplow 80 Southern Cassowary][snowplow-release] is now available! This is a real-time pipeline release which improves stability and brings the real-time pipeline up-to-date with our Hadoop pipeline.

1. [The latest Common Enrich](/blog/2016/05/30/snowplow-r80-southern-cassowary-released#common-enrich)
2. [Exiting on error](/blog/2016/05/30/snowplow-r80-southern-cassowary-released#terminate)
3. [Configurable maxRecords](/blog/2016/05/30/snowplow-r80-southern-cassowary-released#maxrecords)
4. [Changes to logging](/blog/2016/05/30/snowplow-r80-southern-cassowary-released#logging)
5. [Continuous deployment](/blog/2016/05/30/snowplow-r80-southern-cassowary-released#cicd)
5. [Other improvements](/blog/2016/05/30/snowplow-r80-southern-cassowary-released#other)
6. [Upgrading](/blog/2016/05/30/snowplow-r80-southern-cassowary-released#upgrading)
7. [Getting help](/blog/2016/05/30/snowplow-r80-southern-cassowary-released#help)

![southern-cassowary][southern-cassowary]

<!--more-->

<h2 id="common-enrich">The latest Common Enrich</h2>

This version of Stream Enrich uses the latest version of [Scala Common Enrich][sce], the library containing Snowplow's core enrichment logic. Among other things, this means that you can now use [R79 Black Swan's] [r79-blog-post] API Request Enrichment and the HTTP Header Extractor Enrichment in your real-time pipeline.

<h2 id="terminate">Exiting on error</h2>

There are certain error conditions under which our Kinesis apps would previously hang rather than crash outright:

* The Scala Stream Collector could hang when unable to bind to the supplied port
* All of the apps could hang if they were unable to find the Kinesis stream to write to on startup. This could be caused by a race condition when starting the app and creating the stream at the same time

In this release, we have modified the apps so that they exit with status code 1 whenever these errors are encountered, rather than hanging. This means that you can run the apps with a background script which restarts them whenever they die. This prevents transient error conditions from requiring human intervention.

<h2 id="maxrecords">Configurable maxRecords</h2>

You can now configure the number of records that the [Kinesis Client Library][kcl] should retrieve with each call to `GetRecords`. The default is 10,000, which is also the maximum. If you frequently see `"Unable to execute HTTP request: Connection reset"` in your error logs, then you should try reducing `maxRecords` to make each request smaller and more likely to succeed.

You can set `maxRecords` to any positive integer up to 10,000 in the configuration file for Stream Enrich (by setting `enrich.streams.in.raw.maxRecords = n`) and Kinesis Elasticsearch Sink (by setting `sink.kinesis.in.maxRecords = n`).

<h2 id="logging">Changes to logging</h2>

Stream Enrich's logging for failed records is now less verbose: instead of logging an error message for every failed record in a batch, it buckets the failed requests based on their error code, then prints the size of each bucket together with a representative error message for each bucket.

Additionally, both the Scala Stream Collector and Stream Enrich now log a missing stream - which is a showstopping issue - at the `error` level rather than the `info` level.

<h2 id="cicd">Continuous integration and deployment</h2>

The Kinesis apps are now continuously integrated and deployed using [Travis CI][travis]. This speeds up our development cycle, making it easier to automatically publish new versions.

<h2 id="other">Other improvements</h2>

Other improvements across the Kinesis applications include:

* For each app, the example configuration files have been moved out of the `src` directory into a new `example` directory. This prevents them from being needlessly added to the jarfile
* The Scala Stream Collector now sends the string "ok" as the content of its response to POST requests. This is a workaround for a [Firefox bug][firefox-bug] which causes unsightly errors to appear in the JavaScript console when the response to a POST request has no content
* We have upgraded the Scala Stream Collector to use [Akka][akka] 2.3.9, [Spray][spray] 1.3.3, and Scala 2.10.5

<h2 id="upgrading">Upgrading</h2>

The Kinesis apps for R80 Southern Cassowary are all available in a single zip file here:

    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_kinesis_r80_southern_cassowary.zip

There are no breaking changes in this release - you can upgrade the individual Kinesis apps without worrying about having to update the configuration files or indeed the Kinesis streams.

However, if you want to configure how many records Stream Enrich should read from Kinesis at a time, update its configuration file to add a `maxRecords` property like so:

{% highlight json %}
enrich {
  ...
  streams {
    in: {
      ...
      maxRecords: 5000 # Default is 10000
      ...
{% endhighlight %}

If you want to configure how many records Kinesis Elasticsearch Sink should read from Kinesis at a time, again update its configuration file to add a `maxRecords` property:

{% highlight json %}
sink {
  ...
  kinesis {
    in: {
      ...
      maxRecords: 5000 # Default is 10000
      ...
{% endhighlight %}

<h2 id="help">Getting help</h2>

For more details on this release, please check out the [release notes][snowplow-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[travis]: https://travis-ci.com/
[snowplow-release]: https://github.com/snowplow/snowplow/releases/r80-southern-cassowary
[r79-blog-post]: /blog/2016/05/12/snowplow-r79-black-swan-with-api-request-enrichment-released/
[southern-cassowary]: /assets/img/blog/2016/05/southern-cassowary.jpg
[firefox-bug]: https://bugzilla.mozilla.org/show_bug.cgi?id=884693
[sce]: https://github.com/snowplow/snowplow/tree/master/3-enrich/scala-common-enrich
[changelog]: https://github.com/snowplow/snowplow/tree/master/CHANGELOG
[akka]: http://akka.io/
[spray]: http://spray.io/
[kcl]: https://github.com/awslabs/amazon-kinesis-client
[issues]: https://github.com/snowplow/snowplow/issues/new
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
