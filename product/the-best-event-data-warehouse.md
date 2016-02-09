---
layout: page
group: product
subgroup: the best data warehousing platform
title: What makes Snowplow the best web and mobile datawarehousing platform
shortened-link: The best web and mobile datawarehouse
description: Snowplow  is the best platform for warehousing your event (including web and mobile data).
permalink: /product/the-best-event-data-warehouse/
redirect_from:
  - /product/the-best-event-data-warehouse.html
weight: 3
---

# What makes Snowplow the best web and mobile datawarehousing platform?

1. [Your own data warehouse in your own AWS account](#your-own-datawarehouse)
2. [Rich and flexible data schemas](#rich-and-flexible-data-schemas)
3. [Fast](#fast)
4. [Easy](#easy)
5. [Cost effective](#cost-effective)
6. [Ingest events from *anywhere*](#ingest-events-from-anywhere)
7. [Multiple database types supported](#multiple-storage-targets-supported)
8. [Replay and reprocess your entire event history](#replay-and-reprocess)
9. [Open source](#open-source)


<h2><a name="your-own-datawarehouse">1. Your own data warehouse in your own AWS account</a></h2>

<img src="/assets/img/product/own-datawarehouse.png" class="center-block" />

We process your data in your own AWS account and we deliver your data to you in your own AWS account. That means:

1. You have total ownership and control over your data
2. You can load any other data sets into your own Redshift cluster to join with your Snowplow data

<h2><a name="rich-and-flexible-data-schemas">2. Rich <em>and</em> flexible data schemas</a></h2>

<img src="/assets/img/product/rich-and-flexible-data-schemas.png" class="center-block" />

Snowplow let's you define and evolve the data schema to fit your business, rather than fitting your business to our data schema.

As a Snowplow user, you can extend the Snowplow data model to encompass as many different event and entity types as you want. Data points from different event and entity types are loaded into their own tidy tables, rather than being squahed into several hundred custom dimensions and measures.

You can also evolve your schemas over time, including making 'breaking' changes to the schemas (where old data does not conform to the new schema). Snowplow has a sophisticated, elegant approach to schema migration, that means whatever changes you make to your schema, your complete data set (from before and after schema updates) is always available for querying.

<h2><a name="fast">3. Fast</a></h2>

<img src="/assets/img/product/fast.png" class="center-block" />

Your data is warehoused faster in Snowplow than in competing solutions:

1. Our batch-based pipeline can be run hourly, so that data lands within 1-2 hours of the associated event occuring
2. Our real-time pipeline warehouses event-data within seconds of the event occuring

<h2><a name="easy">4. Easy</a></h2>

<img src="/assets/img/product/easy.png" class="center-block" />

We can setup the Snowplow pipeline within a day, and run it for you, as part of our Managed Service. All you have to do is figure out what you want to do with all that data.

<h2><a name="cost-effective">5. Cost effective</a></h2>

<img src="/assets/img/product/cost-effective.png" class="center-block" />

We charge a flat $1250 per month for our Managed Service, regardless of the volume of data you process, making us orders of magnitude cheaper than our competitors.

<h2><a name="ingest-events-from-anywhere">6. Ingest events from <em>anywhere</em></a></h2>

<img src="/assets/img/product/ingest-data-from-anywhere.png" class="center-block" />

As well as support for tracking web events via our Javascript tracker, and mobile app events from our iOS and Android tracker, we offer an [enormous range of trackers] [tracker] and support for [3rd party webhooks] [webhooks]. There are retailers, for example, using Snowplow to track:

* Events on their website (both client and server side)
* Events in their mobile application
* Email send, received, open and click through
* Ad impressions
* Item dispatches (from the warehouse)
* Item returns (both requests and actual returns received in the warehouse)
* Stock movements (in and out of the warehouse)

<h2><a name="multiple-storage-targets-supported">7. Multiple database types supported</a></h2>

<img src="/assets/img/product/multiple-storage-targets-supported.png" class="center-block" />

We support loading your data into both [Amazon Redshift] [redshift] for ad hoc and deep analytics, and [Elasticsearch] [elasticsearch] for real-time dashboards.

<h2><a name="replay-and-reprocess">8. Replay and reprocess your entire event history</a></h2>

<img src="/assets/img/product/replay.png" class="center-block" />

Because the Snowplow pipeline is built in a linearly scalable way, and runs on Amazon's elastic infrastructure, it is possible to rerun and reprocess your entire event-history, however many billions of events have been recorded.


<h2><a name="open-source">9. Open source</a></h2>

<img src="/assets/img/product/github.png" class="center-block" />

* Our codebase is available on [Github] [snowplow-github]
* No 'black-boxes' in your data processing. We are completely transparent about how your data is handled
* No lock-in. All your data is on your own infrastruture. All the code base is available to you under the [Apache 2 License][apache-2]

## Interested?

* Find out [who uses Snowplow today] [users]
* [Get started using Snowplow] [get-started]

[elasticsearch]: https://www.elastic.co/
[redshift]: http://aws.amazon.com/redshift/
[snowplow-github]: https://github.com/snowplow/
[apache-2]: https://www.apache.org/licenses/LICENSE-2.0
[trackers]: https://github.com/snowplow/?utf8=%E2%9C%93&query=tracker
[tracker]: https://github.com/snowplow/?utf8=%E2%9C%93&query=tracker
[webhooks]: /blog/2014/11/10/snowplow-0.9.11-released-with-webhook-support/

[users]: who-uses-snowplow.html
[get-started]: /get-started/index.html
[real-time]: snowplow-realtime.html
