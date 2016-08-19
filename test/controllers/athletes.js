let User        = require('../../api/models').User;
let Place       = require('../../api/models').Place;
let Competition = require('../../api/models').Competition;
let Club        = require('../../api/models').Club;
let Workout     = require('../../api/models').Workout;
let Account     = require('../../api/models').Account;
let MonthlyFee  = require('../../api/models').MonthlyFee;
let Event       = require('../../api/models').Event;
let Result      = require('../../api/models').Result;
let moment      = require('moment');

module.exports = (chai, server, should) => {
  describe('Athletes', () => {

    let token;
    let _place;
    let _coach;
    let _athlete;
    let _competition;
    let _club;
    let _workout;
    let _monthlyFee;
    let _event;

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
                let accountC = { username: 'CoachTest', password: 'coachTest123&123', email:'coachTest@gmail.com' };
                let coach = new User({
                  fullName: { first: 'Coach', last: 'Test'},role: 'Coach',
                  location: 'Lisboa', phone: '911111111', age: 36, birthday: moment.utc('1980-07-22 12:00:00').toISOString(),
                  address: { street: 'Lisboa', zip_code: '2444-111', city: 'Lisboa', country: 'Portugal'},
                  documentation: { nif: 211111111, citizen_card: '123456789-zz01', driving_license: 'B'},
                  club: club
                });
                coach.save((err, coach) => {
                  coach.createAccount(accountC.username, accountC.password, accountC.email, (err, coach) => {
                    _coach = coach;
                    let workout = new Workout({
                      title: 'Treino Diário', duration: 3.0, description: 'Treino Cardiovascular'
                    });
                    workout.save((err, workout) => {
                      _workout = workout;
                      let event = new Event({name: 'Etapa 1', description: 'Corrida de Obstáculos 400m!' });
                      event.save((err, event) => {
                        _event = event;
                        done();
                      });
                    });
                  });
                });
              });
            });
          });
        });
    });

    after((done) => {// clean DB
      Account.remove({_id: _coach.account}, (err) => {
        User.remove({_id: _coach.id}, (err) => {
          Club.remove({}, (err) => {
            Place.remove({}, (err) => {
              Competition.remove({}, (err) => {
                Workout.remove({}, (err) => {
                  MonthlyFee.remove({}, (err) => {
                    Event.remove({}, (err) => {
                      Result.remove({}, (err) => {
                        done();
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });

    beforeEach((done) => {
      let account = { username: 'UserTest', password: 'usertest123&123', email:'usertest@gmail.com' };
      let athlete = new User({
        fullName: { first: 'User', last: 'Test'},
        location: 'Lisboa', phone: '911111111', age: 26, birthday: moment.utc('1990-07-22 12:00:00').toISOString(),
        address: { street: 'Lisboa', zip_code: '2444-111', city: 'Lisboa', country: 'Portugal'},
        documentation: { nif: 211111111, citizen_card: '123456789-zz01', driving_license: 'B'},
        club: _club
      });
      athlete.save((err, athlete) => {
        athlete.createAccount(account.username, account.password, account.email, (err, athlete) => {
          _athlete = athlete;
          MonthlyFee.remove({}, (err) => {
            done();
          });
        });
      });
    });

    afterEach((done) =>{
      Account.remove({_id: _athlete.account}, (err) => {
        User.remove({_id: _athlete.id}, (err) => {
          done();
        });
      });
    });


    /*Test GET Route*/
    describe('/GET athletes', () => {

      it('it should GET an array of athletes', (done) => {
        chai.request(server)
        .get('/athletes')
        .set('x-access-token', token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql(200);
          res.body.should.have.property('athletes');
          res.body.athletes.should.be.a('array');
          res.body.athletes.length.should.be.eql(1);
          let athlete = res.body.athletes[0];
          athlete.should.be.a('object');
          athlete.should.have.property('_id').eql(_athlete.id);
          athlete.should.have.property('name').eql('User Test');
          athlete.should.have.property('location').eql('Lisboa');
          athlete.should.have.property('age').eql(26);
          athlete.should.have.property('role').eql('Athlete');
          athlete.should.have.property('birthday').eql(moment.utc('1990-07-22 12:00:00').toISOString());
          athlete.should.have.property('club').eql(_club.id);
          athlete.should.have.property('address');
          athlete.address.should.be.a('object');
          should.not.exist(athlete.phone);
          should.not.exist(athlete.account);
          should.not.exist(athlete.documentation);
          should.not.exist(athlete.fullName);
          done();
        });
      });

    });

    /* Test POST Route */
    describe('/POST athlete', () => {

      it('it should not POST an athlete if one of required fields aren\'t passed', (done) => {
        let user = {
          username: 'usertest1', password: 'usersTest1123&123', email: 'usertest1@gmail.com',
          fullName: { first: 'User', last: 'Test'}, birthday: moment.utc('1990-07-22 12:00:00').toISOString(),
          address: { street: 'Lisboa', zip_code: '2444-111', city: 'Lisboa', country: 'Portugal'},
          documentation: { nif: 211111111, citizen_card: '123456789-zz01', driving_license: 'B'},
          club: _club
        };
        chai.request(server)
          .post('/athletes')
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

      it('it should POST a athlete if the required values are passed correctly', (done) => {
        let user = {
          username: 'usertest1', password: 'usersTest1123&123', email: 'usertest1@gmail.com',
          location: 'Lisboa', phone: '911111111', age: 26, fullName: { first: 'User', last: 'Test'},
          birthday: moment.utc('1990-07-22 12:00:00').toISOString(),
          address: { street: 'Lisboa', zip_code: '2444-111', city: 'Lisboa', country: 'Portugal'},
          documentation: { nif: 211111111, citizen_card: '123456789-zz01', driving_license: 'B'},
          club: _club
        };
        chai.request(server)
          .post('/athletes')
          .set('x-access-token', token)
          .send(user)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Athlete successfully created!');
            res.body.should.have.property('athlete');
            res.body.athlete.should.be.a('object');
            res.body.athlete.should.have.property('_id');
            res.body.athlete.should.have.property('location').eql('Lisboa');
            res.body.athlete.should.have.property('phone').eql('911111111');
            res.body.athlete.should.have.property('age').eql(26);
            res.body.athlete.should.have.property('fullName');
            res.body.athlete.should.have.property('club').eql(_club.id);
            res.body.athlete.should.have.property('account');
            res.body.athlete.should.have.property('birthday').eql(moment.utc('1990-07-22 12:00:00').toISOString());
            res.body.athlete.should.have.property('address');
            res.body.athlete.should.have.property('documentation');
            Account.remove({_id: res.body.athlete.account}, (err) => {
              User.remove({_id: res.body.athlete._id}, (err) => {
                done();
              });
            });
          });
      });

    });

    /* Test PUT/:id Route */
    describe('/PUT/:id athlete', () => {

      it('it should UPDATE athlete with some values and leave the others unchanged', (done) => {
        let updateAthlete = { location: 'Coimbra', phone: '931111111', google: {latitude: 12.5, longitude: 20.5, link: 'http://mylink.pt'}};
        chai.request(server)
        .put('/athletes/'+ _athlete.id)
        .set('x-access-token', token)
        .send(updateAthlete)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Athlete successfully update!');
          res.body.should.have.property('athlete');
          res.body.athlete.should.be.a('object');
          let athlete = res.body.athlete;
          athlete.should.have.property('_id');
          athlete.should.have.property('location').eql('Coimbra');
          athlete.should.have.property('phone').eql('931111111');
          athlete.should.have.property('age').eql(26);
          athlete.should.have.property('fullName');
          athlete.should.have.property('club').eql(_club.id);
          athlete.should.have.property('account');
          athlete.should.have.property('birthday').eql(moment.utc('1990-07-22 12:00:00').toISOString());
          athlete.should.have.property('address');
          athlete.should.have.property('documentation');
          athlete.should.have.property('google');
          athlete.google.should.have.property('latitude').eql(12.5);
          athlete.google.should.have.property('longitude').eql(20.5);
          athlete.google.should.have.property('link').eql('http://mylink.pt');
          done();
        });
      });

    });

    /* Test DELETE/:id Route*/
    describe('/DELETE athlete', () => {

      it('it should DELETE a athlete by id', (done) => {
        let accountID = _athlete.account;
        chai.request(server)
        .delete('/athletes/'+ _athlete.id)
        .set('x-access-token', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Athlete successfully deleted!');
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

    /* Test GET/:id/coaches Route */
    describe('/GET/:id/coaches', () => {

      it('it should GET empty array of coaches', (done) => {
        chai.request(server)
        .get('/athletes/'+ _athlete.id +'/coaches')
        .set('x-access-token', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql(200);
          res.body.should.have.property('coaches');
          res.body.coaches.should.be.a('array');
          res.body.coaches.length.should.be.eql(0);
          done();
        });
      });

      it('it should GET an array of coaches', (done) => {
        _athlete.add('coaches', _coach.id, (err, message, athlete) => {
          chai.request(server)
          .get('/athletes/'+ athlete.id +'/coaches')
          .set('x-access-token', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('coaches');
            res.body.coaches.should.be.a('array');
            res.body.coaches.length.should.be.eql(1);
            let coach = res.body.coaches[0];
            coach.should.be.a('object');
            coach.should.have.property('_id').eql(_coach.id);
            coach.should.have.property('role').eql('Coach');
            coach.should.have.property('location').eql('Lisboa');
            coach.should.have.property('age').eql(36);
            coach.should.have.property('birthday').eql(moment.utc('1980-07-22 12:00:00').toISOString());
            coach.should.have.property('club').eql(_club.id);
            coach.should.have.property('address');
            done();
          });
        });
      });

    });

    /* Test POST/:id/coaches Route */
    describe('/POST/:id/coaches', () =>{

      it('it should aggregate coach in athlete by id given the coach id', (done) => {
        chai.request(server)
          .post('/athletes/' + _athlete.id + '/coaches')
          .set('x-access-token', token)
          .send({coach: _coach._id})
          .end((err, res) =>{
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Coach added successfully to athlete!');
            res.body.should.have.property('athlete');
            res.body.athlete.should.be.a('object');
            res.body.athlete.should.have.property('coaches');
            res.body.athlete.coaches.length.should.be.eql(1);
            res.body.athlete.coaches[0].should.be.eql(_coach.id);
            done();
          });
      });

    });

    /* Test GET/:id/workouts Route */
    describe('/GET/:id/workouts?{state=Active|Completed|Canceled}', () => {

      it('it should GET a empty array of workouts', (done) => {
        chai.request(server)
        .get('/athletes/'+ _athlete.id +'/workouts')
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
        _athlete.add('workouts', _workout.id, (err, message, athlete) => {
          chai.request(server)
          .get('/athletes/'+ athlete.id +'/workouts')
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
        _athlete.add('workouts', _workout.id, (err, message, athlete) => {
          chai.request(server)
          .get('/athletes/'+ athlete.id +'/workouts')
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
            workout.should.be.a('object');
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

      it('it should insert a workout to athlete by id given the workout id', (done) => {
        chai.request(server)
          .post('/athletes/' + _athlete.id + '/workouts')
          .set('x-access-token', token)
          .send({workout: _workout._id})
          .end((err, res) =>{
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Workout added successfully to athlete!');
            res.body.should.have.property('athlete');
            res.body.athlete.should.be.a('object');
            res.body.athlete.should.have.property('workouts');
            res.body.athlete.workouts.length.should.be.eql(1);
            res.body.athlete.workouts[0].should.be.eql(_workout.id);
            done();
          });
      });

    });

    /* Test GET/:id/competitions Route */
    describe('/GET/:id/competitions?{state=Active|Completed|Canceled}', () => {

      it('it should GET a empty array of competitions', (done) => {
        chai.request(server)
        .get('/athletes/'+ _athlete.id +'/competitions')
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
        _athlete.add('competitions', _competition.id, (err, message, athlete) => {
          chai.request(server)
          .get('/athletes/'+ athlete.id +'/competitions')
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
        _athlete.add('competitions', _competition.id, (err, message, athlete) => {
          chai.request(server)
          .get('/athletes/'+ athlete.id +'/competitions')
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

      it('it should insert a competition to athlete by id given the competition id', (done) => {
        chai.request(server)
          .post('/athletes/' + _athlete.id + '/competitions')
          .set('x-access-token', token)
          .send({competition: _competition._id})
          .end((err, res) =>{
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Competition added successfully to athlete!');
            res.body.should.have.property('athlete');
            res.body.athlete.should.be.a('object');
            res.body.athlete.should.have.property('competitions');
            res.body.athlete.competitions.length.should.be.eql(1);
            res.body.athlete.competitions[0].should.be.eql(_competition.id);
            done();
          });
      });

    });

    /* Test GET/:id/monthlyFees Route */
    describe('/GET/:id/monthlyFees', () => {

      it('it should GET a empty array of monthlyFees', (done) => {
        chai.request(server)
        .get('/athletes/'+ _athlete.id +'/monthlyFees')
        .set('x-access-token', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql(200);
          res.body.should.have.property('monthlyFees');
          res.body.monthlyFees.should.be.a('array');
          res.body.monthlyFees.length.should.be.eql(0);
          done();
        });
      });

      it('it should GET an array of monthlyFees', (done) => {
        let monthlyFee = { paymentDateLimit: '2016-07-31 23:59:59', value: 25.00, month: 'Julho', year: 2016 };
        _athlete.createMonthlyFee(monthlyFee, (err, athlete) => {
          chai.request(server)
          .get('/athletes/'+ _athlete.id +'/monthlyFees')
          .set('x-access-token', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('monthlyFees');
            res.body.monthlyFees.should.be.a('array');
            res.body.monthlyFees.length.should.be.eql(1);
            let monthlyFee = res.body.monthlyFees[0];
            monthlyFee.should.be.a('object');
            monthlyFee.should.have.property('_id');
            monthlyFee.should.have.property('paymentDateLimit').eql(moment.utc('2016-07-31 23:59:59').toISOString());
            monthlyFee.should.have.property('value').eql(25.00);
            monthlyFee.should.have.property('month').eql('Julho');
            monthlyFee.should.have.property('year').eql(2016);
            done();
          });
        });
      });

    });

    /* Test POST/:id/monthlyFees Route */
    describe('/POST/:id/monthlyFees', () =>{

      it('it should insert a monthlyFee to athlete by id given monthlyFee object', (done) => {
        let monthlyFee = { paymentDateLimit: '2016-07-31 23:59:59', value: 25.00, month: 'Julho', year: 2016 };
        chai.request(server)
          .post('/athletes/' + _athlete.id + '/monthlyFees')
          .set('x-access-token', token)
          .send(monthlyFee)
          .end((err, res) =>{
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('MonthlyFee successfully added!');
            res.body.should.have.property('athlete');
            res.body.athlete.should.be.a('object');
            res.body.athlete.should.have.property('_id');
            res.body.athlete.should.have.property('monthlyFees');
            res.body.athlete.monthlyFees.length.should.be.eql(1);
            MonthlyFee.findById(res.body.athlete.monthlyFees[0], (err, _monthlyFee) => {
              should.exist(_monthlyFee);
              done();
            });
          });
      });

    });

    /* Test PUT/:id/monthlyFees?{monthlyFee=monthlyFeeId} Route */
    describe('/POST/:id/monthlyFees?{monthlyFee=monthlyFeeId}', () =>{

      it('it should UPDATE a monthlyFee to athlete by id given monthlyFee id', (done) => {
        let monthlyFeeObj = new MonthlyFee({
          paymentDateLimit: moment.utc('2016-07-31 23:59:59').toISOString(), value: 25.00, month: 'Julho', year: 2016, athlete: _athlete
        });
        let monthlyFeeUpdate = { value: 35.00, month: 'Agosto', paymentDateLimit: '2016-08-31 23:59:59' };
        monthlyFeeObj.save((err, monthlyFee) => {
          chai.request(server)
            .put('/athletes/' + _athlete.id + '/monthlyFees')
            .set('x-access-token', token)
            .query({monthlyFee: monthlyFee.id})
            .send(monthlyFeeUpdate)
            .end((err, res) =>{
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('message').eql('MonthlyFee successfully updated!');
              res.body.should.have.property('monthlyFee');
              res.body.monthlyFee.should.be.a('object');
              res.body.monthlyFee.should.have.property('_id').eql(monthlyFee.id);
              res.body.monthlyFee.should.have.property('paymentDateLimit').eql(moment.utc('2016-08-31 23:59:59').toISOString());
              res.body.monthlyFee.should.have.property('value').eql(35.00);
              res.body.monthlyFee.should.have.property('month').eql('Agosto');
              res.body.monthlyFee.should.have.property('year').eql(2016);
              res.body.monthlyFee.should.have.property('athlete').eql(_athlete.id);
              done();
            });
          });
      });

    });

    /* Test GET/:id/results?{athlete=athleteID&competition=competitionID} */
    describe('/GET/:id/results?{athlete=athleteID&competition=competitionID}', () => {

      it('it should GET a array of results of athlete by id in specific competitionID', (done) => {
        let result = new Result({ event: _event, athlete: _athlete, competition: _competition, mark: '7.4s' });
        result.save((err, result) => {
          chai.request(server)
            .get('/athletes/'+ _athlete.id + '/results')
            .set('x-access-token', token)
            .query({competition: _competition.id})
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('status').eql(200);
              res.body.should.have.property('results');
              res.body.results.should.be.a('array');
              res.body.results.length.should.be.eql(1);
              let _result = res.body.results[0];
              _result.should.have.property('_id').eql(result.id);
              _result.should.have.property('mark').eql('7.4s');
              _result.should.have.property('event');
              _result.event.should.have.property('_id').eql(_event.id);
              _result.event.should.have.property('name');
              _result.event.should.have.property('description');
              should.not.exist(_result.competition);
              should.not.exist(_result.athlete);
              done();
            });
        });
      });
    });

  });
};
