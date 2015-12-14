---
layout: post
title: Where does your traffic really come from?
tags: [referrer, referer, traffic, source, medium, marketing, attribution]
author: Yali
category: Analytics
---

<img src="/assets/img/blog/2013/05/lone-traveller.jpg" />

Web analysts spend a lot of time exploring where visitors to their websites come from:

* Which sites and marketing campaigns are driving visitors to your website?
* How valuable are those visitors?
* What should you be doing to drive up the number of high quality users? (In terms of spending more marketing, engaging with other websites / blogs / social networks etc.)

Unfortunately, identifying where your visitors come from is **not** as straightforward as it often seems. In this post, we will cover:

1. [How, technically, can we determine where visitors have come from?](/blog/2013/05/10/where-does-your-traffic-really-come-from#how)
2. [Potential sources of errors](/blog/2013/05/10/where-does-your-traffic-really-come-from#errors)
3. [Problems with relying on the Google Analytics approach, and why the Snowplow approach is superior](/blog/2013/05/10/where-does-your-traffic-really-come-from#ga)
4. [Surprises when examining visitors acquired from AdWords search campaigns: most visitors clicked on an ad that was not shown on a Google domain](/blog/2013/05/10/where-does-your-traffic-really-come-from#adwords)
5. [Pulling all the findings together: the value of high-fidelity data in determining where your visitors come from](/blog/2013/05/10/where-does-your-traffic-really-come-from#conclusion)

<!--more-->

<h2 id="how">1. How, technically, can we determine where visitors have come from?</h2>

There are two sources of raw data that we can use to determine where a vistor to a website has come from: the [page referer](#page-referer) and the [page URL](#page-url).

### Page referer

When you load a web page in your browser, your browser makes an HTTP request to a web server to deliver that page. That request includes a header field that identifies the address of the web page that linked to the resource being requested: this is called the [HTTP referer] [http-referer] (sic). It is also possible to access the current page's referer information from the browser itself, using `document.referrer` in JavaScript.

Web analytics programs typically read the HTTP referer header or JavaScript's `document.referrer`, and use that page referer data as one the inputs to infer where a visitor has come from.

### Page URL

Page referers are a technical solution to identifying where traffic comes from. In addition, digital marketers may want to label incoming traffic so that they can identify which marketing campaigns that traffic should be attributed to. This is typically done by adding a querystring to the landing page URL.

To give an example of how this technique works in practice, let's imagine that I am marketing the website `www.flowersdirect.com`. I run a campaign on AdWords called "November promotion". In my AdWords ad, I include a link (that I hope viewers of the add will click) to my homepage (`www.flowersdirect.com`). However, instead of just including the standard link in my ad, i.e.

{% highlight html %}
<a href="http://www.flowersdirect.com">www.flowersdirect.com</a>
{% endhighlight %}

I add a query parameter onto the end of my link labelling the campaign:

{% highlight html %}
<a href="http://www.flowersdirect.com?utm_campaign=November_promotion">www.flowersdirect.com</a>
{% endhighlight %}

Adding the query parameter does not change the experience of the user clicking on the ad. Then, on the landing page (in this case, the `www.flowersdirect.com` homepage) the web analytics JavaScript tag will pass the querystring to the web analytics program, which can then infer that the traffic should be attributed to the "November promotion".

Different web analytics programs look for different query parameters when assigning traffic to different marketing campaigns. In the case of [Google Analytics] [ga-mkt-parameters], the following parameters are used to set the following fields:

| **Parameter** | **Field in GA** |
|:--------------|:----------------|
| `utm_medium`  | Medium          |
| `utm_source`  | Source          |
| `utm_term`    | Term            |
| `utm_content` | Content         |
| `utm_campaign`| Campaign        |

To keep things simple, Snowplow uses the same query parameters, so that businesses running Snowplow alongside GA only need to set the parameters once for each campaign in order to successfully track them in both GA and Snowplow.

Web analytics programs use a combination of the page URL and the page referer to infer where traffic to the website has come from.

<h2 id="errors">2. Potential sources of errors</h2>

In general, there is much more scope for errors to arise deducing the source of traffic from the querystring on the page URL than there are when using the HTTP referer field. This is because querystring parameters are set manually by humans, rather than programmatically by machines. The following are two of the most common sources of errors:

### (a) Visitors share page URLs with campaign parameters in the querystring, using copy-and-paste

Many times, you will see a link in e.g. a Twitter post containing a `utm_` parameter that suggests it is a CPC campaign or some other non-social channel. This sort of error arises when, for example, a visitor clicks on a link from a CPC campaign, views the web page, then wants to share the web page - and does so by copying and pasting the URL. Website visitors are mostly oblivious to marketing parameters in the page's URL, and will leave them in place. Everywhere that the user pastes that link, that link will contain the query parameter; any other users clicking on that link will be misclassified as coming from a CPC campaign.

### (b) Typos in the campaign parameters on the querystring

The individual who sets up the campaign may make a mistake adding the querystring to the link in the ad. This is very easy to do: setting up campaigns can be tedious (especially if many are set up at the same time) and error-prone. An error as simple as typing `utm-campaign` instead of `utm_campaign` is enough that most web analytics software will misclassify *all* the visitors who clicked on that link.

Note that using a traditional web analytics solution, it is:

1. Impossible to spot that an error has been made on the query string in most cases
2. Even if you can spot the error, it is impossible to reprocess the data (and correct the error) or even 'ignore' the erroneous data

### Identifying errors with Snowplow

Using Snowplow, however, spotting errors is easy, because you have access to the raw page URL parameters in your Snowplow events table. The following is some example data from [Psychic Bazaar] [pbz], an online retailer running Snowplow. We have executed the following query to identify page views where the referer is not internal (so that we only look at the first page view in each visit, i.e. the one with all the interesting page referer and page URL data to determine the source of traffic):

{% highlight psql %}
/* PostgreSQL / Redshift */
SELECT
	collector_tstamp,
	page_urlhost,
	page_urlpath,
	page_urlquery,
	mkt_medium,
	mkt_source,
	mkt_term,
	mkt_campaign,
	refr_urlhost,
	refr_urlpath,
	refr_urlquery,
	refr_medium,
	refr_source,
	refr_term
FROM "public"."events_new"
WHERE "refr_medium" != 'internal';
{% endhighlight %}

Note how for each line of data, you can see the raw page URL data (`page_urlquery` in particular) that is used to derive the marketing source, medium and campaign (`mkt_source`, `mkt_medium` and `mkt_campaign` fields):

<a href="/assets/img/blog/2013/05/inferring-mkt-source-medium-term-campaign-from-pageurl.png"><img src="/assets/img/blog/2013/05/inferring-mkt-source-medium-term-campaign-from-pageurl.png" /></a>

*Click on the above image above to zoom in.*

This makes errors very easy to spot. As you can see from the screenshot below, Psychic Bazaar ran a campaign from September through November last year where there was a simple typo in the querystring. As a result, Snowplow did not set the marketing fields correctly for visitors who clicked on these links. Nonetheless, it is straightforward to spot the mistake, and adjust the data accordingly:

<a href="/assets/img/blog/2013/05/erroneous-query-string-data.png"><img src="/assets/img/blog/2013/05/erroneous-query-string-data.png" /></a>

*Click on the above image above to zoom in.*

In Google Analytics, SiteCatalyst or most other tools, spotting the above error and handling it is correctly is impossible.

<h2 id="ga">3. Problems with relying on Google Analytics approach, and why the Snowplow approach is superior</h2>

The traditional approach to inferring a visitor's origin has further weaknesses - related to the way in which page referer data is combined with page URL data to make these inferences.

To work out where a visitor has come from, Google Analytics *first* examines the page URL for the first page view of the visit, and *then*, if no suitable `utm_` parameters are found on the querystring, looks at the page referer to see if a URL for a referring web page is available. (For a more detailed view of the process GA uses, see [this detailed description from Google] [ga-referer-detailed].) There are two problems with this approach:

1. Google Analytics *starts* with the source of data that is inherently more error-prone, before looking at the more reliable (if sometimes less informative) data source
2. Google Analytics does not apply any intelligence to using the combination of both sources together to infer where a visitor has come from. If, for example, a visitor has clicked on a link from a webmail client (evident from the HTTP referer URL), but that link contains a `utm_source=bing` parameter, we can guess, fairly reliably, that the user has not clicked on a paid Bing search campaign, but on a link that was shared by someone who originally clicked on the Bing search campaign ad. Google Analytics only considers each data point in isolation, and does not make the raw data available to us, as analysts, to make a more intelligent attribution

In Snowplow, by contrast, we do **not** collapse the two separate data sources (page URL parameters and page referer) into a single 'source' for the visitor. Instead, we expose both to the analyst: we offer five `mkt` fields that are set based on `utm` parameters on the page URL (`mkt_medium`, `mkt_source`, `mkt_term`, `mkt_content`, `mkt_campaign`) and separately we offer three `refr` fields (`refr_medium`, `refr_source`, `refr_term`) that are derived from the HTTP referer header. We can view these fields alongside one-another by executing the following query:

{% highlight psql %}
/* PostgreSQL / Redshift */
SELECT
	mkt_medium,
	mkt_source,
	mkt_term,
	refr_medium,
	refr_source,
	refr_term
FROM "public"."events_new"
WHERE "refr_medium" != 'internal';
{% endhighlight %}

And check the results below. Note how in some cases the `mkt` fields are set, but the `refr` fields are not and vice-versa. On other occasions, both sets of fields are set:

<a href="/assets/img/blog/2013/05/mkt-and-refr-fields-alongside-one-another.png"><img src="/assets/img/blog/2013/05/mkt-and-refr-fields-alongside-one-another.png"></a>

This is part of the Snowplow commitment to [high fidelity analytics] [high-fidelity-analytics], a concept we introduced in [this blog post][high-fidelity-analytics].

<h2 id="adwords">4. Surprises when examining visitors acquired from AdWords search campaigns: most visitors clicked on ads that were not shown on Google domains</h2>

Another advantage of keeping your referer data separate to your marketing campaign data is that you can learn more about *where* your marketing ads are displayed based on the additional referer data that GA ignores.

To give a concrete example: Psychic Bazaar buys AdWords on the Google Search network. It does not buy ads on the Google Display network. By running the following query, we can identify which domains those AdWords ads that were clicked on were displayed:

{% highlight psql %}
/* PostgreSQL / Redshift */
SELECT
	refr_urlhost,
	COUNT(*) AS "Number of click-throughs"
FROM "public"."events_new"
WHERE "mkt_source" = 'GoogleSearch'
GROUP BY refr_urlhost
ORDER BY "Number of click-throughs" DESC
{% endhighlight %}

Plotting the results in Tableau, there are a few surprises:

<a href="/assets/img/blog/2013/05/google-adwords-referer-domain-analysis.jpg"><img src="/assets/img/blog/2013/05/google-adwords-referer-domain-analysis.jpg" /></a>

The top two domains by amount of AdWords traffic directed towards Psychic Bazaar are **not** Google owned domains. They are eBay and Amazon - both websites that Psychic Bazaar sells on as a third party merchant.

We expected *some* of the domains to be non-Google domains - after all, we were aware that search engines like Ask serve results and advertising powered by Google. We *were* surprised, however, that Amazon and eBay would do this: it seems strange that they would show ads for merchants who are competing with themselves and their own merchants. Nonetheless, if you visit either website, perform a search, and scroll down to the bottom of the result set, you will see AdWords ads displayed at the bottom:

<a href="/assets/img/blog/2013/05/amazon-with-adwords-links-screenshot.png"><img src="/assets/img/blog/2013/05/amazon-with-adwords-links-screenshot.png"></a>

This puts Psychic Bazaar in the uncomfortable position of competing not only with other merchants on eBay and Amazon, but also competing with its own website ads.

We were also surprised to learn that in total, 69% of the click-throughs received were from non-Google domains: in this case at least, powering search advertising on other sites doesn't simply add additional advertising inventory to Google's core search inventory, it actually makes up the bulk of that inventory. (We'd be interested in finding out from other Snowplow users who buy on AdWords whether they see similar results.)

<h2 id="conclusion">5. Pulling all the findings together: the value of high-fidelity data in determining where your visitors come from</h2>

In this post, we have seen that the extra level of data provided by Snowplow related to where visitors come from, over-and-above that provided by standard web analytics programs like Google Analytics, is incredibly valuable for a number of reasons:

1. It makes it possible to identify and manage errors that are invariably introduced in the data
2. It leads to more intelligent and robust inferences about where you traffic comes from
3. It identifies surprising results related to the placement of your paid campaigns, which may have significant implications for your overall marketing strategy.

## Want to do more intelligent, more robust attribution?

Then [get in touch] [contact] with the Snowplow Professional Services team.

[http-referer]: http://en.wikipedia.org/wiki/HTTP_referer
[pbz]: http://www.psychicbazaar.com/
[ga-mkt-parameters]: https://support.google.com/analytics/answer/1033863?hl=en-GB
[ga-referer-detailed]: https://developers.google.com/analytics/devguides/platform/features/campaigns-trafficsources
[high-fidelity-analytics]: /blog/2013/04/10/snowplow-event-validation/
[contact]: /about/index.html
