---
layout: post
title: Building robust data pipelines that cope with AWS outages and other major catastrophes
tags: [technical architecture, aws]
author: Yali
category: Inside the Plow
---

At Snowplow, we pride ourselves on building robust data pipelines. Recently that robustness has been severly tested, by two different outages in the AWS us-east-1 region (one S3 outage, and one DynamoDB outage that caused issues with very many other AWS APIs inculding EC2), and by an SSL certificate issue with one of our client's collectors that meant that for five consecutive days no events were successfully recorded from their most important platform: iOS.

![tacoma-bridge-catastophe][catastophe]

In all three cases, because of the way the Snowplow pipeline is architected, data loss as a result of these issues was minimized. More than that, we believe that for the majority of users there was no data loss at all. In this post, we'll look at each of those three catastrophes, and explore the pipeline engineering decisions that prevented data being lost.

1. [Coping with an Amazon S3 outage](/blog/2016/02/10/building-robust-data-pipelines-that-cope-with-aws-outages-and-other-catastrophes/#s3-outage)  
2. [Coping with an EC2 outage](/blog/2016/02/10/building-robust-data-pipelines-that-cope-with-aws-outages-and-other-catastrophes/#ec2-outage)  
3. [Coping with a collector outage](/blog/2016/02/10/building-robust-data-pipelines-that-cope-with-aws-outages-and-other-catastrophes/#collector-outage)

<!--more-->

<h2 id="s3-outage">1. Coping with an S3 outage</h2>

On August 2015 AWS in us-east-1 experienced an S3 outage. For a number of hours it was not possible either to read or write to S3.

The Snowplow Batch Pipeline uses Amazon S3 as a processing queue. Both the Clojure and Cloudfront collectors output raw logs to Amazon S3, containing event data collected from Snowplow trackers and third party webhooks. The enrichment process picks up those raw logs, processes them in EMR before writing the output back to S3, where the processed data is then copyied it into Redshift. S3 is then integral to the running of our batch pipeline: an S3 outage should be *very bad news*.

It was not. What we found was that during the outage, the collectors would attempt to write out raw logs to S3. When this failed, they maintained the raw logs  and kept retrying until the outage was over. Once the outage was over, we could then inspect the raw logs to diligence that the correct number of files (e.g. one for each hour for each collector instance) had been written to S3, and check the data to verify that event-levels were not unusually low for the outage period.

So the outage caused a delay in the logs being written to S3, but the logs were written rather than dropped. Great - but what about enrichment? The enrichment process would fail, because it was not possible to read the raw logs from S3 in order to copy the data into an EMR cluster. Similarly, it was not possible to write out the output of the EMR job to S3. So during the outage, no enrichment could occur. However, once the outage was over, it was straightforward to rerun the enrichment process from the point it 'broke' and resume the pipeline as normal. Again, no data was lost, because the data was stored safely on S3.

<h2 id="ec2-outage">2. Coping with an EC2 outage</h2>

On September 2015, there was an AWS DynamoDB outage in us-east-1. As a result of the outage (or the process of addressing it), Amazon rate-limited a number of other AWS service APIs, including EC2. This meant that for a few hours it was not possible to issue requests to the AWS EC2 API, making provisioning an EC2 instance impossible, for example.

Again, this should be a *big problem* for Snowplow users. Both our Clojure and Scala RT collectors use EC2 to receive, log and respond to HTTP and HTTPS requests from Snowplow trackers and webhooks. Further, enrichment is performed by EC2 instances for both the batch and real-time pipelines. So any issues provisioning EC2 instances should be *very bad news*.

Fortunately, it was not. During the outage, existing EC2 instances remained live - it was not possible to provision new instances. This meant that existing collector and enrichment processes could continue to run. It did mean that collector clusters were not able to autoscale up to handle traffic spikes, however. For reasons described in the [next section](#collector-outage), however, we do not think that even this caused any data loss.

For users on the batch pipeline that need to provision EC2 instances to run the enrichment process (on EMR), enrichment could not be run during the outage. But that was OK - the data continued to collect in the form of new collector logs, and when the outage was over, it was straightforward to provision slightly larger clusters to process the data backlog quickly.

<h2 id="collector-outage">3. Coping with a collector outage</h2>

The Snowplow pipeline is architected in a way that means that any failure of any stage in the pipeline downstream of the collector is recoverable: because it is always possible to spin up a big EMR cluster and reprocess the raw collector logs from scratch. That means if everything downstream of the collector completely blows up (including you entire data warehouse and any backups of it), you should be able to reconstitue your entire data set in a matter of hours. Any failure downstream of the collector means a delay before you get hold of your data, not a data loss. Whilst late-arriving data is annoying, it is much preferable to losing data altogether.

The one piece of the data pipeline that we worry most about therefore is the collector. This is the application that provides the HTTP(S) endpoint that the trackers and webhooks send data to. If this goes down, then surely data will be lost?

Actually - it turns out that if you are using Snowplow trackers, a collector outage need not mean you lose any data. We had a recent experience of a mobile-first client who's SSL certificate needed to be replaced (following a renewal). The new certificate that the client uploaded to AWS, and we attached to their collector load balancer, did not include a certficate key chain. As a result, iOS devices did not recognize the certificate, and did not send any data to it. For five days the volume of requests hitting the collector collapsed:

![number of requests to the collector by time] [diagram1]

After the five days the problem was diagnosed and the certifiate was updated. What then followed was a surprising spike in requests to the collector, as a much larger number of requests hit it than normal. This is visibile in the above graph.

Because our [Objective-C tracker] [obj-c-tracker] caches data locally (in SQL-lite) and maintains the data in a cache until it receives a 200 OK response from the collector to validate that the data has been sent through successfully, no data was lost. The trackers simply maintained the event data locally, on each client, until the collector was back online, at which point they sent the data through.

It is also worth noting that both the Objective-C and Android trackers record two timestamps for each event:

* The timestamp that the event occured on (according to the clock on the local device)
* The timestamp that the event was sent through to the collector

That means the the client was still able to accurately know when the events recorded during the outage occurred, even though some of them were only received into their Snowplow pipeline days late.

The same caching approach is taken by *all* our trackers include our [JavaScript tracker] [js-tracker] and [Android tracker] [android-tracker]. This is incredibly important because it means that the data pipeline is robust to collector failures. (Although these may still cause data loss from webhooks, where we not control any local caching behavior.) It is important not just in event of an outage (which is thankfully a rare event) - in the case of a serious traffic spike (which is a much more frequent occurance), it can take time to provision additional EC2 instances in the collector via autoscaling. Local caching means that scaling does not have to be instanteous to avoid data loss.

## Want to ensure that your critical data is delivered by data pipeliens that are robust?

Then [get in touch] [contact] with the Snowplow team.


[catastophe]: /assets/img/blog/2016/02/catastophe.gif
[diagram1]: /assets/img/blog/2016/02/collector-outage.png
[obj-c-tracker]: https://github.com/snowplow/snowplow-bojective-c-tracker
[js-tracker]: https://github.com/snowplow/snowplow-javascript-tracker
[android-tracker]: https://github.com/snowplow/snowplow-android-tracker
[contact]: /contact
