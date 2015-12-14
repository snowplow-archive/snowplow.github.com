---
layout: post
title: Using the new SQL views to perform cohort analysis with ChartIO
title-short: Cohort analysis with ChartIO
tags: [cohort analysis, chartio]
author: Yali
category: Analytics
---


*We wanted to follow-up our recent [launch of Snowplow 0.8.10] [launch-post], with inbuilt SQL recipes and cubes, with a few posts demonstrating how you can use those views to quickly perform analytics on your Snowplow data. This is the first of those posts.*

![final-cohort-analysis-summary][final-cohort-analysis]

In this post, we'll cover how to perform a cohort analysis using [ChartIO] [chartio] and Snowplow.

## Recap: what is Cohort Analysis

We have described cohort analysis at length in the [Analyst Cookbook] [cohort-analysis]. To sum up, a cohort analysis is a longitudal study, that compares the behaviour or characteristics of groups of people over a long period of time. It therefore encompasses a broad range of analyses, because you can vary:

1. how you group people into cohorts (cohort definition), and
2. the characteristic that you're comparing between cohort over time.

In digital media people generally use the phrase 'cohort analysis' to refer to measurements of retention rates for different cohorts, where cohorts are defined by *when* a user was acquired. In that way, SaaS companies, for example, can compare how  well they retained customers acquired in October vs those acquired in September vs those acquired in August, and measure in a robust way whether they are getting better at retaining users over time. (This is key to SaaS business model being viable.)

<!--more-->

We've included 10 different cohort analyses as standard with Snowplow, all of which compare retention rates between different cohorts, but which vary in how they define cohorts and what unit of time the comparison is performed over:

| **Cohort definition** | **Unit of time comparison is performed over** |
|:----------------------|:----------------------------------------------|
| Paid channel acquired | Months                                        |
| Paid channel acquired | Weeks                                         |
| Referer acquired      | Months                                        |
| Referer acquired      | Weeks                                         |
| Month first touch website | Months                                    |
| Week first touch website  | Weeks                                     |
| Month first sign in to website | Months                               |
| Week first sign in to website  | Months                               |
| Month first transact on website | Months                              |
| Week first transact on website  | Weeks                               |

Other metrics you might want to compare between cohorts include [average revenue per user] [clv] and average [engagement by user][engagement]. (Engagement can be defined in many different ways.) For details in how to perform cohort analyses with these measures, see the [detailed recipe in the Analysts Cookbook] [cohort-analysis].

In this post we're going to plot retention by month, based on the month that a user first touched the website. We're going to perform this analysis for the Snowplow website itself.

## Performing the analysis

Before we dive into ChartIO and create our plot, let's first have a look at the raw data in [Navicat] [navicat], by opening up our view directly. Go into Navicat (or your SQL UI of choice) and open up `customer_recipes.cohort_retention_by_month_first_touch` view:

<p><a href="/assets/img/blog/2013/10/cohort-analysis/1.JPG"><img src="/assets/img/blog/2013/10/cohort-analysis/1.JPG" title="cohort data viewed directly in Navicat"></a></p>

(You can click on the picture above to [zoom in] (/assets/img/blog/2013/10/cohort-analysis/1.JPG) on it.) Let's take a good look at the actual structure of the data: this will make it much clearer how to successfully plot the data in ChartIO:

* Each line of data gives the number of uniques, for that a particular cohort, that were active each month. (This number is given in the `uniques` column.)
* Each line also gives a second metric: the `fraction_retained`. This is the number of uniques that were active that month, divided by the total number of uniques in that cohort.
* We have three dimensions for each line of data: the first, called `cohort`, is the month that the user first touched the website.
* The second dimension is `month_actual` - this is the month that the measure was taken. So we see in our example, that we have 9 records for the February 2013 cohort, one for February, one for March, one for April etc. until October. For those 9 records, the first dimension is always equal to February 2013 - i.e. the month that these users first came to our website. But the `month_actual` field increments.
* As well as giving the actual month that each measure was taken, we also get a `month_rank` which equals 1 for the first measurement for the cohort, 2 for the second etc. This will make it easy to compare the retention rates after e.g. 3 months between cohorts that signed up in January and February, for example: note that we'd want to compare the March numbers for our January cohort with our April numbers for our February cohort. Rather than work out the number of months between the cohort definition and the actual month, we can simply compare figures where `month_rank` = 3 for our comparison.
* Finally, note that our `fraction_retained` figure is always 1 (i.e. 100%) for the first month's reading for each cohort. That is because, by definition, every member of the cohort is active on the first month that they touch the website. (Activity is defined as visiting the website at least once.)

