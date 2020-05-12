/**
 * mongo.js
 * Module to provide basic interaction with mongo
 * Setup and connection
 */
const mongoose = require('mongoose');
const config = require('../../configuration');
const Log = require('../../../_classes/logger');

module.exports.connect = function(){
    let logger = new Log();
    let mongoString = `mongodb://${config.mongoUser}:${config.mongoPwd}@${config.mongoUrl}:${config.mongoPort}/${config.mongoDb}`;
    return new Promise(function(resolve, reject) {
        mongoose.connect(mongoString, {useUnifiedTopology: true, useNewUrlParser: true}, function(error){
            if (error){
                logger.error("Couldn't connect to data source!" + error);
                reject(false);
            } else {
                logger.info(`Connection established with Mongo on port ${config.mongoPort} with db ${config.mongoDb}`);
                resolve(true);
            }
        });
    });
}