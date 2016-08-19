//================================================================================//
//                              Event Schema                                      //
//================================================================================//

let mongoose  = require('mongoose');
let Schema    = mongoose.Schema;

let eventSchema = new Schema(
  {
    name:  { type: String, required: true},
    description: { type: String, required: true}
  },
  {
    versionKey: false
  }
);

module.exports = mongoose.model('Event',eventSchema);
