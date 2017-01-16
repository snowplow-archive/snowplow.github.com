---
layout: post
title: "Data collection: the essential, but unloved, foundation of the data value chain"
tags: [good data, data collection, technical architecture]
author: Yali
category: Inside the Plow
---

it is so obvious no one bothers saying it.

> Data collection is an essential part of any data strategy

After all: without data collection, there is no data. Without data there is no data value chain. No reporting, no analysis, no data science, no data-driven decision making.

It is not just that people in data don't remark on the importance of data collection. They do not talk about data collection *at all*. To take just one example, let's review [Firstmark's Big Data Landscape][big-data-landscape]:

![Firstmark-big-data-landscape-2016][big-data-landscape-image]

Roughly 15% of the landscape is given over to the 'Data Sources and API' providers. However, *none* of the providers listed, either in that section, or the rest of the map, specialize in enabling companies to collect their *own* data. The Big Data Landscape, then, is full of vendors that will help you do things with your data, and provide you with their own data. But all those providers assume you have your own data to do stuff with, so have got data collection sorted.

The awkward truth is that although most companies do have some of *their own* data, it is often not *good data* because it is not being collected properly. And most choose to invest in the rest of their data/analytics stack, without putting in place proper processes and systems to collect and store the good data in the first place. They might as well build houses without foundations. In this post, I'm going to explore:

1. [What makes good data?](/blog/2017/01/16/data-collection-the-essential-but-unloved-foundation-of-the-data-value-chain/#what-makes-good-data)
2. [Strategies and techniques to systematically generate and collect good data](/blog/2017/01/16/data-collection-the-essential-but-unloved-foundation-of-the-data-value-chain/#strategies-and-techniques-for-systematically-collecting-and-generating-good-data)
3. [The strong commercial imperative to collect data properly](/blog/2017/01/16/data-collection-the-essential-but-unloved-foundation-of-the-data-value-chain/#commercial-imperative)
4. [The strong moral imperative to collect data properly](/blog/2017/01/16/data-collection-the-essential-but-unloved-foundation-of-the-data-value-chain/#moral-imperative)

<!--more-->

<h2 id="what-makes-good-data">1. What makes good data?</h2>

Not all data is created equally. Good data is:

1. [Reliable](#reliable)
2. [Easy to understand](#easy-to-understand)
3. [Easy to work with](#easy-to-work-with)

<h3 id="reliable">1.1 Good data is reliable</h3>

If we're going to build intelligence and make decisions based on data, then that data needs to be reliable. To be reliable, data needs to be:

1. **Accurate**. If the data suggests that a consumer was looking at A, when in fact they were looking at B, the data is not accurate. When the data says that the user was looking at A, we need to be sure that the user was, in fact, looking at A.
2. **Precise**. If the data suggests that the user was viewing an article for 2 minutes and 10 seconds, that is more precise than suggesting that the user was viewing an article for 2 minutes.
3. **Complete**. This is the hardest requirement to ensure. Say we are recording the number of times a web page is loaded. How do we build confidence that *every* time we load the web page, our tracking will work? (Maybe, for example, our tracking is prevented from tracking particular page views on particular browsers by ad blockers?)

<h3 id="easy-to-understand">1.2 Good data is easy to understand</h3>

Data is a representation of a set of things, in the world, that have happened, or that simply 'are' (in cases where we're measuring the state of something - e.g. the temperature of the air). In order to use data, we need to understand what that data represents, in the world. If the data represents a particular set of events, in a user journey, for example, we need to understand the possibility space in which that user journey has occurred in, in order to do anything intelligent with the data.

There is therefore a lot of contextual knowledge that is required to make sense of data. Good data, as far as possible, needs to 'incorporate', or be packaged with, that contextual information (itself represented as data), to make it easy for someone or some artificial intelligence down the line to take that data and use it to draw an inference. We often describe that contextual information as 'metadata', to distinguish it from the data itself. In practice, the distinction isn't so sharp.

There's more to making data easy to understand than metadata, though. The data itself should be unambiguous. Data that says 'this page loaded at this time' is better than data that says 'this page might have loaded at this time'.

<h3 id="easy-to-work-with">1.3 Good data is easy to work with</h3>

If data is reliable and easy to understand, it is by definition, easy to work with. However, there is something else that makes data easier to work with: it should be easy to plug the data in to a wide range of different analytics tools, and use those tools to process the data.

A common complaint amongst data scientists is that the vast majority of their time is spent preparing data for analysis, instead of actually performing analysis. This is a colossal waste of time that can be avoided, if data is collected properly.

<h2 id="strategies-and-techniques-for-systematically-collecting-and-generating-good-data">2. Strategies and techniques to systematically generating and collecting good data </h2>

### 2.1 Ensure that data collected is reliable

Whilst there are always going to be limits in the reliability of anything that is measured or recorded, there are three important things we can do when building data collection processes to maximize the reliability of the data generated:

1. [Ensure that data collection and processing is fully auditable](#auditable)
2. [Ensure that data collection is non-lossy](#non-lossy)
3. [Ensure that the metadata that is generated with the data is incredibly precise](#precision)

Let's take each strategy in turn:

<h4 id="auditable">2.1.1 Ensure that data collection and processing is fully auditable</h4>

Whilst digital analysts might not have much history to worry about data reliability, other professions, notably accounting, have long been concerned about data veracity.

If our data collection is auditable, we can check that it works as advertised. If we can break down each step in the data processing pipeline, check the input and output to each step, and rerun each and every step in that pipeline, we can build very high levels of confidence about the reliability of the data generated. If anyone has any doubts about the data quality, she or he can go back and reprocess that data, from scratch, or test the pipeline under a range of different conditions, to identify if there were any steps in the collection process that might have compromised the data.

<h4 id="non-lossy">2.1.2 Ensure that data collection is non-lossy</h4>

In areas of data collection outside of digital analytics, the requirement that a data pipeline be non-lossy is an obvious one. An odometer in a car, for example, would not be very good if it only recorded 3 in every 4 miles that a car had been driven. It would be even worse if it sporadically failed to record miles, with no discernable pattern.

In Digital Analytics, however, data pipelines have always been lossy: data will typically enter the pipeline that does not successfully 'make it through'. There is a good reason for this: the web is a wild place with a large number of bad and incompetent actors. A cursory examination of any Snowplow collector log records will reveal a large number of requests originating from bots and spiders looking for vulnerable servers to attack. We can understand, then, why web analytics vendors ignore the requests generated by these types of bots and spiders as they do not represent activity of users on websites.

The trouble with ignoring the requests altogether is that as soon as you have a data pipeline where data can flow in but not flow out, it is possible (even likely) that some data that should make it all the way through the pipeline is dropped. For this reason, modern data pipelines used in digital analytics should not be lossy: rather than dropping data, it should be 'redirected' somewhere where it can be investigated and verified and reprocessed if necessary, rather than disappear without trace. Without this capability, it is very difficult to know if your data set is complete.

<h4 id="precision">2.1.3 Ensure that the metadata that is generated with the data is incredibly precise</h4>

There are hard limits to the precision with which we can record data in the real world. For example, we cannot measure the length of something to the millimeter, if our measuring instrument is a meter rule. Similarly, in digital analytics, there are practical limits to the precision with which we can measure, for example, how long a web page is visibile in the browser window. Even if we could measure this with 100% accuracy, we wouldn't know that the individual browsing was actually looking at the web page over that entire time, and had not diverted her / his attention in that time.

What we can do, instead, is be incredibly precise with the *metadata* we record with the data. To return to our measurement of how long the user was reading the web page, we might say, with 100% accuracy, that:

1. Four page pings, or 'heartbeats' were recorded, on this browser, on this date, on this web page URL, with this title, description and length
2. The page pings were recorded with the Snowplow Javascript Tracker 2.7.0
3. The tracker was set to record a page ping every 10 seconds where a user was 'active' at least once in the 10 second window, where activity is defined as any type of interaction with the DOM.

By being very precise with our definition of what was measured, we can ensure that our data is 100% reliable. There is then an inference that needs to be made, from that data to a 'fact' about how long this particular user was reading the contents of this particular web page, on this particular date. Whilst there are limits to the precision of that 'fact', it should be clear how that is inferred from the underlying data. If someone then wants to question whether that inference is valid, she or he can go back to the underlying data and make an alternative inference, because the underlying data, properly presented, is 100% precise. The underlying, reliable data itself, is distinct from the 'fact' that is inferred from it: and the mode of reasoning to justify the inference is explicit, for anyone auditing the data.

<h3>2.2 Ensure that data collected is easy-to-understand</h3>

There are two strategies for ensuring that data is easy to understand:  

1. [Ensure that the structure of the data reflects our mental representation of the events recorded](#natural-representation)
2. [Bundle data with metadata about what that data represents, how it was generated and how it was processed](#metadata)  

<h4 id="natural-representation">2.2.1 Ensure that the structure of the data reflects our mental representation of the events recorded</h4>

Data represents what has happened in the world. When we look at data, we do so first of all to understand what actually has happened in the world, and use that to build an understanding of why. So when we work with data, we're constantly taking data, which is a numeric representation of the world, and converting it into our own mental representation of the world.

Structuring the data, then, in a way that mirrors the way we actually think about the world, makes the data much easier to work with. This is the primary reason why people find working with data underlying Omniture / Adobe so difficult: because the structure of the data (a long list of sProps and eVars) reflects legacy architectural decisions made by the SiteCatalyst engineering team many years ago, rather than our mental model for the web events that we typically track with it today.

As we've often remarked, different companies, with different digital propositions and different relationships with their users, will want to track radically different events and user journeys from one another. If each is to collect a data set that is structured in a way that mirrors the way practitioners at those companies think about those user journeys, we should expect that the structure of those data set be wildly different between those different companies. Trying to force every company to squeeze their data into a long, flat list of custom dimensions and metrics does not make for an easy-to-understand data set.

<h4 id="metadata">2.2.2 Bundle data with metadata about what that data represents, how it was generated and how it was processed</h4>

Data by itself is valueless. Unless we know what it is supposed to represent, how it was generated, how it is structured and how reliable it is, we are not in a position to know what it 'means', and so tp understand if it is appropriate to answer the particular questions we want to ask.

When data sets were small and lived in spreadsheets with named authors, getting hold of this contextual information was a simple matter of asking the author. In the world we live today, where billions of lines of data, generated from tens or hundreds of different sources via multiple different processes, over many years and decades, and accumulated in data warehouses, data marts or data lakes (I use the terms through gritted teeth), it may not be clear where one data set ends and another begins, leave alone who you should ask about what the data represents and how it was generated.

If the metadata that describes what that data is and how it was generated and processed, can be systematically packaged and structured with the data actually generated, we make it much easier, down the line, for both humans and machines to take that data and do useful things with it. Ensuring that our data collection processes are as systematic about the way they capture, store and package the metadata required to work with the data itself, as the data itself, is essential to ensuring the data has value beyond the short term.

### 2.3 Ensure that data collected is easy-to-use

In addition to being reliable and easy-to-understand, it needs to be easy to take good data and quickly plug it into the enormous range of analytic tools available. To enable this, it is important that data is:

1. [Highly structured](#structured)
2. [Rich](#rich)
3. [Systematically modeled](#systematically-modeled)

Let's examine each in turn.

<h4 id="structured">2.3.1 Easy-to-use data is highly structured</h4>

To process data, you have to know how that data is structured, including the different fields that make up that data and their type. Whilst the advances in a range of big data technologies mean it is now feasible to work with unstructured and semi-structured data, the first stage in processing unstructured and semi-structured data sets is to structure them. This is not a trivial exercise, and gets harder as data sets get larger.

If you are going to put in the time and effort to collect good data, make sure that the data you collect is structured. It should be made up of clearly defined entities and types with well understood properties, making it easy for analysts, scientists, engineers and other data consumers to build downstream processes to do useful things with that data.

<h4 id="rich">2.3.2 Easy-to-use data is rich</h4>

It is one thing to know that a web page with specific URL, title and referrer was loaded, by a particular cookie ID, on a particular date, at a particular time. If you also know:

1. Who loaded the web page (i.e. which individual owns the device with that cookie ID)
2. What the web page was about
3. Who authored the web page
4. How fast the web page loaded
5. What type of device and browser the web page was loaded on
6. What was the weather like when the web page loaded

You are in a position to answer a much broader range of questions.

Capturing rich data takes a concerted effort. It means systematically identifying what data is available at the point where the data is captured (for example in the application or website). It also nearly always requires 'enriching' the data with other first and third party data sets with additional data points that are not available at the point of capture.

<h4 id="systematically-modeled">2.3.3 Easy-to-use data is systematically modeled</h4>

There is a tension between data that is reliable, because it is incredibly precisely defined, as described in [section 2.1.3 on metadata precision](#precision) and data that is easily usable. It is more accurate to say that four page pings were recorded against this cookie ID on this page in this time range. But it is easier to work with a single line of data that summarizes that the user arrived on the web page at this timestamp, spent this long engaging on the page, viewed the first 3/4 of the page and then clicked on a particular button to another page.

This process of taking very accurate, atomic data, and turning it into a data set that is easy to use, visualize, and socialize around a business, we call [event data modeling][introduction-to-event-data-modeling]. For the purposes of this post, it is enough to say:

* Data needs to be modeled before it can be easily used.
* The process of modeling the data involves applying business logic (contextual knowledge) and assumptions to the underlying, atomic or 'unmodeled' data set.
* The process typically involves:
  * Identifying *who* is involved in different events, and using that information to build single customer views of user journeys across multiple channels ([identity stitching][identity-stitching].)
  * Dividing each user's journey into a discrete set of smaller journeys (each of which might be divided into individual steps), each of which represents specific activities which the user engages in order to achieve specific goals.
* The business logic used to model data is likely to change over time, as:
  * The business changes.
  * The range of questions and uses the data is put to, changes.
* As a result, it is important that data can be re-modeled over time, as that business logic changes. This also means that the data modeling process is well understood, fully auditable and fully re-runnable.

Event data modeling is a vital process in generating an easy-to-use data set. We find that different companies, with different propositions, strategies and user relationships, have wildly different data modeling processes, to reflect the different contexts in which they operate. Given this, it is very surprising that more companies do not invest lots of time and effort in modeling their data and by and large tolerate standard approaches to modeling that are baked into packaged solutions like Google and Adobe Analytics - approaches built around outdated concepts like sessions rather than entities that really matter like users.

As should be clear from this discussion of data modeling and the earlier discussion of data enrichment above, data collection *cannot* just be about logging raw data. Systematically collecting good data means validating that data (to ensure it is reliable), enriching that data, and modeling it. Doing data collection right can only be achieved with sophisticated, multi-step, auditable data pipelines.

### 2.4 Data should be a first class citizen: not generated as a bi-product of another process

As should be clear from the above discussion, collecting good data is hard work.

Sadly, most companies do not invest in collecting data properly. A simple observation: most of the data that companies collect is a by-product of some other process, rather than the output of a dedicated data collection process. To give a few examples of some of the most common sources of data used in analytics stacks:

1. Data from web analytics systems like Google Analytics and Adobe, or other packaged analytics solutions like Mixpanel or Localytics, is structured and processed in a way that is tightly coupled to the reports and user interface that those tools provide their users. Those platforms have *not* been built to enable companies to collect and store high value, reliable, rich, event-level and modeled data to store and develop as an asset in its own right, and deploy across a range of different applications.
2. Data from tag managers like Tealium is generated as a by-product of systems that are built to move very particular slices of data, required by hundreds of very specific vendors with specific data requirements (that might look nothing like the requirements of the company generating the data), to those same vendors.
3. Data extracted from production databases is data that is structured in a way optimized to delivering applications, rather than tracking and recording what is happening in a systematic and actionable manner.
4. Data stored in web and application logs is a by-product of a process built to enable developers to debug failures and issues in the running of those applications.

Sadly, today, the above sources account for the vast majority of digital event data, rather than dedicated data collection processes.

<h2 id="commercial-imperative">3. The strong commercial imperative to collect data properly</h2>

Data is an asset. Used well, data can generate a huge amount of value and give companies a sustainable competitive advantage. This is well understood, which is why so many companies invest heavily in data processing infrastructure. It is therefore incredibly surprising that companies don't spend the time getting the basics, i.e. the data collection processes, right.

User data is something that companies can only collect in virtue of their relationship with their users. Each different company has a different relationship with its users, and provides different services to its users. Each, therefore, is in a position to collect different data from their own users. Part of the value of the data that companies collect is in its uniqueness.

Companies owe their users a duty of care to systematically collect that data and use it to provide a better service to those users, building that relationship to the users benefit. If that relationship successfully evolves, on the back of the insight generated from that data, then opportunities to collect data will only grow, creating a virtuous circle in which companies will use the data to provide a better and better service, and in turn generate more data that will open up new opportunities to better serve their customers.

<h2 id="doing-data-collection-right-is-a-moral-and-commercial-imperative">4. Doing data collection right is a moral as well as commercial imperative </h2>

Getting data collection right, then, does not just mean collecting reliable, easy-to-understand, easy-to-use data. It means treating that data as an asset, securing it on your own systems, and only sharing it selectively with vetted third parties, both to protect the commercial value of the data and out of respect for the trust that users have demonstrated when they have shared that data in the first place.

## Want to do data collection right?

Then get in touch with the Snowplow team to learn more.


[big-data-landscape]: http://mattturck.com/2016/02/01/big-data-landscape/
[big-data-landscape-image]: /assets/img/blog/2017/01/Big-Data-Landscape-2016-v18-FINAL.png
[introduction-to-event-data-modeling]: /blog/2016/03/16/introduction-to-event-data-modeling/
[identity-stitching]: http://discourse.snowplowanalytics.com/t/identifying-users-identity-stitching/31
[contact]: /about/index.html
[discourse]: http://discourse.snowplowanalytics.com/t/data-collection-the-essential-but-unloved-foundation-of-the-data-value-chain/932
