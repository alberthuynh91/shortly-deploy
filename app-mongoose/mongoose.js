var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/shortly');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('Connected to MongoDB');
});

var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

var urlSchema = mongoose.Schema({
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: {type: Date, default: Date.now }
});

urlSchema.pre('save', function(next) {
  var url = this;

  var shasum = crypto.createHash('sha1');
  shasum.update(url.url);
  url.code = shasum.digest('hex').slice(0, 5);

  next();
});

module.exports.Url = mongoose.model('Url', urlSchema);

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: {type: Date, default: Date.now }
});

userSchema.pre('save', function(next) {
  var user = this;

  // generate a salt
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
          // override the cleartext password with the hashed one
        user.password = hash;
        next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};


module.exports.User = mongoose.model('User', userSchema);

module.exports.db = db;
