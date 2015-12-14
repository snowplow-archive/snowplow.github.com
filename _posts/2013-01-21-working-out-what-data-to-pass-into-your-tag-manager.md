---
layout: post
title: What data should you be passing into your tag manager?
tags: [tag management, datalayer, universal variable, google tag manager, open tag, qubit]
author: Yali
category: Integration
---

Since the launch of [Google Tag Manager] [gtm], a plethora of blog posts have been written on the value of tag management solutions. What has been left out of the discussion is practical advice on how to setup your tag management solution (be it [GTM] [gtm] or [OpenTag] [opentag] or one of the paid solutions), and, crucially, what data you should be passing into your tag manager. In this post, we will outline a methodology for identifying all the relevant data you should be passing in, and bringing that methodology to life with a real-world example.

<img src="/assets/img/tag-management/tag-management-schematic.gif" width="320" />

## Why is it important to define, at implementation time, what data to pass to your tag manager?

One of the things we hear a lot from proponents of tag management (especially from web analyts) is that they make it easy to capture data from web pages. Indeed, the *best* solutions enable analysts with no development knowledge to identify and capture new data points, to pass onto their web analytics program, without any programming knowledge, using snazzy drag-and-drop UIs.

<!--more-->

We think this is rather dangerous. We're much more excited about the way that tag management solutions enable webmasters to explicitly pass data into their tag management solutions using constructs like the [`dataLayer`] [dataLayer] in GTM and the [`Universal Variable`] [universal-variable] in OpenTag. The nice thing about this approach is that the infrastructure for managing the flow of data into your analytics infrastructure is decoupled from the infrastructure delivering the end-user experience. It means that web masters are free to improve websites, able to modify elements of web pages without breaing any data transfer processes. It forces companies to think through what data they should be capturing, and document it. It makes it easy for analysts and data scientists, down the line, to audit what data is being collected and how.

The trouble with insisting on formally passing data to your tag management system using things like the [`dataLayer`] [dataLayer] or [`Universal Variable`] [universal-variable] is that it makes the process of implementing a tag management system more complicated: because you have to identify all the data points you want to pass to your web analytics (and advertising) systems and often develop a data model for transferring them to your tag management system, so that it can pass them on via the tags it fires.

For Snowplow users, the challenge is more acute. Whereas other analytics systems recommend that you only pass data into them that you know how to use / evaluate, we recommend that Snowplow users pass in *all* the data associated with the events on a user journey so that analysts have a **complete** picture of a user's journey. Then it is up to the analyst to decide whether or not specific bits of data are valuable based on what he / she does with that data (rather than prejudging it). So for Snowplow users who are setting up a tag management system, the challenge is to identify, upfront **all** the data points to pass into the tag management system, so that they can be passed on to Snowplow via the Snowplow tracking tags. Simple, right?

## What data do we want to pass into Snowplow?

Broadly speaking, there are types of data that we want to process in Snowplow: event data and page-level data.

### Event data

At its heart, Snowplow is a tool for capturing, storing and analysing event-stream data, with a focus on web event data. We aim to capture all events that occur on an individual's customer journey. To give a random assortment of examples of the types of events we might include:

* Add item to basket
* Like a post
* Invite someone to be friends
* Watch a video
* Review a product
* Log in to an application
* Create and display a graph
* Send a message
* Create a listing
* Update a status
* Ask a question
* Book a flight
* Donate to a charity

As part of setting up a tag management solution, it is important to identify all the possible events that can occur to a user on his / her journey through our website, and what data we want to capture for each of those event types.

### Web page entity data

As the web evolves, websites look less-and-less like hyperlinked documents and more-and-more like interactive applications. A larger fraction of interesting events on a customer journeys are powered by AJAX events, and fewer are enabled by web page loads.

In spite of this evolution, web page loads are still very important events in a user journey. Broadly speaking, we capture data that occur thanks to AJAX events using the [Snowplow event tracking method] [snowplow-event-tracker] except for specific events that have their own specific methods e.g. [tracking ecommerce transaction] [snowplow-ecomm-tracker] or [ad impression tracking] [snowplow-ad-imp-tracker].

To capture the broad swathe of events that result in a web page load, we use the [page tracker method] [snowplow-page-tracking]. However, performing an analysis on the journey a user has taken based on the URLs and page titles of the pages they have visited is not that informative: we really want to store what entities were displayed on those web pages, so we can analyse what the user was shown, what entities they engaged with and which they did not. To take a simple example, we might want to compare conversion rate for a retailer by product, to see which products 'convert best' and why. In order to do this, we need to pass onto Snowplow exactly what products were displayed on the web pages they visited, and potentially pass in additional information like what type of listing they were shown.

To give an example of the types of entities we might identify:

* Products
* Articles / blog posts
* Videos
* Adverts
* People / connections
* Jobs
* Flights

As well as identifying all the events that can occur on a user journey, then, we *also* need to identify **all** the key elements that make up each web page, and pass them to our tag manager on page load, as part of a tag management implementation.

## Summarising our method for identifying all the data points to pass into the tag manager

We are now in a position to pull the above information together and summarise our suggested approach:

1. Identify all the relevant events that can occur to a user navigating your website app. Catalogue each.
2. For each event type, document what data should/could be captured
3. Comb through each web page that makes up your website, and identify the relevant entities that that make up web pages.
4. For each entity, document what data you want to capture

## Bringing the method to life: a real-world example

We applied the above methodology to [Psychic Bazaar] [psychic-bazaar], an online retailer in the esoteric space. The good folks at Psychic Bazaar have kindly allowed us to share the implementation guide, so you can see the approach in action. Psychic Bazaar is in the process of implementing Google Tag Manager. However, the approach outlined is tag manager agnostic: if they implemented OpenTag instead, then references to the `dataLayer` would be replaced to references to the `Universal Variable` - the actual data and structure of the data would remain unchanged.

<a href="/assets/pdf/google-tag-manager-implementation-specification-for-psychic-bazaar.pdf"><img src="/assets/img/tag-management/gtm-spec-title-page.JPG"></a>

## Want help implementing a tag management solution?

The Snowplow [Professional Services team] [pro-services] can produce implementation guides like [the one for Psychic Bazaar][imp-guide]. If you are implementing a tag management solution, either as part of a Snowplow implementation or not, and and would like assistance, then [get in touch] [contact-us].


[gtm]: https://www.google.com/tagmanager/
[opentag]: http://www.opentag.qubitproducts.com/
[infographic]: /assets/img/tag-management/tag-management-schematic.gif
[dataLayer]: https://developers.google.com/tag-manager/reference
[universal-variable]: https://github.com/QubitProducts/UniversalVariable
[snowplow-event-tracker]: https://github.com/snowplow/snowplow/wiki/javascript-tracker#wiki-events
[snowplow-ecomm-tracker]: https://github.com/snowplow/snowplow/wiki/javascript-tracker#wiki-ecommerce
[snowplow-ad-imp-tracker]: https://github.com/snowplow/snowplow/wiki/javascript-tracker#wiki-adimps
[snowplow-page-tracking]: https://github.com/snowplow/snowplow/wiki/javascript-tracker#wiki-page
[contact-us]: /about/index.html
[psychic-bazaar]: http://www.psychicbazaar.com/index.php
[imp-guide]: /assets/pdf/google-tag-manager-implementation-specification-for-psychic-bazaar.pdf
[pro-services]: /services/index.html
