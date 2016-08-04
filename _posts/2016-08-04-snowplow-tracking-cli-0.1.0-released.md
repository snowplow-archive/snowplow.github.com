---
layout: post
title: Snowplow Tracking CLI 0.1.0 released
title-short: Snowplow Tracking CLI 0.1.0
tags: [snowplow, cli, json, json schema, schema, events, tracker]
author: Ronny
category: Releases
---

We are pleased to announce the first release of the [Snowplow Tracking CLI] [tracking-cli]! This is a command-line application (written in Golang) to make it fast and easy to send an event to Snowplow directly from the command line. You can use the app to embed Snowplow tracking directly into your shell scripts.

In the rest of this post we will cover:

1. [How to install the app](/blog/2016/08/04/snowplow-tracking-cli-0.1.0-released/#how-to-install)
2. [How to use the app](/blog/2016/08/04/snowplow-tracking-cli-0.1.0-released/#how-to-use)
3. [Examples](/blog/2016/08/04/snowplow-tracking-cli-0.1.0-released/#examples)
4. [Under the hood](/blog/2016/08/04/snowplow-tracking-cli-0.1.0-released/#under-the-hood)
5. [Roadmap](/blog/2016/08/04/snowplow-tracking-cli-0.1.0-released/#roadmap)
6. [Documentation and getting help](/blog/2016/08/04/snowplow-tracking-cli-0.1.0-released/#docs-help)

<!--more-->

<h2 id="how-to-install">1. How to install the app</h2>

You can download the binary for Linux and Windows directly from Bintray:

* [Linux 64bit binary][linux-binary]
* [Windows 32bit binary][windows-binary]

Unzip the file and the app is called `snowplowtrk`.

The binary for macOS is scheduled for version 0.2.0 - (see [issue #2][issue-2]).

<h2 id="how-to-use">2. How to use the app</h2>

The command line interface is as follows:

```bash
snowplowtrk --collector=[[COLLECTOR_DOMAIN]] --appid=[[APP_ID]] --method=[[POST|GET]] --sdjson=[[SELF_DESC_JSON]]
```
    
or:

```bash
snowplowtrk --collector=[[COLLECTOR_DOMAIN]] --appid=[[APP_ID]] --method=[[POST|GET]] --schema=[[SCHEMA_URI]] --json=[[JSON]]
```

Where:

* `--collector` is the domain for your Snowplow collector, e.g. `snowplow-collector.acme.com`
* `--appid` is optional (not sent if not set)
* `--method` is optional. It defaults to `GET`
* `--sdjson` is a self-describing JSON of the standard form `{ "schema": "iglu:...", "data": { ... } }`
* `--schema` is a schema URI, most likely of the form `iglu:...`
* `--json` is a (non-self-describing) JSON, of the form `{ ... }`
* `--dbpath` is optional, it allows you to set the full path to where the event database is created. It defaults to `events.db` in the same directory as the application

You can either send in a self-describing JSON, or pass in the constituent parts (i.e. a regular JSON plus a schema URI) and the Snowplow Tracking CLI will construct the final self-describing JSON for you.

<h2 id="examples">3. Examples</h2>

Here are some examples:

```bash
$ snowplowtrk --collector snowplow-collector.acme.com --appid myappid --method POST --schema iglu:com.snowplowanalytics.snowplow/event/jsonschema/1-0-0 --json "{\"hello\":\"world\"}" 
```

```bash
$ snowplowtrk --collector snowplow-collector.acme.com --appid myappid --method POST --sdjson "{\"schema\":\"iglu:com.snowplowanalytics.snowplow/event/jsonschema/1-0-0\", \"data\":{\"hello\":\"world\"}}"
```

<h2 id="under-the-hood">4. Under the hood</h2>

There is no buffering in the Snowplow Tracking CLI - each event is sent as an individual payload whether `GET` or `POST`.

Under the hood, the app uses the [Snowplow Golang Tracker][golang-tracker].

The Snowplow Tracking CLI will exit once the Snowplow collector has responded. The return codes from `snowplowtrk` are as follows:

* 0 if the Snowplow collector responded with an OK status (2xx or 3xx)
* 4 if the Snowplow collector responded with a 4xx status
* 5 if the Snowplow collector responded with a 5xx status
* 1 for any other error

<h2 id="roadmap">5. Roadmap</h2>

In the future, we plan to support generating events from local files of newline-delimited (ND) JSON. There is potential for the Snowplow Tracking CLI to evolve into a sophisticated logfile-to-Snowplow emitter, along similar lines to Logstash or Fluentd.

<h2 id="docs-help">6. Documentation and getting help</h2>

This is the first release of the Snowplow Tracking CLI.

For more information, check out the [project README] [tracking-cli]; you can read more about self-describing JSONs [here] [self-describing-json].

If you have any questions or run into any problems, please [raise an issue][tracking-cli-issues] or get in touch with us through [the usual channels][talk-to-us].

[tracking-cli]: https://github.com/snowplow/snowplow-tracking-cli
[tracking-cli-issues]: https://github.com/snowplow/snowplow-tracking-cli/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[golang-tracker]: https://github.com/snowplow/snowplow-golang-tracker 
[self-describing-json]: http://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/
[linux-binary]: https://bintray.com/snowplow/snowplow-generic/download_file?file_path=snowplow_tracking_cli_0.1.0_linux_amd64.zip
[windows-binary]: https://bintray.com/snowplow/snowplow-generic/download_file?file_path=snowplow_tracking_cli_0.1.0_windows_386.zip
[issue-2]: https://github.com/snowplow/snowplow-tracking-cli/issues/2
