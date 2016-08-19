let coaches   = require('express').Router();
let usersCtrl = require('../controllers').User;
let helper    = require('../helpers').Auth;

// routes ====================================================

// /coaches
coaches.route('/')
       .get(usersCtrl.getAll({'role':'Coach'}, 'coaches'))
       .post(helper.authorize(['Manager','Admin']), usersCtrl.newUser('coach'));

// /coaches/:id
coaches.route('/:id')
       .get(usersCtrl.getUser('coach'))
       .put(helper.authorize(['Manager','Admin']), usersCtrl.updateUser('coach'))
       .delete(helper.authorize(['Manager','Admin']), usersCtrl.deleteUser('coach'));

// /coaches/:id/competitions?{state=['Active','Completed','Canceled']}
coaches.route('/:id/competitions')
       .get(usersCtrl.getCompetitions)
       .post(helper.authorize(['Coach', 'Manager','Admin']), usersCtrl.addCompetition('coach')); // /coaches/:id/competitions

// /coaches/:id/workouts
coaches.route('/:id/workouts')
       // /coaches/:id/workouts?{state=['Active','Completed','Canceled']}
       .get(usersCtrl.getWorkouts)
       .post(helper.authorize(['Coach', 'Manager','Admin']), usersCtrl.addWorkout('coach'))

// /coaches/:id/athletes
coaches.get('/:id/athletes',usersCtrl.getAthletes);

module.exports = coaches;
