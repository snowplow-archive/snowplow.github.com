---
layout: blog-post
shortenedlink: Rob Slifka's Elasticity
title: Inside the Plow - Rob Slifka's Elasticity
tags: snowplow emr elasticity mapreduce
author: Alex
category: Inside the Plow
---

<p class="lead">The Snowplow platform is built standing on the shoulders of a whole host of different open source frameworks, libraries and tools. Without the amazing ongoing work by these individuals, companies and not-for-profits, the Snowplow project literally could not exist.</p>

<p class="lead">As part of our "Inside the Plow" series, we will also be showcasing some of these core components of the Snowplow stack, and talking to their creators. To kick us off, we are delighted to have [Rob Slifka] [rob-slifka-twitter], VP of [Engineering] [sharethrough-engineering] at [Sharethrough] [sharethrough] in San Francisco, talking to us about his [Elasticity] [elasticity] project. For those who aren't aware: Elasticity is a Ruby library which we use as part of our [EmrEtlRunner] [emr-etl-runner], to make it easy to automate the Snowplow ETL Job on Amazon Elastic MapReduce. The Elasticity library is a great piece of tech - and indeed was a major factor in us deciding to write EmrEtlRunner in Ruby.</p>

<p class="lead">With the introductions done, let's hand over to Rob to tell us a bit about himself, Elasticity and what he's working on next:</p>

![rob-slifka-img][rob-slifka-img]

Thanks Alex! Quick bit about me: I've been in software development since the mid 90s working on everything from Java Swing (design automation tools) to embedded Jetty (email encryption) and now a mixture of Ruby and Scala. Since 2010, I've been responsible for <a href="http://www.sharethrough.com/engineering">engineering</a> at <a href="http://www.sharethrough.com">Sharethrough</a> - an ad tech company based out of San Francisco. We're building a native advertising platform based on the belief that advertising is no longer sustainable as banners and punch-the-monkey ads and has begun the transition to engaging, non-interruptive choice-based experiences. One thing that a lot of people outside of ad tech don't realize is that online advertising is synonymous with scale and some of the most interesting technology problems are driven from those demands. This is where <a href="https://github.com/rslifka/elasticity">Elasticity</a> comes in.

<!--more-->

Our ads report a significant amount of information around user behavior which we then use in decisioning, pricing and insight derivation (e.g. "Do people share videos before watching them?").


[rob-slifka-twitter]: https://twitter.com/robslifka
[sharethrough]: http://www.sharethrough.com
[sharethrough-engineering]: http://www.sharethrough.com/engineering
[elasticity]: https://github.com/rslifka/elasticity
[emr-etl-runner]: https://github.com/snowplow/snowplow/wiki/setting-up-EmrEtlRunner
[amazon-emr]: http://aws.amazon.com/elasticmapreduce/
[rob-slifka-img]: /static/img/blog/2013/03/rob-slifka.jpeg
[emr.rb]: https://github.com/rslifka/elasticity/blob/master/lib/elasticity/emr.rb