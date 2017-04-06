---
layout: post
title: Snowplow Python Analytics SDK 0.2.0 released
title-short: Snowplow Python Analytics SDK 0.2.0
tags: [python, snowplow, enriched events, spark, dynamodb]
author: Anton
category: Releases
---

Today we are happy to announce the 0.2.0 release of the [Snowplow Python Analytics SDK][sdk-repo], a library probiding you basic primitives to process and analyze Snowplow enriched event format in Python-compatible in data processing frameworks such as [Apache Spark][spark] and [AWS Lambda][lambda].
This release brings new load manifest functionality along with many internal changes.

In the rest of this post we will cover:

1. [Load manifests](/blog/2017/04/07/snowplow-python-analytics-sdk-0.2.0-released#load-manifests)
2. [Using load manifests](/blog/2017/04/07/snowplow-python-analytics-sdk-0.2.0-released#using-manifests)
3. [Upgrading](/blog/2017/04/07/snowplow-python-analytics-sdk-0.2.0-released#upgrading)
4. [Getting help](/blog/2017/04/07/snowplow-python-analytics-sdk-0.2.0-released#help)

<!--more-->

<h2 id="load-manifests">1. Load manifests</h2>

Biggest new feature in 0.2.0 release is event load manifests.
Load manifests provide you an easy and standard way to solve one very common in Big Data world, namely data load tracking.

Historically, engineers used to mark data as being processed by moving whole folders with data to another location, avoiding data to being reprocessed.
But filemoving approach has several major flaws:

* Filemoves are very time-consuming
* Filemoves are very error-prone - a failure to move a file will cause the job to fail and require manual intervention

Instead of relying on distributed filesystems, where filemoves can take up to hours, we offer an API for AWS DynamoDB table using which you can keep track of parts of enriched data have been loaded into data modeling jobs.

Another benefit of using load manifests for your Snowplow would be that it is going to be a standard way of load tracking for analytics-on-write stacks.


<h2 id="using-manifests">2. Using load manifests</h2>

Load manifests functionality resides in new `snowplow_analytics_sdk.load_manifests` module.

Here's a short usage example:

```python
from boto3 import client
from snowplow_analytics_sdk.load_manifests import add_to_manifest, is_in_manifest, list_run_ids

s3 = client('s3')
dynamodb = client('dynamodb')

dynamodb_load_manifests_table = 'snowplow-load-manifests'
enriched_events_archive = 's3://acme-snowplow-data/storage/enriched-archive/'

for run_id in list_run_ids(s3, enriched_events_archive):
    if not is_in_manifest(dynamodb, dynamodb_load_manifests_table run_id):
        process(run_id)
        add_to_manifest(dynamodb, dynamodb_load_manifests_table, run_id)
    else:
        pass
```

In above example, we create two AWS service clients for S3 (to list job runs) and for DynamoDB (to access manifests).
These cliens are avaiable in [boto3][boto3] Python AWS SDK and Snowplow Python Analytics SDK doesn't include them as a dependency, so you must include them into your project and initalize by yourself.

Then we list all run ids in particular S3 path and process (by user-provided `process` function) only those which were not processed already.
Note that `run_id` is simple string with full S3 path to particular job run.

<h2 id="upgrading">3. Upgrading</h2>

The SDK is available on PyPI:

{% highlight python %}
pip install -U snowplow_analytics_sdk==0.2.0
{% endhighlight %}

<h2 id="help">4. Getting help</h2>

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

And if there's another Snowplow Analytics SDK you'd like us to prioritize creating, please let us know on the [forums] [discourse]!

[sdk-repo]: https://github.com/snowplow/snowplow-python-analytics-sdk
[sdk-usage-img]: /assets/img/blog/2016/03/scala-analytics-sdk-usage.png
[sdk-docs]: https://github.com/snowplow/snowplow/wiki/Python-Analytics-SDK

[boto3]: https://boto3.readthedocs.io/en/latest/

[event-data-modeling]: http://snowplowanalytics.com/blog/2016/03/16/introduction-to-event-data-modeling/

[spark]: http://spark.apache.org/
[lambda]: https://aws.amazon.com/lambda/

[issues]: https://github.com/snowplow/snowplow-python-analytics-sdk

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[discourse]: http://discourse.snowplowanalytics.com/

