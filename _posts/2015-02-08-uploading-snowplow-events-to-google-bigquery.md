---
layout: post
title: Uploading Snowplow events to Google BigQuery
tags: [event, analytics, bigquery]
author: Andrew
category: Research
---

As part of my winternship here at Snowplow Analytics in London, I've been experimenting with using Scala to upload Snowplow's enriched events to [Google's BigQuery] [bigquery] database. The ultimate goal is to add BigQuery support to both Snowplow pipelines, including being able to stream data in near-realtime from an Amazon Kinesis stream to BigQuery. This blog post will cover:

1. [Getting started with BigQuery](/blog/2015/02/08/uploading-snowplow-events-to-google-bigquery#setup)
2. [Downloading some enriched events](/blog/2015/02/08/uploading-snowplow-events-to-google-bigquery#downloading)
3. [Installing BigQuery Loader CLI](/blog/2015/02/08/uploading-snowplow-events-to-google-bigquery#installation)
4. [Analyzing the event stream in BigQuery](/blog/2015/02/08/uploading-snowplow-events-to-google-bigquery#loading)
5. [Loading enriched events into BigQuery](/blog/2015/02/08/uploading-snowplow-events-to-google-bigquery#analyzing)
6. [Next steps](/blog/2015/02/08/uploading-snowplow-events-to-google-bigquery#next)

<!--more-->

<div class="html">
<h2><a name="getting-started">1. Getting started with BigQuery</a></h2>
</div>

To follow along with this tutorial, you will need:

* Some Snowplow enriched events as typically archived in Amazon S3
* Java 7+ installed
* A Google BigQuery account

If you don't already have a Google BigQuery account, please [sign up] [bigquery-signup] to BigQuery, and enable billing. Don't worry, this tutorial shouldn't cost you anything - Google have reasonably generous free quotas for both uploading and querying.

Next, create a project, and make a note of the **Project Number** by clicking on the name of the project on the [Google Developers Console] [google-developers-console].

<div class="html">
<h2><a name="downloading">2. Downloading some enriched events</a></h2>
</div>

We now need a local folder of Snowplow enriched events - these should be in your Archive Bucket in S3. If you use a GUI S3 client like Bucket Explorer or Cyberduck, use that now to download some enriched events from your archive. You want to end up with a single folder containing enriched event files.

If you use the AWS CLI tools, then the following shell commands should retrieve all of your enriched events for January (update the bucket path and profile accordingly):

{% highlight bash %}
$ aws --profile="xxx" s3 cp "s3://xxx-archive/enriched/good/" . --recursive \
    --exclude "*" --include "run=2015-01-*"
$ find . -type f -execdir bash -c 'd="${PWD##*/}"; [[ "$1" != "$d-"* ]] && mv "$1" "../$d-$1"' - '{}' \;
$ find . -type d -exec rm -d {} \;
{% endhighlight %}

<div class="html">
<h2><a name="installation">3. Installing BigQuery Loader CLI</a></h2>
</div>

For the purposes of this tutorial I have written a simple command-line application in Scala, called [BigQuery Loader CLI] [cli-repo], to handle the loading of Snowplow enriched events into BigQuery.

The jarfile is hosted, compressed, [in Bintray] [bintray-dl]. You can download it by running the following shell commands:

{% highlight bash %}
$ wget http://dl.bintray.com/snowplow/snowplow-generic/bigquery_loader_cli_0.1.0.zip
$ unzip bigquery_loader_cli_0.1.0.zip
{% endhighlight %}

We now need some Google credentials to access the BigQuery project. Head back to the [Google developers console] [google-developers-console] and:

1. Click on the **Consent screen* link in the **APIs and auth** section of the Developer Console, add an **Email address** and hit **Save**
2. Click on the **Credentials** link in the **APIs and auth** section
3. Click on the **create new Client ID** button, selecting **Installed application** as the application type and **other** as the installed application type
4. Click **CreateClient Id** and then **Download JSON** to save the file
5. Save the `client_secrets` file to the same directory that you unzipped the command-line app
6. Rename the `client_secrets` file to `client_secrets_<projectId>.json`, where `<projectId>` is the Project Number obtained earlier

Done? Now we are ready to run the application.

<div class="html">
<h2><a name="loading">4. Loading enriched events into BigQuery</a></h2>
</div>

To upload your data you simply type the command:

{% highlight bash %}
> java -jar bigquery-loader-cli-0.1.0 --create-table \
    <projectId> <datasetId> <tableId> <dataLocation>
{% endhighlight %}

where:

* `<projectId>` is the Project Number obtained from the Google development console
* `<datasetId>` is the name of the dataset, which will be created if it doesn't already exist
* `<tableId>` is the name of the table, which will be created if it doesn't already exist
* `<dataLocation>` is the location of either a single file of Snowplow enriched events, or an un-nested folder of Snowplow enriched events

On your first use of this command you will be prompted to go through Google's browser-based authentication process. This may take a little while - it will load each file found in the directory separately.

To append further data to the table simply run the command again, omitting the `--create-table` flag and changing `<dataLocation>` as appropriate.

<div class="html">
<h2><a name="analyzing">5. Analyzing the event stream in BigQuery</a></h2>
</div>

You can now view your loaded events in the Developers Console - navigate to the query UI by clicking on the **BigQuery** button under **Big Data** bottom-left.

Let's take a simple query from Snowplow's Analyst's Cookbook: [Number of unique visitors] [analysts-cookbook]. Adapted to BigQuery's slightly idiosyncratic SQL syntax, it looks like this:

{% highlight sql %}
/* BigQuery */
SELECT
  LEFT(FORMAT_UTC_USEC(UTC_USEC_TO_DAY(
    TIMESTAMP_TO_USEC(collector_tstamp))), 10) AS Date,
  COUNT(DISTINCT(domain_userid)) AS Uniques
FROM [eventsDataset.eventsTbl]
GROUP BY 1
ORDER BY 1;
{% endhighlight %}

If we run it against our January data in BigQuery, we will see something like this:

![img-bigquery] [img-bigquery]

If you want to try your hand at adapting other Snowplow recipes to BigQuery, make sure to check out Google's [Query Reference] [bigquery-docs] documentation for BigQuery.

<div class="html">
<h2><a name="next">6. Next steps</a></h2>
</div>

The next step in terms of my R&D with Google BigQuery is to write a Kinesis app that reads Snowplow enriched events from a Kinesis stream and writes them to BigQuery in near-realtime. After this, we will port this functionality over into Snowplow's Hadoop-based batch flow. We also need to determine how best to support unstructured event and custom context JSONs in BigQuery.

Meanwhile, on the analytics side, others at Snowplow are looking at how they might best utilize the unique features of BigQuery to analyze a Snowplow event stream.

If you have run into any problems with this tutorial, or have any suggestions for our BigQuery roadmap, please do [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

[bigquery]: https://cloud.google.com/bigquery
[bigquery-signup]: https://cloud.google.com/bigquery/sign-up
[google-developers-console]: https://console.developers.google.com/project/

[bintray-dl]: http://dl.bintray.com/snowplow/snowplow-generic/bigquery_loader_cli_0.1.0.zip
[cli-repo]: https://github.com/snowplow/bigquery-loader-cli

[analysts-cookbook]: http://snowplowanalytics.com/analytics/basic-recipes.html#counting-unique-visitors
[img-bigquery]: /assets/img/blog/2015/02/bigquery-query.png

[bigquery-docs]: https://cloud.google.com/bigquery/query-reference

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
