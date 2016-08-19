//================================================================================//
//                              User Schema                                       //
//================================================================================//

let mongoose    = require('mongoose');
let Schema      = mongoose.Schema;
let Account     = require('./account');
let MonthlyFee  = require('./monthlyFee');
let moment      = require('moment');

let userSchema = new Schema(
  {
    name: String,
    fullName:{
        first: { type: String, required: true },
        mid: String,
        last: { type: String, required: true }
    },
    account: {type: Schema.Types.ObjectId, ref: 'Account'},
    role: { type: String, required: true, default: 'Athlete' },
    location:{ type: String, required: true },
    phone: { type: String, required: true },
    age: { type: Number, required: true },
    birthday: { type: Date, required: true },
    address: {
        street: { type: String, required: true },
        zip_code: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true }
    },
    google:{
        latitude: Number,
        longitude: Number,
        link: String
    },
    documentation:{
        nif: { type: Number , required: true },
        citizen_card: { type: String, required: true },
        driving_license: { type: String, required: true }
    },
    coaches: [{type: Schema.Types.ObjectId, ref: 'User'}],
    athletes:[{type: Schema.Types.ObjectId, ref: 'User'}],
    managers:[{type: Schema.Types.ObjectId, ref: 'User'}],
    competitions:[{type: Schema.Types.ObjectId, ref: 'Competition'}],
    workouts: [{type: Schema.Types.ObjectId, ref: 'Workout'}],
    monthlyFees: [{type: Schema.Types.ObjectId, ref: 'MonthlyFee'}],
    club: { type: Schema.Types.ObjectId, ref: 'Club' }
  },
  {
    versionKey: false
  }
);

// preSave event
userSchema.pre('save', function(next){ // verifications
  var fullName = this.fullName;
  this.name = fullName.first +" ";

  if(fullName.mid && fullName.mid !== 'undefined')
    this.name += fullName.mid + " ";

  this.name += fullName.last;

  //this.birthday = moment.utc(this.birthday).toISOString();


  next();
});

// export new userSchema methods
userSchema.methods.toJSON = toJSON;
userSchema.methods.add = add;
userSchema.methods.createAccount = createAccount;
userSchema.methods.readAccount = readAccount;
userSchema.methods.updateAccount = updateAccount;
userSchema.methods.deleteAccount = deleteAccount;
userSchema.methods.changePassword = changePassword;
userSchema.methods.createMonthlyFee = addMonthlyFee;
userSchema.methods.readMonthlyFees = readMonthlyFees;
userSchema.methods.updateMonthlyFee = updateMonthlyFee;


//================================================================================//
//                              Private Functions                                 //
//================================================================================//

function toJSON() {
  let obj = this.toObject();
  if(obj.coaches  && obj.coaches.length === 0) delete obj.coaches;
  if(obj.athletes && obj.athletes.length === 0) delete obj.athletes;
  if(obj.managers && obj.managers.length === 0) delete obj.managers;
  if(obj.role !== 'Athlete') delete obj.monthlyFees;
  return obj;
};

// add ref ID for the sprecific collection in first argument (coaches,athletes,managers,competitions,workouts,monthlyFees)
function add(collection, ID, done) {
    if(!exists(this[collection],ID)){
        this[collection].push(ID);
        this.save((err,user) => {
            if(err) return done(err);
            return done(null,null,user);
        });
    }else{
        return done(null,'The user is already subscribed to this ID.');
    }
};

function exists(collection,ID){
  return collection.indexOf(ID) !== -1 ;
}

//================================================================================//
//                              Account Functions                                 //
//================================================================================//

// Create Account
function createAccount(userName,password,email,done){
  let user = this;
  let newAccount = new Account();
  newAccount.local.username = userName;
  newAccount.local.password = newAccount.generateHash(password);
  newAccount.local.email = email;
  newAccount.user = this._id;
  newAccount.save((err,account) => {
   if(err) return done(err);
   user.account = account._id;
   user.save((err,user) => {
      if(err) return done(err);
      done(null,user);
    });
  });
};

// Get data from  user account
function readAccount(done){
  let query = Account.findById(this.account).populate('user').select('_id local.username local.email google facebook user');
  query.exec((err,account) => {
    if(err) return done(err);
    return done(null,account);
  });
};

// update account
function updateAccount(data, done) {
  Account.findById(this.account,(err,account) => {
    Object.assign(account, data).save((err, account) => {
      if(err) return done(err);
      return done(null,'Account successfully updated!', account);
    });
  });
};

// delete account
function deleteAccount(done) {
  var user = this;
  Account.remove({_id: user.account},(err, result) => {
    if(err) return done(err, result);
    done(null, result);
  });
};

// change password
function changePassword(oldPassword,newPassword,done){
  Account.findById(this.account).select('_id local.username local.password').exec((err,account) => {
    if(account.validPassword(oldPassword)){//old Password is correct
      account.local.password = account.generateHash(newPassword);
      account.save((err,account) => {
        if(err) return done(err);
        return done(null, true, 'Password successfully changed!');
      });
    }else{ // old password not correct
      return done(null, false, 'Old password is not correct. Please try again!');
    }
  });
}

//TODO: - forgetPassword??


//================================================================================//
//                              MonthlyFee Functions                              //
//================================================================================//

//create MonthlyFee
function addMonthlyFee(data,done){
  let user = this;
  if(data.paymentDateLimit)
    data.paymentDateLimit = moment.utc(data.paymentDateLimit).toISOString();
  data.athlete = user;
  let newMonthlyFee = new MonthlyFee(data);

  newMonthlyFee.save((err,monthlyFee) => {
    if(err) return done(err);
    user['monthlyFees'].push(monthlyFee);
    user.save((err,user) => {
      if(err) return done(err);
      done(null,user);
     });
  });
};

//update monthlyFee
function updateMonthlyFee(id,data,done){
  MonthlyFee.findById(id,(err,monthlyFee) => {
    if(data.paymentDateLimit)
      data.paymentDateLimit = moment.utc(data.paymentDateLimit).toISOString();
    Object.assign(monthlyFee, data).save((err,monthlyFee) => {
      if(err) return done(err);
      return done(null,'MonthlyFee successfully updated!', monthlyFee);
    });
  });
};

//Read monthlyFee
function readMonthlyFees(done){
  let user = this;
  let query = MonthlyFee.find({'athlete': user._id}).select('_id paymentDateLimit month year paid value');
  query.exec((err,monthlyFees) => {
    if(err) return done(err)
    return done(null,monthlyFees);
  });
};

module.exports = mongoose.model('User', userSchema);
