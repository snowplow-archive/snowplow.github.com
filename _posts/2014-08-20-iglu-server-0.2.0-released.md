---
layout: post
shortenedlink: Iglu release 2 with new RESTful schema server 
title: Iglu release 2 with a new RESTful schema server
tags: [iglu, scala, server, api, restful]
author: Ben
category: Releases
---

We are pleased to announce the second release of Iglu, our machine-readable
schema repository system for JSON Schema. If you are not familiar with what Iglu is,
please read [the blog post for the initial release of Iglu](/blog/2014/07/01/iglu-schema-repository-released/).

Iglu release 2 introduces a new Scala-based schema server, allowing users to publish, test and serve schemas via an easy-to-use RESTful interface. This is a huge step forward compared to our current approach, which involves uploading schemas to a static website on Amazon S3. The new Scala schema server is version 0.1.0.

In this post, we will cover the following aspects of the new schema server:

1. [The schema service](/blog/2014/08/20/iglu-server-0.2.0-released/#schema)
    1. [POST requests](/blog/2014/08/20/iglu-server-0.2.0-released/#post)
    2. [PUT requests](/blog/2014/08/20/iglu-server-0.2.0-released/#put)
    3. [Single GET requests](/blog/2014/08/20/iglu-server-0.2.0-released/#get)
    4. [Multiple GET requests](/blog/2014/08/20/iglu-server-0.2.0-released/#gets)
    5. [Swagger support](/blog/2014/08/20/iglu-server-0.2.0-released/#swagger)
2. [Schema validation and the validation service](/blog/2014/08/20/iglu-server-0.2.0-released/#valid)
    1. [Schema validation when adding a schema](/blog/2014/08/20/iglu-server-0.2.0-released/#schemavalid)
    2. [The validation service](/blog/2014/08/20/iglu-server-0.2.0-released/#validservice)
3. [Api authentication](/blog/2014/08/20/iglu-server-0.2.0-released/#auth)
4. [Running your own server](/blog/2014/08/20/iglu-server-0.2.0-released/#diy)
    1. [Modifying the configuration file](/blog/2014/08/20/iglu-server-0.2.0-released/#config)
    2. [The super API key](/blog/2014/08/20/iglu-server-0.2.0-released/#super)
    3. [The API key generation service](/blog/2014/08/20/iglu-server-0.2.0-released/#keygen)
5. [Support](/blog/2014/08/20/iglu-server-0.2.0-released/#support)

<!--more-->

<h2><a name="schema">1. The schema service</a></h2>

Our schema repository takes the form of a RESTful API containing
various services, the most important of which is the **schema service**. It
lets you interact with schemas via simple HTTP requests.

<h3><a name="post">1.1 POST requests</a></h3>

For example, let's say you own the `com.snowplow` prefix (the details
regarding owning a vendor prefix will be covered in the [api authentication section](/blog/2014/08/20/iglu-server-0.2.0-released/#auth)) and you have a JSON schema defined as follows:

{% highlight json %}
{
  "$schema": "http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#",
  "description": "Schema for an ad click event",
  "self": {
    "vendor": "com.snowplow.snplw",
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
a POST request following this URL pattern:

```
HOST/api/schemas/vendor/name/format/version
```

You have three options to pass the schema you want to add:

* through the request body
* through a form entry named `schema`
* through a query parameter named `schema`

Additionally, you can add an `isPublic` parameter which takes on the value
`true` or `false` depending on whether or not you want to make your schema
available to others (it defaults to `false` if not specified).

With our example, if we wanted to keep our schema private and pass the schema
through the request body, it would be:

{% highlight bash %}
curl \
  HOST/api/schemas/com.snowplow.snplw/ad_click/jsonschema/1-0-0 \
  -X POST \
  -H "api_key: your_api_key" \
  -d "{ \"your\": \"json\" }"
{% endhighlight %}

Or, if we wanted to make our schema public and pass the schema through a query
parameter:

{% highlight bash %}
curl \
  HOST/api/schemas/com.snowplow.snplw/ad_click/jsonschema/1-0-0 \
  -X POST \
  -H "api_key: your_api_key" \
  --data-urlencode "schema={ \"your\": \"json\" }" \
  -d "isPublic=true"
{% endhighlight %}

Once the request is processed, you should receive a JSON response like this one:

{% highlight json %}
{
  "status": 201,
  "message": "Schema successfully added",
  "location": "/api/schemas/com.snowplow.snplw/ad_click/jsonschema/1-0-0"
}
{% endhighlight %}

<h3><a name="put">1.2 PUT requests</a></h3>

Let us say you have made a mistake in your initial schema which you would like
to correct. You can make a PUT request in order to correct it following this URL
pattern:

```
HOST/api/schemas/vendor/name/format/version
```

You can pass the new schema as you would for a POST request (body request, query
parameter or form data). You can also specify an `isPublic` parameter if you
would like to change the visibility of your schema (going from a private schema
to a public one and conversely).

As an example:

{% highlight bash %}
curl \
  HOST/api/schemas/com.snowplow.snplw/ad_click/jsonschema/1-0-0 \
  -X PUT \
  -H "api_key: your_api_key" \
  -d "{ \"your\": \"new json\" }"
{% endhighlight %}

You can also create a schema through a PUT request if it doesn't already exist.

<h3><a name="get">1.3 Single GET requests</a></h3>

As soon as your schema is added to the repository you can retrieve it by making
a GET request:

{% highlight bash %}
curl \
  HOST/api/schemas/com.snowplow.snplw/ad_click/jsonschema/1-0-0 \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

The JSON response should look like this:

{% highlight json %}
{
  "schema": {
    "$schema": "http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#",
    "description": "Schema for an ad click event",
    "self": {
      "vendor": "com.snowplow.snplw",
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
  "metadata": {
    "location": "/api/schemas/com.snowplow.snplw/ad_click/jsonschema/1-0-0",
    "createdAt": "08/19/2014 12:51:15",
    "permissions": {
      "read": "private",
      "write": "private"
    }
  }
}
{% endhighlight %}

As you might have noticed, some metadata comes along with the schema. One
important thing to note is the `permissions` object which contains the
read/write authorizations of this specific schema. In particular, the `read`
field contains the value `public` if your schema is public or `private` if your
schema is private. The `write` field contains `private` if you have write access
for this schema or `none` if you do not based on your API key's permission.

If you do not need the schema itself and just want to retrieve metadata about it
you can do so by sending a GET request to:

```
HOST/schemas/vendor/name/format/version?filter=metadata
```

Like this one:

{% highlight bash %}
curl \
  HOST/api/schemas/com.snowplow.snplw/ad_click/jsonschema/1-0-0 \
  -X GET \
  -H "api_key: your_api_key" \
  -d "filter=metadata"
{% endhighlight %}

To get back:

{% highlight json %}
{
  "vendor": "com.snowplow.snplw",
  "name": "ad_click",
  "format": "jsonschema",
  "version": "1-0-0",
  "metadata": {
    "location": "/api/schemas/com.snowplow.snplw/ad_click/jsonschema/1-0-0",
    "createdAt": "08/19/2014 12:51:15",
    "permissions": {
      "read": "private",
      "write": "private"
    }
  }
}
{% endhighlight %}

<h3><a name="gets">1.4 Multiple GET requests</a></h3>

If you need to retrieve multiple schemas in one single GET request you can do
so in a few different ways:

<h4>Vendor-based requests</h4>

You can retrieve every schema belonging to a vendor (if you own it):

```
HOST/api/schemas/vendor
```

{% highlight bash %}
curl \
  HOST/api/schemas/com.snowplow.snplw \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

You will get back an array of every schema belonging to this vendor.

You can also retrieve every schema of multiple vendors using a comma-separated
list of vendor:

```
HOST/api/schemas/vendor1,vendor2
```

{% highlight bash %}
curl \
  HOST/api/schemas/com.snowplow.snplw,com.snowplow.iglu
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

As you might have assumed you will get back an array of every schema belonging
to `com.snowplow.snplw` or `com.snowplow.iglu`.

One important thing to note is that if you do not own those vendors, you will
still be able to make those kinds of request but you will only retrieve public
schemas if any.

<h4>Name-based requests</h4>

With the same principle you will be able to get every version of every format
of a schema:

```
HOST/api/schemas/vendor/name
```

{% highlight bash %}
curl \
  HOST/api/schemas/com.snowplow.snplw/ad_click
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

Same goes for multiple names:

```
HOST/api/scemas/vendor/name1,name2
```

{% highlight bash %}
curl \
  HOST/api/schemas/com.snowplow.snplw/ad_click,link_click
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

<h4>Format-based requests</h4>

The same concept applies when you want to retrieve every version of a schema:

```
HOST/api/schemas/vendor/name/format
```

{% highlight bash %}
curl \
  HOST/api/schemas/com.snowplow.snplw/ad_click/jsonschema \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

And if you want to retrieve every version of a schema in multiple formats:

```
HOST/api/schemas/vendor/name/format1,format2
```

{% highlight bash %}
curl \
  HOST/api/schemas/com.snowplow.snplw/ad_click/jsonschema,jsontable \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

<h4>Version-based requests</h4>

If you need to retrieve a specific version of a schema we fall back to the case
of single GET requests which we already covered, but you can also retrieve
multiple versions:

```
HOST/api/schemas/vendor/name/format/version1,version2
```

{% highlight bash %}
curl \
  HOST/api/schemas/com.snowplow.snplw/ad_click/jsonschema/1-0-0,1-0-1 \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

<h4>Combinations</h4>

You can also combine those URLs to satisfy your needs, I will give a few
examples here:

If you want to retrieve two specific versions of two differents schemas:

{% highlight bash %}
curl \
  HOST/api/schemas/com.snowplow.snplw/ad_click,link_click/jsonschema/1-0-0,1-0-1 \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

If you want to retrieve a specific version of a specific schema in two different
formats:

{% highlight bash %}
curl \
  HOST/api/schemas/com.snowplow.snplw/ad_click/jsonschema,jsontable/1-0-0 \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

Or, let us say you want to compare your schema with a company which has made
theirs public:

{% highlight bash %}
curl \
  HOST/api/schemas/com.snowplow.snplw,some.other.cmpny/ad_click/jsonschema/1-0-0 \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

<h4>Multiple single schema retrieval (name to review)</h4>

You can retrieve multiple single schemas like so:

```
HOST/api/schemas/vendor1/name1/format1/version1,vendor2/name2/format2/version2
```

{% highlight bash %}
curl \
  HOST/api/schemas/com.snowplow.snplw/ad_click/jsonschema/1-0-0,some.other.cmpny/ad_click/jsonschema/1-0-0 \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

<h4>Public schemas</h4>

You can also retrieve a list of every single public schema thanks to this
endpoint:

```
HOST/api/schemas/public
```

{% highlight bash %}
curl \
  HOST/api/schemas/public \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

<h4>Metadata filter</h4>

You can add a `filter=metadata` query parameter to any of the previous types of
URLs if you do not need the whole schemas.

<h3><a name="swagger">1.5 Swagger support</a></h3>

We added [Swagger](https://helloreverb.com/developers/swagger) support to our
API so you don't have to keep coming back to the wiki or this blog post for a
full API reference and so you can try out things your way.

The Swagger UI is available at the root URL (sentence to review):

![iglu-swagger-img] [iglu-swagger-img]

As mentioned, you will have to enter your API key in the form on the top right
of the page. Once this is done, you are free to explore the API using the
Swagger UI.

<h2><a name="valid">3. Schema validation and the validation service</a></h2>

<h3><a name="schemavalid">3.1 Schema validation when adding a schema</a></h3>

One thing you might have caught on is that every schema you add to the
repository must be self-describing (I invite you to read
[the post on self-describing JSON Schemas](/blog/2014/05/15/introducing-self-describing-jsons/) if you are
not familiar with the notion). It basically means that your schema must have a
`self` property containing itself the following properties: `vendor`, `name`,
`format`, `version`.

If your schema is not self-describing you will get back this JSON response when
trying to add it to the repository:

{% highlight json %}
{
  "status": 400,
  "message": "The schema provided is not a valid self-describing schema",
  "report": {}
}
{% endhighlight %}

The `report` object will contain the full validation failure message for you to
analyze.

<h3><a name="validservice">3.2 The validation service</a></h3>

In addition to validating that a schema is self-describing when adding it to
the repository, we set up a validation service which lets you validate that a
schema is self-describing without adding it to the repository and also validate
an instance against its schema.

For example, if you want to make sure your schema will pass validation before
adding it to the repository:

```
HOST/api/schemas/validate/format?schema={ "some": "schema" }
```

{% highlight bash %}
curl \
  HOST/api/schemas/validate/jsonschema \
  -X GET
  -H "api_key: your_api_key"
  --data-urlencode "schema={ \"schema\": \"to be validated\" }"
{% endhighlight %}

The `schema` query parameter containing the schema you want to validate.

For now, only the `jsonschema` format is supported, but more should be supported
in the future.

Similarly to a POST request, if the validation fails you will receive the
following response:

{% highlight json %}
{
  "status": 400,
  "message": "The schema provided is not a valid self-describing schema",
  "report": {}
{% endhighlight %}

With the report object containing the full validation failure message.

If the validation succeeds, you should get back something like:

{% highlight json %}
{
  "status": 200,
  "message": "The schema provided is a valid self-describing schema"
}
{% endhighlight %}

You can also validate an instance against its schema:

```
HOST/api/schemas/validate/vendor/name/format/version?instance={ "some": "instance" }
```

{% highlight bash %}
curl \
  HOST/api/schemas/validate/com.snowplow.snplw/ad_click/jsonschema/1-0-0 \
  -X GET \
  -H "api_key: your_api_key" \
  --data-urlencode "instance={ \"instance\": \"to be validated\" }"
{% endhighlight %}

As you might have guessed the path indicates the schema to validate against and
the `instance` query parameter the instance to be validated.

Similarly to validating a schema, you will receive the following JSON if the
instance is not valid against the schema:

{% highlight json %}
{
  "status": 400,
  "message": "The instance provided is not valid against the schema",
  "report": {}
{% endhighlight %}

The validation service is also accessible through the Swagger UI.

<h2><a name="auth">4. API authentication</a></h2>

To restrain access to schemas, we have set up an API key based authentication
system. Concretely, you will be given a pair of API keys (one with read access
and one with read and write access) per organization. This API key will have to
be provided with each request through an `api_key` HTTP header as shown in the
previous examples.

For example, let us say your organization is Snowplow Analytics Ltd, you will
be given a pair of keys for the `com.snowplowanalytics` prefix and will
consequently have access to every schema, the vendor of which starts with
`com.snowplowanalytics` (the `com.snowplowanalytics.snowplow` vendor for
example).

<h2><a name="diy">5. Running your own server</a></h2>

If you feel your schemas are sensitive intellectual property, you can run
your own server. Doing so requires a few steps which will be detailed here.

<h3><a name="config">5.1 Modifying the configuration file.</a></h3>

In order to get the server running you will need a PostgreSQL instance, the
connection details of which can be filled in in the [application.conf file](https://github.com/snowplow/iglu/blob/master/2-repositories/scala-repo-server/src/main/resources/application.conf).
In particular, you will need to modify the `host`, `port`, `dbname`, `username`
and `password` fields.

<h3><a name="super">5.2 The super API key</a></h3>

Once your `application.conf` file is filled in  properly you can launch the
server and the necessary tables (`apikeys` and `schemas`) will be created
automatically.

One thing you will need to do is add a `super` API key manually to the database.
This API key will be used to generate your clients' API keys.

{% highlight sql %}
insert into apikeys (uid, vendor, permission, createdat)
values ('an-uuid', 'a.vendor', 'super', current_timestamp);
{% endhighlight %}

<h3><a name="keygen">5.3 The API key generation service</a></h3>

Once your super API key has been created, you will be able to use it to generate
api keys for your clients through the API key generation service.

This service is as simple to use as the schema service and validation service.

To generate a read and write pair of keys for a specific vendor prefix/owner
simply send a POST request with this URL using your super API key in an
`api_key` HTTP header:

```
HOST/api/auth/keygen
```

As with the schema service, you have the choice of how you want to pass the new
API keys' owner :

* through the request body
* through a form entry named `owner`
* through a query parameter named `owner`

For example, through a query parameter:

{% highlight bash %}
curl \
  HOST/api/auth/keygen \
  -X POST \
  -H "api_key: your_super_api_key" \
  -d "owner=com.snowplow"
{% endhighlight %}

You should receive a JSON response like this one:

{% highlight json %}
{
    "read": "an-uuid",
    "write": "another-uuid"
}
{% endhighlight %}

If you want to revoke a specific API key, send a DELETE request like so:

```
HOST/api/auth/keygen?key=some-uuid
```

{% highlight bash %}
curl \
  HOST/api/auth/keygen \
  -X DELETE \
  -H "api_key: your_super_api_key" \
  -d "key=some-uuid"
{% endhighlight %}

You can also delete every API key linked to a specific owner by sending a
DELETE request:

```
HOST/api/auth/keygen?owner=the.owner.in.question
```

{% highligh bash %}
curl \
  HOST/api/auth/keygen \
  -X DELETE \
  -H "api_key: your_super_api_key" \
  -d "owner=some.owner"
{% endhighlight %}

<h2><a name="support">6. Support</a></h2>

If there is a feature you would like to see implemented or if you encounter a
bug please raise an issue on [the github project page](https://github.com/snowplow/iglu).

[iglu-swagger-img]: /assets/img/blog/2014/08/iglu-swagger.png
