---
layout: post
title: Can graph databases enable whole new classes of event analytics?
tags: [snowplow, neo4j, graph database, path analysis]
author: Nick
category: Analytics
---

With Snowplow, we want to empower our users to get the most out of their data. Where your data lives has big implications for the types of query and therefore analyses you can run on it.

Most of the time, we're analysing data with SQL, and specifically, in Amazon Redshift. This is great a whole class of OLAP style analytics - it enables us to slice and dice different combinations of dimensions and metrics, for users, sessions, pages and other entities that we care about.

However, when we're doing event analytics, we often want to understand the sequence that events have occurred in. We might want to know, for example:

* How long does it take users to get from point A to point B on our website or mobile app?
* What are the different paths that people take to get to point C?
* What are the different paths that people take from point D?

This type of *pathing analysis* is not well supported by traditional SQL databases. That's because organising data in a tabular structure means you have to do multiple table scans and execute expensive window functions to first order events by user, and then sequence them.

Graph databases represent a new approach to storing and querying data. We've started experimenting with using them to try answering some of the questions above. In this blog post, we'll cover the basics of graph databases, and start to explore some of the experimentation we've done with [Neo4J] [neo4j] in particular. We'll follow this blog post with more detailed examples.

<!--more-->

## Modelling event data in graph databases

Graph databases are often talked about with reference to social networks. They are used to model data where relationships are important, and that's why Facebook has a search tool is called 'Graph Search'. A graph database consists of *nodes*, which we can consider to be objects, and directed *edges*, which connect nodes together. So on Facebook, your friends might be represented as nodes, their photos as nodes as well, and we can represent liking one of their photos by creating an edge between the user node and the photo node.

<p style="text-align:center"><img src="/assets/img/blog/2014/07/Neo4j-fb-example.png"></p>

To find out who liked a particular photo, we only need identify the node representing that photo, and then to follow its incoming 'LIKED' edges and see where they end up, rather than performing a full table scan of all photos to identify the one we're interested in, then scanning another table of likes to identify which users are linked to the photo, and then scanning the full users table to identify details about the user that liked the photo.

For our needs, we want to describe a user's journey through a website. We need to decide how to model that journey as a graph. To start off with, we only wanted to model page view events. We might naively start by adding nodes for our users and for our pages, and then create a VIEWS edge between them. But that wouldn't allow us to track the order of these events - this is critical to the pathing analysis we wish to perform. Instead, we can consider the page view event to be an object in its own right and allocate each page view to its own *View* node.

<p style="text-align:center"><img src="/assets/img/blog/2014/07/Neo4j-basic-structure.png"></p>

These View nodes can then be linked together to put these events in order. The diagram below shows a user who has visited Page 1, then Page 2, before returning to Page 1 and finally visiting Page 3. It's worth noting that we're not limited to page views; page pings, link clicks, 'Add to basket' events and so on could all be modelled by adding extra nodes and edges. We're using the *VERB* and *OBJECT* language so that we could generalise to these other events later. (Note that this approach builds on thinking through [event grammars] [event-grammars]).

<p style="text-align:center"><img src="/assets/img/blog/2014/07/Neo4j-prev-relationships.png"></p>

I've chosen to link the *View* events with 'PREV' edges, rather than 'NEXT', because it seems semantically more straightforward to add a 'PREV' edge whenever a new event happens. We can traverse in either direction though, so 'NEXT' can be conceived as going backwards along a 'PREV' edge.

Without the intermediate *View* nodes, it would be computationally expensive to order the page views. As it is, we can just follow the PREV edges (in either direction). And by following a path from the user along a pair consisting of a 'VERB' edge and an 'OBJECT' edge, we can easily get a list of pages the user has visited. And we can also start from a page and go backwards along 'OBJECT' edges to View nodes. This gives us a very flexible tool for analysing users' actions on a website.

We'll be using Neo4J for our initial experiments because it has two features in particular that stand out:

1. It has a browser-based interface which automatically creates visualisations of the graph like the ones in this post. This is a real help in building our initial graphs and developing queries against them.
2. We get to use Cypher, its expressive query language, to ask questions of our data. By way of example, to create the edges between Barry and Page 1 above, we first CREATE the nodes we're interested in and then *draw* the edges between them:

<p style="text-align:center"><img src="/assets/img/blog/2014/07/Neo4j-code-snippet.PNG"></p>

Not only is Cypher very flexible when we're creating our graph - it also gives us a lot of flexibility when we come to query it. For example, if I want to find out how many steps it takes users to navigate from our homepage to our blog index, I can execute a query like the following:

<pre>
MATCH (blog:Page {id:"snowplowanalytics.com/blog/index.html"}),(st:Page {id:"snowplowanalytics.com/"}),
p = (st)<-[:OBJECT]-()<-[:PREV*..10]-()-[:OBJECT]->(blog)
where none(
	v in NODES(p)[2..LENGTH(p)-1]
	where v.page = blog.id
	and v.page = st.id
)
return length(p), count(length(p))
ORDER BY length(p);
</pre>

This query uses page URLs stored as properties of View nodes to make sure we're not counting paths that visit the homepage or blog more than once. I've also limited the length of a path to 10 steps to keep things reasonable. Based on a dataset with ~250k page view events, Neo4J took 47 seconds to return the following table.

<pre>
+------------------------------+
| length(p) | count(length(p)) |
+------------------------------+
| 3         | 482              |
| 4         | 260              |
| 5         | 244              |
| 6         | 225              |
| 7         | 348              |
| 8         | 168              |
| 9         | 152              |
| 10        | 127              |
| 11        | 102              |
| 12        | 86               |
+------------------------------+
</pre>

Note that these lengths include the OBJECT edges that take us from the homepage node to its events, and from the blog node to its events, so we need to subtract 2 to get the number of steps taken.

In the [next blog post](/blog/2014/07/30/loading-snowplow-web-event-data-into-graph-databases-for-pathing-analysis/), we'll dive into some more concrete examples of using Cypher and Neo4J to perform pathing analysis on Snowplow event data.

*Edit: Michael Hunger pointed out in the comments that the 'and' in the last query above should be 'or'. I've updated this in the [third blog post](/blog/2014/07/31/using-graph-databases-to-perform-pathing-analysis-initial-experimentation-with-neo4j/), where we're discussing some of the analysis in more detail.*

[image1]: /assets/img/blog/2014/07/Neo4j-fb-example.png
[image2]: /assets/img/blog/2014/07/Neo4j-basic-structure.png
[image3]: /assets/img/blog/2014/07/Neo4j-prev-relationships.png
[image4]: /assets/img/blog/2014/07/Neo4j-code-snippet.PNG
[event-grammars]: /blog/2013/08/12/towards-universal-event-analytics-building-an-event-grammar/
[neo4j]: http://www.neo4j.org/
