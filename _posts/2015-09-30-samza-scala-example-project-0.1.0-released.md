---
layout: post
title: Samza Scala example project released
title-short: Samza Scala example project
tags: [apache, samza, scala, kafka]
author: Alex
category: Releases
---

We are pleased to announce the release of our new [Samza Scala Example Project] [repo]!

This is a simple stream processing job written in Scala for the [Apache Samza] [samza] framework, processing JSON events from an [Apache Kafka] [kafka] topic and regularly emitting aggregates to a second Kafka topic:

![job-flow-image][job-flow-image]

This project was built by the Data Engineering team at [Snowplow Analytics] [snowplow] as a proof-of-concept for porting the [Snowplow Enrichment] [scala-common-enrich] process (which is written in Scala) to Samza.

Read on after the fold for:

1. [What are Apache Samza and Kafka?](/blog/2015/09/30/samza-scala-example-project-0.1.0-released/#what-are-samza-and-kafka)
2. [Introducing our stream processing job](/blog/2015/09/30/samza-scala-example-project-0.1.0-released/#introducing-our-job)
3. [Detailed setup](/blog/2015/09/30/samza-scala-example-project-0.1.0-released/#detailed-setup)
4. [Further reading](/blog/2015/09/30/samza-scala-example-project-0.1.0-released/#further-reading)

<!--more-->

<h2 id="what-are-samza-and-kafka">1. What are Apache Samza and Kafka?</h2>

[Apache Kafka] [kafka] is a unified log technology, which is "designed to allow a single cluster to serve as the central data backbone for a large organization". Regular readers of this blog may be more familiar with Amazon Kinesis - you can think of Kafka broadly as like a self-hosted version of Kinesis.

[Apache Samza] [samza] is a stateful stream processing framework from the team at LinkedIn. It has tight integration with Apache Kafka, and is designed to operate inside a resource-management/scheduler platform such as Apache YARN. Samza is similar to the more well-known Apache Storm framework, but Samza is in our view easier to operate than Storm and its stream processing topologies are easier to reason about.

<h2 id="introducting-our-job">2. Introducing our stream processing job</h2>

We have implemented a simple analytics-on-write stream processing job using Apache Samza. Our Samza job reads a Kafka topic, `example-project-inbound`, containing "inbound" events in a JSON format:

{% highlight json %}
{
  "timestamp": "2015-06-05T12:54:43Z",
  "type": "Green",
  "id": "4ec80fb1-0963-4e35-8f54-ce760499d974"
}
{% endhighlight %}

Our job counts the events by `type` and aggregates these counts into 1 minute buckets based on the `timestamp`.

Every 30 seconds, our job emits a "window summary" event to a second Kafka topic, `example-project-window-summary`, where this event reports the new counts for any type-bucket pairs which have been updated in the past 30 seconds.

<h2 name="detailed-setup">3. Detailed setup</h2>

In this tutorial, we'll walk through the process of getting up and running with Amazon Kinesis and AWS Lambda Service. You will need [git] [git-install], [Vagrant] [vagrant-install] and [VirtualBox] [virtualbox-install] installed locally.

<h3>Step 1: Build the project</h3>

First clone the repo and bring up Vagrant:

{% highlight bash %}
 host$ git clone https://github.com/snowplow/samza-scala-example-project.git
 host$ cd samza-scala-example-project
 host$ vagrant up && vagrant ssh
guest$ cd /vagrant
guest$ sbt compile
{% endhighlight %}

Note that `vagrant up` will install everything we need to compile and run our Samza job - including Java, Scala, ZooKeeper, Kafka and YARN.

The rest of the detailed setup assumes you are still inside the Vagrant guest.

<h3>Step 2: Package our job for deployment</h3>

Using Tim Harper's custom SBT tasks, packaging our job is straightforward:

{% highlight bash %}
$ sbt packageJob
...
[info] Extracting /vagrant/target/samza-shell-0.9.1-dist.tgz to /vagrant/target/pack/bin
[success] Total time: 15 s, completed 30-Sep-2015 15:10:39
{% endhighlight %}

You should now have a package job artifact available as `target/samza-scala-example-project-0.1.0-dist.tar.gz`.

<h3>Step 3: Deploy our job to YARN</h3>

Now we are ready to submit our Samza job to [Apache YARN] [yarn], the resource-manager and scheduler. Once submitted, YARN will take on responsibility for running our new Samza job and allocating it the resources it needs (even spinning up multiple copies of our job).

First, extract our packaged job artifact to a deployment folder:

{% highlight bash %}
$ tar -xvf ./target/samza-scala-example-project-0.1.0-dist.tar.gz -C deploy/samza
{% endhighlight %}

Now we can deploy our job to YARN:

{% highlight bash %}
$ deploy/samza/bin/run-job.sh \
  --config-factory=org.apache.samza.config.factories.PropertiesConfigFactory \
  --config-path=file://$PWD/deploy/samza/config/example-project.properties
...
2015-09-30 15:14:55 JobRunner [INFO] waiting for job to start
2015-09-30 15:14:55 JobRunner [INFO] job started successfully - Running
2015-09-30 15:14:55 JobRunner [INFO] exiting
{% endhighlight %}

On your host machine, browse to the Samza web UI at [http://localhost:8088] [samza-web-ui] to watch your job starting up:

![yarn-cluster-image][yarn-cluster-image]

<h3>Step 4: Check our window summary topic</h3>

Our Samza job will automatically create the Kafka topics for us if they don't already exist. Confirm this with this command:

{% highlight bash %}
$ /vagrant/vagrant/grid-deploy/kafka/bin/kafka-topics.sh --list --zookeeper localhost:2181
__samza_checkpoint_ver_1_for_samza-scala-example-project_1
example-project-changelog
example-project-inbound
example-project-window-summary
{% endhighlight %}

Let's run a tail on the last topic, `example-project-window-summary`:

{% highlight bash %}
$ /vagrant/vagrant/grid-deploy/kafka/bin/kafka-console-consumer.sh \
  --topic example-project-window-summary --from-beginning \
  --zookeeper localhost:2181
{"id":"66d664e2-4583-4a98-8e1a-64836d785395","timestamp":"2015-09-30T15:57:57Z","counts":{}}
{"id":"d2b2cde2-9fe0-4ba8-b8bd-e84d83e9fa74","timestamp":"2015-09-30T15:58:27Z","counts":{}}
{"id":"2999c544-ed2f-4e47-9521-0a3ade9e2ff8","timestamp":"2015-09-30T15:58:57Z","counts":{}}
{% endhighlight %}

Good - you can see that our job is emitting a window summary event every 30 seconds.

So far the "counts" property is empty because our Samza job hasn't received any inbound events yet. Let's change that.

<h3>Step 5: Send in some inbound events</h3>

Now let's send in some "inbound" events into our `example-project-inbound` topic. In a new terminal, run this command:

{% highlight bash %}
$ /vagrant/vagrant/grid-deploy/kafka/bin/kafka-console-producer.sh \
  --broker-list localhost:9092 --topic example-project-inbound
[2015-09-30 15:59:16,687] WARN Property topic is not valid (kafka.utils.VerifiableProperties)
{% endhighlight %}

This producer will sit waiting for input. Let’s feed it some events, making sure to hit enter after every line:

{% highlight bash %}
{"timestamp": "2015-06-05T12:54:43Z", "type": "Green", "id": "4ec80fb1-0963-4e35-8f54-ce760499d974"}
{"timestamp": "2015-06-05T12:55:43Z", "type": "Red", "id": "eb84b0d1-f793-4213-8a65-2fb09eab8c5c"}
{"timestamp": "2015-06-05T12:56:44Z", "type": "Yellow", "id": "4654bdc8-86d4-44a3-9920-fee7939e2582"}
{% endhighlight %}

<h3>Step 6: Check the window summary topic again</h3>

Now switch back to your consumer terminal and wait a few seconds:

{% highlight bash %}
{"id":"6717d0a1-3bd5-4bde-86a3-1bb057d405a0","timestamp":"2015-09-30T15:59:27Z","counts":{}}
{"id":"4cbe5371-15f9-407e-832e-a1265038055f","timestamp":"2015-09-30T15:59:57Z","counts":{"2015-06-05T12:55:00.000\u001FRed":1,"2015-06-05T12:56:00.000\u001FYellow":1,"2015-06-05T12:54:00.000\u001FGreen":1}}
{"id":"c876f265-d8fa-4208-bda9-44bfe5d94f11","timestamp":"2015-09-30T16:00:27Z","counts":{}}
{% endhighlight %}

Great! The "window summary" event in the middle of this output now reports the totals for each event type, by 1 minute bucket.

To prove that we are using Samza's key-value store to track all-time counts, go back to your producer terminal and add in another event:

{% highlight bash %}
{"timestamp": "2015-06-05T12:54:12Z", "type": "Green", "id": "4ec80fb1-0963-4e35-8f54-ce760499d974"}
{% endhighlight %}

Now back in your consumer terminal:

{% highlight bash %}
{"id":"bf3556a6-e8a5-46a7-ac40-ac28cfc39f16","timestamp":"2015-09-30T16:09:27Z","counts":{}}
{"id":"3529e533-91d9-4e56-8b56-0aedcb9972e1","timestamp":"2015-09-30T16:09:57Z","counts":{"2015-06-05T12:54:00.000\u001FGreen":2}}
{"id":"cb5f82cb-ba88-46f0-9b11-0f87d196cc6f","timestamp":"2015-09-30T16:10:27Z","counts":{}}
{% endhighlight %}

Excellent! Our count for Green events for the 2015-06-05T12:54:00.000 minute has now risen to 2.

<h2 id="further-reading">4. Further reading</h2>

The tutorial materials in this README for getting started with Samza, YARN and Kafka are adapted from Chapters 2-4 of Alex Dean's [Unified Log Processing] [dean-ulp] book.

This project draws heavily on various analytics-on-write example projects from Snowplow:

* [Spark Streaming Example Project] [spark-streaming-example-project]
* [AWS Lambda Scala Example Project] [aws-lambda-scala-example-project]
* [AWS Lambda Node.js Example Project] [aws-lambda-nodejs-example-project]

All of these four example projects are based on an event processing technique called _analytics-on-write_. We are planning on exploring these techniques further in a new project, called [Icebucket] [icebucket]. Stay tuned for more on this!

[repo]: https://github.com/snowplow/samza-scala-example-project

[snowplow]: http://snowplowanalytics.com/
[scala-common-enrich]: https://github.com/snowplow/snowplow/tree/master/3-enrich/scala-common-enrich
[samza]: http://samza.apache.org/
[yarn]: http://hadoop.apache.org/docs/current/hadoop-yarn/hadoop-yarn-site/YARN.html
[kafka]: http://kafka.apache.org/
[icebucket]: https://github.com/snowplow/icebucket

[yarn-cluster-image]: /assets/img/blog/2015/09/yarn-cluster.png
[job-flow-image]: /assets/img/blog/2015/09/job-flow.png

[dean-ulp]: https://www.manning.com/books/unified-log-processing

[samza-web-ui]: http://localhost:8088

[spark-streaming-example-project]: https://github.com/snowplow/spark-streaming-example-project
[aws-lambda-scala-example-project]: https://github.com/snowplow/aws-lambda-scala-example-project
[aws-lambda-nodejs-example-project]: https://github.com/snowplow/aws-lambda-nodejs-example-project

[issue-1]: https://github.com/snowplow/samza-scala-example-project/issues/1
[issue-2]: https://github.com/snowplow/samza-scala-example-project/issues/2
[issue-3]: https://github.com/snowplow/samza-scala-example-project/issues/3

[git-install]: https://help.github.com/articles/set-up-git/
[vagrant-install]: http://docs.vagrantup.com/v2/installation/index.html
[virtualbox-install]: https://www.virtualbox.org/wiki/Downloads

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
