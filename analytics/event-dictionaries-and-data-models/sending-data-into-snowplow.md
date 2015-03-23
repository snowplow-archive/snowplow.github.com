---
layout: page
group: analytics
sub_group: foundation
title: Sending data into Snowplow
shortened-link: Sending data into Snowplow
description: Find out how to send data into Snowplow
weight: 7
---

# Sending data into Snowplow

![front-part-of-data-pipeline](/assets/img/architecture/snowplow-architecture-1-trackers-and-webhooks.png)

Data is sent into Snowplow by trackers and webhooks.

1. [Trackers](#trackers)
2. [Webhooks](#webhooks)

<h2><a href="#trackers">1. Trackers</a></h2>

Snowplow is built so that you can send in event level data from *any* type of digital application, service or device. There is a [wide range of Snowplow trackers](https://github.com/snowplow?query=tracker) built to enable you to easily collect event-level data from lots of different places.

When you instrument a Snowplow tracker you need to set it up in such a way that it responds to the events you need to track by:

1. _Seeing_ those events
2. Fetching the relevant data necessary to fully describe those events
3. Sending the packet of data representing that event to the Snowplow collector for processing

This process looks a bit different depending on the tracker you're implementing. However, the underlying process is the same in all cases - the main thing to consider is - is the event you're tracking one that you have defined, or that has been defined already in Snowplow?

### Tracking events that have already been defined in Snowplow

#### Events that are supported by Snowplow out-of-the-box

Snowplow supports a large and growing number of events 'out of the box'. Examples of events that we support include:

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

Wherever possible, we try and build the trackers so that capturing these out-of-the-box event types is as simple as possible, and as much contextual data is automatically captured as possible. For example, with the Javascript tracker, we automatically capture the following data fields with every request unless they are disabled:

<table class="table table-striped">
    <thead>
        <tr>
            <th>Field</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
    	<tr>
    		<td>dvce_tstamp than 10 million</td>
    		<td>The timestamp on the device that the event was recorded on</td>
    		
    	</tr>
    	<tr>
    		<td>os_timezone</td>
    		<td>The timezone the client operating system is set to</td>
    	</tr>
    	<tr>
    		<td>event_id</td>
    		<td>A unique identifier for the event</td>
    	</tr>
    	<tr>
    		<td>domain_userid</td>
    		<td>First party cookie ID</td>
    	</tr>
    	<tr>
    		<td>domain_sessionidx</td>
    		<td>Session index based on first party cookie ID</td>
    	</tr>
    	<tr>
    		<td>dvce_screenheight</td>
    		<td>Screen width in pixels</td>
    	</tr>
    	<tr>
    		<td>br_viewwidth</td>
    		<td>Browser view width in pixels</td>
    	</tr>
    	<tr>
    		<td>br_viewheight</td>
    		<td>Browser view height in pixels</td>
    	</tr>
    	<tr>
    		<td>page_url</td>
    		<td>URL of the page on which the event occurred</td>
    	</tr>
    	<tr>
    		<td>page_referrer</td>
    		<td>URL of the referrer</td>
    	</tr>
    	<tr>
    		<td>user_fingerprint</td>
    		<td>Browser fingerprint</td>
    	</tr>
    	<tr>
    		<td>br_lang</td>
    		<td>Language the browser is set to</td>
    	</tr>
    	<tr>
    		<td>br_features_...</td>
    		<td>A list of boolean flags to indicate if common plugins are installed e.g. PDF, Quicktime, RealPlayer, Flash, Java...</td>
    	</tr>
    	<tr>
    		<td>br_colordepth</td>
    		<td>Browser color depth</td>
    	</tr>
    	<tr>
    		<td>doc_width</td>
    		<td>Width of webpage in pixels</td>
    	</tr>
    	<tr>
    		<td>doc_height</td>
    		<td>Height of webpage in pixels</td>
    	</tr>
    	<tr>
    		<td>doc_charset</td>
    		<td>Document encoding</td>
    	</tr>
    	<tr>
    		<td>platform</td>
    		<td>The platform that the event was recorded on, in this case 'web'</td>
    	</tr>
    	<tr>
    		<td>name_tracker</td>
    		<td>The tracker name</td>
    	</tr>
    	<tr>
    		<td>v_tracker</td>
    		<td>The tracker version</td>
    	</tr>
    </tbody>
</table>



In addition to the above fields, there are a number of additional optional contexts that you can capture automatically using the Snowplow Javascript tracker, including:

* [Performance timing](https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#predefined-contexts). This provides data on web page load times.
* [Universal Analytics cookie data](https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#22132-gacookies-context). This provides data read from the Google Analytics cookie, for users running Snowplow alongside Unviversal Analytics
* [Geolocation context](https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#22133-geolocation-context). This will provide data on where a user is, if that user has consented to give that information.

We are able to provide a lot more automated tracking from the Javascript tracker than our other trackers for two reasons:

1. The Javascript tracker was our first tracker, and so is the most mature
2. The nature of client-side tracking via JS means there are many more standard data points that can be fetched than, for example, a server-side tracker

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
    		<td>os_type</td>
    		<td>Operating system type </td>
    	</tr>
    	<tr>
    		<td>os_version</td>
    		<td>Operating system version</td>
    	</tr>
    	<tr>
    		<td>device_manufacturer</td>
    		<td>The device manufacturer</td>
    	</tr>
    	<tr>
    		<td>device_model</td>
    		<td>The device model</td>
    	</tr>
    	<tr>
    		<td>carrier</td>
    		<td>The mobile carrier</td>
    	</tr>
    	<tr>
    		<td>apple_idfa</td>
    		<td>Apple's IDFA (ID for advertisers)</td>
    	</tr>
    	<tr>
    		<td>open_idfa</td>
    		<td>The open [IDFA](https://github.com/ylechelle/OpenIDFA)</td>
    	</tr>
    	<tr>
    		<td>android_idfa</td>
    		<td>The Android IDFA</td>
    	</tr>
    	<tr>
    		<td>latitude</td>
    		<td>Device location latitude</td>
    	</tr>
    	<tr>
    		<td>longitude</td>
    		<td>Device location longitude</td>
    	</tr>
    	<tr>
    		<td>latitude_longitude_location_accuracy</td>
    		<td>The accuracy of the lat/long measures above</td>
    	</tr>
    	<tr>
    		<td>altitude</td>
    		<td>Device location altitude</td>
    	</tr>
    	<tr>
    		<td>altitude_accuracy</td>
    		<td>The accuracy fo the above altitude measure</td>
    	</tr>
    	<tr>
    		<td>bearing</td>
    		<td>Direction of device travel</td>
    	</tr>
    	<tr>
    		<td>speed</td>
    		<td>Speed with which the device is travelling</td>
    	</tr>
    </tbody>
</table>


### Tracking events that you've defined yourself

TO WRITE

### Tracking contexts that you've defined yourself

TO WRITE

<h2><a href="#webhooks">2. Webhooks</a></h2>

TO WRITE

