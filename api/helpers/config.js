let models = require('../models');
let User = models.User;
let Account = models.Account;

module.exports = { setupAdmin };

function setupAdmin(config){
  Account.findOne({'local.username' : config.get('adminUsername')}, (err,accountAdmin) => {
    if(err) {
        console.log('ERROR SetupAdmin :: ' + err);
        return;
    }
    if(accountAdmin) return;

    let body = {
        fullName: {
            first: "Global",
            last: "Admin"
        },
        role: "Admin",
        location: "Lisbon",
        phone: "911111111",
        age: 30,
        birthday: "1986-04-05",
        address: {
          street: "Saldanha",
          zip_code: "1111-111",
          city: "Lisbon",
          country: "Portugal"
        },
        documentation: {
          nif: 111111111,
          citizen_card: "111111111-z11",
          driving_license: "B"
        }
    };

    let newUser = new User(body);

    newUser.save((err,adminUser) => {
      adminUser.createAccount(config.get('adminUsername'),config.get('adminPassword'), config.get('adminEmail'), (err,adminUser) => {
        if(err) console.log('ERROR SetupAdmin :: ' + err);
      });
    });
  });
};
