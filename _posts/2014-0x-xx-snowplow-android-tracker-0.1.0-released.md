---
layout: post
shortenedlink: Snowplow Android Tracker 0.1.0 released
title: Snowplow Android Tracker 0.5.0 released
tags: [snowplow, analytics, java, android, tracker]
author: Jonathan
category: Releases
---

We are proud to release the [Snowplow Android Tracker][repo]; one of the most requested Trackers so far. This is a major milestone for us, since it makes use of the latest [Snowplow 0.9.7][snplow-tag] release, made specfically for mobile tracking. 

The Android Tracker has been going through a lot preparation as we matured the Java Tracker. We've now based the Android Tracker on the same Java Tracker Core that runs the Java Tracker with a few additions, like tracking geographical location and mobile-specific context data. As such, you'll see many similarities between the two Trackers, which I'll explain in further detail in the rest of the post:

1. [Compatibility](/blog/2014/0x/xx/snowplow-android-tracker-0.1.0-released/#compatibility)
2. [How to install the tracker](/blog/2014/0x/xx/snowplow-android-tracker-0.1.0-released/#how-to-install)
3. [How to use the tracker](/blog/2014/0x/xx/snowplow-android-tracker-0.1.0-released/#how-to-use)

[repo]: https://github.com/snowplow/snowplow-android-tracker
[snplow-tag]: https://github.com/snowplow/snowplow/releases/tag/0.9.7