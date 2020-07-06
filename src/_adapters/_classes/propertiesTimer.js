/**
 * propertiesTimer.js
 * Collects properties every interval
 * Uses the NodeJS built in timer
 * @class
 */

// Load VICINITY AGENT
const vcntagent = require('bavenir-agent');

const config = require('../configuration');
const gateway = vcntagent.gateway;
const persistance = vcntagent.persistance;
const Log = vcntagent.classes.logger;
let customTimer = vcntagent.classes.timer;
const mongo = require('../_modules/mongo')

 module.exports = class propertiesTimer extends customTimer{

    constructor(){
        super();
    }

    // Inherits start() and stop()

    // Private functions

    /**
     * Define some activity that needs to be repeated in intervals of time
     */
    async _action(){
        let logger = new Log();
        try{
            // Loading all urls that can be called (defined in dataurls.json)
            // Those are a combination oid + interaction + interaction_id
            let mapper = await persistance.getItem('dataurls', null);
            logger.debug(mapper)
            for(let i=0, l=mapper.length; i<l; i++){
                if(mapper[i].interaction === 'property'){
                    let response = await gateway.getProperty(config.serviceOid, mapper[i].oid, mapper[i].interaction_id);
                    // DO STH WITH THE RESPONSE
                    mongo.insert(mapper[i].oid, mapper[i].interaction_id, response);
                }
            }
        } catch(err) {
            logger.error(err, 'ADAPTER');
            return Promise.resolve(err);
        }
    }

}