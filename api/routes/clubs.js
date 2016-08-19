let clubs     = require('express').Router();
let clubsCtrl = require('../controllers').Club;
let helper    = require('../helpers').Auth;
// routes ====================================================

// /clubs
clubs.route('/')
     .get(clubsCtrl.getAll)
     .post(clubsCtrl.newClub);


// /clubs/:id
clubs.route('/:id')
     .get(clubsCtrl.getClub)
     .put(clubsCtrl.updateClub)
     .delete(clubsCtrl.deleteClub);

clubs.get('/:id/users',clubsCtrl.getUsers());

// /clubs/:id/athletes
clubs.get('/:id/athletes',clubsCtrl.getUsers('Athlete'));

// /clubs/:id/coaches
clubs.get('/:id/coaches',clubsCtrl.getUsers('Coach'));

// /clubs/:id/managers
clubs.get('/:id/managers',clubsCtrl.getUsers('Manager'));

// /clubs/:id/competitions
clubs.get('/:id/competitions',clubsCtrl.getCompetitions);

// /clubs/:id/inventory
clubs.get('/:id/inventory', clubsCtrl.getInventory);

module.exports = clubs;
