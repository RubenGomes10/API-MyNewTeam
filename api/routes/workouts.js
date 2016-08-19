let workouts      = require('express').Router();
let workoutsCtrl  = require('../controllers').Workout;
let helper        = require('../helpers').Auth;

// routes ====================================================

// /workouts
workouts.route('/')
        .get(workoutsCtrl.getAll)
        .post(helper.authorize(['Coach', 'Manager','Admin']), workoutsCtrl.newWorkout);

// /workouts/:id
workouts.route('/:id')
        .get(workoutsCtrl.getWorkout)
        .put(helper.authorize(['Coach', 'Manager','Admin']), workoutsCtrl.updateWorkout)
        .delete(helper.authorize(['Coach', 'Manager','Admin']), workoutsCtrl.deleteWorkout);

module.exports = workouts;
