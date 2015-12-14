---
layout: post
title: Using graph databases to perform pathing analysis - initial experiments with Neo4J
title-short: Initial experiments with Neo4J
tags: [snowplow, neo4j, graph database, path analysis, cypher]
author: Nick
category: Analytics
---

In the [first post](/blog/2014/07/28/explorations-in-analyzing-web-event-data-in-graph-databases/) in this series, we raised the possibility that graph databases might allow us to analyze event data in new ways, especially where we were interested in understanding the sequences that events occured in. In the [second post](/blog/2014/07/30/loading-snowplow-web-event-data-into-graph-databases-for-pathing-analysis/), we walked through loading Snowplow page view event data into Neo4J in a graph designed to enable pathing analytics. In this post, we're going to see whether the hypothesis we raised in the first post is right: can we perform the type of pathing analysis on Snowplow data that is so difficult and expensive when it's in a SQL database, once it's loaded in a graph?

In this blog post, we're going to answer a set of questions related to the journeys that users have taken through our own (this) website. We'll start by answering some some easy questions to get used to working with Cypher. Note that some of these simpler queries could be easily written in SQL; we're just interested in checking out how Cypher works at this stage. Later on, we'll move on to answering questions that are not feasible using SQL.

The questions we'll answer are as follows:

1. [How many visits were there to our home page?](/blog/2014/07/31/using-graph-databases-to-perform-pathing-analysis-initial-experimentation-with-neo4j/#how-many-visits-were-there-to-our-homepage)
2. [What page were users on before arriving at the about page?](/blog/2014/07/31/using-graph-databases-to-perform-pathing-analysis-initial-experimentation-with-neo4j/#what-page-were-users-on-before-arriving-at-the-about-page)
3. [What journeys do users take from the homepage?](/blog/2014/07/31/using-graph-databases-to-perform-pathing-analysis-initial-experimentation-with-neo4j/#what-journeys-do-users-take-from-the-homepage)
4. [What are the most common journeys that end on a particular page?](/blog/2014/07/31/using-graph-databases-to-perform-pathing-analysis-initial-experimentation-with-neo4j/#what-are-the-most-common-journeys-that-end-on-a-particular-page)
5. [How long does it take users to get from one page to another?](/blog/2014/07/31/using-graph-databases-to-perform-pathing-analysis-initial-experimentation-with-neo4j//#how-long-does-it-take-users-to-get-from-one-page-to-another)
6. [Identifying common user journeys](/blog/2014/07/31/using-graph-databases-to-perform-pathing-analysis-initial-experimentation-with-neo4j/#common-paths)

<p style="text-align:center"><a href="/assets/img/blog/2014/07/Neo4j-structure.png"><img src="/assets/img/blog/2014/07/Neo4j-structure.png"></a></p>

<!--more-->

Remember that the structure we're using has each page view as a unique event node, but that each user and each page will be associated with multiple page views. The diagram above shows two different users viewing the home page. One user has viewed it twice, so has two 'View' nodes, and the other user has only viewed it once, so we only see one 'View' node. Of course, both users may have visited other pages; we're only looking at their views of the home page here.

<h2 id="how-many-visits-were-there-to-our-homepage">1. How many views were there of our home page?</h2>

We start by finding all of the View nodes that lead to the homepage.

In the query below, I've used double dashes as shorthand for an edge so that I don't need to specify the relationship type. I can do that here because we know that all of the edges that go between views and pages are *object* edges.

<pre>
MATCH (view:View)-->(home:Page {id:'snowplowanalytics.com/'})
RETURN home, count(view);
</pre>

This returns a table that simply tells us the number of views of the home page:

<pre>
+--------------------------------------------------------+
| home                                     | count(view) |
+--------------------------------------------------------+
| Node[64293]{id:"snowplowanalytics.com/"} | 31491       |
+--------------------------------------------------------+
</pre>

Now we can look for 'bounces' - visitors who only went to the homepage and then left the site. For this, we start by matching the same patterns, but then limit them with a <tt>WHERE</tt> clause. I haven't specified a direction for the *prev* edge, because I want to find journeys that have no pages either before or after the home page.

<pre>
MATCH (home:Page { id: 'snowplowanalytics.com/' }),
(view:View)-->(home)
WHERE NOT (view)-[:PREV]-()
RETURN home, count(view);
</pre>

<pre>
+--------------------------------------------------------+
| home                                     | count(view) |
+--------------------------------------------------------+
| Node[64293]{id:"snowplowanalytics.com/"} | 8154        |
+--------------------------------------------------------+
</pre>

So, of the 31,491 home page views, 8,154 were bounces.

Now let's consider a more interesting question...

<h2 id="what-page-were-users-on-before-arriving-at-the-about-page">2. What page were users on before arriving at the 'About' page?</h2>

Let's say that we're interested in our 'About' page because this has our contact details. We want to find out *how* users arrive at this page.That means we need tofollow the *prev* edges from the events connected to the 'About' page node, to identify the pages that were viewed prior to the 'About' page.

Again, we start by specifying a pattern that ends in the 'About' page, and then aggregating the results:

<pre>
MATCH (about:Page {id:"snowplowanalytics.com/about/index.html"}),
(about)<-[:OBJECT]-(c_view)-[:PREV]->(prev1)-[:OBJECT]->(p:Page)
RETURN p.id, count(p)
ORDER BY count(p) DESC
LIMIT 10;
</pre>

This time, I've asked Neo4J to order the results in descending order, and limit them to the top 10. It took 183ms to return:

<pre>
+------------------------------------------------------------+
| p.id                                             | count(p)|
+------------------------------------------------------------+
| "snowplowanalytics.com/"                         | 1898    |
| "snowplowanalytics.com/about/index.html"         | 839     |
| "snowplowanalytics.com/technology/index.html"    | 430     |
| "snowplowanalytics.com/product/index.html"       | 344     |
| "snowplowanalytics.com/blog/index.html"          | 334     |
| "snowplowanalytics.com/blog.html"                | 325     |
| "snowplowanalytics.com/about/team.html"          | 293     |
| "snowplowanalytics.com/analytics/index.html"     | 243     |
| "snowplowanalytics.com/services/index.html"      | 221     |
| "snowplowanalytics.com/get-started/index.html" | 146     |
+------------------------------------------------------------+
</pre>

The table above shows us that most of users navigating to the 'About' page arrive at it directly from the homepage.

We can use the browser console to help visualize these patterns. Here's one example: the page on the bottom right is the 'About' page that we're interested in, and in the console, I've clicked on the other page node to find its URL.

<p style="text-align:center"><a href="/assets/img/blog/2014/07/Neo4j-about-to-prev.png"><img src="/assets/img/blog/2014/07/Neo4j-about-to-prev.png"></a></p>

We could easily amend our query to find the page users were on two steps before they got to the contact page by adding an extra *prev* edge into the MATCH clause:

<pre>
MATCH (about:Page {id:"snowplowanalytics.com/about/index.html"}),
(about)<-[:OBJECT]-(c_view)-[:PREV]->(prev1)-[:PREV]->(prev2)-[:OBJECT]->(p:Page)
RETURN p.id, count(p)
ORDER BY count(p) DESC
LIMIT 10;
</pre>

As a shortcut, we can instruct Neo4J to follow two *prev* edges by writing <tt>[:PREV*2]</tt>:

<pre>
MATCH (about:Page {id:"snowplowanalytics.com/about/index.html"}),
(about)<-[:OBJECT]-(c_view)-[:PREV*2]->(prev2)-[:OBJECT]->(p:Page)
RETURN p.id, count(p)
ORDER BY count(p) DESC
LIMIT 10;
</pre>

In either case, we get a result in around 300 ms:

<pre>
+------------------------------------------------------------+
| p.id                                             | count(p)|
+------------------------------------------------------------+
| "snowplowanalytics.com/about/index.html"         | 1017    |
| "snowplowanalytics.com/"                         | 621     |
| "snowplowanalytics.com/technology/index.html"    | 574     |
| "snowplowanalytics.com/analytics/index.html"     | 352     |
| "snowplowanalytics.com/product/index.html"       | 348     |
| "snowplowanalytics.com/services/index.html"      | 296     |
| "snowplowanalytics.com/blog/index.html"          | 89      |
| "snowplowanalytics.com/about/team.html"          | 89      |
| "snowplowanalytics.com/get-started/index.html" | 75      |
| "snowplowanalytics.com/blog.html"                | 68      |
+------------------------------------------------------------+

</pre>

You'll notice that lots of the journeys started on same page they finished on. That's because a lot of parts of journeys seem to consist of refreshes. In another post, we will look at how we can 'clean up' our graph to account for these, but for now, let's just exclude them from our search. We can do this by getting a list of event nodes in a path, and insisting that none of them point to the 'About' page.

<pre>
MATCH (about:Page {id:"snowplowanalytics.com/about/index.html"}),
path = (about)<-[:OBJECT]-(c_view)-[:PREV*2]->(prev2)-[:OBJECT]->(p:Page)
WHERE NONE(
	v IN NODES(path)[2..LENGTH(path)-1]
	WHERE v.page = about.id
)
RETURN p.id, count(p)
ORDER BY count(p) DESC
LIMIT 10;
</pre>

This gives a more reasonable list:

<pre>
+------------------------------------------------------------+
| p.id                                             | count(p)|
+------------------------------------------------------------+
| "snowplowanalytics.com/technology/index.html"    | 556     |
| "snowplowanalytics.com/"                         | 514     |
| "snowplowanalytics.com/about/index.html"         | 491     |
| "snowplowanalytics.com/analytics/index.html"     | 342     |
| "snowplowanalytics.com/product/index.html"       | 328     |
| "snowplowanalytics.com/services/index.html"      | 287     |
| "snowplowanalytics.com/blog/index.html"          | 77      |
| "snowplowanalytics.com/about/team.html"          | 71      |
| "snowplowanalytics.com/get-started/index.html" | 71      |
| "snowplowanalytics.com/blog.html"                | 60      |
+------------------------------------------------------------+

</pre>

The <tt>[:PREV*2]</tt> means we can easily amend the query to find the page users were on, for example, 5 steps before the 'About' page:

<pre>
MATCH (about:Page {id:"snowplowanalytics.com/about/index.html"}),
path=(about)<-[:OBJECT]-(c_view)-[:PREV*5]->(prev2)-[:OBJECT]->(p:Page)
WHERE NONE(
	v IN NODES(path)[2..LENGTH(path)-1]
	WHERE v.page = about.id
)
RETURN p.id, count(p)
ORDER BY count(p) DESC
LIMIT 10;
</pre>

This is the kind of search that would be difficult in SQL because it would involve a full table scan for every step back we want to take from our destination page. Neo4J handles this type of query very comfortably, because executing it is simply of identifying journeys that end on the page and then walking the graphs *just* for those journeys.

The results of the above query are shown below - I've removed the 'snowplowanalytics.com' part of the URL to save space.

<pre>
+----------------------------------------------------------+
| p.id                                          | count(p) |
+----------------------------------------------------------+
| "/product/index.html"                         | 342      |
| "/"                                           | 282      |
| "/services/index.html"                        | 197      |
| "/analytics/index.html"                       | 165      |
| "/technology/index.html"                      | 86       |
| "/about/index.html"                           | 82       |
| "/get-started/index.html"                   | 45       |
| "/product/do-more-with-your-data.html"        | 41       |
| "/analytics/customer-analytics/overview.html" | 38       |
| "/about/team.html"                            | 26       |
+----------------------------------------------------------+
</pre>

Notice that the numbers have reduced significantly. That's because we're looking for paths 5 pages long (or specifically 5 events long) that don't include the 'About' page. It might be that users tend to find that page in fewer than 5 steps, or that, once users find it, they may leave it and quickly come back.

Again, we can visualise a couple of these paths in the browser console, with the 'About' page at the bottom:

<p style="text-align:center"><a href="/assets/img/blog/2014/07/Neo4j-5-step-path.png"><img src="/assets/img/blog/2014/07/Neo4j-5-step-path.png"></a></p>

You can see that the path on the right consists of a lot of refreshes on one page, before the user goes in one step to the 'About' page.

<h2 id="what-journeys-do-users-take-from-the-homepage">3. What journeys do users take from the home page?</h2>

In the last section we identified journeys that lead to a particular page. Now let's take a page as a starting point, and see how journeys progress from that.

For this example, we'll start on our homepage. Let's identify the three steps that a user takes from the homepage, as a sequence (rather than individual steps as we did in the previous example). We'll use the <tt>EXTRACT</tt> command to return just the URL attached to the events in the path, rather than the nodes themselves. That's because we're not looking for user IDs, timestamps, etc, so this will give us some cleaner results.

<pre>
MATCH (home:Page {id: "snowplowanalytics.com/"}),
path = (home)<-[:OBJECT]-(home_view)<-[:PREV*3]-(:View)
RETURN EXTRACT(v in NODES(path)[2..LENGTH(path)+1] | v.page), count(path)
ORDER BY count(path) DESC
LIMIT 10;
</pre>

This took 696 ms to return the 10 most common paths from the homepage.

<pre>
+------------------------------------------------------------+
| ["/product/index.html",                            |       |
|    "/services/index.html","/analytics/index.html"] | 1627  |
| ["/","/","/"]                                      | 1119  |
| ["/product/index.html",                            |       |
|    "/product/do-more-with-your-data.html",         |       |
|    "/analytics/customer-analytics/overview.html"]  | 211   |
| ["/product/index.html",                            |       |
|    "/product/do-more-with-your-data.html",         |       |
|    "/get-started/index.html"]                    | 192   |
| ["/","/product/index.html","/services/index.html"] | 181   |
| ["/services/index.html",                           |       |
|    "/analytics/index.html",                        |       |
|    "/technology/index.html"]                       | 178   |
| ["/product/index.html", "/services/index.html",    |       |
|    "/product/index.html"]                          | 165   |
| ["/product/index.html","/services/index.html",     |       |
|    "/services/reporting.html"]                     | 138   |
| ["/product/index.html","/analytics/index.html",    |       |
|    "/technology/index.html"]                       | 129   |
| ["/product/index.html",                            |       |
|    "/product/do-more-with-your-data.html",         |       |
|    "/services/index.html"]                         | 121   |
+------------------------------------------------------------+
</pre>

Notice that the most common route is to click, from left to right, on each of the titles listed along the top of the Snowplow website. Notice also that the second most common path is just repeatedly refreshing the home page. We could modify the search to exclude these using a WHERE clause as we did in the last example.

<h2 id="what-are-the-most-common-journeys-that-end-on-a-particular-page">4. What are the most common journeys that end on a particular page?</h2>

This time we'll look at paths that lead to the 'About' page. The only changes we need to make from our previous example is to change the target page and reverse the *prev* edges. But just to keep things varied, let's exclude paths that include the 'About' page before the end.

<pre>
MATCH (about:Page {id: "snowplowanalytics.com/about/index.html"}),
path=(about)<-[:OBJECT]-(home_view)-[:PREV*3]->(:View)
WHERE NONE(
	v IN NODES(path)[2..LENGTH(path)+1]
	WHERE v.page = about.id
)
RETURN EXTRACT(v in NODES(path)[2..LENGTH(path)+1] | v.page), count(path)
ORDER BY count(path) DESC
LIMIT 10;
</pre>

This takes only 443 ms to give these results (which are backwards - the first page in the journey is on the right, and the left-most page is the page they were on immediately before arriving at the 'About' page):

<pre>
+------------------------------------------------------------+
| ["/blog.html","/technology/index.html",             |      |
|    "/analytics/index.html"]                         | 155  |
| ["/blog/index.html","/technology/index.html",       |      |
|    "/analytics/index.html"]                         | 133  |
| ["/technology/index.html","/analytics/index.html",  |      |
|    "/services/index.html"]                          | 128  |
| ["/analytics/index.html","/services/index.html",    |      |
|    "/product/index.html"]                           | 46   |
| ["/","/","/"]                                       | 36   |
| ["/services/index.html","/product/index.html","/"]  | 29   |
| ["/product/index.html","/services/index.html",      |      |
|    "/analytics/index.html"]                         | 25   |
| ["/","/product/index.html","/services/index.html"]  | 16   |
| ["/","/product/index.html","/"]                     | 16   |
| ["/get-started/index.html",                       |      |
|    "/product/do-more-with-your-data.html",          |      |
|    "/product/index.html"]                           | 16   |
+------------------------------------------------------------+
</pre>

<h2 id="how-long-does-it-take-users-to-get-from-one-page-to-another">5. How long does it take users to get from one page to another?</h2>

In order to understand how users are using a website, we may want to measure how long it took them to get from a specified page to another specified page, measured in terms of the number of intermediate pages. We can do that in Neo4J by first matching the pages we're interested in as well as the pattern joining them.

Afterwards, we'll want to exclude journeys that have either the start or end page as intermediate steps. There are two good reasons for doing this. Consider a user who arrives at the home page, reads some of the pages in the 'Services' section of the site, and then returns to the home page and goes directly to the blog. According to our matching rules, this user would be counted twice: once from his first visit to the home page, and again for his second visit. It also seems reasonable to rule out the longer journey: after all, maybe they weren't looking for the blog when they first arrived at the home page.

<pre>
MATCH (blog:Page {id:"snowplowanalytics.com/blog/index.html"}),
(home:Page {id:"snowplowanalytics.com/"}),
p = (home)<-[:OBJECT]-()<-[:PREV*..10]-()-[:OBJECT]->(blog)
WHERE NONE(
	v IN NODES(p)[2..LENGTH(p)-1]
	WHERE v.page = blog.id
	OR v.page = home.id
)
RETURN length(p), count(length(p))
ORDER BY length(p)
</pre>

It takes Neo4J around 9 seconds to return this table. Note that the lengths measure the number of *edges* in the path. We don't want to include the two *object* edges, so we should subtract 2 to find the number of 'clicks' between the home page and blog index, or 3 to find the number of intermediate pages.

<pre>
+------------------------------+
| length(p) | count(length(p)) |
+------------------------------+
| 3         | 482              |
| 4         | 183              |
| 5         | 120              |
| 6         | 124              |
| 7         | 233              |
| 8         | 74               |
| 9         | 49               |
| 10        | 46               |
| 11        | 25               |
| 12        | 22               |
+------------------------------+
</pre>

The above graph shows that the most common route to get from the homepage to the blog page is directly, but that it is not uncommon to do this journey in 2,3,4 and 5 steps.

Notice the peak at length = 7 (five clicks) is probably due to the site architecture: 'Blog' is the fifth link along the top of the website.

Again we can visualize some of these journeys in the browser console. Neo4J lets us click on the view nodes to see the page they're associated with, which makes it easy for us to explore those journeys in an interactive way. (We'll need to think of some way to demo this on our site...)

<p style="text-align:center"><a href="/assets/img/blog/2014/07/Neo4j-paths-between-home-and-blog.png"><img src="/assets/img/blog/2014/07/Neo4j-paths-between-home-and-blog.png"></a></p>

<h2 id="common-paths">6. Identifying frequent user journeys</h2>

So far, we've been specifying pages to start or end at. But we can equally ask Neo4J to find us common journeys of a given length from anywhere and to anywhere on the website. This time, we want to check that we don't repeat any pages. For now, we'll only look for journeys of three pages, so we can simply check that the start and end pages aren't repeated in the path.

<pre>
MATCH (start:Page), (end:Page),
path=(start)--(v1:View)<-[:PREV*2]-(v2:View)--(end)
WHERE NONE(
	v IN NODES(path)[2..LENGTH(path)]
	WHERE v.page = start.id
)
AND NONE(
	v IN NODES(path)[1..LENGTH(path)-1]
	WHERE v.page = end.id
)
RETURN EXTRACT(v in NODES(path)[1..LENGTH(path)] | v.page), count(path)
ORDER BY count(path) DESC
LIMIT 10;
</pre>

In 13 seconds, Neo4J returns this list:

<pre>
+------------------------------------------------------------+
| ["/product/index.html","/services/index.html",      |      |
|    "/analytics/index.html"]                         | 2574 |
| ["/","/product/index.html","/services/index.html"]  | 2549 |
| ["/services/index.html","/analytics/index.html",    |      |
|    "/technology/index.html"]                        | 1693 |
| ["/","/product/index.html",                         |      |
|    "/product/do-more-with-your-data.html"]          | 917  |
| ["/","/product/index.html","/analytics/index.html"] | 631  |
| ["/","/product/index.html",                         |      |
|    "/get-started/index.html"]                     | 560  |
| ["/","/about/index.html","/about/team.html"]        | 540  |
| ["/","/services/index.html","/analytics/index.html"]| 527  |
| ["/product/index.html",                             |      |
|    "/product/do-more-with-your-data.html",          |      |
|    "/get-started/index.html"]                     | 511  |
| ["/analytics/index.html","/services/index.html",    |      |
|    "/product/index.html"]                           | 476  |
+------------------------------------------------------------+
</pre>

Again, this shows us how often people arriving on the site click on the headings in order: Product, Services, Analytics, Technology, Blog, About.

To extend this beyond three pages, we'd need to find another way to filter out journeys that visit a page multiple times; if you have any good ideas for how to do this, please let me know in the comments below!

## Summary

In this post, we experimented with using Neo4J to answer increasingly open ended questions about how are users travel through our website. Note that this is very different from the traditional web analytics approach of defining a particular funnel and then seeing *how many* people make it through that funnel: instead, we're exploring how people *actually behave*, in a way that doesn't limit our analysis with our own preconceptions about how people *should behave*.

The results of these early experimentations have been very promising - we've seen how we can use Neo4J to perform very open ended pathing analysis on our granular, event-level Snowplow data - analysis that would be impossible in SQL. We plan to build on these early experimentations, and blog about the results, in the near future!

<hr>

<p class="text-center"><strong>Edit</strong></p>

<p class="text-left">
Nicole White (see comments below) has done an amazing job of answering the problem I described in the last section. She created <a href="http://gist.neo4j.org/?c21486f569df546769a7">a very informative GraphGist</a> that explains how we can use the <tt>UNWIND</tt> function to count the number of distinct pages in a path of View nodes. By comparing the number of distinct pages to the length of the path, we can exclude paths that have loops.
</p>

Doing this with 2 *previous* edges returns the same table as above, but this approach allows us to consider longer paths. For example, we can find the ten most common 5-step user journeys with this query:

<pre>
MATCH p = (:View)<-[:PREV*4]-(:View)
WITH p, EXTRACT(v IN NODES(p) | v.page) AS pages
UNWIND pages AS views
WITH p, COUNT(DISTINCT views) AS distinct_views
WHERE distinct_views = LENGTH(NODES(p))
RETURN EXTRACT(v in NODES(p) | v.page), count(p)
ORDER BY count(p) DESC
LIMIT 10;
</pre>

As we might by now expect, the most common path, followed 780 times, is to arrive on the homepage and click through the top-level links in turn:

<pre>
["/","/product/index.html","/services/index.html",
"/analytics/index.html","/technology/index.html"]
</pre>
