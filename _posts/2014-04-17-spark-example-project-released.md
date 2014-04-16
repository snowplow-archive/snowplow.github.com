---
layout: post
shortenedlink: Spark Example Project released
title: Spark Example Project released for running Spark jobs on EMR
tags: [snowplow, spark, emr, example, tutorial]
author: Alex
category: Releases
---

On Saturday I attended [Hack the Tower] [hack-the-tower], the monthly collaborative hackday for the London Java and Scala user groups hosted at the Salesforce offices here. It's an opportunity to catch up with others in the Scala community, and to work collaboratively on non-core projects which may have longer term value for Snowplow. It also means I can hack against the backdrop of some of the best views in London (see below)! Many thanks as always to John Stevenson of Salesforce for hosting us. 

Over the last few Hack the Towers, I have been teaming up with other Scala heads to try out [Apache Spark] [apache-spark], a cluster computing framework and potential challenger to Hadoop. The particular challenge I set myself this month was to complete our [Spark Example Project] [spark-example-project], which is a clone of our popular [Scalding Example Project] [scalding-example-project]. Most tutorials introducing data processing frameworks like Scalding or Spark assume that you are working with a local cluster in an interactive (e.g. REPL-based) fashion. At Snowplow, we are much more interested in creating self-contained jobs which can be run on Amazon's Elastic MapReduce with a minimum of supervision, so that is what I set out to template in the Spark Example Project.

In the rest of this blog post, I will set out:

* Challenges of running Spark on EMR
* How to use Spark Example Project
* Spark and Snowplow

I've been working with Spark at Hack the Tower. Started on a Spark Example Project some time ago - with the intention of repeating the Scalding Example Project which has been a popular starting point for a lot of developers starting to work with Scalding, especially on Elastic MapReduce.

An initial version of the Spark Example Project was built by us xx months ago. We spent some time then trying to get Elastic MapReduce: the goal was to be able to create a far jar which was deployable to S3 and then runnable on Elastic MapReduce via the API in a non-interactive way.

That wasn't possible at the time, despite the valiant efforts of X and Y. However, XXX AWS dude XX released an updated version of his tutorial, which allowed users to run an example jar on the cluster from the master node.

It wasn't a big job to take XX's script, and tweak it so that it could be used to run any fat jar of a Scalding project. That script is now available from Snowplow's hosted assets S3 bucket, here:

I was then able to finish the project and release it! You can check out the code here:

xxx

At the risk of repeating the README, XXXX.


Snowplow and Spark


[hack-the-tower]: http://www.hackthetower.co.uk/
[hack-the-tower-apr]: http://www.meetup.com/london-scala/events/173280452/
[]
