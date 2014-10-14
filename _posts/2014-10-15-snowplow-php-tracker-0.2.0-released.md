---
layout: post
shortenedlink: Snowplow PHP Tracker 0.2.0 released
title: Snowplow PHP Tracker 0.2.0 released
tags: [snowplow, analytics, php, tracker]
author: Josh
category: Releases
---

We are pleased to announce the release of the second version of the [Snowplow PHP Tracker] [repo]. The tracker supports a variety of synchronous, asynchronous and out of band event emitters for GET and POST Requests.

This introductory post will cover the following topics:

1. [Installation](/blog/2014/10/15/snowplow-php-tracker-0.2.0-released/#install)
2. [How to use the tracker](/blog/2014/10/15/snowplow-php-tracker-0.2.0-released/#usage)
3. [New Emitters Explained](/blog/2014/10/15/snowplow-php-tracker-0.2.0-released/#emitters)
4. [Debug Mode Added](/blog/2014/10/15/snowplow-php-tracker-0.2.0-released/#debug)
5. [Getting help](/blog/2014/10/15/snowplow-php-tracker-0.2.0-released/#help)

<!--more-->

<div class="html">
<h2><a name="install">1. Installation</a></h2>
</div>

The Snowplow PHP Tracker is published to [Packagist] [packagist], the central repository for Composer PHP packages. To add it to your project, add it as a requirement in your `composer.json` file:

{% highlight json %}
{
    "require": {
        "snowplow/snowplow-tracker": "0.2.0"
    }
}
{% endhighlight %}

Then simply run `composer update` from the root of your project to install it.

<div class="html">
<h2><a name="usage">2. How to use the tracker</a></h2>
</div>

Add these class aliases to the Snowplow Tracker to include it in your project:

{% highlight php %}
use Snowplow\Tracker\Tracker;
use Snowplow\Tracker\Emitter;
use Snowplow\Tracker\Subject;
{% endhighlight %}

Create an emitter which will send HTTP requests to a collector; for this example we are using a `sync` emitter:

{% highlight php %}
$emitter = new Emitter("sync", array(
                "uri" => "d3rkrsqld9gmqf.cloudfront.net",
                "type" => "POST",
                "protocol" => NULL,
                "buffer" => NULL
            )
        );
{% endhighlight %}

It is also possible, for this emitter, to specify the protocol and method that the emitter will use, as well as a `$buffer_size` which determines the minimum number of events to queue before sending them all.

Create a subject to hold data about a specific user:

{% highlight php %}
$subject = new Subject();
$subject->setUserId("user-567296");
$subject->setTimezone("Europe/London");
$subject->setLanguage("en");
{% endhighlight %}

Create a tracker:

{% highlight php %}
$tracker = new Tracker($emitter, $subject, "my-tracker-namespace", "my-application-id");
{% endhighlight %}

Send some events:

{% highlight php %}
// Track a page view
$tracker->trackPageView("http://www.example.com", "title page");

// Track a structured event representing an add-to-basket
$tracker->trackStructEvent("shop", "add-to-basket", null, "red hat", 2);

// Track an ecommerce transaction
$items = array(
    array(
        "sku" => "pbz0026",
        "price" => 20,
        "quantity" => 1,
        "name" => NULL,
        "category" => NULL
    ),
    array(
        "sku" => "pbz0038",
        "price" => 15,
        "quantity" => 1,
        "name" => "shirt",
        "category" => "clothing"
    )
);
$tracker->trackEcommerceTransaction("6a8078be", 35, "USD", "affiliation", 3, 
                                    0, "Phoenix", "Arizona", "US", $items);

// Track a Snowplow custom unstructured event
$event_json = 
array(
    "schema" => "iglu:com.acme/test/jsonschema/1-0-0",
    "data" => array(
        "page" => "testpage",
        "user" => "tester"
    )
);
$tracker->trackUnstructEvent($event_json);

// Track a screen view event with custom context attached
$custom_context = array(
    "schema" => "iglu:com.snowplowanalytics.snowplow/screen_type/jsonschema/1-0-0",
    "data"=> array(
        "type" => "test",
        "public" => false
    )
);

$user_context = array(
    "schema" => "iglu:com.snowplowanalytics.snowplow/user/jsonschema/1-0-0",
    "data" => array(
        "age" => 40,
        "name" => "Ned"
    )
);

$contexts = array($custom_context, $user_context);

$tracker->trackScreenView("Test screen", "id-0004346", $contexts);
{% endhighlight %}

<div class="html">
<h2><a name="emitters">3. New Emitters Explained</a></h2>
</div>

We now have four different emitters available for use with the PHP Tracker.  All of which fully support GET & POST Collectors.

- The `Sync` Emitter or synchronous emitter is a carry over from version 0.1.0 and has not changed.

- The `Socket` Emitter is a new edition with the ability to write Requests directly to an HTTP socket; has delivered a drastic speed improvement over `Sync`.  However it is still synchronous in its operation.

- The `Curl` Emitter provides a 'nearly' asynchronous Request emitter.  In that we can send multiple requests simultaneously!  This emitter shines in GET operation as by nature we can only include one event per GET Request.  Much faster operation than socket.

- Last but not least the `File` emitter delivers a non-blocking out of band emitter.  This works by spawning a background worker process which consumes log files filled with events which are generated by the Tracker.  It uses the same framework as the `Curl` Emitter but it does not halt the main script from executing and we can have as many as we want (until the computer runs out of processing bandwidth that is).

More information for the PHP Trackers Emitters can be found in the [wiki][repo].

<div class="html">
<h2><a name="debug">4. Debug Mode Added</a></h2>
</div>

The emitters included with the PHP Tracker now come with debug mode.  To explain this mode sets up local logging of any errors that the emitters might run into.  Such as an invalid host or the inability to establish a socket connection to the collector.

On any failures it will record the error along with the payload that was meant to be sent.  To enable debug mode all that need be done is to append a `true` boolean to the end of the emitter constructor like so:

{% highlight php %}
$emitter = new Emitter("sync", array(
                "uri" => "d3rkrsqld9gmqf.cloudfront.net",
                "type" => "POST",
                "protocol" => NULL,
                "buffer" => NULL
            ),
            true # Just append a boolean here and debug mode will begin collecting information!
        );
{% endhighlight %}

The `file` emitter does not yet have debugging included, however we are essentially repurposing the `curl` emitter.  If one works the other should have no issues!

All debug files will be logged at this address: `directory_root\debug\sync-events-random_number.log`.

For more information on debugging please consult the [wiki][repo].

<div class="html">
<h2><a name="help">5. Getting help</a></h2>
</div>

Some useful resources:

* The [setup guide][setup]
* The [technical documentation][technical-documentation]

This is now the second version of the Snowplow PHP Tracker, so please [raise an issue][issues] if you find any bugs. If you have an idea for a new feature or need help getting set up, [get in touch!][talk-to-us]

[repo]: https://github.com/snowplow/snowplow-php-tracker
[packagist]: https://packagist.org/
[setup]: https://github.com/snowplow/snowplow/wiki/PHP-Tracker-Setup
[technical-documentation]: https://github.com/snowplow/snowplow/wiki/PHP-Tracker
[issues]: https://github.com/snowplow/snowplow-php-tracker/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us