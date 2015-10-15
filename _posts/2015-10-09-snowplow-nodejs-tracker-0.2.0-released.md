---
layout: post
title: Snowplow Node.js Tracker 0.2.0 released
title-short: Snowplow Node.js Tracker 0.2.0
tags: [snowplow, analytics, node, npm, tracker]
author: Fred
category: Releases
---

Version 0.2.0 of the [Snowplow Node.js Tracker][repo] is now available! This release changes the Tracker's architecture and adds the ability to send Snowplow events via either `GET` or `POST`.

Read on for more information...

1. [Emitters](/blog/2015/10/09/snowplow-node.js-tracker-0.2.0-released/#emitters)
2. [Vagrant quickstart](/blog/2015/10/09/snowplow-node.js-tracker-0.2.0-released/#vagrant)
3. [Getting help](/blog/2015/10/09/snowplow-node.js-tracker-0.2.0-released/#help)

<!--more-->

<h2 id="emitters">1. Emitters</h2>

This release brings the Node.js Tracker's API closer to those of other trackers with the addition of Emitters, objects which control how and when the events created by the Tracker are sent to the Snowplow collector. A Tracker object can be configured with one or more Emitters, and sends each event to all Emitters associated with it. This enables you to send events to multiple endpoints, like this:

{% highlight javascript %}
var snowplow = require('snowplow-tracker');
var tracker = snowplow.tracker;
var emitter = snowplow.emitter;

var cloudfrontEmitter = emitter(
	'drw9087ef0wer.cloudfront.net', // Cloudfront collector
	'http', // Protocol
	null, // No port required for the Cloudfront collectr
	'GET' // Method
);

var kinesisEmitter = emitter(
	'myscalastreamcollector.net', // Cloudfront collector
	'http', // Optionally specify the method - defaults to http
	8080, // Optionally specify a port
	'POST', // Method - defaults to GET
	10, // Only send events once 10 are buffered
	function (error, body, response) { // Callback
		if (error) {
			console.log("Request to Scala Stream Collector failed!");
		}
	}
);

var dualTracker = tracker([cloudfrontEmitter, kinesisEmitter], 'exampleTracker', 'myApp');

dualTracker.trackPageView('http://www.example.com');
kinesisEmitter.flush();
{% endhighlight %}

This example creates 2 emitters. The first sends events one at a time to a Cloudfront Collector using GET; the second batches up events until it has 10, then sends them to a Scala Stream Collector using POST. We only fire a single event in the example, so to make the second emitter send its batch it is necessary to explicitly call the `flush` method.

Note also that the callback argument to the `tracker` function is now an argument to the `emitter` function instead.

<h2 id="vagrant">2. Vagrant quickstart</h2>

We have added a Vagrant quickstart to the project. If you have [VirtualBox][vbox] and [Vagrant][vagrant] installed, you can now easily set up a Snowplow Node.js Tracker development environment:

{% highlight bash %}
git clone git@github.com:snowplow/snowplow-nodejs-tracker.git
cd snowplow-nodejs-tracker
vagrant up
vagrant ssh
cd /vagrant
npm install
npm test
{% endhighlight %}

<h2 id="help">3. Getting help</h2>

For more detailed information, check out the [technical documentation][tech-docs].

If you find any bugs with the Node.js Tracker, please create a [GitHub issue][issues].

Finally, if you need help getting set up or want a new feature, please [get in touch] [talk-to-us].

[repo]: https://github.com/snowplow/snowplow-nodejs-tracker
[issues]: https://github.com/snowplow/snowplow-nodejs-tracker/issues
[tech-docs]: https://github.com/snowplow/snowplow/wiki/Node.js-tracker
[vagrant]: https://www.vagrantup.com/
[vbox]: https://www.virtualbox.org/
