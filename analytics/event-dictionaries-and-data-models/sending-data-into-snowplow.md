---
layout: page
group: analytics
sub_group: foundation
title: Sending data into Snowplow
shortened-link: Sending data into Snowplow
description: Find out how to send data into Snowplow
weight: 7
---

# Sending data into Snowplow

What data you get out of Snowplow depends critically on what data you put in. 

The Snowplow pipeline has a very straightforward way of mapping data put in to the data you get out at the other side. Understanding how what you put in maps to what you get out is very useful, both for instrumenting Snowplow trackers and for crunching the processed data.

1. [Understanding how event data is sent into Snowplow](#sending-data-into-snowplow)  
2. [Understanding what the data looks like once it is in Snowplow](#viewing-the-data-in-snowplow)  

<h2><a name="sending-data-into-snowplow">1. Understanding how event data is sent into Snowplow</a></h2>

Data is sent into Snowplow by Snowplow trackers.

When you record an event into Snowplow which you have defined and schemad yourself, you send that data in with the schema associated with it. For example, if we were recording the `perform_search` event documented in the above example via the Javascript tracker, we would track the event using the following tag:

INSERT JS HERE


Note that we send the event data into Snowplow with a reference to the associated schema for the data. The schema lives in [Iglu] [iglu]. Click [here] [iglu] for more information on Iglu.

<h2><a name="viewing-the-data-in-snowplow">2. Understanding what the data looks like once it is in Snowplow</a></h2>

TO WRITE