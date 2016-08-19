let Club = require('../../api/models').Club;
let Place = require('../../api/models').Place;

module.exports = (chai, server, should) => {

  describe('Clubs', () => {

    let token;
    before((done) => { //Before a block of tests we retrived the accessToken
      let authenticatedUser = {
        username: "globalAdmin",
        password: "Admin123&123"
      }
      chai.request(server)
        .post('/getToken')
        .send(authenticatedUser)
        .end((err, res) => {
          token = res.body.token;
          done();
        });
    });

    after((done) => {
      Club.remove({}, (err) => {
        done();
      });
    });

    beforeEach((done) => { //Before each test we empty the club collection
      Club.remove({}, (err) => {
        done();
      });
    });

    afterEach((done) => {
      Place.remove({}, (err) => { // empty place collection after each test
        done();
      });
    });

    /* Test GET Route */
    describe('/GET clubs', () => {

      it('it should GET empty array clubs', (done) => {
        chai.request(server)
        .get('/clubs')
        .set('x-access-token', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql(200);
          res.body.should.have.property('clubs');
          res.body.clubs.should.be.a('array');
          res.body.clubs.length.should.be.eql(0);
          done();
        });
      });

      it('it should GET one club in array of clubs', (done) => {
        let place = new Place({
          address: { street: 'Benfica', zip_code: '2450-111', city: 'Lisboa', country: 'Portugal' }
        });
        place.save((err, place) => {
          let club = new Club({
            name: 'Sport Lisboa Benfica', acronym: 'SLB', description: 'Melhor Clube do Mundo', type: 'Futebol',
            place: place.id
          });
          club.save((err, club) => {
            chai.request(server)
              .get('/clubs')
              .set('x-access-token', token)
              .end((err, res) => {
                should.not.exist(err);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql(200);
                res.body.should.have.property('clubs');
                res.body.clubs.should.be.a('array');
                res.body.clubs.length.should.be.eql(1);
                res.body.clubs[0].should.be.a('object');
                res.body.clubs[0].should.have.property('_id').eql(club.id);
                res.body.clubs[0].should.have.property('name').eql('Sport Lisboa Benfica');
                res.body.clubs[0].should.have.property('acronym').eql('SLB');
                res.body.clubs[0].should.have.property('description').eql('Melhor Clube do Mundo');
                res.body.clubs[0].should.have.property('type').eql('Futebol');
                res.body.clubs[0].should.have.property('place').eql(place.id);
                done();
              });
          })
        });
      });
    });

    /* Test POST Route */
    describe('/POST club', () => {

      it('it should not POST a club without place ref field', (done) => {
        let place = new Place({
          address: { street: 'Benfica', zip_code: '2450-111', city: 'Lisboa', country: 'Portugal' }
        });
        place.save((err, place) => {
          let club = { name: 'Sport Lisboa Benfica', acronym: 'SLB', description: 'Melhor Clube do Mundo', type: 'Futebol' };
          chai.request(server)
            .post('/clubs')
            .set('x-access-token', token)
            .send(club)
            .end((err, res) => {
              should.exist(err);
              res.should.have.status(400);
              res.body.should.have.property('status').eql(400);
              res.body.should.have.property('message').eql('Missing some required fields.');
              res.body.should.have.property('error');
              res.body.error.should.be.a('object');
              res.body.error.should.have.property('errors');
              res.body.error.errors.should.have.property('place');
              res.body.error.errors.place.should.have.property('kind').eql('required');
              done();
            });
        });
      });

      it('it should not POST a club without required fields', (done) => {
        let place = new Place({
          address: { street: 'Benfica', zip_code: '2450-111', city: 'Lisboa', country: 'Portugal' }
        });
        place.save((err, place) => {
          let club = { type: 'Futebol', place: place };
          chai.request(server)
            .post('/clubs')
            .set('x-access-token', token)
            .send(club)
            .end((err, res) => {
              should.exist(err);
              res.should.have.status(400);
              res.body.should.have.property('status').eql(400);
              res.body.should.have.property('message').eql('Missing some required fields.');
              res.body.should.have.property('error');
              res.body.error.should.be.a('object');
              res.body.error.should.have.property('errors');
              res.body.error.errors.should.have.property('name');
              res.body.error.errors.should.have.property('acronym');
              res.body.error.errors.should.have.property('description');
              res.body.error.errors.name.should.have.property('kind').eql('required');
              res.body.error.errors.acronym.should.have.property('kind').eql('required');
              res.body.error.errors.description.should.have.property('kind').eql('required');
              done();
            });
        });
      });

      it('it should POST a club with default type field', (done) => {
        let place = new Place({
          address: { street: 'Benfica', zip_code: '2450-111', city: 'Lisboa', country: 'Portugal' }
        });
        place.save((err, place) => {
          let club = { name: 'Sport Lisboa Benfica', acronym: 'SLB', description: 'Melhor Clube do Mundo', place: place };
          chai.request(server)
            .post('/clubs')
            .set('x-access-token', token)
            .send(club)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('message').eql('Club successfully created!');
              res.body.should.have.property('club');
              res.body.club.should.have.property('_id');
              res.body.club.should.have.property('name').eql('Sport Lisboa Benfica');
              res.body.club.should.have.property('acronym').eql('SLB');
              res.body.club.should.have.property('description').eql('Melhor Clube do Mundo');
              res.body.club.should.have.property('type').eql('athletics');
              res.body.club.should.have.property('place').eql(place.id);
              done();
            });
        });
      });

      it('it should POST a club with all fields specified', (done) => {
        let place = new Place({
          address: { street: 'Benfica', zip_code: '2450-111', city: 'Lisboa', country: 'Portugal' }
        });
        place.save((err, place) => {
          let club = { name: 'Sport Lisboa Benfica', acronym: 'SLB', description: 'Melhor Clube do Mundo', type: 'Futebol', place: place };
          chai.request(server)
            .post('/clubs')
            .set('x-access-token', token)
            .send(club)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('message').eql('Club successfully created!');
              res.body.should.have.property('club');
              res.body.club.should.have.property('_id');
              res.body.club.should.have.property('name').eql('Sport Lisboa Benfica');
              res.body.club.should.have.property('acronym').eql('SLB');
              res.body.club.should.have.property('description').eql('Melhor Clube do Mundo');
              res.body.club.should.have.property('type').eql('Futebol');
              res.body.club.should.have.property('place').eql(place.id);
              done();
            });
        });
      });

    });

    /* Test /Get/:id Route */
    describe('/GET/:id club', () => {

      it('it should GET a club by the given id', (done) => {
        let place = new Place({
          address: { street: 'Benfica', zip_code: '2450-111', city: 'Lisboa', country: 'Portugal' }
        });
        place.save((err, place) => {
          let club = new Club({
            name: 'Sport Lisboa Benfica', acronym: 'SLB', description: 'Melhor Clube do Mundo', type: 'Futebol', place: place
          });

          club.save((err, club) => {
            chai.request(server)
              .get('/clubs/' + club.id)
              .set('x-access-token', token)
              .end((err, res) => {
                should.not.exist(err);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql(200);
                res.body.should.have.property('club');
                res.body.club.should.have.property('_id').eql(club.id);
                res.body.club.should.have.property('name').eql('Sport Lisboa Benfica');
                res.body.club.should.have.property('acronym').eql('SLB');
                res.body.club.should.have.property('description').eql('Melhor Clube do Mundo');
                res.body.club.should.have.property('type').eql('Futebol');
                res.body.club.should.have.property('place').eql(place.id);
                done();
              });
          });
        });
      });

    });

    /* Test /PUT/:id Route */
    describe('/PUT/:id club', () => {

      it('it should UPDATE a club name and acronym given the id and leave the other values unchanged', (done) => {
        let place = new Place({
          address: { street: 'Benfica', zip_code: '2450-111', city: 'Lisboa', country: 'Portugal' }
        });
        place.save((err, place) => {
          let club = new Club({
            name: 'Sport Lisboa Benfica', acronym: 'SLB', description: 'Melhor Clube do Mundo', type: 'Futebol', place: place
          });
          let clubUpdate = { name: 'Benfica SL', acronym: 'SLBenfica' };
          club.save((err, club) => {
            chai.request(server)
            .put('/clubs/'+ club.id)
            .send(clubUpdate)
            .set('x-access-token', token)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('message').eql('Club successfully updated!');
              res.body.should.have.property('club');
              res.body.club.should.be.a('object');
              res.body.club.should.have.property('_id').eql(club.id);
              res.body.club.should.have.property('name').eql('Benfica SL');
              res.body.club.should.have.property('acronym').eql('SLBenfica');
              res.body.club.should.have.property('description').eql('Melhor Clube do Mundo');
              res.body.club.should.have.property('type').eql('Futebol');
              res.body.club.should.have.property('place').eql(place.id);
              done();
            });
          });
        });
      });

      it('it should UPDATE a club place given the id and leave the other values unchanged', (done) => {
        let place = new Place({
          address: { street: 'Benfica', zip_code: '2450-111', city: 'Lisboa', country: 'Portugal' }
        });
        place.save((err, place) => {
          let secondPlace = new Place({
            address: { street: 'Luz', zip_code: '2450-222', city: 'Lisboa', country: 'Portugal' }
          });
          secondPlace.save((err, secondPlace) => {
            let club = new Club({
              name: 'Sport Lisboa Benfica', acronym: 'SLB', description: 'Melhor Clube do Mundo', type: 'Futebol', place: place
            });
            let clubUpdate = { place: secondPlace };
            club.save((err, club) => {
              chai.request(server)
              .put('/clubs/'+ club.id)
              .send(clubUpdate)
              .set('x-access-token', token)
              .end((err, res) => {
                should.not.exist(err);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('Club successfully updated!');
                res.body.should.have.property('club');
                res.body.club.should.be.a('object');
                res.body.club.should.have.property('_id').eql(club.id);
                res.body.club.should.have.property('name').eql('Sport Lisboa Benfica');
                res.body.club.should.have.property('acronym').eql('SLB');
                res.body.club.should.have.property('description').eql('Melhor Clube do Mundo');
                res.body.club.should.have.property('type').eql('Futebol');
                res.body.club.should.have.property('place').eql(secondPlace.id);
                done();
              });
            });
          });

        });
      });

    });

    /* Test /DELETE/:id Route */
    describe('/DELETE/:id club', () => {

      it('it should DELETE a club given the id', (done) => {
        let place = new Place({
          address: { street: 'Benfica', zip_code: '2450-111', city: 'Lisboa', country: 'Portugal' }
        });

        place.save((err, place) => {
          let club = new Club({
            name: 'Sport Lisboa Benfica', acronym: 'SLB', description: 'Melhor Clube do Mundo', type: 'Futebol', place: place
          });
          club.save((err, club) => {
            chai.request(server)
              .delete('/clubs/' + club.id)
              .set('x-access-token', token)
              .end((err, res) => {
                should.not.exist(err);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('Club successfully deleted!');
                res.body.should.have.property('result');
                res.body.result.should.have.property('ok').eql(1);
                res.body.result.should.have.property('n').eql(1);
                done();
              });
          });
        });
      });

    });

  });

};
