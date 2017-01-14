# Data collection: the essential, but unloved, foundation of the data value chain

## Intro

It's so obvious no one bothers saying it:

> Data collection is an essential part of any data strategy

It's not just that people in analytics don't remark on the importance of data collection. They do not talk about data collection at all. To take just one example, let's look at the famous [Firstmark Big Data Landscape][big-data-landscape]:

![Firstmark-big-data-landscape-2016][big-data-landscape-image]

I reckon 15% of the landscape is given over to the 'Data Sources and API' section. However, there are no providers listed, in that section, or the full landscape, that specialize in helping companies collect their own data on what's going on in their own businesses, with their own users. The Big Data Landscape, then, is full of vendors that will help you do things with your data. But all those providers take assume you have data to do stuff with, so have got data collection sorted.

In this post, I'm going to take a long hard look at data collection. I'm going to argue that:

1. [Data collection is really important](#data-collection-is-really-important).
2. [There are a number of requirements to be met, to collect good data?](#what-does-good-data-collection)
3. [There are a number of strategies and techniques for collecting good data](#data-collection-is-hard). 
4. [Doing data collection right is a moral as well as commercial imperative](#doing-data-collection-right-is-a-moral-and-commercial-imperative).
5. [How we're trying to make it easier for companies to do data collection right at Snowplow](#making-it-easier)



<h2 id="data-collection-is-really-important">1. Data collection is essential</h2>

Data value chain:

1. Collect data
2. Develop insight
3. Act on that insight

<h2 id="data-collection-is-hard">2. Understanding what makes <em>good</em> data</h2>

### 2.1 The data should be easy to understand (for humans and machines)

The importance of self-describing data: structure and metadata.

The structure of the data should describe the world in a very natural way.

### 2.2 The data should be rich

The importance of enrichment.

### 2.3 The data should be reliable 

The importance of auditability and validation.

Collecting data from the right place: as far upstream as possible

Discuss tracking data live from applications vs:

1. Pulling it from databases built to serve transactional/production systems
2. Fetching it out of log files

<h2 id="strategies-for-collecting-good-data">3. Strategies and techniques for collecting good data</h2>


### 2.3 

<h2 id="doing-data-collection-right-is-a-moral-and-commercial-imperative">3. Doing data collection right is a moral as well as commercial imperative </h2>


<h2 id="making-it-easier">4. How we're trying to make it easier for companies to do data collection right at Snowplow </h2>

[big-data-landscape]: http://mattturck.com/2016/02/01/big-data-landscape/ 
[big-data-landscape-image]: assets/img/blog/2017/01/Big-Data-Landscape-2016-v18-FINAL.png