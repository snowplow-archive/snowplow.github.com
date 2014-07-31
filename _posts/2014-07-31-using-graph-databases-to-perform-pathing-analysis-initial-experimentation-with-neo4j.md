---
layout: post
shortenedlink: Performing path analysis with Neo4J
title: Using graph databases to perform pathing analysis - intial experiments with Neo4J
tags: [snowplow, neo4j, graph database, path analysis, cypher]
author: Nick
category: Analytics
---

In the [first post](/blog/2014/07/28/explorations-in-analyzing-web-event-data-in-graph-databases/) in this series, we established that graph databases may allow us to analyze event-based data in new ways. In the [second post](/blog/2014/07/30/loading-snowplow-web-event-data-into-graph-databases-for-pathing-analysis/), we walked through how to get Snowplow page view data into a Neo4J database in a structure that will allow for some new analytics. In this post, we're going to start running some queries to see what insights we can find in the data, and especially insights that we couldn't have found using analysis on SQL data.

Let's start with some easy analysis while we get used to using Cypher. Some of these simpler ideas could be easily queried directly in SQL; we're just interested in checking out how Cypher works for now. Some of the later examples will cover queries that just aren't feasible in SQL.

Remember that the structure we're using has each page view as a unique event node, but that each user and each page will be associated with multiple page views. The diagram below shows two different users visiting the home page. One user has visited twice, so has two 'View' nodes, and the other user has only visited once, so we only see one 'View' node. Of course, both users may have visited other pages; we're only looking at their views of the home page here.

<p style="text-align:center"><a href="/assets/img/blog/2014/07/Neo4j-structure.png"><img src="/assets/img/blog/2014/07/Neo4j-structure.png"></a></p>

