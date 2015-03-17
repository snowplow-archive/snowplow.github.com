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

INSERT DIAGRAM OF FRONT PART OF SNOWPLOW PIPELINE HERE

Data is sent into Snowplow by Snowplow trackers.

When you record an event into Snowplow which you have defined and schemad yourself, you send that data in with the schema associated with it. For example, if we were recording the `perform_search` event documented in the above example via the Javascript tracker, we would track the event using the following tag:

INSERT JS HERE


Note that we send the event data into Snowplow with a reference to the associated schema for the data. The schema lives in [Iglu] [iglu]. Click [here] [iglu] for more information on Iglu.

<h2><a name="viewing-the-data-in-snowplow">2. Understanding what the data looks like once it is in Snowplow</a></h2>

TO WRITE

[iglu]: analytics/event-dictionaries-and-data-models/iglu.html
