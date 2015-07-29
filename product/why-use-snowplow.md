---
layout: page_old
group: product
title: Why use Snowplow?
shortened-link: Why use Snowplow?
description: Snowplow enables you to answer the high value questions that drive your bottom line - questions that require very bespoke, company-specific analysis and rich customer-level and event-level data
weight: 12
---

# Why use Snowplow?

## 1. Answer the questions that matter to your business

Snowplow helps you answer the difficult questions that really matter to your business. Questions like:

* What are the events in a user's lifetime that are predictive of value?
* Where should we invest in our product and service?
* Where should I spend my marketing dollars?
* How do my different products / content items / brands / authors / labels performs, in terms of attracting, engaging and monetizing users?

Answering questions like these involves performing highly bespoke, [business-specific analysis](#types-of-analysis) on very detailed, granular data. Snowplow makes it possible to do that, by enabling you to:

* Directly query your event-level data in a [structured data warehouse](#structured-data-warehouse)
* Plug in [*any* analytics tool](#any-analysis-tool) to visualize, interrogate and model that data
* Join your event-level, customer-level data with [*any* other data set](#join-your-data)

<h3 id="structured-data-warehouse">1.1 Your data in your own structured data warehouse</h3>

Snowplow delivers your data into your own structured datawarehouse, on [Amazon Redshift] [redshift], [PostgreSQL] [postgres] or [HDFS] [hdfs].

* At least one line of data for every single event
* Straightforward table structure optimized for easy querying
* Each variable associated with that event available as a specific column to include directly in a query
* Customizable schema so you can define the events that mean something to your business, and the data points that you want to associate with each of those events

<h3 id="any-analysis-tool">1.2 Analyse your data with <em>any</em> analysis tool</h3>

By delivering your data to you in your own [Redshift] [redshift] or [PostgreSQL] [postgres] database, you have the ability to plug in *any* tool to analyze that data, including:

* Business Intelligence tools like [Looker][looker], [Sisense][sisense] and [Tableau][tableau]
* Advanced statistical and analysis tools like [R][r], [Python][python] and [SAS][sas]
* General purpose analytics tools like [Excel][excel] and Google Spreadsheets

<h3 id="join-your-data">1.3 Join your data with <em>any</em> relevant data set</h3>

Because Snowplow delivers you granular, event-level data, in your own data warehouse, with all the relevant associated data points, you can join that data with your other data sets, including:

* Ad server data, so you can track not just what ads a user has seen, but their subsequent on-site behaviour
* CMS data, so you can perform rich analysis on the types of content a user has consumed, and use it to segment audience
* CRM data, so you can develop behavioral segments
* Email marketing data, so you can track what emails each user has received and their subsequent on-site behaviour
* Merchandise data, so you can analyse the types of products that your users have viewed, added to basket and purchased

<h3 id="types-of-analysis">1.4 Perform the high value analytics that drives your bottom line</h3>

Businesses use Snowplow to perform a vast array of complex analytics including:

* Measuring and forecasting [customer lifetime value][clv]
* Developing and applying [attribution models][attribution]
* Performing [merchandise anaytics][merchandise]
* Understanding the supply-demand dynamics on two-sided marketplaces
* Understanding inter-network dynamics in social networks
* Segmenting audience based on their behaviour

## 2. Action your data in real-time

Snowplow doesn't just help you drive more insight from your data. By publishing your data into a unified log in real-time, it enables you to use it in real-time, data-driven applications.

## 3. Ready for Snowplow?

<div class="html">
	<a href="/index/get-started.html">
		<button class="btn btn-large btn-primary" type="button">Get started</button>
	</a>
</div>

[clv]: /analytics/customer-analytics/customer-lifetime-value.html
[attribution]: /analytics/customer-analytics/attribution.html
[merchandise]: /analytics/catalog-analytics/overview.html
[redshift]: http://aws.amazon.com/redshift/
[postgres]: http://www.postgresql.org/
[hdfs]: http://hadoop.apache.org/docs/r1.2.1/hdfs_design.html
[looker]: http://looker.com/
[sisense]: http://www.sisense.com/
[tableau]: http://www.tableausoftware.com/
[r]: http://cran.r-project.org/
[python]: http://pydata.org/
[sas]: http://www.sas.com/en_us/software/analytics.html
[excel]: http://office.microsoft.com/en-gb/microsoft-excel-2013-spreadsheet-software-try-or-buy-FX010048762.aspx
