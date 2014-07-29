---
layout: post
shortenedlink: Graph DB for path analysis
title: Could a graph database help speed up path analysis?
tags: [snowplow, neo4j, graph database, path analysis]
author: Nick
category: Analytics
---

If you run a website, you might be interested to find out how users navigate around it. How do people end up on your blog page? What page views are most likely to end in a particular event? Are there any unexpectedly common sequences of pages that users view? How long does it take a user to get from your home page to your contact page?

None of these questions is easy to answer using a traditional SQL database. Following a user's journey needs multiple lookups through the entire database, and so doing it for all of your users will be slow.

Graph databases may help to solve this problem. They are used to model data where relationships are important, and that's why Facebook's new search tool is called 'Graph Search'. A graph database consists of *nodes*, which we can consider to be objects, and *edges*, which connect nodes. So on Facebook, your friends are nodes, their photos are nodes, and liking one of their photos creates an edge between your node and the photo's node.

<p style="text-align:center"><img src="/assets/img/blog/2014/07/Neo4j-fb-example.png"></p>

To find out who liked a particular photo, we only need to follow its incoming 'LIKED' edges and see where they end up, rather than searching through a whole database for the photo's ID.

For our needs, we want to describe a user's journey around a website. We might naively start by adding nodes for our users and for our pages, and then create a VIEWS edge between them. But that wouldn't allow us to track the order of these events. Instead, we can consider the page view to be an object in its own right and allocate each page view its own *View* node.

<p style="text-align:center"><img src="/assets/img/blog/2014/07/Neo4j-basic-structure.png"></p>

Then these View nodes can be linked together to put these events in order. The diagram below shows a user who has visited Page 1, then Page 2, before returning to Page 1 and finally visiting Page 3. It's worth noting that we're not limited to page views; page pings, link clicks, 'Add to basket' events and so on could all be modelled by adding extra nodes and edges. We're using the *VERB* and *OBJECT* language so that we could generalise to these other events later.

<p style="text-align:center"><img src="/assets/img/blog/2014/07/Neo4j-prev-relationships.png"></p>

I've chosen to link the *View* events with 'PREV' edges, rather than 'NEXT', because it seems semantically more straightforward to add a 'PREV' edge whenever a new event happens. We can traverse in either direction though, so 'NEXT' can be conceived as going backwards along a 'PREV' edge.

Without the intermediate *View* nodes, it would be computationally expensive to order the page views. As it is, we can just follow the PREV edges (in either direction). And by following a path from the user along a pair consisting of a 'VERB' edge and an 'OBJECT' edge, we can easily get a list of pages the user has visited. And we can also start from a page and go backwards along 'OBJECT' edges to View nodes. This gives us a very flexible tool for analysing users' actions on a website.

This ability to 'walk the graph' is what makes it so much faster than a relational database for some kinds of queries. If we're interested in pathing, then we'll be able to use a graph network's very structure to help us find the sorts of patterns we're looking for.

We'll be using Neo4j for our initial experiments because, although it doesn't scale as well as some of its competitors, it has two features which mean it'll work well for some initial experiments. First, it has a web browser interface which automatically creates visualisations of the graph like the ones in this post. Second, you get to use Cypher, its wonderful query language. By way of example, to create the edges between Barry and Page 1 above, we first CREATE (or MATCH) the nodes we're interested in and then *draw* the edges between them:

<p style="text-align:center"><img src="/assets/img/blog/2014/07/Neo4j-code-snippet.PNG"></p>

The patterns we can draw in Cypher can become increasing intricate when we're doing more complex analysis, and in the next post we'll explore some of these as we dive in and get some data into Neo4j.

[image1]: /assets/img/blog/2014/07/Neo4j-fb-example.png
[image2]: /assets/img/blog/2014/07/Neo4j-basic-structure.png
[image3]: /assets/img/blog/2014/07/Neo4j-prev-relationships.png
[image4]: /assets/img/blog/2014/07/Neo4j-code-snippet.PNG