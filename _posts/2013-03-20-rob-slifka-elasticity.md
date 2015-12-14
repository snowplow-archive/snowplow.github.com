---
layout: post
title: Inside the Plow - Rob Slifka's Elasticity
tags: snowplow emr elasticity mapreduce
author: Alex
category: Inside the Plow
---

*The Snowplow platform is built standing on the shoulders of a whole host of different open source frameworks, libraries and tools. Without the amazing ongoing work by these individuals, companies and not-for-profits, the Snowplow project literally could not exist.*

*As part of our "Inside the Plow" series, we will also be showcasing some of these core components of the Snowplow stack, and talking to their creators. To kick us off, we are delighted to have [Rob Slifka] [rob-slifka-twitter], VP of [Engineering] [sharethrough-engineering] at [Sharethrough] [sharethrough] in San Francisco, talking to us about his [Elasticity] [elasticity] project. For those who aren't aware: Elasticity is a Ruby library which we use as part of our [EmrEtlRunner] [emr-etl-runner], to make it easy to automate the Snowplow ETL Job on Amazon Elastic MapReduce. The Elasticity library is a great piece of tech - and indeed was a major factor in us deciding to write EmrEtlRunner in Ruby.*

*With the introductions done, let's hand over to Rob to tell us a bit about himself, Elasticity and what he's working on next:*

![rob-slifka-img][rob-slifka-img]

Thanks Alex! Quick bit about me: I've been in software development since the mid 90s working on everything from Java Swing (design automation tools) to embedded Jetty (email encryption) and now a mixture of Ruby and Scala. Since 2010, I've been responsible for <a href="http://www.sharethrough.com/engineering">engineering</a> at <a href="http://www.sharethrough.com">Sharethrough</a> - an ad tech company based out of San Francisco. We're building a native advertising platform based on the belief that advertising is no longer sustainable as banners and punch-the-monkey ads and has begun the transition to engaging, non-interruptive choice-based experiences. One thing that a lot of people outside of ad tech don't realize is that online advertising is synonymous with scale and some of the most interesting technology problems are driven from those demands. This is where <a href="https://github.com/rslifka/elasticity">Elasticity</a> comes in.

<!--more-->

Our ads report a significant amount of information around user behavior which we then use in decisioning, pricing and insight derivation (e.g. "Do people share videos before watching them?"). In the early days, we were handling what we now consider a small volume of logs (1GB/day) with a correspondingly quick and dirty ETL: a log parser that updated the MySQL instance backing our reporting dashboards.  Fast forward to 2013 and our log intake is north of 30GB/day. With this volume of data and with the insights we wanted to derive, that process didn't cut it and we determined that the quickest way for us to begin deriving value from our data was via [Amazon Elastic MapReduce] [amazon-emr] (hereon referred to as EMR).

If you're unfamiliar with AWS service interaction and evolution, it often follows this pattern (using EMR as an example):

1. Use the AWS UI to become familiar with EMR. Manually step through the creation of Job Flows, choose your job type, asset location, cluster configuration options, etc.
2. (Optionally) Graduate to the AWS CLI once you see a pattern in your interaction. Your'e in active development and moving more quickly than before. Youv'e decided on Pig, your assets and clusters are stored and predicted consistently, etc.
3. Use Amazon or 3rd-party API to integrate the tool into your workflow so you don't have to copy the command line tools around your infrastructure.

Amazon's tools are developer services, not meant for absolutely streamlined consumption; some legwork is required. The AWS CLI is a thin wrapper around the EMR REST API meaning there are numerous and frequently mutually exclusive options. If you choose to use the CLI, you'll spend a significant amount of time learning how to use the command line tools by reading the developer API guide. Why isn't there a programmatic way to work with EMR that follows the same mental model as that which is exposed via the UI and doesn't require you to understand the EMR REST API?

That's where Elasticity comes in.

As an API author you can choose to represent the EMR model directly or layer your own model on top of it. As a point of reference, this is a partial list of EMR Rest API calls: AddInstanceGroups, AddJobFlowSteps, DescribeJobFlows, etc.

1. One way to provide access to EMR might be via Ruby methods that wrap each of these calls, something like [this] [emr.rb]. And by providing only this, you as a developer would be required to understand the EMR API documentation to use Elasticity - still nto much better than using the CLI tools
2. Another option might be for Elasticity to say, "Forget about job flows! I'm going to give you a 'Session' and each step of your job flow is a 'Batch Processing Function'"... and you'd be propertly confusd, having to map between your understanding of EMR and what Elasticity exposes
3. Elasticity went with a third option - mirroring what was offered in the AWS EMR UI: **Elasticity is a Ruby gem for working with EMR that requires you only understand the EMR user's manual, not the EMR developer's manual.**

Elasticity v1 split (2) and (3) above, encapsulating an entire "job" as you unit of interaction with teh API. You'd create and configure a "HiveJob" and start it. This was assuming that most interactions with EMR are single-step.

Elasticity v2 was a major rewrite focusing wholly on option (3) above. You create and configure "JobFlows" and add steps to them, just as you do in the UI; a much more comfortable model for those familiar with the EMR UI (which we all were at some point when we learned how to use EMR).

Elasticity v3... who knows? First and foremost, I work on features that Sharethrough requires. We're in a steady state with EMR at the moment and now I'm hoping the community has some suggestions :)

Thanks for making it this far! **And if anything I touched on sounds interesting, Sharethrough is hiring and we're relo-friendly! Check us at at [Sharethrough Engineering] [sharethrough-engineering].**

[sharethrough]: http://www.sharethrough.com
[sharethrough-engineering]: http://www.sharethrough.com/engineering
[elasticity]: https://github.com/rslifka/elasticity
[emr-etl-runner]: https://github.com/snowplow/snowplow/wiki/setting-up-EmrEtlRunner
[amazon-emr]: http://aws.amazon.com/elasticmapreduce/
[rob-slifka-img]: /assets/img/blog/2013/03/rob-slifka.jpeg
[emr.rb]: https://github.com/rslifka/elasticity/blob/master/lib/elasticity/emr.rb
