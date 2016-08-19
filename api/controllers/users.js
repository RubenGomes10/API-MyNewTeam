//================================================================================//
//                               User Controller                                  //
//================================================================================//
let moment 			= require('moment');
let User        = require('../models').User;
let Account 		= require('../models').Account;
let Competition = require('../models').Competition;
let Workout     = require('../models').Workout;

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}



module.exports =
{
	getAll, getUser, newUser, updateUser, deleteUser, getCompetitions, addCompetition,
	getWorkouts, addWorkout, getResults, getCoaches, aggregateCoach, getAthletes,
	getAccount, updateAccount, changePassword
};

//
// Get all users
//
function getAll(role, key) {
	return (req, res) => {
		process.nextTick( () => {
			let query = User.find(role || {});
			if(!role){
				query.where('role').ne('Admin'); // just gets the users excluding admin users.
			}
			query.select('_id club birthday location age name address role');
			query.exec( (err, users) => {
				if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
				let response = {};
				response["status"] = 200;
				response[key] = users;
				res.json(response);
			});
		});
	};
};

//
// Get a user by id
//
function getUser(key){
	return (req,res) => {
		process.nextTick( () => {
			User.findById(req.params.id, (err, user) => {
				if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
				let response = {};
				response["status"] = 200;
				response[key] = user;
				res.json(response);
			});
		});
	};
};

//
// Creates a new User
//
function newUser(key){
	return (req,res) => {
	  process.nextTick( () => {
			Account.findOne({'local.username': req.body.username}, (err, user) => { // verification
				if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
				if(user) return res.status(401).json({ status: 401, message: "This username already belongs to another user! Please choose other."});
				Account.findOne({'local.email': req.body.email}, (err, user) => {
					if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
					if(user) return res.status(401).json({ status: 401, message: 'This email already belongs to another user! Please choose other.'});//verification
					if(req.body.birthday)
						req.body.birthday = moment.utc(req.body.birthday).toISOString();
					let newUser = new User(req.body);
					newUser.save((err,user) => {
						if(err) return res.status(400).json({ status: 400, message: "Missing some required fields.", error: err});
						user.createAccount(req.body.username, req.body.password, req.body.email, (err,user) => {
							if(err) return res.status(400).json({ status: 400, message: "Missing some required fields.", error: err});
							let response = {};
							response["status"] = 200;
							response["message"] = key.capitalize() + ' successfully created!';
							response[key] = user;
							res.json(response);
						});
					});
				});
			});
	  });
	};
};

//
// Update User
//
function updateUser(key) {
	return (req,res) => {
	  process.nextTick( () => {
	    User.findById(req.params.id, (err,user) => {
	      if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
				if(req.body.birthday)
					req.body.birthday = moment.utc(req.body.birthday).toISOString();
	      Object.assign(user, req.body).save((err,user) => {
	        if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
					let response = {};
					response["status"] = 200;
					response["message"] = key.capitalize() + ' successfully update!';
					response[key] = user;
	        res.json(response);
	      });
	    });
	  });
	};
};

//
// Delete a user
//
function deleteUser(key) {
	return (req, res) => {
		process.nextTick( () => {
			User.findById(req.params.id, (err, user) => {
				if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
				user.deleteAccount((err, response) => {
					if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
					if(!response.result.ok) return res.status(401).json({ status: 401, message: result });
					User.remove({_id: req.params.id}, (err, result) => {
						if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
						let response = {};
						response["status"] = 200;
						response["message"] = key.capitalize() + ' successfully deleted!';
						response["result"] = result;
						res.json(response);
					});
				});
			});
		});
	};
};
//
// Get account of user
//
function getAccount(req, res){
	process.nextTick(() => {
		User.findById(req.params.id, (err, user) => {
			if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
			user.readAccount((err, account) => {
				if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
				res.json({status: 200, account});
			});
		});
	});
};

//
// Update account of user
//
function updateAccount(req, res){
	process.nextTick(() => {
		User.findById(req.params.id, (err, user) => {
			if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
			user.updateAccount(req.body, (err, message, account) => {
				if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
				res.json({status: 200, message: message, account});
			});
		});
	});
};

