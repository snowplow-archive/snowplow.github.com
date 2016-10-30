---
layout: post
title: "The Crunch Practical Big Data Conference Budapest was awesome - thank you!"
title-short: Crunchconf Budapest recap
tags: [conference, crunch, Prezi, UStream, Budapest, big data]
author: Yali
category: Meetups
---

A couple of weeks ago I was very lucky to attend, and speak at [Crunch Conference] [crunchconf], a practical big data conference in Budapest, organised by the folks at [Ustream][ustream] and [Prezi][prezi], and headlined by some of the titans of the data industry, including [Doug Cutting][dcutting], the creator of [Hadoop][hadoop] (not to mention Lucene and Nutch) and [Martin Kleppmann][mkleppmann], the creator of [Samza][samza].

## Emerging best practices in event data pipelines

Being invited to speak gave me the opportunity to step back from my day to day focus at Snowplow on:

1. building event data pipelines and
2. helping our users to get the most out of them,

and think more broadly about _**what distinguishes good event data pipelines from bad**_.

Three years ago when we started Snowplow, our focus, and that of the industry as a whole, was on using frameworks like Hadoop and cloud services like EMR to make pipelines linearly scalable, robust and cost effective. Today these are all a given - the things that mark out best in class event data pipelines from the rest, are:

1. A focus on **data quality**, which means in practice making the data pipeline **auditable**, and **early validation of data using schemas**
2. The ability for businesses to **evolve their data pipelines** as they evolve, so that we can change the schemas for the events and entities tracked, and introduce new events and entities, as the activities that take place change, and the questions need to answer in a data-driven way change.

My talk focused on these issues in the context of providing an overview of event pipelines in general from a data processing perspective. The talk was videoed - you can view it below:

<iframe width="480" height="270" src="http://www.ustream.tv/embed/recorded/76534135?html5ui" scrolling="no" allowfullscreen webkitallowfullscreen frameborder="0" style="border: 0 none transparent;"></iframe>

I wasn't the only person talking about event data pipelines. Scott Krueger from [Skyscanner][skyscanner] gave an excellent talk on the Unified Log Infrastructure at Skyscanner, where they make extensive use of both Kafka and Samza.

<!--more-->

<iframe width="480" height="270" src="http://www.ustream.tv/embed/recorded/76539412?html5ui" scrolling="no" allowfullscreen webkitallowfullscreen frameborder="0" style="border: 0 none transparent;"></iframe>

Sergii Khomenko from [StyLight][stylight] gave a great presentation on the different cloud technologies available for building event data pipelines.

<iframe width="480" height="270" src="http://www.ustream.tv/embed/recorded/76531351?html5ui" scrolling="no" allowfullscreen webkitallowfullscreen frameborder="0" style="border: 0 none transparent;"></iframe>

## Data reservoirs, lakes, and swamps. And data provenance

One of the great things about conferences is that they bring people attacking similar problems from different angles together. For me, one of the most interesting talks, for me, was that given by Stephen Brobst from [Teradata][teradata] and Scott Gnau from [Hortonworks][hortonworks] on "Unified Data Architecture". They distinguished between a data lake, where data from all parts of the business is accumulated, and "Enterprise Data Products", which are derived from the data lake, and where data is accessible for production purposes.

This view of the world makes sense if you're Hortonworks (in which case you sell "data lakes") and Teradata (in which case you sell "enterprise data products"). But they're a little bit puzzling if you look at the space from the event data pipeline perspective, because data is taken as a 'given' i.e. you have a lot of data, you accumulate it in your data lake, and then over time you use that data to build out your enterprise data product. In practice, many companies do have lots of data they could do more with. But I believe that at least as much effort should be spent capturing good quality data at source than on accumulating what you've already got.

The other interesting aspect of this talk was exporation of the difference between a "data swamp" and a "data reservoir". Metadata management - understanding the source and structure of the data, including what you are and are not allowed to do with the data, are key to ensuring that the data can actually be used effectively. They referred to this as "data provenance".
Again, it seems to me that capturing this metadata with the data at source, and keeping that metadata with the data itself wherever the data happens to be, seems to be essential: again viewing data infrastructure as pipelines seems a much more useful paradigm to me than a focus on the parts of the pipelines where the data accumulates.

Unfortunately a video of that presentation is not currently available - check out the [Crunch Conference][crunchconf] website to see if that changes.

## Building a culture of A/B testing at Pinterest

Speakers at data conferences tend to focus on technology and analytics. Often, those challenges are a lot easier to solve than the organisational challenges associated with getting people to use data to drive decision making in intelligent ways.

It was therefore enormously refreshing to hear Andrea Burbank from [Pinterest][pinterest] give a superb presentation on she'd built a culture of A/B testing at Pinterest: this is essential viewing for anyone working looking to make their companies data driven.

<iframe width="480" height="270" src="http://www.ustream.tv/embed/recorded/76523152?html5ui" scrolling="no" allowfullscreen webkitallowfullscreen frameborder="0" style="border: 0 none transparent;"></iframe>

## Thank you Prezi and UStream!

Enormous thanks to the folks at Prezi and UStream for organising this awesome event. I this is the first of many :-).

[crunchconf]: http://crunchconf.com/
[skyscanner]: http://www.skyscanner.net/
[stylight]: http://www.stylight.com/
[pinterest]: https://uk.pinterest.com/
[hortonworks]: http://hortonworks.com/
[teradata]: http://www.teradata.co.uk/?LangType=2057&LangSelect=true
[ustream]: http://www.ustream.tv/
[prezi]: https://prezi.com/
[dcutting]: https://en.wikipedia.org/wiki/Doug_Cutting
[mkleppmann]: https://martin.kleppmann.com/
[hadoop]: https://github.com/apache/hadoop
[samza]: https://github.com/apache/samza
