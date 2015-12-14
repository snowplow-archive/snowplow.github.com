---
layout: post
title: Loading Snowplow event-level data into Neo4J
title-short: Loading Snowplow event-level data into Neo4J
tags: [snowplow, neo4j, graph database, path analysis, neo4J shell tools, cypher, sql]
author: Nick
category: Analytics
---

In the [last post](/blog/2014/07/28/explorations-in-analyzing-web-event-data-in-graph-databases/), we discussed how particular types of analysis, particularly path analysis, are not well-supported in traditional SQL databases, and raised the possibility that graph databases like Neo4J might be good platforms for doing this sort of analysis. We went on to design a graph to represent event data, and page view data specifically, which captures the sequence of events.

In this post, we're going to walk through the process of taking Snowplow data in Redshift, transforming it into a suitable format for loading into our graph and then loading it into Neo4J. Hopefully it should be straightforward for any Snowplow user to follow the process outlined in this post and load their data into Neo4J. In the next post, we'll start doing some analysis on that data.

We'll start by figuring out how to transform and fetch the data out of our Snowplow Redshift database, and then we'll look at how to efficiently import it into Neo4J.

Our graph data model (visualized below) contains three types of nodes:

1. User nodes
2. Page nodes
3. Event nodes (where for now, an event is always a page view)

and three types of edges:

