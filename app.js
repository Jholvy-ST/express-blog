var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();

const dev_db_url  = process.env.dbURL;
const mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

var app = express();

app.use(compression()); //Compress all routes
app.use(helmet());

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// view engine setup
/*app.set("views", __dirname);
app.set('view engine', 'ejs');*/

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { 
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      /*if (user.password !== password) {
        return done(null, false, { message: "Incorrect password" });
      }*/
			bcrypt.compare(password, user.password, (err, res) => {
				if (res) {
					// passwords match! log user in
					return done(null, user)
				} else {
					// passwords do not match!
					return done(null, false, { message: "Incorrect password" })
				}
			})
      //return done(null, user);
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

/*app.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
);*/

app.post('/log-in', passport.authenticate("local"), (req, res, next) => {
	User.find({ 'username': req.body.username })
	.exec( (err, user) => {
		if (err) { return next(err); }
		jwt.sign({user}, process.env.TOKEN_KEY, (err, token) => {
			res.json({
				token
			});
		});
	})
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.get("/log-out", (req, res) => {
  req.logout();
  res.redirect("/");
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
	res.send({error: err});
});

module.exports = app;
