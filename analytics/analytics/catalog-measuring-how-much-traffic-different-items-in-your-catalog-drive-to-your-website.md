---
layout: page
group: analytics
sub_group: catalog
title: Measure how much traffic different items on your catalog drive to your website
shortened-link: How well do different pages attract traffic to your website?
weight: 5
redirect_from:
  - /analytics/catalog-analytics/measuring-how-much-traffic-different-items-in-your-catalog-drive-to-your-website.html
---

<div class="html">
<a name="top"><h1>Measure how much traffic different items in your catalog drive to your website. (How much do individual items contribute to your inbound marketing?)</h1></a>
</div>

In our [earlier recipe] [product-page-performance] for [measuring product page performance] [product-page-performance], we measured how good individual product pages on a retailer's site was by how effectively each page drove users to add products to their basket. The assumption underlying this measurement technique is that the primary purpose of a product page on a retailer site is to drive purchases of the product.

In our [earlier recipe] [content-page-performance] for [measuring content page performance] [content-page-performance], we measured how good individual content pages on a media site are by how long users engage with them, and what fraction of the page users view. The assumption underlying this measurement technique is that the primary purpose of a content page is to drive engagement.

In fact, items in your catalog, be they products on a retailers website, articles on a newspaper site, or videos on a media site, are not there solely for the purposes of driving purchases or increasing site engagement. There are a number of functions that each item might perform - to give just two examples:

1. Items in your catalog drive visitors to your site. Having a large and deep catalog improves your website's search rankings across a wider range of keywords, because you have more content, more pages, and more internal links. Having more items also increases the likelihood of people linking into your content, further boosting search ranking. It means you have more landing pages to push traffic to with paid campaigns, providing you with more advertising opportunities. Adding items to your catalog is a form of [inbound marketing] [inbound-marketing]: it serves to *pull* visitors to your site. (Vs more traditional *outbound marketing*, where you *push* visitors to your website e.g. by running paid advertising campaigns.)
2. Items in your catalog can growing average basket value. An item on a retailer site might not pull in much traffic itself, perhaps because there are not many people on the internet deliberately seeking out that product. However it might make a compelling upsell for customers who've come to your website to buy a different item on your catalog: maybe it's a low cost but high margin product like spectacle cleaning fluid, or paper clips.

In this post, we'll run through how to measure how effectively different items on your catalog drive traffic to your website. We'll run our analyses against one examples site: [psychicbazaar.com] [pbz-website], to show how this technique can be used in practice. Although our examples are from a retailer site, the same technique can also be applied to media / content sites.

We'll use [Tableau] [tableau] to perform the analysis. However, the methodology is generic: the same analysis can be performed using other tools (e.g. [R] [r] or [Microsoft PowerPivot] [powerpivot]). 

The analysis depends on being able to extract a specific cut of web analytics data. (More on this in the [next section](#
methodology).) Snowplow makes it easy to extract the required cut of data. We have not checked whether it is possible to pull this cut of data from other web analytics platforms (e.g. [Google Analytics] [ga]), and if so, how to do so. If it is possible, however, the analysis described below should be possible for users who do not have Snowplow. 

## Contents

The recipe is divided into the following sections:

