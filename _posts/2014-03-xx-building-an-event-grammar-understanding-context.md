---
layout: post
shortenedlink: Building an event grammar - understanding context
title: Building an event grammar - understanding context
tags: [event, analytics, grammar, model, semantic, context, environment]
author: Alex
category: Research
---

Here at Snowplow we recently added a new feature called "custom contexts" to our JavaScript Tracker (although not yet into our Enrichment process or Storage targets). To accompany the feature release we published a [User Guide for Custom Contexts] [context-user-guide] - a practical, hands-on guide to populating custom contexts from JavaScript. We want to now follow this up with a post on the underlying theory of event context: what it is, how it is generated and why it is so useful for analytics. "Event context" isn't a phrase widely used in the analytics industry - and you have to go back to our blog post [Towards Universal Event Analytics] [towards-universal-analytics] for our first description of it:

_**Context**. Not a grammatical term, but we will use context to describe the phrases of time, manner, place and so on which provide additional information about the action being performed: "I posted the letter **on Tuesday from Boston**"_

This was a good start but there is much more to be said about event context. In this blog post, we will cover the theory of event context, grounding it in some examples of context being collected or derived by Snowplow today. I'll then take a brief detour through how conventional analytics packages implicitly attempt to support event context, before finishing with some thoughts on why event context is so powerful for analytics:

<< TOC >>

<!--more-->

Event context: the theory

In our earlier blog post, Towards an Event Grammar, event context was a little crowded out by the entities (subjects and objects) and verbs which composed our event:

xxx

Compared to the colourful entities and verbs, event context looked like simply "the intangible everything else" - the amorphous whitespace around our core event. Nothing could be further from the truth - event context is in fact tangible, easily recorded and hugely valuable for analysis.

Simply put, event context describes the environment and manner in which an event took place. There are strong parallels between our view of event context and the adverbial concept of "time, manner, place" used in human language to describe events. Context is used to describe, among other things:

* Where an event took place - where in the physical world, or in which digital environment
* When an event took place - either in absolute terms or relative to other events
* How an event took place - in what manner did an event take place

In fact a large proportion of Snowplow's existing Canonical Event Model is describing the context of the given event - as we will explore in the next section.

Context and Snowplow today

Today, our Canonical Event Model contains some XX fields, and by our reckoning XX of those fields relate to context

<< ADD TABLE >>


As you can see, 

Here are some examples of contextual information which are captured by the Snowplow JavaScript Tracker 


A variety of contexts

[]: 
[towards-universal-analytics]: 
[]:
[]: 