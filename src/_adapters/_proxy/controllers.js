/**
* controllers.js
* Process incoming gateway requests
*/ 

const adapter = require('../interface');

// ***** Gateway proxy *****

    /**
     * Receive property request from gateway
     * @param {STRING} id (local VICINITY OID)
     * @param {STRING} pid (local VICINITY Property)
     */
    module.exports.proxyGetProperty = function(req, res){
        let oid = req.params.id;
        let pid = req.params.pid;
        adapter.proxyGetProperty(oid, pid)
        .then((response) => {
            res.json(response)
        })
        .catch((err) => {
            res.send(err)
        }) 
    }

    /**
     * Receive property update request from gateway
     * @param {STRING} id (local VICINITY OID)
     * @param {STRING} pid (local VICINITY Property)
     */
    module.exports.proxySetProperty = function(req, res){
        let oid = req.params.id;
        let pid = req.params.pid;
        let body = req.body;
        adapter.proxySetProperty(oid, pid, body)
        .then((response) => {
            res.json(response)
        })
        .catch((err) => {
            res.json(err)
        }) 
    }

    /**
     * Receive event publication on subscribed channel
     * @param {STRING} id (local VICINITY OID)
     * @param {STRING} eid (remote VICINITY Event)
     */
    module.exports.proxyReceiveEvent = function(req, res){
        let oid = req.params.id;
        let eid = req.params.eid;
        let body = req.body;
        adapter.proxyReceiveEvent(oid, eid, body);
        res.send('Event received');
    }