---
layout: post
title-short: Snowplow 81 Kangaroo Island Emu
title: "Snowplow 81 Kangaroo Island Emu released"
tags: [snowplow, kinesis, real-time]
author: Fred
category: Releases
---

We are happy to announce the release of Snowplow 81 Kangaroo Island Emu! At the heart of this release is the Hadoop Event Recovery project, which allows you to fix up Snowplow bad rows and make them ready for reprocessing.

TOC

![kangaroo-island-emu][kangaroo-island-emu]

<!--more-->

<h2 id="her">Event Recovery</h2>

<h3 id="background">Background</h3>

In 2014 we released Scala Hadoop Bad Rows. This was a simple project which allowed you to extract the original raw events from Snowplow bad row JSONs and write them to S3, ready to be processed again. Hadoop Event Recovery builds on this by adding one key feature: you can now write your own custom JavaScript to execute on each bad row. This allows you to choose which bad rows to keep and which to ignore, and also allows you to mutate the rows you keep, fixing whatever caused them to fail validation in the first place.

<h3 id="usage">Usage</h3>

Snowplow bad rows look like this:

{% highlight json %}
{
  "line": "2015-06-09\t09:56:09\tNRT12\t831\t211.14.8.250\tGET...",
  "errors": [{
    "level": "error",
    "message": "Could not find schema with key iglu:com.acme/myevent/jsonschema/1-0-0 in any repository"
  }]
}
{% endhighlight %}

The Hadoop Event Recovery jar will extract the "line" string (containing the original raw event) and an array of all the error messages which describe why the line failed validation, and pass them to your JavaScript. You need to write a JavaScript function called `process` which accepts two arguments: the raw line string and the error message array. The function should always return either `null` (signifying that the bad row should be ignored, not recovered) or a string which will be used as the new bad row. Your JavaScript can define other top-level functions besides as `process`. We also provide several built-in JavaScript functions for you to call - for more detail check out the [documentation][docs].

An example: suppose several of your events failed validation because you forgot to upload a particular schema. Once you have uploaded the schema, you can run Hadoop Event Recovery to make the bad rows ready for reprocessing. Your JavaScript might look like this:

{% highlight javascript %}
function process(event, errors) {
	for (var i = 0; i < errors.length; i++) {
		if (! /Could not find schema with key/.test(errors[i])) {
			return null;
		}
	}
	return event;
}
{% endhighlight %}

We only want to reprocess events which only failed due to the missing schema, so we return `null` (meaning that we won't recover the event) if any of the error messages is not a missing schema error. Otherwise we return the original raw line, which should now pass validation because we have uploaded the schema.

Next we use base64encode.org to encode our script:

{% highlight %}
VHlwZSAob3IgcGFzdGUpIGhlcmUuLi5mdW5jdGlvbiBwcm9jZXNzKGV2ZW50LCBlcnJvcnMpIHsNCglmb3IgKHZhciBpID0gMDsgaSA8IGVycm9ycy5sZW5ndGg7IGkrKykgew0KCQlpZiAoISAvQ291bGQgbm90IGZpbmQgc2NoZW1hIHdpdGgga2V5Ly50ZXN0KGVycm9yc1tpXSkpIHsNCgkJCXJldHVybiBudWxsOw0KCQl9DQoJfQ0KCXJldHVybiBldmVudDsNCn0=
{% endhighlight %}

Finally, we run the job using the [AWS CLI](https://aws.amazon.com/cli/):

{% highlight bash %}
aws emr create-cluster --applications Name=Hadoop --ec2-attributes '{
    "InstanceProfile":"EMR_EC2_DefaultRole",
    "AvailabilityZone":"{{...}}",
    "EmrManagedSlaveSecurityGroup":"{{...}}",
    "EmrManagedMasterSecurityGroup":"{{...}}"
}' --service-role EMR_DefaultRole --enable-debugging --release-label emr-4.3.0 --log-uri 's3n://{{path to logs}}' --steps '[
{
    "Args":[
        "--src",
        "s3n://{{my-output-bucket/enriched/bad}}/",
        "--dest",
        "hdfs:///local/monthly/",
        "--groupBy",
        ".*(run)=2014.*",
        "--targetSize",
        "128",
        "--outputCodec",
        "lzo"
    ],
    "Type":"CUSTOM_JAR",
    "ActionOnFailure":"TERMINATE_CLUSTER",
    "Jar":"/usr/share/aws/emr/s3-dist-cp/lib/s3-dist-cp.jar",
    "Name":"Combine Months"
},
{
    "Args":[
        "com.snowplowanalytics.hadoop.scalding.SnowplowEventRecoveryJob",
        "--input",
        "hdfs:///local/monthly/*",
        "--output",
        "hdfs:///local/recovery/",
        "--inputFormat",
        "bad",
        "--script",
        "VHlwZSAob3IgcGFzdGUpIGhlcmUuLi5mdW5jdGlvbiBwcm9jZXNzKGV2ZW50LCBlcnJvcnMpIHsNCglmb3IgKHZhciBpID0gMDsgaSA8IGVycm9ycy5sZW5ndGg7IGkrKykgew0KCQlpZiAoISAvQ291bGQgbm90IGZpbmQgc2NoZW1hIHdpdGgga2V5Ly50ZXN0KGVycm9yc1tpXSkpIHsNCgkJCXJldHVybiBudWxsOw0KCQl9DQoJfQ0KCXJldHVybiBldmVudDsNCn0="
    ],
    "Type":"CUSTOM_JAR",
    "ActionOnFailure":"CONTINUE",
    "Jar":"s3://snowplow-hosted-assets/3-enrich/hadoop-event-recovery/snowplow-hadoop-event-recovery-0.2.0.jar",
    "Name":"Fix up bad rows"
},
{
    "Args":[
        "--src",
        "hdfs:///local/recovery/",
        "--dest",
        "s3n://{{my-recovery-bucket/recovered}}"
    ],
    "Type":"CUSTOM_JAR",
    "ActionOnFailure":"TERMINATE_CLUSTER",
    "Jar":"/usr/share/aws/emr/s3-dist-cp/lib/s3-dist-cp.jar",
    "Name":"Back to S3"
}
]' --name 'MyCluster' --instance-groups '[
    {
        "InstanceCount":1,
        "InstanceGroupType":"MASTER",
        "InstanceType":"m1.medium",
        "Name":"MASTER"
    },
    {
        "InstanceCount":2,
        "InstanceGroupType":"CORE",
        "InstanceType":"m1.medium",
        "Name":"CORE"
    }
]'
{% endhighlight %}

There are a couple of things to note about this command. First, the placeholders in curly brackets should be replaced with actual S3 paths. Second, the `--groupBy` argument's value of `.*(run)=2014.*` means that only bad rows from 2014 will be considered for recovery. For more information on how to control the range of input bad rows using the `--groupBy` argument, please see the [wiki page][docs].

Once the above job has run, the recovered raw events will be available in S3, ready to become the input for Scala Hadoop Enrich.

[kangaroo-island-emu]: /assets/img/blog/2016/06/kangaroo-island-emu.jpg
[docs]: https://github.com/snowplow/snowplow/wiki/Hadoop-Event-Recovery
