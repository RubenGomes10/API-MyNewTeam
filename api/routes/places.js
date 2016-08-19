let places      = require('express').Router();
let placesCtrl  = require('../controllers').Place;
let helper      = require('../helpers').Auth;

// routes ====================================================

// /places
places.route('/')
      .get(placesCtrl.getAll)
      .post(helper.authorize(['Coach', 'Manager','Admin']), placesCtrl.newPlace);

// /places/:id
places.route('/:id')
      .get(placesCtrl.getPlace)
      .put(helper.authorize(['Coach', 'Manager','Admin']), placesCtrl.updatePlace)
      .delete(helper.authorize(['Coach', 'Manager','Admin']), placesCtrl.deletePlace);

module.exports = places;
