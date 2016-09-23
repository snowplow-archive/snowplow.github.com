---
layout: post
title: The third Snowplow Meetup London was all about Real-Time!
title-short: Snowplow London Meetup 3 - all about Real-Time!
tags: [meetups, London, Memrise, Simply Business, real-time]
author: Idan
category: Meetups
---

The third Snowplow Meetup London take place last Wednesday evening. The event was focused on real-time event data processing. It's been more than two and a half years since we started working on the Snowplow real-time pipeline and it is great that in the last few months usage of that technology has really started to sky rocket!

[Simply Business's][simply-business] [Dani Sola][dani-sola] kicked the event off with a look at how Simply Business use their real-time event stream to personalise the web user experience for users visiting from a radio campaigns, and to provide comprehensive near-real time reporting about the performance of their call center teams. (Simply Business do a great job of tracking their users across both web and call center seamlesslly with Snowplow.) Dani went into a fair amount of technical detail including a detailed description of why and how they use Spark Streaming to process their event data, and how the real-time visitor data is made easily available to user-facing applciations via a visitor API.

<div class="html"><iframe src="//www.slideshare.net/slideshow/embed_code/key/3UtTtbACJ5ZiFX" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/secret/3UtTtbACJ5ZiFX" title="Simply Business - Near Real Time Event Processing">Simply Business - Near Real Time Event Processing</a> </strong></div></div>


<!--more-->



Our very own [Alex][alex-dean] followed up with a talk on Tupilak: our fabric for monitoring, autoscaling and alerting real-time pipelines. At Snowplow we run many real-time pipelines on behalf of our clients and Tupilak is a platform we've developed to enable us to do this effectively at scale. Tupilak enables us to visualize, reason about and manage complicated real-time data processing topologies. We rely on it to alert us to pipeline issues (e.g. processing lag) and automatically scale pipelines to efficiently handle traffic spikes.



<div class="html"><iframe src="//www.slideshare.net/slideshow/embed_code/key/pHx4Odmo2TSrEl" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/alexanderdean/introducing-tupilak-snowplows-unified-log-fabric" title="Introducing Tupilak, Snowplow&#x27;s unified log fabric">Introducing Tupilak, Snowplow&#x27;s unified log fabric</a> </strong> </div></div>


Finally [Memrise's][memrise] [Daniel Zohar][daniel-zohar] gave a great presentation talking us through the analytics journey Memrise has been on, and how they're planning to evolve it with real-time.


<div class="html"><iframe src="//www.slideshare.net/slideshow/embed_code/key/Co8lHcFT6JyRid" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/secret/Co8lHcFT6JyRid" title="Memrise presentation @ London Snowplow meetup ">Memrise presentation @ London Snowplow meetup </a> </strong> </div></div>


We'll be in [New York][snowplow-meetup-ny] next week for the second Snowplow Meetup New York! Get in touch if you'd like to meetup whilst we're there.


[simply-business]: http://www.simplybusiness.co.uk/
[dani-sola]: https://uk.linkedin.com/in/danisola
[alex-dean]: /blog/authors/alex/
[memrise]: https://www.memrise.com/
[daniel-zohar]: https://uk.linkedin.com/in/danielzohar
[snowplow-meetup-ny]: http://www.meetup.com/Snowplow-Analytics-New-York/events/231907418/
