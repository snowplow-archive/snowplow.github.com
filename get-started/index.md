---
layout: page
group: get-started
title: Pricing
shortened-link: Get started
weight: 1
redirect_from:
  - /services/pipelines.html
  - /pricing/index.html
custom-header: pricing
---

<p>Three Snowplow products to choose from:</p>

<ul>
  <li><a href="#batch">The Managed Service Batch</a></li>
  <li><a href="#real-time">The Managed Service Real Time</a></li>
  <li><a href="#open-source">Open source</a></li>
</ul>

<table class="table table-striped">
    <thead>
        <tr>
            <th width="50%">Product</th>
            <th>Managed Service Real-Time</th>
            <th>Managed Service Batch</th>
            <th>Open Source</th>
        </tr>
    </thead>
    <tbody>
    	<tr>
    		<td>Price per month</td>
    		<td>$5000</td>
    		<td>$1250</td>
    		<td>$0</td>
    	</tr>
    	<tr>
    		<td>Snowplow data pipeline setup</td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></td>
    	</tr>
    	<tr>
    		<td>Ongoing instrumentation and monitoring of your Snowplow data pipeline</td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></td>
    	</tr>
    	<tr>
    		<td>SLA</td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></td>
    	</tr>
    	<tr>
    		<td>Proactive monitoring of the data pipeline, including identifying and addressing issues that arise</td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></td>
    	</tr>
    	<tr>
    		<td>Support developing and evolving the event dictionary, including schema definitions and Iglu setup</td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></td>
    	</tr>
    	<tr>
    		<td>Data modelling and BI tool integration support</td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></td>
    	</tr>
    	<tr>
    		<td>Your data on your own AWS account</td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    	</tr>
    	<tr>
    		<td>Real-time dashboards and reporting via Elasticsearch and Kibana</td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    	</tr>
    	<tr>
    		<td>Real-time delivery of your events into Kinesis for processing by data-driven applications</td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    	</tr>
    	<tr>
    		<td>Regular (batch-based) loading of your data into Amazon Redshift</td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    	</tr>
    	<tr>
    		<td>Technical support</td>
    		<td>Phone, email</td>
    		<td>Phone, email</td>
    		<td>Forum</td>
    	</tr>
    	<tr>
    		<td></td>
    		<td><a href="register-for-real-time.html"><button class="cta-button" type="button">Register for private beta</button></a></td>
    		<td><a href="managed-service-batch-free-trial.html"><button class="cta-button" type="button">Free trial</button></a></td>
    		<td><a href="https://github.com/snowplow/snowplow"><button class="cta-button" type="button">GitHub repo</button></a></td>
    	</tr>
    </tbody>
</table>


<h2 id="batch">1. The Managed Service Batch</h2>

<p>Your data delivered directly into your data warehouse. Minimal cost, minimal fuss.</p>

<ul>
  <li>Your data delivered directly into **your datawarehouse** (on Amazon <a href="http://aws.amazon.com/redshift/">Amazon Redshift</a>)</li>
  <li>No devops required - we setup and run the pipeline for you as a service</li>
  <li>Ongoing support to help you instrument Snowplow trackers, model your data and analyse the data</li>
  <li><strong>Total ownership and control</strong>. All your own data stays on your AWS account</li>
  <li><strong>Hassle free</strong>. We run the Snowplow pipeline for you, so you can concentrate on anaylsing the data</li>
</ul>

You can trial the managed service [free] [trial] for [one month] [trial]. [Sign up here] [trial], or [get in touch] [contact] to learn more.

<h2 id="real-time">2. The Managed Service Real Time</h2>

Like the Managed Service batch, but in addition to regular loading of your data into Redshift, we:

* Load your data real-time into [Elasticsearch][elasticsearch], for real time reporting and dashboards
* Publish your event data into an [Amazon Kinesis stream][kinesis], for real time processing of the data in real-time applications (e.g. personalization)

The Managed Service Real Time is currently available in private beta. [Register now] [register] to ensure you are at the front of the queue when the service becomes publically available.

<h2 id="open-source">3. Open source</h2>

Run the Snowplow pipeline yourself. Our full codebase is available on [Github] [repo].

<h2>Want to talk to a human?</h2>

Then [get in touch][contact] with the Snowplow team!


[forum]: https://groups.google.com/forum/#!forum/snowplow-user
[contact]: /about/index.html
[trial]: managed-service-batch-free-trial.html
[elasticsearch]: https://www.elastic.co/products/elasticsearch
[redshift]: http://aws.amazon.com/redshift/
[kinesis]: http://aws.amazon.com/kinesis/
[repo]: https://github.com/snowplow/snowplow
[register]: register-for-real-time.html
