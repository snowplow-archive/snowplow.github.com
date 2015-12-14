---
layout: post
title: Snowplow PHP Tracker 0.1.0 released
title-short: Snowplow PHP Tracker 0.1.0
tags: [snowplow, analytics, php, tracker]
author: Josh
category: Releases
---

We are pleased to announce the release of the first version of the [Snowplow PHP Tracker] [repo]. The tracker supports synchronous GET and POST requests.

This introductory post will cover the following topics:

1. [Installation](/blog/2014/09/30/snowplow-php-tracker-0.1.0-released/#install)
2. [How to use the tracker](/blog/2014/09/30/snowplow-php-tracker-0.1.0-released/#usage)
3. [Getting help](/blog/2014/09/30/snowplow-php-tracker-0.1.0-released/#help)

<!--more-->

<div class="html">
<h2><a name="install">1. Installation</a></h2>
</div>

The Snowplow PHP Tracker is published to [Packagist] [packagist], the central repository for Composer PHP packages. To add it to your project, add it as a requirement in your `composer.json` file:

{% highlight json %}
{
    "require": {
        "snowplow/snowplow-tracker": "dev-master"
    }
}
{% endhighlight %}

Then simply run `composer update` from the root of your project to install it.

<div class="html">
<h2><a name="usage">2. How to use the tracker</a></h2>
</div>

Add class aliases to the Snowplow Tracker to include it in your project:

{% highlight php %}
use Snowplow\Tracker\Tracker;
use Snowplow\Tracker\Emitter;
use Snowplow\Tracker\Subject;
{% endhighlight %}

Create an emitter which will synchronously send HTTP POST requests:

{% highlight php %}
$emitter = new Emitter("d3rkrsqld9gmqf.cloudfront.net");
{% endhighlight %}

It is also possible to specify the protocol, method, and port that the emitter will use, as well as a `$buffer_size` which determines the minimum number of events to queue before sending them all.

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
<h2><a name="help">3. Getting help</a></h2>
</div>

Some useful resources:

* The [setup guide][setup]
* The [technical documentation][technical-documentation]

This is only the first version of the Snowplow PHP Tracker, so please [raise an issue][issues] if you find any bugs. If you have an idea for a new feature or need help getting set up, [get in touch!][talk-to-us]

[repo]: https://github.com/snowplow/snowplow-php-tracker
[packagist]: https://packagist.org/
[setup]: https://github.com/snowplow/snowplow/wiki/PHP-Tracker-Setup
[technical-documentation]: https://github.com/snowplow/snowplow/wiki/PHP-Tracker
[issues]: https://github.com/snowplow/snowplow-php-tracker/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
