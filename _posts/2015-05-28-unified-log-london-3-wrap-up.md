---
layout: post
shortenedlink: Unified Log London 3 wrap up
title: "Unified Log London 3 wrap up"
tags: [unified log, meetup]
author: Alex
category: Meetups
---

Last week we held the third Unified Log London meetup (the second since its rebranding from the [Amazon Kinesis Meetup] [meetup-1]) here in London.Huge thanks to [Just Eat] [just-eat] for hosting us in their offices and keeping us all fed with pizza and beer!

![unified-log-london-meetup] [pic]

More on the talks after the jump:

<!--more-->

There were two talks at the event:

* I gave a brief recap on the Unified Log "manifesto" for new ULPers, with my regular presentation on "Why your company needs a Unified Log"
* [Mischa Tuffield] [mischa], CTO at [State] [state], gave an excellent talk on how they have implemented a Unified Log at State using Apache Kafka and Samza

There was a great mix of Unified Log practitioners and people just dipping their toes into the new concepts. It was particularly encouraging to see such an interactive, "salon" style atmosphere to the discussion around both talks, continuing late into the evening!




so many great questions asked by the participants - there was clearly a ton of stream processing and message queue expertise in the room! It was also great to chat to people already trialling Kinesis.

 by Solutions Architect at AWS, gave an excellent introduction to Amazon Kinesis. Ian took us through the main envisaged use cases, the key technical concepts and some example application architectures, before fielding a great set of questions
* I gave a talk on "Snowplow and Kinesis". I briefly introduced Snowplow, explained why we were excited about Kinesis (drawing on my ["three eras" blog post] [three-eras]) and then set out how we are updating Snowplow to run on Kinesis. I concluded with a live demo of what we have running on Kinesis so far


We were very lucky to have three excellent speakers. Niels Reijmer and Andrei Scorus led with a talk about how [de Bijenkorf] [bijenkorf] use Snowplow to collect event-level data to generate more detailed customer-level reporting, understand the results of A/B tests and build a personalization API. It was especially interesting to learn how they were iterating their personalization approach in a data-driven way, layering on additional complexity as they progress. You can view their presentation below.

<a href="/assets/pdf/snowplow-at-de-bijenkorf.pdf"><img src="/assets/img/blog/2015/05/snowplow-at-de-bijenkorf-presentation-cover.png" /></a>

Ruben Mak from [Blue Mango][bluemango] followered with an indepth look at attribution modeling in a multi-touch world. Ruben covered an enormous amount of ground, starting with an overview of the different approaches available to understand the impact of different channels collectively on driving customer behaviour, before diving into detail into the approach to attribution modeling taken at Blue Mango. You can view his presentation below.

<a href="/assets/pdf/conversion-attribution-on-snowplow-data-at-blue-mango.pdf"><img src="/assets/img/blog/2015/05/blue-mango-conversion-attribution-on-snowplow-data-presentation-cover.png" /></a>

Huge thank you to [Martijn van Vreeden] [martijn] for organising the event, and Rob Winters and the folks at [Travelbird] [travelbird] for hosting us, feeding and watering us :-).

We hope to return to Amsterdam soon for a second event. 


Big themes 

There were some really interesting themes that emerged during the

Thanks and next event

It was a great evening - it's exciting to see the Unified Log  A big thank you to Peter Mounce and the Just Eat Engineering team for being such excellent hosts, and a warm thanks for Ian Meyers for giving us the inside track on Amazon Kinesis!

Do please [join the group] [kinesis-london] to be kept up-to-date with upcoming meetups, and if you would like to give a talk, please email us on [unified-meetup@snowplowanalytics.com] [email].

[]: 

[meetup-1]: /blog/2014/01/30/inaugural-amazon-kinesis-meetup
[just-eat]: http://www.just-eat.co.uk/

[pic]: xxx

[mischa]: xxx
[dan]: xxx
[state]: xxx

[email]: mailto:unified-ug@snowplowanalytics.com
