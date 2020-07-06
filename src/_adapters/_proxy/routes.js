/**
 * routes.js
 * Proxy router interface
 * Endpoint 'agent'
 * Gateway calls endpoint agent/... to send data collected from the network to the adapters
 * @interface
 */

 // Load VICINITY AGENT
const vcntagent = require('bavenir-agent');

const express = require('express');
let router = express.Router();
let controller = require('./controllers');
let cache = vcntagent.redis;

router
    // ***** Gateway proxy *****
    .get('/objects/:id/properties/:pid', cache.getCached, controller.proxyGetProperty) // receive property request from gtw
    .put('/objects/:id/properties/:pid', controller.proxySetProperty) // receive request to upd property from gtw
    // .post('/objects/:oid/actions/:aid') // receive request to start action
    // .delete('/objects/:oid/actions/:aid') // receive request to stop action
    .put('/objects/:id/events/:eid', controller.proxyReceiveEvent); // get event from channel where you are subscribed
  
module.exports = router;