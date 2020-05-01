/**
 * redis.js
 * Interface to REDIS DB
 * @interface
 */

var redis = require("redis");
var config = require('../configuration');
var client = redis.createClient(config.dbPort, config.dbHost);
var Log = require('../../_classes/logger');
var logger = new Log();

// Exposes functions for working with the cache db REDIS
module.exports = {
  // CACHE
  /**
   * Listens to incoming proerpty requests 
   * Acts as a middleware
   * If the key exists retrieve value from cache
   */
  getCached: (req, res, next) => {
    let redis_key = req.path;
    if(config.cache){
      client.get(redis_key, function(err, reply) {
        if (err) {
          logger.error("Error reading cache", "REDIS");
          res.status(500).json({
            message: "Something Went Wrong"
          })
        }
        if (reply == null) {
          logger.debug("Cache miss " + redis_key, "REDIS");
          next();
        } else {
          logger.debug("Cache hit " + redis_key, "REDIS");
          let response = JSON.parse(reply);  
          res.status(200).json(response);
        }
      });
    } else {
      next(); 
    }
  },
  /**
   * Store value in cache after request to the source API
   * TTL is configurable
   */
  caching: (key, data) => {
    logger.debug("Cache adition " + key + ": " + data, "REDIS");
    client.set(key, JSON.stringify(data), 'EX', config.cacheTtl)
  },
  /**
   * Remove manually key stored for the cache
   */
  delCache: (key) => {
    client.del(key)
  },
  // INIT
  start: () => {
    client.on("error", function (err) {
        logger.error(err, "REDIS");
        process.exit(1);
    });
    client.on("connect", function() {
        logger.info("Connected successfully to Redis!!", "REDIS");
    });
  },
  health: () => {
    return new Promise(function (resolve, reject) {
      client.ping(function(err, reply) {
        if (err) {
          logger.error(err, "REDIS");
          reject(false);
        } else {
          logger.debug("Redis is ready: " + reply, "REDIS");
          resolve(true);
        }
      });
    });
  },
  // PERSIST
  /**
   * Force saving changes to dump.rdb
   * Use to ensure critical changes will not be lost
   */
  save: () => {
    return new Promise(function (resolve, reject) {
      client.save(function(err, reply) {
        if (err) {
          logger.warn(err, "REDIS");
          resolve(false);
        } else {
          logger.info(`REDIS DB persisted: ${reply}`, "REDIS");
          resolve(reply);
        }
      });
    });
  },
  // SETS
  /**
   * Adds item to set
   * item can be an array of items or a string
   */
  sadd: (key, item) => {
    return new Promise(function (resolve, reject) {
      client.sadd(key, item, function(err, reply) {
        if (err) {
          logger.error(err, "REDIS");
          reject(false);
        } else {
          logger.debug(reply, "REDIS");
          resolve(reply);
        }
      });
    });
  },
  /**
   * Remove item from set
   * item can be an array of items or a string
   */
  srem: (key, item) => {
    return new Promise(function (resolve, reject) {
      client.srem(key, item, function(err, reply) {
        if (err) {
          logger.error(err, "REDIS");
          reject(false);
        } else {
          logger.debug(reply, "REDIS");
          resolve(reply);
        }
      });
    });
  },
  /**
   * Check if item is a set member
   */
  sismember: (key, item) => {
    return new Promise(function (resolve, reject) {
      client.sismember(key, item, function(err, reply) {
        if (err) {
          logger.error(err, "REDIS");
          reject(false);
        } else {
          logger.debug(reply, "REDIS");
          resolve(reply);
        }
      });
    });
  },
  /**
   * Count of members in set
   */
  scard: (key) => {
    return new Promise(function (resolve, reject) {
      client.scard(key, function(err, reply) {
        if (err) {
          logger.error(err, "REDIS");
          reject(false);
        } else {
          logger.debug(reply, "REDIS");
          resolve(reply);
        }
      });
    });
  },
  /**
   * Retrieve all set members
   */
  smembers: (key) => {
    return new Promise(function (resolve, reject) {
      client.smembers(key, function(err, reply) {
        if (err) {
          logger.error(err, "REDIS");
          reject(false);
        } else {
          logger.debug(reply, "REDIS");
          resolve(reply);
        }
      });
    });
  },
  // HASH
  /**
   * Get value of a key in a hash
   * key can be array of keys
   */
  hget: (hkey, key) => {
    return new Promise(function (resolve, reject) {
      client.hget(hkey, key, function(err, reply) {
        if (err) {
          logger.error(err, "REDIS");
          reject(false);
        } else {
          logger.debug(reply, "REDIS");
          resolve(reply);
        }
      });
    });
  },
  /**
   * Set value of a key in a hash
   * @param {object} obj {key1:val1, key2:val2, ...}
   */
  hset: (hkey, field, value) => {
    return new Promise(function (resolve, reject) {
      client.hset(hkey, field, value, function(err, reply) {
        if (err) {
          logger.error(err, "REDIS");
          reject(false);
        } else {
          logger.debug(reply, "REDIS");
          resolve(reply);
        }
      });
    });
  },
  /**
   * Remove key in a hash
   * key can be array of keys
   */
  hdel: (hkey, key) => {
    return new Promise(function (resolve, reject) {
      client.hdel(hkey, key, function(err, reply) {
        if (err) {
          logger.error(err, "REDIS");
          reject(false);
        } else {
          logger.debug(reply, "REDIS");
          resolve(reply);
        }
      });
    });
  },
  /**
   * Check if key exists in hash
   */
  hexists: (hkey, key) => {
    return new Promise(function (resolve, reject) {
      client.hexists(hkey, key, function(err, reply) {
        if (err) {
          logger.error(err, "REDIS");
          reject(false);
        } else {
          logger.debug(reply, "REDIS");
          resolve(reply);
        }
      });
    });
  },
  /**
   * Get all key:value in a hash
   */
  hgetall: (hkey) => {
    return new Promise(function (resolve, reject) {
      client.hgetall(hkey, function(err, reply) {
        if (err) {
          logger.error(err, "REDIS");
          reject(false);
        } else {
          logger.debug(reply, "REDIS");
          resolve(reply);
        }
      });
    });
  }
}
