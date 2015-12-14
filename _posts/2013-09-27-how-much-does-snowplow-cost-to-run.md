---
layout: post
title: How much does Snowplow cost to run?
title-short: How much does Snowplow cost to run
tags: [snowplow, total cost of ownership]
author: Yali
category: Inside the Plow  
---

We are very pleased to announce the release of the [Snowplow Total Cost of Ownership Model] [snowplow-tco]. This is a model we started developing [back in July][intro-post], to enable:

* Snowplow users and prospective users to better forecast their Snowplow costs on [Amazon Web Services] [aws] going forwards
* The Snowplow Development Team to monitor how the cost of running Snowplow evolves as we build out the platform

Modelling the costs associated with running Snowplow has not been straightforward: in the next few weeks, we'll publish a series of blog posts exploring those challenges and how we tackled them. We'll also review why we chose to build the model in [R][r] (rather than Excel), and explore some surprising aspects of what drives Snowplow costs on AWS, building on our [last blog post][intro-post] on the subject.

In the meantime, [download our TCO Model] [snowplow-tco] and try it out yourself: it will let you model the cost of your particular Snowplow setup, and see how costs divide between the different AWS services.

In the rest of this blog post, we'll focus on perhaps the most interesting output of the model: **How expensive is it to run Snowplow vs our commercial competitors?** Let's start by comparing it with web analytics stalwarts Google Analytics and SiteCatalyst:

![snowplow-premium-price-comparison][price-comparison-1]

<!--more-->

Snowplow cannot compete with the free version of [Google Analytics] [ga] directly on cost. Our model forecasts that even at low volumes, Snowplow ends up costing $1000 per year: this really reflects the cost of running a server to host a PostgreSQL database for your Snowplow data. (Our model assumes an m1.large EC2 instance being provisioned for this purpose - this accounts for 75% of the cost - there may be alternatives that bring that cost down significantly.)

At higher volumes, though, the savings are substantial. Running Snowplow is **at least an order of magnitude cheaper** than [GA Premium] [ga-premium] and [Adobe SiteCatalyst] [adobe-sitecat] for businesses recording between 10k and 100k events per month. (At these volumes, we've modelled the cost based on users employing Redshift, rather than PostgreSQL, to store their data.) Even at a billion events per month (where multiple Redshift nodes are required to store all your atomic data), the cost of running Snowplow is a little over half the cost of running Google Analytics Premium.

We've then compared the cost of running Snowplow with the cost of some of the SaaS analytics startups (note in this diagram we're comparing monthly, rather than yearly costs):

![snowplow-saas-price-comparison][price-comparison-2]

For anyone capturing 500K events or more, it is cheaper to run Snowplow, than [Mixpanel] [mixpanel], [Kissmetrics] [kissmetrics] or [Keen IO] [keen-io]. However, the saving increases with volume: at 20M events per month, Snowplow costs 25% less to run than Mixpanel, for example.

**Sources**

The above pricing comparisons were put together with data from the following sources: if over time the prices change, then please let us know, so we can update them to keep them accurate:

* [Google Analytics Premium pricing] (http://www.neboagency.com/blog/google-analytics-vs-site-catalyst-2/)
* Omniture SiteCatalyst pricing based on a cross section of 20 different clients
* [Mixpanel pricing page](https://mixpanel.com/pricing/)
* [Kissmetrics pricing page](https://www.kissmetrics.com/pricing)
* [Keen IO pricing page](https://keen.io/)
* For Snowplow pricing, please refer to the [Snowplow TCO model] [snowplow-tco] for details on both the underlying model assumptions and the model mechanics.

[snowplow-tco]: https://github.com/snowplow/snowplow-tco-model
[intro-post]: http://snowplowanalytics.com/blog/2013/07/09/understanding-how-different-parts-of-the-Snowplow-data-pipeline-drive-AWS-costs/
[aws]: http://aws.amazon.com/

[r]: http://cran.r-project.org/
[price-comparison-1]: /assets/img/price-comparison/snowplow-google-analytics-omniture-sitecatalyst-price-comparison.png
[price-comparison-2]: /assets/img/price-comparison/snowplow-saas-price-comparison.png
[ga]: http://www.google.co.uk/intl/en_uk/analytics/index.html
[ga-premium]: http://www.google.co.uk/intl/en_uk/analytics/premium/index.html
[adobe-sitecat]: http://www.adobe.com/solutions/digital-analytics/marketing-reports-analytics.html
[mixpanel]: https://mixpanel.com/
[kissmetrics]: https://www.kissmetrics.com/
[keen-io]: https://keen.io/
