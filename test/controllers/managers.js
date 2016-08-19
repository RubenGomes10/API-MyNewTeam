let User    = require('../../api/models').User;
let Place   = require('../../api/models').Place;
let Club    = require('../../api/models').Club;
let Account = require('../../api/models').Account;
let moment  = require('moment');

module.exports = (chai, server, should) => {
  describe('Managers', () => {
    let token;
    let _place;
    let _manager;
    let _club;

    before((done) => {
      let authenticatedUser = {
        username: "globalAdmin",
        password: "Admin123&123"
      }
      chai.request(server)
        .post('/getToken')
        .send(authenticatedUser)
        .end((err, res) => {
          token = res.body.token;
          let place = new Place({
            address: { street: 'Lisboa', zip_code: '2450-111', city: 'Lisboa', country: 'Portugal' }
          });
          place.save((err, place) => { // saves place
            _place = place;
            let club = new Club({
              name: 'Sport Lisboa Benfica', acronym: 'SLB', description: 'Melhor Clube do Mundo', type: 'Futebol',
              place: place
            });
            club.save((err, club) => { // saves club
              _club = club; // saves global
              done();
            });
          });
        });
    });

    after((done) => {// clean DB
      Club.remove({}, (err) => {
        Place.remove({}, (err) => {
          done();
        });
      });
    });

    beforeEach((done) => {
      let account = { username: 'ManagerTest', password: 'managerTest123&123', email:'managerTest@gmail.com' };
      let manager = new User({
          fullName: { first: 'Manager', last: 'Test'}, role: 'Manager',
          location: 'Lisboa', phone: '911111111', age: 46, birthday: moment.utc('1970-07-22 12:00:00').toISOString(),
          address: { street: 'Lisboa', zip_code: '2444-111', city: 'Lisboa', country: 'Portugal'},
          documentation: { nif: 211111111, citizen_card: '123456789-zz01', driving_license: 'ABC'},
          club: _club
      });
      manager.save((err, manager) => {
        manager.createAccount(account.username, account.password, account.email, (err, athlete) => {
          _manager = manager;
          done();
        });
      });
    });

    afterEach((done) =>{
      Account.remove({_id: _manager.account}, (err) => {
        User.remove({_id: _manager.id}, (err) => {
          done();
        });
      });
    });

    /*Test GET Route*/
    describe('/GET managers', () => {

      it('it should GET an array of Managers', (done) => {
        chai.request(server)
        .get('/managers')
        .set('x-access-token', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql(200);
          res.body.should.have.property('managers');
          res.body.managers.should.be.a('array');
          res.body.managers.length.should.be.eql(1);
          let manager = res.body.managers[0];
          manager.should.be.a('object');
          manager.should.have.property('_id').eql(_manager.id);
          manager.should.have.property('name').eql('Manager Test');
          manager.should.have.property('location').eql('Lisboa');
          manager.should.have.property('age').eql(46);
          manager.should.have.property('role').eql('Manager');
          manager.should.have.property('birthday').eql(moment.utc('1970-07-22 12:00:00').toISOString());
          manager.should.have.property('club').eql(_club.id);
          manager.should.have.property('address');
          manager.address.should.be.a('object');
          should.not.exist(manager.phone);
          should.not.exist(manager.account);
          should.not.exist(manager.documentation);
          should.not.exist(manager.fullName);
          done();
        });
      });

    });

    /* Test POST Route */
    describe('/POST managers', () => {

      it('it should not POST a manager if one of required fields aren\'t passed', (done) => {
        let user = {
          username: 'usertest1', password: 'usersTest1123&123', email: 'usertest1@gmail.com', role: 'Manager',
          fullName: { first: 'User', last: 'Test'}, birthday: moment.utc('1970-07-22 12:00:00').toISOString(),
          address: { street: 'Lisboa', zip_code: '2444-111', city: 'Lisboa', country: 'Portugal'},
          documentation: { nif: 211111111, citizen_card: '123456789-zz01', driving_license: 'B'},
          club: _club
        };
        chai.request(server)
          .post('/managers')
          .set('x-access-token', token)
          .send(user)
          .end((err, res) => {
            should.exist(err);
            res.should.have.status(400);
            res.body.should.have.property('status').eql(400);
            res.body.should.have.property('message').eql('Missing some required fields.');
            res.body.should.have.property('error');
            res.body.error.should.be.a('object');
            res.body.error.should.have.property('errors');
            res.body.error.errors.should.have.property('location');
            res.body.error.errors.should.have.property('phone');
            res.body.error.errors.should.have.property('age');
            res.body.error.errors.location.should.have.property('kind').eql('required');
            res.body.error.errors.phone.should.have.property('kind').eql('required');
            res.body.error.errors.age.should.have.property('kind').eql('required');
            done();
          });
      });

      it('it should POST a manager if the required values are passed correctly', (done) => {
        let user = {
          username: 'usertest1', password: 'usersTest1123&123', email: 'usertest1@gmail.com',
          location: 'Lisboa', phone: '911111111', age: 46, fullName: { first: 'Manager', last: 'Test'},
          birthday: moment.utc('1970-07-22 12:00:00').toISOString(), role: 'Coach',
          address: { street: 'Lisboa', zip_code: '2444-111', city: 'Lisboa', country: 'Portugal'},
          documentation: { nif: 211111111, citizen_card: '123456789-zz01', driving_license: 'AB'},
          club: _club
        };
        chai.request(server)
          .post('/managers')
          .set('x-access-token', token)
          .send(user)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Manager successfully created!');
            res.body.should.have.property('manager');
            res.body.manager.should.be.a('object');
            res.body.manager.should.have.property('_id');
            res.body.manager.should.have.property('location').eql('Lisboa');
            res.body.manager.should.have.property('phone').eql('911111111');
            res.body.manager.should.have.property('age').eql(46);
            res.body.manager.should.have.property('fullName');
            res.body.manager.should.have.property('role').eql('Coach');
            res.body.manager.should.have.property('club').eql(_club.id);
            res.body.manager.should.have.property('account');
            res.body.manager.should.have.property('birthday').eql(moment.utc('1970-07-22 12:00:00').toISOString());
            res.body.manager.should.have.property('address');
            res.body.manager.should.have.property('documentation');
            Account.remove({_id: res.body.manager.account}, (err) => {
              User.remove({_id: res.body.manager._id}, (err) => {
                done();
              });
            });
          });
      });

    });

    /* Test GET/:id Route */
    describe('/GET/:id manager', () => {

      it('it should GET a manager by id', (done) => {
        chai.request(server)
        .get('/managers/'+ _manager.id)
        .set('x-access-token', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql(200);
          res.body.should.have.property('manager');
          let manager = res.body.manager;
          manager.should.have.property('_id');
          manager.should.have.property('location').eql('Lisboa');
          manager.should.have.property('phone').eql('911111111');
          manager.should.have.property('age').eql(46);
          manager.should.have.property('fullName');
          manager.should.have.property('club').eql(_club.id);
          manager.should.have.property('account');
          manager.should.have.property('birthday').eql(moment.utc('1970-07-22 12:00:00').toISOString());
          manager.should.have.property('address');
          manager.should.have.property('documentation');
          should.not.exist(manager.coaches);
          should.not.exist(manager.athletes);
          should.not.exist(manager.managers);
          should.not.exist(manager.monthlyFees);
          done();
        });
      });

    });

    /* Test PUT/:id Route */
    describe('/PUT/:id manager', () => {

      it('it should UPDATE manager with some values and leave the others unchanged', (done) => {
        let updateManager = { location: 'Coimbra', phone: '931111111', google: {latitude: 12.5, longitude: 20.5, link: 'http://mylink.pt'}};
        chai.request(server)
        .put('/managers/'+ _manager.id)
        .set('x-access-token', token)
        .send(updateManager)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Manager successfully update!');
          res.body.should.have.property('manager');
          res.body.manager.should.be.a('object');
          let manager = res.body.manager;
          manager.should.have.property('_id');
          manager.should.have.property('location').eql('Coimbra');
          manager.should.have.property('phone').eql('931111111');
          manager.should.have.property('age').eql(46);
          manager.should.have.property('fullName');
          manager.should.have.property('club').eql(_club.id);
          manager.should.have.property('account');
          manager.should.have.property('birthday').eql(moment.utc('1970-07-22 12:00:00').toISOString());
          manager.should.have.property('address');
          manager.should.have.property('documentation');
          manager.should.have.property('google');
          manager.google.should.have.property('latitude').eql(12.5);
          manager.google.should.have.property('longitude').eql(20.5);
          manager.google.should.have.property('link').eql('http://mylink.pt');
          done();
        });
      });

    });

    /* Test DELETE/:id Route*/
    describe('/DELETE/:id manager', () => {

      it('it should DELETE a manager by id', (done) => {
        let accountID = _manager.account;
        chai.request(server)
        .delete('/managers/'+ _manager.id)
        .set('x-access-token', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Manager successfully deleted!');
          res.body.should.have.property('result');
          res.body.result.should.be.a('object');
          res.body.result.should.have.property('ok').eql(1);
          res.body.result.should.have.property('n').eql(1);
          Account.findById(accountID, (err, _account) => {
            should.not.exist(_account);
            done();
          });
        });
      });

    });
  });
};
