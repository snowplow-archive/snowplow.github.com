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

| **Field** | **Description** |
|:----------|:---------------------------------------------------------------------|
| `dvce_tstamp` | The timestamp on the device that the event was recorded on       |
| `os_timezone` | The timezone the client operating system is set to               |
| `event_id`    | A unique identifier for the event                                |
| `domain_userid`| First party cookie ID                                           |
| `domain_sessionidx` | Session index based on first party cookie ID               |
| `dvce_screenheight` | Screen height in pixels                                    |
| `dvce_screenwidth`  | Screen width in pixels                                     |
| `br_viewwidth`      | Browser view width in pixels                               |
| `br_viewheight`     | Browser view height in pixels                              |
| `page_url`          | URL of the page on which the event occurred                |
| `page_referrer`     | URL of the referrer                                        |
| `user_fingerprint`  | Browser fingerprint                                        |
| `br_lang`           | Language the browser is set to                             |
| `br_features_...`   | A list of boolean flags to indicate if common plugins are installed e.g. PDF, Quicktime, RealPlayer, Flash, Java...|
| `br_colordepth`     | Browser color depth                                        |
| `doc_width`         | Width of webpage in pixels                                 |
| `doc_height`        | Height of webpage in pixels                                |
| `doc_charset`       | Document encoding                                          |
| `platform`    | The platform that the event was recorded on, in this case 'web'  |
| `name_tracker`| The tracker name                                                 |
| `v_tracker`   | The tracker version                                              |

In addition to the above fields, there are a number of additional optional contexts that you can capture automatically using the Snowplow Javascript tracker, including:

* [Performance timing](https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#predefined-contexts). This provides data on web page load times.
* [Universal Analytics cookie data](https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#22132-gacookies-context). This provides data read from the Google Analytics cookie, for users running Snowplow alongside Unviversal Analytics
* [Geolocation context](https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#22133-geolocation-context). This will provide data on where a user is, if that user has consented to give that information.

We are able to provide a lot more automated tracking from the Javascript tracker than our other trackers for two reasons:

1. The Javascript tracker was our first tracker, and so is the most mature
2. The nature of client-side tracking via JS means there are many more standard data points that can be fetched than, for example, a server-side tracker

The mobile (iOS and Android trackers) also automatically capture a large number of data points with every event, where available:

| **Field** | **Description** |
|:----------|:---------------------------------------------------------------------|
| `os_type` | Operating system type                                                |
| `os_version` | Operating system version                                          |
| `device_manufacturer` | The device manufacturer                                  |
| `device_model` | The device model                                                |
| `carrier`      | The mobile carrier                                              |
| `apple_idfa`   | Apple's IDFA (ID for advertisers)                               |
| `open_idfa`    | The open [IDFA](https://github.com/ylechelle/OpenIDFA)          |
| `android_idfa` | The Android IDFA                                                |
| `latitude`     | Device location latitude                                        |
| `longitude`    | Device location longitude                                       |
| `latitude_longitude_location_accuracy` | The accuracy of the lat/long measures above |
| `altitude`     | Device location altitude                                        |
| `altitude_accuracy` | The accuracy fo the above altitude measure                 |
| `bearing`      | Direction of device travel                                      |
| `speed`        | Speed with which the device is travelling                       |



### Tracking events that you've defined yourself

TO WRITE

### Tracking contexts that you've defined yourself

TO WRITE

<h2><a href="#webhooks">2. Webhooks</a></h2>


