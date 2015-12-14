---
layout: post
title: Dealing with Hadoop's small files problem
tags: [hadoop, small-file, hdfs, s3distcopy]
author: Alex
category: Inside the Plow
---

Hadoop has a serious Small File Problem. It's widely known that Hadoop struggles to run MapReduce jobs that involve thousands of small files: Hadoop much prefers to crunch through tens or hundreds of files sized at or around the magic 128 megabytes. The technical reasons for this are well explained in this [Cloudera blog post] [cloudera-small-files] - what is less well understood is how badly small files can slow down your Hadoop job, and what to do about it.

<img src="/assets/img/blog/2013/05/plowing-small-files.jpg" />

In this blog post we will discuss the small files problem in terms of our experiences with it at Snowplow. **And we will argue that dealing with the small files problem - if you have it - is the single most important optimisation you can perform on your MapReduce process.**

<!--more-->

## Background

To give some necessary background on our architecture: Snowplow event trackers send user events to a pixel hosted on CloudFront, which logs those raw events to Amazon S3. Amazon's CloudFront logging generates many small log files in S3: a relatively low-traffic e-commerce site using Snowplow generated 26,372 CloudFront log files over a six month period, containing 83,110 events - that's just 3.2 events per log file.

Once the events have been collected in S3, [Snowplow's Hadoop job] [etl-repo] (written in [Scalding] [scalding]) processes them, validating them and then enriching them with referer, geo-location and similar data; these enriched events are then written back to S3.

So you can see how our Enrichment process ran pretty directly into Hadoop's small files problem. But quantifying the impact of small files on our job's performance was impossible until we had a solution in place...

## Quantifying the small file problem

This week we implemented a solution to aggregate our tiny CloudFront logs into more sensibly sized input files - this enhancement will be released as part of [Snowplow 0.8.6] [milestone-086] shortly.

In testing this code and running before- and after- performance tests, we realised just how badly the small file problem was slowing down our Enrichment process. This screenshot shows you what we found:

<img src="/assets/img/blog/2013/05/small-files-before-after.png" />

That's right - aggregating with the small files first reduced total processing time from 2 hours 57 minutes to just 9 minutes - of which 3 minutes was the aggregation, and 4 minutes was running our actual Enrichment process. That's a speedup of **1,867%**.

To make the comparison as helpful as possible, here is the exact specification of the before- and after- test. We have also added a second after- run with a more realistic cluster size.

| Metric                   | Before (with small files)    | After (with small files aggregated) | After (with smaller cluster) |
|:-------------------------|:-----------------------------|:------------------------------------|------------------------------|
| **Source log files**     | 26,372                       | 26,372                              | 26,372                       |
| **Files read by job**    | Source log files             | Aggregated log files                | Aggregated log files         |
| **Location of files**    | Amazon S3                    | HDFS on Core instances              | HDFS on Core instances       |
| **File compression**     | Gzip                         | LZO                                 | LZO                          |
| **part- files out**      | 23,618                       | 141                                 | 141                          |
| **Events out**           | 83,110                       | 83,110                              | 83,110                       |
| **Cluster**              | 1 x m1.large, 18 x m1.medium | 1 x m1.large, 18 x m1.medium        | 1 x m1.small, 1 x m1.small   |
| **Execution time**       | **177 minutes**              | **9 minutes**                       | **39 minutes**               |
| **Aggregate step time**  | -                            | 3 minutes                           | 11 minutes                   |
| **ETL step time**        | 166 minutes                  | 4 minutes                           | 25 minutes                   |
| **Norm. instance hours** | 120                          | 40                                  | 2                            |

**Health warning:** this is one single benchmark, measuring the performance of the [Snowplow Hadoop job] [etl-repo] using a single data set. We encourage you to run your own benchmarks.

This is an astonishing speed-up, which shows how badly the small files problem was impacting our Hadoop job. And aggregating the small files had another beneficial effect: the much smaller number of `part-` output files meant much faster loading of events into Redshift.

So how did we fix the small files problem for Snowplow? In the next section we will discuss possible solutions for you to consider, and in the last section we will go into some more detail on the solution we chose.

## Options for dealing with small files on Hadoop

As we did our background research into solutions to the small files problem, three main schools of thought emerged:

1. **Change your "feeder" software** so it doesn't produce small files (or perhaps files at all). In other words, if small files are the problem, change your upstream code to stop generating them
2. **Run an offline aggregation process** which aggregates your small files and re-uploads the aggregated files ready for processing
3. **Add an additional Hadoop step** to the start of your jobflow which aggregates the small files

For us, option 1 was out of the question, as we have no control over how CloudFront writes its log files.

Option 2 was interesting - and we have had Snowplow users such as 99designs successfully adopt this approach; if you are interested in exploring this further, [Lars Yencken] [larsyencken] from 99designs has shared a [CloudFront log aggregation script in Python] [lars-script] as a gist. However, overall option 2 seemed to us to introduce more complexity - with a new long-running process to run, and potentially fragility - with a manifest file now to maintain. We had super-interesting discussions with the Snowplow community about this in [this Google Groups thread] [agg-thread] and [this GitHub issue] [agg-issue].

In the end, though, we opted for option 3, for a few reasons:

* We are starting a Hadoop cluster anyway to run our ETL job, so this reduces the number of additional moving parts required
* We hoped for performance improvements in moving the small files to the cluster's local HDFS filesystem during the aggregation
* We hoped that accessing Amazon S3 from a cluster rather than a single machine would mean more parallel connections to S3

With that decided, we then looked for options to aggregate and compact small files on Hadoop, identifying three possible solutions:

1. [**filecrush**] [filecrush] - a highly configurable tool by [Edward Capriolo] [edwardcapriolo] to "crush" small files on HDFS. It supports a rich set of configuration arguments and is available as a jarfile ([download it here] [filecrush-dl]) ready to run on your cluster. It's a sophisticated tool - for example, by default it won't bother crushing a file which is within 75% of the HDFS block size already. Unfortunately, it does not work yet with Amazon's s3:// paths, only hdfs:// paths - and our [pull request] [filecrush-pr] to add this functionality is incomplete
2. [**Consolidator**] [consolidator] - a Hadoop file consolidation tool from the [dfs-datastores] [dfs-datastores] library, written by [Nathan Marz] [nathanmarz]. There is scant documentation for this - we could only find one paragraph, [in this email thread] [consolidator-thread]. It has fewer capabilities than filecrush, and could do with a CLI-like wrapper to invoke it (we started writing just such a wrapper but then we found filecrush)
3. [**S3DistCp**] [s3distcp] - created by Amazon as an S3-friendly adaptation of Hadoop's [DistCp] [distcp] utility for HDFS. Don't be fooled by the name - if you are running on Elastic MapReduce, then this can deal with your small files problem using its `--groupBy` option for aggregating files (which the original DistCp seems to lack)

After trying to work with filecrush and Consolidator, ultimately we went with S3DistCp for Snowplow. In the next section, we will look at exactly how we set it up.

## Running S3DistCp

Once we had chosen S3DistCp, we had to update our ETL process to include it in our jobflow. Luckily, the [S3DistCp documentation] [s3distcp] has an example on aggregating CloudFront files:

	./elastic-mapreduce --jobflow j-3GY8JC4179IOK --jar \
	/home/hadoop/lib/emr-s3distcp-1.0.jar \
	--args '--src,s3://myawsbucket/cf,\
	--dest,hdfs:///local,\
	--groupBy,.*XABCD12345678.([0-9]+-[0-9]+-[0-9]+-[0-9]+).*,\
	--targetSize,128,\
	--outputCodec,lzo,--deleteOnSuccess'

Note that as well as aggregating the small files into 128 megabyte files, this step also changes the encoding to [LZO] [lzo]. As the Amazon documentation explains it:

_"Data compressed using LZO can be split into multiple maps as it is decompressed, so you don't have to wait until the compression is complete, as you do with Gzip. This provides better performance when you analyze the data using Amazon EMR."_

We only needed to make a few changes to this example code for our own ETL:

1. We can't predict the prefix on the CloudFront log files - and it certainly won't be `XABCD12345678`, so it made more sense to drop this
2. Grouping files to the hour is overkill - we can roll up to the day and S3DistCp will happily split files if they are larger than `targetSize`
3. `--deleteOnSuccess` is dangerous - we don't want to delete our source data and leave the only copy on a transient Hadoop cluster

Given the above, our updated `--groupBy` regular expression was:

    ".*\.([0-9]+-[0-9]+-[0-9]+)-[0-9]+\..*"

Now, all we needed to do was add the call to S3DistCp into our jobflow before our main ETL step. We use the excellent [Elasticity] [elasticity] Ruby library by [Rob Slifka] [rslifka] to execute our jobs, so calling S3DistCp was a matter of adding the extra step to our jobflow in Ruby:

{% highlight ruby %}
hadoop_input = "hdfs:///local/snowplow-logs"

# Create the Hadoop MR step for the file crushing
filecrush_step = Elasticity::CustomJarStep.new("/home/hadoop/lib/emr-s3distcp-1.0.jar")

filecrush_step.arguments = [
  "--src"               , config[:s3][:buckets][:processing],
  "--dest"              , hadoop_input,
  "--groupBy"           , ".*\\.([0-9]+-[0-9]+-[0-9]+)-[0-9]+\\..*",
  "--targetSize"        , "128",
  "--outputCodec"       , "lzo",
  "--s3Endpoint"        , config[:s3][:endpoint],
]

# Add to our jobflow
@jobflow.add_step(filecrush_step)
{% endhighlight %}

And then we had to update our ETL job to take the `--dest` of the S3DistCp step as its own input:

{% highlight ruby %}
hadoop_step.arguments = [
            "com.snowplowanalytics.snowplow.enrich.hadoop.EtlJob", # Job to run
            "--hdfs", # Always --hdfs mode, never --local
            "--input_folder"      , hadoop_input, # Output of our S3DistCp step
            "--input_format"      , config[:etl][:collector_format],
            "--maxmind_file"      , config[:maxmind_asset],
            "--output_folder"     , partition.call(config[:s3][:buckets][:out]),
            "--bad_rows_folder"   , partition.call(config[:s3][:buckets][:out_bad_rows])
          ]
{% endhighlight %}

And that was it! If you want to see all of the code excerpted above, you can find it in the [Snowplow project on GitHub] [emretlrunner-repo]. We did not have to make any changes to our main Hadoop ETL job, because Elastic MapReduce can handle LZO-compressed files invisibly to the job reading them. And no doubt the switch to LZO also contributed to the excellent performance we saw above.

So that's everything - hopefully this post has helped to illustrate just how badly small files can slow down your Hadoop job, and what you can do about it: if you have a small file problem on Hadoop, there's now no excuse not to fix it!

[cloudera-small-files]: http://blog.cloudera.com/blog/2009/02/the-small-files-problem/
[scalding]: https://github.com/twitter/scalding/wiki
[milestone-086]: https://github.com/snowplow/snowplow/issues?milestone=22&page=1&state=open

[larsyencken]: https://github.com/larsyencken
[lars-script]: https://gist.github.com/larsyencken/4076413
[agg-thread]: https://groups.google.com/forum/#!topic/snowplow-user/xdhegsztJlA
[agg-issue]: https://github.com/snowplow/snowplow/issues/82

[etl-repo]: https://github.com/snowplow/snowplow/tree/master/3-enrich/scala-hadoop-enrich

[filecrush]: https://github.com/edwardcapriolo/filecrush
[edwardcapriolo]: https://github.com/edwardcapriolo
[filecrush-pr]: https://github.com/edwardcapriolo/filecrush/pull/2
[filecrush-dl]: http://www.jointhegrid.com/hadoop_filecrush/

[consolidator]: https://github.com/nathanmarz/dfs-datastores/blob/develop/dfs-datastores/src/main/java/com/backtype/hadoop/Consolidator.java
[dfs-datastores]: https://github.com/nathanmarz/dfs-datastores
[nathanmarz]: https://github.com/nathanmarz
[consolidator-thread]: https://groups.google.com/forum/?fromgroups#!topic/cascalog-user/ovYSq2vTyYE

[s3distcp]: http://docs.aws.amazon.com/ElasticMapReduce/latest/DeveloperGuide/UsingEMR_s3distcp.html
[distcp]: http://hadoop.apache.org/docs/stable/distcp.html

[lzo]: http://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Oberhumer
[elasticity]: https://github.com/rslifka/elasticity
[rslifka]: https://github.com/rslifka

[emretlrunner-repo]: https://github.com/snowplow/snowplow/blob/feature/perf-improvements/3-enrich/emr-etl-runner/lib/snowplow-emr-etl-runner/emr_jobs.rb
