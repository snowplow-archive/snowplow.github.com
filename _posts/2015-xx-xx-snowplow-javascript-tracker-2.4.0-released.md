---
layout: post
shortenedlink: JavaScript Tracker 2.4.0 released
title: Snowplow JavaScript Tracker 2.4.0 released
tags: [snowplow, javascript, tracker, browser, analytics]
author: Fred
category: Releases
---

We are happy to announce the release of version 2.4.0 of the [Snowplow JavaScript Tracker][release-240]! This release adds support for cross-domain tracking and a new method to track timing events.

Read on for more information...

1. [Tracking users cross-domain](/blog/2015/xx/xx/snowplow-javascript-tracker-2.4.0-released/#cross-domain)
1. [Tracking timings](/blog/2015/xx/xx/snowplow-javascript-tracker-2.4.0-released/#timing)

<!--more-->

<h2><a name="cross-domain">1. Tracking users cross-domain</a></h2>

Version 2.4.0 of the JavaScript Tracker adds support for tracking users cross-domain. When a user clicks on one of the links you have specified (or navigates to that link using the keyboard), the Tracker adds the user's domain user ID together with a timestamp for the click to the querystring of that link in an "_sp=..." field. If the JavaScript Tracker is also present on the destination page, it will send the URL of the page - including the new querystring field - with all events. The new `refr_domain_userid` and `refr_dvce_tstamp` fields in the `atomic.events` table will then be populated based on the "_sp" field.

You can control which links should be decorated using a filter function. For each link element on the page, the function will be called with that link as its argument. If the function returns `true`, event listeners will be added to the link and will decorate it when the user navigates to it.

If you want to enable cross-domain tracking, add this function to the tracker constructor argmap with the key "crossDomainLinker".

 For example, this function would only decorate those links whose destination is "http://acme.de" or whose HTML id is "crossDomainLink":

```javascript
snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
  crossDomainLinker: function (linkElement) {
    return (linkElement.href === "http://acme.de" || linkElement.id === "crossDomainLink");
  }
});
```

If you want to decorate every link to the domain github.com:

```javascript
snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
  crossDomainLinker: function (linkElement) {
    return /^https:\/\/github\.com/.test(linkElement.href);
  }
});
```

If you want to decorate every link, regardless of its destination:

```javascript
snowplow('newTracker', 'cf', 'd3rkrsqld9gmqf.cloudfront.net', {
  crossDomainLinker: function (linkElement) {
    return true;
  }
});
```

If new links are added to the page after the tracker is initialized, you can enable decoration for them using the `crossDomainLinker` tracker method:

```javascript
snowplow('crossDomainLinker', function (linkElement) {
    return (linkElement.href === "http://acme.de" || linkElement.id === "crossDomainLink");
  })
```

<h2><a name="timing">2. Tracking timings</a></h2>

The new `trackTiming` method can be used to track user timing information. This example uses the method to send a `timing` event describing how long it took a map to load:

```javascript
snowplow(
  'trackTiming',
  'load',            // Category of the timing variable
  'map_loaded',      // Variable being recorded
  50,                // Milliseconds taken
  'Map loading time' // Optional label
 );
```

You can see the JSON schema for the event that the method generates [here][timing-schema].

[release-240]: https://github.com/snowplow/snowplow-javascript-tracker/releases/tag/2.4.0
[timing-schema]: https://github.com/snowplow/iglu-central/blob/master/schemas/com.snowplowanalytics.snowplow/timing/jsonschema/1-0-0
