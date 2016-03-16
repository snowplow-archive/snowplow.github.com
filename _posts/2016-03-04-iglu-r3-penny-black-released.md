---
layout: post
title: Iglu JSON Schema Registry 3 Penny Black released
title-short: Iglu 3 Penny Black
tags: [snowplow, iglu, schema, validation, json]
author: Fred
category: Releases
---

We are excited to announce the immediate availability of a new version of [Iglu] [iglu], incorporating a release of the Swagger-powered Scala Repo Server. Iglu has existed as a project at Snowplow for over two years now: after a period of relative quiet, we have an ambitious release schedule for Iglu planned for 2016, starting with this release.

To reflect the growing importance of Iglu, and the number of moving parts within the platform, we will be following the Snowplow naming system for Iglu, with a release number plus a codename. The individual components of Iglu (such as Iglu clients and servers) will continue to use semantic versioning.

This is release 3; the codenames for Iglu will be famous postage stamps, starting today with the [Penny Black][penny-black]. Read on for more information on Release 3 Penny Black.

1. [Overview](/blog/2016/03/04/iglu-r3-penny-black-released#overview)
2. [Elastic Beanstalk deployment](/blog/2016/03/04/iglu-r3-penny-black-released#beanstalk)
3. [Using the Scala Repo Server](/blog/2016/03/04/iglu-r3-penny-black-released#usage)
3. [Vagrant quickstart](/blog/2016/03/04/iglu-r3-penny-black-released#vagrant)
4. [The future](/blog/2016/03/04/iglu-r3-penny-black-released#future)
5. [Getting help](/blog/2016/03/04/iglu-r3-penny-black-released#help)

![penny-black][penny-black-img]

<!--more-->

<h2 id="overview">1. Overview</h2>

[Scala Repo Server] [iglu-scala] is a more powerful alternative to our static schema repository, and its API is a superset of that repository's API. At the moment it offers the following additional features:

* **Authentication:** in the static repo, anybody can view all schemas. Scala Repo Server supports both public documents and private documents which require a key to access. Multiple users with separate keys can use the same Scala Repo Server instance. Support for authenticated Iglu repos will be coming to Snowplow soon
* **Schema validation:** in this server, attempts to upload an invalid schema will be rejected. This is in contrast with the static schema repository, which can hold invalid schemas, leading to errors at schema retrieval time

**Please be aware that the Scala Repo Server remains in "beta" - we continue to recommend using S3-based static schema repositories for Iglu in conjunction for all production use cases, including with Snowplow; there are no plans to move Iglu Central over to the Scala Repo Server at this time.**

<h2 id="beanstalk">2. Elastic Beanstalk deployment</h2>

Scala Repo Server can now run on AWS Elastic Beanstalk!

Elastic Beanstalk will automatically configure and manage the EC2 instances needed to run the app. Instructions are available on the [Setting up Iglu Server on AWS][beanstalksetup] wiki page.

<h2 id="usage">3. Using the Scala Repo Server</h2>

Once we have a Scala Repo Server up-and-running, we can start to interact with it. If you browse to the HTTP root (`/`) of your Scala Repo Server's API, you will see auto-generated [Swagger] [swagger] documentation on all of the available API endpoints.

To start with, we need to create a user who can create schemas for a new vendor prefix:

{% highlight bash %}
$ curl -X POST "${iglu_repo_uri}/api/auth/keygen?vendor_prefix=com.example_company" -H "apikey: ${apikey}"
{
  "read" : "223812b2-4c12-4d92-ac31-0b9f84628f1a",
  "write" : "202ea1eb-7b12-4e0e-ae99-2a0d672feb1b"
}
{% endhighlight %}

Now let's grab a schema that we have available and `POST` it to Iglu:

{% highlight bash %}
$ wget https://raw.githubusercontent.com/snowplow/example-event-dictionary/master/schemas/com.example_company/example_event/jsonschema/1-0-0
$ curl -X POST -d @1-0-0 "${iglu_repo_uri}/api/schemas/com.example_company/example_event/jsonschema/1-0-0?isPublic=true" -H "apikey: 202ea1eb-7b12-4e0e-ae99-2a0d672feb1b"
{
  "status" : 201,
  "message" : "Schema successfully added",
  "location" : "/api/schemas/com.example_company/example_event/jsonschema/1-0-0"
}
{% endhighlight %}

It's important to note:

* All API operations should be addressed to the `/api` path
* The `isPublic=true` flag ensures that our schema is publically visible - particularly important as Snowplow does not support authenticated repositories yet

The Scala Repo Server should now contain two public JSON Schemas - let's check:

{% highlight bash %}
$ curl -X GET "${iglu_repo_uri}/api/schemas/public"
[ {
  "$schema" : "http://json-schema.org/draft-04/schema#",
  "description" : "Meta-schema for self-describing JSON schema",
...
, {
  "$schema" : "http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#",
  "description" : "Schema for an example event",
...
} ]
{% endhighlight %}

Good! We can see both of our schemas are now available.

This has been a whirlwind tour through the new capabilities of the Scala Repo Server. I'd recommend setting up an instance, consulting the Swagger documentation at root (`/`) and trying out some other commands.

<h2 id="vagrant">4. Vagrant quickstart</h2>

We have added a Vagrant quickstart to the project. If you have [VirtualBox][vbox] and [Vagrant][vagrant] installed, you can now easily set up development environment for Iglu Server:

{% highlight bash %}
git clone git@github.com:snowplow/iglu.git
cd iglu
vagrant up
vagrant ssh
cd /vagrant/2-repositories/scala-repo-server
./create-test-user.sh
sbt test
{% endhighlight %}

<h2 id="future">5. The future</h2>

We are making it increasingly easy to work with schemas in Snowplow and Iglu. Originally it was necessary to manually write three files:

* The JSON Schema, defining what the event should look like. This is uploaded to an Iglu repo
* The JSON Paths file, used to load JSONs conforming to the schema into Redshift. This is uploaded to S3 and used by Snowplow's StorageLoader component
* The Redshift table definition DDL, used to create the table into which these JSONs are loaded. This table definition is manually deployed into the Redshift database

Then we started to simplify this process with [Schema Guru][schemaguru]:

* `schema-guru schema` can generate a JSON schema from a corpus of JSONs
* `schema-guru ddl` can automatically generate the JSON Paths file and Redshift DDL for a given schema

Future Iglu releases will make the process still easier. Scala Repo Server will be able to automatically generate the JSON Paths and Redshift DDL files when a schema is uploaded; these files will be served by Scala Repo Server, so it will no longer be necessary to host them in GitHub and/or S3 separately.

**A word of warning: the Iglu Server API is still evolving, so future releases are unlikely to be backward compatible with this one. Please continue to use a static repo for all production use cases, such as with Snowplow.**

<h2 id="help">6. Getting help</h2>

Information on setting up the Scala Repo Server is available on the [wiki][configuration].

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[penny-black-img]: /assets/img/blog/2016/02/penny-black.jpg
[penny-black]: https://en.wikipedia.org/wiki/Penny_Black

[swagger]: http://swagger.io/

[iglu]: https://github.com/snowplow/iglu
[iglu-scala]: https://github.com/snowplow/iglu/tree/master/2-repositories/scala-repo-server

[beanstalk]: https://aws.amazon.com/documentation/elastic-beanstalk/
[beanstalksetup]: https://github.com/snowplow/iglu/wiki/Setting-up-Iglu-Server-on-AWS
[schemaguru]: https://github.com/snowplow/schema-guru
[schemaddl]: https://github.com/snowplow/schema-ddl
[configuration]: https://github.com/snowplow/iglu/wiki/Configure-the-Scala-repository-server

[vagrant]: https://www.vagrantup.com/
[vbox]: https://www.virtualbox.org/

[issues]: https://github.com/snowplow/snowplow/iglu
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
