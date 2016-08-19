let Place = require('../../api/models').Place;

module.exports = (chai, server, should) => {
  describe('Places', () => {
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
    beforeEach((done) => {
      Place.remove({}, (err) =>{
        done();
      });
    });

    /* Test GET Route */
    describe('/GET places', () => {
      it('it should GET empty array places', (done) => {
        chai.request(server)
          .get('/places')
          .set('x-access-token', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('places');
            res.body.places.should.be.a('array');
            res.body.places.length.should.be.eql(0);
            done();
          });
      });

      it('it should GET one place in array of places', (done) =>{
        let place = new Place({
          address: { street: 'Nazaré', zip_code: '2450-111', city: 'Alcobaça', country: 'Portugal' }
        });
        place.save((err, place) => {
          chai.request(server)
            .get('/places')
            .set('x-access-token', token)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('status').eql(200);
              res.body.should.have.property('places');
              res.body.places.should.be.a('array');
              res.body.places.length.should.be.eql(1);
              should.not.exist(res.body.places[0].google);
              res.body.places[0].should.be.a('object');
              res.body.places[0].should.have.property('_id');
              res.body.places[0].should.have.property('address');
              res.body.places[0].address.should.be.a('object');
              res.body.places[0].address.should.have.property('street').eql('Nazaré');
              res.body.places[0].address.should.have.property('zip_code').eql('2450-111');
              res.body.places[0].address.should.have.property('city').eql('Alcobaça');
              res.body.places[0].address.should.have.property('country').eql('Portugal');
              done();
            });
        })
      });
    });

    /* Test POST Route */
    describe('/POST place', () => {
      it('it should not POST a place without one of the fields in address field', (done) => {
        let place = { address: { street: 'Alcobaça'} };
        chai.request(server)
          .post('/places')
          .send(place)
          .set('x-access-token', token)
          .end((err, res) => {
            should.exist(err);
            res.should.have.status(400);
            res.body.should.have.property('status').eql(400);
            res.body.should.have.property('message').eql('Missing some required fields.');
            res.body.should.have.property('error');
            res.body.error.should.be.a('object');
            res.body.error.should.have.property('errors');
            res.body.error.errors.should.have.property('address.zip_code');
            res.body.error.errors.should.have.property('address.city');
            res.body.error.errors.should.have.property('address.country');
            done();
          });
      });

      it('it should POST a place without non required google field', (done) => {
        let place = {
          address: { street: 'Nazaré', zip_code: '2450-111', city: 'Alcobaça', country: 'Portugal' }
        };

        chai.request(server)
          .post('/places')
          .set('x-access-token', token)
          .send(place)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Place successfully created!');
            res.body.should.have.property('place');
            res.body.place.should.have.property('_id');
            should.not.exist(res.body.place.google);
            res.body.place.should.have.property('address');
            res.body.place.address.should.be.a('object');
            res.body.place.address.should.have.property('street').eql('Nazaré');
            res.body.place.address.should.have.property('zip_code').eql('2450-111');
            res.body.place.address.should.have.property('city').eql('Alcobaça');
            res.body.place.address.should.have.property('country').eql('Portugal');
            done();
          });
      });
    });

    /* Test /GET/:id Route */
    describe('/GET/:id place', () => {
      it('it should GET a place by the given id', (done) => {
        let place = new Place({
          address: { street: 'Nazaré', zip_code: '2450-111', city: 'Alcobaça', country: 'Portugal' }
        });
        place.save((err, event) => {
          chai.request(server)
            .get('/places/' + place.id)
            .set('x-access-token', token)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('status').eql(200);
              res.body.should.have.property('place');
              should.not.exist(res.body.place.google);
              res.body.place.should.have.property('address');
              res.body.place.should.have.property('_id').eql(place.id);
              res.body.place.address.should.have.property('street').eql('Nazaré');
              res.body.place.address.should.have.property('zip_code').eql('2450-111');
              res.body.place.address.should.have.property('city').eql('Alcobaça');
              res.body.place.address.should.have.property('country').eql('Portugal');
              done();
            });
        });
      });
    });

    /* Test /PUT/:id Route */
    describe('/PUT/:id place', () => {
      it('it should UPDATE a place address given the id and leave another values unchanged', (done) => {
        let place = new Place({
          address: { street: 'Nazaré', zip_code: '2450-111', city: 'Alcobaça', country: 'Portugal' }
        });
        let placeUpdate = {
          address: { street: 'Cela-Nova', zip_code: '2460-111', city: 'Alcobaça', country: 'Portugal' },
          google: { latitude: 12.5, longitude: 25.5, link: 'http://googlemaps/q=latitude=12.5&longitude=25.5'}
        }
        place.save((err, place) => {
          chai.request(server)
            .put('/places/'+ place.id)
            .send(placeUpdate)
            .set('x-access-token', token)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('message').eql('Place successfully update!');
              res.body.should.have.property('place');
              res.body.place.should.have.property('_id').eql(place.id);
              res.body.place.should.have.property('address');
              res.body.place.address.should.be.a('object');
              res.body.place.address.should.have.property('street').eql('Cela-Nova');
              res.body.place.address.should.have.property('zip_code').eql('2460-111');
              res.body.place.address.should.have.property('city').eql('Alcobaça');
              res.body.place.address.should.have.property('country').eql('Portugal');
              res.body.place.should.have.property('google');
              res.body.place.google.should.be.a('object');
              res.body.place.google.should.have.property('latitude').eql(12.5);
              res.body.place.google.should.have.property('longitude').eql(25.5);
              res.body.place.google.should.have.property('link').eql('http://googlemaps/q=latitude=12.5&longitude=25.5');
              done();
            });
        });
      });
    });

    /* Test /DELETE/:id Route */
    describe('/DELETE/:id place', () => {
      it('it should DELETE a place given the id', (done) => {
        let place = new Place({
          address: { street: 'Nazaré', zip_code: '2450-111', city: 'Alcobaça', country: 'Portugal' }
        });
        place.save((err, place) => {
          chai.request(server)
            .delete('/places/'+ place.id)
            .set('x-access-token', token)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('message').eql('Place successfully deleted!');
              res.body.should.have.property('result');
              res.body.result.should.have.property('ok').eql(1);
              res.body.result.should.have.property('n').eql(1);
              done();
            });
        });
      });
    });

  });
};
