let Event       = require('../../api/models').Event;
let User        = require('../../api/models').User;
let Account     = require('../../api/models').Account;
let Competition = require('../../api/models').Competition;
let Club        = require('../../api/models').Club;
let Place       = require('../../api/models').Place;
let Result      = require('../../api/models').Result;
let moment      = require('moment');

module.exports = (chai, server, should) => {

  describe('Results', () => {

    let token;
    let _place;
    let _user;
    let _competition;
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
              let competition = new Competition({
                scheduledDate: moment.utc('2016-07-24 18:00:00').toISOString(), description: 'Olímpiadas de Lisboa',
                place: place, club: club
              });
              competition.save((err, competition) => { // saves competition
                _competition = competition;
                let account = { username: 'UserTest', password: 'usertest123&123', email:'usertest@gmail.com' };
                let user = new User({
                  fullName: { first: 'User', last: 'Test'},
                  location: 'Lisboa', phone: '911111111', age: 20, birthday: moment.utc('1990-07-22 12:00:00').toISOString(),
                  address: { street: 'Lisboa', zip_code: '2444-111', city: 'Lisboa', country: 'Portugal'},
                  documentation: { nif: 211111111, citizen_card: '123456789-zz01', driving_license: 'B'}
                });
                user.save((err, user) => { // saves user
                  user.createAccount(account.username, account.password, account.email, (err, user) => { // create account
                    user.add('competitions', competition.id, (err, message, user) => { // associates competition
                      _user = user;
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
      Account.remove({_id: _user.account}, (err) => {
        User.remove({_id: _user.id}, (err) => {
          Club.remove({}, (err) => {
            Place.remove({}, (err) => {
              Competition.remove({}, (err) => {
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

    beforeEach((done) => { //Before each test we empty the Event collection
      Result.remove({}, (err) => {
        Event.remove({}, (err) => {
          done();
        });
      });
    });

    /* Test GET Route */
    describe('/GET?{athlete=id & competition=id} results', () => {

      it('it should GET empty array results', (done) => {
        chai.request(server)
        .get('/results')
        .set('x-access-token', token)
        .end((err, res) => {
          should.not.exist(err);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql(200);
          res.body.should.have.property('results');
          res.body.results.should.be.a('array');
          res.body.results.length.should.be.eql(0);
          done();
        });
      });

      it('it should GET an array of results', (done) => {
        let event = new Event({ name: 'Corrida de 100 metros.', description: 'Corrida de 100 metros (Olímpiadas de Lisboa).' });
        event.save((err, event) => {
          let result = new Result({ event: event, athlete: _user, competition: _competition, mark: '7.4s' });
          result.save((err, result) => {
            chai.request(server)
            .get('/results')
            .set('x-access-token', token)
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
              _result.should.have.property('competition');
              _result.should.have.property('athlete');
              _result.event.should.have.property('_id').eql(event.id);
              _result.event.should.have.property('name');
              _result.event.should.have.property('description');
              _result.competition.should.have.property('_id').eql(_competition.id);
              _result.competition.should.have.property('scheduledDate').eql(moment.utc(_competition.scheduledDate).toISOString());
              _result.competition.should.have.property('place');
              _result.competition.should.have.property('state').eql('Active');
              _result.competition.place.should.have.property('_id').eql(_place.id);
              _result.competition.place.should.have.property('address');
              _result.athlete.should.have.property('_id').eql(_user.id);
              _result.athlete.should.have.property('account');
              _result.athlete.account.should.have.property('_id');
              _result.athlete.account.should.have.property('local');
              _result.athlete.account.local.should.have.property('username').eql('UserTest');
              _result.athlete.account.local.should.have.property('email').eql('usertest@gmail.com');
              should.not.exist(_result.athlete.account.password);
              should.not.exist(_result.athlete.birthday);
              done();
            });
          });

        });
      });

      it('it should GET an array of results by athlete id passed in query parameter', (done) => {
        let event = new Event({ name: 'Corrida de 100 metros.', description: 'Corrida de 100 metros (Olímpiadas de Lisboa).' });
        event.save((err, event) => {
          let result = new Result({ event: event, athlete: _user, competition: _competition, mark: '7.4s' });
          result.save((err, result) => {
            chai.request(server)
            .get('/results')
            .query({athlete: _user.id})
            .set('x-access-token', token)
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
              _result.should.have.property('competition');
              should.not.exist(_result.athlete);
              _result.event.should.have.property('_id').eql(event.id);
              _result.event.should.have.property('name');
              _result.event.should.have.property('description');
              _result.competition.should.have.property('_id').eql(_competition.id);
              _result.competition.should.have.property('scheduledDate').eql(moment.utc(_competition.scheduledDate).toISOString());
              _result.competition.should.have.property('place');
              _result.competition.should.have.property('state').eql('Active');
              _result.competition.place.should.have.property('_id').eql(_place.id);
              _result.competition.place.should.have.property('address');
              done();
            });
          });

        });
      });

      it('it should GET an array of results by competition id passed in query parameter', (done) => {
        let event = new Event({ name: 'Corrida de 100 metros.', description: 'Corrida de 100 metros (Olímpiadas de Lisboa).' });
        event.save((err, event) => {
          let result = new Result({ event: event, athlete: _user, competition: _competition, mark: '7.4s' });
          result.save((err, result) => {
            chai.request(server)
            .get('/results')
            .query({competition: _competition.id})
            .set('x-access-token', token)
            .end((err, res) => {
              should.not.exist(err);
              res.body.should.be.a('object');
              res.body.should.have.property('status').eql(200);
              res.body.should.have.property('results');
              res.body.results.should.be.a('array');
              res.body.results.length.should.be.eql(1);
              let _result = res.body.results[0];
              _result.should.have.property('_id').eql(result.id);
              _result.should.have.property('mark').eql('7.4s');
              _result.should.have.property('event');
              _result.should.have.property('athlete');
              should.not.exist(_result.competition);
              _result.event.should.have.property('_id').eql(event.id);
              _result.event.should.have.property('name');
              _result.event.should.have.property('description');
              _result.athlete.should.have.property('_id').eql(_user.id);
              _result.athlete.should.have.property('account');
              _result.athlete.account.should.have.property('_id');
              _result.athlete.account.should.have.property('local');
              _result.athlete.account.local.should.have.property('username').eql('UserTest');
              _result.athlete.account.local.should.have.property('email').eql('usertest@gmail.com');
              should.not.exist(_result.athlete.account.password);
              should.not.exist(_result.athlete.birthday);
              done();
            });
          });

        });
      });

      it('it should GET an array of results by athlete and competition id passed in query parameters', (done) => {
        let event = new Event({ name: 'Corrida de 100 metros.', description: 'Corrida de 100 metros (Olímpiadas de Lisboa).' });
        event.save((err, event) => {
          let result = new Result({ event: event, athlete: _user, competition: _competition, mark: '7.4s' });
          result.save((err, result) => {
            chai.request(server)
            .get('/results')
            .query({ athlete: _user.id, competition: _competition.id })
            .set('x-access-token', token)
            .end((err, res) => {
              should.not.exist(err);
              res.body.should.be.a('object');
              res.body.should.have.property('status').eql(200);
              res.body.should.have.property('results');
              res.body.results.should.be.a('array');
              res.body.results.length.should.be.eql(1);
              let _result = res.body.results[0];
              _result.should.have.property('_id').eql(result.id);
              _result.should.have.property('mark').eql('7.4s');
              _result.should.have.property('event');
              _result.event.should.have.property('_id').eql(event.id);
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

    /* Test POST Route */
    describe('/POST result', () => {

      it('it should not POST a result if just one of the fields aren\'t passed', (done) => {
        let result = { mark: '7.4s' }
        chai.request(server)
          .post('/results')
          .set('x-access-token', token)
          .send(result)
          .end((err, res) => {
            should.exist(err);
            res.should.have.status(400);
            res.body.should.have.property('status').eql(400);
            res.body.should.have.property('message').eql('Missing some required fields.');
            res.body.should.have.property('error');
            res.body.error.should.be.a('object');
            res.body.error.should.have.property('errors');
            res.body.error.errors.should.have.property('event');
            res.body.error.errors.should.have.property('athlete');
            res.body.error.errors.event.should.have.property('kind').eql('required');
            res.body.error.errors.athlete.should.have.property('kind').eql('required');
            done();
          });
      });

      it('it should POST a result if all the values are passed correctly', (done) => {
        let event = new Event({ name: 'Corrida de 100 metros.', description: 'Corrida de 100 metros (Olímpiadas de Lisboa).' });
        event.save((err, event) => {
          let result = { event: event, athlete: _user, competition: _competition, mark: '7.4s' };
          chai.request(server)
            .post('/results')
            .set('x-access-token', token)
            .send(result)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('message').eql('Result successfully created!');
              res.body.should.have.property('result');
              res.body.result.should.be.a('object');
              res.body.result.should.have.property('event').eql(event.id);
              res.body.result.should.have.property('athlete').eql(_user.id);
              res.body.result.should.have.property('competition').eql(_competition.id);
              res.body.result.should.have.property('mark').eql('7.4s');
              done();
            });
        });

      });

    });

  });
};
