---
layout: post
title: Snowplow iOS Tracker 0.2.0 released
title-short: Snowplow iOS Tracker 0.2.0
tags: [snowplow, analytics, ios, tracker, ifa]
author: Alex
category: Releases
---

We are pleased to announce the release of version 0.2.0 of the Snowplow iOS Tracker. This is an important update which changes the Tracker's approach to recording Apple's Identifier For Advertisers (IFA).

Apps that do not display advertisements are not allowed to access the IFA on an iOS device, and Apple will reject apps that attempt to do this. Unfortunately, the Snowplow iOS Tracker v0.1.x was configured to always record the IFA as part of the [`mobile_context`] [mobile-context] JSON which is attached to each mobile event.

From version 0.2.0 onwards, the Snowplow iOS Tracker will only send IFA if you have the AdSupport.framework included (and are therefore intending to serve ads). This fix can be found as [issue #76] [issue-76].

For the avoidance of doubt, you can also avoid sending IFA regardless of your advertising situation, thus:

* Click on **Build Settings** to your app's project in Xcode
* Search for **Preprocessor Macros**
* Add a macro defined as `SNOWPLOW_NO_IFA = 1`

For more details on this release, please see:

* The [updated technical documentation][wiki]
* The [0.2.0 release notes][tracker-020]

[mobile-context]: http://iglucentral.com/schemas/com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-0

[issue-76]: https://github.com/snowplow/snowplow-ios-tracker/issues/76

[wiki]: https://github.com/snowplow/snowplow/wiki/iOS-Tracker#32-sending-ifa
[tracker-020]: https://github.com/snowplow/snowplow-ios-tracker/releases/tag/0.2.0
