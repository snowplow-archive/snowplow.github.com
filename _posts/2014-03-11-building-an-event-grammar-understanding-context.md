---
layout: post
title: Building an event grammar - understanding context
title-short: Building an event grammar
tags: [event, analytics, grammar, model, semantic, context, environment]
author: Alex
category: Research
---

Here at Snowplow we recently added a new feature called "custom contexts" to our JavaScript Tracker (although not yet into our Enrichment process or Storage targets).

To accompany the feature release we published a [User Guide for Custom Contexts] [context-user-guide] - a practical, hands-on guide to populating custom contexts from JavaScript. We want to now follow this up with a post on the underlying theory of event context: what it is, how it is generated and why it is so useful for analytics. "Event context" isn't a phrase widely used in the analytics industry - and you have to go back to our blog post [Towards Universal Event Analytics] [towards-universal-analytics] for our first description of it:

_**Context**. Not a grammatical term, but we will use context to describe the phrases of time, manner, place and so on which provide additional information about the action being performed: "I posted the letter **on Tuesday from Boston**"_

This was a good start but there is much more to be said about event context. In this blog post, we will cover the theory of event context, grounding it in some examples of context being collected or derived by Snowplow today. I'll then look at some ideas around sources of context, followed by some notes on the relationship between context and prepositional objects. Finally I'll conclude with some thoughts on why event context is so powerful for analytics:

