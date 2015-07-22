---
layout: page
group: product
title: Product
shortened-link: What is Snowplow?
description: Snowplow is an Event Analytics Platform. It delivers event line of your own, customer-level, event-level data, from all your channels, platforms and services, into your own structured data warehouse and unified log
weight: 1
---
<!-- custom-header: product -->
<h1>Snowplow is an event analytics platform</h1>

Snowplow enables you to:

<div class="html">
	<ul>
		<li><strong><a href="#record-events">Record events from your website, mobile app, server side systems, third party systems and any type of connected device</a></strong> , so that you have a record of <em>what happened, when, and to whom</em></li>
		<li><strong><a href="#process-that-data">Processes that data</a></strong> including validating, enriching and modeling it</li>
		<li>Load that data into <strong><a href="#your-own-datawarehouse">your own datawarehouse</a></strong> to power <strong>sophisticted analytics</strong></li>
		<li>Makes that data available to <a href="#real-time">real-time data processing applications</a> via <a href="http://aws.amazon.com/kinesis/">Amazon Kinesis</a></li>
	</ul>
</div>


<img src="/assets/img/product/event-analytics-platform.png" style="margin-top:20px;margin-bottom:20px;"/>

<h2><a name="record-events">1. Record events from <em>anywhere</em></a></h2>

<img src="/assets/img/product/event-analytics-1-record-events.png" title="Snowplow record events" class="center-block" style="margin-top:20px;margin-bottom:20px;" />

Snowplow enables you to record rich, granular, event level data from your website, mobile applications, desktop applications, server-side systems and third party applications.

This data provides a record of everything that has occurred in your business, providing a solid foundation for building insight and using that for taking intelligent action.

Our [large library of open source trackers] [trackers] enable you to track and generate data from your own systems.

In addition, we support ingesting data from a growing number of third party providers via [webhooks] [webhooks].

<h2><a name="process-that-data">2. Structure, enrich and model that data</a></h2>

<img src="/assets/img/product/event-analytics-2-data-pipeline.png" title="Snowplow datapipeline - validate - enrich - and model" class="center-block"  style="margin-top:20px;margin-bottom:20px;" />

We do not simply let you collect and warehouse event-level data. We run a sophisticated data pipeline that:

1. Validates your data to ensure that it conforms the associated schemas. Unlike our competitors, we do not ignore malformed data - we provide it back to our users so they can address the issue at source and reprocess the data if necessary
2. Enriches the data. Our  enrichment framework enables us to perform dimension widening on captured data using third party data sets: for example, parsing and categorising referer, inferring device, browser and operating system information from useragents or locating users based on their IP addresses, for example
3. Models the data. As well as delivering event-level data for sophisticated analysis, we enable our users to model the data, including applying:
  * Identity stitching algorithms to figure out which events belong to a particular user, and aggregate over that user's data to create an update to date record for her in user-level table
	* Sessionize events - grouping events together into logic flows that correspond to specific user actions

<h2><a name="your-own-datawarehouse">3. Load the the data into your own data warehouse to power sophisticated analysis</a></h2>

<img src="/assets/img/product/event-analytics-3-warehouse-and-report.png" title="Snowplow datawarehouse and analysis" class="center-block" style="margin-top:20px;margin-bottom:20px;" />

We deliver your event-level data to you in **your own datawarehouse**. That gives the ability to:

1. Join your event-level data with other data sets, including customer data sets (e.g. CRM), marketing and campaign data (e.g. Adwords), product and merchandising data and financial data
2. Perform sophisticated analytics including
  * Customer / marketing analytics
	* Catalog / merchandising analytics
	* Product analytics
3. Develop predictive models

<h2><a name="real-time">4. Make that data available to real-time data processing applications via Amazon Kinesis</a></h2>

<img src="/assets/img/product/event-analytics-4-data-driven-applications.png" title="Snowplow data driven applications with Amazon Kinesis" class="center-block" style="margin-top:20px;margin-bottom:20px;" />

Snowplow is your company's digital nervous system. We can deliver your event-level data to an Amazon Kinesis stream, so that you can build data-driven applications that consume that data and take intelligent decisions based on it.

Your data scientists can build models based on the complete historical data set in the Snowplow datawarehouse, and then put those models live on the data coming in production.

Just think about what that makes possible.


## Find out more

* [*Why* warehouse your digital event data?] [why-dwh]
* [*What* makes Snowplow the best datawarehousing solution for web, mobile and digital event data] [why-snowplow]
* [*Which* companies use Snowplow, and how they use it] [who]
* [*How* to get started with Snowplow] [get-started]

## Ready for Snowplow?

<div class="html">
	<a href="/get-started/index.html">
		<button class="btn btn-large btn-primary center-block" type="button">Get started</button>
	</a>
</div>


[why-dwh]: why-warehouse-your-data.html
[why-snowplow]: the-best-event-data-warehouse.html
[who]: who-uses-snowplow.html
[get-started]: /get-started/index.html
[amazon-logo]: /assets/img/APN_Standard_Technology_Partner.png
[trackers]: https://github.com/snowplow?utf8=%E2%9C%93&query=tracker
[webhooks]: /blog/2014/11/10/snowplow-0.9.11-released-with-webhook-support/

[unified-log-blog-post]: /blog/2014/01/20/the-three-eras-of-business-data-processing/
[kinesis]: http://aws.amazon.com/kinesis/
