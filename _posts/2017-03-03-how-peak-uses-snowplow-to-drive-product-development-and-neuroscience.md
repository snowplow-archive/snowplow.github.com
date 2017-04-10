---
layout: post
title-short: How Peak uses Snowplow
title: "How Peak uses Snowplow to drive product development and neuroscience"
tags: [snowplow, user stories, neuroscience, product development, games, gaming, training]
author: Giuseppe
category: User Stories
classification:
   department: all
   seniority: any
   industry: gaming, training
   user: prospective
   aim: persuade, convert
---

This blog post explains how Peak has been using Snowplow since July 2015 to drive  its business through product development and neuroscience. You can download this story in pdf [here][peak-case-study].

> **“Snowplow is really powerful when you start to hit that growth curve and going upwards: when you see the signs of accelerating growth and you need to start collecting as much event data as possible", Thomas in’t Veld, Lead Data Scientist, Peak**

![Thomas in’t Veld, Lead Data Scientist, Peak][picture-of-thomas]


## About Peak
[Peak](http://www.peak.net/) is a cognitive training platform with a difference. It provides games built by neuroscientists to exercise mental skills such as memory, mental agility, problem solving, language and more - turning your smartphone into a system for brain measurement, brain tracking and brain training.

Peak’s app has over 20 million downloads since its launch in late 2014 and was voted Apple’s “Best App of 2014” and Google Play’s “Best of 2015” and “Best of 2016”.

Peak collaborates with neuroscience researchers and psychologists at Yale, Cambridge and other universities to build advanced training programs with a strong scientific foundation.

<!--more-->

## Data-driven product development
Data analytics plays an integral role in the product development process at Peak. Every new feature launched by Peak is A/B tested against a subset of the Peak user base. Success criteria (and associated metrics) are defined ahead of the feature test. If successful, the feature is rolled out across the rest of the user base. If not, it is rolled back.

The Peak team pushes new releases every 2 weeks. Typically, 10 features are in test at any one time.

Snowplow makes it easy for Peak to track each new test and then assess the impact of the new feature in a very flexible way.

“We make no changes to the app without A/B testing it first. Before we launch a feature, we define a methodology for defining the success and failure of that feature. Everything happens with data. Snowplow’s event based approach makes it very easy to create new events, new schemas, on the fly”, says Thomas.

## Data-driven neuroscience
Data is at the heart of the science behind Peak. Every game is personalized to build players’ skills as efficiently as possible and game scores are analyzed scientifically.

Sophisticated normalization of scores helps compare your progress to your friends’. Moreover, game developers have instant access to game data via Snowplow to make sure the games are of the highest quality.

> **“Our games are inspired by neuroscientific research. With our academic partners, we are unlocking a new chapter in cognitive research by studying game scores and cognitive learning for millions of users. Snowplow is an integral part of that"**

## More about how Peak uses Snowplow data
Peak loads the data into Amazon Redshift where it is modelled. The data team build predictive models on the data using R. The data is then socialized throughout the business via dashboards in Mode Analytics. All data loading, storage and modelling is compliant with EU regulations on data security and data privacy.


If you would like to know more about how Snowplow might help you, [visit our website](http://snowplowanalytics.com/) or [get in touch](http://snowplowanalytics.com/contact/).


[Sign up to our mailing list](http://snowplowanalytics.us11.list-manage.com/subscribe?u=10bb4a6f31d5f19e0d0b54476&id=bb28c7d30d) and stay up-to- date with our new releases and other news.


[picture-of-thomas]: /assets/img/blog/2017/03/thomas-int-veld_peak_photo2.jpg "Thomas in’t Veld, Lead Data Scientist, Peak"
[peak-case-study]: /assets/pdf/peak-case-study.pdf
