---
layout: post
title-short: How JustWatch uses Snowplow - case study
title: "How JustWatch uses Snowplow data to build a differentiated service for advertising movies and drive spectacular growth"
tags: [snowplow, analytics, media, advertising, adtech, justwatch, data, movie, film, studio, video]
author: Giuseppe
category: User Stories
classification:
   department: marketer, analyst
   seniority: senior
   industry: media, publishing, adtech
   user: prospective
   aim: persuade, convert, engage
---

This blog post is about how JustWatch has been using Snowplow to build a highly effective and differentiated advertising technology business and drive spectacular business growth. You can download this story in pdf [here][justwatch-case-study].

> **“Snowplow provides rich, granular data that enabled us to build a sophisticated audience intelligence and double the efficiency of trailer advertising campaigns for our clients compared to the industry average”
Dominik Raute, Co-Founder & CTO, JustWatch**

![Dominik Raute, Co-Founder & CTO, JustWatch][picture-of-dominik]

## JustWatch: a data-driven company
[JustWatch](https://www.justwatch.com/) is a new kind of AdTech company that enables movie studios and Video on Demand providers to advertise their movies to people who want to watch it: creating advertising that is effective for the advertiser and enjoyable for the consumer. They use data to build highly targeted, actionable segments that advertisers can reach, predominantly on YouTube and Facebook. In addition, they provide the world’s largest and most accurate streaming search engine that enables users to find out where to watch their favorite movies and TV shows online and in cinemas.

## How JustWatch used Snowplow to take control of their data

### Business challenge
Data is at the heart of both JustWatch’s propositions for movie watchers and movie studios. When users engage with JustWatch’s streaming search engine, JustWatch needs to serve them content that they are interested in: and that depends on JustWatch having a good understanding of what it is those users are interested in. Similarly, when targeting trailers for new movies on behalf of studios, JustWatch needs to ensure that it is showing those trailers to the people who are most likely to be interested in the film: again based on their understanding of those user’s taste in films. And that understanding is built on data.

### Taking control of the data with Snowplow
With Snowplow, JustWatch has complete control over what data it wants to record. JustWatch captures event-level interactions that describe what video content their users search for, like, add to their WatchList, buy and watch, both at home and in the cinema. JustWatch surveys their users about their movie tastes and records the results using Snowplow, enabling JustWatch to enrich users’ profiles with qualitative as well as quantitative data. This data set provides the bed rock for the intelligence that powers JustWatch’s business. Because the data is rich and highly structured, JustWatch has maximum analytical flexibility to do whatever it wants with the data.

Snowplow gives JustWatch complete ownership of their data. This is a unique asset that the JustWatch team can develop over time.

Having control of their data gave the JustWatch team the flexibility to build their own segmentation technology on top of the data to deliver their cutting-edge service.

> **“Snowplow is a data playground. Having access to the source events makes it really easy to query it and quickly test hypotheses”,
Sixtine Vervial, Data Analyst, JustWatch**

<!--more-->

## Using Snowplow data to drive spectacular business growth
Getting up and running fast was important for JustWatch. They needed to prove their business model in a very short time period, and the business model depends on their data. JustWatch set up the whole Snowplow platform in less than three weeks. A month later they ran their first campaign. With their data collection sorted so quickly, they could focus their considerable expertise in using that data to:

1. Build intelligence on that data
2. Use that intelligence to deliver a unique, compelling service for studios and consumers
3. Grow their business around that unique service

### Building intelligence on the data
From the underlying data, the JustWatch team applied a multi-layered analytic approach to first develop a sophisticated user understanding and then use that understanding to build actionable audience segments for targeting.

* **Single customer view**: JustWatch uses Snowplow to track users across platforms and channels including web, mobile, advertising and affiliate platforms. Snowplow enforces a clean separation between data collection and data modeling, giving JustWatch the flexibility to track users across platforms and channels whilst developing their own rules and logic for stitching user journeys across those channels together to deliver a single customer view. That view is the basis for all the user-level intelligence they have developed.
* **Machine learning and clustering algorithms to match user with content**: JustWatch makes extensive use of clustering algorithms run on their Snowplow data to build primary user segments. Because Snowplow data is incredibly rich and granular, it is very well suited to processing using machine learning and clustering algorithms.
* **Intuition led and data-led insight**: The JustWatch team are experts in their field – they have a wide range of intuitions about what films will appeal to different audience segments. The JustWatch team can test these intuitions with the data, by comparing engagement rates with trailers by segment. In addition, data analysts at JustWatch actively comb through data to spot patterns suggesting sometimes surprising interest from segments you would not expect to be interested in a particular film. Again, these patterns can be rigorously validated before being used to match audience with content.

### Use that intelligence to deliver a unique, compelling service for advertisers and consumers
JustWatch has a team of experienced engineers, scientists and analysts who built a highly-differentiated service on top of their data and insight:

* **JustWatch’s Audience building technology enables advertisers to combine primary segments into more highly targeted segments**. The Audience Builder enables studios to define audiences they can target, intersecting various user segments, for instance users who happened to watch a comedy film on Netflix in July. This gives advertisers an unprecedented level of control and precision when defining their target audience.
* **Reach users across channels** including YouTube, Facebook, web, real-time bidding platforms, push notifications. JustWatch built their own anonymous identity management service on top of their Snowplow data, enabling them to not only successfully identify users across channels, but target and interact with specific users across any channel.
* **Campaigns through the JustWatch platform enjoy very high engagement levels**. JustWatch campaigns are highly engaging and have more than twice the view time and half the price (per trailer watched) than the industry benchmark and are optimized based on cinema/purchase intent (Source: Google/YouTube, Benchmarks of Trailer Advertising campaigns Q4 2016, Germany).
* **Buying audiences smarter with JustWatch**: advertisers on Google / YouTube and Facebook pay per view, but if viewers like their trailers more, they pay less per view and reach more people with the same (or smaller) budget. JustWatch therefore enables its advertising customers to achieve a much higher return on ad spend: saving money whilst reaching more engaged audiences.
* **A consultative movie marketing partner**: before launching campaigns on behalf of studios, JustWatch works with the studios to test different trailers with the relevant audience segments, to help the studios understand what trailers will perform best with what type of audience and use that to guide the campaign. Their considerable insight into what makes different movie-watchers tick enables JustWatch to be a valued partner to a growing number of studios around the world.

> **“Having access to the event-level data with Snowplow enables us to not only finely segment users, but also provide users with highly personalized adverts and experience”
Sixtine Vervial, Data Analyst, JustWatch**

### Spectacular business growth
JustWatch has grown very quickly since its launch, a little over 2 years ago in February 2015. Here are some of the remarkable milestones JustWatch has achieved:

* From 0 to 40 staff and the team keeps growing
* Offices opened in Berlin and Los Angeles
* Launched in 25 countries and on every continent
* Millions of new users and app downloads every month
* Over 50 million anonymized profiles of movie fans worldwide
* Doubled efficiency of trailer advertising campaigns for their clients
* Working with studios like Sony, Paramount and Fox from the US to Europe to Asia
* Reached millions of Euros in revenue and achieved profitability in late 2016

### Learn more about JustWatch
JustWatch’s Dominik Raute (CTO) and Christoph Hoyer (CMO) presented at the Snowplow Berlin Meetup in November 2016. You can view the presentation [here](http://snowplowanalytics.com/blog/2017/01/31/roundup-of-snowplow-meetup-berlin-number-three/#justwatch).

To find out more about JustWatch and its company culture, read the [blog post](https://www.justwatch.com/blog/post/justwatch-company-culture/) by David Croyé, founder and CEO at JustWatch.

If you would like to explore how Snowplow can enable you to take control of your data, and what that can make possible, visit [our product page](http://snowplowanalytics.com/product/), [request a demo](http://snowplowanalytics.com/trial/) or [get in touch](http://snowplowanalytics.com/contact/).

[Sign up to our mailing list](http://snowplowanalytics.us11.list-manage.com/subscribe?u=10bb4a6f31d5f19e0d0b54476&id=bb28c7d30d) and stay up-to-date with our new releases and other news.


[justwatch-case-study]: /assets/pdf/justwatch-case-study.pdf

[picture-of-dominik]: /assets/img/blog/2017/04/dominik-raute-photo.png "Dominik Raute, Co-Founder & CTO, JustWatch"
