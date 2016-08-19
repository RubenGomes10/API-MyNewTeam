//================================================================================//
//                              Workout Schema                                    //
//================================================================================//
let mongoose  = require('mongoose');
let moment    = require('moment');
let Schema    = mongoose.Schema;

let workoutSchema = new Schema(
  {
    title: { type: String, required: true },
    duration: { type: Number, required: true },
    description: { type: String, required: true },
    workoutDate: { type: Date, required: true, default: moment().utc().hours(10).minutes(0).seconds(0).milliseconds(0).add(1,'d') },
    state: { type: String, required: true, default: 'Active' } // states ['Active','Completed','Canceled']
  },
  {
    versionKey: false
  }
);

module.exports =  mongoose.model('Workout', workoutSchema);
