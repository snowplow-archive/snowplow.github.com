---
layout: post
title: Snowplow 0.8.2 released with Clojure Collector enhancements
title-short: Snowplow 0.8.2
tags: [snowplow, clojure collector, release, leiningen]
author: Alex
category: Releases
---

We're pleased to announce the immediate availability of Snowplow **0.8.2**. This release updates the Clojure Collector only; if you are using the CloudFront Collector, then no upgrade to 0.8.2 is necessary.

Many thanks to community member [Mark H. Butler] [butlermh] for his major contributions to this release - much appreciated Mark!

This release bumps the Clojure Collector to version **0.4.0**. There are three main changes to the Collector:

1. Building the Collector's warfile is now much simpler, thanks to a new `lein aws` command contributed by Mark
2. We have fixed a bug ([#220] [issue-220]) where occasionally the Collector's event logging would log `""` (empty string) rather than `"-"` for a missing referer. While rare, when this occurred this would cause the Snowplow ETL process to break (requiring manual editing of the offending log file)
3. Some code tidy-up, including making the Clojure Collector work with newer versions of Leiningen

To upgrade to this release:

1. Download the new warfile by right-clicking on [this link] [war-download] and selecting "Save As..."
2. Log in to your Amazon Elastic Beanstalk console
3. Browse to your Collector's application
4. Click the "Upload New Version" and upload your warfile

And that should be it. Thanks again to Mark for his contribution to this release - and we're excited to have some further community contributions coming very soon to Snowplow, so watch this space!

[butlermh]: https://github.com/butlermh
[issue-220]: https://github.com/snowplow/snowplow/issues/220
[war-download]: http://s3-eu-west-1.amazonaws.com/snowplow-hosted-assets/2-collectors/clojure-collector/clojure-collector-0.4.0-standalone.war
