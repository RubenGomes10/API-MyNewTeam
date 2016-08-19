//================================================================================//
//                               Place Controller                                 //
//================================================================================//

let Place   = require('../models').Place;
let helper  = require('../helpers').Links;

module.exports = { getAll, newPlace, getPlace, updatePlace, deletePlace };

//
// Get all Places
//
function getAll(req, res) {
  process.nextTick(() => {
    let query = Place.find({});
    query.exec((err,places) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      res.json({status: 200, places});
    });
  });
};

//
// Creates a new Place
//
function newPlace(req, res) {
  process.nextTick(() => {
    let newPlace = new Place(req.body);
    newPlace.save((err,place) => {
      if(err) return res.status(400).json({ status: 400, message: "Missing some required fields.", error: err});
      res.json({ status: 200, message: 'Place successfully created!', place});
    });
  });
};

//
// Get a place by id
//
function getPlace(req, res) {
  process.nextTick(() => {
    Place.findById(req.params.id, (err,place) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      res.json({ status: 200, place});
    });
  });
};

//
// Update Place
//
function updatePlace(req,res) {
  process.nextTick(() => {
    Place.findById(req.params.id, (err,place) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      Object.assign(place, req.body).save((err,place) => {
        if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
        res.json({ status: 200, message:'Place successfully update!', place});
      });
    });
  });
};

//
// Delete a Place
//
function deletePlace(req,res) {
  process.nextTick( () => {
    Place.remove({_id: req.params.id}, (err, result) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      res.json({status: 200, message:'Place successfully deleted!',result});
    });
  });
};
