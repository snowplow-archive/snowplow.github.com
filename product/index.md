---
layout: page
group: product
title: Product
shortened-link: What is Snowplow?
description: Snowplow is an Event Analytics Platform. It delivers event line of your own, customer-level, event-level data, from all your channels, platforms and services, into your own structured data warehouse and unified log
weight: 1
permalink: /product/

---

<h1>The Event Data Pipeline</h1>

<p>There are two versions of the Snowplow event data pipeline:</p>
<p>
	<ol>
		<li><strong>Batch pipeline</strong>. Load your event-level data into your data warehouse to perform advanced analytics.</li>
		<li><strong>Real-time pipeline</strong>. Load your event-level data into your data warehouse, <em>and*</em> make that same data available to data-driven applications and dashboards in real-time.</li>
	</ol>
</p>
<p>Both pipelines follow the same high-level architecture:</p>
<p>
	<img src="img/snowplow-pipeline-schematic.png" />
</p>

<h2>The best event data pipeline</h2>

<h3>Track events from <em>anywhere</em></h3>

<p>Track events from your own applications using our extensive library of trackers...</p>

<p><img src="img/tracker-logos.png"></p>

<p>...track events from third party applictions via our webhook integrations.</p>

<p><img src="img/third-party-integrations.png"></p>


<h3>Enrich your data</h3>

<p>Extend your event-level data with additional data points from external data sources, including:</p>

<p><ul>
	<li>GeoIP lookups</li>
	<li>Referer parsing</li>
	<li>Useragent parsing</li>
	<li>Weather data</li>
	<li>Currency conversions</li>
	<li>Campaign / marketing data</li>
</ul></p>

<h3>Load your data where you need it</h3>

<p>Where your data lives has a big impact on what you can do with it. Snowplow supports loading your data into the following data stores out-of-the-box:</p>

<p><img src="img/storage-targets.png"/></p>

<h3>Process as many events as you want</h3>

<p>Snowplow is linearly scalable. Process billions of events per day on your own pipeline.</p>

<h3>Access your data <em>fast</em></h3>

<p>Your event data available to you in seconds.</p>

<h3><em>Trust</em> your data</h3>

<p><ul>
  <li>Fully auditable pipeline</li>
  <li>Snowplow is the <em>only</em> event data pipeline that reports volumes of data that <em>fail</em> to successfully process, so you can identify, diagnose and resolve data collection issues fast.</li>
</ul></p>

<h3>Own your data</h3>

<p>Your <em>own</em> data on your <em>own</em> data pipeline on your <em>own</em> AWS account.</p>

<h3>Stay current</h3>

<p>The Snowplow event data pipeline is architected so that it can evolve with you and your business, as:</p>

<p><ul>
  <li>The events you track change (because your business is always changing)</li>
  <li>The questions you ask of your data become more sophisticated</li>
</ul></p>

<h3>Open source</h3>

<p><ul>
	<li>Free</li>
	<li>1000s of users</li>
	<li>Active developer community</li>
</ul></p>

<p>Check us out on <a href="https://github.com/snowplow/snowplow">Github</a>.</p>

## Find out more

* [*Why* warehouse your digital event data?] [why-dwh]
* [*What* makes Snowplow the best datawarehousing solution for web, mobile and digital event data] [why-snowplow]
* [*Which* companies use Snowplow, and how they use it] [who]
* [*How* to get started with Snowplow] [get-started]


<div class="html">
	<a href="/get-started/index.html">
		<button class="btn btn-large btn-primary center-block" type="button">Get started</button>
	</a>
</div>


[why-dwh]: why-warehouse-your-data/
[why-snowplow]: the-best-event-data-warehouse/
[who]: who-uses-snowplow/
[get-started]: /get-started/
[amazon-logo]: /assets/img/APN_Standard_Technology_Partner.png
[trackers]: https://github.com/snowplow?utf8=%E2%9C%93&query=tracker
[webhooks]: /blog/2014/11/10/snowplow-0.9.11-released-with-webhook-support/

[unified-log-blog-post]: /blog/2014/01/20/the-three-eras-of-business-data-processing/
[kinesis]: http://aws.amazon.com/kinesis/
