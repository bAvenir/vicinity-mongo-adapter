{
    "pid": "brightness",
    "monitors": "adapters:LightColor",
    "read_link": {
        "href": "/device/{oid}/property/{pid}",
        "output": {
            "type": "object",
            "field": [
                {
                    "name": "property",
                    "schema": {
                        "type": "string"
                    }
                },
                {
                    "name": "value",
                    "predicate": "core:value",
                    "schema": {
                        "type": "integer"
                    }
                },
                {
                    "name": "time",
                    "predicate": "core:timestamp",
                    "schema": {
                        "type": "long"
                    }
                }
            ]
        }
    },
    "write_link": {
        "href": "/device/{oid}/property/{pid}",
        "input": {
            "type": "object",
            "field": [
                {
                    "name": "brightness-level",
                    "schema": {
                        "type": "integer"
                    }
                }
            ]
        },
        "output": {
            "type": "object",
            "field": [
                {
                    "name": "success",
                    "schema": {
                        "type": "boolean"
                    }
                }
            ]
        }
    }
}