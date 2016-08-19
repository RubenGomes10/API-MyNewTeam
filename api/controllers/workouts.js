//================================================================================//
//                               Workout Controller                               //
//================================================================================//

let Workout = require('../models').Workout;
let moment  = require('moment');

module.exports = { getAll, newWorkout, getWorkout, updateWorkout, deleteWorkout };

//
// Get all Workouts
//
function getAll(req,res) {
  process.nextTick( () => {
    let query = Workout.find({});
    query.exec((err, workouts) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      res.json({status: 200, workouts});
    });
  });
};

//
// Creates a new Workout
//
function newWorkout(req,res) {
  process.nextTick(function(){
    let workout = req.body;
    if(req.body.workoutDate)
      workout.workoutDate = moment.utc(req.body.workoutDate).toISOString();
    let newWorkout = new Workout(workout);
    newWorkout.save((err,workout) => {
      if(err) return res.status(400).json({ status: 400, message: "Missing some required fields.", error: err});
      res.json({ status: 200, message: 'Workout successfully created!', workout});
    });
  });
};

//
// Get a Workout by id
//
function getWorkout(req,res) {
  process.nextTick( () => {
    Workout.findById(req.params.id, (err, workout) => {
      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      res.json({ status: 200, workout});
    });
  });
};

//
// Update Workout
//
function updateWorkout(req,res) {
  process.nextTick( () => {
    Workout.findById(req.params.id, (err, workout) => {
      if(err) res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      let workoutUpdate = req.body;
      if(req.body.workoutDate)
        workoutUpdate.workoutDate = moment.utc(req.body.workoutDate).toISOString();
      Object.assign(workout,workoutUpdate).save((err,workout) => {
        if(err) res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
        res.json({ status: 200, message: 'Workout successfully updated!', workout});
      });
    });
  });
};

//
// Delete a Workout
//
function deleteWorkout(req,res) {
  process.nextTick( () => {
    Workout.remove({_id: req.params.id}, (err, result) => {
      if(err) res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
      res.json({ status: 200, message:'Workout successfully deleted!', result});
    });
  });
};
