module.exports = (chai, server, should) => {
  describe('Root', () => {
    describe('/GET index', () => {
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

      it('it should get a welcome message from the root', (done) => {
        chai.request(server)
          .get('/')
          .end((err,res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('API').eql('Welcome to My New Team Api!');
            res.body.should.have.property('Documentation').eql('https://github.com/Trovoada/ps15-16/wiki/Api');
            done();
          });
      });

      it('it should get a message of invalid path if the route doesn\' exists', (done) => {
        chai.request(server)
          .get('/blabala')
          .set('x-access-token', token)
          .end((err,res) => {
            should.exist(err);
            res.should.have.status(404);
            res.body.should.have.property('status').eql(404);
            res.body.should.have.property('message').eql('Path does not exists!');
            done();
          });
      });

    });
  });
};
