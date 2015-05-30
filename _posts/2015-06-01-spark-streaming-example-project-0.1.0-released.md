---
layout: post
shortenedlink: Apache Spark Streaming Example Project
title: Apache Spark Streaming at Snowplow
tags: [snowplow, scala, spark, tutorial, example, analytics]
author: Vincent
category: Releases
---

![data flow png][data-flow]

We are pleased to announce the release of the new [Snowplow Apache Spark Streaming Example Project][repo]! This initial release allows you to send simple events to Amazon Kinesis and process/aggregate events with Apache Spark Streaming. Spark will save the output to Amazon DynamoDB.

This Snowplow Spark Streaming Example Project demostrates how you can jumpstart your own event processing pipeline.  This is a simple time series analysis job written in Scala for the [Spark] [spark] Streaming cluster computing platform.

__First__, this app generates/sends raw events to AWS Kinesis. __Second__, we process the raw events with Apache Spark Streaming. Our data processing
sorts each event into a "bucket". __Third__, Spark counts and aggregates the raw events into 1 minute buckets. __Last__, this Spark app
takes the aggregate records and saves the aggregate events into AWS DynamoDB Database.

The idea is that you should be able to send JSON formated logs to Amazon Kinesis and use the Apache Spark Stream Kinesis integration to process each of the events. For example, below is an "input" example of a raw log that we will be sending to Kinesis. If everything runs as expected, you will find "output" similar to DyanmoDB table below after running this example project.

__Input: Example of a raw event in the JSON format__

```bash
{ "dateString": "2015-06-22T00:23:24.306091", "eventType": "Red" }
{ "dateString": "2015-06-22T00:23:24.450129", "eventType": "Yellow" }
{ "dateString": "2015-06-22T00:23:24.826703", "eventType": "Blue" }
```

__Ouput: Example of the [DynamoDB table](https://bigsnarf.files.wordpress.com/2015/05/screen-shot-2015-05-21-at-5-12-11-pm.png)__
![data table png][data-table]


###Recommended prior knowledge:

*__Amazon Kinesis__ is a fully managed service for real-time processing of streaming data at massive scale. The Kinesis receiver creates an input DStream using the Kinesis Client Library (KCL) provided by Amazon under the Amazon Software License (ASL). The KCL builds on top of the Apache 2.0 licensed AWS Java SDK and provides load-balancing, fault-tolerance, checkpointing through the concepts of Workers, Checkpoints, and Shard Leases. Here we explain how to configure Spark Streaming to receive data from Kinesis.*
[Read more about Spark](https://spark.apache.org/docs/latest/streaming-kinesis-integration.html)

*__Building Apache Spark with Kinesis support__
Spark now comes packaged with a self-contained Maven installation to ease building and deployment of Spark from source located under the build/ directory. This script will automatically download and setup all necessary build requirements (Maven, Scala, and Zinc) locally within the build/ directory itself. It honors any mvn binary if present already, however, will pull down its own copy of Scala and Zinc regardless to ensure proper version requirements are met. build/mvn execution acts as a pass through to the mvn call allowing easy transition from previous build methods. As an example, one can build a version of Spark as follows:*
[Read more about building Spark](https://spark.apache.org/docs/latest/building-spark.html#setting-up-mavens-memory-usage)

mvn -Pkinesis-asl -DskipTests clean package

  


*__Amazon Security Credentials__
When you interact with AWS, you use AWS security credentials to verify who you are and whether you have permission to access the resources that you are requesting. In other words, security credentials are used to authenticate and authorize calls that you make to AWS.*
[Read more about AWS Credentials](http://docs.aws.amazon.com/general/latest/gr/aws-security-credentials.html)
[Read more about AWS Command Line Tools and Credentials](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)








## Get this project up and running
In this tutorial, we will walk through the process of getting up and running with Amazon Kinesis.

####Step 1: Get the code




####Step 2: Get your AWS credentials

####Step 3: Set up Kinesis

####Step 4: Get and compile Spark with Kinesis Support

####Step 5: Run the Python script to load data to Kinesis

####Step 6: Load raw data to Kinesis

####Step 7: Compile Snowplow Spark Streaming Example Project

####Step 8: Submit your application to Spark

####Step 9: Check that things are working

####Step 10: Look at your aggregate data

####Step 11: Shut everything down

## Frequently asked questions


## Next steps

As the next steps in my internship, I will be focusing on marketing attribution data in particular. I'm going to compute identify, filter and transform that data in Spark, before loading it into [DynamoDB](https://aws.amazon.com/dynamodb/) and visualising it using [D3.js](http://d3js.org/). This stack should give me a lot of flexibility to explore different approaches to visualizing marketing attribution data.

In parallel, another intern at Snowplow is figuring out how to run [Spark Streaming](https://spark.apache.org/streaming/) with Kinesis so that we can perform these types of real-time computation and visualization in real-time. Stay tuned for a blog post on that in due course!

[repo]: https://github.com/snowplow/spark-streaming-example-project
[spark-logo]: /assets/img/blog/2015/06/spark-streaming.png
[data-flow]: /assets/img/blog/2015/06/dataFlow.png
[data-table]: /assets/img/blog/2015/06/dynamodbTable.png

[inferring-the-schema-using-reflection]: https://spark.apache.org/docs/latest/sql-programming-guide.html#inferring-the-schema-using-reflection

[es-sink]: https://github.com/snowplow/snowplow/tree/master/4-storage/kinesis-elasticsearch-sink
[spark]: http://spark-project.org/
[wordcount]: https://github.com/twitter/scalding/blob/master/README.md
[snowplow]: http://snowplowanalytics.com
[data-pipelines-algos]: http://snowplowanalytics.com/services/pipelines.html

[vagrant-install]: http://docs.vagrantup.com/v2/installation/index.html
[virtualbox-install]: https://www.virtualbox.org/wiki/Downloads

[spark-streaming-example-project]: https://github.com/snowplow/spark-streaming-example-project
[scalding-example-project]: https://github.com/snowplow/scalding-example-project

[issue-1]: https://github.com/snowplow/spark-example-project/issues/1
[issue-2]: https://github.com/snowplow/spark-example-project/issues/2
[aws-spark-tutorial]: http://aws.amazon.com/articles/4926593393724923
[spark-emr-howto]: https://forums.aws.amazon.com/thread.jspa?messageID=458398

[emr]: http://aws.amazon.com/elasticmapreduce/
[hello-txt]: https://github.com/snowplow/spark-example-project/raw/master/data/hello.txt
[emr-client]: http://aws.amazon.com/developertools/2264

[elasticity]: https://github.com/rslifka/elasticity
[spark-plug]: https://github.com/ogrodnek/spark-plug
[lemur]: https://github.com/TheClimateCorporation/lemur
[boto]: http://boto.readthedocs.org/en/latest/ref/emr.html

