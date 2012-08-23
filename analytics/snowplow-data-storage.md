---
layout: section
category: analytics
analytics_category: overview
title: Data storage
weight: 3
---

# Understanding how your SnowPlow data is stored

SnowPlow data is warehoused using either:

1. [Apache Hive] [apachehive]
2. [Infobright] [infobright]

In both cases, the SnowPlow data is stored in a single table with a simple structure (documented [here][table-structure]).

If the data is warehoused using Hive, it physically lives in Amazon S3. When you fire up Elastic Mapreduce, you define a table for the data and point it at the relevant location in S3, where the physical data lives.

In the case of Infobright, the data lives in a table on your Infobright instance, where it is queried just like any table in a database.

<a name="apachehive" />
## Apache Hive

[Apache Hive] [hive] is a datawarehousing platform developed by the techies at Facebook and built on top of Hadoop. It lets analysts run SQL-like queries against large volumes of data stored in flat files. (The syntax is especially close to MySQL, in particular.) From a SnowPlow analytics perspective, the important things to understand about Hive are:

1. Hive has been incorporated by the clever folks at Amazon into their [Elastic Mapreduce][emr] service. This makes it easy to setup a Hive cluster and use it to analyse data stored in [S3] [s3] directly
2. Because Hive is built to process large volumes of data stored in flatfiles, it is perfect for querying the the Cloudfront logs. Through a [custom deserializer] [serde] developed by the SnowPlow team, Hive can read the Cloudfront logs directly and make the data stored in them available as a table so that analysts can query on one of more of the fields stored in them. (The structure of the table is documented [here] [table-structure].)
3. Writing queries in Hive is straightforward for anyone with knowledge of SQL and the SnowPlow [data structure] [table-structure]
4. Hive is incredibly scalable. It was built by the folks at Facebook to enable analysts there to comb over **all** Facebook's Petabytes of user data. Hive scales linearly: to speed up querying of big data sets, you simply throw additional servers at the query. Amazon [Elastic Mapreduce] [emr] makes it  easy to setup clusters of as many servers as you'd like in minutes, and add additional servers to your analytics cluster as you need them

