---
layout: post
title: Building robust data pipelines in Scala - Session at Scala eXchange, December 2014
tags: [snowplow, scala, scala exchange, scalaz, validation, error handling]
author: Alex
category: Meetups
---

It was great to have the opportunity to speak at [Scala eXchange] [scala-exchange] last week in London on the topic of "Building robust data pipelines in Scala: the Snowplow experience".

It was my first time speaking at a conference dedicated to Scala - and it was fantastic to see such widespread adoption of Scala in the UK and Europe. It was also great meeting up with Snowplow users and contributors face-to-face for the first time!

Many thanks to the team at [Skills Matter] [skills-matter] for organizing such a great conference.

Below the fold I will briefly cover:

1. [Building robust data pipelines in Scala](/blog/2014/12/17/scala-exchange-building-robust-data-pipelines-in-scala/#my-talk)
2. [My highlights from Scala eXchange](/blog/2014/12/17/scala-exchange-building-robust-data-pipelines-in-scala/#highlights)

<!--more-->

<h2><a name="my-talk">Building robust data pipelines in Scala</a></h2>

This session was an opportunity for me to "step back" a little and think about how and why we use Scala to enforce robust event processing at Snowplow. We have always been strong proponents of what we have called ["high-fidelity analytics"] [hi-fi-analytics] - in this talk I explored how we use Scalding, the Scalaz toolkit and some simple design patterns to deliver this robustness:

<iframe src="//www.slideshare.net/slideshow/embed_code/42792956" width="425" height="355" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/alexanderdean/building-robust-data-pipelines-in-scala" title="Scala eXchange: Building robust data pipelines in Scala" target="_blank">Scala eXchange: Building robust data pipelines in Scala</a> </strong> from <strong><a href="//www.slideshare.net/alexanderdean" target="_blank">Alexander Dean</a></strong> </div>

It was a very experienced and technical audience, who asked some great questions. The pattern I presented which seemed to resonate most was "railway-oriented programming", a term coined in the [Railway oriented programming blog post] [railway-oriented] by functional programmer Scott Wlaschin.

At Snowplow we came to Scott's "railway-oriented" approach independently via [Scalaz's Validation type] [scalaz-validation], which today underpins all of our event validation and processing. Scala and big data guru [Dean Wampler] [dean-wampler] was in the audience and summed up the railway approach in a single tweet:

<blockquote class="twitter-tweet" lang="en"><p>&quot;Railway-oriented programming&quot;: Data stream happy and a failure paths. Track from happy to failure, but not the reverse <a href="https://twitter.com/alexcrdean">@alexcrdean</a> <a href="https://twitter.com/hashtag/ScalaX?src=hash">#ScalaX</a></p>&mdash; Dean Wampler (@deanwampler) <a href="https://twitter.com/deanwampler/status/541901027214393344">December 8, 2014</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

I really enjoyed giving the talk - it was a great opportunity to shine a techincal light on the foundational work we do at Snowplow on event quality and pipeline robustness. You can see a video version of the session online on the [Skills Matter website] [skillscast]. Expect a chapter on "railyway-oriented programming" in [Unified Log Processing] [ulp] in due course!

<h2><a name="highlights">My highlights from Scala eXchange</a></h2>

The Skills Matter team succeeded in packing a huge number of great sessions into Scala eXchange's two days. Here were some of my highlights:

* **Martin Odersky**, the creator of Scala, providing a much-needed introduction to the binary compatibility challenges faced by Scala, how these are typically handled (or avoided) in other proglangs, and a suggested solution for Scala, called [typed trees] [typed-trees]. A great talk on an important and poorly-understood topic
* **Noel Markham**, a Scala developer at ITV, gave a great introductory talk to Scalaz, the functional programming toolkit for Scala which we use heavily at Snowplow
* **Brendan McAdams**, at Netflix, gave a valuable talk on using Scala at scale at Netflix, including some great insights on their AMI-based packaging and deployment strategies
* **Andreas Gies**, [atooni] [atooni] on GitHub, gave a deep technical talk on building a multi-container integration test suite using Akka, Docker and ScalaTest. Very clever stuff and available on GitHub as part of the [blended project] [blended]
* **Pere Villega**, a Scala developer at Gumtree, shared his experiences building a micro-services architecture around Apache Kafka. Our work at Snowplow with Kafka centers around its role as a unified log - so it was interesting to get the micro-services perspective on this same technology

Of course these were just my highlights - the two days were packed with great content and interactions across the four tracks. In particular, I was sorry to miss Dean Wampler's second day keynote on why Scala is dominating the big data landscape - something we definitely concur with at Snowplow.

Many thanks to Skills Matter and all the organizers for an excellent conference!

[scala-exchange]: https://skillsmatter.com/conferences/1948-scala-exchange-2014
[skills-matter]: https://skillsmatter.com/
[skillscast]: https://skillsmatter.com/skillscasts/6001-building-robust-data-pipelines-in-scala

[typed-trees]: https://groups.google.com/forum/#!topic/scala-internals/hshvEUF3JUk
[hi-fi-analytics]: /blog/2013/04/10/snowplow-event-validation
[railway-oriented]: http://fsharpforfunandprofit.com/posts/recipe-part2/
[scalaz-validation]: http://eed3si9n.com/learning-scalaz/Validation.html

[dean-wampler]: http://deanwampler.com/
[atooni]: https://github.com/atooni
[ulp]: http://www.manning.com/dean/
[blended]: https://github.com/woq-blended/blended
