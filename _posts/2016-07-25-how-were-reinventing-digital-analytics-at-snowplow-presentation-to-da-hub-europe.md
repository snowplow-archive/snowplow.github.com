---
layout: post
title: "How we're reinventing digital analytics at Snowplow: presentation to the DA Hub Europe"
title-short: "How we're reinventing digital analytics at Snowplow"
tags: [digital analytics, web analytics, event analytics]
author: Yali
category: Meetups
---

Last month I was very fortunate to speak at the [DA Hub Europe](https://www.digitalanalyticshub.com/dahub16-europe/eu-homepage), as part of their •Emerging Technology Showcase*.

For those who haven't been lucky enough to attend this event, it is a brilliant opportunity to discuss, debate with and learn from some of the smartest people in Digital Analytics in Europe.

<iframe src="//www.slideshare.net/slideshow/embed_code/key/D5oR9V5vndgiiv" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/yalisassoon/snowplow-at-da-hub-emerging-technology-showcase" title="Snowplow at DA Hub emerging technology showcase" target="_blank">Snowplow at DA Hub emerging technology showcase</a> </strong> from <strong><a href="//www.slideshare.net/yalisassoon" target="_blank">yalisassoon</a></strong> </div>


I used the talk as an opportunity to share some of our broader thinking at Snowplow with what has gone wrong with digital analytics, and how we're trying to fix it, by taking a fundamentally different approach, analytically and technically, to analysing digital event data.

It was great discussing our approach with the attendees at the event. Now I want to share this with the wider Snowplow and Digital Analytics community, and build on that conversation.

## Digital event data is rich, behavioral data

We're very lucky to work with digital event data because this is such interesting data. It tells us, in incredible, granular detail, how real people behave. As more and more of our lives become mediated through digital channels, the data set that we can mine grows more interesting.

If you think about just some of the activities we engage with, that are mediated through digital channels:

* Flirting (e.g. on Tinder)
* Bluffing (on a poker site)
* Managing your smart home
* Consuming media
* Managing your finances
* Keeping fit
* Playing games

All that behaviour can be captured and mined. 

<!--more-->

## Packaged solutions (GA and Adobe) do a poor job of enabling us to do everything we want with digital event data

That's because these solutions are:

1. One size fits all
2. Silo'd
3. Handle limited data sources (web and mobile at best)
4. Slow (not real-time)

## At Snowplow, we take a fresh approach:

1. Each of our users has their own event data pipeline
2. Each of our users can define his / her own event types. If you're a massive multi-player game, those event types are going to be totally different than if you're an online grocery retailer
3. Track events across *all* the different channels that matter to you. Not just web and mobile, but email, push notification, call center, support forums, your smart home, your smart car...
4. Answer *any* question. Because your event-level data is available in your *own* datawarehouse, you can join that data with any other data set, and run any query on it. Free yourself from the shackles of your analytics UI.
5. Evolve your analytics with your business. As your business evolves, what you track will change, and the questions you will ask of your data will change. Snowplow is built from the ground up to evolve with your business, so you can change both the way you track and process data, and never have to throw away old data.
6. Act on your data in real-time. Use the same data that drives insight to drive your data-driven applications and real-time dashboards.

## That's not all

Snowplow is 

Open source

* Free
* You own your own data
* You own the intelligence on your data
* You are not tied into a third party vendor

Scalable

* We have lots of users tracking more than 100M events every day

## Interested?

Find out [more][contact].


[contact]: /contact/