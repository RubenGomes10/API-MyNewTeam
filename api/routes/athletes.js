let athletes        = require('express').Router();
let controllers     = require('../controllers');
let usersCtrl       = controllers.User;
let monthlyFeesCtrl = controllers.MonthlyFee;
let helper          = require('../helpers').Auth;

// routes ====================================================

// /athletes
athletes.route('/')
        .get(usersCtrl.getAll({'role':'Athlete'}, 'athletes'))
        .post(helper.authorize(['Coach','Manager','Admin']), usersCtrl.newUser('athlete'));

// /athletes/:id
athletes.route('/:id')
        .get(usersCtrl.getUser('athlete'))
        .put(helper.authorize(['Coach','Manager','Admin']), usersCtrl.updateUser('athlete'))
        .delete(helper.authorize(['Coach','Manager','Admin']), usersCtrl.deleteUser('athlete'));

// /athletes/:id/coaches
athletes.route('/:id/coaches')
        .get(usersCtrl.getCoaches)
        .post(helper.authorize(['Coach','Manager','Admin']), usersCtrl.aggregateCoach);

// /athletes/:id/competitions?{state=['Active','Completed','Canceled']}
athletes.route('/:id/competitions')
        .get(usersCtrl.getCompetitions)
        .post(helper.authorize(['Coach','Manager','Admin']), usersCtrl.addCompetition('athlete')); // /athletes/:id/competitions

// /athletes/:id/workouts
athletes.route('/:id/workouts')
        // /athletes/:id/workouts?{state=['Active','Completed','Canceled']}
        .get(usersCtrl.getWorkouts)
        .post(helper.authorize(['Coach','Manager','Admin']), usersCtrl.addWorkout('athlete'))

// /athletes/:id/monthlyFees
athletes.route('/:id/monthlyFees')
        .get(monthlyFeesCtrl.getMonthlyFees)
        .post(helper.authorize(['Coach','Manager','Admin']), monthlyFeesCtrl.addMonthlyFee)
        // /athletes/:id/monthlyFees?monthlyFee={monthlyFeeId}
        .put(helper.authorize(['Coach','Manager','Admin']), monthlyFeesCtrl.updateMonthlyFee);

// /athletes/:id/results?{athlete=athleteID&competition=competitionID&workout=workoutID}
athletes.get('/:id/results',usersCtrl.getResults);

module.exports = athletes;
