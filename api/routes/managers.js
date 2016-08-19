let managers  = require('express').Router();
let usersCtrl = require('../controllers').User;
let helper    = require('../helpers').Auth;

// routes ====================================================

// /managers
managers.route('/')
        .get(usersCtrl.getAll({'role':'Manager'},'managers'))
        .post(helper.authorize(['Admin']), usersCtrl.newUser('manager'));

// /managers/:id
managers.route('/:id')
        .get(usersCtrl.getUser('manager'))
        .put(helper.authorize(['Admin']), usersCtrl.updateUser('manager'))
        .delete(helper.authorize(['Admin']), usersCtrl.deleteUser('manager'));

module.exports = managers;
