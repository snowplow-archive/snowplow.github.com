---
layout: page
group: about
title: Jobs at Snowplow - join the Snowplow team!
description: Join the Snowplow team
shortened-link: Jobs
weight: 3
redirect_from:
  - /jobs/
---

# Join the Snowplow team!

The Snowplow team is growing. We're looking for candidates who are:

* Intellectually curious
* Excited to try new things including tools and technologies  
* Like to learn by doing, failing and trying again
* Hands on - like to deliver: commit code, draw concrete insights
* Willing to challenge conventional thinking

We do our best to make working at Snowplow a pleasure for the right candidates:

* Work from our London office or remotely anywhere in the world (depending on the role)
* We tailor roles to our candidates - we won't squeeze you into a role that's not right for you, given your experience

## Vacancies

1. [Infrastructure engineer](#infra-engineer) - London, UK [1 position]
2. [Data pipeline engineering interns](#data-pipeline-engineer) - Remote or London, UK [1 position]
3. [Data scientist interns](#business-analyst-data-scientist) - Remote or London, UK [1-2 positions]


<h2><a name="infra-engineer">Infrastructure engineer (London, UK)</a></h2>

Our [Managed Service](http://snowplowanalytics.com/get-started/) offering has grown significantly over the last year, and we now orchestrate and monitor the Snowplow event pipeline across more than 40 customer-owned AWS accounts, with individual accounts processing many billions of events per month. This is a huge responsibility but also a hugely exciting infrastructure automation challenge.

We are looking for our first infrastructure engineer to help us grow to managing 400 and then 4,000 AWS accounts. You’ll work closely with Alex Dean, Snowplow co-founder, on all aspects of our proprietary deployment, orchestration and monitoring stack. Over time, you should aim to own the design and development of our devops stack.

We’re looking for stronger software engineering skills than a typical devops role requires. You’ll work closely with our data engineering team, gain deep familiarity with our 30+ open source projects, and make contributions back to those projects to make them easier to operate at scale. On top of this, we are already outgrowing conventional infrastructure management tools such as Ansible and CloudFormation, and are starting to explore Mesos, Akka, Kubernetes and other frameworks to build solutions here.

Today, our in-house Managed Service stack uses pragmatic technologies including Ansible, CloudFormation, bash, Golang, cron and PagerDuty. We are constantly iterating on and evolving this stack - current and planned projects include:

* Replacing our in-house secrets manager with HashiCorp Vault
* Implementing Mesos and evaluating options for running scheduled job DAGs on Mesos (replacing our in-house distributed cron system)
* Building a framework for automatic upgrades of customers' Snowplow pipelines
* Updating our AMI factory to use HashiCorp Packer
* Evaluating Nix as a replacement for much of our Ansible automation
* Moving customers' proprietary jobs to Docker containers

We’d love to get to know you if:

* **You have strong technical skills.** This role would be a great fit for a software engineer who loves infrastructure automation, or a devops practitioner who wants more exposure to data engineering and functional programming
* **You communicate with clarity and precision.** It’s super-important that our first infrastructure engineer does not become a bottleneck across Snowplow’s processes and systems. Communicating your work and being responsive to feedback is as important as your technical ability
* **You have deep experience with AWS.** There are few AWS services that Snowplow does *not* use - deep experience with AWS is a must
* **You have a mature attitude to InfoSec, documentation and process.** Managed Service customers trust us with their event pipelines and AWS accounts - this is a huge responsibility and informs everything we do

<h2><a name="data-pipeline-engineer">Data pipeline engineers</a></h2>

We are looking for 1 data pipeline engineer to join our open source internship program this winter.

* Work with us to build the best-in-class open source event analytics platform
* Our open source technology stack includes Hadoop, Kinesis, Kafka, Samza, Cascading, Scalding, Scala, Javascript, Ruby, Python (see [our repo](https://github.com/snowplow) for details)
* Our propietary stack includes Chronos and Mesos

Interested? Send your CV to recruitment@snowplowanalytics.com.


<h2><a name="business-analyst-data-scientist">Data scientists</a></h2>

We are looking for 1-2 data scientists to join us for internships this summer. There are a number of prospective projects we are interested in pursuing - these might include:

* Developing approaches to marketing attribution
* Building real-time dashboards and reports using Spark Streaming and D3.js
* Experimenting with real-time behavioral segmentation - again using Spark Streaming

Interested? Send your CV to recruitment@snowplowanalytics.com.

<strong>We do not welcome calls from recruitment consultants.</strong>


[summer-2015-blog-post]: /blog/2015/04/09/announcing-our-summer-internship-program/
