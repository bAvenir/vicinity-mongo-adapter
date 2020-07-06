// Load VICINITY AGENT
const vcntagent = require('bavenir-agent');

// Imports
const MQTT = vcntagent.classes.mqtt;
const Log = vcntagent.classes.logger;
const config = require('../configuration');
const gateway = vcntagent.gateway;
const agent = vcntagent.services;
const persistance = vcntagent.persistance;

// Declare global objects
let client =  new MQTT(config.mqtt.host, config.mqtt.user, config.mqtt.password);
let logger =  new Log();
let functions = {};

// Available actions on MQTT client

/**
 * Connects to the MQTT server
 * - Looks in registered items for OIDs and names
 * - Checks if there are topics in mqtt.json file to be subscribed
 * - Waits for events
 */
functions.connect = async function(){
    if(_validateMqttConfig()){
        try{
            let mqttListener = await client.connect();
            await _initializeMqttItems(); 
            await _initializeMqttTopics();
            // Listeners
                mqttListener.on('connect', () => { logger.info('Connected to MQTT server', 'MQTT'); } );
                mqttListener.on('error', (error) => { logger.error(error , 'MQTT'); } );
                mqttListener.on('end', () => { logger.info('User successfully disconnected from MQTT server', 'MQTT'); } );
                mqttListener.on('close', () => { logger.warn('Broker closed connection', 'MQTT'); } );
                mqttListener.on('disconnect', () => { logger.warn('Broker closed connection', 'MQTT'); } );
                mqttListener.on('message', function(topic, message, packet) {
                    logger.info("Received " + message + " on " + topic, "MQTT");
                    _processIncomingMessage(JSON.parse(message), topic);
                });
        } catch(err) {
            logger.error(err, 'MQTT');
            client.disconnect();
            throw new Error('Connect failed...');
        }
    }
}

/**
 * Disconnect MQTT server
 */
functions.disconnect = function(){
    try{
        client.disconnect();
    } catch(err) {
        logger.error(err, 'MQTT');
        throw new Error('Disconnect failed...');
    }
}

/**
 * Subscribe a MQTT topic
 * @param {Object} data { topic: String, event: String }
 */
functions.subscribe = function(data){
    try{
        client.subscribe(data);
    } catch(err) {
        logger.error(err, 'MQTT');
        throw new Error('Subscribe failed...');
    }
}

/**
 * Unsubscribe MQTT topic
 * @param {String} topic
 */
functions.unsubscribe = function(data){
    try{
        client.unsubscribe(data.topic);
    } catch(err) {
        logger.error(err, 'MQTT');
        throw new Error('Unsubscribe failed...');
    }
}

// Make available public methods
module.exports = functions;

// Private functions

/**
 * Check if all the configuration required for running MQTT is available
 * Configuration located in .env
 */
function _validateMqttConfig(){
    let flag = true;
    if(!config.mqtt.host) flag = false ;
    if(!config.mqtt.user) flag = false;
    if(!config.mqtt.password) flag = false;
    if(!config.mqtt.infrastructureName) flag = false;
    if(!config.mqtt.itemsType) flag = false;
    if(!config.mqtt.itemsEvents) flag = false;
    if(!flag) logger.error('Missing mqtt configuration parameters', 'MQTT');
    return flag;
}

/**
 * Gets unregistered MQTT item and sends request to VICINITY
 */
async function _registerItem(body){
    try{
         let response = await agent.registerObject(body);
         let newItem = {name: body.name, "oid": response[0].oid};
         client.mqttItems = newItem;
    } catch(err) {
        logger.error(err, 'MQTT');
    }
}

/**
 * Publishes a VICINITY event
 * Last step of converting MQTT message into VICINITY event
 * @param {String} oid 
 * @param {String} eid 
 * @param {Object} body 
 */
async function _sendEvent(oid, eid, body){
    try{
        await gateway.publishEvent(oid, eid, body);
    } catch(err) {
        logger.error(err, 'MQTT');
    }
}

/**
 * Loads file with topics
 * file --> ./agent/import/mqtt.json
 * contains --> array of objects mapping MQTT topic with VICINITY event
 * [{topic: "", event: ""}]
 */
