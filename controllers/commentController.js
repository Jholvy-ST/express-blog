const Comment = require('../models/comment');
const Post = require('../models/post');
const async = require('async');
const { body,validationResult } = require('express-validator');
const { DateTime } = require("luxon");

exports.comment_post = [
	body('mail', 'Mail must not be empty.').trim().isLength({ min: 1 }).escape(),
	body('text', 'Text must not be empty.').trim().isLength({ min: 1 }).escape(),

	(req, res, next) => {
		const errors = validationResult(req);

		const comment = new Comment(
			{
				text: req.body.text,
				mail: req.body.mail,
				post: req.params.id
			}
		)

		comment['date'] = Date.now();

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/errors messages.
			return res.json({ comment: comment, errors: errors.array() });
		} else {
			comment.save(function (err) {
				if (err) { return next(err); }
				// Successful - redirect to new author record.
				res.redirect('/posts/' + req.params.id);
			});
		}
	}
]

exports.comment_delete = (req, res) => {
	async.parallel({
		post: function(callback) {
			 Post.findById(req.params.post).exec(callback)
		 },
		comment: function(callback) {
			Comment.findById(req.params.comment).exec(callback)
		},
 	}, (err, results) => {
		if (err) { return next(err); }

		const postUrl = results.post.url;

		Comment.findByIdAndRemove(results.comment.id, function deleteComment(err) {
			if (err) { return next(err); }
			// Success - go to author list
			res.redirect('/posts/' + results.post.url)
		})
		
	})

	/*Comment.findByIdAndRemove(req.params.id, function deleteComment(err) {
		if (err) { return next(err); }
		// Success - go to author list
		res.redirect('/posts/' + req.params.id)
	})*/
}