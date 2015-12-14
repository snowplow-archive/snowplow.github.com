---
layout: post
title: Issue with Elastic Beanstalk Tomcat container for Clojure Collector users - diagnosis and resolution
tags: [clojure collector,  tomcat, elastic beanstalk, container]
author: Yali
category: Other
---

A few weeks ago one of our users reported that they were consistently missing data between 1am and 2am UTC. We investigated the issue and found that their Clojure Collector was not successfully logging data in that hour.

Working with engineers at AWS we identified the cause of the issue. At some stage (we cannot confirm exactly when) Amazon released a new Elastic Beanstalk Tomcat container version which had a bug related to the anacron configuration that is used to rotate the collector (Tomcat) logs on the servers to S3, where they are processed by the rest of the Snowplow pipeline. The bug meant that not all the data generated between 1am and 2am UTC was successfully rotated.

After the engineers at Amazon confirmed the bug, they released an updated version of the Elastic Beanstalk Tomcat container (v1.4.4). We immediately tested the updated container and confirmed it resolved the issue.

This alert post will cover the following topics:

1. [Was I affected by the bug?](/blog/2015/07/31/issue-with-elastic-beanstalk-tomcat-container-used-by-clojure-collector/#affected)
2. [Resolving the issue](/blog/2015/07/31/issue-with-elastic-beanstalk-tomcat-container-used-by-clojure-collector/#fixing)
3. [Thanks to the team at AWS](/blog/2015/07/31/issue-with-elastic-beanstalk-tomcat-container-used-by-clojure-collector/#thanks)
4. [Getting help](/blog/2015/07/31/issue-with-elastic-beanstalk-tomcat-container-used-by-clojure-collector/#help)

<!--more-->

<h2 id="affected">Was I affected by the bug?</h2>

To identify whether you were affected by the bug, you can sum the number of events received each hour of the day, and see if there's a significant drop between 1am and 2am UTC. For example, running the following query:

{% highlight sql %}
select
date_trunc('hour', collector_tstamp),
count(*)
from atomic.events
where collector_tstamp > '2015-07-01'
group by 1
order by 1;
{% endhighlight %}

Plotting the results will produce something like this for affected users:

![event-volumes-by-hour][img1]

Note the regular drop in event volumes between 1am and 2am each day.

The effect can be easier to spot if your plot event volumes by minute:

{% highlight sql %}
select
date_trunc('minute', collector_tstamp),
count(*)
from atomic.events
where collector_tstamp > '2015-07-01'
and collector_tstamp < '2015-07-07'
group by 1
order by 1;
{% endhighlight %}

Plotting the results you might see something like this:

![event-volumes-by-minute][img2]

Again - note the regular drop in event volumes each day between 1 and 2am UTC.

<h2 id="fixing">Resolving the issue</h2>

Resolving the issue is straightforward: you  need to upgrade to the latest Tomcat container version (1.4.4) in Elastic Beanstalk. We recommend doing so as follows:

1. Log into the Elastic Beanstalk Management UI. Identify your Clojure collector application
2. If you are not already running version 1.0.0 of the Clojure collector, take this opportunity to upgrade to it. Download it [here](http://d2io1hx8u877l0.cloudfront.net/2-collectors/clojure-collector/clojure-collector-1.0.0-standalone.war), and upload it to your Elastic Beanstalk as a new application version. Don't deploy it yet!
3. Setup a new environment in your current Clojure collector application. Make sure to select the latest version of the Tomcat container (1.4.4). Follow the wizard in the management UI so that the new environment is up and running alongside the old environment
4. When the new environment is up and running, update the settings on the new environment to match those in the old
5. When you are satisfied that the two environments are identical, use the *Swap URL* button in the Management UI. This will update the CNAME record so that requests that were previously pinging the old collector environment are now pinging the new collector environment
6. Update your EmrEtlRunner config so that it fetches raw logs from the new collector envirionment. Note - if you are running [r68 Turquoise Jay](/blog/2015/07/23/snowplow-r68-turquoise-jay-released/) or later, you can simply add the new collector log bucket alongside the existing one in your EmrEtlRunner config, rather than swapping in the new one for the old one.
7. Wait a few hours. Once you see that no more requests are hitting the old collector, you can shut it down. Use the monitoring tab in the Elastic Beanstalk UI to confirm this

Amazon has a great guide to upgrading applications in Elastic Beanstalk with no downtime [here](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.CNAMESwap.html). Note if you're following these instructions that you **should not** save the current configuration and then build your new environment using the saved configuration - because that will deploy to an old version of the Tomcat container, rather than the latest version.

<h2 id="thanks">Thanks to the team at AWS</h2>

Our thanks to the support and engineering teams at AWS for helping us to identify the issue and promptly publishing an updated version of the Tomcat container.

<h2 id="help">Getting help</h2>

* Snowplow users can discuss this issue on the [accompanying thread](https://groups.google.com/forum/#!topic/snowplow-user/eDHLS5z_UBY) in the snowplow-user group
* Managed Service customers using the Clojure Collector have been contacted individually to discuss this issue

[img1]: /assets/img/blog/2015/07/events-per-hour.png
[img2]: /assets/img/blog/2015/07/events-per-minute.png
