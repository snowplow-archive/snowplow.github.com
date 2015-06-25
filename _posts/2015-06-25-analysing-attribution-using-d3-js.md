---
layout: post
shortenedlink: Visualising user journeys towards better marketing attribution (?)
title: Visualising user journeys towards better marketing attribution (?)
tags: [data, marketing, attribution, data visualisation, data pipeline, javascript, d3]
author: Justine
category: Other
---

Visualising user journeys using D3
==================================

1. Outline problem domain
2. Outline iterative methodology -> build a visualization -> get structure of data in dynamo -> build spark job to compute -> iterate pipeline based on real-data
3. Outline proposed solution (mockup of what visualization would look like). Explain that being able to zoom and scroll are essential to ensure we can navigate a big / complex data set. (Filtering will also be important later.)
4. Outline key elements of solution

Problem domain
--------------

We wanted to visualise the different journeys taken by users (more precisely by each session identifying them) before they converted.
A journey is a series of touches by the user on different [touchpoints](https://en.wikipedia.org/wiki/Touchpoint), where the touches are in the order that they occured in.
For example, a journey could be "Ad #1 displayed, Ad #2 displayed, Ad #1 displayed, Ad #1 clicked" where there are 4 touches on 3 touchpoints ("Ad #1 displayed", "Ad #2 displayed" and "Ad #1 clicked").
The idea is that seeing the unique journeys would be helpful to quickly compare between them and their composition of touches.

In order to compare between journeys and see at a glance which ones were successful and which ones had a high traffic, it was necessary to also convey information visually about the conversion rate and the number of users going through each unique journey.

Proposed visualisation solution
-------------------------------

We decided to go with a representation of user journeys as an horizontal line with each of the steps (or touches) in the journey as rectangles, in the order they occured at. Each step is coloured according to the corresponding type of touchpoint.

The position of the journey on the Y axis shows its conversion rate and the amount of people going through the whole journey is encoded in the height of the rectangles making up the journey.

One challenge is that there can be many different journeys (depending on how granular the definition of a touchpoint is). Visualising all the journeys at once resulted in [crowded charts](http://bl.ocks.org/galvanic/raw/2eb5043ea7c2dd845975/ed8490785c70c25d863587d8765fe4885d35a221/). We decided to [build a zoom and scroll feature](http://bl.ocks.org/galvanic/raw/2eb5043ea7c2dd845975/4b1dad1f7192f9c935a4b406dac6e3c762eea14a/) to tease out the journeys from each other (see below for explanation of how it was coded).

Technical details of how visualisation was built
------------------------------------------------

### Why we chose D3.js

We built the visualisation using the JavaScript library [D3.js](http://d3js.org/) to take advantage of its [dynamic properties](http://d3js.org/#properties) and make a visualisation that adapted to the unique dataset it was given.

### How is the visualisation built ?

At the core of D3 are [selections](http://bost.ocks.org/mike/selection/). In simplified terms, selections are a group of elements. So for example, in each journey we have a group of the steps that define that journey. We are drawing the visualisation using [SVG elements](https://github.com/mbostock/d3/wiki/SVG-Shapes) so we represent each journey step as a rectangle `<rect />` element:

```js
var journeySteps = journeys.selectAll('rect') // journeys is a selection of 'g' elements
```
[see in code](https://gist.github.com/galvanic/2eb5043ea7c2dd845975#file-journeyschart-js-L283)

The `journeys` themselves are a selection of SVG [group elements](http://www.w3.org/TR/SVG/struct.html#Groups) `<g></g>` with a class to distinguish them from other group elements. Group elements are useful to group other elements, such as the `journeySteps` described above, and also to apply certain styles and transformations that are then shared by all elements of the group, for example opacity:

```js
var journeys = container.selectAll('g.journey') // container is another svg element containing all the chart elements
```
[see in code](https://gist.github.com/galvanic/2eb5043ea7c2dd845975#file-journeyschart-js-L254)

which is styled:

```css
g.journey {
  opacity: 0.8
}
```
[see in code](https://gist.github.com/galvanic/2eb5043ea7c2dd845975#file-style-css-L12-L14)

The important part is to ['bind' these selections to datasets](http://bost.ocks.org/mike/join/). This is done using the `data()` method on the selection. The argument passed to `data()` is an array so that elements in the data array can correspond to elements in the selection.

Here's a sample of our test dataset to make it easier to follow the code that follows:

```json
{
  "values": [
    {
      "letters": ["A", "B", "A", "B"],
      "conversionRate": 0.054,
      "sessionCount": 100000
    }
  ]
}
```

```js
var journeys = container.selectAll('g.journey')
    .data(dataset.values)
```

How these elements are added to the webpage depends on the [enter](http://bost.ocks.org/mike/circles/#entering) selection, where we explain via code how we want elements that have a corresponding datum but no actual presence in the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) on the webpage to appear. For example:

```js
journeys.enter()
  .append('g')
    .classed('journey', true)
```
[see in code](https://gist.github.com/galvanic/2eb5043ea7c2dd845975#file-journeyschart-js-L262-L264)

The declarative way D3 deals with manipulating elements on the webpage via data bound to those elements is very interesting and powerful; I highly recommend reading [tutorials](https://github.com/mbostock/d3/wiki/Tutorials) to understand more. The [official docs](https://github.com/mbostock/d3/wiki/API-Reference) are also very readable.

### Key functions

When you bind data to elements, you can specify a [key function](http://bost.ocks.org/mike/constancy/), like this:

```js
function keyFunction(d) {
  return d.letters
}

var journeys = container.selectAll('g.journey')
    .data(dataset.values, keyFunction)
```
[see in code](https://gist.github.com/galvanic/2eb5043ea7c2dd845975#file-journeyschart-js-L254-L256)

This makes sure that when the dataset of journeys is updated (in the case of using a different filter to choose which journeys to display for example), journeys that are the same between datasets are considered the same journey. The key function allows us to define what is meant by 'same': two journeys are the same journey if they have the same sequence of letters.

Note: the output of the key function has to be a string, or the `toString` method will be called on it. It therefore wasn't possible to simply use the identity function `function(d) { return d }` because, even though the datum objects are all different, when `toString` is called on an Object it returns `"[object Object]"` so all the journeys would be considered the same.

### How is the zooming and scrolling effect achieved ?

The zooming and scrolling effects are achieved using two different [scales](http://bost.ocks.org/mike/bar/#scaling) for the Y positioning, based on [this example](http://bl.ocks.org/mbostock/1667367). Scales in D3 are functions that take elements from the data 'domain', and turn them into visible pixels in the visible 'range'.

One scale, the `yScaleOnAxis`, determines positioning according to the y axis, which doesn't change. The other scale, `yScaleOnChart`, determines positioning on the chart. There is a `brush`, in D3 terms, that sits on the Y axis and corresponds to a viewport for what we want to see on the chart.

Whenever the brush is changed by clicking and dragging, a 'brush' event is triggered. We add an event listener for this 'brush' event:

```js
var viewport = d3.svg.brush()
  .y(yScaleOnAxis)
  .on('brush', function() {
    yScaleOnChart.domain(viewport.empty() ? yScaleOnAxis.domain() : viewport.extent())
    drawInnerChart({ journeyTransitionDuration: 50 })
  })
```
[see in code](https://gist.github.com/galvanic/2eb5043ea7c2dd845975#file-journeyschart-js-L125-L133)

Each time the viewport is changed by the user, the `yScaleOnChart` scale updates its domain (this is updated in the scope of the [function](https://gist.github.com/galvanic/2eb5043ea7c2dd845975#file-journeyschart-js-L68) applied to the dataset to draw the whole chart). The domain value it is updated to depends on the state of the viewport, using the [ternary operator](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Conditional_Operator): if the viewport is empty, the domain of `yScaleOnChart` is updated to the domain of `yScaleOnAxis`; if it is not it is updated to the return value of `viewport.extent()`.

This is because calling `domain()` without an argument returns its current value without calling it with an argument sets it. The same applies to `extent()`. The extent corresponds to the domain data values the viewport covers. Therefore by changing the `yScaleOnChart` domain to the new `viewport.extent()`, when the chart is re-drawn in the next line of the code, the journeys' vertical position will be re-computed using the new `yScaleOnChart` scaling function:

```js
function drawInnerChart(params) {

  [...]

  journeys
    .transition()
      .duration(barTransitionDuration)
      .attr('transform', function(d) { return 'translate(' + 0 + ',' + yScaleOnChart(d.conversionRate) + ')' })

  [...]

}
```
[see in code](https://gist.github.com/galvanic/2eb5043ea7c2dd845975#file-journeyschart-js-L247-L260)

In summary:

  1. user clicks and drags viewport causing:

    - the 'brush' event to be dispatched
    - `viewport.extent()` to change value

  2. the 'brush' event triggers the following:

    1. the `yScaleOnChart` re-sets its domain to the new viewport extent
    2. the inner chart is redrawn

  3. Inside the `drawInnerChart` function, the `journeys` selection is [updated](http://bl.ocks.org/mbostock/3808218):

    1. For each 'g.journey' element, its vertical position value is recomputed using the `yScaleOnChart` scaling function
    2. The 'g.journey' element is translated (in the mathematical transformation sense of it moving across the webpage) by the newly calculated vertical position

Iterative Methodology
---------------------

D3 is not the only part of the stack needed to make this visualisation: the data needs to be *computed* and *fetched* from somewhere to be fed into D3. After building this simple first version of a visualisation in D3 using data fetched from a JSON file locally, we decided to use Amazon's [DynamoDB](https://aws.amazon.com/documentation/dynamodb/) to store the same data remotely. The next step in our process is to compute this aggregated journey-level data from raw events, in order to fill the DynamoDB table. This will be done with Spark as we have already [researched](http://snowplowanalytics.com/blog/2015/05/21/first-experiments-with-apache-spark/).

Since we are starting 'backwards', each step of the process is facilitated by knowing what the outputed data should 'look like' because we know what input data the next step will require, as we have already built it.

We can then improve this pipeline iteratively: with more examples of what real-world data (as opposed to fake randomly generated data), we can tweak the D3 visualisation, and propagate the change 'backwards' in the pipeline.

