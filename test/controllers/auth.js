module.exports = (chai, server, should) => {
  describe('Auth', () => {
    describe('/POST getToken', () => {
      it('it should not get a token from the server if user not exists', (done) => {
        let authenticatedUser = {
          username: "global",
          password: "Admin123&123"
        }
        chai.request(server)
          .post('/getToken')
          .send(authenticatedUser)
          .end((err, res) => {
            should.exist(err);
            res.should.have.status(401);
            res.body.should.have.property('status');
            res.body.should.have.property('status').eql(401);
            res.body.should.have.property('message');
            res.body.should.have.property('message').eql('Authentication failed. User not found or wrong password!');
            done();
          });
      });

      it('it should not get a token from the server if password is incorrect', (done) => {
        let authenticatedUser = {
          username: "globalAdmin",
          password: "Admin123&"
        }
        chai.request(server)
          .post('/getToken')
          .send(authenticatedUser)
          .end((err, res) => {
            should.exist(err);
            res.should.have.status(401);
            res.body.should.have.property('status');
            res.body.should.have.property('status').eql(401);
            res.body.should.have.property('message');
            res.body.should.have.property('message').eql('Authentication failed. User not found or wrong password!');
            done();
          });
      });

      it('it should get a token from the server if the passed data is correct', (done) => {
        let authenticatedUser = {
          username: "globalAdmin",
          password: "Admin123&123"
        }
        chai.request(server)
          .post('/getToken')
          .send(authenticatedUser)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.have.property('token');
            res.body.token.should.have.length.above(0);
            res.body.should.have.property('status');
            res.body.should.have.property('status').eql(200);
            res.body.should.have.property('message');
            res.body.should.have.property('message').eql('Enjoy your token!');
            done();
          });
      });
    });
  });
};
