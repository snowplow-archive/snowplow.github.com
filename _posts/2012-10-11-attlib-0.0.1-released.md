---
layout: post
title: Attlib - an open source library for extracting search marketing attribution data from referrer URLs
title-short: Attlib launched
tags: [snowplow, data, processing, marketing, attribution, search engine, keywords]
author: Yali
category: Releases
---

**Update 17-Dec-12**: We have renamed Attlib to [referer-parser] [referer-parser], to make it clearer what Attlib does: parse referer URLs. The repository has been updated accordingly. Some of the example code below is out-of-date now: we recommend checking out the [repository] [referer-parser] for more information.

Last night we published [Attlib] [attlib], an open source Ruby library for extracting search marketing attribution data from referer (sic) URLs. In this post we talk through:

1. [What Attlib does, and how to use it](#what_attlib_does)
2. [Installing Attlib](#install)
3. [The search_engine.yml file](#search_engine_yaml)
4. [Attlib as part of the Snowplow stack](#snowplow_stack)
5. [Attlib in other languages](#other_languages)
6. [Making components of Snowplow available as standalone open source projects](#snowplow_components_as_standalone_projects)

<div class="html">
<h2 id="what_attlib_does">What Attlib does, and how to use it</h2>
</div>

Attlib is straightforward Ruby library for extracting seach marketing attribution data from referrer URLs. You give it a referer URL to parse: it then lets you now whether the URL is from a search engine. If it is, it will tell you which search engine it is, and what keywords were typed. (If those keywords are included in the query string - this is no longer the case for users logged in to Google, as documented [here] [googlekeywords].)

{% highlight ruby %}
require 'attlib'

r = Referrer.new('http://images.google.ca/imgres?q=hermetic+tarot&hl=en&biw=1189&bih=521&tbm=isch&tbnid=BuQ_IyUbc25usM:&imgrefurl=http://www.psychicbazaar.com/tarot-cards/15-the-hermetic-tarot.html&imgurl=http://mdm.pbzstatic.com/tarot/the-hermetic-tarot/card-4.png&w=1064&h=1551&ei=ue9AUMe7Osn9iwLZ-4H4Dw&zoom=1&iact=hc&vpx=107&vpy=48&dur=2477&hovh=271&hovw=186&tx=133&ty=157&sig=115588264602219115047&page=4&tbnh=162&tbnw=120&start=57&ndsp=19&ved=1t:429,r:12,s:57,i:291')

r.is_search_engine? # True
r.search_engine # 'Google Images'
r.keywords 	# 'hermetic tarot'
{% endhighlight %}

<div class="html">
<h2 id="install">Installing Attlib</h2>
</div>

Attlib is available via a Ruby Gem. To install, simply run the following at the command line:

	sudo gem install attlib

The sourcecode is available on [Github][attlibrepo]

<div class="html">
<h2 id="search_engine_yaml">The search_engines.yml file</h2>
</div>

Extracting search engine names and keywords from a referer URL is pretty straightforward. What is more complicated is keeping track of the myriad search engines that are out there, operating in different countries, the myriad domains they operate on, and the different query parameters that each of them uses to store the keywords.

Because the space is constantly evolving, none of this information (about search engines, parameters and domains) has been hard coded into Attlib. All of it is available in the [search_engines.yml] [searchengineyaml] file, in the [data] [datafolderongithub] in the repo.
<!--more-->

The structure of the YAML file should be straightforward to understand. Each search engine is a top level item. For each search engine, two lists are given: one is a list of parameters used in that search engine's query string to identify the keywords entered. The other is the list of domains on which that search engine operates. An extract is shown below:

{% highlight yaml %}
Babylon:
  parameters:
    - q
  domains:
   - search.babylon.com
   - searchassist.babylon.com

Baidu:
  parameters:
    - wd
    - word
    - kw
    - k
  domains:
    - www.baidu.com
    - www1.baidu.com
    - zhidao.baidu.com
    - tieba.baidu.com
    - news.baidu.com
    - web.gougou.com
{% endhighlight %}

Keeping this file up to date is a big job: one of our hopes releasing Attlib as an open source, standalone library, is that the community contributes to the file. We are enormously grateful to our friends at [Piwik] [piwik] as our initial version of the file is based on the Piwik equivalent [SearchEngines.php] [searchenginesphp], for the hard work they put into this version.

<div class="html">
<h2 id="snowplow_stack">Attlib as part of the Snowplow stack</h2>
</div>

Our intention is to port [Attlib] [attlib] into Scala and integrate it into the Snowplow stack: specifically the ETL phase. Both Ruby and Scala versions of Attlib will run based on the same [search_engines.yml] [searchengineyaml] file.


<div class="html">
<h2 id="other_languages">Attlib in other languages</h2>
</div>

As well as contributing to the search [search_engines.yml] [searchengineyaml] file, we also hope that community members will develop versions of Attlib in other languages e.g. Python.

<div class="html">
<h2 id="snowplow_components_as_standalone_projects">Making components of Snowplow available as standalone open source projects</h2>
</div>

Attlib is the first component in the Snowplow stack that we have released as a standalone library. There are many more in the pipeline. (More on this in future blog posts :-) ). For us, this is a key part of the Snowplow strategy:

1. Keeping the Snowplow architecture as loosely coupled as possible. We believe this makes Snowplow robust, scalable and extendable
2. Grow the userbase of people using and contributing to each component. Processing web analytics data is a big job: there are many individual components involved, and each of them needs to evolve with the changing marketplace. Attlib is concerned today with extracting useful data from search engine referrers: but it is likely that as time goes on, we'll want to extend it to capture data from other types of referrers e.g. social networks or affiliate sites. The bigger the community of people on top of those developments, the better for everyone in the web analytics community. Releasing each component as a standalone open source library should help grow that community.

--------------

Any questions about Attlib, or anything else in this post? Then [get in touch] [contact] with the Snowplow team.


[attlib]: https://github.com/snowplow/referer-parser
[referer-parser]: https://github.com/snowplow/referer-parser
[googlekeywords]: http://googlewebmastercentral.blogspot.co.uk/2011/10/accessing-search-query-data-for-your.html
[attlibrepo]: https://github.com/snowplow/referer-parser
[searchengineyaml]: https://github.com/snowplow/referer-parser/blob/master/search.yml
[datafolderongithub]: https://github.com/snowplow/attlib/tree/master
[piwik]: http://piwik.org/
[searchenginesphp]: https://github.com/piwik/piwik/blob/master/core/DataFiles/SearchEngines.php
[contact]: /about/index.html
