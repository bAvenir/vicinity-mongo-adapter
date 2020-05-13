/**
@item class
*/

// Global packages
let itemOp = require('./model').item;
let entryOp = require('./model').entry;
const persistance = require('../../../_persistance/interface');
const gateway = require('../../../_agent/interface');


// Public Constructor
module.exports = class Item {
  constructor(data) {
      this.item = {};
      this.item.oid = data.oid;
      this.item.name = data.name;
      this.item.type = "adapters:" + data.type;
      this.item.ownerid = data.ownerId;
      this.item.organisation = data.ownerName;
      this.item.dateUpdated = new Date();
      this.item.colour = this._random_rgba();
  }

  // Methods

  /**
   * Add new or update old item
   */
  async upsert() { 
    try{
        await itemOp.findOneAndRemove({oid: this.item.oid})
        let item = new itemOp(this.item);
        await item.save();
        return Promise.resolve(true);
    } catch(err) {
        return Promise.reject(err);
    }
  }

  /**
   * Update only properties to last status
   */
    async updateProperties(array) {
        try{
            for(let i=0, l=array.length; i<l; i++){
            array[i].value = await Item.queryProperty(this.item.oid, array[i].pid);
            }
            this.item.properties = array;
            return Promise.resolve(true);
        } catch(err) {
            return Promise.reject(err);
        }
    }

  // Static methods

  static async getAllItems(){
      try{
        let response =  await itemOp.find().lean();
        return Promise.resolve(response);
      } catch(err) {
        return Promise.reject(err);
      }
  }

  static async getItem(oid){
    try{
        let response =  await itemOp.findOne({oid: oid}).lean();
        return Promise.resolve(response);
      } catch(err) {
        return Promise.reject(err);
      }
  }

  /**
   * Query remote adapter for all device properties
   */
  static async queryProperty(oid, pid) {  
    try{
        // TODO Improve method to retrieve service OID
        let registrations = await persistance.getLocalObjects(); // We use first registration as should be service
        let result = await gateway.getProperty(registrations[0], oid, pid);
        return Promise.resolve(result.message[0].value);
    } catch(err) {
        return Promise.resolve(null);
      }
  }

  /**
   * Store data into entries
   * Data comes from events
   * @param {Object} data 
   */
  static async storeEntries(data){
    try{

      // Add entries
      // let todo = [];
      // let entryP_PV = new entryOp({oid: data.oid, pid: "InverterActualActivePower", value: data["P_PV"]});
      // let entryP_Grid = new entryOp({oid: data.oid, pid: "InverterGridActivePowerLoad", value: data["P_Grid"]});
      // let entryP_Load = new entryOp({oid: data.oid, pid: "InverterConsumerActivePowerLoad", value: data["P_Load"]});
      // todo.push(entryP_PV.save(), entryP_Grid.save(), entryP_Load.save());
      // await Promise.all(todo);

      // Update Item property values and store entries
      let response =  await itemOp.findOne({oid: data.oid}, {properties: 1}).lean();
      let itemProperties = response.properties;
      let newProperties = [];
      let current_date =  new Date();
      let todo = [];
      for(let i=0, l=itemProperties.length; i<l; i++){
        newProperties.push({
          monitors: itemProperties[i].monitors,
          pid: itemProperties[i].pid,
          value: data[itemProperties[i].pid],
          ts: current_date
        })
        if(itemProperties[i].pid !== "IsOnline"){
          let aux = new entryOp({oid: data.oid, pid: itemProperties[i].monitors, value: data[itemProperties[i].pid]});
          todo.push(aux.save());
        } 
      }
      todo.push(itemOp.update({oid: data.oid}, {$set: {properties: newProperties } }) );
      await Promise.all(todo);
      return Promise.resolve(data.oid);
    } catch(err) {
      return Promise.reject(err);
    }
  }

  // Private method

    _random_rgba() {
	    let o = Math.round, r = Math.random, s = 255;
	    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',1)';
    }

}