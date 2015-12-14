---
layout: post
title: Snowplow 0.6.2 released, with JavaScript tracker bug fixes
title-short: Snowplow 0.6.2
tags: [snowplow, release, javascript, bug-fix]
author: Alex
category: Releases
---

Today we are releasing Snowplow version **0.6.2** - a clean-up release after yesterday's 0.6.1 release. This release bumps the JavaScript Tracker to version 0.8.1; the updated minified tracker is available as always here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/0.8.1/sp.js

This release fixes two bugs:

1. [Issue #101] [issue-101] - we had left in a `console.log()` in the production version, which should only have been printed in debug mode. Harmless but worth taking out. Many thanks to [Michael Tibben] [mtibben] @ [99designs] [99designs] for spotting this so quickly and fixing
2. [Issue #102] [issue-102] - there was a trailing space in our initialization code, [`init.js`] [init-js], which could cause some issues in Internet Explorer. Many thanks to community member Alan Z for raising

The JavaScript Tracker's API and the Tracker Protocol are unchanged. We recommend upgrading to using the new JavaScript Tracker version 0.8.1 over the previous 0.8.0.

Finally, if you haven't yet read our tutorial on [Integrating the JavaScript Tracker with Google Tag Manager] [gtm-integration], we would recommend taking a look - it makes these sorts of upgrades much easier.

[issue-101]: https://github.com/snowplow/snowplow/pull/101
[issue-102]: https://github.com/snowplow/snowplow/issues/102
[init-js]: https://github.com/snowplow/snowplow/blob/master/1-trackers/javascript-tracker/js/src/init.js
[mtibben]: https://github.com/mtibben
[99designs]: http://99designs.com
[gtm-integration]: https://github.com/snowplow/snowplow/wiki/Integrating-javascript-tags-with-Google-Tag-Manager
