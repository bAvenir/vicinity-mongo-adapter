/**
 * proxy.js
 * Responds incoming requests by sending to another user API/app that will provide response
 * Adapter acts as a proxy
 */

 // Load VICINITY AGENT
const vcntagent = require('bavenir-agent');
const Req = vcntagent.classes.request;

 let fun = {};

    fun.getProperty = async function(oid, pid, url){
        try{
            let request = new Req();
            request.setUri(url, '/get');
            request.setMethod('POST');
            request.addHeader('Content-Type', 'application/json');
            request.setBody({oid: oid, pid: pid});
            let result = await request.send();
            return Promise.resolve(result)
        } catch(err) {
            return Promise.reject(err);
        }
    }

    fun.setProperty = async function(oid, pid, body, url){
        try{
            let request = new Req();
            request.setUri(url, '/set');
            request.setMethod('POST');
            request.addHeader('Content-Type', 'application/json');
            request.setBody({oid: oid, pid: pid, body: body});
            let result = await request.send();
            return Promise.resolve(result)
        } catch(err) {
            return Promise.reject(err);
        }
    }

    fun.receiveEvent = async function(oid, eid, body, url){
        try{
            let request = new Req();
            request.setUri(url, '/event');
            request.setMethod('POST');
            request.addHeader('Content-Type', 'application/json');
            request.setBody({oid: oid, eid: eid, body: body});
            let result = await request.send();
            return Promise.resolve(result)
        } catch(err) {
            return Promise.reject(err);
        }
    }

 module.exports = fun;