//================================================================================//
//                               Event Controller                                 //
//================================================================================//

let Event = require('../models').Event;

module.exports = { getAll, newEvent, getEvent, updateEvent, deleteEvent };

//
// Get all Events
//
function getAll(req,res){
  process.nextTick( ()=>{
    let query = Event.find({});
    query.exec((err,events) => {
      if (err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      res.json({status: 200, events});
    });
  });
};

//
// Creates a new Event
//
function newEvent(req, res) {
  process.nextTick(() => {
    let newEvent = new Event(req.body);
    newEvent.save((err, event) => {
      if(err) return res.status(400).json({ status: 400, message: "Missing some required fields.", error: err});
      res.json({ status: 200, message: 'Event successfully created!', event });
    });
  });
};

//
// Get a Event by id
//
function getEvent(req, res) {
  process.nextTick(() => {
    Event.findById(req.params.id, (err, event) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      res.json({ status: 200, event });
    });
  });
};

//
// Update Event
//
function updateEvent(req, res) {
  process.nextTick(()=> {
    Event.findById(req.params.id, (err, event) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      Object.assign(event, req.body).save((err,event) => {
        if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
        res.json({ status: 200, message: 'Event successfully updated!', event});
      });
    });
  });
};

//
// Delete a Event
//
function deleteEvent(req, res) {
  process.nextTick(()=> {
    Event.remove({_id: req.params.id},(err,result) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      res.json({ status: 200, message:'Event successfully deleted!', result});
    });
  });
};
