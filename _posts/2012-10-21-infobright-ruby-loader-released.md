---
layout: post
title: Infobright Ruby Loader Released
tags: [inforbright, ruby, data ingest]
author: Alex
category: Releases
---

We're pleased to start the week with the release of a new Ruby gem, our [Infobright Ruby Loader] [irl-repo] (IRL).

At Snowplow we're committed to supporting multiple different storage and analytics options for Snowplow
events, alongside our current Hive-based approach. One of the alternative data stores we are working with
is [Infobright] [infobright], a columnar database which is available in open source and commercial versions.

<!--more-->

For all but the largest Snowplow users, columnar databases such as Infobright should be an attractive
alternative to doing all of your analysis in Hive. The main advantages of columnar databases are as follows:

<ol>
	<li>Scale to terabytes (although not petabytes, unlike Hive)</li>
	<li>Fixed cost (dedicated RAM-heavy analytics server), versus pay-as-you-go querying on Amazon EMR</li>
	<li> Significantly faster query times - typically seconds, not minutes</li>
	<li>Plug in to many analytics front-ends e.g. Tableau, Qlikview, R</li>
</ol>

So, open source columnar databases like Infobright Community Edition (ICE) are a good fit for Snowplow analytics.
Unfortunately, when we started to load Snowplow event logs into ICE, we realised that there wasn't a good
data-loading solution for Infobright in Ruby, our ETL language of choice. So, we built one :-)

Our freshly minted [Infobright Ruby Loader] [irl-repo] (IRL) can be used in two different ways:

<ul>
	<li><em>As a command-line tool</em> - for manual loading of data into Infobright at the command-line. No Ruby expertise required</li>
	<li><em>As part of another application</em> - because it is a Ruby gem with a Ruby API, IRL can be integrated into larger Ruby ETL processes</li>
</ul>

We will be using IRL at Snowplow as part of our larger ETL process to load Snowplow events into ICE for analysis - we hope
to roll this out within the next few weeks.

In the meantime, we hope that IRL is useful to people in the Infobright community who need to run data loads at the
command-line; IRL was inspired by [ParaFlex] [paraflex], an excellent Bash script from the Infobright team to perform
parallel loading of Infobright, and can be used as a direct alternative to ParaFlex.

To find out more about our Infobright Ruby Loader, please check out the detailed [README] [readme] in the GitHub repository.
And please direct any questions through the [usual channels] [talk-to-us]!

[irl-repo]: https://github.com/snowplow/infobright-ruby-loader
[infobright]: http://www.infobright.org/
[paraflex]: http://www.infobright.org/Blog/Entry/unscripted/
[readme]: https://github.com/snowplow/infobright-ruby-loader/blob/master/README.md
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
