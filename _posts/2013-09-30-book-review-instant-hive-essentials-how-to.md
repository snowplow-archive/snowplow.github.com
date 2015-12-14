---
layout: post
title: Book review - Apache Hive Essentials How-to
tags: [hive, book]
author: Yali
category: Analytics  
---

Although it is no longer part of the core Snowplow stack, Apache Hive is the gateway drug that got us started  on Hadoop. As some of our [recent][hive-ex-1] [blog posts][hive-ex-2] testify, Hive is still very much a part of our big data toolkit, and this will continue as we use it to roll out new features. (E.g. for analyzing custom unstructured events.) I suspect that many Hadoopers started out with Hive, before experimenting with the myriad other tools to crunch data using Hadoop.

We were therefore delighted to be invited to review [Apache Hive Essentials How-to][book-review], a new guide to Hive written by Darren Lee from [Bizo][bizo].

<div class="html">
<a href="http://www.packtpub.com/apache-hive-essentials-how-to/book?utm_source=blog&amp;utm_medium=link&amp;utm_campaign=bookmention">
	<img src="/assets/img/blog/2013/09/instant-apache-hive-essentials.png" title="Hive how to guide" />
</a>
</div>


For me, there are two totally different categories of technical book that I enjoy in completely different ways:

1. Books that help me use tools more effectively: so I do more in less time.
2. Books that change the way I see the tools I use. These books step back from the practicalities of using the particular tools they cover to situate them in their proper context, and compare their usage with other tools. My favorite example in this cateogry is [Seven Languages in Seven Weeks][7-weeks].

Often, technical books fail because they try and accomplish *both* of the above.

Fortunately, that is **not** true of the [Apache Hive Essentials How-to][book-review]. This is an uncompromisingly practical, focused book, that makes essential reading for anyone working with Hive.

<!--more-->

## Why is it such a good book?

The best thing about Hive is that it makes Hadoop accessible to anyone familiar with SQL. The tricky thing about Hive, is that getting the most out of it means using those features that take you out of SQL, in particular:

* Writing custom SerDes
* Writing user defined functions, including table defining functions
* Streaming with Python / Ruby

Darren Lee does a great job of jumping straight into some of the more useful, trickier aspects of Hive (particularly optimizing joins) before covering the topics listed above. His instructions for writing custom SerDes and user defined functions is succinct and easy to follow. His code is clear and well explained. His examples are well chosen. (I particularly like example of implementing simple linear regression as a user-defined aggregation function.)

This book is short, sharp and to the point. I only wish I'd read it 18 months ago.



[hive-ex-1]: http://snowplowanalytics.com/blog/2013/09/03/using-qubole-to-analyze-snowplow-web-data/
[hive-ex-2]: http://snowplowanalytics.com/blog/2013/09/11/reprocessing-bad-data-using-hive-the-json-serde-and-qubole/
[book-review]: http://www.packtpub.com/apache-hive-essentials-how-to/book?utm_source=blog&utm_medium=link&utm_campaign=bookmention
[bizo]: http://www.bizo.com/home
[7-weeks]: http://pragprog.com/book/btlang/seven-languages-in-seven-weeks
