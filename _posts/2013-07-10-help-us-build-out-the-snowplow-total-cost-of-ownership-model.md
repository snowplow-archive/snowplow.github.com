---
layout: post
title: Help us build out the Snowplow Total Cost of Ownership Model
tags: [total cost of ownership, cloud services]
author: Yali
category: Documentation
---

In a [previous blog post][previous-post], we described how we were in the process of building a [Total Cost of Ownership model][previous-post] for Snowplow: something that would enable a Snowplow user, or prospective user, to accurately forecast their AWS bill going forwards based on their traffic levels.

![your-country-needs-you] [your-country-needs-you]

To build that model, though, we need **your help**. In order to ensure that our model is accurate and robust, we need to make sure that the relationships we believe exist between the number of events tracked, and the number and size of files generated, as detailed in the [last post][previous-post], are correct, and that we have modelled them accurately. To that end, we are asking Snowplow users to help us by providing the following data:

1. [The number of events tracked per day](/blog/2013/07/10/help-us-build-out-the-snowplow-total-cost-of-ownership-model/#events-per-day)
2. [The number of times the enrichment process is run per day](/blog/2013/07/10/help-us-build-out-the-snowplow-total-cost-of-ownership-model/#runs-per-day)
3. [The number of Cloudfront log files generated per day, and the volume of data](/blog/2013/07/10/help-us-build-out-the-snowplow-total-cost-of-ownership-model/#log-files-per-day)
4. [The amount of time taken to enrich the data in EMR (and the size of cluster used to perform the enrichment)](/blog/2013/07/10/help-us-build-out-the-snowplow-total-cost-of-ownership-model/#emr-details)
5. [The number of files outputted back to S3, and the size of those files](/blog/2013/07/10/help-us-build-out-the-snowplow-total-cost-of-ownership-model/#output-back-to-s3)
6. [The total number of lines of data in Redshift, and the amount of Redshift capacity used](/blog/2013/07/10/help-us-build-out-the-snowplow-total-cost-of-ownership-model/#redshift-data-points)

We will then share this data back, in an anonymized form, with the community, as part of the model.

We recognise that that is a fair few data points! To thank Snowplow users for their trouble in providing them (as well as building a model for you), we will *also* send each person that provides data a **free Snowplow T-shirt** in their size.

In the rest of this post, we provide simple instructions for pulling the relevant data from Amazon.

<!--more-->

<h3><a name="events-per-day">1. Calculating the number of events tracked per day</a></h3>

Simply execute the following SQL statement in Redshift

{% highlight sql %}
SELECT
to_char(collector_tstamp, 'YYYY-MM-DD') AS "Day",
count(*) AS "Number of events"
FROM events
WHERE collector_tstamp > {$START-DATE}
AND collector_tstamp< {$START-DATE}
GROUP BY "Day"
{% endhighlight %}

<h3><a name="runs-per-day">2. Calculating the number of times the enrichment process is run per day</a></h3>

Most Snowplow users run the enrichment process once per day.

You can confirm how many times you run Snowplow by logging into the AWS S3 console and navigating to the bucket where you archive your Snowplow event files. (This is specified in the [StorageLoader config file][storage-loader-config-file].) Within the bucket you'll see a single folder generated for each enrichment 'run', labelled with the timestamp of the run. You'll be able to tell directly how many times the enrichment process is run - in the below case - it is once per day:

![aws-s3-screenshot][number-of-runs-per-day]

<h3><a name="log-files-per-day">3. Measuring The number of Cloudfront log files generated per day, adn the volume of data</a></h3>

This is most easily done using an S3 front end, as the AWS S3 console is a bit limited. We use [Cloudberry][cloudberry]. On Cloudberry, you can read the number of files generated per day, and their size, directly, by simply right clicking on the folder with the day's worth of log file archives and selecting properties:

![number-of-collector-logs-and-size][number-of-collector-logs-and-size]

In the above case we see there were 370 files generated on 2013-07-08, which occupied a total of 366.5KB.

<h3><a name="emr-details">4. The amount of time taken to enrich the data in EMR (and the size of cluster used to perform the enrichment)</a></h3>

You can use the EMR command line tools to generate a JSON with details of each EMR job. In the below example, we pull a JSON for a specific job:

{% highlight bash %}
$ ./elastic-mapreduce --describe --jobflow j-Y9QNJI44PA0X
{
  "JobFlows": [
    {
      "Instances": {
        "TerminationProtected": false,
        "MasterInstanceId": "i-944414d9",
        "HadoopVersion": "1.0.3",
        "NormalizedInstanceHours": 2,
        "MasterPublicDnsName": "ec2-54-228-105-10.eu-west-1.compute.amazonaws.com",
        "SlaveInstanceType": "m1.small",
        "MasterInstanceType": "m1.small",
        "InstanceGroups": [
          {
            "ReadyDateTime": 1372215923.0,
            "InstanceGroupId": "ig-2TGA68QGUOCUV",
            "State": "ENDED",
            "LastStateChangeReason": "Job flow terminated",
            "InstanceType": "m1.small",
            "InstanceRequestCount": 1,
            "InstanceRunningCount": 0,
            "StartDateTime": 1372215848.0,
            "Name": null,
            "BidPrice": null,
            "Market": "ON_DEMAND",
            "CreationDateTime": 1372215689.0,
            "InstanceRole": "MASTER",
            "EndDateTime": 1372216249.0
          },
          {
            "ReadyDateTime": 1372215929.0,
            "InstanceGroupId": "ig-2M2UW6B8LFWOG",
            "State": "ENDED",
            "LastStateChangeReason": "Job flow terminated",
            "InstanceType": "m1.small",
            "InstanceRequestCount": 1,
            "InstanceRunningCount": 0,
            "StartDateTime": 1372215929.0,
            "Name": null,
            "BidPrice": null,
            "Market": "ON_DEMAND",
            "CreationDateTime": 1372215689.0,
            "InstanceRole": "CORE",
            "EndDateTime": 1372216249.0
          }
        ],
        "InstanceCount": 2,
        "KeepJobFlowAliveWhenNoSteps": false,
        "Placement": {
          "AvailabilityZone": "eu-west-1a"
        },
        "Ec2SubnetId": null,
        "Ec2KeyName": "etl-nasqueron"
      },
      "JobFlowId": "j-Y9QNJI44PA0X",
      "BootstrapActions": [],
      "JobFlowRole": null,
      "AmiVersion": "2.3.6",
      "LogUri": "s3n:\/\/snowplow-emr-logs\/pbz\/",
      "Steps": [
        {
          "ExecutionStatusDetail": {
            "State": "COMPLETED",
            "LastStateChangeReason": null,
            "StartDateTime": 1372215928.0,
            "CreationDateTime": 1372215689.0,
            "EndDateTime": 1372216010.0
          },
          "StepConfig": {
            "HadoopJarStep": {
              "MainClass": null,
              "Args": [
                "--src",
                "s3n:\/\/snowplow-emr-processing\/pbz\/",
                "--dest",
                "hdfs:\/\/\/local\/snowplow-logs",
                "--groupBy",
                ".*\\.([0-9]+-[0-9]+-[0-9]+)-[0-9]+\\..*",
                "--targetSize",
                "128",
                "--outputCodec",
                "lzo",
                "--s3Endpoint",
                "s3-eu-west-1.amazonaws.com"
              ],
              "Properties": [],
              "Jar": "\/home\/hadoop\/lib\/emr-s3distcp-1.0.jar"
            },
            "Name": "Elasticity Custom Jar Step",
            "ActionOnFailure": "TERMINATE_JOB_FLOW"
          }
        },
        {
          "ExecutionStatusDetail": {
            "State": "COMPLETED",
            "LastStateChangeReason": null,
            "StartDateTime": 1372216010.0,
            "CreationDateTime": 1372215689.0,
            "EndDateTime": 1372216196.0
          },
          "StepConfig": {
            "HadoopJarStep": {
              "MainClass": null,
              "Args": [
                "com.snowplowanalytics.snowplow.enrich.hadoop.EtlJob",
                "--hdfs",
                "--input_folder",
                "hdfs:\/\/\/local\/snowplow-logs",
                "--input_format",
                "cloudfront",
                "--maxmind_file",
                "http:\/\/snowplow-hosted-assets.s3.amazonaws.com\/third-party\/maxmind\/GeoLiteCity.dat",
                "--output_folder",
                "s3n:\/\/snowplow-events-pbz\/events\/2013-06-26-04-00-03\/",
                "--bad_rows_folder",
                "2013-06-26-04-00-03\/"
              ],
              "Properties": [],
              "Jar": "s3:\/\/snowplow-hosted-assets\/3-enrich\/hadoop-etl\/snowplow-hadoop-etl-0.3.2.jar"
            },
            "Name": "Elasticity Custom Jar Step",
            "ActionOnFailure": "TERMINATE_JOB_FLOW"
          }
        }
      ],
      "Name": "Snowplow Enrichment for pbz",
      "ExecutionStatusDetail": {
        "ReadyDateTime": 1372215929.0,
        "State": "COMPLETED",
        "LastStateChangeReason": "Steps completed",
        "StartDateTime": 1372215929.0,
        "CreationDateTime": 1372215689.0,
        "EndDateTime": 1372216249.0
      },
      "SupportedProducts": [],
      "VisibleToAllUsers": false
    }
  ]
}
╭─alex@nasqueron  ~/Apps/emr-cli  
╰─$
{% endhighlight %}

Rather than parse the JSON yourself, we're very happy for community members to simply save the JSON and email it to us, with the other data points. We can then extract the relevant data points from the JSON directly. (We'll use R and the RJSON package, and blog about how we do it.) You can either generate a JSON for a specific job (you will need to enter the job ID:

{% highlight bash %}
$ ./elastic-mapreduce --describe --jobflow {$jobflow-id} > emr-job-data.json
{% endhighlight %}

Or you can fetch the data for every job run in the last two days:

{% highlight bash %}
$ ./elastic-mapreduce --describe > emr-job-data.json
{% endhighlight %}

Or all the data for every job in the last fortnight:

{% highlight bash %}
$ ./elastic-mapreduce --describe all > emr-job-data.json
{% endhighlight %}

<h3><a name="output-back-to-s3">5. Measuring the number of files written back to S3, and their size</a></h3>

We can use Cloudberry again. Simply identify a folder in the archive bucket specified in the [StorageLoader config][storage-loader-config-file], right click on it and select properties:

![number-of-snowplow-event-files-and-size][number-of-snowplow-event-files-and-size]

In the above example, 3 files were generated for a single run, with a total size of 981.4KB.

<h3><a name="redshift-data-points">6. The total number of lines of data in Redshift, and the amount of Redshift capacity used</a></h3>

Measuring the amount of space occupied by your events in Redshift is very easy.

First, measure the number of events by executing the following query:

{% highlight sql %}
select count(*) from events;
{% endhighlight %}

Then to find out how much disk space that occupies in your Redshift cluster execute the following query:

{% highlight sql %}
select owner as node, diskno, used, capacity
from stv_partitions
order by 1, 2, 3, 4;
{% endhighlight %}

The amount of used capacity (in MB) is given in the "used" column: it is 1,941MB in the below example. The total capacity is given at 1906184 i.e. 1.8TB: that is because we are running a single (2TB) node.

![redshift-example][redshift-disk-space]

For our purposes, we only need one of the lines of data to calculate the relationship between disk space on Redshift and number of events stored on Redshift, and use that to model Redshift costs.

## Help us build an accurate, robust model, that we all can use to forecast Snowplow AWS costs

We realize that you, our users, are busy people who have plenty to do aside from spending 20-30 minutes fetching data points related to your Snowplow installation, and sending them to us. We really hope, however, that many of you do, because:

1. A Total Cost of Ownership Model will be really useful for all of us!
2. We'll send you a Snowplow T-shirt, by way of thanks

If you can pop the above data points (in whatever format is most convenient), and email them to me on `yali at snowplowanalytics dot com`, along with your T-shirt size, we will send you through your T-shirts as soon as they are printed.

So please help us help you, and keep plowing!

[tco-google-group]: https://groups.google.com/forum/#!searchin/snowplow-user/cloudfront$20cost/snowplow-user/b_HPkt3nwzo/Ms-J54e8bUYJ
[scalding-etl]: /blog/2013/04/03/snowplow-0.8.0-released-with-all-new-scalding-based-data-enrichment/
[small-files-problem]: /blog/2013/05/30/dealing-with-hadoops-small-files-problem/
[spot-instances]: /blog/2013/06/03/snowplow-0.8.6-released-with-performance-improvements/#task-instances
[your-country-needs-you]: /assets/img/blog/2013/07/your-country-needs-you.jpg
[cloudfront-collector]: https://github.com/snowplow/snowplow/tree/master/2-collectors/cloudfront-collector
[clojure-collector]: https://github.com/snowplow/snowplow/tree/master/2-collectors/clojure-collector
[browser-caching]: /blog/2013/07/02/reduce-your-cloudfront-bills-with-cache-control/
[emr-etl-runner-diagram]: /assets/img/blog/2013/07/emr-etl-runner-steps.png
[storage-loader-diagram]: /assets/img/blog/2013/07/storage-loader-steps.png
[storage-loader]: https://github.com/snowplow/snowplow/wiki/1-Installing-the-StorageLoader
[emr-etl-runner]: https://github.com/snowplow/snowplow/wiki/setting-up-EmrEtlRunner
[line-graph]: /assets/img/blog/2013/07/line-graph.png
[step-function]: /assets/img/blog/2013/07/step-function.png
[emr-costs]: /assets/img/blog/2013/07/emr-costs.png
[redshift-costs]: /assets/img/blog/2013/07/redshift-costs.png
[emr-etl-runner-config-file]: https://github.com/snowplow/snowplow/wiki/EmrEtlRunner-setup#wiki-configuration
[number-of-runs-per-day]: /assets/img/blog/2013/07/number-of-runs-per-day.png
[storage-loader-config-file]: https://github.com/snowplow/snowplow/wiki/1-installing-the-storageloader#wiki-configuration
[number-of-collector-logs-generated-per-day]: /assets/img/blog/2013/07/number-of-collector-logs-generated-per-day.png
[bucket-explorer]: http://www.bucketexplorer.com/
[cloudberry]: http://www.cloudberrylab.com/
[number-of-collector-logs-and-size]: /assets/img/blog/2013/07/number-of-collector-logs-and-size.JPG
[redshift-disk-space]: /assets/img/blog/2013/07/redshift-disk-space.JPG
[number-of-snowplow-event-files-and-size]: /assets/img/blog/2013/07/number-of-snowplow-event-files-and-size.JPG
[previous-post]: /blog/2013/07/09/understanding-how-different-parts-of-the-Snowplow-data-pipeline-drive-AWS-costs/
