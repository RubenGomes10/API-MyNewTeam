let path    = require('path');
let Config  = require('config-js');
let jwt 	 	= require('jwt-simple');
let User 		= require('../models').User;
let moment 	= require('moment');
let config  = new Config(path.join(__dirname, '../..', 'config/api_##.js'));
let privatePaths = ['users', 'athletes', 'coaches', 'managers', 'competitions', 'events', 'places', 'products', 'results', 'workouts'];

module.exports = { authenticate, authorize, selfAutorization, createToken };

function authenticate() {
	return (req,res,next) => {
		if(req.method === "GET" &&  isPublicPath(req.path)) // Allow GETS just for /clubs route
			return next();


		// Provides authentication and verification for the api requests from api users with specific token provided
		let token = req.query.access_token || req.headers['x-access-token'];// 'Bearer token' format if the header is Authorization
		if(!token) return res.status(400).json({status: 400, message: 'You did not provide a JSON Web Token!'});
		let payload =	jwt.decode(token, config.get('tokenSecret'));
		let now = moment().unix();

		if(now > payload.exp) return res.status(400).json({status: 400, message: 'Token has expired.'});
		let query = User.findById(payload.sub).populate('account');
		query.exec((err,user) => {
			if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
			if(!user) return res.status(401).json({status: 401, message: 'User no longer exists!'});
			req.user = user;
			next();
		});
	};
};

function authorize(roles){
	return (req, res, next) => {
		if(req.user && req.user !== 'undefined'){
			if(roles.find((role) => role == req.user.role)) return next();
			res.status(403).json({ status: 403, message: 'You are not authorized to perform this operation or to see this content!'});
		}else{
			res.status(403).json({ status: 403, message: 'You are not authorized to perform this operation or to see this content!'});
		}
	};
};

function selfAutorization(){
	return (req, res,next) => {
		if(req.user._id == req.params.id) return next();
		res.status(403).json({status: 403, message: 'You are not authorized to perform this operation or to see this content!'});
	};
};

function createToken(user) {
	let payload = {
		exp: moment().add(14,'days').unix(), // valid for 14 days
		iat: moment().unix(),
		sub: user._id
	};

	return jwt.encode(payload, config.get('tokenSecret'));
}

function isPublicPath(path){
	return privatePaths.indexOf(path.split('/')[1]) == -1;
}
