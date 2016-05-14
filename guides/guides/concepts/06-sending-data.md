---
layout: page
group: guides
subgroup: concepts
rank: 6
title: Sending data into Snowplow
description: Understanding how to send data into Snowplow.
permalink: /guides/concepts/sending-data-into-snowplow/
redirect_from:
  - /analytics/concepts/sending-data-into-snowplow/
  - /analytics/event-dictionaries-and-data-models/sending-data-into-snowplow.html
  - /documentation/concepts/sending-data-into-snowplow/
---

# Sending data into Snowplow

![front-part-of-data-pipeline](/assets/img/architecture/snowplow-architecture-1-trackers-and-webhooks.png)

Data is sent into Snowplow by trackers and webhooks.

1. [Trackers](#trackers)
2. [Webhooks](#webhooks)

<h2><a name="trackers">1. Trackers</a></h2>

![snowplow-trackers](/assets/img/architecture/snowplow-architecture-1a-trackers.png)

Snowplow is built so that you can send in event level data from *any* type of digital application, service or device. There is a [wide range of Snowplow trackers](https://github.com/snowplow?query=tracker) built to enable you to easily collect event-level data from lots of different places.

When you instrument a Snowplow tracker you need to set it up in such a way that it responds to the events you need to track by:

1. _Seeing_ those events
2. Assembling a packet of data points that fully describe those events
3. Sending the packet of data representing that event to the Snowplow collector for processing

This process looks a bit different depending on the tracker you're implementing. However, the underlying process is the same in all cases - the main thing to consider is - is the event you're tracking one that you have defined, or that has been defined already in Snowplow?

### Tracking events that have already been defined in Snowplow

#### Events that are supported by Snowplow out-of-the-box

Snowplow supports a large and growing number of events 'out of the box', most of which are fairly standard in a web analytics context. Examples of events that we support include:

* Page views
* Page pings
* Link clicks
* Form fill-ins (for the web)
* Form submissions
* Transactions

For events that Snowplow natively supports, there is generally a specific API for tracking that event type in Snowplow. For example, if you want to track a page view using the Javascript tracker, you do so with the following Javascript:

{% highlight javascript %}
window.snowplow('trackPageView');
{% endhighlight %}

Whereas if you were tracking a pageview in an iOS app using the objective-c tracker, you'd do so like this:

{% highlight objective-c %}
[t1 trackPageView:@"www.example.com" title:@"example" referrer:@"www.referrer.com"];
{% endhighlight %}

In general, each tracker will have a specific API call for tracking any events that have been defined by the Snowplow team, and you should refer to the tracker-specific documentation to make sure that this is set up correctly.

#### Contexts that are supported by Snowplow out-of-the-box

Wherever possible, we try and build the trackers to automatically capture as much contextual data for each event as possible. For example, with the Javascript tracker, we automatically capture the following data fields with every request unless they are disabled:

<table class="table table-striped">
    <thead>
        <tr>
            <th>Field</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
    	<tr>
    		<td><code>dvce_tstamp</code></td>
    		<td>The timestamp on the device that the event was recorded on</td>

    	</tr>
    	<tr>
    		<td><code>os_timezone</code></td>
    		<td>The timezone the client operating system is set to</td>
    	</tr>
    	<tr>
    		<td><code>event_id</code></td>
    		<td>A unique identifier for the event</td>
    	</tr>
    	<tr>
    		<td><CODE>domain_userid</CODE></td>
    		<td>First party cookie ID</td>
    	</tr>
    	<tr>
    		<td><code>domain_sessionidx</code></td>
    		<td>Session index based on first party cookie ID</td>
    	</tr>
    	<tr>
    		<td><code>dvce_screenheight</code></td>
    		<td>Screen width in pixels</td>
    	</tr>
    	<tr>
    		<td><code>br_viewwidth</code></td>
    		<td>Browser view width in pixels</td>
    	</tr>
    	<tr>
    		<td><code>br_viewheight</code></td>
    		<td>Browser view height in pixels</td>
    	</tr>
    	<tr>
    		<td><code>page_url</code></td>
    		<td>URL of the page on which the event occurred</td>
    	</tr>
    	<tr>
    		<td><code>page_referrer</code></td>
    		<td>URL of the referrer</td>
    	</tr>
    	<tr>
    		<td><code>user_fingerprint</code></td>
    		<td>Browser fingerprint</td>
    	</tr>
    	<tr>
    		<td><code>br_lang</code></td>
    		<td>Language the browser is set to</td>
    	</tr>
    	<tr>
    		<td><code>br_features_</code>...</td>
    		<td>A list of boolean flags to indicate if common plugins are installed e.g. PDF, Quicktime, RealPlayer, Flash, Java...</td>
    	</tr>
    	<tr>
    		<td><code>br_colordepth</code></td>
    		<td>Browser color depth</td>
    	</tr>
    	<tr>
    		<td><code>doc_width</code></td>
    		<td>Width of webpage in pixels</td>
    	</tr>
    	<tr>
    		<td><code>doc_height</code></td>
    		<td>Height of webpage in pixels</td>
    	</tr>
    	<tr>
    		<td><code>doc_charset</code></td>
    		<td>Document encoding</td>
    	</tr>
    	<tr>
    		<td><code>platform</code></td>
    		<td>The platform that the event was recorded on, in this case 'web'</td>
    	</tr>
    	<tr>
    		<td><code>name_tracker</code></td>
    		<td>The tracker name</td>
    	</tr>
    	<tr>
    		<td><code>v_tracker</code></td>
    		<td>The tracker version</td>
    	</tr>
    </tbody>
</table>

In addition to the above fields, there are a number of additional optional contexts that you can capture automatically using the Snowplow Javascript tracker, including:

* [Performance timing](https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#predefined-contexts). This provides data on web page load times.
* [Universal Analytics cookie data](https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#22132-gacookies-context). This provides data read from the Google Analytics cookie, for users running Snowplow alongside Unviversal Analytics
* [Geolocation context](https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#22133-geolocation-context). This will provide data on where a user is, if that user has consented to give that information.

The mobile (iOS and Android trackers) also automatically capture a large number of data points with every event, where available:


<table class="table table-striped">
    <thead>
        <tr>
            <th>Field</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
    	<tr>
    		<td><code>os_type</code></td>
    		<td>Operating system type</td>
    	</tr>
    	<tr>
    		<td><code>os_version</code></td>
    		<td>Operating system version</td>
    	</tr>
    	<tr>
    		<td><code>device_manufacturer</code></td>
    		<td>The device manufacturer</td>
    	</tr>
    	<tr>
    		<td><code>device_model</code></td>
    		<td>The device model</td>
    	</tr>
    	<tr>
    		<td><code>carrier</code></td>
    		<td>The mobile carrier</td>
    	</tr>
    	<tr>
    		<td><code>apple_idfa</code></td>
    		<td>Apple's IDFA (ID for advertisers)</td>
    	</tr>
    	<tr>
    		<td><code>open_idfa</code></td>
    		<td>The open [IDFA](https://github.com/ylechelle/OpenIDFA)</td>
    	</tr>
    	<tr>
    		<td><code>android_idfa</code></td>
    		<td>The Android IDFA</td>
    	</tr>
    	<tr>
    		<td><code>latitude</code></td>
    		<td>Device location latitude</td>
    	</tr>
    	<tr>
    		<td><code>longitude</code></td>
    		<td>Device location longitude</td>
    	</tr>
    	<tr>
    		<td><code>latitude_longitude_location_accuracy</code></td>
    		<td>The accuracy of the lat/long measures above</td>
    	</tr>
    	<tr>
    		<td><code>altitude</code></td>
    		<td>Device location altitude</td>
    	</tr>
    	<tr>
    		<td><code>altitude_accuracy</code></td>
    		<td>The accuracy fo the above altitude measure</td>
    	</tr>
    	<tr>
    		<td><code>bearing</code></td>
    		<td>Direction of device travel</td>
    	</tr>
    	<tr>
    		<td><code>speed</code></td>
    		<td>Speed with which the device is travelling</td>
    	</tr>
    </tbody>
</table>


### Tracking events that you've defined yourself

Tracking events where you have defined the schema yourself is straightforward. Before you instrument your tracker, you need to:

1. Make sure you have your Iglu schema repo setup
2. Create a schema for your event type in the repo
3. Have the associated reference to the schema in Iglu. So for example, if your company website URL is `mycompany.com`, and you've defined your own `outbound-call-made` event schema, and it is the first version of that schema, then the reference to the schema is `iglu:com.mycompany/outbound-call-made/jsonschema/1-0-0`

Once that is done you simply need to configure your tracker to record the event using the `track unstructured event` method. So if we were tracking the event using the Python tracker, our code snippet for doing so might look like this:

{% highlight python %}
tracker.track_unstruct_event({
    "schema": "com.mycompany/outbound-call-made/1-0-0",
    "data": {
        "connected_tstamp": "2015-03-21 17:23:10",
        "disconnected_tstamp": "2015-03-21 17:48:21",
        "reason_for_call": "Response to interest submitted via webform",
        "success": true,
        "order_id": "ab-1903-23904",
        "order_value": "129.44"
    }
})
{% endhighlight %}

We call the _track unstructured event_ method and pass in a JSON with two fields, a schema field, which tells Snowplow where the schema for this event can be located in Iglu, and a data field, that includes that actual data that needs to be captured. We call this a [self-describing JSON](http://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/), because assuming we have access to Iglu, the JSON contains all the information we need to process it, in the form of the schema.

Each of the Snowplow trackers includes a _track unstructured event_ method and it is not uncommon to have Snowplow implementation where nearly all if not all the events tracked have been defined by the company in question, and so are all tracked using this method.

### Tracking contexts that you've defined yourself

Whenever you track any event in Snowplow, using any tracker, you can pass into Snowplow as many contexts as you want. This gives you the flexibility to pass potentially enormous amounts of data with each event that you capture.

Across all our trackers, the approach is the same. Each context is a [self-describing JSON](http://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/). We create an array of all the different contexts that we wish to pass into Snowplow, and then we pass those contexts in generally as the final argument on any _track_ method that we call to capture the event. (E.g. _track pageview_, _track structured event_, _track unstructured event_ etc.) So for example, we can extend the example above to pass in a user and product context:

{% highlight python %}
tracker.track_unstruct_event({
    "schema": "com.mycompany/outbound-call-made/1-0-0",
    "data": {
        "connected_tstamp": "2015-03-21 17:23:10",
        "disconnected_tstamp": "2015-03-21 17:48:21",
        "reason_for_call": "Response to interest submitted via webform",
        "success": true,
        "order_id": "ab-1903-23904",
        "order_value": "129.44"
    }
}, context=[{
    "schema": "com.mycompany/customer/1-0-0",
    "data": {
        "name": "Joe Bloggs",
        "address_street": "123 ABC Road",
        "address_town": "my town",
        "address_state": "my state",
        "address_country": "United States of America"
    }
},{
    "schema": "com.mycompany/product/1-0-0",
    "data": {
        "sku": "1908asdf",
        "name": "product name",
        "list_price": "149.99",
        "discounted_price": "129.44",
        "promotion": "end of season",
        "color": "red"
    }
}])
{% endhighlight %}

<h2><a name="webhooks">2. Webhooks</a></h2>

![snowplow-trackers](/assets/img/architecture/snowplow-architecture-1b-webhooks.png)

A number of third party systems offer webhooks: the ability to stream event data to an end point of your choosing, as those events occur in the third party system. At Snowplow, we're working to integrate as many different third party webhooks as possible, so that if you use those services, you can configure them to push event-level data directly into Snowplow.

Configuring a third party service to stream event-level data into Snowplow is straightforward - it is generally something you do once, via the application UI. For details on the different webhooks that Snowplow supports and instructions on integrating them, see the [setup guide](https://github.com/snowplow/snowplow/wiki/Setting-up-a-webhook).
