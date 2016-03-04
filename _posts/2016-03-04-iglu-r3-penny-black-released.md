---
layout: post
title: Iglu Server 3 Penny Black released
title-short: Iglu Server 3 Penny Black
tags: [snowplow, iglu, schema, validation, json]
author: Fred
category: Releases
---

We are happy to announce the release of a new version of Iglu Server! Read on for more information on Release 3 Penny Black.

1. [Overview](/blog/2016/xx/xx/iglu-server-r3-penny-black-released#overview)
2. [Elastic Beanstalk deployment](/blog/2016/xx/xx/iglu-server-r3-penny-black-released#beanstalk)
3. [Vagrant quickstart](/blog/2016/xx/xx/iglu-server-r3-penny-black-released#vagrant)
4. [The future](/blog/2016/xx/xx/iglu-server-r3-penny-black-released#future)
5. [Getting help](/blog/2016/xx/xx/iglu-server-r3-penny-black-released#help)

![penny-black][penny-black]

<!--more-->

<h2 id="overview">1. Overview</h2>

Iglu Server is a more powerful alternative to our static schema repository, and its API is a superset of that repository's API. At the moment it offers the following additional features:

* Authentication. In the static repo, anybody can view documents. Iglu Server supports both public documents and private documents which require a key to access. Multiple users with separate keys can use the same Iglu Server instance.
* Schema validation: attempts to upload an invalid schema will fail immediately. This is in contrast with the static server, which happily accepts invalid schemas whose shortcomings only become apparent when they are accessed.

<h2 id="beanstalk">2. Elastic Beanstalk deployment</h2>

Iglu Server can now run on AWS Elastic Beanstalk! Elastic Beanstalk will automatically configure and manage the EC2 instances needed to run the app. Instructions are available on the [Setting up Iglu Server on AWS][beanstalksetup] wiki page.

<h2 id="vagrant">3. Vagrant quickstart</h2>

We have added a Vagrant quickstart to the project. If you have [VirtualBox][vbox] and [Vagrant][vagrant] installed, you can now easily set up development environment for Iglu Server:

{% highlight bash %}
git clone git@github.com:snowplow/iglu.git
cd iglu
vagrant up
vagrant ssh
cd /vagrant/2-repositories/scala-repo-server
./create-test-user.sh
sbt test
./create-beanstalk-jar.sh
{% endhighlight %}

<h2 id="future">4. The future</h2>

We are making it increasingly easy to introduce new schemas. Originally it was necessary to manually write three files:

* the schema (defining what the event should look like). This is uploaded to an Iglu repo.
* the JSONPath file (used to load JSONs of the new type into Redshift). This is uploaded to S3 and used by the StorageLoader.
* the Redshift DDL (used to create the table into which those JSONs are loaded).

Then we started to simplify this process:

* [Schema Guru][schemaguru] can generate a JSON schema from a corpus of JSONs
* [Schema DDL][schemaddl] can automatically generate the JSONPath file and the Redshift DDL for a given schema

Future releases will make the process still easier. Iglu Server will be able to automatically generate the JSONPath and Redshift DDL files when a schema is uploaded. We will also start hosting the JSONPath files on Iglu, so it will no longer be necessary to deploy them to S3 separately.

A word of warning. The Iglu Server API is still evolving, so future releases are unlikely to be backward compatible with this one.

<h2 id="help">5. Getting help</h2>

Information on setting Iglu Server up is available on the [wiki][configuration].

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[penny-black]: /assets/img/blog/2016/01/penny-black.jpg

[beanstalk]: https://aws.amazon.com/documentation/elastic-beanstalk/
[beanstalksetup]: https://github.com/snowplow/iglu/wiki/Setting-up-Iglu-Server-on-AWS
[schemaguru]: https://github.com/snowplow/schema-guru
[schemaddl]: https://github.com/snowplow/schema-ddl
[configuration]: https://github.com/snowplow/iglu/wiki/Configure-the-Scala-repository-server

[vagrant]: https://www.vagrantup.com/
[vbox]: https://www.virtualbox.org/

[issues]: https://github.com/snowplow/snowplow/iglu
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
