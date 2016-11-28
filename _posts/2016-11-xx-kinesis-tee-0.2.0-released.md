---
layout: post
title: Kinesis Tee 0.2.0 released with Javascript Transformation and Daisy chaining of operations
title-short: Kinesis Tee 0.2.0
tags: [snowplow, analytics, kinesis, lambda, aws, stream]
author: Nakul
category: Releases
---

We are pleased to announce the release of version 0.2.0 of [Kinesis Tee][kinesis-tee-repo]. This release centers around adding support for JavaScript-powered transformations, and the daisy-chaining of multiple operators
in series.

In the rest of this post we will cover:

1. [JavaScript-powered transformations](/blog/2016/11/xx/kinesis-tee-0.2.0-released#js-transform)
2. [Daisy-chaining operations](/blog/2016/11/xx/kinesis-tee-0.2.0-released#daisy-chaining)
3. [Example of a JavaScript transformation with daisy-chaining](/blog/2016/11/xx/kinesis-tee-0.2.0-released#eg)
4. [Roadmap](/blog/2016/11/xx/kinesis-tee-0.2.0-released#roadmap)
5. [Contributing](/blog/2016/11/xx/kinesis-tee-0.2.0-released#contributing)

<!--more-->

<h2 id="js-transform">1. JavaScript-powered transformations</h2>

Kinesis Tee now supports arbitrary JavaScript transformation functions. To use a JavaScript transformation, an operator of type "JAVASCRIPT_TRANSFORM" has to be defined in the JSON configuration. Here is an example:

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.kinesistee.config/Configuration/avro/2-0-0",
  "data": {
    "name": "My Kinesis Tee Javascript Transform",
    "targetStream": {
      "name": "my-target-stream",
      "targetAccount": null
    },
    "operator": {
      "array": [
        {
          "operatorType": "JAVASCRIPT_TRANSFORM",
          "value": "ZnVuY3Rpb24gdHJhbnNmb3JtKHJvdykgew0KICB2YXIgcmVjb3JkID0gSlNPTi5wYXJzZShyb3cpOw0KICByZWNvcmQucHJpY2UuY3VycmVuY3kgPSByZWNvcmQucHJpY2UuY3VycmVuY3kudG9VcHBlckNhc2UoKTsNCiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHJlY29yZCkNCn0="
        }
      ]
    }
  }
}
{% endhighlight %}

The `operatorType` field indicates that this is a JavaScript-powered transform operator.

The `value` field in the above configuration contains a [Base64 encoded](https://en.wikipedia.org/wiki/Base64) JavaScript function. This function must be called `transform`, and in this case decodes to the following:

{% highlight javascript %}
 function transform(row) {
   var record = JSON.parse(row);
   record.price.currency = record.price.currency.toUpperCase();
   return JSON.stringify(record)
 }
 {% endhighlight %}
 
In this function:

 * The record is parseable as JSON as required
 * The record contains an object `price` with a string `currency` field

<h2 id="daisy-chaining">2. Daisy-chaining operators</h2>

Kinesis Tee now supports daisy-chaining operators in series. A heterogeneous combination of Filters and Transforms can be applied in series to produce the desired result.

The self-describing [Avro schema][config-file] has been updated for daisy-chaining operations. The configuration now describes:

* A single **sink stream** to write records to
* An optional array of **stream operators** that are applied in series

A fully-worked example of this is provided in the next section.

<h2 id="eg">3. Example of a JavaScript transformation with daisy-chaining</h2>

This example describes a chain of operations on a Snowplow enriched event TSV, where the event is:

1. Converted to nested JSON
2. Has its `record.price.currency` converted to uppercase ('usd' to 'USD')
3. Is filtered out if the `record.price.currency` value is not 'EUR'

Here is the full configuration:

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.kinesistee.config/Configuration/avro/2-0-0",
  "data": {
    "name": "My Kinesis Tee example",
    "targetStream": {
      "name": "my-target-stream",
      "targetAccount": null
    },
    "operator": {
      "array": [
        {
          "operatorType": "BUILT_IN_TRANSFORM",
          "value": "SNOWPLOW_ENRICHED_EVENT_TO_NESTED_JSON"
        },
        {
          "operatorType": "JAVASCRIPT_TRANSFORM",
          "value": "ZnVuY3Rpb24gdHJhbnNmb3JtKHJvdykgew0KICB2YXIgcmVjb3JkID0gSlNPTi5wYXJzZShyb3cpOw0KICByZWNvcmQucHJpY2UuY3VycmVuY3kgPSByZWNvcmQucHJpY2UuY3VycmVuY3kudG9VcHBlckNhc2UoKTsNCiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHJlY29yZCk7DQp9"
        },
        {
          "operatorType": "JAVASCRIPT_FILTER",
          "value": "ZnVuY3Rpb24gZmlsdGVyKHJvdykgew0KICB2YXIgcmVjb3JkID0gSlNPTi5wYXJzZShyb3cpOw0KICByZXR1cm4gKHJlY29yZC5wcmljZS5jdXJyZW5jeSAhPSAnRVVSJyk7DQp9"
        }
      ]
    }
  }
}
{% endhighlight %}

The JavaScript Transform function in the second step decodes to:

{% highlight json %}
function transform(row) {
  var record = JSON.parse(row);
  record.price.currency = record.price.currency.toUpperCase();
  return JSON.stringify(record);
}
{% endhighlight %}

The JavaScript Filter function in the final step decodes to:

{% highlight json %}
function filter(row) {
  var record = JSON.parse(row);
  return (record.price.currency != 'EUR');
}
{% endhighlight %}

Please see **[Cookbooks] [cookbook-wiki]** for more examples.

<h2 id="roadmap">4. Roadmap</h2>

Upcoming features for Kinesis Tee include:

* Handling processing errors better ([#11] [issue-11])
* Adding support for routing incoming events to different sink streams depending on the output of a Routing function ([#8] [issue-8])

We welcome other feature suggestions from the community!

<h2 id="help">5. Getting help</h2>

We hope that you find the 0.2.0 release of Kinesis Tee useful. If you have questions, suggestions or encounter issues, please [get in touch][talk-to-us] or [raise an issue] [kinesis-tee-issues] on GitHub!

[kinesis-tee-repo]: https://github.com/snowplow/kinesis-tee
[unix-tee]: https://en.wikipedia.org/wiki/Tee_(command)

[issue-11]: https://github.com/snowplow/kinesis-tee/issues/11
[issue-8]: https://github.com/snowplow/kinesis-tee/issues/8

[kinesis-tee-issues]: https://github.com/snowplow/kinesis-tee/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

[config-file]: http://iglucentral.com/schemas/com.snowplowanalytics.kinesistee.config/Configuration/avro/2-0-0
[cookbook-wiki]: https://github.com/snowplow/kinesis-tee/wiki/Cookbooks