Using Hive, it is possible to run analyses against your raw Cloudfront logs directly, as described [below] [analyse-cloudfront-logs-directly]. More often, though, analysts choose to transfer the data into a format that enables faster querying in Hive, as described [here] [#optimised-hive].

<a name="analyse-cloudfront-logs-directly" />
### Querying Cloudfront logs directly in Hive

Querying the Cloudfront log data directly in Hive is straightforward. First, from the terminal, navigate to the directory with your [Elastic Mapreduce command line tools] [emr-cli] and launch a Hive interactive session:

	./elastic-mapreduce --create --alive --hive-interactive

This command instructs Elastic Mapreduce to fire up an analytics cluster including both Hadoop and Hive. (It will include the default number of servers, which is two. More can be added by specifying additional arguments.) The command line tools will respond with a jobflow ID e.g.:

	Created job flow j-EHXD14TNGXI8

Give Amazon a few minutes to get your cluster up and running, then SSH in by typing:

	./elastic-mapreduce --ssh --jobflow j-EHXD14TNGXI8

Once the cluster has been setup, you should be SSHed in, and see something like this:

	ssh -o ServerAliveInterval=10 -o StrictHostKeyChecking=no -i /home/alex/.emr/pbz-hive-nasqueron.pem hadoop@ec2-176-34-64-73.eu-west-1.compute.amazonaws.com 
	Warning: Permanently added 'ec2-176-34-64-73.eu-west-1.compute.amazonaws.com,176.34.64.73' (RSA) to the list of known hosts.
	Linux (none) 2.6.35.11-83.9.amzn1.i686 #1 SMP Sat Feb 19 23:41:56 UTC 2011 i686
	--------------------------------------------------------------------------------

	Welcome to Amazon Elastic MapReduce running Hadoop and Debian/Squeeze.
	 
	Hadoop is installed in /home/hadoop. Log files are in /mnt/var/log/hadoop. Check
	/mnt/var/log/hadoop/steps for diagnosing step failures.

	The Hadoop UI can be accessed via the following commands: 

	  JobTracker    lynx http://localhost:9100/
	  NameNode      lynx http://localhost:9101/
	 
	--------------------------------------------------------------------------------
	hadoop@ip-10-234-109-57:~$ 

You are in the cluster. Launch Hive by typing:

{% highlight mysql %}
hive
{% endhighlight %}

We now need to create a table in Hive based on the Cloudfront logs. To do that, we first need to let Hive know where the SnowPlow deserializer is, so that Hive can read the raw log files. To do that, execute the following command:

{% highlight mysql %}
ADD JAR s3://{{JARS-BUCKET-NAME}}/snowplow-log-deserializers-0.4.7.jar;
{% endhighlight %}

(Substitute the S3 bucket you use to store the deserializer JAR.) Now you can create the table:

{% highlight mysql %}
CREATE EXTERNAL TABLE views_events 
ROW FORMAT 
  SERDE 'com.snowplowanalytics.snowplow.hadoop.hive.SnowPlowEventDeserializer'
LOCATION 's3://{{LOGS-BUCKET-NAME}}/';
{% endhighlight %}

You wll need to replace the 'LOGS-BUCKET-NAME' with the name of the S3 bucket where your Cloudfront logs are stored.

Hive now knows where your Cloudfront logs are stored, and it knows from the deserializer how to translate those individual logs into a tidy table. We can inspect the tidy table created prior to querying it:

{% highlight mysql %}
DESCRIBE views_events ;
{% endhighlight %}

Hive will respond by listing all the different fields:

{% highlight mysql %}
hive> DESCRIBE views_events ;
OK
dt	string	from deserializer
tm	string	from deserializer
txn_id	string	from deserializer
user_id	string	from deserializer
user_ipaddress	string	from deserializer
visit_id	int	from deserializer
page_url	string	from deserializer
page_title	string	from deserializer
page_referrer	string	from deserializer
mkt_medium	string	from deserializer
mkt_source	string	from deserializer
mkt_term	string	from deserializer
mkt_content	string	from deserializer
mkt_campaign	string	from deserializer
ev_category	string	from deserializer
ev_action	string	from deserializer
ev_label	string	from deserializer
ev_property	string	from deserializer
ev_value	string	from deserializer
br_name	string	from deserializer
br_family	string	from deserializer
br_version	string	from deserializer
br_type	string	from deserializer
br_renderengine	string	from deserializer
br_lang	string	from deserializer
br_features	array<string>	from deserializer
br_cookies	boolean	from deserializer
os_name	string	from deserializer
os_family	string	from deserializer
os_manufacturer	string	from deserializer
dvce_type	string	from deserializer
dvce_ismobile	boolean	from deserializer
dvce_screenwidth	int	from deserializer
dvce_screenheight	int	from deserializer
Time taken: 1.425 seconds
{% endhighlight %}

You as an analyst can now query the "views_events" table as you would any table in SQL. For example, to count the number of unique visitors by day, execute the following query:

{% highlight mysql %}
SELECT
dt,
COUNT(DISTINCT(user_id))
FROM views_events
GROUP BY dt;
{% endhighlight %}

<a name="optimised-hive" />
### Querying the data in a format optimsied for Hive

Whilst it is possible to query the Cloudfront logs directly, this is inefficient for a number of reasons:

1. When Hive uses custom deserializers to read custom data formats, it slows down dramatically
2. The Cloudfront logs are not partitioned. That means that every time you run a query, Hive has to chunk through the complete data sets, which may run into Terabytes of data for a big website.

As a result, SnowPlow offers a daily ETL process that takes identifies the new records in the Cloudfront logs and writes this data into another bucket on S3 into a partitioned format that Hive can read directly without the custom deserializer.

Querying this table is very similar to querying the raw Cloudfront logs. The biggest difference notable to the analyst will be that results are returned much faster.

To perform the queries, we need to start off by defining our table, and telling Hive where the data lives:

{% highlight mysql %}
CREATE EXTERNAL TABLE IF NOT EXISTS `events` (
tm STRING,
txn_id STRING,
user_id STRING,
user_ipaddress string,
visit_id INT,
page_url string,
page_title string,
page_referrer string,
mkt_source string,
mkt_medium string,
mkt_term string,
mkt_content string,
mkt_campaign string,
ev_category string,
ev_action string,
ev_label string,
ev_property string,
ev_value string,
br_name string,
br_family string,
br_version string,
br_type string,
br_renderengine string,
br_lang string,
br_features array<string>,
br_cookies boolean,
os_name string,
os_family string,
os_manufacturer string,
dvce_type string,
dvce_ismobile boolean,
dvce_screenwidth int,
dvce_screenheight int)
PARTITIONED BY (dt STRING)
LOCATION 's3://{{SNOWPLOW-DATA-BUCKET}}/' ;
{% endhighlight %}

Some things to note when comparing the above CREATE TABLE statement with the one for Cloudfront earlier:

1. We have to specify every field in the table. When we created a table for the raw Cloudfront logs, this wasn't necessary, as it was performed implicitly by the deserializer used.
2. We have not had to specify a deserializer or table format: the default Hive settings are used
3. The data is partitioned by date. This means that if we only want to query data in a particular time period, we do **not** need to process the complete data set, only the data for the relevant time period.

Once the table is setup, querying it is exactly like querying the raw logs table, however. For example, to calculate the number of uniques by day, enter:

{% highlight mysql %}
SELECT
dt,
COUNT(DISTINCT(user_id))
FROM events
GROUP BY dt;
{% endhighlight %}

<a name="infobright" />
## Infobright

Whilst Hive has a number of features that make it well suited to performing analytics (especially horizontal scaling and direct integration to Amazon S3 via EMR), there are two disadvantages to using Hive:

1. Analysis is not instant. Even with a large cluster, chunking through large volumes of data in Hive typically takes minutes. Whilst that is fast, it is not fast enough for *train of thought analytics*
2. Amazon charges for [emr] based on the number of servers used and the number of hours they are run. This can make analysts reluctant to run big jobs. 
3. Because it is **not** a standard RDBMS database, it is not trivial to integrate Hive with standard analytics tools including [R] [r] or BI tools like [Tableau] [tableau] or [Microstrategy] [microstrategy]

Enter [Infobright] [infobright-website]. Infobright is an open source analytics columnar database that is optimised around enabling analysts to run ad hoc queries against large data sets very quickly. Most of the query functionality available in MySQL (on which Infobright is based) is available in Infobright, making writing queries easy. Infobright scales to Terabytes of data, which is enough for all but the largest websites / networks, who will have to stick with Hive. Further, because it is based on MySQL, it integrates easily with any BI tool built to work with MySQL, which is pretty much all of them.

Connecting to your data stored in Infobright is straightforward. If you're connecting via the command-line, you'll need to SSH onto the server running your Infobright instance, and then connect to Infobright:

{% highlight mysql %}
mysql-ib -u {{USERNAME}} -p
{% endhighlight %}

Substitute your username for 'USERNAME' and enter your password when prompted. Once in Infobright, you can connect to the SnowPlow database:

{% highlight mysql %}
USE snowplow;
{% endhighlight %}

In the SnowPlow database is the events table. You can query it as normal, so, for example, to find out the number of unique visitors by day:

{% highlight mysql %}
SELECT dt, 
COUNT(DISTINCT(user_id))
FROM events
GROUP BY dt;
{% endhighlight %}

Note that the query is identical to that executed in Hive. In general, queries in the two datawarehousing platforms are very similar.

## Understand how SnowPlow data is warehoused in Hive / Infobright?

[Learn more][table-structure] about how data is structured in Hive / Infobright


[apachehive]: #apachehive
[infobright]: #infobright
[infobright-website]: http://www.infobright.org/
[wiki]: http://github.com/snowplow/snowplow/wiki
[github-repo]: http://github.com/snowplow/snowplow
[s3]: http://aws.amazon.com/s3/
[serde]: https://github.com/snowplow/snowplow/tree/master/3-etl/hive/snowplow-log-deserializers
[table-structure]: snowplow-table-structure.html
[hive]: http://hive.apache.org/
[emr]: http://aws.amazon.com/elasticmapreduce/
[emr-cli]: http://aws.amazon.com/developertools/2264
[tableau]: http://www.tableausoftware.com/
[microstrategy]: http://www.microstrategy.co.uk/
[r]: http://www.r-project.org/
[table-structure]: snowplow-table-structure.html