---
layout: post
title: Introducing our 2015 Snowplow summer interns
tags: [snowplow, intern, summer, internship]
author: Alex
category: Recruitment
---

You have probably seen some new names and faces around the Snowplow blog and GitHub repos recently - we are hugely excited to extend a warm (if somewhat belated) welcome to our three Snowplow summer interns! In this blog post we'll introduce both interns to the Snowplow community, as well as giving a little more background on the projects they are working on.

This is the fourth instalment of our internship program for open source hackers and scientists - you can read more about our previous [winter] [winter-2015] and last year's [summer] [summer-2014] and [winter] [winter-2014] internship programs at those links.

![interns-montage] [interns-montage]

Find out more about Anton, Justine and Vincent after the jump.

<!--more-->

## Anton Parkhomenko: Schema Guru, JSON Schema and Iglu

[Anton] [anton] is part way through a three-month remote Data Engineering internship at Snowplow. Anton divides his time between Krasnoyarsk in Siberia and Moscow.

Anton is an experienced software engineer and a Functional Programming enthusiast; for him the Snowplow internship is about getting his first professional experience in Scala, plus gaining exposure to Big Data technologies and open source project practices.

You have probably seen Anton's work already, with his Schema Guru [0.1.0] [schema-guru-010] and [0.2.0] [schema-guru-020] releases. [Schema Guru] [schema-guru] is a tool (CLI and web) allowing you to derive JSON Schemas from a set of JSON instances; it is already seeing heavy internal use at Snowplow to build Snowplow event dictionaries for customers.

Anton is working on his next Schema Guru release, which will auto-generate Snowplow-compatible Redshift table DDL and JSON Paths files from a set of JSON Schemas.

## Justine Courty: Apache Spark, d3.js and marketing attribution

[Justine] [justine] joins us in the Snowplow office in London as a Data Science intern this summer. Justine's internship has been experimenting with extending the Snowplow data pipeline to:

1. Process enriched events in Spark, with a particular focus on aggregating user journeys based on the sequence of specific events in those journeys. (A class of analysis that is particularly badly suited to SQL.)
2. Load the aggregates into a DynamoDB 'serving layer'
3. Visualize the data in innovative ways using D3.js

In particular, Justine has prototyped the above pipeline for marketing attribution pathways. You can see and interact with Justine's visualization in her excellent blog post [analyzing marketing attribution data with d3.js] [justine-blog-post].

Justine has a wealth of data science and engineering experience prior to joining the Snowplow team. She completed a data analysis internship at [SoundCloud][soundcloud] earlier this year and completed her BSC in Biotechnology at Imperial College London, last year. Her final year project was "Computational 3D image analysis: software development towards understanding the molecular basis of torque generation by the bacterial flagellar motor".

## Vincent Ohprecio: analytics on write with Spark Streaming and AWS Lambda

[Vincent] [vincent] is our third intern for the summer - he is part way through a four-month remote Data Engineering internship, based out of Vancouver Canada.

Vincent has had a long and rewarding first career in InfoSec (checkout his [excellent blog] [vincent-blog] to read more); he joins us this summer to get hands-on experience developing stream processing applications in Scala.

You have already seen Vincent's work with his [Spark Streaming Example Project] [spark-streaming-eg], which was an opportunity to explore using [Spark Streaming] [spark-streaming] with AWS Kinesis and DynamoDB. Vincent has since ported this example project to run in AWS Lambda in JavaScript - expect a blog post on this shortly.

Vincent is now working on R&D for our new open-source analytics-on-write project, [Icebucket] [icebucket]. Stay tuned for upcoming posts explaining the concepts behind Icebucket!

[anton]: /authors/anton.html
[justine]: /authors/justine.html
[vincent]: /authors/vincent.html
[vincent-blog]: https://bigsnarf.wordpress.com/

[winter-2015]: /blog/2015/01/25/introducing-our-2014-2015-winterns/
[summer-2014]: /blog/2014/08/21/introducing-our-summer-interns/
[winter-2014]: /blog/2013/10/07/announcing-our-winter-open-source-internship-program/

[interns-montage]: /assets/img/blog/2015/07/summer-interns-2015.jpg

[schema-guru-010]: /blog/2015/06/03/schema-guru-0.1.0-released-for-deriving-json-schemas-from-jsons/
[schema-guru-020]: /blog/2015/07/05/schema-guru-0.2.0-released
[schema-guru]: https://github.com/snowplow/schema-guru/

[spark-streaming]: https://spark.apache.org/streaming/
[spark-streaming-eg]: /blog/2015/06/10/spark-streaming-example-project-0.1.0-released/
[icebucket]: https://github.com/snowplow/icebucket

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[snowplow-issues]: https://github.com/snowplow/snowplow/issues
[justine-blog-post]: /blog/2015/07/02/visualizing-marketing-attribution-data-with-d3js/
[soundcloud]: https://soundcloud.com/
