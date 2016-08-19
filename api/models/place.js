//================================================================================//
//                              Place Schema                                      //
//================================================================================//
let mongoose  = require('mongoose');
let Schema    = mongoose.Schema;

let placeSchema = new Schema(
  {
    address:{
      street: { type: String, required: true },
      zip_code: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true }
    },
    google:{
      latitude: Number,
      longitude: Number,
      link: String
    }
  },
  {
    versionKey: false
  }
);

module.exports = mongoose.model('Place',placeSchema);
