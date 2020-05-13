/**
@Notifications class
type:
1 - Reset
2 - Rediscovery
*/

// Global packages
var notificationModel = require('./model').notification;

// Private

// Public Constructor
module.exports = class Notification {
  constructor(id, info, type, status) {
    if (id || info || type || status) {
      this.id = id;
      this.info = info;
      this.type = type;
      this.status = status;
    }
  }
  // Methods
  get(id) {
    return notificationModel.find({ id: id }).skip(0).limit(10).sort({ _id: -1 });
  }
  read(ids) {
    return notificationModel.updateMany({ _id: { $in: ids } }, { $set: { read: true } });
  }
  post() {
    var notif = new notificationModel(this);
    return notif.save();
  }
}




