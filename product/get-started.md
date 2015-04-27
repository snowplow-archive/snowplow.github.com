---
layout: page
group: product
title: How to get started with Snowplow today
shortened-link: Get started
weight: 4
---

# Get started with Snowplow today

Three Snowplow products to chose from:

1. [The Managed Service Batch](#batch)
2. [The Managed Service Real Time](#real-time)
3. [Open source](#open-source)

Not sure which to go for? View our [comparison table](#comparison) or [get in touch][contact] to discuss your requirements with the Snowplow team.


<h2><a name="batch">1. The Managed Service Batch</a></h2>

* Your data delivered directly into your datawarehouse (on Amazon [Redshift][redshift])
* We setup and run the Snowplow data pipeline on your AWS account
* **Total ownership and control**. All your own data stays on your AWS account
* **Hassle free**. We run the Snowplow pipeline for you

Sign up to a [free trial] [trial], or [get in touch][contact] to learn more and sign up.

<h2><a name="real-time">2. The Managed Service Real Time</a></h2>

Like the Managed Service batch, but in addition to regular loading of your data into Redshift, we:

* Load your data real-time into [Elasticsearch][elasticsearch], for real time reporting and dashboards
* Publish your event data into an [Amazon Kinesis stream][kinesis], for real time processing of the data in real-time applications (e.g. personalization)

The Managed Service Real Time is not available yet - it is currently being tested. However, you can [register interest] [register], to ensure you are at the front of the queue when the service becomes available.

<h2><a name="open-source">3. Open source</a></h2>

Run the Snowplow pipeline yourself. Our full codebase is available on [Github] [repo].

<h2><a name="comparison">Comparison table</a></h2> Product comparison

<table class="table table-striped">
    <thead>
        <tr>
            <th>Product</th>
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
    		<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>
    		<td><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></td>
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
    		<td><a href="register-for-real-time.html"><button class="btn btn-success btn-primary" type="button">Register interest</button></a></td>
    		<td><a href="managed-service-batch-free-trial.html"><button class="btn btn-success btn-primary" type="button">Free trial</button></a></td>
    		<td><a href="https://github.com/snowplow/snowplow"><button class="btn btn-success btn-primary" type="button">View the repo</button></a></td>
    	</tr>
    </tbody>
</table>

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