var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var fs = require('fs');
var _ = require('lodash');

var router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded());
router.use(cookieParser('hungry', 'im so hungry'));
router.use(session({
  secret: "imsohungrydammit",
  saveUninitialized: false,
  resave: true
}));

var loginCheck = function (req, res, next) {
  if (req.session.username) {
    next();
  } else {
    res.render('index', {'pageTitle' : 'Hello World'});
  }
}

router.get('/', loginCheck, function(req, res) {
    res.render('personpage', {"username": req.session.name});
});

router.get('/login', loginCheck, function(req, res) {
  res.render('personpage', {'username' : req.session.name.split(" ").map(_.capitalize).join(' ')});
});

router.post('/login', function(req, res) {
  var user = isValidCredentials(req.body.username, req.body.password);
  if (user) {
    req.session.username = user.username;
    req.session.name = user.name;

    res.render('personpage', {"username" : user.name.split(" ").map(_.capitalize).join(' ')});
  } else {
    res.render('index', {"pageTitle": "Login Fail", "errormsg" : "Invalid Credentials"})
  }
});

router.get('/register', function(req, res) {
  res.render('register');
});


router.post('/registeruser', function(req, res) {
  if (!isCurrentUser(req.body.username)) {
    var user = addUser(req.body.name, req.body.username, req.body.password);
    res.render('index', {'user': user.name });
  } else {
    render('/register', {'errormsg' : 'Username taken'});
  }
});


router.post('/logout', function(req, res) {
  if (req.session) {
    req.session.destroy();
    req.session = null;
  }
  res.redirect('/');
});



function isValidCredentials(username, password) {
  var users = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
  var user = _.find(users, {'username': username, 'password':password});

  return user;
}

function isCurrentUser(username) {
  var users = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
  var user = _.find(users, {'username' : username});

  if (user) {
    return true;
  } else {
    return false;
  }
}

function addUser(name, username, password) {
  var users = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
  var user = {
    'username' : username,
    'password' : password,
    'name' : name
  }

  users.push(user);
  fs.writeFile('./data.json', JSON.stringify(users, null, 4), function(err) {
    if(err) {
      console.error();
    }
  });

  return user;
}

module.exports = router;
