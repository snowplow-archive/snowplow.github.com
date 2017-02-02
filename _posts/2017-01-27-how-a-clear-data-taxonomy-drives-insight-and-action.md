---
layout: post
title:  "How a clear data taxonomy drives insight and action"
subtitle: "Add business context to your event analytics"
tags: ["analytics", "Google analytics", "strategy tools", "snowplow analytics", "tutorial"]
author: João
category: Analytics
---

*This is guest blog post by [João Correia][joao-linkedin], Senior Analytics Strategist at YouCaring and an experienced analytics professional, helping organizations embed analytics for growth and innovation. In this post, João explains how to define an analytics strategy with Snowplow Analytics that considers your business context and drives insights and action. Many thanks to João for sharing his views on this topic! If you have a story to share, feel free to get in touch.*


## Add business context to your event analytics

Insights, that surge of excitement that invades your brain, when suddenly, you comprehend something you didn't, just a second ago.

As consultants, our core mission is to provide our clients with answers through data products that help them take action on data, optimize their marketing, their inventory, retain their customers, and increase their business profitability.

Read on to find out how to define an analytics strategy that drives insights and action with Snowplow Analytics.

### The importance of context

Let's use as an example an online jewelry store, where different teams are looking to use data to support decision making.

An out-of-the-box analytics solution tracks different events like: pageviews, transactions, add-to-cart, e-mail subscriptions, etc.

When an event is recorded, there is a series of dimensions that are recorded with it, depending on the platform. Among these dimensions are: page, source, campaign, medium, country, browser, operative system, screen resolution, and others.

You can even record additional context in custom dimensions (Google Analytics) or in eVars (Adobe Analytics).

<div class="bs-callout bs-callout-info">
  <h4>Context</h4>
  <p>
 	Context is information describing the circumstances that surround an event. Context influences the way an event is understood.
  </p>
</div>


### The jewelry business context

Selling jewelry is fundamentally different than selling anything else, first we need to understand the business context, the jewelry taxonomy.

A way to make data more insightful is to enrich events of interest using taxonomies.

Below is a simplified taxonomy for the jewelry example, which provides additional context to necklaces:

<!--<img src="/assets/img/blog/2017/01/snowplow-custom-context-example.jpg" alt="Snowplow Analytics Custom Context" width="100%" />-->

![Snowplow Analytics Custom Context  Example][Snowplow-Analytics-Custom-Context-Example]

<!--more-->

This context, can explain in great detail every necklace, its shape, how many stones and what type, color, which metal, finish and more.

Is this too much? Let's see some questions from the Marketing team.

- **Which campaigns drove more sales?**
- **What was the conversion rate by campaign?**

While these questions are straightforward to answer with any out-of-the-box analytics solution, the answer will rarely drive great insights.

> With additional context we can drill down and explore, this is a process that drives insights and leads to action.

With additional context we can answer potentially more interesting questions:

- Which campaign has better performance for Gold necklaces with diamonds?
- Are there any spikes in interest of heart shaped stones?
- What is the conversion rate for necklaces by design shape?

### How Snowplow Analytics provides relevant context

Snowplow doesn't work like Google Analytics or Adobe in the sense where it has a limited number of custom dimensions or eVars to describe an event. With Snowplow you can define an entire product taxonomy in the form of jsonschema files.

In our example, we will have four jsonschema files to describe our jewelry products. This is our jewerly taxonomy.

<div>
  <!-- Nav tabs -->
  <ul class="nav nav-tabs" role="tablist">
    <li role="presentation" class="active"><a href="#home" aria-controls="home" role="tab" data-toggle="tab">Product</a></li>
    <li role="presentation"><a href="#necklace" aria-controls="profile" role="tab" data-toggle="tab">Necklace</a></li>
    <li role="presentation"><a href="#stone" aria-controls="messages" role="tab" data-toggle="tab">Stone</a></li>
    <li role="presentation"><a href="#metal" aria-controls="settings" role="tab" data-toggle="tab">Metal</a></li>
  </ul>

  <!-- Tab panes -->
  <div class="tab-content">
    <div role="tabpanel" class="tab-pane active" id="home">

<small>file: schemas/com.jewellerystore.iglu/product/jsonschema/1-0-0</small>

