//================================================================================//
//                              Product Schema                                    //
//================================================================================//

let mongoose  = require('mongoose');
let Schema    = mongoose.Schema;

let productSchema = new Schema(
  {
    name: { type:String, required: true },
    stock: { type: Number, required: true, default: 0 },
    type: { type: String, required: true, default: 'Vehicle' },
    club: { type: Schema.Types.ObjectId, ref: 'Club' },
    description: String
  },
  {
    versionKey: false
  }
);

module.exports =  mongoose.model('Product',productSchema);
