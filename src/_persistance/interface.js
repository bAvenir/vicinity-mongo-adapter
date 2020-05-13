/**
* interfaces.js
* Interface to interact with the persistance layer
* @interface
*/ 

const Log = require('../_classes/logger');
const fileMgmt = require('./_modules/fileMgmt');
const redis = require('./_modules/redis');
const services = require('./services');

// External files

/**
 * Imports configuration files to memory
 */
module.exports.loadConfigurationFile = async function(fileType){
    let logger = new Log();
    try{ 
        let file = await fileMgmt.read(`./agent/imports/${fileType}.json`);
        let array = JSON.parse(file);
        let countRows = array.length;
        if(countRows>0){
            await services.storeInMemory(fileType, array);
            return Promise.resolve(array);
        } else {
            logger.info(`There are no ${fileType} available to load`, "PERSISTANCE");
            return Promise.resolve(array);
        }
    } catch(err) {
        logger.error(err, "PERSISTANCE")
        return Promise.reject(false)
    }
}

/**
 * Exports registrations or interactions to file
 */
module.exports.saveConfigurationFile = async function(fileType){
    let logger = new Log();
    try{ 
        let data = await services.getFromMemory(fileType);
        await fileMgmt.write(`./agent/exports/${fileType}.json`, data);
        return Promise.resolve(true);
    } catch(err) {
        logger.error(err, "PERSISTANCE")
        return Promise.reject(false)
    }
}

// MANAGE OIDs and Credentials

/**
 * Get credentials for one OID
 * From memory
 */
module.exports.getCredentials = async function(oid){
    let logger = new Log();
    try{ 
        let credentials = await redis.hget(oid, 'credentials');
        return Promise.resolve(credentials);
    } catch(err) {
        logger.error(err, "PERSISTANCE")
        return Promise.reject(false)
    }
}

/**
 * Add new OIDs - VICINTY OBJECTS
 * To memory
 */
module.exports.addCredentials = async function(oid){
    let logger = new Log();
    try{ 
        await services.addOid(oid);
        return Promise.resolve(true);
    } catch(err) {
        logger.error(err, "PERSISTANCE")
        return Promise.reject(false)
    }
}

/**
 * Remove old OIDs - VICINTY OBJECTS
 * From memory
 * @param {array} oids VICINITY IDs
 */
module.exports.removeCredentials = async function(oids){
    let logger = new Log();
    try{ 
        for(let i = 0, l = oids.length; i<l; i++){
            await services.removeOid(oids[i]);
        }
        // Persist changes to dump.rdb
        await redis.save();
        return Promise.resolve(true);
    } catch(err) {
        logger.error(err, "PERSISTANCE")
        return Promise.reject(false)
    }
}

/**
 * Get all OIDs - VICINTY OBJECTS
 * Retrieves array of oids or just one oid and complete object (If oid provided)
 * From memory
 */
module.exports.getLocalObjects = async function(oid){
    let logger = new Log();
    try{ 
        let registrations = [];
        if(oid){
            registrations = await redis.hgetall(oid);
        } else {
            registrations = await redis.smembers('registrations');
        }
        return Promise.resolve(registrations);
    } catch(err) {
        logger.error(err, "PERSISTANCE")
        return Promise.reject(false)
    }
}

/**
 * Get count of local objects registered
 */
module.exports.getCountOfRegistrations = async function(){
    let logger = new Log();
    try{ 
        let count = await redis.scard('registrations');
        return Promise.resolve(count);
    } catch(err) {
        logger.error(err, "PERSISTANCE")
        return Promise.reject(false)
    }
}

// MANAGE INTERACTION OBJECTS

/**
 * Get an interaction previously stored
 * Interactions are user defined
 * @param {string} type (preperties, actions, events)
 * @param {string} id interaction name
 * @returns {object} JSON with TD interaction schema
 */
module.exports.getInteractionObject = async function(type, id){
    let logger = new Log();
    let obj;
    try{
        if(id){
            obj = await redis.hget(type + ":" + id, "body");
        } else {
            obj = await redis.smembers(type);
        }
        return Promise.resolve(obj);
    } catch(err) {
        logger.error(err, "PERSISTANCE")
        return Promise.reject(false)
    }
}

