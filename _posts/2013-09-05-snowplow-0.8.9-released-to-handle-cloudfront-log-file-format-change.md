---
layout: post
title: Snowplow 0.8.9 released to handle CloudFront log file format change
title-short: Snowplow 0.8.9
tags: [snowplow, cloudfront logfile format]
author: Alex
category: Releases
---

We are pleased to announce the immediate availability of Snowplow 0.8.9. This release was necessitated by an unannounced change Amazon made to the CloudFront access log file format on 17th August, discussed in this [AWS Forum thread] [aws-thread] and this [snowplow-user email thread] [email-thread].

Essentially, Amazon switched from URL-encoding all "%"" signs found in the `cs-uri-query` field, to only URL-encoding them if they were not already escaped, i.e. were not followed by "25" ("%25"). This unannounced change was in contradiction to the existing [CloudFront access log technical specification] [log-spec], which was not updated.

Snowplow expects "%" signs to be double-encoded, and so decodes them twice. Unfortunately, if a URL contains a space (e.g. in a referer search term), then constructing a URI object from this double-decoded string will fail, the event will be rejected by Snowplow validation and be logged to the bad-rows bucket (not loaded into Redshift). Assuming you are using the CloudFront collector, if you check your bad-rows bucket for Snowplow ETL runs before and after August 17th, expect to see a large increase in the number of bad-rows after the 17th.

On 5th September, Amazon decided to reverse this change, but this still leaves Snowplow users with three weeks' worth of CloudFront logs in the wrong format. Therefore, we have released Snowplow 0.8.9, which adds support for both single- and double-encoded "%" signs in the `cs-uri-query` field.

Assuming you are using EmrEtlRunner, you need to update your configuration file, `config.yml`, to use the latest version of the Hadoop ETL:

{% highlight yaml %}
:snowplow:
  :hadoop_etl_version: 0.3.4 # Version of the Hadoop ETL
{% endhighlight %}

And that's it! You may also want to re-run your Snowplow process against your CloudFront logs starting from the 17th August to recover the events wrongly identified as "bad rows".

[aws-thread]: https://forums.aws.amazon.com/thread.jspa?messageID=484509&#484509
[email-thread]: https://groups.google.com/forum/#!topic/snowplow-user/HWeSkiiXbdQ
[log-spec]: http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/AccessLogs.html#LogFileFormat
