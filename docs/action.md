[ {
    "aid": "set-brightness",
    "affects": "adapters:LightColor",
    "read_link": {
        "href": "/device/{oid}/status/{aid}",
        "output": {
            "type": "object",
            "field": [
                {
                    "name": "action",
                    "schema": {
                        "type": "string"
                    }
                },
                {
                    "name": "status",
                    "schema": {
                        "type": "integer"
                    }
                }
            ]
        }
    },
    "write_link": {
        "href": "/bulb/set-brightness/{oid}",
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
]