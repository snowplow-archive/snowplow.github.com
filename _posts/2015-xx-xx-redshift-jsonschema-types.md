---
layout: post
shortenedlink: JSON schemas for Redshift datatypes
title: JSON schemas for Redshift datatypes
tags: [redshift, jsonschema, json]
author: Fred
category: Other
---

This blog contains [JSON schemas][jsonschema] for the all the data types supported by [Amazon Redshift][redshift].

We supply two schemas for each numeric type, since you may want to send in numeric types as JSON strings rather than JSON numbers.

<!--more-->

### SMALLINT

```
{
	"type": "integer"
}
```

```
{
	"type": "string",
	"pattern": "^[0-9]+$"
}
```

### INTEGER

```
{
	"type": "integer"
}
```

```
{
	"type": "string",
	"pattern": "^[0-9]+$"
}
```

### BIGINT

```
{
	"type": "integer"
}
```

```
{
	"type": "string",
	"pattern": "^[0-9]+$"
}
```

### DECIMAL

```
{
	"type": "number"
}
```

```
{
	"type": "string",
	"pattern": "^[0-9]+(\\.[0-9]{2})?$"
}
```

### REAL

```
{
	"type": "number"
}
```

```
{
	"type": "string",
	"pattern": "^[0-9]+(\\.[0-9]+)?$"
}
```

### DOUBLE PRECISION

```
{
	"type": "number"
}
```

```
{
	"type": "string",
	"pattern": "^[0-9]+(\\.[0-9]+)?$"
}
```

### BOOLEAN

```
{
	"type": "boolean"
}
```

### CHAR

```
{
	"type": "string",
	"minLength": <<LENGTH>>,
	"maxLength": <<LENGTH>>
}
```

### VARCHAR

```
{
	"type": "string"
}
```

### DATE

```
{
	"type": "string",
	"pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"
}
```

### TIMESTAMP

```
{
	"type": "string",
	"pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$"
}
```

[jsonschema]: http://json-schema.org/
[redshift]: http://aws.amazon.com/redshift/
