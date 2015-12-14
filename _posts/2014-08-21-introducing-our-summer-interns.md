---
layout: post
title: Introducing our Snowplow summer interns
tags: [snowplow, intern, summer, internship]
author: Alex
category: Recruitment
---

Following on from our highly successful [winter internship program](/blog/2013/10/07/announcing-our-winter-open-source-internship-program/), we were keen to expand the program by recruiting open source hackers for more extended internships over summer 2014. We also wanted to expand the scope of our internship program, by including a **data science** intern alongside our traditional data engineering internships. And as always, our internships were open to remote applicants as well as candidates in London.

If you have been following the Snowplow blog or indeed our release schedule, chances are that you've already seen some of the great work our summer interns have been producing. In this blog post, we wanted to take a brief pause from the frantic release schedule and introduce our interns to the community, as well as giving a little more background on the projects they are working on:

![interns-montage] [interns-montage]

<!--more-->

## Jonathan Almeida: Java/Android and iOS trackers for Snowplow

Jonathan Almeida is one of our two remote interns - he is nearing the conclusion of a four-month data engineering internship at Snowplow.

Jonathan is based in Mississauga near Toronto for the summer, and is studying Computer Science at the University of Windsor. Outside of programming, Jonathan likes to run, hike, kayak and play a fair amount of football; he plans on adding skydiving to the list before the end of 2014.

This is Jonathan's first time working for a startup (previous internships were at BlackBerry) and he's looking forward to seeing how they work from the inside; working remotely is new to Jonathan also and he's interested to see how he works on such an open schedule.

Jonathan is working on mobile trackers for Snowplow - one of our most highly requested features. He has been developing an [iOS Tracker] [ios-tracker-develop], which is ready for release, waiting only on the release of Snowplow 0.9.7, which adds mobile support to the rest of the Snowplow event processing pipeline. In preparation for an Android Tracker release, Jonathan has also been responsible for [multiple releases of the Java Tracker] [java-tracker-releases] since the [original contribution](/blog/2014/06/20/snowplow-java-tracker-0.1.0-released/) by Kevin Gleason. Stay tuned for his initial [Android Tracker] [android-tracker-develop] release, also coming soon.

## Benjamin Fradet: a RESTful schema server for Iglu

Ben Fradet is our second data engineering intern - he is part way through a two-month internship at Snowplow.

Ben is also based remotely - in Châteauroux, France. Ben will be graduating next year with a master focused on Data Science and Business Intelligence from the University of Technology of Compiègne. Outside of school and his own programming endeavors, Ben likes jogging and mountainbiking. Comes winter he tries to be on the slopes as much as possible - snowboard and skis.

Ben is working on the yet-to-be-released back-end for [Iglu](/blog/2014/07/01/iglu-schema-repository-released/), Snowplow's new schema product. Ben is building a RESTful schema server for Iglu, coding in Scala and leveraging [Spray] [spray], [Slick] [slick] and [Swagger] [swagger]. Ben's work will provide us with a much more powerful back-end for Iglu, allowing users to publish, test and serve schemas via an easy-to-use RESTful interface. This will be a huge step forward compared to our current approach, which involves uploading schemas to a static website on Amazon S3!

You can follow Ben's progress in the Iglu repository, in the [`server-0.2.0`] [iglu-server] branch.

## Nick Dingwall: piloting the use of graph databases to perform event analytics

Nick Dingwall is our first data science intern - he has completed a three week internship at Snowplow.

Nick has been working from our office in London - taking a break from teaching mathematics at a Quintin Kynaston Community Academy to complete his internship with us, before starting at Masters in Data Science in September. Outside of data science and teaching, Nick is a keen cyclist and backpacker.

Over the course of his internship, Nick ran a series of proofs-of-concept, experimenting with using graph databases to analyse event data, with a particular focus on performing the types of analysis on sequences of events that are hard to perform with traditional, SQL-based databases, answering questions like:

* How do users actually behave on my website? (Rather than specifically how many make it through this funnel?)
* What are the different routes that users take to accomplish this particular goal?
* How can we objectively map the structure of our website, based on the way users actually interact with it?

Nick has published a series of blog posts documenting the results of those trials - you can read about them [here](/blog/2014/07/31/using-graph-databases-to-perform-pathing-analysis-initial-experimentation-with-neo4j/), [here](/blog/2014/07/28/explorations-in-analyzing-web-event-data-in-graph-databases/) and [here](/blog/2014/07/30/loading-snowplow-web-event-data-into-graph-databases-for-pathing-analysis/).

[interns-montage]: /assets/img/blog/2014/08/summer-interns.png

[ios-tracker-develop]: https://github.com/snowplow/snowplow-ios-tracker/tree/develop
[java-tracker-releases]: https://github.com/snowplow/snowplow-java-tracker/releases
[android-tracker-develop]: https://github.com/snowplow/snowplow-android-tracker/tree/develop

[spray]: http://spray.io/
[slick]: http://slick.typesafe.com
[swagger]: https://helloreverb.com/developers/swagger

[iglu-server]: https://github.com/snowplow/iglu/tree/feature/server-0.2.0