1. Verb edges, that link users to the events that they have performed
2. Object edges, that link those page view objects to the pages that were viewed
3. Previous edges, that can be used to order the events that have occurred for a specific user sequentially. They run from each event to the previous event for that user, where a previous event exists. (I.e. it's not the first event.)

<p style="text-align:center"><img src="/assets/img/blog/2014/07/Neo4j-prev-relationships.png"></p>

<!--more-->

It's worth noticing that the number of *verb* and *object* edges should always match the number of event nodes in our graph, because all our verbs (page views) by definition have a subject (the user that performed them) and an object (the page itself).

Nodes and edges can also have properties, which, to save time, we should include as we're creating them in our graph database. For our experiment, the edges don't need any properties. We'll assign the user and page nodes their unique user ID or page URLs respectively, so we can unambiguously see which user has viewed what page. The event node will need a bit more detail:

* event ID - so we can identify each event unambiguously
* event timestamp (in UNIX format for analysis, and in human-readable format) - so we know when it occurred
* session ID - so we can distinguish sequences of events for a specific user, between sessions
* referrer URL - so we can start to infer *how* users move from one page to the next (this will be explored in the next post)
* user ID - as a shortcut so we can quickly identify which user an event belongs to, without walking the graph
* page URL - as a shortcut, so we can quickly identify which page an event involved, without walking the graph

These last two already exist in the graph (in the user and page nodes), but since the paths we're interested in will usually follow *previous* edges, our Cypher queries can be clearer if we have the user ID and page URL as properties of the event nodes. This also appears to make searches run more quickly. Consider Paul's visit to the website in the image above. To understand the path Paul has followed, we need to trace the graph along the events 001 -> 002 ->003 -> 004 (i.e. reversing along the *prev* edges): reading properties of these nodes means we don't have to follow each *object* edge to find the page it's associated with.

## Getting the data out of Snowplow in Redshift

The following SQL query fetches one year's worth of data for our Event nodes.

{% highlight sql %}
SELECT
	event_id,
	domain_userid,
	DATEDIFF(s, '19700101', collector_tstamp), -- this calculates the time between 1st January 1970 and the timestamp: i.e. UNIX time
	collector_tstamp,
	CONCAT(refr_urlhost, refr_urlpath),
	CONCAT(page_urlhost, page_urlpath),
	domain_sessionidx
FROM atomic.events
WHERE collector_tstamp > '2013-07-01'
	AND page_urlpath IS NOT NULL
	AND domain_userid IS NOT NULL
	AND length(page_urlpath) < 150
	AND length(refr_urlpath) < 150
	AND event  = 'page_view'
GROUP BY 1,2,3,4,5,6,7
{% endhighlight %}

Although this contains all the user IDs and page URLs we're interested in, it's full of duplicates, because we're querying a table full of event-level data. We want to load a deduplicated list of events, users and page URLs into our graph. This will save Neo4J having to check for duplicates when it's adding nodes; avoiding a search against each new node means it'll run much more quickly. To fetch a unique list of users:

{% highlight sql %}
SELECT
	domain_userid
FROM atomic.events
WHERE collector_tstamp > '2013-07-01'
	AND page_urlpath IS NOT NULL
	AND domain_userid IS NOT NULL
	AND event  = 'page_view'
GROUP BY 1
{% endhighlight %}

and to fetch a unique list of pages:

{% highlight sql %}
SELECT
	CONCAT(page_urlhost, page_urlpath)
FROM atomic.events
WHERE collector_tstamp > '2013-07-01'
	AND page_urlpath IS NOT NULL
	AND domain_userid IS NOT NULL
	AND event  = 'page_view'
GROUP BY 1
{% endhighlight %}

You could also include any extra information you want to capture about users or pages, perhaps a location or a page title. The fastest way to do this is while you build the database, but you can still add properties to nodes later.

Once we've run our queries, we can export the results to CSV files for loading into Neo4J. The first CSV we made contains all the data we'll need to create the *verb* and *object* edges. Since there's one of each for every event node in the dataset, we'll have the correct number of rows in that CSV file. So all that remains is to pull the data that represents the *previous* edges. To do this, we can use a window function to identify each event's predecessor by partitioning our data by user ID and session ID:

{% highlight sql %}
SELECT
*
FROM (
	SELECT
	event_id,
	LAG(event_id,1) OVER (PARTITION BY domain_userid, domain_sessionidx ORDER BY dvce_tstamp)  AS previous_event
	FROM atomic.events
	WHERE collector_tstamp > '2013-07-01'
	AND page_urlpath IS NOT NULL
	AND domain_userid IS NOT NULL
	AND event = 'page_view'
) as t
WHERE previous_event IS NOT NULL -- Filter out any events where there is no previous edge (because they are the first event in the session)
{% endhighlight %}

## Getting the nodes into Neo4J

Previously, we got data into Neo4J by writing CREATE statements and pasting them into the browser console. This was fine for our 8 nodes, but pasting 250,000 nodes is somewhat unwieldy, and now that we have our data in CSV format, we have a few more options.

The simplest is to use the [LOAD CSV query] [loadcsv]. But this still uses the browser which significantly slows down the process. In my tests, the [Neo4J Shell Tools] [shell-tools] added data in about half the time. Faster still, apparently, is the [Batch Import tool] [batch-import] , but I couldn't get this working and the Shell Tools proved adequate for datasets of this size, adding nodes in a few seconds and making the edges in less than a minute.

So, if you want to follow along (and assuming you already have Neo4J set up), start by [installing the Shell Tools] [shell-tools]. Move the CSVs into the same directory as the Neo4J installation and launch the neo4j-shell.

Then let's add in the nodes:

<pre>
import-cypher -d"," -i user_nodes.csv -o user_nodes_out.csv CREATE (u:User {id: {user_id}})
</pre>

<pre>
import-cypher -d"," -i page_nodes.csv -o page_nodes_out.csv CREATE (p:Page {id: {page_url}})
</pre>

<pre>
import-cypher -d"," -i view_nodes.csv -o view_nodes_out.csv CREATE (v:View {id: {event_id}, tstamp:{tstamp}, time:{time}, sesson: {session}, refr:{refr_url}, user:{user_id}, page:{page_url}})
</pre>

We should now have a large number of unconnected nodes in our database. We can check this by searching for them. For example, to find out how many User nodes made their way into the database, we could write:

<pre>
MATCH (n:User) RETURN count(n);
</pre>

Notice that in the shell, our queries must end in a semi-colon.

## Getting the edges into Neo4J

Now that our nodes are there, we need to build the edges to connect them. But first, we should tell Neo4J that all these nodes are unique, and to index them. This dramatically speeds up the process to find the start and end nodes for each edge, thereby increasing the speed with which data can be loaded. For each node type, we need a line like this:

<pre>
CREATE CONSTRAINT ON (user:User) ASSERT user.id IS UNIQUE;
</pre>

If it worked, you should see the indexes as being ONLINE when you type <tt>schema</tt> into the shell. Now we're ready to start adding edges!

<pre>
import-cypher -d"," -i view_nodes.csv -o view_nodes_out2.csv MATCH (u:User {id:{user_id}}), (v:View {id:{event_id}}), (p:Page {id:{page_url}}) CREATE (u)-[:VERB]->(v)-[:OBJECT]->(p)
</pre>

This should connect the users to their view events, and those view events to the page that was viewed. To finish, we just need to add in our *prev* edges:

<pre>
import-cypher -d"," -i event_to_previous.csv -o event_to_previous_out.csv MATCH (new:View {id:{event_id}}), (old:View {id:{previous_event}}) CREATE (new)-[:PREV]->(old)
</pre>

We're done loading our data!

## Visualizing the data

The Neo4J browser console does a great job of visualising the data in the database. We can use it to search for some patterns that we expect to find, using the LIMIT command to avoid being inundated. For example:

<pre>
MATCH (u:User)-[:VERB]->(v:View)-[:OBJECT]-(p:Page)
RETURN u, v, p
LIMIT 10
</pre>

shows us some User-View-Page relationships:

<p style="text-align:center"><a href="/assets/img/blog/2014/07/Neo4j-result-of-import.png"><img src="/assets/img/blog/2014/07/Neo4j-result-of-import.png"></a></p>

And we can check that our *prev* edges are doing what we expect with:

<pre>
MATCH p=(:Page)--(:View)-[:PREV*1..5]->(:View)--(:Page)
RETURN p
LIMIT 10
</pre>

Note that <tt>[:PREV*1..5]</tt> tells Neo4J to follow between 1 and 5 previous edges when walking the graph. This results in:

<p style="text-align:center"><a href="/assets/img/blog/2014/07/Neo4j-result-of-import-2.png"><img src="/assets/img/blog/2014/07/Neo4j-result-of-import-2.png"></a></p>

Now that we've got all of our data into Neo4J, in the [next blog post](/blog/2014/07/31/using-graph-databases-to-perform-pathing-analysis-initial-experimentation-with-neo4j/) we'll finally be able to start writing queries to perform the sorts of analysis that graph databases make possible.

[loadcsv]: http://docs.neo4j.org/chunked/milestone/cypherdoc-importing-csv-files-with-cypher.html?_ga=1.253852481.859413213.1406641226
[shell-tools]: https://github.com/jexp/neo4j-shell-tools
[batch-import]: https://github.com/jexp/batch-import
