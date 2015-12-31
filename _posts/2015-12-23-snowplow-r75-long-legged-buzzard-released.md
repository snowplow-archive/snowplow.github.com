---
layout: post
title-short: Snowplow 75 Long-Legged Buzzard
title: Snowplow 75 Long-Legged Buzzard released with support for UrbanAirship Connect and SendGrid
tags: [snowplow, webhook, sendgrid, urbanairship]
author: Ed
category: Releases
---

We are pleased to announce the immediate availability of [Snowplow 75 Long-Legged Buzzard][snowplow-release]. For the first time you'll now be able to use UrbanAirship Connect and SendGrid as event sources.

![R75 Long-Legged Buzzard](/assets/img/blog/2015/12/long-legged_buzzard.jpg)

* **SendGrid** - for tracking email and email-related events delivered by [SendGrid][SendGrid-website]
* **UrbanAirship Connect** - for tracking mobile app events from [UrbanAirship][urbanairship-website]

Here are the sections after the fold:

1. [UrbanAirship Connect webhook support](/blog/2015/12/23/snowplow-r75-long-legged-buzzard-released/#urbanairship)
2. [SendGrid webhook support](/blog/2015/12/23/snowplow-r75-long-legged-buzzard-released/#SendGrid)
3. [Updated data model](/blog/2015/12/23/snowplow-r75-long-legged-buzzard-released/#datamodel)
4. [Upgrading](/blog/2015/12/23/snowplow-r75-long-legged-buzzard-released/#upgrading)
5. [Roadmap and contributing](/blog/2015/12/23/snowplow-r75-long-legged-buzzard-released/#roadmap-etc)
6. [Documentation and help](/blog/2015/12/23/snowplow-r75-long-legged-buzzard-released/#help)

<!--more-->

<h2 id="urbanairship">1. UrbanAirship Connect webhook support</h2>

The UrbanAirship Connect webhook adapter in [Snowplow 75 (Long-Legged Buzzard)][snowplow-release] lets you track mobile app events delivered by [UrbanAirship Connect][urbanairship-website].
Using this functionality you can warehouse all mobile app events alongside your existing Snowplow events.

For help setting up UrbanAirship Connect support, see the [UrbanAirship Connect webhook setup][urbanairship-setup] wiki page.

For technical details on this adapter, see the [UrbanAirship Connect webhook adapter][urbanairship-tech-docs] wiki page.

<h2 id="SendGrid">2. SendGrid webhook support</h2>

The SendGrid webhook adapter lets your track email related events reported by [SendGrid][SendGrid-website]. It's great for keeping track of your email campaigns, allowing you to see which emails generate the most interest.  

For help setting up SendGrid support, see the [SendGrid webhook setup][SendGrid-setup] wiki page.

For technical details on this adapter, see the [SendGrid webhook adapter][SendGrid-tech-docs] wiki page.

<h2 id="datamodel">3. Updated data model</h2>

[Bernardo Srulzon](https://github.com/bernardosrulzon) contribued an update to one of our SQL data models: [web-recalculate](https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/sql/web-recalculate). The updated data model is more efficient and now creates a cookie-ID-to-user-ID map. Thanks Bernardo!

<h2 id="upgrading">4. Upgrading</h2>

<div class="html">
<h3 id="configuring-emretlrunner">4.1 Updating EmrEtlRunner's configuration</h3>
</div>

This release bumps the Hadoop Enrichment process to version **1.5.0**.

In your EmrEtlRunner's `config.yml` file, update your Hadoop enrich job's version to 1.5.0, like so:

{% highlight yaml %}
  versions:
    hadoop_enrich: 1.5.0 # WAS 1.4.0
{% endhighlight %}

For a complete example, see our [sample `config.yml` template][emretlrunner-config-yml].

<div class="html">
<h3 id="upgrading-change-form">4.2 Redshift</h3>
</div>

You'll need to deploy the Redshift tables for any webhooks you plan on ingesting into Snowplow. You can find the Redshift table deployment instructions on the corresponding webhook setup wiki pages:

* [SendGrid webhook Redshift setup][SendGrid-setup-red]
* [UrbanAirship Connect webhook Redshift setup][ua-setup-red]

<h2 id="roadmap-etc">5. Roadmap and contributing</h2>

We welcome any contributions of webhook adapters for other services - for details on getting started, please see [How to integrate a webhook into Snowplow][webhook-contributing]. Please note that contributing will require some experience in Scala at this time.

Similarly, if you would like to sponsor the Snowplow team to build a webhook adapter, do [get in touch][sponsorship-contact]!

Upcoming releases are:

* [Release 76 Bird TBC][r76-milestone], which will refresh our EmrEtlRunner app, including updating Snowplow to using the EMR 4.x AMI series
* [Release 77 Bird TBC][r77-milestone], which will bring the Kinesis pipeline up-to-date with the most recent Scala Common Enrich releases. This will also include click redirect support in the Scala Stream Collector

Note that these releases are always subject to change between now and the actual release date.

<h2 id="help">6. Documentation and help</h2>

Documentation relating to the new webhook support is available on the wiki:

* [Setting up a webhook][webhook-setup]
* [Technical documentation on webhooks][webhook-tech-docs]

As always, if you do run into any issues or don't understand any of the new features, please [raise an issue][issues] or get in touch with us via [the usual channels][talk-to-us].

For more details on this release, please check out the [R75 Release Notes][snowplow-release] on GitHub.

[webhooks-defn]: http://en.wikipedia.org/wiki/Webhook

[urbanairship-website]: http://www.urbanairship.com/
[SendGrid-website]: http://www.sendgrid.com/

[snowplow-trackers]: http://snowplowanalytics.com/technology/index.html

[webhook-setup]: https://github.com/snowplow/snowplow/wiki/Setting-up-a-Webhook

[urbanairship-setup]: https://github.com/snowplow/snowplow/wiki/UrbanAirship-webhook-setup

[SendGrid-setup]: https://github.com/snowplow/snowplow/wiki/SendGrid-webhook-setup

[webhook-tech-docs]: https://github.com/snowplow/snowplow/wiki/Snowplow-technical-documentation#1b-webhooks

[urbanairship-tech-docs]: https://github.com/snowplow/snowplow/wiki/UrbanAirship-webhook-adapter
[SendGrid-tech-docs]: https://github.com/snowplow/snowplow/wiki/SendGrid-webhook-adapter

[webhooks-2]: https://github.com/snowplow/snowplow/milestones/Webhooks%202

[webhook-contributing]: https://github.com/snowplow/snowplow/wiki/How-to-integrate-a-webhook-into-Snowplow
[sponsorship-contact]: mailto:contact@snowplowanalytics.com
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[snowplow-release]: https://github.com/snowplow/snowplow/releases/r75-long-legged-buzzard

[SendGrid-setup-red]: https://github.com/snowplow/snowplow/wiki/SendGrid-webhook-setup#22-redshift
[ua-setup-red]: https://github.com/snowplow/snowplow/wiki/UrbanAirship-webhook-setup#22-redshift

[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample

[r76-milestone]: https://github.com/snowplow/snowplow/milestones/Release%2076%20%5BCLI%5D%20Bird%20TBC
[r77-milestone]: https://github.com/snowplow/snowplow/milestones/Release%2077%20%5BKIN%5D%20Bird%20TBC
