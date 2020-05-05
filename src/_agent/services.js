/**
 * services.js
 * Implements support functionality
 * Can be used by agent.js and controllers.js
 */

const Log = require('../_classes/logger');
const gateway = require('./interface');
const Regis = require('./_classes/registration');

let services = {};

/**
 * Perform login of all registered objects
 */
services.doLogins = async function(array){
    let logger = new Log();
    try{
        await gateway.login(); // Start always the gateway first
        let actions = [];
        for(var i = 0, l = array.length; i < l; i++){
            actions.push(gateway.login(array[i]));
        }
        await Promise.all(actions);
        logger.info('All logins finalized', "AGENT");
        return Promise.resolve("All logins finalized");
    } catch(err) {
        return Promise.reject(err);
    }
}

/**
 * Perform logout of all registered objects
 */
services.doLogouts = async function(array){
    let logger = new Log();
    try{
        let actions = [];
        for(var i = 0, l = array.length; i < l; i++){
            actions.push(gateway.logout(array[i]));
        }
        await Promise.all(actions);
        await gateway.logout(); // Stop always the gateway last
        logger.info('All logouts were successful', "AGENT");
        return Promise.resolve("Logouts were successful");
    } catch(err) {
        return Promise.reject(err);
    }
}

/**
 * Register object in platform
 * Only 1 by 1 - No multiple registration accepted
 */
services.registerObject = async function(body){
    let registration = new Regis();
    try{
        let td = await registration.buildTD(body);
        let result = await gateway.postRegistrations(td);
        if(result.message[0].error) throw new Error("Platform parsing failed, please revise error: " + JSON.stringify(result.message[0].error));
        await registration.storeCredentials(result.message[0]);
        // Login new objects
        let actions = [];
        for(var i = 0, l = result.message.length; i < l; i++){
            actions.push(gateway.login(result.message[i].oid));
        }
        await Promise.all(actions);
        return Promise.resolve(result.message);
    } catch(err) {
        return Promise.reject(err);
    }
}

/**
 * Remove object from platform
 */
services.removeObject = async function(body){
    try{
        let wrapper = Regis.addRemovalWrapper(body.oids);
        let result = await gateway.removeRegistrations(wrapper);
        await Regis.removeCredentials(body.oids);
        return Promise.resolve(result.message.message);
    } catch(err) {
        return Promise.reject(err);
    }
}

/**
 * Compare Local infrastracture with platform
 * Both should have the same objects registered
 */
services.compareLocalAndRemote = function(local, platform){
    let logger = new Log();
    try{
        let oidArray = platform.map((item)=>{ return item.id.info.oid });
        for(let i = 0, l = local.length; i<l; i++){
            if(oidArray.indexOf(local[i]) === -1) throw new Error('Local and platform objects are not the same')
        }
        logger.info('Local and platform objects match!', 'AGENT');
    } catch(err) {
        logger.warn(err, 'AGENT');
        return err;
    }
}

/**
 * Activate event channels
 */
services.activateEventChannels = async function(oid, events){
    let logger = new Log();
    try{
        if(typeof events === 'string') events = events.split(',');
        for(let i = 0, l = events.length; i<l; i++){
            // Add channels synchronously
            await gateway.activateEventChannel(oid, events[i]);
        }
        return Promise.resolve(true);
    } catch(err) {
        logger.warn('Event channels were not created, check gateway connection', 'AGENT');
        return Promise.resolve(false);
    }
}

module.exports = services;