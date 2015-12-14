---
layout: post
title: Getting started using R for data analysis
tags: [snowplow, R, data analysis, science]
author: Yali
category: Analytics
---

[R] [r] is one of the most popular data analytics tools out there, with a rich and vibrant community of users and contributors. In spite of its popularity in general (and particularly with amongst academics and statisticians), R is not a common tool to find in business or web analysts arsenal, where Excel and Google Analytics tend to reign supreme.

![img1] [graph1]

That is a real shame. R is a fantastic tool for exploring data, reworking it, visualizing it, developing models, and then comparing those models against your data sets. My work crunching data has become immeasurably easier and more pleasurable since I learnt R: I spend less time cleaning and organising data, and performing other boring things like formatting visualizations and checking for errors. I spend much more time actually mining data, deriving insights, testing and building on those insights.

Given how great it is, why is R used so little by business and web analysts? I think there are two reasons:

1. People are put off by the command-line. The learning curve for command-line tools in general is steep initially. In addition, there are some quirks to the R language and syntax that make it puzzling for newbies who are familiar with other command-line tools for data analysis e.g. Python.
2. Most business and web analysts spend more time describing data that actually deriving insights from it. For descriptive work, tools like Excel and BI / OLAP tools like Tableau are OK.

In order to encourage business and web analysts get started with R, we've put together [a tutorial] [getting-started-with-r] in the [Analytics Cookbook] [cookbook] geared specifically towards newbies who want to start playing with R. The purpose is to:

1. Get started quickly, by working with real web analytics data from Snowplow
2. Get started with visualizations, to make the data come alive
3. Cover the basics of concepts like factors and data frames, which are core to the way R works
4. Give enough of an overview with the example that someone who works through the tutorial can then go off and productively use the multitude of other resources out there to build their knowledge of R.

The recipe - [Getting Started with R] [getting-started-with-r], is available [here] [getting-started-with-r].

[getting-started-with-r]: /analytics/tools-and-techniques/get-started-analysing-snowplow-data-with-r.html
[graph1]: /assets/img/analytics/tools/r/boxplot.png
[cookbook]: /analytics/index.html
[r]: http://cran.r-project.org/
