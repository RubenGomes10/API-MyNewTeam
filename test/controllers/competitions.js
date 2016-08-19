let Event       = require('../../api/models').Event;
let User        = require('../../api/models').User;
let Account     = require('../../api/models').Account;
let Competition = require('../../api/models').Competition;
let Club        = require('../../api/models').Club;
let Place       = require('../../api/models').Place;
let Result      = require('../../api/models').Result;
let Product     = require('../../api/models').Product;
let moment      = require('moment');

module.exports = (chai, server, should) => {

  describe('Competitions', () => {

    let token;
    let _place;
    let _competition;
    let _athlete;
    let _coach;
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
          place.save((err, place) => { //save place
            _place = place;
            let club = new Club({
              name: 'Sport Lisboa Benfica', acronym: 'SLB', description: 'Melhor Clube do Mundo', type: 'Futebol',
              place: place
            });
            club.save((err, club) => {//save club
              _club = club;
              let accountA = { username: 'athleteTest', password: 'athletetest123&123', email:'athletetest@gmail.com' };
              let athlete = new User({
                fullName: { first: 'Athlete', last: 'Test'},
                location: 'Lisboa', phone: '911111111', age: 26, birthday: moment.utc('1990-07-22 12:00:00').toISOString(),
                address: { street: 'Lisboa', zip_code: '2444-111', city: 'Lisboa', country: 'Portugal'},
                documentation: { nif: 211111111, citizen_card: '123456789-zz01', driving_license: 'B'}
              });
              athlete.save((err, athlete) => { //save athlete
                athlete.createAccount(accountA.username, accountA.password, accountA.email, (err, athlete) => {
                  _athlete = athlete;
                  let accountC = { username: 'coachTest', password: 'coachtest123&123', email:'coachtest@gmail.com' };
                  let coach = new User({
                    fullName: { first: 'Coach', last: 'Test'},
                    location: 'Lisboa', role: 'Coach', phone: '911111111', age: 35, birthday: moment.utc('1981-07-22 12:00:00').toISOString(),
                    address: { street: 'Lisboa', zip_code: '2444-111', city: 'Lisboa', country: 'Portugal'},
                    documentation: { nif: 211111134, citizen_card: '12345189-z002', driving_license: 'AB'}
                  });
                  coach.save((err, coach) => { // save coach
                    coach.createAccount(accountC.username, accountC.password, accountC.email, (err, coach) => {
                      _coach = coach;
                      done();
                    });
                  });
                });
              });
            });
          });
        });
    });

    after((done) => { //clean DB
      Account.remove({ _id: _athlete.account }, (err) => {
        Account.remove({ _id: _coach.account }, (err) => {
          User.remove({ _id: _athlete.id }, (err) => {
            User.remove({ _id: _coach.id }, (err) => {
              Club.remove({}, (err) => {
                Place.remove({}, (err) => {
                  Event.remove({}, (err) => {
                    Result.remove({}, (err) => {
                      Product.remove({}, (err) => {
                        Competition.remove({}, (err) => {
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
    });

    beforeEach((done) => { //Before each test we empty the Event collection
      Competition.remove({}, (err) => {
        Event.remove({}, (err) => {
          done();
        });
      });
    });

    /* Test GET Route */
    describe('/GET?{state:[Active|Completed|Canceled]} competitions', () => {

      it('it should GET empty array results', (done) => {
        chai.request(server)
        .get('/competitions')
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

      it('it should GET an array of competitions with no state parameter filter', (done) => {
        let competitionActive = new Competition({
           scheduledDate: moment.utc('2016-07-30 09:30:00').toISOString(), description: 'Olímpiadas de Lisboa', place: _place, club: _club
        });
        let competitionCompleted = new Competition({
           scheduledDate: moment.utc('2016-06-10 09:30:00').toISOString(), description: 'Olímpiadas de Coimbra', place: _place, club: _club,
           state: 'Completed'
        });
        competitionActive.save((err, competitionActive) => {
          competitionCompleted.save((err, competitionCompleted) => {
            chai.request(server)
            .get('/competitions')
            .set('x-access-token', token)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('status').eql(200);
              res.body.should.have.property('competitions');
              res.body.competitions.should.be.a('array');
              res.body.competitions.length.should.be.eql(2);
              let _competitionActive = res.body.competitions[0];
              let _competitionCompleted = res.body.competitions[1];
              _competitionActive.should.have.property('_id').eql(competitionActive.id);
              _competitionActive.should.have.property('description').eql('Olímpiadas de Lisboa');
              _competitionActive.should.have.property('scheduledDate').eql(moment.utc(competitionActive.scheduledDate).toISOString());
              _competitionActive.should.have.property('state').eql('Active');
              _competitionCompleted.should.have.property('_id').eql(competitionCompleted.id);
              _competitionCompleted.should.have.property('description').eql('Olímpiadas de Coimbra');
              _competitionCompleted.should.have.property('scheduledDate').eql(moment.utc(competitionCompleted.scheduledDate).toISOString());
              _competitionCompleted.should.have.property('state').eql('Completed');
              should.not.exist(_competitionActive.place);
              should.not.exist(_competitionActive.club);
              should.not.exist(_competitionCompleted.place);
              should.not.exist(_competitionCompleted.club);
              done();
            });
          });
        });
      });

      it('it should GET an array of competitions with state Completed', (done) => {
        let competitionActive = new Competition({
           scheduledDate: moment.utc('2016-07-30 09:30:00').toISOString(), description: 'Olímpiadas de Lisboa', place: _place, club: _club
        });
        let competitionCompleted = new Competition({
           scheduledDate: moment.utc('2016-06-10 09:30:00').toISOString(), description: 'Olímpiadas de Coimbra', place: _place, club: _club,
           state: 'Completed'
        });
        competitionActive.save((err, competitionActive) => {
          competitionCompleted.save((err, competitionCompleted) => {
            chai.request(server)
            .get('/competitions')
            .set('x-access-token', token)
            .query({ state: 'Completed'})
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('status').eql(200);
              res.body.should.have.property('competitions');
              res.body.competitions.should.be.a('array');
              res.body.competitions.length.should.be.eql(1);
              let _competitionCompleted = res.body.competitions[0];
              _competitionCompleted.should.have.property('_id').eql(competitionCompleted.id);
              _competitionCompleted.should.have.property('description').eql('Olímpiadas de Coimbra');
              _competitionCompleted.should.have.property('scheduledDate').eql(moment.utc(competitionCompleted.scheduledDate).toISOString());
              _competitionCompleted.should.have.property('state').eql('Completed');
              should.not.exist(_competitionCompleted.place);
              should.not.exist(_competitionCompleted.club);
              done();
            });
          });
        });
      });

      it('it should GET an array of competitions with state Active', (done) => {
        let competitionActive = new Competition({
           scheduledDate: moment.utc('2016-07-30 09:30:00').toISOString(), description: 'Olímpiadas de Lisboa', place: _place, club: _club
        });
        let competitionCompleted = new Competition({
           scheduledDate: moment.utc('2016-06-10 09:30:00').toISOString(), description: 'Olímpiadas de Coimbra', place: _place, club: _club,
           state: 'Completed'
        });
        competitionActive.save((err, competitionActive) => {
          competitionCompleted.save((err, competitionCompleted) => {
            chai.request(server)
            .get('/competitions')
            .set('x-access-token', token)
            .query({ state: 'Active'})
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('status').eql(200);
              res.body.should.have.property('competitions');
              res.body.competitions.should.be.a('array');
              res.body.competitions.length.should.be.eql(1);
              let _competitionActive = res.body.competitions[0];
              _competitionActive.should.have.property('_id').eql(competitionActive.id);
              _competitionActive.should.have.property('description').eql('Olímpiadas de Lisboa');
              _competitionActive.should.have.property('scheduledDate').eql(moment.utc(competitionActive.scheduledDate).toISOString());
              _competitionActive.should.have.property('state').eql('Active');
              should.not.exist(_competitionActive.place);
              should.not.exist(_competitionActive.club);
              done();
            });
          });
        });
      });

    });

    /* Test POST Route */
    describe('/POST competition', () => {

      it('it should not POST a competition if scheduledDate/description/place/club fields aren\'t passed', (done) => {
        let competition = {};
        chai.request(server)
          .post('/competitions')
          .set('x-access-token', token)
          .send(competition)
          .end((err, res) => {
            should.exist(err);
            res.should.have.status(400);
            res.body.should.have.property('status').eql(400);
            res.body.should.have.property('message').eql('Missing some required fields.');
            res.body.should.have.property('error');
            res.body.error.should.be.a('object');
            res.body.error.should.have.property('errors');
            res.body.error.errors.should.have.property('scheduledDate');
            res.body.error.errors.should.have.property('description');
            res.body.error.errors.should.have.property('place');
            res.body.error.errors.should.have.property('club');
            res.body.error.errors.scheduledDate.should.have.property('kind').eql('required');
            res.body.error.errors.description.should.have.property('kind').eql('required');
            res.body.error.errors.place.should.have.property('kind').eql('required');
            res.body.error.errors.place.should.have.property('kind').eql('required');
            done();
          });
      });

      it('it should POST a competition if the required values are passed correctly', (done) => {
        let competition = { scheduledDate: '2016-07-30 09:30:00', description: 'Olímpiadas de Lisboa', place: _place, club: _club };
        chai.request(server)
          .post('/competitions')
          .set('x-access-token', token)
          .send(competition)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Competition successfully created!');
            res.body.should.have.property('competition');
            res.body.competition.should.be.a('object');
            res.body.competition.should.have.property('_id');
            res.body.competition.should.have.property('scheduledDate').eql(moment.utc('2016-07-30 09:30:00').toISOString());
            res.body.competition.should.have.property('description').eql('Olímpiadas de Lisboa');
            res.body.competition.should.have.property('state').eql('Active');
            res.body.competition.should.have.property('place').eql(_place.id);
            res.body.competition.should.have.property('club').eql(_club.id);
            res.body.competition.should.have.property('inventory');
            res.body.competition.should.have.property('events');
            res.body.competition.inventory.should.be.a('array');
            res.body.competition.events.should.be.a('array');
            res.body.competition.inventory.length.should.be.eql(0);
            res.body.competition.events.length.should.be.eql(0);
            done();
          });
      });

    });

    /* Test GET/:id Route */
    describe('/GET/:id competition', () => {

      it('it should GET a competition by the given id', (done) => {
        let competition = new Competition({
          scheduledDate: moment.utc('2016-07-30 09:30:00').toISOString(), description: 'Olímpiadas de Lisboa', place: _place, club: _club
        });
        competition.save((err, competition) => {
          chai.request(server)
            .get('/competitions/'+ competition.id)
            .set('x-access-token', token)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('status').eql(200);
              res.body.should.have.property('competition');
              res.body.competition.should.have.property('_id').eql(competition.id);
              res.body.competition.should.have.property('description').eql('Olímpiadas de Lisboa');
              res.body.competition.should.have.property('scheduledDate').eql(moment.utc('2016-07-30 09:30:00').toISOString());
              res.body.competition.should.have.property('state').eql('Active');
              res.body.competition.should.have.property('place');
              res.body.competition.place.should.be.a('object');
              res.body.competition.place.should.have.property('_id').eql(_place.id);
              res.body.competition.place.should.have.property('address');
              should.not.exist(res.body.competition.place.google);
              done();
            });
        });
      });

    });

    /* Test PUT/:id Route */
    describe('/PUT/:id competition', () => {

      it('it should UPDATE udpate place and state of competition by the given id', (done) => {
        let competition = new Competition({
          scheduledDate: moment.utc('2016-07-30 09:30:00').toISOString(), description: 'Olímpiadas de Lisboa', place: _place, club: _club
        });
        let place = new Place({
          address: { street: 'Lisboa', zip_code: '2450-111', city: 'Lisboa', country: 'Portugal' }
        });
        competition.save((err, competition) => {
          place.save((err, place) => {
            chai.request(server)
              .put('/competitions/'+ competition.id)
              .set('x-access-token', token)
              .send({state: 'Canceled', place: place})
              .end((err, res) => {
                should.not.exist(err);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('Competition successfully updated!');
                res.body.should.have.property('competition');
                res.body.competition.should.have.property('_id').eql(competition.id);
                res.body.competition.should.have.property('description').eql('Olímpiadas de Lisboa');
                res.body.competition.should.have.property('scheduledDate').eql(moment.utc('2016-07-30 09:30:00').toISOString());
                res.body.competition.should.have.property('state').eql('Canceled');
                res.body.competition.should.have.property('place').not.eql(_place.id);
                res.body.competition.should.have.property('place').eql(place.id);
                done();
              });
          });
        });
      });

    });

    /* Test GET/:id/products Route */
    describe('/GET/:id/products', () => {

      it('it should GET empty inventory', (done) => {
        let competition = new Competition({
           scheduledDate: moment.utc('2016-07-30 09:30:00').toISOString(), description: 'Olímpiadas de Lisboa', place: _place, club: _club
        });
        competition.save((err, competition) => {
          chai.request(server)
          .get('/competitions/'+ competition.id +'/products')
          .set('x-access-token', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('products');
            res.body.products.should.be.a('array');
            res.body.products.length.should.be.eql(0);
            done();
          });
        });
      });

      it('it should GET an inventory of products', (done) => {
        let competition = new Competition({
           scheduledDate: moment.utc('2016-07-30 09:30:00').toISOString(), description: 'Olímpiadas de Lisboa', place: _place, club: _club
        });
        let product = new Product({name: 'Carro', stock: 1});

        competition.save((err, competition) => {
          product.save((err, product) => {
            competition.add('inventory', product.id, (err, message, competition) => {
              chai.request(server)
              .get('/competitions/'+ competition.id +'/products')
              .set('x-access-token', token)
              .end((err, res) => {
                should.not.exist(err);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql(200);
                res.body.should.have.property('products');
                res.body.products.should.be.a('array');
                res.body.products.length.should.be.eql(1);
                let _product = res.body.products[0];
                _product.should.be.a('object');
                _product.should.have.property('_id').eql(product.id);
                _product.should.have.property('name').eql('Carro');
                _product.should.have.property('stock').eql(1);
                done();
              });
            });
          });
        });
      });

    });

    /* Test POST/:id/products Route */
    describe('/POST/:id/products', () => {

      it('it should not POST if the specified product already exists in competition ', (done) => {
        let competition = new Competition({
           scheduledDate: moment.utc('2016-07-30 09:30:00').toISOString(), description: 'Olímpiadas de Lisboa', place: _place, club: _club
        });
        let product = new Product({name: 'Carro', stock: 1});
        competition.save((err, competition) => {
          product.save((err, product) => {
            competition.add('inventory', product.id, (err, message, competition) => {
              chai.request(server)
              .post('/competitions/' + competition.id +'/products')
              .set('x-access-token', token)
              .send({product: product.id})
              .end((err, res) => {
                should.exist(err);
                res.should.have.status(409);
                res.body.should.have.property('status').eql(409);
                res.body.should.have.property('message').eql('This competition already have the resource specified!');
                done();
              });
            });
          });
        });
      });

      it('it should POST a product in competition', (done) => {
        let competition = new Competition({
           scheduledDate: moment.utc('2016-07-30 09:30:00').toISOString(), description: 'Olímpiadas de Lisboa', place: _place, club: _club
        });
        let product = new Product({name: 'Carro', stock: 1 });
        competition.save((err, competition) => {
          product.save((err, product) => {
            chai.request(server)
            .post('/competitions/' + competition.id +'/products')
            .set('x-access-token', token)
            .send({product: product.id})
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('message').eql('Product added successfully!');
              res.body.should.have.property('competition');
              res.body.competition.should.have.property('_id');
              res.body.competition.should.have.property('scheduledDate');
              res.body.competition.should.have.property('description');
              res.body.competition.should.have.property('place').eql(_place.id);
              res.body.competition.should.have.property('club').eql(_club.id);
              res.body.competition.should.have.property('events');
              res.body.competition.events.should.be.a('array');
              res.body.competition.events.length.should.be.eql(0);
              res.body.competition.should.have.property('inventory');
              res.body.competition.inventory.should.be.a('array');
              res.body.competition.inventory.length.should.be.eql(1);
              res.body.competition.inventory[0].should.be.eql(product.id);
              done();
            });
          });
        });
      });

    });

    /* Test GET/:id/events Route */
    describe('/GET/:id/events', () => {

      it('it should GET empty array of events', (done) => {
        let competition = new Competition({
           scheduledDate: moment.utc('2016-07-30 09:30:00').toISOString(), description: 'Olímpiadas de Lisboa', place: _place, club: _club
        });
        competition.save((err, competition) => {
          chai.request(server)
          .get('/competitions/'+ competition.id +'/events')
          .set('x-access-token', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('events');
            res.body.events.should.be.a('array');
            res.body.events.length.should.be.eql(0);
            done();
          });
        });
      });

      it('it should GET an array of events', (done) => {
        let competition = new Competition({
           scheduledDate: moment.utc('2016-07-30 09:30:00').toISOString(), description: 'Olímpiadas de Lisboa', place: _place, club: _club
        });
        let event = new Event({name: 'Etapa 1', description: 'Corrida de Obstáculos 400m!' });

        competition.save((err, competition) => {
          event.save((err, event) => {
            competition.add('events', event.id, (err, message, competition) => {
              chai.request(server)
              .get('/competitions/'+ competition.id +'/events')
              .set('x-access-token', token)
              .end((err, res) => {
                should.not.exist(err);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql(200);
                res.body.should.have.property('events');
                res.body.events.should.be.a('array');
                res.body.events.length.should.be.eql(1);
                let _event = res.body.events[0];
                _event.should.be.a('object');
                _event.should.have.property('_id').eql(event.id);
                _event.should.have.property('name').eql('Etapa 1');
                _event.should.have.property('description').eql('Corrida de Obstáculos 400m!');
                done();
              });
            });
          });
        });
      });

    });

    /* Test POST/:id/events Route */
    describe('/POST/:id/events', () => {

      it('it should not POST if the specified event already exists in competition ', (done) => {
        let competition = new Competition({
           scheduledDate: moment.utc('2016-07-30 09:30:00').toISOString(), description: 'Olímpiadas de Lisboa', place: _place, club: _club
        });
        let event = new Event({name: 'Etapa 1', description: 'Corrida de Obstáculos 400m!' });
        competition.save((err, competition) => {
          event.save((err, event) => {
            competition.add('events', event.id, (err, message, competition) => {
              chai.request(server)
              .post('/competitions/' + competition.id +'/events')
              .set('x-access-token', token)
              .send({event: event.id})
              .end((err, res) => {
                should.exist(err);
                res.should.have.status(409);
                res.body.should.have.property('status').eql(409);
                res.body.should.have.property('message').eql('This competition already have the resource specified!');
                done();
              });
            });
          });
        });
      });

      it('it should POST a event in competition', (done) => {
        let competition = new Competition({
           scheduledDate: moment.utc('2016-07-30 09:30:00').toISOString(), description: 'Olímpiadas de Lisboa', place: _place, club: _club
        });
        let event = new Event({name: 'Etapa 1', description: 'Corrida de Obstáculos 400m!' });
        competition.save((err, competition) => {
          event.save((err, event) => {
            chai.request(server)
            .post('/competitions/' + competition.id +'/events')
            .set('x-access-token', token)
            .send({event: event.id})
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('message').eql('Event added successfully!');
              res.body.should.have.property('competition');
              res.body.competition.should.have.property('_id');
              res.body.competition.should.have.property('scheduledDate');
              res.body.competition.should.have.property('description');
              res.body.competition.should.have.property('place').eql(_place.id);
              res.body.competition.should.have.property('club').eql(_club.id);
              res.body.competition.should.have.property('events');
              res.body.competition.events.should.be.a('array');
              res.body.competition.events.length.should.be.eql(1);
              res.body.competition.events[0].should.be.eql(event.id);
              res.body.competition.should.have.property('inventory');
              res.body.competition.inventory.should.be.a('array');
              res.body.competition.inventory.length.should.be.eql(0);
              done();
            });
          });
        });
      });

    });

    /* Test GET/:id/athletes */
    describe('GET/:id/athletes', () => {

      it('it should GET an empty array of athletes', (done) => {
        let competition = new Competition({
           scheduledDate: moment.utc('2016-07-30 09:30:00').toISOString(), description: 'Olímpiadas de Lisboa', place: _place, club: _club
        });
        competition.save((err, competition) => {
          chai.request(server)
          .get('/competitions/'+ competition.id +'/athletes')
          .set('x-access-token', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('athletes');
            res.body.athletes.should.be.a('array');
            res.body.athletes.length.should.be.eql(0);
            done();
          });
        });
      });

      it('it should GET an array of athletes', (done) => {
        let competition = new Competition({
           scheduledDate: moment.utc('2016-07-30 09:30:00').toISOString(), description: 'Olímpiadas de Lisboa', place: _place, club: _club
        });
        competition.save((err, competition) => {
          _athlete.add('competitions', competition.id, (err, message, athlete) => {
            chai.request(server)
            .get('/competitions/'+ competition.id +'/athletes')
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
              athlete.should.have.property('phone').eql('911111111');
              athlete.should.have.property('role').eql('Athlete');
              athlete.should.have.property('birthday').eql(moment.utc('1990-07-22 12:00:00').toISOString());
              athlete.should.have.property('address');
              athlete.address.should.be.a('object');
              athlete.documentation.should.be.a('object');
              done();
            });
          });
        });
      });

    });

    /* Test GET/:id/coaches */
    describe('GET/:id/coaches', () => {

      it('it should GET an empty array of coaches', (done) => {
        let competition = new Competition({
           scheduledDate: moment.utc('2016-07-30 09:30:00').toISOString(), description: 'Olímpiadas de Lisboa', place: _place, club: _club
        });
        competition.save((err, competition) => {
          chai.request(server)
          .get('/competitions/'+ competition.id +'/coaches')
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
      });

      it('it should GET an array of coaches', (done) => {
        let competition = new Competition({
           scheduledDate: moment.utc('2016-07-30 09:30:00').toISOString(), description: 'Olímpiadas de Lisboa', place: _place, club: _club
        });
        competition.save((err, competition) => {
          _coach.add('competitions', competition.id, (err, message, coach) => {
            chai.request(server)
            .get('/competitions/'+ competition.id +'/coaches')
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
              coach.should.have.property('name').eql('Coach Test');
              coach.should.have.property('location').eql('Lisboa');
              coach.should.have.property('age').eql(35);
              coach.should.have.property('phone').eql('911111111');
              coach.should.have.property('role').eql('Coach');
              coach.should.have.property('birthday').eql(moment.utc('1981-07-22 12:00:00').toISOString());
              coach.should.have.property('address');
              coach.address.should.be.a('object');
              coach.documentation.should.be.a('object');
              done();
            });
          });
        });
      });

    });

    /* Test GET/:id/results */
    describe('GET/:id/results', () => {

      it('it should GET empty array of results', (done) => {
        let competition = new Competition({
           scheduledDate: moment.utc('2016-07-30 09:30:00').toISOString(), description: 'Olímpiadas de Lisboa', place: _place, club: _club
        });
        competition.save((err, competition) => {
          chai.request(server)
          .get('/competitions/'+ competition.id +'/results')
          .set('x-access-token', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('results');
            res.body.results.should.be.a('array');
            res.body.results.length.should.be.eql(0);
            done();
          });
        });
      });

      it('it should GET an array of results', (done) => {
        let competition = new Competition({
           scheduledDate: moment.utc('2016-07-30 09:30:00').toISOString(), description: 'Olímpiadas de Lisboa', place: _place, club: _club
        });
        let event = new Event({name: 'Etapa 1', description: 'Corrida de Obstáculos 400m!' });
        competition.save((err, competition) => {
          event.save((err, event) => {
            let result = new Result({ event: event, athlete: _athlete, competition: competition, mark: '10.25s'});
            result.save((err, result) => {
              chai.request(server)
              .get('/competitions/'+ competition.id +'/results')
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
                _result.should.have.property('mark').eql('10.25s');
                _result.should.have.property('event');
                _result.should.have.property('athlete');
                should.not.exist(_result.competition);
                _result.event.should.have.property('_id').eql(event.id);
                _result.event.should.have.property('name');
                _result.event.should.have.property('description');
                _result.athlete.should.have.property('_id').eql(_athlete.id);
                _result.athlete.should.have.property('account');
                _result.athlete.account.should.have.property('_id');
                _result.athlete.account.should.have.property('local');
                _result.athlete.account.local.should.have.property('username').eql('athleteTest');
                _result.athlete.account.local.should.have.property('email').eql('athletetest@gmail.com');
                should.not.exist(_result.athlete.account.password);
                should.not.exist(_result.athlete.birthday);
                done();
              });
            });
          });
        });
      });

    });

  });

};
