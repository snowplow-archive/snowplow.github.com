---
layout: post
title: Third Snowplow Meetup London scheduled for September
title-short: Third Snowplow Meetup London scheduled for September
tags: [meetups, London]
author: Idan
category: Meetups
---

On the 21st September we'll be hosting our third London meetup taking place at [Skills Matter \ Code Node] [Skills Matter] (Shift Room) from 18:30-21:45. 

![London-pic]

In this meetup you'll have a chance to hear real people, doing real stuff with real time. We'll also talk about our latest developments and our vision in the real time space. 

<!--more-->

To do that, we have three great speakers:

1. Dani Sola from [Simply Business] will talk about the near real time pipeline they developed based on Snowplow and Spark Streaming. He'll show us how it's being used to power their call centre and remarketing initiatives. 

2. Daniel Zohar from [Memrise] will be talking about the journy he is taking moving from batch to Real-Time.

3. Alex Dean, our co-founder will Introduce Tupilak, Snowplow's unified log fabric. 
Putting a real-time event pipeline into production has many challenges: we need the pipeline to scale automatically based on event volumes, we need constant monitoring to prevent data loss and minimise end-to-end lag, and we need the ability to upgrade and extend the pipeline with zero downtime. We call software which does all this a "unified log fabric", to distinguish it from the unified logs (e.g. Kafka and Kinesis) and stream processing frameworks (e.g. Spark Streaming and Kafka Streams) which such a fabric monitors and orchestrates.

	As part of incorporating Snowplow's Kinesis-based event pipeline into our Managed Service, we developed our own unified log fabric, called Tupilak. In this talk, Alex will introduce Tupilak, explaining the core monitoring and scaling functions of Tupilak and showing live real-time pipelines visualised in the Tupilak UI. We’ll dive into the architecture of Tupilak, understand its basic scaling algorithm and also take a look at how Tupilak itself is built on a Snowplow event stream. There will be a chance to talk about the roadmap for Tupilak, including our plans for porting it to Kubernetes and adding Kafka and Spark Streaming support.

Did I mention already pizza and beer!? 
Read on to learn more about the companies that will speaking.



## About the companies presenting:

### Simply Business:

Simply Business is the UK's largest online business insurance broker, with 300,000 customers. The company has been featured in the Sunday Times Tech Track 100 four times and in 2015 and 2016 won The Sunday Times 100 Best Companies to Work For.

### Memrise:

Memrise is an online learning tool with courses created by its community. Its courses are mainly used to teach languages, but are also used for other academic and nonacademic subjects.


[London-pic]: /assets/img/blog/2016/09/London.jpg
[Simply Business]: http://www.simplybusiness.co.uk/
[Memrise]: https://www.memrise.com/
[Skills Matter]: https://skillsmatter.com/
[sign up]: http://www.meetup.com/Snowplow-Analytics-London/events/233149321/
