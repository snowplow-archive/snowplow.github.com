---
layout: post
title: An introduction to event data modeling
title-short: An introduction to event data modeling
tags: [data modeling, event data, sql]
author: Yali
category: Analytics
---

Event analytics platforms like Snowplow enable you to track 'events'. Each time an event occurs, that event is described in data and that data recorded and processed by Snowplow. 

When we analyze Snowplow data, then, we are fundamentally analyzing data that describes many events.

Sometimes when we analyze event data, we need to perform simple aggregations over event-level data. For example, if we track an event 'play_video' and for each of those event track the category of video played, we may want to compare the number of videos played by category by day, to see if particular categories are becoming more popular, perhaps at the expense of others. This data set might look like the following:

<table class="table-responsive table">
	<tr><th>event_name</th><th>derived_tstamp</th><th>video_category</th><tr>user_id</tr></tr>
	<tr><td>play_video</td><td>2016-03-16 23:10:04</td><td>Comedy</td><td>8221b016-9a75-4543-a728-2588c8c6b3f9</td></tr>
	<tr><td>play_video</td><td>2016-03-16 23:10:09</td><td>Romance</td><td>3cc447c8-0b61-49ac-a6cf-0ca8aeb7593a</td></tr>
	<tr><td>...</td><td>...</td><td>...</td><td>...</td></tr>
</table>

It would be simple to perform the aggregation on the event-level data delivered by Snowplow using a query like the following:

{% highlight sql %}
select
date_trunc('day, derived_tstamp'),
video_category,
count(*)
from events
where event_name = 'video_play'
group by 1,2
order by 1,2
{% endhighlight %}

Most of the time, however, we're not simply interested in peforming simple aggregations on event-level data like counts and sums. Often, we're interested in answering more complicated questions - questions like:

* How do conversion rates vary by acquisition channel?
* What point in the purchase funnel to most users churn? Does that vary by user type?

The above two questions require more than simple aggregations. If we want to compare conversion rates by acquisition channel, we have to take an event early on in a user journey (the user engaged with a marketing channel) and tie that to a potential event later on in a user's journey (the user converted) and then aggregate over users and channels rather than events. Conceptually, then, to solve this question we need to:

1. Grouping events by users
2. For each user, identifying an acquisition channel
3. For each user, identifying whether or not they converted
4. Aggregating by user by acquisiiton channel, and for each aggregate calculate a conversion rate
5. Compare the conversion rate by channel

The second example is similar: again we need to aggregate events by users. For each user we identify all the events that describe how they engaged with a particular funnel. For each user we then calculate how far through the funnel they get / where in the funnel they 'drop off'. We then aggregate by users, grouping by user type and stage in the funnel that each user drops off, to compare drop off rates by stage by user type.

As should be clear in both the above examples, when we're dealing with event data, we're generally interested in understanding the journeys that those events represent i.e. grouping events into higher units of analysis like funnels, workflows or 'journeys': tying events early on in the journey with those later on, summarizing the data by journey and then aggregating over those journeys.

Event data modeling is the process of taking event-level data and aggregating over it in intelligent ways so that we produce a set of tables that represent more useful units of analysis in a format that is easy to query. There are a number of different common 'units of aggregation':

<h2>1. Modeling macro events from micro events <small>(e.g. page views)</small></h2>

'Macro events' are made up of micro events. For example, if we are a video media company, we may want to understand how individual users interact with individual items of video content. An example event stream for a particular user / video content item might look like this:

![event-stream-diagram-for-video-example][event-stream-diagram-video-example]

In the example above we have modeled an event stream that describes all the micro-interactions that a user has with a particular video into a summary table that records one line of data for each video each user has watched. Note how the summary table includes:

* Information about the viewer (notably the user ID). This means we can compare consumption patterns between different user types
* Information about the video
* Information summarizing the user-video interaction i.e. has the user completed the video, has the user shared the video? 

This summary table is much easier to consume that the event-strema on the left: in the event data modeling process we've taken the detailed event stream of data and aggregated it up into a format that makes it easy to compare video consumption trends by user and by video.

<h2>2. Modeling workflows / units of work <small>e.g. sign up funnels, purchase funnels</small></h2>

Often we are interested in understanding the sequence of events that represent the way a user interacts with a particular workflow or works towards a defined goal. An example is illustrated below of a user interacting with a travel site:

![event-stream-diagram-for-travel-site-example][event-stream-diagram-for-travel-site-example]

Our summary table aggregates the event-level data down to an individual workflow level, where each workflow represents the journey that starts with a user performing a search, and ends when that user:

1. Makes a purchase of one of the search results
2. Performs another search
3. Drops out altogether

Our aggregated data table contains a lot of interesting data, including:

1. Data about the initial search that was performed. This is data that will be fetched from the early events in the workflow
2. Data about the actual results that the user interacts with: which results were selected, where were they ranked in the results
3. Which result (if any) the user selected and went on to buy. This data will be taken from later events in the workflow

## 3. Modeling sessions from event data

It is *very* common in digital analytics to group sequences of events up into 'sessions' and then aggregate data by session. Typical aggregations will include data on:

1. How the user was acquired 
2. Where the session started (e.g. the 'landing page')
3. How long the session lasted
4. What was the session worth. (Did a transaction occur? How much ad revenue was made? Were any conversion events recorded?)
5. What was the user trying to accomplish in the session? 

As we will go on to discuss, sessions are a very ambiguous concept that conflate a number of different important constructs in digital analytics - for that reason we do not believe recommend using sessions as a key unit of analysis. However, we have to mention it here, because currently sessions are still the primary unit of analysis in digital analytics.

## 4. Modeling user-level data from event data

A lot of useful user-level data can be gleaned by aggregating over a user's entire event stream. For example, based on that entire history, we might:

* Bucket users into different cohorts based on when they were acquired or how they were originally acquired
* Categorise users into different behavioural segments
* Calculate lifetime value for individual users

## 5. Tying particular classes of events in a user journey together to understand the impact of earlier events on later events

In all the above examples we were combining series of events that occur for individual users and grouping them in ways that summarize continuous streams of activities, where those streams were:

1. Macro events
2. Workflows
3. Sessions
4. Complete user journeys

Often however, we are particularly interested in specific classes of events and want to understand the impact that one class of events has on the likelihood of another class of event later on in a user's journey, regardless of what other events have happened in between. 

A common example of this type of analysis is attribution modeling. There is a large set of attribution models that are fed with data that describes:

1. What marketing channels a user has interacted with (first class of events, early on in a user's journey), with
2. Whether or not a user subsequently converted (second class of events, that occur later on in a user's journey.)

This type of data modeling is illustrated below:

![Tying specific classes of events in a user journey together][]

## 6. Modeling product-level data or media-level data from event data

It is often interesting to aggregate event-level data by media item (if we're a media company) or product (if we're a retailer). The event-level data can often tell us interesting things about different products, for example:

* Are the products seasonal? (Do sales vary by time of year or are they consistent over the year?) Are they ever green? Or does interest in them spike and then decline?
* Are products good at attracting new users? (Do most users who interact with the product come to our website for the first time?) Or better for retaining existing users?
* How much does price and promotion drive levels of interactions with individual products?


[event-stream-diagram-video-example]: /assets/img/blog/2016/03/event-stream-diagram-video-example.png
[event-stream-diagram-for-travel-site-example]: /assets/img/blog/2016/03/event-stream-diagram-for-travel-site-example.png
