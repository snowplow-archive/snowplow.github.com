---
layout: post
title: Introducing Looker - a fresh approach to Business Intelligence that works beautifully with Snowplow
title-short: Introducing Looker
tags: [events, business intelligence, looker, lookml]
author: Yali
category: Analytics
---
![Looker-screenshot] [looker-screenshot]

In the last few weeks, we have been experimenting with using [Looker] [looker] as a front-end to analsye Snowplow data. We've really liked what we've seen: Looker works beautifully with Snowplow. Over the next few weeks, we'll share example analyses and visualizations of Snowplow data in Looker, and dive into Looker in more detail. In this post, we'll take a step back and walk through some context to explain why we are so excited about Looker.

1. [Understanding the limitations that arise when you use traditional Business Intelligence (BI) tools (like Tableau) to analyse Snowplow data] (/blog/2013/12/10/introducing-looker-a-fresh-approach-to-bi-on-snowplow-data/#limitations)
2. [How Looker takes a fresh approach to BI, and why that overcomes the limitations Snowplow users have working with other solutions] (/blog/2013/12/10/introducing-looker-a-fresh-approach-to-bi-on-snowplow-data/#enter-looker)

<!--more-->

<div class="html">
<a name="limitations"><h2>The limitations that arise when you use traditional Business Intelligence (BI) tools to analyse Snowplow data</h2></a>
</div>

Our vision for Snowplow is to enable companies to capture and store granular, event-level data from their websites and applications, so that they can perform any type of analysis on that data, including joining that event data with other data sets.

The majority of companies using Snowplow access their data from Amazon Redshift. Redshift is great: it makes it possible to run performant queries against massive data sets - and Snowplow data sets are often very large. It also makes it possible to plug-in one or more business intelligence tools to query and visualize the data, via its Postgres API. Perhaps not surprisingly, one of the quesitons we get asked most is what BI and reporting solutions to use to mine Snowplow data and deliver dashboards powered by that data. We have worked with a number clients to implement BI tools on top of Snowplow data, more often than not [Tableau] [tableau].

BI tools are great for a host of reasons. By providing graphical user interfaces on top of the data, they make it possible for people to query the data without knowledge of SQL. They also make it possible to visualize the data, making it easier to identify underlying trends and drive value from the data.

For companies running Snowplow, the benefits that a BI tool provide come at a cost: it is not possible to query the data as flexibily through the BI tool as it is executing SQL directly against the data in Redshift. To understand why, it helps to think about the architecture underlying traditional Business Intelligence tools:

![Diagram of BI tool architecture][diag-1]

BI tools typically load data sets into their own internal analytics engine. The tool will then infer a collection of dimensions and metrics from that data, based on the underlying structure of the database it is connected to. Users of the BI tool can then go on to define additional dimensions and metrics on top of that data: for example by defining the metric 'uniques' as a count of the number of distinct 'domain_userid' values. It is then possible to use the complete set of dimensions and metrics to pivot the data (slice and dice differnet combinations of metrics and dimensions together) and visualize the different slices of data.

There are two problems with using the above approach with Snowplow data in Amazon Redshift, however:

1. [The volume of data in Redshift is simply too large to load into the BI tool's own data processing engine. (Which is generally optimized for in-memory computation.)](#volume)  
2. [Deriving dimensions and metrics from the underlying Snowplow data is not trivial](#mapping)  

<div class="html">
<a name="volume"><h3>1.1 There is too much data in Redshift to load into the BI tool's own analytics engine</h3></a>
</div>

BI tools like Tableau have very fast in-memory analytics engines. This is important because when you are slicing and dicing different combinations of dimensions and metrics, you do not want to have to wait tens of minutes for the table or graph to update. Unfortunately, this approach does not work well with Snowplow data in Redshift, because the volume of underlying event-level data is too great to load in-memory.

The primary workaround with Snowplow data is to reduce the volume of data loaded into the BI tool, by:

1. Aggregating the data to a session or visitor level, prior to loading it into the BI tool. (Rather than keep it at the underlying event-level.) This effectively reduces the number of lines of data loaded in.)
2. Limit the number of dimensions / metrics loaded in. (Effectivley limiting the number of columns loaded in.)
3. Limiting the range of data loaded into the BI tool e.g. by time period, or only load data for specific user-segments or cohorts. (This also limits the number of lines of data loaded in.)

The problem with all of the above approaches is that they limit the flexibility that the end-user of the BI tool has to query the data . Aggregating the data to a visit / session level prevents the user drilling in to specific visitors or sessions identified as part of the analysis. Limiting the number of columns loaded limits the number of dimensions and metrics that an end user can slice and dice the data by. And limiting the data loaded in by time period or user segment limits the number of segments or time periods that an analyst can explore data for.

<div class="html">
<a name="mapping"><h3>1.2 Deriving dimensions and metrics from the underlying Snowplow data is not trivial</h3></a>
</div>

The other feature of Snowplow data that BI tools typically struggle with is inferring many of the most useful dimensions and metrics from the underlying event data.

Some dimensions and metrics are relatively straightforward to define for Snowplow data. For example, if we want to uniquely identify a session, we can do so by concatenating the 'domain_userid' and 'domain_sessionidx'. In Tableau, we can create a session ID dimension, by selecting 'Create Metric / Dimension' and entering the following formula:

	[domain_userid] + '-' +  STR([domain_sessionidx])

Similarly, it is straightforward to define a 'Uniques' metric as a count distinct on 'domain_userid' values. Again, we select the 'Create Metric / Dimension' option, and then enter:

	COUNTD( [domain_userid] )

The trouble is that there is a raft of other dimensions that are much harder to define: for example, what was the landing page of this particular session? That involves identifying the first event for a particular session (which is generally a page view), reading the different page parameters ('page_urlhost', 'page_urlpath') for that event, and then blitting that value across all the other lines of data for that session. There are other dimensions that derive from the first event in a session, for example:

1. The page referer (including referer type)
2. Any marketing campaign attributes

In all these cases, it is difficult to define the logic for identifying these dimensions in traditional BI tools. (It is impossible in Tableau.) There are other dimensions that relate to the visitor (rather than the session):

1. What date they first visited the website
2. What visit they 'signed up' (if relevant)
3. Where that user was acquired from? (What referer? What marketing channel?)

To fetch these dimension values, we need to identify the first event for that user across all their different user sessions. Again, this is very difficult within the BI tool, because there is no way to explain to the BI tool how to identify specific lines in the user's event stream, read dimension values from that event and then apply them to all the other events in the same session.

Further, there are other dimensions that relate to the *last* event in a user's session: namely, their exit page. The same difficulty arises.

Finally, there are dimensions that relate to more than one line of data from a user's event stream: for example, session duration is the difference between the timestamp on the first and last event for a particular session. Again, the same difficulty arises.

In all the above examples, it is **not** possible to derive the above fields in Tableau directly on the data, because we have no way in Tableau of defining dimensions related to specific lines in a data set. As a result, companies that use Tableau or other standard BI tools on top of Snowplow have to compute them using SQL *before* loading the data into Tableau. That is effectively what we have done in the different cubes that we created in the 0.8.12 release. You can see the underlying SQL [here] [cubes]. We've produced a guide to generating OLAP-compatible data from the 'atomic.events' data in the [Analytics Cookbook] [olap-recipe]. It is not trivial.

As a result, companies that have implemented e.g. Tableau on top of Snowplow, typically have one or more members of a data team, internally, that are experts at using the SQL to generate different slices of the data that are suitable for loading into Tableau. Consumers of the data who are not versed in SQL query the data using Tableau (either through dashboards powered by Tableau Server or directly via Tableau desktop). If they find that they cannot generate the particular analysis they want out of the different cubes available, they can then ask a member of the data team to generate them a new cube from the event-level data. It works, but it is not ideal.

## Enter Looker: a fresh approach to BI, that is much better suited to analysing Snowplow data

[Looker] [looker] is architected differently to traditional BI tools. There are a number of features that make Looker unique, but two are especially pertinent for users who want to use a BI tool to analyse their Snowplow data:

1. [Looker does not load data into its own data processing engine. Instead, it uses the underlying database to perform the computations.](#processing-engine)
2. [Looker has a lightweight meta-data model that makes it easy to derive a comprehensive set of dimensions and metrics on top of the underlying data.](#meta-data-layer)

<div class="html">
<a name="processing-engine"><h3>1. Looker uses the underlying database to crunch the data</h3></a>
</div>

If you have your data in an database like Amazon Redshift that is optmized for running analytics queries across large data sets, it makes to run your queries on the data in Amazon Redshift. Looker does that: every time you slice / dice combinations of metrics and dimensions in the Looker Explorer, plot a graph or draw a dashboard, Looker translates the actions in the user interface into SQL and runs that SQL on Redshift. Rather then spend time developing their own in-memory data processing architecture, the Looker team have concentrated instead on generating highly performant SQL. As a result, when you're exploring Snowplow data in Looker, you are exploring the complete data set.  

<div class="html">
<a name="meta-data-layer"><h3>2. Looker has a light-weight meta-data model, that makes it easy to derive dimensions and metrics from the underlying Snowplow data</h3></a>
</div>

Looker boasts a very expressive metadata model. You can create a model that understands different entities - for example: visitors, sessions and events. Events can be derived directly from the 'atomic.events' table. In contrast, sessions and visitors are derived from aggregations on that data. The model is rich enough that you can express links between different entities: visitor A has visited the website on three separate occasions: Looker will let you drill into each of those three sessions and view the underlying event stream for each of them.  (You can have as many entities as you like in your model: we typically include geographic data, referers, devices, browsers and event types in the models we've built using Looker.)

The [Looker] [looker] data model is not only expressive, but it's very lightweight: it consists simply of YAML definitions of dimensions, metrics and views on the data. That makes it easy to quickly put together rich models. It also makes it easy to extend the model to incorporate data from other sources: making it straightforward to use [Looker] [looker] to query Snowplow data joined with other data sets, including transactional data, customer data (e.g. from CRM systems) and ad server / marketing data, for example.
The combination of computing on the data directly in Redshift and enabling users to define rich metadata models means [Looker] [looker] is an especially powerful analytics tool for exploring and dashboarding Snowplow data in Amazon Redshift. In the coming weeks, we plan to publish some of the models we've built for Snowplow data in [Looker] [looker] to make it easy for Snowplow users who want to experiment with [Looker] [looker] get off to a flying start. This is the first in a series of blog posts on analysing Snowplow data with [Looker] [looker]: in future posts we will drill into the [Looker] [looker] meta-data model in particular in more detail. Get in touch with either us or the Looker team, if you'd like to trial [Looker] [looker] on top of your Snowplow data.


[looker-screenshot]: /assets/img/blog/2013/12/looker-screenshot.png
[looker-logo]: /assets/img/blog/2013/12/looker-logo.png
[diag-1]: /assets/img/blog/2013/12/simplified-bi-architecture.png
[cubes]: https://github.com/snowplow/snowplow/tree/master/5-analytics/redshift-analytics/cubes
[looker]: http://looker.com
[tableau]: http://tableausoftware.com
[olap-recipe]: /analytics/tools-and-techniques/converting-snowplow-data-into-a-format-suitable-for-olap.html
