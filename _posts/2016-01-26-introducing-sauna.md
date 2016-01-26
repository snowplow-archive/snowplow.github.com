---
layout: post
title: Sauna - an open source library that helps to feed data in third-party applications
title-short: Introducing Sauna
tags: [snowplow, data, feeder, sendgrid, optimizely, urban-airship, salesforce]
author: Oleks
category: Releases
---

Sauna is a new open-source Scala library for data aggregation, filtering and processing.

1. [What Sauna does, example](#what_sauna_does)
2. [Main concepts](#main_concepts)
3. [How to use it](#how_to_use)
4. [Future plans](#future_plans)


<div class="html">
<h2 id="what_sauna_does">What Sauna does, example</h2>
</div>

If your application integrated with some external API, and you want to feed that API from different data sources, then Sauna might me useful for you.
Use case example: parse stream of Optimizely's targeting lists from AWS S3 bucket, filter invalid stuff, upload it to your Optimizely account and log all actions.

<div class="html">
<h2 id="#main_concepts">Main concepts</h2>
</div>

In the example above:
1. There is an AWS S3 **observers**, that awaits for new files, triggers **processors** and cleans up S3 bucket.
2. There is an Optimizely TargetingLists **processor**, that checks if file is valid, upload it to Optimizely **API**.
3. There is an Optimizely **API**, that incapsulates all actions with Optimizely.

At the moment (0.0.1 version) there are two observers (local and S3) and three processors, two for Optimizely and one for Sendgrid.

<div class="html">
<h2 id="#how_to_use">How to use it</h2>
</div>

You should clone Sauna, insert your credentials in configuration file and run it:

	git clone https://github.com/snowplow/sauna.git
	vim my_credentials.conf
	sbt 'run my_application.conf'

Then, you can trigger one of observers (by creating new file with data in correct format), and appropriate processor will start to work.

<div class="html">
<h2 id="#future_plans">Future plans</h2>
</div>

Plans for 0.0.2 and further:
1. More processors and APIs (SalesForce, Urban Airship, ...)
2. Since Sauna is based on akka, make it distributed over several machines, so each analyst could have own Sauna instance, and devops could configure all nodes from single place.
3. Integration with other Snowplow services.
