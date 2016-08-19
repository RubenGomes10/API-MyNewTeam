let Workout = require('../../api/models').Workout;
let moment  = require('moment');

module.exports = (chai, server, should) => {
  // parent block
  describe('Workouts', () => {

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

    beforeEach((done) => { //Before each test we empty the Workout collection
      Workout.remove({}, (err) => {
        done();
      });
    });

    /* Test GET Route */
    describe('/GET workouts', () => {
      it('it should GET empty array workouts with header x-access-token', (done) => {
        chai.request(server)
          .get('/workouts')
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

      it('it should GET one workout in array of workouts with header x-access-token', (done) => {
        let workout = new Workout({
          title: 'Treino Diário', duration: 3.0, description: 'Treino Cardiovascular'
        });
        workout.save((err, workout) => {
          chai.request(server)
            .get('/workouts')
            .set('x-access-token', token)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('status').eql(200);
              res.body.should.have.property('workouts');
              res.body.workouts.should.be.a('array');
              res.body.workouts.length.should.be.eql(1);
              res.body.workouts[0].should.be.a('object');
              res.body.workouts[0].should.have.property('_id').eql(workout.id);
              res.body.workouts[0].should.have.property('title').eql('Treino Diário');
              res.body.workouts[0].should.have.property('duration').eql(3.0);
              res.body.workouts[0].should.have.property('description').eql('Treino Cardiovascular');
              res.body.workouts[0].should.have.property('workoutDate');
              res.body.workouts[0].workoutDate.should.be.above(moment().toISOString());
              res.body.workouts[0].should.have.property('state').eql('Active');
              done();
            });
        });
      });
    });

    describe('/POST workout', () => {
      it('it should not POST a workout without duration or description fields and header x-access-token', (done) => {
        let workout = { title: 'Treino Diário' }
        chai.request(server)
          .post('/workouts')
          .set('x-access-token', token)
          .send(workout)
          .end((err, res) => {
            should.exist(err);
            res.should.have.status(400);
            res.body.should.have.property('status').eql(400);
            res.body.should.have.property('message').eql('Missing some required fields.');
            res.body.should.have.property('error');
            res.body.error.should.be.a('object');
            res.body.error.should.have.property('errors');
            res.body.error.errors.should.have.property('duration');
            res.body.error.errors.should.have.property('description');
            res.body.error.errors.duration.should.have.property('kind').eql('required');
            res.body.error.errors.description.should.have.property('kind').eql('required');
            done();
          });
      });

      it('it should POST a workout with default state and workoutDate fields and query access_token', (done) => {
        let workout = {
          title: 'Treino Diário', duration: 3.0, description: 'Treino Cardiovascular'
        };
        chai.request(server)
          .post('/workouts')
          .query({access_token: token})
          .send(workout)
          .end((err,res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Workout successfully created!');
            res.body.should.have.property('workout');
            res.body.workout.should.have.property('_id');
            res.body.workout.should.have.property('title').eql('Treino Diário');
            res.body.workout.should.have.property('duration').eql(3.0);
            res.body.workout.should.have.property('description').eql('Treino Cardiovascular');
            res.body.workout.should.have.property('state').eql('Active');
            //Default value
            let workoutDate = moment().utc().hours(10).minutes(0).seconds(0).milliseconds(0).add(1,'d').toISOString();
            res.body.workout.should.have.property('workoutDate').eql(workoutDate);
            done();
          });
      });

      it('it should POST a workout with all the value fields specified and header x-access-token', (done) => {
        let workout = {
          title: 'Treino Diário', duration: 3.0, description: 'Treino Cardiovascular',
          workoutDate: '2016-07-22 15:55:00', state: 'Scheduled'
        }
        chai.request(server)
          .post('/workouts')
          .set('x-access-token', token)
          .send(workout)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Workout successfully created!');
            res.body.should.have.property('workout');
            res.body.workout.should.have.property('_id');
            res.body.workout.should.have.property('title').eql('Treino Diário');
            res.body.workout.should.have.property('duration').eql(3.0);
            res.body.workout.should.have.property('description').eql('Treino Cardiovascular');
            res.body.workout.should.have.property('state').eql('Scheduled');
            let workoutDate = moment.utc('2016-07-22 15:55:00').toISOString();
            res.body.workout.should.have.property('workoutDate').eql(workoutDate);
            done();
          });
      });
    });

    /* Test /GET/:id Route */
    describe('/GET/:id workout', () => {
      it('it should GET a workout by the given id', (done) => {
        let workout = new Workout({
          title: 'Treino Diário', duration: 3.0, description: 'Treino Cardiovascular'
        });
        workout.save((err, workout) => {
          chai.request(server)
            .get('/workouts/'+ workout.id)
            .set('x-access-token', token)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('status').eql(200);
              res.body.should.have.property('workout');
              res.body.workout.should.have.property('_id').eql(workout.id);
              res.body.workout.should.have.property('title').eql('Treino Diário');
              res.body.workout.should.have.property('duration').eql(3.0);
              res.body.workout.should.have.property('description').eql('Treino Cardiovascular');
              res.body.workout.should.have.property('state').eql('Active');
              //Default value
              let workoutDate = moment().utc().hours(10).minutes(0).seconds(0).milliseconds(0).add(1,'d').toISOString();
              res.body.workout.should.have.property('workoutDate').eql(workoutDate);
              done();
            });
        });
      });
    });

    /* Test /PUT/:id workout */
    describe('/PUT/:id workout', () => {
      it('it should UPDATE a workout title and duration and workoutDate given the id and leave the values unchanged', (done) => {
        let workout = new Workout({
          title: 'Treino Diário', duration: 3.0, description: 'Treino Cardiovascular'
        });
        let workoutUpdate = { title: 'Treino Semanal', duration: 4.0, workoutDate: '2016-07-22 18:00:00' }
        workout.save((err, workout) => {
          chai.request(server)
            .put('/workouts/'+ workout.id)
            .set('x-access-token', token)
            .send(workoutUpdate)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.be.a('object');
              res.body.should.have.property('message').eql('Workout successfully updated!');
              res.body.should.have.property('workout');
              res.body.workout.should.have.property('_id').eql(workout.id);
              res.body.workout.should.have.property('title').eql('Treino Semanal');
              res.body.workout.should.have.property('duration').eql(4.0);
              res.body.workout.should.have.property('description').eql('Treino Cardiovascular');
              res.body.workout.should.have.property('state').eql('Active');
              let workoutDate = moment.utc('2016-07-22 18:00:00').toISOString();
              res.body.workout.should.have.property('workoutDate').eql(workoutDate);
              done();
            });
        });
      });
    });

    /* Test /DELETE/:id workout */
    describe('/DELETE/:id event', () => {
      it('it should DELETE a event given the id', (done) => {
        let workout = new Workout({
          title: 'Treino Diário', duration: 3.0, description: 'Treino Cardiovascular'
        });
        workout.save((err, workout) => {
          chai.request(server)
            .delete('/workouts/' + workout.id)
            .set('x-access-token', token)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('message').eql('Workout successfully deleted!');
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
