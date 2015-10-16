---
layout: post
title: Iglu Objective-C Client 0.1.0 released
title-short: Iglu Objective-C Client 0.1.0
tags: [snowplow, analytics, ios, osx, objc, objectivec, iglu, json, jsonschema]
author: Josh
category: Releases
---

We are pleased to announce the release of version 0.1.0 of the [Iglu Objective-C Client][client-repo].  This is the second Iglu Client to be released and will allow you to test and validate all of your Snowplow Events directly in your OSX and iOS applications.

The rest of this post will cover the following topics:

1. [How to install the client](/blog/2015/10/16/iglu-objective-c-client-0.1.0-released#how-to-install)
2. [How to use the client](/blog/2015/10/16/iglu-objective-c-client-0.1.0-released#how-to-use)
3. [Why you should use the client](/blog/2015/10/16/iglu-objective-c-client-0.1.0-released#why-to-use)
4. [Documentation](/blog/2015/10/16/iglu-objective-c-client-0.1.0-released#docs)
5. [Getting help](/blog/2015/10/16/iglu-objective-c-client-0.1.0-released#help)

<!--more-->

<h2 id="how-to-install">1. How to install the client</h2>

The release version of this Client can be found on [cocoapods][cocoapods] under `SnowplowIgluClient`.  Assuming you are already using Cocoapods installation from there is as simple as:

* Add `pod 'SnowplowIgluClient'` to your Podfile.
* Run `pod update` to pull in the new dependency.

For steps on **manual installation** or further clarification refer to our [setup guide][setup-guide].

To use the library you will need to add the following import:

{% highlight objective-c %}
#import "SPIClient.h"
{% endhighlight %}

And that's it! You're now ready to start using the Client.

<h2 id="how-to-use">2. How to use the client</h2>

The client needs two arguments for a successful init; a resolver config and an array of `NSBundle` objects.
* The former can be passed either as an NSString or as a URL path which the client will then download for you.
* The later is used for all embedded schema lookups; if you are not doing any embedded lookups you can pass `nil`.

To init the client with a resolver-config pulled from local resources:

{% highlight objective-c %}
// Utility function found in SPIUtilities
NSString * resolverAsString = 
    [SPIUtilities getStringWithFilePath:@"your_resolver.json" 
                           andDirectory:@"YourDirectory" 
                              andBundle:[NSBundle mainBundle]];
SPIClient * client = [[SPIClient alloc] initWithJsonString:resolverAsString andBundles:nil];
{% endhighlight %}

To init the client with a resolver from a URL:

{% highlight objective-c %}
NSString * resolverUrl = @"https://raw.githubusercontent.com/snowplow/snowplow/master/3-enrich/config/iglu_resolver.json";
SPIClient * client = [[SPIClient alloc] initWithUrlPath:resolverUrl andBundles:nil];
{% endhighlight %}

Once you have successfully created a Client you can start validating JSONs.  **Please note** that the client will only accept JSONs that have already been converted to NSDictionary objects.

{% highlight objective-c %}
// Utility function found in SPIUtilities
NSDictionary * jsonDictionary = [SPIUtilities parseToJsonWithString:yourJsonStringHere];

// Check your JSON
BOOL result = [client validateJson:jsonDictionary];
{% endhighlight %}

Currently the underlying library for JSONSchema validation does not support full error logging so you will only be able to see a `YES` or `NO` result for the validation.  To get the full error we recommend grabbing the offending JSON and JSONSchema and pasting them into [this online validation tool](https://json-schema-validator.herokuapp.com/).

That is all there is to it!  For more information please refer to the [technical documentation][tech-docs].

<h2 id="why-to-use">3. Why you should use the client</h2>

The usefulness of this library comes into play with the ability to add a whole layer of JSON and JSONSchema validation to your iOS and OSX applications before any releasing takes place.  

Due to the length of time it takes to push an application to the AppStore the last thing you want is for the events you have carefully crafted to actually be invalid; resulting in data loss or the need for hacky workarounds until you can get the problem fixed.

You can now run the following assertions directly in your application:

* That your resolver-config is valid
  - Help & Guides for setup can be found [here](https://github.com/snowplow/iglu/wiki/Iglu-technical-documentation)
* That your custom events are being constructed properly
* That your custom JSONSchema have been constructed properly

This removes the need of manually and painstakingly validating that your events and corresponding JSONSchema are correct.  The client does this all for you!

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

You then generate the JSONSchema for this event using [Schema Guru][schema-guru] and add some ammendments:

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

You can now use the Iglu Client to assert that whenever you make an `awesome-event` it validates against the schema you have created:

{% highlight objective-c %}
NSDictionary * awesomeEvent = [ACMEEvent getNewAwesomeEvent];
XCTAssertTrue([client validateJson:awesomeEvent]);
{% endhighlight %}

If for whatever reason the event is missing a required value or is not formed exactly right your tests will fail and it won't get overlooked before release time.

<h2 id="docs">4. Documentation</h2>

You can find the [Iglu Objective-C Client][tech-docs] on our wiki.

<h2 id="help">5. Getting help</h2>

We hope that you find the Iglu Objective-C Client useful - of course, this is only its first release, so don't be afraid to [get in touch][talk-to-us] or raise an [Objective-C Client issue][client-issues] on GitHub!

[client-repo]: https://github.com/snowplow/iglu-objc-client
[cocoapods]: https://cocoapods.org/
[setup-guide]: https://github.com/snowplow/iglu/wiki/ObjC-client-setup
[tech-docs]: https://github.com/snowplow/iglu/wiki/ObjC-client
[schema-guru]: https://github.com/snowplow/schema-guru
[talk-to-us]: https://github.com/snowplow/iglu/wiki/Talk-to-us
[client-issues]: https://github.com/snowplow/iglu-objc-client/issues
