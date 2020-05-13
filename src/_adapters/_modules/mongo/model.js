var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var entry = new Schema({
    oid: {type: String, required: true},
    pid: {type: String, required: true},
    value: {type: Number, required: true},
    date: { type: Date, default: Date.now }
});

var item = new Schema({
    name: {type: String, required: true},
    oid: {type: String, required: true},
    type: {type: String, required: true},
    organisation: {type: String, required: true},
    ownerid: {type: String, required: true},
    dateUpdated: Date,
    colour: String,
    properties: [ {
      pid: String,
      monitors: String,
      value: String,
      ts: Date
    } ]
});

var notification = new Schema({
    id: {type: String, required: true},
    info: {type: String, required: true},
    type: {type: Number, required: true},
    status: {type: String, required: true},
    read: {type: Boolean, default: false},
    date: { type: Date, default: Date.now }
});

entry.set('autoIndex',true);
item.set('autoIndex',true);
notification.set('autoIndex',true);

module.exports.entry = mongoose.model('entry', entry);
module.exports.item = mongoose.model('item', item);
module.exports.notification = mongoose.model('notification', notification);
