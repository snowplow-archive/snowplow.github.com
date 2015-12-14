---
layout: post
title: Is web analytics easy or hard? Distinguishing different types of complexity, and approaches for dealing with them
title-short: Is web analytics easy or hard?
tags: [webanalytics, complexity, data processing, data model]
author: Yali
category: Analytics
---

<p><i>This post is a response to an excellent, but old, blog post by <a href="http://www.gilliganondata.com/index.php/about/">Tim Wilson</a> called <a href="http://www.gilliganondata.com/index.php/2011/08/09/web-analytics-platforms-are-fundamentally-broken/">Web Analytics Platforms are Fundamentally Broken</a>, authored back in August 2011. Tim made the case (that is still true today) that web analytics is hard, and part of that hardness is because web analytics platforms are fundamentally broken. After Tim published his post, a very interesting conversation ensued on <a href="https://plus.google.com/109933174446684687846/posts/fCNTrop8HJz">Google+</a>. Reading through it, I was struck by how many of the points raised are still relevant today, and how many of the participants touched on issues that were central to our thinking when when we conceived of Snowplow.</i></p>

<p><i>One thing that I feel was sorely lacking from the discussion around <i>hardness</i> in web analytics was an effort to distinguish different sources of complexity. In this post, I identify some of those sources, and outline strategies for dealing with them. At the end of the post, I consider the extent to which web analytics platforms can help overcome that complexity, and argue that Omniture Sitecatalyst actually creates additional complexity because of the way it has been architected technically. I end by concluding that <strong>web analytics will continue to be hard because there are no straightforward ways to address every source of complexity, but that tools like Sitecatalyst make it harder than it needs to be</strong>.</i></p>

![rubiks-cube] [rubiks-cube-image]

## What is it that makes web analytics difficult?

The following all make web analytics hard.

