var authToken      = require('express').Router();
var authController = require('../controllers/auth');

//getToken
authToken.post('/',authController.generateToken);

module.exports = authToken;
