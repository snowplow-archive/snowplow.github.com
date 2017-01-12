---
layout: post
title: Looking back at 2016
title-short: Looking back at 2016
tags: [snowplow]
author: Diogo
category: Inside the Plow
---

![looking-back-to-2016] [looking-back-to-2016]

With the start of 2017, we have decided to look back at our 2016 blog and our community Discourse posts that generated more engagement with our users.

More than ten thousand users spent a total of 548 hours reading our blog posts whilst on Discourse (which we only launched this year), 8700 unique users spent 424 hours reading and participating in the Snowplow community.

Let's take a closer look at:

1. [Top 10 blog posts published in 2016](/blog/2017/01/12/looking-back-at-2016/#top10blogpost)
2. [Top 10 Discourse threads published in 2016](/blog/2017/01/12/looking-back-at-2016/#discourseposts)

<!--more-->

<h2 id="top10blogpost">1. Top 10 blog posts published in 2016</h2>

Let's start by looking into our top 10 blog posts by number of unique users.

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

While this ranking already gives us some insights on what type of content drove the most engagement, let's plot this the number of uniques against the average engagement time per post by unique, to compare compare posts not only by how many people each attracts but how long each of those people spends reading the content (at least on average).


#### Number of unique users per average time spent

![top2016_1_f] [top2016_1_f]

The blog post, [An introduction to event data modeling](http://snowplowanalytics.com/blog/2016/03/16/introduction-to-event-data-modeling">An introduction to event data modeling), stands out as the post that not only attracted the largest number of readers but also kept them reading longer than any of the other 10 posts. Event data modeling is a hot topic: one we've done a lot of thinking about at Snowplow over hte last 18 months. This was the first post where we started to sketch out an overall approach and highlight some of the key challenges to event data modeling, and it's great to see that the community at large engaged with us. We've certainly had a lot of interesting conversations of that back of that blog post, and the presentations and other posts and threads on this topic.

It's therefore also great to see that the second post by average time engaged per user was another event data modeling post - this time on [building first and last touch attribution models in Redshift SQL](http://snowplowanalytics.com/blog/2016/02/22/building-first-and-last-touch-attribution-models-in-redshift-sql/).

Snowplow Mini was a surprise hit for us in 2016. The initial version was prototyped on a company hackathon back in Feb. By the time we published [Introducing Snowplow Mini](http://snowplowanalytics.com/blog/2016/04/08/introducing-snowplow-mini/) we had already piloted its use across a number of our users and found that it was invaluable to them as they developed new event and entity (context) schemas: enabling to test those instrumentation updates prior to rolling them out.

[Introducing Factotum data pipeline runner](http://snowplowanalytics.com/blog/2016/04/09/introducing-factotum-data-pipeline-runner/) was the third most popular blog post by number of users. This is very exciting: Factotum is something we developed at Snowplow to make our jobs of reliably instrumenting and running a huge number of data pipelines, each defined by a DAG, efficiently and robustly across  hundreds of our users. The interest in Factotum shows that other people and companies are also interested in better managing the ongoing running of complciated, multi-step data pipelines.

<h2 id="Sourceoftraffic">Drilling into the source of traffic of the top 10 blog posts</h2>

To better understand the channels that drove users to our most read posts, we can split traffic by `refr_medium `. We have plotted the blog posts per referrer to understand the distribution of traffic between the posts.

#### Distribution of unique users per different sources of traffic ranked by total unique users:

![top2016_2_f] [top2016_2_f]

Search was a significant driver for many posts and after further investigation, we discovered that for example, the top post [An introduction to event data modeling](http://snowplowanalytics.com/blog/2016/03/16/introduction-to-event-data-modeling) was ranking as the first result in the Google search when searched "Event data modelling". Direct traffic drove significant more traffic for [Introducing Factotum data pipeline runner](http://snowplowanalytics.com/blog/2016/04/09/introducing-factotum-data-pipeline-runner/) and [Introducing Sauna, a decisioning and response platform](http://snowplowanalytics.com/blog/2016/09/22/introducing-sauna-a-decisioning-and-response-platform/) while Social had a significant impact for the top 6 posts.

Let's now look at our top Discourse posts.

<h2 id="discourseposts">2. Top 10 Discourse threads published in 2016</h2>

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
    <td><a href="http://discourse.snowplowanalytics.com/t/visualise-snowplow-data-using-airbnb-caravel-redshift-tutorial/515">Visualise Snowplow data using Airbnb Caravel &amp; Redshift [tutorial]</a></td>
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

#### Number of unique users per average time spent:

![top2016_3_f] [top2016_3_f]

The Discourse tutorial on [Visualis[ing] Snowplow data using Airbnb Caravel & Redshift](http://discourse.snowplowanalytics.com/t/visualise-snowplow-data-using-airbnb-caravel-redshift-tutorial/515) was the post that attracted the largest number of users: people are certainly interested in open source tools for visualizing data! It's not a surprise therefore that the post [Wagon alternative](http://discourse.snowplowanalytics.com/t/wagon-alternative/579) also featured in the top 10.

Our [Basic SQL recipes for web data](http://discourse.snowplowanalytics.com/t/basic-sql-recipes-for-web-data/25) ranked first for engaged time: perhaps not surprising as it's likely readers will have walked through the different example queries whilst testing them on their own Snowplow data.

Event data modeling also feature in the top 10 with our post [Identifying users (identity stitching)](http://discourse.snowplowanalytics.com/t/identifying-users-identity-stitching/31).

It's also great to see the active interest in Spark by the Snowplow community - two of the top 10 posts are about analyzing Snowplow data with Spark.

<h2 id="conclusion">What should we be writing about in 2017?</h2>

If you have any ideas then let us know. Please stay tuned to our [Blog](http://snowplowanalytics.com/blog/), [Discourse](http://discourse.snowplowanalytics.com/) and [Twitter](https://twitter.com/snowplowdata) during 2017.

And [sign up to our mailing list][mailing-list] for a monthy digest of new content by the Snowplow Team and broader Snowplow Community.

[looking-back-to-2016]: /assets/img/blog/2017/01/looking-back-to-2016.jpg
[top2016_1_f]: /assets/img/blog/2017/01/top2016_1_f.png
[top2016_2_f]: /assets/img/blog/2017/01/top2016_2_f.png
[top2016_3_f]: /assets/img/blog/2017/01/top2016_3_f.png
[mailing-list]: http://eepurl.com/b0yEgz
