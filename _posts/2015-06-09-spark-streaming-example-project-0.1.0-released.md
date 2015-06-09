---
layout: post
shortenedlink: Apache Spark Streaming Example Project
title: Apache Spark Streaming at Snowplow
tags: [snowplow, scala, spark, tutorial, example, analytics]
author: Vincent
category: Releases
---

![data flow png][data-flow]

We are pleased to announce the release of the new [Snowplow Apache Spark Streaming Example Project][repo]! This initial release allows you to send simple events to Amazon Kinesis and process/aggregate them with Apache Spark Streaming. Spark will save the output to Amazon DynamoDB. A real-time stream processing system packaged as a demo application for you to build. 

####In this post
The [Snowplow Apache Spark Streaming Example Project][repo] can help you jumpstart your own real-time event processing pipeline. We will take you through the steps to get this simple time series analysis streaming job written in Scala up and processing data.

1. [What is Spark Streaming and Kinesis?](#1-what-is-spark-streaming-and-kinesis)
2. [App overview, introducing analytics on write](#2-app-overview-introducting-analytics-on-write)
3. [Detailed setup](#3-detailed-setup)
4. [Troubleshooting](#4-troubleshooting)
5. [Next steps](#5-next-steps)

<a name="#1-what-is-spark-streaming-and-kinesis" />
##What is Spark Streaming and Kinesis?

__Amazon Kinesis__ is a fully managed service for real-time processing of streaming data at massive scale. In this project we leverage the Kinesis receiver that has been recently developed for __[Apache Spark DStream using the Kinesis Client Library](https://spark.apache.org/docs/latest/streaming-kinesis-integration.html)__ (KCL).

__Apache Spark Streaming__ enables scalable, high-throughput, fault-tolerant stream processing of live data streams. Our raw data will be ingested from Kinesis by our application written for the [Spark] [spark] computing platform.

<a name="#2-app-overview-introducting-analytics-on-write" />
##App overview, introduction analytics on write

__First__, this app generates/sends raw events to AWS Kinesis. __Second__, we process the raw events with Apache Spark Streaming. Our data processing sorts each event into a "bucket". __Third__, Spark aggregates the raw events into 1 minute buckets. __Last__, this Spark app takes the aggregate records and saves them into AWS DynamoDB Database.


> Analytics on write concepts
>----------------------------
>__Downsampling__
>We are parsing the ISO 8601 datetime stamp down to the minute.
>This technique is referred to as downsampling or reducing precision,
>aka "bucketing". It's an interesting way to create metadata for
>the raw data that allows us fast queries to aggregrate via primary key.
>
>__Bucketing__
>An aggregation technique that builds buckets, where each bucket
>is associated with a key and an EventType criterion. When the
>aggregation is executed, all the bucket's criteria are evaluated
>on every EventType in the context and when a criterion matches,
>the EventType is considered to "fall in" the relevant bucket.
>By the end of the aggregation process, we’ll end up with a
>list of buckets - each one with a set of EventTypes that
>"belong" to it.


Following is a sample __input__ of a raw logs sent to Kinesis. If everything runs as expected, __output__ similar to the DyanmoDB table below will result. The idea is that you should be able to send JSON formatted logs to Amazon Kinesis and use the Apache Spark Stream Kinesis integration to process each of the events. 

__Input: Example of a raw events encoded in JSON with ISO 8601 Date format__

```bash
{"timestamp": "2015-06-05T12:54:43.064528", "type": "Green", "id": "4ec80fb1-0963-4e35-8f54-ce760499d974"}
{"timestamp": "2015-06-05T12:54:43.757797", "type": "Red", "id": "eb84b0d1-f793-4213-8a65-2fb09eab8c5c"}
{"timestamp": "2015-06-05T12:54:44.295972", "type": "Yellow", "id": "4654bdc8-86d4-44a3-9920-fee7939e2582"}
```

__Ouput: Example of the DynamoDB table__
![data table png][data-table]

<a name="#3-detailed-setup" />
##Detailed setup
In this tutorial, we'll walk through the process of getting up and running with Amazon Kinesis and Apache Spark. We assume you have an Internet connection so we can access services and download code from github. Also, you will need  [git](https://help.github.com/articles/set-up-git/), [Vagrant] [vagrant-install] and [VirtualBox] [virtualbox-install]  installed locally. This project is specifically configured to run in AWS region "us-east-1" to ensure all AWS services are available. Building Spark on a vagrant box requires RAM. Ensure you have at least 8GB of RAM and 64 bit OS hosting vagrant.

####Step 1: You can use our pre-built vagrant box to run the [spark-streaming-sample-project][repo]
In your local Terminal:

```bash
 host> git clone https://github.com/snowplow/spark-streaming-example-project
 host> cd spark-streaming-example-project
 host> vagrant up && vagrant ssh
```
Build the project:
```bash
guest> cd /vagrant
guest> inv assemble_project
```
####Step 2: Add AWS credentials to the vagrant box 

You're going to need IAM-based credentials for AWS.  In your vagrant terminal, change directory into vagrant root:

 ```bash
vagrant@spark-streaming-example-project:/$ cd /vagrant
 ```

Then, get your keys and "inv create_profile" in the vagrant box. In the example, I'm giving my profile the name of "my-profile" and setting the region to "us-east-1".
```bash
$ inv create_profile my-profile
AWS Access Key ID [None]: ADD_YOUR_ACCESS_KEY_HERE
AWS Secret Access Key [None]: ADD_YOUR_SECRET_KEY_HERE
Default region name [None]: us-east-1
Default output format [None]:
```

*__[Amazon Security Credentials](http://docs.aws.amazon.com/general/latest/gr/aws-security-credentials.html)__
When you interact with AWS, you use AWS security credentials to verify who you are and whether you have permission to access the resources you're requesting. In other words, security credentials are used to authenticate and authorize calls that you make to AWS. NOTE: Make sure the account has permissions for Kinesis and DynamoDB services.*

* Need keys? http://aws.amazon.com/, and then click Sign Up.
* http://docs.aws.amazon.com/cli/latest/userguide/installing.html
* http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html

####Step 3: Create your Kinesis Stream

We're going to set up the Kinesis stream in the Terminal of your vagrant box. Your first step is to create a stream and verify that it was successful. Use the following command to create a stream named "my-stream":

```bash
$ inv create_kinesis_stream my-profile my-stream
```

For this part of the tutorial, you're using one shard in your stream. If you check the stream and it returns with status CREATING, it means that the Kinesis stream not quite ready to use. Check again in a few moments, and you should see output similar to the below noted example:


```bash
$ inv describe_kinesis_stream my-profile my-stream
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
```


####Step 4: Create DynamoDB Table where the aggregate records are going to be stored

I'm using "my-table" as the table name. Invoke the creation of the table with:

```bash
$ inv create_dynamodb_table my-profile us-east-1 my-table
```

####Step 5: Generating raw events to your Kinesis Stream

We want to make sure that __"StreamStatus": "ACTIVE"__, which tells you the stream is ready to be used.
After the stream becomes "ACTIVE", you can start sending events to the stream by:

```bash
$ inv generate_events my-profile us-east-1 my-stream
Event sent to Kinesis: {"timestamp": "2015-06-05T12:54:43.064528", "type": "Green", "id": "4ec80fb1-0963-4e35-8f54-ce760499d974"}
Event sent to Kinesis: {"timestamp": "2015-06-05T12:54:43.757797", "type": "Red", "id": "eb84b0d1-f793-4213-8a65-2fb09eab8c5c"}
Event sent to Kinesis: {"timestamp": "2015-06-05T12:54:44.295972", "type": "Yellow", "id": "4654bdc8-86d4-44a3-9920-fee7939e2582"}
...
```


####Step 6: Building Spark Streaming with Kinesis support

We can issue the invoke command to build Spark so it can get data from Kinesis:
```bash
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
```

*__Building Apache Spark with Kinesis support__
Spark now comes packaged with a self-contained Maven installation to ease building and deployment of Spark from source located under the build/ directory. This script will automatically download and setup all necessary build requirements (Maven, Scala, and Zinc) locally within the build/ directory itself. It honors any mvn binary if present already, however, will pull down its own copy of Scala and Zinc regardless to ensure proper version requirements are met. build/mvn execution acts as a pass through to the mvn call allowing easy transition from previous build methods. As an example, one can build a version of Spark as follows:*
[Read more about building Spark](https://spark.apache.org/docs/latest/building-spark.html#setting-up-mavens-memory-usage)


Get more details about building Apache Spark:
* https://spark.apache.org/docs/1.1.0/building-with-maven.html
* https://spark.apache.org/docs/latest/streaming-kinesis-integration.html

####Step 7: Submit your application to Spark
Open a new terminal window. Start a second shell into the vagrant box with:
```bash
host> vagrant ssh
```
Start Apache Spark Streaming system with this command:
```bash
vagrant@spark-streaming-example-project:/vagrant$   inv run_project config/config.hocon.sample

```

If you have updated any of the configuration options above (e.g. stream name or region), then you will have to update the __config.hocon.sample__ file accordingly.


> SIDE NOTE: Under the covers, we're submitting the compiled spark-streaming-example-project jar to SPARK-SUBMIT via __inv run_project config/config.hocon.sample__

> ```bash
> guest> ./spark/bin/spark-submit \
>                        --class com.snowplowanalytics.spark.streaming.StreamingCountsApp \
>                        --master local[4] \
>                        ./target/scala-2.10/spark-streaming-example-project-0.1.0.jar \
>                        --config ./config/config.hocon.sample
>```

####Step 8: Two new DynamoDB Tables - my-table and StreamingCountsApp

Browse to http://aws.amazon.com/console/ and check that data is making it to your DynamoDB table. You'll notice two tables get created. StreamingCountsApp is the table that gets used by Spark for checkpointing Kinesis position. A second table gets created by Spark to send the aggregated data. This is the power of "analytics on write" process in action.
![dynamodb screenshot png][dynamodb-table]

####Step 9: Inspect the "my-table" table in DynamoDB

Success! You should see data being written to the table in DynamoDB.
![data table png][data-table]

####Step 10: Shut everything down
Remember to shut off:
* Python data loading script
* Control C to shutdown Spark
* Delete Kinesis stream
* Delete my-table Table
* Delete StreamingCountingApp table
* Exit vagrant instance
* Vagrant halt
* Vagrant destroy

<a name="#4-troubleshooting" />
##TroubleShooting
This is a short list of our most frequently asked questions. For more information about this project, create an [issue on the Github project page](https://github.com/snowplow/spark-streaming-example-project/issues).

__When using command "inv create_dynamodb_table", I get this error:__

```bash
boto.exception.NoAuthHandlerFound: No handler was ready to authenticate. 1 handlers were checked. ['HmacAuthV4Handler'] Check your credentials
```
*Answer - http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html*

__Got an out of memory error when trying to build Apache Spark:__

* Answer - Try setting memory requirements of maven with:
```bash
host> export MAVEN_OPTS="-Xmx2g -XX:MaxPermSize=512M -XX:ReservedCodeCacheSize=512m"
```

__I found an issue with the project:__
* Answer - Feel free to [get in touch](https://github.com/snowplow/snowplow/wiki/Talk-to-us) or [raise an issue on GitHub](https://github.com/snowplow/spark-streaming-example-project/issues)!

<a name="#4-next-steps" />
## Next steps

Did you see our Spark Job project? Catch up on our newly released Version 0.3.0 of the [spark-example-project](https://github.com/snowplow/spark-example-project). 

Like to read more on what we're doing with Kinesis at Snowplow? We've built another demonstration application here in our original [amazon-kinesis-tutorial](http://snowplowanalytics.com/blog/2014/01/15/amazon-kinesis-tutorial-getting-started-guide/) post.

We are also building useful tools for the Spark platform. Recently, we detailed our [first-experiments-with-spark](http://snowplowanalytics.com/blog/2015/05/21/first-experiments-with-apache-spark/) in this post.

This simple streaming example has a simple event model. We are hoping to put some decision making into the processing pipeline in a future post, so stay tuned.


[repo]: https://github.com/snowplow/spark-streaming-example-project
[spark-logo]: /assets/img/blog/2015/06/spark-streaming.png
[data-flow]: /assets/img/blog/2015/06/kinesis.png
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
[compile-spark]: /assets/img/blog/2015/06/compileSparkKinesis.png
[get-credentials]: /assets/img/blog/2015/06/getAWScredentials.png
[dynamodb-table]: /assets/img/blog/2015/06/aggregateRecords.png
[raw-logs]: /assets/img/blog/2015/06/rawLogs.png
[dynamodb-aggregate]: /assets/img/blog/2015/06/aggregateRecords2.png
