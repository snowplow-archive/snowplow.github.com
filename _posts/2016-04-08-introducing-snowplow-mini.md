---
layout: post
title: Introducing Snowplow Mini
title-short: Snowplow Mini 0.2.0
tags: [snowplow, real-time, kinesis, developer tools]
author: Josh
category: Releases
---

We've built Snowplow for robustness, scalability and flexibility. We have not built Snowplow for ease of use or ease of setup. Nor has the Snowplow Batch Pipeline been built for speed: you might have to wait several hours from sending an event before you can view and analyze that event data in Redshift.

![austen-powers-dr-evil-mini-me][img1]

There are occasions when you might want to work with Snowplow in an easier, faster way. Two common examples are:

1. New users who want to understand what Snowplow does and how it works. For these users, is it really necessary to setup a distributed, auto-scaling collector cluster, Hadoop job and Redshift cluster? For users who want to experiment with the Real-Time Pipeline, it is necessary to setup three different Kinesis Client Library applications and three different Kinesis streams, just to get started?
2. Existing users who are extending their tracking and want to test it prior to pushing updates to production. Many of these users are running our batch pipeline: is there a way they can get faster (near-instant) feedback on whether their tracker updates are working properly?

Today we're delighted to announce [Snowplow Mini][snowplow-mini] to meet the above two use cases: the complete Snowplow Real-Time Pipeline, on a single AMI / EC2 instance. Download, and setup, in minutes...

