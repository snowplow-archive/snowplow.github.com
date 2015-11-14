---
layout: post
title: The inaugural Snowplow meetup in Berlin event to take place on August 11
tags: [snowplow, meetup, berlin, data modeling, measuring tv advertising, attribution]
author: Yali
category: Meetups
image: http://snowplowanalytics.com/assets/img/blog/2015/07/berlin.jpg
---

I am really delighted to announce the first Snowplow meetup in Berlin will be taking place on August 11th.

![berlin][pic1]

We've now had Snowplow meetups in [London] [london], [Sydney] [sydney] and [Amsterdam] [amsterdam]. These events have been great because Snowplow users tend to be very sophisticated data consumers - so the meetups provide a good opportunity to share ideas and approaches to answering questions with event-level data, as well as a good forum to debate different analytic and technical approaches. All the events to date have been attended by a real mix of people with from different backgrounds (business intelligence, data science, marketing, product, engineering) and industries (publishing, retail, financial services, technology), which has kept the discussions unpredictable and lively :-).

We are very lucky to have two excellent speakers for this first event in Berlin. The first, Christian Schäfer, is Business Intelligence Manager at [Sparwelt.de](http://www.sparwelt.de/), where he's repsonsible for bridging the between business units and technical BI. Christian will be talking about modeling event-level data. In his own words:


<!--more-->
<div>
<blockquote><p>Snowplow reliably pushes heaps of tracking data into the atomic.events table. The flat table format, however, is not practicable for answering complex questions. Suppose your marketing manager asks you to compare the average session duration of returning users on mobile devices coming via newsletter campaigns and organic search. You'll spend a prohibitively long time doing SQL coding to answer this specific question.</p>
<p>The more elaborate approach is to turn the flat table into a dimensional design which allows to flexibly respond to all kinds of requests with minimal SQL programming or even using BI reporting tools. We show how dimensions and measures are derived from the raw tracking data to form a suitable star schema. In general, we can distinguish three types of dimensions: those directly extracted by Snowplow in the enrichment process (pages, referrers, geo-information, device types, operating systems), those depending on static or external sources (e.g. transactions, contents, dates, apps, seo rankings) and those we construct by processing the flat table tracking data (e.g. sessions, landing pages, users, marketing channels, search engine advertisement, newsletter campaigns, a/b tests).</p>
<p>We concentrate on the latter case and particularly discuss how to efficiently attribute the marketing channels to the tracking events. We point out some pitfalls and how to avoid them when using an Amazon Redshift database. In a second step, we show how to derive a fact table holding advanced web tracking measures like unique page views, time-on-site, bounce rates, click-through rates, conversion rates or new and returning users.</p>
</blockquote>
</div>

Our second speaker is Sixtine Vervial, a Data Analyst at [Goeuro.com](http://www.goeuro.com/). Sixtine will be talking using Snowplow data to the impact and optimize TV ad spend. In her own words:

<div>
<blockquote>
<p><i>Which session belongs to the channel TV?</i></p>
<p>Classic marketing, such as SEO or SEM, offers a trackable method of channel attribution in order to see how an individual engages in the customer journey. With TV, however, the tracking is limited; the distance between a demographic, and often the use of several screens by an audience member, make it difficult to attribute when an audience member is clicking on your website. This can mean it can be complicated to gauge the success of TV advertising campaigns in terms of return on investment.</p>
<p><i>How do those people behave comparing to others?</i></p>
<p>Once we figure out how to flag people who are journeying to a site from tv, the goal is to give them a cohort label and compare their behavior to other cohorts such as visitors coming from different marketing channels.</p>
<p>This project, being a particular case of a cohort attribution problem, will be based on the customer analytic tools from Snowplow, adapted to GoEuro's data sources and KPIs.</p>
<p><i>How do we optimize and automatize the TV plan?</i></p>
<p>The other concern is also obviously to optimize the budget flushed into TV marketing. For that purpose, a performance analysis per TV channel, time, genre, … is necessary. This feedback will need to be in  real-time in order to update planning according to our targeted audience</p>
</blockquote>
</div>

If you're a Snowplow user, prospective user, or just interested, then [sign up here][meetup-signup]. I look forward to meeting you all, and discuss the above and more, in August!

Finally, big thanks to both Sixtine and Christian for speaking, and Chris, Diego and Stephen at [LeROI Marketing](http://www.leroi-marketing.com/) for making this meetup happen.

[pic1]: /assets/img/blog/2015/07/berlin.jpg
[meetup-signup]: http://www.meetup.com/Snowplow-Analytics-Berlin/t/ti1_1/?gj=ej4
[london]: /blog/2015/02/11/first-snowplow-meetup-in-london/
[sydney]: /blog/2014/12/08/snowplow-meetup-group-london-announced/
[amsterdam]: /blog/2015/05/19/snowplow-meetup-amsterdam-wrap-up/