1. [Methodology](#
methodology)
2. [Performing the analysis: measuring how good each item is at driving visits to our website](#
data)
3. [Drilling into our data: understanding *how* our top performing products are generating traffic](#
drill)
4. [Drilling in further: is paid or organic search driving the bulk of product-focused traffic?](#
drillfurther)
5. [What other channels are driving traffic to our best performing items?](#
otherchannels)
6. [Plotting traffic driven by item, by item, over time](#plotovertime)
7. [Recap: pulling it all together](#
recap)

Back to [top](#top).

<div class="html">
<a name="methodology"><h2>1. Methodology</h2></a>
</div>

The methodology for performing this analysis is straightforward: 

* Identify each item in our catalog.
* For each item, identify the "item page". (This is the product page in the case of an online retailer, or the article page in the case of e.g. a news site.)
* Measure the number of visits / visitors to our website where the item page is the landing page. (I.e. the first page in the session.) In each of these cases, we can assume that the visitor came to our site in order to view this item.
* By comparing the number of visits driven by different items, we can see which are good at driving traffic and which are not.
* We can then look at the referers driving that traffic, to see how the item is driving traffic
* Lastly, we look at how each item drives traffic over time, to contrast items which drive strong traffic levels over a short period (e.g. current affairs blog posts) with seasonal items (e.g. winter coats) and evergreen items (e.g. technical tutorials)

Back to [top](#top).

<div class="html">
<a name="data"><h2>2. Performing the analysis: measuring how good each item is at driving visits to our website</h2></a>
</div>

The structure of Snowplow data makes doing the above analysis very straightforward. We can identify page views using the `event` field ("event" = 'page_view'). We can identify whether a page view is a landing page by the referer: specifically, the `refr_medium` field. This can take any one of six values:

* "search" if the referer is a recognised search engine
* "social" if the referer is a recognised social network
* "email" if the referer is a recognised email client
* "internal" if the referer is our website
* "unknown" if snowplow does not specifically recognise the referer
* NULL if the referer header is blank (e.g. if the visitor typed the URL directly into their browser)

For any page view that happens in session (so it **not** a landing page), the referer will be an internal page. If `refr_medium` set to any of the *other* options in the list above, the page view was a landing page. As a result, to fetch all rows of data which represent page views for landing pages, we simply execute the following query:

{% highlight psql %}
/* PostgreSQL / Redshift */
SELECT
	page_urlpath AS "Item page",
	COUNT(DISTINCT(domain_userid)) AS "Uniques driven to site",
	COUNT(DISTINCT(domain_userid || '-' || domain_sessionidx)) AS "Visits driven to site",
	COUNT(*) AS "Landing page views"
FROM
	"atomic"."events"
WHERE "event" = 'page_view'
AND   "refr_medium" != 'internal'
GROUP BY 1;
{% endhighlight %}

Note that we group our results by page, so we get a single line for each page. The sum of all the records for each page is the number of page views, where that page is a landing page. We also calculate the number of visits and uniques, by counting the number of distinct users and sessions.

To start with, lets perform the analysis on [Psychic Bazaar] [pbz-website]. We want to execute the above query, but **only** return lines for pages which are product page. (So ignore entries for e.g. the home page or category pages.) We can do this by filtering results based on URL:

{% highlight psql %}
/* PostgreSQL / Redshift */
SELECT
	page_urlpath AS "Item page",
	COUNT(DISTINCT(domain_userid)) AS "Uniques driven to site",
	COUNT(DISTINCT(domain_userid + '-' + domain_sessionidx)) AS "Visits driven to site",
	COUNT(*) AS "Landing page views"
FROM
	"atomic"."events"
WHERE "event" = 'page_view'
AND   "refr_medium" != 'internal'
AND (  (page_urlpath LIKE '/tarot-cards/%') 
	OR (page_urlpath LIKE '/oracles/%') 
	OR (page_urlpath LIKE '/pendula/%')
	OR (page_urlpath LIKE '/jewellery/%') )
GROUP BY 1
ORDER BY 4 DESC;
{% endhighlight %}

<div class="html">
<a href="/assets/img/analytics/catalog-analytics/driving-traffic/1.png"><img src="/assets/img/analytics/catalog-analytics/driving-traffic/1.png" /></a>
</div>

We can plot the results in Tableau: create a new data connection from Tableau to Redshift using the above query. (For detailed instructions on how to pull specific cuts of Snowplow data from Redshift into Tableau, refer to the [guide to setting up Tableau to work with Snowplow / Redshift guide] [tableau-redshift-setup]). Simply drag the "Item page" dimension to the rows shelf and one of the measures into the worksheet. In the example below we've listed "visits driven to the site" by page view:

<div class="html">
<a href="/assets/img/analytics/catalog-analytics/driving-traffic/1.JPG"><img src="/assets/img/analytics/catalog-analytics/driving-traffic/1.JPG" /></a>
</div>

Now we can plot a histogram by clicking on the histogram image on the "Show Me" toolbar. To tidy up the histogram, we've replaced the "Item page" dimension with a calculated field "Item Name" in Tableau which removes the leading "/<<CATEGORY NAME>>" and trailing ".html" from the "Item page" field (which was the item URL), using the following formula:

{% highlight rout %}
REPLACE(
	REPLACE(
		REPLACE(
		    REPLACE(
		        REPLACE( [item page], "/oracles/", "" )
		    , "/tarot-cards/", "")
		,"/pendula/", "")
	,"/jewellery/", "")
, ".html", "")
{% endhighlight %}

We've also added a calculated field called "Product category" that infers the product category from the item page URL using the following formula:

{% highlight rout %}
IF(CONTAINS([item page], "/tarot-cards/")) THEN "Tarot"
ELSEIF (CONTAINS([item page], "/oracles/")) THEN "Oracle"
ELSEIF (CONTAINS([item page], "/jewellery/")) THEN "Jewellery"
ELSEIF (CONTAINS([item page], "/pendula/")) THEN "Pendulum"
ELSE "Not classified" END
{% endhighlight %}

We then added the "Product category" field to the color dimension. Our graph looks as follows:

<div class="html">
<a href="/assets/img/analytics/catalog-analytics/driving-traffic/2.jpg"><img src="/assets/img/analytics/catalog-analytics/driving-traffic/2-truncated.jpg" /></a>
</div>

*Note: the above graph is truncated - click on it to view the full result set*

Two things become immediate apparent from the above graph:

* There is wide variation in how much traffic different product pages drive to our website: some items in our catalog drive much more inbound marketing than others. "Gypsy fortune telling cards" and "Art deco fortune telling cards" have both driven more than 100 visits in the time period we're examining. By contrast, there are 22 items that have only driven one or two visits to the site. Also note that our SQL query will not return product pages which have driven no traffic to the site. Psychic Bazaar offers c.300 SKUs, and our result set contains  292 products, so there are an additional 8 products that generated no traffic at all.
* In spite of the wide variation, there are no real step changes in the traffic by product page: across the SKUs there is a pretty even distribution. (We have plotted this explicitly below.)

<div class="html">
<a href="/assets/img/analytics/catalog-analytics/driving-traffic/3.JPG"><img src="/assets/img/analytics/catalog-analytics/driving-traffic/3.JPG" /></a>
</div>

Two important things that the graphs do not tell us:

1. On which channels the traffic was generated? 
2. How evenly over time the traffic was generated?

We will drill into the data to answer these two questions in the [next two sections](#
drill).

Back to [top](#top).

<div class="html">
<a name="drill"><h2>3. Drilling into our data: understanding *how* our top performing products are generating traffic</h2></a>
</div>

We can examine *how* our top performing products (for inbound marketing) drive traffic to our site by going back to our Snowplow data in Redshift, and executing the following query: 

{% highlight psql %}
/* PostgreSQL / Redshift */
SELECT
	collector_tstamp,
	domain_userid,
	domain_sessionidx,
	page_urlpath,
	refr_medium,
	refr_source,
	refr_term,
	refr_urlhost,
	refr_urlpath,
	mkt_medium,
	mkt_source,
	mkt_term,
	mkt_campaign
FROM
	"atomic"."events"
WHERE "event" = 'page_view'
AND   "refr_medium" != 'internal'
AND (  (page_urlpath LIKE '/tarot-cards/%') 
	OR (page_urlpath LIKE '/oracles/%') 
	OR (page_urlpath LIKE '/pendula/%')
	OR (page_urlpath LIKE '/jewellery/%') )
{% endhighlight %}

Note that this query pulls many more fields into Snowplow than the previous query: crucially it pulls the `collector_tstamp` (so we can look at traffic over time) and the marketing and referer fields (so we can see on which channel each product drove traffic). 

Because we're pulling more fields from Snowplow, we are not going to aggregate our data by product as we did before in the SQL - instead, we'll do the aggregation in Tableau. (This will give us more flexibility to slice and dice the dimensions against one another in Tableau.) 

<div class="html">
<a href="/assets/img/analytics/catalog-analytics/driving-traffic/2.png"><img src="/assets/img/analytics/catalog-analytics/driving-traffic/2.png" /></a>
</div>

To pull our new cut of data into Tableau, click on the "Data" menu and select "Connect to data". Create a new connection to Redshift, but this time enter the new query in the Custom SQL pane. Our new data source is listed alongside our first source, in the "Data" pane in Tableau.

<div class="html">
<a href="/assets/img/analytics/catalog-analytics/driving-traffic/4.JPG"><img src="/assets/img/analytics/catalog-analytics/driving-traffic/4.JPG" /></a>
</div>

Because we're aggregating our data in Tableau rather than SQL, we need to create our metrics (uniques, visits and page views) in Tableau. To create a new calculated field for "uniques", right click on the measures pane, select "Create calculated field", give your new field the name "uniques" and enter the following calculation:

{% highlight rout %}
COUNTD([domain_userid])
{% endhighlight %}

This counts the number of distinct `domain_userid`: it is the same way we previously calculated the number of uniques in the SQL. 

Create a visits metric in the same way, but this time enter the following formula:

{% highlight rout %}
COUNTD([domain_userid + STR(domain_sessionidx)])
{% endhighlight %}

Lastly, we need to create a metric for "page views". Remember: each line of our data represents a single page view, so we can simply rename the "Number of records" field to "Page views". Our measures pane now looks as follows:

<div class="html">
<a href="/assets/img/analytics/catalog-analytics/driving-traffic/5.JPG"><img src="/assets/img/analytics/catalog-analytics/driving-traffic/5.JPG" /></a>
</div>

Now we can plot the number of visits driven by each type of product, and break that down by referer type. To start off, let's plot the number of visits by product, as before, but this time, drag "refr_medium" into the color shelf, so that we breakdown visits by the referer type:

<div class="html">
<a href="/assets/img/analytics/catalog-analytics/driving-traffic/6.JPG"><img src="/assets/img/analytics/catalog-analytics/driving-traffic/6.JPG" /></a>
</div>

Note that to keep the plot tidy, we've replaced the `page_url` field with an `Item name` field that is calculated based on the `page_url` field using the same formula as we did for our previous cut of data:

{% highlight rout %}
REPLACE(
	REPLACE(
		REPLACE(
		    REPLACE(
		        REPLACE( [page_urlpath], "/oracles/", "" )
		    , "/tarot-cards/", "")
		,"/pendula/", "")
	,"/jewellery/", "")
, ".html", "")
{% endhighlight %}

The visualization tells us three things:

1. For our top performing pages by amount of traffic generated, search appears to be the primary channel on which that traffic is acquired. It would be interesting to know whether this is orgnaic search traffic, or the result of SEM against specific keywords. We will drill into this [next](#
drillfurther).
2. For a significant minority of those visits, there is no referer information. (I.e. `refr_medium` is blank.)
3. For some of our top performers (e.g. the Gipsy Fortune telling cards and the Goddesses and Sirens) there is a signifcant set of visits for whom `refr_medium` is unknown. We can drill into [later](#
otherchannels).

Back to [top](#top).

<div class="html">
<a name="drillfurther"><h2>4. Drilling in further: is paid or organic search driving the bulk of product-focused traffic?</h2></a>
</div>

To answer the above question, we're going to do a plot just for our top performers. Create a new sheet, drag the "Item name" to the rows pane, drag visits to the field pane and sort the items by visits (descending). Now select the top 10 results, right click and select "Keep only".

<div class="html">
<a href="/assets/img/analytics/catalog-analytics/driving-traffic/7.JPG"><img src="/assets/img/analytics/catalog-analytics/driving-traffic/7.JPG" /></a>
</div>

Now drag `refr_medium` and `mkt_medium` to the columns pane. We can now distinguish natural search traffic (where `refr_medium` = 'search' and `mkt_medium` IS NULL) with organic search traffic (where `refr_medium` = 'search' and `mkt_medium` = 'cpc'):

<div class="html">
<a href="/assets/img/analytics/catalog-analytics/driving-traffic/8.JPG"><img src="/assets/img/analytics/catalog-analytics/driving-traffic/8.JPG" /></a>
</div>

We can now see that the picture is somewhat nuanced: for *most* products it is natural search that is driving traffic to those products. For a handful, however (Gipsy Fortune Telling cards, Gods and Titans) is it paid search marketing. 

This begs a couple of questions, both of which are important to the business:

* Why is there such a differential in the amount of traffic driven by product from paid search marketing? It is unlikely to be accounted for by differences in search volumes. (Because some of those products have very high levels of natural search traffic.) Is it because terms are more competitive for some products than others? Or is it because not enough effort has been put to setting up specific campaigns for each product? Maybe there's an opportunity to market those products more aggressively using search engine marketing? (Especially if we measure the conversion rate for visitors who land on those pages, and discover that it is high.)
* Why is there such a differential in the amount of natural search driven to each product? Again - is this a reflection of competitor activity? (Which seems unlikely given that some of the products recieve large volumes of paid search traffic.) Is there better content / copy on the pages that do better with natural search? Are there more inbound links? It should be straightforward to test both of the above, and improve the content or encourage more links, if some of the pages that perform less well are found to be lacking when compared to those that are doing better.

Back to [top](#top).

<div class="html">
<a name="otherchannels"><h2>5. What other channels are driving traffic to our best performing items?</h2></a>
</div>

In section 3.2, we saw that for some products a signicant portion of the traffic they were generating was from non-search channels, where `refr_medium` = 'unknown'. (This encapsulates all referers that Snowplow does not recognise as a search or social referer.) It would be nice to drill into who those referers are.

To do that, let take our previous plot:

<div class="html">
<a href="/assets/img/analytics/catalog-analytics/driving-traffic/6.JPG"><img src="/assets/img/analytics/catalog-analytics/driving-traffic/6.JPG" /></a>
</div>

Use ctrl + mouse click to select just those products where a significant fraction of the traffic they generate is non-search, right click and select keep only:

<div class="html">
<a href="/assets/img/analytics/catalog-analytics/driving-traffic/9.JPG"><img src="/assets/img/analytics/catalog-analytics/driving-traffic/9.JPG" /></a>
</div>

We've select three produts to drill into. Now let's filter our data so we only look at the non-search, non-direct traffic. Drag `refr_medium` to the filter pane and select only 'unknown' results appear. 

<div class="html">
<a href="/assets/img/analytics/catalog-analytics/driving-traffic/10.JPG"><img src="/assets/img/analytics/catalog-analytics/driving-traffic/10.JPG" /></a>
</div>

Now drag `refr_medium` out of the color mark and drag `refr_urlhost` in: this tells us the domain of the referer:

<div class="html">
<a href="/assets/img/analytics/catalog-analytics/driving-traffic/11.JPG"><img src="/assets/img/analytics/catalog-analytics/driving-traffic/11.JPG" /></a>
</div>

We can look at just the visualization export:

<div class="html">
<a href="/assets/img/analytics/catalog-analytics/driving-traffic/12.jpg"><img src="/assets/img/analytics/catalog-analytics/driving-traffic/12.jpg" /></a>
</div>

The results are very illuminating:

* For two of our top performing products (by amount of traffic attracted to the site), a single referer is responsible for the bulk of traffic: that is 'www.mydivination.com' for the IJJ Swiss Tarot, and 'www.ecauldron.com' for the Goddesses and Sirens deck.
* For Gipsy Fortune cards, the top two referers are eBay and Amazon. Remember that this product drives most of its traffic through CPC marketing: in fact all the traffic driven from Amazon and eBay is due to Adwords. (For more details, see this [blog post] [where-does-your-traffic-really-come-from] on [where does your traffic *really* come from] [where-does-your-traffic-really-come-from]).

<div class="html">
<a name="plotovertime"><h2>6. Plotting traffic driven by item, by item, over time</h2></a>
</div>

We can use the cut of Snowplow data we currently have in Tableau to plot the traffic generated by each product over time.

To do so, create a new sheet in your Tableau workbook, drag "Item name" to the rows pane, "collector_tstamp" to the columns pane and "Visits" to the fields pane. Sort "Item name" by visits descending. (Click on the "Item name" drop down in the rows pane, select "sort", then the "Descending" checkbox and "Visits" from the "Fields" dropdown.)
Click on the area chart icon in the "Show me" tool bar. Drag the "refr_medium" field to the color box, so we can split the traffic by referer type. Adjust the granularity on the "collector_tstamp" field to suit your data. You should see a plot like this:

<div class="html">
<a href="/assets/img/analytics/catalog-analytics/driving-traffic/13.jpg"><img src="/assets/img/analytics/catalog-analytics/driving-traffic/13.jpg" /></a>
</div>

Note that to conserve space, we have only plotted results for our top 10 products.

If we look the graph for Goddessess and Sirens item, we see that our referer (www.mydivination.com) has driven a steady flow of traffic to the website over time. In contrast, if we look at the graph for Goddesses and Sirens, non-search referral traffic (i.e. www.ecauldron.com) drove a strong spike in visits on the week beginning the 3rd of February, but then no traffic since February 17th. That suggests that the link from ecauldron.com to Psychic Bazaar was on a blog post, or some other content item with a limited shelf life, in stark contrast to the content on mydivination.com, that appears to be much more evergreen.

We can confirm this hypothesis by looking at the actual content with the link. The referring web address is given in the `refr_urlpath` dimension. To fish this out, create a new worksheet, drag `refr_urlhost` to the filters section and create a filter so that **only** records from mydivination.com and ecauldron.com appear:

<div class="html">
<a href="/assets/img/analytics/catalog-analytics/driving-traffic/14.jpg"><img src="/assets/img/analytics/catalog-analytics/driving-traffic/14.jpg" /></a>
</div>

Then drag `refr_urlhost` and `refr_urlpath` into the rows pane and `Visits` into the fields pane:

<div class="html">
<a href="/assets/img/analytics/catalog-analytics/driving-traffic/15.JPG"><img src="/assets/img/analytics/catalog-analytics/driving-traffic/15.JPG" /></a>
</div>

We can see that the page on www.ecauldron.com that drove users was a forum thread: over time, this is likely to update so that the link to Snowplow was pushed out of. In contrast, the links from www.mydivination.com are from evergreen pages: pages that refer to the type of Tarot deck, that are shown to people either researching the decks or using the decks to perform readings. (Activities that can happen at any time of the year.) An example page is shown below:

<div class="html">
<a href="/assets/img/analytics/catalog-analytics/driving-traffic/16.JPG"><img src="/assets/img/analytics/catalog-analytics/driving-traffic/16.JPG" /></a>
</div>

Back to [top](#top).

<div class="html">
<a name="recap">7. Recap: pulling it all together</a>
</div>

In this recipe, we've covered how we can measure how much individual items in our catalog contribute to inbound marketing, by measuring the number of visits that land on each item-page over time. We've also shown how to use a combination of Tableau (or any OLAP tool) to slice and dice our data in different ways, so that we can see not only measure how much each item contributes to inbound marketing, but *how* that contribution is made, and how it has varied over time. 

[product-page-performance]: /analytics/catalog-analytics/measuring-and-comparing-product-page-performance.html
[content-page-performance]: /analytics/catalog-analytics/measuring-and-comparing-content-page-performance.html
[snowplow-website]: http://snowplowanalytics.com/
[pbz-website]: http://www.psychicbazaar.com/
[tableau-redshift-setup]: https://github.com/snowplow/snowplow/wiki/Setting-up-Tableau-to-analyze-your-Snowplow-data
[where-does-your-traffic-really-come-from]: /blog/2013/05/10/where-does-your-traffic-really-come-from/
[r]: http://www.r-project.org/
[powerpivot]: http://www.microsoft.com/en-us/bi/PowerPivot.aspx
[tableau]: http://www.tableausoftware.com/
[inbound-marketing]: http://en.wikipedia.org/wiki/Inbound_marketing
[ga]: http://www.google.co.uk/analytics/