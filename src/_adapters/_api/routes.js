/**
 * Adapter routes
 * Define routes for your adapter actions
 * @interface
 */

const express = require('express');
let router = express.Router();
let controller = require('./controllers');

router
   // MQTT ADAPTER endpoints
   .get('/mqtt/connect', controller.mqttController)
   .get('/mqtt/disconnect', controller.mqttController)
   .post('/mqtt/subscribe', controller.mqttController)
   .post('/mqtt/unsubscribe', controller.mqttController)
   .get('/properties/autorequest', controller.getAutoPropertiesEnable)
   .delete('/properties/autorequest',controller.getAutoPropertiesDisable);

   // Define your own below ...

module.exports = router;