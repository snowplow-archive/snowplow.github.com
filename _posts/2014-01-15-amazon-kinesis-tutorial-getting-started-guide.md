---
layout: post
title: Amazon Kinesis tutorial - a getting started guide
tags: [amazon, kinesis, tutorial]
author: Yali
category: Inside the Plow
---

*Of all the developments on the Snowplow roadmap, the one that we are most excited about is porting the Snowplow data pipeline to Amazon Kinesis to deliver real-time data processing. We will publish a separate post outlining why we are so excited about this. (Hint: it's about a lot more than simply real-time analytics on Snowplow data.) This blog post is intended to provide a starting point for developers who are interested in diving into Kinesis.*

In this tutorial, we will walk through the process of getting up and running with Amazon Kinesis using two very simple Kinesis apps:

1. The [kinesis-example-scala-producer] [example-producer]: this will create a Kinesis stream and write records to it
2. The [kinesis-example-scala-consumer] [example-producer]: this will consume the Kinesis stream created by the producer

The source code for both is available on the [Snowplow repo] [snowplow-repo].

<!--more-->

## Setting up the environment to run the apps

In general Kinesis apps should run on EC2. However, for this simple example, the apps can be run locally. They require Java 1.7 and SBT 0.13.0 to run. If you use Vagrant, you can run them in the [dev-environment] [dev-environment] VM, by setting it up as follows:

First, clone the [dev-environment] [dev-environment] repo (make sure to include the `--recursive` flag):

{% highlight bash %}
$ git clone --recursive https://github.com/snowplow/dev-environment.git
$ cd dev-environment
{% endhighlight %}

Now build the VM:

{% highlight bash %}
$ vagrant up
{% endhighlight %}

Once the build is complete, SSH in:

{% highlight bash %}
$ vagrant ssh
{% endhighlight %}

And now install both Java 1.7 and Scala/SBT by running the following two Ansible playbooks (from within the VM):

{% highlight bash %}
$ ansible-playbook /vagrant/ansible-playbooks/java-7.yml \
  --inventory-file=/home/vagrant/ansible_hosts --connection=local

$ ansible-playbook /vagrant/ansible-playbooks/scala-sbt.yml \
  --inventory-file=/home/vagrant/ansible_hosts --connection=local
{% endhighlight %}

We're now ready to install the example apps and start writing two and reading from Kinesis streams!

## Creating a stream and writing records to it

We're going to use the [kinesis-example-scala-producer] [example-producer] to create our stream and write records to it.

First clone the repo, then compile the app:

{% highlight bash %}
$ git clone git://github.com/snowplow/kinesis-example-scala-producer.git
$ cd kinesis-example-scala-producer
$ sbt compile
{% endhighlight %}

Now we need to create a config file (e.g. by copying the template config file to a new file in the project root):

{% highlight bash %}
$ cp src/main/resources/default.conf my.conf
{% endhighlight %}

Use your favorite text editor to edit the AWS credentials in the file with your own access key and secret access key. If you are creating a new user in IAM for the purpose of this tutorial, make sure that user has permissions to create and write to Kinesis streams, and create, write to and delete DynamoDB tables.

You're now ready to run the app! Enter the following at the command line - this runs it from SBT, passing in the new config file as an argument:

{% highlight bash %}
$ sbt "run --config ./my.conf"
{% endhighlight %}

Once the app has started, it will create a new stream (if one does not already exist) with the name specified in the config file (this is `kinesis_exmaple` as standard). You should be able to view the stream in the AWS management console:

![pic-of-aws-console-with-metrics-rising][pic1]

If you click on the stream in the management console, you should see be able to see an increase in **Put Requests** after you started the app. Note that this may take a few minutes before it is visibile in the management console.

![put-requests-in-console][pic2]

The console should look like this, as the app writes new records to the stream:

![pic-of-console-for-produer][pic3]

You are now writing records to your first Kinesis stream!

## Consuming records from the stream

We're going to use the [kinesis-example-scala-consumer] [example-consumer] to read records from our stream.

First clone the repo, then compile the app:

{% highlight bash %}
$ cd ..
$ git clone git://github.com/snowplow/kinesis-example-scala-consumer.git
$ cd kinesis-example-scala-consumer
$ sbt compile
{% endhighlight %}

As before, we create a config file (e.g. by copying the template config file to a new file in the project root):

{% highlight bash %}
$ cp src/main/resources/default.conf my.conf
{% endhighlight %}

And edit the `my.conf` file in our favorite text editor to add our AWS credentials. The rest of the parameters should be fine, although if you have configured the name of the stream for the producer config, you will need to configure it in the consumer config so that it reads from the same stream that the producer writes to.

Now run the consumer:

{% highlight bash %}
$ sbt "run --config ./my.conf"
{% endhighlight %}

You should see something like this, as your consumer iterates through each record in the stream:

![pic-of-consumer-at-command-line][pic4]

You're now successfully reading records off the Kinesis stream!

## Thanks

These two Kinesis apps were written in collaboration with our wintern [Brandon Amos] [bamos], who has been working exclusively on Kinesis development at Snowplow over his winternship. This is just the start - we hope to release Kinesis enabled modules for the core Snowplow stack that have also been developed with Brandon in the next couple of weeks. Stay tuned!

[example-producer]: https://github.com/snowplow/kinesis-example-scala-producer
[example-consumer]: https://github.com/snowplow/kinesis-example-scala-consumer
[snowplow-repo]: https://github.com/snowplow
[dev-environment]: https://github.com/snowplow/dev-environment
[bamos]: https://github.com/bamos

[pic1]: /assets/img/blog/2014/01/kinesis/kinesis-example-stream-in-aws-console.png
[pic2]: /assets/img/blog/2014/01/kinesis/aws-console-put-requests.png
[pic3]: /assets/img/blog/2014/01/kinesis/kinesis-example-scala-producer.png
[pic4]: /assets/img/blog/2014/01/kinesis/kinesis-example-scala-consumer.png
