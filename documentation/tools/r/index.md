---
layout: page
header: title
group: documentation
subgroup: tools
breadcrumb: r
title: Get started analyzing Snowplow data with R
permalink: /documentation/tools/r/
redirect_from:
  - /analytics/tools/r/
  - /analytics/tools-and-techniques/get-started-analysing-snowplow-data-with-r.html
---

<div class="html">
<a name="top"><h1>Getting started analyzing Snowplow data with R</h1></a>
</div>

This guide is geared towards data analysts who have limited or no experience with R. It aims to get the reader started with R through concrete examples with Snowplow data - so that by the end of the guide, the reader can pull Snowplow data into R, play around with it and plot it. That should leave the reader comfortable enough to use other resources to build out her knowledge of R, and give her enough knowledge to start using R to perform productive analytics on Snowplow data.

1. [Why use R?](#why)
2. [Getting started: plotting the number of uniques per day](#start)
3. [Having a look at the data: an introduction to data frames in R](#intro-to-data-frames)
4. [Creating our first plot](#1st-plot)
5. [A more complicated example: comparing visit characteristics by a range of dimensions](#more-complex-example)
6. [Introducing factors in R](#factors)
7. [Producing some more interesting plots with ggplot2](#more-interesting-plots)
8. [Where to go from here](#further-reading)

In the first section of this guide, we outline why R is such an excellent tool to use. Next (sections 2 to 4), we work through how to pull a simple data set from Snowplow and visualize it in R. In sections 5 to 7, we work through a more complicated set of examples: one in which we pull a more involved data set from Snowplow, and visualize it in a number of ways that are difficult with traditional BI / OLAP tools in Excel.

<div class="html">
<a name="why"><h2>1. Why use R?</h2></a>
</div>

R is a fantastic analytics tool. To date, however, only a minority of web analysts use it. To list just some of what makes it so excellent, especially when compared with traditional general purpose tools like Excel, and BI tools like Tableau:

* It is great for producing a wide variety of visualizations - including a much wider than those supported by BI tools
* It has fantastic tools for extending existing visualizations and creating new visualizations all together
* It is easy to document analytics performed with R and retrace your steps. (Simply by copying and pasting your steps into the R console.) This makes R a much *safer* and *more robust* environment to interrogate data than e.g. Excel or Tableau, where if you realize you made an error eight steps back, retracing your steps can be difficult and time consuming.
* It is blindingly fast to both perform complicated analytics and generate beautiful visualizations. The syntax is incredibly concise - what you can achieve in one line of R can take hours of working through menus and options on other systems.
* It helps you think through what you do with your data in a more rigorous way. R forces you to define your data types much more specifically than either Excel or BI tools like Tableau. That rigour is helpful - it means you do things faster, and you're less liable to make mistakes.
* It is great at statistics. Traditional BI tools and Excel *suck* at statistics. Sure you can calculate means, medians, quartiles etc. But actually pulling these together into meaningful distribution plots, or plotting how they change over time, is a pain in these tools, which are much better at counting and summing data. R is simply much better at statistics
* It is a great tool for modeling data: it is straightforward to create models in R, and compare those models to your actual data sets, either formally through calculation, or by plotting you model(s) against your data(sets)
* It has an **enormous** library of packages available for performing just about any type of analytics imaginable
* It is free
* It works on all platforms

In spite of all the benefits listed above, people often find struggle with R to start off with. The command line is a difficult place to start, and R has some idiosyncracies that need to be understood.

In this guide, we cover them by working through practical examples with Snowplow data, paying special attention to covering some of those key concepts and idiosyncracies.

Back to [top](#top).

<div class="html">
<a name="start"><h2>2. Getting started: plotting the number of unique visitors by day</h2></a>
</div>

*If you have not installed R yet, instructions on doing so can be found [here][install-r].*

This guide assumes you have installed R, and installed the `RPostgreSQL` package required to get R to talk to PostgreSQL databases including Amazon Redshift. If you have not, installed this, you can do so by executing the following at the R prompt:

{% highlight r %}
> install.package("RPostgreSQL")
{% endhighlight %}

R will ask you to select a mirror to download the package from. Select a local mirror and the package should install automatically.

Now we need to tell R to use the package:
{% highlight r %}
> library("RPostgreSQL")
{% endhighlight %}

The library lets us execute a SQL query against our data in Redshift, and pulls the result of the query into R as a data frame. (We'll explain a bit about data frames shortly.) The query we want to execute, to find out how many unique visitors we've received to our site by day, is:

{% highlight sql %}
SELECT
to_char(collector_tstamp, 'YYYY-MM-DD') AS "date",
count(distinct(domain_userid)) AS uniques
FROM "public"."events"
GROUP BY "date"
ORDER BY "date";
{% endhighlight %}

To execute the query in R, first we have to setup a connection to our Redshift database, by executing the following commands:

{% highlight r %}
drv <- dbDriver("PostgreSQL")
con <- dbConnect(drv, host="<<ENTER HOST DETAILS HERE>>", port="<<ENTER PORT DETAILS HERE>>",dbname="<<ENTER DB NAME HERE>>", user="<<ENTER USERNAME HERE>>", password="<<ENTER PASSWORD HERE>>")
{% endhighlight %}

(For detials about where to find your host, port, dbname and username see the [setup guide] [install-r].)

Now we can execute the query, and assign it to a variable called `uniquesByDay`, by executing the following:

{% highlight r %}
uniquesByDay <- dbGetQuery(con, "
	SELECT
	to_char(collector_tstamp, 'YYYY-MM-DD') AS \"date\",
	count(distinct(domain_userid)) AS uniques
	FROM \"public\".\"events\"
	WHERE collector_tstamp > '2013-02-22'
	GROUP BY \"date\"
	ORDER BY \"date\"
")
{% endhighlight %}

Note how double inverted commas have to be escaped with a backslash.

Back to [top](#top).

<div class="html">
<a name="intro-to-data-frames"><h2>3. Having a look at the data: an introduction to data frames in R</h2></a>
</div>

We can have a look at the `uniquesByDay` variable by simply entering it at the command line:

{% highlight r %}
uniquesByDay
{% endhighlight %}

R responds by dumping the contents of the variable to the screen. We see that the data is in the form of a table with three columns. The first column is the row number, the second column is the `date` column, and the third is the `uniques` column. We can view just the top 5 lines of data by entering `head(uniquesByDay)` at the prompt. We've pasted the contents of the screen, including what R returns, in our case:

{% highlight r %}
> head(uniquesByDay)
        date uniques
1 2013-02-22      78
2 2013-02-23      70
3 2013-02-24      76
4 2013-02-25     125
5 2013-02-26     130
6 2013-02-27      88
>
{% endhighlight %}

We can find out more about our uniquesByDay object, by typing `summary(uniquesByDay)` at the prompt:

{% highlight r %}
> summary(uniquesByDay)
     date              uniques
 Length:124         Min.   : 16.00  
 Class :character   1st Qu.: 75.75  
 Mode  :character   Median :116.00  
                    Mean   :114.73  
                    3rd Qu.:150.25  
                    Max.   :274.00  
>
{% endhighlight %}

R tells us that our data contains two columns: `date` and `uniques`. It tells us what type each column is: `date` is of type `character`, and `uniques` is a numeric field, for which it gives us some basic statistical information, so we can get a sense of the range of values.

Our `date` column really corresponds to `date`. We can update the data type for this column:

{% highlight r %}
> uniquesByDay$date <- as.Date(uniquesByDay$date)
{% endhighlight %}

When we now look at the summary for our data frame, the type of data in the `date` column has changed:

{% highlight r %}
> summary(uniquesByDay)
      date               uniques
 Min.   :2013-02-22   Min.   : 16.00  
 1st Qu.:2013-03-24   1st Qu.: 75.75  
 Median :2013-04-24   Median :116.00  
 Mean   :2013-04-24   Mean   :114.73  
 3rd Qu.:2013-05-25   3rd Qu.:150.25  
 Max.   :2013-06-25   Max.   :274.00  
>
{% endhighlight %}

We can get further information on the structure of the data frame by executing the `str()` function on it:

{% highlight r %}
> str(uniquesByDay)
'data.frame':	124 obs. of  2 variables:
 $ date   : Date, format: "2013-02-22" "2013-02-23" ...
 $ uniques: num  78 70 76 125 130 88 84 69 35 75 ...
{% endhighlight %}

This confirms that the type of the first column has been set to a date format.

Back to [top](#top).

<div class="html">
<a name="1st-plot"><h2>4. Creating our first plot</h2></a>
</div>

There are a number of built in and additional libraries for plotting data visualizations in R. We recommend starting out with the absolutely excellent `ggplot2`.

First, install the `ggplot2` package, if you have not done so previously:

{% highlight r %}
> install.packages("ggplot2")
{% endhighlight %}

Now that it's installed, you can load the library:

{% highlight r %}
> library("ggplot2")
{% endhighlight %}

Now we can plot the number of uniques over time, using the `qplot` (quickplot) command:

{% highlight r %}
> qplot(date, uniques, data=uniquesByDay, geom="line")
{% endhighlight %}

The plot appears in a new window:

![uniques-by-day] [graph-1]

Back to [top](#top).

<a name="more-complex-example"><h2>5. A more complicated example: comparing visit characteristics by a range of dimensions</h2></a>

The previous example a was simple enough start. It didn't enable us to do anything that could not easily be achieved using any other visualization tool.

In our second example, we'll pull a more complicated data set from Snowplow, and try out some visualizations in GGPlot2 (boxplot and jittered scattergrams) that I think are awesome at conveying distribution information, and are not well supported by other tools.

For this example, we're going to look at visit data by a number of different dimensions, and produce different plots to see how different visit characteristics vary with those different dimensions. This is classically something that is well supported by a BI / OLAP tool like Tableau. The example shows that R has those same capabilities, and in addition, a broader set of visualizations to enable us to unpick relationships between metrics and dimensions.

First, we need to design a SQL query to pull the cut of data we want. In this case, we want visit level data. We want to capture the following metrics for each visit:

* Number of distinct pages viewed (i.e. breadth of content engaged with)
* Total number of events (as a measure of depth engagement)

With the following dimensions:

* Whether or not the user visited our "services" page. (A goal of ours is to drive visitors to buy our services.)
* The landing page the visitor arrived on
* The referer that drove them to our website
* The timestamp the visit started. (So we can analyse e.g. how behavior varies by day of the week.)
* Which country the visitor is located in
* The browser type
* How many times the visitor had visited our website previously

The SQL query to return our required measures by visit and some of the dimensions is straightforward:

{% highlight sql %}
SELECT
domain_userid,
domain_sessionidx,
geo_country,
br_type,
min(collector_tstamp) AS "time_of_first_touch",
count(distinct(page_urlpath)) AS "distinct_pages_visited",
count(*) as "number_of_events"
FROM "public"."events"
WHERE collector_tstamp > '2013-02-22'
GROUP BY domain_userid, domain_sessionidx, geo_country, br_type
{% endhighlight %}

We need to add a line about whether or not one of our services pages was visited as part of the customer journey. We can identify all the visits where the visitor did pop by one of our services pages by executing the following query:

{% highlight sql %}
SELECT
domain_userid,
domain_sessionidx,
1 AS 'visited_services_pages'
FROM "public"."events"
WHERE page_urlpath LIKE '/services/%'
GROUP BY domain_userid, domain_sessionidx, visited_services_pages
{% endhighlight %}

And then join the results of the above query to our first query to generate the additional dimension:

{% highlight sql %}
SELECT
e.domain_userid,
e.domain_sessionidx,
geo_country,
br_type,
visited_services_pages,
min(collector_tstamp) AS "time_of_first_touch",
count(distinct(page_urlpath)) AS "distinct_pages_visited",
count(*) as "number_of_events"
FROM "public"."events" e
LEFT JOIN (
	SELECT
	domain_userid,
	domain_sessionidx,
	'1' AS "visited_services_pages"
	FROM "public"."events"
	WHERE page_urlpath LIKE '/services/%'
	GROUP BY domain_userid, domain_sessionidx, visited_services_pages
) s
ON e.domain_userid = s.domain_userid
AND e.domain_sessionidx = s.domain_sessionidx
WHERE collector_tstamp > '2013-02-23'
GROUP BY e.domain_userid, e.domain_sessionidx, geo_country, br_type, visited_services_pages
{% endhighlight %}

Lastly we add the data about who are referer is, and what the URL of the landing page is. Both of these data points can be read from the first line of data for the visit, so we add them by doing an additional join with the output of the previous query, this time on `domain_userid`, `domain_sessionidx` **and** `min(collector_tstamp)`:

{% highlight sql %}
SELECT
t.domain_userid,
t.domain_sessionidx,
t.geo_country,
t.br_type,
r.page_urlpath AS landing_page,
r.refr_medium,
r.refr_source,
r.refr_term,
r.refr_urlhost,
t.visited_services_pages,
t.time_of_first_touch,
t.distinct_pages_visited,
t.number_of_events
FROM (
	SELECT
	e.domain_userid,
	e.domain_sessionidx,
	geo_country,
	br_type,
	visited_services_pages,
	min(collector_tstamp) AS "time_of_first_touch",
	count(distinct(page_urlpath)) AS "distinct_pages_visited",
	count(*) as "number_of_events"
	FROM "public"."events" AS e
	LEFT JOIN (
		SELECT
		domain_userid,
		domain_sessionidx,
		'1' AS "visited_services_pages"
		FROM "public"."events"
		WHERE page_urlpath LIKE '/services/%'
		GROUP BY domain_userid, domain_sessionidx, visited_services_pages
	) AS s
	ON e.domain_userid = s.domain_userid
	AND e.domain_sessionidx = s.domain_sessionidx
	WHERE collector_tstamp > '2013-02-22'
	GROUP BY e.domain_userid, e.domain_sessionidx, geo_country, br_type, visited_services_pages
) AS t
JOIN "public"."events" AS r
ON t.domain_userid = r.domain_userid
AND t.domain_sessionidx = r.domain_sessionidx
AND t.time_of_first_touch = r.collector_tstamp
{% endhighlight %}

Now that we have our query, we can pull the data into R:

{% highlight r %}
> visits <- dbGetQuery(con, "
	SELECT
	t.domain_userid,
	t.domain_sessionidx,
	t.geo_country,
	t.br_type,
	r.page_urlpath AS landing_page,
	r.refr_medium,
	r.refr_source,
	r.refr_term,
	r.refr_urlhost,
	t.visited_services_pages,
	t.time_of_first_touch,
	t.distinct_pages_visited,
	t.number_of_events
	FROM (
		SELECT
		e.domain_userid,
		e.domain_sessionidx,
		geo_country,
		br_type,
		visited_services_pages,
		min(collector_tstamp) AS \"time_of_first_touch\",
		count(distinct(page_urlpath)) AS \"distinct_pages_visited\",
		count(*) as \"number_of_events\"
		FROM \"public\".\"events\" AS e
		LEFT JOIN (
			SELECT
			domain_userid,
			domain_sessionidx,
			'1' AS \"visited_services_pages\"
			FROM \"public\".\"events\"
			WHERE page_urlpath LIKE '/services/%'
			GROUP BY domain_userid, domain_sessionidx, visited_services_pages
		) AS s
		ON e.domain_userid = s.domain_userid
		AND e.domain_sessionidx = s.domain_sessionidx
		WHERE collector_tstamp > '2013-02-22'
		GROUP BY e.domain_userid, e.domain_sessionidx, geo_country, br_type, visited_services_pages
	) AS t
	JOIN \"public\".\"events\" AS r
	ON t.domain_userid = r.domain_userid
	AND t.domain_sessionidx = r.domain_sessionidx
	AND t.time_of_first_touch = r.collector_tstamp
")
{% endhighlight %}

Our `visits` data frame is more complicated than the `uniquesByDay` data frame we created last time. Let's inspect the structure:

{% highlight r %}
> str(visits)
'data.frame':	21521 obs. of  13 variables:
 $ domain_userid         : chr  "602978179116344f" "eb11ac6179052d3d" "20e77808d8778a3b" "eb11ac6179052d3d" ...
 $ domain_sessionidx     : int  61 2 1 3 10 1 1 4 24 1 ...
 $ geo_country           : chr  "GB" "GB" "GB" "GB" ...
 $ br_type               : chr  "Browser" "Browser" "Browser" "Browser" ...
 $ landing_page          : chr  "/" "/" "/" "/blog/2013/02/15/snowplow-0.7.3-released/" ...
 $ refr_medium           : chr  "" "" "search" "internal" ...
 $ refr_source           : chr  "" "" "Google" "" ...
 $ refr_term             : chr  "" "" "" "" ...
 $ refr_urlhost          : chr  "" "" "www.google.co.uk" "snowplowanalytics.com" ...
 $ visited_services_pages: chr  NA NA "1" NA ...
 $ time_of_first_touch   : POSIXct, format: "2013-02-22 11:51:27" "2013-02-22 11:52:56" ...
 $ distinct_pages_visited: num  1 2 4 1 1 4 4 2 5 10 ...
 $ number_of_events      : num  5 4 5 1 1 4 6 2 5 32 ...
>
{% endhighlight %}

Back to [top](#top).

<div class="html">
<a name="factors"><h2>6. Introducing factors in R</h2></a>
</div>

This is a convenient moment to take a quick aside from our example and introduce factors in R.

In data analysis, we can distinguish three types of variable:

| **Type of variable**   | **Description**   | **Example**   |
|:-----------------------|:------------------|:--------------|
| Continuous | A variable that can take any value with a range | Height of a person, session length |
| Ordinal    | A discrete (not continuous) variable, but one in which there is an order | Sizes of T-shirt (small / medium / large) |
| Nominal    | A discrete (not continuous) variable, where there is no inherent order between values | Landing pages |

Continuous variables in R are typically numeric. Ordinal and nominal variables are factors. We can tell R which of the columns in our data frame are factors. This will help R

1. Process our data more efficiently
2. Plot our data more intelligently (because R will understand the type of variable in each column)

`domain_userid`, for example, is a factor: it can take one of a finite (but large) number of values of cookies set. It is an unordered factor, because there is no hierarchy between values. We can tell R it is factor by entering:

{% highlight r %}
visits$domain_userid <- as.factor(visits$domain_userid)
{% endhighlight %}

If we inspect the structure of that column, we'll see it is now a factor:

{% highlight r %}
> str(visits$domain_userid)
 Factor w/ 9621 levels "","0002ade0b7018c82",..: 3661 8850 1268 8850 596 1142 1619 8850 8695 426 ...
{% endhighlight %}

Let's update the status of our other dimensions in the same way:

{% highlight r %}
> visits$domain_sessionidx <- as.factor(visits$domain_sessionidx)
> visits$geo_country <- as.factor(visits$geo_country)
> visits$br_type <- as.factor(visits$br_type)
> visits$landing_page <- as.factor(visits$landing_page)
> visits$refr_medium <- as.factor(visits$refr_medium)
> visits$refr_source <- as.factor(visits$refr_source)
> visits$refr_term <- as.factor(visits$refr_term)
> visits$refr_urlhost <- as.factor(visits$refr_urlhost)
> visits$visited_services_pages <- as.factor(visits$visited_services_pages)
>
{% endhighlight %}

We can view the updated structure of the data frame:

{% highlight r %}
> str(visits)
'data.frame':	21521 obs. of  13 variables:
 $ domain_userid         : Factor w/ 9621 levels "","0002ade0b7018c82",..: 3661 8850 1268 8850 596 1142 1619 8850 8695 426 ...
 $ domain_sessionidx     : Factor w/ 194 levels "0","1","2","3",..: 62 3 2 4 11 2 2 5 25 2 ...
 $ geo_country           : Factor w/ 106 levels "A1","AD","AE",..: 36 36 36 36 35 25 100 36 53 35 ...
 $ br_type               : Factor w/ 4 levels "Browser","Email Client",..: 1 1 1 1 1 1 1 1 1 1 ...
 $ landing_page          : Factor w/ 137 levels "","/","/about/community.html",..: 2 2 2 74 21 2 25 103 45 2 ...
 $ refr_medium           : Factor w/ 6 levels "","email","internal",..: 1 1 4 3 4 1 1 3 1 1 ...
 $ refr_source           : Factor w/ 19 levels "","Bing Images",..: 1 1 6 1 6 1 1 1 1 1 ...
 $ refr_term             : Factor w/ 56 levels "","arduino","CHARTIO",..: 1 1 1 1 1 1 1 1 1 1 ...
 $ refr_urlhost          : Factor w/ 156 levels "","ab-analytics.com",..: 1 1 104 40 114 1 1 40 1 1 ...
 $ visited_services_pages: Factor w/ 1 level "1": NA NA 1 NA NA NA NA NA NA 1 ...
 $ time_of_first_touch   : POSIXct, format: "2013-02-22 11:51:27" "2013-02-22 11:52:56" ...
 $ distinct_pages_visited: num  1 2 4 1 1 4 4 2 5 10 ...
 $ number_of_events      : num  5 4 5 1 1 4 6 2 5 32 ...
>
{% endhighlight %}

Back to [top](#top).

<div class="html">
<a name="more-interesting-plots"><h2>7. Producing some more interesting plots</h2></a>
</div>

Let's start by examining the breadth and depth of engagement by visit:

{% highlight r %}
> qplot(distinct_pages_visited, number_of_events, data=visits, geom="point")
{% endhighlight %}

![basic-bread-and-depth][graph-2]

That is *kind of* interesting: it shows that we have visitors who engage very deeply with only one page on our site (e.g. the visitor at the top left of the scatter) **and** we have visitors who engage lightly across a broad range of pages (bottom right) and deeply with a lot of pages (top right). However, most of the points are in the bottom left, and they are too closely spaced to see how closely packed they are.

We can get a clearer view if we plot a jitter plot: this "jitters" points left and right about where they would otherwise be plotted, making it easier to identify areas with a high concentration of points:

{% highlight r %}
> qplot(distinct_pages_visited, number_of_events, data=visits, geom="jitter", alpha=I(5/100)) +
scale_y_continuous(limits=c(0,250)) +
scale_x_continuous(limits=c(0,20))

Warning message:
Removed 69 rows containing missing values (geom_point).
{% endhighlight %}

![jitter-with-transparency][graph-3]

Note: we have changed the plot type from "point" to "jitter" to jitter each point. The "alpha" argument is responsible for point transparency: we have set it to 5% (i.e. 20 points in one place will be required to create a black spot). The `scale_y_continuous` and `scale_x_continuous` arguments scale the x and y axes so that we zoom in on the point of the graph where most of our visits lie. R has kindly reminded us that some of our points lie outside this range, and so have been been removed.

The graph shows us that the majority of visitors do not engage deeply. It actually appears that engagement is likely to be *deeper* if a visitor visits *fewer* pages. That is interesting: we can explore if using a boxplot:

{% highlight r %}
> qplot(factor(distinct_pages_visited), number_of_events, data=visits, geom="boxplot") +
scale_y_continuous(limits=c(0,500))
{% endhighlight %}

![boxplot][graph-4]

The boxplot shows that our earlier intuition was wrong: engagement depth increases *with* breadth. We had thought looking at the jittered plot that a higher proportion of people who only engaged with one page engaged more deeply. Now we can see that this was false: it looked to be the case, because the absolute number of people engaging deeply who only look at one page is higher than the actual number who engage deeply with a broader set. The boxplot controls for the difference in absolute numbers: we are instead looking at the distribution within each breadth level.

One thing to notice is that when producing the boxplot, we plot `factor(distinct_pages_visited)` on the x-axis rather than simply `distinct_pages_visited`. That is because whereas a scatter or jitter plot can be produced by plotting a continuous variable on the x-axis, a boxplot requires a discrete variable. Applying the `factor` function converts our continuous variable into a discrete variable very simply: in general, R makes converting one type of variable into another very simple.

The boxplot above was interesting: it showed very clearly a relationship between breadth and depth of engagement by visit. Let's use the same plot, but this time to compare breadth of engagement by landing page:

{% highlight r %}
> qplot(landing_page, distinct_pages_visited, data=visits, geom="boxplot")
{% endhighlight %}

![messy-boxplot][graph-5]

Ouch - this graph is very messy: breadth of engagement does appear to vary by landing page, but there are too many (100+) landing pages to make the analysis straight forward. What we want is to plot the results just for the top 10 landing pages, by number of visits.

To do this, let's start by identifying the top 10 landing pages by number of visits. This is a straightforward query to write in SQL: luckily a package is available for R called `sqldf` that enables you to to execute SQL statements against data frames in R directly, and returns the results as a new data frame:

{% highlight r %}
> install.packages("sqldf")
> library("sqldf")
Loading required package: DBI
Loading required package: gsubfn
Loading required package: proto
Loading required namespace: tcltk
Loading required package: chron
Loading required package: RSQLite
Loading required package: RSQLite.extfuns
> topLandingPages = sqldf("select landing_page, count(*) as cnt from visits group by landing_page order by cnt desc limit 10")
{% endhighlight %}

We've now created a data frame with two columns: `landing_page` (with the landing page name) and `cnt` (with the count of visits). There are 10 lines of data in the frame, which corresopnd to the top 10 landing pages by number of visits.

We can now use this to create a subset of the `visit` data so we only include visits where the landing page is in our top 10 list:

{% highlight r %}
> visitsSubset <- subset(visits, landing_page %in% topLandingPage$landing_page)
{% endhighlight %}

Before we produce our plot, it would be nice to make `landing_page` an ordered factor, where the ordering is determined by the number of visits. This is straightforward to do:

{% highlight r %}
> visitsSubset$landing_page <- factor(
visitsSubset$landing_page,
levels = topLandingPages$landing_page,
ordered=TRUE)
{% endhighlight %}

We can now plot breadth of engagement by landing page, just for the top landing page:

{% highlight r %}
> qplot(landing_page, distinct_pages_visited, data=visitsSubset, geom="boxplot")
{% endhighlight %}

![boxplot-messy-axis][graph-6]

We can tidy up the x-axis by aligning the labels on the axis vertically, by adding ` + theme(axis.text.x = element_text(angle=90, vjust=0.4))` to our command. We can also hide the outliers on our plot, to make it clear, by adding `outlier.shape=NA`:

{% highlight r %}
> qplot(landing_page, distinct_pages_visited, data=visitsSubset, geom="boxplot", outlier.shape=NA) +
theme(axis.text.x = element_text(angle=90, vjust=0.4)) +
scale_y_continuous(limits=c(0,15))
{% endhighlight %}

![tidy-boxplot-breadth-of-engagement][graph-7]

The results are very interesting: visitors who land on the homepage and analytics cookbook are much more likely to engage more broadly with content on the site, rather than visitors who land on the specific blog posts (e.g. on writing Hive UDFs or dealing with Hadoop small files problem.)

Let's see if there is a similar pattern in the *depth* of engagement by landing page. (This is likely: remember we showed in our first boxplot that visitors who engage more broadly are more likely to also engage more deeply.)

{% highlight r %}
> qplot(landing_page, number_of_events, data=visitsSubset, geom="boxplot", outlier.shape=NA) +
theme(axis.text.x = element_text(angle=90, vjust=0.4)) +
scale_y_continuous(limits=c(0,20))
{% endhighlight %}

![tidy-boxplot-depth-of-engagement][graph-8]

The impact of landing page on depth of engagement is not nearly as pronounced as that between landing page and depth of engagement. That is likely to be because of both:

* The *intent* of people landing on specific blog posts is likely to be much more focused on learning specific bits of information (that may not be Snowplow specific), rather than learn about Snowplow in general. (Which someone landing on the hoempage or cookbook homepage are likely to be interested in.)
* The design of the homepage and analytics cookbook homepage encourage users to explore beyond the page much more forcefully than the links that surround individual blog posts.

Let's now have a look and see if breadth of engagement changes depending on the referer type. To do this, we simply swap out `landing_page` as our x-axis dimension (first argument in `qplot`) and swap in `refr_medium`. Also note that we have switched back to using our original data frame `visits`, rather than the subset we created for the landing page analysis:

{% highlight r %}
> qplot(refr_medium, number_of_events, data=visits, geom="boxplot", outlier.shape=NA) +
scale_y_continuous(limits=c(0,30))
{% endhighlight %}

Visitors from email and search tend to engage more deeply with the Snowplow content. Are they more likely to buy our services, though?

{% highlight r %}
> qplot(refr_medium, data=visits, fill=visited_services_page geom="bar", position="fill")
{% endhighlight %}

![barchart-conversion-by-refr-medium][graph-9]

Note that `position="fill"` makes each bar on our bar graph extend 100%.

The chart is interesting - it suggests that even though e.g. direct visitors engage less deeply, overall, they are more likely to visit our services pages (and hence convert) than visitors from search. The relationship between level of engagement and conversion isn't straightforward - we can explore it by comparing our engagement scatter plots (breadth vs depth) for visitors that did visit the services page, with those that do not:

{% highlight r %}
> qplot(distinct_pages_visited, number_of_events, data=visits,
facets = visited_services_pages ~.,geom="jitter", alpha=I(5/100)) +
scale_y_continuous(limits=c(0,250)) +
scale_x_continuous(limits=c(0,20))
{% endhighlight %}

![facetted-scatter-plot][graph-10]

We used the `facet` argument above to ask R to plot us two version of the scatter plot, one for visits where the services pages were visted, and one for visits where they were not, to see if the overall pattern of engagement for the two groups is different. The results are interesting: they suggest that in both cases, there is a strong relationship between breadth and depth of engagement. (These are highly correlated.) However, visitors that visited the services pages are *more likely* to engage both more deeply and more broadly, overall, than those who do not, as evidenced from the lower fraction of points at the bottom right of the graph. (Further visualization work is required to specify this more precisely.)

Back to [top](#top).

<div class="html">
<a name="further-reading"><h2>8. Where to go from here?</h2></a>
</div>

This tutorial barely scratches the surface of what is possible with R. The purpose of it is to give enough familiarity with basic R functions around fetching data, managing data via data frames, and plotting data, that the reader will be able to get up and running with R on top of Snowplow data.

There is a wealth of material on R available. The following are some recommended resources:

* [R in Action][r-in-action]. An excellent and thorough overview of R, with lots of straightforward-to-follow examples
* Hacley Wickham's excellent [ggplot2][ggplot2] book. Written by the author of `ggplot2`, this covers the actual graphics grammar implemented by this excellent library
* [R-bloggers][r-bloggers]. Regular updates, recipes and R-related news

We will be buildling out the number of recipes in the Snowplow Analytics cookbook that use R. At the moment, we have:

* [Performing market basket analysis with R] [market-basket analysis]
* **More to come**...

Back to [top](#top).





[install-r]: https://github.com/snowplow/snowplow/wiki/Setting-up-R-to-perform-more-sophisticated-analysis-on-your-Snowplow-data
[graph-1]: /assets/img/analytics/tools/r/uniques-by-day.png
[graph-2]: /assets/img/analytics/tools/r/breadth-and-depth-engagement.png
[graph-3]: /assets/img/analytics/tools/r/jitter-with-transparency.png
[graph-4]: /assets/img/analytics/tools/r/boxplot.png
[graph-5]: /assets/img/analytics/tools/r/messy-boxplot.png
[graph-6]: /assets/img/analytics/tools/r/boxplot-messy-axis.png
[graph-7]: /assets/img/analytics/tools/r/tidy-boxplot-engagement-breadth-by-landing-page.png
[graph-8]: /assets/img/analytics/tools/r/boxplot-depth-of-engagement-by-landing-page.png
[graph-9]: /assets/img/analytics/tools/r/barchart-conversion-by-refr-medium.png
[graph-10]: /assets/img/analytics/tools/r/facetted-scatter.png
[r-in-action]: http://www.manning.com/kabacoff/
[r-bloggers]: http://www.r-bloggers.com/
[market-basket analysis]: /analytics/catalog-analytics/market-basket-analysis-identifying-products-that-sell-well-together.html
[ggplot2]: http://www.amazon.com/gp/product/0387981403