{% highlight json %}
{
  "$schema": "http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#",
  "description": "Product schema",
  "self": {
    "vendor": "com.jewellerystore",
    "name": "product",
    "format": "jsonschema",
    "version": "1-0-0"
  },
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "maxLength": 255
    },
    "sku": {
      "type": "string",
      "maxLength": 100
    },
    "price": {
      "type": "number"
    },
    "gender": {
      "type": "string",
      "maxLength": 10
    }
  },
  "additionalProperties": false
}
{% endhighlight %}

    </div>
    <div role="tabpanel" class="tab-pane" id="necklace">

<small>file: schemas/com.jewellerystore.iglu/necklace/jsonschema/1-0-0</small>
{% highlight json %}
{
  "$schema": "http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#",
  "description": "Necklace schema",
  "self": {
    "vendor": "com.jewellerystore",
    "name": "necklace",
    "format": "jsonschema",
    "version": "1-0-0"
  },
  "type": "object",
  "properties": {
    "clasp_type": {
      "type": "string",
      "maxLength": 100
    },
    "adjustable_chain": {
      "type": "string",
      "maxLength": 100
    },
    "engravable": {
      "type": "string",
      "maxLength": 100
    },
    "length": {
      "type": "number"
    },
    "strands": {
      "type": "integer"
    },
    "type": {
      "type": "string",
      "maxLength": 100
    },
    "total_carat_weight": {
      "type": "number"
    },
    "design_shape": {
      "type": "string",
      "maxLength": 100
    }
  },
  "additionalProperties": false
}
{% endhighlight %}

    </div>
    <div role="tabpanel" class="tab-pane" id="stone">


<small>file: schemas/com.jewellerystore.iglu/stone/jsonschema/1-0-0</small>
{% highlight json %}
{
  "$schema": "http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#",
  "description": "Stone schema",
  "self": {
    "vendor": "com.jewellerystore",
    "name": "stone",
    "format": "jsonschema",
    "version": "1-0-0"
  },
  "type": "object",
  "properties": {
    "size": {
      "type": "string",
      "maxLength": 100
    },
    "color": {
      "type": "string",
      "maxLength": 100
    },
    "type": {
      "type": "string",
      "maxLength": 100
    },
    "shape": {
      "type": "string",
      "maxLength": 100
    },
    "min_size": {
      "type": "string",
      "maxLength": 100
    },
    "max_size": {
      "type": "string",
      "maxLength": 100
    }
  },
  "additionalProperties": false
}
{% endhighlight %}


    </div>
    <div role="tabpanel" class="tab-pane" id="metal">
<small>file: schemas/com.jewellerystore.iglu/metal/jsonschema/1-0-0</small>
{% highlight json %}
{
  "$schema": "http://iglucentral.com/schemas/com.snowplowanalytics.self-desc/schema/jsonschema/1-0-0#",
  "description": "Metal schema",
  "self": {
    "vendor": "com.jewellerystore",
    "name": "metal",
    "format": "jsonschema",
    "version": "1-0-0"
  },
  "type": "object",
  "properties": {
    "k": {
      "type": "string",
      "maxLength": 100
    },
    "color": {
      "type": "string",
      "maxLength": 100
    },
    "name": {
      "type": "string",
      "maxLength": 100
    },
    "finish": {
      "type": "string",
      "maxLength": 100
    }
  },
  "additionalProperties": false
}
{% endhighlight %}

    </div>
  </div>
</div>

