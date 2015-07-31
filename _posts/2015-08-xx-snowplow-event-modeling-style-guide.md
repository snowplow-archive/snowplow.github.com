---
layout: post
shortenedlink: Snowplow event modeling style guide
title: Snowplow event modeling style guide
tags: [redshift, jsonschema, json, event modeling, style]
author: Alex
category: Analytics
---

At Snowplow we support our new Managed Service customers in the manual creation of their initial Snowplow event dictionaries ([example] [website-event-dictionary]); in tandem we are working to automate as much as possible of the modeling process as possible, via our [Schema Guru] [schema-guru-030] tool.

These two strands together give us a great perspective on what works and more importantly what doesn't work in terms of modeling events. This blog post is a first attempt at crystallizing those learnings into an "event modeling style guide". This guide is focused on schema'ed event modeling with Snowplow, but we believe that it contains many general lessons which will be useful even if working with a schemaless system such as MongoDB, Mixpanel, Keen.IO or Segment.

Following this style guide should make it easier to create and evolve Snowplow event dictionaries. Because this guide reflects our current thinking on event modeling, following it carefully should make your event dictionary more "forwards-compatible" in terms of new releases of the Snowplow and Iglu projects.



This style guide is broken down into the following sections:


Be careful not to have multiple properties describing the same thing.

Good: 


A few notes before we begin:

* We take our examples from a mix of JSON, JSON Schema and the Snowplow Android Tracker
* 

<h2 id="json-schema">Unstructured events and custom contexts</h2>

In general, favor "thin" unstructured events accompanied by custom contexts for each of the entities that are involved in that event.

Bad:

Good:



General thoru

Do

<h2 id="json-schema">Unstructured events and custom contexts</h2>

Use camelCase for property names throughout
Nest related items e.g. { "clan": { "name": xx, "age": xx } }

Don't

<h2 id="event-integrity">Event integrity</h2>

Don't use more than 1 property for the same thing.

 - itemId should not sometimes be stored in productItemId

Don't introduce typos between builds - playerId becoming playerID is a new property

JSON Schema

JSON Schema is an interesting hybrid of a type system and a contracts system. 





<h2 id="event-integrity">Complex types</h2>

Don't use strings to express complex types

Bad: "teams": "diablo,pirates,vengeance"
Good: "teams": [ "diablo", "pirates", "vengeance" ]

Bad: "screenRes": "200x300"
Good: "screenRes': { "height": 200, "width": 300 }

Avoid product types:

gameLevel: "23" in some events
gameLevel: 23 in other events

Product types are very hard to process through to Redshift - choose one datatype and stick to it. If you have to change it, create a new property name:

gameLevel: "23" pre-beta
gameLevelNum: 23 post-beta

Don't use arrays as tuples

Bad: "longLat": [ 200, 320 ]
Good: "location': { "latitude": xxx, "longitude": 300 }

Bad: "players": ["bob", "lucy", "karl", "tom"]
Good: "player1": "bob", "player2": "lucy", "player3": "karl", "player4": "tom"



This blog contains [JSON schemas][jsonschema] for the all the data types supported by [Amazon Redshift][redshift].

We supply two schemas for each numeric type, since you may want to send in numeric types as JSON strings rather than JSON numbers. 

1. [SMALLINT](/blog/2015/02/12/redshift-jsonschema-types#smallint)
2. [INTEGER](/blog/2015/02/12/redshift-jsonschema-types#integer)
3. [BIGINT](/blog/2015/02/12/redshift-jsonschema-types#bigint)
4. [DECIMAL](/blog/2015/02/12/redshift-jsonschema-types#decimal)
5. [REAL](/blog/2015/02/12/redshift-jsonschema-types#real)
6. [DOUBLE PRECISION](/blog/2015/02/12/redshift-jsonschema-types#double)
7. [BOOLEAN](/blog/2015/02/12/redshift-jsonschema-types#boolean)
8. [CHAR](/blog/2015/02/12/redshift-jsonschema-types#char)
9. [VARCHAR](/blog/2015/02/12/redshift-jsonschema-types#varchar)
10. [DATE](/blog/2015/02/12/redshift-jsonschema-types#date)
11. [TIMESTAMP](/blog/2015/02/12/redshift-jsonschema-types#timestamp)

<!--more-->

<h2><a name="smallint">SMALLINT</a></h2>

The schema for passing the value in as a number:

```
{
	"type": "integer"
}
```

And the schema for passing the value in as a string. The regex will validate any string consisting only of digits:

```
{
	"type": "string",
	"pattern": "^[0-9]+$"
}
```

<h2><a name="integer">INTEGER</a></h2>

The schema for passing the value in as a number:

```
{
	"type": "integer"
}
```

And the schema for passing the value in as a string. The regex will validate any string consisting only of digits:

```
{
	"type": "string",
	"pattern": "^[0-9]+$"
}
```

<h2><a name="bigint">BIGINT</a></h2>

The schema for passing the value in as a number:

```
{
	"type": "integer"
}
```

And the schema for passing the value in as a string. The regex will validate any string consisting only of digits:

```
{
	"type": "string",
	"pattern": "^[0-9]+$"
}
```

<h2><a name="decimal">DECIMAL</a></h2>

The schema for passing the value in as a number:

```
{
	"type": "number"
}
```

And the schema for passing the value in as a string. The regex will validate a string of at least one digit, possibly followed by a period and exactly two digits:

```
{
	"type": "string",
	"pattern": "^[0-9]+(\\.[0-9]{2})?$"
}
```

The schema below is equivalent, except that it also allows empty strings:

```
{
	"type": "string",
	"pattern": "^$|^[0-9]+(\\.[0-9]{2})?$"
}
```

<h2><a name="real">REAL</a></h2>

The schema for passing the value in as a number:

```
{
	"type": "number"
}
```

And the schema for passing the value in as a string. The regex will validate any string consisting of at least one digit, possibly followed by a period and at least one digit:

```
{
	"type": "string",
	"pattern": "^[0-9]+(\\.[0-9]+)?$"
}
```

<h2><a name="double">DOUBLE PRECISION</a></h2>

The schema for passing the value in as a number:

```
{
	"type": "number"
}
```

And the schema for passing the value in as a string. The regex will validate any string consisting of at least one digit, possibly followed by a period and at least one digit:

```
{
	"type": "string",
	"pattern": "^[0-9]+(\\.[0-9]+)?$"
}
```

<h2><a name="boolean">BOOLEAN</a></h2>

```
{
	"type": "boolean"
}
```

<h2><a name="char">CHAR</a></h2>

This JSON schema is for a char of exactly <<LENGTH>> characters.

```
{
	"type": "string",
	"minLength": <<LENGTH>>,
	"maxLength": <<LENGTH>>
}
```

<h2><a name="varchar">VARCHAR</a></h2>

This JSON schema is for a varchar with at most <<LENGTH>> characters.

```
{
	"type": "string",
	"maxLength": <<LENGTH>>
}
```

<h2><a name="date">DATE</a></h2>

This JSON schema uses the regex for Redshift's default `YYYY-MM-DD` format.

```
{
	"type": "string",
	"pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"
}
```

<h2><a name="timestamp">TIMESTAMP</a></h2>

This JSON schema uses the regex for Redshift's default `YYYY-MM-DD HH:MM:SS` format.

```
{
	"type": "string",
	"pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$"
}
```

[jsonschema]: http://json-schema.org/
[redshift]: http://aws.amazon.com/redshift/