//
// Change password of user account
//
function changePassword(req, res){
	process.nextTick(() => {
		User.findById(req.params.id, (err, user) => {
			if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
			user.changePassword(req.body.oldPassword, req.body.newPassword,(err, success, message) => {
				if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
				if(!success) return res.status(401).json({ status: 401, message: message});
				res.json({status: 200, message: message});
			});
		});
	});
};

//
// Get the Competitions of current user
//
function getCompetitions(req, res){
	process.nextTick( () => {
		let competitionsOptions = {
			path: 'competitions',
			match: { "state": req.query.state || { "$in": ['Active', 'Canceled', 'Completed'] } },
			select: '_id scheduledDate description state place',
			populate: {
				path: 'place'
			}
		};
		let query = User.findById(req.params.id).populate(competitionsOptions);
		query.exec((err, user) => {
			if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
			res.json({ status: 200, competitions: user.competitions });
		});
	});
};

//
// Add an competition to the user and agregate this user to competition
//
function addCompetition(key) {
	return (req, res) => {
		process.nextTick( () => {
			User.findById(req.params.id, (err, user) => {
				if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
				let competitionID = req.body.competition;
				user.add('competitions', competitionID, (err, message, user) => {
					if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
					if(message) return res.status(409).json({ status: 409, message: message });
					let response = {};
					response["status"] = 200;
					response["message"] = 'Competition added successfully to '+ key +'!';
					response[key] = user;
					res.json(response);
				});
			});
		});
	};
};

//
// Get the Workouts of current user
//
function getWorkouts(req,res){
	process.nextTick( () => {
		let workoutsOptions = {
			path: 'workouts',
			match: { "state": req.query.state || { "$in": ['Active', 'Completed', 'Canceled'] } }
		};
		let query = User.findById(req.params.id).populate(workoutsOptions);
		query.exec((err, user) => {
			if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
			res.json({ status: 200, workouts: user.workouts });
		});
	});
};

//
// Add an workout to the user
//
function addWorkout(key){
	return (req,res) => {
		process.nextTick( () => {
			User.findById(req.params.id, (err, user) => {
				if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
				let workoutID = req.body.workout;
				user.add('workouts', workoutID, (err, message, user) => {
					if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
					if(message) return res.status(409).json({ status: 409, message: message });
					let response = {};
					response["status"] = 200;
					response["message"] = 'Workout added successfully to ' + key + '!';
					response[key] = user;
					res.json(response);
				});
			});
		});
	};
};
//
// Get the results of current user
//
function getResults(req,res){
	let query = 'athlete=' + req.params.id;
	if(req.query.competition){
		query+= '&competition=' + req.query.competition;
	}
  if(req.query.workout){
    query+='&workout=' + req.query.workout;
  }
	res.redirect('/results?' + query);
};

//
// Get all coaches of this athlete
//
function getCoaches(req,res){
	process.nextTick( () => {
		let coachOptions = {
			path: 'coaches',
			select: '_id role location phone age birthday address club'
		};
		let query = User.findById(req.params.id).populate(coachOptions);
		query.exec((err, athlete) => {
			if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
			res.json({status: 200, coaches: athlete.coaches});
		});
	});
};

//
// Aggregate an coach to this athlete
//
function aggregateCoach(req, res) {
	process.nextTick( () => {
		User.findById(req.params.id, (err, athlete) => {
			if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
			let coachId = req.body.coach;
			athlete.add('coaches', coachId, (err, message, athlete) => {
				if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
				if(message) return res.status(409).json({ status: 409, message: message });
				res.json({ status: 200, message: 'Coach added successfully to athlete!', athlete: athlete });
			});
		});
	});
};

//
// Get Athletes for this Coach
//
function getAthletes(req,res) {
	process.nextTick( () => {
		let coachId = req.params.id;
		let query = User.find({ coaches: coachId })
			.select('id name location phone role age birthday address club google competitions workouts');
		query.exec( (err, athletes) => {
			if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
			res.json({status: 200, athletes: athletes});
		});
	});
};
