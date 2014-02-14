---
layout: page
group: services
title: Snowplow Professional Services - setting up and configuring Snowplow for you
shortened link: Snowplow Implementation
description: We help clients get up and running with Snowplow as quickly as possible
weight: 2
---

# Snowplow Implementation

There are three ways to get started with Snowplow:

1. [Setup a trial account] [trial]. Get in touch with the Snowplow team: we will set you up with a trial account to experiment with Snowplow.
2. [Use our setup guide] [setup], download Snowplow and set it up yourself.
3. [Work with the Snowplow Professional Services] (#pro-services) team to implement Snowplow 

<a name="pro-services"><h2>How the Snowplow Professional Services team support clients implementing Snowplow</h2></a>

Our professional services team works with clients in a variety of different ways to support them implementing Snowplow. At one end of the spectrum this can include high level advice and support. At the other, we can perform the implementation ourselves, on your own AWS account. We offer:

1. [Javascript implementation guides] (#js-guide)
2. [Tag management and dataLayer setup] (#tag-management)
3. [Snowplow infrastructure setup on AWS] (#setup-infrastructure)
4. [Snowplow data pipeline audits] (#audit)
5. [Advice on joining Snowplow data with 3rd party data sets](#join)
6. [Dashboards and data cubes on top of Snowplow data] (#reporting)

[Get in touch] [get-in-touch] to discuss your requirements with us. We will put together a bespoke proposal to suit your companies needs.

<a name="js-guide"><h3>1. Javascript implementation guides</h3></a>

One of the things that makes Snowplow different to other web and event analytics platforms is that it enables you to capture *every* event on your website, not just the ones that are designated as *important* in advance. Getting the most out of Snowplow means properly instrumenting Snowplow tags to track every event (rather than just page views and transactions, for example). We work with clients to ensure that they setup Snowplow to track *all user actions* on their websites.

The Snowplow team can work with you to produce a comprehensive Javascript implementation guide. This is an 4 stage process:

1. Reviewing your website / application to understand all the potential user actions at every point in a user's customer journey
2. Understand what the key data points and meta data to capture at each event
3. Review the data sets you want to join Snowplow data on, in order to ensure that data points are captured that enable those joins to be reliably made at the analysis phase
4. Specifying the what tags to integrate and what rules to trigger the firing of the tags to capture the required data.

<a name="tag-management"><h3>2. Tag management and dataLayer setup</h3></a>

We recommend new Snowplow users implement a tag management solution before or as part of a Snowplow implementation, and can support clients selecting and integrating a tag manager, including crucially setting up the dataLayer correctly to ensure all data is available to pass onto Snowplow (and any other required tags).

<a name="setup-infrastructure"><h3>3. Setup the Snowplow infrastructure on AWS</h3></a>

We can setup and run the Amazon Web Services and associated infrastructure necessary for Snowplow on your own AWS account. 

<a name="audit"><h3>4. Snowplow data pipeline audits</h3></a>

Rather than have us setup your Snowplow infrastructure for you, you can setup Snowplow yourself, and we can audit it afterwards to ensure full integrity of your data pipeline from data generation in the tracker to collection and analysis in Amazon S3 / Redshift.

<a name="join"><h3>5. Advice on joining Snowplow data with 3rd party data sets</h3></a>

One common requirement for Snowplow users is to join Snowplow data sets with other data sets including marketing data (ad server, display network, PPC network e.g. Adwords, affiliate networks), customer data sets (e.g. from CRM systems), catalog data (e.g. from CMS systems) and financial systems (e.g. from ERP systems).

There are a number of ways to integrate Snowplow data with 3rd party data sets, including feeding the 3rd party data into Snowplow via the tracker protocol or joining the data sets in Amazon Redshift. 

The Snowplow team can advise on the optimal strategy for joining data based on your reporting requirements and type and nature of the data you wish to join.

<a name="reporting"><h2>6. Dashboards and data cubes on top of Snowplow data</h2></a>

We can design and deliver [reports, cubes and dashboards] [kpi] specific to your needs on top of Snowplow data, using the analytics tools and technologies you prefer.


## Sounds interesting?

[Get in touch] [get-in-touch] with the Snowplow team to discuss your project.


[trial]: /product/get-started.html#trial
[setup]: https://github.com/snowplow/snowplow/wiki/Setting-up-Snowplow
[get-in-touch]: /about/index.html
[analytics]: analytics.html
[implementation]: implementation.html
[custom-dev]: custom-development.html

[event-tracking]: https://github.com/snowplow/snowplow/wiki/Integrating-Snowplow-into-your-website#wiki-events
[bespoke-reports]: reporting.html
[custom-dev]: custom-development.html
[repo]: https://github.com/snowplow/snowplow
[kpi]: reporting.html
