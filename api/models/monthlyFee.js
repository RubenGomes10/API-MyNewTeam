//================================================================================//
//                              MonthlyFee Schema                                 //
//================================================================================//
let mongoose  = require('mongoose');
let Schema    = mongoose.Schema;


let monthlyFeeSchema = new Schema(
  {
    value:  { type: Number, required: true},
    paymentDateLimit: { type: Date, required: true},
    month: {type: String , required: true},
    year: {type: Number, required: true},
    paid: {type: Boolean, required: true, default: false},
    athlete: {type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  {
    versionKey: false
  }
);

module.exports = mongoose.model('MonthlyFee',monthlyFeeSchema);
