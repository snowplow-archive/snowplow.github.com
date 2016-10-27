---
layout: post
title: The Snowplow Meetup New York Number 2 - a recap
title-short: "Snowplow Meetup NYC #2"
tags: [snowplow, meetup, hadoop, new york, nyc, animoto, canary, product analytics]
author: Yali
category: Meetups
---

On September 22nd, the second Snowplow Meetup London took place at the fabulous [Canary][canary] office in Manhatten.

I wasn't able to make the event but I'm very lucky that Alex, Idan and Christophe made sure the talks were filmed. You can view them below:

1. [Introducing Sauna: our new decisioning and response platform](/blog/2016/10/27/snowplow-meetup-new-york-number-2-a-recap/#sauna)
2. [Snowplow at Canary: why and how Snowplow is used at Canary](/blog/2016/10/27/snowplow-meetup-new-york-number-2-a-recap/#canary)
3. [Using Snowplow to enable product analytics at Animoto](/blog/2016/10/27/snowplow-meetup-new-york-number-2-a-recap/#animoto)
4. [Event data modeling](/blog/2016/10/27/snowplow-meetup-new-york-number-2-a-recap/#event-data-modeling)
5. [Huge thank you to Tiernan, Stevie, Lincoln and the Canary team for hosting us!](/blog/2016/10/27/snowplow-meetup-new-york-number-2-a-recap/#thank-yous)

<h2 id="sauna">1. Introducing Sauna: our new decisioning and response platform</h2>

[Alex][alex] opened the event with an introduction to [Sauna][sauna]: our new decisioning and response platform.

<iframe width="560" height="315" src="https://www.youtube.com/embed/yp0XszZeh58" frameborder="0" allowfullscreen></iframe>

You can read more about Sauna [here][sauna] and checkout the repo [here][sauna-repo].

<!--more-->

<h2 id="canary">2. Snowplow at Canary: why and how Snowplow is used at Canary</h2>

Canary has a unique proposition in the home security space with a very distinctive set of analytics requirements. In this talk, Tiernan Kennedy describes some of Canary's unique analytics requirements, before explaining how that led them from Google Analytics to Snowplow, and then how their usage of Snowplow has evolved as Canary has grown.

<iframe width="560" height="315" src="https://www.youtube.com/embed/7zgP8O2rSm8" frameborder="0" allowfullscreen></iframe>

Ensuring that analytics stacks can evolve with businesses as they evolve is a really important topic and something I believe Snowplow excels at. This is a topic I explored in my [presentation][ys-presentation-tv] at last July's meetup in Tel-Aviv.

<h2 id="animoto">3. Using Snowplow to enable product analytics at Animoto</h2>

[Animoto][animoto] enables people to make beautiful videos easily. In this talk, Lincoln Ritter & Stevie Clifton had a frank and open discussion about using Snowplow data to do product analytics and the journey that Animoto has gone through migrating to Snowplow from Google Analytics.

<iframe width="560" height="315" src="https://www.youtube.com/embed/y2RUzReJV4I" frameborder="0" allowfullscreen></iframe>

The Animoto team has been using Snowplow for nearly two years now and it's clear that both Lincoln and Stevie have thought very deeply about how to perform product analytics. Amongst other things, in this talk they explored:

* The trade-off between the power that moving from a 'page-view-centric' to an 'event-centric' approach to tracking users through a product: what that gains you in terms of power and flexibility, but the what it means in terms of the extra work involved in visualizing that data
* The importance of the fundamental concepts like 'session' that evant analytics depends on, and how important it is for a company like Animoto to own the definitions of those core concepts and ensure that they fit their specific company's product proposition
* The importance of treating your analytics stack as a product that needs to be managed and developed over time, with users, managers, integration tests and everything else that goes with that. As Lincoln points out in the discussion, this is not how most companies treat their analytics stacks.

<h2 id="event-data-modeling">4. Event data modeling</h2>

Our own [Christophe Bogaert][christophe] rounded off the event with an interactive discussion about event data modeling. There was a lot of interesting insight from different Snowplow users around the different approaches they've taken.

<iframe width="560" height="315" src="https://www.youtube.com/embed/a_lv-JuVYiI" frameborder="0" allowfullscreen></iframe>

If you are interested in learning more about event data modeling there is a wealth of material on our [discourse forum][discourse-event-data-modeling].

<h2 id="thank-yous">5. Thank yous!</h2>

Our vision for the Snowplow Meetups has always been that they become forums where some of the most analytically sophisticated companies share challenges, approaches and best practices around event analytics. It is great to watch the these videos and see the high level of conversation that was had at the event.

Huge thanks for that must go too Tiernan, Stevie, Lincoln, Alex and Christophe for four excellent talks, and everyone who attended and participated. Enormous thank you to the [Canary][canary] team for hosting the event and making sure everyone had plenty to eat and drink.

We plan to be back in New York in the next couple of months for the third Snowplow Meetup NYC. [Sign up to our mailing list][mailing-list] to keep up to date with the latest Snowplow news including events around the world!



[canary]: https://canary.is/
[alex]: /blog/authors/alex/
[sauna]: /blog/2016/09/22/introducing-sauna-a-decisioning-and-response-platform/
[animoto]: http://animoto.com/
[christophe]: /blog/authors/christophe/
[mailing-list]: http://eepurl.com/b0yEgz
[sauna-repo]: https://github.com/snowplow/sauna
[ys-presentation-tv]: http://www.slideshare.net/yalisassoon/snowplow-the-evolving-data-pipeline?ref=http://snowplowanalytics.com/blog/2016/08/05/a-roundup-of-recent-snowplow-meetups-in-berlin-amsterdam-tel-aviv-and-london/
[discourse-event-data-modeling]: http://discourse.snowplowanalytics.com/search?q=data%20modeling
