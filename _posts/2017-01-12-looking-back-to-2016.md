---
layout: post
title: Looking back into 2016
title-short: Looking back into 2016
tags: [snowplow]
author: Diogo
category: Inside the Plow
---

![looking-back-to-2016] [looking-back-to-2016]

With the start of 2017, we have decided to look back at our 2016 blog and our community Discourse posts that generated more engagement with our users.

A total of 548 hours were spent by more than 10 000 unique users on our blog posts while on Discourse, 424 hours were spent by 8 700 unique users.

In this post we will cover:

1. [Top 10 blog posts](/blog/2017-01-12-looking-back-to-2016#Top10blogpost)
3. [Top 10 Discourse posts](/blog/2017-01-12-looking-back-to-2016#discourseposts)


<!--more-->

<h2 id="Top10blogpost">1. Top 10 blog posts</h2>

Let's start by looking into our top 10 blog posts per unique users.

<table class="table">
  <thead>
  <tr>
    <th>Top</th>
    <th>Blog posts</th>
    <th>Unique users</th>
    <th>Time in min</th>
  </tr>
  </thead>
  <tbody>
  <tr>
     <td>1</td>
    <td><a href="http://snowplowanalytics.com/blog/2016/03/16/introduction-to-event-data-modeling">An introduction to event data modeling</a></td>
    <td>1504</td>
    <td>5220</td>
  </tr>
  <tr>
    <td>2</td>
    <td><a href="http://snowplowanalytics.com/blog/2016/04/08/introducing-snowplow-mini/">Introducing Snowplow Mini</a></td>
    <td>1156</td>
    <td>3141</td>
  </tr>
  <tr>
    <td>3</td>
    <td><a href="http://snowplowanalytics.com/blog/2016/04/09/introducing-factotum-data-pipeline-runner/">Introducing Factotum data pipeline runner</a></td>
    <td>1072</td>
    <td>1729</td>
  </tr>
  <tr>
    <td>4</td>
    <td><a href="http://snowplowanalytics.com/blog/2016/01/07/we-need-to-talk-about-bad-data-architecting-data-pipelines-for-data-quality/">We need to talk about bad data</a></td>
    <td>891</td>
    <td>2330</td>
  </tr>
  <tr>
    <td>5</td>
    <td><a href="http://snowplowanalytics.com/blog/2016/03/07/ad-impression-and-click-tracking-with-snowplow/">Ad impression and click tracking with Snowplow</a></td>
    <td>791</td>
    <td>2013</td>
  </tr>
  <tr>
    <td>6</td>
    <td><a href="http://snowplowanalytics.com/blog/2016/09/22/introducing-sauna-a-decisioning-and-response-platform/">Introducing Sauna, a decisioning and response platform</a></td>
    <td>761</td>
    <td>1930</td>
  </tr>
  <tr>
    <td>7</td>
    <td><a href="http://snowplowanalytics.com/blog/2016/03/03/snowplow-javascript-tracker-2.6.0-released-with-optimizely-and-augur-integration/">Snowplow JavaScript Tracker 2.6.0 released with Optimizely and Augur integration</a></td>
    <td>619</td>
    <td>1485</td>
  </tr>
  <tr>
    <td>8</td>
    <td><a href="http://snowplowanalytics.com/blog/2016/02/22/building-first-and-last-touch-attribution-models-in-redshift-sql/">Building first and last touch attribution models in Redshift SQL</a></td>
    <td>511</td>
    <td>1686</td>
  </tr>
  <tr>
    <td>9</td>
    <td><a href="http://snowplowanalytics.com/blog/2016/03/03/guide-to-debugging-bad-data-in-elasticsearch-kibana/">Debugging bad data in Elasticsearch and Kibana - a guide</a></td>
    <td>460</td>
    <td>776</td>
  </tr>
  <tr>
    <td>10</td>
    <td><a href="http://snowplowanalytics.com/blog/2016/01/17/web-and-mobile-data-only-gets-you-to-first-base-when-building-a-single-customer-view/">Web and mobile data only gets you to first base when building a single customer view</a></td>
    <td>341</td>
    <td>921</td>
  </tr>
</tbody>
</table>

While this ranking already gives us some insights on what type of content drove more engagement, let's plot this data against the average time spent per unique users to further understand the content consumption.


####Number of unique users per average time spent

![top2016_1_f] [top2016_1_f]

The blog post [An introduction to event data modeling](http://snowplowanalytics.com/blog/2016/03/16/introduction-to-event-data-modeling">An introduction to event data modeling) was a conceptual guide about event data modelling which we believe that although not Snowplow specific resonated most with our readers not only in terms of volume of users but also on the average time spent. [Building first and last touch attribution models in Redshift SQL](http://snowplowanalytics.com/blog/2016/02/22/building-first-and-last-touch-attribution-models-in-redshift-sql/) as it was the second most engage blogs post per average time spent per user. [Introducing Snowplow Mini](Introducing Snowplow Mini) helped Snowplow users to speed up the process of testing Snowplow tracking prior rolling out the fully fledged Snowplow pipeline.[Introducing Factotum data pipeline runner](http://snowplowanalytics.com/blog/2016/04/09/introducing-factotum-data-pipeline-runner/) being the third most popular blog post was a surprise as this was a piece of software developed mainly for internal use and we were not expecting Snowplow users to use it on their pipelines.

After looking at ranking and data visualisation we understand that data modelling is one of the key drivers of engagements having 6 out 10 blog posts ranks.

<h2 id="Sourceoftraffic">2. Source of traffic</h2>


To better understand how did the users reached us we have decided to look at the `refr_medium `. We have plotted the blog posts per referrer to understand the distribution of traffic between the posts.


####Distribution of unique users per different sources of traffic ranked by total unique users:

![top2016_2_f] [top2016_2_f]

Search was a significant driver for many posts and after further investigation, we discovered that for example, the top post [An introduction to event data modeling](http://snowplowanalytics.com/blog/2016/03/16/introduction-to-event-data-modeling) was ranking as the first result in the Google search when searched "Event data modelling". Direct traffic drove significant more traffic for [Introducing Factotum data pipeline runner](http://snowplowanalytics.com/blog/2016/04/09/introducing-factotum-data-pipeline-runner/) and [Introducing Sauna, a decisioning and response platform](http://snowplowanalytics.com/blog/2016/09/22/introducing-sauna-a-decisioning-and-response-platform/) while Social had a significant impact for the top 6 posts.

Let's now look at our top Discourse posts.

<h2 id="discourseposts">3. Discourse posts</h2>

<table class="table">
  <thead>
  <tr>
    <th>Top</th>
    <th>Discourse posts</th>
    <th>Unique users</th>
    <th>Time in min</th>
  </tr>
  </thead>
  <tbody>
  <tr>
     <td>1</td>
    <td><a href="http://discourse.snowplowanalytics.com/t/visualise-snowplow-data-using-airbnb-caravel-redshift-tutorial/515">Visualise Snowplow data using Airbnb Caravel & Redshift [tutorial]</a></td>
    <td>530</td>
    <td>1121</td>
  </tr>
  <tr>
    <td>2</td>
    <td><a href="http://discourse.snowplowanalytics.com/t/identifying-users-identity-stitching/31">Identifying users (identity stitching)</a></td>
    <td>429</td>
    <td>979</td>
  </tr>
  <tr>
    <td>3</td>
    <td><a href="http://discourse.snowplowanalytics.com/t/should-i-use-views-in-redshift/410">Should I use views in Redshift?</a></td>
    <td>362</td>
    <td>376</td>
  </tr>
  <tr>
    <td>4</td>
    <td><a href="http://discourse.snowplowanalytics.com/t/wagon-alternative/579/">Wagon alternative</a></td>
    <td>277</td>
    <td>177</td>
  </tr>
  <tr>
    <td>5</td>
    <td><a href="http://discourse.snowplowanalytics.com/t/how-to-setup-a-lambda-architecture-for-snowplow/249">How to setup a Lambda architecture for Snowplow</a></td>
    <td>251</td>
    <td>806</td>
  </tr>
  <tr>
    <td>6</td>
    <td><a href="http://discourse.snowplowanalytics.com/t/debugging-a-serializable-isolation-violation-in-redshift-error-1023-tutorial/420">Debugging a Serializable isolation violation in Redshift (ERROR: 1023) [tutorial]</a></td>
    <td>208</td>
    <td>496</td>
  </tr>
  <tr>
    <td>7</td>
    <td><a href="http://discourse.snowplowanalytics.com/t/debugging-bad-rows-in-spark-and-zeppelin-tutorial/400">Debugging bad rows in Spark and Zeppelin [tutorial]</a></td>
    <td>201</td>
    <td>296</td>
  </tr>
  <tr>
    <td>8</td>
    <td><a href="http://discourse.snowplowanalytics.com/t/comparing-snowplow-with-google-analytics-360-bigquery-integration-wip/666">Comparing Snowplow with Google Analytics 360 BigQuery integration (WIP)</a></td>
    <td>184</td>
    <td>480</td>
  </tr>
  <tr>
    <td>9</td>
    <td><a href="http://discourse.snowplowanalytics.com/t/basic-sql-recipes-for-web-data/25">Basic SQL recipes for web data</a></td>
    <td>183</td>
    <td>726</td>
  </tr>
  <tr>
    <td>10</td>
    <td><a href="http://discourse.snowplowanalytics.com/t/loading-snowplow-events-into-apache-spark-and-zeppelin-on-emr-tutorial/153">Loading Snowplow events into Apache Spark and Zeppelin on EMR [tutorial]</a></td>
    <td>181</td>
    <td>289</td>
  </tr>
</tbody>
</table>

Now let's plot the same visualisation as before:

####Number of unique users per average time spent:

![top2016_3_f] [top2016_3_f]

The Discourse post about [Visualise Snowplow data using Airbnb Caravel & Redshift](http://discourse.snowplowanalytics.com/t/visualise-snowplow-data-using-airbnb-caravel-redshift-tutorial/515) was the post that drove more users demonstrating that users are really looking for ways to visualise and analyse the data. Our post about [Basic SQL recipes for web data](http://discourse.snowplowanalytics.com/t/basic-sql-recipes-for-web-data/25) ranked 1s for engaged time. Here we have several SQL recipes on how to calculate several metrics such as the % of new visits to the split between mobile and web traffic. Our post about [Identifying users (identity stitching)](http://discourse.snowplowanalytics.com/t/identifying-users-identity-stitching/31) which allows our readers to build  users models and "stitch" different user identifiers against, for example, a login ID, enabling to aggregate, for example, the different devices under the same login ID.

The Discourse posts demonstrated a demand for more content related to data modelling as 9 of 10 posts were about data modeling.

<h2 id="conclusion">4. Conclusion</h2>


As Both the blog and Discourse posts demonstrated, data modelling is a hot topic among our users.

SNOWPLOW SELL ABOUT UNIQUENESS

As we continue to grow we promise that we will keep engaging with our community and readers and share interesting and different data modelling solutions that will fit diverse data scenarios.

So please, do stay tuned to our [Blog](http://snowplowanalytics.com/blog/),  [Discourse](http://discourse.snowplowanalytics.com/) and [Twitter](https://twitter.com/snowplowdata) during 2017.



[looking-back-to-2016]: /assets/img/blog/2017/01/looking-back-to-2016.jpg
[top2016_1_f]: /assets/img/blog/2017/01/top2016_1_f.png
[top2016_2_f]: /assets/img/blog/2017/01/top2016_2_f.png
[top2016_3_f]: /assets/img/blog/2017/01/top2016_3_f.png
