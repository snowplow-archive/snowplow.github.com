---
layout: page
header: title
group: documentation
subgroup: data modeling
breadcrumb: sessionization
subbreadcrumb: client-side sessionization
weight: 2
title:
description: Understanding client-side sessionization in Snowplow.
permalink: /documentation/data-modeling/sessionization/client-side-sessionization/
---

<nav>
  <ol>

{% for weight in (1..10) %}

{% for node in site.pages %}
{% if node.group == page.group %}
{% if node.subgroup == page.subgroup %}
{% if node.breadcrumb == page.breadcrumb %}

{% if node.weight == weight %}

{% if node.weight < page.weight %}<li class="visited">&#10003; <a href="{{ BASE_PATH }}{{node.url}}">{{ node.subbreadcrumb }}</a></li>
{% elsif node.weight == page.weight %}<li class="current">&#10003;<strong><a href="{{ BASE_PATH }}{{node.url}}">{{ node.subbreadcrumb }}</a></strong></li>
{% else %}<li>&#10003;<a href="{{ BASE_PATH }}{{node.url}}">{{ node.subbreadcrumb }}</a></li>
{% endif %}

{% endif %}

{% endif %}
{% endif %}
{% endif %}

{% endfor %}

{% endfor %}

  </ol>
</nav>

To write.
