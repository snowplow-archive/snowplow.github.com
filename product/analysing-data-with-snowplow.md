---
layout: section
category: product
title: Data analytics 
weight: 5
---

# Introduction to data analysis with SnowPlow

Analysing data in SnowPlow is surprisingly straightforward for anyone with a basic knkowledge of SQL to write queries in Apache Hive. 

SnowPlow data is stored either in [Apache Hive][hive] or [Infobright][infobright]. In both cases, all the data is kept in a single 'events' table, where each line of data in the table represents a single event.

It is possible to perform complete analyses using nothing but Hive / Infobright. In practice, however, most users prefer to use Hive / Infobright to extract a "cut" of SnowPlow data that they can then analyse in their favorite / preferred analytics tool, be that Excel, R, Tableau, Microstrategy or something else all together.

## Getting started with Hive / Infobright

SnowPlow data is stored in a single table called `events`. Each line of data in the table represents a single user event e.g. a page view, add-to-basket etc.

A full description of the events table can be found [here] [Hive-events-table-definition]. We wont cover all the fields in the table here, rather, we'll explore some of the main ones used to perform analyses.

### Counting visitors

Two fields are particularly useful for identifying visitors to your site:

1. The **user_id**. This uniquely identifies each visitor to your website
2. The **visit_id**. This identifies each visit this particular user is on. the first time the user visits your website it is set to '1', the 2nd time to '2' etc.

Each line of event data in Hive is time stamped, with a `dt` field indicating the date and a `tm` field indicating the time that an event took place.

To count the number of users that visited your website on August 11th 2012, for example, we simply execute the following query:

	select count(distinct (user_id)) as uniques
	from events
	where dt='2012-08-11' ;

## Zooming in on a particular visitor(s)

Sometimes, we may want to look at the behaviour of a particular visitor, or group of visitors. To do this, we can simply execute the following query to pull up the complete browsing history of user_id = '1234'

	SELECT * FROM events
	WHERE user_id = '1234' ;

We may want to identify the last 100 users who visited our site:

	SELECT DISTINCT user_id 
	FROM events
	WHERE dt='2012-08-11'
	ORDER BY tm DESC 
	LIMIT 100;

Alternatively, we may want to identify the last 100 users who purchased on our site:

	SELECT DISTINCT user_id
	FROM events
	WHERE dt='2012-08-11'
	AND ev_action = 'order-complete'
	ORDER BY tm DESC
	LIMIT 100;

Note: the `ev_action` field represented in the above query is the 'event-action'. The text in this field represents the different types of action a user can take on your site e.g. 'add-to-basket' (on an ecommerce site) or 'pause-video' (on a media site).

## Exporting data out of Hive

If you are using Infobright rather than Hive, exporting data is straightforward: you can use any programme that works with MySQL. (Infobright is based on MySQL.)

If you are using Hive, exporting data is a little more involved. Generating the cut of data by building the query is exactly the same, but then running the export takes several steps:

Typically, generating the 'cut' of data involves executing a SQL query where:

1. The 'SELECT' statement includes all the fields they would like in their output, aggreagted as appropriate. (Using the SUM, COUNT, MAX functions etc.)
2. The 'WHERE' statement filters results to just the customers / actions they are interested in analysing
3. The 'GROUP BY' statement rolls the data up to the required level of aggregation. To take a comman example, analysts often roll the data up so that there is one line of data for each visit. In that case, they would:

	GROUP BY user_id, visit_id 

So far so good - same process for Hive and Infobright.

Once an analyst has pulled the cut of data she requires from SnowPlow, the next step is to import it into her analytics / statistical / visualisation tool of choice. It is straightforward to write the outputs of a Hive analysis to a tab delimited or comma delimited file. This is achieved by creating an 'external table' (i.e. one that is saved on S3 rather than in Hive itself) and formatting it to be e.g. a CSV:

	CREATE EXTERNAL TABLE data_for_export (
		field_1 field_1_type, 
		field_2 field_2_type,
		...
		field_n field_n_type
	) ROW FORMAT DELIMITED
	FIELDS TERMINATED BY ','
	LINES TERMINATED BY '\n'
	LOCATION 's3://{{bucket-name}}/{path}/' ;

Once created, the analyst needs to populate the table with the data from their Hive query:

	INSERT OVERWRITE TABLE data_for_export
	SELECT
		field_1, 
		field_2,
		...
		field_n
	FROM events
	WHERE {{conditions here}}
	GROUP BY {{aggregation criteria}} ;

The query will execute, but instead of writing the results to the screen, they'll be saved in S3, where the analyst can download them and import them into their the appropriate tool to continue the analysis.

Want to [learn more] [analyst-cookbook] about the different analyses that are possible with Hive? Then visit the [Analytics Cookbook] [analyst-cookbook].

[Get started] [get-started] with SnowPlow [here] [get-started].

[Hive-events-table-definition]: /analytics/snowplow-table-structure.html
[analyst-cookbook]: /analytics/index.html
[get-started]: get-started.html
[hive]: http://hive.apache.org/
[infobright]: http://www.infobright.org/