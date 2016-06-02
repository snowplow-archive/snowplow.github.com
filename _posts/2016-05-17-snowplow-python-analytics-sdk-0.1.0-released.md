---
layout: post
title: Snowplow Python Analytics SDK 0.1.0 released
title-short: Snowplow Python Analytics SDK 0.1.0
tags: [python, snowplow, enriched events, spark, aws lambda]
author: Fred
category: Releases
---

Following in the footsteps of the [Snowplow Scala Analytics SDK] [scala-sdk-post], we are happy to announce the release of the [Snowplow Python Analytics SDK] [sdk-repo]! This library makes your Snowplow enriched events easier to work with in Python-compatible data processing frameworks such as [Apache Spark] [spark] and [AWS Lambda] [lambda].

Some good use cases for the SDK include:

1. Performing [event data modeling] [event-data-modeling] in [PySpark] [pyspark] as part our Hadoop batch pipeline
2. Developing machine learning models on your event data using PySpark (e.g. using [Databricks][databricks])
3. Performing analytics-on-write in AWS Lambda as part of our Kinesis real-time pipeline:

![sdk-usage-img] [sdk-usage-img]

Read on below the jump for:

1. [Overview](/blog/2016/05/17/snowplow-python-analytics-sdk-0.1.0-released#overview)
2. [Installation](/blog/2016/05/17/snowplow-python-analytics-sdk-0.1.0-released#installation)
3. [Usage](/blog/2016/05/17/snowplow-python-analytics-sdk-0.1.0-released#usage)
4. [Getting help](/blog/2016/05/17/snowplow-python-analytics-sdk-0.1.0-released#help)

<!--more-->

<h2 id="overview">1. Overview</h2>

Snowplow's ETL process outputs enriched events in a TSV. This TSV currently has 131 fields, which can make it difficult to work with directly. The Snowplow Python Analytics SDK currently supports one transformation: turning this TSV into a more tractable JSON.

The transformation algorithm used to do this is the same as the one used in the [Kinesis Elasticsearch Sink][kes] and the [Snowplow Scala Analytics SDK][ssas], with one exception: when a field of the input TSV is empty, we leave that field out of the output JSON entirely rather than using a field with the value `null`. Here is an example output JSON:

{% highlight json %}
{
  "app_id":"demo", "platform":"web","etl_tstamp":"2015-12-01T08:32:35.048Z",
  "collector_tstamp":"2015-12-01T04:00:54.000Z","dvce_tstamp":"2015-12-01T03:57:08.986Z",
  "event":"page_view","event_id":"f4b8dd3c-85ef-4c42-9207-11ef61b2a46e",
  "name_tracker":"co","v_tracker":"js-2.5.0","v_collector":"clj-1.0.0-tom-0.2.0",
  ...
}
{% endhighlight %}

There are special rules for how custom contexts and unstructured events are added to the JSON. For example, if an enriched event contained a `com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1` unstructured event, then the final JSON would contain:

{% highlight json %}
{
  ...
  "unstruct_event_com_snowplowanalytics_snowplow_link_click_1": {
    "targetUrl":"http://www.example.com",
    "elementClasses":["foreground"],
    "elementId":"exampleLink"
  },...
{% endhighlight %}

For more examples and detail on the algorithm used, check out the [Kinesis Elasticsearch Sink wiki page][kes].

<h2 id="installation">2. Installation</h2>

The SDK is available on PyPI:

{% highlight python %}
pip install snowplow_analytics_sdk
{% endhighlight %}

<h2 id="usage">3. Usage</h2>

Use the SDK like this:

{% highlight python %}
import snowplow_analytics_sdk.event_transformer
import snowplow_analytics_sdk.snowplow_event_transformation_exception

try:
    print(snowplow_analytics_sdk.event_transformer.transform(my_enriched_event_tsv))
except snowplow_analytics_sdk.snowplow_event_transformation_exception.SnowplowEventTransformationException as e:
    for error_message in e.error_messages:
        print(error_message)
{% endhighlight %}

If there are any problems in the input TSV (such as unparseable JSON fields or numeric fields), the `transform` method will throw a `SnowplowEventTransformationException`. This exception contains a list of error messages - one for every problematic field in the input.

For more information, check out the [Python Analytics SDK wiki page] [sdk-docs].

<h2 id="help">4. Getting help</h2>

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

And if there's another Snowplow Analytics SDK you'd like us to prioritize creating, please let us know on the [forums] [discourse]!

[sdk-repo]: https://github.com/snowplow/snowplow-python-analytics-sdk
[sdk-usage-img]: /assets/img/blog/2016/03/scala-analytics-sdk-usage.png
[sdk-docs]: https://github.com/snowplow/snowplow/wiki/Python-Analytics-SDK

[event-data-modeling]: http://snowplowanalytics.com/blog/2016/03/16/introduction-to-event-data-modeling/

[spark]: http://spark.apache.org/
[pyspark]: https://spark.apache.org/docs/0.9.0/python-programming-guide.html
[lambda]: https://aws.amazon.com/lambda/
[databricks]: https://databricks.com/

[kes]: https://github.com/snowplow/snowplow/wiki/Kinesis-Elasticsearch-Sink
[ssas]: https://github.com/snowplow/snowplow-scala-analytics-sdk
[scala-sdk-post]: http://snowplowanalytics.com/blog/2016/03/23/snowplow-scala-analytics-sdk-0.1.0-released/
[issues]: https://github.com/snowplow/snowplow/iglu
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[discourse]: http://discourse.snowplowanalytics.com/
