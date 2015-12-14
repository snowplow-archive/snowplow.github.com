---
layout: post
title: Snowplow 0.9.4 released with improved Looker models
title-short: Snowplow 0.9.4
tags: [snowplow, Looker, data modelling, LookML, event analytics, business intelligence]
author: Yali
category: Releases
---

We are very pleased to release Snowplow 0.9.4, which includes a new base LookML data model and dashboard to get Snowplow users started with [Looker][looker].

![short-screenshot] [dashboard-brief]

The new base model has some significant improvements over the old one:

* Querying the data is much faster. When new Snowplow event data is loaded into Redshift, Looker automatically detects it and generates the relevant session-level and visitor-level derived tables, so that they are ready to be queried directly. We've tuned the derived tables with the relevant dist keys and sort keys to make sure any underlying table joins in Redshift are performant
* New visualizations are now supported and included in our example dashboard (see [below](/blog/2014/05/30/snowplow-0.9.4-released-with-updated-looker-models-and-dashboard/#dashboard)), including geographic plots
* Our example dashboard uses Looker's new functionality around global filters: this makes it possible to drill into subsets of visitors by a range of dimensions, and see a wide range of different visualizations for that subset of users on the same screen, opening up new creative ways of exploring your Snowplow data (more on this in a future blog post)
* Metrics and dimensions have been renamed to make it easier for a new user unfamiliar with Snowplow to explore the data through Looker

Read on, to:

1. [See the full example dashboard](/blog/2014/05/30/snowplow-0.9.4-released-with-updated-looker-models-and-dashboard/#dashboard)
2. [Learn how to install/upgrade to the new LookML models](/blog/2014/05/30/snowplow-0.9.4-released-with-updated-looker-models-and-dashboard/#install)

<!--more-->

<h2><a name="dashboard">The example dashboard</a></h2>

One of the many reasons we're big fans of Looker at Snowplow, is that its flexible metadata model makes it possible for different Snowplow users to deliver highly bespoke visualizations and dashboards that are specific to their particular business.

One of the things we have learnt working with clients to implement Looker with Snowplow is that having a standard dashboard is an incredibly useful starting point for developing those more custom models. To that end, we've put together a new standard dashboard to help users get started - one that leverages Looker's new functionality to make dashboards **interactive tools** for exploring data, not just static tools restricted to a high-level view of what's going on now.

<a href="/assets/img/blog/2014/05/looker-snowplow-traffic-pulse-dashboard.png"><img src="/assets/img/blog/2014/05/looker-snowplow-traffic-pulse-dashboard.png" /></a>

Click on the dashboard for a more detailed view.

<h2><a name="install">Installing / upgrading to the new LookML models</a></h2>

To make use of the new models, you'll need to have a Looker license or be on a Looker trial. (To trial Looker with Snowplow, [get in touch with us] [contact], or with the [folks at Looker] [looker].)

First you will need to load a new country codes dataset into Redshift / Postgres: this maps two character ISO country codes (outputed by our Maxmind enrichment) to three character ISO country codes (used by Looker for geographic visualizations) and country names (nice for end-users to see in the Looker UI.)

Clone the Snowplow repo:

{% highlight bash %}
$ git clone https://github.com/snowplow/snowplow.git
{% endhighlight %}

You need to run the contents of snowplow/5-analytics/redshift-analytics/reference-data/iso-country-codes.sql in our Redshift database. This can be done using PSQL e.g.

{% highlight bash %}
psql -U $username -p $port -h $host -d $database -f snowplow/5-analytics/redshift-analytics/reference-data/iso-country-codes.sql
{% endhighlight %}

Alternatively you can copy and paste the contents of the file into your favorite SQL editor.

You then need to make sure that our Looker user (i.e. the user that Looker users to access our data in Redshift) has access to the new data. In PSQL, execute:

{% highlight psql %}
GRANT USAGE ON SCHEMA reference_data TO looker;
GRANT SELECT ON TABLE reference_data.country_codes TO looker;
{% endhighlight %}

Assuming that the user credentials you share with Looker have username 'looker'.

Next, you need to transfer our [LookML files from the Snowplow repo][lookml-in-github] into the repo you use for Looker, either directly (via Git) or by creating the files in the Looker UI (in the models section), and then copying and pasting the contents. Note that may need to update the [snowplow.model.lookml][snowplow-model-file] so that it references your connection in Redshift to your Snowplow dataset: the example file assumes that your connection is called 'snowplow', which may not be the case.

Once copied over, you should be able to start exploring the 'events', 'sessions' and 'visitors' views, and playing around directly with the 'Traffic Pulse' dashboard:

<a href="/assets/img/blog/2014/05/looker-explorer-screenshot.png"><img src="/assets/img/blog/2014/05/looker-explorer-screenshot.png"></a>

## Interested in learning more or trying out the combination of Snowplow and Looker

Then [get in touch][contact]! For more details on this release, please check out the [0.9.4 Release Notes] [snowplow-094] on GitHub.


[looker]: http://looker.com
[contact]: /about/index.html
[dashboard-brief]: /assets/img/blog/2014/05/snowplow-looker-traffic-pulse-dashboard-top-part.png
[dashboard-full]: /assets/img/blog/2014/05/looker-snowplow-traffic-pulse-dashboard.png
[first-lookml-model]: /blog/2014/01/08/snowplow-0.8.13-released-with-looker-support/
[lookml-in-github]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/looker/lookml
[snowplow-model-file]: https://github.com/snowplow/snowplow/blob/master/5-analytics/looker-analytics/lookml/snowplow.model.lookml
[looker-explorer-screenshot]: /assets/img/blog/2014/05/looker-explorer-screenshot.png

[snowplow-094]: https://github.com/snowplow/snowplow/releases/0.9.4
