---
layout: page
group: analytics
sub_group: foundation
title: Sending data into Snowplow
shortened-link: Sending data into Snowplow
description: Find out how to send data into Snowplow
weight: 7
---

# Data collection, enrichment, modelling and analysis





<h2><a name="sending-data-into-snowplow">4. Understanding how event data is sent into Snowplow</a></h2>

Data is sent into Snowplow by Snowplow trackers.

When you record an event into Snowplow which you have defined and schemad yourself, you send that data in with the schema associated with it. For example, if we were recording the `perform_search` event documented in the above example via the Javascript tracker, we would track the event using the following tag:

```js

```

Note that we send the event data into Snowplow with a reference to the associated schema for the data. The schema lives in [Iglu] [iglu]. Click [here] [iglu] for more information on Iglu.

<h2><a name="viewing-the-data-in-snowplow">5. Understanding what the data looks like once it is in Snowplow</a></h2>