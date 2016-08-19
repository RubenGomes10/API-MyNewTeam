let User    = require('../../api/models').User;
let Club    = require('../../api/models').Club;
let Account = require('../../api/models').Account;
let Place   = require('../../api/models').Place;
let moment  = require('moment');

module.exports = (chai, server, should) => {
  describe('Account', () => {
    let tokenAdmin;
    let tokenUser;
    let _user;

    before((done) => {
      let authenticatedUser = {
        username: "globalAdmin",
        password: "Admin123&123"
      }
      chai.request(server)
        .post('/getToken')
        .send(authenticatedUser)
        .end((err, res) => {
          tokenAdmin = res.body.token;
          let place = new Place({
            address: { street: 'Lisboa', zip_code: '2450-111', city: 'Lisboa', country: 'Portugal' }
          });
          place.save((err, place) => { // saves place
            let club = new Club({
              name: 'Sport Lisboa Benfica', acronym: 'SLB', description: 'Melhor Clube do Mundo', type: 'Futebol',
              place: place
            });
            club.save((err, club) => { // saves club
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
                  _user = athlete;
                  chai.request(server)
                    .post('/getToken')
                    .send({username: 'AthleteTest', password: 'athleteTest123&123'})
                    .end((err, res) => {
                      tokenUser = res.body.token;
                      done();
                    });
                });
              });
            });
          });
        });
    });

    after((done) => {
      Account.remove({_id: _user.account}, (err) => {
        User.remove({_id: _user.id}, (err) => {
          Club.remove({}, (err) => {
            Place.remove({}, (err) => {
              done();
            });
          });
        });
      });
    });

    /* Test GET/users/:id/account */
    describe('/GET users/:id/account', () => {

      it('it should get account information of the user specified by id', (done) => {
        chai.request(server)
          .get('/users/' + _user.id + '/account')
          .set('x-access-token', tokenAdmin)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('account');
            res.body.account.should.have.property('_id');
            res.body.account.should.have.property('local');
            res.body.account.should.have.property('user');
            res.body.account.local.should.be.a('object');
            res.body.account.local.should.have.property('username').eql('AthleteTest');
            res.body.account.local.should.have.property('email').eql('athleteTest@gmail.com');
            should.not.exist(res.body.account.local.password);
            res.body.account.user.should.be.a('object');
            res.body.account.user.should.have.property('_id').eql(_user.id);
            done();
          });
      });

    });


    /* Test PUT/users/:id/account */
    describe('/PUT users/:id/account', () => {

      it('it should not have permissions to UPDATE the account if the user isn\'t the user referenced by id', (done) => {
        chai.request(server)
          .put('/users/' + _user.id + '/account')
          .set('x-access-token', tokenAdmin)
          .send({ google: {id: 12345324, token: '12132141Xadwwqdqwoj12', email: 'user@gmail.com', name: 'userEmail' }})
          .end((err, res) => {
            should.exist(err);
            res.should.have.status(403);
            res.should.be.a('object');
            res.body.should.have.property('status').eql(403);
            res.body.should.have.property('message').eql('You are not authorized to perform this operation or to see this content!');
            done();
          });
      });

      it('it should have permissions to UPDATE the account since is the user itself', (done) => {
        chai.request(server)
          .put('/users/' + _user.id + '/account')
          .set('x-access-token', tokenUser)
          .send({ google: {id: 12345324, token: '12132141Xadwwqdqwoj12', email: 'user@gmail.com', name: 'userEmail' }})
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('message').eql('Account successfully updated!');
            res.body.should.have.property('account');
            res.body.account.should.be.a('object');
            res.body.account.should.have.property('local');
            res.body.account.local.should.have.property('username').eql('AthleteTest');
            res.body.account.local.should.have.property('email').eql('athleteTest@gmail.com');
            res.body.account.should.have.property('google');
            res.body.account.google.should.have.property('id').eql(12345324);
            res.body.account.google.should.have.property('token').eql('12132141Xadwwqdqwoj12');
            res.body.account.google.should.have.property('email').eql('user@gmail.com');
            res.body.account.google.should.have.property('name').eql('userEmail');
            done();
          });
      });

    });

    /* Test POST/users/:id/account/changePassword */
    describe('/POST users/:id/account/changePassword', () => {

      it('it should not have permissions to change Password of account if the user isn\'t the user referenced by id', (done) => {
        chai.request(server)
          .post('/users/' + _user.id + '/account/changePassword')
          .set('x-access-token', tokenAdmin)
          .send({ oldPassword: 'athleteTest123&123' , newPassword: 'newPassword123&123' })
          .end((err, res) => {
            should.exist(err);
            res.should.have.status(403);
            res.should.be.a('object');
            res.body.should.have.property('status').eql(403);
            res.body.should.have.property('message').eql('You are not authorized to perform this operation or to see this content!');
            done();
          });
      });

      it('it should have permissions to change Password of account since is the user itself but it will fail because the old password is incorrect', (done) => {
        chai.request(server)
          .post('/users/' + _user.id + '/account/changePassword')
          .set('x-access-token', tokenUser)
          .send({ oldPassword: 'athleteTest124&123' , newPassword: 'newPassword123&123' })
          .end((err, res) => {
            should.exist(err);
            res.should.have.status(401);
            res.should.be.a('object');
            res.body.should.have.property('status').eql(401);
            res.body.should.have.property('message').eql('Old password is not correct. Please try again!');
            done();
          });
      });

      it('it should have permissions to change Password of account since is the user itself', (done) => {
        chai.request(server)
          .post('/users/' + _user.id + '/account/changePassword')
          .set('x-access-token', tokenUser)
          .send({ oldPassword: 'athleteTest123&123' , newPassword: 'newPassword123&123' })
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.should.be.a('object');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('message').eql('Password successfully changed!');
            Account.findById(_user.account).select('_id local.username local.password').exec((err, account) =>{
              account.validPassword('newPassword123&123').should.be.true;
              done();
            });
          });
      });

    });

  });
};
