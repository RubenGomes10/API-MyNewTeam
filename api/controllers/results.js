//================================================================================//
//                               Result Controller                                //
//================================================================================//

let Result = require('../models').Result;

module.exports = { getAll, newResult };

//
// Get all Results
//
function getAll(req,res) {
  process.nextTick(() => {
    buildQuery(req, (query) => {
      query.exec((err,results) => {
        if (err) return res.status(500).json({ status: 500, message: "Oops something went wrong", error: err});
        res.json({status: 200, results});
      });
    });
  });
};

//
// Creates a new Result
//
function newResult(req,res) {
  process.nextTick(() => {
    let newResult = new Result(req.body);
    newResult.save((err, result) => {
      if(err) return res.status(400).json({ status: 400, message: "Missing some required fields.", error: err});
      res.json({ status: 200, message: 'Result successfully created!', result});
    });
  });
};


//
// Builds a Generic query and select fields based on httpRequest
//
function buildQuery(req,done){
  let athleteID = req.query.athlete || null;
  let competitionID = req.query.competition || null;
  let workoutID = req.query.workout || null;
  let selectq = (athleteID && competitionID || athleteID && workoutID) ? '_id event mark': (athleteID) ? '_id event mark competition workout' : '_id event mark athlete';
  let competitions = {
      path: 'competition',
      select: 'description scheduledDate state place',
      populate: {
        path: 'place',
        select: 'address'
      }
  };
  let athletes = {
      path: 'athlete',
      select: '_id name role age account',
      populate: {
        path: 'account',
        select: 'local.username local.email'
      }
  };

  let query = Result.find({});
  if(athleteID)
      query.where('athlete').equals(athleteID);
  if(competitionID)
      query.where('competition').equals(competitionID);

  if((!athleteID && !competitionID) && (!athleteID && !workoutID)){
      selectq = '_id event mark competition workout athlete'
  }
  query.populate('event').populate(athletes).populate(competitions).populate('workout').select(selectq);

  return done(query);
};