async function _initializeMqttTopics(){
    try{
        let data = await persistance.loadConfigurationFile('mqtt');
        for(let i=0,l=data.length; i<l; i++){
            client.subscribe(data[i]);
        }
        logger.info('MQTT topics loaded and subscribed', 'MQTT');
    } catch(err) {
        logger.error(err, 'MQTT');
        return Promise.resolve(false);
    }
}

/**
 * Loads already registered mqtt items 
 */
async function _initializeMqttItems(){
    try{
        let items = await persistance.getLocalObjects();
        let aux, newItem = {};
        for(let i=0,l=items.length; i<l; i++){
            aux = await persistance.getLocalObjects(items[i]);
            newItem = {name: aux.name, "oid": items[i]};
            client.mqttItems = newItem;
        }
        logger.info('MQTT items loaded', 'MQTT');
    } catch(err) {
        return Promise.reject(err);
    }
}

/**
 * Prepares information for registration
 */
function _buildBody(name){
    return {
        name: config.mqtt.infrastructureName + "_" + name,
        adapterId: name,
        type: config.mqtt.itemsType,
        events: config.mqtt.itemsEvents
    }
}

/**
 * Based on MQTT item name gets the VICINITY OID
 */
function _findOidOfMqttItem(name){
    let items = client.mqttItems;
    let id = items.findIndex((it) => {return it.name === name});
    let result = id === -1 ? null : items[id].oid;
    return result;
}

// FUNCTIONS TO BE MODIFIED DEPENDING ON STRUCTURE OF MQTT BODY

/**
 * Process incoming MQTT messages
 * This function should be modified to fit the needs of each MQTT server
 * - Sends the MQTT message as VICINITY event
 * - Registers new MQTT items sending 
 * @param {String} message 
 * @param {String} topic 
 */
async function _processIncomingMessage(message, topic){
    logger.debug('We do nothing with the mqtt message, please define some actions...', 'MQTT');
    // try{
    //     // Obtain mqttItem name of sender
    //     let topicParts = topic.split('/');
    //     let name = topicParts[2];
    //     logger.debug(name, 'DEBUG');
    //     // Get OID of MQTT item or null
    //     let oid = _findOidOfMqttItem(config.mqtt.infrastructureName + "_" + name);
    //     logger.debug(oid, 'DEBUG');
    //     // If OID exists --> Send message
    //     if(oid){
    //         // Prepare message for sending
    //         // Obtain VICNITY eid from topic
    //         // Send event
    //         let match =  _findMatching(topicParts);
    //         if(match){
    //             _sendEvent(oid, match.event, _parseMsg(message));
    //         } else {
    //             logger.debug('Topic ' + topic + ' does not have a matching event...');
    //         }
    //     } else {
    //         // Prepare body for registration
    //         // BUILD BODY with .env info about MQTT
    //         // Request registration
    //         await _registerItem(_buildBody(name));
    //         oid = _findOidOfMqttItem(config.mqtt.infrastructureName + "_" + name);
    //         if(!oid) throw new Error('There was some problem registering new item...');
    //         let match = _findMatching(topicParts);
    //         if(match){
    //             _sendEvent(oid, match.event, _parseMsg(message));
    //         } else {
    //             logger.debug('Topic ' + topic + ' does not have a matching event...');
    //         }
    //     }
    // } catch(err) {
    //     logger.error(err, 'MQTT');
    // }
}

/**
 * Find the matching VICINITY event for your MQTT channel
 * The topic received in the MQTT message might not be "generic" if wildcards were used (+,#)
 * In that case add the wildcard again to match the topic defined in mqtt.json
 *
 * In this example the third position of our topic path had a wildcard
 * Therefore the incoming message has a device_name instead of wildcard on that position
 * This function only replaces the device_name with the wildcard to match again the topic defined in mqtt.json
 *
 * THIS FUNCTION SHOULD BE MODIFIED BASED ON YOUR MQTT MESSAGE STRUCTURE
 * Mappings defined in mqtt.json
 */
function _findMatching(topicParts){
    // let topics = client.mqttTopics;
    // topicParts[2] = '+';
    // let generic_topic = topicParts.join('/');
    // let result = topics.filter((it)=>{ return it.topic === generic_topic; });
    // return result[0];
}

/**
 * Prepares message that will be sent through network
 * THIS FUNCTION SHOULD BE MODIFIED BASED ON YOUR MQTT MESSAGE STRUCTURE
 * @returns {Object}
 */
function _parseMsg(msg){
    // return { property: "test", value: 1}
}