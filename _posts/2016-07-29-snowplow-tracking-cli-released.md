---
layout: post
title: Snowplow Tracking CLI 0.1.0 released
title-short: Snowplow Tracking CLI 0.1.0
tags: [snowplow, cli, json, json schema, schema, events, tracker]
author: Ronny
category: Releases
---

We are pleased to announce the release of the [Snowplow Tracking CLI] [tracking-cli]. This is a command-line app (written in Golang) to make it easy to send an event to Snowplow from the command line. Use the app to embed Snowplow tracking into your shell scripts.

In the rest of this post we will cover:

1. [How to install the app](/blog/2016/07/29/snowplow-tracking-cli-0.1.0-released/#how-to-install)
2. [How to use the app](/blog/2016/07/29/snowplow-tracking-cli-0.1.0-released/#how-to-use)
3. [Core features](/blog/2016/07/29/snowplow-tracking-cli-0.1.0-released/#features)
4. [Roadmap](/blog/2016/07/29/snowplow-tracking-cli-0.1.0-released/#roadmap)
5. [Documentation](/blog/2016/07/29/snowplow-tracking-cli-0.1.0-released/#documentation)
6. [Getting help](/blog/2016/07/29/snowplow-tracking-cli-0.1.0-released/#help)

<!--more-->

<h2 id="how-to-install">1. How to install the app</h2>

Add snowplowtrk and its package dependencies to your go src directory.

```
go get -v github.com/snowplow/snowplow-tracking-cli
```

Once the get completes, you should find your new `snowplowtrk` executable sitting inside `$GOPATH/bin/`.

To update snowplowtrk dependencies, use `go get` with the `-u` option.

```
go get -u -v github.com/snowplow/snowplow-tracking-cli

That's it! You're now ready to start using the app.

<h2 id="how-to-use">2. How to use the app</h2>

The app is called `snowplowtrk`.

The command line interface is as follows:

```bash
snowplowtrk --appid={{APP_ID}} --method=[POST|GET] --sdjson={{SELF_DESC_JSON}} {{COLLECTOR_DOMAIN}}
```
    
or:

```bash
snowplowtrk --appid={{APP_ID}} --method=[POST|GET] --schema={{SCHEMA_URI}} --json={{JSON}} {{COLLECTOR_DOMAIN}}
```

where:

* `--appid` is optional (not sent if not set)
* `--method` is optional. Defaults to `GET`
* `--sdjson` is a self-describing JSON of the standard form `{ "schema": "iglu:xxx", "data": { ... } }`
* `--schema` is a schema URI, most likely of the form `iglu:xxx`
* `--json` is a (non-self-describing) JSON, of the form `{ ... }`
* `{{COLLECTOR_DOMAIN}}` is the domain for your Snowplow collector, e.g. `snowplow-collector.acme.com`

You can either send in a self-describing JSON, or pass in the constituent parts (i.e. a regular JSON plus a schema URI) and the Snowplow Tracking CLI will construct the final self-describing JSON for you.

# Examples
```bash
snowplowtrk --appid myappid --method POST --schema iglu:com.snowplowanalytics.snowplow/event/jsonschema/1-0-0 --json "{\"hello\":\"world\"}" snowplow-collector.acme.com
```

```bash
snowplowtrk --appid myappid --method POST --sdjson "{\"schema\":\"iglu:com.snowplowanalytics.snowplow/event/jsonschema/1-0-0\", \"data\":{\"hello\":\"world\"}}" snowplow-collector.acme.com
```

Return codes:

* 0 if the Snowplow collector responded with an OK status (2xx or 3xx)
* 4 if the Snowplow collector responded with a 4xxx status
* 5 if the Snowplow collector responded with a 5xx status
* 1 for any other error

<h2 id="features">3. Core features</h2>

* There is no buffering - each event is sent as an individual payload whether `GET` or `POST`
* The Snowplow Tracking CLI will exit once the Snowplow collector has responded
* The app uses the [Snowplow Golang Tracker][golang-tracker]

<h2 id="roadmap">4. Roadmap</h2>

In the future, we plan to support passing JSON local files. So you can either send files or strings with the app.

<h2 id="documentation">5. Documentation</h2>

You can read more about self-describing JSONs [here] [self-describing-json].


<h2 id="help">6. Getting help</h2>

This is the first release of the Snowplow Tracking CLI.

If you have any questions or run into any problems, please [raise an issue][tracking-cli-issues] or get in touch with us through [the usual channels][talk-to-us].


[tracking-cli]: https://github.com/snowplow/snowplow-tracking-cli
[tracking-cli-issues]: https://github.com/snowplow/snowplow-tracking-cli/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[golang-tracker]: https://github.com/snowplow/snowplow-golang-tracker 
[self-describing-json]: http://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/
