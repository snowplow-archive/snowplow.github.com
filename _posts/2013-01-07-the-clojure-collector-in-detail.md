---
layout: post
title: Understanding the thinking behind the Clojure Collector, and mapping out its development going forwards
title-short: The Clojure Collector in detail
tags: [snowplow, clojure collector, clojure, third party cookies, amazon elastic beanstalk]
category: Inside the Plow
author: yali
---

Last week we released [Snowplow 0.7.0] [snowplow-0.7.0]: which included a new Clojure Collector, with some significant new functionality for content networks and ad networks in particular. In this post we explain a lot of the thinking behind the Clojure Collector architecture, before taking a look ahead at the short and long-term development roadmap for the collector.

This is the first in a series of posts we write where describe in some detail the thinking behind the architecture and design of Snowplow components, and discuss how we plan to develop those components over time. The purpose of doing so is to engage people like yourself: developers and analysts in the Snowplow community, in a discussion about how best to evolve Snowplow. The reasoning is simple: we have had many fantastic ideas and contributions from community members that have proved invaluable in driving Snowplow development, and we want to encourage more of these conversations and contributions, to help make Snowplow great.

![engine][engine-pic]

## Contents

1. [The business case for a new collector: understanding the limitations of the Cloudfront Collector] [biz-case]
2. [Under the hood: the design decisions behind the Clojure Collector] [under-the-hood]
3. [Moving forwards: short term Clojure Collector roadmap] [short-term-roadmap]
4. [Looking ahead: long term collector roadmap] [long-term-roadmap]


<!--more-->

<h2><a name="biz-case">1. The business case for a new collector: understanding the limitations of the Cloudfront Collector</a></h2>

We launched Snowplow with the [Cloudfront Collector] [cloudfront-collector]. The Cloudfront Collector is simple:

1. The Snowplow tracking pixel is served from Amazon Cloudfront
2. Cloudfront logging is switched on (so that every time the pixel is fetched by a Snowplow tracking tag, the request is logged).
3. Events and associated data points we want to capture are stored as name / value pairs and appended to the query string for the tracking pixel, so that they are automatically logged.  

