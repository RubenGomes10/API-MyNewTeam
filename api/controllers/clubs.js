//================================================================================//
//                               Club Controller                                  //
//================================================================================//

let Club        = require('../models').Club;
let User        = require('../models').User;
let Competition = require('../models').Competition;
let Inventory   = require('../models').Product;

module.exports = { getAll, newClub, getClub, updateClub, deleteClub, getUsers, getCompetitions, getInventory };

//
// Get all Clubs
//
function getAll(req,res) {
  process.nextTick(()=>{
    let query = Club.find({});
    query.exec((err,clubs) => {
      if (err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      res.json({status: 200, clubs});
    });
  });
};

//
// Creates a new Club
//
function newClub(req,res) {
  process.nextTick(function(){
    let newClub = new Club(req.body);
    newClub.save((err,club) => {
      if(err) return res.status(400).json({ status: 400, message: "Missing some required fields.", error: err});
      res.json({ status: 200, message: 'Club successfully created!', club});
    });
  });
};

//
// Get a Club by id
//
function getClub(req,res) {
  process.nextTick( () => {
    Club.findById(req.params.id, (err,club) =>{
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      res.json({status: 200, club});
    });
  });
};

//
// Update Club
//
function updateClub(req,res) {
  process.nextTick(() => {
    Club.findById(req.params.id, (err,club) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      Object.assign(club, req.body).save((err,club) => {
        if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
        res.json({ status: 200, message: 'Club successfully updated!', club});
      });
    });
  });
};

//
// Delete a Club
//
function deleteClub(req,res){
  process.nextTick(() => {
    Club.remove({_id: req.params.id}, (err,result) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      res.json({ status: 200, message:'Club successfully deleted!', result});
    });
  });
};

//
// Generic function to retrieve users based in role of clubs
//
function getUsers(role) {
  return (req,res) => {
    process.nextTick(() => {
      let roleOption = {};
      if(role)
        roleOption = {role: role};

      let query = User.find(roleOption).where('club').equals(req.params.id).select('_id name role location age');
      query.exec((err,users) => {
        if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
        res.json({status: 200, users });
      });
    });
  };
};

//
// Get All competitions of this clubs
//
function getCompetitions(req,res) {
  process.nextTick(() => {
    let query = Competition.find({}).where('club').equals(req.params.id).populate('place').select('_id scheduledDate description state place');
    query.exec((err,competitions) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      res.json({ status: 200, competitions });
    });
  });
};

//
// Get Inventory of this club
//
function getInventory(req, res) {
  process.nextTick(() => {
    let queryParam = (req.query.type && req.query.type != '')? {type: req.query.type} : {};
    let query = Inventory.find(queryParam).where('club').equals(req.params.id);
    query.exec((err, inventory) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      res.json({ status: 200, inventory: inventory});
    })
  });
}
