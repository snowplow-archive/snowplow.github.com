---
layout: page
group: analytics
sub_group: catalog
title: Measuring content page performance
shortened-link: Content page performance
weight: 3
---

<a name="top"><h1>Measuring content page performance</h1></a>

The recipes below all use the Snowplow page ping event to understand how a user engages with a particular web page over time. The recipes are divided into seven sections. In the first section, we introduce the page ping event: how to set it up and what data is captured with each event. In sections two and three, we use that data to visualize the behavior of a single user, first as he / she navigates through your website, and secondly as he / she navigates through a web page.

In sections 4-7, we use that understanding to perform analysis across users: so that we can compare web pages by how long people read them for and what fraction of them people typically engage with.

The contents is given below:

1. [Understanding page ping events](#page_pings)
2. [Visualizing an individual user journey through your website](#single-user-journey)
3. [Visualizing how a user engages with a particular web page over time](#single-page)
4. [Comparing how long users spend on different web pages](#compare-time-on-page)
5. [Adjusting for the impact of page length](#adjusting-for-page-length)
6. [Measuring what fraction of each web page users view](#fraction)
7. [Content page performance matrix: comparing popularity and engagement levels by page](#matrix)

<a name="page_pings"><h2>1. Understanding page ping events</h2></a>

Snowplow includes a specific event type to help understand how users engage with pages over time: Page Pings. This is a feature of the [Javascript tracker] [js-tracker].

If enabled in the Javascript tracker, page ping events are fired at regular intervals, so long as a user continues to engage with the page. ('Engage' in this context is defined very broadly: if the user does *anything* with the web page e.g. scrolls, mouses over images etc., it counts as engagement. If, on the other hand, a user goes to a different tab on their browser, or a different application, the page pings stop.) With each page ping, several data points are recorded:

* `pp_xoffset_min` and `pp_xoffset_max`: the minimum and maximum page x offset in the last ping period
* `pp_yoffset_min` and `pp_yoffset_max`: the minimum and maximum page y offset in the last ping period

By looking at these values we can analyse how users scroll over a web page over time. By comparing them with the browser window dimensions (`br_viewwidth` and `br_viewheight`) and web page dimensions (`doc_width` and `doc_height`), we can calculate what fraction of the web page the user has viewed.

Page pings are enabled using the [enableActivityTracking] [js-tracker] function in the Javascript tracker. When enabled, you can configure what time period the user needs to engage with the page, from the page load, before the first page ping event occurs, and then over what period a user must continue to engage with the web page before the next page ping is sent. So, for example, if the Javascript function is called as follows:

{% highlight javascript %}
_snaq.push(['enableActivityTracking', 30, 10]);
{% endhighlight %}

The first ping would occur 30 seconds after page load, and subsequent pings will occur every 10 seconds as long as the user continues to engage with the page.

Back to [top](#top).

<a name="single-user-journey"><h2>2. Visualizing an individual user journey through your website</h2></a>

We can pull up a stream of the page view and page ping events for a particular user over time executing a query like this:

{% highlight sql %}
/* PostgreSQL / Redshift */
SELECT
	domain_userid,
	domain_sessionidx,
	collector_tstamp,
	page_urlpath,
	page_title,
	event
FROM "atomic".events
WHERE domain_userid = '594b77eb9d30435b'
AND (event = 'page_ping' OR event = 'page_view')
ORDER BY 1,2;
{% endhighlight %}

We can visualize the above user journey in Tableau:

* Connect Tableau to your Redshift / Infobright instance, but instead of connecting to your Snowplow events table directly, execute the above custom SQL

<p style="text-align: center"><img src="/assets/img/analytics/catalog-analytics/content-page-performance/tableau-custom-sql.JPG" width="250" /></p>

* Drag the `tstamp` dimension into the columns shelf and set it to show 'seconds'. (Rather than the default 'years')
* Drag the `page_urlpath` dimension to the rows shelf. You should now see a Gantt-style view of the user journey through the different web pages
* To make the visualization clearer, list the `page_urlpath` in the order in which this user visited them. To do that, click on the `page_urlpath` in the rows shelf, select 'sort' from the dropdown, and select 'Sort by... Field'. In the field dropdown, select `tstamp` and in the aggregation dropdown, select `Minimum`. (So the pages are organised by when the user first touched them.) Click 'Apply'
* To make the visualization easier to read, drag `page_urlpath` from the dimensions pane to the 'Color' mark. You should now see a visualization like the one shown below: (Click to zoom in.)

<a href="/assets/img/analytics/catalog-analytics/content-page-performance/customer-journey-1.jpg"><img src="/assets/img/analytics/catalog-analytics/content-page-performance/customer-journey-1.jpg" /></a>

A number of things become apparent very quickly:

1. This user was browsing the Snowplow website on-and-off for a pretty long period, that lasted between 3pm and 7pm, on April 14th
2. Although the user arrived on the `/technology/index.html` page, he / she actually spent the bulk of their time viewing the blog
3. The blog posts that they particularly engaged with were 'From ETL to Enrichment', 'Snowplow in a Universal Analytics world'
4. Although the user spent a most of his / her time on the blog, he / she did engage with content on the rest of the site. In particular, he / she viewed all four pages in the 'services' section, and spent the most time between them on the 'custom-development' page. Maybe this is a user we should target with advertising for our professional services offering?

Back to [top](#top).

<a name="single-page"><h2>3. Visualizing how a user engages with a particular web page over time</h2></a>

We can use Snowplow data not just to visualize a user's interaction with the different pages on a website, but also zoom in on his / her interaction with a particular web page.

In the above example, we saw that this particular user spent some time on the 'From ETL to Enrichment' blog post. We can execute the following query to understand how he / she scrolled over that web page during that time period:

{% highlight sql %}
/* PostgreSQL / Redshift */
SELECT 
	collector_tstamp,
	page_urlpath,
	event,
	pp_xoffset_min,
	pp_xoffset_max,
	pp_yoffset_min,
	pp_yoffset_max,
	br_viewwidth,
	br_viewheight,
	doc_width,
	doc_height
FROM "atomic".events
WHERE domain_userid = '594b77eb9d30435b'
AND page_urlpath LIKE '%etl-to-enrichment%';
{% endhighlight %}

We can load that data into Tableau:

<a href="/assets/img/analytics/catalog-analytics/content-page-performance/interaction-one-user-one-page-data.jpg"><img src="/assets/img/analytics/catalog-analytics/content-page-performance/interaction-one-user-one-page-data.jpg" /></a>

From the above data we can see that:

* Over the course of the c.6 minutes the user is on the page, he / she scrolls all the way from the top to the bottom. We tell that they scrolled to the very bottom of the page, because the maximum value for the y-offset (`pp_yoffset_max`) + the browser view-height (`br_viewheight`) = the document height (`doc_height`)
* The user does not scroll left or right at all. (`pp_xoffset_min` and `pp_xoffset_max` are 0 for every page ping.) This is not surprising, as the document width is 1,509 pixels, and the browser view width is 1,509 pixels. (So the complete web page width is visible in the browser.)

We can visualize how the user scrolls down the page over time in Tableau, by plotting either the `pp_yoffset_min` or `pp_yoffset_max` against time in seconds. (To do this, simply drag `tstamp` to the columns shelf, drag `ppy_offset_min` or `pp_yoffset_max` to the rows shelf, and select the line graph.) A plot like the following appears:

<a href="/assets/img/analytics/catalog-analytics/content-page-performance/tableau-visualization-2.JPG"><img src="/assets/img/analytics/catalog-analytics/content-page-performance/tableau-visualization-2.JPG"></a>

The most striking thing about the above graph is that the user appears to read the top of the page in fair detail (spending a good 30 seconds there) before scrolling down almost 4000 pixels in a single (10 second) ping period. That becomes less surprising if we look at the actual blog post itself. (We've added the pixel dimensions to the image of the post below.)

<p style="text-align: center"><a href="/assets/img/analytics/catalog-analytics/content-page-performance/from-etl-to-enrichment-page-with-measurements.JPG"><img src="/assets/img/analytics/catalog-analytics/content-page-performance/from-etl-to-enrichment-page-with-measurements.JPG"></a></p>

It appears that the user quickly scrolled over the flow chart that extends from c.600 pixels down the post to c.3200 pixels down the post, and is scrolling through on either side much more slowly (and we hope, carefully), than the image itself.

Back to [top](#top).

<a name="compare-time-on-page"><h2>4. Comparing how long users spend on different web pages</h2></a>

In the previous three sections, we looked in detail at the page ping event, and how to use data generated by page ping events to map a user's interaction with a website adn a particular webpage over time.

Now that we understand how the data is generated and what it means for an individual visitor, we are in a position to aggregate across visitors to measure and compare the performance of different content pages on a website.

As should be clear, the number of page pings for each web page on a site is proportional to the amount of time that users spend on that page: so we can use it as a proxy. A straightforward way, then, of measuring the performance of different content pages, is to calculate the average page pings per visitor on that page. 

We can calculate the number of visitors to a page by counting the number of distinct user IDs:

{% highlight sql %}
/* PostgreSQL / Redshift */
SELECT 
	page_urlpath,
	COUNT(DISTINCT (domain_userid)) AS uniques
FROM "atomic".events
WHERE page_urlhost = 'snowplowanalytics.com'
GROUP BY 1
ORDER BY 2 DESC;
{% endhighlight %}

We can sum the number of page pings per page:

{% highlight sql %}
SELECT
	page_urlpath,
	COUNT(DISTINCT(event_id)) AS number_of_pings
FROM "atomic".events
WHERE page_urlhost = 'snowplowanalytics.com'
AND event = 'page_ping'
GROUP BY 1
ORDER BY 2 DESC;
{% endhighlight %}

We can join the two above queries into a single data set, and divide the number of page pings by the number of uniques to calculate the average pings per visitor for each page with the following query:

{% highlight sql %}
SELECT
	u.page_urlpath,
	u.uniques,
	p.number_of_pings,
	p.number_of_pings / u.uniques AS average_pings_per_unique_per_page
FROM (
	SELECT 
		page_urlpath,
		COUNT(DISTINCT (domain_userid)) AS uniques
	FROM "atomic".events
	WHERE page_urlhost = 'snowplowanalytics.com'
	GROUP BY 1
) u
LEFT JOIN (
	SELECT
		page_urlpath,
		COUNT(DISTINCT(event_id)) AS number_of_pings
	FROM "atomic".events
	WHERE page_urlhost = 'snowplowanalytics.com'
	AND event = 'page_ping'
	GROUP BY 1
) p
on u.page_urlpath = p.page_urlpath
ORDER BY u.uniques DESC;
{% endhighlight %}

Let's pull that data into Tableau and plot average pings per page for each page:

<a href="/assets/img/analytics/catalog-analytics/content-page-performance/average-pings-per-page.jpg"><img src="/assets/img/analytics/catalog-analytics/content-page-performance/average-pings-per-page.jpg"></a>

The data shows that there is wide variation in the average time that users dwell on each web page. It is heartening to see that our blog post on [writing UDFs and Serdes for Hive] [hive-udf] drove high levels of engagement (13.3 page pings ~ 2 minutes of viewing), as did our recent set of analytics recipes covering [measuring and comparing product page performance] [product-page-performance].

At the bottom of the list we can identify pages that attracted **no** page pings - this means that none of the users who visited these pages stayed on them long enough for the first page ping event to fire. (In our case, that means 10 seconds.) Pages in this category include a number of blog posts on Snowplow releases ([0.8.0 release with Scalding ETL] [0.8.0], the [Infobright Ruby loader release] [infobright-ruby-loader] and the [updated Hive Serde] [updated-hive-serde].) We should not be too surprised: short posts announcing releases are going to be consumed much quicker than longer, tutorial style posts and analytics recipes. 

This touches on an important point: not all pages are designed to perform the same function and when we are applying an analysis like this, we should only be comparing pages that *are* designed to perform the same function, specifically driving engagement. Let's refine the above analysis by including *only* results for blog posts. We can do this by dragging the `page_urlpath` dimension into the filters pane, select 'wildcard' from the tab menu and instruct Tableau to include only `page_urlpath` that start with '/blog/':

<p style="text-align: center"><a href="/assets/img/analytics/catalog-analytics/content-page-performance/filter-only-blog-pages.JPG"><img src="/assets/img/analytics/catalog-analytics/content-page-performance/filter-only-blog-pages.JPG" width="250"></a></p>

We can now compare how long users spent on different blog pages:

<a href="/assets/img/analytics/catalog-analytics/content-page-performance/average-pings-per-page-blog-only.jpg"><img src="/assets/img/analytics/catalog-analytics/content-page-performance/average-pings-per-page-blog-only.jpg"></a>

Back to [top](#top).

<a name="adjusting-for-page-length"><h2>5. Adjusting for the impact of page height</h2></a>

We may want to compare the page height with the average amount of time spent on a page: after all, we should not expect that someone would spend as long on a page with a little content as a page with a lot.

To do this with our data set, we simply add the `doc_height` field to our previous query:

{% highlight sql %}
SELECT
	u.page_urlpath,
	u.uniques,
	p.number_of_pings,
	p.number_of_pings / u.uniques AS average_pings_per_unique_per_page,
	u.doc_height
FROM (
	SELECT 
		page_urlpath,
		COUNT(DISTINCT (domain_userid)) AS uniques,
		MAX(doc_height) AS doc_height
	FROM "atomic".events
	WHERE page_urlhost = 'snowplowanalytics.com'
	GROUP BY 1
) u
LEFT JOIN (
	SELECT
		page_urlpath,
		COUNT(DISTINCT(event_id)) AS number_of_pings
	FROM "atomic".events
	WHERE page_urlhost = 'snowplowanalytics.com'
	AND event = 'page_ping'
	GROUP BY 1
) p
on u.page_urlpath = p.page_urlpath
ORDER BY u.uniques DESC;
{% endhighlight %}

To visualize the data, we're going to create a scatter plot, where each point represents a web page, and the position of the page is plotted as a function of page length (on one axis) and page engagement (average number of pings, on the other axis). 

To do this, load the above data into Tableau. Drag the `page_urlpath` to the rows shelf, and the `doc_height` and `average_pings_per_unique_per_page` to the measures pane. Click on the scatter plot - you should see something like the following plot. Each circle on the plot represents one page on our website. The height of the circle represents the average number of pings per user for that page - so how long users spend on it. The distance of each point to the right represents the height of the document - so larger webpages are further to the right. (We've also dragged the `unqiues` metric to the 'size' pane, so that the size of each circle represents the number of unique visitors to that page.)

<a href="/assets/img/analytics/catalog-analytics/content-page-performance/average-pings-vs-doc-height.jpg"><img src="/assets/img/analytics/catalog-analytics/content-page-performance/average-pings-vs-doc-height.jpg"></a>

The graph suggests that on the Snowplow website, at least, there **is** a relationship between document height and average pings per page. (We could measure the strength of the relationship formally, by calculating the correlation coefficient.) However, there are a number of outliers: we can identify pages on the website that only attract low levels of engagement relative to their length (e.g. our v0.7.4 release post), and pages that drive significant levels of engagement relative to their length (e.g. the 0.4.6 release post, or the 'analysing data with Snowplow' page.)

Back to [top](#top).

<a name="fraction"><h2>6. Measuring what fraction of each web page users view</h2></a>

One question we may have regarding long web pages is: what percentage of uses make it to the bottom of the page?

Snowplow makes this straightforward to calculate. We can see how far down a user has scrolled in each page ping by adding together the maximum Y offset with the browser view height i.e.:

{% highlight sql %}
pp_yoffset_max + br_viewheight
{% endhighlight %}

and then take that as a percentage of the total web page height:

{% highlight sql %}
(pp_yoffset_max + br_viewheight) / doc_height AS fraction_read
{% endhighlight %}

We can then calculate the maximum value for each user for each web page:

{% highlight sql %}
SELECT
	domain_userid,
	page_urlpath,
	MAX( (pp_yoffset_max + br_viewheight) / doc_height::REAL ) AS fraction_read
FROM "atomic".events
WHERE page_urlhost = 'snowplowanalytics.com'
AND event='page_ping'
GROUP BY domain_userid, page_urlpath;
{% endhighlight %}

Feeding the data into Tableau, we can plot the average fraction of each web page viewed (where average is calculated across all users who visited that page), by simply dragging the `page_urlpath` dimension to the rows shelf, dragging the `fraction_read` metric into the table and changing the aggregation function Tableau performs on the metric from `SUM` to `AVERAGE`. In the below graph, we've also filtered the results so that only `page_urlpaths` for pages belonging to the analytics section of our website our displayed:

<a href="/assets/img/analytics/catalog-analytics/content-page-performance/fraction-of-web-page-read.jpg"><img src="/assets/img/analytics/catalog-analytics/content-page-performance/fraction-of-web-page-read.jpg" /></a>

It appears that half our recipe web pages are read to the end by nearly everyone. A number, however, are not. (We're losing people before they get to the end of the [basic recipes] [basic-recipes] or [measuring user engagement] [measuring-user-engagement] pages.)

As well as comparing the average fraction of a web page read across all users for each page, we can compare the distribution for each page. (For example, we might find that our users naturally segment into two groups: those that bounce and those that make it to the bottom of the page. Or we might find out that there is a spread of users who make it down different lengths of the page. These two situations might result in the same average, but actually tell us something totally different about the ways different user segments engage with this page.) 
We can plot the distributionwith the same cut of data in Tableau, but this time filter the results so we only look at those for a particular page. (In our example, the [writing udfs and Serdes for Hive] [hive-udf] blog post.)

* To filter the results for a particular web page, drag the `page_urlpath` dimension to the filters pane and setup your filter appropriately.
* Now we need to bucket users by what fraction of the this web page they visited. To do that, right click on the `fraction_read` metric and click 'create bins'. Set the size of the bins to 0.05. (So we have 20 spanning from 0 to 1.)
* Drag that newly created dimension (`fraction_read (bin)`) to the rows shelf
* Drag the `Number of records` metric into the table: we want to know how many people in each bin, and each record represents one user
* As an extra, we've added a quick table calculation to our metric (`SUM(Number of Records)`) so that instead of showing us the actual number of users in each bin, it shows us what percentage of all the users who visited this page are in each bin:

<a href="/assets/img/analytics/catalog-analytics/content-page-performance/distribution-of-readers-by-fraction-of-hive-udf-post-read.jpg"><img src="/assets/img/analytics/catalog-analytics/content-page-performance/distribution-of-readers-by-fraction-of-hive-udf-post-read.jpg" /></a>

Under a quarter of users have made it to the end of this post. 70% of visitors make it through 80% of the post. That is a good result: it suggests that most users who are on this page are interested (so should be on it), and make it through most of the way. However, if there's a key piece of information that's only available in the very last section, a large number of those visitors will have missed it.

Back to [top](#top).

<a name="matrix"><h2>7. Content page performance matrix: comparing popularity and engagement levels by page</h2></a>

One of the recipes we presented in the [measuring product page performance] [product-page-performance-2] section of the cookbook was to create an actionable scatter plot, that showed each product by the number of people who viewed it and the number that added it to their basket. This made it easy to identify products that should be marketed more aggressively (because they are highly converting, but not many people see them) and product page that need to be updated (because they are highly trafficked, but poor converters).

We can produce an analagous matrix for content pages, by plotting each based on the number of visitors (one axis) vs engagement level (average page pings per page) on the other axis:

<a href="/assets/img/analytics/catalog-analytics/content-page-performance/content-page-matrix.jpg"><img src="/assets/img/analytics/catalog-analytics/content-page-performance/content-page-matrix.jpg"></a>

For the Snowplow website, the plot is not so revealing. For a newspaper site, however, the results might be much more so: pages appearing in the top left section of the scatter are stories with high levels of engagement and low levels of traffic. It makes sense to drive more traffic to these pages e.g. via a "recommended now" section, or via directed marketing spend, for example. 

Pages on the bottom right of the plot are highly trafficked but have low rates of engagement: these are topics that interest the newspaper readership, but ones where the current content doesn't meet that need, so perhaps extra resources should be committed to delivering that content?

Back to [top](#top).



[js-tracker]: https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#wiki-pagepings
[hive-udf]: /blog/2013/02/08/writing-hive-udfs-and-serdes/
[product-page-performance]: /analytics/catalog-analytics/measuring-and-comparing-product-page-performance.html
[product-page-performance-2]: /analytics/catalog-analytics/measuring-and-comparing-product-page-performance.html#visualising
[updated-hive-serde]:/blog/2012/08/14/updated-hive-serde-released/
[infobright-ruby-loader]: /blog/2012/10/21/infobright-ruby-loader-released/
[0.8.0]: /blog/2013/04/03/snowplow-0.8.0-released-with-all-new-scalding-based-data-enrichment/
[basic-recipes]: /analytics/basic-recipes.html
[measuring-user-engagement]: /analytics/customer-analytics/user-engagement.html