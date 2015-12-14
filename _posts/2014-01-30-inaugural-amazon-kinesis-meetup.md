---
layout: post
title: Inaugural meetup of the Amazon Kinesis - London User Group
title-short: Inaugural Amazon Kinesis London meetup
tags: [amazon, kinesis, london, meetup]
author: Alex
category: Meetups
---

Yesterday evening saw the [inaugural meetup] [1st-meetup] of the [London User Group for Amazon Kinesis] [kinesis-london].

At Snowplow we have been working with [Kinesis] [kinesis] since its first announcement, and we were keen to organize a Kinesis-centric meetup for the tech community here in London and the South-East. And it looks like our excitement about Kinesis is widely shared - there were almost 40 "Kinetics" attending the first meetup. Huge thanks to [Just Eat] [just-eat] for hosting all of us in their offices and keeping us all fed with pizza and beer!

![kinesis-meetup] [pic]

More on the talks after the jump:

<!--more-->

There were two talks at the event:

* [Ian Meyers] [ianmeyers], Solutions Architect at AWS, gave an excellent introduction to Amazon Kinesis. Ian took us through the main envisaged use cases, the key technical concepts and some example application architectures, before fielding a great set of questions
* I gave a talk on "Snowplow and Kinesis". I briefly introduced Snowplow, explained why we were excited about Kinesis (drawing on my ["three eras" blog post] [three-eras]) and then set out how we are updating Snowplow to run on Kinesis. I concluded with a live demo of what we have running on Kinesis so far

It was particularly encouraging to see so many great questions asked by the participants - there was clearly a ton of stream processing and message queue expertise in the room! It was also great to chat to people already trialling Kinesis.

The slides I presented are below:

<iframe src="http://www.slideshare.net/slideshow/embed_code/30634807" width="476" height="400" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC;border-width:1px 1px 0;margin-bottom:5px" > </iframe>

<div style="margin-bottom:5px"> <strong> <a href="http://www.slideshare.net/alexanderdean/kinesis-meetup-1" title="Snowplow presentation to London Kinesis UG" target="_blank">Snowplow presentation to London Kinesis UG</a> </strong> from <strong><a href="http://www.slideshare.net/alexanderdean" target="_blank">alexanderdean</a></strong> </div>

The live demo gave a sneak peak at the two new Kinesis-based Snowplow components coming in [version 0.9.0] [090-issues]:

1. The new Scala Stream Collector - running on my laptop, receiving Snowplow raw events over HTTP and putting them to a Kinesis raw events stream
2. The new Scala Kinesis Enrich - running on an EC2 box, receiving Snowplow raw events from Kinesis and putting them to a Snowplow enriched events stream

I'm afraid that I don't (yet!) have a way of recreating or sharing the live demo - this is something we will hopefully come back to following the 0.9.0 release.

It was a great evening - and hopefully the first of many as the Kinesis community takes shape here in the UK! A big thank you to Peter Mounce and the Just Eat Engineering team for being such excellent hosts, and a warm thanks for Ian Meyers for giving us the inside track on Amazon Kinesis!

Do please [join the group] [kinesis-london] to be kept up-to-date with upcoming meetups, and if you would like to give a talk, email us on [kinesis-ug@snowplowanalytics.com] [email].

[pic]: /assets/img/blog/2014/01/kinesis-meetup.jpg

[1st-meetup]: http://www.meetup.com/kinesis-london/events/155043952/
[kinesis-london]: http://www.meetup.com/kinesis-london/
[kinesis]: http://aws.amazon.com/kinesis/

[just-eat]: http://www.just-eat.co.uk/
[ianmeyers]: https://twitter.com/IanMeyers

[three-eras]: /blog/2014/01/20/the-three-eras-of-business-data-processing/
[090-issues]: https://github.com/snowplow/snowplow/issues?milestone=33&page=1&state=closed

[email]: mailto:kinesis-ug@snowplowanalytics.com
