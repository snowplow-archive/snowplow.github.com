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
The [Snowplow Apache Spark Streaming Example Project][repo] can help you jumpstart your own real-time event processing pipeline. We will take you through the steps to get this simple time series analysis streaming job written in Scala.

1. What is Spark Streaming and Kinesis?
2. App overview, introducing analytics on write
3. Detailed setup
4. Results
5. Troubleshooting
6. Next Steps
 

* [Input to this program](/blog/2015/06/01/spark-streaming-example-project/#input)
* [Output to this program](/blog/2015/06/01/spark-streaming-example-project/#output)
* [User Quickstart](/blog/2015/06/01/spark-streaming-example-project/#quickstart)
* [Get your project up and running with this step-by-step tutorial](/blog/2015/06/01/spark-streaming-example-project/#get)
* [WIP -- Next jump results](/blog/2015/06/01/spark-streaming-example-project/#get)
* [Frequently Asked Questions](/blog/2015/06/01/spark-streaming-example-project/#faq)
* 

##What is Spark Streaming and Kinesis?

__Amazon Kinesis__ is a fully managed service for real-time processing of streaming data at massive scale. In this project we leverage the Kinesis receiver that has been recently developed for __[Apache Spark DStream using the Kinesis Client Library](https://spark.apache.org/docs/latest/streaming-kinesis-integration.html)__ (KCL).

__Apache Spark Streaming__ enables scalable, high-throughput, fault-tolerant stream processing of live data streams. Our raw data will be ingested from Kinesis by our application written for the [Spark] [spark] computing platform.


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
{ "dateString": "2015-06-22T00:23:24.306091", "eventType": "Red" }
{ "dateString": "2015-06-22T00:23:24.450129", "eventType": "Yellow" }
{ "dateString": "2015-06-22T00:23:24.826703", "eventType": "Blue" }
```

__Ouput: Example of the DynamoDB table__
![data table png][data-table]


<h2><a name="get">Detailed setup</a></h2>
In this tutorial, we'll walk through the process of getting up and running with Amazon Kinesis and Apache Spark.

####Step 1: You can also use our prebuilt vagrant box to run the [spark-streaming-sample-project][repo]
Assuming [git](https://help.github.com/articles/set-up-git/), [Vagrant] [vagrant-install] and [VirtualBox] [virtualbox-install] are locally installed:

```bash
 host> git clone https://github.com/snowplow/spark-streaming-example-project
 host> cd spark-streaming-example-project
 host> vagrant up && vagrant ssh
 guest> cd /vagrant
 guest> sbt assembly
```


####Step 2: Get the code and getting the project compiled

1. In your terminal, clone the __[Spark-Streaming-Example-Project][repo]__.

 ```bash
 host> git clone https://github.com/snowplow/spark-streaming-example-project.git
 ```
2. Change the directory to __[Spark-Streaming-Example-Project][repo]__.

 ```bash
 host> cd spark-streaming-example-project.git
 ```
3. Build the project  __[Spark-Streaming-Example-Project][repo]__.

 ```bash
 host> sbt assembly
 ```

The "fat jar" is now available as:

```bash
target/scala-2.10/simple-project_2.10-0.1.jar
```

While this runs, let's make sure you have AWS.

####Step 3: Get your AWS IAM credentials and configure it using AWS CLI

You're going to need IAM-based credentials for AWS. So get your keys ready
and "inv configure_aws_credentials" in the vagrant box.  

```bash
vagrant@spark-streaming-example-project:/vagrant$ inv configure_aws_credentials
AWS Access Key ID [None]: asdf897asdf798asdf
AWS Secret Access Key [None]: GJWEV99089FJC93J3209D23J
Default region name [None]: us-east-1
Default output format [None]: json
```

*__[Amazon Security Credentials](http://docs.aws.amazon.com/general/latest/gr/aws-security-credentials.html)__
When you interact with AWS, you use AWS security credentials to verify who you are and whether you have permission to access the resources you are requesting. In other words, security credentials are used to authenticate and authorize calls that you make to AWS. NOTE: Make sure the account has permissions for Kinesis and DynamoDB services*

* http://aws.amazon.com/getting-started/
* http://docs.aws.amazon.com/cli/latest/userguide/installing.html
* http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html


####Step 4: Set up Kinesis

We're going to set up the Kinesis stream using AWS console. In your favourite browser, paste this URL to get to the AWS console:
```
https://console.aws.amazon.com/kinesis/home?region=us-east-1
```

####Step 5: Get and compile Spark with Kinesis Support

In the vagrant box, I had to specify the maven memory requirements in my Terminal:

```bash
guest> export MAVEN_OPTS="-Xmx2g -XX:MaxPermSize=512M -XX:ReservedCodeCacheSize=512m"
```

Then I was able to issue the maven build command to compile Spark to get data from Kinesis:
```bash
guest>   mvn -Pkinesis-asl -DskipTests clean package
```

*__Building Apache Spark with Kinesis support__
Spark now comes packaged with a self-contained Maven installation to ease building and deployment of Spark from source located under the build/ directory. This script will automatically download and setup all necessary build requirements (Maven, Scala, and Zinc) locally within the build/ directory itself. It honors any mvn binary if present already, however, will pull down its own copy of Scala and Zinc regardless to ensure proper version requirements are met. build/mvn execution acts as a pass through to the mvn call allowing easy transition from previous build methods. As an example, one can build a version of Spark as follows:*
[Read more about building Spark](https://spark.apache.org/docs/latest/building-spark.html#setting-up-mavens-memory-usage)


Get more details about building Apache Spark:
* https://spark.apache.org/docs/1.1.0/building-with-maven.html
* https://spark.apache.org/docs/latest/streaming-kinesis-integration.html

####Step 6: Run the Python script to load data to Kinesis
```bash
guest> inv load_json_kinesis
```
![raw logs png][raw-logs]

####Step 7: Submit your application to Spark
```bash
host> spark/bin/spark-submit \
                       --class com.snowplowanalytics.spark.streaming.StreamingCountsApp \
                       --master local[2] \
                       spark-streaming-example-project/target/scala-2.10/spark-streaming-example-project-0.1.0.jar \
                       --config spark-streaming-example-project/src/main/resources/config.hocon.sample
```


####Step 8: DynamoDB Tables. AggregateRecords is our output table. StreamingCountsApp is the table for checkpointing Kinesis position
![dynamodb screenshot png][dynamodb-table]

####Step 9: AggregateRecords table in DynamoDB
![dynamodb aggregate png][dynamodb-aggregate]

####Step 10: Shut everything down
Remember to shut off:
* Python data loading script
* Control C to shutdown Spark
* Delete Kinesis stream
* Delete AggregrateRecords Table
* Delete StreamingCountingApp table
* Exit vagrant instance
* Vagrant halt
* Vagrant destroy

##TroubleShooting
This is a short list of our most frequently asked questions. For more information about this project create an [issue on the Github project page](https://github.com/snowplow/spark-streaming-example-project/issues).


__When using command "inv create_dynamodb_table", I get this error:__

```bash
boto.exception.NoAuthHandlerFound: No handler was ready to authenticate. 1 handlers were checked. ['HmacAuthV4Handler'] Check your credentials
```
*Answer - http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html*

__Got an out of memory error when tyring to build Apache Spark:__

* Answer - Try setting memory requirements of maven with:
```bash
host> export MAVEN_OPTS="-Xmx2g -XX:MaxPermSize=512M -XX:ReservedCodeCacheSize=512m"
```

__Still getting memory issue with compiling Spark with maven:__
* Answer - Try reducing the memory requirements of maven to:

```bash
host> export MAVEN_OPTS="-Xmx1g -XX:MaxPermSize=256M -XX:ReservedCodeCacheSize=256m"
```

__I found an issue with the project:__
* Answer - Feel free to [get in touch](https://github.com/snowplow/snowplow/wiki/Talk-to-us) or [raise an issue on GitHub](https://github.com/snowplow/spark-streaming-example-project/issues)!

## Next steps

Did you see our Spark Job project? Catch up on our newly released Version 0.3.0 of the [spark-example-project](https://github.com/snowplow/spark-example-project). 

Like to read more on what we're doing with Kinesis at Snowplow? We've built another demonstration application here in our original [amazon-kinesis-tutorial](http://snowplowanalytics.com/blog/2014/01/15/amazon-kinesis-tutorial-getting-started-guide/) post.

We are also building useful tools for the Spark platform. Recently, we detailed our [first-experiments-with-spark](http://snowplowanalytics.com/blog/2015/05/21/first-experiments-with-apache-spark/) in this post.

This simple streaming example has a simple event model. We are hoping to put some decision making into the processing pipeline in a future post, so stay tuned.

MEOW

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
[setup-kinesis00]: /assets/img/blog/2015/06/00-signin-aws.png
[setup-kinesis01]: /assets/img/blog/2015/06/01-login-kinesis.png
[setup-kinesis02]: /assets/img/blog/2015/06/02-landing-page-aws.png
[setup-kinesis03]: /assets/img/blog/2015/06/03-create-stream.png
[setup-kinesis04]: /assets/img/blog/2015/06/04-create-kinesis-event-stream.png
[setup-kinesis05]: /assets/img/blog/2015/06/05-waiting-creating-streem.png
[setup-kinesis06]: /assets/img/blog/2015/06/06-stream-created-feedback.png
[setup-kinesis07]: /assets/img/blog/2015/06/07-notice-no-events.png
[dynamodb-table]: /assets/img/blog/2015/06/aggregateRecords.png
[raw-logs]: /assets/img/blog/2015/06/rawLogs.png
[dynamodb-aggregate]: /assets/img/blog/2015/06/aggregateRecords2.png
