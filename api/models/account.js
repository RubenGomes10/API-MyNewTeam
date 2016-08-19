//================================================================================//
//                              Account Schema                                    //
//================================================================================//

let mongoose  = require('mongoose');
let Schema    = mongoose.Schema;
let bcrypt    = require("bcrypt-nodejs");

let accountSchema = new Schema(
  {
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    local: {
        username: { type: String, required: true, index: { unique: true } },
        password: { type: String, required: true, select: false },
        email:    { type: String, required: true, index: { unique: true } },
    },
    google:{
        id: Number,
        token: String,
        name: String,
        email: String
    },
    facebook:{
        id: Number,
        token: String,
        name: String,
        email: String
    }
  },
  {
    versionKey: false
  }
);


//================================================================================//
//                              Private Functions                                 //
//================================================================================//
function generateHash(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

function validPassword(password){
  return bcrypt.compareSync(password,this.local.password);
};


// new schema methods
accountSchema.methods.generateHash = generateHash;
accountSchema.methods.validPassword = validPassword;

module.exports = mongoose.model('Account', accountSchema);