/**
 * Add interaction objects
 * Interactions are user defined
 * @param {string} type (preperties, actions, events)
 * @param {object} body interaction body
 */
module.exports.addInteractionObject = async function(type, body){
    let logger = new Log();
    try{ 
        let result = await services.storeInMemory(type, [body]);
        return Promise.resolve(result);
    } catch(err) {
        logger.error(err, "PERSISTANCE")
        return Promise.reject(false)
    }
}

/**
 * Remove interaction objects
 * Interactions are user defined
 * @param {string} type (preperties, actions, events)
 * @param {string} id interaction name
 */
module.exports.removeInteractionObject = async function(type, id){
    let logger = new Log();
    try{ 
        await redis.srem(type, id);
        await redis.hdel(`${type}:${id}`, 'body');
        await redis.hdel(`${type}:${id}`, 'vicinity');
        // Persist changes to dump.rdb
        await redis.save();
        return Promise.resolve(true);
    } catch(err) {
        logger.error(err, "PERSISTANCE")
        return Promise.reject(false)
    }
}

/**
 * Check if incoming request is valid
 * Oid exists in infrastructure and has pid
 */
module.exports.combinationExists = async function(oid, pid){
    try{
        let exists = await redis.sismember('registrations', oid);
        if(!exists) throw new Error(`Object ${oid} does not exist in infrastructure`);
        let properties = await redis.hget(oid, 'properties');
        let p = properties.split(',');
        if(p.indexOf(pid) === -1 ) throw new Error(`Object ${oid} does not have property ${pid}`);
        return Promise.resolve(true);
    } catch(err){
        return Promise.reject(err);
    }    
}

// Configuration info MANAGEMENT

/**
 * Store configuration information
 * Needs to be removed first 
 */
module.exports.reloadConfigInfo = async function(){
    try{ 
        await services.removeConfigurationInfo();
        await services.addConfigurationInfo();
        return Promise.resolve(true);
    } catch(err) {
        return Promise.reject("Problem storing configuration information...")
    }
}

/**
 * Get configuration information
 * From memory
 */
module.exports.getConfigInfo = async function(){
    try{
        await services.removeConfigurationInfo();
        await services.addConfigurationInfo();
        let result = await redis.hgetall('configuration');
        return Promise.resolve(result);
    } catch(err) {
        logger.error(err, "PERSISTANCE")
        return Promise.reject("Problem retrieving configuration information...")
    }
}

/**
 * Get Interactions or registrations array
 * If id is provided get the related object
 * From memory
 * @param {string} type registrations or interaction type
 * @param {string} id OPTIONAL
 */
module.exports.getConfigDetail = async function(type, id){
    let result;
    try{
        if(id){
            let hkey = type === 'registrations' ? id : `${type}:${id}`;
            result = await redis.hgetall(hkey);
            if(type !== 'registrations' && result) result = JSON.parse(result.body);
        } else {
            result = await redis.smembers(type);
        }
        return Promise.resolve(result);
    } catch(err) {
        logger.error(err, "PERSISTANCE")
        return Promise.reject("Problem retrieving configuration details...")
    }
}

// CACHE

/**
 * Add property request to cache
 */
module.exports.addToCache = async function(key, data){
    try{
        redis.caching(key, data);
        return Promise.resolve(true);
    } catch(err){
        return Promise.resolve(false);
    }
}

// System Health

/**
 * Check Redis availability
 */
module.exports.redisHealth = async function(){
    try{
        await redis.health();
        return Promise.resolve('OK');
    } catch(err){
        return Promise.resolve(false);
    }
}

// MAPPINGS 

/**
 * Get all mappers
 */
module.exports.getMappers = async function(){
    try{
        let aux = [];
        let result = [];
        let mappers = await redis.smembers('MAPPERS');
        for(let i=0, l=mappers.length; i<l; i++){
            aux = mappers[i].split(':');
            result.push({'oid': aux[0], 'eid': aux[1], 'name': aux[2], 'type': aux[3], 'ownerId': aux[4], 'ownerName': aux[5]});
        }
        return Promise.resolve(result);
    } catch(err){
        return Promise.resolve(false);
    }
}
