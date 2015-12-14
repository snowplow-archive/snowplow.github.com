---
layout: post
title: London NoSQL talk on Snowplow
tags: [snowplow, nosql, london]
author: Alex
category: Meetups
---

It was great to have the opportunity to talk at [London NoSQL] [london-nosql] earlier this week on Snowplow's journey from NoSQL to SQL, and then back to a hybrid model supporting multiple storage targets. Many thanks to Couchbase developer evangelist Matthew Revell for inviting me!

My talk took us through Snowplow's journey from using NoSQL (via Amazon S3 and Hive), to columnar storage (via Amazon Redshift and PostgreSQL), and most recently to a mixed model of NoSQL and SQL, including S3, Redshift and Elasticsearch. Preparing for the talk was also a great opportunity for me to really think through and write down Snowplow's evolution over the last two years from a data storage perspective.

My slides are here:

<iframe src="//www.slideshare.net/slideshow/embed_code/41798496" width="425" height="355" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/alexanderdean/snowplow-analytics-from-nosql-to-sql-and-back-again" title="Snowplow Analytics: from NoSQL to SQL and back again" target="_blank">Snowplow Analytics: from NoSQL to SQL and back again</a> </strong> from <strong><a href="//www.slideshare.net/alexanderdean" target="_blank">Alexander Dean</a></strong> </div>

It was a great audience, who asked some excellent technical questions about Snowplow, data schemas and event analytics following the talk. I feel like we're at the cusp of a lot of interesting new developments around event and entity storage at Snowplow - I look forward to revisiting this topic in 2015 and seeing how much has changed!

[london-nosql]: http://www.meetup.com/London-NoSQL-and-Big-Data/events/193878982/
