---
layout: post
title: A round up of our trip to the Budapest BI Conference last week, and a thank you to the many people who made the trip so worthwhile
title-short: A round up of our trip to the Budapest BI Conference
tags: [snowplow, analysis, pivot, bi]
author: Yali
category: Meetups
---

Last week, Alex and I had the pleasure to attend the [Budapest BI Forum] [budapest-bi]. I learnt a great deal from the different people I got to meet, and got a chance to give a talk on what Snowplow is, where we're at today and how we plan to develop it going forwards.

![budapest][pic]

To summarize a few of the things we learnt:

<!--more-->

## 1. The Python toolset for data analytics is developing incredibly rapidly

We were fortunate to hear talks from three data scientists who are very active in the Python community: [Almar Klein] [almar-klein] (who is part of the team developing [VisPy] [vispy], an advanced visualization library), Olivier Grisel (who is part of the team developing [scikit-learn] [scikit-learn], a machine learning library) and [Yves J. Hilpisch] [yves] (from [Continuum Analytics] [continuum-analytics], who've produced a raft of Python libraries incl. a just-in-time compiler). All three introduced us to compelling and fast-developing aspects of the Python data analytics ecosystem.

Olivier's presentation can be accessed [here](https://speakerdeck.com/ogrisel/growing-randomized-trees-in-the-cloud-1).

Almar's presentation can be downloaded [here](https://github.com/vispy/assets/raw/master/vispy-biforum-2013.pdf).

Yves's presentation can be browsed as a hosted iPython notebook [here](https://www.wakari.io/sharing/bundle/yves/CAE_Python_Next_Gen_Analytics).

I also hope to add some Python tutorials to the [Snowplow Analytics Cookbook] [cookbook] in the future.

## 2. BI offerings are pushing beyond traditional OLAP into predictive analytics / modelling

I've always used BI tools for slicing / dicing data, and R for modelling and predictive analytics. So it was interesting to learn that many of these tools are now incorporating modelling and predictive analytics capabilities via a GUI, including [RapidMiner] [rapid-miner], [Spotfire] [spotfire] and [Knime] [knime] amongst others.

## 3. Media Companies boast some of the most sophisticated big data analytics platforms

We know that in the UK, media companies including the Guardian and Channel 4 have implemented internally some super-sophisticated data pipelines and analytics engines. It was great to learn (though not surprising) that European media companies have also implemented equally sophisticated analytics infrastructure. In particular, we thoroughly enjoyed hearing about the Hadoop, R and Jython stack built at [Sanoma Media] [sanoma] from [Sander Kieft] [skieft] and [Jelmer Voogel] [jvoogel].

Again, I hope to post a link to their slides shortly.

## 4. The Budapest tech scene is buzzing

Budapest is home to some very exciting, and rapidly growing tech companies. It was great to meet [Balazs Szakacs] [bzarkacs] from [Ustream] [ustream], who presented on teh development to date of teh analytics stack at UStream, as well as [Zoltan Csaba Toth] [zoltan] from [Prezi] [prezi] and of course Snowplow community member [Gabor Ratky] [rgabo] from [Secret Sauce Partners] [ssp].

Again, I hope to post a link to Balazs's slides in due course.

## Thank you

Big thanks to the many people who made the conference possible and enjoyable, especially [Bence Arato] [bence], who organised it and invited us to speak. We look forward to returning next year!

[budapest-bi]: http://budapestbiforum.com/
[vispy]: http://vispy.org/
[almar-klein]: https://twitter.com/almarklein
[scikit-learn]: http://scikit-learn.org/stable/
[olivier-grisel]: https://twitter.com/ogrisel
[continuum-analytics]: http://www.continuum.io/
[yves]: https://twitter.com/dyjh
[cookbook]: http://snowplowanalytics.com/analytics/index.html
[rapid-miner]: http://rapidminer.com/
[spotfire]: http://spotfire.tibco.com/
[knime]: http://www.knime.org/
[sanoma]: http://www.sanoma.com/
[skieft]: https://twitter.com/skieft
[jvoogel]: https://twitter.com/Voogeltje
[bzarkacs]: http://budapestbiforum.com/program/innovative-bi-day/balazs-szakacs-the-bi-journey-of-ustream/
[ustream]: http://www.ustream.tv/
[zoltan]: hu.linkedin.com/in/zoltanctoth/
[prezi]: http://prezi.com/
[rgabo]: https://twitter.com/rgabo
[ssp]: http://secretsaucepartners.com/
[bence]: https://twitter.com/BenceArato
[pic]: /assets/img/blog/2013/11/budapest.jpg
