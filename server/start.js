'use strict';

// Start file for R dataframe demo
const express          = require('express');
const mongoose         = require('mongoose');
const promisify        = require('es6-promisify');
const path             = require('path');
const bodyParser       = require('body-parser');
const session          = require('express-session');
const MongoStore       = require('connect-mongo')(session);
const errorHandlers    = require('./handlers/errorHandlers');
const routes           = require('./rest/endpoints');
const dotEnv           = require('dotenv');

// Express
const app = express();

// environment vars
dotEnv.config({ path: 'variables.env' });

app.use(express.static(path.join(__dirname + '/.././dist') ));

// setup to use a view engine if you want to modify to use a template instead of serve the Angular index.html file
app.set('views', path.join(__dirname, '/.././dist'));
app.set('view engine','ejs');
app.engine('html', require('ejs').renderFile);

app.set('env', process.env.NODE_ENV);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Won't use this in the demo, but it will be useful for extending the application if you like
app.use(session({
  secret: process.env.SECRET,
  key: process.env.KEY,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// app.use(errorHandlers.notFound);
app.use(errorHandlers.mongoErrors);

if (app.get('env') === 'dev')
{
  // 'dev' err handler
  app.use(errorHandlers.devErrors);
}
else
{
  // general production err handler
  app.use(errorHandlers.prodErrors);
}

// Check for Node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 7 || (major === 7 && minor <= 5))
{
  console.log('Node 7.6 or higher required for this application! Please go to nodejs.org and download the latest version.');
  process.exit();
}

// Use ES6 Promises in Mongoose
mongoose.Promise = global.Promise;

// DB connection
mongoose.connect(process.env.DATABASE);

const db = mongoose.connection;

db.on('error', (err) => {
  console.error(`DB Connection Error:  ${err.message}`);
});

const UsedCars = require('./models/usedCarsModel');

app.set('port', process.env.PORT || 3000);

// rest endpoints
routes(app);

app.get('*', function(req, res) {
  res.sendFile('index');
});

const server = app.listen(app.get('port'), () => {
  console.log(`Express running on PORT ${server.address().port}`);
});
