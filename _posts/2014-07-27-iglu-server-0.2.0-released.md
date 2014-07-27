---
layout: post
shtortenedlink: Iglu Server 0.2.0 released
title: Iglu Server 0.2.0 released
tags: [iglu, scala, server]
author: Ben
category: Releases
---

We are pleased to announce the 0.2.0 release of Iglu, our machine-readable
schema repository for JSON schemas.
This release is the main building block for the future releases and contains
the most basic functionalities we had in mind when launching Iglu. This takes
the form of a RESTful api which is meant to be intuitive to use.

In this post we will have a look at those different features and notably:

1. [Get requests](/blog/2014/07/27/iglu-server-0.2.0-released/#gets)
2. [Post requests](/blog/2014/07/27/iglu-server-0.2.0-released/#posts)
3. [Schema validation](/blog/2014/07/27/iglu-server-0.2.0-released/#valid)
4. [Api authentication](/blog/2014/07/27/iglu-server-0.2.0-released/#auth)
5. [Running your own server](/blog/2014/07/27/iglu-server-0.2.0-released/#diy)
<!--sub: config, super key, key gen service-->
6. [Support](/blog/2014/07/27/iglu-server-0.2.0-released/#support)

<!--more-->

<h2><a name="gets">1. Get requests</a></h2>

As mentionned previously, our JSON schema repository takes the form of a
RESTful api and you will be able to retrieve schemas making HTTP GET requests
based on the following url pattern:
<!--make an image-->
You will also be able to get every version of a schema following this url
pattern:
<!--other image-->
And every (format, version) combination from the schema's name:
<!--another image-->
And finally retrieve every schema from a vendor:
<!--last image-->
<!--add sample results-->

As you might have noticed, some metadata comes along with the schema. For now,
only the date at which point the schema was created follows along but this
should be extended in the future.

<h2><a name="posts">2. Post requests</a></h2>

What if you want to publish your own schemas? Simply make a HTTP POST requests
following this url pattern:
<!--image-->

<h2><a name="valid">3. Schema validation</a></h2>
