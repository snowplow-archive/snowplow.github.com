---
layout: post
title: "How Viewbix uses Snowplow to enable their customers to make data-driven decisions"
title-short: "Case study: Snowplow at Viewbix"
tags: [python, trackers]
author: Yali
category: "User Stories"
---

*This is a guest post by Dani Waxman, Product Manager at Viewbix and long time Snowplow user. In this post, Dani describes the journey that the Viewbix team went through in order to enable their users to make data-driven decisions, how they came to use Snowplow and the role that Snowplow plays today at Viewbix.*

<a href="http://corp.viewbix.com/"><img src="/assets/img/blog/2016/10/viewbix.png"></a>

At Viewbix there are two things we are passionate about, our coffee and using analytics to help us and our customers drive core business decisions. We decide which Nespresso capsules to order based on detailed usage statistics backed up by years of data. If I am going out to visit customers for a few days in New York, that month’s order will include fewer Bukeela capsules since I drink 2.3 X of that flavor than other team members.  It’s not surprising that when it came time to for deploying an analytics stack we spent a lot of time and effort making sure we chose a product that would give us the flexibly and power we needed.

<!--more-->

From day one we decided to collect more data from our interactive video platform than we would likely ever need. This was partially based on the fact that we were pioneers in the market of interactive video and while we had a good idea of what our users would expect us to report on, we were not sure. Better collect too much then too little.  Beyond the standard video metrics of impressions, plays, and quartiles viewed we needed to report on interactions that take place in the lifecycle of the video itself.  How many people are clicking on Call to Action buttons, logos, pre and pot rolls. How many users are submitting CRM data via the video and how many are using any of our 30 or so custom apps. These are all questions we knew we needed to answer.

Beyond answering the question of “what” users were doing, we were super interested in the “when” users were taking action- because this helps answer the Holy Grail question of “why”. When we are able to go back to a customer and show him that 95% of actions taken during a video are happening between 0:30 and 0:35 seconds in, we have provided amazing value. The customer can in turn look at his video and learn what messaging is working, what isn’t, and make needed changes. We use analytics to show that small changes can drive significant increase in KPI.

Because we made this strategic decision to capture all this data, the challenge for us was what our data pipeline would look like so that we can ingest, enrich, and process the data effectively and in a way that was easy to report back to our customer base.  

To get up and running quickly we decided to go with the “roll your own” approach. We built a small tracker that emitted events and a fairly straight forward data model that sat on a single hosted server. All was well in testing but soon after we went out to production we signed on a major customer and our server began to buckle. We were sending in so many events that we flooded our network pipe and were choking at the Firewall.  In addition, we had not fully accounted for the volume of data we would be storing and our servers quickly were filling up on disk space. The scene was reminiscent of early successful web sites that crashed after being written up on Techcrunch (…which we were).

Looking at a typical data pipeline model we were looking something like this:

![first-pipeline-iteration][pipeline1]

We had solved the most basic requirement of sending out events but we were missing key components and far from a well-oiled machine.

A few all night sessions with our engineering team and we came up with a solution. Instead of sending the events directly to our network we would leverage our CDN and send the events to distributed endpoints on their global network. We then collected the log files every hour and shipped them to a cloud server where they were processed into our reporting engine. We effectively now had unlimited bandwidth for collecting data and by migrating to proper cloud storage we were no longer worried about the volume of data either. Bring it on!

Although were back on our feet, our data was not yet where we wanted it to be.  We were still not enriching data to the level we needed, our data modeling was immature so that any additional data points we wanted to add would require a long re-analysis of existing data, and we had not settled on a presentation layer to actually share the data with our customer base in a meaningful way.

We had come a long way but our pipeline was not complete:

![second-pipeline-iteration][pipeline2]

We went to the whiteboard and drew up a proper requirements document for our solution.

* Given that the industry has still not put Flash video to bed we require both Javascript (for HTML5 video) and AS3 Flash trackers.
* We require a flexible data-modeling procedure. Our business requirements, as well as our customers, are dynamic and we need to make changes quickly and efficiently without disrupting our pipeline.
* We need to be able to report on raw data – we don’t want to sacrifice data granularity for speed.
*	The end-to-end reporting needs to be fast and adjustable (real-time if possible and when needed).
* Since the data we are sending in is largely driven by our customers we can’t accurately predict the number of events we will be sending in a month. Any solution we look at can’t be driven by number of events. (We looked at a few solutions that when we calculated a per event pricing model would have cost upwards of $23,000/month.)
* We needed to own the data. We couldn’t be sending events into a 3rd party SaaS system that could suddenly disappear one day.
* Our customers need beautiful visualizations and charting capabilities.

