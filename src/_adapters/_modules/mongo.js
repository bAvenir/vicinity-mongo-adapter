/**
 * mongo.js
 * Module to provide basic interaction with mongo
 * Setup and connection
 */
const MongoClient = require('mongodb').MongoClient;
let db; 
const config = require('../configuration');
const Log = require('bavenir-agent').classes.logger;
let logger = new Log();

module.exports.connect = function(){
    // Database Name
    const dbName = config.mongoDb;
    // Connection URL
    const url = `mongodb://${config.mongoUrl}:${config.mongoPort}/${dbName}`;
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, function(err, client) {
            if(err) reject(false)
            logger.info("Connected successfully to server", "MONGO");
            db = client.db(dbName);
            resolve(true)
        });
    });
}

module.exports.insert = function(oid, pid, data){
  // Get the documents collection
  const collection = db.collection('entries');
  // Insert some documents
  return new Promise(function(resolve, reject) {
    collection.insert(
            {date: new Date(), value: data, oid: oid, pid:pid}, function(err, result) {
            if(err) reject(false)
            logger.debug(result, 'MONGO');
            resolve(true);
        });
    });
}