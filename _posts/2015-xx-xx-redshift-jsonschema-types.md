---
layout: post
shortenedlink: JSON schemas for Redshift datatypes
title: JSON schemas for Redshift datatypes
tags: [redshift, jsonschema, json]
author: Fred
category: Other
---

This blog contains [JSON schemas][jsonschema] for the all the data types supported by [Amazon Redshift][redshift].

<!--more-->

### SMALLINT

```
{
	"type": "integer"
}
```

### INTEGER

```
{
	"type": "integer"
}
```

### BIGINT

```
{
	"type": "integer"
}
```

### DECIMAL

```
{
	"type": "number"
}
```

### REAL

```
{
	"type": "number"
}
```

### DOUBLE PRECISION

```
{
	"type": "number"
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
