process.env.NODE_ENV = 'test'; // Defines the environment to use the test config json

// Require the dev-depedencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);

// parent block
describe('Api Tests', () => {

  require('./controllers/home')(chai, server, should);
  require('./controllers/auth')(chai, server, should);
  require('./controllers/events')(chai, server, should);
  require('./controllers/places')(chai, server, should);
  require('./controllers/workouts')(chai, server, should);
  require('./controllers/products')(chai, server, should);
  require('./controllers/clubs')(chai, server, should);
  require('./controllers/results')(chai, server, should);
  require('./controllers/competitions')(chai, server, should);
  require('./controllers/athletes')(chai, server, should);
  require('./controllers/coaches')(chai, server, should);
  require('./controllers/managers')(chai, server, should);
  require('./controllers/account')(chai, server, should);

});
