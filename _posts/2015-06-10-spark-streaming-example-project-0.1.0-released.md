---
layout: post
title: Apache Spark Streaming example project released
title-short: Apache Spark Streaming example project
tags: [snowplow, scala, spark, spark streaming, kinesis, dynamodb, tutorial, analytics]
author: Vincent
category: Releases
---

We are pleased to announce the release of our new [Apache Spark Streaming Example Project] [repo]!

This is a simple time series analysis stream processing job written in Scala for the [Spark Streaming] [spark-streaming] cluster computing platform, processing JSON events from [Amazon Kinesis] [kinesis] and writing aggregates to [Amazon DynamoDB] [dynamodb].

![data flow png][data-flow]

The [Snowplow Apache Spark Streaming Example Project][repo] can help you jumpstart your own real-time event processing pipeline. We will take you through the steps to get this simple analytics-on-write job setup and processing your Kinesis event stream.

Read on after the fold for:

1. [What are Spark Streaming and Kinesis?](/blog/2015/06/10/spark-streaming-example-project-0.1.0-released/#what-are-spark-streaming-and-kinesis)
2. [Introducing analytics-on-write](/blog/2015/06/10/spark-streaming-example-project-0.1.0-released/#introducting-analytics-on-write)
3. [Detailed setup](/blog/2015/06/10/spark-streaming-example-project-0.1.0-released/#detailed-setup)
4. [Troubleshooting](/blog/2015/06/10/spark-streaming-example-project-0.1.0-released/#troubleshooting)
5. [Further reading](/blog/2015/06/10/spark-streaming-example-project-0.1.0-released/#further-reading)

<!--more-->

<div class="html">
<h2><a name="what-are-spark-streaming-and-kinesis">1. What are Spark Streaming and Kinesis?</a></h2>
</div>

[Apache Spark Streaming] [spark-streaming] enables scalable, high-throughput, fault-tolerant stream processing of live data streams, using a "micro-batch" architecture. Our event stream will be ingested from Kinesis by our Scala application written for and deployed onto Spark Streaming.

[Amazon Kinesis] [kinesis] is a fully managed service for real-time processing of streaming data at massive scale. In this project we leverage the [new Kinesis receiver] [spark-kinesis-support] that has been recently developed for Spark Streaming, leveraging the [Kinesis Client Library] [kcl].

<div class="html">
<h2><a name="introducting-analytics-on-write">2. Introducing analytics-on-write</a></h2>
</div>

Our Spark Streaming job reads a Kinesis stream containing events in a JSON format:

{% highlight json %}
{
  "timestamp": "2015-06-05T12:54:43.064528",
  "type": "Green",
  "id": "4ec80fb1-0963-4e35-8f54-ce760499d974"
}
{% endhighlight %}

Our job counts the events by `type` and aggregates these counts into 1 minute buckets. The job then takes these aggregates and saves them into a table in DynamoDB:

![data table png][data-table]

The most complete open-source example of an analytics-on-write implementation is Ian Meyers' [amazon-kinesis-aggregators] [amazon-kinesis-aggregators] project; our example project is in turn heavily influenced by the concepts in Ian's work. Two important concepts to understand in analytics-on-write are:

1. **Downsampling:** where we reduce the event's ISO 8601 timestamp down to minute precision, so for instance "2015-06-05T12:54:43.064528" becomes "2015-06-05T12:54:00.000000". This downsampling gives us a fast way of bucketing or aggregating events via this downsampled key
2. **Bucketing:** an aggregation technique that builds buckets, where each bucket is associated with a downstampled timestamp key and an event type criterion. By the end of the aggregation process, we’ll end up with a list of buckets - each one with a countable set of events that "belong" to it.

<div class="html">
<h2><a name="detailed-setup">3. Detailed setup</a></h2>
</div>

In this tutorial, we'll walk through the process of getting up and running with Amazon Kinesis and Apache Spark Streaming. You will need  [git] [git-install], [Vagrant] [vagrant-install] and [VirtualBox] [virtualbox-install] installed locally. This project is specifically configured to run in AWS region "us-east-1" to ensure all AWS services are available. Building Spark on a Vagrant box requires at least 8GB of RAM and 64 bit OS hosting vagrant.

<h3>Step 1: Build the project</h3>

In your local terminal:

{% highlight bash %}
 host$ git clone https://github.com/snowplow/spark-streaming-example-project
 host$ cd spark-streaming-example-project
 host$ vagrant up && vagrant ssh
{% endhighlight %}

Let's now build the project. This should take around 10 minutes with these commands:

{% highlight bash %}
guest$ cd /vagrant
guest$ inv build_project
{% endhighlight %}

<h3>Step 2: Add AWS credentials to the vagrant box</h3>

You're going to need IAM-based credentials for AWS. Get your keys and type in "aws configure" in the Vagrant box (the guest). In the below, I'm also setting the region to "us-east-1" and output format to "json":

{% highlight bash %}
$ aws configure
AWS Access Key ID [None]: ADD_YOUR_ACCESS_KEY_HERE
AWS Secret Access Key [None]: ADD_YOUR_SECRET_KEY_HERE
Default region name [None]: us-east-1
Default output format [None]: json
{% endhighlight %}

<h3>Step 3: Create your Kinesis stream</h3>

We're going to set up the Kinesis stream. Your first step is to create a stream and verify that it was successful. Use the following command to create a stream named "my-stream":

{% highlight bash %}
$ inv create_kinesis_stream default my-stream
{% endhighlight %}

If you check the stream and it returns with status CREATING, it means that the Kinesis stream is not quite ready to use. Check again in a few moments, and you should see output similar to the below:

{% highlight bash %}
$ inv describe_kinesis_stream default my-stream
{
    "StreamDescription": {
        "StreamStatus": "ACTIVE",
        "StreamName": "my-stream",
        "StreamARN": "arn:aws:kinesis:us-east-1:3197435995:stream/my-stream",
        "Shards": [
            {
                "ShardId": "shardId-000000000000",
                "HashKeyRange": {
                    "EndingHashKey": "340282366920938463463374607431768211455",
                    "StartingHashKey": "0"
                },
                "SequenceNumberRange": {
                    "StartingSequenceNumber": "49551350243544458458477304430170758137221526998466166786"
                }
            }
        ]
    }
}
{% endhighlight %}

<h3>Step 4: Create a DynamoDB table for storing our aggregates</h3>

I'm using "my-table" as the table name. Invoke the creation of the table with:

{% highlight bash %}
$ inv create_dynamodb_table default us-east-1 my-table
{% endhighlight %}

<h3>Step 5: Generate events in your Kinesis Stream</h3>

Once the Kinesis' stream's "StreamStatus" is `ACTIVE`, you can start sending events to the stream by:

{% highlight bash %}
$ inv generate_events default us-east-1 my-stream
Event sent to Kinesis: {"timestamp": "2015-06-05T12:54:43.064528", "type": "Green", "id": "4ec80fb1-0963-4e35-8f54-ce760499d974"}
Event sent to Kinesis: {"timestamp": "2015-06-05T12:54:43.757797", "type": "Red", "id": "eb84b0d1-f793-4213-8a65-2fb09eab8c5c"}
Event sent to Kinesis: {"timestamp": "2015-06-05T12:54:44.295972", "type": "Yellow", "id": "4654bdc8-86d4-44a3-9920-fee7939e2582"}
...
{% endhighlight %}

<h3>Step 6: Build Spark Streaming with Kinesis support</h3>

Now we need to build a version of Spark with Amazon Kinesis support.

Spark now comes packaged with a self-contained Maven installation to ease building and deployment of Spark from source located under the build/ directory. This script will automatically download and setup all necessary build requirements (Maven, Scala, and Zinc) locally within the build/ directory itself. It honors any mvn binary if present already, however, will pull down its own copy of Scala and Zinc regardless to ensure proper version requirements are met.

We can issue the invoke command to build Spark with Kinesis support; be aware that this could take over an hour:

{% highlight bash %}
vagrant@spark-streaming-example-project:/vagrant/spark-master$   inv build_spark
...
[INFO] Spark Kinesis Integration ......................... SUCCESS [1:11.115s]
...
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 1:29:00.686s
[INFO] Finished at: Sun Jun 07 00:32:09 UTC 2015
[INFO] Final Memory: 94M/665M
[INFO] ------------------------------------------------------------------------
{% endhighlight %}

<h3>Step 7: Submit your application to Spark</h3>

Open a new terminal window and log into the Vagrant box with:

{% highlight bash %}
 host$ vagrant ssh
{% endhighlight %}

Now start Apache Spark Streaming system with this command:

{% highlight bash %}
guest$ inv run_project config/config.hocon.sample
...
{% endhighlight %}

If you have updated any of the configuration options above (e.g. stream name or region), then you will have to update the __config.hocon.sample__ file accordingly.

Under the covers, we're submitting the compiled spark-streaming-example-project jar to run on Spark using the `spark-submit` tool:

{% highlight bash %}
$ ./spark/bin/spark-submit \
    --class com.snowplowanalytics.spark.streaming.StreamingCountsApp \
    --master local[4] \
    ./target/scala-2.10/spark-streaming-example-project-0.1.0.jar \
    --config ./config/config.hocon.sample
{% endhighlight %}

<h3>Step 8: Monitor your job</h3>

First review the spooling output of the `run_project` command above - it's very verbose, but if you don't see any Java stack traces in there, then Spark Streaming should be running okay.

Now head over to your host machine's localhost:4040 and you should see something like this:

![sparkUI png][sparkUI.png]

<h3>Step 9: Inspect the "my-table" aggregate table in DynamoDB</h3>

Success! You can now see data being written to the table in DynamoDB. Make sure you are in the correct AWS region, then click on `my-table` and hit the `Explore Table` button:

![data table png][data-table]

For each **BucketStart** and **EventType** pair, we see a **Count**, plus some **CreatedAt** and **UpdatedAt** metadata for debugging purposes. Our bucket size is 1 minute, and we have 5 discrete event types, hence the matrix of rows that we see.

<h3>Step 10: Shut everything down</h3>

Remember to shut off:

* Python data loading script
* Control C to shutdown Spark
* Delete your `my-stream` Kinesis stream
* Delete your `my-table` DynamoDB table
* Delete your `StreamingCountingApp` DynamoDB table (created automatically by the [Kinesis Client Library] [kcl])
* Exit your Vagrant guest
* `vagrant halt`
* `vagrant destroy`

<div class="html">
<h2><a name="troubleshooting">4. Troubleshooting</a></h2>
</div>

This is a short list of our most frequently asked questions.

__I got an out of memory error when trying to build Apache Spark:__

* Answer - Try setting memory requirements of Maven with:

{% highlight bash %}
$ export MAVEN_OPTS="-Xmx2g -XX:MaxPermSize=512M -XX:ReservedCodeCacheSize=512m"
{% endhighlight %}

__I found an issue with the project:__

* Answer - Feel free to [get in touch][talk-to-us] or [raise an issue][issues] on GitHub!

<div class="html">
<h2><a name="further-reading">5. Further reading</a></h2>
</div>

Spark is an increasing focus for us at Snowplow. Recently, we detailed our [First experiments with Apache Spark](http://snowplowanalytics.com/blog/2015/05/21/first-experiments-with-apache-spark/). Also, catch up on our newly released version 0.3.0 of our [spark-example-project](https://github.com/snowplow/spark-example-project).

Separately, we are also now starting a port of this example project to [AWS Lambda] [lambda] - you can follow our progress in the [aws-lambda-example-project] [aws-lambda-example-project] repo.

This example project is a very simple example of an event processing technique which is called _analytics-on-write_. We are planning on exploring these techniques further in a new project, called [Icebucket] [icebucket]. Stay tuned for more on this!

[kcl]: http://docs.aws.amazon.com/kinesis/latest/dev/developing-consumers-with-kcl.html
[amazon-kinesis-aggregators]: https://github.com/awslabs/amazon-kinesis-aggregators
[spark-streaming]: https://spark.apache.org/streaming/
[kinesis]: http://aws.amazon.com/kinesis
[dynamodb]: http://aws.amazon.com/dynamodb
[snowplow]: http://snowplowanalytics.com
[icebucket]: https://github.com/snowplow/icebucket
[lambda]: http://aws.amazon.com/lambda/

[vagrant-install]: http://docs.vagrantup.com/v2/installation/index.html
[virtualbox-install]: https://www.virtualbox.org/wiki/Downloads
[git-install]: https://help.github.com/articles/set-up-git/

[repo]: https://github.com/snowplow/spark-streaming-example-project
[data-flow]: /assets/img/blog/2015/06/kinesis.png
[data-table]: /assets/img/blog/2015/06/dynamodb-table-image.png
[sparkUI.png]: /assets/img/blog/2015/06/spark-ui-image.png

[aws-lambda-example-project]: https://github.com/snowplow/aws-lambda-example-project

[spark-kinesis-support]: https://spark.apache.org/docs/latest/streaming-kinesis-integration.html

[issues]: https://github.com/snowplow/schema-guru/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
