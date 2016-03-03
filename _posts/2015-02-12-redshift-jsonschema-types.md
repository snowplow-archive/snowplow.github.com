---
layout: post
title: JSON schemas for Redshift datatypes
tags: [redshift, jsonschema, json]
author: Fred
category: Analytics
---

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

This is the recommended way to define a timestsamp field in JSON schema:

```
{
	"type": "string",
	"format": "date-time"
}

```

You can instead use the following regex if you wish:

```
{
	"type": "string",
	"pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$"
}
```

[jsonschema]: http://json-schema.org/
[redshift]: http://aws.amazon.com/redshift/
