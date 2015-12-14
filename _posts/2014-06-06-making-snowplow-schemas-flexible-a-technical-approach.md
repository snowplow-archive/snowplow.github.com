---
layout: post
title: Making Snowplow schemas flexible - our technical approach
title-short: Making Snowplow schemas flexible
tags: [snowplow, schema, schema evolution, structured data, event analytics, data warehousing]
author: Yali
category: Inside the Plow
---

In the last couple of months we've been doing an enormous amount of work to make the core Snowplow schema flexible. This is an essential step to making Snowplow an event analytics platform that can be used to store event data from:

1. Any kind of application. The event dictionary, and therefore schema, for a massive multiplayer online game, will look totally different to a newspaper site, which will look different to a banking application
2. Any kind of connected device. The types of events you get from a SmartMeter will be different to those from a mobile phone

Making schemas flexible is not enough however. We need to make it possible for a business to evolve their schema over time, as for example, their website, apps and products evolve. It is also essential to enabling us to load the data into structured data stores for easy querying.

The presentation below was given by Alex at the [Budapest Big Data Meetup][bbdm] last night. I thought it would be useful to share with the wider Snowplow community, so you all have a better idea what we plan to launch in the next few weeks, and some of the thinking behind it.

<iframe src="http://www.slideshare.net/slideshow/embed_code/35561513" width="427" height="356" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px 1px 0; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="https://www.slideshare.net/yalisassoon/big-data-meetup-budapest-adding-data-schemas-to-snowplow" title="Big data meetup budapest adding data schemas to snowplow" target="_blank">Big data meetup budapest adding data schemas to snowplow</a> </strong> from <strong><a href="http://www.slideshare.net/yalisassoon" target="_blank">yalisassoon</a></strong> </div>

<!--more-->

<h2>Interested in warehousing your event data?</h2>

Then [get in touch] [contact] with the Snowplow team.

[contact]: /about/index.html
[bbdm]: http://www.meetup.com/Big-Data-Meetup-Budapest/events/186924342/
