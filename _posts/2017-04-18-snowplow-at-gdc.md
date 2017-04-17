---
layout: post
title-short: Snowplow at GDC
title: "Snowplow at GDC: why gaming companies don’t need to build their own event data pipeline"
tags: [snowplow, analytics, data, gaming, games, gdc, aws, codecombat]
author: Yali
category: Meetups
classification:
   department: product, analyst
   seniority: senior, c-level
   industry: gaming, games
   user: prospective
   aim: persuade, convert, engage
---

We at Snowplow were very excited to be part of the [AWS](https://aws.amazon.com/) delegation at the [Games Developer Conference (GDC)](http://www.gdconf.com/) in San Francisco. In this blog post I talk about our presentation at the GDC, our [CodeCombat](https://codecombat.com/) demo and some thoughts about the GDC experience.

## Snowplow presentation at GDC
Alex  Dean, Snowplow’s cofounder, and I were honoured to address the GDC audience during the Amazon Developer Day and give a presentation on [“Open Source Game Analytics Powered by AWS”](http://schedule.gdconf.com/session/open-source-game-analytics-powered-by-aws-presented-by-amazon).

Here is the presentation video.

<iframe width="854" height="480" src="https://www.youtube.com/embed/6Zmv5LgpjGY" frameborder="0" allowfullscreen></iframe>

And here are the presentation slides in pdf.

<iframe src="//www.slideshare.net/slideshow/embed_code/key/ZjHJsoJ2TQexw" width="854" height="480" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/ggaviani/snowplow-open-source-game-analytics-powered-by-aws" title="Snowplow: open source game analytics powered by AWS" target="_blank">Snowplow: open source game analytics powered by AWS</a> </strong> </div>

<!--more-->

I have summarised below the key messages from our presentation:

* **Digital data is rich, behavioural information that can be collected at scale**. Snowplow was born out of our frustration with the limitations of packaged solutions and the desire to unleash the endless possibilities that rich digital event data provide.
* **Don’t reinvent the wheel: standardise on your event data pipeline**. Game companies are often sophisticated with data and analytics and many of them built their own event data pipeline to realise the possibilities offered by digital event data. However you don’t need to build your own event data pipeline from scratch. Snowplow offers a tried and tested open-source stack that you can deploy to your AWS account. Use your data engineers to build analyses specific to your game, not to re-build the data pipeline!
* **Building high quality event data pipelines is hard**. Snowplow is built to address this challenge and facilitate data validation, schema evolution, enrichment and modeling.
* **Distinguish between analytics on read (e.g. product analytics) and analytics on write (e.g. game health monitoring)**. In each case data is processed and queried in different ways based on the trade-off between query flexibility and latency. Analytics on write allow you for example to compute complex metrics in real-time, such as the number of users in each game level at any point in time. With Snowplow, we meet both analytics on read and on write requirements via a Lambda Architecture.
* **Develop your analytics on read first, then migrate them to on write**
* **Keep your analytics stack independent from your game’s stack**
* **Have a formal framework for managing change**, as your game evolves and you ask new questions of the game.

## Snowplow platform demo
We talked to many people at the GDC, from gaming enthusiasts to heads of game studios, and showed them a demo of the Snowplow platform built for the CodeCombat coding game.

Snowplow offers a data pipeline management service, using our software to collect, validate, enrich and deduplicate event-level data at source and store it in your data warehouse. This is highly granular data about how your users interact with your product and marketing channels.

The demo showed how a well designed dashboard based on Snowplow data can help product managers and game designers to analyse and enhance the effectiveness of their games. You can find out more about this in another blog post we wrote about [How to develop better games with level analytics](http://snowplowanalytics.com/blog/2017/04/12/how-to-develop-better-games-with-level-analytics/). Below you can see a video of that demo.

<iframe width="854" height="480" src="https://www.youtube.com/embed/2d1PlOixj_E" frameborder="0" allowfullscreen></iframe>

## Closing thoughts on our GDC experience
YALI TO WRITE SOME THOUGHTS HERE ABOUT THE GDC (e.g. feedback from people you talked to, which can be interesting to other people)
