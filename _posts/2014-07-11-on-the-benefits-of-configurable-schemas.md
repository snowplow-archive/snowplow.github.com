---
layout: post
shortenedlink: How configurable data models and schemas make digital analytics better
title: How configurable data models and schemas make digital analytics better
tags: [snowplow, json, json schema, redshift, iglu, schema, data model, configurable]
author: Yali
category: Analytics
---

Digital analysts don't typically spend a lot of time thinking about data models and data schemas. How data is modelled and schemaed, both at data collection time, and at data analysis time, makes an enormous difference to how easily insight and value can be derived from that data. In this post, I will explain why data models and schemas matters, and how the new version of Snowplow released ealier enables a fundamentally new approach to collecting and warehousing event data: one that enables companies to define and evolve their own data models and schemas.

![Image of something trying to squeeze into something into which it wont fit] [image-1]

1. [Why digital anaysts, product managers and marketers do not spend a lot of time thinking about data models and schemas today](#why-dont-people-think-about-data-models)
2. [Why data models and schemas matter](#why-data-models-and-schemas-matter)
3. [How the new version of Snowplow enables businesses to take a new approach to configuring and evolving their own data models and schemas](#snowplow-new-approach-to-data-modelling-and-schemas)
4. [Exploring how the new approach in Snowplow works in practice](#in-practice)

<h2><a href="why-dont-people-think-about-data-models">1. Why digital anaysts, product managers and marketers do not spend a lot of time thinking about data models and schemas today</a></h2>

There are a couple of reasons why people in the digital analytics ecosystem, especially on the commercial rather than technical side, do not spend a lot of time thinking about data models and schemas:

1. In many cases, the data model and schema are a given, dictated by the analytics tool used. Because it's not something that can be changed, there's not a lot of value in exploring alternative data models and schemas.
2. Data models and schemas are so fundamental to data analytics that it can be hard for anyone doing data analysis to step back from the data and abstract away the model from the data they're analysing, or consider how the analysis would look different if the model were different. (The same way that it's hard to step back from our own thoughts and critically evaluate the impact of language in enabling and constraining the way we think.)


<h2><a href="why-data-models-and-schemas-matter">2. Why data models and schemas matter</a></h2>

1. [More efficient data capture](#efficient-data-capture)
2. [More productive data analysis](#productive-data-analysis)
3. [Simpler to use data to drive operational systems](#drive-operational-systems) 
4. [Plug leaky data pipelines](#plug-leaky-data-pipelines)
5. [Simpler management of your data warehouse as your business (and therefore data models and schemas) evolve](#warehouse-evolution)

<h3><a name="efficient-data-capture">2.1 More efficient data capture</a></h3>

Event data describes what has happened. If I run a app for a newspaper, for example, I might want to record that one of my readers has viewed a particular article. I could represent this event using the following data:

{% highlight json %}
{
	"timestamp": "2014-07-11 10:44:12",
	"user_id": "123",
	"action": "viewed_article",
	"article_id": "article_abc"
}
{% endhighlight %}

Although the above data is in JSON format, and JSON does not require us to declare an explicit schema, there is an implicit schema: in the above example we've described our event in terms of four fields: a timestamp to indicate when the event occurred, a user ID to indicate who performed the aciton, an action field to record what action was taken, and an article to indicate what item of content the action was performed on.

This feels like a very a decent data model. However, we might want to develop it. It's quite likely that my app, for example, already has a model for a 'user', and this includes many other fields aside from the `user_id` field. It might, for example, include:

* Whether the user has a subscription
* If the user is a subscriber, his / her subscription level
* The user's email address

<h3><a name="productive-data-analysis">2.2 More productive data analysis</a></h3>

<h3><a name="drive-operational-systems">2.3 Simpler to use data to drive operational systems</a></h3>

<h3><a name="plug-leaky-data-pipelines">2.4 Plug leaky data pipelines</a></h3>

<h3><a name="warehouse-evolution">2.5 Simpler management of your data warehouse as your business (and therefore data models and schemas) evolve</a></h3>


<h2><a name="">Snowplow now supports configurable schemas</a></h2>

Earlier this week, we released Snowplow 0.9.5. This enables our users take a fundamentally new approach to:

1. Defining their own 'event dictionaries' - the data models they use for capturing and storing event data
2. Processing and warehousing that data
3. Managing those data models (and associated schemas) over time


<h2><a name="">Why configurable schemas are transformational</a></h2>
