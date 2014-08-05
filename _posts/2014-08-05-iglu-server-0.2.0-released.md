---
layout: post
shortenedlink: Iglu release 2 with new RESTful schema server 
title: Iglu release 2 with a new RESTful schema server
tags: [iglu, scala, server, api, restful]
author: Ben
category: Releases
---

We are pleased to announce the second release of Iglu, our machine-readable
schema repository for JSON Schema. If you are not familiar with what Iglu is
please read [the blog post for the initial release of Iglu](/blog/2014/07/01/iglu-schema-repository-released/).

Iglu release 2 introduces a new Scala-based RESTful repository server, which will
serve as the basis for our future releases, and contains many of the key
schema-related functionalities we envisioned when designing Iglu. The new Scala repository server is version 0.1.0.

In this post, we will cover the following aspects of the new repository service:

1. [The schema service](/blog/2014/08/05/iglu-server-0.2.0-released/#schema)
2. [The catalog service](/blog/2014/08/05/iglu-server-0.2.0-released/#catalog)
3. [Schema validation](/blog/2014/08/05/iglu-server-0.2.0-released/#valid)
4. [Api authentication](/blog/2014/08/05/iglu-server-0.2.0-released/#auth)
5. [Running your own server](/blog/2014/08/05/iglu-server-0.2.0-released/#diy)
    1. [Modifying the configuration file](/blog/2014/08/05/iglu-server-0.2.0-released/#config)
    2. [The super api key](/blog/2014/08/05/iglu-server-0.2.0-released/#super)
    3. [The api key generation service](/blog/2014/08/05/iglu-server-0.2.0-released/#keygen)
6. [Support](/blog/2014/08/05/iglu-server-0.2.0-released/#support)

<!--more-->

<h2><a name="schema">1. The schema service</a></h2>

As mentionned previously, our JSON schemas repository takes the form of a
RESTful api and using the schema service you will be able to interact with
individual schemas with simple HTTP requests.

For example, let us say you own the `com.snowplowanalytics` prefix (the details
regarding owning a vendor prefix will be covered in the [api authentication section](/blog/2014/08/05/iglu-server-0.2.0-released/#auth)) and you have a JSON schema defined as
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

Adding this schema to your own registry of JSON schemas is as simple as making
a POST request following this url pattern:

```
/vendor/name/format/version?json={ "some": "json" }
```

With our example it would be:

```
/com.snowplowanalytics.snowplow/ad_click/jsonschema/1-0-0?json=ourJson
```

Once the request is processed, you should receive a JSON response like this one:

{% highlight json %}
{
    "status": 200,
    "message": "Schema added successfully"
}
{% endhighlight %}

As soon as your schema is added to the repository you can retrieve it by making
a GET request:

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
    "createdAt": "07/25/2014 07:34:19"
}
{% endhighlight %}

As you might have noticed, some metadata comes along with the schema. For now,
only the date at which point the schema was created follows along but this
should be extended in the future.

If you do not need the schema itself and just want to retrieve metadata about a
schema you can do so by sending a GET request to:

```
/vendor/name/format/version?filter=metadata
```

To get back:

{% highlight json %}
{
    "vendor": "your.vendor.name",
    "name": "the_schema_name",
    "format": "jsonschema",
    "version": "1-0-0",
    "createdAt": "08/04/2014 13:19:45"
}
{% endhighlight %}

<h2><a name="catalog">2. The catalog service</a></h2>

What if you want to retrieve every version of a schema or every schema belonging
to a specific vendor, enters the catalog service.

By simply truncating the url we used to get a single schema, you will be able to
get back every schema matching your query.

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
        "createdAt": "07/25/2014 07:34:19"
    },
    {
        "schema": {
            //the ad_click schema in version 1-0-1
        },
        "version": "1-0-1",
        "createdAt": "07/25/2014 07:34:40"
    }
]
{% endhighlight %}

Notice that this time we get back a bit more metadata with the schema's version
being added.

It works the same way if you want to retrieve every version of every format of a
schema:

```
/vendor/name
```

(`com.snowplowanalytics.snowplow/ad_click` with our example).

Finally if you want to retrieve every schema belonging to a vendor:

```/vendor```

(`/com.snowplowanalytics.snowplow` with our example).

Similarly to the schema service, you can, at any point (vendor, name, format),
add a `filter=metadata` query parameter to retrieve only metadata.

<h2><a name="valid">3. Schema validation</a></h2>

One thing you might have caught on is that every schema you add to the
repository must be self-describing (I invite you to read
[the post on self-describing JSON Schemas](/blog/2014/05/15/introducing-self-describing-jsons/) if you're
not familiar with the notion). It basically means that your schema must have a
`self` property containing itself the following properties: `vendor`, `name`,
`format`, `version`.

If your schema is not self-describing you will get back this json response when
trying to add it to the repository:

{% highlight json %}
{
    "status": 400,
    "message": "The json provided is not a valid self-describing json"
}
{% endhighlight %}

<h2><a name="auth">4. API authentication</a></h2>

To restrain access to schemas, we have set up an api key based authentication
system. Concretely, you will be given a pair of api keys (one with read access
and one with read and write access) per organization. This api key will have to
be provided with each request through an `api-key` HTTP header.

For example, let us say your organization is Snowplow Analytics Ltd, you will
be given a pair of keys for the `com.snowplowanalytics` prefix and will
consequently have access to every schema, the vendor of which starts with
`com.snowplowanalytics` (the `com.snowplowanalytics.snowplow` vendor for
example).

<h2><a name="diy">5. Running your own server</a></h2>

If you feel your json schemas are sensitive intellectual property, you can run
your own server. Doing so requires a few steps which will be detailed here.

<h3><a name="config">5.1 Modifying the configuration file.</a></h3>

In order to get the server running you will need a PostgreSQL instance, the
connection details of which can be filled in in the [application.conf file](https://github.com/snowplow/iglu/blob/feature/postgre/2-repositories/scala-repo-server/src/main/resources/application.conf) <!--to modify once it's been merged-->.
In particular, you will need to modify the `host`, `port`, `dbname`, `username`
and `password` fields.

<h3><a name="super">5.2 The super api key</a></h3>

Once your `application.conf` file is filled in  properly you can launch the
server and the necessary tables (`apikeys` and `schemas`) will be created
automatically.

One thing you will need to do is add a `super` api key manually to the database.
This api key will be used to generate your clients' api keys.

{% highlight sql %}
insert into apikeys (uid, vendor, permission, createdat)
values ('an-uuid', 'a.vendor', 'super', current_timestamp);
{% endhighlight %}

<h3><a name="keygen">5.3 The api key generation service</a></h3>

Once your super api key has been created, you will be able to use it to generate
api keys for your clients through the api key generation service.

This service is as simple to use as the schema service and catalog service.

To generate a read and write pair of keys for a specific vendor prefix simply
send a POST request with this url using your super api key in a `api-key` HTTP
header:

```
/apikeygen?owner=the.owner.in.question
```

You should receive a json response like this one:

{% highlight json %}
{
    "read": "an-uuid",
    "write": "another-uuid"
}
{% endhighlight %}

If you want to revoke a specific api key, send a DELETE request like so:

```
/apikeygen?key=some-uuid
```

You can also delete every api keys linked to a specific owner by sending a
DELETE request:

```
/apikeygen?owner=the.owner.in.question
```

<h2><a name="support">6. Support</a></h2>

If there is a feature you would like to see implemented or if you encounter a
bug please raise an issue on [the github project page](https://github.com/snowplow/iglu/issues).
