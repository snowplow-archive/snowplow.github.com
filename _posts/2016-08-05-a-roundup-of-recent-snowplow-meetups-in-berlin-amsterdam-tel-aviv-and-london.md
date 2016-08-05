---
layout: post
title: A roundup of recent Snowplow Meetups in Amsterdam, Berlin, London and Tel-Aviv
title-short: Meetup roundup! Amsterdam, Berlin, London and Tel-Aviv
tags: [meetups, Tel-Aviv]
author: Yali
category: Meetups
---

It has been a busy summer at Snowplow. We've done a number of meetups in some of our favorite cities around the world but failed (until now) to write them up on the website, so apologies - it is very important for us to share talks, slides and insights with the broader Snowplow community. Let us rectify that now! 

## Amsterdam Meetup: May 2016

We had a great crowd turn out for the event at the lovely [Impact Hub][impact-hub].

I opened the event with a quick outline of why digital analytics is such an exciting place to work right now, before diving into how we're re-inventing how companies do digital analytics at Snowplow. We then discussed our development roadmap at Snowplow, outlining the different ways we are working to make it easier to track event data from more places, compute on that data and act on the intelligence developed. 

<iframe src="//www.slideshare.net/slideshow/embed_code/key/ospSkdyZRYtZfK" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/yalisassoon/yali-presentation-for-snowplow-amsterdam-meetup-number-2" title="Yali presentation for snowplow amsterdam meetup number 2" target="_blank">Yali presentation for snowplow amsterdam meetup number 2</a> </strong> from <strong><a target="_blank" href="//www.slideshare.net/yalisassoon">yalisassoon</a></strong> </div>

Daniel Gelber and Iliana Iankoulova gave the second talk about [Picnic.nl][picnic.nl] and how they've employed Snowplow to power analytics and intelligence at Picnic.

<!--more-->

![daniel-gelber-picnic-talk][daniel-gelber-picnic-img]

Picnic is a fascinating company: an online-only grocery retailer that offer groceries cheaper than any other supermarket. That's a tough operational proposition to deliver on and data and intelligence is key to enabling it. We are delighted that Snowplow powers that backbone of that intelligence. We don't yet have the slides from the Picnic.nl team to share, but we'll update this post as soon as we do.

The final talk of the event was delivered by [SDU's][sdu] Sander Knol and [TDHI's][ispark] Tamara de Heij, about capturing online customer data at SDU, how they came to choose and implement Snowplow + Spark and what they learnt on that journey.

<iframe src="//www.slideshare.net/slideshow/embed_code/key/1ign5JYlXUP2hN" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> 

Sander and Tamara talked in depth detail about in the context the Snowplow + Spark project at SDU, and in their practical learnings proving out the technology stack. I hope we can organise a follow up event to learn more about how the use of Snowplow has evolved since!


## Berlin Meetup: May 2016

Our Berlin Meetup followed hot on the heels of the Amsterdam event.

The event opened with a talk from Gino Cordt from [N26][numbers26]: who aim to make it possible to run your entire financial life from your mobile phone. 

![gino-cordt-n26-use-snowplow][gino-img]

That was followed up with a talk from Christophe Bunte about how Snowplow is used at [LiveIntent][liveintent].

![christophe-bunte-how-we-use-snowplow-at-live-intent][cb-img]

The event was rounded off by a talk from Matthias Warnke about how Snowplow is used at [Raisin] [raisin].

![matthias-warnke-how-raisin-use-snowplow-to-power-analytics][raisin-img]

We hope to post the slides presented by Gino, Christophe and Matthias shortly!


## London Meetup: June 2016

In June we convened at the lovely [CodeNode][code-node] venue for the second Snowplow Meetup London.

