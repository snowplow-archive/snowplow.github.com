---
layout: post
title: Ad impression and click tracking with Snowplow
title-short: Ad impression and click tracking with Snowplow
tags: [ad impression, ad click, click tracking, display ad]
author: Yali
category: Other
---

It is possible to track both ad impression events and ad click events into Snowplow. That means if you're a Snowplow user buying display ads to drive traffic to your website or app, you can track not only what users do once they click through onto your site or app, but what ads they have been exposed and whether or not they clicked any of them. This is paticularly useful for companies building attribution models, for example. 

In this guide, we describe how to implement Snowplow tracking for ad impression and ad click events.

1. [Tracking ad impressions](/blog/2016/03/07/ad-impression-and-click-tracking-with-snowplow/#tracking-ad-impressions)  
  * [Using the Javascript tracker](/blog/2016/03/07/ad-impression-and-click-tracking-with-snowplow/#js-tracker)  
  * [Using the pixel tracker](/blog/2016/03/07/ad-impression-and-click-tracking-with-snowplow/#pixel-tracker)
2. [Tracking ad clicks](/blog/2016/03/07/ad-impression-and-click-tracking-with-snowplow/#tracking-ad-clicks)  
 

<!--more-->

<h2 id="tracking-ad-impressions">1. Tracking ad impressions</h2>

There are two ways to track ad impressions: you can embed the Javascript tracker in your ad tag, and configure it to fire a `trackAdImpression` event (or define your own ad impression event and corresponding schema and use the `trackUnstructEvent`). Alternativey, you can configure a pixel tracker (image tag) to load in the ad tag and record the impression event.

In both cases, assuming you are using either the Clojure Collector or the Scala Stream Collectors, a third party cookie will be set / recorded with each event. (In the `network_userid` field in the `events` table.) This should make it straightforward to identify who the ad was shown to, and join that event with any subsequent events recorded for that user.

<h3 id="js-tracker">1a. Using the Javascript tracker to track ad impressions</h3>

The Javascript tracker has been deliberately built to enable you to load it in an ad tag. Specifically, because the tracker supports namespacing, you can ensure that even if the tracker is loaded multiple times on the same page (because there are multiple ad units), tracking of an impression in one ad unit will not interfere with tracking of an ad impression in another ad unit. This can be achieved as illustrated below:

{% highlight javascript %}
// Randomly generate tracker namespace to prevent clashes
var rnd = Math.random().toString(36).substring(2);

;(function(p,l,o,w,i,n,g){if(!p[i]){p.GlobalSnowplowNamespace=p.GlobalSnowplowNamespace||[];
p.GlobalSnowplowNamespace.push(i);p[i]=function(){(p[i].q=p[i].q||[]).push(arguments)
};p[i].q=p[i].q||[];n=l.createElement(o);g=l.getElementsByTagName(o)[0];n.async=1;
n.src=w;g.parentNode.insertBefore(n,g)}}(window,document,"script","//d1fc8wv8zag5ca.cloudfront.net/2.5.3/sp.js","adTracker"));

window.adTracker('newTracker', rnd, 'd3rkrsqld9gmqf.cloudfront.net', {
    'encodeBase64': false
});

window.adTracker('trackAdImpression:' + rnd, 
    '67965967893',            // impressionId
    'cpa',                    // costModel - 'cpa', 'cpc', or 'cpm'            
    10,                       // cost - requires costModel
    'http://www.example.com', // targetUrl
    '23',                     // bannerId
    '7',                      // zoneId
    '201',                    // advertiserId
    '12'                      // campaignId
);
{% endhighlight %} 

You can view a complete example [on Github][github-ad-impression-tracking-with-js-example].

In general, different ad servers make different data points available in the ad tag. Common data points include:

1. A user (3rd party cookie) ID
2. Other user data (e.g. any segments that the user belongs to)
3. A set of data points describing the ad servered (ad ID, campaign ID, the target URL, advertiser ID etc.)
4. A set of data points describing where the ad is served (publisher ID, banner ID)

It is therefore common to consult your ad server documentation and write your own ad impression schema that accommodates those data points that your ad server makes available to you. We would be thrilled to have users contribute schemas for the major different ad servers to our public [Iglu Central][iglu-central] schema registry.

Using the Javascript tracker is generally the easiest way to go live with ad impression tracking. However, some companies want to avoid loading a 25KB Javascript file with every ad load. For that reason some users opt insteead to track ad impressions using a pixel tracker.


<h3 id="pixel-tracker">1b. Using the pixel tracker to track ad impressions</h3>

Rather than load the entire Javascript in your ad units, you can instead add a GET request for the Snowplow i pixel, and manually compose the request so that it includes all the different data points that are available in the ad server. This means adding an ad tag that looks something like this:

{% highlight html %}
<img src="://collector.snplow.com/i?e=se&p=web&tv=no-js-0.1.0&se_ca=ad&se_ac=impression&se_la={{advertiser_id}}&se_pr={{user_id}}">
{% endhighlight %}

Notes on the above example:

* The URL host is should be the URL for the collector. You should substitude your collector URL for `collector.snplow.com`
* The `/i` fetches a transparent 1x1 pixel from the collector
* The querystring parameters determine what data is sent through to Snowplow, as per the [Snowplow Tracker Protocol][snowplow-tracker-protocol].
* It is a requirement that the following fields are all set:
  * `e`. This gives the event type - in this case we have used a [custom structured event][custom-structured-event], denoted by the `e=se`
  * `p`. This gives the platform. Note that there are only a finite number of allowed values - we recommend setting this to `web` for ad impression tracking
  * `tv`. This gives the tracker version. This can take any value: you may want to use this to version the different pixel tags you integrate in your ad tags
* We've assumed that the ad server will dynamically substitute the correct URL encoded values for `{{advertiser_id}}` and `{{user_id}}`. Please consult your ad server documentation to make sure you use the correct notation so that this substitution works.

The above example uses a [custom structured event][custom-structured-event] to record the ad impression. This has the benefit of simplicity. It is, however, limited - you only have four string fields and one numeric field for all your ad impression data. For that reason you may want to define your own ad impression schema, and base this around the actual data points your ad server makes available to you. That means you'd record the event as a [custom unstructured event][custom-unstructured-event]. Your querystring would need to include a URL encoded self describing JSON for your ad impression event.

#### A tip: using the [Iglu webhook][iglu-webhook] to record ad impressions where you've defined your own ad impression schema

Constructing pixel tags to pass data using unstructured events can be fiddly: that is because you have to compose a self-describing JSON, URL-encode it and then add it to a querystring.

A simple approach can be to use an [Iglu webhook][iglu-webhook]. This enables you to send data points for your own unstructured event as a set of name values pairs on a querystring directly (rather than composing a self-describing JSON). If we take our standard [ad impression schema][ad-impression-schema], for example:

{% highlight json %}
{
	"$schema": "http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#",
	"description": "Schema for an ad impression event",
	"self": {
		"vendor": "com.snowplowanalytics.snowplow",
		"name": "ad_impression",
		"format": "jsonschema",
		"version": "1-0-0"
	},

	"type": "object",
	"properties": {
		"impressionId": {
			"type": "string"
		},
		"zoneId": {
			"type": "string"
		},
		"bannerId": {
			"type": "string"
		},
		"campaignId": {
			"type": "string"
		},
		"advertiserId": {
			"type": "string"
		},
		"targetUrl": {
			"type": "string",
			"minLength": 1
		},
		"costModel": {
			"enum": ["cpa", "cpc", "cpm"]
		},
		"cost": {
			"type": "number",
			"minimum": 0
		}
	},
	"minProperties":1,
	"dependencies": {"cost": ["costModel"]},
	"additionalProperties": false
}
{% endhighlight %}

Your pixel tag would then look something like this:

{% highlight html %}
<img src="://collector.snplow.com/com.snowplowanalytics.iglu/v1?schema=iglu%3Acom.snowplowanalytics.snowplow%2Fad_impression%2Fjsonschema%2F1-0-0&impressionId={{impressionId}}&zoneId={{zoneId}}&bannerId={{bannerId}}&campaignId={{campaignId}}&advertiserId={{advertiserId}}&targetUrl={{targetUrl}}&costModel=cpm&cost=0.0015">
{% endhighlight %}

Notes:

* The url host is the collector host, as before
* The path is `/com.snowplowanalytics.iglu/v1`, to indicate to Snowplow that this should use the Iglu webhook
* The iglu schema then needs to be sent as one of the parameters. This is `iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0` in the above example, but URL encoded
* The different fields in the schema can then be passed in as name/value parameters on teh querystring

<h2 id="tracking-ad-clicks">2. Tracking ad clicks</h2>

Tracking ad clicks is more difficult than tracking link clicks on e.g. your own website for two reasons:

1. You may not be able to load the Javascript tracker (e.g. if you're using the pixel tracker to record ad impression events)
2. Even if you are able to load the Snowplow Javascript, if a user is directed out of your domain, the Javascript might not have a chance to record the event

Snowplow supports ad click tracking using redirects in the collector. Ad click tracking works as follows:

1. You update the `href` element in your ad links to the Snowplow collector. That means that when a user clicks on a link in an ad, they get taken to your Snowplow collector, so that the click event can be recorded
2. You set the URL path to `/r/tp2` to the `href`. This tells the Snowplow collector that it should record a [uri redirect event][uri-redirect], and then redirect a user to a URL specified below (see 3)
3. You add a new parameter `&u={{url}}` to the collector URL in the `href` element, where the `{{url}}` parameter is the URL that the user should be forwarded to after the click is tracked in Snowplow. The collector uses this to correctly redirect the user to the correct target URL, after the click has been tracked
4. OPTIONAL. In addition, you can add other name/value pairs to the URL querystring as per the [Snowplow Tracker Protocol][snowplow-tracker-protocol]. That means you can choose how to describe / schema the click event and what data points you want to record with each click event. (E.g. pass in the different fields available in your ad server.) Note that if you do this the event will be set to the event type indicated by the `e=` parameter on the querystring, and the [uri redidirect][uri-redirect] will be recorded as a context.

The example below is a link that will redirect to our Github repo

{% highlight html %}
Check us out on <a href="http://collector.snplow.com/r/tp2?u=https%3A%2F%2Fgithub.com%2Fsnowplow">Github</a>
https%3A%2F%2Fgithub.com%2Fsnowplow
{% endhighlight %}

For more information see our [guide to click tracking][technical-documentation-click-tracking].

## Interested in an event analytics platform that let's you reliably track and scale ad impression and click tracking?

Then [get in touch][contact] with the Snowplow team!

[github-ad-impression-tracking-with-js-example]: https://github.com/snowplow/snowplow-javascript-tracker/blob/master/examples/ads/async.html
[iglu-central]: https://github.com/snowplow/iglu-central
[snowplow-tracker-protocol]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol
[custom-structured-event]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol#event
[custom-unstructured-event]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol#310-custom-unstructured-event-tracking
[iglu-webhook]: https://github.com/snowplow/snowplow/wiki/Iglu-webhook-adapter
[uri-redirect]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/uri_redirect/jsonschema/1-0-0
[technical-documentation-click-tracking]: https://github.com/snowplow/snowplow/wiki/pixel-tracker?_sp=44dbe9a530cc476d.1457357770840#5-click-tracking
[contact]: /contact/
[ad-impression-schema]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0
