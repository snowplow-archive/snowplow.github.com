---
layout: page
group: about
subgroup: jobs
title: Infrastructure engineer
description: What we're looking for our infrastructure engineers
---

<h1>Infrastructure Engineer <small>London, UK</small></h1>

Our [Managed Service](http://snowplowanalytics.com/trial/) offering has grown significantly over the last year, and we now orchestrate and monitor the Snowplow event pipeline across more than 70 customer-owned AWS accounts, with individual accounts processing many billions of events per month. This is a huge responsibility but also a hugely exciting infrastructure automation challenge.

We are looking for our first infrastructure engineer to help us grow to managing 400 and then 4,000 AWS accounts. You'll work closely with Alex Dean, Snowplow co-founder, on all aspects of our proprietary deployment, orchestration and monitoring stack. Over time, you should aim to own the design and development of our devops stack.

We're looking for stronger software engineering skills than a typical devops role requires. You'll work closely with our data engineering team, gain deep familiarity with our 30+ open source projects, and make contributions back to those projects to make them easier to operate at scale. On top of this, we are already outgrowing conventional infrastructure management tools such as Ansible and CloudFormation, and are starting to explore Mesos, Akka, Kubernetes and other frameworks to build solutions here.

Today, our in-house Managed Service stack uses pragmatic technologies including Ansible, CloudFormation, bash, Golang, cron and PagerDuty. We are constantly iterating on and evolving this stack - current and planned projects include:

* Replacing our in-house secrets manager with HashiCorp Vault
* Implementing Mesos and evaluating options for running scheduled job DAGs on Mesos (replacing our in-house distributed cron system)
* Building a framework for automatic upgrades of customers' Snowplow pipelines
* Updating our AMI factory to use HashiCorp Packer
* Evaluating Nix as a replacement for much of our Ansible automation
* Moving customers' proprietary jobs to Docker containers

We'd love to get to know you if:

* **You have strong technical skills.** This role would be a great fit for a software engineer who loves infrastructure automation, or a devops practitioner who wants more exposure to data engineering and functional programming
* **You communicate with clarity and precision.** It's super-important that our first infrastructure engineer does not become a bottleneck across Snowplow's processes and systems. Communicating your work and being responsive to feedback is as important as your technical ability
* **You have deep experience with AWS.** We make heavy use of 19 (out of 46) AWS services - deep experience with AWS is a must
* **You have a mature attitude to InfoSec, documentation and process.** Managed Service customers trust us with their event pipelines and AWS accounts - this is a huge responsibility and informs everything we do

Interested? Send your CV to recruitment@snowplowanalytics.com.

<strong>We do not welcome calls from recruitment consultants.</strong>

[Back to jobs page] [jobs]

[jobs]: /about/jobs.html
