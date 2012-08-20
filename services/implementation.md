---
layout: section
category: services
title: SnowPlow Implementation
weight: 4
---

# Implementing SnowPlow

We help you get up and running with SnowPlow.

Getting up and running with SnowPlow is not trivial, especially for client's with overstretched development resources.

We offer two, fixed fee services for standard SnowPlow imeplmentations to help clients get up and running quickly:

1. [Producing Javascript implementation guides](#implementation-guide)
2. [Setting up and running the SnowPlow infrastructure on your behalf](#infrastructure)

In addition we offer custom integration for clients, which may involve some [bespoke report design and delivery] [bespoke-reports] and [custom development] [custom-dev]

<a name="implementation-guide" />
### 1. Producing Javascript implementation guides

Part of the power of SnowPlow is in its ability to enable you to track as many different events on your website or app as you want, to use later in analysis.

In order to make sure all those data points are captured, however, it is important that the Javascript tags are implemented correctly. In particular, making appropriate use of the [event tracking] [event-tracking] tag to track non-page load events is key.

The SnowPlow team can work with you to produce a comprehensive implementation guide. This is an X stage process:

1. Reviewing your website / application to understand all the potential user actions at every point in a user's customer journey
2. Understand what the key data points are to capture at each event
3. Review the data sets you want to join SnowPlow data on, in order to ensure that data points are captured that enable those joins to be reliably made at the analysis phase
4. Specifying the variables to capture with each call to the [event tracking] [event-tracking] tag

**Price**:  we produce implementation guides for a fixed fee of £1000. 

<a name="infrastructure" />
### 2. Run the SnowPlow infrastructure on your behalf

We can setup and run the Amazon Web Services and associated infrastructure necessary for SnowPlow, and maintain it on an ongoing basis. (Or until such time as the client wishes to take ownership of the infrastructure.)

As part of this service we roll out any upgrades to SnowPlow.

**Price**: we do this on a fixed fee basis of £1000 to setup, then £100 per month. 

[event-tracking]: https://github.com/snowplow/snowplow/wiki/Integrating-SnowPlow-into-your-website#wiki-events
[bespoke-reports]: reporting.html
[custom-dev]: custom-development.html

