---
layout: page
group: guides
subgroup: analytics
breadcrumb: platform analytics
title: An overview of platform analytics with Snowplow
permalink: /guides/recipes/platform-analytics/
redirect_from:
  - /analytics/recipes/platform-analytics/
  - /analytics/platform-analytics/overview.html
  - /analytics/platform-analytics/sankey-diagrams-with-d3-js.html
  - /documentation/recipes/platform-analytics/
---

<h1>Platform analytics</h1>

1. [What do we mean by "platform analytics"?](#what)
2. [No one talks about "platform analytics". Why is that?](#why)
3. [Does it make sense to have the same recipes for online retailers as for media sites and SaaS businesses?](#same-or-different)
4. [Why is platform analytics difficult?](#difficult)
5. [Platform analytics recipes](#recipes)

<div class="html">
<a name="what"><h2>1. What do we mean by "platform analytics"</h2></a>
</div>

Any type of digital business (i.e. business with a significant online presence) depends heavily on their online product / platform / website / application working as effectively as possible. (Whether you use the term 'product', 'platform', 'website' or 'application' really depends on what type of digital business you work at. In the analytics cookbook, we'll use the term 'platform', to make it easy to distinguish 'platform analytics' from '[catalog analytics] [catalog-analytics]', as both are sometimes confusingly referred to as 'product analytics'.) Digital businesses may spend the bulk of their resources evolving their platform, to provide their users with the best possible experience, and stay ahead of the competition.

We use the term "platform analytics" to refer to any analysis that is geared towards driving those platform development decisions. This includes analysis conducted to answer any of the following questions:

1. How well is my platform performing?
2. Is the current version of my platform performing better than previous versions? How is it better?
3. What works well in the platform? What needs improving?
4. Which customer segments are well served by the platform? Which are not?
5. What is the expected return on investment delivering on specific platform upgrades?
6. What was the actual return on investment in delivering those specific platform upgrades?

<div class="html">
<a name="why"><h2>No one talks about platform analytics. Why is that?</h2></a>
</div>

The idea that you can use data to drive product development decisions is now widely accepted. Perhaps the most common examples of what we're calling 'platform analytics' is:

1. The use of A/B and multivariant testing to optimize e.g. the location and colour of UI elements, for example, on a website.
2. What we call 'funnel analytics'.

The idea that this is a small part of a much broader discipline called 'platform analytics' is still controversial, however. As far as we are aware (please let us know if we are wrong), there are not a lot of resources out there to guide analysts to use clickstream event data to do things like:

1. Identifying where your platform is functioning well, and where it needs improving
2. Quantifying the return on upgrades to your platform

Doing this sort of analysis is difficult. (We elaborate on why that is the case [below] (#difficult).) Nonetheless, we hope to show that it can be incredibly powerful tool to drive strategic as well as tactical decision making about product development. One of our big hopes in developing Snowplow, is that by 'setting the underlying data free', we'll help to enable a new wave of innovation in platform analytics that goes well beyond the A/B testing, funnel analysis and Sankey diagrams, that have categorised this discipline up until now.

<div class="html">
<a name="same-or-different"><h2>Does it make sense to have the same recipes for online retailers as for media sites and SaaS businesses?</h2></a>
</div>

Different digital platforms are designed to serve very different functions. We should therefore expect that platform analytics for e.g. an online retailer would look totally different to platform analytics for an online book-keeping application, for example.

There are, however, similarities in the tasks we perform when we do catalog analytics, that mean that similar techniques and approaches can be used in both cases. When we perform catalog analytics, we nearly always seek to understand:

1. How do users actually use this platform? (What are the journeys that they take? What workflows do they accomplish? Which are common and which are unusual?)
2. How successfully are users working through each workflow? Do users get stuck? What are the consequences?
3. How have changes to the platform changed the ways users accomplish different workflows? Are a higher percentage of them embarking on a workflow? Are a higher percentage of them making it to the end of that workflow?

These questions are general enough that they apply across businesses. The techniques to manipulate data to answer them are also similar, regardless of the type of business. So even though platform analytics looks different for different kind of businesses, the same tools and techniques can be used across them.

<div class="html">
<a name="difficult"><h2>Why is platform analytics difficult?</h2></a>
</div>

Platform analysis is fundamentally difficult because although we can use data to understand how uses *actually behaved* i.e. what their journeys look like, it is hard to unpick to what extent the journey is a function of:

1. What the user *wanted* to accomplish
2. The way the platform currently works

Trying to unpick the causes of user behavior is an art, not a science. The good platform analyst needs to be aware of this ambiguity, and draw on a combination of intuition and statistics to make hypotheses about the interaction of the two above factors, that can then be tested in a rigorous way using the data.

<div class="html">
<a name="recipes"><h2>Platform analytics recipes</h2></a>
</div>

1. [Funnel analysis] [funnel-analysis]

Back to [top](#top).

<div class="html">
<a name="performance"><h2>Performance timing</h2></a>
</div>

<a href="/documentation/recipes/platform-analytics/performance-timing/">Two recipes that use the performance timing context.</a>

[catalog-analytics]: /analytics/platform-analytics/overview.html
[funnel-analysis]: /analytics/platform-analytics/funnel-analysis.html
[sankey-diagrams]: /analytics/platform-analytics/sankey-diagrams-with-d3-js.html
