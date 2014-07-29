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

1. [The schema service](/blog/2014/07/27/iglu-server-0.2.0-released/#schema)
2. [The catalog service](/blog/2014/07/27/iglu-server-0.2.0-released/#catalog)
3. [Schema validation](/blog/2014/07/27/iglu-server-0.2.0-released/#valid)
4. [Api authentication](/blog/2014/07/27/iglu-server-0.2.0-released/#auth)
5. [Running your own server](/blog/2014/07/27/iglu-server-0.2.0-released/#diy)
<!--sub: config, super key, key gen service-->
6. [Support](/blog/2014/07/27/iglu-server-0.2.0-released/#support)

<!--more-->

<h2><a name="schema">1. The schema service</a></h2>

As mentionned previously, our JSON schema repository takes the form of a
RESTful api and using the schema service you will be able to interact with
individual schemas with simple http requests.
For example, let us say you own the com.snowplowanalytics prefix (the details
of owning a vendor prefix will be covered in the [api authentication section](/blog/2014/07/27/iglu-server-0.2.0-released/#auth)) and you have a schema defined as
follows:

{% highlight json %}

{
    "$schema": "http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#",
    "description": "Schema for an ad click event",
    "self": {
        "vendor": "com.snowplowanalytics.snowplow",
        "name": "ad_click",
        "format": "jsonschema",
        "version": "1-0-0"
    },
    "type": "object",
    "properties": {
        "clickId": {
            "type": "string"
        },
        "targetUrl": {
            "type": "string",
            "minLength": 1
        }
    },
    "required": ["targetUrl"],
    "additionalProperties": false
}

{% endhighlight %}

Adding this schema to your own registry of json schemas is as simple as making
a POST request following this url pattern:

```
/vendor/name/format/version?json={ "some": "json" }
```

With our example it would be:

```
/com.snowplowanalytics.snowplow/ad_click/jsonschema/1-0-0?json=ourJson
```

You should receive a json response like this one:

{% highlight json %}
{
    "status": 200,
    "message": "Schema added successfully"
}
{% endhighlight %}

Once you schema is added to the repository you can retrieve it by making a
GET request:

```
/com.snowplowanalytics.snowplow/ad_click/jsonschema/1-0-0
```

The json response should look like this:

{% highlight json %}
{
    "schema": {
        "$schema": "http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#",
        "description": "Schema for an ad click event",
        "self": {
            "vendor": "com.snowplowanalytics.snowplow",
            "name": "ad_click",
            "format": "jsonschema",
            "version": "1-0-0"
        },
        "type": "object",
        "properties": {
            "clickId": {
                "type": "string"
            },
            "targetUrl": {
                "type": "string",
                "minLength": 1
            }
        },
        "required": ["targetUrl"],
        "additionalProperties": false
    },
    "created": "07/25/2014 07:34:19"
}
{% endhighlight %}

As you might have noticed, some metadata comes along with the schema. For now,
only the date at which point the schema was created follows along but this
should be extended in the future.

<h2><a name="catalog">2. The catalog service</a></h2>

What if you want to retrieve every version of a schema or every schema belonging
to a specific vendor, enters the schema service.

By simply truncating the url we used to get a single schema, you will be able to
get back every schema corresponding to your query.

For example, if you want to retrieve every version of a schema, you will have to
make a GET request following this pattern:

```
/vendor/name/format
```

If we were to have two versions of the preceeding schema `1-0-0` and `1-0-1`
and the `1-0-1` was defined as:

{% highlight json %}
{
    "$schema": "http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#",
    "description": "Schema for an ad click event",
    "self": {
        "vendor": "com.snowplowanalytics.snowplow",
        "name": "ad_click",
        "format": "jsonschema",
        "version": "1-0-1"
    },
    "type": "object",
    "properties": {
        "clickId": {
            "type": "string"
        },
        "impressionId": {
            "type": "string"
        },
        "targetUrl": {
            "type": "string",
            "minLength": 1
        }
    },
    "required": ["targetUrl"],
    "additionalProperties": false
}
{% endhighlight %}

You would be able to retrieve them both by making a GET request to:

```
/com.snowplowanalytics.snowplow/ad_click/jsonschema
```

Getting back:

{% highlight json %}
[
    {
        "schema": {
            //the ad_click schema in version 1-0-0
        },
        "version": "1-0-0",
        "created": "07/25/2014 07:34:19"
    },
    {
        "schema": {
            //the ad_click schema in version 1-0-1
        },
        "version": "1-0-1",
        "created": "07/25/2014 07:34:40"
    }
]
{% endhighlight %}

Notice that this time we get back a bit more metadata with the schema's version
being added.

It works the same way when you want to retrieve every format, version
combination of a schema: `vendor/name` (
`com.snowplowanalytics.snowplow/ad_click` with our example).

Finally if you want to retrieve every schema belonging to a vendor: `vendor` (
`com.snowplowanalytics.snowplow' with our example).

<h2><a name="valid">3. Schema validation</a></h2>