1. [How many visits were there to our home page?](/blog/2014/07/31/analyzing-page-view-data-in-neo4j/#how-many-visits-were-there-to-our-homepage)
2. [What page were users on before arriving at the about page?](/blog/2014/07/31/analyzing-page-view-data-in-neo4j/#what-page-were-users-on-before-arriving-at-the-about-page)
3. [What journeys do users take from the homepage?](/blog/2014/07/31/analyzing-page-view-data-in-neo4j/#what-journeys-do-users-take-from-the-homepage)
4. [What are the most common journeys that end on a particular page?](/blog/2014/07/31/analyzing-page-view-data-in-neo4j/#what-are-the-most-common-journeys-that-end-on-a-particular-page)
5. [How long does it take users to get from one page to another](/blog/2014/07/31/analyzing-page-view-data-in-neo4j//#how-long-does-it-take-users-to-get-from-one-page-to-another)
6. [Common triplets](/blog/2014/07/31/analyzing-page-view-data-in-neo4j/#common-triplets)

<!--more-->

<h2 id="how-many-visits-were-there-to-our-homepage">1. How many visits were there to our home page?</h2>

We start by finding all of views that lead to the homepage. 

In the code below, I've used double dashes as shorthand for an edge so that I don't need to specify the relationship type. I can do that here because we know that all of the edges that go between views and pages are *object* edges.

<pre>
MATCH (view:View)-->(home:Page {id:'snowplowanalytics.com/'})
RETURN home, count(view);
</pre>

This returns a table that simply tells us the number of visitors to the home page:

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

Now let's consider a more interesting question, albeit one that could be reasonably answered in SQL.

<h2 id="what-page-were-users-on-before-arriving-at-the-about-page">What page were users on before arriving at the 'About' page?</h2>

(We're interested in our 'About' page because this has our contact details). Now we're specifying the destination, and we want to find the previous page the user was on. That means it's just a case of following an *prev* edge from the events connected to the 'About' page node.

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
| "snowplowanalytics.com/product/get-started.html" | 146     |
+------------------------------------------------------------+
</pre>

We can use the browser console to help visualize these patterns. Here's one example: the page on the bottom right is the 'About' page that we're interested in, and in the console, I've clicked ont the other page node to find its URL.

<p style="text-align:center"><a href="/assets/img/blog/2014/07/Neo4j-about-to-prev.png"><img src="/assets/img/blog/2014/07/Neo4j-about-to-prev.png"></a></p>

We could easily amend it to find the page users were on two steps before they got to the contact page by adding an extra *prev* edge into the MATCH clause:

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
| "snowplowanalytics.com/product/get-started.html" | 75      |
| "snowplowanalytics.com/blog.html"                | 68      |
+------------------------------------------------------------+

</pre>

You'll notice that lots of the journeys started on same page they finished on. That's because a lot of parts of journeys seem to consist of refreshes. In another post, we may look at how we can 'clean up' our graph to account for these, but for now, let's just exclude them from our search. We can do this by getting a list of event nodes in a path, and insisting that none of them point to the 'About' page.

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
| "snowplowanalytics.com/product/get-started.html" | 71      |
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

This is the kind of search that would be difficult in SQL because we'd have to either sort the list or perform a lot of searches, but Neo4J handles it easily, taking 450ms to give us our results. I've removed the 'snowplowanalytics.com' part of the URL to save space.

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
| "/product/get-started.html"                   | 45       |
| "/product/do-more-with-your-data.html"        | 41       |
| "/analytics/customer-analytics/overview.html" | 38       |
| "/about/team.html"                            | 26       |
+----------------------------------------------------------+
</pre>

Notice that the numbers have reduced significantly. That's because we're looking for paths 5 pages long (or specifically 5 events long) that don't include the 'About' page. It might be that users tend to find that page in fewer than 5 steps, or that, once users find it, they may leave it and quickly come back.

Again, we can visualise a couple of these paths in the browser console:

<p style="text-align:center"><a href="/assets/img/blog/2014/07/Neo4j-5-step-path.png"><img src="/assets/img/blog/2014/07/Neo4j-5-step-path.png"></a></p>Y

You can see that one of these paths consists of a lot of refreshes on one page, before going in one step to the 'About' page. This give further reason to 'clean' the data, which we'll investigate another time!

It's worth considering at this point how long it would take to perform an equivalent search in SQL. For each session by each user, we'd have to find all of the page view events, sort them, find the times they've visited the 'About' page, and then count five steps back, checking that the intervening pages don't include the 'About' page.

<h2 id="what-journeys-do-users-take-from-the-homepage">3. What journeys do users take from the home page?</h2>

We might be interested in where users go after arriving at the homepage. Now we'll need to match a pattern of, say, 3 steps from the homepage. We'll use the <tt>EXTRACT</tt> command to return just the URL attached to the events in the path, rather than the nodes themselves. That's because we're not looking for user IDs, timestamps, etc, so this will give us some cleaner results.

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
|    "/product/get-started.html"]                    | 192   |
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
| ["/product/get-started.html",                       |      |
|    "/product/do-more-with-your-data.html",          |      |
|    "/product/index.html"]                           | 16   |
+------------------------------------------------------------+
</pre>

<h2 id="how-long-does-it-take-users-to-get-from-one-page-to-another">5. How long does it take users to get from one page to another?</h2>

In order to understand how users are using a website, we may want to measure how long it took them to get from a specified page to another specified page, measured in terms of the number of intermediate pages. We can do that in Neo4J by first matching the pages we're interested in as well as the pattern joining them. 

Then we want to exclude journeys that have either the start or end page as intermediate steps. There are two good reasons for doing this. Consider a user who arrives at the home page, reads some of the pages in the 'Services' section of the site, and then returns to the home page and goes directly to the blog. According to our matching rules, this user would be counted twice: once from his first visit to the home page, and again for his second visit. And it seems reasonable to rule out the longer journey: after all, it seems that they weren't looking for the blog when they first arrived at the home page.

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

The bump at length = 7 (five clicks) is probably due to the site architecture: 'Blog' is the fifth link along the top of the website.

Again we can visualise some of these journeys in the browser console. Neo4J lets us click on the view nodes to see the page they're associated with.

<p style="text-align:center"><a href="/assets/img/blog/2014/07/Neo4j-paths-between-home-and-blog.png"><img src="/assets/img/blog/2014/07/Neo4j-paths-between-home-and-blog.png"></a></p>

<h2 id="common-triplets">6. Common triplets</h2>

So far, we've been specifying pages to start or end at. But we can equally ask Neo4J to find us common journeys of a given length from anywhere and to anywhere on the website. This time, we want to check that we don't repeat any pages. Since we're only looking for journeys of three pages, we can just check that the start and end pages aren't repeated in the path. 

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
|    "/product/get-started.html"]                     | 560  |
| ["/","/about/index.html","/about/team.html"]        | 540  |
| ["/","/services/index.html","/analytics/index.html"]| 527  |
| ["/product/index.html",                             |      |
|    "/product/do-more-with-your-data.html",          |      |
|    "/product/get-started.html"]                     | 511  |
| ["/analytics/index.html","/services/index.html",    |      |
|    "/product/index.html"]                           | 476  |
+------------------------------------------------------------+
</pre>

Again, this shows us how often people arriving on the site click on the headings in order: Product, Services, Analytics, Technology, Blog, About.

To extend this beyond three pages, we'd need to find another way to filter out journeys that visit a page multiple times; if you have any good ideas for how to do this, please let me know in the comments below! 

Hopefully this post has given some evidence that graph databases can allow for some types of analysis of page view data that would be unrealistic with a SQL database.