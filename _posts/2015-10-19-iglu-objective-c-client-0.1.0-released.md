---
layout: post
title: Iglu Objective-C Client 0.1.0 released
title-short: Iglu Objective-C Client 0.1.0
tags: [snowplow, analytics, ios, osx, objc, objectivec, iglu, json, jsonschema]
author: Josh
category: Releases
---

We are pleased to announce the release of version 0.1.0 of the [Iglu Objective-C Client] [client-repo]. This is the second Iglu client to be released (following the [Iglu Scala Client] [scala-repo]) and will allow you to test and validate all of your Snowplow self-describing JSONs directly in your OS X and iOS applications.

The rest of this post will cover the following topics:

1. [How to install the client](/blog/2015/10/19/iglu-objective-c-client-0.1.0-released#how-to-install)
2. [How to use the client](/blog/2015/10/19/iglu-objective-c-client-0.1.0-released#how-to-use)
3. [Why you should use the client](/blog/2015/10/19/iglu-objective-c-client-0.1.0-released#why-to-use)
4. [Documentation](/blog/2015/10/19/iglu-objective-c-client-0.1.0-released#docs)
5. [Getting help](/blog/2015/10/19/iglu-objective-c-client-0.1.0-released#help)

<!--more-->

<h2 id="how-to-install">1. How to install the client</h2>

The release version of this Client can be found on [cocoapods][cocoapods] under `SnowplowIgluClient`. Assuming you are already using CocoaPods, installation from there is as simple as:

* Add `pod 'SnowplowIgluClient'` to your Podfile
* Run `pod update` to pull in the new dependency

For steps on **manual installation** refer to our [setup guide][setup-guide].

To use the library you will need to add the following import:

{% highlight objective-c %}
#import "IGLUClient.h"
{% endhighlight %}

And that's it! You're now ready to start using the Client.

<h2 id="how-to-use">2. How to use the client</h2>

The client needs two arguments for a successful init; a resolver config and a possibly-empty array of `NSBundle` objects:

* The former can be passed either as an `NSString` or as a URL path which the client will then download for you
* The latter is a set of additional embedded repositories, alongside the one that comes bundled with the client

To initialize the client with a local resolver-config from local resources:

{% highlight objective-c %}
// Utility function found in IGLUUtilities
NSString * resolverAsString = 
    [IGLUUtilities getStringWithFilePath:@"your_resolver.json" 
                            andDirectory:@"YourDirectory" 
                               andBundle:[NSBundle mainBundle]];
IGLUClient * client = [[IGLUClient alloc] initWithJsonString:resolverAsString andBundles:nil];
{% endhighlight %}

To initialize the client with a resolver from a URL:

{% highlight objective-c %}
NSString * resolverUrl = @"https://raw.githubusercontent.com/snowplow/snowplow/master/3-enrich/config/iglu_resolver.json";
IGLUClient * client = [[IGLUClient alloc] initWithUrlPath:resolverUrl andBundles:nil];
{% endhighlight %}

Once you have successfully created a client you can start validating JSONs. **Please note** that the client will only accept JSONs that have already been converted to NSDictionary objects.**

{% highlight objective-c %}
// Utility function found in IGLUUtilities
NSDictionary * jsonDictionary = [IGLUUtilities parseToJsonWithString:yourJsonStringHere];

// Check your JSON
BOOL result = [client validateJson:jsonDictionary];
{% endhighlight %}

Currently the underlying library for JSON Schema validation does not support full error logging so you will only be able to see a `YES` or `NO` result for the validation. To see the full validation error, we recommend pasting the offending JSON and associated JSON Schema into [this online validation tool] [json-schema-validator].

That is all there is to it! For more information please refer to the [technical documentation][tech-docs].

<h2 id="why-to-use">3. Why you should use the client</h2>

This library lets you add a layer of JSON validation to your iOS and OS X apps.

Due to the length of time it takes to push an app to the App Store, it is especially important to check that the self-describing JSONs you are sending to Snowplow will not cause validation issues downstream. If they do not validate, then Snowplow events will fail validation until you can get the problem fixed.

You can now run the following assertions directly in your application:

* That your resolver config is valid as per the [Iglu technical documentation] [iglu-docs]
* That your self-describing JSONs can be resolved correctly against your Iglu repositories
* That your self-describing JSONs pass validation against their respective JSON Schemas

This removes the need of manually and painstakingly validating that your events and corresponding JSON Schemata are correct.

For example imagine you are creating an event named `awesome-event` which you want to track in your application.

{% highlight json %}
{
    "schema": "iglu:com.acme/awesome-event/jsonschema/1-0-0", 
    "data": {
        "name": "something_cool",
        "value": 100
  }
}
{% endhighlight %}

You then generate the JSON Schema for this event using [Schema Guru][schema-guru]:

{% highlight json %}
{
    "$schema": "http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#",
    "description": "Schema for your new awesome event",
    "self": {
        "vendor": "com.acme",
        "name": "awesome-event",
        "format": "jsonschema",
        "version": "1-0-0"
    },
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        },
        "value": {
            "type": "integer",
            "minimum": 0,
            "maximum": 32767
        }
    },
    "required": ["value"],
    "additionalProperties": false
}
{% endhighlight %}

You can now use the Iglu Client in your test suite to assert that whenever you make an `awesome-event`, it validates against the schema you have created:

{% highlight objective-c %}
NSDictionary * awesomeEvent = [ACMEEvent getNewAwesomeEvent];
XCTAssertTrue([client validateJson:awesomeEvent]);
{% endhighlight %}

If for whatever reason the event is missing a required value or is not formed exactly right, then your tests will fail, giving you fair warning that you should not release this version to the App Store.

<h2 id="docs">4. Documentation</h2>

You can find the [Iglu Objective-C Client][tech-docs] on our wiki.

<h2 id="help">5. Getting help</h2>

We hope that you find the Iglu Objective-C Client useful - of course, this is only its first release, so don't be afraid to [get in touch][talk-to-us] or raise an [Objective-C Client issue][client-issues] on GitHub!

[client-repo]: https://github.com/snowplow/iglu-objc-client
[scala-repo]: https://github.com/snowplow/iglu-scala-client
[cocoapods]: https://cocoapods.org/
[setup-guide]: https://github.com/snowplow/iglu/wiki/ObjC-client-setup
[tech-docs]: https://github.com/snowplow/iglu/wiki/ObjC-client
[schema-guru]: https://github.com/snowplow/schema-guru

[iglu-docs]: https://github.com/snowplow/iglu/wiki/Iglu-technical-documentation
[json-schema-validator]: https://json-schema-validator.herokuapp.com/

[talk-to-us]: https://github.com/snowplow/iglu/wiki/Talk-to-us
[client-issues]: https://github.com/snowplow/iglu-objc-client/issues
