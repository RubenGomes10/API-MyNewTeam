let User        = require('../../api/models').User;
let Place       = require('../../api/models').Place;
let Competition = require('../../api/models').Competition;
let Club        = require('../../api/models').Club;
let Workout     = require('../../api/models').Workout;
let Account     = require('../../api/models').Account;
let moment      = require('moment');

module.exports = (chai, server, should) => {
  describe('Coaches', () => {
    let token;
    let _place;
    let _coach;
    let _athlete;
    let _competition;
    let _club;
    let _workout;

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
              let competition = new Competition({
                scheduledDate: moment.utc('2016-07-24 18:00:00').toISOString(), description: 'Olímpiadas de Lisboa',
                place: place, club: club
              });
              competition.save((err, competition) => { // saves competition
                _competition = competition;
                let account = { username: 'AthleteTest', password: 'athleteTest123&123', email:'athleteTest@gmail.com' };
                let athlete = new User({
                  fullName: { first: 'Athlete', last: 'Test'},
                  location: 'Lisboa', phone: '911111111', age: 26, birthday: moment.utc('1990-07-22 12:00:00').toISOString(),
                  address: { street: 'Lisboa', zip_code: '2444-111', city: 'Lisboa', country: 'Portugal'},
                  documentation: { nif: 211111111, citizen_card: '123456789-zz01', driving_license: 'B'},
                  club: club
                });
                athlete.save((err, athlete) => {
                  athlete.createAccount(account.username, account.password, account.email, (err, athlete) => {
                    _athlete = athlete;
                    let workout = new Workout({
                      title: 'Treino Diário', duration: 3.0, description: 'Treino Cardiovascular'
                    });
                    workout.save((err, workout) => {
                      _workout = workout;
                      done();
                    });
                  });
                });
              });
            });
          });
        });
    });

    after((done) => {// clean DB
      Account.remove({_id: _athlete.account}, (err) => {
        User.remove({_id: _athlete.id}, (err) => {
          Club.remove({}, (err) => {
            Place.remove({}, (err) => {
              Competition.remove({}, (err) => {
                Workout.remove({}, (err) => {
                  done();
                });
              });
            });
          });
        });
      });
    });

    beforeEach((done) => {
      let accountC = { username: 'CoachTest', password: 'coachtest123&123', email:'coachtest@gmail.com' };
      let coach = new User({
        fullName: { first: 'Coach', last: 'Test'}, role: 'Coach',
        location: 'Lisboa', phone: '911111111', age: 36, birthday: moment.utc('1980-07-22 12:00:00').toISOString(),
        address: { street: 'Lisboa', zip_code: '2444-111', city: 'Lisboa', country: 'Portugal'},
        documentation: { nif: 211111111, citizen_card: '123456789-zz01', driving_license: 'AB'},
        club: _club
      });
      coach.save((err, coach) => {
        coach.createAccount(accountC.username, accountC.password, accountC.email, (err, coach) => {
          _coach = coach;
            done();
        });
      });
    });

    afterEach((done) =>{
      Account.remove({_id: _coach.account}, (err) => {
        User.remove({_id: _coach.id}, (err) => {
          done();
        });
      });
    });

    /*Test GET Route*/
    describe('/GET Coaches', () => {

      it('it should GET an array of Coaches', (done) => {
        chai.request(server)
        .get('/coaches')
        .set('x-access-token', token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql(200);
          res.body.should.have.property('coaches');
          res.body.coaches.should.be.a('array');
          res.body.coaches.length.should.be.eql(1);
          let coach = res.body.coaches[0];
          coach.should.be.a('object');
          coach.should.have.property('_id').eql(_coach.id);
          coach.should.have.property('name').eql('Coach Test');
          coach.should.have.property('location').eql('Lisboa');
          coach.should.have.property('age').eql(36);
          coach.should.have.property('role').eql('Coach');
          coach.should.have.property('birthday').eql(moment.utc('1980-07-22 12:00:00').toISOString());
          coach.should.have.property('club').eql(_club.id);
          coach.should.have.property('address');
          coach.address.should.be.a('object');
          should.not.exist(coach.phone);
          should.not.exist(coach.account);
          should.not.exist(coach.documentation);
          should.not.exist(coach.fullName);
          done();
        });
      });

    });

    /* Test POST Route */
    describe('/POST coach', () => {

      it('it should not POST an coach if one of required fields aren\'t passed', (done) => {
        let user = {
          username: 'usertest1', password: 'usersTest1123&123', email: 'usertest1@gmail.com', role: 'Coach',
          fullName: { first: 'User', last: 'Test'}, birthday: moment.utc('1990-07-22 12:00:00').toISOString(),
          address: { street: 'Lisboa', zip_code: '2444-111', city: 'Lisboa', country: 'Portugal'},
          documentation: { nif: 211111111, citizen_card: '123456789-zz01', driving_license: 'B'},
          club: _club
        };
        chai.request(server)
          .post('/coaches')
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

      it('it should POST a coach if the required values are passed correctly', (done) => {
        let user = {
          username: 'usertest1', password: 'usersTest1123&123', email: 'usertest1@gmail.com',
          location: 'Lisboa', phone: '911111111', age: 36, fullName: { first: 'Coach', last: 'Test'},
          birthday: moment.utc('1980-07-22 12:00:00').toISOString(), role: 'Coach',
          address: { street: 'Lisboa', zip_code: '2444-111', city: 'Lisboa', country: 'Portugal'},
          documentation: { nif: 211111111, citizen_card: '123456789-zz01', driving_license: 'AB'},
          club: _club
        };
        chai.request(server)
          .post('/coaches')
          .set('x-access-token', token)
          .send(user)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Coach successfully created!');
            res.body.should.have.property('coach');
            res.body.coach.should.be.a('object');
            res.body.coach.should.have.property('_id');
            res.body.coach.should.have.property('location').eql('Lisboa');
            res.body.coach.should.have.property('phone').eql('911111111');
            res.body.coach.should.have.property('age').eql(36);
            res.body.coach.should.have.property('fullName');
            res.body.coach.should.have.property('role').eql('Coach');
            res.body.coach.should.have.property('club').eql(_club.id);
            res.body.coach.should.have.property('account');
            res.body.coach.should.have.property('birthday').eql(moment.utc('1980-07-22 12:00:00').toISOString());
            res.body.coach.should.have.property('address');
            res.body.coach.should.have.property('documentation');
            Account.remove({_id: res.body.coach.account}, (err) => {
              User.remove({_id: res.body.coach._id}, (err) => {
                done();
              });
            });
          });
      });

    });

    /* Test PUT/:id Route */
    describe('/PUT/:id coach', () => {

      it('it should UPDATE coach with some values and leave the others unchanged', (done) => {
        let updateCoach = { location: 'Coimbra', phone: '931111111', google: {latitude: 12.5, longitude: 20.5, link: 'http://mylink.pt'}};
        chai.request(server)
        .put('/coaches/'+ _coach.id)
        .set('x-access-token', token)
        .send(updateCoach)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Coach successfully update!');
          res.body.should.have.property('coach');
          res.body.coach.should.be.a('object');
          let coach = res.body.coach;
          coach.should.have.property('_id');
          coach.should.have.property('location').eql('Coimbra');
          coach.should.have.property('phone').eql('931111111');
          coach.should.have.property('age').eql(36);
          coach.should.have.property('fullName');
          coach.should.have.property('club').eql(_club.id);
          coach.should.have.property('account');
          coach.should.have.property('birthday').eql(moment.utc('1980-07-22 12:00:00').toISOString());
          coach.should.have.property('address');
          coach.should.have.property('documentation');
          coach.should.have.property('google');
          coach.google.should.have.property('latitude').eql(12.5);
          coach.google.should.have.property('longitude').eql(20.5);
          coach.google.should.have.property('link').eql('http://mylink.pt');
          done();
        });
      });

    });

    /* Test DELETE/:id Route*/
    describe('/DELETE/:id coach', () => {

      it('it should DELETE a coach by id', (done) => {
        let accountID = _coach.account;
        chai.request(server)
        .delete('/coaches/'+ _coach.id)
        .set('x-access-token', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Coach successfully deleted!');
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

    /* Test GET/:id/workouts Route */
    describe('/GET/:id/workouts?{state=Active|Completed|Canceled}', () => {

      it('it should GET a empty array of workouts', (done) => {
        chai.request(server)
        .get('/coaches/'+ _coach.id +'/workouts')
        .set('x-access-token', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql(200);
          res.body.should.have.property('workouts');
          res.body.workouts.should.be.a('array');
          res.body.workouts.length.should.be.eql(0);
          done();
        });
      });

      it('it should GET a empty array of workouts with query state parameter equals to Canceled', (done) => {
        _coach.add('workouts', _workout.id, (err, message, coach) => {
          chai.request(server)
          .get('/coaches/'+ coach.id +'/workouts')
          .set('x-access-token', token)
          .query({state: 'Canceled'})
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('workouts');
            res.body.workouts.should.be.a('array');
            res.body.workouts.length.should.be.eql(0);
            done();
          });
        });
      });

      it('it should GET an array of workouts', (done) => {
        _coach.add('workouts', _workout.id, (err, message, coach) => {
          chai.request(server)
          .get('/coaches/'+ coach.id +'/workouts')
          .set('x-access-token', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('workouts');
            res.body.workouts.should.be.a('array');
            res.body.workouts.length.should.be.eql(1);
            let workout = res.body.workouts[0];
            workout.should.have.property('_id').eql(_workout.id);
            workout.should.have.property('title').eql('Treino Diário');
            workout.should.have.property('duration').eql(3.0);
            workout.should.have.property('description').eql('Treino Cardiovascular');
            done();
          });
        });
      });

    });

    /* Test POST/:id/workouts Route */
    describe('/POST/:id/workouts', () =>{

      it('it should insert a workout to coach by id given the workout id', (done) => {
        chai.request(server)
          .post('/coaches/' + _coach.id + '/workouts')
          .set('x-access-token', token)
          .send({workout: _workout._id})
          .end((err, res) =>{
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Workout added successfully to coach!');
            res.body.should.have.property('coach');
            res.body.coach.should.be.a('object');
            res.body.coach.should.have.property('workouts');
            res.body.coach.workouts.length.should.be.eql(1);
            res.body.coach.workouts[0].should.be.eql(_workout.id);
            done();
          });
      });

    });

    /* Test GET/:id/competitions Route */
    describe('/GET/:id/competitions?{state=Active|Completed|Canceled}', () => {

      it('it should GET a empty array of competitions', (done) => {
        chai.request(server)
        .get('/coaches/'+ _coach.id +'/competitions')
        .set('x-access-token', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql(200);
          res.body.should.have.property('competitions');
          res.body.competitions.should.be.a('array');
          res.body.competitions.length.should.be.eql(0);
          done();
        });
      });

      it('it should GET a empty array of competitions with query state parameter equals to Canceled', (done) => {
        _coach.add('competitions', _competition.id, (err, message, coach) => {
          chai.request(server)
          .get('/coaches/'+ coach.id +'/competitions')
          .set('x-access-token', token)
          .query({state: 'Canceled'})
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('competitions');
            res.body.competitions.should.be.a('array');
            res.body.competitions.length.should.be.eql(0);
            done();
          });
        });
      });

      it('it should GET an array of competitions', (done) => {
        _coach.add('competitions', _competition.id, (err, message, coach) => {
          chai.request(server)
          .get('/coaches/'+ coach.id +'/competitions')
          .set('x-access-token', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('competitions');
            res.body.competitions.should.be.a('array');
            res.body.competitions.length.should.be.eql(1);
            let competition = res.body.competitions[0];
            competition.should.be.a('object');
            competition.should.have.property('_id').eql(_competition.id);
            competition.should.have.property('scheduledDate').eql(moment.utc('2016-07-24 18:00:00').toISOString());
            competition.should.have.property('description').eql('Olímpiadas de Lisboa');
            competition.should.have.property('state').eql('Active');
            competition.should.have.property('place');
            competition.place.should.be.a('object');
            done();
          });
        });
      });

    });

    /* Test POST/:id/competitions Route */
    describe('/POST/:id/competitions', () =>{

      it('it should insert a competition to coach by id given the competition id', (done) => {
        chai.request(server)
          .post('/coaches/' + _coach.id + '/competitions')
          .set('x-access-token', token)
          .send({competition: _competition._id})
          .end((err, res) =>{
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Competition added successfully to coach!');
            res.body.should.have.property('coach');
            res.body.coach.should.be.a('object');
            res.body.coach.should.have.property('competitions');
            res.body.coach.competitions.length.should.be.eql(1);
            res.body.coach.competitions[0].should.be.eql(_competition.id);
            done();
          });
      });

    });

    /*Test GET/:id/athletes */
    describe('/GET/:id/athletes', () => {

      it('it should GET a array of coach athletes', (done) => {
        _athlete.add('coaches', _coach.id, (err, message, athlete) => {
          chai.request(server)
            .get('/coaches/'+ _coach.id + '/athletes')
            .set('x-access-token', token)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('status').eql(200);
              res.body.should.have.property('athletes');
              res.body.athletes.should.be.a('array');
              res.body.athletes.length.should.be.eql(1);
              let athlete = res.body.athletes[0];
              athlete.should.be.a('object');
              athlete.should.have.property('_id').eql(_athlete.id);
              athlete.should.have.property('name').eql('Athlete Test');
              athlete.should.have.property('location').eql('Lisboa');
              athlete.should.have.property('age').eql(26);
              athlete.should.have.property('role').eql('Athlete');
              athlete.should.have.property('birthday').eql(moment.utc('1990-07-22 12:00:00').toISOString());
              athlete.should.have.property('club').eql(_club.id);
              athlete.should.have.property('address');
              athlete.address.should.be.a('object');
              should.not.exist(athlete.account);
              should.not.exist(athlete.documentation);
              should.not.exist(athlete.fullName);
              done();
            });
        });
      });
    });
  });

};
