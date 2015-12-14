---
layout: post
title: Snowplow in a Universal Analytics world - what the new version of Google Analytics means for companies adopting Snowplow
title-short: Snowplow in a Universal Analytics world
tags: [snowplow, google, universal analytics]
author: Yali
category: Analytics
---

Earlier this week, Google announced a series of significant advances in Google Analytics at the GA Summit, that are collectively referred to as [Universal Analytics] [justin-cutroni-summary]. In this post, we look at:

1. [The actual features Google has announced](/blog/2012/10/31/snowplow-in-a-universal-analytics-world-what-the-new-version-of-google-analytics-means-for-companies-adopting-snowplow/#what)
2. [How those advances change the case for companies considering adopting Snowplow](/blog/2012/10/31/snowplow-in-a-universal-analytics-world-what-the-new-version-of-google-analytics-means-for-companies-adopting-snowplow#whysnowplow)

![universal-analytics-image] [google-universal-analytics-image]

<div class="html">
<a name="what"><h2>1. What changes has Google announced?</h2></a>
</div>

The most significant change Google has announced is the new [Measurement Protocol] [measurement-protocol], which enables businesses using GA to capture much more data. This will make it possible for Google to deliver a much broader range of reports, of higher business value, than was previously possible. To understand the changes, we start by considering what [new data points](#new-data-points) businesses can _feed_ GA, before considering [what that means for GA's reporting capabilities](/blog/2012/10/31/snowplow-proposition-in-a-universal-analytics-world-what-the-new-version-of-ga-means-for-snowplow-adoption#reporting-capabilities).

<div class="html">
<a name="new-data-points"><h3>1.1 Custom user identifiers</h3></a>
</div>

The first new data points that businesses can feed into Google Analytics is a user's `client_id` (basically, a customer ID) as defined on the business's own systems.

Previously, Google Analytics identified unique users using their own `cookie_id`s. Google's `cookie_id`s are an excellent starting point for identifying users, because so many users have Google accounts (thanks to their myriad mass-market services, including Gmail, YouTube, Google Play etc): consumers using these services on multiple devices identify themselves to Google when they login, meaning that Google can marry their `cookie_id`s for these users on all the different devices they use. Our assumption is that Google already use this to reliably identify individual users across multiple platforms and devices.

For businesses using GA, being able to augment Google's user identification with their own internal `client_id`s is a significant step forwards for two reasons:

1. Many GA users (especially those with applications or properties where users login, or those with a loyalty card scheme) can identify their own users reliably on specific platforms, devices and physical stores. By adding this additional user identification data into GA, GA will be more accurate at identifying the same user in different places reliably, moving us further from a world in which we rely on persistent cookies dropped on browsers with unique identifiers, to one where users are more robustly identified via logins, payments and loyalty schemes. These approaches will still use cookies, but as part of a broader set of user identification business processes that actively involve the user in the identification process
2. It should make it easier for GA users to join GA data with other customer data sets on those `client_id`s. This is more of a nuanced point, as it was still possible previously to add customer IDs to GA as custom variables and use that to do joining

<!--more-->

<div class="html">
<a name="customer-journey"><h3>1.2 Capturing events across a user's entire customer journey (not just the web, not just digital interactions)</h3></a>
</div>

We have long argued that web analytics is just one customer data source - and that analysts performing customer analytics need to crunch data covering the customer's complete journey, including other digital channels and offline interactions. That means joining data sets from different digital products and offline data sets to generate a single customer view. To date, companies that have implemented "single customer views" have typically struggled incorporating web behavior in those views.

Google has taken a significant step towards enabling businesses to capture much more of their customer's journeys in Google Analytics itself. The [Measurement Protocol] [measurement-protocol] makes it possible to pass offline events into Google: so for example, when a customer buys an item in store, it would be possible to fire an event to Google Analytics recording that sale. If the customer was on a CRM programme (e.g. loyalty scheme), his / her `client_id` could be passed in, and then Google Analytics would know that this is the same user who browsed the website on their mobile phone yesterday and viewed it from their office today, prior to coming in store to make the purchase.

The Measurement Protocol can also be used to capture events on digital platforms that are not so well suited to traditional web analytics solution e.g. mobile applications, set-top box applications, videogames on consoles etc. It thus opens the door for Google Analytics to capture and report on event data from a range of devices, not just those that are web based.

Taken together, this means it will be possible for Google Analytics to offer reports detailing customer behavior across the complete customer journey. Building on this, it should also be possible for GA to enable analysts to calculate [customer lifetime value] [clv] (if the value of different events was passed in with the events): this is one of the most important metrics in customer analytics, and one that has been conspicuous by its absence from web analytics outside of solutions like [Snowplow] [clv] until now. The Measurement Protocol potentially means a huge increase in the scope and value of reports that it should be possible to generate in Google Analytics.


<div class="html">
<a name="cost-data"><h3>1.3 Capturing customer-acquisition cost data</h3></a>
</div>

One of the most common types of analytics performed on web data is working out the return on marketing investment for different customer-acquisition channels. To perform this analysis, we need to combine:

1. Data on what was spent on each channel - typically cost data from those channels themselves, e.g. display, PPC, affiliate, social etc
2. Web analytics data on how many people visited the website in response to those ads and what fraction of them went on to become customers. By dividing the total spent on each channel (1) by the number of customers acquired from each channel (2), we can calculate the cost of acquiring each customer for that channel.
3. Financial data on the revenue/profits generated by those customers, over their lifetimes. By comparing the average value of each customer acquired from each channel against the average cost of acquiring each of those customers, we can calculate the return on that acquisition cost

Now that Google lets businesses reliably track their users over their entire lifecycles (on and offline), it becomes possible to calculate the user's lifetime value, as detailed [above](#customer-journey), delivering on point #3. Google has always enabled business to capture #2. Now, Google  lets you send the cost data into Google Analytics (point #1) - so that the return of each campaign can be accurately calculated. (Previously, only spend data from AdWords could be imported into GA.) With this information, companies should be better placed to drive marketing spend decisions based on Google Analytics reports. Again though, the reality is more nuanced, because typically those spend decisions have to be made _before_ a customer's lifetime value (#3) can be accurately calculated, so companies really need to develop predictive models of how valuable customers are likely to be. Anything but the most basic models are likely to require tools outside of GA to develop, and then pulling that data out of GA to power those models.

### 1.4 Custom dimensions and metrics

The [Measurement Protocol] [measurement-protocol] enables businesses to define and capture their own dimensions and metrics each time an event that is tracked. Those additional metrics and dimensions are then available to report in in GA.

As well as enabling businesses to add custom dimension and metric values to individual event tracking calls, Google also lets businesses bulk upload multiple dimensions at a time into the GA, if a relationship between those custom dimensions and dimensions already in GA can be defined, and GA knows what values to ascribe events already in it to those new dimensions, based on that defined relationship. To give an example: you could upload the product names/SKUs associated with each web page, enabling reporting on page views by SKU. Or, you could upload a range of product metadata (e.g. book titles and authors) and associate that with an ISBN custom field.

<div class="html">
<a name="reporting-capabilities"><h3>1.5 What new reporting is enabled through the capture of all these additional data points?</h3></a>
</div>

Taken together, the additional data that businesses can feed into Google Analytics gives Google enough to offer a much broader and more valuable range of reporting than was previously possible:

1. **Customer analytics**. We have long argued that web analytics packages including GA are too focused on sessions, page views and conversions, and neglect the broader, more valuable customer analytics that underpin the most successful businesses in the world. With these new data points, GA has the raw data to produce useful customer reports including customer lifetime value, and analysis of user behaviors over their entire journeys. No longer will web analysts using GA be confined to viewing actions over an isolated session: now they can slice and dice metrics by users over their user journeys spanning multiple site visits.
2. **Event analytics** across platforms, on and offline. GA can now report on user's complete journey, not just what they do on websites, but also their behaviors on other digital platforms (esp.  mobile) and offline.

<div class="html">
<a name="whysnowplow"><h2>2. How do the advances in GA change the case for adopting Snowplow?</h2></a>
</div>

Prior to the latest announcement, the case for adopting Snowplow alongside your GA implementation was as follows:

* The reporting provided by Google Analytics is very limited, with little/no customer analytics, catalogue analytics and platform analytics supported.
* Snowplow enables you to perform all these three types of analytics, by providing you with access to your raw customer-level and event-level clickstream data, so that you can use whatever analytics tool you like to crunch the data and perform that analysis
* Snowplow makes it easier to join your web analytics data sets with other data sets (e.g. marketing data sets, CRM and offline data sets), by enabling businesses to load customer IDs into Snowplow, and then perform the join on the raw data sets. This means that businesses running Snowplow can analyse user behavior across their entire customer journey (on and offline, across all digital and non-digital channels)
* Snowplow makes it easy to warehouse your customer data for posterity: an asset which will doubtless grow in value over time.

Following the latest announcement, some of these arguments fall away:

* Google has significantly strengthened its customer analytics capability. To what extent is not yet clear - we only know at this stage what extra data points Google Analytics will, hypothetically, let you collect - not what additional reporting UIs GA will provide to process that data
* The additional data points _should_ improve GA's platform and catalogue analytics capabilities; we will only be able to confirm this once we start working with the updated version of GA
* Therefore, the gap between what is possible with GA, and what is possible with Snowplow, has shrunk

Nevertheless, the case for implementing Snowplow alongside GA is still compelling, for three main reasons. To take each of these in turn:

### 2.1 Analytics capabilities

There are several different considerations here:

* Google Analytics still does not give you access to your customer-level and event-level data. Therefore, **there will always be ways that you can crunch Snowplow data that you cannot accomplish in GA**: drilling down to segments of one visitor is just the most obvious example
* There are a range of analytics techniques which are hard to imagine Google implementing at all, even with the new data sets that are available. To give just three examples:
 1. Using machine learning techniques (e.g. [Mahout] [mahout]) to **segment audience by behavior**
 2. Performing **event analytics** / pathing in a way that takes into account the **structure of the website**. This is described brilliantly by [Gary Angel] [gary-angel] on the [Semphonic blog] [semphonic]. This methodology includes identifying those events that are predictive of customer lifetime value
 3. Building and testing models that **predict customer lifetime value ahead of time**, so that you can quickly (and robustly) calculate the ROI on marketing campaigns, and adjust your spend accordingly
* There will always be barriers analysts run up against in trying to fit all of their data into Google's schema. For example, it's not obvious how Google's single `client_id` will cope with different packages (CRM, email, CMS et al) each having their own internal set of user IDs

### 2.2 Creating live, data-driven products

There are also important capabilities around using your event data and derived analyses in **live, data-driven products**:

* Having access to the event stream and your own analyses allows you to make use of that data in data-driven products and systems, including **product / content recommendation**, **user personalisation engines** and **internal search algorithms**
* Because Snowplow is open-source software which can be installed on your own servers, it should be possible to co-locate Snowplow with your own software (CMSes, ecommerce packages, custom apps etc) and thus tightly integrate these data-driven products into your offering
* Because GA doesn't provide the granular customer-level and event-level data, GA data cannot be used to prototype or drive these data-driven services

### 2.3 Data ownership and technical architecture

Finally, there are also a number of **data ownership** and **architectural issues** which we believe make a Snowplow solution an important compliment, if not yet a full alternative, to a GA implementation. These relate to the fact that, with GA, businesses get more value out by feeding more and more data in: to realise all of the new potential above, they need to be feeding GA with data covering their _complete_ set of customer interactions. However:

* This is the **most valuable data** your company owns. Does it make sense to leave the warehousing and storage of that data to a third-party who in many cases is providing the service for free? What guarantees does you have that that data will always be available, 3, 5 or 10 years down the line?
* Does it make sense to feed your detailed event- and customer-level data to Google Analytics, when GA does not share that data back with you at the same atomic level of detail. (GA rolls the data up to **aggregates** which are less flexible to work with from an analytics perspective)
* What happens when **innacurate data** is loaded into Google Analytics? Without the ablity to query and diligence the data directly, leave alone clean and reprocess data, there are very limited options available for a business that has innaccurate data in GA. This becomes a bigger issue as implementation become more complex (because data is being ingested across digital and offline platforms), and GA becomes the de facto tool for all customer analytics
* If you need to setup regular ETL processes to load the data from all of your third-party systems into GA, you could **expend the same energy setting up Snowplow instead**

## Closing thoughts

We at Snowplow Analytics are enormously excited by the progress Google are making with their Universal Analytics proposition, and especially the good work Google are doing educating the market into the value of customer-centric analytics. But to unleash the full power of that type of customer, platform and catalogue analytics, the serious analyst will still need access to the customer-level and event-level data: ideally on infrastructure that is totally under your own control. Snowplow is still the best way of getting hold and storing that data.

[google-universal-analytics-image]: /assets/img/google-analytics-universal-analytics.png
[justin-cutroni-summary]: http://cutroni.com/blog/2012/10/29/universal-analytics-the-next-generation-of-google-analytics/
[customer-analytics]: /analytics/customer-analytics/overview.html
[measurement-protocol]: https://developers.google.com/analytics/devguides/collection/protocol/v1/
[clv]: /analytics/customer-analytics/customer-lifetime-value.html
[mahout]: http://mahout.apache.org/
[gary-angel]: http://semphonic.blogs.com/about.html
[semphonic]: http://semphonic.blogs.com/semangel/2011/01/statistical-analysis-functionalism-and-how-web-analytics-works.html