1. [Event context: the theory](/blog/2014/03/11/building-an-event-grammar-understanding-context/#theory)
2. [Context and Snowplow today](/blog/2014/03/11/building-an-event-grammar-understanding-context/#snowplow)
3. [Sources of context](/blog/2014/03/11/building-an-event-grammar-understanding-context/#sources)
4. [One man's context...](/blog/2014/03/11/building-an-event-grammar-understanding-context/#prepositions)
5. [The power of context](/blog/2014/03/11/building-an-event-grammar-understanding-context/#conclusion)

<!--more-->

<h2><a name="theory">Event context: the theory</a></h2>

In our earlier blog post, Towards Universal Event Analytics, event context was a little crowded out by the entities (subjects and objects) and verbs which composed our event grammar:

![grammar] [grammar]

Compared to the colourful entities and verbs, event context looked like simply "the intangible everything else" - the amorphous whitespace around our core event. Nothing could be further from the truth - event context is in fact tangible, easily recorded and hugely valuable for analysis.

Simply put, event context describes the environment and manner in which an event took place. There are strong parallels between our view of event context and the adverbial concept of "time, manner, place" used in human language to describe events. Context is used to describe, among other things:

* Where an event took place - where in the physical world, or in which digital environment
* When an event took place - either in absolute terms or relative to other events
* How an event took place - in what manner did an event take place

In fact a large proportion of Snowplow's existing Canonical Event Model is describing the context of the given event - as we will explore in the next section.

<h2><a name="snowplow">Context and Snowplow today</a></h2>

Today, our [Canonical Event Model] [canonical-event-model] contains 98 fields, and by our reckoning 57 of those fields solely relate to _event context_ in one form or another. Here is a brief summary of the context already present:

<table class="table table-striped">
	<thead>
		<tr>
			<th>Context category</th>
			<th>Example fields</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><strong>Temporal</strong></td><td><ul><li>dvce_tstamp</li><li>collector_tstamp</li><li>os_timezone</li></ul></td><td>When this event took place</td>
		</tr>
		<tr>
			<td><strong>Geographical</strong></td><td><ul><li>geo_latitude</li><li>geo_longitude</li><li>geo_country</li></ul></td><td>Where in the real-world this event took place</td>
		</tr>
		<tr>
			<td><strong>Environmental</strong></td><td><ul><li>platform</li><li>br_name</li><li>os_family</li></ul></td><td>The computing environment in which this event took place</td>
		</tr>
		<tr>
			<td><strong>Narratorial</strong></td><td><ul><li>v_tracker</li><li>v_collector</li><li>v_etl</li></ul></td><td>Who narrated this event (our data pipeline)</td>
		</tr>
		<tr>
			<td><strong>Antecedental</strong></td><td><ul><li>refr_urlpath</li><li>mkt_medium</li><li>mkt_campaign</li></ul></td><td>What occurred prior to (and potentially caused) this event</td>
		</tr>
	</tbody>
</table>

As you can see, our Canonical Event Model is chock full of context! But not all of this context is created equal - in the next section we will explore where context comes from, and how reliable it is.

<h2><a name="sources">Sources of context</a></h2>

It might be natural to assume that all event context is captured at the point of creating ("tracking" in Snowplow language) an event. In fact things are not that simple - but we can think of context coming from three distinct sources:

1. **Primary context:** context which was captured directly at the point of creating the event
2. **Secondary context:** context can be captured further down the event pipeline, for example at the point of _collecting_ the event
3. **Derived context:** new context can be derived from existing primary or secondary context

To dive into a couple of examples:

**Primary and secondary timestamps**

For a simple comparison between primary and secondary context, consider our two event timestamps:

![timestamps] [timestamps]

Both of these are pieces of temporal context, but they originate from different places. And interestingly, they have very different reliability profiles and thus use-cases:

* `dvce_tstamp` is set by the client's system clock, which is frequently incorrect
* `collector_tstamp` is set by the collector's server clock, which is accurate but can only record when the event was collected, not created

Thus for absolute analyses across multiple users, `collector_tstamp` provides the best temporal information. However, this introduces some uncertainty around the ordering of events which happened close together, so for e.g. a funnel analysis tied to a specific user, `dvce_tstamp` would be the best temporal context.

**Derived geographical and meteorological context**

Additionally, it is possible to _derive_ new context from one or more pieces of existing context. Here is an illustration of this:

![derived] [derived]

As you can see here, we collect `ip_address` and `collector_tstamp` as pieces of secondary context in the collector. Then in the Enrichment phase, we are able to derive a new set of geographical context (`geo_latitude`, `geo_longitude` etc) by performing a MaxMind geo-IP lookup on the user's `ip_address`.

To push this example further: we could potentially then use the `collector_tstamp`, `geo_latitude` and `geo_longitude` to derive weather context from that information. This is not an Enrichment currently supported by Snowplow, but it is a great example of a second-order derived context.

<h2><a name="prepositions">One man's context...</a></h2>

There's one more complexity I'd like to discuss before wrapping up, which could be summed up by:

_One event's context is another event's object (or subject or...)_

Let's demonstrate this by comparing two events. In the first, a customer is viewing a web page:

![view] [view]

In the second event, the customer is now adding an item to their basket:

![add] [add]

But crucially, in the second event, the customer is still on a web page. This web page is no longer the direct object of the event - but it is still relevant information: it gives us spatial context, on where the event took place.

Thus we can see that one event's direct object becomes context for another event; in both events, we are modelling some kind of `web_page` entity, but it serves different roles in both events.

We introduced a closely-related concept in our blog post [Towards Universal Event Analytics] [towards-universal-analytics] with talk of prepositional objects:

_the first player (Subject) kills (Verb) the second player (Direct Object) **using a nailgun (Prepositional Object)**_

As we evolve our event grammar further, we will need to consider whether prepositional objects and context should be treated separately, or merged into one broader concept.

<h2><a name="conclusion">The power of context</a></h2>

Event context provides a huge amount of valuable metadata around our core subject-verb-object grammar, as evidenced by the large proportion of our Canonical Event Model which is given over to context.

If the core subject-verb-object dynamic tells us who did what to whom, then context tells us something much more discursive and subjective, but much richer too: _how_ was it done, _where_ was it done, _why_ was it done. We are hugely excited about all forms of context at Snowplow, and we believe there is much more context still to be collected, not least:

* Tracking additional _primary context_ from new platforms and environments, such as iOS or Android-specific environmental context
* Capturing additional _secondary context_ from our collectors, for example capturing browser cookies or other headers
* Generating new _derived context_ in our Enrichment process, for instance adding in a weather-based Enrichment

But the challenge of context is not just to accrete as much context as possible - we also want to work to structure and schema the context we already have better. Currently Snowplow stores contextual information in our "fat" Redshift table using a simple namespacing approach. Rest assured that we are exploring cleaner ways of storing this information as part of our wider event grammar research!

[context-user-guide]: /blog/2014/01/27/snowplow-custom-contexts-guide/
[towards-universal-analytics]: 2013/08/12/towards-universal-event-analytics-building-an-event-grammar/
[canonical-event-model]: https://github.com/snowplow/snowplow/wiki/canonical-event-model

[grammar]: /assets/img/blog/2014/03/event-grammar.png
[timestamps]: /assets/img/blog/2014/03/timestamps.png
[derived]: /assets/img/blog/2014/03/derived.png
[view]: /assets/img/blog/2014/03/view.png
[add]: /assets/img/blog/2014/03/add.png
