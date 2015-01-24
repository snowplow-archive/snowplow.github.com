---
layout: post
shortenedlink: Introducing our 2015 Snowplow winterns
title: Introducing our 2015 Snowplow winterns
tags: [snowplow, intern, winter, wintern, internship]
author: Alex
category: Recruitment
---

We are pleased to introduce our two new Data Engineering winterns for the 2014/2015 winter period, Andrew and Aalekh. This is the third instalment of our internship program for open source hackers - you can read more about our previous [winter] [winter-2014] and [summer] [summer-2014] internship programs at those links.

As always, our internships are open to remote applicants as well as candidates in London. Building on what we've learnt works best from the previous internships, our winterns are with us for a little longer this time: one month and two months respectively.

So let's take this opportunity to introduce our interns to the community, as well as giving a little more background on the projects they are working on:

![interns-montage] [interns-montage]

<!--more-->

## Andrew Curtis: storing Snowplow events in Google BigQuery

Andrew Curtis has joined us in the Snowplow office in London as a Data Engineering wintern for a month.

Andrew lives in London and has recently completed a PhD in Mathematics from Queen Mary, University of London. Andrew says that he is looking forward to making a contribution to an open source project like Snowplow. He's also interested in "getting to grips with Scala and seeing how functional programming techniques are used in a large-scale well-established project". Andrew estimates that he has drunk over 70,000 cups of tea over his lifetime.

Andrew is working on loading Snowplow enriched events into [Google BigQuery] [bigquery]. His first experiments here have produced a command-line application which can load a local folder of Snowplow events into a BigQuery table similar in structure to our `atomic.events` table in Redshift and Postgres; expect a blog post announcing the release of this shortly.

Next Andrew is extending our Kinesis-based processing pipeline to "drip feed" Snowplow events into BigQuery in near-real-time via Kinesis.

## Aalekh Nigam: new enrichments for Snowplow

Aalekh Nigam is our second wintern - he is part way through a two-month remote winternship at Snowplow.

Aalekh is a Third-year Electronics and Communication undergraduate at Jaypee Institute Of Information Technology (JIITU); he is working out of New Delhi, India. He is a music Lover, foodie and violinist - we met Aalekh through the open source community when he volunteered to 

, occasionally plays football, Aims to  
  visit Japan one day :D  

Expectation:

* To have better understanding of Scala and its related libraries.
* Get better understanding of programming practices of real world application
* Develop application for large scale production and use.

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

[winter-2014]: /blog/2013/10/07/announcing-our-winter-open-source-internship-program/
[summer-2014]: /blog/2014/08/21/introducing-our-summer-interns/

[interns-montage]: /assets/img/blog/2014/08/summer-interns.png

[bigquery]: https://cloud.google.com/bigquery/
