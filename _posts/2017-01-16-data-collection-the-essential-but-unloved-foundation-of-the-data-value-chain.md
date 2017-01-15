# Data collection: the essential, but unloved, foundation of the data value chain

## Intro

It's so obvious no one bothers saying it:

> Data collection is an essential part of any data strategy

After all: without data, there is no data value chain.

It's not just that people in data don't remark on the importance of data collection. They do not talk about data collection *at all*. To take just one example, let's review [Firstmark's Big Data Landscape][big-data-landscape]:

![Firstmark-big-data-landscape-2016][big-data-landscape-image]

Roughly 15% of the landscape is given over to the 'Data Sources and API' providers. However, there are no providers listed, either in that section, or the rest of the map, that specialize in enabling companies to collect their own data. The Big Data Landscape, then, is full of vendors that will help you do things with your data, and provide you with their data. But all those providers take assume you have your own data to do stuff with, so have got data collection sorted.

The awkward truth is that although most companies do have some of their own data, it's not great. And most, choose to invest in the rest of their data / analytics stack, without putting in place proper processes and systems, to collect and store the right data in the first place. In this post, I'm going to explore:

1. [What makes good data?](#what-makes-good-data)
2. [Strategies and techniques to systematically collecting and generating good data](#strategies-and-techniques-for-systematically-collecting-and-generating-good-data)
3. [How we've incorporated those strategies and techniques in the Snowplow architecture](#how-we-have-incorporated-those-strategies-and-techniques-in-the-snowplow-architecture)
4. [There is a strong commercial imperative to collect data properly](#commercial-imperative)
4. [Doing data collection right is a moral as well as commercial imperative](#doing-data-collection-right-is-a-moral-and-commercial-imperative)


<h2 id="what-makes-good-data">1. What makes good data?</h2>

Not all data is equal. Good data is:

1. [Reliable](#reliable)
2. [Easy to understand](#easy-to-understand) (for humans and machines)
3. [Easy to work with](#easy-to-work-with)

<h3 id="reliable">1.1 Good data is reliable</h3>

If we're going to build intelligence and make decisions based on data, then that data needs to be reliable. To be reliable, data needs to be:

1. **Accurate**. If the data suggests that a consumer was looking at A, when in fact they were looking at B, the data is not accurate. When the data says that the user was looking at A, we need to be sure that the user was, in fact, looking at A.
2. **Precise**. If the data suggests that the user was viewing an article for 2 minutes and 10 seconds, that is more precise than suggesting that the user was viewing an article for 2 minutes. 
3. **Complete**. This is the hardest requirement to ensure. Say we are recording the number of times a web page is loaded. How do we built confidence that *every* time we load the web page, our tracking will work? (Maybe, for example, our tracking is prevented from tracking particular page views on particular browsers by ad blockers for example.)

<h3 id="easy-to-understand">1.2 Good data is easy to understand. (For humans and machines.)</h3>

Data is a representation of a set of things, in the world, that have happened, or have been measured. In order to use data, we need to understand what that data represents, in the world. If the data represents a particular set of events, in a user journey, for example, we need to understand the possibility space in which that user journey has occurred in, in order to do anything intelligent with the data. It's not enough to know what happened. We need to understand what happened in the context of what might have happened, in order to ask sensible questions about why what happened happened, and what didn't happen, didn't happen.

There is therefore a lot of contextual knowledge, that is required, to make sense of data. Good data, as far as possible, needs to 'incorporate', or be packaged with, that contextual information (itself represented as data), to make it easy, for someone or some artificial intelligence, down the line, to take that data and use it to draw an inference. We often describe that contextual information as metadata. 

There's more to making data easy to understand than metadata, though. The data itself should be as unambiguous. Data that says 'this page loaded at this time' is better than data that says 'this page might have loaded at this time'. 

<h3 id="easy-to-work-with">1.3 Good data is easy to work with.</h3>

If data is reliable and easy to understand, it is by definition, easy to work with. However, there is something else that makes data easier to work with: it should be easy to plug the data in to a wide range of different analytics tools, and use those tools to process the data.


<h2 id="strategies-and-techniques-for-systematically-collecting-and-generating-good-data">2. Strategies and techniques to systematically collecting and generating good data </h2>

### 2.1 Ensuring that data collected is reliable

Whilst there are always going to be limits in the reliability of anything that is measured or recorded, and therefore the corresponding data set, there are three important things we can do when building data collection processes to maximize the reliability of the data generated:

1. [Ensure that data collection and processing is fully auditable](#auditable)
2. [Ensure that data collection is non-lossy](#non-lossy)
3. [Ensure that the metadata that is generated with the data is incredibly precise](#precision)

Let's take each strategy in turn:

<h4 id="auditable">2.1.1 Ensure that data collection and processing is fully auditable</h3>

Whilst digital analysts might not have much history worry about data reliability, other professions, notably accounting, but long been concerned about data veracity.

If our data collection is auditable, we can check that is works as advertised. If we can break down each step in the data processing pipeline, check the input and output to each step, and rerun each and every step in that pipeline, we can build very high levels of confidence about the reliability of the data generated. If anyone has any doubts about the data quality, she or he can go back and reprocess that data, from scratch, to identify if there were any steps in the collection process that might have compromised the data.

<h4 id="non-lossy">2.1.2 Ensure that data collection is non-lossy</h3>

In areas of data collection outside of digital analytics, the requirement that a data pipeline be non-lossy is an obvious one. An odometer in a car, for example, would not be very good if it only recorded 3 in every 4 miles that a car had been driven.

In Digital Analytics, however, data pipelines have historically been lossy: data will typically enter the pipeline that doesn't successfully 'make it through'. The reason is relatively simple: the web is a wild place with a large number of bad actors. A cursory examination of any Snowplow collector log records will reveal a large number of requests originating from bots and spiders looking for vulnerable servers to attack. With good reason, web analytics vendors ignore the requests generated by these types of bots and spiders as they do not represent activity of users on websites, for example.

The trouble with ignoring the requests altogether is that as soon as you have a data pipeline where data can flow in but not flow out, it is possible (even likely) that some data that should make it all the way through the pipeline is dropped. For this reason, modern data pipelines used in digital analytics should not be lossy: rather than dropping data, it should be 'redirected' somewhere where it can be investigated and verified and reprocessed if necessary, rather than disappear in the ether.

<h4 id="precision">2.1.3 Ensure that the metadata that is generated with the data is incredibly precise</h3>

There are hard limitations to the precision with which we can record data in the real world. For example, we cannot measure the length of something to the millimeter, if our measuring instrument is a meter rule. Similarly, in digital analytics, there are practical limits to the precision with which we can measure how long a web page is visibile in the browser window. Even if we could measure this with 100% accuracy, we wouldn't know that the individual browsing was actually looking at the web page over that entire time, and had not diverted her / his attention in that time.

What we can do, instead, however, is be incredibly precise about the metadata we record with the data. To return to our measurement of how long the user was reading the web page, we might say, with 100% accuracy, that:

1. Four page pings, or 'heartbeats' were recorded, on this browser, on this date, on this web page URL, with this title, description and length
2. The page pings were recorded with the Snowplow Javascript Tracker 2.7.0
3. The tracker was set to record a page ping every 10 seconds where a user was 'active' at least once in the 10 second window, where activity is defined as any type of interaction with the DOM.

By being very precise in our definition of what was measured, we can ensure that our data is 100% reliable. There's then an inference, that needs to be made, from that data, to a 'fact' about how long this particular user was reading the contents of this particular web page, on this particular date. Whilst there are limits to the precision of that 'fact', it should be clear how that is inferred from the underlying data. If someone then wants to question whether that inference is valid, she or he can go back to the underlying data and make an alternative inference, because the underlying data, is precise.

### 2.2 Ensuring that data collected is easy-to-understand (for humans and machines)

There are two key strategies for ensuring that data is easy to understand:

1. [Bundle data with metadata about what that data represents, how it was generated and how it was processed](#metadata)
2. [Ensure that the data (and metadata) collected is highly structured](#structured)



<h2 id="how-we-have-incorporated-those-strategies-and-techniques-in-the-snowplow-architecture">3. How we've incorporated those strategies and techniques in the Snowplow architecture </h2>

Blah

<h2 id="doing-data-collection-right-is-a-moral-and-commercial-imperative">4. Doing data collection right is a moral as well as commercial imperative </h2>

Blah



[big-data-landscape]: http://mattturck.com/2016/02/01/big-data-landscape/ 
[big-data-landscape-image]: assets/img/blog/2017/01/Big-Data-Landscape-2016-v18-FINAL.png