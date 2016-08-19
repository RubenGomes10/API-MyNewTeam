//================================================================================//
//                               MonthlyFee Controller                            //
//================================================================================//

let User = require('../models').User;

module.exports = { getMonthlyFees, addMonthlyFee, updateMonthlyFee };
//
// Get monthlyFees
//
function getMonthlyFees(req,res) {
	process.nextTick( () => {
		User.findById(req.params.id, (err, user) => {
			user.readMonthlyFees((err, monthlyFees) => {
				if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
				res.json({ status: 200, monthlyFees });
			});
		});
	});
};

//
// Add monthlyFee
//
function addMonthlyFee(req,res) {
	process.nextTick( () => {
		User.findById(req.params.id, (err, user) => {
			user.createMonthlyFee(req.body, (err, athlete) => {
				if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
				res.json({status: 200,  message: 'MonthlyFee successfully added!', athlete});
			});
		});
	});
};

//
// Update monthlyFee
//
function updateMonthlyFee(req,res) {
	process.nextTick( () => {
		User.findById(req.params.id, (err, user) => {
			user.updateMonthlyFee(req.query.monthlyFee, req.body, (err, message, monthlyFee) => {
				if(err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
				res.json({ status: 200, message: message, monthlyFee});
			});
		});
	});
};
