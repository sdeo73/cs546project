const express = require('express');
const app = express();

const static = express.static(__dirname + '/public');
const session = require('express-session');

const configRoutes = require('./routes');
const exphbs = require('express-handlebars');

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  name: 'AuthCookie',
  secret: 'Patrick is awesome',
  resave: false,
  saveUninitialized: true,
  cookie: { path: '/', httpOnly: true, secure: false, maxAge: null }
}));

app.use(function (req, res, next) {
  let auth = "Non-Authenticated User";
  if (req.session.AuthCookie) {
    auth = "Authenticated User";
  }
  console.log(`[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} (${auth})`);
  next();
});

app.use('/home', function (req, res, next) {
  if (!req.session.userID) {
    return next();
  } else {
    return res.status(200).redirect('/userHome');
  }
});

app.use('/userhome', function (req, res, next) {
  if (req.session.userID) {
    return next();
  } else {
    return res.status(200).redirect('/login');
  }
});

app.use('/signup', function (req, res, next) {
  if (req.session.userID) {
    return res.status(200).redirect('/userHome');
  } else {
    return next();
  }
});

app.use('/preferences', function (req, res, next) {
  if (req.session.userID) {
    return next();
  } else {
    return res.status(200).redirect('/login');
  }
});

app.use('/generateItinerary', function (req, res, next) {
  if (req.session.userID) {
    return next();
  } else {
    return res.status(200).redirect('/login');
  }
});

app.use('/viewItinerary', function (req, res, next) {
  if (req.session.userID) {
    return next();
  } else {
    return res.status(200).redirect('/login');
  }
});

app.use('/noItinerary', function (req, res, next) {
  if (req.session.userID) {
    return next();
  } else {
    return res.status(200).redirect('/login');
  }
});

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

configRoutes(app);
app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});