We now create the corresponding jsonpath files and SQL table definitions with [Schema Guru](https://github.com/snowplow/schema-guru).

{% highlight js %}

$ ./schema-guru-0.6.2 ddl --with-json-paths product.json
File [./sql/com.jewellerystore/product_schema_1.sql] was written successfully!
File [./jsonpaths/com.jewellerystore/product_schema_1.json] was written successfully!

{% endhighlight %}

Then, we upload the jsonpath files to S3, so they are accessible to our Snowplow data pipeline, and create the tables using the SQL generated by schema-guru.

### The data structure

We will have five tables, the events table that never changes, and four additional tables, one for each context. Below is the events table and two of the four custom contexts.

Table: <span class="label label-success" style="font-size:80%;/">atomic.events</span>

<table class="table">
  <tr style="background-color:#444;color:#fff">
  <th>Fields</th>
  <th>Description</th>
</tr>
<tr>
  <td>
    <small><code>
...<br>
app_id<br>
collector_tstamp<br>
event<br>
event_id<br>
page_url<br>
geo_country <br>
...</code>
</small>
</td><td><small>
This table is the Snowplow Analytics backbone. It is used to record ALL events. Unlike Google Analytics the additional contexts are not stored here. This increases performance and forward compatibility.</small>
</td>
</tr>
</table>

Below are two examples of the DDL for two contexts, product and metal. You probably noticed the `_1` appended to each table.

Snowplow Analytics uses [semantic versioning](http://semver.org/), which allows you to properly version your jsonschemas and maintain forward compatibility.

Table: <span class="label label-success" style="font-size:80%;/">atomic.com_jewellerystore_product_1</span>

{% highlight sql %}

CREATE TABLE IF NOT EXISTS atomic.com_jewellerystore_product_1 (
    "schema_vendor"  VARCHAR(128)     ENCODE RUNLENGTH NOT NULL,
    "schema_name"    VARCHAR(128)     ENCODE RUNLENGTH NOT NULL,
    "schema_format"  VARCHAR(128)     ENCODE RUNLENGTH NOT NULL,
    "schema_version" VARCHAR(128)     ENCODE RUNLENGTH NOT NULL,
    "root_id"        CHAR(36)         ENCODE RAW       NOT NULL,
    "root_tstamp"    TIMESTAMP        ENCODE LZO       NOT NULL,
    "ref_root"       VARCHAR(255)     ENCODE RUNLENGTH NOT NULL,
    "ref_tree"       VARCHAR(1500)    ENCODE RUNLENGTH NOT NULL,
    "ref_parent"     VARCHAR(255)     ENCODE RUNLENGTH NOT NULL,
    "gender"         VARCHAR(10)      ENCODE LZO,
    "name"           VARCHAR(255)     ENCODE LZO,
    "price"          DOUBLE PRECISION ENCODE RAW,
    "sku"            VARCHAR(100)     ENCODE LZO,
    FOREIGN KEY (root_id) REFERENCES atomic.events(event_id)
)
DISTSTYLE KEY
DISTKEY (root_id)
SORTKEY (root_tstamp);

COMMENT ON TABLE atomic.com_jewellerystore_product_1 IS 'iglu:com.jewellerystore/product/jsonschema/1-0-0';

{% endhighlight %}


Table: <span class="label label-success" style="font-size:80%;/">atomic.com_jewellerystore_metal_1</span>

{% highlight sql %}

CREATE TABLE IF NOT EXISTS atomic.com_jewellerystore_metal_1 (
    "schema_vendor"  VARCHAR(128)  ENCODE RUNLENGTH NOT NULL,
    "schema_name"    VARCHAR(128)  ENCODE RUNLENGTH NOT NULL,
    "schema_format"  VARCHAR(128)  ENCODE RUNLENGTH NOT NULL,
    "schema_version" VARCHAR(128)  ENCODE RUNLENGTH NOT NULL,
    "root_id"        CHAR(36)      ENCODE RAW       NOT NULL,
    "root_tstamp"    TIMESTAMP     ENCODE LZO       NOT NULL,
    "ref_root"       VARCHAR(255)  ENCODE RUNLENGTH NOT NULL,
    "ref_tree"       VARCHAR(1500) ENCODE RUNLENGTH NOT NULL,
    "ref_parent"     VARCHAR(255)  ENCODE RUNLENGTH NOT NULL,
    "color"          VARCHAR(100)  ENCODE LZO,
    "finish"         VARCHAR(100)  ENCODE LZO,
    "k"              VARCHAR(100)  ENCODE LZO,
    "name"           VARCHAR(100)  ENCODE LZO,
    FOREIGN KEY (root_id) REFERENCES atomic.events(event_id)
)
DISTSTYLE KEY
DISTKEY (root_id)
SORTKEY (root_tstamp);

COMMENT ON TABLE atomic.com_jewellerystore_metal_1 IS 'iglu:com.jewellerystore/metal/jsonschema/1-0-0';

{% endhighlight %}


### Tracking events with additional context

Now that we have the schemas and tables ready, we can start capturing events with additional contexts. Below is what the pageview of a Sapphire and Sterling Silver Heart Necklace would look like.

Contexts can be re-used and mixed to describe any object.

{% highlight js %}

/* ******** */
/* Pageview */
/* ******** */

var pageviewContext = [
  {
    schema: 'iglu:com.jewellerystore/product/jsonschema/1-0-1',
    data: {
      name: 'Sapphire and Sterling Silver Heart Necklace',
      sku: '41062264',
      price: '257'
    }
  },{
    schema: 'iglu:com.jewellerystore/necklace/jsonschema/1-0-0',
    data: {
      clasp_type: 'spring',
      adjustable_chain: 'yes',
      engravable: 'no',
      length: '16',
      strands: '1',
      type: 'fashion',
      total_carat_weight: '3/8',
      design_shape: 'heart'
    }
  },{
    schema: 'iglu:com.jewellerystore/metal/jsonschema/1-0-0',
    data: {
      k: '',
      color: 'silver',
      name: 'sterling silver',
      finish: ''
    }
  },{
    schema: 'iglu:com.jewellerystore/stone/jsonschema/1-0-0',
    data: {
      carat: '0.42',
      color: 'blue',
      type: 'sapphire',
      shape: 'heart',
      min_size: '',
      max_size: ''
    }
  }
]

/* Track the page view with the additional context */
window.snowplow('trackPageView', null , pageviewContext);
{% endhighlight %}


Why is this mindblowing? Because you can answer the questions:

- Which necklaces received more views?
- Which necklaces drove more revenue? Which shapes? Which Metal?
- Which campaings are profitable?

As an exercise, look at the context and come up with an original question.

To answer any questions we need a data visualization tool and some data-modelling skills.

  {% highlight sql %}
SELECT
    DATE_TRUNC('day', collector_tstamp) AS date,
    e.event AS event,
    e.geo_country AS country,
    p.name AS product_name,
    p.sku AS product_sku,
    p.gender AS product_gender,
    s.shape AS stone_shape,
    m.name AS metal_name,
    CASE WHEN e.event='pageview'
    THEN 1
    ELSE 0
    END AS pageviews
    ti.order_id AS order_id,
    SUM(e.ti_price + e.ti_quantity) AS revenue,
    COUNT(DISTINCT(domain_userid)) AS visitors,
    COUNT(DISTINCT(domain_userid || '-' || domain_sessionidx)) AS visits
FROM events e
    LEFT JOIN com_jewellerystore_product_1 p
    ON e.event_id = p.root_id AND e.collector_tstamp = p.root_tstamp
    LEFT JOIN com_jewellerystore_necklace_1 n
    ON e.event_id = n.root_id AND e.collector_tstamp = n.root_tstamp
    LEFT JOIN com_jewellerystore.stone s
    ON e.event_id = s.root_id AND e.collector_tstamp = s.root_tstamp
    LEFT JOIN com_jewellerystore_metal_1 m
    ON e.event_id = m.root_id AND e.collector_tstamp = m.root_tstamp
GROUP BY 1,2,3,4,5,6,7,8,9,10
{% endhighlight %}

You can build a dashboard that not only answers the primary questions, but let's us drill down for insights. Below is a dashboard mockup.

You gotta love SQL!.

<!--<img src="/assets/img/blog/2017/01/snowplow-analytics-dashboard.png" alt="Snowplow Analytics dashboard">-->

![Snowplow Analytics dashboard example][Snowplow-Analytics-dashboard-example]


### Conclusion

Determining your products/services taxonomy and adding it to relevant events on your website/application is the catalyst to drive insights and action from your data.

Snowplow Analytics enables you to bring your business context into your data with ease and scalability, giving full data ownership and the hability to answer the questions you need, with as much drilling down as you want.

Ready to take Snowplow for a spin? Contact us!

[Snowplow-Analytics-Custom-Context-Example]: /assets/img/blog/2017/01/snowplow-custom-context-example.jpg "Snowplow Analytics Custom Context Example"

[Snowplow-Analytics-dashboard-example]: /assets/img/blog/2017/01/snowplow-analytics-dashboard.png "Snowplow Analytics dashboard example"

[joao-linkedin]: https://www.linkedin.com/in/joaolcorreia
