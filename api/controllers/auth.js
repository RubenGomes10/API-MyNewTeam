let path    = require('path');
let Config  = require('config-js');
let Account = require('../models').Account;
let helper 	= require('../helpers').Auth;
let config  = new Config(path.join(__dirname, '../..', 'config/api_##.js'));

module.exports = { generateToken };

//
// Generates a token for requests to the API if user are accepted
//
function generateToken(req, res) {
	let query = Account.findOne({'local.username': req.body.username}).populate('user').select('_id local.username local.password user');
	query.exec( (err, account) => {
		if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
		if(!account) return res.status(401).json({status: 401, message: 'Authentication failed. User not found or wrong password!'});
		if(!account.validPassword(req.body.password)) return res.status(401).json({status: 401, message: 'Authentication failed. User not found or wrong password!'});

		account = account.toObject();
		delete account.local.password;

		let token = helper.createToken(account.user);
		res.json({ status: 200, message: 'Enjoy your token!', token: token, account: account });
	});
};
