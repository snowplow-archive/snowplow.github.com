---
layout: page
header: title
group: documentation
subgroup: analytics
title: Performance timing
permalink: /documentation/recipes/platform-analytics/performance-timing/
---

The [Snowplow Javascript tracker](https://github.com/snowplow/snowplow-javascript-tracker) can track page performance. If this [option](https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#performanceTiming) is enabled, the JavaScript Tracker will create a context JSON from the `window.performance.timing` object, along with the Chrome `firstPaintTime` field (renamed to `chromeFirstPaint`) if it exists. This data can be used to calculate page performance metrics. For more information, see the [W3 documentation](https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/NavigationTiming/Overview.html).

Below are 2 example queries.

## Total time required to load a page:

{% highlight sql %}
SELECT
ROUND((load_event_end - navigation_start)/1000) AS time_in_seconds,
COUNT(*)
FROM atomic.org_w3_performance_timing_1
WHERE LEN(load_event_end) = 13
AND LEN(navigation_start) = 13
GROUP BY 1
ORDER BY 1
LIMIT 1000
{% endhighlight %}

## Request response time:

{% highlight sql %}
SELECT
ROUND((response_end - request_start)/1000) AS time_in_seconds,
COUNT(*)
FROM org_w3_performance_timing_1
WHERE LEN(response_end) = 13
AND LEN(request_start) = 13
GROUP BY 1
ORDER BY 1
LIMIT 1000
{% endhighlight %}
