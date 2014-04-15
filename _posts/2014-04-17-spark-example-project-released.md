---
layout: post
shortenedlink: Spark Example Project released
title: Spark Example Project released for running Spark jobs on EMR
tags: [snowplow, spark, emr, example, tutorial]
author: Alex
category: Releases
---

On Saturday I attended the regular Hack the Tower day at the Salesforce office in London, with lots of members of the London Java and Scala User Groups. It's an opportunity to catch up with others in the Scala community in London, share tips and tricks, and work on longer-term strategic projects. It's also an opportunity to code against the backdrop of some of the best views in London (see below)!

I've been working with Spark at Hack the Tower. Started on a Spark Example Project some time ago - with the intention of repeating the Scalding Example Project which has been a popular starting point for a lot of developers starting to work with Scalding, especially on Elastic MapReduce.

An initial version of the Spark Example Project was built by us xx months ago. We spent some time then trying to get Elastic MapReduce: the goal was to be able to create a far jar which was deployable to S3 and then runnable on Elastic MapReduce via the API in a non-interactive way.

That wasn't possible at the time, despite the valiant efforts of X and Y. However, XXX AWS dude XX released an updated version of his tutorial, which allowed users to run an example jar on the cluster from the master node.

It wasn't a big job to take XX's script, and tweak it so that it could be used to run any fat jar of a Scalding project. That script is now available from Snowplow's hosted assets S3 bucket, here:

I was then able to finish the project and release it! You can check out the code here:

xxx

At the risk of repeating the README, XXXX.

