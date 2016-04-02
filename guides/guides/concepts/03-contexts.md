---
layout: page
group: guides
subgroup: concepts
breadcrumb: entities
rank: 3
title: Entities
description: Understanding entities.
permalink: /guides/concepts/contexts/
redirect_from:
  - /analytics/concepts/contexts/
  - /analytics/event-dictionaries-and-data-models/contexts.html
  - /documentation/concepts/contexts/
---

When an event occurs, it generally involves a number of entities, and takes place in a particular setting. For example, the search event we used in our [example event dictionary entry](../event-dictionaries-and-schemas) might have the following entities associated with it:

1. A user entity, who performed the search
2. A web page in which the event occurred
3. A variation on the web page that was part of an A/B test
4. A set of e.g. products that were returned from the search

All the above are examples of 'contexts'. A context is the group of entities associated with or describing the setting in which an event has taken place. What makes contexts interesting is that they are common across multiple different event types. For example, the following events for a retailer will all involve a 'product' context:

* View product
* Select product
* Like product
* Add product to basket
* Purchase product
* Review product
* Recommend product

Our retailer might want to describe product using a number of fields including:

* SKU
* Name
* Unit price
* Category
* Tags

Rather than define all the set of product-related fields for all the different product-related events in their respective schemas, Snowplow makes it possible to define a single product schema, and pass this as a context with any product related event. Our product schema might look as follows:

{% highlight json %}
{
	"$schema": "http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#",
	"description": "Schema for a product context",
	"self": {
		"vendor": "com.acme_company",
		"name": "product",
		"format": "jsonschema",
		"version": "1-0-0"
	},
	"type": "object",
	"properties": {
		"sku": {
			"type": "string",
			"maxLength": 255
		},
		"name": {
			"type": "string",
			"maxLength": 1024
		},
		"unitPrice": {
			"type": "number"
		},
		"category": {
			"type": "string",
			"maxLength": 255
		},
		"tags": {
			"type": "string",
			"maxLength": 1024
		}
	},
	"minProperties":1,
	"additionalProperties": false
}
{% endhighlight %}

We can then track an add to basket event as follows, we can pass in a handful of fields that are specific to the add to basket event (e.g. the quantity of the product added), and pass the whole product object as a context.

Contexts provide a convenient way in Snowplow to schema common entities once, and then use those schemas across all the different events where those entities are relevant.

## Understand contexts?

Then read on to learn about [Iglu](../iglu) - the schema repository for handling schemas for your events and contexts.
