---
layout: page
group: about
subgroup: jobs
title: Data engineer
description: What we're looking for our data engineers
permalink: /about/jobs/data-engineer/
---

<h1>Data Engineer <small>Remote or London, UK or Berlin, Germany</small></h1>

A data engineer at Snowplow Analytics Ltd works across our product and infrastructure engineering efforts.

## Product engineering

Over the past four years Snowplow has grown into the industry-leading open-source event data pipeline ([main repository](https://github.com/snowplow/snowplow)), consisting of a dizzying array of user-facing products, SDKs and software libraries.

All of these 30+ projects are products in some sense, but Snowplow is not a packaged SaaS product – instead, our various user constituencies (data analysts, developers, devops) interact with the platform via SQL, software SDKs and public APIs; being open source, the Snowplow codebase is itself an important user-facing aspect of the product.

Current and planned projects in product engineering include:

* Migrating the Snowplow batch pipeline from Hadoop to Apache Spark ([see the RFC](* Adding new event sources to Snowplow, including SaaS webhooks and database change-data-capture))
* New SaaS integrations for [Sauna](https://github.com/snowplow/sauna), our decisioning and response platform
* Adding new event sources to Snowplow, including SaaS webhooks and database change-data-capture
* Porting Snowplow to new platforms such as Apache Kafka and Google Cloud Platform
* Adding schema inference support to Snowplow and [Iglu](https://github.com/snowplow/iglu), our schema registry system
* Building tooling and user interfaces for event data modeling in SQL and Apache Spark

## Infrastructure engineering

Infrastructure engineering is focused on helping Snowplow Analytics Ltd to grow to managing 100, then 1,000, then 10,000 AWS accounts as part of the Snowplow [Managed Service](http://snowplowanalytics.com/trial/).

To deliver the Snowplow Managed Service we have built a proprietary deployment, orchestration and monitoring stack, using pragmatic technologies including Ansible, CloudFormation, bash, Golang, cron and PagerDuty. We are also developing open source infrastructure tooling, such as DAG runners, Hadoop jobflow runners and similar.

We are constantly iterating on and evolving our infrastructure stack - current and planned projects include:

* Porting our real-time pipeline orchestration engine to Kubernetes, then open sourcing it
* Replacing our in-house secrets manager with HashiCorp Vault
* Adding a UI to Factotum, our open source DAG runner
* Implementing Mesos and evaluating options for running scheduled job DAGs on Mesos (replacing our in-house distributed cron system)
* Building a framework for automatic upgrades of customers' Snowplow pipelines
* Evaluating Nix as a replacement for much of our Ansible automation

## Responsibilities

Responsibilities include:

* Working closely with the Snowplow co-founders, gaining deep familiarity with our 30+ open source projects, and making contributions back to those projects to make them easier to operate at scale
* Designing and developing our in-house Managed Service stack, using pragmatic technologies including Ansible, CloudFormation, bash, Golang, cron, PagerDuty, Scala, Java, Mesos, Akka and Kubernetes
* Designing and developing our open source infrastructure tooling, such as DAG runners, Hadoop jobflow runners and similar 
* Working closely with Support Engineering, including spending time regularly on the support rotation, to understand their requirements and build tooling to automate their ongoing work
* Originating and specifying all-new open source projects on both the product and infrastructure engineering sides
* Following best practices in terms of customer/user support, product documentation, testing and QA, software delivery techniques

## What we're looking for

We'd love to get to know you if:

* **You have strong technical skills.** This role would be a great fit for a software engineer who loves infrastructure automation, or who wants more exposure to data engineering and functional programming
* **You communicate with clarity and precision.** It's super-important that our data engineers do not become bottlenecks across Snowplow's processes and systems. Communicating your work and being responsive to feedback is as important as your technical ability
* **You have a mature attitude to InfoSec, documentation and process.** Managed Service customers trust us with their event pipelines and AWS accounts - this is a huge responsibility and informs everything we do

Interested? Send your CV to recruitment@snowplowanalytics.com.

<strong>We do not welcome calls from recruitment consultants.</strong>

[Back to jobs page] [jobs]

[jobs]: /about/jobs.html
