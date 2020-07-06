/**
* controllers.js
* Process simple incoming from adapter API
* Send to other modules for advanced processing 
*/ 

const mqttServices = require('../_modules/mqtt');
const adapter = require('../interface')

// MQTT Controllers

/**
 * MQTT controller
 * For subscribe and unsubscribe add body
 * @param {object} {"topic": "", "event": ""}
 */
module.exports.mqttController = function(req, res){
    let path = req.path;
    let body = req.body || null;
    let topic = body ? body : null;
    let n = path.lastIndexOf('/');
    let action = path.substring(n + 1);
    try{
        mqttServices[action](topic);
        res.json({error: false, message: action + ' DONE'});
    } catch(err) {
        res.json({error: true, message: `${action} FAILED, find more info in the logs...`});
    }
}

    // Get all properties automatically (in mapper.json)

    module.exports.getAutoPropertiesEnable = function(req, res){
        adapter.startPropertiesCollection();
        res.send('Automatic data collection enabled');
    }

    module.exports.getAutoPropertiesDisable = function(req, res){
        adapter.stopPropertiesCollection();
        res.send('Automatic data collection disabled');
    }