//================================================================================//
//                               Competition Controller                           //
//================================================================================//

let Competition = require('../models').Competition;
let User        = require('../models').User;
let helper 			= require('../helpers').Links;
let moment      = require('moment');

module.exports = {
  getAll, getCompetition, newCompetition, updateCompetition, deleteCompetition,
  getProducts, addProduct, getResults, getEvents, addEvent, getUsers
};

//
// Get all Competitions
//
function getAll(req,res) {
  process.nextTick( () => {
    let state = (req.query.state)? {'state': req.query.state} : {};
    let query = Competition.find(state).select('_id description scheduledDate state');
    query.exec((err, competitions) => {
      if (err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      res.json({ status: 200, competitions });
    });
  });
};

//
// Get a Competition by id
//
function getCompetition(req,res){
  process.nextTick(() => {
    let query = Competition.findById(req.params.id).populate('place').select('_id description scheduledDate place state');
    query.exec((err,competition) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      //if(!competition) res.status(404).send({ success: false, message: ' Competition not found! '});
      res.json({ status: 200, competition });
    });
  });
};

//
// Creates a new Competition
//
function newCompetition(req,res) {
  process.nextTick( () => {
    if(req.body.scheduledDate)
      req.body.scheduledDate = moment.utc(req.body.scheduledDate).toISOString();
    let newCompetition = new Competition(req.body);
    newCompetition.save((err,competition) => {
      if(err) return res.status(400).json({ status: 400, message: "Missing some required fields.", error: err});
      res.json({ status: 200, message: 'Competition successfully created!', competition});
    });
  });
};

//
// Update Competition
//
function updateCompetition(req,res) {
  process.nextTick( () => {
    Competition.findById(req.params.id, (err,competition) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      if(req.body.scheduledDate)
        req.body.scheduledDate = moment.utc(req.body.scheduledDate).toISOString();
      Object.assign(competition, req.body).save((err,competition) => {
        if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
        res.json({ status: 200, message: 'Competition successfully updated!', competition});
      });
    });
  });
};

//
// Delete a Competition
//
function deleteCompetition(req,res) {
  process.nextTick( () => {
    Competition.remove({_id: req.params.id}, (err,result) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      res.json({ status: 200, message:'Competition successfully deleted!', result});
    });
  })
};

//
// Get all products in Competition
//
function getProducts(req,res) {
  process.nextTick(function(){
    let query = Competition.findById(req.params.id).populate('inventory');
    query.exec((err,competition) => {
        //if(!competition) res.status(404).send({ success: false, message: ' Competition not found! '});
        if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
        res.json({ status: 200, products: competition.inventory});
      });
  });
};

//
// Adds a Product
//
function addProduct(req,res) {
  process.nextTick( () => {
    Competition.findById(req.params.id, (err,competition) => {
      competition.add('inventory',req.body.product,(err,message,competition) =>{
        if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
        if(message) return res.status(409).json({ status: 409, message: message});
        res.json({ status: 200, message:'Product added successfully!', competition});
      });
    });
  });
};

//
// Get all results of current competition
//
function getResults(req,res) {
  process.nextTick( () => {
    res.redirect('/results?competition='+req.params.id);
  });
};

//
// Add Event to current competition
//
function addEvent(req,res) {
  process.nextTick( () => {
    Competition.findById(req.params.id, (err,competition) => {
      competition.add('events', req.body.event, (err,message,competition) => {
        if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
        if(message) return res.status(409).json({ status: 409, message: message});
        res.json({ status: 200, message:'Event added successfully!', competition});
      });
    });
  });
};

//
//  Get events of current competition
//
function getEvents(req,res) {
  process.nextTick( () => {
    let query = Competition.findById(req.params.id).populate('events');
    query.exec((err,competition) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      res.json({ status: 200, events: competition.events });
    });
  });
};

//
// Generic function to return the users of specific role in current competition
//
function getUsers(role) {
  return (req,res) => {
    let firstLetter = role.substring(0,1);
    let _role = (role == 'undefined') ? 'users' : (firstLetter == 'A' || firstLetter == 'M') ? role.toLowerCase() + 's' : role.toLowerCase() + 'es';
    let query = User.find({}).where('role').equals(role).where('competitions').equals(req.params.id)
    .select('_id name location age phone role birthday address documentation');
    query.exec((err,users) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      let obj = {};
      obj['status'] = 200;
      obj[_role] = users;
      res.json(obj);
    });
  };
};
