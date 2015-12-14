---
layout: post
title: Snowplow presentation at the Hadoop User Group London AWS event
tags: [amazon, redshift, emr, hadoop, architecture]
author: Yali
category: Meetups
---

Yesterday at the [Hadoop User Group][hug-uk], I was very fortunate to get the opportunity to speak about Snowplow at the event focused specifically on Amazon Web Services, and Redshift in particular.

I hope the talk was interesting to the participants who attended. I described how we use Cloudfront and Elastic Beanstalk to get event data into AWS for processing by EMR, and how we push the output of our EMR-based enrichment process into Redshift for analysis. The slides I presented are below:

<iframe src="http://www.slideshare.net/slideshow/embed_code/24416560" width="427" height="356" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC;border-width:1px 1px 0;margin-bottom:5px" > </iframe>

<div style="margin-bottom:5px"> <strong> <a href="http://www.slideshare.net/yalisassoon/snowplow-presentation-to-hug-uk" title="Snowplow presentation to hug uk" target="_blank">Snowplow presentation to hug uk</a> </strong> from <strong><a href="http://www.slideshare.net/yalisassoon" target="_blank">yalisassoon</a></strong> </div>

Many thanks to Dan Harvey for organising the event, Ian and Ianni from Amazon for their presentations, and Amazon for sponsoring the event!


[hug-uk]: http://www.meetup.com/hadoop-users-group-uk/
