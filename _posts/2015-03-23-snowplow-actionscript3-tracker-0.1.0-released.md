---
layout: post
title: Snowplow ActionScript 3 Tracker 0.1.0 released
title-short: Snowplow ActionScript 3 Tracker 0.1.0
tags: [snowplow, analytics, actionscript, flash, actionscript3, as3]
author: Alex
category: Releases
---

We are pleased to announce the release of our new [Snowplow ActionScript 3 Tracker] [repo], contributed by Snowplow customer [Viewbix] [viewbix]. This is Snowplow's first customer-contributed tracker - an exciting milestone for us! Huge thanks to Dani, Ephraim, Mark and Nati and the rest of the team at Viewbix for making this tracker a reality.

The Snowplow ActionScript 3.0 (AS3) Tracker supports [ActionScript 3.0] [as3], and lets you add analytics to your Flash Player 9+, Flash Lite 4 and AIR games, apps and widgets.

In the rest of this post we will cover:

1. [How to install the tracker](/blog/2015/03/23/snowplow-actionscript3-tracker-0.1.0-released/#get)
2. [How to use the tracker](/blog/2015/03/23/snowplow-actionscript3-tracker-0.1.0-released/#use)
3. [Getting help](/blog/2015/03/23/snowplow-actionscript3-tracker-0.1.0-released/#help)

<!--more-->

<div class="html">
<h2><a name="get">How to install the tracker</a></h2>
</div>

<h3><a name="compat">Compatibility</a></h3>

This ActionScript event tracker has been built, tested and compiled using the Adobe Flex 3.5 SDK, but is not dependent on Flex. You can use it in pure ActionScript projects.

It is compatible with Flash Player 9.0.124 and later.

The following installation instructions assume that you are using FlashBuilder for building your Flash application.

<h3><a name="binary">Install using binary</a></h3>

The binary is available for download from our public BinTray repository. Installation steps as follows:

1. Download the [snowplow_actionscript3_tracker_0.1.0.zip] [bintray] file
2. Unzip the binary (.SWC) file
3. Include it in your project under "Properties > Build Path > Library Path > Add SWC..."

<h3><a name="source">Install from source</a></h3>

You can also install this Flash analytics SDK from source:

1. Download the project source code from GitHub under the [0.1.0 tag] [source]
2. Import the source into your FlashBuilder project using "Import > Other... > Existing Projects into Workspace"
3. Link this new project to your project using "Properties > Build Path > Library Path > Add Project..."

And that's it! For more detailed setup instructions, check out the [ActionScript 3.0 Tracker Setup Guide] [setup-docs] on the Snowplow wiki.

You're now ready to start using the tracker.

<div class="html">
<h2><a name="use">How to use the tracker</a></h2>
</div>

Require the Tracker module in your ActionScript code like so:

{% highlight java %}
import com.snowplowanalytics.snowplow.tracker.*;
import com.snowplowanalytics.snowplow.tracker.emitter.*;
import com.snowplowanalytics.snowplow.tracker.payload.*;
{% endhighlight %}

You are now ready to initialize a Tracker instance:

{% highlight java %}
var t1:Tracker = new Tracker(emitter, "AF003", "cf", user1Subject, this.stage, true);
{% endhighlight %}

Now let's send in a couple of events:

{% highlight python %}
t1.trackPageView("www.mysite.com#page3", "Page Three", "www.me.com", contextList);
t1.trackScreenView("HUD > Save Game", "screen23", contextList, 123456);
{% endhighlight %}

And that's it! Please check out the [ActionScript 3.0 Tracker Technical Documentation] [tech-docs] on the Snowplow wiki for the tracker's full API.

<h2><a name="help">3. Getting help</a></h2>

The ActionScript Event Tracker is a young project and we will be working with Viewbix and the wider Snowplow community to enhance it over the coming weeks and months; in the meantime, do please share any user feedback, feature requests or possible bugs.

Feel free to [get in touch][talk-to-us] or raise an issue in the [ActionScript 3.0 Tracker's issues] [as3-issues] on GitHub!

[viewbix]: http://corp.viewbix.com/
[as3]: http://www.adobe.com/devnet/actionscript.html

[tech-docs]: https://github.com/snowplow/snowplow/wiki/ActionScript3-Tracker
[setup-docs]: https://github.com/snowplow/snowplow/wiki/ActionScript3-Tracker-Setup
[repo]: https://github.com/snowplow/snowplow-actionscript3-tracker

[bintray]: http://dl.bintray.com/snowplow/snowplow-generic/snowplow_actionscript3_tracker_0.1.0.zip
[source]: https://github.com/snowplow/snowplow-actionscript3-tracker/tree/0.1.0

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[as3-issues]: https://github.com/snowplow/snowplow-actionscript3-tracker/issues
