---
layout: post
title: Help us build out the Snowplow Event Model
tags: [snowplow, event model, data model, data schema, structured, unstructured]
author: Yali
category: Inside the Plow
---

At its beating heart, Snowplow is a platform for capturing, storing and analysing event-data, with a real focus on web event data.

Working out how best to structure the Snowplow event data is key to making Snowplow a success. One of the things that has surprised us, since we started working on Snowplow, is the extent to which our view of the best way to structure that data has changed over time.

In this blog post, we outline our vision for the Snowplow event data model. We do so to elicit feedback and invite collaboration with the wider Snowplow community. Developing a data model that will work well for **everyone** will only be possible with input from a broad set of people from a wide range of companies performing analytics on a wide range of businesses. We've been fortunate to work with a wide range of businesses who've helped shape our thinking so far. We hope to talk to many more to help us on our journey to develop the Snowplow Event Model.

<!--more-->

## From page views to events - a quick look back at the development of the web

Before we get started thinking about the Snowplow event data model, it is helpful to put it in the context of how other web analytics tools model web data, and that in the context of the development of the web.

When the web started out, it was a network of largely static documents that were hyperlinked to one-another. Over time the documents started updating more rapidly, so looked less static. In addition, the development of Flash and then Javascript meant that web pages became more interactive: websites started to look more like interactive applications and less like documents.

The web analytics industry was born in the 1990s, when the web was still a network of hyperlinked documents. The primary "event" that web analytics programmes were interested a _hit_, which referred to a request being made to a web server. (As such, it was more of an "event" for the sysadmin than the user navigating the website.) Over time this evolved into the _page view_ - as loading a web pages with multiple elements (e.g. different images) would result in multiple hits. Web analytics packages excelled at tracking _page views_. As online retail took off, they extended to capturing transactions, and most recently, social events (e.g. _liking a product_).

As a user, there are millions of things you can do on the web: from checking your bank balance, to messaging a friend, to researching a holiday, to sharing photos of your children. Web analytics packages, however, still only recognise a very small subset of events. To go beyond tracking _page views_ and _transactions_, web analysts have to use custom event tracking (in Google Analytics), or an unholy combination of eVars and sProps (in SiteCatalyst).

We want to do better with Snowplow. We want to identfy a broad set of events that are useful to a wide range of web analysts across different companies and products, and recognise these in the Snowplow Event Model as first class citizens. We want to design the data structures for these events so that there are named fields to capture the dimensions and metrics for those events that meet the needs of 80% of Snowplow users, and a set of configurable dimensions and metrics to meet the needs of the remaining 20%. Similarly, we recognise that those "1st class" events might only meet the needs of 80% of the events that people need to track online, and so we will still need generic "custom events" for users to configure to track the rest.

By writing this blog post, we hope to entice readers like you to contribute to that Event Model.

## Why bother with an Event Model at all?

Some of the people we have talked to about the Snowplow Event Model have not been convinced of the need to develop one. These people, who are typically very familiar with NoSQL datastores like Mongo, Riak and Cassandra, sometimes argue that we can do away with a formal model all together and simply stuff a JSON with whatever dimensions and metrics suit, when we come to store the data associated with a specific event.

NoSQL data stores are attractive because they enable users to store data without worrying about a schema. However, that does not mean we can forget about schemas all together: we still need a schema when it comes to querying the data, in order to drive our analysis. Performing even simple OLAP analysis on data in NoSQL stores is significantly harder than on structured data in columnar databases, because we have to work out a schema as part of the analysis. Not only that: but we have to check individual event-level data to test if the dimensions and metrics we're exploring using our OLAP analysis are correctly stored for every event we want to explore, and potentially map different fields together to include all the events that we would like. (If this is even possible.) This makes analysis much more involved and complex.

Sometimes, this complexity is worth it: if our data structures are evolving so fast that any schema we develop today will be redundant tomorrow - then better to collect the data that's available today and work out how to query it another day, then over complicate our data collection by forcing the data into a schema it doesn't really fit.

