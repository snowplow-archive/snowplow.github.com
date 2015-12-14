---
layout: post
title: Iglu release 2 with a new RESTful schema server
tags: [iglu, scala, server, api, restful]
author: Ben
category: Releases
---

We are pleased to announce the second release of Iglu, our machine-readable
schema repository system for JSON Schema. If you are not familiar with what Iglu is,
please read [the blog post for the initial release of Iglu](/blog/2014/07/01/iglu-schema-repository-released/).

Iglu release 2 introduces a new Scala-based repository server, allowing users to publish, test and serve schemas via an easy-to-use RESTful interface. This is a huge step forward compared to our current approach, which involves uploading schemas to a static website on Amazon S3. The new Scala repository server is version 0.1.0.

In this post, we will cover the following aspects of the new repository server:

1. [The schema service](/blog/2014/08/28/iglu-release-2-with-restful-schema-server/#schema)
    1. [POST requests](/blog/2014/08/28/iglu-release-2-with-restful-schema-server/#post)
    2. [PUT requests](/blog/2014/08/28/iglu-release-2-with-restful-schema-server/#put)
    3. [Single GET requests](/blog/2014/08/28/iglu-release-2-with-restful-schema-server/#get)
    4. [Multiple GET requests](/blog/2014/08/28/iglu-release-2-with-restful-schema-server/#gets)
    5. [Swagger support](/blog/2014/08/28/iglu-release-2-with-restful-schema-server/#swagger)
2. [Schema validation and the validation service](/blog/2014/08/28/iglu-release-2-with-restful-schema-server/#valid)
    1. [Schema validation when adding a schema](/blog/2014/08/28/iglu-release-2-with-restful-schema-server/#schemavalid)
    2. [The validation service](/blog/2014/08/28/iglu-release-2-with-restful-schema-server/#validservice)
3. [Api authentication](/blog/2014/08/28/iglu-release-2-with-restful-schema-server/#auth)
4. [Running your own server](/blog/2014/08/28/iglu-release-2-with-restful-schema-server/#diy)
    1. [Installing the executable jarfile](/blog/2014/08/28/iglu-release-2-with-restful-schema-server/#install)
    2. [Configuring the server](/blog/2014/08/28/iglu-release-2-with-restful-schema-server/#config)
    3. [Launching the server](/blog/2014/08/28/iglu-release-2-with-restful-schema-server/#launch)
    4. [The super API key](/blog/2014/08/28/iglu-release-2-with-restful-schema-server/#super)
    5. [The API key generation service](/blog/2014/08/28/iglu-release-2-with-restful-schema-server/#keygen)
5. [Documentation and support](/blog/2014/08/28/iglu-release-2-with-restful-schema-server/#support)

<!--more-->

<h2><a name="schema">1. The schema service</a></h2>

Our new Scala repository server takes the form of a RESTful API containing
various services, the most important of which is the **schema service**. It
lets you interact with schemas via simple HTTP requests.

<h3><a name="post">1.1 POST requests</a></h3>

Use a `POST` request to the schema service to publish new schemas to your repository.

For example, let's say you own the `com.acme` prefix (the details
regarding owning a vendor prefix will be covered in the [API authentication section](/blog/2014/08/28/iglu-release-2-with-restful-schema-server/#auth)) and you have a JSON schema defined as follows:

{% highlight json %}
{
  "$schema": "http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#",
  "description": "Schema for an Acme Inc ad click event",
  "self": {
    "vendor": "com.acme",
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
a `POST` request following this URL pattern:

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
  HOST/api/schemas/com.acme/ad_click/jsonschema/1-0-0 \
  -X POST \
  -H "api_key: your_api_key" \
  -d "{ \"your\": \"json\" }"
{% endhighlight %}

Or, if we wanted to make our schema public and pass the schema through a query
parameter:

{% highlight bash %}
curl \
  HOST/api/schemas/com.acme/ad_click/jsonschema/1-0-0 \
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
  "location": "/api/schemas/com.acme/ad_click/jsonschema/1-0-0"
}
{% endhighlight %}

<h3><a name="put">1.2 PUT requests</a></h3>

Let's say you have made a mistake in your initial schema which you would like
to correct. You can make a `PUT` request in order to correct it following this URL
pattern:

```
HOST/api/schemas/vendor/name/format/version
```

You can pass the new schema as you would for a `POST` request (body request, query
parameter or form data). You can also specify an `isPublic` parameter if you
would like to change the visibility of your schema (going from a private schema
to a public one and conversely).

As an example:

{% highlight bash %}
curl \
  HOST/api/schemas/com.acme/ad_click/jsonschema/1-0-0 \
  -X PUT \
  -H "api_key: your_api_key" \
  -d "{ \"your\": \"new json\" }"
{% endhighlight %}

You can also *create* a schema through a `PUT` request if it doesn't already exist.

<h3><a name="get">1.3 Single GET requests</a></h3>

As soon as your schema is added to the repository you can retrieve it by making
a `GET` request:

{% highlight bash %}
curl \
  HOST/api/schemas/com.acme/ad_click/jsonschema/1-0-0 \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

The JSON response should look like this:

{% highlight json %}
{
  "$schema": "http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#",
  "description": "Schema for an Acme Inc ad click event",
  "self": {
    "vendor": "com.acme",
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
  "additionalProperties": false,
  "metadata": {
    "location": "/api/schemas/com.snowplowanalytics.snplw/ad_click/jsonschema/1-0-0",
    "createdAt": "08/19/2014 12:51:15",
    "updatedAt": "08/22/2014 17:22:02",
    "permissions": {
      "read": "private",
      "write": "private"
    }
  }
}
{% endhighlight %}

As you might have noticed, some metadata from the repository server is inserted into the schema. One
important thing to note is the `permissions` object which contains the
read/write authorizations of this specific schema. In particular, the `read`
field contains the value `public` if your schema is public or `private` if your
schema is private. The `write` field contains `private` if you have write access
for this schema or `none` if you do not, all according to your API key's permission.

If you do not need to retrieve the schema itself and just want to check its metadata,
you can send a `GET` request to:

```
HOST/schemas/vendor/name/format/version?filter=metadata
```

Like this one:

{% highlight bash %}
curl \
  HOST/api/schemas/com.acme/ad_click/jsonschema/1-0-0 \
  -X GET \
  -H "api_key: your_api_key" \
  -d "filter=metadata"
{% endhighlight %}

To get back:

{% highlight json %}
{
  "vendor": "com.acme",
  "name": "ad_click",
  "format": "jsonschema",
  "version": "1-0-0",
  "metadata": {
    "location": "/api/schemas/com.acme/ad_click/jsonschema/1-0-0",
    "createdAt": "08/19/2014 12:51:15",
    "updatedAt": "08/22/2014 17:22:02",
    "permissions": {
      "read": "private",
      "write": "private"
    }
  }
}
{% endhighlight %}

<h3><a name="gets">1.4 Multiple GET requests</a></h3>

If you need to retrieve multiple schemas in one single `GET` request you can do
so in a few different ways:

<h4>Vendor-based requests</h4>

You can retrieve every schema belonging to a vendor (if you own it):

```
HOST/api/schemas/vendor
```

{% highlight bash %}
curl \
  HOST/api/schemas/com.acme \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

You will get back an array of every schema belonging to this vendor.

You can also retrieve every schema from multiple vendors using a comma-separated
list of vendors:

```
HOST/api/schemas/vendor1,vendor2
```

{% highlight bash %}
curl \
  HOST/api/schemas/com.acme,uk.co.acme \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

As you might have assumed you will get back an array of every schema belonging
to `com.acme` or `co.uk.acme`.

**Please note:** if you do not own those vendors, you will
still be able to make these requests but you will only retrieve public
schemas (if any).

<h4>Name-based requests</h4>

Using the same approach, you can get every version of every format
of a schema:

```
HOST/api/schemas/vendor/name
```

{% highlight bash %}
curl \
  HOST/api/schemas/com.acme/ad_click \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

Or try every version of every format of multiple schemas:

```
HOST/api/schemas/vendor/name1,name2
```

{% highlight bash %}
curl \
  HOST/api/schemas/com.acme/ad_click,ad_impression,ad_conversion \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

<h4>Format-based requests</h4>

The same concept applies when you want to retrieve every version of a schema in a given format (e.g. JSON Schema):

```
HOST/api/schemas/vendor/name/format
```

{% highlight bash %}
curl \
  HOST/api/schemas/com.acme/ad_click/jsonschema \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

And if you want to retrieve every version of a schema in multiple formats:

```
HOST/api/schemas/vendor/name/format1,format2
```

{% highlight bash %}
curl \
  HOST/api/schemas/com.acme/ad_click/jsonschema,jsontable \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

<h4>Version-based requests</h4>

If you need to retrieve a specific version of a schema we fall back to the case
of single `GET` requests which we already covered, but you can also retrieve
multiple versions:

```
HOST/api/schemas/vendor/name/format/version1,version2
```

{% highlight bash %}
curl \
  HOST/api/schemas/com.acme/ad_click/jsonschema/1-0-0,1-0-1 \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

<h4>Combinations</h4>

You can also combine those URLs to satisfy your needs. I will give a few
examples in this section.

If you want to retrieve two specific versions of two differents schemas:

{% highlight bash %}
curl \
  HOST/api/schemas/com.acme/ad_click,link_click/jsonschema/1-0-0,1-0-1 \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

If you want to retrieve a specific version of a specific schema in two different
formats:

{% highlight bash %}
curl \
  HOST/api/schemas/com.acme/ad_click/jsonschema,jsontable/1-0-0 \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

Or let's say you want to compare your schema with a company which has made
their schema public:

{% highlight bash %}
curl \
  HOST/api/schemas/com.snowplow.snowplowanalytics,com.acme/ad_click/jsonschema/1-0-0 \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

<h4>Retrieving multiple disjoint schemas</h4>

You can retrieve multiple schemas which are completely independent of each other like so:

```
HOST/api/schemas/vendor1/name1/format1/version1,vendor2/name2/format2/version2
```

{% highlight bash %}
curl \
  HOST/api/schemas/com.snowplowanalytics.snowplow/ad_click/jsonschema/1-0-0,com.acme/ad_click/jsonschema/1-0-0 \
  -X GET \
  -H "api_key: your_api_key"
{% endhighlight %}

<h4>Public schemas</h4>

You can also retrieve a list of every single public schema with this endpoint:

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

We have added [Swagger](https://helloreverb.com/developers/swagger) support to our
API so you can explore the repository server's API interactively.

The Swagger UI is available at the root URL of your repository server and looks like this:

![iglu-swagger-img] [iglu-swagger-img]

You will have to enter your API key in the form on the top right
of the page. Once this is done, you are free to explore the API using the
Swagger UI.

<h2><a name="valid">2. Schema validation and the validation service</a></h2>

<h3><a name="schemavalid">2.1 Schema validation when adding a schema</a></h3>

One thing you may have noticed is that every schema you add to the
repository must be self-describing (please read
[the post on self-describing JSON Schemas](/blog/2014/05/15/introducing-self-describing-jsons/) if you are
not familiar with the concept). It essentially means that your schema must have a
`self` property containing itself the following properties: `vendor`, `name`,
`format`, `version`.

If your schema is not self-describing you will get back this JSON response when
trying to add it to the repository:

{% highlight json %}
{
  "status": 400,
  "message": "The schema provided is not a valid self-describing schema",
  "report": { ... }
}
{% endhighlight %}

The `report` object will contain the full validation failure message for you to
analyze.

<h3><a name="validservice">2.2 The validation service</a></h3>

As well as validating that a schema is self-describing when adding it to
the repository, we also provide up a validation service which lets you:

1. Validate that a schema is valid without adding it to the repository
2. Validate an instance against its schema

For example, if you want to make sure that your schema is a valid self-describing JSON Schema before
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

For now, only the `jsonschema` format is supported, but additional schema formats such as JSON Table and Avro will be supported
in the future.

Similarly to a `POST` request, if the validation fails you will receive the
following response:

{% highlight json %}
{
  "status": 400,
  "message": "The schema provided is not a valid self-describing schema",
  "report": { ... }
}
{% endhighlight %}

With the `report` object containing the full validation failure message.

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
  HOST/api/schemas/validate/com.acme/ad_click/jsonschema/1-0-0 \
  -X GET \
  -H "api_key: your_api_key" \
  --data-urlencode "instance={ \"instance\": \"to be validated\" }"
{% endhighlight %}

Here, the path indicates the schema to validate against and
the `instance` query parameter the instance to be validated.

Similarly to validating a schema, you will receive the following JSON if the
instance is not valid against the schema:

{% highlight json %}
{
  "status": 400,
  "message": "The instance provided is not valid against the schema",
  "report": { ... }
}
{% endhighlight %}

The validation service is also accessible through the Swagger UI.

<h2><a name="auth">3. API authentication</a></h2>

To restrict access to schemas, we have implemented an API key-based
authentication system. The administrator of your Iglu repository server can
generate a pair of API keys (one with read access and one with read-and-write
access) for any given vendor prefix. Users of the repository server will need
to provide this API key with each request through an `api_key` HTTP header as
shown in the previous examples.

For example, let's say you work for Acme Inc, and so the administrator of the
Iglu repository you are using gives you a pair of keys for the `com.acme` vendor
prefix.

One of these API keys will have read access and consequently will let you
retrieve schemas through `GET` requests. The other will have both read and write
access so you will be able to publish and modify schemas through `POST` and
`PUT` requests in addition to being able to retrieve them. It is then up to
you on to distribute those two keys however you want. Those keys grants you access to every schema whose vendor starts with
`com.acme`.

As a concrete example, let's say you request API keys from your
administrator and she sends you get back this pair of API keys:

* `663ee2a1-98a2-4a85-a05b-20f343e4961d` for read access
* `86da37e8-fdac-406a-8c71-3ae964e75882` for both read and write access

Using the second API key you will be able to create schemas, as long as the vendor
starts with `com.acme`:

{% highlight bash %}
curl \
  HOST/api/schemas/com.acme.project1/ad_click/jsonschema/1-0-0 \
  -X POST \
  -H "api_key: 86da37e8-fdac-406a-8c71-3ae964e75882" \
  -d "{ \"your\": \"json\" }"
{% endhighlight %}

And you will be able to retrieve this schema with either one of those API keys:

{% highlight bash %}
curl \
  HOST/api/schemas/com.acme.project1/ad_click/jsonschema/1-0-0 \
  -X GET \
  -H "api_key: 663ee2a1-98a2-4a85-a05b-20f343e4961d"
{% endhighlight %}

<h2><a name="diy">4. Running your own server</a></h2>

Running your own Iglu repository server lets you publish, test and serve schemas in support of applications like Snowplow and others.
Running your own repository server requires a few steps which will be detailed here.

<h3><a name="install">4.1 Installing the executable jarfile</a></h3>

You have two options to get the jarfile:

<h4>1. Download the server jarfile directly</h4>

To get a pre-built copy, you can download the jarfile from [Iglu Hosted Assets] [iglu-hosted-assets], or directly by right-clicking on [this link] [jar-download] and selecting "Save As..."

<h4>2. Compile it from source</h4>

Alternatively, you can compile it yourself by cloning the Iglu repo:

{% highlight bash %}
git clone https://github.com/snowplow/iglu.git
{% endhighlight %}

Navigating to the Scala repository server folder:

{% highlight bash %}
cd 2-repositories/scala-repo-server/
{% endhighlight %}

And finally, building the jarfile with SBT:

{% highlight bash %}
sbt assembly
{% endhighlight %}

The jarfile will be saved as `iglu-server-0.1.0` in the `target/scala.2.10` subdirectory.

<h3><a name="config">4.2 Configuring the server</a></h3>

To configure your server you will have to download a copy of our sample
[application.conf file](https://github.com/snowplow/iglu/blob/master/2-repositories/scala-repo-server/src/main/resources/application.conf)
and fill in the appropriate values.

The Scala repository server uses PostgreSQL to store all schemas and related data. Assuming that you already have a PostgreSQL instance available, modify your `application.conf` file with your PostgreSQL connection details:

* `postgres.host`
* `postgres.port`,
* `postgres.dbname`
* `postgrs.username`
* `postgres.password`

You can also modify the HTTP server settings `repo-server.interface` and
`repo-server.port` to fit your needs.

<h3><a name="launch">4.3 Launching the server</a></h3>

Once your `application.conf` file is filled in properly, you can launch the
server and the necessary tables (`apikeys` and `schemas`) will be created
automatically:

{% highlight bash %}
java \
  -Dconfig.file=/path/to/your/application.conf \
  -jar iglu-server-0.1.0 com.snowplowanalytics.iglu.server.Boot
{% endhighlight %}

<h3><a name="super">4.4 The super API key</a></h3>

Once the server is launched, you will still need to add a `super` API key
manually to the database. This API key will be used to generate your clients'
API keys.

{% highlight sql %}
insert into apikeys (uid, vendor_prefix, permission, createdat)
values ('an-uuid', '.', 'super', current_timestamp);
{% endhighlight %}

<h3><a name="keygen">4.5 The API key generation service</a></h3>

Once your super API key has been created, you will be able to use it to generate
API keys for your clients through the API key generation service.

This service is as simple to use as the schema service and validation service.

To generate a read and write pair of keys for a specific vendor prefix
simply send a `POST` request with this URL using your super API key in an
`api_key` HTTP header:

```
HOST/api/auth/keygen
```

As with the schema service, you have the choice of how you want to pass the new
API keys' vendor prefix:

* through the request body
* through a form entry named `vendor_prefix`
* through a query parameter named `vendor_prefix`

For example, through a query parameter:

{% highlight bash %}
curl \
  HOST/api/auth/keygen \
  -X POST \
  -H "api_key: your_super_api_key" \
  -d "vendor_prefix=com.acme"
{% endhighlight %}

You should receive a JSON response like this one:

{% highlight json %}
{
    "read": "an-uuid",
    "write": "another-uuid"
}
{% endhighlight %}

If you want to revoke a specific API key, send a `DELETE` request like so:

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

You can also delete every API key linked to a specific vendor prefix by sending
a `DELETE` request:

```
HOST/api/auth/keygen?vendor_prefix=the.vendor.prefix.in.question
```

{% highlight bash %}
curl \
  HOST/api/auth/keygen \
  -X DELETE \
  -H "api_key: your_super_api_key" \
  -d "vendor_prefix=some.vendor.prefix"
{% endhighlight %}

The API key generation service is also accessible through the Swagger UI.

<h2><a name="support">5. Documentation and support</a></h2>

And that's it! As always, if there is a feature you would like to see implemented or if you encounter a bug, please raise an issue on [the GitHub project page](https://github.com/snowplow/iglu).

To find out more about the Scala repository server, check out the documentation here:

* [Technical documentation] [tech-docs]
* [Setup guide] [setup-guide]

And if you have more general questions about Iglu or clarifications about this release, please do get in touch with us via [the usual channels] [talk-to-us].

[iglu-hosted-assets]: https://github.com/snowplow/iglu/wiki/Hosted-assets
[jar-download]: http://d3usn368cyagrg.cloudfront.net/2-repositories/scala-repo-server/iglu-server-0.1.0

[tech-docs]: https://github.com/snowplow/iglu/wiki/Scala-repo-server
[setup-guide]: https://github.com/snowplow/iglu/wiki/Scala-repo-server-setup

[iglu-swagger-img]: /assets/img/blog/2014/08/iglu-swagger.png
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
