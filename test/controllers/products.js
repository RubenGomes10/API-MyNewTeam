let Product = require('../../api/models').Product;

module.exports = (chai, server, should) => {

  describe('Products', () => {
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
      Product.remove({}, (err) => {
        done();
      });
    });

    /* Test GET Route */
    describe('/GET products', () => {
      it('it should GET empty array products', (done) => {
        chai.request(server)
        .get('/products')
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

      it('it should GET one product in array of products', (done) => {
        let product = new Product({ name: 'Autocarro', stock: 1});
        product.save((err, product) => {
          chai.request(server)
            .get('/products')
            .set('x-access-token', token)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('status').eql(200);
              res.body.should.have.property('products');
              res.body.products.should.be.a('array');
              res.body.products.length.should.be.eql(1);
              res.body.products[0].should.be.a('object');
              res.body.products[0].should.have.property('_id').eql(product.id);
              res.body.products[0].should.have.property('name').eql('Autocarro');
              res.body.products[0].should.have.property('stock').eql(1);
              res.body.products[0].should.have.property('type').eql('Vehicle');

              done();
            });
        });
      });
    });

    /* Test POST Route */
    describe('/POST product', () => {
      it('it should not POST a product without name field', (done) => {
        let product = { stock: 1 }
        chai.request(server)
          .post('/products')
          .set('x-access-token', token)
          .send(product)
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

      it('it should POST a product with default stock', (done) => {
        let product = { name: 'Autocarro', type: 'T-Shirt' };
        chai.request(server)
          .post('/products')
          .set('x-access-token', token)
          .send(product)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Product successfully created!');
            res.body.should.have.property('product');
            res.body.product.should.have.property('_id');
            res.body.product.should.have.property('name').eql('Autocarro');
            res.body.product.should.have.property('stock').eql(0);
            res.body.product.should.have.property('type').eql('T-Shirt');
            done();
          });
      });

      it('it should POST a product with all defined fields', (done) => {
        let product = { name: 'Autocarro', stock: 1, type: 'T-Shirt', description: 'Train'};
        chai.request(server)
          .post('/products')
          .set('x-access-token', token)
          .send(product)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Product successfully created!');
            res.body.should.have.property('product');
            res.body.product.should.have.property('_id');
            res.body.product.should.have.property('name').eql('Autocarro');
            res.body.product.should.have.property('stock').eql(1);
            res.body.product.should.have.property('type').eql('T-Shirt');
            res.body.product.should.have.property('description').eql('Train');
            done();
          });
      });

    });

    /* *Test /GET/:id route */
    describe('/GET/:id product', () => {
      it('it should GET a product by the given id', (done) => {
        let product = new Product({ name: 'Autocarro', stock: 1 });
        product.save((err, product) => {
          chai.request(server)
            .get('/products/' + product.id)
            .set('x-access-token', token)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('status').eql(200);
              res.body.should.have.property('product');
              res.body.product.should.have.property('_id').eql(product.id);
              res.body.product.should.have.property('name').eql('Autocarro');
              res.body.product.should.have.property('stock').eql(1);
              res.body.product.should.have.property('type').eql('Vehicle');
              done();
            });
        });
      });
    });

    /* Test /PUT/:id route */
    describe('/PUT/:id product', () => {
      it('it should UPDATE a product name and price given the id and leave the other values unchanged', (done) => {
        let product = new Product({ name: 'Autocarro', stock: 1 });
        let productUpdate = { name: 'Carro', description: 'Treino a cascais.' };
        product.save((err, product) => {
          chai.request(server)
          .put('/products/'+ product.id)
          .send(productUpdate)
          .set('x-access-token', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Product successfully updated!');
            res.body.should.have.property('product');
            res.body.product.should.have.property('_id').eql(product.id);
            res.body.product.should.have.property('name').eql('Carro');
            res.body.product.should.have.property('stock').eql(1);
            res.body.product.should.have.property('type').eql('Vehicle');
            res.body.product.should.have.property('description').eql('Treino a cascais.');
            done();
          });
        });
      });
    });

    /* Test /DELETE/:id product */
    describe('/DELETE/:id product', () => {
      it('it should DELETE a product given the id', (done) => {
        let product = new Product({ name: 'Autocarro', stock: 1 });
        product.save((err, product) => {
          chai.request(server)
            .delete('/products/' + product.id)
            .set('x-access-token', token)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('message').eql('Product successfully deleted!');
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
