/**
* services.js
* Methods and functionality for the persistance module
*/

const redis = require('./_modules/redis');
const gateway = require('../_agent/services');
const Log = require('../_classes/logger');
// Define possible interactions
const interactions = {
    "properties" : {"id": "pid", "does": "monitors"},
    "actions" : {"id": "aid", "does": "affects"},
    "events" : {"id": "eid", "does": "monitors"}
}

let fun = {};

// Public functions

/**
 * Stores interactions in memory
 * They are used to generate TDs during registrations
 */
fun.storeInMemory = async function(type, array){
    try{
        let result;
        if(type === 'registrations'){
            for(let i = 0, l = array.length; i<l; i++){
                result = await fun.addOid(array[i]);
            }
        } else if(type === 'mapper') {
            result = await _storeMapper(array);
        } else {
            result = await _storeInteractions(type, array);
        }
        // Persist changes to dump.rdb
        await redis.save();
        return Promise.resolve(result);
    } catch(err) {
        return Promise.reject(err);
    }
}

/**
 * Gets interactions or registrations from memory
 */
fun.getFromMemory = async function(type){
    try{
        let result;
        if(type === 'registrations'){
            let oids = await redis.smembers(type);
            let todo = [];
            for(let i = 0, l = oids.length; i<l; i++){
                todo.push(redis.hgetall(oids[i]));
            }
            result = await Promise.all(todo);
            result = JSON.stringify(result);
        } else {
            let interactions = await redis.smembers(type);
            result = '['
            for(let i = 0, l = interactions.length; i<l; i++){
                if(i === 0){
                    result = result + await redis.hget(`${type}:${interactions[i]}`, 'body'); 
                } else {
                    result = result + ',' + await redis.hget(`${type}:${interactions[i]}`, 'body'); 
                }
            }
            result = result + ']';
        }
        return Promise.resolve(result);
    } catch(err) {
        return Promise.reject(err);
    }
}

fun.addOid = async function(data){
    let logger = new Log();
    try{ 
        let todo = [];
        if(!data.credentials || !data.password || !data.adapterId || !data.name || !data.type ){
            throw new Error(`Object with oid ${data.oid} misses some fields, its credentials could not be stored...`);
        }
        let exists = await redis.sismember('registrations', data.oid);
        if(!exists){
            todo.push(redis.sadd('registrations', data.oid));
            todo.push(redis.hset(data.oid, 'oid', data.oid));
            todo.push(redis.hset(data.oid, 'credentials', data.credentials));
            todo.push(redis.hset(data.oid, 'password', data.password));
            todo.push(redis.hset(data.oid, 'adapterId', data.adapterId));
            todo.push(redis.hset(data.oid, 'name', data.name));
            todo.push(redis.hset(data.oid, 'type', data.type));
            if(data.properties && data.properties.length) todo.push(redis.hset(data.oid, 'properties', data.properties.toString()));
            if(data.events && data.events.length) todo.push(redis.hset(data.oid, 'events', data.events.toString()));
            if(data.actions && data.actions.length) todo.push(redis.hset(data.oid, 'agents', data.agents.toString()));
            await Promise.all(todo);
        } else {
            logger.warn(`OID: ${data.oid} is already stored in memory.`, "PERSISTANCE")
        }
        if(data.events && data.events.length) await gateway.activateEventChannels(data.oid, data.events);
        return Promise.resolve(true);
    } catch(err) {
        logger.warn(err, "PERSISTANCE")
        return Promise.resolve(false)
    }
}

fun.removeOid = async function(oid){
    let logger = new Log();
    try{ 
        let todo = [];
        todo.push(redis.srem('registrations', oid));
        todo.push(redis.hdel(oid, 'credentials'));
        todo.push(redis.hdel(oid, 'password'));
        todo.push(redis.hdel(oid, 'type'));
        todo.push(redis.hdel(oid, 'name'));
        todo.push(redis.hdel(oid, 'adapterId'));
        todo.push(redis.hdel(oid, 'properties'));
        todo.push(redis.hdel(oid, 'events'));
        todo.push(redis.hdel(oid, 'agents'));
        await Promise.all(todo);
        return Promise.resolve(true);
    } catch(err) {
        logger.error(err, "PERSISTANCE")
        return Promise.reject(false)
    }
}


/**
 * Adds configuration of agent info
 * To memory
 */
fun.addConfigurationInfo = async function(){
    let logger = new Log();
    try{ 
        let d = new Date();
        let numregis = await redis.scard('registrations');
        let numprops = await redis.scard('properties');
        let numactions = await redis.scard('actions');
        let numevents = await redis.scard('events');
        await redis.hset("configuration", "date", d.toISOString());
        await redis.hset("configuration", "registrations", numregis);
        await redis.hset("configuration", "properties", numprops);
        await redis.hset("configuration", "actions", numactions);
        await redis.hset("configuration", "events", numevents);
        return Promise.resolve(true);
    } catch(err) {
        logger.error(err, "PERSISTANCE")
        return Promise.reject(false)
    }
}

 /**
 * Removes configuration of agent info
 * From memory
 */
fun.removeConfigurationInfo = async function(){
    let logger = new Log();
    try{ 
        await redis.hdel("configuration", "date");
        await redis.hdel("configuration", "registrations");
        await redis.hdel("configuration", "properties");
        await redis.hdel("configuration", "actions");
        await redis.hdel("configuration", "events");
        return Promise.resolve(true);
    } catch(err) {
        logger.error(err, "PERSISTANCE")
        return Promise.reject(false)
    }
}

// Private functions

/**
 * Stores user defined interactions in memory
 * @param {string} type (preperties, actions, events)
 * @param {array} array interactions array with JSONs
 */
async function _storeInteractions(type, array){
    let logger = new Log();
    let interaction =  interactions[type];
    let id = interaction['id'];
    let does = interaction['does'];
    let success = true; // Case some interaction is not valid, no error but no success either
    logger.debug(`Storing ${type}...`, "PERSISTANCE")
    for(let i=0, l=array.length; i<l; i++){
        try{
            let aux = array[i][id] == null ? "test" : array[i][id]; // Avoid type error in redis
            let exists = await redis.sismember(type, aux);
            let notNull = (array[i][id] != null && array[i][does] != null);
            if(!exists && notNull){
                await redis.sadd(type, array[i][id]);
                await redis.hset(`${type}:${array[i][id]}`, 'body', JSON.stringify(array[i]));
                await redis.hset(`${type}:${array[i][id]}`, 'vicinity', array[i][does]);
                logger.debug(`${type} entry ${i} : ${array[i][id]} stored`, "PERSISTANCE");
            } else {
                if(exists) logger.warn(`${type} entry ${i} already exists`, "PERSISTANCE");
                if(!notNull) logger.warn(`${type} entry ${i} misses id or interaction`, "PERSISTANCE");
                success = false;
            }
        } catch(err) {
            return Promise.reject(err);
        }
    }
    return Promise.resolve(success);
}

/**
 * Stores mapper in memory
 * @param {array} array map array with JSONs
 */
async function _storeMapper(array){
    let logger = new Log();
    try{  
        await redis.delCache('MAPPERS');
        for(let i=0, l=array.length; i<l; i++){
            if(array[i].oid && array[i].event){
                await redis.sadd('MAPPERS', `${array[i].oid}:${array[i].event}:${array[i].name}:${array[i].type}:${array[i].ownerId}:${array[i].ownerName}`);
            }
        }
        logger.info('Mappings loaded', 'PERSISTANCE');
        return Promise.resolve(true);
    } catch(err) {
        return Promise.reject(err);
    }
}

// Export module
module.exports = fun;