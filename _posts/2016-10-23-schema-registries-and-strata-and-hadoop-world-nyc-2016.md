---
layout: post
title: Schema registries and Strata + Hadoop World NYC 2016
title-short: Schema registries + Strata NYC
tags: [snowplow, strata, hadoop, new york, nyc, iglu, schema registry, confluent]
author: Alex
category: Meetups
---

In late September the Snowplow team attended [Strata + Hadoop World] [strata-nyc-2016] in New York City. It was a great opportunity to check in on the US data science and engineering scenes, and I was pleased to also have the opportunity to give a talk on schema registries.

In this blog post we will briefly cover:

1. [What Crimean War gunboats teach us about the need for schema registries](/blog/2016/10/23/schema-registries-and-strata-and-hadoop-world-nyc-2016#schema-registries-talk)
2. [Alex's session picks](/blog/2016/10/23/schema-registries-and-strata-and-hadoop-world-nyc-2016#schema-registries-talk#alex-picks)
3. [Christophe's session picks](/blog/2016/10/23/schema-registries-and-strata-and-hadoop-world-nyc-2016#schema-registries-talk#christophe-picks)
4. [Some closing thoughts](/blog/2016/10/23/schema-registries-and-strata-and-hadoop-world-nyc-2016#schema-registries-talk#conclusion)

<!--more-->

<h2 id="schema-registries-talk">1. What Crimean War gunboats teach us about the need for schema registries</h2>

It was super-exciting to give my [first talk at Strata, on the importance of schema registries] [alex-talk], drawing parallels with Britain's industrial standardization of the Crimean War era.

At the start of the Crimean War in 1853, Britain's Royal Navy needed 90 new gunboats ready to fight in the Baltic in just 90 days. They were able to build the boats in record time thanks to industrial standardization - specifically the Whitworth thread, the world’s first national screw thread standard.

In my talk, I drew on the story of the Crimean War gunboats to argue that our data processing architectures urgently require a standardization of their own, in the form of schema registries. Like the Whitworth screw thread, a schema registry, such as Snowplow’s own [Iglu] [iglu] or [Confluent Schema Registry] [confluent-schema-registry], allows enterprises to standardise on a set of business entities which can be used throughout their batch and stream processing architectures:

<iframe src="//www.slideshare.net/slideshow/embed_code/key/LeI84nQBgoVdd3" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/alexanderdean/what-crimean-war-gunboats-teach-us-about-the-need-for-schema-registries" title="What Crimean War gunboats teach us about the need for schema registries" target="_blank">What Crimean War gunboats teach us about the need for schema registries</a> </strong> from <strong><a target="_blank" href="//www.slideshare.net/alexanderdean">Alexander Dean</a></strong> </div>

My closing thought was that every organization should implement a schema registry, whether Iglu, Confluent Schema Registry or an in-house system. The schemas in this registry will provide a common language for all data processing throughout your organization; your registry will allow you to assemble your data pipeline from many smaller micro-services, like the Royal Navy's disparate machine shops before them.

I really enjoyed giving the talk, and appreciated the audience's in-depth questions afterwards. Putting the talk together also gave me the chance to step back and take a broader look at the whole schema technology landscape. I am increasingly convinced that Iglu's support for schema resolution across multiple schema registries (plus associated features such as schema URIs) is going to prove an essential feature in the future.

<h2 id="alex-picks">2. Alex's session picks</h2>

* **Karthik Ramasamy** from Twitter introduced [Heron, Twitter's Storm replacement, and Distributed Log, an alternative to Kafka] [karthik-talk]. It was a great talk, full of detail - such as on how lagging consumers in Kafka can badly impact on non-lagging consumers; it also inspired me to take a second look at [Heron] [heron], which was recently open-sourced 
* **Maxime Beauchemin** gave an [engaging talk introducing Caravel] [maxime-talk], AirBnB's data engineer-friendly open source BI tool. Caravel's impressive traction and featureset should grow even faster with four additional AirBnB engineers joining Maximeto work on Caravel. To find out more on Caravel, check out Rob Kingston's great tutorial, [Visualise Snowplow data using Airbnb Caravel & Redshift] [caravel-tutorial]
* **Xavier Léauté** reprised his Strata London talk on the [Kafka, Samza and Druid stack at Metamarkets] [xavier-talk]. Metamarkets scale (300 billion events a day) is certainly inspiring, and Xavier makes a great case for using Kafka, Samza, Druid and Spark at that scale. Metamarkets' Spark usage is particularly encouraging: they use Spark exclusively with S3 (no HDFS in sight), and on spot instances only

<h2 id="christophe-picks">3. Christophe's session picks</h2>

* **Neha Narkhede** from Confluent gave a talk on [Apache Kafka and the rise of real-time data and stream processing][neha-kafka]. Neha is an engaging speaker and her presentation served as a good overview of the current state of real-time.
* **Slava Chernyak** from Google presented on [time and progress in Apache Beam][slava-talk]. I learnt a lot about both Apache Beam and the challenges in delivering on the promise of correct low-latency results in streaming systems.

<h2 id="conclusion">4. Some closing thoughts</h2>

It was great to attend our first Strata + Hadoop World in New York - we will definitely be coming back. It's an impressive event - bigger and more diverse than the London one. All the major players and vendors are there, and it's a good opportunity to catch up with big data's big personalities!

In terms of big trends: the general buzz around Spark seems to be dying down - presumably because Spark usage is so pervasive now, and the platform is maturing. Kafka talks were plentiful and well-attended, with a lot of user appetite to understand how to get the best out of the tool. It was also nice to see the Apache Flink project steadily gaining mind share.

[strata-nyc-2016]: http://conferences.oreilly.com/strata/hadoop-big-data-ny/
[alex-talk]: http://conferences.oreilly.com/strata/hadoop-big-data-ny/public/schedule/detail/51526
[karthik-talk]: http://conferences.oreilly.com/strata/big-data-conference-ny-2015/public/schedule/detail/44632
[maxime-talk]: http://conferences.oreilly.com/strata/hadoop-big-data-ny/public/schedule/detail/51368
[xavier-talk]: http://conferences.oreilly.com/strata/hadoop-big-data-ny/public/schedule/detail/51152
[neha-kafka]: http://conferences.oreilly.com/strata/hadoop-big-data-ny/public/schedule/detail/51552
[slava-talk]: http://conferences.oreilly.com/strata/hadoop-big-data-ny/public/schedule/detail/51626
[iglu]: https://github.com/snowplow/iglu
[confluent-schema-registry]: https://github.com/confluentinc/schema-registry
[heron]: https://github.com/twitter/heron
[caravel]: https://github.com/airbnb/caravel
[caravel-tutorial]: http://discourse.snowplowanalytics.com/t/visualise-snowplow-data-using-airbnb-caravel-redshift-tutorial/515
