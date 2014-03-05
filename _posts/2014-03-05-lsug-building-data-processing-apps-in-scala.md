---
layout: post
shortenedlink: LSUG - Building data processing apps in Scala
title: LSUG talk - Building data processing apps in Scala, the Snowplow experience
tags: [lsug, scala, snowplow, scalding, kinesis, redshift]
author: Alex
category: Other
---

I was delighted to speak at the [London Scala Users' Group] [lsug-meetup] (LSUG) last night about our experiences at Snowplow building data processing pipelines in Scala. It was a great turnout, and there were plenty of excellent questions afterwards showing that a good slice of the audience have had overlapping data processing experiences. Many thanks to Andy Hicks of the London Scala Users' Group for organizing, and to [Skills Matter] [skills-matter] for hosting!

![lsug-talk] [pic]

More on the talk after the jump:

<!--more-->

In my talk I introduced Snowplow briefly, then showed how our loosely-coupled architecture had allowed us to introduce Scala gradually, starting with our Scalding-based enrichment process for Hadoop, and ramping up a few gears now with our all-Scala Kinesis-based process. I dived into a little detail on the "secret sauce" of our Scala implementation, not least the Scalaz Validation, which is our key data processing primitive, plus our great experiences with Specs2 data tables and ScalaCheck. Finally I rounded off by discussing our roadmap, focusing particularly on [our vision around the unified log concept and Kinesis] [three-eras], and our otherwise-unannounced plans to re-implement our Tracker Protocol around JSON Schema.

Please check out the slides for more:

<iframe src="http://www.slideshare.net/slideshow/embed_code/31933912" width="476" height="400" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC;border-width:1px 1px 0;margin-bottom:5px" > </iframe> 

<div style="margin-bottom:5px"> <strong> <a href="http://www.slideshare.net/alexanderdean/data-processing-with-scala-the-snowplow-experience" title="Snowplow presentation to London Scala UG" target="_blank">Snowplow presentation to London Scala UG</a> </strong> from <strong><a href="http://www.slideshare.net/alexanderdean" target="_blank">alexanderdean</a></strong> </div>

Also Skills Matter have now made the video available, [check it out] [video]!

One of my favourite things about Snowplow technology talks is the chance to get feedback on our codebase, design choices and future roadmap. It was great to hear about Graham Tackley's experiences with JSON Schema and Elasticsearch at the Guardian, and Volker Pacher's work implementing Neo4J at Shutl. We also got a great suggestion from Ian Morgan at Can Factory, around parallelizing our individual enrichments as we start to add more blocking, time-consuming enrichmentssuch as currency conversions (which are coming soon); this becomes increasingly important as we consider minimizing lag in our new Kinesis-based enrichment flow.

So a great meetup, thanks again to Andy Hicks, LSUG and Skills Matter for arranging! And as a final note - if you are around in London and would like to grab a coffee to talk Scala, Snowplow and data - do [get in touch] [talk-to-us]!

<iframe src="http://www.slideshare.net/slideshow/embed_code/31933912" width="476" height="400" frameborder="0" marginwidth="0" marginheight="0" scrolling="no"></iframe>

[lsug-meetup]: http://www.meetup.com/london-scala/
[skills-matter]: https://skillsmatter.com/
[pic]: /assets/img/blog/2014/03/lsug-talk.jpg

[three-eras]: /blog/2014/01/20/the-three-eras-of-business-data-processing/

[video]: https://skillsmatter.com/skillscasts/5063-building-data-processing-applications-in-scala-the-snowplow-experience#video
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

