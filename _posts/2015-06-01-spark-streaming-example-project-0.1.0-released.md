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
sorts each event into a "bucket". __Third__, Spark aggregates the raw events into 1 minute buckets. __Last__, this Spark app
takes the aggregate records and saves them into AWS DynamoDB Database.


| Interesting Facts |
|:-----------------------------------------------------------------:|
|We are parsing the ISO 8601 datetime stamp down to the minute.|
|This technique is referred to a downsampling or reducing precision|
| aka "Bucketing". It's an interesting way to create metadata for 
|the raw data that allows us fast queries to aggregrate via primary key.|
|Bucketing|
|A family of aggregations that build buckets, where each bucket|
|is associated with a key and an EventType criterion. When the|
|aggregation is executed, all the buckets criteria are evaluated|
|on every EventType in the context and when a criterion matches,|
|the EventType is considered to "fall in" the relevant bucket.|
|By the end of the aggregation process, we’ll end up with a|
|list of buckets - each one with a set of EventTypes that|
|"belong" to it.|
 

The idea is that you should be able to send JSON formated logs to Amazon Kinesis and use the Apache Spark Stream Kinesis integration to process each of the events. For example, below is an "input" example of a raw log that we will be sending to Kinesis. If everything runs as expected, you will find "output" similar to DyanmoDB table below after running this example project.

__Input: Example of a raw events encoded in JSON with ISO 8601 Date format__

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


*__Amazon Security Credentials__
When you interact with AWS, you use AWS security credentials to verify who you are and whether you have permission to access the resources you are requesting. In other words, security credentials are used to authenticate and authorize calls that you make to AWS.*
[Read more about AWS Credentials](http://docs.aws.amazon.com/general/latest/gr/aws-security-credentials.html)
[Read more about AWS Command Line Tools and Credentials](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)

####Prerequistes software you will need installed to running this project 
* ensure you have [git](https://help.github.com/articles/set-up-git/) to get the code
* use [maven](https://maven.apache.org/guides/getting-started/maven-in-five-minutes.html) to compile Spark
* you are going to use [sbt](http://www.scala-sbt.org/release/tutorial/Setup.html) to compile this project
* ofcourse you will need the JVM and [Scala](http://www.scala-lang.org/download/install.html)

## Getting this project up and running
In this tutorial, we will walk through the process of getting up and running with Amazon Kinesis.

####Step 1: Get the code and getting the project compiled

1. In your terminal, clone the __Spark-Streaming-Example-Project__.

 ```bash
 host> git clone https://github.com/snowplow/spark-streaming-example-project.git
 ```
2. Change the directory to __Spark-Streaming-Example-Project__.

 ```bash
 host> cd spark-streaming-example-project.git
 ```
3. Build the project __Spark-Streaming-Example-Project__.

 ```bash
 host> sbt assembly
 ```
 https://bigsnarf.files.wordpress.com/2015/05/screen-shot-2015-05-31-at-10-42-50-am.png

 The 'fat jar' is now available as:

```bash
target/scala-2.10/simple-project_2.10-0.1.jar
```

![data compile png][data-compile]
 
 While this runs, let's make sure you have AWS.

####Step 2: Get your AWS IAM credentials and configure it using AWS CLI

https://bigsnarf.files.wordpress.com/2015/05/screen-shot-2015-06-02-at-9-21-06-am.png

```bash
vagrant@spark-streaming-example-project:/vagrant$ inv configure_aws_credentials
AWS Access Key ID [None]: asdf897asdf798asdf
AWS Secret Access Key [None]: GJWEV99089FJC93J3209D23J
Default region name [None]: us-east-1
Default output format [None]: json
```

Need more information or need keys? Try FAQ? Get started with AWS links below.

* http://aws.amazon.com/getting-started/
* http://docs.aws.amazon.com/general/latest/gr/aws-security-credentials.html
* http://docs.aws.amazon.com/cli/latest/userguide/installing.html
* http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html


####Step 3: Set up Kinesis

See blog
https://bigsnarf.wordpress.com/2015/05/31/creating-kinesis-stream-in-pictures/

####Step 4: Get and compile Spark with Kinesis Support
See blog

On my Macbook I had to specify the maven memory requirements in my Terminal:

```bash
host> export MAVEN_OPTS="-Xmx2g -XX:MaxPermSize=512M -XX:ReservedCodeCacheSize=512m"
```

Then I was able to issue the maven build command to compile Spark to get data from Kinesis:
```bash
host>   mvn -Pkinesis-asl -DskipTests clean package
```

https://spark.apache.org/docs/1.1.0/building-with-maven.html

https://bigsnarf.wordpress.com/2015/05/31/compile-apache-spark-with-kinesis-support/
https://spark.apache.org/docs/latest/streaming-kinesis-integration.html

####Step 5: Run the Python script to load data to Kinesis
cd scripts
screenshot of where you should be
install boto
make sure keys in creds file
screenshot of what should look like
using python 
https://bigsnarf.files.wordpress.com/2015/05/screen-shot-2015-05-21-at-5-14-41-pm.png

####Step 6: checking the compile of Apache Spark with Kinesis
screenshot of jar in folder
test with spark-shell
:q


####Step 7: Open
https://bigsnarf.files.wordpress.com/2015/05/screen-shot-2015-05-31-at-11-08-29-am.png


####Step 8: Submit your application to Spark
```bash
host> /spark/bin/spark-submit \
--class com.snowplowanalytics.spark.streaming.StreamingCountsApp \
--master local[2] \
/spark-streaming-example-project/target/scala-2.10/spark-streaming-example-project-0.1.0.jar \
--config /spark-streaming-example-project/src/main/resources/config.hocon.sample
```



####Step 9: Check that things are working
https://bigsnarf.files.wordpress.com/2015/05/screen-shot-2015-05-23-at-10-40-15-am.png

####Step 10: Look at your aggregate data
https://bigsnarf.files.wordpress.com/2015/05/screen-shot-2015-05-21-at-5-12-11-pm.png

####Step 11: Shut everything down


## Frequently asked questions
This is a short list of our most frequently asked questions. For more information about this project create an issue on the Github project page.


__When using command "inv create_dynamodb_table", I get this error:__

```bash
boto.exception.NoAuthHandlerFound: No handler was ready to authenticate. 1 handlers were checked. ['HmacAuthV4Handler'] Check your credentials
```
*Answer - http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html*




## Next steps

Exciting sets as we move forward with this simple example and build on this projects streaming model and put some decision making into the processing pipeline.

MEOW

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
[data-compile]: /assets/img/blog/2015/06/compileProject.png

