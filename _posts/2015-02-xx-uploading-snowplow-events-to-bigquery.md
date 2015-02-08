---
layout: post
shortenedlink: Uploading Snowplow enriched events to BigQuery
title: Uploading Snowplow enriched events to BigQuery
tags: [event, analytics, bigquery]
author: Andrew
category: Research
---

As part of my winternship here at Snowplow Analytics in London, I've been experimenting with using Scala to upload Snowplow's enriched events to [Google's BigQuery] [bigquery] database. The ultimate goal is to add BigQuery support to both Snowplow pipelines, including being able to stream data in near-realtime from an Amazon Kinesis stream to BigQuery. This blog post will cover:

1. [Setting up a BigQuery project](/blog/2015-01-19-uploading-snowplow-data-to-bigquery#setup)
2. [Uploading enriched data, using a command line function](/blog/2015-01-19-uploading-snowplow-data-to-bigquery#upload)
3. [Next steps](/blog/2015-01-19-uploading-snowplow-data-to-bigquery#next)

<!--more-->

<div class="html">
<h2><a name="getting-started">1. Getting started</a></h2>
</div>

To follow along with this tutorial, you will need:

* Some Snowplow enriched events as typically archived in Amazon S3
* Java 7+ installed
* A Google BigQuery account

If you don't already have a Google BigQuery account, please **[sign up] [bigquery-signup]** to BigQuery, and enable billing. Don't worry, this tutorial shouldn't cost you anything - Google have reasonably generous free quotas for both uploading and querying.

Next, create a project, and make a note of the **Project Number** by clicking on the name of the project on the **[Google developers console] [google-developers-console]**.

<div class="html">
<h2><a name="sourcing-events">2. Downloading some events</a></h2>
</div>

We now need a local folder of Snowplow enriched events - these should be in your Archive Bucket in S3. If you use a GUI S3 client like Bucket Explorer or Cyberduck, use that now to download some enriched events from your archive. You want to end up with a single folder containing enriched event files.

If you use the AWS CLI tools, then the following command should retrieve all of your enriched events for January (update the bucket path and profile accordingly):

{% highlight bash %}
TO COME
{% endhighlight %}

<div class="html">
<h2><a name="installation">3. Installing BigQuery Loader CLI</a></h2>
</div>

For the purposes of this tutorial I have written a simple command-line application which will handle the loading of Snowplow enriched events into 

Third, our command-line app will need credentials to access the BigQuery project:

1. Click on the **Credentials** link in the **APIs and auth** section of the developer console
2. Click on the **create new Client ID** button, selecting **installed application** as the appliction type and **other** as the installed application type
3. Click **CreateClient Id** and then **Download json** to save the file
4. Save the `client_secrets` file to the same directory that you unzipped the command-line app
5. Rename the `client_secrets` file to `client_secrets_<projectId>.json`, where `<projectId>` is the Project Number obtained earlier



<div class="html">
<h2><a name="setup">1. Setting up a BigQuery project</a></h2>
</div>

Assuming you already have a either a folder or single file of Snowplow enriched events, the first step is to [sign up for big query](https://cloud.google.com/bigquery/sign-up) and create a project. Note that to upload the data you will have to enable billing. 

After setting up the account and creating a project you will need to obtain the project number from the [Google developers console](https://console.developers.google.com/project/). You will also need to create a client secret file for the purposes of OAuth2 authorization. To obtain this click on the **Credentials** link in the **APIs & auth** section of the developers console. Click on the **create new Client ID** button and then select installed application as the appliction type and other as the installed application type. Finally click **CreateClient Id** and then **Download json** to save the file for future use. 

Next obtain the jar file by running the commands

    wget http://dl.bintray.com/ALEX TO ADD.zip
    unzip XXXX.zip

Then rename the client secrets json file you downloaded previously to 

    client_secrets_<projectId>.json

and place it in the same directory as the jar file.

<div class="html">
<h2><a name="upload">2. Uploading enriched data, using a command line function</a></h2>
</div>

Now, to upload your data you simply type the command

    java -jar snowplow-bigquery-sink-0.1.0 --create-table <projectId> <datasetId> <tableId> <dataLocation> 

where 

* `projectId` is the project number obtained from the Google development console,
* `datasetId` is the name of the dataset - if a dataset of this name doesn't already exist then it will be created,
* `tableId` is the name of the table - again if the table doesn't exist it will be created,
* `dataLocation` is the location of either a single file containing TSV data or a folder containing TSV files (and only TSV files).

On your first use of this command you will be prompted to go through Google's browser based authentication process.

You can now view your data and make some queries by making use of the BigQuery gui in the developers console.

To append further data to the table simply run the command again, omitting the `--create-table` flag and changing `dataLocation`. Note that currently there is no way to identify whether a given datafile has already been uploaded. Thus running the command twice with the same `dataLocation` argument will result in two copies of the data being added to the table.

<div class="html">
<h2><a name="next">3. Next steps</a></h2>
</div>

The next step, development wise, will involve working on the other the other end of the pipeline - obtaining events data from the Kinesis enriched events scheme.

Meanwhile, on the analytics side, others at Snowplow are looking at how they might best utilise the unique feature of BigQuery to better analyse Snowplow data.

[bigquery]: https://cloud.google.com/bigquery
[bigquery-signup]: https://cloud.google.com/bigquery/sign-up

