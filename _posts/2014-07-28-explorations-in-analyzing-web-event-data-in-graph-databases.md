---
layout: post
shortenedlink: Graph DB for path analysis
title: Could a graph database help make speed up path analysis?
tags: [snowplow, neo4j, graph database, path analysis]
author: Nick
category: Analytics
---

If you run a website, you might be interested to find out how users navigate around it. How do people end up on your blog page? What page views are most likely to end in a particular event? Are there any unexpectedly common sequences of pages that users view? How long does it take a user to get from your home page to your contact page?

None of these questions is easy to answer using a traditional SQL database. Matching users' journeys needs multiple lookups through the entire database, and so doing it for all of your users will be excessively slow.

Graph databases may help to solve this problem. They are used to model data where relationships are important, and that's why Facebook's new search tool is called 'Graph Search'. A graph database consists of *nodes*, which we can consider to be objects, and *edges*, which connect nodes. So on Facebook, your friends are nodes, their photos are nodes, and when you like one of their photos, that creates an edge between your node and the photo's node.

[put image here]

For our needs, we want to describe a user's journey around a website. We might naively start by adding nodes for our users and for our pages, and then create VIEWS relationships between them. But that wouldn't allow us to track the order of these events. Instead, we should consider the page view to be an object in its own right and allocate each page view its own View node.

![Basic user-view-page structure] [image2]

Then these View nodes can be linked together to create an order. The diagram above shows a user who has visited Page 1, then Page 2, before returning to Page 1 and finally visiting Page 3.

MATCH (u:User {id:"John"})
CREATE (p2:Page {id:"Page 2"}), (p3:Page {id:"Page 3"}), (p3:Page {id:"Page 4"}), (v2:View {id:"002"}), (v3:View {id:"003"}), (v4:View {id:"004"}), (v5:View {id:"005"}),

By following a path from the user along a pair consisting of a [VERB] edge and an [OBJECT] edge, we can easily get a list of pages the user has visited. But we can also start from a page and go backwards along [OBJECT] edges to View nodes.

This ability to 'walk the graph' is what makes it so much faster than a relational database for some kinds of queries. If we're interested in pathing, then we'll be able to use a graph network's very structure to help us find the sorts of patterns we're looking for.

We'll be using Neo4j for our initial experiments because, although it doesn't scale as well as some of its competitors, you get to use Cypher, its lovely query language. For example, to create the relationship between John and Page 1 above, we first match the nodes we're interested in (having created them already) and then *draw* the relationships between them:

```
MATCH (u:User {id:"John"}), (v:View {id:"101"}), (p:Page {id:"Page 1"})
CREATE (u)-[:VERB]->(v), (v)-[:OBJECT]->(p)
```

We'll be able to draw patterns in Cypher later to find more interesting results.

In the next post we're going to dive in and get some data into Neo4j and start playing around with it...

[image2]: /assets/img/blog/2014/07/Neo4j-basic-structure.png
