## Register

{
    "name": "human-readable-object-name", #MANDATORY
    "type": "VICINITY-type", #MANDATORY
    "adapter-id": "ID-in-local-infrastructure",   #MANDATORY
    "properties": ["pid-1", ..., "pid-n"], #OPTIONAL
    "events": ["eid-1", ..., "eid-n"], #OPTIONAL
    "actions": ["aid-1", ..., "aid-n"], #OPTIONAL
    "version": "some-object-version", #OPTIONAL
    "description": "additional-object-info", #OPTIONAL
    "located-in": [  #OPTIONAL (Used in semantic interoperability)
        {
            "location_type": "s4bldg:Building",
            "location_id": "http://mybuilding.eu",
            "label": "building label"
        }
    ]
}

## Unregister

{
    "oids": ["oid-1", ..., "oid-n"]
}