1. [Large, complex, high volume, high velocity data](/blog/2013/06/28/is-web-analytics-easy-or-hard-distinguishing-different-types-of-complexity#data)
2. [Lots of contextual knowledge requried to understand the data](/blog/2013/06/28/is-web-analytics-easy-or-hard-distinguishing-different-types-of-complexity#metadata)
3. [The business questions that people want to use the data to answer are hard](/blog/2013/06/28/is-web-analytics-easy-or-hard-distinguishing-different-types-of-complexity#questions)
4. [Poorly architected tools make the previous three complexities *harder* to deal with](/blog/2013/06/28/is-web-analytics-easy-or-hard-distinguishing-different-types-of-complexity#tools)

Much of the discussion around Tim's original post was whether the complexity was the fault of web analytics platforms or not. As should be clear from the above, I believe that a certain amount of complexity is inherent in web analytics. However, Omniture's SiteCatalyst (around which much of the discussion about Tim's blog post focused) actually manages to make things worse.

<!--more-->

<h3><a name="data">1. Large, complex, high volume, high velocity data</a></h3>

Web data is complicated. And not just for the obvious reasons that there's a lot of it, and it is generated very quickly:

* It is not obvious what data you should be capturing, and what you shouldn't. You can push just about any sort of data into your tracking tags - so how do you decide what needs capturing, and what does not?
* The range of activities that a user can engage with on the modern web is enormous. People shop, bank, research, collaborate with one-another, create documents, give presentations, flirt, pay taxes and more online. How do we capture and structure data to convey the breadth and depth of these different activities, in such a way that we can analyze them later?
* Each time a user performs any of the activities mentioned above, they typically interact with different entities online: product listings, newspaper articles, bank statements, research reports, potential dates, colleagues, companies, government organiastions, charities. How do we capture and structure data to represent this vast array of entities, in such a way that we can analyze them later?

The key to handling this kind of complexity is to:

1. Use a straightforward data model that is simple to relate to the events they represent, and structure data in a way that mirrors our natural way of thinking about those events. In the case of web event data, that means your data should be an event stream, where each event is represented by a specific line, or several lines, of data, that describe the event and the entities involved in that event
2. Let domain experts and data analysts decide what data points need to be captured with each event, and for each entity. It is impossible to come up with an abstract set of rules for what data needs to be captured when an event occurs, but it is often straight forward (and intuitive) for a domain expert and data analyst to identify what should be captured with each event.
3. Let domain experts and data analysts decide how to structure those data points.

<h3><a name="metadata">2. Lots of contextual knowledge required to understand the data</a></h3>

Raw web event data is hard to make sense of: we need contextual knowledge to do so. To give two examples:

#### 2a. How do I infer attributes about the objects and actions I am interested in from the data, and crucially, the scope of those attributes?

Let's take the example of a user on a shopping site who buys a pair of running shoes. There are several things we *might* infer from the data:

* The user runs
* The user has size 10 feet
* The user is a man
* The user lives in Dallas, Texas
* The users name

Whether we should make the above inferences from the data, and whether we use those inferences in other analyses down the line, are decisions that can only been taken based on our broader understanding of the business and the ways users engage with it. That kind of contextual knowledge isn't stored in the data itself. These types of decisions look different depending on the type of entity we are dealing with (customer vs product vs article vs company etc.) and the type of decisions and reasoning we need to perform about that entity.

What is interesting about the above is that these decisions are reasonably straightforward for a data analyst with the data in front of her to make: we all know, for example, that changes in a person's gender are unusual, and so if the user is a man today, he is likely to still be a man in 6 months time. But they are **not** straightforward for a technology platform to make.

#### 2b. Does the event-stream look like this because (a) the user wanted to perform this action, (b) the website pushed the user into performing this series of actions or (c) the way the web analytics tool captures the data?

Interpreting web event data is hard because it is a function of all the above. To analyse web data, you need to appreciate all three factors. Unfortunately, you cannot control for all of them. A/B testing means you can control for site design, to a limited extent, and comparing user actions between different sets of users enables you to control (a little bit) for user intention. Exercising that control, though, is very difficult. For the most part, web analysts are like astrophysicists, able to capture data, but limited in the experiments they can run to unpick the impact of different factors on that data.

Once again, an intelligent analyst is best placed to unpick the impact of the three factors identified above - it is a pretty impossible task for a web analytics platform to perform, because the platform lacks that contextual knowledge.

The key, then, to handling complexity related to the amount of domain knowledge that is required to generate meaning out of web data, is to give the analyst the freedom to address the above questions using all the domain expertise at her disposal, and trust that she uses that domain knowledge to:

* Properly identify people
* Correctly scope variables associated with different entities
* Unpick the impact of different factors on the data

These challenges are much better met by a person with that contextual knowledge, than a web analytics program that lacks it. The web analytics program really needs to *get out of the way* of the analyst, so she can address them directly.

<h3><a name="questions">3. The business questions that people want to use the data to answer are hard to answer</a></h3>

Web event data can be used to help answer a whole host of business questions. Some important questions include:

1. What combinations of channels should I spend my marketing budget? How should I stagger spend to maximize return?
2. What products should I source for my catalog? How does my catalog need to evolve in the next few years / months?
3. How sensitive are my customers to price? What price should I sell this product for?
4. Who are my most valuable customers? How can I spot them early?
5. What are the events in a customer's lifetime that drive loyalty? What are the things we can do to encourage them?
6. What are the moments in a customer's lifetime where something going wrong destroys customer loyalty? Which are hurting my business (and my customers) the most?
7. How do my customers segment by behavior? By attitude? Which segments are important to understand, to deliver excellent customer service?
8. Where should we prioritize improvements to our website? What is the expected return on that investment? What is the actual return?

These questions are hard to answer because:

* There is no unambiguous, analytic approach to answering them. There are multiple approaches, each of which are defensible. Identifying and applying the most suitable approach is an art
* Answering the questions correctly requires, at a bare minimum, knowledge of the data and domain knowledge. In many cases it is also likely to require other data sources (including both quant and qualitative sources), that need to be brought together in a meaningful way
* The answers in many cases are likely to be hypotheses that need further testing

Once again, the key thing to handling this complexity is to give the analyst the tools and the space to develop and experiment with different approaches. There is no general purpose tool that will be able to solve for all of the above, although there may be the possibility of specific tools to answer specific questions.

<h3><a name="tools">4. Poorly architected tools make the above <i>harder</i> to deal with, rather than <i>easier</i></a></h3>

The above sources of complexity make it clear why web analytics is hard. They present challenges for both web analysts, and web analytics tools.

One approach to dealing with that complexity is to "disguise it". The web analytics tools hides the underlying complexity behind a UI that presents specific cuts of the data. Many of the contributors to the [Google+ thread] [g-plus-convo] argued that this was how GA manages to be simpler than SiteCatalyst. Certainly, you can hide *all* the complexity behind a simple dashboard. But then, you can't use a dashboard to answer any of the above questions. In this case, what you gain in simplicity, you lose in power and transparency.

Another approach, which is the one we have taken at Snowplow, is to expose the underlying data to the user in a format (data model) that is as easy as possible to understand, and in a data store that is easy to connect multiple different analytics tools. This doesn't disguise any of the complexity: instead, it exposes it all to the analyst. For many analysts, that is a terrifying prospect. But for some, it is truly liberating: the analyst can now use the analytic and technical approach she prefers to develop answers and insights, unconstrained by any assumed logic in the web analytics tool.

A third approach, taken by Omniture with Sitecatalyst, manages to exacerbate the complexity because of two poor decisions made around Sitecatalyst's technical architecture:

#### 4a. Sitecatalysts data model is not event or entity-centric

To implement Sitecat, you have to translate the events that occur on your website, and the entities a user navigating on your website engages with, into the arcane world of Traffic Variables, Success Events, Conversion Variables and Saint Classifications. Your data model is, in many cases, flatted to fit a set of pre-defined fields in Omniture. Contrast that with the much simpler, event-centric approach taken by just about everyone that's developed a platform in the last five years, including Mixpanel, Kissmetrics, KeenIO, Google Analytics and of course Snowplow.

#### 4b. In Sitecatalyst, data capture and data reporting are incredibly tightly coupled

*How* you capture a data point in Sitecatalyst determines which reports that data point is used in, and how that data point is used subsequently. That is why, at a simplistic level, you absolutely need to understand Traffic Variables, Success Events, Conversion Variables and Saint Classifications, and how Sitecatalyst treats each of them, in order to do a Sitecatalyst implementation properly. That makes implementations significantly more complicated than the need to be, and they make the impact of "bad" implementations much more catastrophic than they need to be.

In contrast, with Snowplow, **no** restrictions are placed on how you use any data based on how you choose to capture it. That is because data analysis is completely decoupled from data capture: we only enable you to capture and warehouse your data. You then do whatever you want with it, often in a different tool.

There is another fundamental disadvantages that arises from the tight coupling data capture and data reporting in Sitecatalyst: it is not possible to use Sitecatalyst to develop definitions, definitions and metrics which evolve over time, as you better understand your data. To give perhaps the most common example: if you want to categorise your users based on their behaviour on their site, you cannot do that in Sitecatalyst, apply those definitions to your data, and then evolve those definitions: either you have them on day one, and store them via the Javascript, or you don't. You can't perform an analysis on user behaviour, and then retrospectively categorize users based on the output of that analysis. (Companies generally export Sitecatalyst data out and ingest it in a datawarehouse, and then do the segmentation there.)

Given the two massive disadvantages to the tight data coupling, it seems only fair to ask if there are any benefits associated with it. There is one that is worth exploring: when you collect your data properly in Sitecatalyst, Sitecat then ensures that that data point accommodated in every report it features. By taking more effort earlier on (at implementation time) to get your data to fit into Sitecat's rigid data model, you can then breathe easy down the line that anyone using the data via the UI is restricted so that they only use the data properly: they don't, for example, mix dimensions and metrics with different scope.

We think this "advantage" is not really worth anything. We think it is much easier to work out what dimensions and metrics you should, and should not, plot against one another when you have the data in front of you, but that it is much harder when the data is just an idea at implementation time. Worse, if you cut your data in a way that doesn't make sense down the line, it is an easy mistake to spot and fix. In contrast, if you stuff up a Sitecat implementation, it can be hard to fix, and costly, and you might have lost months of data in the meantime.

To Omniture's credit, the two technical decisions made above were committed in the late 1990s, when the web looked very different, and so they were not such bad decisions. Since then, Omniture has had to accommodate growing complexity in the web by making incremental approaches to their platform, rather than reinventing the core platform with a fresh perspective, the way we've been able to with Snowplow. But that provides little comfort for the company that has to reimplement Sitecatalyst because they got the implementation wrong the first time.

## So web analytics is very hard!

Yes! Web analytics is hard. But tools like Sitecatalyst make it harder than it needs to be, especially at implementation time. The idea that implementing Sitecatalyst is more difficult than Google Analytics or Snowplow because Sitecatalyst is more powerful than GA is only partly true at best. It is more difficult because reporting and data capture are too tightly coupled, and the data model is totally unnatural to the uninitiated.



[tim-wilson]: http://www.gilliganondata.com/index.php/about/
[tim-wilson-post]: http://www.gilliganondata.com/index.php/2011/08/09/web-analytics-platforms-are-fundamentally-broken/
[g-plus-convo]: https://plus.google.com/109933174446684687846/posts/fCNTrop8HJz
[rubiks-cube-image]: /assets/img/blog/2013/06/rubiks-cube.png
