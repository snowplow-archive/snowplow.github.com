---
layout: post
title: "Unified Log London 3 with Apache Kafka and Samza at State"
tags: [unified log, meetup, kafka, samza, state]
author: Alex
category: Meetups
---

Last week we held the [third Unified Log London meetup] [meetup-3] here in London. Huge thanks to [Just Eat] [just-eat] for hosting us in their offices and keeping us all fed with pizza and beer!

![unified-log-london-meetup] [pic]

More on the event after the jump:

<!--more-->

There were two talks at the meetup:

* I gave a recap on the Unified Log "manifesto" for new ULPers, with my regular presentation on "Why your company needs a Unified Log"
* [Mischa Tuffield] [mischa], CTO at [State] [state], gave an excellent talk on implementing a Unified Log at State to meet various operational and analytical data requirements, all using Apache Kafka and Samza

The meetup had a great mix of Unified Log practitioners and people just starting to explore the concept. It was particularly encouraging to see such an interactive, "salon" style atmosphere to the discussion, continuing late into the evening!

<div class="html">
<h2>1. Why your company needs a Unified Log</h2>
</div>

In this talk, I summarized the emergence of the Unified Log concept, talking through the "three eras" of data processing and explaining why it makes sense to restructure your company around a Unified Log. Regular readers of this blog may well have seen a version of this presentation already, included here for completeness:

<iframe src="//www.slideshare.net/slideshow/embed_code/key/yKKZJfOZI9QQWn" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/alexanderdean/unified-log-london-may-2015-why-your-company-needs-a-unified-log" title="Unified Log London (May 2015) - Why your company needs a unified log" target="_blank">Unified Log London (May 2015) - Why your company needs a unified log</a> </strong> from <strong><a href="//www.slideshare.net/alexanderdean" target="_blank">Alexander Dean</a></strong> </div>

<div class="html">
<h2>2. Unified Log at State</h2>
</div>

We were lucky enough to have Mischa Tuffield and [Dan Harvey] [dan], Data Architect at State, talk us through their implementation of the Unified Log concept at State. Learning about the real-world experience of implementing ULP is a key part of Unified Log London, so it was great to hear Mischa and Dan's story. Mischa's slides are here:

<script async class="speakerdeck-embed" data-id="07b5d0f9872c48f48167cd371bbf15ef" data-ratio="1" src="//speakerdeck.com/assets/embed.js"></script>

Key building blocks of State's Unified Log implementation are:

* [Apache Kafka] [kafka] to act as the distributed commit log
* A custom "tailer" app to mirror their [MongoDB oplog] [oplog] to Kafka as entity snapshots
* [Apache Samza] [samza] for stream-stream joins and other use cases
* The [Confluent Schema Registry] [confluent-sr] (which shares some similarities to our own [Iglu] [iglu]) for storing Avro schemas

Given our focus at Snowplow on the various analytical uses of the Unified Log, it was really helpful for me to get Mischa and Dan's more operational/transactional-focused perspective on the Unified Log.

<div class="html">
<h2>3. Big themes</h2>
</div>

There were some really interesting themes that emerged during the talks and the subsequent discussion. To highlight just three:

* **Stream design** - specifically, whether to create individual streams (topics in Kafka parlance) for each entity, or whether to have every-entity streams which are tied only to the processing stage. State follow the first approach, Snowplow the second
* **Eventsourcing versus entity snapshotting** - this really warrants a full blog post, but there was some healthy debate about whether an individual event should capture complete entity snapshots or just deltas (i.e. just the properties that have changed). There was a general feeling (which we share at Snowplow) that entity snapshots are much safer in the face of potentially lossy systems
* **The importance of a schema registry** - in the Unified Log model, your events' schemas form the sole contract between your various stream processing applications, and so having a single source of truth for these schemas - a registry/repository - becomes essential

<div class="html">
<h2>4. Thanks and next event</h2>
</div>

It was a great meetup - in particular it's exciting to see the Unified Log patterns becoming such a hot discussion topic. A big thank you to Raj Singh, Peter Mounce and the Just Eat Engineering team for being such excellent hosts, and a warm thanks to Mischa and Dan for giving us the inside track on Unified Log at State!

Do please [join the group] [meetup-group] to be kept up-to-date with upcoming meetups, and if you would like to give a talk, please email us on [unified-meetup@snowplowanalytics.com] [email].

[meetup-1]: /blog/2014/01/30/inaugural-amazon-kinesis-meetup
[meetup-3]: http://www.meetup.com/unified-log-london/events/221956360/
[just-eat]: http://www.just-eat.co.uk/

[meetup-group]: http://www.meetup.com/kinesis-london/

[pic]: /assets/img/blog/2015/05/mischa-state-unified-log.jpg

[mischa]: https://twitter.com/mischat
[dan]: https://www.linkedin.com/profile/view?id=33804657
[state]: https://state.com/

[kafka]: http://kafka.apache.org/
[samza]: http://samza.apache.org/
[oplog]: http://docs.mongodb.org/manual/core/replica-set-oplog/
[confluent-sr]: http://confluent.io/docs/current/schema-registry/docs/intro.html
[iglu]: http://collector.snplow.com/r/tp2?u=https%3A%2F%2Fgithub.com%2Fsnowplow%2Figlu

[email]: mailto:unified-ug@snowplowanalytics.com
