---
layout: post
title-short: Snowplow 76 Changeable Hawk-Eagle
title: Snowplow 76 Changeable Hawk-Eagle released
tags: [snowplow, sendgrid, deduplication, shredding]
author: Alex
category: Releases
---

We are pleased to announce the release of [Snowplow 76 Changeable Hawk-Eagle][snowplow-release]. This release  and also includes an important bug fix for our .

![R75 Long-Legged Buzzard] [release-image]

Here are the sections after the fold:

1. [Urban Airship Connect support](/blog/2016/01/02/snowplow-r75-long-legged-buzzard-released/#urbanairship)
2. [SendGrid webhook support](/blog/2016/01/02/snowplow-r75-long-legged-buzzard-released/#SendGrid)
3. [Updated data model](/blog/2016/01/02/snowplow-r75-long-legged-buzzard-released/#datamodel)
4. [Upgrading](/blog/2016/01/02/snowplow-r75-long-legged-buzzard-released/#upgrading)
5. [Roadmap and contributing](/blog/2016/01/02/snowplow-r75-long-legged-buzzard-released/#roadmap-etc)
6. [Documentation and help](/blog/2016/01/02/snowplow-r75-long-legged-buzzard-released/#help)

<!--more-->

<h2 id="deduplication">1. Event de-duplication</h2>

The Urban Airship Connect adapter in lets you track mobile app events delivered by [Urban Airship Connect][urbanairship-connect]. Using this functionality you can warehouse all of your Urban Airship mobile app and push notification events alongside your existing Snowplow events.

For help setting up Urban Airship Connect support, see the [Urban Airship Connect setup][urbanairship-setup] wiki page.

For technical details on this adapter, see the [Urban Airship Connect adapter][urbanairship-tech-docs] wiki page.

<h2 id="SendGrid">2. SendGrid bug fix</h2>

In the last release XXX.

<h2 id="datamodel">3. Updated data model</h2>

Community member [Bernardo Srulzon] [bernardosrulzon] has contribued an update to one of our SQL data models: [web-recalculate] [web-recalculate].

The updated data model is more efficient (consuming less disk space), and now creates a helpful cookie-ID-to-user-ID map. Thanks Bernardo!

<h2 id="upgrading">4. Upgrading</h2>

Upgrading to this release is simple - the only changed components are the fat jars

<h3 id="configuring-emretlrunner">4.1 Upgrading your EmrEtlRunner config.yml</h3>

In the `config.yml` file for your EmrEtlRunner, update your `hadoop_enrich` and `hadoop_shred` job versions like so:

{% highlight yaml %}
  versions:
    hadoop_enrich: 1.5.1 # WAS 1.5.0
    hadoop_shred: 0.7.0 # WAS 0.6.0
    hadoop_elasticsearch: 0.1.0 # Unchanged
{% endhighlight %}

For a complete example, see our [sample `config.yml` template][emretlrunner-config-yml].

<h3 id="upgrading-change-form">4.2 Redshift</h3>

You'll need to deploy the Redshift tables for any webhooks you plan on ingesting into Snowplow. You can find the Redshift table deployment instructions on the corresponding webhook setup wiki pages:

* [SendGrid webhook Redshift setup][sendgrid-setup-redshift]
* [UrbanAirship Connect webhook Redshift setup][urbanairship-setup-redshift]

<h2 id="roadmap-etc">5. Roadmap and contributing</h2>

**Something about plans to extend our dedupe support.**

Upcoming Snowplow releases include:

* [Release 77 Bird TBC][r76-milestone], which will refresh our EmrEtlRunner app, including updating Snowplow to using the EMR 4.x AMI series
* [Release 78 Bird TBC][r77-milestone], which will bring the Kinesis pipeline up-to-date with the most recent Scala Common Enrich releases. This will also include click redirect support in the Scala Stream Collector

Note that these releases are always subject to change between now and the actual release date.

<h2 id="help">6. Getting help</h2>

As always, if you do run into any issues or don't understand any of the new features, please [raise an issue][issues] or get in touch with us via [the usual channels][talk-to-us].

For more details on this release, please check out the [R76 Release Notes][snowplow-release] on GitHub.

[release-image]: /assets/img/blog/2016/01/long-legged_buzzard.jpg

[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[snowplow-release]: https://github.com/snowplow/snowplow/releases/r76-changeable-hawk-eagle

[r77-milestone]: https://github.com/snowplow/snowplow/milestones/Release%2077%20%5BKIN%5D%20Bird%20TBC
[r78-milestone]: https://github.com/snowplow/snowplow/milestones/Release%2078%20%5BKIN%5D%20Bird%20TBC
