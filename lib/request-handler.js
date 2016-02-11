var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app-mongoose/mongoose.js');
var User = db.User;
var Link = db.Url;

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find(function(err, links) {
    if(err)  {
      res.send(404, err);
    } else {
      res.send(200, links);
    }
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.findOne({url: uri}, function(err, link) {
    if(err) {
      return res.send(404, err);
    }
    if(link) {
      return res.send(200, link);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }        
        var newLink = new Link({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        });
        newLink.save(function(err, newLink) {
          res.send(200, newLink);
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username: username}, function(err, user) {
    if (err) {
      return res.send(404, err);
    } 
    if (!user) {
      res.redirect('/login');
    } else {
      user.comparePassword(password, function(err, match) {
        if (match) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username: username}, function(err, user) {
    if (err) {
      return res.send(404, err);
    }
    if (!user) {
      var newUser = new User({
        username: username,
        password: password
      });
      newUser.save(function(err, newUser) {
        if(err) return res.send(500,err);
        util.createSession(req, res, newUser);
      });
    } else {
      console.log("Account already exists!");
      res.redirect('/signup');
    }
  });
};

exports.navToLink = function(req, res) {

  Link.findOne({code: req.params[0]}, function(err, link) {
    if (err) {
      return res.send(404, err);
    }
    if (!link) {
      res.redirect('/');
    } else {
      link.set({ visits: link.get('visits') + 1 })
        .save(function() {
          return res.redirect(link.get('url'));
        });
    }
  });
};