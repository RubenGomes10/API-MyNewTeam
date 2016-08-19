let Event = require("../../api/models").Event;

module.exports = (chai, server, should) => {
// parent block
  describe('Events', () => {

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

    beforeEach((done) => { //Before each test we empty the Event collection
      Event.remove({}, (err) => {
        done();
      });
    });

    /* Test GET Route */
    describe('/GET events', () => {
      it('it should GET empty array events', (done) => {
        chai.request(server)
        .get('/events')
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

      it('it should GET one event in array of events', (done) => {
        let event = new Event({ name: 'Corrida de 100 metros.', description: 'Corrida de 100 metros (Pré- treino às 10h00m).' });
        event.save((err, event) => {
          chai.request(server)
            .get('/events')
            .set('x-access-token', token)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('status').eql(200);
              res.body.should.have.property('events');
              res.body.events.should.be.a('array');
              res.body.events.length.should.be.eql(1);
              res.body.events[0].should.be.a('object');
              res.body.events[0].should.have.property('_id').eql(event.id);
              res.body.events[0].should.have.property('name').eql('Corrida de 100 metros.');
              res.body.events[0].should.have.property('description').eql('Corrida de 100 metros (Pré- treino às 10h00m).');
              done();
            });
        });
      });
    });

    /* Test POST Route */
    describe('/POST event', () => {
      it('it should not POST a event without description field', (done) => {
        let event = {
          name: 'Corrida de 100 metros'
        }
        chai.request(server)
          .post('/events')
          .set('x-access-token', token)
          .send(event)
          .end((err, res) => {
            should.exist(err);
            res.should.have.status(400);
            res.body.should.have.property('status').eql(400);
            res.body.should.have.property('message').eql('Missing some required fields.');
            res.body.should.have.property('error');
            res.body.error.should.be.a('object');
            res.body.error.should.have.property('errors');
            res.body.error.errors.should.have.property('description');
            res.body.error.errors.description.should.have.property('kind').eql('required');
            done();
          });
      });

      it('it should not POST a event without name field', (done) => {
        let event = {
          description: 'Corrida de 100 metros (Pré- treino às 10h00m).'
        }
        chai.request(server)
          .post('/events')
          .set('x-access-token', token)
          .send(event)
          .end((err, res) => {
            should.exist(err);
            res.should.have.status(400);
            res.body.should.have.property('status').eql(400);
            res.body.should.have.property('message').eql('Missing some required fields.');
            res.body.should.have.property('error');
            res.body.error.should.be.a('object');
            res.body.error.should.have.property('errors');
            res.body.error.errors.should.have.property('name');
            res.body.error.errors.name.should.have.property('kind').eql('required');
            done();
          });
      });

      it('it should POST a event', (done) => {
        let event = {
          name: 'Corrida de 100 metros.',
          description: 'Corrida de 100 metros (Pré- treino às 10h00m).'
        }
        chai.request(server)
          .post('/events')
          .set('x-access-token', token)
          .send(event)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Event successfully created!');
            res.body.event.should.have.property('_id');
            res.body.event.should.have.property('name');
            res.body.event.should.have.property('description');
            done();
          });
      });
    });

    /* Test /Get/:id route */
    describe('/GET/:id event', () => {
      it('it should GET a event by the given id', (done) => {
        let event = new Event({ name: 'Corrida de 100 metros.', description: 'Corrida de 100 metros (Pré- treino às 10h00m).' });
        event.save((err, event) => {
          chai.request(server)
            .get('/events/' + event.id)
            .set('x-access-token', token)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.have.property('status').eql(200);
              res.body.should.have.property('event');
              res.body.event.should.be.a('object');
              res.body.event.should.have.property('name');
              res.body.event.should.have.property('description');
              res.body.event.should.have.property('_id').eql(event.id);
              done();
            });
        });
      });
    });

    /* Test /PUT/:id route */
    describe('/PUT/:id event', () => {
      it('it should UPDATE a event name given the id and leave the other values unchanged', (done) => {
        let event = new Event({ name: 'Corrida de 400 metros.', description: 'Corrida de 100 metros (Pré- treino às 10h00m).' });
        let eventUpdate = { name: 'Corrida de 1km' };
        event.save((err,event) => {
          chai.request(server)
          .put('/events/'+ event.id)
          .send(eventUpdate)
          .set('x-access-token', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Event successfully updated!');
            res.body.event.should.have.property('_id').eql(event.id);
            res.body.event.should.have.property('name').eql('Corrida de 1km');
            res.body.event.should.have.property('description').eql('Corrida de 100 metros (Pré- treino às 10h00m).');
            done();
          });
        });
      });
    });

    /* Test /DELETE/:id event */
    describe('/DELETE/:id event', () => {
      it('it should DELETE a event given the id', (done) => {
        let event = new Event({ name: 'Corrida de 400 metros.', description: 'Corrida de 100 metros (Pré- treino às 10h00m).' });
        event.save((err, event) => {
          chai.request(server)
            .delete('/events/' + event.id)
            .set('x-access-token', token)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('message').eql('Event successfully deleted!');
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
