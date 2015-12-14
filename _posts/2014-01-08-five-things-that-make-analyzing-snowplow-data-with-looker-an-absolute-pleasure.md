---
layout: post
title: Five things that make analyzing Snowplow data in Looker an absolute pleasure
tags: [snowplow, analysis, looker]
author: Yali
category: Releases
---

*Towards the end of 2013 we published our first blog post on [Looker] [looker] where we explored at a technical level why Looker is so well suited to analyzing Snowplow data. Today we [released Snowplow 0.8.13] [looker-release], the [Looker release] [looker-release]. This includes a metadata model to make it easy for Snowplow users to get up and running with Looker on top of Snowplow very quickly. In this post, we get a bit less theoretical, and highlight five very tangible reasons why analyzing Snowplow data with Looker is such an absolute pleasure.*

1. [Slice and dice any combination of dimension and metrics](/blog/2014/01/08/five-things-that-make-analyzing-snowplow-data-with-looker-an-absolute-pleasure/#any-dimension-or-metric-combination)
2. [Quickly and easily define dimensions and metrics that are specific to your business using Looker's lightweight metadata model](/blog/2014/01/08/five-things-that-make-analyzing-snowplow-data-with-looker-an-absolute-pleasure/#define-your-own-metrics-and-dimensions)
3. [Drill up and drill right down to visitor-level and event-level data](/blog/2014/01/08/five-things-that-make-analyzing-snowplow-data-with-looker-an-absolute-pleasure/#drill-up-and-down)
4. [Dashboards are a strating point for more involved analysis](/blog/2014/01/08/five-things-that-make-analyzing-snowplow-data-with-looker-an-absolute-pleasure/#dashboards)
5. [Access your data from *any* application: Looker as a general purpose data server](/blog/2014/01/08/five-things-that-make-analyzing-snowplow-data-with-looker-an-absolute-pleasure/#data-server)

<div class="html">
<a name="any-dimension-or-metric-combination"><h2>1. Slice and dice any combination of dimension and metrics</h2></a>
</div>

With Looker, you can slice your Snowplow data by *any* dimension / metric combination. To give some illustrative examples - we can plot the number of visits, bounce rate, pages per visit and events per visit by landing page:

<div class="html">
<a href="/assets/img/blog/2014/01/looker/metrics-by-landing-page.JPG"><img src="/assets/img/blog/2014/01/looker/metrics-by-landing-page.JPG" title="Querying metrics by landing page" /></a>
</div>

<!--more-->

We may want to plot the number of *new* visitors by landing page over time:

<div class="html">
<a href="/assets/img/blog/2014/01/looker/new-visitors-by-landing-page-over-time.JPG"><img src="/assets/img/blog/2014/01/looker/new-visitors-by-landing-page-over-time.JPG" title="Plotting the number of visits by landing page over time" /></a>
</div>

Or perhaps we want to compare the number of transactions by customers based on the channel they were *first* acquired on (first touch referer source):

<a href="/assets/img/blog/2014/01/looker/metrics-by-original-mkt-source.JPG"><img src="/assets/img/blog/2014/01/looker/metrics-by-original-mkt-source.JPG" title="Number of visitor-level metrics plotted by original (first touch) marketing channel" /></a>

Creating the above slices of data is as simple as selecting the dimension / metric combination from the long list provided in the Looker UI.

<div class="html">
<a name="define-your-own-metrics-and-dimensions"><h2>2. Quickly and easily define dimensions and metrics that are specific to your business using Looker's light-weight metadata model</h2></a>
</div>

Looker's metadata model makes it very easy to define and analyze busines specific:

1. Events
2. Dimensions (e.g. audience segments, session classification)
3. Funnels
4. Metrics

To give a very specific example: at Snowplow we are very interested in whether or not visitors to our website visit the 'services' pages, for example, as that indicates that they are potentially interested in our Pro Services offering.

We can add a dimension to our [`events.lookerml`] [events.lookerml] model that categorises whether a specific event has occurred on a services page or not:

{% highlight yaml %}
  # Snowplow-website specific dimension
  - dimension: occurred_on_services_page
    type: yesno
    sql: ${page_urlpath} LIKE '%services%'
{% endhighlight %}

We can then create a metric that counts the number of events that occur on services pages, further down the [`events.lookerml`] [events.lookerml] definition:

{% highlight yaml %}
  # Snowplow-website specific metric
  - measure: events_on_services_page_count
    type: count
    filters:
      occurred_on_services_page: yes
{% endhighlight %}

Both the above dimension and metric will now be available to include in any report produced in the Explorer. For example, we can now compare the number of events that occurred on services page by marketing campaign, landing page or over time.

<a href="/assets/img/blog/2014/01/looker/events-on-services-page-by-day.JPG"><img src="/assets/img/blog/2014/01/looker/events-on-services-page-by-day.JPG" title="Plotting the number of events on services pages by day" /></a>

We can define additional derived metrics (e.g. average events on a service page per visitor / session) or dimensions (e.g. classify visitors by whether or not they have visited the services pages at all) by simply extending the metadata model. The Looker metadata model is flexible enough to extend with your business, as you become more sophisticated in your use of data.

<div class="html">
<a name="drill-up-and-down"><h2>3. Drill-up and drill-down to visitor-level and event-level data</h2></a>
</div>

To illustrate this, let's start by comparing visit and engagement levels by refer medium for the last month (i.e. a session-level analysis):

<a href="/assets/img/blog/2014/01/looker/visit-and-engagement-levels-by-refer-medium.JPG"><img src="/assets/img/blog/2014/01/looker/visit-and-engagement-levels-by-refer-medium.JPG" title="Visit numbers and engagement levels by referer medium" /></a>

We can see visitors referered from other websites appear to engage more deeply, on average. We can explore that further, to see if it is true across e.g. all landing pages, by clicking on the **Landing Page Count** (which is "7" and circled above):

This opens another view, which lets us compare events per visit and bounce rates by the seven different landing pages that users refered to our websites from other websites were driven to. It looks like users refered from external websites to our recipe on market basket analysis engaged particularly deeply with our website:

<a href="/assets/img/blog/2014/01/looker/visit-and-engagement-levels-by-landing-page.JPG"><img src="/assets/img/blog/2014/01/looker/visit-and-engagement-levels-by-landing-page.JPG" title="Visit numbers and engagement levels by landing page" /></a>

We can explore this further by clicking on the visit count to see the actual visits. For example, if we click on the "17" visits to the market basket analysis (circled above)...

<a href="/assets/img/blog/2014/01/looker/visits-to-market-basket-analaysis-recipe.JPG"><img src="/assets/img/blog/2014/01/looker/visits-to-market-basket-analaysis-recipe.JPG" title="Exploring visits that land on teh market basket analysis recipe post" /></a>

...we are shown an actual list of the 17 visits, including the cookie ID and the time each visitor spent on the website. (Note that all but the 3rd visitor were visiting our website for the first time).

It looks like the 9th visitor on the list was on our website for a particularly long period of time - let's click on "Event Stream" (circled above) to find out what he / she actually did on the website:

<a href="/assets/img/blog/2014/01/looker/session-complete-event-stream.JPG"><img src="/assets/img/blog/2014/01/looker/session-complete-event-stream.JPG" title="Drilling in to the individual event stream for a particular session" /></a>

We are now shown the *complete event stream* for that user on that session. Incredibly, the visitor *only* visited that recipe page (did not navigate to any other pages on our website).

<a name="dashboards"><h2>4. Dashboards are a starting point for more involved analysis</h2></a>

It is straightforward in Looker to develop customized dashboards. The following is an example of one included in our [Looker release] [looker-release]:

<a href="/assets/img/blog/2014/01/looker/7-day-dashboard.JPG"><img src="/assets/img/blog/2014/01/looker/7-day-dashboard.JPG" title="7 day dashboard built in Looker on top of Snowplow data" /></a>

Most BI tools offer great dashboarding facilities. What we like particularly about Looker's is that clicking on any of the graphs sends you straight into the Explorer, so you can then start slicing / dicing and drilling in as described in the sections above. For example, if you clicked on the data point circled above (representing the number of visits from search engines to the website on January 6th) brings up a list of all those different sessions. We can then click on the **Event Stream** for any of those sessions to see what actually occurred.

<a href="/assets/img/blog/2014/01/looker/session-drilldown.JPG"><img src="/assets/img/blog/2014/01/looker/session-drilldown.JPG" title="Drilling down into an individual session" /></a>

<a name="data-server"><h2>5. Access your data from <i>any</i> application: Looker as a general purpose data server</h2></a>

As well as enabling users to plot graphs directly in Looker, it is also possible to use Looker as a data server to make your data easily available to other applications to visualize.

You can set Looker up to make specific slices of data available at designated URLs, in JSON, CSV or tab-delimited format, so that it can easily be ingested and refreshed from any application, including:

* Web applications (e.g. built using [D3.js] [d3-js])
* Analytics tools e.g. R, Python / Pandas
* Spreadsheets e.g. Google Docs and Excel

Say for example the following cut of data was important to us (the number of visits and events per visitor by web page, for the last week):

<a href="/assets/img/blog/2014/01/looker/visits-and-events-per-visitor-by-page-for-last-week.JPG"><img src="/assets/img/blog/2014/01/looker/visits-and-events-per-visitor-by-page-for-last-week.JPG" title="Visits and events per visitor by page for last week" /></a>

We can use Looker to publish the data to a URL. We've published the above view to the following URLs - check them out in your browser to see how easy it is to fetch the data:

* [Tab-delimited data](https://snowplowanalytics.looker.com/looks/xyY6yZTg23RzrYpT2y9y4t5tggSMq7xz.txt)
* [CSV data](https://snowplowanalytics.looker.com/looks/xyY6yZTg23RzrYpT2y9y4t5tggSMq7xz.csv)
* [JSON data](https://snowplowanalytics.looker.com/looks/xyY6yZTg23RzrYpT2y9y4t5tggSMq7xz.json)
* Open the data in Google Spreadsheets using `=ImportData("https://snowplowanalytics.looker.com/looks/xyY6yZTg23RzrYpT2y9y4t5tggSMq7xz.csv")`

You can see how the data looks in Google Spreadsheets below:

<a href="/assets/img/blog/2014/01/looker/google-spreadsheet.JPG"><img src="/assets/img/blog/2014/01/looker/google-spreadsheet.JPG" title="Snowplow data served live into Google Spreadsheet by Looker" /></a>

Because the data is being served live, it is always up-to-date. Pretty cool, huh?

## Want to get started with Looker?

Then get in touch with the [team at Looker] [looker-team] or the [team at Snowplow] [snowplow-team] to arrange a trial.


[looker]: http://www.looker.com
[looker-release]: /blog/2014/01/08/snowplow-0.8.13-released-with-looker-support
[events.lookerml]: https://github.com/snowplow/snowplow/blob/master/5-analytics/looker-analytics/lookml/events.lookml
[looker-team]: http://looker.com/free-trial
[snowplow-team]: http://snowplowanalytics.com/about/index.html
[d3-js]: http://d3js.org/

[img-1]: /assets/img/blog/2014/01/looker/metrics-by-landing-page.JPG
[img-2]: /assets/img/blog/2014/01/looker/new-visitors-by-landing-page-over-time.JPG
[img-3]: /assets/img/blog/2014/01/looker/metrics-by-original-mkt-source.JPG
[img-4]: /assets/img/blog/2014/01/looker/events-on-services-page-by-day.JPG
[img-5]: /assets/img/blog/2014/01/looker/visit-and-engagement-levels-by-refer-medium.JPG
[img-6]: /assets/img/blog/2014/01/looker/visit-and-engagement-levels-by-landing-page.JPG
[img-7]: /assets/img/blog/2014/01/looker/visits-to-market-basket-analaysis-recipe.JPG
[img-8]: /assets/img/blog/2014/01/looker/session-complete-event-stream.JPG
[img-9]: /assets/img/blog/2014/01/looker/7-day-dashboard.JPG
[img-10]: /assets/img/blog/2014/01/looker/session-drilldown.JPG
[img-11]: /assets/img/blog/2014/01/looker/visits-and-events-per-visitor-by-page-for-last-week.JPG
[img-12]: /assets/img/blog/2014/01/looker/save-view.JPG
[img-13]: /assets/img/blog/2014/01/looker/google-spreadsheet.JPG
