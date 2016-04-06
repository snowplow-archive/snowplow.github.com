---
layout: post
title: "How RJ Metrics measure content engagement with Snowplow: a case study"
title-short: How RJMetrics measure content engagement with Snowplow
tags: [case study, mode analytics, content marketing, measuring engagement]
author: Yali
category: User Stories
---

*This is a guest post written by Drew Banin from [RJMetrics] [rjmetrics], on how the RJMetrics team uses Snowplow internally to measure and optimize their content marketing. Big thanks to Drew for sharing this with us and the wider Snowplow community! If you have a story to share, [get in touch][contact]*.

One of the major headaches of content marketing is the shortcomings of traditional success measurement. While many marketers quietly obsess over traffic and social shares, in reality those metrics only measure a percentage of your efforts. In other words, you got people to click, but did they like the content? Did they *engage*?

These engagement metrics were the focus for my marketing team after we published a major report. As you might guess from our company name ([RJMetrics][rjmetrics]), we aren’t really content with surface value data. It’s the more complex metrics that allow us to determine what parts of our content are effective; and so we turned to Snowplow to provide us with the event tracking data and insights we needed to ensure continual improvement.

## A benchmark case study

In October, RJMetrics released [The State of Data Science][state-of-data-science], which was extremely successful – nearly 13,000 views and 1400+ social shares within the first month.

![Page views for RJ Metrics state of data science report][img1]

To give you a little context, this wasn’t our first benchmark, but it was one of the first reports we released as an interactive page on the web. These reports have historically been a major source of lead generation, and before the beginning of this year, we accomplished that by asking people to provide their email in exchange for a PDF download.

<!--more-->

There were a few problems with PDFs:

1. They don’t rank in search
2. They aren’t easily shareable
3. They are cumbersome to work with on our end
4. They provide a less than ideal reading experience
5. They collect no data on how people are interacting with content

Because of these reasons we made the decision to do away with PDFs in favor of putting the entire report on the web, gated only by a modal asking for an email address. That modal looks like this:

![Enter your work email to keep reading][img2]

Yes, we do track conversion rate on this form, and that’s a really important metric. But for this case study we were interested in exploring data we couldn’t access before – engagement with the content. For this kind of page depth analysis you’ll need tools that are a little more sophisticated than Google Analytics.

## How we used Snowplow

Once we had our Snowplow analysis set up and piping data into Amazon Redshift, we were able to use [Mode][mode-analytics] to query the data directly, and visualize those query results.

{% highlight psql %}
WITH events AS (
	SELECT * from atomic.events WHERE page_url ILIKE '%/resources/reports/the-state-of-data-science%'
),
users AS (
	SELECT distinct domain_userid from events
),
page_pings AS (
	SELECT * from events where events.event = 'page_ping'
),
max_y_pos AS (
	SELECT domain_userid, max(pp_yoffset_max) max_y from page_pings group by 1
),
time_on_site AS (
	-- jitter points on plot
	SELECT domain_userid, (count(*) * 10) + random() * 10 - 5 time_on_site from page_pings group by 1
),
signups AS (
	SELECT distinct domain_userid FROM events WHERE event = 'unstruct' AND unstruct_event LIKE '%submit_form%'
)
SELECT users.domain_userid, max_y_pos.max_y, time_on_site.time_on_site,
		CASE WHEN signups.domain_userid IS NULL THEN 0 ELSE 1 END as signed_up
	FROM users
	LEFT OUTER JOIN max_y_pos ON max_y_pos.domain_userid = users.domain_userid
	LEFT OUTER JOIN time_on_site ON time_on_site.domain_userid = users.domain_userid
	LEFT OUTER JOIN signups ON signups.domain_userid = users.domain_userid
{% endhighlight %}

That analysis software cocktail (plus some SQL, see above) produced this chart (see below), which separates users who did and did not enter their email, and how far they got on the page (the higher they are on the chart, the more they scrolled down).

![Time Reading Data Science Benchmark Report vs. Scroll Height][img3]

When analyzing this data, there are a few things we needed to keep in mind:

* The yellow line at the 5k mark is when the visitor is presented with the modal that requests their email address
* 25k is the end of the page for most users
* If a user returns to the page, they don’t need to enter their email address again, which is why you see blue dots above the signup form line

## What we determined from this data?

So, with this context, what can we tell from this graph? First and foremost, **a lot of people are making it to the end of the page**. We were excited to see this. The State of Data Science is a massive 4000-word report. In the world of “bite-sized content” we were pleased to see that readers were sticking with it to the end.

As with most web analytics, the takeaways here are mostly guideposts. Here are two things that jumped out to me.

* **Form conversion**. Conversion from landing on this page to entering email address isn’t superb (just over 16%). We think this has something to do with how people perceive the value of the content. A PDF still communicates “valuable research!” whereas a web page says something like “this is a blog post!” And requesting an email address on a blog post feels unfair. We might have some work to do there.

* **Modal placement**. If we move the modal farther down the page, my hypothesis is that we would get more people to give us their email address. They’ll get deeper into the content and realize that this is an-depth report and feel less annoyed when we ask for an email address. This change would be focused on moving the users in green to above that orange line:

![visualization to optimize modal placement][img4]

## Further Possibilities

Slicing data can be extremely beneficial, or it can just be analysis for analysis sake; it depends on whether you ask yourself what you want to gain from the analysis before you make the changes.

Here are list of things I would like to dig into further (when time permits):

1. **Splitting the data by source** (organic, Twitter, etc.): If one particular source is outperforming the others and is sending extremely engaged users to this page, we can concentrate on promoting the benchmark heavily through that channel.
2. **Disqualify those users returning to the page, concentrating only on unique views**: This chart has its faults. The fact that there are some data points who’ve signed up but are still marked as “Did Not Enter Email” makes it hard to make any legitimate statements about data.
3. **Add content indicators (horizontal lines) for different sections of the report**: This would allow us to see which paragraphs were particularly compelling (low dropoff) and which ones needed some more work (high dropoff).
4. **Segment by persona**: By integrating our event data with the persona data we collect in Pardot, we could see how a specific piece of content is performing with our various audiences.

If you’re interested in this type of analysis, Snowplow will move your data directly to Amazon Redshift where you can analyze it using a tool like [Mode][mode-analytics]. If you want to explore web data alongside other data sources, like Salesforce, MySQL, and Quickbooks, check out [RJMetrics Pipeline][rjmetrics-pipeline] -- It’s the easiest way to integrate all of your data sources into a single data warehouse.


[rjmetrics]: https://rjmetrics.com/
[contact]: /contact/
[state-of-data-science]: https://rjmetrics.com/product/meet-pipeline?utm_source=snowplow&utm_medium=guest-post&utm_campaign=guest-post+snowplow
[img1]: /assets/img/blog/2016/02/rjmetrics-state-of-data-science-pageviews.png
[img2]: /assets/img/blog/2016/02/enter-your-work-email-to-keep-reading.png
[img3]: /assets/img/blog/2016/02/rjmetrics-viz-1.png
[img4]: /assets/img/blog/2016/02/rjmetrics-viz-2.png

[sql]: https://github.com/drewbanin/rjm-growth/blob/master/benchmark-engagement.sql
[mode-analytics]: https://modeanalytics.com/
[rjmetrics-pipeline]: https://rjmetrics.com/product/meet-pipeline?utm_source=snowplow&utm_medium=guest-post&utm_campaign=guest-post+snowplow
