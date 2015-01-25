---
layout: post
shortenedlink: Uploading Snowplow enriched events to BigQuery
title: Uploading Snowplow enriched events to BigQuery
tags: [event, analytics, bigquery]
author: Andrew
category: Research
---

As part of my internship here at Snowplow, I've been experimenting with using Scala to upload Snowplow-enriched events to Google's BigQuery database. The final goal is to be able to stream data in realtime, or near realtime, from an Amazon Kinesis stream to BigQuery. This blog will cover:

1. [Setting up a BigQuery project](/blog/2015-01-19-uploading-snowplow-data-to-bigquery#setup)
2. [Uploading enriched data, using a command line function](/blog/2015-01-19-uploading-snowplow-data-to-bigquery#upload)
3. [Next steps](/blog/2015-01-19-uploading-snowplow-data-to-bigquery#next)

<!--more-->

<div class="html">
<h2><a name="setup">1. Setting up a BigQuery project</a></h2>
</div>

Assuming you already have a either a folder or single file of snowplow enriched kinesis stream data, the first step is to [sign up for big query](https://cloud.google.com/bigquery/sign-up) and create a project. Note that to upload the data you will have to enable billing. However, Google have reasonably generous free quotas for both uploading and querying.

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
