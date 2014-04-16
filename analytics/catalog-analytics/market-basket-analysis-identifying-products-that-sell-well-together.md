---
layout: page
group: analytics
sub_group: catalog
title: Market basket analysis - identifying products and content that go well together
shortened-link: Market basket analysis
weight: 4
---

<div class="html">
<a name="top"><h1>Market basket analysis: identifying products and content that go well together</h1></a>
</div>

[Affinity analysis] [affinity-analysis] and [association rule learning] [association-rule-learning] encompasses a broad set of analytics techniques aimed at uncovering the associations and connections between specific objects: these might be visitors to your website (customers or audience), products in your store, or content items on your media site. Of these, "market basket analysis" is perhaps the most famous example. In a market basket analysis, you look to see if there are combinations of products that frequently co-occur in transactions. For example, maybe people who buy flour and casting sugar, also tend to buy eggs (because a high proportion of them are planning on baking a cake). A retailer can use this information to inform:

* Store layout (put products that co-occur together close to one another, to improve the customer shopping experience)
* Marketing (e.g. target customers who buy flour with offers on eggs, to encourage them to spend more on their shopping basket)

Online retailers and publishers can use this type of analysis to:

* Inform the placement of content items on their media sites, or products in their catalogue
* Drive recommendation engines (like Amazon's *customers who bought this product also bought these products...*)
* Deliver targeted marketing (e.g. emailing customers who bought products specific products with other products and offers on those products that are likely to be interesting to them.)

There are a wide range of algorithms, available on a wide variety of platforms, for performing market basket analysis. In this introductory recipe, we will cover:

1. [Market basket analysis: the basics](#metrics)
2. [Performing marketing basket analysis using the apriori algorithm using R and the `arules` package](#apriori)
3. [Managing large result sets: visualizing rules using the `arulesViz` package](#arulesviz)
4. [Interpreting the results: using the analysis to drive business decision-making](#business)
5. [Expanding on the analysis - zooming out from the basket to look a customer behavior over longer periods and different events](#expand)

<div class="html">
<a name="metrics"><h2>1. Market basket analysis: the basics</h2></a>
</div>

### Terminology


**Items** are the objects that we are identifying associations between. For an online retailer, each **item** is a product in the shop. For a publisher, each **item** might be an article, a blog post, a video etc. A group of items is an **item set**.

<p style="text-align:center">
	`I = {i_1, i_2,...,i_n}`
</p>

**Transactions** are instances of groups of items co-occuring together. For an online retailer, a **transaction** is, generally, a, transaction. For a publisher, a transaction might be the group of articles read in a single visit to the website. (It is up to the analyst to define over what period to measure a **transaction**.) For each **transaction**, then, we have an **item set**.

<p style="text-align:center">
	`t_n = {i_i, i_j,...,i_k}`
</p>

**Rules** are statements of the form 

<p style="text-align:center">
	`{i_1, i_2,...} => {i_k}`
</p>

I.e. if you have the items in item set (on the left hand side (LHS) of the rule i.e. <span>`{i_1, i_2,...}`</span>), then it is likely that a visitor will be interested in the item on the right hand side (RHS i.e. <span>`{i_k}`</span>. In our example above, our rule would be:

<p style="text-align:center">
	`{ flour, sugar } => { eggs }`
</p>

The output of a market basket analysis is generally a set of rules, that we can then exploit to make business decisions (related to marketing or product placement, for example).

The **support** of an item or item set is the fraction of transactions in our data set that contain that item or item set. In general, it is nice to identify rules that have a high support, as these will be applicable to a large number of transactions. For super market retailers, this is likely to involve basic products that are popular across an entire user base (e.g. bread, milk). A printer cartridge retailer, for example, may not have products with a high support, because each customer only buys cartridges that are specific to his / her own printer.

The **confidence** of a rule is the likelihood that it is true for a new transaction that contains the items on the LHS of the rule. (I.e. it is the probability that the transaction *also* contains the item(s) on the RHS.) Formally:

<p style="text-align: center">
	confidence`( i_m => i_n ) =`  support`( i_m uu i_n ) //` support`( i_m )`
</p>

The **lift** of a rule is the ratio of the support of the items on the LHS of the rule co-occuring with items on the RHS divided by probability that the LHS and RHS co-occur if the two are independent. 

<p style="text-align: center">
	lift`( i_m => i_n ) = ` support`( i_m uu i_n ) // (`support`( i_m ) xx `support`( i_n ))`
</p>

If lift is greater than 1, it suggests that the precense of the items on the LHS has increased the probability that the items on the right hand side will occur on this transaction. If the lift is below 1, it suggests that the presence of the items on the LHS make the probability that the items on the RHS will be part of the transaction *lower*. If the lift is 1, it suggests that the presence of items on the LHS and RHS really are independent: knowing that the items on the LHS are present makes **no** difference to the probability that items will occur on the RHS.

When we perform market basket analysis, then, we are looking for rules with a lift of more than one. Rules with higher confidence are ones where the probability of an item appearing on the RHS is high given the presence of the items on the LHS. It is also preferable (higher value) to action rules that have a high support - as these will be applicable to a larger number of transactions. However, in the case of long-tail retailers, this may not be possible.  


Back to [top](#top).

<div class="html">
<a name="apriori"><h2>2. Performing marketing basket analysis using the apriori algorithm using R and the arules package</h2></a>
</div>

Just to recap: the purpose of this analysis is to generate a set of rules that link two or more products together. Each of these rules should have a lift greater than one. In addition, we are interested in the support and confidence of those rules: higher confidence rules are ones where there is a higher probability of items on the RHS being part of the transaction given the presence of items on the LHS. We'd expect recommendations based on these rules to drive a higher response rate, for example. We're also better off actioning rules with higher support first, as these will be applicable to a wider range of instances.

In this example, we're going to perform the analysis for an online retailer running Snowplow. We're going to do the classic market basket analysis: by that I mean we are going to look for rules based on actual transactions. (Later on in this recipe, we'll consider the pros and cons of defining the 'scope' or our basket differently.) 

We're going to use [R] [r] to perform the market basket analysis. R is a great statistical and graphical analysis tool, well suited to more advanced analysis. We're going to use the [Arules package] [arules-r-package], which implements the [Apriori] [apriori] algorithm, one of the most commonly used algorithms for identifying associations between items.

To start with, we need to fetch transaction data from Snowplow which identifies groups of items by transaction. The following SQL query fetches these directly: it returns a line of data for every line item of each transaction, with the transaction id and the item name:

{% highlight psql %}
/* PostgreSQL / Redshift */
SELECT
"ti_orderid" AS "transaction_id",
"ti_name" AS "sku"
FROM
"events"
WHERE
"event" = 'transaction_item'
{% endhighlight %}

We can pull this data directly into R from R. (For assistance setting up R to use with Snowplow, see the [setup guide] [r-setup-guide].) First, we load up R, and connect R to our Snowplow table in Redshift by entering the following at the R prompt:

{% highlight r %}
library("RPostgreSQL")
con <- dbConnect(drv, host="<<REDSHIFT ENDPOINT>>", port="<<PORT NUMBER>>", dbname="<<DBNAME>>", user="<<USERNAME>>", password="<<PASSWORD>>")
{% endhighlight %}

(Be sure to substitute appropriate values for `<<REDSHIFT ENDPOINT>>` `<<PORT NUMBER>>`, `<<DBNAM>>` and `<<USERNAME>>`. 

Then we execute our SQL query above, fetching the data as a data frame in R:

{% highlight r %}
t <- dbGetQuery(con, "
SELECT
\"ti_orderid\" AS \"transaction_id\",
\"ti_name\" AS \"sku\"
FROM
\"events\"
WHERE
\"event\" = 'transaction_item'
")
{% endhighlight %}

We can take a peak at the first five records on our data frame by executing

{% highlight r %}
head(t)
{% endhighlight %}

![viewing-the-initial-data] (/assets/img/analytics/catalog-analytics/market-basket-analysis/1.JPG)

Note how each line of data represents a single line item, so that the first transaction (which includes two items) spans two lines.

Now we need to records lines by transaction id, so that the individual products that belong to each transaction are aggregated across records into a single record as an array of products. This is done by executing the following at the R prompt:

{% highlight r %}
i <- split(t$sku, t$transaction_id)
{% endhighlight %}

Again, we can peak at our data by executing `head(i)` at the prompt:

![viewing-the-aggregated-data] (/assets/img/analytics/catalog-analytics/market-basket-analysis/2.JPG)

Now we convert the data into a "Transaction" object optimized for running the arules algorithm:

{% highlight r %}
library("arules")
txn <- as(i, "transactions")
{% endhighlight %}

Finally, we can run our algorithm:

{% highlight r %}
basket_rules <- apriori(txn, parameter = list(sup = 0.005, conf = 0.01, target="rules"))
{% endhighlight %}

When running the rule, we set minimum support and confidence thresholds, below which R ignores any rules. These are used to optimize the running of the algorithm: figuring out association rules can be compulationally expensive, because for a company with a large catalogue of items, the number of combinations of items is *enormous* (it increases exponentially with the number of items). Hence, anything we give the algorithm to minimize the computational burden is welcome.

In our case, we've given low figures for support and confidence. This is because our test example is based on a long tail retailer, who offers more than 10k SKUs, against which c.90k purchases have been made. The maximum support any one of the products has is very low: this can be confirmed by plotting the relative frequency of each item (i.e. the fraction of transactions) for the top 25 items by item frequency (i.e. the fraction of transactions that each item appears in). This can be done by running:

{% highlight r %} 
itemFrequencyPlot(txn, topN = 25)
{% endhighlight %}

In which case the following plot was produced:

![itemFrequencyPlot] (/assets/img/analytics/catalog-analytics/market-basket-analysis/3.JPG)

Note how the most frequent item appears in less than 2% of transactions recorded.

In your case the distribution of items by transaction might look very different, and so very different support and confidence parameters may be applicable. To determine what works best, you need to experiment with different parameters: you'll see that as you reduce them, the number of rules generated will increase, which will give you more to work with. However, you'll need to sift through the rules more carefully to identify those that will be more impactful for your business. We return to this theme in the [next section](#arulesviz).

Lastly, let's inspect the actual rules generated by the algorithm:

{% highlight r %}
inspect(basket_rules)
{% endhighlight %}

![basket_rules] (/assets/img/analytics/catalog-analytics/market-basket-analysis/4.JPG)

In our case, the algorithm has identified 9 rules. The first 7 are not helpful: there are no items on the LHS. (For these seven rules, note how because there are no items on the LHS, the support = the confidence and the lift = 1.)

The last two rules are interesting though: they suggest that people who buy the "Memo Block Apple" are more likely to buy the "Memo Block Pear" and vice-versa. Not just that, but they are *much* more likely to do so: the confidence is 66 - suggesting they are very strongly associated.

Back to [top](#top).

<div class="html">
<a name="arulesviz"><h2>3. Managing large result sets: visualizing rules using the arulesViz package</h2></a> 
</div>

In the previous example we set the parameters for support and confidence so that only a small set of rules were returned. As mentioned, however, it is often better to return a larger set, to increase the chances that we generate more relevant rules for our business.

Let's rerun the algorithm, but this time reduce our parameters for support and confidence, and save the result set into a different object:

{% highlight r %}
basket_rules_broad <- apriori(txn, parameter = list(sup = 0.001, conf = 0.001, target="rules"))
{% endhighlight %}

In our case, 3.2M rules were returned. This is way to many to visually inspect - however we can look at the top 20 by lift:

![top_10_by_lift] (/assets/img/analytics/catalog-analytics/market-basket-analysis/5.JPG)

We can plot our rules by confidence, support and lift, using the `arulesViz` package:

{% highlight r %}
library("arulesViz")
plot(basket_rules_broad)
{% endhighlight %}

Our plot looks as follows:

![top_10_by_lift] (/assets/img/analytics/catalog-analytics/market-basket-analysis/6.JPG)

The plot shows that rules with high lift typically have low support. (This is not surprising, given the maths.) We can use a plot like the one above to identify rules with both high support and confidence: the `arulesViz` package lets us plot the graphs in an interactive mode, so that we can click on individual points and explore the associated data. For more details, see [the full package instructions] (http://cran.r-project.org/web/packages/arulesViz/vignettes/arulesViz.pdf).

How many rules we generate, and how we prioritise which rules we action, depend on which business questions we plan to answer with our analysis. This is discussed further in the [next section](#business).

Back to [top](#top).

<div class="html">
<a name="business"><h2>4. Using the analysis to drive business decision-making</h2></a>
</div>

Before we use the data to make any kind of business decision, it is important that we take a step back and remember something important:

**The output of the analysis reflects how frequently items co-occur in transactions. This is a function *both* of the strength of association between the items, *and* the way the site owner has presented them.**

To say that in a different way: items might cooccur not because they are "naturally" connected, but because we, the people in charge of the site, have presented them together. 

This is an example of a more general problem in web analytics: our data reflects the way users behave, and the *way we have encouraged them to behave, by the website design decisions we have made*. We need to be conscious of this, because, if as suggested earlier in the recipe, we use the results to inform where items are placed relative to one another, we need to control for how close they are situated on the website today, so that we don't end up confirming what we have assumed. So, for example, if items *k* and *l* show a strong association, and are presented next to one-another already on our site, that is not that interesting. If they are far apart on our site, that is interesting - maybe we should put them closer together. If those items are close together, but the analysis shows there is *not* a strong association, we should probably separate them: our previous assumption that they should be placed together may have been wrong.

### Using the data to drive website organization

There are a number of ways we can use the data to drive site organisation:

1. Large clusters of co-occuring items should probably be placed in their own category / theme
2. Item pairs that commonly co-occur should be placed close together within broader categories on the website. This is especially important where one item in a pair is very popular, and the other item is very high margin.
3. Long lists of rules (including ones with low support and confidence) can be used to put recommendations at the bottom of product pages and on product cart pages. The only thing that matters for these rules is that the lift is greater than one. (And that we pick those rules that are applicable for each product with the high lift where the product recommended has a high margin.)
4. In the event that doing the above (3) drives significant uplift in profit, it would strengthen the case to invest in a recommendation system, that uses a similar algorithm in an operational context to power automatic recommendation engine on your website.

### Using the data for targeted marketing

The same results can be used to drive targeted marketing campaigns. For each user, we pick a handful of products based on products they have bought to date which have *both* a high uplift and a high margin, and send them a e.g. personalized email or display ads etc.

How we use the analysis has significant implications for the analysis itself: if we are feeding the analysis into a machine-driven process for delivering recommendations, we are much more interested in generating an expansive set of rules. If, however, we are experimenting with targeted marketing for the first time, it makes much more sense to pick a handful of particularly high value rules, and action just them, before working out whether to invest in the effort of building out that capability to manage a much wider and more complicated rule set.

Back to [top](#top).

<div class="html">
<a name="expand"><h2>5. Expanding on the analysis: zooming out from the basket to look a customer behavior over longer periods and different events</h2></a>
</div>

In the above example, we used actual transaction events to identify associations between products for an online retailer.

Sticking with our retail example, however, we could have expanded the scope of our definition of transactions. Instead of *just* looking at the basket for successful transactions, we could have looked at user's complete baskets (whether or not they went on to buy). The analysis steps would have been *almost* exactly the same, however, instead of pulling transaction data out of Snowplow, we'd have pulled *add-to-basket* data out, using a query like the following:

{% highlight psql %}
/* PostgreSQL / Redshift */
SELECT
"domain_userid" + '-' + "domain_sessionidx" AS "transaction_id",
"ev_property" AS "sku"
FROM 
"events"
WHERE
"ev_action" = 'add-to-basket'
{% endhighlight %}

We could increase the scope further, so instead of looking at *add-to-basket-events*, we look at every product that each visitor has viewed, and associate groups of products that individual users have looked at within a single session:

{% highlight psql %}
/* PostgreSQL / Redshift */
SELECT
"domain_userid" + '-' + "domain_sessionidx" AS "transaction_id",
"page_urlpath"
FROM 
"events"
WHERE
"event" = 'page_view'
{% endhighlight %}

Note how this time each product is identified by URL rather than by SKU. It may be appropriate to filter out URLs that do not correspond with product pages.

Finally, we could expand our window further, so instead of confining ourselves to a single session, we look at the same user over multiple sessions, i.e.:

{% highlight psql %}
/* PostgreSQL / Redshift */
SELECT
"domain_userid" AS "transaction_id",
"page_urlpath"
FROM 
"events"
WHERE
"event" = 'page_view'
{% endhighlight %}

Note how this is almost exactly the same query as when our scope was per-session, we've just removed the `domain_sessionidx` (so that when we aggregate by "transaction_id"), we aggregate by user over their entire lifetime, rather than each simply over each session.

These final, wider scope examples, are likely to be more appropriate for publishers and media site owners, who want to identify associations between articles, writers / authors / producers and categories of content, rather than products in a shop.

Back to [top](#top).

[affinity-analysis]: http://en.wikipedia.org/wiki/Affinity_analysis
[association-rule-learning]: http://en.wikipedia.org/wiki/Association_rule_learning
[arules-r-package]: http://cran.r-project.org/web/packages/arules/index.html
[apriori]: http://en.wikipedia.org/wiki/Apriori_algorithm
[r-setup-guide]: https://github.com/snowplow/snowplow/wiki/Setting-up-R-to-perform-more-sophisticated-analysis-on-your-Snowplow-data
[r]: http://www.r-project.org/