The Cloudfront Collector is so simple that many people express surprise that there are so few files in the appropriate section of the [Snowplow repo] [repo]. (It's just a `readme` and the tracking pixel.) In spite of that simplicity, however, the Cloudfront Collector boasts two key strengths:

1. **Simplicity**. Simplicity is a strength: because it has no moving parts, the Cloudfront Collector is incredibly robust. It makes no decisions. All it does is faithfully log requests made to the tracking pixel. There is very little that can go wrong with it. (Nothing if Cloudfront stays live.)
2. **Scalability**. By using Amazon's content distribution network (CDN) to serve the tracking pixel and log requests for the tracking pixel, we can be confident that businesses using the Cloudfront Collector will be able to comfortably track millions of requests per hour. Amazon's CDN has been designed to be elastic: it responds automatically to spikes in demand, so you can be confident that even in during peak demand periods, all your data will successfully be captured and stored.

Nonetheless, there are two major limitations to the Cloudfront Collector:

1. **Unable to track users across domains**. Because Snowplow has been designed to be scalable, we've had a lot of interest in it from media groups, content networks and ad networks. All of these companies want to track individual users across multiple websites. This is not directly supported by the Cloudfront Collector: because it has no moving parts, user identification has to be performed client side, by the [Javascript tracker] [javascript-tracker] using first party cookies. As a result, `user_id`s that are set on one domain cannot be accessed on another domain, even if both domains are owned and operated by the same company.
2. **Not real-time**. Cloudfront log files typically appear in S3 3-4 hours after the requests logged were made. As a result, if you rely on the Cloudfront cCollector for your web analytics data, you will always be looking at data that is at least 3-4 hours old.

The Clojure Collector explicitly addresses the first issue identified above: it has a single moving part, which checks if a `user_id` has been set for this user: if so, it logs that `user_id`. If not, it sets a `user_id` (server side), and stores that `user_id` in a cookie on the collectors own domain, accessible from any website running Snowplow that uses the same collector.

The Clojure Collector does not explicitly address the second issue related to the speed at which data is logged for analysis. Although it logs data faster than the Cloudfront Collector (logs are rotated to S3 hourly), this is still not fast enough for real time analysis. However, it is fast enough that the processing bottleneck shifts from the collector to the ETL step: this is something we plan on addressing in the near future. (More on this [later] (#long-term-roadmap).)

<h2><a name="under-the-hood">2. Under the hood: the design decisions behind the Clojure Collector</a></h2>

We made three important design decisions when building the Clojure Collector:

### 1. Built for Elastic Beanstalk

We built the Clojure Collector specifically for Elastic Beanstalk. This has a number of important advantages:

* **Comfortably scales to handle spikes in demand**. Elastic Beanstalk is **elastic** in the same way as Cloudfront is **elastic**. It makes it easy to scale services to handle spikes in demand, which is crucial if we're going to continue to track events data during spikes in service usage.
* **Automatic logging to S3**. Elastic Beanstalk supports a configuration option that automatically rotates Tomcat access logs to Elastic Beanstalk hourly. By using this feature, we were able to save ourselves having to build build a process to manage that log rotation, and save our users the hassle of installing and maintaining the process.

Amazon Elastic Beanstalk supports open source applications built for the JVM, or PHP, Python and Ruby web apps. Of the four, it was clear that JVM was the most performative platform to build a Collector in.

### 2. Minimal moving parts

The Clojure collector _only_ sets `user_id`s and expiry dates on those `user_id`s. It does _nothing_ else: keeping it as simple as possible.

### 3. Log files formats match those produced by Cloudfront

The least wieldy part of the Snowplow stack today is the [ETL step] [etl]. This parses the log files produced by the collector, extracts the relevant data points and loads them into S3 for processing by Hadoop/Hive and/or Infobright for processing in a wide range of tools e.g. [ChartIO] [chartio] or [R] [r-project].

We have plans to replace the current [Hive-based ETL process] [hive-etl] with an all new process based on [Scalding] [scalding]. (More on this in the next blog post in this series.) In the meantime, however, we did not want to have to write a new Hive deserializer to parse log files that match a new format: instead, we customised Tomcat in the Clojure Collector to output log files that matched the Cloudfront logging format. (This involved writing a custom [Tomact Access Valve] [tomcat-cf-access-valve] and tailoring [Tomcat's server.xml] [server-xml].) As a result, the new Clojure Collector plays well with the existing ETL process.

<h2><a name="short-term-roadmap">3. Moving forwards: short term Clojure Collector roadmap</a></h2>

This is the initial release of the Clojure Collector. If it will be deployed by large media companies, content networks and ad networks, it is important that we learn how to configure it to function well at scale. To this end, we are looking for help, from members of the Snowplow community (particularly those with an interest in tracking users across domains), to help with the following:

1. Load testing the collector. Test how fast the collector responds to increasing number of requests per second, and how this varies by the size of instance offered by Amazon. (E.g. how does the curve differ for an m1.small instance than an m1.large instance?) It should be possible to use a tool like [Siege] [siege] or [Apache Bench] [apache-bench] to test response levels and response times at increasing levels of request concurrency, and plot one against the other.
2. On the basis of the above, working out the optimal way of setting up the Clojure Collector on Elastic Beanstalk. It would be good to answer two questions in particular: what size instance is it most cost effective to use, and what should trigger the starting up of an additional instance to cope with a spike in traffic? Amazon makes it possible to specify custom KPI to use to trigger scaling of services on Elastic Beanstalk, and it may be that doing so results in much improved performance and reliability from the Collector.

Because we haven't been able to perform the above tests to date, we're still calling the Clojure Collector an experimental release, adn recommend that companies using it in production run it alongside the Cloudfront Collector.

<h2><a name="long-term-roadmap">4. Looking ahead: long term collector roadmap</a></h2>

Long term we need to move the whole Snowplow so that it's processing data faster, closer to real-time. This primarily means moving the [ETL] [etl] process from a Hadoop, batch-based process that is run at regular intervals to a stream-based, always on process, using a technology like [Storm] [storm]. In the next post in this blog post series, we will elaborate further on our proposed developments for this part of the Snowplow stack. When the time comes, however, we will need to build a new collector, or modify an existing collector, to work in a stream-based system. (So that rather than rely on the processing of logs, each new event logged generates a message in a queue that kicks of a set of analytic processing tasks that end with the data being stored in S3 / Infobright.)

## Want to get involved?

Want to help us develop the Clojure Collector, or some other part of the Snowplow stack? Have an idea about what we should be doing better, or differently? Then [get in touch] [contact]. We'd love to hear from you.



[snowplow-0.7.0]: /blog/2013/01/03/snowplow-0.7.0-released/
[engine-pic]: /assets/img/blog/2013/01/engine.jpg
[biz-case]: /blog/2013/01/07/the-clojure-collector-in-detail#biz-case
[under-the-hood]: /blog/2013/01/07/the-clojure-collector-in-detail#under-the-hood
[short-term-roadmap]: /blog/2013/01/07/the-clojure-collector-in-detail#short-term-roadmap
[long-term-roadmap]: /blog/2013/01/07/the-clojure-collector-in-detail#long-term-roadmap
[cloudfront-collector]: https://github.com/snowplow/snowplow/wiki/setting-up-the-cloudfront-collector
[javascript-tracker]: https://github.com/snowplow/snowplow/wiki/javascript-tracker-setup
[etl]: https://github.com/snowplow/snowplow/wiki/choosing-an-etl-module
[chartio]: http://chartio.com
[r-project]: http://www.r-project.org/
[hive-etl]: https://github.com/snowplow/snowplow/wiki/hive-etl-setup
[scalding]: https://github.com/twitter/scalding
[tomcat-cf-access-valve]: [tomcat-cf-access-valve]
[server-xml]: https://github.com/snowplow/snowplow/blob/master/2-collectors/clojure-collector/war-resources/.ebextensions/server.xml
[siege]: http://www.joedog.org/siege-home/
[apache-bench]: http://httpd.apache.org/docs/2.2/programs/ab.html
[storm]: http://storm-project.net/
[contact]: /about/index.html
[repo]: https://github.com/snowplow/snowplow/tree/master/2-collectors/cloudfront-collector
