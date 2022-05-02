const User = require('../models/user');
const async = require('async');
const { body,validationResult } = require('express-validator');
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcryptjs')

exports.sign_user_get = (req, res) => {
	//if (err) { return next(err)} 
	return res.json({title: 'Sign up'});
}

exports.sign_user_post =  [
	// Validate and sanitize fields.
  body('first_name', 'First name name required').trim().isLength({ min: 1 }).escape(),
	body('last_name', 'Last name required').trim().isLength({ min: 1 }).escape(),
	body('username', 'Username name required').trim().isLength({ min: 1 }).escape(),
	body('password', 'Password required').trim().isLength({ min: 1 }).escape(),

	(req, res, next) => {
		const user = new User({
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			username: req.body.username,
			password: req.body.password
		});
	
		bcrypt.hash(user.password, 10, (err, hashedPassword) => {
			user.password = hashedPassword;
			// if err, do something
			if (err) { 
				return next(err);
			}
			
			// otherwise, store hashedPassword in DB
			user.save(err => {
				if (err) { 
					return next(err);
				}
				res.redirect("/");
			});
		});
	}
];
