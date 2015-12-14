---
layout: post
title: Tracking Olark chat events with Snowplow
tags: [snowplow, olark, structured event tracking]
author: Yali
category: Integration
---

As some of you will have noticed, we recently installed [Olark] [olark] on the Snowplow website. Olark powers the chat box you see on the bottom right of the screen: if you click on it, and if one of the Snowplow team is at their desks, you can talk directly to us.

![olark-logo] [olark-logo]

Setting up Olark was an incredibly easy process - the Olark team provides a very straightforward [quick start guide][olark-get-started]. We tested Olark for a week on the Snowplow website - we wanted to see:

1. Whether people visiting the site would want to chat to us.
2. Whether the chats were "useful" i.e. did they drive visitors to become Snowplow users? Did they help us identify content on the site that was confusing and needed clarification? Does it help drive sales of [Snowplow professional services] [pro-services].

What became clear very quickly was that only a minority of visitors to the Snowplow site were interested in chatting. However, the "usefulness" of those chats was very high - already two professional services contracts have been won off the back of initial conversations powered by Olark. And in addition, we learnt a lot about where out content needs clarifying.

The testing of Olark to date has been qualitative however. Longer term, we want to assess the value Olark adds quantitatively. To do this, naturally, we turn to Snowplow. We want to track Olark chat events in Snowplow, so that we can then analyze the Snowplow data to understand:

1. The type of user behavior on the site that typically leads up to a user reaching out to us on Olark
2. The type of user behavior on the site that leads to a user being responsive to us reaching out to them via Olark
3. What impact do conversation on Olark have on the visitors subsequent browsing behavior (and likelihood to start using Snowplow and buying Snowplow professional services)?
4. How good (quick) we are at responding to visitors reaching out to us via Olark?

In this blog post, we will describe how we used [Snowplow structured events] [struct-events] to track Olark chat events. In a future blog post, we will analyze the data collected in Snowplow, to show how to answer the four questions outlined above. (We'll write this once we've been running Olark for a while, so have a good data set to use to peform the analysis.)

<!--more-->

## Tracking Olark chat events in Snowplow

Olark provides an easy-to-use Javascript API, that lets us call our own Javascript functions when an Olark chat event happens. There are two that are relevant for us - an event that fires when a visitor pings a message to an "operator" (i.e. the Snowplow team) via the Olark client:

{% highlight javascript %}
olark('api.chat.onMessageToOperator', function(event) {
    // our custom function here
});
{% endhighlight %}

...and an event that fires when an operator pings a message to a visitor:

{% highlight javascript %}
olark('api.chat.onMessageToVisitor', function(event) {
    // our custom function here
});
{% endhighlight %}

We're running Google Tag Manager on the Snowplow website, so we want to push an event into the GTM dataLayer when a chat event happens, so that that event is visible to Snowplow tags configured in GTM. To do this, we add the following Javascript to our page template:

{% highlight javascript %}
olark('api.chat.onMessageToOperator', function(event) {
    dataLayer.push({'event': 'olarkMessageToOperator'});
});

olark('api.chat.onMessageToVisitor', function(event) {
    dataLayer.push({'event': 'olarkMessageToVisitor'});
});
{% endhighlight %}

Now that chat events trigger notifications in the dataLayer, we can create Snowplow tags via the GTM interface to track these events. We load up GTM, and create a new tag to trigger a [structured event] [struct-events] when a visitor messages the operator:

![gtm-create-tag-1][gtm-1]

Two things are worth noting about the tag. Firstly, the tag itself is very straightforward:

{% highlight html %}
<!-- Snowplow event tracking -->
<script type="text/javascript">
_snaq.push(['setCollectorUrl', 'collector.snplow.com']);
_snaq.push(['trackStructEvent', 'contact', 'olark_chat', 'message_to_operator', '', '']);
</script>
{% endhighlight %}

Secondly, we've created a rule that fires the tag when an event occurs in the dataLayer called 'olarkMessageToOperator'. This is triggered by Javascript that we added to out page template.

Now that our first tag is setup, we need to create an analogous tag, one that fires when the operator sends a message to the visitor. (Rather than the visitor sending a message to the operator.) This is done as shown below:

![gtm-create-tag-2][gtm-2]

And bingo! We create a new version in Google Tag Manager, and publish the changes. Simple! Now, for every visitor to our website, we will record in granular detail a line of data in Snowplow  whenever they send a message to us, and another line of data every time we send a message back. We'll be able to analyze:

* How quickly we respond to messages from visitors
* When visitors tend respond to messages from us. (When should we reach out, and when we shouldn't.)
* What impact chats on Olark have, in aggregate on visitor's subsequent behavior on the site. (Are they more likely to engage deeply with the site? Are they more likely to look at our Github repo? Are they more likely to look at the professional services pages? Does any of the above vary by the length of the chat? Or the location of the visitor? Or the amount of time the visitor had spend on our site prior to talking to us via Olark?)

We'll cover how to perform the above analysis in a future blog post.



[olark]: http://www.olark.com/
[olark-get-started]: http://www.olark.com/customer/portal/articles/337453-getting-started-guide
[pro-services]: http://snowplowanalytics.com/services/index.html
[olark-logo]: /assets/img/blog/2013/06/olark/olark-logo.png
[gtm-1]: /assets/img/blog/2013/06/olark/gtm-create-tag.JPG
[gtm-2]: /assets/img/blog/2013/06/olark/gtm-create-tag-2.JPG
[struct-events]: https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#wiki-custom-structured-events
