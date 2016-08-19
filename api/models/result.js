//================================================================================//
//                              Result Schema                                      //
//================================================================================//
let mongoose  = require('mongoose');
let Schema    = mongoose.Schema;

let resultSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true},
    athlete: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    competition: {type: Schema.Types.ObjectId, ref: 'Competition'},
    workout: {type: Schema.Types.ObjectId, ref: 'Workout'},
    mark: { type: String, required: true}
  },
  {
    versionKey: false
  }
);

module.exports =  mongoose.model('Result',resultSchema);