1. [Overview](/blog/2016/04/08/introducing-snowplow-mini#overview)
2. [Under the hood](/blog/2016/04/08/introducing-snowplow-mini#topology)
3. [Software stack](/blog/2016/04/08/introducing-snowplow-mini#software-stack)
4. [Roadmap](/blog/2016/04/01/introducing-snowplow-mini#roadmap)
5. [Getting help](/blog/2016/04/01/introducing-snowplow-mini#help)

<!--more-->

<h2 id="overview">1. Overview</h2>

Snowplow Mini is the complete Snowplow Real-Time Pipeline running on a single instance, available for easy install as a pre-built AMI. Set it up in minutes by following the [quickstart guide][quickstart-guide].

Once deployed, you fetch the public IP for your Snowplow Mini instance from the EC2 console. You can then:

1.1 [Log into Snowplow Mini](#login)  
1.2 [Record events](#send-events)  
1.3 [Explore your data in Elasticsearch and Kibana](#explore)  
1.4 [Debug bad data in Elasticsearch and Kibana](#debug)  

<h3 id="login">1.1 Log into Snowplow Mini</h3>

Once Snowplow Mini is up and running, you should be able to fetch the IP address of the instance it is running on from the EC2 console:

![Get the IP address for your Snowplow Mini instance from the EC2 console][get-ip-address]

Navigate to that IP address in the browser. There you'll find Snowplow Mini:

![Snowplow Mini homescreen][snowplow-mini-homescreen]

<h3 id="send-events">1.2 Record events</h3>

Send in some events in! You can do this directly from the Snowplow Mini UI, by selecting the **Example Events** tab and clicking the different buttons. Each button click will be recorded as an event:

![Send sample events][send-sample-events]

You can, more usefully, send events using any one of our Snowplow trackers. Simply configure the tracker to use the Snowplow Mini collector endpoint on `<<your-snowplow-mini-public-ip>>:8080`

<h3 id="explore">1.3 Explore your data in Elasticsearch and Kibana</h3>

Sending in events is great, but now we want to look at the data.

The simplest way to get started is to view the data in Kibana. This will require a quick initial setup.

Navigate in the browser to `http://<<your-snowplow-mini-public-ip>>:5601`. Kibana will invite you to **setup an index pattern**. Let's first setup an index for 'good' data (i.e. data that is successfuly processed) by entering the following values:

![Kibana setup good index][kibana-setup-good-index]

Hit the create button. Now we have our good index setup:

![Kibana good index][kibana-good-index]

Now let's create a second index for our bad data. Clikc the **Add New** button on the top right of the screen and then enter the following values to configure the index for bad data:

![Kibana setup bad index][kibana-setup-bad-index]

Now let's look at our data. Hit the "Discover" menu item:

![Viewing good event data in Kibana][good-event-data-in-kibana]

We can build graphs in the **Visualize** section and assemble them together in the **Dashboards** section. You can also use other tools for visualizing the data in Elasticsearch: Elasticsearch can be queried directly on `http://<<your-snowplow-mini-public-ip>>:9200`.

<h3 id="debug">1.4 Debug bad data in Elasticsearch and Kibana</h3>

One of the primary uses of Snowplow Mini is to enable Snowplow users to debug updates to their tracker instrumentation in real-time, significantly reducing updates to tracker deployments.

If you have defined your own event and entity (context) schemas, you will need to push these schemas to the Iglu repository that is bundled with Snowplow Mini. There is a simple script you can run to copy those schemas from your lcoal machine to Snowplow Mini: instructions can be found [here][setup-iglu].

Once you've done that, you can start sending data into Snowplow Mini to see if it is processed successfully. Each event you send should either land in the `good` index or `bad` index. To switch from one to the other in Kibana, select the cog icon in the top right of the screen and then select the index you want to view from the dropdown:

![kibana switch from viewing good to bad data][kibana-switch-index]

In the below example you can see that one bad event has landed. It is straightforward to drill in and identify the issue with processing the event (it has a invalid type of `nonsense`):

![kibana example bad data][kibana-view-bad-data]

More information on debugging your data in Elasticsearch / Kibana can be found [here][debugging-bad-data-in-elasticsearch-kibana].

<h2 id="topology">2. Under the hood</h2>

The pipeline running on Snowplow Mini is essentially the Snowplow Real-Time Pipeline:

1. The collector receives events and writes them to a raw events stream or a bad stream (if the event is oversized)
2. Stream Enrich consumes each event from the raw stream and attempts to validate and enrich it. Events that are successfully processed are written to an enriched stream and bad events are written to a bad stream
3. Elasticsearch Sinks are then configured to consume events from both the enriched and bad event streams and to then load them into distinct Elasticsearch indexes for viewing and analysis

The key difference is that on Snowplow Mini:

* Every Kinesis application is run on the same box
* Elasticsearch, Kibana and Iglu server are also running on the box
* Rather than use Kinesis as the event queue, named Unix pipes are employed

This diagram illustrates the mini data pipeline:

![snowplow-mini-topology] [snowplow-mini-topology]

<h2 id="software-stack">3. Software stack</h2>

The current Snowplow Mini stack consists of the following applications:

* Snowplow Stream Collector 0.6.0 - collects your Tracker events
* Snowplow Stream Enrich 0.7.0 - enriches the raw events
* Snowplow Elasticsearch Sink 0.5.0 - loads events into Elasticsearch
* Snowplow Iglu Server 0.2.0 - provides JSON Schemas for Snowplow Stream Enrich
* Elasticsearch 1.4 - stores your enriched and bad events
* Kibana 4.0.1 - a graphical UI for analyzing your enriched and bad events

As so many services are running on the box we recommend a `t2.medium` or higher for a smooth experience during testing and use. This is dependant on a number of factors such as the amount of users and the amount of events being sent into the instance.

<h2 id="roadmap">4. Roadmap</h2>

We have big plans for Snowplow Mini:

* **Support for event storage to PostgreSQL** ([#9][9]). This will make Snowplow Mini much more useful for analysts who want to do more with the data processed than is possible in Elasticsearch, such as to perform data modeling
* **Serve realtime statistics in the Snowplow Mini UI** ([#45][45])
* Make it easier to **fire more example events** directly from the Snowplow Mini UI ([#44][44])
* **Switch from using Unix named pipes to NSQ** to make the internal pipeline more robust (#[24][24])

We also want to make it easy to setup and run Snowplow Mini outside of EC2 by:

* Adding Snowplow Mini as a Vagrant image ([#35][35])
* Adding Snowplow Mini as a composed Docker application ([#23][23])

If you have an idea of something you would like to see or need from Snowplow Mini please [raise an issue][issues]!

<h2 id="help">5. Getting help</h2>

For more details on this release, please check out the [release notes][snowplow-mini-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues].

[snowplow-mini]: https://github.com/snowplow/snowplow-mini
[snowplow-mini-topology]: /assets/img/blog/2016/04/snowplow-mini-topology.jpg
[23]: https://github.com/snowplow/snowplow-mini/issues/23
[35]: https://github.com/snowplow/snowplow-mini/issues/35
[9]: https://github.com/snowplow/snowplow-mini/issues/9
[45]: https://github.com/snowplow/snowplow-mini/issues/45
[44]: https://github.com/snowplow/snowplow-mini/issues/44
[24]: https://github.com/snowplow/snowplow-mini/issues/24
[snowplow-mini-repo]: https://github.com/snowplow/snowplow-mini
[quickstart-guide]: https://github.com/snowplow/snowplow-mini/wiki/Quickstart-guide
[snowplow-mini-release]: https://github.com/snowplow/snowplow-mini/releases/0.2.0
[wiki]: https://github.com/snowplow/snowplow-mini/wiki/Quickstart-guide
[issues]: https://github.com/snowplow/snowplow-mini/issues

[img1]: /assets/img/blog/2016/04/austin-powers-dr-evil-and-mini-me.png
[get-ip-address]: /assets/img/blog/2016/04/snowplow-mini-fetch-ip-address.png
[snowplow-mini-homescreen]: /assets/img/blog/2016/04/snowplow-mini-homescreen.png
[send-sample-events]: /assets/img/blog/2016/04/send-sample-events.png
[kibana-setup-good-index]: /assets/img/blog/2016/04/kibana-setup-good-index.png
[kibana-good-index]: /assets/img/blog/2016/04/kibana-good-index.png
[kibana-setup-bad-index]: /assets/img/blog/2016/04/kibana-setup-bad-index.png
[good-event-data-in-kibana]: /assets/img/blog/2016/04/good-event-data-in-kibana.png
[setup-iglu]: https://github.com/snowplow/snowplow-mini/wiki/Quickstart-guide#iglu-server-usage
[kibana-switch-index]: /assets/img/blog/2016/04/kibana-switch-index.png
[kibana-view-bad-data]: /assets/img/blog/2016/04/kibana-view-bad-data.png
[debugging-bad-data-in-elasticsearch-kibana]: http://discourse.snowplowanalytics.com/t/debugging-bad-data-in-elasticsearch-and-kibana/28
