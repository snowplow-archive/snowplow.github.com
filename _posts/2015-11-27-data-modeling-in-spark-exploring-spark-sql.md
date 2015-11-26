---
layout: post
title: 'Data modeling in Spark: exploring Spark SQL'
author: Christophe
category: Data Modeling
---

We have been thinking about [Apache Spark][apache-spark] for some time now at Snowplow. This blogpost is the first in a series that will explore data modeling in Spark using Snowplow data.

This blogpost is targeted to people who know SQL and want to start exploring Spark, but haven't tried it out so far. The outline is similar to [Justine's blogpost][justine].

Let's get started!

<!--more-->

## What is data modeling?

The event stream is a log of all that has happened in a business up to a certain point in time. Data modeling is a critical step in the pipeline because it's where business logic gets applied to that data. The output is a dataset that is meaningful to an end user in the business. Because the actual event stream remains untouched, it's possible to revisit and reverse earlier decisions. For instance, it's common to update what we know about the past based on information we received since.

## Installing Spark

To get started you need to install git: https://help.github.com/articles/set-up-git/

install vagrant: https://docs.vagrantup.com/v2/installation/

install virtualbox: https://www.virtualbox.org/wiki/Downloads

Next - close the Snowplow repo and swith to the `feature/spark-data-modeling` branch.

{% highlight bash %}
host$ git clone https://github.com/snowplow/snowplow.git
host$ cd snowplow
host$ git checkout feature/spark-data-modeling
host$ vagrant up && vagrant ssh
guest$ cd /vagrant/5-data-modeling/spark
{% endhighlight %}

Let's assume we have some Snowplow data stored on our machine or in S3 (this is stored in S3)

[apache-spark]: http://spark.apache.org/
[justine]: http://snowplowanalytics.com/blog/2015/05/21/first-experiments-with-apache-spark/
