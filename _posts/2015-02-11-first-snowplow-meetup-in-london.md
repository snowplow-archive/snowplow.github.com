---
layout: post
title: Inaugural Snowplow meetup London - a recap
tags: [event, analytics, bigquery]
author: Yali
category: Meetups
---

This time last week we held the inaugural [Snowplow London meetup](http://www.meetup.com/Snowplow-Analytics-London/). Roughly 50 Snowplow users turned up to listen to two fantastic presentations from [Simply Business](http://www.simplybusiness.co.uk/) and [Metail](http://metail.com/) on the role Snowplow plays in their data architecture and how they use their Snowplow data. The talks were incredibly interesting, so I'm keen to share them with the wider Snowplow community. I'm also very eager to get feedback so that we can build on this start to make future events as interesting as possible - we have aspirations to hold them in many more countries, so that users all over the world get the chance to attend and learn from one-another.

1. [Using Cascalog to model Snowplow data at Metail](/blog/2015/02/11/first-snowplow-meetup-in-london/#metail)
2. [Tracking users across channels and performing multi-channel attribution (using Bayesian networks) at Simply Business](/blog/2015/02/11/first-snowplow-meetup-in-london/#simplybusiness)  
3. [Feedback and future events](/blog/2015/02/11/first-snowplow-meetup-in-london/#future)
4. [Many thanks](/blog/2015/02/11/first-snowplow-meetup-in-london/#thanks)

<h2><a name="metail">Using Cascalog to model Snowplow data at Metail</a></h2>

![rob metail talk](/assets/img/blog/2015/02/rob_metail_presenting_at_snowplow_london_meetup_1.jpg)

<!--more-->

Robert Boland, the Lead Data Architect at [Metail](http://metail.com/), gave a fascinating talk on why they use Snowplow and how they use Cascalog today to crunch Snowplow data. You can view the full contents of Rob's presentation below:

<iframe src="//www.slideshare.net/slideshow/embed_code/44300457" width="700" height="585" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/RobertBoland1/snowplow-metail-and-cascalog" title="Snowplow, Metail and Cascalog" target="_blank">Snowplow, Metail and Cascalog</a> </strong> from <strong><a href="//www.slideshare.net/RobertBoland1" target="_blank">Robert Boland</a></strong> </div>

Metail use Cascalog to perform 'data modelling': taking their event-level data and rolling it up to provide a view on entities and events that matter to their business, and on top of which they can drive reporting directly. (Those entities include visitors, sessions, A/B tests, orders, garments and body shapes, for example.)

Rob's talk was very timely - we've been doing a lot of thinking about data modelling at Snowplow. Up until now this is something that we've been doing predominantly in Redshift directly using SQL - so it was fascinating learning about the potential benefits of moving this process to Hadoop, and writing it in Cascalog.

<h2><a name="simplybusiness">Tracking users across channels and performing multi-channel attribution (using Bayesian networks) at Simply Business</a></h2>

![stewart simply business talk](/assets/img/blog/2015/02/stewart_simply_business_presenting_at_snowplow_meetup_1.jpg)

Stewart Duncan, Director of Data Science at [Simply Business](http://tech.simplybusiness.co.uk/), talked us through the journey that Simply Business had gone through in terms of their data architecture, before diving into an explanation of how they use modelled their Snowplow attribution data using Bayesian networks to perform marketing attribution. This has been very significant for Simply Business, because it enabled them to measure the nurturing impact that a number of channels that operate between first and last touch have in terms of driving conversion. You can view Stewart's slides below, and read his recap of the event on the [Simply Business tech blog](http://tech.simplybusiness.co.uk/).

<iframe src="//www.slideshare.net/slideshow/embed_code/44431324" width="700" height="585" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/lotius/snowplow-meetup-multichannel-attribution-analysis" title="Simply Business and Snowplow - Multichannel Attribution Analysis" target="_blank">Simply Business and Snowplow - Multichannel Attribution Analysis</a> </strong> from <strong><a href="//www.slideshare.net/lotius" target="_blank">Stewart Duncan</a></strong> </div>

<h2><a name="future">Feedback and future events</a></h2>

We're very keen on holding more Snowplow meetups in future, in London and in the rest of the world. I think it's a great opportunity for our users to share knowledge and best practice - we're very fortunate to have lots of smart companies use our technology in myriad ways, and holding these events provides a way to share that knowledge around that community.

I'm also interested in any feedback - both from people who attended the event and those who didn't:

1. What are you interested to hear about? The data architecture side? The analytics side?
2. Are these events a good forum for talking to the Snowplow team in person? Should we be using them to talk about e.g. our development roadmap?
3. Where should we hold an event? Do you think we should come to your city? (If so, can you help us identify a suitable venue?)
4. How often should we hold the meetup?
5. Anything else we can do to make the meetups better?

Let us know!

<h2><a name="thanks">Many thanks</a></h2>

Big big thanks to our two speaks - Rob from Metail and Stewart from Simply Business. And big thanks to the Simply Business team as a whole, for hosting the venue at their lovely offices, and providing all the pizza and cold beer.





<!--more-->
