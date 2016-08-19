let events 		   = require('express').Router();
let eventsCtrl  = require('../controllers').Event;
let helper      = require('../helpers').Auth;

// routes ====================================================

// /events
events.route('/')
      .get(eventsCtrl.getAll)
      .post(helper.authorize(['Coach', 'Manager','Admin']), eventsCtrl.newEvent);

// /events/:id
events.route('/:id')
      .get(eventsCtrl.getEvent)
      .put(helper.authorize(['Coach', 'Manager','Admin']), eventsCtrl.updateEvent)
      .delete(helper.authorize(['Coach', 'Manager','Admin']), eventsCtrl.deleteEvent);

module.exports = events;
