let users 		= require('express').Router();
let usersCtrl = require('../controllers').User;
let helpers 	= require('../helpers').Auth;

// routes ====================================================

// /users
users.route('/')
		 .get(usersCtrl.getAll(null,'users'));

// /users/:id
users.route('/:id')
		 .get(usersCtrl.getUser('user'));

users.route('/:id/account')
		 .get(usersCtrl.getAccount)
		 .put(helpers.selfAutorization(), usersCtrl.updateAccount);

//users.post('/:id/account/forgetPassord',usersCtrl.forgetPassord);
users.post('/:id/account/changePassword', helpers.selfAutorization(), usersCtrl.changePassword);

module.exports = users;
