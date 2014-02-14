---
layout: page
group: analytics
sub_group: catalog
title: Measuring and comparing product page performance
shortened-link: Product page performance
weight: 2
---

<a name="top"><h1>Measuring product page performance</h1></a>

1. [Measuring what fraction of users to a product page add the product to their basket](#add-to-basket)
2. [Visualising the data in an actionable scatter plot](#visualising)
3. [More sophisticated approaches to measuring product page performance](#sophisticated-approaches)

<a name="add-to-basket"><h3>1. Measuring what fraction of users to a product page add the product to their basket</h3></a>

The primary purpose of product pages on a retailer site is to drive users to add the products listed to their baskets.

A straightforward (if crude) way of measuring *how good a product page is* then is to measure what fraction of users who visit the page go on to add that product to their basket.

To calculate the fraction of users who've visited a product page that have gone on to add one or more of those products to their basket, we start by calculating the number of uniques per product page:

{% highlight mysql %}
/* PostgreSQL / Redshift */
SELECT 
page_urlpath,
COUNT(DISTINCT(domain_userid)) AS unique_visitors,
COUNT(*) AS page_views
FROM "atomic".events
WHERE (                                    -- Only display results for *product* pages
	(page_urlpath LIKE '/tarot-cards/%') 
	OR (page_urlpath LIKE '/oracles/%') 
	OR (page_urlpath LIKE '/pendula/%')
	OR (page_urlpath LIKE '/jewellery/%')
) AND event = 'page_view'
AND page_urlhost = 'www.psychicbazaar.com' -- Only display results for the *production website*
GROUP BY page_urlpath
ORDER BY unique_visitors DESC;
{% endhighlight %}

Note that the query above is specific to a particular retailer: Psychic Bazaar. You will need to modify your version of the query so that results are only shown for product pages (rather than catalog pages, home pages etc), by modifying the `WHERE` clause. You may also want to limit the query to a specific period of time, by adding a set of date conditions (using `collecor_dt`) to the `WHERE` clause.

The results of the above query look something like this:

| **page_urlpath**                               | **uniques** | **page_views** |
|:-----------------------------------------------|------------:|---------------:|
| /tarot-cards/290-the-piatnik-historical-cartomancy-collection.html | 53 | 104 |
| /oracles/125-mlle-lenormand-cartomancy-deck.html                   | 51 | 80  |
| /oracles/226-gateway-oracle-cards.html                             | 49 | 67  |
| ...                                                                | ...| ... |


Now that we have number of unique visitors per page, we need to find out how many of them added one or more of each product to their basket. 

On our example website ([www.psychicbazaar.com] [pbz]), add to baskets are recorded using the [structured event tracking] [struct-event] method. The five fields are set as follows:

* `se_category` = 'ecomm'
* `se_action` = 'action'
* `se_label` = product SKU
* `se_property` = number added to basket
* `se_value` = sales value of items added to basket

We can therefore query the number of add-to-baskets by product page using the following query:

{% highlight mysql %}
/* PostgreSQL / Redshift */
SELECT
page_urlpath,
se_label AS product_sku,
COUNT(DISTINCT(domain_userid)) AS uniques_that_add_to_basket,
COUNT(*) AS number_of_add_to_baskets,
SUM(se_property) AS number_of_products_added_to_baket
FROM "atomic".events
WHERE (                                    -- Only display results for *product* pages
	(page_urlpath LIKE '/tarot-cards/%' ) 
	OR ( page_urlpath LIKE '/oracles/%' ) 
	OR (page_urlpath LIKE '/pendula/%')
	OR (page_urlpath LIKE '/jewellery/%'))
AND event = 'struct'
AND se_category = 'ecomm'
AND se_action = 'add-to-basket'
AND page_urlhost = 'www.psychicbazaar.com'
GROUP BY 1,2
ORDER BY 3 DESC;
{% endhighlight %}

The results of the above query look something like this:

| **page_urlpath** | **product_sku** | **uniques_that_add_to_basket** | **number_of_add_to_baskets** | **number_of_products_added_to_baket** |
|:-------------------------------------------------------------------|:---------|---:|---:|---:|
| /tarot-cards/290-the-piatnik-historical-cartomancy-collection.html | PBZ00274 | 14 | 16 |  16|
| /tarot-cards/121-the-gothic-tarot.html                             | PBZ00110 | 14 | 15 | 15 |
| ... | ... | ... | ... | ... |

We can now combine the two above tables into a single query, and calculate the fraction of visitors to each page that go on to add the product to their basket:

{% highlight mysql %}
/* PostgreSQL / Redshift */
SELECT
pv.page_urlpath,
pv.unique_visitors,
ab.uniques_that_add_to_basket,
ab.uniques_that_add_to_basket / pv.unique_visitors AS fraction_that_add_to_basket
FROM (
	SELECT 
	page_urlpath,
	COUNT(DISTINCT(domain_userid)) AS unique_visitors,
	COUNT(*) AS page_views
	FROM "atomic".events
	WHERE (                                    -- Only display results for *product* pages
		(page_urlpath LIKE '/tarot-cards/%') 
		OR (page_urlpath LIKE '/oracles/%') 
		OR (page_urlpath LIKE '/pendula/%')
		OR (page_urlpath LIKE '/jewellery/%')
	) AND event = 'page_view'
	AND page_urlhost = 'www.psychicbazaar.com' -- Only display results for the *production website*
	GROUP BY page_urlpath
	ORDER BY unique_visitors DESC
) pv
LEFT JOIN (
	SELECT
	page_urlpath,
	se_label AS product_sku,
	COUNT(DISTINCT(domain_userid)) AS uniques_that_add_to_basket,
	COUNT(*) AS number_of_add_to_baskets,
	SUM(se_property) AS number_of_products_added_to_baket
	FROM "atomic".events
	WHERE (                                    -- Only display results for *product* pages
		(page_urlpath LIKE '/tarot-cards/%' ) 
		OR ( page_urlpath LIKE '/oracles/%' ) 
		OR (page_urlpath LIKE '/pendula/%')
		OR (page_urlpath LIKE '/jewellery/%'))
	AND event = 'struct'
	AND se_category = 'ecomm'
	AND se_action = 'add-to-basket'
	AND page_urlhost = 'www.psychicbazaar.com'
	GROUP BY 1,2
	ORDER BY 3 DESC
) ab
ON pv.page_urlpath = ab.page_urlpath
{% endhighlight %}

The results of the query look something like this:

| **page_urlpath** | **unique_visitors** | **uniques_that_add_to_basket** | **fraction_that_add_to_basket** |
|:-----------------|--------------------:|-------------------------------:|--------------------------------:|
| /tarot-cards/244-el-gran-tarot-esoterico.html | 132 | 17                | 0.128                           |
| /jewellery/151-gold-hamsa-on-black-thread-bracelet.htm | 105 | 2        | 0.190                           |
| ...              | ...                 | ...                            | ...                             |

We can plot the results to compare products between pages:

![add-to-basket-rate-by-product-page] [img1]

The above plot is interesting: it makes it easy to compare conversion rates between products and product pages. In the next section we will evolve our analysis using a scatter plot to visualize the product page performance.

Back to [top](#top).

<a name="visualising"><h3>Visualising the data in an actionable scatter-plot</h3></a>

In this section, we are going to build a scatter plot which compares the number of uniques that view each product with the number of uniques that add the product to basket, with the size of each dot being the number of uniques that buy the product.

Here is a preview of the scatter plot we will generate: 

![scatter-plot] [scatter-plot]

The good thing about the above scatter plot is that it is incredibly *actionable*. Before we look at how it is actionable, let's explore the plot briefly.

#### Understanding the plot

Each product (i.e. product page) is marked on the plot by a circle. The position of the circle on the left-right axis indicates how many times that product page has been viewed: so the products over to the right of the plot are ones with highly trafficked product pages.

![expl1] [img2]

The position on the top-bottom axis indicates the number of unique users who have added the product to their baskets. Products that are higher up have been added to basket more frequently than those lower down.

![expl2] [img3]

We can tell how well-converting a product page is by looking at the height of its position on the graph, relative to its distance from the left axis. Products that are positioned high up, but over to the left, are added to basket a lot, even if they do not attract many visitors. They are therefore highly converting product pages.

![expl3] [img4]

#### Why is the scatter plot so actionable?

Let's look at why the plot is so **actionable**. To take one example: any products located in the lower right corner are highly trafficked but low converting - any effort spent fixing those product pages (e.g. by checking the copy, updating the product images or lowering the price) should be rewarded with a significant sales uplift, given the number of people visiting those pages:

![expl4] [img5]

In our plot above that means checking the product page for the *Gateway Oracle Cards* and the *Celtic Ogham Set* for example. In contrast, products located in the top left of the plot are very highly converting, but low trafficked pages. We should drive more traffic to these pages, either by positioning those products more prominently on catalog pages, for example, or by spending marketing dollars driving more traffic to those pages specifically. Again, that investment should result in a significant uplift in sales, given how highly converting those products are.

![expl5] [img6]

Products in the top right are already performing well - this analysis suggests that we focus our efforts on the two groups of products identified above.

![expl6] [img7]

Similarly, products in the lower left corner are performing poorly - but it is not clear whether this is because they have low traffic levels and /or are poor at driving conversions. We should invest in improving the performance of these pages, but the return on that investment is likely to be smaller (or harder to achieve) than the two opportunities identified above.

![expl7] [img8]

#### Producing the plot

To produce the plot we need to the same data as above, but need to include in addition data on the number of uniques who go on to purchase each product. This additional data can be delivered via the following query:

{% highlight mysql %}
/* PostgreSQL / Redshift */
SELECT
ti_sku,
COUNT(DISTINCT(domain_userid)) AS uniques_that_purchase,
COUNT(DISTINCT(ti_orderid)) AS number_of_orders,
SUM(ti_quantity) AS actual_number_sold
FROM "atomic".events
WHERE event = 'transaction_item'
GROUP BY ti_sku;
{% endhighlight %}

We can combine this with the previous queries:

{% highlight mysql %}
/* PostgreSQL / Redshift */
SELECT
pv.page_urlpath,
pv.unique_visitors,
ab.uniques_that_add_to_basket,
t.uniques_that_purchase
FROM (
	SELECT 
	page_urlpath,
	COUNT(DISTINCT(domain_userid)) AS unique_visitors,
	COUNT(*) AS page_views
	FROM "atomic".events
	WHERE (                                    -- Only display results for *product* pages
		(page_urlpath LIKE '/tarot-cards/%') 
		OR (page_urlpath LIKE '/oracles/%') 
		OR (page_urlpath LIKE '/pendula/%')
		OR (page_urlpath LIKE '/jewellery/%')
	) AND event = 'page_view'
	AND page_urlhost = 'www.psychicbazaar.com' -- Only display results for the *production website*
	GROUP BY page_urlpath
	ORDER BY unique_visitors DESC
) pv
LEFT JOIN (
	SELECT
	page_urlpath,
	se_label AS product_sku,
	COUNT(DISTINCT(domain_userid)) AS uniques_that_add_to_basket,
	COUNT(*) AS number_of_add_to_baskets,
	SUM(se_property) AS number_of_products_added_to_baket
	FROM "atomic".events
	WHERE (                                    -- Only display results for *product* pages
		(page_urlpath LIKE '/tarot-cards/%' ) 
		OR ( page_urlpath LIKE '/oracles/%' ) 
		OR (page_urlpath LIKE '/pendula/%')
		OR (page_urlpath LIKE '/jewellery/%'))
	AND event = 'struct'
	AND se_category = 'ecomm'
	AND se_action = 'add-to-basket'
	AND page_urlhost = 'www.psychicbazaar.com'
	GROUP BY 1,2
	ORDER BY 3 DESC
) ab
ON pv.page_urlpath = ab.page_urlpath
LEFT JOIN (
	SELECT
	ti_sku,
	COUNT(DISTINCT(domain_userid)) AS uniques_that_purchase,
	COUNT(DISTINCT(ti_orderid)) AS number_of_orders,
	SUM(ti_quantity) AS actual_number_sold
	FROM "atomic".events
	WHERE event = 'transaction_item'
	GROUP BY ti_sku
) t
ON ab.product_sku = t.ti_sku;
{% endhighlight %}

This produces a result set that looks like this:

| **page_urlpath** | **unique_visitors** | **uniques_that_add_to_basket** | **uniques_that_purchase** |
|:-----------------|--------------------:|-------------------------------:|--------------------------:|
| /oracles/266-magical-messages-from-the-fairies-oracle-cards.html | 89   | 14  | 7                   |
| /tarot-cards/127-petrak-tarot.html | 82                          | 21   | 18                        |
| ...                                | ...                         | ...  | ...                       |

We can produce the scatter plot directly in Tableau, for example, by using the above query to import the data, dragging the `page_urlpath` dimension and three metrics in the above table onto the pane and then clicking on the scatter plot icon.

Back to [top](#top).

<a name="sophisticated-approaches"><h3>3. More sophisticated approaches to measuring product page performance</h3></a>

The above approach to measuring product performance assumes that all the users who land on a product page are just as likely to add the product to their basket, and as a result, any difference in conversion rates between product pages relates to how good that product page is. 

That assumption is nearly always false: a user who visits a website specifically to buy a product is much more likely to convert that one who is browsing, but open to being upsold. When we perform the above analysis on a large data set, that might not matter because the *average* likelihood to purchase prior to viewing the page might be similar. But it might not be.

Therefore, if we wish to take a more sophisticated approach to measuring product page effectiveness, we should take into account how likely a visitor is to convert prior to viewing the product page. Whilst this is a very difficult figure to calculate in any meaningful way, we can distinguish different types of user e.g.:

1. Those who have come to the website specifically to buy **this** product
2. Those who have come to the website to buy *something*
3. Those who are on the website for another reason

There are a variety of ways of identifying which of the above buckets a user is in. For example, if they have come from a search engine where they have entered the product name directly, that suggests they belong in bucket one. Similarly, if they perform an internal search for the product, or the product page is their landing page, they probably belong in Bucket One above.

Identifying if the user is in the market to buy *something* or not is a bit tricker. If they are systematically viewing a range of products, then the chances are that they belong in Bucket Two. If they have come to the website to enter a competition or read a blog post, on the other hand, they probably belong in bucket three.

*Note: there are more rigorous ways of identifying which bucket a user belong in e.g. using machine learning to identify behaviors that are indicative of a user belonging in each bucket. We will be covering these in a future set of recipes in the [customer analytics] [customer-analytics] section of the cookbook.*

Once we have categorised our users into different buckets, we should compare conversion rates for each product page against each audience segment. It is especially instructive to identify low conversion rates for Buckets One and Two. For example, if a product page is relatively poor at converting users in Bucket One, that suggests that maybe:

* The price of the item is too high
* The description of the item is unclear or offputting
* There is some other reason why the user would prefer to buy it from another retailer than you

On the other hand, a low conversion rate for people in Bucket Two suggests:

* The product page does a bad job of explaining the appeal of this product to someone who is unfamiliar with it
* The images are not attractive
* There are other, more attractive products on offer, either within the website or on competitor sites

In addition, a relatively high conversion rate for users in Bucket Three suggests that we have a "hero" product in the catalog: one that people buy even though they haven't come to the website to make a purchase. This is a product we should be marketing intensively.

Back to [top](#top).

[pbz]: http://www.psychicbazaar.com/
[struct-event]: https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#wiki-custom-structured-events
[img1]: /assets/img/analytics/catalog-analytics/product-page-performance/top-product-page-by-fraction-of-uniques-that-add-to-basket.jpg
[scatter-plot]: /assets/img/analytics/catalog-analytics/product-page-performance/scatter-plot.jpg
[img2]: /assets/img/analytics/catalog-analytics/product-page-performance/Slide1.JPG
[img3]: /assets/img/analytics/catalog-analytics/product-page-performance/Slide2.JPG
[img4]: /assets/img/analytics/catalog-analytics/product-page-performance/Slide3.JPG
[img5]: /assets/img/analytics/catalog-analytics/product-page-performance/Slide4.JPG
[img6]: /assets/img/analytics/catalog-analytics/product-page-performance/Slide5.JPG
[img7]: /assets/img/analytics/catalog-analytics/product-page-performance/Slide6.JPG
[img8]: /assets/img/analytics/catalog-analytics/product-page-performance/Slide7.JPG
[customer-analytics]: /analytics/customer-analytics/overview.html