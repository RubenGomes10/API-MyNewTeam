let api            	= require('express').Router();
let helper         	= require('../helpers');
let authToken 			= require('./auth');
let clubs          	= require('./clubs');
let users          	= require('./users');
let coaches        	= require('./coaches');
let athletes       	= require('./athletes');
let managers       	= require('./managers');
let competitions   	= require('./competitions');
let places         	= require('./places');
let products       	= require('./products');
let workouts 				= require('./workouts');
let events         	= require('./events');
let results					= require('./results');

// prefix /
api.get('/',  (req, res) => {
	  res.json({
			API: "Welcome to My New Team Api!",
			Documentation: "https://github.com/Trovoada/ps15-16/wiki/Api"
		});
 });

 api.use('/favicon.ico', function(req, res) {
    res.sendStatus(200);
});

api.use('/getToken',authToken);
api.use(helper.Auth.authenticate());

api.use('/clubs',clubs);
api.use('/users',users);
api.use('/athletes',athletes);
api.use('/coaches',coaches);
api.use('/managers',managers);
api.use('/competitions',competitions);
api.use('/places',places);
api.use('/products',products);
api.use('/workouts',workouts);
api.use('/events',events);
api.use('/results',results);

api.all('/*', function (req, res, next) {
	res.status(404).json({ status: 404, message: 'Path does not exists!'});
});

module.exports = api;
