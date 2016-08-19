let express         = require("express");
let mongoose        = require("mongoose");
let morgan          = require("morgan");
let bodyParser      = require("body-parser");
let Config          = require('config-js');
let methodOverride  = require('method-override');
let compression     = require("compression");
let helper          = require('./api/helpers');
let api             = require('./api/routes');
let app             = express();
let config          = new Config('./config/api_##.js');

// db options
let options = {
  server: {
    socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 }
  }
};

// setup db
mongoose.connect(config.get('DBHost'), options);
let db = mongoose.connection;
db.on('error',console.error.bind(console, 'connection error:'));

// setupAdmin User
helper.Config.setupAdmin(config);

app.set('port', config.get('port'));


//don't show the log when it is test
if(config.get('env') !== 'test') { // writes for a file
    //use morgan to log at command line
    app.use(morgan('combined')); //'combined' outputs the Apache style LOGs
}
//compression of all requests
app.use(compression());
//parse application/json and look for raw text
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json'}));
//CORS Support
app.use(methodOverride('X-HTTP-Method-Override'));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // excludes/restrict ip/domains to api access
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS'); // restrict the methods that api responds
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token'); // restrict the allowed headers from request
  if(req.method == 'OPTIONS')
    return res.status(200).end();
  next();
});

app.use("/", api);

app.listen(app.get('port'),() => console.log("Listening on : " + config.get('host') + ':' + app.get('port')));

module.exports = app;