The event was opened with a very wide ranging talk from [Peak.net's][peak] Thomas in't Veld. Thomas explored the idea of what he calls the "No Stack Startup": building new business on top of external services and minimizing your internal infrastructure. He went on to explore how what this means for data science and the role of the data scientist in particular. He illustrated it with how he manages data science at Peak, which has a fascinating proposition around encouraging and enabling cognitive development.

<iframe src="//www.slideshare.net/slideshow/embed_code/key/BG7gIO7wREL9Ew" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe>

He was followed by a more technical talk by [Streetlife's][streetlife] Jorge Bastida. Analytics is at the core of the Streetlife business model. Streetlife has been using the Snowplow batch pipeline for a long time, do better understand and communicate with their userbase. The team is moving to the real-time pipeline and has started developing real-time applications on [AWS Lambda][aws-lambda] that consume Snowplow data. To assist with the process of creating and publishing applications written in AWS Lambda Jorge has developed [Gordon][gordon], which he demo'd live!

<iframe src="//www.slideshare.net/slideshow/embed_code/key/uvuFSXrLwFLyLy" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> 

The event was concluded by a talk from Andrew Shakespeare of Rocket-backed [Finery London][finerylondon]. Andrew gave an overview of the analytics setup at Finery before diving into how data is used at Finery with the example of optimizing product placement on their website and Facebook and Instagram adverts.

<iframe src="//www.slideshare.net/slideshow/embed_code/key/nblUYjQ0ZgpJFL" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> 

## Tel-Aviv Meetup: July 2016

Our most recent event was in Tel-Aviv, a month after the London Meetup. 

The event was opened by Dani Waxman, who gave a talk about how Snowplow is used at [Viewbix][viewbix], and the journey they went through at Viewbix first to select Snowplow and then utilise it to the full.

<iframe src="//www.slideshare.net/slideshow/embed_code/key/2MdAouPSmxUWFQ" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> 

I then gave a talk about the importance of your event data pipeline evolving with your business, and how Snowplow enables this through a combination of self-describing data and the ability to recompute your data models on your entire event data set.

<iframe src="//www.slideshare.net/slideshow/embed_code/key/9bfDanAAuJXjTt" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> 

The event was rounded off with a talk from [The Culture Trip's][culture-trip] Nir Sivan, who described how Snowplow data was used at The Culture Trip to email conversions, downloads, shares on Facebook and inform the product development process.

<iframe src="//www.slideshare.net/slideshow/embed_code/key/tNQwkPviezxHy5" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> 

## Stay tuned for more Snowplow Meetups!

We have meetups planned for [New York in September][snowplow-meetup-ny], [Sao Paolo][sao-paolo-meetup], [London in September][snowplow-meetup-london] and [Berlin in November][snowplow-meetup-berlin].


[impact-hub]: http://amsterdam.impacthub.net/
[picnic.nl]: https://www.picnic.nl/
[sdu]: https://www.sdu.nl/
[ispark]: http://tdhi.nl/en/
[daniel-gelber-picnic-img]: /assets/img/blog/2016/08/daniel-gelber.jpg
[numbers26]: https://n26.com/
[gino-img]: /assets/img/blog/2016/08/gino-cordt-n26.jpg
[cb-img]: /assets/img/blog/2016/08/christophe-bunte-live-intent.jpg
[peak]: http://www.peak.net/
[raisin-img]: /assets/img/blog/2016/08/matthias-warnke-from-raisin.jpg
[code-node]: https://skillsmatter.com/contact-us
[streetlife]: https://www.streetlife.com/
[aws-lambda]: http://docs.aws.amazon.com/lambda/latest/dg/welcome.html
[finerylondon]: https://www.finerylondon.com/
[viewbix]: http://corp.viewbix.com/
[culture-trip]: http://theculturetrip.com/
[snowplow-meetup-ny]: http://www.meetup.com/Snowplow-Analytics-New-York/events/231907418/
[sao-poalo-meetup]: http://www.meetup.com/Snowplow-Analytics-Sao-Paulo/
[snowplow-meetup-london]: http://www.meetup.com/Snowplow-Analytics-London/
[snowplow-meetup-berlin]: http://www.meetup.com/Snowplow-Analytics-Berlin/events/233147132 
[liveintent]: https://liveintent.com/
[raisin]: https://www.raisin.com/