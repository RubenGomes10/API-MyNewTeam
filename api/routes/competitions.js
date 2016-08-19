let competitions      = require('express').Router();
let competitionsCtrl  = require('../controllers').Competition;
let helper            = require('../helpers').Auth; 

// routes ====================================================

// /competitions
competitions.route('/')
            // /competitions?{state=['Active','Scheduled','Completed','Canceled']}
            .get(competitionsCtrl.getAll)
            .post(helper.authorize(['Coach', 'Manager','Admin']), competitionsCtrl.newCompetition);


// /competitions/:id
competitions.route('/:id')
            .get(competitionsCtrl.getCompetition)
            .put(helper.authorize(['Coach', 'Manager','Admin']), competitionsCtrl.updateCompetition);
            //.delete(competitionsCtrl.deleteCompetition);

// /competitions/:id/products
competitions.route('/:id/products')
            .get(competitionsCtrl.getProducts)
            .post(helper.authorize(['Coach', 'Manager','Admin']), competitionsCtrl.addProduct);

// /competitions/:id/events
competitions.route('/:id/events')
            .get(competitionsCtrl.getEvents)
            .post(helper.authorize(['Coach', 'Manager','Admin']), competitionsCtrl.addEvent);

// /competitions/:id/athletes
competitions.get('/:id/athletes',competitionsCtrl.getUsers('Athlete'));

// /competitions/:id/coaches
competitions.get('/:id/coaches',competitionsCtrl.getUsers('Coach'));

// /competitions/:id/results?{competition=cpmpetitionID}
competitions.get('/:id/results', competitionsCtrl.getResults);

module.exports = competitions;
