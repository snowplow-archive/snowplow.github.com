---
layout: post
title: Introducing our 2014-2015 Snowplow winterns
tags: [snowplow, intern, winter, wintern, internship]
author: Alex
category: Recruitment
---

We are pleased to announce our two new Data Engineering winterns for the 2014/2015 winter period, Andrew and Aalekh. In this blog post we'll introduce both interns to the Snowplow community, as well as giving a little more background on the projects they are working on.

This is the third instalment of our internship program for open source hackers - you can read more about our previous [winter] [winter-2014] and [summer] [summer-2014] internship programs at those links.

![interns-montage] [interns-montage]

As always, our internships are open to remote applicants as well as candidates in London. Building on what we've learnt works best from the previous internships, our winterns are with us for a little longer this winter: one month and two months respectively. Find out more about Andrew and Aalekh after the jump.

<!--more-->

## Andrew Curtis: storing Snowplow events in Google BigQuery

Andrew Curtis joins us in the Snowplow office in London as a Data Engineering wintern for a month.

Andrew lives in London and has recently completed a PhD in Mathematics at Queen Mary, University of London. Andrew is looking forward to making a contribution to an open source project like Snowplow; he's also interested in "getting to grips with Scala and seeing how functional programming techniques are used in a large-scale well-established project". Andrew estimates that he has drunk over 70,000 cups of tea over his lifetime.

Andrew is working on loading Snowplow enriched events into [Google BigQuery] [bigquery]. His first experiments here have produced a command-line application which can load a local folder of Snowplow events into a BigQuery table similar in structure to our `atomic.events` table in Redshift and Postgres.

Next, Andrew will be extending our Kinesis-based processing pipeline to "drip feed" Snowplow events into BigQuery in near-real-time via Kinesis. Stay tuned for Andrew's first blog posts about Snowplow support for BigQuery soon!

## Aalekh Nigam: new enrichments for Snowplow

Aalekh Nigam is our second wintern - he is part way through a two-month remote winternship at Snowplow.

Aalekh is a Third-year Electronics and Communication undergraduate at Jaypee Institute Of Information Technology (JIITU), working out of New Delhi, India. Aalekh is a music Lover, foodie and violinist - we first met Aalekh as an open source contributor when he volunteered to start building a [Golang Tracker] [golang-tracker] for Snowplow.

Aalekh is working on adding new event enrichments into the core of the Snowplow platform. He is already underway with his first two enrichments:

1. A new useragent parsing enrichment using the [ua-parser] [ua-parser] project. Snowplow users will be able to use both useragent parsers (our existing enrichment is based on the user-agent-utils library), or one or neither
2. A currency conversion enrichment that will automatically convert ecommerce transaction amounts into your company's base currency, using Open Exchange Rates to provide the forex rate for the conversion

Aalekh is hoping to gain a better understanding of Scala through the internship, and also learn more about "programming practices for real-world applications in large-scale use". In the meantime, if you have any suggestions for new Snowplow enrichments, do [get in touch][talk-to-us] or [raise a ticket] [snowplow-issues] on GitHub!

[winter-2014]: /blog/2013/10/07/announcing-our-winter-open-source-internship-program/
[summer-2014]: /blog/2014/08/21/introducing-our-summer-interns/

[interns-montage]: /assets/img/blog/2015/01/winterns.png

[bigquery]: https://cloud.google.com/bigquery/

[golang-tracker]: https://github.com/snowplow/snowplow-go-tracker
[ua-parser]: https://github.com/tobie/ua-parser

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[snowplow-issues]: https://github.com/snowplow/snowplow/issues
