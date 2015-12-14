---
layout: post
title: How configurable data models and schemas make digital analytics better
tags: [snowplow, json, json schema, redshift, iglu, schema, data model, configurable]
author: Yali
category: Analytics
---

![Image of something trying to squeeze into something into which it wont fit] [image1]

Digital analysts don't typically spend a lot of time thinking about data models and schemas. How data is modelled and schema'd, both at data collection time, and at analysis time, makes an enormous difference to how easily insight and value can be derived from that data. In this post, I will explain why data models and schemas matter, and why being able to define your own event data model in Snowplow is a much better approach than squeezing your data into the standard schemas provided by [Adobe] [adobe] and [Google Analytics] [google].

1. [Why digital anaysts, product managers and marketers do not spend a lot of time thinking about data models and schemas today](/blog/2014/07/11/on-the-benefits-of-configurable-schemas/#why-dont-people-think-about-data-models)
2. [Why data models and schemas matter](/blog/2014/07/11/on-the-benefits-of-configurable-schemas/#why-data-models-and-schemas-matter)
3. [Snowplow now supports configurable schemas](/blog/2014/07/11/on-the-benefits-of-configurable-schemas/#snowplow-supports-configurable-schemas)

<!--more-->

<h2><a name="why-dont-people-think-about-data-models">1. Why digital anaysts, product managers and marketers do not spend a lot of time thinking about data models and schemas today</a></h2>

There are a couple of reasons why people in the digital analytics ecosystem, especially on the commercial rather than technical side, do not spend a lot of time thinking about data models and schemas:

1. In many cases, the data model and schema are a given, dictated by the analytics tool used. Because it's not something that can be changed, there's not a lot of value in exploring alternative data models and schemas
2. Data models and schemas are so fundamental to data analytics that it can be hard for anyone doing data analysis to step back from the data and abstract away the model from the data they're analysing, or consider how the analysis would look different if the model were different. (The same way that it's hard to step back from our own thoughts and critically evaluate the impact of language in enabling and constraining the way we think)

<h2><a name="why-data-models-and-schemas-matter">2. Why data models and schemas matter</a></h2>

Having the 'right' data model and schema matters, because it enables:

1. [More efficient data capture](#efficient-data-capture)
2. [More productive data analysis](#productive-data-analysis)
3. [Simpler use of data to drive operational systems](#drive-operational-systems)
4. [Less leakage from the data pipelines](#plug-leaky-data-pipelines)
5. [Simpler management of your data warehouse as your business (and therefore data models and schemas) evolve](#warehouse-evolution)

<h3><a name="efficient-data-capture">2.1 More efficient data capture</a></h3>

Event data describes what has happened. If I run a newspaper app, for example, I might want to record that one of my readers has viewed a particular article. I could represent this event using the following data:

{% highlight json %}
{
	"timestamp": "2014-07-11 10:44:12",
	"user_id": "123",
	"action": "viewed_article",
	"article_id": "article_abc"
}
{% endhighlight %}

In the above example we've described our event in terms of four fields: a timestamp to indicate when the event occurred, a user ID to indicate who performed the aciton, an action field to record what action was taken, and an article to indicate what item of content the action was performed on.

This feels like a decent data model. However, we might want to develop it. It's quite likely that my app, for example, already has a model for a 'user', and this includes many other fields aside from the `user_id` field. It might, for example, include:

* Whether the user has a subscription
* If the user is a subscriber, his / her subscription level
* The user's email address
* The user's Twitter ID

Our application might already have a data model for users, and it might look like this:

{% highlight json %}
"user": {
	"user_id": "123",
	"subscriber": true,
	"subscription_level": "gold",
	"twitter_handle": "handle_123",
	...
}
{% endhighlight %}

Similarly, our application might interface directly with a CMS that stores all the different articles, and that CMS already has a well developed data model to describe the article, e.g.:

{% highlight json %}
"article": {
	"article_id": "article_abc",
	"title": "Germany to face Argentina in World Cup final",
	"category": "sport",
	"sub_category": "football",
	"author": "sports_writer_456",
	"published_date": 2014-07-11,
	"canonical_url": "sports.newspapersite.com/2014/07/11/germany-to-face-argentina-in-world-cup-final.html",
	...
}
{% endhighlight %}

From a data collection point of view, the most straightforward thing to do is to pass the data, as it is already structured in the app / CMS, directly into the analytics system. In Snowplow, we would pass the data in, broadly speaking, using the following format:

{% highlight json %}
{
	"timestamp": "2014-07-11 10:44:12",
	"event": "viewed_article",
	"context": {
		"user": {
			"user_id": "123",
			"subscriber": true,
			"subscription_level": "gold",
			"twitter_handle": "handle_123",
			...			
		},
		"article": {
			"article_id": "article_abc",
			"title": "Germany to face Argentina in World Cup final",
			"category": "sport",
			"sub_category": "football",
			"author": "sports_writer_456",
			"published_date": 2014-07-11,
			"canonical_url": "sports.newspapersite.com/2014/07/11/germany-to-face-argentina-in-world-cup-final.html",
			...
		}
	}
}
{% endhighlight %}

This contrasts with the situation in analytics systems like Google Analytics and Adobe Analytics (SiteCatalyst), where you have to map the different attributes of your different objects (in this case your user and article object) into a set of a long list of custom dimension, sProp or eVar fields.

Both GA and Adobe Analytics force you to transform your data into a different schema to ingest into the analytics system. That means creating and maintaining a mapping layer between your application and your analytics system, with its own internal logic. This introduces both complexity and fragility into your data pipeline. Having an analytics system that lets you pass data as it is already modelled, so without needing to transform the data, is faster and more robust.

<h3><a name="productive-data-analysis">2.2 More productive data analysis</a></h3>

Having the data model in your analytics system match the data model and schema you use in your application does not just help with data collection: it also makes data analysis much easier. That's because the closer the data model is to your mental model of the data, the easier it is to reason about and the faster we can query and compute on the data. Crucially, we minimize the time spent transforming the data from a format that the analytics system can cope with to one that corresponds with our mental model, freeing us up to actually do useful stuff with the data.

The above assumes, of course, that the way the data is modelled in our application code is close to the way we model the data in our heads. This is nearly always the case: after all, the developers that built and maintain the application will have done so based on their own mental model of how the application works and how users engage with it. This is much more likely to correspond to the analyst's mental model than the model imposed by Adobe and Google in their own analytics systems, both of which are built around what a 'typical' web publishers and retailer website looked like 10 years ago. If you've ever implemented either Google Analytics or Adobe Analytics on a mobile app and scratched your head to figure out what what in your app you should map to a 'screen_view' event, that is why. The data models in these analytics systems have been built with specific, page-based websites in mind, rather than the plethora of rich, interactive websites and mobile apps available today.

Just as forcing you to transform the data as structured in your application code to get it into your analytics system adds complexity and fragility to the beginning of the data pipeline, so it also adds complexity and fragility to the other end of the data pipeline, because the data has to be transformed back into a format that makes sense to the business, before it can be effectively exploited.

<h3><a name="drive-operational-systems">2.3 Simpler use of data to drive operational systems</a></h3>

One of the things we are big believers at Snowplow is that event data should be used not just to drive offline analysis and decision-making, but also real-time applications.

Loading data into unified logs, like [Kinesis] [kinesis] and [Kafka] [kafka], with a standardized data model and schema means that each application that consumes the data works from the same data model. That in turn means that a developer can jump around working on totally different applications within the business, safe in the knowledge that the data model for a 'user' or an 'article' is consistent across all of them. He or she doesn't have to waste time translating models between applications, freeing up time to work on the actual processing logic applied to the data.

With Snowplow, you can load your event data, in real-time, into an Amazon Kinesis stream, where it can be processed by multiple applications in real-time. Each of those applications will be working from the same data models - the same models you loaded the data into Snowplow with.

<h3><a name="plug-leaky-data-pipelines">2.4 Less leakage from the data pipelines</a></h3>

It is not uncommon to see websites instrumented with a data pipeline like the one illustrated below:

![Diagram of leaky data pipeline][image2]

In the above data pipeline, data is passed from the website / application into the tag manager's data layer, and then into the analytics platform. In these two steps, the data moves from a well structured, well schema'd model into what is sometimes a completely unstructured collection of name-value pairs. In doing so, some knowledge about that data is literally 'lost'. It is up to the person setting up the reports at the other end of the data pipeline, to reconstitute that lost schema, by using the implicit structure in the data (available only to people who are familiar both with the business and how the analytics system has been instrumented) to recombine the name value pairs into well structured events and entities.

It is not just the data schema that is lost between the application and the web analytics tool. Often, a lot of original data will be lost when the data moves into the analytics platform, because there may not be sufficient custom dimensions, eVars and sProps available to store all the different fields in the original data objects. As a result, the person instrumenting the analytics platform will have to make a judgement about what data should be capured, and what should be ignored, and in doing so, make it significantly more different to perform any analysis involving the *lost* data down the line.

With Snowplow, there is no technical limit to the volume of data that can be passed in. You can pass in as many context objects as you like, and each context object can contain as many different fields as you like. All that data will be processed and loaded into structured tables in Amazon Redshift where you can query them directly.

<h3><a name="warehouse-evolution">2.5 Simpler management of your data warehouse as your business (and therefore data models and schemas) evolve</a></h3>

Digital businesses evolve. As they evolve, we expect that the types of events that they record will evolve, and their data models and schemas will evolve with them.

Tools like Google Analytics and Adobe Analytics provide no way to manage that evolution. You can pass new data into as-yet-unused custom dimensions, sProps and eVars fields. If, however, you want to change the way you use existing custom dimensions, sProps and eVars are used, you have to throw away all your data from before the change was made. We've talked to a number of companies who've implemented SiteCatalyst badly, only to have to reimplement it a few years later and junk all the data collected prior to the implementation as part of that exercise. That's a real shame - data is an asset with value that should grow over time, and certainly should not be discarded.

Snowplow is different. Because each data point collected is stored with a reference to its own schema, and because you have access to all the underlying data in an environment that enables you to reprocess your entire data set (using Elastic Mapreduce), you can evolve your schema, and as part of that schema evolution, reprocess your data from the old schema into your new schema. We'll be exploring this proces in more detail in a future blog post.


<h2><a name="snowplow-supports-configurable-schemas">3. Snowplow now supports configurable schemas</a></h2>

With the [release of Snowplow 0.9.5] [snowplow-095] earlier this week, Snowplow now supports customisable schemas. You, as a Snowplow user, can define your own event dictionary, containing the complete set of events that make sense for your business. You can define your own set of contexts, to include all the entities that matter to your business, and all the fields that you already use, in your applciation code, to describe those entities. With Snowplow, you can pass all that data into Snowplow, with a minimum amount of data transformation. Snowplow will automatically use your custom schemas to validate that incoming data , and load the data into tidy tables in Amazon Redshift that you can easily query, with a separate table for each of your event and context types.

As I've explained in this post, this approach is fundamentally different to the one adopted by both Adobe Analytics and Google Analytics. We believe this difference is transformative: not just for companies who's data models are obviously a poor fit for the standard schemas provided by Adobe and Google Analytics (e.g. mobile games companies), but also for media companies and retailers who should be reasonably well served by the standard schemas offered up by Google and Adobe. Through working with many of these companies, we've seen that they actually have surprisingly rich and varied data models - by enabling them to leverage those rich data models in their analytics system, Snowplow lets them do more with their data, faster.

<h2><a name="">Want to learn more about how a configurable data model can change the way you use data?</a></h2>

Then [get in touch] [contact] with the Snowplow team.

[image1]: /assets/img/blog/2014/07/too-many-people-to-fit-in-the-train.jpg
[image2]: /assets/img/blog/2014/07/leaky-data-pipeline.png
[contact]: /about/index.html
[kinesis]: http://aws.amazon.com/kinesis/
[kafka]: http://kafka.apache.org/
[adobe]: http://www.adobe.com/uk/solutions/digital-analytics.html
[google]: http://www.google.com/analytics/

[snowplow-095]: /blog/2014/07/09/snowplow-0.9.5-released-with-json-validation-shredding
