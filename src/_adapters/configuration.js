/**
 * ADAPTER configuration parameters
 * Included in .env (at project root)
 */

const dotenv = require('dotenv');

// Read configuration      
dotenv.config();

// Configuration object to export
let config = module.exports = {};

// Argument passed to node when starting app
config.responseMode = process.env.ADAPTER_RESPONSE_MODE || "dummy";
config.dataCollectionMode = process.env.ADAPTER_DATA_COLLECTION_MODE || "dummy";
config.proxyUrl = process.env.ADAPTER_PROXY_URL || "http://localhost:8000";
config.mongoUrl = process.env.MONGO_URL || localhost;
config.mongoPort = process.env.MONGO_PORT || 27017;
config.mongoDb = process.env.MONGO_INITDB_DATABASE;
config.mongoUser = process.env.MONGO_NON_ROOT_USERNAME;
config.mongoPwd = process.env.MONGO_NON_ROOT_PASSWORD;