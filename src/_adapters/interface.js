/**
* interface.js
* Process incoming requests coming from the gateway
* The behaviour of this module depends on the properties set on the configuration file:
* - response_mode and data_collection
* The incoming messages can be:
* - Request to send property value
* - Request to update property value
* - Receive event from subscribed value
*/ 

// Load VICINITY AGENT
const vcntagent = require('bavenir-agent');

// Imports
const Log = vcntagent.classes.logger;
const persistance = vcntagent.persistance;
const CustomTimer = require('./_classes/propertiesTimer');
// Configuration Modes
const config = require('./configuration');
const responseMode = config.responseMode;
const collectionMode = config.dataCollectionMode;
const proxyUrl = config.proxyUrl;
// Modules
const dummyModule = require('./_modules/dummy');
const proxyModule = require('./_modules/proxy');
const mongoModule = require('./_modules/mongo');

// Create global events object
let propertiesCollector = new CustomTimer();

// TBD Include other adapter modules when available
// TBD Handle actions sent by gtw

/**
 * Redirects incoming property requests
 * Response of the adapter depends on the configuration
 * @param {STRING} oid (local VICINITY OID)
 * @param {STRING} pid (local VICINITY Property)
 */
module.exports.proxyGetProperty = async function(oid, pid){
    let logger = new Log();
    let result;
    try{
        // await persistance.combinationExists(oid, pid);
        switch (responseMode) {
            case 'dummy':
                result = dummyModule.getProperty(oid, pid);
                break;
            case 'proxy':
                result = await proxyModule.getProperty(oid, pid, proxyUrl);
                break;
            default:
                throw new Error('ADAPTER ERROR: Selected module could not be found');
        }
        persistance.addToCache(`/objects/${oid}/properties/${pid}`, result);
        logger.debug(`Responded to get property ${pid} of ${oid} in mode: ${responseMode}`, "ADAPTER");
        return Promise.resolve(result);
    } catch(err) {
        logger.error(err, "ADAPTER")
        return Promise.reject({error: true, message: err.message})
    }
}

/**
 * Redirects incoming update property requests
 * Response of the adapter depends on the configuration
 * @param {STRING} oid (local VICINITY OID)
 * @param {STRING} pid (local VICINITY Property)
 * @param {OBJECT} body
 */
module.exports.proxySetProperty = async function(oid, pid, body){
    let logger = new Log();
    let result;
    try{ 
        await persistance.combinationExists(oid, pid);
        switch (responseMode) {
            case 'dummy':
                result = dummyModule.setProperty(oid, pid);
                break;
            case 'proxy':
                result = await proxyModule.setProperty(oid, pid, body, proxyUrl);
                break;
            default:
                throw new Error('ADAPTER ERROR: Selected module could not be found');
        }

        logger.debug(`Responded to set property ${pid} of ${oid} in mode: ${responseMode}`, "ADAPTER");
        return Promise.resolve(result);
    } catch(err) {
        logger.error(err, "ADAPTER")
        return Promise.reject({error: true, message: err.message})
    }
}

/**
 * Redirects incoming event
 * Event messages come from some subscribed channel
 * The event will be processed in different way depending on configuration
 * @param {STRING} oid (local VICINITY OID)
 * @param {STRING} eid (local VICINITY Event)
 * @param {OBJECT} body
 */
module.exports.proxyReceiveEvent = async function(oid, eid, body){
    let logger = new Log();
    try{ 
        // TBD Check if combination of oid + pid exists

        switch (collectionMode) {
            case 'dummy':
                let event = Object.keys(body).length === 0 ? "Empty body" : JSON.stringify(body);
                logger.info(`Event received from channel ${eid} of ${oid}: ${event}`, "ADAPTER");
                break;
            case 'proxy':
                await proxyModule.receiveEvent(oid, eid, body, proxyUrl);
                break;
            case 'mongo':
                await mongoModule.insert(oid, eid, body);
                break;
            default:
                throw new Error('ADAPTER ERROR: Selected module could not be found');
        }
        logger.debug(`Event received from channel ${eid} of ${oid} in mode: ${collectionMode}`, "ADAPTER");
    } catch(err) {
        logger.error(err, "ADAPTER")
    }
}


/**
 * Starts collection of properties
 * Uses mapper.json to find what requests have to be done
 */
module.exports.startPropertiesCollection = function(){
    let logger = new Log();
    propertiesCollector.start();
    logger.info('Automatic properties collection started', 'ADAPTER');
}


/**
 * Stops collection of properties
 * Uses mapper.json to find what requests have to be done
 */
module.exports.stopPropertiesCollection = function(){
    let logger = new Log();
    propertiesCollector.stop();
    logger.info('Automatic properties collection stopped', 'ADAPTER');
}
