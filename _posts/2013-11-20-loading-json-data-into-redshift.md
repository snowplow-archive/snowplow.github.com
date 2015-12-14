---
layout: post
title: Loading JSON data into Redshift - the challenges of quering JSON data, and how Snowplow can be used to meet those challenges
title-short: Loading JSON data into Redshift
tags: [json, redshift, unstructured, data pipeline, hive, serde]
author: Yali
category: Inside the Plow
---

Very many of our Professional Services projects involve forking the Snowplow codebase so that specific clients can use it to load their event data, stored as JSONs, into Amazon Redshift, so that they can use BI tools to create dashboards and mine that data.


![container-ship-image] [img-1]

We've been surprised quite how many companies have gone down the road of using JSONs to store their event data. In this blog post, we look at:

* [Why logging event data as JSONs has become so popular](/blog/2013/11/20/loading-json-data-into-redshift/#why)
* [The limitations of this approach](/blog/2013/11/20/loading-json-data-into-redshift/#weaknesses)
* [Using the Snowplow tech stack to load JSON data into Redshift](/blog/2013/11/20/loading-json-data-into-redshift/#solution)

<!--more-->

<h2><a name="why">Why has logging event data as JSONs has become so popular?</a></h2>

There are four reasons logging event data as JSONs has become as popular as it is:

### 1. Easy to implement

Representing an event as a JSON is an extremely simple, easy-to-understand approach. Let's look at an example, a video play event represented as a JSON:

{% highlight json %}
{
    "event_name": "play_video",
    "properties": {
        "timestamp": 1384855393,
        "viewer_id": "19A34Bdt1190",
        "video_id": 234101234,
        "name": "Another skateboarding dog",
        "author_id": "asdf987023s"
    }
}
{% endhighlight %}

The JSON is very easy to read and comprehend. Crucially for application developers, it is straightforward to compose.

Note that there are many ways we could choose to represent a video play event with a JSON. We might want e.g. to use nesting, to capture a richer data set both about the video itself, and about the user who watched it:

{% highlight json %}
{
    "event_name": "play_video",
    "properties": {
        "timestamp": 1384855393,
        "viewer": {
            "id": "19A34Bdt1190",
            "age": 28,
            "gender": "male",
            "member": true
        },
        "video": {
            "id": 234101234,
            "name": "Another skateboarding dog",
            "producer": {
                "id": "asdf987023s",
                "name": "michaeldouglasboy",
                "joined": "2012-09-29"
            }
        }
    }
}
{% endhighlight %}

In the above example, we've used nesting to group related fields (fields related to the viewer, fields related to the video, and fields related to the producer of the video). Again, even with all the additional data, the JSON is easy for the human eye to parse, and the nesting provides a tidy way of structuring our data.

### 2. Flexible

JSONs are flexible. If one day, an application developer decides she wants to add a new field to the "play_video" JSON, there's nothing stopping her!

Typically, application developers can create new JSONs to represent new event types over time, and update the structure of JSONs for existing event types over time (adding or dropping fields), as they see fit. If the analytics system is simply logging the JSONs, there's no need to update any downstream analytics infrastructure in light of changes to the JSON schema.

### 3. Well-supported

Lots of analytics applications store event data as JSONs, including [Kissmetrics] [kissmetrics], [Mixpanel] [mixpanel], [KeenIO] [keenio] and [Swrve] [swrve]. At Snowplow, we're in the process of building out support for [unstructured events] [unstruct-events], where events are represented as JSONs.

### 4. *Seemingly* easy to analyze using Hive and JSON Serde

JSONs, stored as flat files in S3 or HDFS *should* be easy to analyze using Hive and the [JSON serde] [json-serde]. (We've blogged an example of this [here] [post-json-serde-hive].) You 'simply' specify the schema as part of your Hive table definitions, implicit in the JSON. for each event type, and then you can query the data using SQL statements, as if it was a relational database. Easy peasy!


<h2><a name="weaknesses">The limitations of this approach</a></h2>

Unfortunately, querying the JSON data is not as easy as it first appears:

1. It is not always obvious, to the analyst creating the Hive table definitions, what the schema / structure for each event type should be. The analyst can visually inspect some of the data to get some idea, but it is impossible to tell:  
  * Whether they have spotted all the possible fields that might appear. (E.g. there may be some that are sparsely populated, but very important when they are filled in.)  
  * Which fields are compulsory, and which are optional?  
  * Remember that application developers have been free to keep modifying and updating event schemas over time, with no requirement to document or sense-check any of these updates. The analyst suffers, as a consequence, as she has to work out how that schema has evolved, in order to interrogate the data.
2. When exploding nested data into separate tables, it is can be hard to identify on what key that data should be joined to the parent table. A nice feature of JSONs is their ability to nest data, but unless we can explode that nested data out, querying it is not going to be easy.
3. It can be hard (if not impossible) for analysts and application developers to spot "errors" in the JSON at the point the event data is generated and captured.  It is very easy for mistakes to creep in: JSONs are very fragile (a missing comma or inverted comma will break a JSON.) There's also no way to check the type of individual field.

When Amazon Redshift was launched earlier this year, many companies wanted to load their event data into Redshift, to enable faster querying than was possible in Apache Hive, and also so that they could use BI and analytics tools to create dashboards, visaulize and mine the data. Unfortunately, loading JSON data into Redshift is even harder:

1. Redshift tables have traditional schemas where each field has a fixed type. To make loading data into Redshift reliable, you really want to enforce the strong types on variables all the way through the data pipeline, from data collection. However, JSONs do not support strong typing or schemas.
2. Any input line that does not conform to the Redshift schema fails to load. Many companies are then stuck between two unappealing approaches: junk data that doesn't fit the schema (which may be a significant subset of the data), or only load a very small subset of the fields that have been reliably collected across the different event types. (Thereby relaxing the requirements on input data to successfully load, but again, effectively loosing a lot of the richness in the raw JSON data set.)

<h2><a name="solution">Using the Snowplow tech stack to load JSON data into Redshift</a></h2>

The Snowplow stack can be forked so that Snowplow transforms JSON data and loads it into Redshift. We've found this is a much better approach then building an ETL pipeline using e.g. Apache Hive and the JSON serde, because Snowplow has a lot of validation capabilities. We'll discuss this in a second - first, let's overview the process for adapting Snowplow to load your custom JSONs into Redshift:

1. We develop an event dictionary for the client, which catalogs all the different events in their application and the fields that are captured with each of those events.
2. We use that event dictionary to define table definitions in Redshift where the data will be loaded. (So we have a mapping of the event dictionary to the output tables.)
3. We work with the client to map the contents of their event JSONs to the dictionary. (So we have a mapping of the input JSONs to the event dictionary.)
4. We then modify the Snowplow stack to unpick the JSONs (as per the JSON -> dictionary mapping) and write the data back to S3 in a format suitable for loading directly into Redshift (as per the dictionary -> Redshift table definitions mapping)

As mentioned above, the key to making this work is to use Snowplow's rich validation capabilities. We use these to:

1. Check that the input data conforms to the schemas specified
2. Output any data that does not conform to the schema to a "bad buckeet". This means that the "good data" will successfully load into Redshift, while we don't lose any "bad data". We can now easily spot errors as they arise (by ensuring that the ETL process is run every few hours) and deal with them immediately. It also means that the "bad" data can be inspected, updated, reprocessed, and then loaded into Redshift, which is much preferable to simpy dropping it.

Going forwards, we plan to build out the validation capability, so that as well as simply checking if incoming JSONs adhere to the schema, Snowplow will also spot "orphaned data" (i.e. name / value pairs in the JSON that are not accommodated in the schema) so that the schema can be updated to incorporate this data, and we save it from being lost.

## Interested in talking to the Snowplow team about loading your JSON data into Redshift?

View our info on the [Professional Services pages] [pro-services], or [get in touch] [contact] to discuss your requirements.

## References

We're not the only people who think storing event data as JSONs is not a great. For more opinions:

* [Nathan Marz] [marz] wrote a blog post back in 2010, highlighting their weaknesses, as part of presenting an alternative, graph-based model.
* The [Unified Logging Infrastructure for Data Analytics at Twitter] [twitter] gives a very clear description of how this approach breaks down at scale. (See particularly section 3.1.)


[img-1]: /assets/img/blog/2013/11/container-ship.jpg
[kissmetrics]: https://www.kissmetrics.com/
[mixpanel]: https://mixpanel.com/
[keenio]: https://keen.io/
[swrve]: http://www.swrve.com/
[unstruct-events]: https://github.com/snowplow/snowplow/wiki/Developer-FAQ#wiki-unstructtimeline
[json-serde]: https://github.com/rcongiu/Hive-JSON-Serde
[post-json-serde-hive]: /blog/2013/09/11/reprocessing-bad-data-using-hive-the-json-serde-and-qubole/
[pro-services]: /services/pipelines.html
[contact]: /about/index.html
[marz]: http://nathanmarz.com/blog/thrift-graphs-strong-flexible-schemas-on-hadoop.html
[twitter]: http://vldb.org/pvldb/vol5/p1771_georgelee_vldb2012.pdf
