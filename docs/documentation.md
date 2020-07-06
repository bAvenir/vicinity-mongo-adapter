# Adapter documentation

## Define interactions

An interaction is a **property**, **event** or **action**.

You can create interactions following the examples in docs folder. (properties.md, events.md, actions.md)

E.g: Properties: 

* Create an array of properties and place the file with properties.json name in the agent/imports folder. 
* Then call the endpoint GET host:port/api/import/properties. 
* Your properties will be loaded in the adapter and you will be able to use them for your registrations.

<hr>

## Registration

### Performa a registration

* Create a JSON following the example in registration.md.
   1. The arrays with properties, events and actions contain pid/aid/eid, these are the names/ids you give to the interactions that you created. (See section above)
   2. The credentials generated will be stored in the agent and can be seen here:  GET host:port/api/registrations
* Send the JSON to the endpoint POST host:port/agent/registration

### Unregister an item

Send an array of oids as the example in registration.md. The endpoint to use is: POST host:port/agent/registration/remove

You can see all your registered oid in GET host:port/api/registrations

<hr>

## Dataurls

Using the file dataurls.json, it is possible to set which properties have to be requested every X seconds and which events need to be subscribed.
The file dataurls.json accepts an array on JSONs which should specificy:

* OID of the remote object
* Interaction type: event or property
* Interaction id: eid or pid

See the example in docs/dataurls.json
  
The file should be placed in the folder agent/imports. It will be loaded every time the adapter starts.

You can subscribe to the event channels using: GET /api/events/subscribe

You can start requesting properties calling: GET /adapter/properties/autorequest

<hr>

## Mappers

It is possible to use the model mappers to store data of your local infrastructure and create mappings to Vicinity.

The purpose of this data model is for developers that want to extend the adapter.

The mappers model can store any JSON containing first level keys (No nested levels so far)

      {
         key1: value1,
         ...
      }

It is possible to use directly the module REDIS to access the in memory store to create new models, just be careful not to override other models. See the documentation of the agent for more info:

https://github.com/bAvenir/vicinity-agent

