/**
 * mongo.js
 * Module to provide basic interaction with mongo
 * Setup and connection
 */
const mongoose = require('mongoose');
const config = require('../../configuration');
const persistance = require('../../../_persistance/interface');
const agent = require('../../../_agent/agent');
const Log = require('../../../_classes/logger');
const Item = require('./item');
let eventHandler = require('../../../_adapters/interface').eventEmitter;


module.exports.connect = function(){
    let logger = new Log();
    let mongoString = `mongodb://${config.mongoUser}:${config.mongoPwd}@${config.mongoUrl}:${config.mongoPort}/${config.mongoDb}`;
    return new Promise(function(resolve, reject) {
        mongoose.connect(mongoString, {useUnifiedTopology: true, useNewUrlParser: true}, function(error){
            if (error){
                logger.error("Couldn't connect to data source!" + error, 'MONGO');
                reject(false);
            } else {
                logger.info(`Connection established with Mongo on port ${config.mongoPort} with db ${config.mongoDb}`, 'MONGO');
                resolve(true);
            }
        });
    });
}

module.exports.initialize = async function(){
    let logger = new Log();
    try{
        // Load configurations and store items
        await persistance.loadConfigurationFile('mapper');
        await persistance.loadConfigurationFile('properties');
        await _StoreItems();
        // Subscribe to events
        await agent.unsubscribeEvents();
        await agent.subscribeEvents();
        logger.info('Events in mapper file subscribed!', 'MONGO');
        logger.info('Mongo adapter initialized!', 'MONGO');
        return Promise.resolve(true);
    } catch(err) {
        logger.error(err, 'MONGO');
        return Promise.reject(false);
    }
}

// Handle events 

eventHandler.on("pv", function(data) {
    let logger = new Log();
    Item.storeEntries(data)
    .then((oid)=>{ logger.info(`New entry stored for ${oid}`, 'MONGO'); })
    .catch((err)=>{ logger.error(err, 'MONGO'); });
});

// Private functions

/**
 * On init stores all items available in mapper.json file
 */
async function _StoreItems(){
    try{
        let properties = await persistance.getInteractionObject('properties', null);
        let initialProperties = await _initializeProperties(properties);
        let mapper = await persistance.getMappers();
        for(let i=0, l=mapper.length; i<l; i++){
            let newItem = new Item(mapper[i]);
            await newItem.updateProperties(initialProperties);
            await newItem.upsert();
        }
    } catch(err) {
        return Promise.reject(err);
    }
}

/**
 * Prepare properties object inside Item model
 * @param {array} properties 
 */
async function _initializeProperties(properties){
    let props = [];
    try{
        for(let i=0, l=properties.length; i<l; i++){
            let obj = { ts: new Date()};
            let aux = await persistance.getInteractionObject('properties', properties[i]);
            obj.pid = properties[i];
            obj.monitors = JSON.parse(aux).monitors;
            props.push(obj);
        }
        return Promise.resolve(props);
    } catch(err) {
        return Promise.reject(err);
    }
}