---
layout: post
title: Bulk loading data from Amazon S3 into Redshift at the command line
tags: [Redshift, ETL]
author: Yali
category: Inside the Plow
---

On Friday Amazon launched [Redshift] [redshift], a fully managed, petabyte-scale data warehouse service. We've been busy since building out Snowplow support for Redshift, so that Snowplow users can use Redshift to store their granular, customer-level and event-level data for OLAP analysis.

In the course of building out Snowplow support for Redshift, we need to bulk load data stored in S3 into Redshift, programmatically. Unfortunately, the Redshift Java SDK is very slow at inserts, so not suitable bulk loading. We found a simple workaround that might be helpful for anyone who wishes to bulk load data into Redshift from S3, and have documented it below.


## An overview of the workaround

Amazon enables users to bulk load data from S3 into Redshift by executing queries with the following form:

{% highlight postgresql %}
copy events
from 's3://$MY-BUCKET/PATH/TO/FILES/FOR/UPLOAD'
credentials 'aws_access_key_id=$ACCESS-KEY;aws_secret_access_key=$SECRET-ACCESS-KEY'
delimiter '\t';
{% endhighlight %}

However, these queries can only be executed in a SQL client running a JDBC or ODBC driver compatible with Redshift. (Links to those drivers can be found [here] [drivers]. )

<!--more-->

In order to orchestrate bulk loading programmatically, we used [JiSQL] [jisql], a Java based command-line tool for executing SQL queries that uses a JDBC driver. JiSQL enables us to specify the specific, Redshift-compatible JDBC driver to use to establish the connection. This meant we could upgrade our Ruby [StorageLoader][storageloader] to execute the relevant command-line syntax to initiate the regular data loads of Snowplow data from S3 into Redshift.

## Using JiSQL to bulk load data from S3 to Redshift at the command-line: a step by step guide

### 1. Download and install JiSQL

* Download JiSQL from [http://www.xigole.com/software/jisql/jisql.jsp] (http://www.xigole.com/software/jisql/jisql.jsp)
* Unzip the contents of the compressed file to a suitable location

### 2. Download the Redshift-compatible JDBC driver

* Download the driver from [http://jdbc.postgresql.org/download/postgresql-8.4-703.jdbc4.jar] (http://jdbc.postgresql.org/download/postgresql-8.4-703.jdbc4.jar)
* We saved the driver to the `lib` folder in the jisql subdirectory

### 3. Identify the JDBC URL for your Redshift cluster

In the AWS Console, go to the Redshift and select the cluster you want to load data into. A window will appear with details about the cluster, including the JDBC URL.

![screenshot] [redshift-screenshot]

### 4. Initiate your bulk load of data at the command line

* At the command line, navigate to the Ji-SQL folder
* Execute the following command:

{% highlight bash %}
$ java -cp lib/jisql-2.0.11.jar:lib/jopt-simple-3.2.jar:lib/postgresql-8.4-703.jdbc4.jar com.xigole.util.sql.Jisql  -driver postgresql -cstring jdbc:postgresql://snowplow.cjbccnwghslt.us-east-1.redshift.amazonaws.com:5439/snplow -user $USERNAME -password $PASSWORD -c \; -query "copy events from 's3://$MY_BUCKET/PATH/TO/FILES/FOR/UPLOAD credentials 'aws_access_key_id=$ACCESS-KEY;aws_secret_access_key=$SECRET-ACCESS-KEY' delimiter '\t';"
{% endhighlight %}

Some notes about the above query:

* You will need to replace e.g. `$USERNAME` with your Redshift cluster username, `$PASSWORD` with your Redshift password etc.
* You will need to replace the jdbc url in the example `jdbc:postgresql://snowplow.cjbccnwghslt.us-east-1.redshift.amazonaws.com:5439/snplow` with the value you fetched from the AWS console in step 2
* The `-c \;` flag sets `;` as the query delimiter. If this is not specified, the query delimiter is taken to be `go` by default. As the query specified is terminated by a `;` rather than a `go`, leaving out the `-c \;` flag would cause the program to hang, as it waits for the terminating characters before executing the query
* If you want to experiment with the tool, you can leave off the `-query` parameter, in which case you'll invoke an interactive command-line session
* If the query is successful, it will return `0 rows affected.` at the command line. This is a bit misleading: if you then look in Redshift you'll see the new rows have loaded.

A note about bulk loading data from S3 into Redshift:

* Amazon will only let you use the above syntax to load data from S3 into Redshift if the S3 bucket and the Redshift cluster are located in the **same** region. If they are not (and Redshift is not available in all regions, at the time of writing), you will need to copy your S3 data into a new bucket in the same region as your Redshift cluster, prior to running the bulk upload.

Happy bulk loading from the command line!

[redshift]: http://aws.amazon.com/redshift/
[drivers]: http://docs.aws.amazon.com/redshift/latest/gsg/before-you-begin.html#getting-started-download-tools
[jdbc-driver]: http://jdbc.postgresql.org/download/postgresql-8.4-703.jdbc4.jar
[jisql]: http://www.xigole.com/software/jisql/jisql.jsp
[storageloader]: https://github.com/snowplow/snowplow/wiki/setting-up-alternative-data-stores
[redshift-screenshot]: /assets/img/blog/2013/02/redshift-jdbc-url.png
