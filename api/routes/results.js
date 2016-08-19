let results     = require('express').Router();
let resultsCtrl = require('../controllers').Result;
let helper      = require('../helpers').Auth;

// routes ====================================================

// /results
results.route('/')
       .get(resultsCtrl.getAll)
       .post(helper.authorize(['Coach', 'Manager','Admin']), resultsCtrl.newResult);

module.exports = results;