Now - to perform our analysis, we want to plot a line graph: one per cohort, where we're plotting month rank (on the x-axis) against fraction retained (on the y-axis). We expect a graph as follows, with retention by cohort decreasing over time for each of cohorts:

![cohort-mockup][img-2]

Let's plot our cohort analysis! Log into ChartIO, go into a dashboard where you want to create your graph and click the **Add Chart** button. (We're going to assume you've already setup a connection in ChartIO to your Snowplow data in Redshift, and in particular, the `recipes_customer` schema. If you haven't, instructions can be found [here] [setup-chartio-instructions].)

![add-chart][img-3]

Select the data source on the left which connects to the `recipes_customer` schema. A long list of all the different views available in that schema will be shown below. Select the **Cohort Dfn by Month First Touch** view. The different measures and dimensions will be shown:

![select-view][img-4]

Now let's create our plot. We want to plot **Fraction Retained** as our metric, so drag that from the **Data Sources** column to the **Measures** pane:

![fraction-retained][img-5]

Now we want to plot this over **Month Rank**, so let's drag **Month Rank** from the **Data Sources** column to the **Dimensions** pane:

![month-rank][img-6]

Lastly we want to compare the fraction retained over month rank between **Cohort**, so drag **Cohort** from the **Data Sources** column to the dimensions pane as pane as well. ChartIO, on seeing that this is a date field, assumes you want to plot it by week. We want to plot it by month, so click on it in the dimensions pane to reveal a dropdown, and set **Time bucket** to **Month**:

![cohort][img-7]

Now click the **Chart Query** button. A table with the different values (a subset of those we saw in Navicat) will appear above. Click on the line graph icon, to its right, to plot a line chart and bingo! The cohort analysis is complete:

![complete-cohort-analysis][img-8]

We can see that retention *has not*, sadly for us, improved over time. It does appear that the users acquired in August, however, were retained better than those acquired in other months. It would be interesting to understand why: to do this, we'd need to look at how each user was acquired (what drove them to our website), and whether some channels are better at driving "sticky" users than others, and if those channels accounted for a bigger share of user acquisition in August than the other months.

We plan to post more guides to using the recipes directly in ChartIO and other analytics tools, and as building blocks for developing your own, bespoke analysis, over the next few months. Stay tuned!

[launch-post]: /blog/2013/10/18/snowplow-0.8.10-released-with-analytics-recipes-and-cubes/
[cohort-analysis]: /analytics/customer-analytics/cohort-analysis.html
[chartio]: http://chartio.com/
[navicat]: http://www.navicat.com/
[img-1]: /assets/img/blog/2013/10/cohort-analysis/1.JPG
[img-2]: /assets/img/blog/2013/10/cohort-analysis/cohort-analysis-mockup.png
[setup-chartio-instructions]: https://github.com/snowplow/snowplow/wiki/Setting-up-ChartIO-to-visualize-Snowplow-data
[img-3]: /assets/img/blog/2013/10/cohort-analysis/3.JPG
[img-4]: /assets/img/blog/2013/10/cohort-analysis/4.JPG
[img-5]: /assets/img/blog/2013/10/cohort-analysis/5.JPG
[img-6]: /assets/img/blog/2013/10/cohort-analysis/6.JPG
[img-7]: /assets/img/blog/2013/10/cohort-analysis/7.JPG
[img-8]: /assets/img/blog/2013/10/cohort-analysis/8.JPG
[final-cohort-analysis]: /assets/img/blog/2013/10/cohort-analysis/final-cohort-analysis.JPG
[engagement]: /analytics/customer-analytics/user-engagement.html
[clv]: /analytics/customer-analytics/customer-lifetime-value.html
