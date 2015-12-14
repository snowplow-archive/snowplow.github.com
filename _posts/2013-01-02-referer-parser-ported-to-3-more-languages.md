---
layout: post
title: referer-parser now with Java, Scala and Python support
tags: [referer parsing, parser, attribution marketing, java, scala, python]
author: Alex
category: Releases
---

Happy New Year all! It's been three months since we [introduced our Attlib project] [attlib-post], now renamed to [referer-parser] [repo], and we are pleased to announce that referer-parser is now available in three additional languages: Java, Scala and Python.

To recap: referer-parser is a simple library for extracting seach marketing attribution data from referer _(sic)_ URLs. You supply referer-parser with a referer URL; it then tells you whether the URL is from a search engine - and if so, which search engine it is, and what keywords the user supplied to arrive at your page.

Huge thanks to [Don Spaulding] [donspaulding] @ [Mirus Research] [mirus-research] for contributing the [Python port] [python-impl] of referer-parser; the [Java/Scala port] [java-scala-impl] was developed by us in-house and it will be a key addition to our [Snowplow ETL] [snowplow-etl] process in the coming months.

You can checkout the code on GitHub, in the [referer-parser repository] [repo], or read on below the fold for some code examples in the new languages:

<!--more-->

## Python

To use referer-parser from a Python script:

{% highlight python %}
from referer_parser import Referer

referer_url = 'http://www.google.com/search?q=gateway+oracle+cards+denise+linn&hl=en&client=safari'

r = Referer(referer_url)

print(r.known)              # True
print(r.referer)            # 'Google'
print(r.search_parameter)   # 'q'     
print(r.search_term)        # 'gateway oracle cards denise linn'
print(r.uri)                # ParseResult(scheme='http', netloc='www.google.com', path='/search', params='', query='q=gateway+oracle+cards+denise+linn&hl=en&client=safari', fragment='')
{% endhighlight %}

For more information, please see the Python [README] [python-readme].

## Scala

To use referer-parser from a Scala app:

{% highlight scala %}
val refererUrl = "http://www.google.com/search?q=gateway+oracle+cards+denise+linn&hl=en&client=safari"

import com.snowplowanalytics.refererparser.scala.Parser
for (r <- Parser.parse(refererUrl)) {
  println(r.referer.name)      // => "Google"
  for (s <- r.search) {
    println(s.term)            // => "gateway oracle cards denise linn"
    println(s.parameter)       // => "q"    
  }
}
{% endhighlight %}

For more information, please see the Java/Scala [README] [java-scala-readme].

## Usage: Java

To use referer-parser from a Java program:

{% highlight java %}
import com.snowplowanalytics.refererparser.Parser;

...

  String refererUrl = "http://www.google.com/search?q=gateway+oracle+cards+denise+linn&hl=en&client=safari";

  Parser refererParser = new Parser();
  Referal r = refererParser.parse(refererUrl);

  System.out.println(r.referer.name);       // => "Google"
  System.out.println(r.search.parameter);   // => "q"    
  System.out.println(r.search.term);        // => "gateway oracle cards denise linn"
{% endhighlight %}

For more information, please see the Java/Scala [README] [java-scala-readme].

## Getting help

That's it! If you have any problems with the new versions of referer-parser, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

And do let us know if you find referer-parser useful!

[attlib-post]: /blog/2012/10/11/attlib-0.0.1-released/

[donspaulding]: https://github.com/donspaulding
[mirus-research]: http://mirusresearch.com/

[repo]: https://github.com/snowplow/referer-parser
[python-impl]: https://github.com/snowplow/referer-parser/tree/master/python
[python-readme]: https://github.com/snowplow/referer-parser/blob/master/python/README.md
[java-scala-impl]: https://github.com/snowplow/referer-parser/tree/master/java-scala
[java-scala-readme]: https://github.com/snowplow/referer-parser/blob/master/java-scala/README.md

[snowplow-etl]: https://github.com/snowplow/snowplow/wiki/etl

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/referer-parser/issues
