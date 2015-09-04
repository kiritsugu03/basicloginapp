var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var fs = require('fs');
var _ = require('lodash');

var app = express();

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('hungry', 'im so hungry'));
app.use(session({
  secret: "imsohungrydammit",
  saveUninitialized: false,
  resave: true
}));

app.get('/', function(req, res) {
    if (req.session.username) {
      res.render('personpage', {"username": req.session.name});
    } else {
      res.render('index', {"pageTitle": "Hello World"});
    }
});

app.post('/login', function(req, res) {
  var user = isValidCredentials(req.body.username, req.body.password);
  if (user) {
    req.session.username = user.username;
    req.session.name = user.name;

    res.render('personpage', {"username" : user.name.split(" ").map(_.capitalize).join(' ')});
  } else {
    res.render('index', {"pageTitle": "Login Fail", "errormsg" : "Invalid Credentials"})
  }
});

app.get('/register', function(req, res) {
  res.render('register');
});

app.post('/logout', function(req, res) {
  if (req.session) {
    req.session.destroy();
    req.session = null;
  }
  res.redirect('/');
});

app.listen(3000);
console.log("Host listening at port 3000");


function isValidCredentials(username, password) {
  var users = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
  var user = _.find(users, {'username': username, 'password':password});

  return user;
}
