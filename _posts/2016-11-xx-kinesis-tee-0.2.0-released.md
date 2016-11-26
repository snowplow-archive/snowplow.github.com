---
layout: post
title: Kinesis Tee 0.2.0 released with Javascript Transformation and Daisy chaining of operations
title-short: Kinesis Tee 0.2.0
tags: [snowplow, analytics, kinesis, lambda, aws, stream]
author: Nakul
category: Releases
---

We are pleased to announce the release of version 0.2.0 of [Kinesis Tee][kinesis-tee-repo].
This release centers around adding support for Javascript Transform and Daisy chaining of operators
in series.

In the rest of this post we will cover:

1. [Javascript Transformation](/blog/2016/11/xx/kinesis-tee-0.2.0-released#jstransform)
2. [Daisy Chaining Operations](/blog/2016/11/xx/kinesis-tee-0.2.0-released#eg-chained)
3. [Example](/blog/2016/11/xx/kinesis-tee-0.2.0-released#extras)
4. [Roadmap](/blog/2016/11/xx/kinesis-tee-0.2.0-released#roadmap)
5. [Contributing](/blog/2016/11/xx/kinesis-tee-0.2.0-released#contributing)

<!--more-->


<h2 id="jstransform">1. Support for Javascript Transformation</h2>

Kinesis Tee now supports arbitrary JavaScript transformation functions.
To use a javascript transform an operator of type "JAVASCRIPT_TRANSFORM" has to be defined in the JSON configuration. 

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.kinesistee.tbd",
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

The `operatorType` field indicates that this is a Javascript Transform operator.

The `value` field in the above configuration contains a [Base64 encoded](https://en.wikipedia.org/wiki/Base64) JavaScript function. This function must be called `transform`, and in this case decodes to the following:

{% highlight javascript %}
 function transform(row) {
   var record = JSON.parse(row);
   record.price.currency = record.price.currency.toUpperCase();
   return JSON.stringify(record)
 }
 {% endhighlight %}
 
 * The record is parseable as JSON
 * The record contains an object `price` with a string `currency` field


<h2 id="daisychain">2. Daisy Chain operators</h2>

Kinesis Tee now supports daisy chaining operators in series. A heterogeneous combination of Filters and Transforms can be applied in series to produce the desired result.

The self-describing [Avro schema][config-file] has been updated for Daisy Chaining operations. The configuration now describes:

* A single **sink stream** to write records to
* An optional array of **stream operators** that are applied in series

<h2 id="eg-chained">3. Example:</h2>

This describes a chain of operations where the Snowplow Enriched Event (TSV) is:

* Converted to Nested JSON
* `record.price.currency` converted to Uppercase ('usd' to 'USD')
* Filter out all records where value is not 'EUR' in `record.price.currency`

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.kinesistee.tbd",
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
          "value": "ZnVuY3Rpb24gdHJhbnNmb3JtKHJvdykgew0KICB2YXIgcmVjb3JkID0gSlNPTi5wYXJzZShyb3cpOw0KICByZWNvcmQucHJpY2UuY3VycmVuY3kgPSByZWNvcmQucHJpY2UuY3VycmVuY3kudG9VcHBlckNhc2UoKTsNCiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHJlY29yZCkNCn0="
        },
        {
          "operatorType": "JAVASCRIPT_FILTER",
          "value": "ZnVuY3Rpb24gZmlsdGVyKHJlY29yZCkgew0KICByZXR1cm4gKHJlY29yZC5wcmljZS5jdXJyZW5jeSAhPSAnRVVSJyk7DQp9"
        }
      ]
    }
  }
}
{% endhighlight %}

The javascript transform function in the second step decodes to:

{% highlight json %}
 function transform(row) {
   var record = JSON.parse(row);
   record.price.currency = record.price.currency.toUpperCase();
   return JSON.stringify(record)
 }
{% endhighlight %}

The javascript filter function in the final step decodes to:

{% highlight json %}
function filter(row) {
  var record = JSON.parse(row)
  return (record.price.currency != 'EUR');
}
{% endhighlight %}

See **[Cookbooks] [cookbook-wiki]** for more examples.

<h2 id="roadmap">4. Roadmap</h2>

<h2 id="help">5. Getting help</h2>

We hope that you find the 0.2.0 release of Kinesis Tee useful, please [get in touch][talk-to-us] or [raise an issue] [kinesis-tee-issues] on GitHub!

[kinesis-tee-repo]: https://github.com/snowplow/kinesis-tee
[unix-tee]: https://en.wikipedia.org/wiki/Tee_(command)

[kinesis-tee-issues]: https://github.com/snowplow/kinesis-tee/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

[config-file]: http://iglucentral.com/schemas/com.snowplowanalytics.kinesistee.config/Configuration/avro/2-0-0
[cookbook-wiki]: https://github.com/snowplow/kinesis-tee/wiki/Cookbooks
