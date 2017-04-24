---
layout: post
title: GCP Dataflow streaming example project
title-short: GCP Dataflow streaming example project
tags: [snowplow, scala, google, gcp, dataflow, pubsub, bigtable, tutorial, analytics]
author: Gui
category: Releases
---

We are pleased to announce the release of our new [GCP Dataflow Streaming Example Project] [repo]!

This is a simple time series analysis stream processing job written in Scala for the [Google Cloud Dataflow] [dataflow] unified data processing platform, processing JSON events from [Google Cloud Pub/Sub] [pubsub] and writing aggregates to [Google Cloud Bigtable] [bigtable].

The [Snowplow GCP Dataflow Streaming Example Project][repo] can help you jumpstart your own real-time event processing pipeline. We will take you through the steps to get this simple analytics-on-write job setup and processing your Pub/Sub event stream.

Read on after the fold for:

1. [What are GCP Dataflow and Pub/Sub and why are we using them?](#what-are-dataflow-and-pubsub)
2. [Introducing analytics-on-write](#introducing-analytics-on-write)
3. [Detailed setup](#detailed-setup)
4. [Troubleshooting](#troubleshooting)

<!--more-->

<div class="html">
<h2><a name="what-are-dataflow-and-pubsub">1. What are GCP Dataflow and Pub/Sub and why are we using them?</a></h2>
</div>

At Snowplow, one of our long term goals is to become platform agnostic. Most of our work has been done in the context of AWS, but with the increasing presence of other alternatives, leaving those behind would mean to forget about a lot of possible Snowplow users! That said, we set out to do an example project that makes use of some of the GCP's APIs and services that are likely to be used by Snowplow once it gets ported to the GCP. That way, both our team and our community get to become familiarized with some aspects of that ecossystem.

[Google Cloud Dataflow] [dataflow] is both the name of a unified model for batch and streaming data processing and a managed service for executing data processing jobs developed under said model.

[Google Cloud Pub/Sub] [pubsub] is a fully-managed messaging middleware, that allows you to interconnect several components of a complex (data processing) system, enable real-time communication between them. It implements a [Publisher-Subscriber communication model] [pubsubmodel].

<div class="html">
<h2><a name="introducing-analytics-on-write">2. Introducing analytics-on-write</a></h2>
</div>

Snowplow being an event data pipeline, real-time processing of event streams is at its heart. This project can be seen as a simplification of what happens in a real life event data pipeline - one that, for example, does real-time processing of events relative to temperature drops and rises.
Our Dataflow job reads a Pub/Sub topic containing events in a JSON format:

{% highlight json %}
{
  "timestamp": "2015-06-05T12:54:43.064528",
  "type": "Green",
  "id": "4ec80fb1-0963-4e35-8f54-ce760499d974"
}
{% endhighlight %}

Our job counts the events by `type` and aggregates these counts into 1 minute buckets. The job then takes these aggregates and stores them into a table in Cloud Bigtable.

1. **Downsampling:** where we reduce the event's ISO 8601 timestamp down to minute precision, so for instance "2015-06-05T12:54:43.064528" becomes "2015-06-05T12:54:00.000000". This downsampling gives us a fast way of bucketing or aggregating events via this downsampled key
2. **Bucketing:** an aggregation technique that builds buckets, where each bucket is associated with a downsampled timestamp key and an event type criterion. By the end of the aggregation process, we’ll end up with a list of buckets - each one with a countable set of events that "belong" to it.

<div class="html">
<h2><a name="detailed-setup">3. Detailed setup</a></h2>
</div>

In this tutorial, we'll walk through the process of getting up and running with GCP Pub/Sub and Dataflow. You will need  [git] [git-install], [Vagrant] [vagrant-install] and [VirtualBox] [virtualbox-install] installed locally. 

<h3>Step 1: Build the project</h3>

In your local terminal, set up and ssh into your vagrant box. This should take around 10 minutes with these commands:

{% highlight bash %}
 host$ git clone https://github.com/snowplow/google-cloud-dataflow-example-project
 host$ cd google-cloud-dataflow-example-project
 host$ vagrant up && vagrant ssh
{% endhighlight %}

Let's now build the project:

{% highlight bash %}
guest$ cd /vagrant
guest$ inv build_project
{% endhighlight %}

<h3>Step 2: Setup project and authenticate</h3>

You're going to need credentials to run certain parts of this project. 
You'll also need to create a new project in GCP and enable some APIs/services.

(Here's a [guide][gcp-get-started] on Snowplow's wiki on how to setup a GCP project and enable APIs/services)

- Cloud Dataflow
- Cloud Pub/Sub
- Cloud Storage
- Cloud Bigtable

After enabling these services, authenticate with your GCP account by running the following commands:

{% highlight bash %}
guest$ gcloud auth login
guest$ gcloud auth application-default login
guest$ gcloud config set project $YOUR_PROJECT_ID
{% endhighlight %}

These will prompt links you'll have to follow on your host OS, which will allow you
to use your browser to authenticate.

<h3>Step 3: Create your Pub/Sub topic</h3>

We're going to set up the Pub/Sub topic. Your first step is to create a topic and verify that it was successful. Use the following command to create a topic named "test-topic":

{% highlight bash %}
$ inv create_pubsub_topic --topic-name=test-topic
{% endhighlight %}

<h3>Step 4: Create a Bigtable table for storing our aggregates</h3>

We're using "test-table" as the table name, "test-instance" as the instance name and "cf1" as the column family. Bigtable is a NoSQL database that runs on a cluster - the instance. It has the concept of column families: groups of columns that are related and as such, are likely to be accessed roughly at the same time. In the context of this project, all the columns will lie in the same column family.

Invoke the creation of the table with:

{% highlight bash %}
$ inv create_bigtable_table --instance-id=test-instance --region=us-west1-a --table-name=test-table --column-family=cf1
{% endhighlight %}

<h3>Step 5: Create a staging location for Dataflow</h3>

Dataflow needs a place to store the .jars it will use to run our job. This is called the staging location.
To create one for your project, go to https://console.cloud.google.com/storage/browser?project=YOUR-PROJECT-ID

Click "Create Bucket". Fill in the appropriate details. As this is an example project, we suggest you pick the cheapest option.

After creating your bucket, you might want to create a folder inside it, to serve as your staging location. You can also just use the bucket's root. To create a folder in your bucket, after you created the bucket, select it in the list and then click "Create Folder".

Your staging location will be:

{% highlight bash %}
 gs://your-bucket-name/the-folder-that-you-might-have-created
{% endhighlight %}

![bucket1] [bucket1.png]

![bucket2] [bucket2.png]

<h3>Step 6: Submit your application to Dataflow</h3>

Before you can run your application, you'll need to setup a proper config file.
There's an example in [config/config.hocon.sample][config]. If you've been using the same names as we did, you'll only need to perform some minimal changes to that example file (namely: the project ID; adjusting the Pub/Sub topic full name; setting Dataflow's correct staging location)

Then, inside your Vagrant box run (assuming you've built the project, as instructed. Alternatively, you can download it from [Bintray][bintray]):

{% highlight bash %}
guest$ inv run_project --config=path/to/config/file --fat-jar-path=path/to/fat.jar
{% endhighlight %}

This will submit your job to Dataflow.

<h3>Step 7: Generate events in your Pub/Sub Topic</h3>

After you've submitted your job to Dataflow, it's time to generate some events in our Pub/Sub Topic:

{% highlight bash %}
$ inv generate_events --topic-name=test-topic --nr-events=<some-number>
Event sent to Kinesis: {"timestamp": "2015-06-05T12:54:43.064528", "type": "Green", "id": "4ec80fb1-0963-4e35-8f54-ce760499d974"}
Event sent to Kinesis: {"timestamp": "2015-06-05T12:54:43.757797", "type": "Red", "id": "eb84b0d1-f793-4213-8a65-2fb09eab8c5c"}
Event sent to Kinesis: {"timestamp": "2015-06-05T12:54:44.295972", "type": "Yellow", "id": "4654bdc8-86d4-44a3-9920-fee7939e2582"}
...
{% endhighlight %}

If you leave out the ```--nr-events``` parameter, the event generator will run on an infinte loop (to kill it, Ctrl+C)

<h3>Step 8: Monitor your job</h3>

Now there are 2 places we want to check to see if everything is running smoothly.

The first place is Dataflow's web interface. Go to https://console.cloud.google.com/dataflow?project=YOUR-PROJECT-ID and select the job you just submitted. You should then see a graph with the several transforms that make up our data pipeline. You can click on the transforms to get specific info about each one, such as their throughput. If something is not working properly, you'll get warnings under "Logs". You can also check the central log in: https://console.cloud.google.com/logs?project=YOUR-PROJECT-ID . (Remember to change YOUR-PROJECT-ID to the appropriate value in these URLs)

![dataflow-dag] [dataflow-dag.png]

The second place you'll want to check is your Bigtable table. To do so, you'll need to use HBase, and we suggest you to do it inside your Google Cloud Shell ([reference](https://cloud.google.com/bigtable/docs/quickstart-hbase).

To access your Google Cloud Shell, go to your Google Cloud Dashboard (https://console.cloud.google.com/home/dashboard?project=YOUR-PROJECT-ID) and click on the little terminal symbol on the top right corner. That will boot your shell. Wait for it to become available, then:

{% highlight bash %}

google-shell$ curl -f -O https://storage.googleapis.com/cloud-bigtable/quickstart/GoogleCloudBigtable-Quickstart-0.9.5.1.zip
google-shell$ unzip GoogleCloudBigtable-Quickstart-0.9.5.1.zip
google-shell$ cd quickstart
google-shell$ ./quickstart.sh

{% endhighlight %}

This will boot your HBase shell, which you'll use to interact with your Bigtable table. At this point,
you can run (assuming your table is named "test-table"):

{% highlight bash %}

hbase-shell> scan "test-table"

{% endhighlight %}

This will print the rows in your table, where you can see the counts for each bucket and type:

![bigtable-result] [bigtable-result.png]

<h3>Step 10: Shut everything down</h3>

Remember to shut off:

* Python event generator
* Bring down all the resources used on GCP. To do this you can either delete your project (recommended) or you can manually:
	* Halt your Dataflow job
	* Delete your Pub/Sub topic
	* Delete your Bigtable table
	* Delete your staging location and bucket

* Exit your Vagrant guest
* `vagrant halt`
* `vagrant destroy`

<div class="html">
<h2><a name="troubleshooting">4. Troubleshooting</a></h2>
</div>

__What Python versions is the helper script compatible with?__

* Answer - The ```google-cloud``` package is incompatible with ```setuptools=<33.0```, so 
```pip install google-cloud``` won't work with Python 3.5 or 3.6

__I found an issue with the project:__

* Answer - Feel free to [get in touch][talk-to-us] or [raise an issue][issues] on GitHub!

[dataflow]: https://cloud.google.com/dataflow/
[pubsub]: https://cloud.google.com/pubsub/
[bigtable]: https://cloud.google.com/bigtable/
[snowplow]: http://snowplowanalytics.com
[pubsubmodel]: https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern
[gcp-get-started]: https://github.com/snowplow/snowplow/wiki/GCP:-Getting-Started
[vagrant-install]: http://docs.vagrantup.com/v2/installation/index.html
[virtualbox-install]: https://www.virtualbox.org/wiki/Downloads
[git-install]: https://help.github.com/articles/set-up-git/
[bintray]: https://bintray.com/snowplow/snowplow-generic/google-cloud-dataflow-example-project

[repo]: https://github.com/snowplow/google-cloud-dataflow-example-project
[config]: https://raw.githubusercontent.com/snowplow/google-cloud-dataflow-example-project/master/config/config.hocon.sample
[bucket1.png]: /assets/img/blog/2017/03/bucket1.png
[bucket2.png]: /assets/img/blog/2017/03/bucket2.png
[dataflow-dag.png]: /assets/img/blog/2017/03/dataflow-dag.png
[bigtable-result.png]: /assets/img/blog/2017/03/bigtable-result.png

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