That is not the situation that we are in when it comes to web data, however. With a bit of thought, it is not too difficult to identify a set of events that are meaningful for a wide range of people, and a set of dimensions and metrics that are relevant for each event type. By standardising these in a Event Model, we can develop a standard set of analyses that anyone collecting data which adheres to the model can apply. As an open source community committed to driving innovation in web event analytics, this will make it easier to work collaboratively to develop new approaches to mining web data to learn new and valuable insights.

## The Snowplow Event Model: first class events identified so far

So far, we have identified the following events as ones we wish to identify as first class citizens. (Some of these are already incorporated in Snowplow as first class citizens, others need to be added.)

* Page views
* Page pings (i.e. a user reading through content on a page)
* Link clicks
* Ad impressions
* Online transactions
* Social events
* Item views (e.g. viewing a product on a retailer site, or viewing an article on a news site)
* Errors (e.g. an application returning an error)

For each of these events, we expect there to be some specific dimensions and metrics that are likely to be captured. In addition, we need to make it possible for users with particular needs to record their own custom dimensions and metrics associated with those specific events. We have detailed the event-specific fields for each of the above 1st class events on the [Canonical Event Model] [canonical-event-model] page on the [wiki] [wiki].

Are there other events that we should add to the above list? Are their fields we should add to any of the specific events listed above? Let us know if so :-).

In addition to the events explicitly recognised by the Event Model, there are likely to be many events that need to be tracked that are not included in the above list. For most of these, we hope that Snowplow users will store them as [custom structured events] [struct-events]. Where this is not possible, we plan to enable capturing of [custom unstructured events] [unstruct-events], so our friends who like their NoSQL technologies can create whatever JSONs they like to store their event data in.

## Technical implications of expanding out the event model

Currently, Snowplow events data is stored in a single 'fat' table in either S3 or Infobright. As we build out the number of events that are explicitly included in the event model, along with their associated fields, the table will have to get wider to accommodate those new fields. Clearly, there are implications to doing so - especially as a single row of data, which represents a single event, will only have a subset of those fields populated. (Those that are relevant for the specific event.)

This is one of the reasons we plan to the storage format of data stored in S3 from the current flat-file structure into [Avro] [avro]. There are a number of other benefits associated with migrating to Avro - these will be explored in a forthcoming blog post.

We also plan to make the StorageLoader that loads data into Infobright configurable, so that it only loads fields related to events that the particular business is interested in. If, for example, you do not serve ads to your users, than you will not track ad impressions served. It therefore makes no sense to devote 5 or 6 columns in Infobright to fields which only relate to ad impression tracking like `campaign_id`, `advertiser_id` etc. Upgrading the StorageLoader so that it understands that is a priority moving forwards.

## Help us build out the Event Model

A lot about big data is sexy. Unfortunately, data modelling is not. Nonetheless, getting it right will be a huge benefit to the whole Snowplow community and by extension the wider web analytics community. Help us to get it right - by:

* Posting ideas and feedback on this blog post
* Raising ideas / issues on [Github] (https://github.com/snowplow/snowplow/issues). (Like the [original suggestion] (https://github.com/snowplow/snowplow/issues/113) from [Robert Kingston] (https://github.com/kingo55) to track [item views](https://github.com/snowplow/snowplow/issues/113))
* [Get in touch with us directly] [contact] to share your thoughts and ideas

[canonical-event-model]: https://github.com/snowplow/snowplow/wiki/canonical-event-model
[struct-events]: https://github.com/snowplow/snowplow/wiki/canonical-event-model#wiki-customstruct
[wiki]: https://github.com/snowplow/snowplow/wiki
[unstruct-events]: https://github.com/snowplow/snowplow/wiki/canonical-event-model#wiki-customunstruct
[avro]: http://avro.apache.org/
[contact]: /about/index.html