After putting together this punch-list we began a process of several months of research. We looked into about a dozen solutions including piecing together another home grown solution.  Ultimately we decided to move ahead with Snowplow.

Snowplow answered one of our immediate needs that other platforms had trouble with- an AS3 tracker.  While Snowplow didn’t have one “out of the box” being open sourced we were able to easily write [our own](https://github.com/snowplow/snowplow-actionscript3-tracker) and integrate it into our solution.

Even though we opted for the Managed Service - Snowplow is hosted on our own AWS account and we have complete visibility and access to the data. If Snowplow were to shut down tomorrow, our pipeline and our data would be unaffected and continue to run on a day to day basis. Not so with many other solutions we looked at. Our pricing is also very predictable because we are able to lock in pricing with AWS reserved instances.  Our month-to-month costs fluctuate slightly but nowhere near the potential run up we could have seen with pure per-event SaaS services.

The Snowplow data-modeling is by far the most flexible we have seen. By defining a series of “custom contexts” that are sent with each event we are able to record all the relevant data for a specific event type in an organized way and keep our overall data clean by only sending in when relevant. You can think of this as custom enrichment for your data.  For example, we record every time a user clicks on a Call to Action button. There are several pieces of information for us to know about this event. What was the CTA text? What was the CTA button color? What was the time in video what this happened? Each of these questions help us answer the why did the user click question.

We break this information into 2 parts:

1. a player context which sends relevant information about static configurations in a player (like the text and color)
2. a video context which has dynamic information like video id, and time in video the action (CTA click) occurred.

By using this breakdown, we only need to send in a player context once a session while a video context may be attached with every action.  By only sending relevant contexts we cut down on the amount of data we need to send without losing the insights. On the database side each context and event is stored in a corresponding table schema making for an easy to read and understand the relationship of the data.

Although we answered most of our needs based on the requirements we put together, and implemented Snowplow fairly quickly, the project was not without its expected hiccups.

We were coming from a world of traditional SQL databases. Snowplow lives on Redshift a columnar database.  While not as radical a shift as say Mongo or other NoSQL databases we found ourselves needing to re-think how we query data and the `select *` we had been accustomed to quickly became a dirty word. We also found ourselves turning to Snowplow for help on building the proper indexes and adding the distribution and sort keys.

One of the early problems we ran into actually uncovered an unexpected benefit of Snowplow. The custom contexts in Snowplow are defined by a schema called Iglu. These are easy to read JSON schema that explain the data types expected in the pipeline.  The schema is used to validate the data coming in as well as set the location where the data should be stored once shredded. We were not strict about checking our data early on and we had several events and contexts sending data in with incorrect formats.  These events ended up in our “bad-buckets” folder. When we caught onto this missing data we were able to create or fix the Iglu schemas (these are versioned to support backward compatibility) and request to re-process our bad buckets so we didn’t lose any data. While it was extremely frustrating at first, we would come to love the bad-buckets concept. Snowplow was the only vendor we found that lets you collect and re-process data that for whatever reason may have failed the shredding process and was unable to insert into Redshift. No lost data.

We gave in and resorted to data summarization. Reporting on the raw data was not providing the response times we needed.  We probably could have thrown money at the problem and built larger and more powerful clusters on AWS but with the help of Snowplow data analysts we built a summarization process that meets our business needs and is flexible enough that we can add new data points at any time and have them quickly appear in our reports without having to resort to expensive and time consuming rebuilds from raw data.

Snowplow is not a visualization platform and does not offer a graphics engine for building reports. Luckily, after many interviews we found our customers were much more interested in a flexible report writer then a visualization engine. Time after time we heard “let me export the data to Excel” as the business need. Instead of building out custom dashboards and graphs we built an API that allowed for flexible custom report building directly from Redshift.

## Conclusion

While we didn’t check off every item on our punch list we are happy with how quickly and effectively (and on budget!) we got the solution up and running. We turn to Snowplow not only for expertise on the core product but also leverage them as an outsourced member of our data-analytics team. Even after the platform went live we held weekly meetings to review and improve the process.
Snowplow is a big success for us.  Our customers are able to draw deep and meaningful conclusions from the data we provide which in turn help them improve their video marketing ROI. Internally we use the data to learn “big picture” about how users engage with video, what works and what doesn’t and this data serves as the foundation to drive our product roadmap forward.   

[viewbix-img]: /assets/img/blog/2016/10/viewbix.png
[pipeline1]: /assets/img/blog/2016/10/viewbix-pipeline-1.png
[pipeline2]: /assets/img/blog/2016/10/viewbix-pipeline-2.png
