//================================================================================//
//                              Competition Schema                                //
//================================================================================//

let mongoose  = require('mongoose');
let Schema    = mongoose.Schema;
let moment    = require('moment');

let competitionSchema = new Schema(
  {
    scheduledDate: { type: Date, required: true },
    description: { type: String, required: true },
    state: { type: String, required: true, default: 'Active' },
    place: { type: Schema.Types.ObjectId, ref: 'Place', required: true },
    inventory:[ { type: Schema.Types.ObjectId, ref: 'Product' } ],
    events:[ { type: Schema.Types.ObjectId, ref: 'Event' } ],
    club : { type: Schema.Types.ObjectId, ref: 'Club', required: true }
  },
  {
    versionKey: false
  }
);


competitionSchema.methods.add = add;

//================================================================================//
//                              Private Functions                                 //
//================================================================================//
function add(collection,ID,done){
  if(!exists(this[collection],ID)){
    this[collection].push(ID);
    this.save(function(err,competition){
      if(err) return done(err);
      return done(null,null,competition);
    });
  }else{
    return done(null,'This competition already have the resource specified!');
  }
};

function exists(collection,ID){
    return collection.indexOf(ID) !== -1;
};

module.exports = mongoose.model('Competition', competitionSchema);
