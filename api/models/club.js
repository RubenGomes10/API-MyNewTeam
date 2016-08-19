//================================================================================//
//                              Club Schema                                       //
//================================================================================//

let mongoose  = require('mongoose');
let Schema    = mongoose.Schema;

let clubSchema = new Schema(
  {
    name : { type: String, required: true },
    acronym: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true, default: 'athletics'},
    place: {type: Schema.Types.ObjectId, ref: 'Place', required: true}
  },
  {
    versionKey: false
  }
);

module.exports =  mongoose.model('Club',clubSchema);
