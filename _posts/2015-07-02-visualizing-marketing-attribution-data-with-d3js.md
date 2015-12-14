---
layout: post
title: "Analyzing marketing attribution data with a D3.js visualization"
tags: [data, marketing, attribution, data visualization, data pipeline, javascript, d3]
author: Justine
category: Analytics
---

[Marketing attribution](https://en.wikipedia.org/wiki/Attribution_(marketing)), as in understanding what impact different marketing channels have in driving conversion, is a very complex problem:

1. We have no way of directly measuring the impact of an individual channel on a user's propensity to convert
2. It is not uncommon for users to interact with many channels prior to converting
3. It is likely that different channels impact each other's effectiveness

Because of this difficulty, there is not yet a consensus in digital analytics around the best approach to performing attribution, although there is a lot of desire to move beyond simplistic first touch, last touch and basic models.

As a step in that direction, we've started to experiment with new approaches to visualizing attribution data. The purpose is to enable analyst to understand:

1. Combinations of marketing channels that are common (highly trafficked)
2. Similar journeys, where there appear to be significant differences in conversion rate. (This may suggest that there is something interesting in the difference between the two journeys.)
3. Journeys with particularly high conversion rates

Even these simple first steps are not straightforward with the visualization provided by digital analytics tools today.

We have built a first version of this, which we plan to iterate on:

<div id="vis"></div> <!-- place this line where the visualization should go -->

<!--more-->

## Interpreting the visualization

The visualization represents the different journeys taken by users. A journey is made up of a sequence of marketing touches, where the touches are displayed in the order that they occurred in. For example, a journey may consist of: "Social, Advertising, Partners, Social" where there are 4 touches on 3 touchpoints ("Social", "Advertising" and "Partners").

Each journey is represented then as a series of blocks, and is read left to right, with the first marketing touch in the journey on the left and the last on the right:

<!--JUSTINE! INSERT AN ANNOTATED SCREENSHOT HERE -->
![Annotated screenshot of one journey where each step is annotated with the channel it corresponds to](/assets/img/blog/2015/06/annotated-journey-example.png)

For each journey we visualize two metrics:

1. The conversion rate for users who have gone through that journey
2. The number of users who have gone through that journey

We have represented (1), the conversion rate for each journey, by its position on the y-axis. This means that journeys higher up in the visualization had a greater percentage of users who converted than those further down.

We represented (2), the number of users who have gone through that journey, by the height of the bars. Hence a journey that is more highly trafficked is 'fatter'.

<!--JUSTINE! INSERT A SCREENSHOT OF TWO JOURNEYS, ONE HIGHLY TRAFFICKED AND ONE WITH LOW TRAFFIC LEVELS, HERE-->
![two journeys, one highly trafficked and fatter, the other low traffic and thinner](/assets/img/blog/2015/06/fat-and-thin-journeys-example.png)

## Interacting with the visualization

One of the challenges with attribution data sets is that there are potentially a very large number of different conversion pathways, or journeys, making it hard to visualize clearly in a static representation on a fixed area.

We therefore used D3.js's capabilities to make it possible for an analyst to explore the data set in a dynamic way, zooming into parts of the visualization that are very crowded, so that an analyst can explore the visualization and unpick those journeys that they are particularly interested in.

The translucent gray rectangle on the y axis is the equivalent of a scrollbar as it can be dragged up and down. It is also possible to resize this rectangle by clicking and dragging its ends, to the effect of zooming into the chart, as this rectangle represents a viewport into the chart. The translucent circles on the y axis represent a journey each and allow the user of the chart to see if there are journeys not covered by the viewport, as well as a quick view of the density of the journeys' conversion rates.


## Understanding how the visualization was built

### Why we chose D3.js

We built the visualization using the JavaScript library [D3.js](http://d3js.org/) to take advantage of its [dynamic properties](http://d3js.org/#properties) and make a visualization that adapted to the unique dataset it was given.

### How is the visualization built ?

At the core of D3 are [selections](http://bost.ocks.org/mike/selection/). In simplified terms, selections are a group of elements. For example, in each journey we have a group of the steps that define that journey. We are drawing the visualization using [SVG elements](https://github.com/mbostock/d3/wiki/SVG-Shapes) so we represent each journey step as a rectangle `<rect />` element:

{% highlight js %}
var journeySteps = journeys.selectAll('rect') // journeys is a selection of 'g' elements
{% endhighlight %}

The `journeys` themselves are a selection of SVG [group elements](http://www.w3.org/TR/SVG/struct.html#Groups) `<g></g>` with a class to distinguish them from other group elements. Group elements are useful to group other elements, such as the `journeySteps` described above, and also to apply certain styles and transformations that are then shared by all elements of the group, for example opacity:

{% highlight js %}
var journeys = container.selectAll('g.journey') // container is another svg element containing all the chart elements
{% endhighlight %}

which is styled:

{% highlight css %}
g.journey {
  opacity: 0.8
}
{% endhighlight %}

The important part is to ['bind' these selections to datasets](http://bost.ocks.org/mike/join/). This is done using the `data()` method on the selection. The argument passed to `data()` is an array so that elements in the data array can correspond to elements in the selection.

Here is a sample of our test dataset to make it easier to follow the code that follows:

{% highlight js %}
{
  "values": [
    {
      "letters": ["A", "B", "A", "B"],
      "conversionRate": 0.054,
      "sessionCount": 100000
    }
  ]
}
{% endhighlight %}

{% highlight js %}
var journeys = container.selectAll('g.journey')
    .data(dataset.values)
{% endhighlight %}

How these elements are added to the webpage depends on the [enter](http://bost.ocks.org/mike/circles/#entering) selection, where we explain via code how we want elements that have a corresponding datum but no actual presence in the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) on the webpage to appear. For example:

{% highlight js %}
journeys.enter()
  .append('g')
    .classed('journey', true)
{% endhighlight %}

The declarative way D3 deals with manipulating elements on the webpage via data bound to those elements is very interesting and powerful; I highly recommend reading [tutorials](https://github.com/mbostock/d3/wiki/Tutorials) to understand more. The [official docs](https://github.com/mbostock/d3/wiki/API-Reference) are also very readable.

### Key functions

When you bind data to elements, you can specify a [key function](http://bost.ocks.org/mike/constancy/), like this:

{% highlight js %}
function keyFunction(d) {
  return d.letters
}

var journeys = container.selectAll('g.journey')
    .data(dataset.values, keyFunction)
{% endhighlight %}

This makes sure that when the dataset of journeys is updated (in the case of using a different filter to choose which journeys to display for example), journeys that are the same between datasets are considered the same journey. The key function allows us to define what is meant by 'same': two journeys are the same journey if they have the same sequence of letters.

Note: the output of the key function has to be a string, or the `toString` method will be called on it. It therefore wasn't possible to simply use the identity function `function(d) { return d }` because, even though the datum objects are all different, when `toString` is called on an Object it returns `"[object Object]"` so all the journeys would be considered the same.

### How is the zooming and scrolling effect achieved ?

The zooming and scrolling effects are achieved using two different [scales](http://bost.ocks.org/mike/bar/#scaling) for the Y positioning, based on [this example](http://bl.ocks.org/mbostock/1667367). Scales in D3 are functions that take elements from the data 'domain', and turn them into visible pixels in the visible 'range'.

One scale, the `yScaleOnAxis`, determines positioning according to the y axis, which doesn't change. The other scale, `yScaleOnChart`, determines positioning on the chart. There is a `brush`, in D3 terms, that sits on the Y axis and corresponds to a viewport for what we want to see on the chart.

Whenever the brush is changed by clicking and dragging, a 'brush' event is triggered. We add an event listener for this 'brush' event:

{% highlight js %}
var viewport = d3.svg.brush()
  .y(yScaleOnAxis)
  .on('brush', function() {
    yScaleOnChart.domain(viewport.empty() ? yScaleOnAxis.domain() : viewport.extent())
    drawInnerChart({ journeyTransitionDuration: 50 })
  })
{% endhighlight %}

Each time the viewport is changed by the user, the `yScaleOnChart` scale updates its domain (this is updated in the scope of the [function](https://gist.github.com/galvanic/2eb5043ea7c2dd845975#file-journeyschart-js-L68) applied to the dataset to draw the whole chart). The domain value it is updated to depends on the state of the viewport, using the [ternary operator](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Conditional_Operator): if the viewport is empty, the domain of `yScaleOnChart` is updated to the domain of `yScaleOnAxis`; if it is not it is updated to the return value of `viewport.extent()`.

This is because calling `domain()` without an argument returns its current value without calling it with an argument sets it. The same applies to `extent()`. The extent corresponds to the domain data values the viewport covers. Therefore by changing the `yScaleOnChart` domain to the new `viewport.extent()`, when the chart is re-drawn in the next line of the code, the journeys' vertical position will be re-computed using the new `yScaleOnChart` scaling function:

{% highlight js %}
function drawInnerChart(params) {

  [...]

  journeys
    .transition()
      .duration(barTransitionDuration)
      .attr('transform', function(d) { return 'translate(' + 0 + ',' + yScaleOnChart(d.conversionRate) + ')' })

  [...]

}
{% endhighlight %}

In summary:

  1. user clicks and drags viewport causing:

    1. the 'brush' event to be dispatched
    2. `viewport.extent()` to change value

  2. the 'brush' event triggers the following:

    1. the `yScaleOnChart` re-sets its domain to the new viewport extent
    2. the inner chart is redrawn

  3. Inside the `drawInnerChart` function, the `journeys` selection is [updated](http://bl.ocks.org/mbostock/3808218):

    1. For each 'g.journey' element, its vertical position value is recomputed using the `yScaleOnChart` scaling function
    2. The 'g.journey' element is translated (in the mathematical transformation sense of it moving across the webpage) by the newly calculated vertical position

## Iterative Methodology

The presented visualization is just a first iteration. In the next stage of the project, I will work backwards from the visualization to figure out how the data needs to be *computed* and *fetched* from Snowplow to be fed into D3. I'm going to experiment with loading the data from Amazon's [DynamoDB](https://aws.amazon.com/documentation/dynamodb/) and to compute the data served from Dynamo in Spark, which I have already [researched](http://snowplowanalytics.com/blog/2015/05/21/first-experiments-with-apache-spark/).

Once the pipeline is completed I will be able to iterate on it. We plan to test it with real-world data - if you are interested in using this to visualize your data then [get in touch][contact]. We already have a long list of improvements we'd like to make to the visualization, including the ability to filter journeys (so fewer are displayed) and drill through the hierarchy of marketing campaign data (from e.g. medium to source to campaign to term / content).

[contact]: /about/
