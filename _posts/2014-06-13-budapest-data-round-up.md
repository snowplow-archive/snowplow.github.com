---
layout: post
title: Budapest Data round-up
tags: [snowplow, budapest, hungary, big data, hadoop, kinesis]
author: Alex
category: Meetups
---

So the [Budapest Data event] [budapest-dw-forum] (aka Budapest DW Forum) is over for another year - a huge thanks to Bence Arató and the whole team for organizing another excellent conference!

In this blog post I want to share my two talks and my "Zero to Hadoop" workshop with the wider Snowplow community.

<div class="html">
<h2><a name="kinesis">Continuous data processing with Kinesis at Snowplow</a></h2>
</div>

My first talk was on the Wednesday afternoon, where I spoke about our process of porting Snowplow to Kinesis, to give our users access to their Snowplow event stream in near-real-time. Areas I talked about included:

* “Hero” use cases for event streaming which drove our adoption of Kinesis
* Why we waited for Kinesis, and thoughts on how Kinesis fits into the wider streaming ecosystem
* How Snowplow achieved a lambda architecture with minimal code duplication, allowing Snowplow users to choose which (or both) platforms to use
* Key considerations when moving from a batch mindset to a streaming mindset – including aggregate windows, recomputation, backpressure

Here are the slides:

<iframe src="http://www.slideshare.net/slideshow/embed_code/35842830" width="427" height="356" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px 1px 0; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="https://www.slideshare.net/alexanderdean/continuous-data-processing-with-kinesis-at-snowplow" title="Continuous Data Processing with Kinesis at Snowplow" target="_blank">Continuous Data Processing with Kinesis at Snowplow</a> </strong> from <strong><a href="http://www.slideshare.net/alexanderdean" target="_blank">alexanderdean</a></strong> </div>

Many thanks to Gergely Daróczi of [Rapporter](http://rapporter.net) for facilitating.

Read on after the fold for the slides from my second talk and workshop...

<!--more-->

<div class="html">
<h2><a name="schemas">Adding data schemas to Snowplow</a></h2>
</div>

On the Thursday evening I gave a flash talk about data schemas and Snowplow at the [Budapest Big Data Meetup][bbdm], alongside other talks by Wouter De Bie (Spotify), Claudio Martella ([Apache Giraph] [giraph]) and Stephan Ewen ([Stratosphere] [stratosphere]).

Here are the slides:

<iframe src="http://www.slideshare.net/slideshow/embed_code/35561513" width="427" height="356" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px 1px 0; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="https://www.slideshare.net/yalisassoon/big-data-meetup-budapest-adding-data-schemas-to-snowplow" title="Big data meetup budapest adding data schemas to snowplow" target="_blank">Big data meetup budapest adding data schemas to snowplow</a> </strong> from <strong><a href="http://www.slideshare.net/yalisassoon" target="_blank">yalisassoon</a></strong> </div>

You can read some more commentary on these slides in Yali's [blog post from last week] [schema-post].

It was great hearing more about the Apache Giraph and (soon to be Apache) Stratosphere projects - we hope to try out both of these for Snowplow use cases soon!

<div class="html">
<h2><a name="workshop">From zero to Hadoop workshop</a></h2>
</div>

Hadoop is everywhere these days, but it can seem like a complex, intimidating ecosystem to those who have yet to jump in. On the Friday afternoon I gave a three-hour Hadoop workshop, with the goal of getting conference attendees with no prior experience at Hadoop writing and running jobs on Elastic MapReduce.

It was a lot of fun - setting up Virtualbox and Vagrant took a lot longer than I foresaw, but once this was done we were able to work through the first of my three example Hadoop jobs together. Unfortunately we ran out of time to tackle the two tutorial Scalding jobs - next time!

Here are the slides for the workshop (any credentials etc have been deleted since the workshop):

<iframe src="http://www.slideshare.net/slideshow/embed_code/35842664" width="427" height="356" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px 1px 0; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="https://www.slideshare.net/alexanderdean/from-zero-to-hadoop" title="From Zero to Hadoop: a tutorial for getting started writing Hadoop jobs on Amazon Elastic MapReduce" target="_blank">From Zero to Hadoop: a tutorial for getting started writing Hadoop jobs on Amazon Elastic MapReduce</a> </strong> from <strong><a href="http://www.slideshare.net/alexanderdean" target="_blank">alexanderdean</a></strong> </div>

Many thanks to Tamás Izsák for his help organizing the workshop!

<div class="html">
<h2><a name="conclusion">Closing thoughts</a></h2>
</div>

I had a great time at [Budapest Data] [budapest-dw-forum] - met many new people, learnt about some great open source projects, and had an opportunity to talk about some of the most exciting aspects of what we're doing with Snowplow.

Giving the Hadoop workshop was also a great experience: it made me realize that the big data and Hadoop communities need to do a lot more in terms of outreach to help seasoned BI and data warehousing practitioners to "jump the fence" into the world of big data, MapReduce and stream processing.

Thanks again to Bence Arató and the whole team for organizing [Budapest Data] [budapest-dw-forum]!

[budapest-dw-forum]: http://2014.budapestdwforum.com/
[budapest-talks]: http://2014.budapestdwforum.com/talks/#alexdean

[bbdm]: http://www.meetup.com/Big-Data-Meetup-Budapest/events/186924342/

[giraph]: https://giraph.apache.org/
[stratosphere]: http://stratosphere.eu/
[schema-post]: /blog/2014/06/06/making-snowplow-schemas-flexible-a-technical-approach/
